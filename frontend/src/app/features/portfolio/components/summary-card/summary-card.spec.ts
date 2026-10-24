import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCard } from './summary-card';

describe('SummaryCard', () => {
  let component: SummaryCard;
  let fixture: ComponentFixture<SummaryCard>;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [SummaryCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCard);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Default Label');
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should initialize and accept required string and numeric input parameters', () => {
    fixture.componentRef.setInput('label', 'Total Portfolio Value');
    fixture.componentRef.setInput('value', 125000.50);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.label()).toBe('Total Portfolio Value');
    expect(component.value()).toBe(125000.50);
  });

  it('should update template bindings when input signals undergo runtime mutations', () => {
    fixture.componentRef.setInput('label', 'Net Profit');
    fixture.componentRef.setInput('value', 4500.75);
    fixture.detectChanges();

    expect(component.label()).toBe('Net Profit');
    expect(component.value()).toBe(4500.75);
  });
});