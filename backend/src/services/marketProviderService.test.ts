import * as marketProviderService from './marketProviderService';

describe('Market Provider Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useFakeTimers();

        marketProviderService.unsubscribeFromMarketTicks();
    });

    afterEach(() => {
        marketProviderService.unsubscribeFromMarketTicks();
        jest.useRealTimers();
    });

    describe('Data Lookup Operations', () => {
        it('should look up active asset price indices or fallback to base standard price caps', () => {
            const aaplPrice = marketProviderService.getLatestMarketPrice('AAPL');
            expect(typeof aaplPrice).toBe('number');
            expect(aaplPrice).toBe(225.00);

            const lowercaseNvdaPrice = marketProviderService.getLatestMarketPrice('nvda');
            expect(lowercaseNvdaPrice).toBe(115.50);

            const fallbackPrice = marketProviderService.getLatestMarketPrice('INVALID_TICKER-XYZ'); 
            expect(fallbackPrice).toBe(100.00);
        });
    });

    describe('Streaming Interval Operations', () => {
        it('should initialize background snapshot loop and broadcast metrics matching shapes over a callback', () => {
            const callbackMock = jest.fn();
    
            marketProviderService.subscribeToMarketTicks(callbackMock);
            jest.advanceTimersByTime(2000);
    
            expect(callbackMock).toHaveBeenCalledTimes(1);
    
            const snapshotPayload = callbackMock.mock.calls[0][0];
            expect(snapshotPayload).toHaveProperty('timestamp');
            expect(snapshotPayload).toHaveProperty('prices');
            expect(typeof snapshotPayload.timestamp).toBe('string');
            expect(typeof snapshotPayload.prices.AAPL).toBe('number');
            expect(typeof snapshotPayload.prices.NVDA).toBe('number');
        });

        it('should guard against creating duplicate active ticking interval layers', () => {
            const callbackMock = jest.fn();
    
            marketProviderService.subscribeToMarketTicks(callbackMock);
            marketProviderService.subscribeToMarketTicks(callbackMock);
            jest.advanceTimersByTime(2000);
    
            expect(callbackMock).toHaveBeenCalledTimes(1);
        });
        
        it('should tear down active timers upon running unsubscribe metrics', () => {
            const callbackMock = jest.fn();
    
            marketProviderService.subscribeToMarketTicks(callbackMock);
            jest.advanceTimersByTime(2000);
    
            expect(callbackMock).toHaveBeenCalledTimes(1);
    
            marketProviderService.unsubscribeFromMarketTicks();
            jest.advanceTimersByTime(2000);
    
            expect(callbackMock).toHaveBeenCalledTimes(1);
        });
    });
});