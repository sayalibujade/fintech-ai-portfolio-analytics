import router from './transactions';

describe('Transactions Routing Layer', () => {
    it('should register structural get and post methods onto the base route definition', () => {
        expect(router).toBeDefined();

        const rootLayers = router.stack.filter(
            (layer: any) => layer.route && layer.route.path === '/'
        );

        expect(rootLayers.length).toBeGreaterThanOrEqual(2);

        const registeredVerbs = rootLayers.flatMap((layer: any) => {
            const route = layer.route as any;
            return Object.keys(route.methods);
        });

        expect(registeredVerbs).toContain('get');
        expect(registeredVerbs).toContain('post');
    });
});
