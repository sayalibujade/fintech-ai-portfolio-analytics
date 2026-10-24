import router from './auth';

describe('Auth Routes', () => {
    it('should map correct auth controller actions onto post routes', () => {
        const routes = router.stack
            .filter((layer) => layer.route !== undefined)
            .map((layer) => {
                const route = layer.route as any;
                return {
                    path: route.path,
                    method: Object.keys(route.methods)
                }
            });
        expect(routes).toContainEqual({ path: '/signup', method: ['post'] });
        expect(routes).toContainEqual({ path: '/login', method: ['post'] });
    });
});