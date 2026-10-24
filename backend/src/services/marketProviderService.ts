import { MarketSnapshot } from '../models/market';

// 1. File-level private configuration scopes (Capsules state just like JWT_SECRET)
let intervalId: NodeJS.Timeout | null = null;
const trackedTickers = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN'];
const prices: Record<string, number> = { 
  AAPL: 225.00, 
  NVDA: 115.50, 
  TSLA: 198.00, 
  MSFT: 410.00, 
  AMZN: 180.00 
};

/**
 * Functional Mock Data Stream Provider
 * Establishes a background ticking clock that pushes updates out through an arrow callback.
 */
export const subscribeToMarketTicks = (callback: (tick: MarketSnapshot) => void): void => {
      if (intervalId) return;

    intervalId = setInterval(() => {
        // Still fluctuate a single random ticker to simulate active volatility
        const symbol = trackedTickers[Math.floor(Math.random() * trackedTickers.length)];
        const variance = (Math.random() * 2 - 1) / 100;
        prices[symbol] = parseFloat((prices[symbol] * (1 + variance)).toFixed(2));

        // Broadcast the entire updated prices map matching the frontend expectations
        callback({
            timestamp: new Date().toISOString(),
            prices: { ...prices } // Passes a clean snapshot copy of the current state dictionary
        });
    }, 2000);
};

export const unsubscribeFromMarketTicks = (): void => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

/**
 * Quick operational lookup utility to query absolute cost boundaries
 */
export const getLatestMarketPrice = (symbol: string): number => {
    return prices[symbol.toUpperCase()] || 100.00;
};