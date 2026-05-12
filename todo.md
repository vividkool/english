# English App: Step-by-Step Mastery - TODO List

## 🚀 プロジェクト目標

Duolingoとは対照的な「深掘り型」英会話学習。
1つの構文を完璧に（10回連続正解）使いこなせるまで反復する。

## 🛠 現在のタスク状況

- [ ] 2026/5/8
  > readタブ　音声出力ボタンを単語から、文章に変更してください
- [ ] inputする時、submitボタンがキーボードに隠れるのでsubmitボタンが見える位置までスクロールしてください(writeタブ)　AIの考え中のモーダルを小さくしてください(はみ出している)
- [ ] 各タブのwidthが100%autoになっていないタブがある　100%autoにしてください (完了)

### 2. 機能追加・改善

- [ ] Listenモードの回答精度向上とフィードバックの多様化
- [ ] オフライン対応（Service Worker）の検討
- [ ] ユーザー統計情報の可視化（ダッシュボード）

---

## 📝 更新履歴

- 2026-05-02: STANDARD_WORKFLOW V2 を適用。GitHub Actionsのpushトリガーを廃止し、Issue起点の実装フローに移行。`changed.md` を `checked.md` へ統合しアーカイブ。
- 2026-04-24: GitHub Actionsでのデプロイエラーを修正（.gitignoreの調整）。UIの余白を削減しコンパクト化。Gemini判定結果のモーダル表示機能を実装。
- 2026-04-21: リポジトリの認証情報漏洩対策として履歴をパージし、再構築。`src/firebase.ts` を環境変数化。過去の完了済みタスクを `changed.md` へ移動。

- (以前の履歴は `changed.md` を参照)

\*\*WARNING

他端末での注意 他の端末（ノートパソコン等）で作業を再開する際は、履歴が書き換わっているため、一度リポジトリを削除してやり直すか、git fetch origin && git reset --hard origin/develop を実行して同期させる必要があります。
