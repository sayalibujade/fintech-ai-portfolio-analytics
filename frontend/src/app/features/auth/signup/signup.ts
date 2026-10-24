import { Component, computed, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../auth-api';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/models/api-error-model';

@Component({
  imports: [FormField, RouterLink, FormRoot],
  selector: 'app-signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
})
export class Signup {
   private authApiService = inject(AuthApi);
  private router = inject(Router);
 
  credentials = signal({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  isSubmitting = signal<boolean>(false);
  serverError = signal<string | null>(null);
  signupSuccessMsg = signal<string | null>(null);
  
  signupForm = form(this.credentials, (field) => {
    required(field.firstName, { message: 'First Name is required.' });
    minLength(field.firstName, 2, { message: 'First Name must be at least 2 characters.' });
    required(field.lastName, { message: 'Last Name is required.' });
    minLength(field.lastName, 2, { message: 'Last Name must be at least 2 characters.' });
    required(field.email, { message: 'Email is required.' });
    email(field.email, { message: 'Please enter a valid email address.' });
    required(field.password, { message: 'Password is required.' });
    minLength(field.password, 6, { message: 'Password must be at least 6 characters.' });
  },
  {
      submission: {
        action: this.performSignup.bind(this)
      }
    });

  isFormInvalid = computed(() => !this.signupForm().valid());

  async performSignup(): Promise<void> {
    this.serverError.set(null);
    this.signupSuccessMsg.set(null);
    this.isSubmitting.set(true);
    try {
      const response = await lastValueFrom(this.authApiService.signup(this.credentials()));

      this.signupSuccessMsg.set('Account created successfully! Redirecting to login...');

      setTimeout(async () => {           
        await this.router.navigate(['/login']);
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse) {
        const apiError = error.error as ApiError;
        this.serverError.set(apiError?.error ?? 'Unable to signup. please try again.');
      } else {
        this.serverError.set('Something went wrong. Please try again.');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
