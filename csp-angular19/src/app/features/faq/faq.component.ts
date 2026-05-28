import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [],
  template: `
    <iframe [src]="faqUrl" class="faq-frame" title="FAQ"></iframe>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100vh; }
    .faq-frame { width: 100%; height: 100%; border: none; display: block; }
  `]
})
export class FaqComponent {
  faqUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    this.faqUrl = sanitizer.bypassSecurityTrustResourceUrl('/assets/documents/FAQs.html');
  }
}
