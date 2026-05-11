import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

/**
 * APPROACH: stroke-dasharray masking
 *
 * Every coloured segment uses the EXACT SAME `d` attribute as the grey track
 * (the full 0→100% arc). Colour is revealed by stroke-dasharray/dashoffset:
 *
 *   stroke-dasharray  = "segmentLength  totalLength"
 *   stroke-dashoffset = -startLength
 *
 * Because all paths share the identical `d`, it is geometrically impossible
 * for any segment to render on a different radius than the track.
 */
@Component({
  selector: 'app-semicircular-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semicircular-gauge.component.html',
  styleUrls: ['./semicircular-gauge.component.scss'],
  animations: [
    trigger('labelFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('pulseOnClick', [
      transition('* => *', [
        animate('400ms cubic-bezier(0.4,0,0.2,1)', keyframes([
          style({ transform: 'scale(1)',    offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.3 }),
          style({ transform: 'scale(0.98)', offset: 0.6 }),
          style({ transform: 'scale(1)',    offset: 1 })
        ]))
      ])
    ])
  ]
})
export class SemicircularGaugeComponent implements OnChanges {
  @Input() high: number = 0;
  @Input() medium: number = 0;
  @Input() low: number = 0;
  @Input() highLabel: string = '';
  @Input() mediumLabel: string = '';
  @Input() lowLabel: string = '';
  @Input() width: number = 200;
  @Input() height: number = 120;
  @Input() strokeWidth: number = 8;
  @Input() fontSize: number = 48;
  @Input() fontWeight: number = 800;
  @Input() showCenterText: boolean = false;
  @Input() isCircular: boolean = false;
  
  // Color override inputs (optional)
  @Input() highColor?: string;
  @Input() mediumColor?: string;
  @Input() lowColor?: string;

  trackColor   = '#E5E7EB';
  dangerColor  = '#EF4444';  // Red for HIGH severity (default)
  warningColor = '#F59E0B';  // Orange for MEDIUM severity (default)
  successColor = '#22C55E';  // Green for LOW severity (default)
  textColor    = '#111827';

  total        = 0;
  highValue    = 0;
  mediumValue  = 0;
  lowValue     = 0;
  highPercent  = 0;
  mediumPercent = 0;
  lowPercent   = 0;

  // ONE path string shared by track and ALL segments
  sharedPath = '';

  // Total arc length (used to compute dasharray values)
  arcLength = 0;

  // stroke-dasharray / stroke-dashoffset for each coloured segment
  highDash   = '';  highOffset   = 0;
  mediumDash = '';  mediumOffset = 0;
  lowDash    = '';  lowOffset    = 0;

  // Label anchor points
  highLabelX = 0;   highLabelY = 0;
  mediumLabelX = 0; mediumLabelY = 0;
  lowLabelX = 0;    lowLabelY = 0;

  // Segment stroke (narrower than track so it sits inside the grey band)
  segStroke = 0;

  activeSegment: 'high' | 'medium' | 'low' | null = null;
  pulseState = 0;

  ngOnChanges(_: SimpleChanges): void {
    // Apply custom colors if provided
    if (this.highColor) this.dangerColor = this.highColor;
    if (this.mediumColor) this.warningColor = this.mediumColor;
    if (this.lowColor) this.successColor = this.lowColor;
    
    this.highValue   = this.high   || 0;
    this.mediumValue = this.medium || 0;
    this.lowValue    = this.low    || 0;
    this.total = this.highValue + this.mediumValue + this.lowValue;

    this.highPercent   = this.total ? (this.highValue   / this.total) * 100 : 0;
    this.mediumPercent = this.total ? (this.mediumValue / this.total) * 100 : 0;
    this.lowPercent    = this.total ? (this.lowValue    / this.total) * 100 : 0;

    this.segStroke = this.strokeWidth - 3; // e.g. 8→5, giving 1.5px clearance each side

    // ── Geometry ─────────────────────────────────────────────────────────────
    const cx = this.width / 2;
    const r  = this.width / 2 - this.strokeWidth - 2;
    const cy = this.isCircular
      ? this.height / 2
      : this.height - this.strokeWidth - 2;

    // Build the single shared full-arc path (0% → 100%)
    this.sharedPath = this.buildFullArc(cx, cy, r);

    // Arc length: semicircle = π·r, full circle = 2π·r
    this.arcLength = this.isCircular ? 2 * Math.PI * r : Math.PI * r;

    // ── dasharray/dashoffset per segment ─────────────────────────────────────
    // Pattern: dasharray="segLen  totalLen"  dashoffset="-startLen"
    // The large second value hides everything beyond the segment end.
    const L = this.arcLength;
    const hLen = (this.highPercent   / 100) * L;
    const mLen = (this.mediumPercent / 100) * L;
    const lLen = (this.lowPercent    / 100) * L;

    this.highDash    = `${hLen} ${L}`;
    this.highOffset  = 0;

    this.mediumDash   = `${mLen} ${L}`;
    this.mediumOffset = -hLen;

    this.lowDash   = `${lLen} ${L}`;
    this.lowOffset = -(hLen + mLen);

    // ── Label positions ───────────────────────────────────────────────────────
    const lr   = r * 0.55;
    const hEnd = this.highPercent;
    const mEnd = hEnd + this.mediumPercent;

    this.highLabelX   = cx + lr * Math.cos(this.midAngle(0,    hEnd));
    this.highLabelY   = this.labelY(0,    hEnd, lr, cx, cy);
    this.mediumLabelX = cx + lr * Math.cos(this.midAngle(hEnd, mEnd));
    this.mediumLabelY = this.labelY(hEnd, mEnd, lr, cx, cy);
    this.lowLabelX    = cx + lr * Math.cos(this.midAngle(mEnd, 100));
    this.lowLabelY    = this.labelY(mEnd, 100, lr, cx, cy);
  }

  private buildFullArc(cx: number, cy: number, r: number): string {
    if (this.isCircular) {
      // Full circle as two semicircle arcs (single arc to 360° doesn't render)
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    } else {
      // Semicircle from left end (180°) to right end (0°)
      const x1 = cx - r, x2 = cx + r;
      return `M ${x1} ${cy} A ${r} ${r} 0 1 1 ${x2} ${cy}`;
    }
  }

  private midAngle(s: number, e: number): number {
    const m = (s + e) / 2;
    return this.isCircular
      ? -Math.PI / 2 + (m / 100) * 2 * Math.PI
      : Math.PI - (m / 100) * Math.PI;
  }

  private labelY(s: number, e: number, r: number, cx: number, cy: number): number {
    const a = this.midAngle(s, e);
    return this.isCircular
      ? cy + r * Math.sin(a)
      : cy - r * Math.sin(a);
  }

  toggleSegment(seg: 'high' | 'medium' | 'low'): void {
    this.activeSegment = this.activeSegment === seg ? null : seg;
    this.pulseState++;
  }
}