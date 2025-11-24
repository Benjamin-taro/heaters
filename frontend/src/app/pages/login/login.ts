import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';
import { AsyncPipe, NgIf} from '@angular/common';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule],
  template: `
    <div *ngIf="auth.user$ | async as user; else loggedOut">
      <span>Hi, {{ user.displayName || user.email }}</span>
      <button type="button" (click)="logout()">Logout</button>
    </div>

    <ng-template #loggedOut>
      <button type="button" (click)="loginWithGoogle()">Login with Google</button>

      <form (ngSubmit)="loginEmail()">
        <div>
          <label>
            Email
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
            />
          </label>
        </div>

        <div>
          <label>
            Password
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
            />
          </label>
        </div>

        <button type="submit">Login with Email</button>
        <button type="button" (click)="registerEmail()">Sign up</button>
      </form>
    </ng-template>
  `,
})
export class Login {
  auth = inject(AuthService);

  email = '';
  password = '';

  loginWithGoogle() {
    this.auth.loginWithGoogle().catch(console.error);
  }

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

