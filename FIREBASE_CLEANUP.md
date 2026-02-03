# Firebase関連コードの整理ガイド

## 現状分析

### 実際に使用されている箇所

1. **`posting.ts` (51行目)**: `authService.user$` を実際に使用
   - Firebase Authの`AuthService`を使用している
   - これを`AuthSupabase`に置き換える必要がある

### 未使用だが残っているコード

1. **`firebase.config.ts`**: 完全に未使用
2. **`app.config.ts`**: Firebase設定があるが、実際にはSupabaseを使用
3. **`core/post.ts`の`PostService`**: 未使用（`PostSupabase`を使用）
4. **`core/auth.ts`の`AuthService`**: `posting.ts`で一部使用（置き換え必要）
5. **`posting.ts`の未使用import**: `PostService`, `Firestore`, `firstValueFrom`, `doc`, `docData`

---

## 分類: 今すぐ消してよいもの

### ✅ 安全に削除可能

1. **`frontend/src/app/firebase.config.ts`**
   - 理由: 完全に未使用。`app.config.ts`でimportされているが、実際にはSupabaseを使用している

2. **`posting.ts`の未使用import（修正後）**
   ```typescript
   // 削除可能
   import { PostService, PostType, Post } from '../../core/post';  // PostServiceは未使用
   import { Firestore, doc, docData } from '@angular/fire/firestore';  // 未使用
   import { firstValueFrom } from 'rxjs';  // 未使用
   ```

3. **`home.ts`の未使用import（修正後）**
   ```typescript
   // 削除可能
   import { PostService, Post } from '../../core/post';  // PostServiceは未使用
   ```

---

## 分類: 残すならコメントすべき理由

### ⚠️ テストファイルで使用されている（削除前にテスト修正が必要）

1. **`core/post.ts`の`PostService`クラス**
   - 理由: 複数のテストファイル（`home.spec.ts`, `listings.spec.ts`, `posting.spec.ts`, `post-detail.spec.ts`）でモックとして使用
   - 対応: テストを`PostSupabase`のモックに置き換えてから削除

2. **`core/auth.ts`の`AuthService`クラス**
   - 理由: 複数のテストファイル（`login.spec.ts`, `mypage.spec.ts`, `setup-profile.spec.ts`, `home.spec.ts`, `listings.spec.ts`, `posting.spec.ts`）でモックとして使用
   - 対応: テストを`AuthSupabase`のモックに置き換えてから削除

3. **`app.config.ts`のFirebase設定**
   - 理由: 削除すると、テストファイルで`Firestore`をinjectしている箇所でエラーになる可能性
   - 対応: テストファイルの`Firestore`依存を削除してから削除

### 📝 コメントとして残す価値があるもの

- **`core/post.ts`と`core/auth.ts`**: 将来Firebaseに戻す可能性がある場合、コメントとして残す価値あり
- ただし、Supabase一本化が確定しているなら削除推奨

---

## Supabase一本化の安全な手順

### ステップ1: `posting.ts`の修正（最優先）

**現在の問題箇所:**
```typescript
// posting.ts (51行目)
this.authService.user$.subscribe(user => {
  this.currentUserId = user?.uid ?? null;
});
```

**修正内容:**
```typescript
// 1. importを変更
import { AuthSupabase } from '../../core/auth/auth-supabase';
// import { AuthService } from '../../core/auth';  // 削除

// 2. constructorを変更
constructor(
  private fb: FormBuilder,
  // private postService: PostService,  // 削除
  private auth: AuthSupabase,  // 追加
  // private firestore: Firestore,  // 削除
  private router: Router,
) {
  // ...
  
  // 3. user$の購読を変更
  this.auth.user$.subscribe(user => {
    this.currentUserId = user?.uid ?? null;
  });
}
```

### ステップ2: 未使用importの削除

**`posting.ts`から削除:**
- `PostService` (未使用)
- `Firestore`, `doc`, `docData` (未使用)
- `firstValueFrom` (未使用)

**`home.ts`から削除:**
- `PostService` (未使用、`Post`型のみ使用)

### ステップ3: テストファイルの更新

**対象ファイル:**
- `posting.spec.ts`
- `home.spec.ts`
- `listings.spec.ts`
- `post-detail.spec.ts`
- `login.spec.ts`
- `mypage.spec.ts`
- `setup-profile.spec.ts`

**変更内容:**
1. `PostService`のモック → `PostSupabase`のモックに変更
2. `AuthService`のモック → `AuthSupabase`のモックに変更
3. `Firestore`のprovideを削除（使用していない場合）

### ステップ4: `app.config.ts`のFirebase設定削除

**削除する行:**
```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './firebase.config';

// providersから削除
provideFirebaseApp(() => initializeApp(firebaseConfig)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore()),
```

### ステップ5: `firebase.config.ts`の削除

- ステップ4完了後、安全に削除可能

### ステップ6: `core/post.ts`と`core/auth.ts`の削除（オプション）

**注意:** テストファイルをすべて更新してから実行

- `core/post.ts`の`PostService`クラスを削除（`Post`型と`PostType`は残す）
- `core/auth.ts`の`AuthService`クラスを削除

### ステップ7: package.jsonの依存関係削除（オプション）

**削除可能な依存関係:**
```json
"@angular/fire": "^20.0.1",
"firebase": "^11.10.0",
```

**実行コマンド:**
```bash
npm uninstall @angular/fire firebase
```

---

## 実行順序の推奨

### フェーズ1: 必須修正（アプリ動作に影響）
1. ✅ `posting.ts`の`AuthService` → `AuthSupabase`に置き換え
2. ✅ 未使用importの削除

### フェーズ2: 設定ファイルのクリーンアップ
3. ✅ `app.config.ts`のFirebase設定削除
4. ✅ `firebase.config.ts`の削除

### フェーズ3: テストの更新（時間があるとき）
5. ⏳ テストファイルのモック更新
6. ⏳ `core/post.ts`と`core/auth.ts`の削除

### フェーズ4: 依存関係のクリーンアップ（オプション）
7. ⏳ `package.json`からFirebase依存を削除

---

## チェックリスト

### 修正前の確認
- [ ] `posting.ts`で`authService.user$`が使用されていることを確認
- [ ] 他のコンポーネントでFirebase関連コードが使用されていないか確認

### 修正中
- [ ] `posting.ts`の`AuthService` → `AuthSupabase`に置き換え
- [ ] 未使用importを削除
- [ ] アプリが正常に動作することを確認

### 修正後
- [ ] `app.config.ts`のFirebase設定を削除
- [ ] `firebase.config.ts`を削除
- [ ] ビルドエラーがないことを確認
- [ ] テストが通ることを確認（フェーズ3完了後）

---

## 注意事項

1. **`Post`型と`PostType`は残す**: `core/post.ts`から`PostService`を削除しても、型定義は他のファイルで使用されているため残す
2. **テストの実行**: 各ステップ後に`npm test`を実行して、テストが壊れていないか確認
3. **段階的な削除**: 一度にすべて削除せず、段階的に進めることを推奨
4. **Gitコミット**: 各フェーズ完了後にコミットして、問題があればロールバック可能にする
