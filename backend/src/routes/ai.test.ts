jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({}))
}));

import router from './ai';

describe('AI Routing Layer', () => {
    it('should expose a post route endpoint to handle portfolio analysis demands', () => {
        expect(router).toBeDefined();

        const aiRouteLayer = router.stack.find(
            (layer: any) => layer.route && layer.route.path === '/analyze'
        );

        expect(aiRouteLayer).toBeDefined();
        const route = aiRouteLayer?.route as any;
        
        expect(route['methods']?.post || route.stack.some((s: any) => s.method === 'post')).toBeTruthy();
        expect(route.stack.length).toBe(2);
    });
});
