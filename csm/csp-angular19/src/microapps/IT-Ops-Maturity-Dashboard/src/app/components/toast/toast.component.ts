import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe((toasts) => {
      const arrivedIds = new Set(this.toasts.map((t) => t.id));
      this.toasts = toasts;
      toasts.forEach((toast) => {
        if (arrivedIds.has(toast.id)) return;
        setTimeout(() => this.toastService.dismiss(toast.id), toast.duration);
      });
    });
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  iconPath(kind: string): string {
    if (kind === 'success') return 'M5 13l4 4L19 7';
    if (kind === 'error') return 'M6 6l12 12M18 6L6 18';
    return 'M12 8v5m0 3h.01M12 2a10 10 0 100 20 10 10 0 000-20z';
  }
}
