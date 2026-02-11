# Supabase Storage セットアップガイド

## エラー: "Bucket not found"

画像アップロード機能を使用するには、Supabase Storageに `post-images` バケットを作成する必要があります。

## 手順

### 1. Storage バケットの作成

1. **Supabaseダッシュボード**にログイン
2. 左メニューから **Storage** を選択
3. **New bucket** ボタンをクリック
4. 以下の設定を入力：
   - **Name**: `post-images` （正確にこの名前で）
   - **Public bucket**: ✅ **チェックを入れる**（重要：画像を公開するため）
5. **Create bucket** をクリック

### 2. Storage ポリシー（RLS）の設定

バケット作成後、以下の3つのポリシーを追加します：

#### ポリシー1: 画像のアップロード（認証済みユーザーのみ）

1. Storage → `post-images` バケットを開く
2. **Policies** タブをクリック
3. **New Policy** をクリック
4. **For full customization** を選択
5. 以下の設定を入力：

- **Policy name**: `Allow authenticated users to upload images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  (bucket_id = 'post-images'::text) AND (auth.role() = 'authenticated'::text)
  ```
6. **Review** → **Save policy** をクリック

#### ポリシー2: 画像の閲覧（全員）

1. **New Policy** をクリック
2. **For full customization** を選択
3. 以下の設定を入力：

- **Policy name**: `Allow public to view images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  bucket_id = 'post-images'::text
  ```
4. **Review** → **Save policy** をクリック

#### ポリシー3: 画像の削除（認証済みユーザー）

1. **New Policy** をクリック
2. **For full customization** を選択
3. 以下の設定を入力：

- **Policy name**: `Allow authenticated users to delete images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  (bucket_id = 'post-images'::text) AND (auth.role() = 'authenticated'::text)
  ```
4. **Review** → **Save policy** をクリック

## 確認方法

バケットとポリシーが正しく設定されているか確認：

1. Storage → `post-images` バケットを開く
2. **Policies** タブで、上記3つのポリシーが表示されていることを確認
3. アプリで画像をアップロードしてみる

## トラブルシューティング

### エラー: "Bucket not found"
- バケット名が `post-images` と正確に一致しているか確認
- バケットが作成されているか Storage ページで確認

### エラー: "new row violates row-level security policy"
- ポリシーが正しく設定されているか確認
- ログインしているか確認（認証済みユーザーのみアップロード可能）

### 画像が表示されない
- バケットが **Public bucket** として設定されているか確認
- ポリシー2（SELECT）が `public` ロールに対して設定されているか確認

## 参考

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
