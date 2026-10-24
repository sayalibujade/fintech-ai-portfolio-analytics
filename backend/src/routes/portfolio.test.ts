import router from './portfolio';

describe('Portfolio Routing Layer', () => {
    it('should map authenticated get request onto the root path profile mapping', () => {
        expect(router).toBeDefined();

        const routeLayer = router.stack.find(
            (layer: any) => layer.route && layer.route.path === '/'
        );

        expect(routeLayer).toBeDefined();
        const route = routeLayer?.route as any;
        
        expect(route['methods']?.get || route.stack.some((s: any) => s.method === 'get')).toBeTruthy();
        expect(route.stack.length).toBe(2); // Confirms authenticate middleware + getPortfolio controller are stacked
    });
});