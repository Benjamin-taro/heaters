import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { supabase } from '../supabase/supabase.client';

// 既存のコードが user.uid を参照してるので互換の形にする
export interface AppUser {
  uid: string;
  email?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthSupabase {
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  user$: Observable<AppUser | null> = this.userSubject.asObservable();

  constructor() {
    console.log('[AuthSupabase] constructor');

    // 初期セッションを復元
    this.init();

    // セッション変化を購読（ログイン/ログアウト/トークン更新）
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthSupabase] state change:', event, session?.user?.id);

      const u = session?.user;
      this.userSubject.next(
        u ? { uid: u.id, email: u.email ?? null } : null
      );
    });
  }

  private async init() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[AuthSupabase] getSession error:', error);
      this.userSubject.next(null);
      return;
    }
    const u = data.session?.user;
    this.userSubject.next(u ? { uid: u.id, email: u.email ?? null } : null);
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data; // data.user / data.session
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async createProfile(username: string, birthday?: string) {
    const session = await this.getSession();
    const uid = session?.user.id;
    if (!uid) throw new Error('Not logged in');

    const { error } = await supabase.from('profiles').insert({
      id: uid,
      username,
      birthday: birthday ?? null,
    });

    if (error) throw error;
  }

}
