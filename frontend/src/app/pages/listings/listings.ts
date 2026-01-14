import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, switchMap, combineLatest, map } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Post, PostType } from '../../core/post';
import { PostListComponent } from '../../shared/post-list/post-list';
import { PostSupabase } from '../../core/post/post-supabase';
import { AuthSupabase } from '../../core/auth/auth-supabase';

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
    private route: ActivatedRoute,
    private auth: AuthSupabase,
    private postSupabase: PostSupabase,
  ) {
    this.vm$ = combineLatest([
      this.route.paramMap,
      this.route.queryParamMap,
      this.auth.user$, // AppUser | null（uid）
    ]).pipe(
      switchMap(([params, queryParams, user]) => {
        const rawType = params.get('type');
        const isAll = rawType === 'all';

        const type: PostType | null = isAll
          ? null
          : (rawType as PostType | null);

        const mineQuery = queryParams.get('mine') === 'true';
        const isMine = mineQuery && !!user;

        const typeLabel = this.getTypeLabel(type);

        const title = (() => {
          if (isAll) return isMine ? '自分の全ての投稿一覧' : '全ての投稿一覧';
          if (isMine) return type ? `自分の ${typeLabel} の投稿一覧` : '自分の投稿一覧';
          return type ? `${typeLabel} の投稿一覧` : '全ての投稿';
        })();

        const posts$ =
          isMine && user
            ? this.postSupabase.getPostsByUser(user.uid, type ?? undefined)
            : this.postSupabase.getPosts(type ?? undefined);

        return posts$.pipe(map(posts => ({ title, posts })));
      }),
    );
  }

  private getTypeLabel(type: PostType | null): string {
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
