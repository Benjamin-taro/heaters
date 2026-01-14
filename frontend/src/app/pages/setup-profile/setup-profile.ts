import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { AuthSupabase } from '../../core/auth/auth-supabase';
import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.scss',
})
export class SetupProfile {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthSupabase);

  loading = false;
  errorMessage = '';

  profileForm = this.fb.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ],
    ],
    birthday: ['', Validators.required],
  });

  async saveProfile() {
    console.log('[SetupProfile] saveProfile called');
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;

      console.log('[SetupProfile] current uid:', uid);
      if (!uid) {
        this.router.navigate(['/login']);
        return;
      }

      const { username, birthday } = this.profileForm.value;
      const usernameKey = username!.trim().toLowerCase();

      const { error } = await supabase.from('profiles').insert({
        id: uid,
        username: username!.trim(),
        username_key: usernameKey,
        birthday,
      });

      console.log('[SetupProfile] insert error:', error);

      if (error) {
        // UNIQUE 制約エラー
        if (error.code === '23505') {
          this.errorMessage =
            'このユーザーネームは既に使われています。';
        } else {
          throw error;
        }
        return;
      }

      this.router.navigate(['/']);
    } catch (e) {
      console.error(e);
      this.errorMessage =
        'プロフィールの保存に失敗しました。時間をおいて再試行してください。';
    } finally {
      this.loading = false;
    }
  }
}
