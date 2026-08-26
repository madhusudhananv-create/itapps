import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { CurrentUser } from '../../models/maturity.model';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent implements OnInit {
  currentUser?: CurrentUser;

  constructor(private session: SessionService) {}

  ngOnInit(): void {
    this.session.user$.subscribe((user) => (this.currentUser = user));
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}
