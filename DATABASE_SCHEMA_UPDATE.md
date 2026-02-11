# データベーススキーマ更新: 画像URL配列の追加

## 変更内容

`posts` テーブルに `image_urls` カラムを追加します。このカラムは画像URLの配列を保存します。

また、Supabase Storageに画像を保存するためのバケットも作成する必要があります。

## SQL実行手順

Supabaseダッシュボードの **SQL Editor** で以下のSQLを実行してください：

```sql
-- postsテーブルにimage_urlsカラムを追加（TEXT配列型、NULL可）
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT NULL;

-- 既存のデータにNULLを設定（既存データは画像なしとして扱う）
UPDATE posts 
SET image_urls = NULL 
WHERE image_urls IS NULL;

-- コメントを追加（オプション）
COMMENT ON COLUMN posts.image_urls IS '投稿に添付された画像のURL配列（Supabase Storageのパス）';
```

## データ型の説明

- **`TEXT[]`**: PostgreSQLの配列型。例: `ARRAY['https://...', 'https://...']`
- **NULL可**: 画像がない投稿も許可（オプショナル）
- **デフォルト値**: `NULL`（画像なし）

## 確認方法

SQL実行後、以下のクエリで確認できます：

```sql
-- カラムが追加されたか確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'image_urls';

-- サンプルデータで確認（既存の投稿はimage_urlsがNULL）
SELECT id, title, image_urls FROM posts LIMIT 5;
```

## Supabase Storage の設定

画像をアップロードするために、Supabase Storage にバケットを作成する必要があります。

### 1. Storage バケットの作成

1. Supabaseダッシュボードにログイン
2. 左メニューから **Storage** を選択
3. **New bucket** をクリック
4. バケット名: `post-images`
5. **Public bucket** にチェック（画像を公開するため）
6. **Create bucket** をクリック

### 2. Storage ポリシーの設定（RLS）

バケット作成後、以下のポリシーを設定してください：

**ポリシー1: 画像のアップロード（認証済みユーザーのみ）**
- Policy name: `Allow authenticated users to upload images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
  ```sql
  (bucket_id = 'post-images'::text) AND (auth.role() = 'authenticated'::text)
  ```

**ポリシー2: 画像の閲覧（全員）**
- Policy name: `Allow public to view images`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition:
  ```sql
  bucket_id = 'post-images'::text
  ```

**ポリシー3: 画像の削除（投稿者のみ）**
- Policy name: `Allow users to delete their own images`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy definition:
  ```sql
  (bucket_id = 'post-images'::text) AND (auth.role() = 'authenticated'::text)
  ```

## 注意事項

- 既存の投稿は `image_urls = NULL` になります（画像なしとして扱われます）
- 画像URLは Supabase Storage の公開URLを保存します
- 画像は `post-images/{postId}/{timestamp}-{index}.{ext}` の形式で保存されます
- 最大10枚までアップロード可能です
- RLS（Row Level Security）ポリシーで適切にアクセス制御してください
