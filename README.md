# HEATERs — スコットランド日本語クラシファイド MVP

このプロジェクトは、ユーザーの企画書（賃貸・求人・売買・イベント・レッスン・サービス・口コミ・相談・保証人マッチング・乗り合い など）を元に、MixBのような日本語クラシファイドサイトの最小実行可能製品（MVP）を静的サイトとして実装したものです。フロントエンドのみで動作し、データ永続化には提供された RESTful Table API を利用します。

## 完了した機能
- トップページ（人気カテゴリ・新着表示・検索フォーム）
- 投稿一覧ページ（検索・カテゴリ/都市フィルタ UI・簡易ページャ）
- 投稿詳細ページ（本文・価格/連絡先・関連投稿）
- 新規投稿フォーム（テーブル `posts` に保存）
- UI はモバイルファーストで Tailwind CSS を採用
- アイコン: Font Awesome
- 共有ユーティリティ（APIラッパ、カテゴリ/都市定義、カードUI、フォーマッタ）
- データスキーマ: `posts` テーブル（id, title, category, city, location, price, price_unit, description, images, tags, contact_*, external_url, admin_code, expires_at, published）

## エントリURI（パスと主なクエリ）
- `/index.html` — トップ
- `/list.html` — 一覧。クエリ:
  - `search` 文字列検索
  - `category` カテゴリ完全一致
  - `city` 都市完全一致
  - `page` ページ番号（簡易）
- `/new.html` — 新規投稿
- `/view.html?id=RECORD_ID` — 投稿詳細
- RESTful Table API（相対URL）
  - `GET tables/posts?page=1&limit=10&search=foo&sort=-created_at`
  - `GET tables/posts/{id}`
  - `POST tables/posts`（本文参照）

## 未実装/今後の候補
- 投稿の編集・削除（admin_code 照合）
- 画像ギャラリー表示、画像アップロード（現状はURL指定のみ）
- 高度なサーバーサイド検索/フィルタ（カテゴリ・都市をAPI側に反映）
- スパム対策（投稿レート制限、簡易認証、reCAPTCHA相当は非対応）
- 広告枠/PR枠表示、アクセス解析
- 記事（生活情報ブログ）セクション
- マルチ言語（日本語/英語）

## 推奨次ステップ
1. 投稿編集・削除ページの追加（`admin_code` で PATCH/DELETE）
2. 一覧ページのソートやページネーションの改善
3. 画像のサムネイル表示とカルーセル導入
4. 生活記事用の `articles` テーブル設計
5. 口コミ専用の評価フィールド追加（星評価など）

## プロジェクト名・目的・主要機能
- 名称: HEATERs
- 目的: スコットランドに特化した日本語クラシファイド＋生活情報コミュニティ
- 主要機能: 掲示板投稿（賃貸・求人等）、検索・閲覧、簡易投稿フォーム

## パブリックURL
- デプロイ方法: To deploy your website and make it live, please go to the Publish tab where you can publish your project with one click. The Publish tab will handle all deployment processes automatically and provide you with the live website URL.

## データモデル
- テーブル: `posts`
- フィールド: `id`(system), `title`, `category`, `city`, `location`, `price`, `price_unit`, `description`, `images[]`, `tags[]`, `contact_name`, `contact_email`, `contact_phone`, `external_url`, `admin_code`, `expires_at`, `published`, ほかシステムフィールド（created_at, updated_at など）

---

現状はフロントエンドのみで構築しており、サーバーサイドの認証やファイル保存は行っていません。必要に応じて、RESTful Table API を活用した範囲で拡張していきます。