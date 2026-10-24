import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionTable } from './transaction-table';
import { DatePipe, DecimalPipe } from '@angular/common';

describe('TransactionTable', () => {
  let component: TransactionTable;
  let fixture: ComponentFixture<TransactionTable>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [TransactionTable],
      providers: [DatePipe, DecimalPipe]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('orders', [
      { id: 'T1', date: '2026-10-13', symbol: 'AAPL', type: 'BUY', shares: 10, price: 150.25 },
      { id: 'T2', date: '2026-10-13', symbol: 'NVDA', type: 'SELL', shares: 5, price: 495.50 }
    ]);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept and update orders when new datasets are supplied at runtime', () => {
    const updatedOrders = [
      { id: 'T3', date: '2026-10-13', symbol: 'TSLA', type: 'BUY', shares: 20, price: 240.00 }
    ];

    fixture.componentRef.setInput('orders', updatedOrders);
    fixture.detectChanges();

    expect(component.orders()).toEqual(updatedOrders);
  });
});