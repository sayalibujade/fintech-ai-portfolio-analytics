import { TestBed } from '@angular/core/testing';
import { MarketStreamService } from './market-stream-service';
import { environment } from '../../../../environments/environment';

class MockEventSource {
  close = jest.fn();
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  constructor(public url: string) {
    (global as any).lastMockEventSourceInstance = this;
  }
}

describe('MarketStreamService', () => {
  let service: MarketStreamService;
  let nativeEventSourceBackup: any;

  beforeEach(() => {
    TestBed.resetTestingModule();

    nativeEventSourceBackup = (global as any).EventSource;
    (global as any).EventSource = MockEventSource;
    (global as any).lastMockEventSourceInstance = null;

    TestBed.configureTestingModule({
      providers: [MarketStreamService]
    });
    service = TestBed.inject(MarketStreamService);
  });

  afterEach(() => {
    (global as any).EventSource = nativeEventSourceBackup;
    jest.restoreAllMocks();
  });

  it('should initialize with an unpopulated default state', () => {
    expect(service).toBeTruthy();
    expect(service.latestTick()).toBeNull();
  });

  it('should spin up a fresh stream proxy endpoint and bind notification listener hooks', () => {
    service.connectMarketStream();

    const mockInstance = (global as any).lastMockEventSourceInstance;
  expect(mockInstance).toBeTruthy();
    expect(mockInstance.url).toBe(`${environment.apiUrl}/market/stream`);
    expect(typeof mockInstance.onmessage).toBe('function');
    expect(typeof mockInstance.onerror).toBe('function');
  });

  it('should immediately exit the initialization sequence if an active network connection handle exists', () => {
    service.connectMarketStream();
    const originalInstance = (global as any).lastMockEventSourceInstance;

    service.connectMarketStream();
    const secondaryInstance = (global as any).lastMockEventSourceInstance;

    expect(originalInstance).toBe(secondaryInstance);
    });

  it('should ignore incoming control handshake events matching connected initialization status strings', () => {
    service.connectMarketStream();
    const mockInstance = (global as any).lastMockEventSourceInstance;

    mockInstance.onmessage({ data: JSON.stringify({ status: 'connected' }) });

    expect(service.latestTick()).toBeNull();
  });

  it('should update the state signal when valid streaming price data ticks arrive', () => {
    service.connectMarketStream();
    const mockInstance = (global as any).lastMockEventSourceInstance;
    
    const mockPayload = {
      timestamp: '2026-10-12T23:00:00.000Z',
      prices: { AAPL: 180, NVDA: 500 }
    };

    mockInstance.onmessage({ data: JSON.stringify(mockPayload) });

    expect(service.latestTick()).toEqual(mockPayload);
  });

  it('should forward data stream disconnect details to the logging output panel when onerror triggers', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    service.connectMarketStream();
    const mockInstance = (global as any).lastMockEventSourceInstance;

    const dummyError = new Error('Network breakdown drop event');
    mockInstance.onerror(dummyError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Market Provider SSE disconnected. Reconnecting automatically...',
      dummyError
    );
  });

  it('should close the network connection and clear internal variable tracking', () => {
    service.connectMarketStream();
    const mockInstance = (global as any).lastMockEventSourceInstance;

    service.disconnectMarketStream();

    expect(mockInstance.close).toHaveBeenCalled();
    expect((service as any).eventSource).toBeNull();
  });

  it('should bypass closing sequence steps if disconnect is invoked while the connection is offline', () => {
    service.disconnectMarketStream();
    expect((service as any).eventSource).toBeNull();
  });
});