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
  doc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export type PostType = 'buy-sell' | 'event' | 'article';

export interface Post {
  id?: string;
  title: string;
  body: string;
  createdAt: number;
  userId: string;

  type?: PostType;
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
  getPost(id: string): Observable<Post | undefined> {
    const ref = doc(this.firestore, `posts/${id}`);
    return docData(ref, { idField: 'id' }) as Observable<Post | undefined>;
  }
  
  createPost(post: Omit<Post, 'id' | 'createdAt'>) {
    return addDoc(this.postsRef, {
      ...post,
      createdAt: Date.now(),
    });
  }
}
