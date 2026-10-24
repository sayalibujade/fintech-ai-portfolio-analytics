import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import transactionsRoutes from './routes/transactions';
import aiRoutes from './routes/ai';
import marketRoutes from './routes/market';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.originalUrl);
    next();
});


//Test Route
app.get('/', (req, res) => {
    if (process.env.NODE_ENV === "development") {
        console.log("Verbose logging enabled");
    } else {
        console.log("Production mode");
    }
    res.json({ message: 'Backend running with Express v5+' });
});

//Register routes
app.use('/auth', authRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/ai', aiRoutes);
app.use('/market', marketRoutes);
app.use(errorHandler);

//ENVIRONMENT Variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tradingdb';

//MongoDB Connection
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('MongoDB Connected..');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => console.error('mongoDB Error: ', err));