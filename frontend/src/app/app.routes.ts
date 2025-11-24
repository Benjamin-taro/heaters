import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Listings } from './pages/listings/listings';
import { Posting } from './pages/posting/posting'; 
import { Login } from './pages/login/login';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'listings', component: Listings },
    { path: 'posting', component: Posting },
    { path: 'login', component: Login },
    { path: '**', redirectTo: '' },
];
