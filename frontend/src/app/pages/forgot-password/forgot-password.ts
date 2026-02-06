import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthSupabase } from '../../core/auth/auth-supabase';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private auth = inject(AuthSupabase);

  email = '';
  errorMessage = '';
  successMessage = '';
  loading = false;

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    const emailTrimmed = this.email.trim();
    if (!emailTrimmed) {
      this.errorMessage = 'メールアドレスを入力してください。';
      return;
    }

    this.loading = true;
    try {
      await this.auth.resetPasswordForEmail(emailTrimmed);
      this.successMessage =
        'パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。';
      this.email = '';
    } catch (err) {
      console.error(err);
      this.errorMessage =
        '送信に失敗しました。メールアドレスを確認するか、しばらく経ってから再度お試しください。';
    } finally {
      this.loading = false;
    }
  }
}
