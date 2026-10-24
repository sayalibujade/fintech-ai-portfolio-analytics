import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayout } from './main-layout';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthApi } from '../../../features/auth/auth-api';

const mockAuthApi = {
  userFullName: signal('Test User')
};

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthApi, useValue: mockAuthApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create main layout container', () => {
    expect(component).toBeTruthy();
  });
});
