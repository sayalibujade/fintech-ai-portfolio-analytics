import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, minLength, required, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../auth-api';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/models/api-error-model';

@Component({
  imports: [FormField, RouterLink, FormRoot],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',

})
export class Login {
  private authApiService = inject(AuthApi);
  private router = inject(Router);

  credentials = signal({
    email: '',
    password: ''
  });

  isSubmitting = signal<boolean>(false);
  serverError = signal<string | null>(null);

  loginForm = form(
    this.credentials,
    (field) => {
      required(field.email, { message: 'Email is required.' });
      email(field.email, { message: 'Please enter a valid email address.' });
      required(field.password, { message: 'Password is required.' });
      minLength(field.password, 6, { message: 'Password must be at least 6 characters.' });
    },
    {
      submission: {
        action: this.performLogin.bind(this)
      }
    }
  );

  async performLogin(): Promise<void> {
    this.serverError.set(null);
    this.isSubmitting.set(true);

    try {
      await lastValueFrom(this.authApiService.loginAndSaveSession(this.credentials()));
      await this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
        if (error instanceof HttpErrorResponse) {
          const apiError = error.error as ApiError;
          this.serverError.set(apiError?.error ?? 'Unable to login. Please try again.');
        } else {
          this.serverError.set('Something went wrong. Please try again.');
        }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  isFormInvalid = computed(() => !this.loginForm().valid());
}
