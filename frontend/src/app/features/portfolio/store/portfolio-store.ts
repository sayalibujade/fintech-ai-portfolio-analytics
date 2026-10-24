import { computed, effect, inject, signal } from '@angular/core';
import { PortfolioState, TradePayload } from '../models/portfolio-model';
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { lastValueFrom } from 'rxjs';
import { PortfolioApi } from '../portfolio-api';
import { MarketStreamService } from '../../market-data/services/market-stream-service';

const initialState: PortfolioState = {
    portfolio: null,
    isLoading: false,
    error: null
};

export const PortfolioStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),

    withProps(() => {
        const marketService = inject(MarketStreamService);
        const livePrices = signal<Record<string, number>>({});

        effect(() => {
            const snapshot = marketService.latestTick() as any;
            if (!snapshot || !snapshot.price) return;
            livePrices.set(snapshot.price);
        });

        return {
            portfolioApi: inject(PortfolioApi),
            marketService,
            livePrices
        };
    }),

    withComputed(({ portfolio, livePrices }) => {
        const activeHoldings = computed(() => portfolio()?.holdings ?? []);

        const totalPortfolioValue = computed(() => {
            const currentHoldings = activeHoldings();
            const currentPrices = livePrices();

            return currentHoldings.reduce((total, holding) => {
                const ticker = holding.symbol.toUpperCase();
                const livePrice = currentPrices[ticker] || holding.currentPrice || holding.avgPrice;
                return total + (holding.shares * livePrice);
            }, 0);
        });

        const totalInvestmentCost = computed(() => {
            return activeHoldings().reduce((total, holding) => total + holding.shares * holding.avgPrice, 0);
        });

        return {
            activeHoldings,
            totalPortfolioValue,
            totalInvestmentCost
        };
    }),

    withComputed((store) => {
        const netProfitLoss = computed(() => store.totalPortfolioValue() - store.totalInvestmentCost());

        const netProfitLossPercentage = computed(() => {
            const investment = store.totalInvestmentCost();

            if (investment === 0) return 0;

            return (netProfitLoss() / investment) * 100;
        });

        return {
            netProfitLoss,
            netProfitLossPercentage
        }
    }),

    withMethods((store) => ({
        async loadPortfolioData(): Promise<void> {
            patchState(store, { isLoading: true, error: null });
            try {
                store.marketService.connectMarketStream();

                const response = await lastValueFrom(store.portfolioApi.getPortfolio());
                patchState(store, { portfolio: response, isLoading: false });
            } catch (error: any) {
                patchState(store, {
                    error: error?.error?.message || 'Failed to sync live portfolio ledger details.',
                    isLoading: false
                });
            }
        },

        async executeTrade(payload: TradePayload): Promise<boolean> {
            patchState(store, { isLoading: true, error: null });
            try {
                await lastValueFrom(store.portfolioApi.executeTrade(payload));

                const response = await lastValueFrom(store.portfolioApi.getPortfolio());
                patchState(store, { portfolio: response, isLoading: false });
                return true;
            } catch (error: any) {
                patchState(store, { 
                    error: error?.error?.message || 'Transaction processing failed.',
                    isLoading: false
                });
                return false;
            }
        }
    }))
);