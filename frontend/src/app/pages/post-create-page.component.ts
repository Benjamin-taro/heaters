import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CATEGORIES, CITIES, UNITS } from '../shared/constants';
import { PostsService } from '../services/posts.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-post-create-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card form-card">
      <h1>新規投稿</h1>
      <p>カテゴリ、エリア、本文を入力し、「投稿を保存」を押してください。</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <div class="form-field">
            <label>タイトル</label>
            <input type="text" formControlName="title" placeholder="例: Glasgow シェアハウス" />
          </div>
          <div class="form-field">
            <label>カテゴリ</label>
            <select formControlName="category" required>
              <option value="" disabled>選択してください</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>都市</label>
            <select formControlName="city">
              <option value="">指定なし</option>
              <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>住所・詳細な場所</label>
            <input type="text" formControlName="location" placeholder="例: West End, Hillhead" />
          </div>
          <div class="form-field">
            <label>本文</label>
            <textarea formControlName="description" rows="6" placeholder="詳細な説明を入力してください"></textarea>
          </div>
          <div class="form-field">
            <label>価格</label>
            <div class="price-inputs">
              <input type="number" formControlName="price" placeholder="例: 450" min="0" />
              <select formControlName="price_unit">
                <option value="">単位なし</option>
                <option *ngFor="let unit of units" [value]="unit">{{ unit }}</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label>タグ (カンマ区切り)</label>
            <input type="text" formControlName="tags" placeholder="例: 家具付き, 駅近" />
          </div>
          <div class="form-field">
            <label>画像URL (カンマ区切り)</label>
            <input type="text" formControlName="images" placeholder="https://example.com/a.jpg, ..." />
          </div>
          <div class="form-field">
            <label>掲載期限</label>
            <input type="date" formControlName="expires_at" />
          </div>
          <div class="form-field inline">
            <label>
              <input type="checkbox" formControlName="published" /> 公開する
            </label>
          </div>
          <div class="form-field">
            <label>連絡先 氏名</label>
            <input type="text" formControlName="contact_name" />
          </div>
          <div class="form-field">
            <label>連絡先 メール</label>
            <input type="email" formControlName="contact_email" />
          </div>
          <div class="form-field">
            <label>連絡先 電話</label>
            <input type="text" formControlName="contact_phone" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn" type="submit" [disabled]="form.invalid || postsService.loading()">
            {{ postsService.loading() ? '保存中...' : '投稿を保存' }}
          </button>
        </div>
        <p class="status" *ngIf="statusMessage()">{{ statusMessage() }}</p>
      </form>
    </section>
  `,
  styles: [
    `
      .form-card h1 {
        margin-top: 0;
        font-size: 1.6rem;
      }
      .form-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      textarea {
        resize: vertical;
      }
      .price-inputs {
        display: flex;
        gap: 0.75rem;
      }
      .price-inputs input {
        flex: 1;
      }
      .price-inputs select {
        width: 160px;
      }
      .inline {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
      .form-actions {
        margin-top: 1.5rem;
      }
      .btn.secondary {
        background: #334155;
      }
      .status {
        margin-top: 1rem;
        color: #0f172a;
      }
    `,
  ],
})
export class PostCreatePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly postsService = inject(PostsService);
  protected readonly categories = CATEGORIES;
  protected readonly cities = CITIES;
  protected readonly units = UNITS;

  readonly statusMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['', Validators.required],
    city: [''],
    location: [''],
    description: ['', Validators.required],
    price: [null as number | null],
    price_unit: [''],
    tags: [''],
    images: [''],
    expires_at: [''],
    published: [true],
    contact_name: [''],
    contact_email: ['', Validators.email],
    contact_phone: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.statusMessage.set('入力内容を確認してください。必須項目が不足しています。');
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      ...value,
      price: value.price === null || value.price === undefined ? null : Number(value.price),
      tags: value.tags
        ? value.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      images: value.images
        ? value.images.split(',').map((img) => img.trim()).filter(Boolean)
        : [],
      expires_at: value.expires_at ? new Date(value.expires_at).toISOString() : null,
    };

    this.postsService
      .create(payload)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (record) => {
          this.statusMessage.set('保存しました。投稿ページに移動します...');
          this.router.navigate(['/posts', record.id]);
        },
        error: () => {
          this.statusMessage.set('保存に失敗しました。時間をおいて再度お試しください。');
        },
      });
  }
}
