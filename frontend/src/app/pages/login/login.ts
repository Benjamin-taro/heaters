// src/app/pages/login/login.ts
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  // 🔹 Google ログイン + 初回ログイン分岐
  async loginWithGoogle() {
    try {
      const result = await this.auth.loginWithGoogle(); // { user, isFirstLogin }

      if (result.isFirstLogin) {
        // 初回ログイン → プロフィール入力ページへ
        this.router.navigate(['/setup-profile'], {
          state: { uid: result.user.uid },
        });
      } else {
        // 2回目以降 → 普通のトップページへ（好きなルートに変更してOK）
        this.router.navigate(['/']);
      }
    } catch (err) {
      console.error(err);
      // ここでトースト出したりエラーメッセージ出したりしてもOK
    }
  }

  // ここはとりあえず今まで通りでOK
  loginEmail() {
    this.auth.loginWithEmail(this.email, this.password).catch(console.error);
  }

  registerEmail() {
    this.auth.registerWithEmail(this.email, this.password).catch(console.error);
  }

  logout() {
    this.auth.logout().catch(console.error);
  }
}
