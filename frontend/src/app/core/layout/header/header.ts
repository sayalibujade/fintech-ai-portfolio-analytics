import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthApi } from '../../../features/auth/auth-api';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  private authApiService = inject(AuthApi);
  private router = inject(Router);

  // Directly bind the structural signal from your AuthService
  protected fullName = this.authApiService.userFullName;

  onLogout(): void {
    this.authApiService.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
