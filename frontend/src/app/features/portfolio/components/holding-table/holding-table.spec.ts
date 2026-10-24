import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoldingTable } from './holding-table';

describe('HoldingTable', () => {
  let component: HoldingTable;
  let fixture: ComponentFixture<HoldingTable>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [HoldingTable],
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('holdings', [
      { symbol: 'AAPL', shares: 10, avgPrice: 150, currentPrice: 155 } as any,
      { symbol: 'NVDA', shares: 5, avgPrice: 400, currentPrice: 420 } as any
    ]);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reactively update holdings when new datasets are supplied', () => {
    const updatedHoldings = [
      { symbol: 'TSLA', shares: 20, avgPrice: 200, currentPrice: 210 } as any
    ];
    
    fixture.componentRef.setInput('holdings', updatedHoldings);
    fixture.detectChanges();

    expect(component.holdings()).toEqual(updatedHoldings);
  });
});
