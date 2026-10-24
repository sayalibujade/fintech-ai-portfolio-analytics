import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SummaryCard } from '../../components/summary-card/summary-card';
import { ProfitLossCard } from '../../components/profit-loss-card/profit-loss-card';
import { HoldingTable } from '../../components/holding-table/holding-table';
import { PortfolioStore } from '../../store/portfolio-store';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AddTransaction } from '../../../transactions/pages/add-transaction/add-transaction';

@Component({
  imports: [CommonModule, SummaryCard, ProfitLossCard, HoldingTable, NgApexchartsModule, AddTransaction],
  selector: 'app-portfolio-details',
  styleUrl: './portfolio-details.scss',
  templateUrl: './portfolio-details.html',
})
export class PortfolioDetails implements OnInit {
  public store = inject(PortfolioStore);
  protected netPnL = computed(() => this.store.totalPortfolioValue() - this.store.totalInvestmentCost());
  public isModalOpen = signal<boolean>(false);
  
  protected chartSeries = computed(() => 
    this.store.activeHoldings().map(h => h.shares * (h.currentPrice || h.avgPrice))
  );

  protected plotOptions = {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Asset Total'
          }
        }
      }
    }
  };

  protected chartLabels = computed(() => 
    this.store.activeHoldings().map(h => h.symbol.toUpperCase())
  );

  protected chartConfig = computed(() => ({
    type: 'donut' as const,
    height: 320
  }));

  protected chartColors = ['#0284c7', '#38bdf8', '#0ea5e9', '#0369a1', '#0c4a6e'];

  protected chartLegend = {
    position: 'bottom' as const
  };

  protected dataLabels = {
    enabled: false
  };

  ngOnInit(): void {
    this.store.loadPortfolioData();
  }

   protected openTradeModal(): void {
    this.isModalOpen.set(true);
  }

  protected closeTradeModal(): void {
    this.isModalOpen.set(false);
  }
}