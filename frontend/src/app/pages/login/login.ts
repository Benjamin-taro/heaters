// src/app/pages/login/login.ts
import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../core/auth';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type PendingAction = 'email-login' | 'email-register' | null;

// ★ reCAPTCHA グローバル宣言
declare const grecaptcha: any;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  siteKey = environment.recaptchaSiteKey;
  captchaToken: string | null = null;
  pendingAction: PendingAction = null;

  // ★ reCAPTCHA の DOM 参照
  @ViewChild('captchaContainer') captchaContainer!: ElementRef;
  private widgetId: number | null = null;

  // -------------------------------------------------
  // ★ ページ描画後に reCAPTCHA をレンダリング
  // -------------------------------------------------
  ngAfterViewInit() {
    grecaptcha.ready(() => {
      this.widgetId = grecaptcha.render(
        this.captchaContainer.nativeElement,
        {
          sitekey: this.siteKey,
          callback: (token: string) => this.onCaptchaResolved(token)
        }
      );
    });
  }

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
