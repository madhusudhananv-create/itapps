import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-release-notes',
  standalone: true,
  imports: [],
  template: `
    <iframe [src]="releaseNotesUrl" class="release-notes-frame" title="Release Notes"></iframe>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100vh; }
    .release-notes-frame { width: 100%; height: 100%; border: none; display: block; }
  `]
})
export class ReleaseNotesComponent {
  releaseNotesUrl: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    this.releaseNotesUrl = sanitizer.bypassSecurityTrustResourceUrl('/assets/helpfiles/CSM_Platform_Release_Notes_neurealm.html');
  }
}
