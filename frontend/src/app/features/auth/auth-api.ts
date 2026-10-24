import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { LoginResponse, SignupResponse, LoginRequest, SignupRequest, User } from './auth-model';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../core/services/token-service';

@Service()
export class AuthApi {
    private http = inject(HttpClient);
    private tokenService = inject(TokenService);

    private readonly USER_KEY = 'user_profile';

    //1. Reactive state signals
    private tokenSignal = signal<string | null>(this.tokenService.getToken());
    private userSignal = signal<User | null>(this.getStoredUser());

    //2. Public readonly computed views for guards and layouts
    public token = computed(() => this.tokenSignal());
    public user = computed(() => this.userSignal());
    public isAuthenticated = computed(() => !!this.tokenSignal());

    public userFullName = computed(() => {
        const current = this.userSignal();
        return current ? `${current.firstName} ${current.lastName}` : '';
    });

    //HTTP methods below:
    loginAndSaveSession(payload: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
            tap((response) => {
                this.saveSession(response);
            })
        );
    }

    signup(payload: SignupRequest): Observable<SignupResponse> {
        return this.http.post<SignupResponse>(`${environment.apiUrl}/auth/signup`, payload);
    }

    //session orchestration methods:
    saveSession(data: LoginResponse): void {
        this.tokenService.saveToken(data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

        this.tokenSignal.set(data.token);
        this.userSignal.set(data.user);
    }
    clearSession(): void {
        this.tokenService.removeToken();
        localStorage.removeItem(this.USER_KEY);

        this.tokenSignal.set(null);
        this.userSignal.set(null);
    }

    private getStoredUser(): User | null {
        try {
            const stored = localStorage.getItem(this.USER_KEY);
            return stored ? (JSON.parse(stored) as User) : null;
        } catch {
            this.clearSession();
            return null;
        }
    }
}