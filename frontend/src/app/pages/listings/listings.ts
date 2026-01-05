import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, switchMap, combineLatest, map } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post, PostType } from '../../core/post';
import { AuthService } from '../../core/auth';
import { PostListComponent } from '../../shared/post-list/post-list';
import { PostSupabase } from '../../core/post/post-supabase';

interface ListingsVm {
  title: string;
  posts: Post[];
}

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListComponent],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
})
export class Listings {
  vm$!: Observable<ListingsVm>;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private postSupabase: PostSupabase,
  ) {
    this.vm$ = combineLatest([
      this.route.paramMap,       // /listings/type/:type 用
      this.route.queryParamMap,  // ?mine=true 用
      this.auth.user$,           // ログインユーザー
    ]).pipe(
      switchMap(([params, queryParams, user]) => {
        // ① 生の文字列として受け取る
        const rawType = params.get('type'); // string | null

        // ② all フラグ
        const isAll = rawType === 'all';

        // ③ API 用の type は PostType | null にそろえる
        const type: PostType | null = isAll
          ? null
          : (rawType as PostType | null);

        const mineQuery = queryParams.get('mine') === 'true';
        const isMine = mineQuery && !!user;

        // 1) タイトル文字列を決める
        const typeLabel = this.getTypeLabel(type);

        const title = (() => {
          if (isAll) {
            // /listings/type/all のとき
            return isMine ? '自分の全ての投稿一覧' : '全ての投稿一覧';
          }

          if (isMine) {
            // 自分の投稿一覧系
            if (type) {
              return `自分の ${typeLabel} の投稿一覧`;
            }
            return '自分の投稿一覧';
          } else {
            // 全体の投稿
            if (type) {
              return `${typeLabel} の投稿一覧`;
            }
            return '全ての投稿';
          }
        })();

        // 2) どの API で投稿を取るか決める
        const posts$ =
          isMine && user
            ? this.postService.getPostsByUser(user.uid, type ?? undefined) // ここは一旦Firestoreのまま
            : this.postSupabase.getPosts(type ?? undefined);              // ここをSupabaseに

        // 3) 最終的に { title, posts } を流す
        return posts$.pipe(map(posts => ({ title, posts })));
      }),
    );
  }

  private getTypeLabel(type: PostType | null): string {
    // PostType の定義に合わせて調整してね
    switch (type) {
      case 'buy-sell':
        return 'Buy & Sell';
      case 'event':
        return 'イベント';
      case 'article':
        return 'イベント記事・コラム';
      default:
        return '投稿';
    }
  }
}
