import { TestBed } from '@angular/core/testing';
import { PortfolioApi } from './portfolio-api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PortfolioData, TradePayload } from './models/portfolio-model';
import { environment } from '../../../environments/environment';

describe('PortfolioApi', () => {
  let service: PortfolioApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        PortfolioApi,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PortfolioApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute getPortfolio with GET mapping and broadcast server data', (done) => {
    const mockPortfolioData: PortfolioData = {
      totalValue: 50000,
      holdings: [{ ticker: 'AAPL', amount: 10, averageBuyPrice: 150 }]
    } as any;

    service.getPortfolio().subscribe({
      next: (res) => {
        expect(res).toEqual(mockPortfolioData);
        done();
      }
    });

    const mockRequest = httpTestingController.expectOne(`${environment.apiUrl}/portfolio`);
    expect(mockRequest.request.method).toBe('GET');
    mockRequest.flush(mockPortfolioData);
  });

  it('should execute executeTrade with a POST request and push current payload params', (done) => {
    const mockPayload: TradePayload = {
      ticker: 'NVDA',
      quantity: 5,
      type: 'BUY',
      price: 480
    } as any;

    const mockServerResponse = { success: true, transactionId: 'TX_111' };

    service.executeTrade(mockPayload).subscribe({
      next: (res) => {
        expect(res).toEqual(mockServerResponse);
        done();
      }
    });

    const mockRequest = httpTestingController.expectOne(`${environment.apiUrl}/transactions`);
    expect(mockRequest.request.method).toBe('POST');
    expect(mockRequest.request.body).toBe(mockPayload);
    mockRequest.flush(mockServerResponse);
  });
});