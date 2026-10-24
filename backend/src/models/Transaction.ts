import mongoose from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    symbol: string;
    type: 'BUY' | 'SELL';
    shares: number;
    price: number;
    date: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    type: { type: String, enum: ['BUY', 'SELL'], required: true },
    shares: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

export default mongoose.model<ITransaction>('Transaction', transactionSchema);