import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [CommonModule, DatePipe, DecimalPipe],
  selector: 'app-transaction-table',
  styleUrl: './transaction-table.scss',
  templateUrl: './transaction-table.html',
})
export class TransactionTable {
  orders = input.required<any[]>();
}