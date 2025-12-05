import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { PostService, Post } from '../../core/post';
import { PostListComponent } from '../../shared/post-list/post-list';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  latestPosts$!: Observable<Post[]>;

  constructor(private postService: PostService) {
    this.latestPosts$ = this.postService.getPostLatests(5);
  }
}
