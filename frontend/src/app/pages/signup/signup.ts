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

  async onSubmit() {
    this.errorMessage = '';
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'メールアドレスとパスワードを入力してください。';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signUp(this.email, this.password);
      this.router.navigate(['/check-email']);
    } catch (err) {
      console.error(err);
      this.errorMessage = '登録に失敗しました。入力内容を確認するか、しばらく経ってから再度お試しください。';
    } finally {
      this.loading = false;
    }
  }
}
