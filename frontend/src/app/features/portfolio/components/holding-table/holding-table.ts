import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  imports: [CommonModule, DecimalPipe],
  selector: 'app-holding-table',
  styleUrl: './holding-table.scss',
  templateUrl: './holding-table.html',
})
export class HoldingTable {
  holdings = input.required<any[]>();
}
