import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService, DialogRequest } from '../../services/dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  request: DialogRequest | null = null;

  constructor(private dialog: DialogService) {
    this.dialog.request$.subscribe((req) => (this.request = req));
  }

  confirm(ok: boolean): void {
    this.dialog.respondConfirm(ok);
  }

  /** Submitting with an empty field is a valid answer (an intentionally blank reason) - only the Cancel button means null. */
  submitPrompt(): void {
    if (this.request?.kind !== 'prompt') return;
    this.dialog.respondPrompt(this.request.value.trim());
  }

  cancelPrompt(): void {
    this.dialog.respondPrompt(null);
  }
}
