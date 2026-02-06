// src/app/shared/post-detail-view/post-detail-view.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../../core/post';

@Component({
  selector: 'app-post-detail-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-detail-view.html',
  styleUrl: './post-detail-view.scss',
})
export class PostDetailView {
  @Input() post: Post | null = null;
  /** 現在ログイン中のユーザーID。投稿者と一致するときのみ編集・削除を表示 */
  @Input() currentUserId: string | null = null;
  @Output() deleteRequested = new EventEmitter<string>();

  get canEdit(): boolean {
    return !!(
      this.post?.id &&
      this.post?.userId &&
      this.currentUserId &&
      this.post.userId === this.currentUserId
    );
  }
}
