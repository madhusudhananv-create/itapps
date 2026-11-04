import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' colors the confirm button for a destructive/irreversible action. */
  tone?: 'default' | 'danger';
}

export interface PromptOptions extends ConfirmOptions {
  placeholder?: string;
  defaultValue?: string;
}

interface ConfirmRequest extends ConfirmOptions {
  kind: 'confirm';
  resolve: (value: boolean) => void;
}

interface PromptRequest extends PromptOptions {
  kind: 'prompt';
  value: string;
  resolve: (value: string | null) => void;
}

export type DialogRequest = ConfirmRequest | PromptRequest;

/**
 * App-wide confirm/prompt dialog (mounted once via <app-confirm-dialog/> in
 * AppComponent), replacing native window.confirm()/window.prompt() - those
 * render as an unstyled browser chrome popup (with the page URL in the title
 * bar) that looks like a different, untrusted app, and can't be visually
 * distinguished from a phishing prompt. One shared dialog, styled to match
 * the rest of Admin Setup, is used everywhere a confirmation or short text
 * input is needed instead.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly requestSubject = new BehaviorSubject<DialogRequest | null>(null);
  readonly request$ = this.requestSubject.asObservable();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.requestSubject.next({ kind: 'confirm', ...options, resolve });
    });
  }

  /** Resolves to the entered text, or null if the user cancelled (mirrors window.prompt's contract). */
  prompt(options: PromptOptions): Promise<string | null> {
    return new Promise((resolve) => {
      this.requestSubject.next({ kind: 'prompt', ...options, value: options.defaultValue ?? '', resolve });
    });
  }

  /** Called by ConfirmDialogComponent's Confirm/OK button. */
  respondConfirm(ok: boolean): void {
    const current = this.requestSubject.value;
    if (!current || current.kind !== 'confirm') return;
    this.requestSubject.next(null);
    current.resolve(ok);
  }

  /** Called by ConfirmDialogComponent's prompt buttons - null means Cancel. */
  respondPrompt(value: string | null): void {
    const current = this.requestSubject.value;
    if (!current || current.kind !== 'prompt') return;
    this.requestSubject.next(null);
    current.resolve(value);
  }
}
