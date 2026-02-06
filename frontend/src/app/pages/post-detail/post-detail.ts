import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PostDetailView } from '../../shared/post-detail-view/post-detail-view';

import { Post } from '../../core/post';
import { PostSupabase } from '../../core/post/post-supabase';
import { AuthSupabase } from '../../core/auth/auth-supabase';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PostDetailView],
  templateUrl: './post-detail.html',
  styleUrls: ['./post-detail.scss'],
})
export class PostDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postSupabase = inject(PostSupabase);
  private auth = inject(AuthSupabase);

  currentUserId: string | null = null;
  /** 削除確認ポップアップで表示する投稿ID。null のときは非表示 */
  deleteConfirmId: string | null = null;
  deleteInProgress = false;
  post$: Observable<Post | undefined> = this.route.paramMap.pipe(
    switchMap((params) => {
      const id = params.get('id');
      if (!id) throw new Error('Post id is missing');
      return this.postSupabase.getPost(id);
    })
  );

  constructor() {
    this.auth.user$.subscribe((user) => {
      this.currentUserId = user?.uid ?? null;
    });
  }

  onDeletePost(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleteConfirmId) return;
    this.deleteInProgress = true;
    try {
      await this.postSupabase.deletePost(this.deleteConfirmId);
      this.deleteConfirmId = null;
      this.router.navigate(['/listing']);
    } catch (e) {
      console.error(e);
    } finally {
      this.deleteInProgress = false;
    }
  }
}
