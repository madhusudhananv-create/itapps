import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Dialog data interface for Yes/No confirmation dialogs
 * Enhanced for Angular 19 with additional styling options
 */
export interface DialogYesNoData {
  title: string;
  message: string;
  confirmText?: string;      // Custom text for confirm button (default: 'Yes')
  cancelText?: string;       // Custom text for cancel button (default: 'No')
  confirmColor?: 'primary' | 'accent' | 'warn';  // Button color theme
  icon?: string;             // Optional Material icon name
  iconColor?: string;        // Icon color (CSS color value)
}

/**
 * Modern Angular 19 Yes/No Dialog Component
 * 
 * Features:
 * - Signal-based reactive state
 * - Modern inject() function for DI
 * - Enhanced Material Design styling
 * - Customizable button text and colors
 * - Optional icon support
 * - Accessible with proper ARIA attributes
 */
@Component({
  selector: 'app-dialog-yes-no',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dialog-yes-no.component.html',
  styleUrls: ['./dialog-yes-no.component.scss']
})
export class DialogYesNoComponent {
  // Modern Angular 19 dependency injection
  readonly dialogRef = inject(MatDialogRef<DialogYesNoComponent>);
  readonly data: DialogYesNoData = inject(MAT_DIALOG_DATA);

  // Reactive state for button interactions
  readonly isProcessing = signal<boolean>(false);

  // Default values for optional properties
  get confirmText(): string {
    return this.data.confirmText || 'Yes';
  }

  get cancelText(): string {
    return this.data.cancelText || 'No';
  }

  get confirmColor(): 'primary' | 'accent' | 'warn' {
    return this.data.confirmColor || 'warn';
  }

  get icon(): string | null {
    return this.data.icon || null;
  }

  get iconColor(): string {
    return this.data.iconColor || '#e53935';
  }

  /**
   * Handle cancel/no action
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Handle confirm/yes action
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
