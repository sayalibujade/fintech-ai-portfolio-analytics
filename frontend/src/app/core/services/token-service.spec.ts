import { TestBed } from '@angular/core/testing';
import { TokenService } from './token-service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [TokenService]
    });
    service = TestBed.inject(TokenService);

    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should successfully write a token string into local storage', () => {
    const sampleToken = 'jwt_session_token_1';
    service.saveToken(sampleToken);

    expect(localStorage.getItem('auth_token')).toBe(sampleToken);
  });

  it('should raed and return a token string if it exists inside local storage', () => {
    const sampleToken = 'active_jwt_session_token_1';
    localStorage.setItem('auth_token', sampleToken);

    const result = service.getToken();

    expect(result).toBe(sampleToken);
  });
    
  it('should permanently erase the token upn calling removeToken', () => {
    localStorage.setItem('auth_token', 'temporary_jwt_token');
    service.removeToken();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
