import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionList } from './transaction-list';
import { Component, Input, NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TransactionStore } from '../../store/transactions-store';
import { TransactionTable } from '../../components/transaction-table/transaction-table';

@Component({
  selector: 'app-transaction-table',
  template: '<div>Mock Transaction Table Grid</div>',
  standalone: true
})
class MockTransactionTableComponent {
  @Input() orders: any[] = [];
}

describe('TransactionList', () => {
  let component: TransactionList;
  let fixture: ComponentFixture<TransactionList>;
  let mockTransactionStore: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockTransactionStore = {
      historicalOrders: signal([
        { id: 'T1', date: '2026-10-13', symbol: 'AAPL', type: 'BUY', shares: 10, price: 150 }
      ]),
      totalOrdersCount: signal(1),
      totalVolumeTraded: signal(1500),
      isLoading: signal(false),
      error: signal(null),
      loadTransactionsData: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TransactionList],
       providers: [
        { provide: TransactionStore, useValue: mockTransactionStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(TransactionList, {
      remove: { imports: [TransactionTable] },
      add: { imports: [MockTransactionTableComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should initialize the page component and invoke store data loading pipelines on init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockTransactionStore.loadTransactionsData).toHaveBeenCalled();
  });

  it('should resolve and expose read-only state signal streams from the underlying store', () => {
    fixture.detectChanges();

    expect(component['orders']()).toEqual([
      { id: 'T1', date: '2026-10-13', symbol: 'AAPL', type: 'BUY', shares: 10, price: 150 }
    ]);
    expect(component['count']()).toBe(1);
    expect(component['volume']()).toBe(1500);
    expect(component['isLoading']()).toBe(false);
    expect(component['error']()).toBeNull();
  });

  it('should update reactive component state handles when store properties change', () => {
    fixture.detectChanges();

    mockTransactionStore.isLoading.set(true);
    mockTransactionStore.error.set('Network connection failed.');
    fixture.detectChanges();

    expect(component['isLoading']()).toBe(true);
    expect(component['error']()).toBe('Network connection failed.');
  });
});
