import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<p>Signing you in...</p>`,
})
export class AuthCallback implements OnInit {
  private router = inject(Router);

  async ngOnInit() {
    // URLのtokenからsessionを復元
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.user) {
      this.router.navigate(['/login']);
      return;
    }

    const user = data.session.user;

    // profiles あるか確認
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) this.router.navigate(['/setup-profile']);
    else this.router.navigate(['/']);
  }
}
