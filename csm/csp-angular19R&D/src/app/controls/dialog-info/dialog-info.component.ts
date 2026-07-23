import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Dialog data interface for Information dialogs
 */
export interface DialogInfoData {
  title: string;
  message: string;
  buttonText?: string;      // Custom text for OK button (default: 'OK')
  icon?: string;            // Optional Material icon name (default: 'info')
  iconColor?: string;       // Icon color (CSS color value)
}

/**
 * Modern Angular 19 Information Dialog Component
 * 
 * Features:
 * - Signal-based reactive state
 * - Modern inject() function for DI
 * - Enhanced Material Design styling
 * - Customizable button text and colors
 * - Information icon support
 * - Accessible with proper ARIA attributes
 */
@Component({
  selector: 'app-dialog-info',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dialog-info.component.html',
  styleUrls: ['./dialog-info.component.scss']
})
export class DialogInfoComponent {
  // Modern Angular 19 dependency injection
  readonly dialogRef = inject(MatDialogRef<DialogInfoComponent>);
  readonly data: DialogInfoData = inject(MAT_DIALOG_DATA);

  // Default values for optional properties
  get buttonText(): string {
    return this.data.buttonText || 'OK';
  }

  get icon(): string {
    return this.data.icon || 'info';
  }

  get iconColor(): string {
    return this.data.iconColor || '#3b82f6';
  }

  /**
   * Handle OK/close action
   */
  onClose(): void {
    this.dialogRef.close();
  }
}
