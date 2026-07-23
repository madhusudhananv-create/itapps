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
 * Interface representing an SCP pending PM review
 */
interface ScpPendingReview extends ScpAccount {
  submittedDate?: Date;
  submittedBy?: string;
}

@Component({
  selector: 'bcp-scp-pm-review',
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
  templateUrl: './scp-pm-review.component.html',
  styleUrl: './scp-pm-review.component.scss'
})
export class ScpPmReviewComponent implements OnInit {
  /** SCPs pending PM review */
  pendingReviews: ScpPendingReview[] = [];
  displayedColumns: string[] = ['location', 'businessUnit', 'account', 'project', 'status', 'submittedDate', 'submittedBy', 'actions'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {
    this.loadPendingReviewsFromLocalStorage();
    this.checkPmNotifications();
  }

  /**
   * Loads SCPs pending review for PM from localStorage (using pmNotifications)
   */
  loadPendingReviewsFromLocalStorage(): void {
    const pmNotificationsRaw = localStorage.getItem('pmNotifications');
    let pmNotifications: any[] = [];
    if (pmNotificationsRaw) {
      try {
        pmNotifications = JSON.parse(pmNotificationsRaw);
      } catch (e) {
        pmNotifications = [];
      }
    }

    // Optionally, filter by status if needed
    this.pendingReviews = pmNotifications || [];
    this.cdr.markForCheck();
  }

  /**
   * Checks for new PM notifications and shows a snackbar if present
   */
  checkPmNotifications(): void {
    const pmNotificationsRaw = localStorage.getItem('pmNotifications');
    let pmNotifications: any[] = [];
    if (pmNotificationsRaw) {
      try {
        pmNotifications = JSON.parse(pmNotificationsRaw);
      } catch (e) {
        pmNotifications = [];
      }
    }
    if (pmNotifications && pmNotifications.length > 0) {
      this.snackBar.open(
        `You have ${pmNotifications.length} new SCP(s) pending review!`,
        'Dismiss',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['info-snackbar']
        }
      );
    }
  }

  /**
   * Opens SCP for review
   * Per US-1.12: Review and Edit
   * PM can review and request corrections or make edits where permitted
   */
  reviewScp(scp: ScpPendingReview): void {
    // Map 'In Review' to 'Reviewed' for consistency in the form
    //const status = scp.scpStatus === 'In Review' ? 'Reviewed' : scp.scpStatus;
    this.router.navigate(['/bcm/scp/form'], {
      queryParams: {
        accountId: scp.id,
        mode: 'edit',
        account: scp.account,
        project: scp.project,
        status: scp.scpStatus,
        role: 'pm'
      }
    });
  }

  /**
   * Submits SCP for CSM approval
   * Per US-1.13: Submit for Approval (Reviewed → Approved)
   * Workflow: PM reviews → Submit for Approval → CSM will approve
   */
  submitForApproval(scp: ScpPendingReview): void {
    // Validate status
    if (scp.scpStatus !== 'Reviewed' && scp.scpStatus !== 'In Review') {
      this.snackBar.open(
        `Cannot submit. SCP status is ${scp.scpStatus}. Only Reviewed SCPs can be submitted for CSM approval.`,
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
    // - Mark SCP as reviewed by PM and ready for CSM approval
    // - Status remains 'Reviewed' but with PM review metadata
    // - Make visible in CSM approval dashboard
    // - Create audit log entry
    
    this.snackBar.open(
      `SCP for ${scp.project} submitted for CSM approval successfully. CSM will review and approve.`,
      'Close',
      {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      }
    );

    // Remove from pending reviews (would normally refresh from backend)
    // In production, this would be updated from backend response
    this.pendingReviews = this.pendingReviews.filter(r => r.id !== scp.id);
    this.cdr.markForCheck();
  }

  /**
   * Gets tooltip for Submit for Approval button
   */
  getSubmitApprovalTooltip(scp: ScpPendingReview): string {
    if (scp.scpStatus !== 'Reviewed' && scp.scpStatus !== 'In Review') {
      return 'SCP must be in Reviewed status to submit for approval';
    }
    return 'Submit SCP for CSM approval. Status will change to Pending Approval.';
  }

  /**
   * Navigates back to accounts page
   */
  navigateToAccounts(): void {
    this.router.navigate(['/bcm/scp']);
  }
}

