import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>
        <mat-icon [class]="'dialog-icon ' + data.type">
          {{ getIcon() }}
        </mat-icon>
        {{ data.title || 'Confirm Action' }}
      </h2>
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        @if (data.type !== 'success') {
          <button mat-button (click)="onCancel()">
            {{ data.cancelText || 'Cancel' }}
          </button>
        }
        <button mat-raised-button [color]="getButtonColor()" (click)="onConfirm()">
          {{ data.confirmText || (data.type === 'success' ? 'OK' : 'Confirm') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 400px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding: 16px 24px;
      background: #f5f5f5;
    }

    .dialog-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;

      &.warning {
        color: #ff9800;
      }

      &.danger {
        color: #f44336;
      }

      &.info {
        color: #2196f3;
      }

      &.success {
        color: #4caf50;
      }
    }

    mat-dialog-content {
      padding: 24px;
    }

    .dialog-message {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: #4C4C47;
      white-space: pre-line;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default type if not provided
    if (!this.data.type) {
      this.data.type = 'warning';
    }
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'help';
    }
  }

  getButtonColor(): string {
    if (this.data.type === 'danger') {
      return 'warn';
    } else if (this.data.type === 'success') {
      return 'primary';
    }
    return 'primary';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
