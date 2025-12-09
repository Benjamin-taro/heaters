// src/app/core/auth.ts
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  // setDoc,           // プロフィール自動作成したくなったら使う
  // serverTimestamp,  // ↑とセットで使う
} from '@angular/fire/firestore';

export interface LoginResult {
  user: User;
  isFirstLogin: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$ = authState(this.auth);

  // 🔹 Google ログイン + 初回判定
  async loginWithGoogle(): Promise<LoginResult> {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.auth, provider);

    const user = credential.user;
    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    const isFirstLogin = !snap.exists(); // ← ここがポイント

    return { user, isFirstLogin };
  }

  // 🔹 メールログインも同じようにしたければ async にしてチェックしてもOK
  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  registerWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}
