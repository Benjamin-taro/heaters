import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { of, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { AuthSupabase } from '../../core/auth/auth-supabase';
import { supabase } from '../../core/supabase/supabase.client';

interface UserProfile {
  username?: string;
  birthday?: string;     // YYYY-MM-DD
  created_at?: string;   // timestamptz
  age?: number | null;
}

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, NgIf],
  templateUrl: './mypage.html',
  styleUrls: ['./mypage.scss'],
})
export class MyPage {
  auth = inject(AuthSupabase);

  profile$ = this.auth.user$.pipe(
    switchMap((user) => {
      if (!user) return of(null);

      return from(
        supabase
          .from('profiles')
          .select('username, birthday, created_at')
          .eq('id', user.uid)
          .maybeSingle()
      ).pipe(
        map(({ data, error }) => {
          if (error) throw error;
          if (!data) return null;

          const profile = data as UserProfile;
          profile.age = this.calcAge(profile.birthday);
          return profile;
        })
      );
    })
  );

  private calcAge(birthdayStr?: string | null): number | null {
    if (!birthdayStr) return null;

    const today = new Date();
    const birthday = new Date(birthdayStr);

    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
    return age;
  }
}
