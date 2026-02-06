// src/app/pages/post-edit/post-edit.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PostType } from '../../core/post';
import { Post } from '../../core/post';
import { AuthSupabase } from '../../core/auth/auth-supabase';
import { PostSupabase } from '../../core/post/post-supabase';

function atLeastOneContactValidator(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;
  if (g.get('type')?.value !== 'buy-sell') return null;
  const email = g.get('contactEmail')?.value;
  const instagram = g.get('contactInstagram')?.value;
  const phone = g.get('contactPhone')?.value;
  const line = g.get('contactLine')?.value;
  const hasContact = [email, instagram, phone, line].some(
    (v) => v != null && String(v).trim() !== ''
  );
  return hasContact ? null : { atLeastOneContactRequired: true };
}

@Component({
  selector: 'app-post-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './post-edit.html',
  styleUrl: './post-edit.scss',
})
export class PostEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(AuthSupabase);
  private postSupabase = inject(PostSupabase);

  loading = false;
  notFound = false;
  forbidden = false;
  postId: string | null = null;
  form!: FormGroup;

  constructor() {
    this.form = this.fb.group({
      type: ['buy-sell' as PostType, Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
      location: [''],
      buySellIntent: [null],
      price: [null],
      priceCurrency: ['GBP'],
      contactEmail: [''],
      contactInstagram: [''],
      contactPhone: [''],
      contactLine: [''],
      eventDate: [null],
      maxParticipants: [null],
      articleCategory: [''],
    });
    this.form.get('type')?.valueChanges.subscribe(() => this.updateValidators());
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/listing']);
      return;
    }
    this.postId = id;

    const session = await this.auth.getSession();
    const currentUserId = session?.user?.id ?? null;
    if (!currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    let post: Post | undefined;
    try {
      post = await firstValueFrom(this.postSupabase.getPost(id));
    } catch {
      this.notFound = true;
      return;
    }
    if (!post) {
      this.notFound = true;
      return;
    }
    if (post.userId !== currentUserId) {
      this.forbidden = true;
      return;
    }

    const eventDateStr =
      post.eventDate != null
        ? new Date(post.eventDate).toISOString().slice(0, 10)
        : null;

    this.form.patchValue({
      type: post.type,
      title: post.title,
      body: post.body,
      location: post.location ?? '',
      buySellIntent: post.buySellIntent ?? null,
      price: post.price ?? null,
      priceCurrency: post.priceCurrency ?? 'GBP',
      contactEmail: post.contactEmail ?? '',
      contactInstagram: post.contactInstagram ?? '',
      contactPhone: post.contactPhone ?? '',
      contactLine: post.contactLine ?? '',
      eventDate: eventDateStr,
      maxParticipants: post.maxParticipants ?? null,
      articleCategory: post.articleCategory ?? '',
    });
    this.updateValidators();
  }

  private updateValidators(): void {
    const type = this.form.get('type')?.value as PostType;
    const buySellIntent = this.form.get('buySellIntent');
    const price = this.form.get('price');
    const priceCurrency = this.form.get('priceCurrency');
    const location = this.form.get('location');
    const eventDate = this.form.get('eventDate');

    buySellIntent?.clearValidators();
    price?.clearValidators();
    priceCurrency?.clearValidators();
    location?.clearValidators();
    eventDate?.clearValidators();
    this.form.clearValidators();

    if (type === 'buy-sell') {
      buySellIntent?.setValidators(Validators.required);
      price?.setValidators(Validators.required);
      priceCurrency?.setValidators(Validators.required);
      this.form.setValidators(atLeastOneContactValidator);
    } else if (type === 'event') {
      location?.setValidators(Validators.required);
      eventDate?.setValidators(Validators.required);
    }

    buySellIntent?.updateValueAndValidity();
    price?.updateValueAndValidity();
    priceCurrency?.updateValueAndValidity();
    location?.updateValueAndValidity();
    eventDate?.updateValueAndValidity();
    this.form.updateValueAndValidity();
  }

  get selectedType(): PostType {
    return this.form.get('type')?.value as PostType;
  }

  get contactRequiredError(): boolean {
    return this.form.errors?.['atLeastOneContactRequired'] === true;
  }

  get missingRequiredFields(): string[] {
    const type = this.form.get('type')?.value as PostType;
    const missing: string[] = [];
    if (!this.form.get('title')?.value?.trim()) missing.push('タイトル');
    if (!this.form.get('body')?.value?.trim()) missing.push('内容');
    if (type === 'buy-sell') {
      if (!this.form.get('buySellIntent')?.value) missing.push('買いたい/売りたい');
      const price = this.form.get('price')?.value;
      if (price === null || price === undefined || price === '') missing.push('価格');
      if (!this.form.get('priceCurrency')?.value) missing.push('通貨');
      if (this.form.errors?.['atLeastOneContactRequired']) missing.push('連絡先（いずれか1つ）');
    } else if (type === 'event') {
      if (!this.form.get('location')?.value?.trim()) missing.push('場所');
      if (!this.form.get('eventDate')?.value) missing.push('日付');
    }
    return missing;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || !this.postId) return;

    this.loading = true;
    try {
      const v = this.form.value;
      const isBuySell = v.type === 'buy-sell';
      const isEvent = v.type === 'event';

      const payload = {
        type: v.type,
        title: v.title,
        body: v.body,
        location: v.location || null,
        article_category: v.articleCategory || null,
        price_currency: v.priceCurrency || null,
        buy_sell_intent: isBuySell ? (v.buySellIntent || null) : null,
        price: isBuySell && v.price != null ? Number(v.price) : null,
        contact_email: isBuySell ? (v.contactEmail || null) : null,
        contact_instagram: isBuySell ? (v.contactInstagram || null) : null,
        contact_phone: isBuySell ? (v.contactPhone || null) : null,
        contact_line: isBuySell ? (v.contactLine || null) : null,
        event_date: isEvent && v.eventDate ? v.eventDate : null,
        max_participants: isEvent && v.maxParticipants != null ? Number(v.maxParticipants) : null,
      };

      await this.postSupabase.updatePost(this.postId, payload);
      this.router.navigate(['/posts', this.postId]);
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
