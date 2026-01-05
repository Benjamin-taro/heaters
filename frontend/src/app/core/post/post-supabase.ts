// src/app/core/post/post-supabase.ts
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from '../supabase/supabase.client';
import { Post, PostType } from '../post';

@Injectable({ providedIn: 'root' })
export class PostSupabase {
  getPosts(type?: PostType): Observable<Post[]> {
    console.log('[PostSupabase] getPosts called. type =', type);

    let q = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (type) {
      console.log('[PostSupabase] filtering by type:', type);
      q = q.eq('type', type);
    }

    return from(
      q.then(({ data, error }) => {
        console.log('[PostSupabase] raw response:', { data, error });

        if (error) {
          console.error('[PostSupabase] SUPABASE ERROR:', error);
          throw error;
        }

        const mapped = (data ?? []).map((row: any) => ({
          id: row.id,
          title: row.title,
          body: row.body,
          type: row.type,
          location: row.location ?? undefined,

          // Firestore互換
          createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
          userId: row.user_id,
          username: row.username ?? 'unknown',
          articleCategory: row.article_category ?? undefined,

          buySellIntent: row.buy_sell_intent ?? undefined,
          price: row.price ?? undefined,
          priceCurrency: row.price_currency ?? undefined,

          eventDate: row.event_date
            ? Date.parse(row.event_date)
            : undefined,
          maxParticipants: row.max_participants ?? undefined,
        })) as Post[];

        console.log('[PostSupabase] mapped posts:', mapped);

        return mapped;
      })
    );
  }
}
