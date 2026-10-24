import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTransaction } from './add-transaction';
import { PortfolioStore } from '../../../portfolio/store/portfolio-store';
import { ReactiveFormsModule } from '@angular/forms';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddTransaction Component Suite', () => {
  let component: AddTransaction;
  let fixture: ComponentFixture<AddTransaction>;
  let mockPortfolioStore: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockPortfolioStore = {
      isLoading: signal(false),
      error: signal(null),
      executeTrade: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AddTransaction, ReactiveFormsModule],
      providers: [
        { provide: PortfolioStore, useValue: mockPortfolioStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTransaction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize cleanly with default buy settings and invalid form state', () => {
    expect(component).toBeTruthy();
    expect(component.orderType()).toBe('BUY');
    expect(component.totalCostEstimated()).toBe(0);
    expect(component.transactionForm.invalid).toBe(true);
  });

  it('should handle order type toggles smoothly through the public setter api', () => {
    component.setOrderType('SELL');
    expect(component.orderType()).toBe('SELL');
  });

  it('should calculate estimated capital cost metrics via value change signals', () => {
    component.transactionForm.controls.ticker.setValue('TSLA');
    component.transactionForm.controls.quantity.setValue(10);
    component.transactionForm.controls.price.setValue(200);
    
    fixture.detectChanges();

    expect(component.rawQuantity()).toBe(10);
    expect(component.rawPrice()).toBe(200);
    expect(component.totalCostEstimated()).toBe(2000);
    expect(component.transactionForm.valid).toBe(true);
  });

  it('should handle fallback zero defaults inside value changes safely', () => {
    component.transactionForm.controls.quantity.setValue(null);
    component.transactionForm.controls.price.setValue(null);
    
    fixture.detectChanges();

    expect(component.rawQuantity()).toBe(0);
    expect(component.rawPrice()).toBe(0);
    expect(component.totalCostEstimated()).toBe(0);
  });

  it('should abort submission tasks if handleOrderSubmission is triggered on an invalid form state', async () => {
    await component.handleOrderSubmission();
    expect(mockPortfolioStore.executeTrade).not.toHaveBeenCalled();
  });

  it('should route trade execution requests down to the store and reset signals upon success', async () => {
    component.transactionForm.setValue({ ticker: '  tsla  ', quantity: 15, price: 200 });
    mockPortfolioStore.executeTrade.mockResolvedValue(true);

    await component.handleOrderSubmission();

    expect(mockPortfolioStore.executeTrade).toHaveBeenCalledWith({
      symbol: 'TSLA',
      shares: 15,
      type: 'BUY',
      price: 200
    });
    expect(component.transactionForm.value.ticker).toBe('');
    expect(component.orderType()).toBe('BUY');
    expect(component.rawQuantity()).toBe(0);
    expect(component.rawPrice()).toBe(0);
  });

  it('should preserve active string values if the portfolio store handles reject the transaction payload', async () => {
    component.transactionForm.setValue({ ticker: 'NVDA', quantity: 5, price: 500 });
    mockPortfolioStore.executeTrade.mockResolvedValue(false);

    await component.handleOrderSubmission();

    expect(component.transactionForm.value.ticker).toBe('NVDA');
  });
});