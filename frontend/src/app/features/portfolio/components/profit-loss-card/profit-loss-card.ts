import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

@Component({
  imports: [CommonModule, DecimalPipe],
  selector: 'app-profit-loss-card',
  styleUrl: './profit-loss-card.scss',
  templateUrl: './profit-loss-card.html',
})
export class ProfitLossCard {
  amount = input.required<number>();
  percentage = input.required<number>();
  isPositive = computed(() => this.amount() >= 0);
}