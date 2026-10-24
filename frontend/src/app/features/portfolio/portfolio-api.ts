import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { PortfolioData, TradePayload } from './models/portfolio-model';
import { environment } from '../../../environments/environment';

@Service()
export class PortfolioApi {
    private readonly http = inject(HttpClient);

    getPortfolio(): Observable<PortfolioData> {
        return this.http.get<PortfolioData>(`${environment.apiUrl}/portfolio`);
    }

    executeTrade(payload: TradePayload): Observable<any> {
        return this.http.post(`${environment.apiUrl}/transactions`, payload);
    }
}