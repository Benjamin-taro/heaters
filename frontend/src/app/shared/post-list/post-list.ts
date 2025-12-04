import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Post } from '../../core/post';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.scss',
})
export class PostListComponent {
  @Input() title: string = 'Listing';
  @Input() posts: Post[] | null = null;
}
