import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { PostListComponent } from '../../shared/post-list/post-list';
import { PostSupabase } from '../../core/post/post-supabase';
import { PostService, Post } from '../../core/post';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PostListComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  latestPosts$!: Observable<Post[]>;

  constructor(private postSupabase: PostSupabase) {
    this.latestPosts$ = this.postSupabase.getPosts(undefined, 5);
  }
}
