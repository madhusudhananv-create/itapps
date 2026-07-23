import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface WarningPopupData {
  Message: string;
  isConfirmation?: boolean;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  icon?: string;
  actionType?: 'save' | 'update' | 'delete' | 'default';
  showInput?: boolean;
  inputLabel?: string;
  inputValue?: string;
  inputPlaceholder?: string;
}

@Component({
  selector: 'app-warning-popup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './warning-popup.component.html',
  styleUrls: ['./warning-popup.component.scss']
})
export class WarningPopupComponent implements OnInit {
  isConfirmation: boolean = false;
  confirmText: string = 'Yes';
  cancelText: string = 'No';
  title: string = 'Information';
  icon: string = 'info_outline';
  actionType: string = 'default';
  showInput: boolean = false;
  inputLabel: string = '';
  inputValue: string = '';
  inputPlaceholder: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WarningPopupData,
    private dialogRef: MatDialogRef<WarningPopupComponent>
  ) {}

  ngOnInit(): void {
    this.isConfirmation = this.data.isConfirmation || false;
    this.confirmText = this.data.confirmText || (this.isConfirmation ? 'Yes' : 'OK');
    this.cancelText = this.data.cancelText || 'No';
    this.title = this.data.title || (this.isConfirmation ? 'Confirm' : 'Information');
    this.icon = this.data.icon || (this.isConfirmation ? 'help_outline' : 'info_outline');
    this.actionType = this.data.actionType || 'default';
    this.showInput = this.data.showInput || false;
    this.inputLabel = this.data.inputLabel || '';
    this.inputValue = this.data.inputValue || '';
    this.inputPlaceholder = this.data.inputPlaceholder || '';
  }

  closeDialog(): void {
    this.dialogRef.close(null);
  }

  confirm(): void {
    if (this.showInput) {
      this.dialogRef.close(this.inputValue);
    } else {
      this.dialogRef.close(true);
    }
  }
}
