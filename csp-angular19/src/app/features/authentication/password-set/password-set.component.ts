/**
 * Password Set Component
 * Allows users to set/reset their password after clicking email link
 * Migrated from LEGACY-SOURCE/src/app/authentication/passwordset
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AppsService } from '../../../core/services/apps.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-password-set',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password-set.component.html',
  styleUrls: ['./password-set.component.scss']
})
export class PasswordSetComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private appsService = inject(AppsService);

  // Form fields
  email: string = '';
  password1: string = '';
  password2: string = '';
  code: string = '';
  
  // UI state
  password_disable: boolean = true;
  isSubmitting: boolean = false;
  companyName = environment.company_name;

  ngOnInit(): void {
    // Get email and activation code from route params
    this.route.params.subscribe(params => {
      this.email = params['email'] || '';
      this.code = params['code'] || '';
      
      if (this.email && this.code) {
        this.verifyActivationCode(this.email, this.code);
      } else {
        alert('Invalid password reset link');
        this.router.navigateByUrl('/login');
      }
    });
  }

  /**
   * Verify activation code before allowing password reset
   */
  private verifyActivationCode(email: string, code: string): void {
    this.appsService.verifyActivationCode(code + '|' + email).subscribe({
      next: () => {
        // Code is valid - enable password fields
        this.password_disable = false;
      },
      error: (error) => {
        // Code is invalid or expired
        this.password_disable = true;
        console.error('Activation code verification failed:', error);
        alert('Invalid or expired password reset link. Please request a new one.');
      }
    });
  }

  /**
   * Submit password reset form
   */
  submitForm(isValid: boolean | null): void {
    if(!isValid) return;

    // Prevent default form submission
    event?.preventDefault();

    // Validation
    if (!isValid) {
      return;
    }

    if (this.password1 !== this.password2) {
      alert('Both passwords should be same');
      return;
    }

    if (this.password1.length < 8) {
      alert('Password should be of 8 characters or more');
      return;
    }

    // Set new password
    this.setPassword();
  }

  /**
   * Call API to set new password
   */
  private setPassword(): void {
    this.isSubmitting = true;

    const authdata = {
      EMAILID: this.email,
      PASSWORD: this.password1,
      UPDATED_BY: this.email,
      UPDATED_DATE: new Date()
    };

    this.appsService.setPassword(authdata).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Password updated successfully');
        
        // Clear any stored navigation and redirect to login
        localStorage.setItem('navigateurl', '');
        localStorage.setItem('empid', '');
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Set password error:', error);
        alert('Failed to update password. Please try again.');
      }
    });
  }
}
