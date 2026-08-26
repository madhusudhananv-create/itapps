import { Component, Input } from '@angular/core';

/**
 * Shared inline loading spinner - drop it inside a button (or anywhere else)
 * while an async action is in flight. Sized via the `size` input (px).
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() size = 14;
}
