# パスワード再設定メールが届かない場合の設定

「パスワードを忘れた方」から再設定メールを送信しても届かない場合、Supabase 側の設定が必要です。

## 原因

Supabase の**デフォルトのメール送信**は次のような制限があります。

- **デモ用途向け**のため、本番では届かない・届きにくいことがある
- **送信数制限**が厳しい（時間あたり数通程度）
- 一部環境では **supabase.io ドメイン**が迷惑メールやファイアウォールでブロックされる

そのため、**カスタム SMTP の設定を強く推奨**されています。

---

## 1. リダイレクトURLの追加（必須）

パスワード再設定メールのリンク先を許可する必要があります。

1. [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト
2. **Authentication** → **URL Configuration**
3. **Redirect URLs** に以下を追加：
   - 本番: `https://あなたのドメイン/update-password`
   - 開発: `http://localhost:4200/update-password`

追加していないと、メール内リンクをクリックしたときにエラーになります。

---

## 2. カスタム SMTP の設定（メールを届けるために推奨）

デフォルトのままではメールが届かないことが多いため、SMTP を設定してください。

1. **Authentication** → **SMTP Settings**（または **Providers** 内の Email 設定）
2. **Custom SMTP** を有効化
3. 以下のいずれか（例）で設定：
   - [Resend](https://resend.com/)
   - [SendGrid](https://sendgrid.com/)
   - [Brevo (旧 Sendinblue)](https://www.brevo.com/)
   - [AWS SES](https://aws.amazon.com/ses/)
   - [Mailtrap](https://mailtrap.io/)（開発・テスト用の受信のみ）

各サービスの「SMTP 設定」で表示される  
**ホスト・ポート・ユーザー・パスワード**を Supabase の SMTP 設定欄に入力します。

- 公式ドキュメント: [Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 3. メールにリンクがついていない / リンクが表示されない場合（重要）

メールは届くが「リンクがどこにもついていない」場合、次の2つが考えられます。

- **テンプレートに `{{ .ConfirmationURL }}` が入っていない**（前の節のとおり修正）
- **テンプレートは正しいが、メールクライアントがリンクを非表示・削除している**  
  迷惑メールフォルダに入ったメールでは、セキュリティのため `<a>` タグが無効化され、URLだけ見えなかったりすることがあります。

### 対処：URLを「テキスト」でも表示する

**Reset Password** の本文に、**クリック用のリンクに加えて、URLそのものをテキストで1行出す**ようにすると、リンクが消えてもブラウザにコピペして開けます。

1. [Supabase Dashboard](https://supabase.com/dashboard) → 対象プロジェクト
2. **Authentication** → **Email Templates** → **「Reset Password」**
3. **Message body** を、次のように**まるごと**差し替える（推奨）：

```html
<h2>Reset Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If the link above doesn't work, copy and paste this URL into your browser:</p>
<p style="word-break:break-all;">{{ .ConfirmationURL }}</p>
<p>This link expires after a short time. If you didn't request this, you can ignore this email.</p>
```

- 上から2行目: クリック用のリンク（そのまま）
- **「If the link above doesn't work...」の下**: **URLをそのままテキストで表示**しているので、リンクが消えてもURLをコピーしてブラウザに貼れば開けます。
- 変数名は **`{{ .ConfirmationURL }}`** のままにすること（スペースやタイプミスがあると置換されません）
- 外部のメール配信で「**メールトラッキング**」を有効にしているとリンクが書き換わることがあるので、トラッキングはオフ推奨です

---

## 4. 送信されていないか確認する

メールが送信されているかは、Supabase のログで確認できます。

1. **Logs** → **Auth logs**
2. `resetPasswordForEmail` やパスワードリセット関連のログを確認
3. エラーが出ていれば、リダイレクトURLや SMTP の設定ミスのことが多いです

---

## 5. ユーザー向けの案内

- 迷惑メールフォルダの確認
- 数分待っても届かない場合は、サイト側のメール設定（SMTP）が未設定の可能性がある旨を案内

上記は「パスワードを忘れた方」の送信成功画面にすでに記載しています。
