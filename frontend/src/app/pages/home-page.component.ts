import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="hero card">
      <h1>スコットランドで暮らす日本人のためのコミュニティマーケット</h1>
      <p>
        HEATERs は、住まいや仕事、イベント、サービスなどの地域情報を安心してやり取りできる掲示板です。投稿はすべてコミュニティメンバーによって管理され、リアルタイムに更新されます。
      </p>
      <div class="actions">
        <a routerLink="/posts" class="btn">投稿を探す</a>
        <a routerLink="/posts/new" class="btn secondary">投稿する</a>
      </div>
    </section>
    <section class="card info-grid">
      <div>
        <h2>柔軟な検索とフィルタ</h2>
        <p>カテゴリや都市、キーワードで絞り込みながら最新の掲示板をチェックできます。</p>
      </div>
      <div>
        <h2>API ベースのデータ管理</h2>
        <p>投稿データは Node.js ベースの REST API に保存され、フロントエンドからリアルタイムに同期されます。</p>
      </div>
      <div>
        <h2>モダンな Angular アーキテクチャ</h2>
        <p>スタンドアロンコンポーネントとシグナルを用いた最新の Angular 17 構成で保守性と拡張性を重視しています。</p>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        text-align: center;
        padding: 3rem 2.5rem;
        background: radial-gradient(circle at top, rgba(99, 102, 241, 0.15), rgba(255, 255, 255, 0));
      }
      .hero h1 {
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        margin-bottom: 1rem;
      }
      .hero p {
        margin: 0 auto 1.5rem;
        max-width: 640px;
        color: #475569;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .btn.secondary {
        background: #0f172a;
      }
      .info-grid {
        margin-top: 2rem;
        display: grid;
        gap: 1.5rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      h2 {
        font-size: 1.25rem;
      }
    `,
  ],
})
export class HomePageComponent {}
