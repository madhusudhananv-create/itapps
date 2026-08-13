import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Dialog,
    InputText,
    Password,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.authenticated()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  readonly form = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    password: ['', Validators.required],
  });

  showForgot = false;
  showReset = false;
  loginError = false;

  submit(): void {
    this.loginError = false;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { userId, password } = this.form.getRawValue();
    const ok = this.auth.login(userId, password);
    if (ok) {
      void this.router.navigate(['/dashboard']);
    } else {
      this.loginError = true;
    }
  }
}
