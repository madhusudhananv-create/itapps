import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const IMG_MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', bmp: 'image/bmp'
};

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [NgIf],
  template: `
    <iframe *ngIf="blobUrl" [src]="blobUrl" class="manual-frame" title="User Manual"></iframe>
    <div *ngIf="!blobUrl && !error" class="manual-loading">Loading User Manual…</div>
    <div *ngIf="error" class="manual-error">Unable to load User Manual.</div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100vh; }
    .manual-frame { width: 100%; height: 100%; border: none; display: block; }
    .manual-loading, .manual-error { padding: 2rem; color: #888; text-align: center; }
  `]
})
export class UserManualComponent implements OnInit, OnDestroy {
  blobUrl: SafeResourceUrl | null = null;
  error = false;
  private _objectUrl = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // The HTML file location — used to resolve relative image paths correctly.
    const htmlFileUrl = `${window.location.origin}/assets/documents/User%20Manual.html`;

    this.http.get('/assets/documents/User%20Manual.html', { responseType: 'text' }).pipe(
      switchMap(html => {
        // Collect unique image src values (skip already-inlined data URIs).
        const imgRegex = /src="([^"]+\.(?:png|jpg|jpeg|gif|svg|webp|bmp))"/gi;
        const uniqueSrcs = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = imgRegex.exec(html)) !== null) {
          if (!m[1].startsWith('data:')) uniqueSrcs.add(m[1]);
        }

        if (uniqueSrcs.size === 0) {
          return of({ html, replacements: new Map<string, string>() });
        }

        // Fetch each image via HttpClient so the tokenInterceptor adds auth headers.
        // Paths are resolved relative to the HTML file's location on the server.
        const fetches: Observable<[string, string]>[] = Array.from(uniqueSrcs).map(src => {
          const absoluteUrl = new URL(src, htmlFileUrl).href;
          return this.http.get(absoluteUrl, { responseType: 'arraybuffer' }).pipe(
            map(buffer => {
              const ext = (src.split('.').pop() ?? 'png').toLowerCase();
              const mime = IMG_MIME[ext] ?? 'image/png';
              const bytes = new Uint8Array(buffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
              return [src, `data:${mime};base64,${btoa(binary)}`] as [string, string];
            }),
            catchError(() => of([src, ''] as [string, string]))
          );
        });

        return forkJoin(fetches).pipe(
          map(results => {
            const replacements = new Map<string, string>();
            results.forEach(([src, dataUrl]) => { if (dataUrl) replacements.set(src, dataUrl); });
            return { html, replacements };
          })
        );
      })
    ).subscribe({
      next: ({ html, replacements }) => {
        // Replace all src attributes with inlined data URLs so the iframe
        // does not make additional server requests that would lack auth headers.
        let processed = html;
        replacements.forEach((dataUrl, src) => {
          processed = processed.split(`src="${src}"`).join(`src="${dataUrl}"`);
        });
        const blob = new Blob([processed], { type: 'text/html' });
        this._objectUrl = URL.createObjectURL(blob);
        this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this._objectUrl);
      },
      error: () => {
        this.error = true;
      }
    });
  }

  ngOnDestroy(): void {
    if (this._objectUrl) {
      URL.revokeObjectURL(this._objectUrl);
    }
  }
}
