import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./admin/login/login.component').then((x) => x.LoginComponent),
        title: 'LogIn'
    },
    {
        path: '',
        loadComponent: () => import('./admin/components/home/home.component').then((x) => x.HomeComponent),
        title: 'Home',
        canActivate: [authGuard]
    },
];
