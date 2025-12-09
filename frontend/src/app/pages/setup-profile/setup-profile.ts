// src/app/pages/setup-profile/setup-profile.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import {
  Firestore,
  doc,
  runTransaction,
  serverTimestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../../core/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile implements OnInit {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  uid: string | null = null;
  loading = false;
  errorMessage = '';

  // 🔹 プロフィール入力フォーム
  profileForm = this.fb.group({
    // 英数字 + アンダースコア 3〜20文字くらいを想定
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],
    // HTML 側では <input type="date" formControlName="birthday"> を想定
    birthday: ['', [Validators.required]],
  });

  ngOnInit() {
    // ① login.ts からの navigation state 経由で uid を受け取る
    const nav = this.router.getCurrentNavigation();
    const fromState = nav?.extras.state as { uid?: string } | undefined;
    if (fromState?.uid) {
      this.uid = fromState.uid;
    }

    // ② リロードされた場合など、state が消えていたら auth.user$ から拾う
    if (!this.uid) {
      this.auth.user$.pipe(take(1)).subscribe((user) => {
        if (user) {
          this.uid = user.uid;
        } else {
          // そもそもログインしてなければ login に戻す
          this.router.navigate(['/login']);
        }
      });
    }
  }

  async saveProfile() {
    if (!this.uid) {
      this.errorMessage =
        'ユーザー情報を取得できませんでした。もう一度ログインしてください。';
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const raw = this.profileForm.value;
    const usernameRaw = (raw.username ?? '').toString().trim();
    const birthday = raw.birthday as string; // 'YYYY-MM-DD' を想定

    if (!usernameRaw || !birthday) {
      this.errorMessage = '入力内容を確認してください。';
      this.loading = false;
      return;
    }

    // 👇 大文字・小文字の違いで被るのを防ぐため、保存用は小文字にそろえる例
    const usernameKey = usernameRaw.toLowerCase();

    try {
      const usernamesRef = doc(this.firestore, 'usernames', usernameKey);
      const userRef = doc(this.firestore, 'users', this.uid);

      await runTransaction(this.firestore, async (tx) => {
        const usernameSnap = await tx.get(usernamesRef);

        if (usernameSnap.exists()) {
          // すでにそのユーザーネームが使われている
          throw new Error('USERNAME_TAKEN');
        }

        // ① usernames コレクションで「この名前はこの uid が使ってる」と予約
        tx.set(usernamesRef, {
          uid: this.uid,
          createdAt: serverTimestamp(),
        });

        // ② users/{uid} にプロフィールを保存
        tx.set(userRef, {
          username: usernameRaw,   // 表示用は元の大文字・小文字を維持してもOK
          usernameKey,             // 検索・重複判定用
          birthday,                // 'YYYY-MM-DD'
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      // 保存できたらホーム or listings へ
      this.router.navigate(['/']);
    } catch (err: any) {
      console.error(err);
      if (err instanceof Error && err.message === 'USERNAME_TAKEN') {
        this.errorMessage = 'このユーザーネームは既に使われています。別の名前を試してください。';
      } else {
        this.errorMessage =
          'プロフィールの保存に失敗しました。時間をおいてもう一度お試しください。';
      }
    } finally {
      this.loading = false;
    }
  }
}
