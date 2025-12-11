// src/app/pages/login/login.ts
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RecaptchaModule } from 'ng-recaptcha';

type PendingAction = 'email-login' | 'email-register' | null;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule, ButtonModule, RecaptchaModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  siteKey = environment.recaptchaSiteKey;
  captchaToken: string | null = null;
  pendingAction: PendingAction = null;

  // reCAPTCHA 成功時に呼ばれる
  async onCaptchaResolved(token: string | null) {
    this.captchaToken = token;

    if (!token || !this.pendingAction) return;

    switch (this.pendingAction) {
      case 'email-login':
        await this.doEmailLogin();
        break;

      case 'email-register':
        await this.doEmailRegister();
        break;
    }

    this.pendingAction = null;
  }

  get isCaptchaValid() {
    return !!this.captchaToken;
  }

  // --- Google ログインはクリック直後に実行しないと動かない ---
  async loginWithGoogle() {
    try {
      const result = await this.auth.loginWithGoogle();

      if (result.isFirstLogin) {
        this.router.navigate(['/setup-profile'], { state: { uid: result.user.uid } });
      } else {
        this.router.navigate(['/']);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- Email login / register は CAPTCHA 経由 ---
  requestEmailLogin() {
    if (this.isCaptchaValid) {
      this.doEmailLogin();
    } else {
      this.pendingAction = 'email-login';
    }
  }

  requestEmailRegister() {
    if (this.isCaptchaValid) {
      this.doEmailRegister();
    } else {
      this.pendingAction = 'email-register';
    }
  }

  private async doEmailLogin() {
    try {
      await this.auth.loginWithEmail(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err) {
      console.error(err);
    }
  }

  private async doEmailRegister() {
    try {
      await this.auth.registerWithEmail(this.email, this.password);
      this.router.navigate(['/setup-profile']);
    } catch (err) {
      console.error(err);
    }
  }

  logout() {
    this.auth.logout().catch(console.error);
  }
}
