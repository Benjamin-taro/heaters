# HEATERs Angularプロジェクト構造説明

## アプリの目的
- **HEATERs**: スコットランド在住者向けの日本語クラシファイドサイト
- 投稿タイプ: Buy & Sell（売買）、Event（イベント）、Article（記事・コラム）
- 主な機能: 投稿の作成・閲覧・検索、ユーザー認証、プロフィール管理

---

## エントリーポイント

### 1. `frontend/src/main.ts`
- Angularアプリケーションの起動エントリーポイント
- `bootstrapApplication(App, appConfig)` でアプリを起動

### 2. `frontend/src/app/app.config.ts`
- アプリケーション全体の設定
- 主要な設定内容:
  - **ルーティング**: `provideRouter(routes)`
  - **Firebase**: Firebase App、Auth、Firestore の初期化（現在は未使用の可能性あり）
  - **PrimeNG**: UIコンポーネントライブラリのテーマ設定

### 3. `frontend/src/app/app.ts` / `frontend/src/app/app.html`
- ルートコンポーネント
- `<router-outlet>` で各ページを表示

---

## ルーティング構造

`frontend/src/app/app.routes.ts` で定義:

| パス | コンポーネント | 説明 |
|------|---------------|------|
| `/` | → `/home` にリダイレクト | |
| `/home` | `Home` | トップページ（新着投稿5件表示） |
| `/listing` | `Listings` | 全投稿一覧 |
| `/listing/type/:type` | `Listings` | タイプ別投稿一覧（`buy-sell`, `event`, `article`） |
| `/posts/:id` | `PostDetail` | 投稿詳細ページ |
| `/posting` | `Posting` | 新規投稿作成フォーム |
| `/login` | `Login` | ログイン・新規登録ページ |
| `/setup-profile` | `SetupProfile` | 初回ログイン時のプロフィール設定 |
| `/mypage` | `MyPage` | マイページ（プロフィール表示） |
| `/auth/callback` | `AuthCallback` | OAuth認証コールバック |
| `/check-email` | `CheckEmail` | メール確認案内ページ |
| `/**` | → `/home` にリダイレクト | 404処理 |

---

## 主要な機能の塊（Features）

### 1. **認証機能** (`core/auth/`)
- **`auth-supabase.ts`**: Supabase認証サービスのラッパー
  - `signUp()`, `signIn()`, `signOut()`
  - `user$`: 現在のユーザー情報をObservableで提供
  - `createProfile()`: プロフィール作成
- **`auth.ts`**: Firebase認証サービス（レガシー、現在は未使用の可能性）

### 2. **投稿機能** (`core/post/`)
- **`post-supabase.ts`**: Supabase経由で投稿データを取得・操作
  - `getPost(id)`: 単一投稿取得
  - `getPosts(type?, limit?)`: 投稿一覧取得（タイプ・件数フィルタ可能）
  - `getPostsByUser(userId, type?)`: ユーザー別投稿取得
- **`post.ts`**: 
  - `Post` インターフェース定義（タイプ、タイトル、本文、価格、イベント日時など）
  - `PostType`: `'buy-sell' | 'event' | 'article'`
  - `PostService`: Firebase用サービス（レガシー、現在は未使用の可能性）

### 3. **データベース接続** (`core/supabase/`)
- **`supabase.client.ts`**: Supabaseクライアントのシングルトンインスタンス
  - 環境変数から `supabaseUrl` と `supabaseAnonKey` を読み込み

### 4. **ページコンポーネント** (`pages/`)
- **`home/`**: トップページ（新着投稿5件を表示）
- **`listings/`**: 投稿一覧ページ（タイプフィルタ、ユーザー別フィルタ対応）
- **`post-detail/`**: 投稿詳細ページ
- **`posting/`**: 新規投稿作成フォーム（リアクティブフォーム使用）
- **`login/`**: ログイン・新規登録
- **`mypage/`**: マイページ（プロフィール表示）
- **`setup-profile/`**: 初回ログイン時のプロフィール設定
- **`auth-callback/`**: OAuth認証コールバック処理
- **`check-email/`**: メール確認案内

### 5. **共有コンポーネント** (`shared/`)
- **`post-list/`**: 投稿一覧表示用コンポーネント
- **`post-detail-view/`**: 投稿詳細表示用コンポーネント

---

## データの流れ（API → 画面）

### データ取得フロー

```
Supabase PostgreSQL
    ↓
supabase.client.ts (シングルトン)
    ↓
PostSupabase / AuthSupabase (サービス層)
    ↓
Observable<Post[]> / Observable<AppUser | null>
    ↓
ページコンポーネント (pages/*)
    ↓
共有コンポーネント (shared/*)
    ↓
テンプレート (HTML)
```

### 具体例: 投稿一覧の表示

1. **`listings.ts`** コンポーネントが初期化
2. **`PostSupabase.getPosts()`** を呼び出し
3. Supabaseクライアントが `posts` テーブルからデータ取得
   - JOINで `profiles` テーブルから `username` も取得
4. データを `Post` インターフェースにマッピング
5. `Observable<Post[]>` として返却
6. コンポーネントで `vm$` として購読
7. **`post-list`** コンポーネントに `posts` を渡して表示

### 具体例: 新規投稿作成

1. **`posting.ts`** のフォームでユーザーが入力
2. `onSubmit()` が実行
3. `supabase.auth.getUser()` で現在のユーザー取得
4. `supabase.from('posts').insert(payload)` でデータベースに挿入
5. 成功後、フォームをリセット

### データベーススキーマ（推測）

- **`posts` テーブル**:
  - `id`, `type`, `title`, `body`, `location`
  - `buy_sell_intent`, `price`, `price_currency`
  - `event_date`, `max_participants`
  - `article_category`
  - `user_id`, `created_at`
  
- **`profiles` テーブル**:
  - `id` (users.id と外部キー)
  - `username`, `birthday`, `created_at`

- **認証**: Supabase Auth を使用（`auth.users` テーブル）

---

## 技術スタック

- **フレームワーク**: Angular 20.x（Standalone Components）
- **認証・データベース**: Supabase（PostgreSQL + Auth）
- **UIライブラリ**: PrimeNG
- **状態管理**: RxJS Observables
- **フォーム**: Angular Reactive Forms
- **ルーティング**: Angular Router

---

## 重要な注意点

- Firebase関連のコード（`firebase.config.ts`, `core/auth.ts`, `core/post.ts` の `PostService`）は残っていますが、実際のデータ操作は **Supabase** を使用しています
- 認証は `AuthSupabase`、投稿操作は `PostSupabase` を使用
- すべてのコンポーネントは **Standalone Components** 形式
