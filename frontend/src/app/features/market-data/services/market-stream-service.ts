import { Service, signal } from '@angular/core';
import { MarketTick } from '../models/market-data-model';
import { environment } from '../../../../environments/environment';

@Service()
export class MarketStreamService {
    private eventSource: EventSource | null = null;

    latestTick = signal<MarketTick | null>(null);

    connectMarketStream(): void {
        if (this.eventSource) return;

        this.eventSource = new EventSource(`${environment.apiUrl}/market/stream`);

        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.status === 'connected') return;
            
            this.latestTick.set(data as MarketTick);
        };

        this.eventSource.onerror = (error) => {
            console.error('Market Provider SSE disconnected. Reconnecting automatically...', error);
        };
    }

    disconnectMarketStream(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}