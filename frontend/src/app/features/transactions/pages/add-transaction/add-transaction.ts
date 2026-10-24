import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PortfolioStore } from '../../../portfolio/store/portfolio-store';
import { TradePayload } from '../../../portfolio/models/portfolio-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.scss'
})
export class AddTransaction implements OnInit, OnDestroy {
  public store = inject(PortfolioStore);
  private sub = new Subscription();

  public orderType = signal<'BUY' | 'SELL'>('BUY');
  
  public rawQuantity = signal<number>(0);
  public rawPrice = signal<number>(0);

  public transactionForm = new FormGroup({
    ticker: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)])
  });

  public totalCostEstimated = computed(() => {
    return this.rawQuantity() * this.rawPrice();
  });

  ngOnInit(): void {
    this.sub.add(
      this.transactionForm.controls.quantity.valueChanges.subscribe(val => {
        // FIX: Swapped functional invocation parameters with explicit .set() declarations to resolve ts(2554)
        this.rawQuantity.set(val ?? 0);
      })
    );
    this.sub.add(
      this.transactionForm.controls.price.valueChanges.subscribe(val => {
        // FIX: Swapped functional invocation parameters with explicit .set() declarations to resolve ts(2554)
        this.rawPrice.set(val ?? 0);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public setOrderType(type: 'BUY' | 'SELL'): void {
    this.orderType.set(type);
  }

  public async handleOrderSubmission(): Promise<void> {
    if (this.transactionForm.invalid) return;

    const formValues = this.transactionForm.getRawValue();
    
    const payload: TradePayload = {
      symbol: formValues.ticker.trim().toUpperCase(),
      type: this.orderType(),
      shares: Number(formValues.quantity),
      price: Number(formValues.price)
    };

    const success = await this.store.executeTrade(payload);

    if (success) {
      this.transactionForm.reset();
      this.rawQuantity.set(0);
      this.rawPrice.set(0);
      this.orderType.set('BUY');

      const closeBtn = document.querySelector('.btn-close') as HTMLElement;
      closeBtn?.click();
    }
  }
}