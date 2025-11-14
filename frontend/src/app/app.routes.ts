import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { PostsListPageComponent } from './pages/posts-list-page.component';
import { PostDetailPageComponent } from './pages/post-detail-page.component';
import { PostCreatePageComponent } from './pages/post-create-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'HEATERsへようこそ' },
  { path: 'posts', component: PostsListPageComponent, title: '投稿一覧' },
  { path: 'posts/new', component: PostCreatePageComponent, title: '新規投稿' },
  { path: 'posts/:id', component: PostDetailPageComponent, title: '投稿詳細' },
  { path: '**', redirectTo: '' }
];

