import { appConfig } from './app.config';

describe('AppConfig Configuration Suite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it ('should export a valid, defined ApplicationConfig object structure', () => {
        expect(appConfig).toBeDefined();
        expect(appConfig.providers).toBeDefined();
        expect(Array.isArray(appConfig.providers)).toBe(true);
    });

    it ('should register the essential routing client infrastructure modules with structural configs', () => {
        const hasRouteFeatures = appConfig.providers.some((p: any) => {
        return typeof p === 'object' && p !== null;
        });
        
        expect(hasRouteFeatures).toBeTruthy();
        expect(appConfig.providers.length).toBeGreaterThanOrEqual(2);
    });
});