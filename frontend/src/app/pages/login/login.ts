// src/app/pages/login/login.ts
import { Component, inject } from '@angular/core';
import { AuthSupabase } from '../../core/auth/auth-supabase';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, FormsModule, RouterModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  auth = inject(AuthSupabase);
  private router = inject(Router);

  email = '';
  password = '';

  async requestEmailLogin() {
    const { user } = await this.auth.signIn(this.email, this.password);
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      this.router.navigate(['/setup-profile']);
    } else {
      this.router.navigate(['/']);
    }
  }


  logout() {
    this.auth.signOut().catch(console.error);
  }
}
