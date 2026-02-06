import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthSupabase } from '../../core/auth/auth-supabase';

@Component({
  selector: 'app-update-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './update-password.html',
  styleUrl: './update-password.scss',
})
export class UpdatePassword implements OnInit {
  private auth = inject(AuthSupabase);
  private router = inject(Router);

  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  loading = false;
  hasSession = false;

  private meetsPasswordComplexity(password: string): boolean {
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    );
  }

  async ngOnInit(): Promise<void> {
    // 再設定メールのリンクから来た場合、URLにハッシュ（access_token / type=recovery）がある。
    // Supabase がハッシュを処理してセッションを確立するまで非同期で行われるため、少し待ってからポーリングする。
    const hasRecoveryHash =
      typeof window !== 'undefined' &&
      !!window.location.hash &&
      (window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('access_token'));

    const maxWaitMs = hasRecoveryHash ? 4000 : 600;
    const intervalMs = 200;
    let session = await this.auth.getSession();

    for (let elapsed = 0; !session?.user && elapsed < maxWaitMs; elapsed += intervalMs) {
      await new Promise((r) => setTimeout(r, intervalMs));
      session = await this.auth.getSession();
    }

    this.hasSession = !!session?.user;
    if (!this.hasSession) {
      this.router.navigate(['/login']);
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    const p = this.password.trim();
    const cp = this.confirmPassword.trim();

    if (!p || !cp) {
      this.errorMessage = '新しいパスワードを入力してください。';
      return;
    }
    if (p !== cp) {
      this.errorMessage = 'パスワードが一致しません。';
      return;
    }
    if (p.length < 8) {
      this.errorMessage = 'パスワードは8文字以上で入力してください。';
      return;
    }
    if (!this.meetsPasswordComplexity(p)) {
      this.errorMessage =
        'パスワードは英小文字・英大文字・数字をそれぞれ1文字以上含めてください。';
      return;
    }

    this.loading = true;
    try {
      await this.auth.updatePassword(p);
      this.successMessage = 'パスワードを変更しました。';
      this.password = '';
      this.confirmPassword = '';
      setTimeout(() => this.router.navigate(['/mypage']), 1500);
    } catch (err) {
      console.error(err);
      this.errorMessage =
        '変更に失敗しました。しばらく経ってから再度お試しください。';
    } finally {
      this.loading = false;
    }
  }
}
