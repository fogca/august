# Stripe Checkout — design notes

## Scope
EC ではなく決済機能のみ。カート永続化・アカウント・在庫は持たない。
1 商品（Steiner Complete — 40 Styles）× ライセンス構成を 1 回の Checkout Session で決済する。

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

## TODO（フェーズ2）
- [ ] Webhook (`checkout.session.completed`) でフォント zip のダウンロードリンク発行・メール送付
- [ ] 領収書（Stripe の receipt_email を有効化）
- [ ] EULA への同意チェックボックス
- [ ] VAT / 税設定（Stripe Tax の導入検討）
