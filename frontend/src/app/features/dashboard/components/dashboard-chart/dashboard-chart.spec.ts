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
import { DashboardChart } from './dashboard-chart';
import { MarketStreamService } from '../../../market-data/services/market-stream-service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { signal, Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';

@Component({
  selector: 'apx-chart',
  template: '<div>Mock Apex Chart Canvas Workspace Wrapper</div>',
  standalone: true
})
class MockApexChartComponent {
  @Input() series: any;
  @Input() chart: any;
  @Input() xaxis: any;
  @Input() stroke: any;

  updateSeries = jest.fn();
  updateOptions = jest.fn();
}

describe('DashboardChart Component Suite', () => {
  let component: DashboardChart;
  let fixture: ComponentFixture<DashboardChart>;
  let mockMarketService: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockMarketService = {
      latestTick: signal<any>(null),
      connectMarketStream: jest.fn(),
      disconnectMarketStream: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardChart],
      providers: [
        { provide: MarketStreamService, useValue: mockMarketService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(DashboardChart, {
      remove: { imports: [NgApexchartsModule] },
      add: { imports: [MockApexChartComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChart);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should compile, connect the stream on init, and clean up on destroy', () => {
    expect(component).toBeTruthy();
    expect(mockMarketService.connectMarketStream).toHaveBeenCalled();

    component.ngOnDestroy();
    expect(mockMarketService.disconnectMarketStream).toHaveBeenCalled();
  });

  it('should skip processing if an incoming market tick payload matches an empty or blank shape', () => {
    mockMarketService.latestTick.set({});
    fixture.detectChanges();
    
    expect(component.chartSeries[0].data.length).toBe(0);
  });

  it('should reactively push streaming price coordinates to the target array series when new tickers arrive', () => {
    const mockTimestamp = '2026-10-12T19:00:00.000Z';
    const mockTimeX = new Date(mockTimestamp).getTime();
    
    const mockTickPayload = {
      timestamp: mockTimestamp,
      prices: {
        AAPL: 185.50,
        NVDA: 495.25,
        TSLA: 240.00,
        MSFT: 375.10
      }
    };

    const mockChartInstance = { updateSeries: jest.fn() };
    jest.spyOn(component, 'marketChart').mockReturnValue(mockChartInstance as any);

    mockMarketService.latestTick.set(mockTickPayload);
    fixture.detectChanges();

    expect(component.chartSeries[0].data[0]).toEqual({ x: mockTimeX, y: 185.50 });
    expect(component.chartSeries[1].data[0]).toEqual({ x: mockTimeX, y: 495.25 });
    expect(mockChartInstance.updateSeries).toHaveBeenCalledWith(component.chartSeries);
  });

  it('should shift out old structural array entries to maintain performance boundaries when data surpasses 20 elements', () => {
    const mockChartInstance = { updateSeries: jest.fn() };
    jest.spyOn(component, 'marketChart').mockReturnValue(mockChartInstance as any);

    for (let i = 0; i < 20; i++) {
      component.chartSeries[0].data.push({ x: i, y: 100 + i });
    }
    expect(component.chartSeries[0].data.length).toBe(20);

    const extraTick = {
      timestamp: '2026-10-12T19:05:00.000Z',
      prices: { AAPL: 200.00 }
    };
    mockMarketService.latestTick.set(extraTick);
    fixture.detectChanges();

    expect(component.chartSeries[0].data.length).toBe(20);
    expect(component.chartSeries[0].data[19].y).toBe(200.00);
  });
});