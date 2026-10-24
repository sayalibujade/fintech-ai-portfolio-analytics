import { TestBed } from '@angular/core/testing';
import { TransactionsApi } from './transactions-api';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Transaction } from './transactions-models';
import { environment } from '../../../environments/environment';

describe('TransactionsApi', () => {
  let service: TransactionsApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
       providers: [
        TransactionsApi,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TransactionsApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute getTransactions with an HTTP GET request and return the matching backend mock dataset', (done) => {
    const mockTransactions: Transaction[] = [
      { id: 'T1', symbol: 'BTC', shares: 1, price: 60000, type: 'BUY', timestamp: '2026-10-13T00:00:00.000Z' } as any,
      { id: 'T2', symbol: 'ETH', shares: 2, price: 3200, type: 'SELL', timestamp: '2026-10-13T01:00:00.000Z' } as any
    ];

    service.getTransactions().subscribe({
      next: (response) => {
        expect(response).toEqual(mockTransactions);
        done();
      }
    });

    const mockRequest = httpTestingController.expectOne(`${environment.apiUrl}/transactions`);
    expect(mockRequest.request.method).toBe('GET');
    
    mockRequest.flush(mockTransactions);
  });
});
