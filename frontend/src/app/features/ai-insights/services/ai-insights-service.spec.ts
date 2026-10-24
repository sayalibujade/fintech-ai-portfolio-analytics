import { TestBed } from '@angular/core/testing';
import { AiInsightsService } from './ai-insights-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

describe('AiInsights', () => {
  let service: AiInsightsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AiInsightsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AiInsightsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should successfully make a POST call to the analytical route endpoints and return insights', (done) => {
    const samplePrompt = 'Analyze my high-exposure crypto holdings profile.';
    const mockServerResponse = { analysis: '### Analysis Report\n\nYour portfolio holds optimized allocations.' };

    service.analyzePortfolio(samplePrompt).subscribe({
      next: (response) => {
        expect(response).toEqual(mockServerResponse);
        expect(response.analysis).toBe(mockServerResponse.analysis);
        done();
      }
    });

    const mockRequest = httpTestingController.expectOne(`${environment.apiUrl}/ai/analyze`);

    expect(mockRequest.request.method).toBe('POST');
    expect(mockRequest.request.body).toEqual({ prompt: samplePrompt });

    mockRequest.flush(mockServerResponse);
  });
});
