import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Listings } from './pages/listings/listings';
import { Posting } from './pages/posting/posting'; 
import { Login } from './pages/login/login';
//import { MyPage } from './pages/mypage/mypage';      // 後で作る
//import { PostDetailPage } from './pages/post-detail/post-detail'; // 後で作る

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'posts', component: Listings },
    { path: 'posts/:type', component: Listings },
    { path: 'posting', component: Posting },
    { path: 'login', component: Login },
    { path: 'postdetails/:id', component: Home }, // 仮置き
    { path: 'mypage', component: Home }, // 仮置き
    { path: 'home', component: Home },
    { path: '**', redirectTo: '' },
];
