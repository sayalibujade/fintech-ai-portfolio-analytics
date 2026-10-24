import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TransactionStore } from '../../store/transactions-store';
import { TransactionTable } from '../../components/transaction-table/transaction-table';

@Component({
  imports: [CommonModule, DecimalPipe, TransactionTable],
  selector: 'app-transaction-list',
  styleUrl: './transaction-list.scss',
  templateUrl: './transaction-list.html',
})
export class TransactionList implements OnInit {
  private transactionsStore = inject(TransactionStore);

  protected orders = this.transactionsStore.historicalOrders;
  protected count = this.transactionsStore.totalOrdersCount;
  protected volume = this.transactionsStore.totalVolumeTraded;
  protected isLoading = this.transactionsStore.isLoading;
  protected error = this.transactionsStore.error;

  ngOnInit(): void {
    this.transactionsStore.loadTransactionsData();
  }
}
