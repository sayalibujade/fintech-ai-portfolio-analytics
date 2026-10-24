import { TestBed } from '@angular/core/testing';
import { AuthApi } from './auth-api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TokenService } from '../../core/services/token-service';
import { LoginResponse, SignupResponse } from './auth-model';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

describe('AuthApi Service', () => {
  let service: AuthApi;
  let httpTestingController: HttpTestingController;
  let mockTokenService: any;

  const mockUser = {
    id: 'user_11',
    firstName: 'John',
    lastName: 'Dave',
    email: 'john@test.com'
  };

  const sampleLoginResponse: LoginResponse = {
    token: 'jwt_secret_token_11',
    user: mockUser
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();

    mockTokenService = {
      getToken: jest.fn(() => localStorage.getItem('mock_token')),
      saveToken: jest.fn((token: string) => localStorage.setItem('mock_token', token)),
      removeToken: jest.fn(() => localStorage.removeItem('mock_token'))
    }

    TestBed.configureTestingModule({
      providers: [
        AuthApi,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: mockTokenService }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    if (httpTestingController) httpTestingController.verify();
  });

  const initService = () => {
    service = TestBed.inject(AuthApi);
  }

  it('should be created', () => {
    initService();
    expect(service).toBeTruthy();
  });

  it('should initialize with default unauthenticated layout states', () => {
    initService();
    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.userFullName()).toBe('');
  });

  it('should restore active structural states if valid user context exists in localStorage on startup', () => {
    localStorage.setItem('user_profile', JSON.stringify(mockUser));
    localStorage.setItem('mock_token', 'pre-stored-token');

    initService();

    expect(service.token()).toBe('pre-stored-token');
    expect(service.user()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBeTruthy();
    expect(service.userFullName()).toBe('John Dave');
  });

  it('should trigger clearSession automatically if localStorage contains corrupted payload profiles', () => {
    localStorage.setItem('user_profile', 'invalid-json-string{(');

    const clearSessionSpy = jest.spyOn(AuthApi.prototype, 'clearSession').mockImplementation(function(this: any) {
      if (this.tokenService) this.tokenService.removeToken();
      localStorage.removeItem('user_profile');
    });

    initService();

    expect(service.user()).toBeNull();
    expect(mockTokenService.removeToken).toHaveBeenCalled();

    clearSessionSpy.mockRestore();
  });

  it('should execute clean signup payload processing onto server api gateways', (done) => {
    initService();
    const signupRequest = { email: 'new@test.com', password: 'password123', firstName: 'A', lastName: 'B' };
    const mockSignupResponse: SignupResponse = { 
      message: 'User registered successfully',
      user: {
        id: 'USER_222',
        firstName: 'A',
        lastName: 'B',
        email: 'new@test.com'
      }
    };

    service.signup(signupRequest).subscribe({
      next: (res) => {
        expect(res).toEqual(mockSignupResponse);
        done();
      }
    });
    
    const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/signup`);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(signupRequest);
    req.flush(mockSignupResponse);
  });

  it('should post login payload streams and synchronously lock details inside signals on success', (done) => {
    initService();
    const loginPayload = { email: 'johndave@test.com', password: 'password123'};

    service.loginAndSaveSession(loginPayload).subscribe({
      next: (res) => {
        expect(res).toEqual(sampleLoginResponse);
        expect(service.token()).toBe(sampleLoginResponse.token);
        expect(service.user()).toEqual(mockUser);
        expect(service.isAuthenticated()).toBeTruthy();
        expect(service.userFullName()).toBe('John Dave');

        expect(localStorage.getItem('user_profile')).toContain('user_11');
        expect(mockTokenService.saveToken).toHaveBeenCalledWith(sampleLoginResponse.token);
        
        done();
      }
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginPayload);
    req.flush(sampleLoginResponse);
  });

  it('should scrub active footprints, clear local storage, and scrub signals when clearSession is invoked', () => {
    initService();
    service.saveSession(sampleLoginResponse);
    expect(service.isAuthenticated()).toBeTruthy();

    service.clearSession();

    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.userFullName()).toBe('');
    expect(localStorage.getItem('user_profile')).toBeNull();
    expect(mockTokenService.removeToken).toHaveBeenCalled();
  });
});
