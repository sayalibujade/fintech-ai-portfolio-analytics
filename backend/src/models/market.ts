export interface MarketSnapshot {
    timestamp: string;
    prices: Record<string, number>;
}

export interface IMarketProvider {
    subscribeToTicks(callback: (tick: MarketSnapshot) => void): void;
    unsubscribe(): void;
    getLatestPrice(symbol: string): number;
}