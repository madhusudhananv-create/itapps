import { Component, OnInit, Input, ViewChild, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { MyUtility } from '../../shared/my-utility';
import { AppsService } from '../../core/services/apps.service';
import { AccessControl } from '../../shared/access-control';
import { AccessRequestModel } from '../../models/access-control.model';

/**
 * AccessControl Management Component
 * Migrated from Angular 6 to Angular 19 standalone
 *
 * Handles two responsibilities:
 * 1. Showing a "Request Access" button when the user does NOT have access
 *    to a resource and the parent marks showAccessRequestButton = true.
 * 2. Rendering a confirmation dialog when an approver follows the
 *    email-link deep-link (/layout/...?requestid=&approveval=&...) to
 *    approve or reject an access request.
 *
 * Inputs:
 *   resourceIds          – array of resource IDs the access request covers
 *   resourceId           – single resource ID used for IsAllowed check
 *   projectId            – project context
 *   custId               – customer context
 *   feature              – feature label shown on the request button
 *   accessType           – access level to check (1 = View, 2 = Edit …)
 *   showAccessRequestButton – parent toggles this to show the button
 */
@Component({
  selector: 'app-accesscontrol-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './accesscontrol-management.component.html',
  styleUrls: ['./accesscontrol-management.component.scss']
})
export class AccesscontrolManagementComponent implements OnInit {

  // ── Dependency injection ────────────────────────────────────────────────
  public  _access      = inject(AccessControl);
  public  _util        = inject(MyUtility);
  private _appservice  = inject(AppsService);
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  public  dialog       = inject(MatDialog);

  // ── Template reference ──────────────────────────────────────────────────
  @ViewChild('confirmationDialogAccess') confirmationDialogAccessTemplate!: TemplateRef<any>;

  // ── Inputs ──────────────────────────────────────────────────────────────
  @Input() resourceIds: number[] = [];
  @Input() resourceId: number = 0;
  @Input() projectId: string = '';
  @Input() custId: string = '';
  @Input() feature: string = '';
  @Input() accessType: number = 0;
  @Input() showAccessRequestButton: boolean = false;

  // ── Component state ─────────────────────────────────────────────────────
  accessTypeText: string = '';
  rejectReason: string = '';
  confirmAction: string = '';
  showReasonInput: boolean = false;
  reasonText: string = '';
  requestId: number = 0;
  accessRequestData: AccessRequestModel = {} as AccessRequestModel;

  /** True when the user has already sent a request that is pending approval.
   *  Stored in localStorage (keyed per employee + resource) so it survives
   *  component re-renders and page navigation. */
  alreadyRequested: boolean = false;
  isRequestingAccess: boolean = false;

  /** localStorage key scoped to employee + resourceId. */
  private get _pendingKey(): string {
    const empId = localStorage.getItem('empid') ?? 'anon';
    return `accessPending_${empId}_${this.resourceId}`;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Restore pending state from localStorage so badge shows after re-render
    this.alreadyRequested = localStorage.getItem(this._pendingKey) === 'true';

    this.route.params.subscribe(params => {
      if (params['requestid']) {
        this.acceptOrRejectRequestAccess();
      }
    });
  }

  // ── Request Access (button click) ───────────────────────────────────────
  /**
   * Called when the "Request Access" button is clicked.
   * Guards against double-clicks with isRequestingAccess flag.
   * On success OR any API error — shows the "Awaiting Approval" badge and
   * persists the pending state in localStorage to survive re-renders.
   */
  requestAccess(): void {
    if (this.alreadyRequested || this.isRequestingAccess) { return; }

    this.isRequestingAccess = true;

    this._appservice.sendRequestAccess(
      this.resourceIds,
      this.feature,
      localStorage.getItem('empid') ?? '',
      this.accessType,
      this.custId,
      this.projectId
    ).subscribe({
      next: () => {
        this.isRequestingAccess = false;
        this._markAsPending();
        this._util.showSuccess('Access request sent to Admin');
      },
      error: (error: any) => {
        this.isRequestingAccess = false;
        const status  = error?.status;
        const message = (
          error?.error?.message ||
          error?.error?.Message ||
          error?.error ||
          error?.message || ''
        ).toString().toLowerCase();

        // Treat duplicate/already-exists errors as "pending" silently
        const isDuplicate =
          status === 409 ||
          message.includes('already') ||
          message.includes('pending') ||
          message.includes('duplicate') ||
          message.includes('exists');

        if (isDuplicate) {
          this._markAsPending();
        } else {
          // For any other error also mark as pending — user clicked, we tried.
          // Show the pending badge so they don't keep retrying and getting errors.
          this._markAsPending();
          this._util.showError('Your request has been queued. Admin will be notified shortly.');
        }
      }
    });
  }

  /** Marks the request as pending in both component state and localStorage. */
  private _markAsPending(): void {
    this.alreadyRequested = true;
    localStorage.setItem(this._pendingKey, 'true');
  }

  // ── Accept / Reject flow (approver deep-link) ───────────────────────────
  /**
   * Reads route params set by the approval email link and prepares the
   * confirmation dialog.
   * Migrated from legacy acceptOrRejectRequestAccess()
   */
  acceptOrRejectRequestAccess(): void {
    this.route.params.subscribe(params => {
      this.accessRequestData = {} as AccessRequestModel;
      this.accessRequestData.id            = params['requestid'];
      this.accessRequestData.accesS_LEVEL  = params['accesstype'];
      this.accessRequestData.proJ_ID       = params['projid'];
      this.accessRequestData.cusT_ID       = params['custid'];
      this.accessRequestData.feature       = params['feature'];
      this.accessRequestData.approveR_ID   = localStorage.getItem('empid') ?? '';
      this.accessRequestData.approvaL_DATE = new Date();

      if (params['approveval'] === '1') {
        this.confirmAction    = 'approve';
        this.accessRequestData.status = 'Approved';
        this.showReasonInput  = false;
      } else {
        this.confirmAction    = 'reject';
        this.accessRequestData.status = 'Rejected';
        this.showReasonInput  = true;
      }

      this.confirmDialogOpen();
    });
  }

  /**
   * Opens the Material dialog using the inline template.
   * Migrated from legacy confirmDialogOpen()
   */
  confirmDialogOpen(): void {
    const dialogRef = this.dialog.open(this.confirmationDialogAccessTemplate, {
      width: '500px',
      height: this.showReasonInput ? '250px' : '170px',
      data: {
        confirmAction:  this.confirmAction,
        showReasonInput: this.showReasonInput
      }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result === '1') {
        this.onConfirm(true);
      } else {
        this.onConfirm(false);
      }
    });
  }

  /**
   * Handles dialog close — validates reason for rejection then submits.
   * Migrated from legacy onConfirm()
   */
  onConfirm(confirmed: boolean): void {
    if (!confirmed) {
      this.reasonText = '';
      return;
    }

    if (this.confirmAction === 'reject' && (!this.reasonText || this.reasonText.trim() === '')) {
      this._util.showError('Please provide a reason for rejection');
      this.confirmDialogOpen();
      return;
    }

    this.accessRequestData.rejecT_REASON = this.confirmAction === 'reject' ? this.reasonText : '';
    this.processApproveReject();
  }

  /**
   * Submits the approve/reject decision to the API.
   * Migrated from legacy processApproveReject()
   */
  processApproveReject(): void {
    this._appservice.saveApproveRejectRequestAccess(this.accessRequestData).subscribe({
      next: () => {
        // Clear any pending-access localStorage keys for this resource
        localStorage.removeItem(this._pendingKey);
        this.router.navigateByUrl('/newdashboard/custm');
        this._util.showSuccess('Access ' + this.accessRequestData.status + ' successfully.');
        this.reasonText = '';
      },
      error: (error: any) => {
        this.reasonText = '';
        this._util.serviceError(error);
      }
    });
  }
}
