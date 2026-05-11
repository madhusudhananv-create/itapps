/**
 * Password Forgot Component
 * Allows users to request password reset link via email
 * Migrated from LEGACY-SOURCE/src/app/authentication/passwordforgot
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppsService } from '../../../core/services/apps.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-password-forgot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.scss']
})
export class PasswordForgotComponent {
  private router = inject(Router);
  private appsService = inject(AppsService);

  // Form fields
  email: string = '';
  companyName = environment.company_name;
  isSubmitting = false;

  /**
   * Submit forgot password form
   */
  submitForm(isValid: boolean): void {
    // Prevent default form submission
    event?.preventDefault();

    // Validation
    if (!isValid || !this.email || this.email.trim() === '') {
      alert('Please enter the email id');
      return;
    }

    // Check if it's a company domain email
    if (this.email.toLowerCase().includes('@' + environment.domain_name)) {
      alert(`${this.companyName} users, please reset your password in your Google account and use the same credentials here to login`);
      return;
    }

    // Submit password reset request
    this.isSubmitting = true;
    this.appsService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Please check your email for password reset link');
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Forgot password error:', error);
        alert('Failed to send password reset email. Please try again.');
      }
    });
  }
}
