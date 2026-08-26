import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItOpsNotification, ItOpsNotificationApiService } from '../../services/itops-notification-api.service';
import { AccountService } from '../../services/account.service';

/** Notification types the COE SPOC should land back on their own editable assessment for; everything else opens the read-only review/findings view. */
const ASSESSMENT_EDIT_TYPES = new Set(['AssessmentReturned']);

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent implements OnInit {
  notifications: ItOpsNotification[] = [];
  open = false;
  private empId = '';

  constructor(
    private api: ItOpsNotificationApiService,
    private accountService: AccountService,
    private router: Router,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.empId = localStorage.getItem('empid') || '';
    if (!this.empId) return;
    this.refresh(true);
  }

  /** `popupOnLoad` auto-opens the dropdown once, right when the page loads, if
   * there's anything pending - so a pending item is surfaced immediately on
   * login instead of waiting for the user to notice/click the bell icon. */
  private refresh(popupOnLoad = false): void {
    this.api.getMyNotifications(this.empId).subscribe((rows) => {
      this.notifications = rows;
      if (popupOnLoad && rows.length) this.open = true;
    });
  }

  toggle(): void {
    this.open = !this.open;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) {
      this.open = false;
    }
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }

  openNotification(n: ItOpsNotification): void {
    this.open = false;

    // The assessment/review pages resolve their data from the currently
    // selected account + the domainCode route param - a notification can
    // arrive for a different account than whatever's currently selected (or
    // none at all, e.g. right after login on the account-picker screen), so
    // select the notification's own account first or the target page has
    // nothing to load against.
    if (n.custId) {
      this.accountService.selectAccount({
        cusT_ID: n.custId,
        cusT_NM: n.accountName ?? '',
        industrY_TYPE: '',
        url: '',
      });
    }

    // Clicking only navigates - it does NOT dismiss. A notification should stay
    // in the bell until the underlying action is actually taken (the backend
    // resolves it then, e.g. ReviewITOpsAssessment/DecideITOpsFinding), not just
    // because it was opened/viewed.
    if (n.domainCode) {
      const target = ASSESSMENT_EDIT_TYPES.has(n.notificationType) ? '/assessment' : '/review';
      this.router.navigate([target, n.domainCode]);
    }
  }

  dismiss(n: ItOpsNotification, event: Event): void {
    event.stopPropagation();
    this.api.dismiss(n.id).subscribe(() => {
      this.notifications = this.notifications.filter((x) => x.id !== n.id);
    });
  }

  clearAll(): void {
    if (!this.empId) return;
    this.api.dismissAll(this.empId).subscribe(() => (this.notifications = []));
  }
}
