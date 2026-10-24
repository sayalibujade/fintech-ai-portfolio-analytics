import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfitLossCard } from './profit-loss-card';

describe('ProfitLossCard', () => {
  let component: ProfitLossCard;
  let fixture: ComponentFixture<ProfitLossCard>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ProfitLossCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfitLossCard);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('amount', 0);
    fixture.componentRef.setInput('percentage', 0);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should calculate isPositive as true when a positive financial amount is supplied', () => {
    fixture.componentRef.setInput('amount', 4500.75);
    fixture.componentRef.setInput('percentage', 3.75);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.isPositive()).toBe(true);
  });

  it('should calculate isPositive as false when a negative financial amount is supplied', () => {
    fixture.componentRef.setInput('amount', -1250.50);
    fixture.componentRef.setInput('percentage', -1.25);
    fixture.detectChanges();

    expect(component.isPositive()).toBe(false);
  });

  it('should evaluate a zero boundary amount as a positive financial outcome', () => {
    fixture.componentRef.setInput('amount', 0);
    fixture.componentRef.setInput('percentage', 0);
    fixture.detectChanges();

    expect(component.isPositive()).toBe(true);
  });
});
