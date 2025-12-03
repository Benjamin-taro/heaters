import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { PostService, Post } from '../../core/post';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);

  post$: Observable<Post | undefined> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      if (!id) {
        throw new Error('Post id is missing');
      }
      return this.postService.getPost(id);
    })
  );
}
