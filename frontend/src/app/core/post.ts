// src/app/core/post.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  orderBy,
  where,
  docData,
  doc,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type PostType = 'buy-sell' | 'event' | 'article';

export interface Post {
  id?: string;

  // 共通
  title: string;
  body: string;
  createdAt: number;
  userId: string;
  type: PostType;
  location?: string;   // ★ 共通の場所

  // Buy & Sell
  buySellIntent?: 'buy' | 'sell';
  price?: number;
  priceCurrency?: 'GBP' | 'JPY';

  // Event
  eventDate?: number;
  maxParticipants?: number;

  // Article
  articleCategory?: string;
}


@Injectable({
  providedIn: 'root',
})
export class PostService {
  private firestore = inject(Firestore);
  private postsRef = collection(this.firestore, 'posts');

  getPosts(type?: PostType): Observable<Post[]> {
    let q;
    if (type) {
      q = query(
        this.postsRef,
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
      );
    } else {
      q = query(this.postsRef, orderBy('createdAt', 'desc'));
    }
    return collectionData(q, { idField: 'id' }) as Observable<Post[]>;
  }

  getPostsByUser(userId: string, type?: PostType): Observable<Post[]> {
    let q;
    if (type) {
      q = query(
        this.postsRef,
        where('userId', '==', userId),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
      );
    } else {
      q = query(
        this.postsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      );
    }
    return collectionData(q, { idField: 'id' }) as Observable<Post[]>;
  }

  getPostLatests(limitCount: number, type?: PostType): Observable<Post[]> {
    let q;

    if (type) {
      q = query(
        this.postsRef,
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      );
    } else {
      q = query(
        this.postsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      );
    }

    return collectionData(q, { idField: 'id' }) as Observable<Post[]>;
  }

  getPost(id: string): Observable<Post | undefined> {
    const ref = doc(this.firestore, `posts/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Post | undefined>;
  }

  // ここは「id と createdAt 以外」を受け取る形のままでOK
  createPost(post: Omit<Post, 'id' | 'createdAt'>) {
    // undefined のフィールドをすべて削除
    const cleaned = Object.fromEntries(
      Object.entries(post).filter(([_, v]) => v !== undefined)
    );

    return addDoc(this.postsRef, {
      ...cleaned,
      createdAt: Date.now(),
    });
  }
}
