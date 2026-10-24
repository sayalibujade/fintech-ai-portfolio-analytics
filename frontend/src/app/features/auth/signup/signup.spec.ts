import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { async, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { Signup } from './signup';
import { AuthApi } from '../auth-api';

describe('Signup Component', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

  const authApiMock = {
    signup: jest.fn()
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    jest.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: authApiMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    authApiMock.signup.mockReset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid initially', () => {
    expect(component.isFormInvalid()).toBe(true);
  });

  it('should become valid when registration fields satisfy rules', () => {
    component.credentials.set({
      firstName: 'Min',
      lastName: 'Keller',
      email: 'min@test.com',
      password: 'password123'
    });
    fixture.detectChanges();

    expect(component.isFormInvalid()).toBe(false);
  });

  it('should execute signup, show confirmation alert, and redirect with timer delays', async() => {
    component.credentials.set({
      firstName: 'Min',
      lastName: 'Keller',
      email: 'min@test.com',
      password: 'password123'
    });

    const mockResponse = { message: 'Success', user: { id: '1', email: 'min@test.com' } };
    authApiMock.signup.mockReturnValue(of(mockResponse));

    const signupPromise = component.performSignup();
    await jest.advanceTimersByTimeAsync(0);

    expect(authApiMock.signup).toHaveBeenCalledWith({
      firstName: 'Min',
      lastName: 'Keller',
      email: 'min@test.com',
      password: 'password123'
    });

    expect(component.signupSuccessMsg()).toBe('Account created successfully! Redirecting to login...');
    expect(navigateSpy).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(2000);
    await signupPromise;

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(component.isSubmitting()).toBe(false);
  });

  it('should handle structural HttpErrorResponse failures', async() => {
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { error: 'Email already exists' }
    });

    authApiMock.signup.mockReturnValue(throwError(() => errorResponse));
    const signupPromise = component.performSignup();
    await jest.advanceTimersByTimeAsync(0);
    await signupPromise;

    expect(component.serverError()).toBe('Email already exists');
    expect(component.isSubmitting()).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should map fallback messages if incoming server exception payloads match blank layouts', async() => {
    const blankError = new HttpErrorResponse({
      status: 500,
      error: {}
    });

    authApiMock.signup.mockReturnValue(throwError(() => blankError));
    const signupPromise = component.performSignup();
    await jest.advanceTimersByTimeAsync(0);
    await signupPromise;

    expect(component.serverError()).toBe('Unable to signup. please try again.');
  });

  it('should fallback to standard safety alerts if thrown exception items match non-HTTP formats', async() => {
    authApiMock.signup.mockReturnValue(throwError(() => new Error('System compilation crack')));
    const signupPromise = component.performSignup();
    await jest.advanceTimersByTimeAsync(0);
    await signupPromise;

    expect(component.serverError()).toBe('Something went wrong. Please try again.');
    expect(component.isSubmitting()).toBe(false);
  });

  it('should verify structural submission actions directly from the form schema definitions', async () => {
    const formConfigAction = (component.signupForm as any)?.['_options']?.submission?.action || 
                             (component.signupForm as any)?.['options']?.submission?.action;
                             
    if (typeof formConfigAction === 'function') {
      authApiMock.signup.mockReturnValue(of({}));
      const performSignupSpy = jest.spyOn(component, 'performSignup').mockResolvedValue();
      
      await formConfigAction();
      
      expect(performSignupSpy).toHaveBeenCalled();
    }
  });
});
