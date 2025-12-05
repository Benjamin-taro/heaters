import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, switchMap, combineLatest } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post, PostType } from '../../core/post';
import { AuthService } from '../../core/auth';
import { PostListComponent } from '../../shared/post-list/post-list';

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListComponent],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
})
export class Listings {
  posts$!: Observable<Post[]>;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {
    this.posts$ = combineLatest([
      this.route.paramMap,       // /listing/type/:type 用
      this.route.queryParamMap,  // ?mine=true 用
      this.auth.user$,           // ログインユーザー
    ]).pipe(
      switchMap(([params, queryParams, user]) => {
        const type = params.get('type') as PostType | null;
        const mine = queryParams.get('mine'); // 'true' or null

        // /listing?mine=true かつ ログイン済み → 自分の投稿だけ
        if (mine === 'true' && user) {
          return this.postService.getPostsByUser(user.uid, type ?? undefined);
        }

        // それ以外 → 全体（type 指定があれば type 絞り込み）
        return this.postService.getPosts(type ?? undefined);
      }),
    );
  }
}
