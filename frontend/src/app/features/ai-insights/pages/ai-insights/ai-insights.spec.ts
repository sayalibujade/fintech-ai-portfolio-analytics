import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiInsights } from './ai-insights';
import { Pipe, PipeTransform, NO_ERRORS_SCHEMA } from '@angular/core';
import { AiInsightsService } from '../../services/ai-insights-service';
import { MarkdownPipe } from '../../utils/markdown-pipe';
import { of, Subject, throwError } from 'rxjs';

@Pipe({
  name: 'markdown',
  standalone: true
})
class MockMarkdownPipe implements PipeTransform {
  transform(value: string): string { return value; }
}

describe('AiInsights', () => {
  let component: AiInsights;
  let fixture: ComponentFixture<AiInsights>;
  let mockAiService: { analyzePortfolio: jest.Mock };

  const samplePortfolioMock = [
    { id: 'PF_101', name: 'Growth Crypto Portfolio', holdings: [], description: 'Test 1' },
    { id: 'PF_202', name: 'Conservative Bond Stack', holdings: [], description: 'Test 2' },
  ];

  beforeEach(async () => {
    TestBed.resetTestingModule();

    mockAiService = {
      analyzePortfolio: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AiInsights],
      providers: [
        { provide: AiInsightsService, useValue: mockAiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(AiInsights, {
      remove: { imports: [MarkdownPipe] },
      add: { imports: [MockMarkdownPipe] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInsights);
    component = fixture.componentInstance;

    component.portfolios.set(samplePortfolioMock as any);
    component.selectedPortfolioId.set('PF_101');
    component.sampleQuestions.set(['What is the overall allocation?', 'Analyze macro risk profiles.']);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute activePortfolio value reactively when selectedPortfolioId is changed', () => {
    expect(component.activePortfolio()).toEqual(samplePortfolioMock[0]);
    component.selectPortfolio('PF_202');

    expect(component.selectedPortfolioId()).toBe('PF_202');
    expect(component.activePortfolio()).toEqual(samplePortfolioMock[1]);
    expect(component.aiResponse()).toBe('');
  });

  it('should exit on askAi if string values are completely blank or model is already compiling analysis', () => {
    component.isLoading.set(true);
    component.askAi('Help analyze this portfolio text');
    expect(mockAiService.analyzePortfolio).not.toHaveBeenCalled();

    component.isLoading.set(false);
    component.askAi('  ');
    expect(mockAiService.analyzePortfolio).not.toHaveBeenCalled();
  });

  it('should successfully write model results into aiResponse upon positive stream subscription resolutions', () => {
    const fakeAnalysisResponse = { analysis: 'Your portfolio looks great.' };
    mockAiService.analyzePortfolio.mockReturnValue(of(fakeAnalysisResponse));

    component.askAi('Is this allocation balanced?');

    expect(component.isLoading()).toBe(false);
    expect(component.aiResponse()).toBe(fakeAnalysisResponse.analysis);
    expect(component.customQuery()).toBe('');
  });

  it('should display a localized defensive alert string if the AI analytical stream exceptions drop', () => {
    const mockConsoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAiService.analyzePortfolio.mockReturnValue(throwError(() => new Error('Service down')));

    component.askAi('Analyze my asset risk models');

    expect(component.isLoading()).toBe(false);
    expect(component.aiResponse()).toContain('The financial analysis model is currently experiencing high traffic spikes');
    expect(mockConsoleSpy).toHaveBeenCalled();

    mockConsoleSpy.mockRestore();
  });

  it('should handle unsubscription boundaries if the container object collapses mid-stream', () => {
    const rxStreamDstroyTrigger = new Subject<any>();
    mockAiService.analyzePortfolio.mockReturnValue(rxStreamDstroyTrigger.asObservable());

    component.askAi('Long running analysis task query parameter');

    fixture.destroy();

    rxStreamDstroyTrigger.next({ analysis: 'This should be ignored safely' });
    expect(component.isLoading()).toBe(true);
  });
});
