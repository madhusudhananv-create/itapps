import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleContextService } from '../../shared/services/role-context.service';

/**
 * BCM Layout Component
 * Parent layout for Business Continuity Management module
 * Provides navigation between BCP and SCP sections
 */
@Component({
  selector: 'app-bcm-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bcm-layout.component.html',
  styleUrl: './bcm-layout.component.scss'
})
export class BcmLayoutComponent {
  constructor(public roleContext: RoleContextService) {}
}
