import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth';
import { AsyncPipe, NgIf} from '@angular/common';
import { FormsModule} from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
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

