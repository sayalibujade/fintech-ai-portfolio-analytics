import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PortfolioStore } from './portfolio-store';
import { PortfolioApi } from '../portfolio-api';
import { MarketStreamService } from '../../market-data/services/market-stream-service';
import { of, throwError } from 'rxjs';

describe('PortfolioStore', () => {
    let store: any;
    let mockPortfolioApi: any;
    let mockMarketService: any;

    beforeEach(() => {
        TestBed.resetTestingModule();

        mockPortfolioApi = {
            getPortfolio: jest.fn(),
            executeTrade: jest.fn()
        };

        mockMarketService = {
            latestTick: signal<any>(null),
            connectMarketStream: jest.fn(),
            disconnectMarketStream: jest.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                PortfolioStore,
                { provide: PortfolioApi, useValue: mockPortfolioApi },
                { provide: MarketStreamService, useValue: mockMarketService }
            ]
        });
        store = TestBed.inject(PortfolioStore);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize with standard default clear states', () => {
    expect(store.portfolio()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.activeHoldings()).toEqual([]);
    expect(store.totalPortfolioValue()).toBe(0);
    expect(store.totalInvestmentCost()).toBe(0);
    expect(store.netProfitLoss()).toBe(0);
    expect(store.netProfitLossPercentage()).toBe(0);
  });

  it('should update livePrices signal when the market stream pushes ticks', () => {
    const mockSnapshot = {
      timestamp: '2026-10-13T00:00:00.000Z',
      price: { AAPL: 190, NVDA: 510 }
    };

    mockMarketService.latestTick.set(mockSnapshot);
    TestBed.flushEffects();

    expect(store.livePrices()).toEqual({ AAPL: 190, NVDA: 510 });
  });

  it('should ignore incoming market ticks if snapshot matches null or empty payloads', () => {
    mockMarketService.latestTick.set(null);
    TestBed.tick();

    expect(store.livePrices()).toEqual({});
  });

  it('should calculate financial metrics using a mixture of live prices, current prices, and fallback averages', async () => {
    const mockPortfolioResponse = {
      holdings: [
        { symbol: 'aapl', shares: 10, currentPrice: 150, avgPrice: 140 },
        { symbol: 'nvda', shares: 5, currentPrice: 480, avgPrice: 400 },
        { symbol: 'tsla', shares: 2, currentPrice: 0, avgPrice: 200 }
      ]
    };

    mockPortfolioApi.getPortfolio.mockReturnValue(of(mockPortfolioResponse));
    await store.loadPortfolioData();

    // 1. Evaluate with no live prices (uses holding currentPrice or avgPrice)
    // Cost: 10*140 + 5*400 + 2*200 = 1400 + 2000 + 400 = 3800
    // Value: 10*150 + 5*480 + 2*200 = 1500 + 2400 + 400 = 4300
    expect(store.totalInvestmentCost()).toBe(3800);
    expect(store.totalPortfolioValue()).toBe(4300);
    expect(store.netProfitLoss()).toBe(500);
    expect(store.netProfitLossPercentage()).toBe((500 / 3800) * 100);

    // 2. Feed live prices to override calculations reactively
    mockMarketService.latestTick.set({
      price: { AAPL: 200, NVDA: 500 } // TSLA missing, falls back to avgPrice
    });
    TestBed.tick();

    // New Value: 10*200 + 5*500 + 2*200 = 2000 + 2500 + 400 = 4900
    expect(store.totalPortfolioValue()).toBe(4900);
    expect(store.netProfitLoss()).toBe(1100);
    expect(store.netProfitLossPercentage()).toBe((1100 / 3800) * 100);
  });

  it('should return zero percentages if total investment cost evaluates to zero', async () => {
    const mockEmptyPortfolio = { holdings: [] };
    mockPortfolioApi.getPortfolio.mockReturnValue(of(mockEmptyPortfolio));
    await store.loadPortfolioData();

    expect(store.totalInvestmentCost()).toBe(0);
    expect(store.netProfitLossPercentage()).toBe(0);
    });

  it('should load portfolio data successfully, toggle loading flags, and connect streaming pipes', async () => {
    const mockResponse = { holdings: [{ symbol: 'AAPL', shares: 10, avgPrice: 150 }] };
    mockPortfolioApi.getPortfolio.mockReturnValue(of(mockResponse));

    await store.loadPortfolioData();

    expect(mockMarketService.connectMarketStream).toHaveBeenCalled();
    expect(store.portfolio()).toEqual(mockResponse);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should handle custom server error objects when loadPortfolioData fails', async () => {
    const customError = { error: { message: 'Database connection timeout constraint.' } };
    mockPortfolioApi.getPortfolio.mockReturnValue(throwError(() => customError));

    await store.loadPortfolioData();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Database connection timeout constraint.');
    expect(store.portfolio()).toBeNull();
    });

  it('should map fallback messaging when loadPortfolioData fails with blank error layouts', async () => {
    mockPortfolioApi.getPortfolio.mockReturnValue(throwError(() => ({})));

    await store.loadPortfolioData();

    expect(store.error()).toBe('Failed to sync live portfolio ledger details.');
  });

  it('should execute trades successfully, update state stores, and return true', async () => {
    const tradePayload = { ticker: 'AAPL', quantity: 5, type: 'BUY', price: 150 } as any;
    const mockResponse = { holdings: [{ symbol: 'AAPL', shares: 15, avgPrice: 150 }] };

    mockPortfolioApi.executeTrade.mockReturnValue(of({ success: true }));
    mockPortfolioApi.getPortfolio.mockReturnValue(of(mockResponse));

    const result = await store.executeTrade(tradePayload);

    expect(mockPortfolioApi.executeTrade).toHaveBeenCalledWith(tradePayload);
    expect(mockPortfolioApi.getPortfolio).toHaveBeenCalled();
    expect(store.portfolio()).toEqual(mockResponse);
    expect(store.isLoading()).toBe(false);
     expect(result).toBe(true);
  });

  it('should intercept transaction errors and map custom messages onto store error signals on trade failure', async () => {
    const tradePayload = { ticker: 'AAPL', quantity: 5, type: 'BUY', price: 150 } as any;
    const customError = { error: { message: 'Insufficient clear funds balances.' } };

    mockPortfolioApi.executeTrade.mockReturnValue(throwError(() => customError));

    const result = await store.executeTrade(tradePayload);

    expect(store.error()).toBe('Insufficient clear funds balances.');
    expect(store.isLoading()).toBe(false);
    expect(result).toBe(false);
  });

  it('should assign a default error message when executeTrade fails without a message context', async () => {
    const tradePayload = { ticker: 'AAPL', quantity: 5, type: 'BUY', price: 150 } as any;
    mockPortfolioApi.executeTrade.mockReturnValue(throwError(() => ({})));

    const result = await store.executeTrade(tradePayload);

    expect(store.error()).toBe('Transaction processing failed.');
    expect(result).toBe(false);
  });
});