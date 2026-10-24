const nativeWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args && args.toString().includes('NG0955')) {
    return;
  }
  nativeWarn(...args);
};

if (typeof global.EventSource === 'undefined') {
  global.EventSource = class {
    close = jest.fn();
    onerror = null;
    onmessage = null;
    onopen = null;
    constructor(public url: string) {}
  } as any;
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { PortfolioStore } from '../portfolio/store/portfolio-store';
import { TransactionStore } from '../transactions/store/transactions-store';
import { DashboardChart } from './components/dashboard-chart/dashboard-chart';
import { provideRouter } from '@angular/router';
import { signal, Component, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-dashboard-chart',
  template: '<div>Mock Dashboard Chart Canvas Workspace Wrapper</div>',
  standalone: true
})
class MockDashboardChartComponent {}

describe('Dashboard Component Suite', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockPortfolioStore: any;
  let mockTransactionStore: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockPortfolioStore = {
      totalPortfolioValue: signal(125000.50),
      netProfitLoss: signal(4500.75),
      netProfitLossPercentage: signal(3.75),
      activeHoldings: signal([
        { id: 'H1', name: 'Asset One' }, 
        { id: 'H2', name: 'Asset Two' }, 
        { id: 'H3', name: 'Asset Three' }
      ]),
      isLoading: signal(false),
      error: signal(null),
      loadPortfolioData: jest.fn()
    };

    mockTransactionStore = {
      historicalOrders: signal([
        { id: 'T1', ticker: 'BTC', date: '2026-10-12' },
        { id: 'T2', ticker: 'ETH', date: '2026-10-12' },
        { id: 'T3', ticker: 'SOL', date: '2026-10-12' },
        { id: 'T4', ticker: 'LINK', date: '2026-10-12' },
        { id: 'T5', ticker: 'AVAX', date: '2026-10-12' },
        { id: 'T6', ticker: 'ADA', date: '2026-10-12' }
      ]),
      isLoading: signal(false),
      error: signal(null),
      loadTransactionsData: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: PortfolioStore, useValue: mockPortfolioStore },
        { provide: TransactionStore, useValue: mockTransactionStore },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(Dashboard, {
      remove: { imports: [DashboardChart] }, 
      add: { imports: [MockDashboardChartComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize the dashboard lifecycle and trigger data loading store pipelines', () => {
    expect(component).toBeTruthy();
    expect(mockPortfolioStore.loadPortfolioData).toHaveBeenCalled();
    expect(mockTransactionStore.loadTransactionsData).toHaveBeenCalled();
  });

  it('should successfully compile derived computed properties from store signal values', () => {
    expect(component['totalValue']()).toBe(125000.50);
    expect(component['profitLoss']()).toBe(4500.75);
    expect(component['profitLossPercentage']()).toBe(3.75);
    expect(component['holdingsCount']()).toBe(3);
    expect(component['isDataLoading']()).toBeFalsy();
    expect(component['errorLog']()).toBeNull();
  });

  it('should toggle isDataLoading to true if any data provider is fetching information', () => {
    expect(component['isDataLoading']()).toBeFalsy();

    mockPortfolioStore.isLoading.set(true);
    expect(component['isDataLoading']()).toBeTruthy();

    mockPortfolioStore.isLoading.set(false);
    mockTransactionStore.isLoading.set(true);
    expect(component['isDataLoading']()).toBeTruthy();
  });

  it('should combine active error messages into a single computed stream block', () => {
    expect(component['errorLog']()).toBeNull();

    mockPortfolioStore.error.set('Network timeout on portfolio layer');
    expect(component['errorLog']()).toBe('Network timeout on portfolio layer');
  });

  it('should slice the historical orders array down to slice out only the top 5 most recent records', () => {
    const activityList = component['recentActivity']() as any[];
    
    expect(activityList.length).toBe(5);
    expect(activityList[0].id).toBe('T1');
    expect(activityList[4].id).toBe('T5');
  });
});