// src/app/shared/post-detail-view/post-detail-view.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
}
