import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [CommonModule, DecimalPipe],
  selector: 'app-summary-card',
  styleUrl: './summary-card.scss',
  templateUrl: './summary-card.html',
})
export class SummaryCard {
  label = input.required<string>();
  value = input.required<number>();
}