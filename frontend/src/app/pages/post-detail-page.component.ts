import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostsService } from '../services/posts.service';
import { PostRecord } from '../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, tap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-post-detail-page',
  imports: [CommonModule, RouterLink],
  template: `
    <ng-container *ngIf="post(); else loading">
      <article class="card detail">
        <header>
          <h1>{{ post()?.title || '(無題)' }}</h1>
          <div class="meta">
            {{ post()?.category || '未分類' }} ・ {{ post()?.city || 'スコットランド' }} ・ {{ post()?.location || '' }}
          </div>
          <div class="price">{{ formatPrice(post()?.price, post()?.price_unit) }}</div>
        </header>
        <section class="body" [innerHTML]="post()?.description || '(本文なし)'"> </section>
        <section class="contact" *ngIf="hasContact">
          <h2>連絡先</h2>
          <ul>
            <li *ngIf="post()?.contact_name">氏名: {{ post()?.contact_name }}</li>
            <li *ngIf="post()?.contact_email">メール: {{ post()?.contact_email }}</li>
            <li *ngIf="post()?.contact_phone">電話: {{ post()?.contact_phone }}</li>
          </ul>
        </section>
      </article>
      <section class="related" *ngIf="relatedPosts().length">
        <h2>近隣エリアの投稿</h2>
        <div class="list-grid">
          <article class="card post-card" *ngFor="let item of relatedPosts()">
            <h3><a [routerLink]="['/posts', item.id]">{{ item.title || '(無題)' }}</a></h3>
            <div class="meta">{{ item.category || '未分類' }} ・ {{ item.city || 'スコットランド' }}</div>
            <div class="price">{{ formatPrice(item.price, item.price_unit) }}</div>
            <p class="excerpt">{{ stripHtml(item.description) }}</p>
          </article>
        </div>
      </section>
    </ng-container>
    <ng-template #loading>
      <div class="card alert">投稿を読み込んでいます...</div>
    </ng-template>
  `,
  styles: [
    `
      .detail header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .detail h1 {
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        margin: 0;
      }
      .detail .meta {
        color: #64748b;
      }
      .detail .price {
        font-size: 1.25rem;
        color: #4f46e5;
        font-weight: 600;
      }
      .body {
        font-size: 1rem;
        line-height: 1.7;
        color: #1f2937;
      }
      .contact {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }
      .related {
        margin-top: 2.5rem;
      }
    `,
  ],
})
export class PostDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly postsService = inject(PostsService);
  private readonly postSignal = signal<PostRecord | null>(null);
  readonly post = computed(() => this.postSignal());
  readonly relatedPosts = signal<PostRecord[]>([]);

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(),
        tap((params) => {
          if (!params.get('id')) {
            this.postSignal.set(null);
          }
        }),
        map((params) => params.get('id')),
        filter((id): id is string => Boolean(id)),
        switchMap((id) => this.postsService.get(id))
      )
      .subscribe((record) => {
        this.postSignal.set(record);
        this.loadRelated(record);
      });
  }

  get hasContact(): boolean {
    const value = this.post();
    return !!(value && (value.contact_name || value.contact_email || value.contact_phone));
  }

  private loadRelated(post: PostRecord): void {
    this.postsService
      .relatedByCity(post.city ?? '', post.id)
      .pipe(takeUntilDestroyed())
      .subscribe((related) => this.relatedPosts.set(related));
  }

  formatPrice(price?: number | null, unit?: string | null): string {
    if (price == null) return '';
    const formatted = new Intl.NumberFormat('en-UK').format(price);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  stripHtml(value?: string | null): string {
    if (!value) return '';
    return value.replace(/<[^>]+>/g, '').slice(0, 160);
  }
}
