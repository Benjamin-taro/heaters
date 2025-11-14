# HEATERs — スコットランド日本語クラシファイド

コミュニティ主導のクラシファイドサービス「HEATERs」の MVP 実装です。Node.js 製の JSON バックエンド API と、Angular 17 で再構築したフロントエンド SPA をひとつのリポジトリで管理しています。

## プロジェクト構成

| ディレクトリ | 説明 |
| --- | --- |
| `server/` | JSON ファイルをデータストアに利用する RESTful API サーバー（Node.js 標準モジュールのみで構築） |
| `data/posts.json` | `posts` テーブルの永続化ファイル |
| `frontend/` | Angular 17 ベースのフロントエンドアプリケーション |

旧来の静的 HTML / JS ファイル（`index.html`, `list.html` など）は互換性維持のため残していますが、今後の開発は Angular アプリを中心に進めてください。

## セットアップ

1. **バックエンド API を起動**
   ```bash
   npm install
   npm run start
   ```
   3000 番ポートで `tables/posts` エンドポイントが利用できます。JSON ストレージは `data/posts.json` に保存されます。

2. **フロントエンド開発サーバーを起動**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   デフォルトで `http://localhost:4200` にホストされます。開発サーバーは `/tables` へのリクエストをバックエンド (`http://localhost:3000`) にプロキシするため、Angular アプリからは相対パスのまま API にアクセスできます。

3. ブラウザで `http://localhost:4200` を開き、Angular 製の UI から投稿を閲覧・作成できます。

## フロントエンド機能（Angular）

- **トップページ**: コミュニティの紹介と主要導線をカードスタイルで表示。
- **投稿一覧**: キーワード / カテゴリ / 都市で絞り込み、REST API から取得したデータをクライアントサイドで追加フィルタリング。ページ番号はクエリパラメータとして保持します。
- **投稿詳細**: 本文・価格・連絡先・関連投稿（同一都市）を表示。
- **新規投稿フォーム**: Angular のリアクティブフォームでバリデーションを行い、API へ `POST`。タグ・画像 URL・掲載期限の補助処理付き。
- **UI スタイル**: SCSS ベースの軽量デザイン。カード・ボタン・バッジなどの共通スタイルを `src/styles.scss` で定義。

## バックエンド API

- 起動コマンド: `npm run start`
- 主要エンドポイント:
  - `GET /tables/posts?page=1&limit=10&search=foo`
  - `GET /tables/posts/:id`
  - `POST /tables/posts`
  - `PATCH /tables/posts/:id`
- 仕様の詳細は `server/index.js` および `server/storage.js` を参照してください。

## テスト

- フロントエンド: `cd frontend && npm test`
- バックエンド: 現時点では自動テスト未整備（`curl` などで手動確認）。

## 今後の拡張候補

- 投稿編集・削除機能（`admin_code` 認証を利用）
- 画像アップロードやサムネイル表示
- Angular アプリからのサーバーサイド検索（カテゴリ / 都市を API クエリに反映）
- 認証・レートリミットなどのスパム対策
- CI/CD パイプライン整備とテスト自動化

---

API とフロントエンドが別プロセスになったことで、サービス拡張時にもそれぞれ独立してスケールできる構成になりました。必要に応じてリポジトリ分割やモノレポ化などを検討してください。
