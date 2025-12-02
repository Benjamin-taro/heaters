import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post, PostType } from '../../core/post';


@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
})
export class Listings {
  posts$!: Observable<Post[]>;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
  ) {
    this.posts$ = this.route.paramMap.pipe(
      switchMap(params => {
        const type = params.get('type') as PostType | null;
        // /posts のとき type は null → 全部
        // /posts/article のとき type === 'article'
        return this.postService.getPosts(type ?? undefined);
      }),
    );
  }
}
