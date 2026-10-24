import mongoose from 'mongoose';

interface IHolding {
 symbol: string;
 shares: number;
 avgPrice: number;
}

export interface IPortfolio extends Document {
    userId: mongoose.Types.ObjectId;
    holdings: IHolding[];
    updatedAt: Date;
}

const holdingSchema = new mongoose.Schema<IHolding>({
    symbol: { type: String, required: true }, //e.g., AAPL, TSLA
    shares: { type: Number, required: true },
    avgPrice: { type: Number, required: true }
});

const portfolioSchema = new mongoose.Schema<IPortfolio>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    holdings: [holdingSchema],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPortfolio>('Portfolio', portfolioSchema);