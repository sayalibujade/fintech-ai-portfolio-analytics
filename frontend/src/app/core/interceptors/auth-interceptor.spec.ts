import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { Router } from '@angular/router';
import { TokenService } from '../services/token-service';
import { of, throwError } from 'rxjs';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let mockRouter: { navigate: jest.Mock };
  let mockTokenService: { getToken: jest.Mock; removeToken: jest.Mock };
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn()
    };

    mockTokenService = {
      getToken: jest.fn(),
      removeToken: jest.fn()
    };

    mockHandler = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TokenService, useValue: mockTokenService },
      ]
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should append a Bearer token authorization header if user holds a token context', (done) => {
    mockTokenService.getToken.mockReturnValue('active_token');

    const initialRequest = new HttpRequest('GET', '/portfolio');
    mockHandler.mockReturnValue(of({} as HttpEvent<any>));

    TestBed.runInInjectionContext(() => {
      authInterceptor(initialRequest, mockHandler).subscribe({
        next: () => {
          const req = mockHandler.mock.calls[0][0] as HttpRequest<any>;
          expect(req.headers.get('Authorization')).toBe('Bearer active_token');
          done();
        }
      });
    });
  });

  it('should forward the request unaltered if no session token exists in local storage', (done) => {
    mockTokenService.getToken.mockReturnValue(null);

    const initialRequest = new HttpRequest('GET', '/market/stream');
    mockHandler.mockReturnValue(of({} as HttpEvent<any>));

    TestBed.runInInjectionContext(() => {
      authInterceptor(initialRequest, mockHandler).subscribe({
        next: () => {
          const req = mockHandler.mock.calls[0][0] as HttpRequest<any>;
          expect(req.headers.get('Authorization')).toBeNull();
          done();
        }
      });
    });
  });

  it('should flush out token and redirect to login if an HTTP error hits a 401 unauthorized status code', (done) => {
    mockTokenService.getToken.mockReturnValue('expired_session_token');

    const initialRequest = new HttpRequest('GET', '/ai/analyze');
    const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockHandler.mockReturnValue(throwError(() => mockError));

    TestBed.runInInjectionContext(() => {
      authInterceptor(initialRequest, mockHandler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(mockTokenService.removeToken).toHaveBeenCalled();
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        }
      });
    });
  });

  it('should bubble up generic runtime errors without applying session redirection', (done) => {
    mockTokenService.getToken.mockReturnValue('valid_token');

    const initialRequest = new HttpRequest('GET', '/transactions');
    const mockError = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    mockHandler.mockReturnValue(throwError(() => mockError));

    TestBed.runInInjectionContext(() => {
      authInterceptor(initialRequest, mockHandler).subscribe({
        error: (error) => {
          expect(error).toBe(mockError);
          expect(mockTokenService.removeToken).not.toHaveBeenCalled();
          expect(mockRouter.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
