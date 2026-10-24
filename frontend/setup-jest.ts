import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Bootstraps Angular 22's native zoneless testing platform infrastructure 
setupZonelessTestEnv();

// Browser API fallbacks for JSDOM terminal emulation environments
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', { value: 'html' });
Object.defineProperty(window, 'matchMedia', {
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  })
});