import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PostDetailView } from '../../shared/post-detail-view/post-detail-view';

import { Post } from '../../core/post';
import { PostSupabase } from '../../core/post/post-supabase';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PostDetailView],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private postSupabase = inject(PostSupabase);

  post$: Observable<Post | undefined> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      if (!id) throw new Error('Post id is missing');
      return this.postSupabase.getPost(id);
    })
  );
}
