import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';
import { TokenService } from '../services/token-service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockRouter: { createUrlTree: jest.Mock };
  let mockTokenService: { getToken: jest.Mock };

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn()
    };

    mockTokenService = {
      getToken: jest.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TokenService, useValue: mockTokenService }
      ]
    });
  });

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true if tokenService resolves a valid active token string', () => {
    mockTokenService.getToken.mockReturnValue('valid_session_token_1');
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(mockTokenService.getToken).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated sessions and generate a login urlTree fallback branch', () => {
    mockTokenService.getToken.mockReturnValue(null);
    const mockUrlTree = {} as UrlTree;
    mockRouter.createUrlTree.mockReturnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(mockUrlTree);
    expect(mockTokenService.getToken).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
