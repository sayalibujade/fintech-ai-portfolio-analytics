import { TestBed } from '@angular/core/testing';
import { TransactionStore } from './transactions-store';
import { TransactionsApi } from '../transactions-api';
import { of, throwError } from 'rxjs';

describe('TransactionsStore', () => {
    let store: any;
    let mockTransactionsApi: any;

    beforeEach(() => {
        TestBed.resetTestingModule();

        mockTransactionsApi = {
            getTransactions: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                TransactionStore,
                { provide: TransactionsApi, useValue: mockTransactionsApi }
            ]
        });

        store = TestBed.inject(TransactionStore);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize with default clear states', () => {
        expect(store.transactions()).toEqual([]);
        expect(store.isLoading()).toBe(false);
        expect(store.error()).toBeNull();
        expect(store.historicalOrders()).toEqual([]);
        expect(store.totalOrdersCount()).toBe(0);
        expect(store.totalVolumeTraded()).toBe(0);
    });

    it('should calculate derived order totals and mathematical traded volumes', async () => {
    const mockServerResponse = [
      { id: 'O1', shares: 10, price: 150 },
      { id: 'O2', shares: 5, price: 500 }
    ];

    mockTransactionsApi.getTransactions.mockReturnValue(of(mockServerResponse));

    await store.loadTransactionsData();

    expect(store.transactions()).toEqual(mockServerResponse);
    expect(store.historicalOrders()).toEqual(mockServerResponse);
    expect(store.totalOrdersCount()).toBe(2);
    expect(store.totalVolumeTraded()).toBe(4000);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should handle custom server error objects when loadTransactionsData fails', async () => {
    const customError = { error: { message: 'Database query timeout.' } };
    mockTransactionsApi.getTransactions.mockReturnValue(throwError(() => customError));

    await store.loadTransactionsData();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Database query timeout.');
    expect(store.transactions()).toEqual([]);
  });

  it('should map fallback messaging when loadTransactionsData fails with blank error layouts', async () => {
    mockTransactionsApi.getTransactions.mockReturnValue(throwError(() => ({})));

    await store.loadTransactionsData();

    expect(store.error()).toBe('Failed to sync historical order sheets ledger.');
  });

  it('should clear out error logs and reset signal values when clearError is called', () => {
    store.clearError();
    expect(store.error()).toBeNull();
  });
});