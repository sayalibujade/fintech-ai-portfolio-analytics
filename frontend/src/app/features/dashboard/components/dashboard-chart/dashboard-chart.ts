import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { MarketStreamService } from '../../../market-data/services/market-stream-service';

@Component({
  imports: [CommonModule, NgApexchartsModule],
  selector: 'app-dashboard-chart',
  styleUrl: './dashboard-chart.scss',
  templateUrl: './dashboard-chart.html',
})
export class DashboardChart implements OnInit, OnDestroy {
  private marketService = inject(MarketStreamService);

  marketChart = viewChild<ChartComponent>('marketChart');

  public chartSeries: any[] = [
    { name: 'AAPL', data: [] },
    { name: 'NVDA', data: [] },
    { name: 'TSLA', data: [] },
    { name: 'MSFT', data: [] }
  ];

  public chartOptions: any = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 500 } }
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { type: 'datetime' }
  };

  constructor() {
    effect(() => {
       // 1. Capture the multi-price snapshot object
      const snapshot = this.marketService.latestTick() as any; 
      if (!snapshot || !snapshot.prices) return;
  
      const timestampX = new Date(snapshot.timestamp).getTime();
       // 2. Loop through every line in your chart simultaneously
      this.chartSeries.forEach((series) => {
        const livePrice = snapshot.prices[series.name];
        
        if (livePrice) {
          // Push the synchronized coordinate point to every asset line
          series.data.push({ x: timestampX, y: livePrice });
  
          // Maintain view performance parameters cleanly
          if (series.data.length > 20) {
            series.data.shift();
          }
        }
      });
  
      // 3. Command ApexCharts to advance the entire synchronized timeline grid
      this.marketChart()?.updateSeries(this.chartSeries);
    });
  }
  
  ngOnInit(): void {
    this.marketService.connectMarketStream();
  }
  
  ngOnDestroy(): void {
    this.marketService.disconnectMarketStream();
  }
}
