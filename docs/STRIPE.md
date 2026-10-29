# Stripe Checkout — design notes

## Scope
EC ではなく決済機能のみ。カート永続化・アカウント・在庫は持たない。
1 商品（Norma Complete — 20 weights）× ライセンス構成を 1 回の Checkout Session で決済する。

## Flow
1. `/buy` でライセンス（type + tier）・通貨・Educational を選択
2. CartSummary のフォームが `?/checkout` アクションに POST
   - 送るのは「何を買うか」のみ（license, tier, currency, educational）。金額は送らない
3. サーバー（`src/routes/buy/+page.server.ts`）が pricing.ts から金額を再計算
4. Stripe Checkout Session（mode: payment, price_data 動的生成）を作成し 303 redirect
5. 決済完了 → `/buy/success?session_id={CHECKOUT_SESSION_ID}` / キャンセル → `/buy`

## 通貨
EUR / USD は minor units（×100）、JPY は zero-decimal（そのまま）。

## 環境変数
- `STRIPE_SECRET_KEY` — 未設定時は dev 用に従来の stub redirect で動作
- Cloudflare Pages では dashboard の env vars に設定（adapter-cloudflare、
  SDK は `Stripe.createFetchHttpClient()` で Workers 互換）

## フェーズ2の実装状況（2026-10-29）
Stripe アカウントは販売主体 Mirai Service Co., Ltd.（Apres Guerre）で1つ。価格は**税込**表示。
コードは先に入れてあり、各機能は環境変数フラグで有効化する（ダッシュボード設定前に有効にしないこと）。

| 機能 | 実装 | 有効化 |
|---|---|---|
| Webhook（注文通知メール） | `src/routes/api/stripe/webhook` → `$lib/server/stripe-webhook.ts` | `STRIPE_WEBHOOK_SECRET` と `RESEND_API_KEY` を設定し、Stripe にエンドポイントを登録 |
| Stripe Tax | `$lib/server/stripe-options.ts`（`automatic_tax`・住所必須・税ID収集・`tax_behavior: inclusive`） | `STRIPE_AUTOMATIC_TAX=1` |
| 請求書PDF | 同上（`invoice_creation`） | `STRIPE_INVOICE_CREATION=1`（Stripe 側の請求書手数料を要確認） |

### Webhook の登録手順
1. 先にコードをデプロイする（エンドポイントが存在してから登録）
2. Stripe ダッシュボード → Developers → Webhooks → `https://<本番ドメイン>/api/stripe/webhook`
3. イベント: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
4. 表示される署名シークレット（`whsec_…`）を `STRIPE_WEBHOOK_SECRET` に設定（Cloudflare の環境変数）
5. テストモードと本番モードでエンドポイント・シークレットは別。それぞれ登録する

### Stripe Tax を有効にする前に（ダッシュボード側）
- Tax の事業所住所と登録（日本の適格請求書発行事業者番号、EU VAT など）を設定
- 既定の商品税区分（tax code）をデジタルコンテンツ向けに設定（税理士に確認）
- 上記が済んでから `STRIPE_AUTOMATIC_TAX=1`。未設定で有効にすると Checkout の作成が失敗する

### 未実装
- 納品リンクの自動発行（フォント zip を R2 等に置き、署名付きURLをメール送付）。現状は通知メールを受けて手動送付（特商法ページの「24時間以内」）
- Webhook の冪等化（Stripe の再送で通知メールが重複しうる。保存先が無いため未対応）
- EULA への同意チェックボックス

## TODO（旧メモ・参考）
- [x] Webhook — 注文通知まで（納品リンク発行は未）
- [x] 領収書/請求書 — `STRIPE_INVOICE_CREATION` フラグ
- [ ] EULA への同意チェックボックス
- [x] VAT / 税設定 — `STRIPE_AUTOMATIC_TAX` フラグ（税込表示）
