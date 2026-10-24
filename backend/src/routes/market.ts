import { Request, Response, Router } from 'express';
import { subscribeToMarketTicks } from '../services/marketProviderService';

const router = Router();
let clients: Response[] = [];

// Initialize functional streaming pipeline once at the file module layer
subscribeToMarketTicks((tick) => {
    if (clients.length === 0) return;
    clients.forEach(client => client.write(`data: ${JSON.stringify(tick)}\n\n`));
});

router.get('/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);
    res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

export default router;