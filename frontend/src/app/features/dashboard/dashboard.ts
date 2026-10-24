import { Component, computed, inject, OnInit } from '@angular/core';
import { PortfolioStore } from '../portfolio/store/portfolio-store';
import { TransactionStore } from '../transactions/store/transactions-store';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardChart } from './components/dashboard-chart/dashboard-chart';

@Component({
  imports: [DecimalPipe, CommonModule, RouterLink, DatePipe, DashboardChart],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private portfolioStore = inject(PortfolioStore);
  private transactionStore = inject(TransactionStore);

  protected totalValue = this.portfolioStore.totalPortfolioValue;
  protected profitLoss = this.portfolioStore.netProfitLoss;
  protected profitLossPercentage = this.portfolioStore.netProfitLossPercentage;
  protected holdingsCount = computed(() => this.portfolioStore.activeHoldings().length);

  protected isDataLoading = computed(() => this.portfolioStore.isLoading() || this.transactionStore.isLoading());
  protected errorLog = computed(() => this.portfolioStore.error() || this.transactionStore.error());

  protected recentActivity = computed(() => this.transactionStore.historicalOrders().slice(0, 5));

  ngOnInit(): void {
    this.portfolioStore.loadPortfolioData();
    this.transactionStore.loadTransactionsData();
  }
}
