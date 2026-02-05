import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthSupabase } from '../../core/auth/auth-supabase';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private auth = inject(AuthSupabase);
  private router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  /** パスワードが英小文字・英大文字・数字をそれぞれ1文字以上含むか */
  private meetsPasswordComplexity(password: string): boolean {
    return (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    );
  }

  async onSubmit() {
    this.errorMessage = '';
    const emailTrimmed = this.email.trim();
    const passwordTrimmed = this.password.trim();
    if (!emailTrimmed || !passwordTrimmed) {
      this.errorMessage = 'メールアドレスとパスワードを入力してください。';
      return;
    }
    if (passwordTrimmed.length < 8) {
      this.errorMessage = 'パスワードは8文字以上で入力してください。';
      return;
    }
    if (!this.meetsPasswordComplexity(passwordTrimmed)) {
      this.errorMessage =
        'パスワードは英小文字・英大文字・数字をそれぞれ1文字以上含めてください。';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signUp(emailTrimmed, passwordTrimmed);
      this.router.navigate(['/check-email']);
    } catch (err) {
      console.error(err);
      this.errorMessage = '登録に失敗しました。入力内容を確認するか、しばらく経ってから再度お試しください。';
    } finally {
      this.loading = false;
    }
  }
}
