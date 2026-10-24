export interface StockHolding {
    ticker: string;
    companyName: string;
    sharesOwned: number;
    averageBuyPrice: number;
    currentPrice: number;
    sector: string;
}

export interface PortfolioProfile {
    id: string;
    name: string;
    description: string;
    holdings: StockHolding[];
}

export const MOCK_PORTFOLIOS: PortfolioProfile[] = [
    {
        id: 'tech-growth',
        name: 'Tech-Heavy Growth Portfolio',
        description: 'A high-risk profile heavily weighted in software and AI hardware. Down recently due to sector-wide correction.',
        holdings: [
            { ticker: 'NVDA', companyName: 'NVIDIA Corporation', sharesOwned: 15, averageBuyPrice: 130.00, currentPrice: 115.50, sector: 'Technology' },
            { ticker: 'MSFT', companyName: 'Microsoft Corp', sharesOwned: 8, averageBuyPrice: 420.00, currentPrice: 410.00, sector: 'Technology' },
            { ticker: 'AAPL', companyName: 'Apple Inc.', sharesOwned: 12, averageBuyPrice: 210.00, currentPrice: 225.00, sector: 'Technology' },
            { ticker: 'TSLA', companyName: 'Tesla, Inc.', sharesOwned: 10, averageBuyPrice: 240.00, currentPrice: 198.00, sector: 'Automotive' }
        ]
    },
    {
        id: 'dividend-income',
        name: 'Conservative Dividend Income ',
        description: 'A low-volatility profile focused on steady cash flow and defensive consumer sectors. Modest positive gains.',
        holdings: [
            { ticker: 'JNJ', companyName: 'JOhnson & Johnson', sharesOwned: 25, averageBuyPrice: 155.00, currentPrice: 162.00, sector: 'Healthcare' },
            { ticker: 'PG', companyName: 'Procter & Gamble Co.', sharesOwned: 30, averageBuyPrice: 160.00, currentPrice: 168.50, sector: 'Consumer Staples' },
            { ticker: 'XOM', companyName: 'Exxon Mobil Corp.', sharesOwned: 20, averageBuyPrice: 110.00, currentPrice: 114.00, sector: 'Energy' },
            { ticker: 'O', companyName: 'Reality Income Corp.', sharesOwned: 50, averageBuyPrice: 52.00, currentPrice: 55.20, sector: 'Real Estate' }
        ]
    }
];

export const SAMPLE_QUESTIONS = [
  'Summarise my portfolio risk exposure and asset concentration.',
  'Which holdings are hurting my current PnL the most, and what is the market outlook for them?',
  'Suggest a defensive rebalancing strategy based on my current sector weights.'
];