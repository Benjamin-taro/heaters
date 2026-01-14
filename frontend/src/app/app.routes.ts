import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Listings } from './pages/listings/listings';
import { Posting } from './pages/posting/posting'; 
import { Login } from './pages/login/login';
import { MyPage } from './pages/mypage/mypage';  
import { PostDetail } from './pages/post-detail/post-detail';
import { SetupProfile } from './pages/setup-profile/setup-profile';
import { AuthCallback } from './pages/auth-callback/auth-callback';
import { CheckEmail } from './pages/check-email/check-email';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ホーム
  { path: 'home', component: Home },

  // 投稿一覧
  { path: 'listing', component: Listings },

  // 種類別一覧 (buy-sell, event, article)
  { path: 'listing/type/:type', component: Listings },

  // 投稿詳細
  { path: 'posts/:id', component: PostDetail },

  // 新規投稿
  { path: 'posting', component: Posting },

  // ログイン
  { path: 'login', component: Login },

  // プロフィール設定（初回ログイン時）
  { path: 'setup-profile', component: SetupProfile },

  // マイページ
  { path: 'mypage', component: MyPage },

  // OAuth コールバック
  { path: 'auth/callback', component: AuthCallback },

  // メール確認案内
  { path: 'check-email', component: CheckEmail },

  // 404
  { path: '**', redirectTo: 'home' },
];
