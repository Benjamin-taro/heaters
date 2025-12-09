// src/app/pages/mypage/mypage.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';

import { Firestore, doc, docData } from '@angular/fire/firestore';
import { AsyncPipe, NgIf } from '@angular/common';
import { of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

interface UserProfile {
  username?: string;
  usernameKey?: string;
  birthday?: string; // YYYY-MM-DD
  createdAt?: any;
  age?: number | null; // 追加
}

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, NgIf],
  templateUrl: './mypage.html',
  styleUrls: ['./mypage.scss'],
})
export class MyPage {
  auth = inject(AuthService);
  private firestore = inject(Firestore);

  // TS側で年齢も計算して返す
  profile$ = this.auth.user$.pipe(
    switchMap((user) => {
      if (!user) return of(null);
      const userRef = doc(this.firestore, 'users', user.uid);

      return docData(userRef).pipe(
        map((d: any) => {
          if (!d) return null;

          const profile = d as UserProfile;

          profile.age = this.calcAge(profile.birthday);

          return profile;
        }),
      );
    }),
  );

  // 🔹 年齢計算ロジック
  private calcAge(birthdayStr?: string | null): number | null {
    if (!birthdayStr) return null;

    const today = new Date();
    const birthday = new Date(birthdayStr);

    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }

    return age;
  }
}
