import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

/**
 * Type-to-filter replacement for a native <select> on long lists (customers,
 * projects). Implements ControlValueAccessor so it is a drop-in for the
 * `[(ngModel)]="…"` bindings the native selects already used - the call sites
 * keep their model and their (ngModelChange) handlers unchanged.
 *
 * Filtering is client-side over `options`; there is no server round-trip.
 */
@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor {
  @Input() options: SearchableSelectOption[] = [];
  @Input() placeholder = 'Search…';
  /** Label for the "no value" row; omit to make the picker required-ish (no clear row). */
  @Input() emptyLabel: string | null = null;
  @Input() disabled = false;

  /** Fires in addition to the ngModel write, for call sites that prefer an explicit output. */
  @Output() valueChange = new EventEmitter<string>();

  open = false;
  /** What the user typed; only meaningful while the dropdown is open. */
  query = '';
  highlighted = -1;

  /**
   * The option list renders `position: fixed` at these viewport coordinates
   * rather than `position: absolute` inside the control, specifically because
   * this control is used inside modals that are themselves scrollable with a
   * sticky action footer - an absolutely-positioned list there gets tangled up
   * with the footer's stacking/scroll context (it either paints underneath the
   * footer, hiding Cancel/Save, or - once the footer's z-index wins - the list
   * renders as if the footer were inserted mid-list, since the footer sticks
   * to the un-overlaid content height while the list floats past it). Fixed
   * positioning relative to the viewport sidesteps all of that: it isn't
   * clipped or reordered by any ancestor's overflow/sticky behaviour.
   */
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 0;

  private innerValue = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private scrollParent: HTMLElement | null = null;
  private readonly onReposition = () => this.updatePosition();
  /**
   * The open list is reparented to document.body (see openList()) so its
   * `position: fixed` coordinates are always relative to the real viewport.
   * Kept here because once it's moved, it's no longer inside `host`, so
   * onDocumentMouseDown can't rely on `host.nativeElement.contains(...)`
   * alone to know a click landed on an option.
   */
  private portaledListEl: HTMLElement | null = null;

  constructor(private host: ElementRef<HTMLElement>) {}

  // ---- ControlValueAccessor ----

  writeValue(value: string | null): void {
    this.innerValue = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ---- View state ----

  /** Text shown in the input when the list is closed: the selected option's label. */
  get selectedLabel(): string {
    return this.options.find((o) => o.value === this.innerValue)?.label ?? '';
  }

  get displayValue(): string {
    return this.open ? this.query : this.selectedLabel;
  }

  get filtered(): SearchableSelectOption[] {
    const needle = this.query.trim().toLowerCase();
    if (!this.open || !needle) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle));
  }

  openList(): void {
    if (this.disabled || this.open) return;
    this.open = true;
    // Start from a blank filter so the whole list is browsable, exactly like a
    // native select, rather than pre-filtered by the current selection's label.
    this.query = '';
    this.highlighted = -1;
    this.updatePosition();
    // Reposition (or just close) if the modal/page scrolls or the viewport
    // resizes while open, since the list is now anchored to viewport
    // coordinates rather than following the control automatically.
    this.scrollParent = this.findScrollParent(this.host.nativeElement);
    this.scrollParent?.addEventListener('scroll', this.onReposition, true);
    window.addEventListener('resize', this.onReposition);
    // Wait one tick for *ngIf to create the .ss-list element, then move it to
    // document.body. Any ancestor (the glass modals here use
    // backdrop-filter: blur(...) on .modal) creates a new containing block
    // for position: fixed descendants, so a fixed-positioned list left inside
    // one renders at the wrong offset - anchored to that ancestor instead of
    // the viewport - which makes an otherwise-populated list appear empty or
    // land off-screen. Reparenting to <body> guarantees the viewport is
    // always the containing block.
    setTimeout(() => this.portalList());
  }

  private portalList(): void {
    const list = this.host.nativeElement.querySelector('.ss-list') as HTMLElement | null;
    if (!list || list.parentElement === document.body) return;
    // Once outside the admin-setup :host subtree, the list no longer inherits
    // the --surface/--border/--text-* tokens defined there, so var(--surface)
    // etc. resolve to nothing and the panel renders transparent (the modal
    // behind shows through). Snapshot the resolved custom properties onto the
    // element itself so it renders correctly regardless of where it lands.
    const computed = getComputedStyle(this.host.nativeElement);
    for (const prop of Array.from(computed)) {
      if (prop.startsWith('--')) list.style.setProperty(prop, computed.getPropertyValue(prop));
    }
    document.body.appendChild(list);
    this.portaledListEl = list;
  }

  private updatePosition(): void {
    const rect = this.host.nativeElement.querySelector('.ss-control')?.getBoundingClientRect();
    if (!rect) return;
    this.dropdownTop = rect.bottom + 4;
    this.dropdownLeft = rect.left;
    this.dropdownWidth = rect.width;
  }

  private findScrollParent(el: HTMLElement): HTMLElement | null {
    let node = el.parentElement;
    while (node) {
      const overflowY = getComputedStyle(node).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return node;
      node = node.parentElement;
    }
    return null;
  }

  private teardownListeners(): void {
    this.scrollParent?.removeEventListener('scroll', this.onReposition, true);
    window.removeEventListener('resize', this.onReposition);
    this.scrollParent = null;
  }

  onInput(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
    this.open = true;
    this.highlighted = -1;
  }

  select(option: SearchableSelectOption | null): void {
    const value = option ? option.value : '';
    this.innerValue = value;
    this.open = false;
    this.query = '';
    this.teardownListeners();
    this.portaledListEl = null;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.query = '';
    this.teardownListeners();
    this.portaledListEl = null;
    this.onTouched();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open) this.openList();
      const list = this.filtered;
      if (!list.length) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      this.highlighted = (this.highlighted + step + list.length) % list.length;
      return;
    }
    if (event.key === 'Enter') {
      if (!this.open) return;
      event.preventDefault();
      const list = this.filtered;
      if (this.highlighted >= 0 && this.highlighted < list.length) this.select(list[this.highlighted]);
      return;
    }
  }

  isSelected(option: SearchableSelectOption): boolean {
    return option.value === this.innerValue;
  }

  /**
   * A caller whose [options] getter rebuilds fresh objects every
   * change-detection cycle (easy to do by accident - see admin-setup's
   * cycleSelectOptions) would otherwise cause *ngFor to destroy/recreate
   * every option's DOM node continuously, including on the mousedown that
   * starts a click - the browser only fires click if the same element is
   * still there on mouseup, so options other than one that happens to
   * survive can silently stop responding to clicks. Keying by value alone
   * keeps each option's node stable regardless of object identity churn
   * upstream.
   */
  trackByValue(_index: number, option: SearchableSelectOption): string {
    return option.value;
  }

  /** Any click outside the control closes the list without changing the value. */
  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.open) return;
    const target = event.target as Node;
    if (this.host.nativeElement.contains(target)) return;
    if (this.portaledListEl?.contains(target)) return;
    this.close();
  }
}
