import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { CurrentUser } from '../../models/maturity.model';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { ItOpsAdminSetupService } from '../../services/itops-admin-setup.service';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent implements OnInit {
  currentUser?: CurrentUser;

  /**
   * Whether to show the Admin Setup link at all. Someone who is only an
   * assessor/reviewer/assessee holds no ITOPS_ROLE_ASSIGNMENT, so the link is
   * removed from the DOM entirely rather than disabled - and every endpoint
   * behind it now 403s for them regardless (ITOperationMaturityAdminController).
   */
  canSeeAdminSetup = false;

  constructor(private session: SessionService, private adminApi: ItOpsAdminSetupService) {}

  ngOnInit(): void {
    this.session.user$.subscribe((user) => (this.currentUser = user));
    this.adminApi.getMyAccess().subscribe((access) => (this.canSeeAdminSetup = access.isAdmin));
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}
