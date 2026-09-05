import { Component, Input } from '@angular/core';

let nextSpinnerId = 0;

/**
 * Shared inline loading spinner - drop it inside a button, a page's loading
 * overlay, or anywhere else while an async action is in flight. Sized via the
 * `size` input (px). Two counter-rotating gradient arcs rather than a single
 * flat ring, so it reads as more than a placeholder spinner at the larger
 * sizes used for full-page/section loading states.
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() size = 14;

  /** Unique per instance so multiple spinners on one page don't collide on the same SVG gradient id. */
  readonly gradientId = `app-spinner-grad-${nextSpinnerId++}`;
}
