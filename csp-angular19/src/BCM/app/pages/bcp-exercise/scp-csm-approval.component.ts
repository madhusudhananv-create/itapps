import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ScpAccount } from './scp-accounts.component';

/**
 * Interface representing an SCP pending CSM approval
 */
interface ScpPendingApproval extends ScpAccount {
  reviewedDate?: Date;
  reviewedBy?: string;
  submittedForApprovalDate?: Date;
}

@Component({
  selector: 'bcp-scp-csm-approval',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './scp-csm-approval.component.html',
  styleUrl: './scp-csm-approval.component.scss'
})
export class ScpCsmApprovalComponent implements OnInit {
  /** SCPs pending CSM approval */
  pendingApprovals: ScpPendingApproval[] = [];
  displayedColumns: string[] = ['location', 'businessUnit', 'account', 'project', 'status', 'reviewedDate', 'reviewedBy', 'actions'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPendingApprovals();
  }

  /**
   * Loads SCPs pending CSM approval
   * Per user requirements: Projects that are submitted for review should be visible in CSM dashboard
   * These are SCPs that:
   * - Were submitted by BCP Coordinator (status: 'In Review' or 'Reviewed')
   * - Have been reviewed by PM (status: 'Reviewed' with PM review metadata)
   * - PM has submitted for CSM approval
   * - Are ready for final CSM approval
   */
  loadPendingApprovals(): void {
    // TODO: Replace with actual service call
    // Filter SCPs that have been submitted for review (by BCP Coordinator) or reviewed by PM
    // In production, filter by:
    // - status='In Review' (submitted by BCP Coordinator, awaiting PM review)
    // - OR status='Reviewed' AND pmReviewed=true AND readyForCSMApproval=true (PM reviewed and submitted)
    const mockApprovals: ScpPendingApproval[] = [
      {
        id: '1',
        location: 'India',
        businessUnit: 'BU-1',
        account: 'Account A',
        project: 'Project Alpha',
        scpAvailable: true,
        scpStatus: 'In Review', // Submitted by BCP Coordinator for review
        reviewedDate: new Date('2025-01-22'),
        reviewedBy: 'BCP Coordinator',
        submittedForApprovalDate: new Date('2025-01-22')
      },
      {
        id: '2',
        location: 'US',
        businessUnit: 'BU-2',
        account: 'Account B',
        project: 'Project Beta',
        scpAvailable: true,
        scpStatus: 'Reviewed', // Reviewed by PM and submitted for CSM approval
        reviewedDate: new Date('2025-01-23'),
        reviewedBy: 'PM User',
        submittedForApprovalDate: new Date('2025-01-23')
      },
      {
        id: '3',
        location: 'India',
        businessUnit: 'BU-3',
        account: 'Account C',
        project: 'Project Gamma',
        scpAvailable: true,
        scpStatus: 'In Review', // Submitted by BCP Coordinator for review
        reviewedDate: new Date('2025-01-22'),
        reviewedBy: 'BCP Coordinator',
        submittedForApprovalDate: new Date('2025-01-22')
      }
      
    ];

    this.pendingApprovals = mockApprovals;
    this.cdr.markForCheck();
  }

  /**
   * Opens SCP for review before approval
   */
  reviewScp(scp: ScpPendingApproval): void {
    this.router.navigate(['/bcm/scp/form'], {
      queryParams: {
        accountId: scp.id,
        mode: 'view',
        account: scp.account,
        project: scp.project,
        status: scp.scpStatus,
        role: 'csm'
      }
    });
  }

  /**
   * Approves the SCP
   * Per US-1.14: Approve (Final Approved)
   * Status set to Approved (green); form becomes read-only for non-admin roles
   */
  approveScp(scp: ScpPendingApproval): void {
    // Validate status
    if (scp.scpStatus !== 'Reviewed' && scp.scpStatus !== 'In Review') {
      this.snackBar.open(
        `Cannot approve. SCP status is ${scp.scpStatus}. Only Reviewed SCPs (submitted by PM) can be approved.`,
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    // TODO: Call service to:
    // - Update SCP status to 'Approved'
    // - Create audit log entry
    // - Lock form for edits (make read-only for non-admin)
    // - Notify stakeholders
    // - Make download available
    
    this.snackBar.open(
      `SCP for ${scp.project} approved successfully! Status changed to Approved (green). Document is now available for download.`,
      'Close',
      {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // Remove from pending approvals (would normally refresh from backend)
    this.pendingApprovals = this.pendingApprovals.filter(a => a.id !== scp.id);
    this.cdr.markForCheck();
  }

  /**
   * Navigates back to accounts page
   */
  navigateToAccounts(): void {
    this.router.navigate(['/bcm/scp']);
  }
  /**
   * Request review from PM for a specific SCP
   * Updates localStorage to simulate backend workflow and triggers notifications
   */
  requestReview(scp?: ScpPendingApproval) {
    // If called from template, pass the SCP row
    if (!scp) {
      this.snackBar.open('No SCP selected for review request.', 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
      return;
    }

    // 1. Update SCP status in localStorage
    let scps = JSON.parse(localStorage.getItem('scpList') || '[]');
    scps = scps.map((item: any) => {
      if (item.id === scp.id) {
        item.scpStatus = 'In Review';
        item.reviewRequested = true;
        item.reviewRequestTime = new Date().toISOString();
      }
      return item;
    });
    localStorage.setItem('scpList', JSON.stringify(scps));

    // 2. Add notification for CSM (for audit/history)
    let csmNotifications = JSON.parse(localStorage.getItem('csmNotifications') || '[]');
    csmNotifications.push({
      type: 'info',
      message: `Request sent to PM for review of project ${scp.project}`,
      time: new Date().toISOString(),
      project: scp.project
    });
    localStorage.setItem('csmNotifications', JSON.stringify(csmNotifications));

    // 3. Add notification for PM
    let pmNotifications = JSON.parse(localStorage.getItem('pmNotifications') || '[]');
    pmNotifications.push({
      type: 'action',
      message: `You have 1 SCP for project ${scp.project} to review`,
      time: new Date().toISOString(),
      project: scp.project,
      scpId: scp.id
    });
    localStorage.setItem('pmNotifications', JSON.stringify(pmNotifications));

    // 4. Show snackbar to CSM
    this.snackBar.open('Request sent to PM for review', 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
    // 5. Optionally, refresh dashboard
    this.loadPendingApprovals();
  }
}

