import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Listings } from './pages/listings/listings';
import { Posting } from './pages/posting/posting'; 
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { MyPage } from './pages/mypage/mypage';  
import { PostDetail } from './pages/post-detail/post-detail';
import { PostEdit } from './pages/post-edit/post-edit';
import { SetupProfile } from './pages/setup-profile/setup-profile';
import { AuthCallback } from './pages/auth-callback/auth-callback';
import { CheckEmail } from './pages/check-email/check-email';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { UpdatePassword } from './pages/update-password/update-password';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { TermsOfService } from './pages/terms-of-service/terms-of-service';
import { About } from './pages/about/about';

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

  // 投稿編集（投稿者のみ）
  { path: 'posts/:id/edit', component: PostEdit },

  // 新規投稿
  { path: 'posting', component: Posting },

  // ログイン
  { path: 'login', component: Login },

  // 新規登録
  { path: 'signup', component: Signup },

  // プロフィール設定（初回ログイン時）
  { path: 'setup-profile', component: SetupProfile },

  // マイページ
  { path: 'mypage', component: MyPage },

  // OAuth コールバック
  { path: 'auth/callback', component: AuthCallback },

  // メール確認案内
  { path: 'check-email', component: CheckEmail },

  // パスワード再設定（忘れた方）
  { path: 'forgot-password', component: ForgotPassword },

  // パスワード変更（再設定メールのリンク先 or マイページから）
  { path: 'update-password', component: UpdatePassword },

  // プライバシーポリシー
  { path: 'privacy-policy', component: PrivacyPolicy },

  // 利用規約
  { path: 'terms-of-service', component: TermsOfService },

  // HEATER'sについて
  { path: 'about', component: About },

  // 404
  { path: '**', redirectTo: 'home' },
];
