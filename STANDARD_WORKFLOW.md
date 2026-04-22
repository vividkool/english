ご提示いただいたワークフローに、**「Pushトリガーの廃止」**と**「Push時のセキュリティ検閲（シークレットスキャン）」**を組み込んだ、より堅牢な「V2」を作成しました。
特に20年選手の知見を活かし、AI（Jules）が万が一「良かれと思って」鍵をコミットしようとした際の防御壁を厚くしています。

# 標準開発ワークフロー V2 (Standard Development Workflow)

このドキュメントは、AI共創時代におけるプロジェクトの安全性と開発効率を両立させるための「鉄則」を定義します。

## 📌 このワークフローの3つの柱

### 🔐 **セキュリティファースト**

- すべての push を自動スキャン（Gitleaks/TruffleHog）
- 秘密情報（APIキー、JSON鍵）の混入を防止
- GitHub Secrets による一元管理で、機密情報をコードから完全分離

### 💚 **エコノミー（Quota削減）**

- **Issue-Driven AI Deployment (IDD)**: すべての変更・デプロイは Issue から開始
- **Push トリガーの廃止**: `on: push` による自動ビルドを全廃し、Quota 節約と安全性を確保
- **自動プレビュー URL 通知**: デプロイ完了後、Issue にプレビュー URL を自動コメント

### ✅ **品質保証**

- 本番デプロイは **必ず人間による手動実行**
- develop でのプレビュー確認を必須化
- 自動化と人間による最終確認のバランス

---

## 1. ブランチ戦略 (Branch Strategy)

```
main (Production)
  └─ 本番環境（カスタムドメイン）
  └─ 更新は develop からの PR マージのみ
  └─ デプロイは手動（firebase deploy）

develop (Preview)
  └─ Firebase Hosting develop チャネル
  └─ Issue トリガーで自動デプロイ
  └─ ユーザーが確認してから main へマージ
```

**ブランチ保護ルール（推奨）:**

- `main`: PR review 必須、automatic deploy なし
- `develop`: Issue 完了後のマージのみ

## 2. 開発サイクル (AI共創フロー)

### フロー図

```
Issue作成
  ↓
🔐 セキュリティ検閲（自動）
  ├─ OK → ビルド・テスト（自動）
  └─ NG → エラー報告・停止
  ↓
🚀 develop チャネルに自動デプロイ
  ↓
👁️ プレビュー確認（手動）
  ├─ OK → 内容レビュー
  └─ NG → Issue に修正指示
  ↓
✅ main ブランチへ PR マージ
  ↓
🔑 本番デプロイ（手動: firebase deploy）
```

### STEP 1: タスクの投稿 (日中)

GitHub Issue を作成し、AIへの指示書とします。

```
タイトル例: 2026-04-20 | 新機能追加: ユーザー認証機能
内容:
- 機能内容を具体的に記述
- 修正が必要なファイルを指定（オプション）
- 参考画像やリンクを貼付け
```

**ポイント：**

- **[SKIP] タグ** を付けるとワークフロー実行を スキップできます
- Issue ベースなので、議論の履歴が残ります

### STEP 2: セキュリティ検閲 (Security Gate) ← **自動**

**【重要】すべての push が保護されます**

検査対象:

```
🔍 自動スキャン対象:
  ✓ .env ファイルの混入
  ✓ serviceAccountKey.json などの秘密鍵
  ✓ APIキー、OAuth トークン
  ✓ データベース接続文字列
```

**検知時の動作:**

1. ワークフローが即座に **FAIL**
2. 管理者に Slack/Email で通知
3. 本番環境へのデプロイは **一切実行されません**

**このステップがない場合の悪夢:**

- ❌ APIキーが public repository に流出 → 攻撃対象に
- ❌ Firebase 秘密鍵がコミットされる → 全プロジェクトがハッキングリスク
- ❌ 気づかないうちに数万円の不正課金が発生

### STEP 3: AIによる自動実装と develop デプロイ ← **自動**

Issue 投稿をトリガーとして、GitHub Actions が起動します。

**処理フロー:**

1. **develop ブランチをチェックアウト**
2. **依存関係インストール** (`npm ci`)
3. **コンパイル・ビルド** (`npm run build`)
4. **Lint チェック** (`npm run lint`)
5. **ビルド成功時のみ Firebase Hosting develop チャネルへデプロイ**
6. **Issue にプレビュー URL を自動コメント** (動的に生成された URL を通知)

**利点:**

- **IDD (Issue-Driven Deployment)** によるプロ仕様のパイプライン
- CI/CD の自動化で人間の手作業を削減
- ビルドエラーを早期に検出し、プレビュー環境で安全に検証可能

### STEP 4: プレビュー環境での確認と本番マージ ← **手動**

```
📱 プレビュー URL でテスト
   ↓
✅ OK → Issue コメント "+1" or "approve"
   ↓
👨‍💻 develop ブランチを main へ PR
   ↓
🔍 コードレビュー（オプション）
   ↓
✔️ PR をマージ
```

**このステップが重要な理由:**

- **自動デプロイの過信を防止** → 人間による最終確認
- **意図しない変更を検出** → code review で品質向上
- **本番環境への影響を最小化** → 問題が起きたら即座にロールバック可能

### STEP 5: 本番環境へのデプロイ ← **手動（人間による実行）**

```bash
# ローカルで最終確認
firebase emulator:start

# 本番デプロイ
firebase deploy --only hosting
```

**なぜ手動なのか:**

- ❌ 自動デプロイ：エラーが起きても気づかない、ロールバックが困難
- ✅ 手動デプロイ：デプロイ前に全テストを実行、失敗時は即座に停止可能

---

## 3. セキュリティと環境変数 (Security & Env)

### ローカル開発

**絶対に Push してはいけないファイル:**

```
❌ .env
❌ .env.local
❌ serviceAccountKey.json
❌ firebase-admin-key.json
❌ credentials.json
```

これらはすべて `.gitignore` で保護：

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Firebase Admin SDK
service_account.json
serviceAccountKey.json
firebase-admin-key.json
credentials.json
```

### CI/CD (GitHub Actions)

**GitHub Secrets への登録方法:**

```
Settings > Secrets and variables > Actions > New repository secret

例)
Name: FIREBASE_SERVICE_ACCOUNT_FROMZERO_914E2
Value: { "type": "service_account", "project_id": "...", ... }
        ↑ JSON 全体をペースト
```

**ベストプラクティス:**

- ✅ Secrets は絶対に println や echo で出力しない
- ✅ GitHub Actions ログに Secrets が表示されないことを確認
- ✅ **セキュリティ侵害を検知したら即座に新しい秘密鍵を発行**
- ✅ 定期的（3-6 ヶ月ごと）に秘密鍵をローテーション（新キー発行 → 古キーを廃止）
- ✅ 不要な Secrets は削除
- ✅ Secrets の発行日時を記録・管理

**秘密鍵の有効期限管理:**

```
【重要度】
高  ┌─ セキュリティ侵害検知 → 今すぐ新キーを発行！（1 時間以内）
    │
    ├─ 3-6 ヶ月経過 → 新キーへローテーション（定期メンテ）
    │
低  └─ 特に問題ない → 現在のキーを継続利用
```

---

## 4. 運用の要点

### 📊 情報の集約

```
TODO.md          ← 現在の進行中タスク、完了予定
changed.md       ← リリースノート（変更履歴）
Issue / PR       ← 議論、レビュー内容
```

AIはこれらを読み取って、過去の文脈を維持します。

### 🚀 パフォーマンス第一

**重い処理は避ける:**

- ❌ UI レスポンスを損なう大きなビルド
- ✅ Cloud Functions / Cloud Run へオフロード
- ✅ Web Worker で非同期処理

### 🛡️ AI暴走防止（Jules への徹底）

```
① Artifact確認機能で意図を検証
② Issue の内容と実装が合致しているか確認
③ 疑わしい提案は「理由」を聞く
④ 秘密情報の混入を絶対に許さない
```

---

## 5. よくある質問 (FAQ)

### Q1. develop にプッシュしても自動デプロイされない？

**A:** 自動デプロイは **Issue トリガー** のみです。develop への直接 push は、セキュリティチェックのみ実行され、デプロイされません。

### Q2. main への自動デプロイがないのはなぜ？

**A:**

- **Quota 削減**: 無駄なビルドを削減
- **安全性**: 手動確認を必須化し、意図しないデプロイを防止
- **品質**: 本番環境に流出するバグを最小化

### Q3. 緊急時（バグ修正）はどうする？

**A:** 同じフロー：

1. Issue 作成 → 2. develop で テスト → 3. main へマージ → 4. firebase deploy

早さが必要な場合は、Issue → PR マージまでを迅速化できます。

### Q4. firebase deploy で失敗したら？

**A:**

```bash
# ロールバック
firebase hosting:rollback [version]

# または前のコミットに戻す
git revert <commit-hash>
firebase deploy
```

### Q5. 秘密鍵（Secrets）を定期的に変更する理由は？

**A:** 2つの理由があります：

#### 理由1：万が一の流出に備える

```
【秘密鍵を変更しない場合】
1月: キーを発行
  ↓
7月: 知らない間に漏洩
  ↓
8月: ハッカーが悪用開始
  ↓
😱 気づかない間に被害拡大

【秘密鍵を3-6ヶ月ごとに変更する場合】
1月: キーを発行
  ↓
4月: 新しいキーに切り替え（古いキーは使用停止）
  ↓
7月: 古いキーで悪用されようとする
  ↓
✅ 新キー使用中だから影響なし
```

#### 理由2：セキュリティ侵害時の迅速対応

```
【緊急度が高い場合】
APキーが GitHub にコミットされた
  ↓ すぐに！
新しいキーを発行
  ↓
GitHub Secrets を更新
  ↓
古いキーを無効化（Firebase で削除）
```

**初心者が今やるべき優先度：**

1. ✅ 秘密鍵を絶対に Git にコミットしない（最重要）
2. ✅ GitHub Secrets に登録する
3. 🟠 セキュリティ侵害検知時は即座に新キーを発行
4. 🟡 3-6 ヶ月ごとの定期ローテーション（後で自動化推奨）

### Q6. Secrets が漏洩したことに気づくには？

**A:** 以下の方法で監視します：

```
【自動監視】
✅ GitHub Secret scanning（Public リポジトリ自動有効）
  ├─ APIキーが push されたら即座に検知
  └─ メール通知で管理者に知らせる

✅ Firebase Console の監視
  ├─ 異常なアクセスパターンを検知
  └─ ダッシュボードで確認

【手動監視】
✅ 月 1 回、GitHub Actions のログを確認
✅ Firebase の使用量（請求額）を確認
✅ 定期的に「Secrets の有効期限」を確認
```

### Q7. Secrets をローテーション（変更）するときの具体的な手順は？

**A:** Firebase の Service Account を例に：

```bash
# ステップ1: Firebase Console で新しい秘密鍵を生成
# Settings > Service Accounts > Generate New Private Key

# ステップ2: GitHub Secrets を更新
# Settings > Secrets and variables > Actions
# → FIREBASE_SERVICE_ACCOUNT_* の値を新しいキーに変更

# ステップ3: GitHub Actions が新しいキーで実行可能か確認
# → develop へ push してワークフロー実行確認

# ステップ4: 古い秘密鍵を無効化（Firebase で削除）
# Settings > Service Accounts > Delete old key
# ⚠️ 重要: 新しいキーの動作を確認してから削除！
```

**タイミングの目安：**

```
最低限（すぐにやる）: セキュリティ侵害検知時
推奨: 1 年に 1-2 回（手動または自動化）
理想: 3-6 ヶ月ごと（自動化）
```

---

## 6. ベストプラクティス（チーム向け）

### 開発・運用

| ✅ DO                                   | ❌ DON'T                   |
| --------------------------------------- | -------------------------- |
| Issue ベースで要件を共有                | Slack メッセージのみで指示 |
| develop でテスト完了後に main へマージ  | main に直接 push           |
| firebase deploy 時に console ログを確認 | 自動化を信じて確認しない   |
| 月 1 回、GitHub Actions quota を確認    | quota 超過に気づかない     |

### セキュリティ・秘密鍵管理

| ✅ DO                                              | ❌ DON'T                                   |
| -------------------------------------------------- | ------------------------------------------ |
| 秘密鍵を絶対に Git にコミットしない                | API キーやキーファイルを push              |
| .gitignore で秘密ファイルを保護                    | 秘密ファイルをトラッキング                 |
| GitHub Secrets に秘密情報を登録                    | コードにハードコード                       |
| **セキュリティ侵害検知時は即座に新キーを発行**     | 古い秘密鍵で放置（侵害が継続）             |
| **定期的（3-6 ヶ月ごと）に秘密鍵をローテーション** | 永遠に同じキーを使用（万が一の漏洩リスク） |
| Secrets の発行日時を記録・追跡                     | いつ発行したか不明                         |

---

このワークフローにより、**親会社の「怪しげなAI」や「野良AI」とは比較にならないほど堅牢な、プロ仕様の配管が完成しました。**
