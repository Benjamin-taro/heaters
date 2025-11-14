import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute, Params } from '@angular/router';
import { PostsService } from '../services/posts.service';
import { CATEGORIES, CITIES, PostRecord } from '../shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'app-posts-list-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="card list-filter">
      <form [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
        <div class="filter-row">
          <label>
            キーワード
            <input type="text" formControlName="search" placeholder="例: Glasgow, シェア" />
          </label>
          <label>
            カテゴリ
            <select formControlName="category">
              <option value="">すべて</option>
              <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
            </select>
          </label>
          <label>
            エリア
            <select formControlName="city">
              <option value="">すべて</option>
              <option *ngFor="let city of cities" [value]="city">{{ city }}</option>
            </select>
          </label>
        </div>
        <div class="filter-actions">
          <button class="btn" type="submit">絞り込む</button>
          <button class="btn secondary" type="button" (click)="clearFilters()">リセット</button>
        </div>
      </form>
    </section>

    <section class="list-summary">
      <h2>{{ pageTitle }}</h2>
      <p>
        {{ totalCount }}件中 {{ filteredPosts().length }}件表示
        <span *ngIf="postsService.loading()" class="badge">読込中...</span>
      </p>
    </section>

    <section class="list-grid">
      <ng-container *ngIf="filteredPosts().length; else emptyState">
        <article class="card post-card" *ngFor="let post of filteredPosts()">
          <header>
            <h3>
              <a [routerLink]="['/posts', post.id]">{{ post.title || '(無題)' }}</a>
            </h3>
            <div class="meta">{{ post.category || '未分類' }} ・ {{ post.city || 'スコットランド' }} ・ {{ post.location || '' }}</div>
          </header>
          <div class="price">{{ formatPrice(post.price, post.price_unit) }}</div>
          <p class="excerpt">{{ stripHtml(post.description) }}</p>
          <footer class="meta">{{ relativeTime(post.updated_at || post.created_at) }}</footer>
        </article>
      </ng-container>
      <ng-template #emptyState>
        <div class="card alert">該当する投稿が見つかりませんでした。</div>
      </ng-template>
    </section>

    <section class="pager" *ngIf="totalPages > 1">
      <button class="btn secondary" [disabled]="currentPage <= 1" (click)="goToPage(currentPage - 1)">前へ</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button class="btn" [disabled]="currentPage >= totalPages" (click)="goToPage(currentPage + 1)">次へ</button>
    </section>
  `,
  styles: [
    `
      .list-filter form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 600;
        font-size: 0.9rem;
        color: #0f172a;
      }
      .filter-actions {
        display: flex;
        gap: 0.75rem;
      }
      .btn.secondary {
        background: #334155;
      }
      .list-summary {
        margin: 2rem 0 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .pager {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }
    `,
  ],
})
export class PostsListPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly posts = signal<PostRecord[]>([]);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly postsService = inject(PostsService);

  readonly categories = CATEGORIES;
  readonly cities = CITIES;
  readonly filtersForm = this.fb.nonNullable.group({
    search: '',
    category: '',
    city: '',
  });

  totalCount = 0;
  currentPage = 1;
  readonly filteredPosts = computed(() => {
    const category = this.filtersForm.value.category;
    const city = this.filtersForm.value.city;
    return this.posts()
      .filter((post) => (category ? post.category === category : true))
      .filter((post) => (city ? post.city === city : true));
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / 10));
  }

  get pageTitle(): string {
    const category = this.filtersForm.value.category;
    return category ? `${category} の投稿` : '投稿一覧';
  }

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        this.filtersForm.patchValue(
          {
            search: params.get('search') ?? '',
            category: params.get('category') ?? '',
            city: params.get('city') ?? '',
          },
          { emitEvent: false }
        );
        const page = Number(params.get('page') ?? '1') || 1;
        this.loadPosts(page);
      });
  }

  applyFilters(): void {
    const query: Params = {};
    const { search, category, city } = this.filtersForm.value;
    if (search) query['search'] = search;
    if (category) query['category'] = category;
    if (city) query['city'] = city;
    query['page'] = '1';
    this.router.navigate([], { relativeTo: this.route, queryParams: query });
  }

  clearFilters(): void {
    this.filtersForm.setValue({ search: '', category: '', city: '' });
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  goToPage(page: number): void {
    const params = { ...this.route.snapshot.queryParams, page };
    this.router.navigate([], { relativeTo: this.route, queryParams: params });
  }

  private loadPosts(page = 1): void {
    this.currentPage = page;
    const { search } = this.filtersForm.value;
    this.postsService
      .list(page, 10, search ?? '')
      .pipe(takeUntilDestroyed())
      .subscribe((response) => {
        this.posts.set(response.data);
        this.totalCount = response.total;
      });
  }

  formatPrice(price?: number | null, unit?: string | null): string {
    if (price == null) return '';
    const formatted = new Intl.NumberFormat('en-UK').format(price);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  relativeTime(ms?: number): string {
    if (!ms) return '';
    const diff = Date.now() - ms;
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}秒前`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}分前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}時間前`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}日前`;
    const mon = Math.floor(day / 30);
    if (mon < 12) return `${mon}ヶ月前`;
    const yr = Math.floor(mon / 12);
    return `${yr}年前`;
  }

  stripHtml(value?: string | null): string {
    if (!value) return '';
    return value.replace(/<[^>]+>/g, '').slice(0, 160);
  }
}
