import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class AiInsightsService {
    private http = inject(HttpClient);
    
    analyzePortfolio(prompt: string): Observable<{ analysis: string }> {
        return this.http.post<{ analysis: string }>(`${environment.apiUrl}/ai/analyze`, { prompt });
    }
}
