export interface Holding {
    symbol: string;   
    shares: number;   
    avgPrice: number;   
    currentPrice: number;   
}

export interface PortfolioData {
    _id?: string;
    userId: string;
    holdings: Holding[];
    updatedAt: string;
}

export interface PortfolioState {
    portfolio: PortfolioData | null;
    isLoading: boolean;
    error: string | null;
}

export interface TradePayload {
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
}