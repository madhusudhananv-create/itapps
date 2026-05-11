import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-csat-configuration',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>CSAT Configuration</h2>
      <p>This component is under migration. Please check back later.</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CsatConfigurationComponent {
  constructor() {}
}
