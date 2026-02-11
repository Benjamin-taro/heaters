// src/app/pages/posting/posting.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { PostType } from '../../core/post';
import { AuthSupabase } from '../../core/auth/auth-supabase';
import { supabase } from '../../core/supabase/supabase.client';
import { Router } from '@angular/router';

/** Buy & Sell のとき、連絡先（メール/Instagram/電話/LINE）のいずれか1つ必須 */
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
  selector: 'app-posting-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './posting.html',
  styleUrl: './posting.scss',
})
export class Posting {
  loading = false;
  currentUserId: string | null = null;
  form!: FormGroup;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthSupabase,
    private router: Router,
  ) {
    this.form = this.fb.group({
      // 共通
      type: ['buy-sell' as PostType, Validators.required],
      title: ['', Validators.required],
      body: ['', Validators.required],
      location: [''],

      // Buy & Sell 用
      buySellIntent: [null],
      price: [null],
      priceCurrency: ['GBP'],
      contactEmail: [''],
      contactInstagram: [''],
      contactPhone: [''],
      contactLine: [''],

      // Event 用
      eventDate: [null],          // HTML は type="date" → string が入る
      maxParticipants: [null],

      // Article 用
      articleCategory: [''],
    });

    this.auth.user$.subscribe(user => {
      this.currentUserId = user?.uid ?? null;
    });

    this.form.get('type')?.valueChanges.subscribe(() => this.updateValidators());
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

  /** 未入力の必須項目のラベル一覧（送信できない理由の表示用） */
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

  // async onSubmit() {
  //   if (this.form.invalid || !this.currentUserId) {
  //     return;
  //   }

  //   this.loading = true;
  //   try {
  //     const v = this.form.value;

  //     // 🔹 1) Firestore の users/{uid} から username を取得
  //     const userDocRef = doc(this.firestore, 'users', this.currentUserId);
  //     const profile: any = await firstValueFrom(docData(userDocRef));
  //     const username = profile?.username ?? 'unknown';

  //     // 🔹 2) Post に userId と username を両方入れる
  //     const payload: Omit<Post, 'id' | 'createdAt'> = {
  //       type: v.type as PostType,
  //       title: v.title!,
  //       body: v.body!,
  //       userId: this.currentUserId!,
  //       username,                                  // ← 追加ポイント
  //       location: v.location || undefined,

  //       // Buy & Sell
  //       buySellIntent: v.buySellIntent || undefined,
  //       price: v.price != null ? Number(v.price) : undefined,
  //       priceCurrency: v.priceCurrency || undefined,

  //       // Event
  //       eventDate: v.eventDate ? new Date(v.eventDate).getTime() : undefined,
  //       maxParticipants: v.maxParticipants != null ? Number(v.maxParticipants) : undefined,

  //       // Article
  //       articleCategory: v.articleCategory || undefined,
  //     };

  //     await this.postService.createPost(payload);

  //     // 初期値を再セットしつつリセット
  //     this.form.reset({
  //       type: 'buy-sell',
  //       priceCurrency: 'GBP',
  //     });
  //   } finally {
  //     this.loading = false;
  //   }
  // }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // 既存の画像に追加（最大10枚まで）
    const totalImages = this.selectedImages.length + imageFiles.length;
    if (totalImages > 10) {
      alert('画像は最大10枚までアップロードできます。');
      return;
    }

    this.selectedImages.push(...imageFiles);

    // プレビュー用URLを生成
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.imagePreviews.push(result);
        }
      };
      reader.readAsDataURL(file);
    });

    // inputをリセット（同じファイルを再度選択できるように）
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  /** Supabase Storageに画像をアップロードしてURL配列を返す */
  private async uploadImages(postId: string, userId: string): Promise<string[]> {
    if (this.selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (let i = 0; i < this.selectedImages.length; i++) {
      const file = this.selectedImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${i}.${fileExt}`;
      // .from('post-images')を使っているので、パスにはバケット名を含めない
      const filePath = `${postId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error(`画像アップロードエラー (${file.name}):`, error);
        // バケットが存在しない場合のエラーメッセージを表示
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          console.error('⚠️ Storageバケット「post-images」が作成されていません。Supabaseダッシュボードでバケットを作成してください。');
        }
        continue;
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return uploadedUrls;
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    try {
      // ✅ supabase user
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) {
        // 未ログインならログインへ
        // this.router.navigate(['/login']); など
        return;
      }

      const v = this.form.value;
      const isBuySell = v.type === 'buy-sell';
      const isEvent = v.type === 'event';

      // ✅ posts に存在する列だけ送る
      const payload: any = {
        user_id: uid,
        type: v.type,
        title: v.title,
        body: v.body,
        location: v.location || null,
        article_category: v.articleCategory || null,
        price_currency: v.priceCurrency || null,

        // Buy & Sell（DB列は snake_case）
        buy_sell_intent: isBuySell ? (v.buySellIntent || null) : null,
        price: isBuySell && v.price != null ? Number(v.price) : null,
        contact_email: isBuySell ? (v.contactEmail || null) : null,
        contact_instagram: isBuySell ? (v.contactInstagram || null) : null,
        contact_phone: isBuySell ? (v.contactPhone || null) : null,
        contact_line: isBuySell ? (v.contactLine || null) : null,

        // Event
        event_date: isEvent && v.eventDate ? v.eventDate : null,
        max_participants: isEvent && v.maxParticipants != null ? Number(v.maxParticipants) : null,
      };

      // まず投稿を作成（画像URLは後で更新）
      const { data: inserted, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single();
      if (error) throw error;

      const postId = inserted?.id;
      if (!postId) throw new Error('投稿IDが取得できませんでした');

      // 画像をアップロード
      const imageUrls = await this.uploadImages(postId, uid);

      // 画像URLがある場合は投稿を更新
      if (imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ image_urls: imageUrls })
          .eq('id', postId);
        if (updateError) throw updateError;
      }

      // フォームと画像をリセット
      this.form.reset({ type: 'buy-sell', priceCurrency: 'GBP' });
      this.selectedImages = [];
      this.imagePreviews = [];

      this.router.navigate(['/posts', postId]);
    } catch (e) {
      console.error(e);
      alert('投稿に失敗しました。もう一度お試しください。');
    } finally {
      this.loading = false;
    }
  }

}
