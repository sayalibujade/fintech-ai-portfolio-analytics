import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    // 1. Root redirect configuration
    {
        path:'',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },

    // 2. Unauthenticated public boundary (Auth Layout Wrapper)
    {
        path: 'auth',
        loadComponent: () => import('./core/layout/auth-layout/auth-layout').then(m => m.AuthLayout),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
            },
            {
                path: 'signup',
                loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },

    // 3. Authenticated workspace boundary (Main Lyout Wrapper)
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
            },
            {
                path: 'portfolio',
                loadComponent: () => import('./features/portfolio/pages/portfolio-details/portfolio-details').then(m => m.PortfolioDetails)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./features/transactions/pages/transaction-list/transaction-list').then(m => m.TransactionList)
            },
            {
                path: 'ai-insights',
                loadComponent: () => import('./features/ai-insights/pages/ai-insights/ai-insights').then(m => m.AiInsights)
            },
            {
                path:'',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
        ]
    },

    // 4. Wildcard Catch-all Fallbacks
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];