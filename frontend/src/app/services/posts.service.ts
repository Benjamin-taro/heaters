import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PostPayload, PostRecord } from '../shared/constants';

export interface PaginatedPosts {
  data: PostRecord[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly loadingSignal = signal(false);
  loading = computed(() => this.loadingSignal());

  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 10, search = ''): Observable<PaginatedPosts> {
    this.loadingSignal.set(true);
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) {
      params = params.set('search', search);
    }
    return this.http
      .get<PaginatedPosts>(`${environment.apiBaseUrl}/posts`, { params })
      .pipe(finalize(() => this.loadingSignal.set(false)));
  }

  get(id: string): Observable<PostRecord> {
    return this.http.get<PostRecord>(`${environment.apiBaseUrl}/posts/${id}`);
  }

  create(payload: PostPayload): Observable<PostRecord> {
    this.loadingSignal.set(true);
    return this.http
      .post<PostRecord>(`${environment.apiBaseUrl}/posts`, payload)
      .pipe(finalize(() => this.loadingSignal.set(false)));
  }

  update(id: string, payload: Partial<PostPayload>): Observable<PostRecord> {
    this.loadingSignal.set(true);
    return this.http
      .patch<PostRecord>(`${environment.apiBaseUrl}/posts/${id}`, payload)
      .pipe(finalize(() => this.loadingSignal.set(false)));
  }

  relatedByCity(city: string, excludeId?: string): Observable<PostRecord[]> {
    const params = new HttpParams().set('page', 1).set('limit', 12).set('search', city || '');
    return this.http
      .get<PaginatedPosts>(`${environment.apiBaseUrl}/posts`, { params })
      .pipe(
        map((response) =>
          response.data.filter((post) => (excludeId ? post.id !== excludeId : true)).slice(0, 4)
        )
      );
  }
}
