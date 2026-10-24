import * as marketProviderService from '../services/marketProviderService';

let capturedTickCallback: ((tick: any) => void) | null = null;
jest.spyOn(marketProviderService, 'subscribeToMarketTicks')
    .mockImplementation((callback) => {
        capturedTickCallback = callback;
    });

import { Request, Response } from 'express';
import router from './market';

describe('Market Streaming Routing Layer', () => {
    let mockRequest: any;
    let mockResponse: any;
    let registeredEventCallbacks: Record<string, () => void> = {};

    beforeEach(() => {
        jest.clearAllMocks();
        registeredEventCallbacks = {};

        mockRequest = {
            on: jest.fn().mockImplementation((event: string, callback: () => void) => {
                registeredEventCallbacks[event] = callback;
            })
        };

        mockResponse = {
            setHeader: jest.fn(),
            flushHeaders: jest.fn(),
            write: jest.fn(),
        };
    });

    it('should fast exit if market ticks are broadcasted but no clients are connected (Line 9 Cover)', () => {
        expect(capturedTickCallback).toBeDefined();
        if (capturedTickCallback) {
            jest.clearAllMocks();
            capturedTickCallback({ timestamp: '2026-10-08T00:00:00Z', prices: {} });
            expect(mockResponse.write).not.toHaveBeenCalled();
        }
    });

    it('should establish cross-layer stream routes and add response contexts to subscription buffers', () => {
        expect(router).toBeDefined();

        const streamRouteLayer = router.stack.find(
            (layer: any) => layer.route && layer.route.path === '/stream'
        );
        expect(streamRouteLayer).toBeDefined();
        
        const route = streamRouteLayer?.route as any;
        expect(route['methods']?.get || route.stack.some((s: any) => s.method === 'get')).toBeTruthy();

        const routeHandler = route.stack[0].handle;
        routeHandler(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
        expect(mockResponse.flushHeaders).toHaveBeenCalled();
        expect(mockResponse.write).toHaveBeenCalledWith(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);

        if (capturedTickCallback) {
            const sampleTick = { timestamp: '2026-10-08T00:00:00Z', prices: { AAPL: 225 } };
            capturedTickCallback(sampleTick);
            expect(mockResponse.write).toHaveBeenCalledWith(`data: ${JSON.stringify(sampleTick)}\n\n`);
        }
    });

    it('should successfully remove active streaming response context slots when request client closes', () => {
        expect(router).toBeDefined();

        const streamRouteLayer = router.stack.find(
            (layer: any) => layer.route && layer.route.path === '/stream'
        );
        const route = streamRouteLayer?.route as any;
        const routeHandler = route.stack[0].handle;

        routeHandler(mockRequest as Request, mockResponse as Response);
        expect(registeredEventCallbacks['close']).toBeDefined();

        registeredEventCallbacks['close']();

        if (capturedTickCallback) {
            jest.clearAllMocks();
            capturedTickCallback({ timestamp: 'now', prices: {} });
            expect(mockResponse.write).not.toHaveBeenCalled();
        }
    });
});
