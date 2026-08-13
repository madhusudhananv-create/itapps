import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Flux Dashboard–style main canvas motion: springy easing similar to Framer Motion
 * defaults, implemented with Angular animations (no React / Framer runtime).
 */
export const fluxMainPageAnimation = trigger('fluxMainPage', [
  transition('* <=> *', [
    style({
      opacity: 0.82,
      transform: 'translateY(14px) scale(0.992)',
    }),
    animate(
      '420ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      })
    ),
  ]),
]);
