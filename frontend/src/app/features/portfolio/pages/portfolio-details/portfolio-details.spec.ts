import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioDetails } from './portfolio-details';
import { PortfolioStore } from '../../store/portfolio-store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { signal, Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'apx-chart',
  template: '<div>Mock Donut Asset Chart Wrapper</div>',
  standalone: true
})
class MockApexChartComponent {
  @Input() series: any;
  @Input() chart: any;
  @Input() labels: any;
  @Input() colors: any;
  @Input() legend: any;
  @Input() dataLabels: any;
  @Input() plotOptions: any;
}

@Component({
  selector: 'app-add-transaction',
  template: '<div>Mock Add Transaction Form Container</div>',
  standalone: true
})
class MockAddTransactionComponent {}

describe('PortfolioDetails Component Suite', () => {
  let component: PortfolioDetails;
  let fixture: ComponentFixture<PortfolioDetails>;
  let mockPortfolioStore: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockPortfolioStore = {
      totalPortfolioValue: signal(150000.00),
      totalInvestmentCost: signal(120000.00),
      netProfitLossPercentage: signal(25.00),
      isLoading: signal(false),
      activeHoldings: signal([
        { symbol: 'aapl', shares: 10, currentPrice: 150, avgPrice: 140 },
        { symbol: 'tsla', shares: 5, currentPrice: 200, avgPrice: 220 }
      ]),
      loadPortfolioData: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PortfolioDetails],
      providers: [
        { provide: PortfolioStore, useValue: mockPortfolioStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(PortfolioDetails, {
      remove: { imports: [NgApexchartsModule] },
      add: { imports: [MockApexChartComponent, MockAddTransactionComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioDetails);
    component = fixture.componentInstance;
  });

  it('should initialize component, invoke store data download pipelines on init', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockPortfolioStore.loadPortfolioData).toHaveBeenCalled();
  });

  it('should successfully compile reactive computed properties from active store signal streams', () => {
    fixture.detectChanges();

    expect(component['netPnL']()).toBe(30000.00);
    expect(component.isModalOpen()).toBe(false);
    expect(component['chartSeries']()).toEqual([1500, 1000]);
    expect(component['chartLabels']()).toEqual(['AAPL', 'TSLA']);
    expect(component['chartConfig']()).toEqual({ type: 'donut', height: 320 });
  });

  it('should calculate chart lines accurately falling back to avgPrice if currentPrice is zero or missing', () => {
    mockPortfolioStore.activeHoldings.set([
      { symbol: 'nvda', shares: 10, currentPrice: 0, avgPrice: 500 }
    ]);
    fixture.detectChanges();

    expect(component['chartSeries']()).toEqual([5000]);
    expect(component['chartLabels']()).toEqual(['NVDA']);
  });

  it('should reactively toggle isModalOpen parameters when opening or closing trade modal triggers fire', () => {
    fixture.detectChanges();
    expect(component.isModalOpen()).toBe(false);
    
    component['openTradeModal']();
    expect(component.isModalOpen()).toBe(true);

    component['closeTradeModal']();
    expect(component.isModalOpen()).toBe(false);
  });
});