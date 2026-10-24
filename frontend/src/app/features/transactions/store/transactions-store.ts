import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { TransactionsState } from '../transactions-models';
import { computed, inject } from '@angular/core';
import { TransactionsApi } from '../transactions-api';
import { lastValueFrom } from 'rxjs';

const initialState: TransactionsState = {
    transactions: [],
    isLoading: false,
    error: null
};

export const TransactionStore = signalStore(
    { providedIn: 'root' },

    withState(initialState),

    withProps(() => ({
        transactionsApi: inject(TransactionsApi)
    })),

    withComputed(({ transactions }) => {
        const historicalOrders = computed(() => transactions());

        const totalOrdersCount = computed(() => historicalOrders().length);

        const totalVolumeTraded = computed(() => {
            return historicalOrders().reduce((sum, order) => sum + (order.shares * order.price), 0)
        });

        return {
            historicalOrders,
            totalOrdersCount,
            totalVolumeTraded
        };
    }),

    withMethods((store) => ({
        async loadTransactionsData(): Promise<void> {
            patchState(store, {
                isLoading: true,
                error: null
            });

            try {
                const response = await lastValueFrom(store.transactionsApi.getTransactions())

                patchState(store, {
                    transactions: response,
                    isLoading: false
                })
            } catch (error: any) {
                patchState(store, {
                    isLoading: false,
                    error: error?.error?.message || 'Failed to sync historical order sheets ledger.'
                });
            }
        },
        
        clearError(): void {
            patchState(store, {
                error: null
            });
        }
    }))
);