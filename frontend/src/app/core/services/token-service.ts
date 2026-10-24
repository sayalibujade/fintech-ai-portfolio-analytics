import { Service } from '@angular/core';

@Service()
export class TokenService {
    private readonly TOKEN_KEY = 'auth_token';

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    saveToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }
}
