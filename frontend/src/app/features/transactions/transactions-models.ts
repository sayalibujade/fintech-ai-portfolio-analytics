export interface Transaction {
    _id?: string;
    userId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
    date: string;
}

export interface TransactionsState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
}