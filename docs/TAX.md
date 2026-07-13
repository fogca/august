# 税務メモ — EUR / JPY 販売（要・税理士確認）

前提: 販売者は株式会社みらいサービス（屋号 August Type Foundry）。
商品はフォントライセンス＝デジタル商品のダウンロード販売。決済は Stripe
Checkout、通貨は EUR / USD / JPY。価格はすべて**税込（グロス）表示**で統一
（/legal/tokusho に「消費税込」と記載済み）。

## 税理士に確認する質問（そのまま渡せる形）

1. **EU 消費者向けデジタル商品販売の VAT**
   - 非 EU 事業者は原則、初回売上から VAT 登録義務（non-Union OSS）と理解して
     いるが、当社の想定規模（少量・単発）での現実的な対応方針は？
   - 登録する場合: non-Union OSS の登録国の選定と申告代行の可否。
   - 登録しない場合のリスク評価。
2. **米国向け（USD）**: 州 sales tax のネクサス発生条件。当面の少量販売で
   対応不要という理解でよいか。
3. **日本（JPY）**: 通常の課税売上として処理する際の region 区分
   （国内消費者 vs 国外からの JPY 決済）の扱い。
4. **価格の税込一本化**: 現状「表示価格＝請求額（税込）」方式。VAT/sales tax
   を内税として吸収する方式で問題ないか、それとも Stripe Tax で外税計算す
   べきか。

## Stripe Tax（automatic_tax）を使うことになった場合の手順

コード変更は最小（準備済みの箇所に 1 ブロック追加）:

1. Stripe ダッシュボード → **Tax** を有効化し、登録済みの課税地域
   （registrations）を追加する（←ここが前提。未設定のまま API で
   `automatic_tax` を有効にするとセッション作成がエラーになる）
2. `src/routes/buy/+page.server.ts` の `sessions.create` に
   `automatic_tax: { enabled: true }` を追加し、`price_data` に
   `tax_behavior: 'inclusive'`（税込表示を維持する場合）を指定
3. B2B の reverse charge を受けるなら `tax_id_collection: { enabled: true }`

## 現状の実装状態（2026-07-07）

- `automatic_tax` は**未使用**（ダッシュボード設定が前提のため意図的に見送り）
- 表示価格＝請求額。通貨換算は pricing.ts（EUR 基準、JPY=×160/100円丸め、
  USD=×1.08）
