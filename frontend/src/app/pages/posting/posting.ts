// src/app/pages/posting/posting.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PostService, PostType, Post } from '../../core/post';
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
      // 共通
      type: ['buy-sell' as PostType, Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
      location: [''],

      // Buy & Sell 用
      buySellIntent: [null],
      price: [null],
      priceCurrency: ['GBP'],

      // Event 用
      eventDate: [null],          // HTML は type="date" → string が入る
      maxParticipants: [null],

      // Article 用
      articleCategory: [''],
    });

    this.authService.user$.subscribe(user => {
      this.currentUserId = user?.uid ?? null;
    });
  }

  get selectedType(): PostType {
    return this.form.get('type')?.value as PostType;
  }

  async onSubmit() {
    if (this.form.invalid || !this.currentUserId) {
      return;
    }

    this.loading = true;
    try {
      const v = this.form.value;

      const payload: Omit<Post, 'id' | 'createdAt'> = {
        type: v.type as PostType,
        title: v.title!,
        body: v.body!,
        userId: this.currentUserId!,
        location: v.location || undefined,

        // Buy & Sell
        buySellIntent: v.buySellIntent || undefined,
        price: v.price != null ? Number(v.price) : undefined,
        priceCurrency: v.priceCurrency || undefined,

        // Event: date input の string を number に変換して保存
        eventDate: v.eventDate ? new Date(v.eventDate).getTime() : undefined,
        maxParticipants: v.maxParticipants != null ? Number(v.maxParticipants) : undefined,

        // Article
        articleCategory: v.articleCategory || undefined,
      };

      await this.postService.createPost(payload);

      // 初期値を再セットしつつリセット
      this.form.reset({
        type: 'buy-sell',
        priceCurrency: 'GBP',
      });
    } finally {
      this.loading = false;
    }
  }
}
