import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { signal } from '@angular/core';
import { AuthApi } from '../../../features/auth/auth-api';
import { Router } from '@angular/router';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockAuthApi: { userFullName: ReturnType<typeof signal>; clearSession: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockAuthApi = {
      userFullName: signal('John Dave'),
      clearSession: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: AuthApi, useValue: mockAuthApi },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the user full name directly from the reactive auth service signal stream', () => {
    expect(component['fullName']()).toBe('John Dave');
    mockAuthApi.userFullName.set('Jane White');
    expect(component['fullName']()).toBe('Jane White');
  });

  it('should completely clear active token footprints and navigate to the login route on logout events', () => {
    component.onLogout();

    expect(mockAuthApi.clearSession).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
