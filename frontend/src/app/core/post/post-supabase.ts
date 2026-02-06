// src/app/core/post/post-supabase.ts
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from '../supabase/supabase.client';
import { Post, PostType } from '../post';

@Injectable({ providedIn: 'root' })
export class PostSupabase {

  getPost(id: string): Observable<Post | undefined> {
    return from(
      supabase
        .from('posts')
        .select(`
          id, type, title, body, location, buy_sell_intent, price, price_currency,
          event_date, max_participants, article_category, user_id, created_at,
          contact_email, contact_instagram, contact_phone, contact_line,
          profiles:profiles ( username )
        `)
        .eq('id', id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          if (!data) return undefined;

          const row: any = data;
          const mapped: Post = {
            id: row.id,
            title: row.title,
            body: row.body,
            type: row.type,
            location: row.location ?? undefined,

            createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
            userId: row.user_id,
            username: row.profiles?.username ?? 'unknown',

            articleCategory: row.article_category ?? undefined,
            buySellIntent: row.buy_sell_intent ?? undefined,
            price: row.price ?? undefined,
            priceCurrency: row.price_currency ?? undefined,
            contactEmail: row.contact_email ?? undefined,
            contactInstagram: row.contact_instagram ?? undefined,
            contactPhone: row.contact_phone ?? undefined,
            contactLine: row.contact_line ?? undefined,

            eventDate: row.event_date ? Date.parse(row.event_date) : undefined,
            maxParticipants: row.max_participants ?? undefined,
          };

          return mapped;
        })
    );
  }

  getPosts(type?: PostType, limit?: number): Observable<Post[]> {
  let q = supabase
    .from('posts')
    .select(`
      id, type, title, body, location, buy_sell_intent, price, price_currency,
      event_date, max_participants, article_category, user_id, created_at,
      contact_email, contact_instagram, contact_phone, contact_line,
      profiles:profiles ( username )
    `)
    .order('created_at', { ascending: false });

  if (type) q = q.eq('type', type);
  if (limit) q = q.limit(limit);

  return from(
    q.then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        location: row.location ?? undefined,
        createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
        userId: row.user_id,
        username: row.profiles?.username ?? 'unknown',
        articleCategory: row.article_category ?? undefined,
        buySellIntent: row.buy_sell_intent ?? undefined,
        price: row.price ?? undefined,
        priceCurrency: row.price_currency ?? undefined,
        contactEmail: row.contact_email ?? undefined,
        contactInstagram: row.contact_instagram ?? undefined,
        contactPhone: row.contact_phone ?? undefined,
        contactLine: row.contact_line ?? undefined,
        eventDate: row.event_date ? Date.parse(row.event_date) : undefined,
        maxParticipants: row.max_participants ?? undefined,
      })) as Post[];
    })
  );
}



  /** 投稿を更新。投稿者本人のみ実行可能（Supabase RLS で制御推奨） */
  async updatePost(id: string, payload: Partial<Record<string, unknown>>): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id);
    if (error) throw error;
  }

  /** 投稿を削除。投稿者本人のみ実行可能（Supabase RLS で制御推奨） */
  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  getPostsByUser(userId: string, type?: PostType): Observable<Post[]> {
    return from((async () => {
      let q = supabase
        .from('posts')
        .select(`
          id, type, title, body, location, buy_sell_intent, price, price_currency,
          event_date, max_participants, article_category, user_id, created_at,
          contact_email, contact_instagram, contact_phone, contact_line,
          profiles:profiles ( username )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) q = q.eq('type', type);

      const { data, error } = await q;
      if (error) throw error;

      const mapped = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        type: row.type,
        location: row.location ?? undefined,

        createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
        userId: row.user_id,
        username: row.profiles?.username ?? 'unknown',

        articleCategory: row.article_category ?? undefined,
        buySellIntent: row.buy_sell_intent ?? undefined,
        price: row.price ?? undefined,
        priceCurrency: row.price_currency ?? undefined,
        contactEmail: row.contact_email ?? undefined,
        contactInstagram: row.contact_instagram ?? undefined,
        contactPhone: row.contact_phone ?? undefined,
        contactLine: row.contact_line ?? undefined,
        eventDate: row.event_date ? Date.parse(row.event_date) : undefined,
        maxParticipants: row.max_participants ?? undefined,
      })) as Post[];

      return mapped;
    })());
  }
}
