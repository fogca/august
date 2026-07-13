# 納品オペレーション（手動フェーズ）

サイトは「**決済完了後、24時間以内にメールで納品**」と約束している
（/buy/success と /legal/tokusho）。webhook 自動化までの間、この手順で回す。

## 1. 注文に気づく

- **Stripe ダッシュボード → 設定 → Team & notifications** で
  「Successful payments」のメール通知を ON にする（1回だけの設定）。
  → 以後、売上ごとに通知メールが届く。
- 注文一覧: [dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)

## 2. 注文内容を確認する

Payments で該当決済を開くと全部見える:

| 項目 | 場所 |
|------|------|
| 購入者メール | Customer 欄 |
| 金額・通貨 | Amount |
| 買ったライセンス+ティア | **Metadata → `licenses`**（例: `Desktop (up to 10 users) / Web (up to 25,000 PV / mo)`） |
| Educational | Metadata → `educational` (yes/no) |
| 注文参照番号 | Payment intent ID（`pi_…`）— 購入者の success 画面に表示されているものと同一。問い合わせはこれで検索 |

Educational = yes の場合: 購入者に .edu / .ac.jp メールまたは学生証の提示を
返信で依頼してから納品する（購入時は自己申告制）。

## 3. 納品メールを送る

宛先: Customer のメールアドレス。添付/リンク: フォントパッケージ zip。

> Subject: Your Steiner licence — August Type Foundry
>
> Hello,
>
> Thank you for licensing Steiner. Your files are attached / linked below:
>
> - Steiner Complete (20 weights, variable) — download: [LINK]
> - Licence summary (below) — your Stripe receipt is your proof of purchase
>
> **Licence certificate**
> - Licensee: [BUYER NAME / COMPANY — from Stripe]
> - Order reference: [pi_…]
> - Licences: [metadata.licenses]
> - Date: [YYYY-MM-DD]
> - Terms: https://august.tf/legal/eula
>
> Web licence holders: use only the supplied WOFF2 files for @font-face.
> Questions any time — just reply to this email.
>
> August Type Foundry
> hi@august.tf

## 4. パッケージ zip（未作成 — 要準備）

納品 zip の中身（案・確定したら更新）:

```
Steiner-Complete/
  fonts/desktop/  Steiner-VF.ttf（+ static instances があれば）
  fonts/web/      Steiner-VF.woff2
  EULA.pdf        （/legal/eula の PDF 書き出し）
  README.txt      （インストール手順・ライセンス要約）
```

## 5. 即時DL化へのアップグレード（次フェーズ）

必要なもの: ① 上記 zip、② Cloudflare R2 バケット（非公開）、③ 実装
（success ページは既に Stripe 検証済みなので、「paid のときだけ R2 から
ストリームする /buy/download エンドポイント」を足すだけ）。
①②が揃った時点で実装着手できる。さらに webhook
（`checkout.session.completed`）+ メール API（Resend 等）で完全自動化。
