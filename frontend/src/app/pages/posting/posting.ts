import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PostService, Post } from '../../core/post';
import { AuthService } from '../../core/auth';


@Component({
  selector: 'app-posting-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './posting.html',
  styleUrl: './posting.scss',
})
export class Posting {
  loading = false;
  currentUserId: string | null = null;
  form!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
  ) {
      this.form = this.fb.group({
      type: ['buy-sell', Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
    });
    this.authService.user$.subscribe(user => {
      this.currentUserId = user?.uid ?? null;
    });
  }

  async onSubmit() {
    if (this.form.invalid || !this.currentUserId) {
      return;
    }

    this.loading = true;
    try {
      await this.postService.createPost({
        type: this.form.value.type!,
        title: this.form.value.title!,
        body: this.form.value.body!,
        userId: this.currentUserId,
      });
      this.form.reset();
    } finally {
      this.loading = false;
    }
  }
}

export type PostType = 'buy-sell' | 'event' | 'article';

export interface PostingData {
  id?: string;
  type: PostType;
  title: string;
  content: string;
  location: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;

  // Buy & Sell
  buySellIntent?: 'buy' | 'sell';
  price?: number;           
  priceCurrency?: 'GBP' | 'JPY'; 

  // Event
  eventDate?: number;
  eventLocation?: string;
  maxParticipants?: number;

  // Article
  articleCategory?: string;
}