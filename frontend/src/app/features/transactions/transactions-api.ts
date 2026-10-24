import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Transaction } from './transactions-models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class TransactionsApi {
    private http = inject(HttpClient);

    getTransactions(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`);
    }
}