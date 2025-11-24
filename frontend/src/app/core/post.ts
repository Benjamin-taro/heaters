import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Post {
  id?: string;
  title: string;
  body: string;
  createdAt: number;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private firestore = inject(Firestore);
  private postsRef = collection(this.firestore, 'posts');

  getPosts(): Observable<Post[]> {
    return collectionData(this.postsRef, { idField: 'id' }) as Observable<Post[]>;
  }

  createPost(post: Omit<Post, 'id' | 'createdAt'>) {
    return addDoc(this.postsRef, {
      ...post,
      createdAt: Date.now(),
    });
  }
}
