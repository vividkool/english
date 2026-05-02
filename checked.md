# English App: Step-by-Step Mastery - Checked Tasks (checked.md)

このファイルは、`todo.md` で完了（チェック済み）になったタスクを記録する場所です。
アーカイブされた .md ファイルの内容で完了済みのものもこちらに集約します。

## ✅ 完了済みタスク

### 2026-03-23 調整内容: 子供向け3段階学習の導入
- [x] **Read/Write/Speakの3段階タブ**: 画面下部の固定ナビゲーションで学習フローを明確化。
- [x] **優しく褒めてくれる先生**: 採点プロンプトを「褒め上手」に変更し、モチベーションを維持。
- [x] **進捗記録とレベルアップ**: Firestoreで累計正解数を管理し、習得度に合わせて Grade 1〜4 へ自動レベルアップ。
- [x] **発音ボタン (🔊)**: 全ての英語フレーズに読み上げ機能を追加。
### 2026-05-02 ワークフロー更新とセキュリティ対応
- [x] 認証情報の漏洩防止対策の徹底 (ハードコード排除の継続確認)
- [x] バックエンド用APIキーの安全な配置設計 (GitHub Secrets / Runtime Config)
- [x] GitHub Issues を起点とした開発ワークフローの完全定着 (STANDARD_WORKFLOW V2適用)

### 2026-04-24
- [x] GitHub Actionsでのデプロイエラー修正 (`firebase.json not found`)
- [x] UI調整: paddingを減らして縦の隙間を詰める
- [x] 機能追加: GEMINIの採点結果をモーダル表示にし、解除ボタンを配置する

### 🚀 完了したタスク履歴 (from changed.md)

#### 1. 環境構築
- [x] Gitリポジトリの初期化とリモート連携 (GitHub: vividkool/english)
- [x] Vite + React プロジェクトの作成 (React + TypeScript)
- [x] Firebase (Firestore) のセットアップ (src/firebase.ts)
- [x] .env ファイルの作成 (VITE_GEMINI_API_KEY)

#### 2. 設計
- [x] Firestore データ構造の最終決定 (基本構成をsrc/firebase.tsに反映)
- [x] システムプロンプト（US Grade 1〜12担当教師）の推敲 (src/api/gemini.ts)

#### 3. 実装
- [x] Gemini API 連携モジュール (src/api/gemini.ts)
- [x] 音声認識モジュール (Web Speech API) (src/components/PracticeRoom.tsx)
- [x] 学習メイン画面 UI (src/App.tsx, src/components/PracticeRoom.tsx)
- [x] 判定 & 反復ロジック (10回連続カウント)
- [x] 復習のリマインドロジック (Firestoreへの保存完了)

#### 4. ブラッシュアップ
- [x] プレミアムなモダンデザインの適用 (Vanilla CSS)
- [x] モバイル対応、スムーズなアニメーション
- [x] Listeningボタンの追加（Fixed Bottom）
- [x] 親コンポーネントからのはみ出し・レスポンシブレイアウトの修正
- [x] 完全正解（is_perfect）時のクラッカーアイコン表示

#### 5. 次フェーズの拡張
- [x] Listenモードの追加（Geminiによるお題提示・会話形式テスト）
- [x] Firebase Admin SDK を利用したバックエンド連携の強化 (環境変数設定)

---
## 📝 更新履歴（過去分 from changed.md）
- 2026-04-14: スマホGeminiの要件に基づき、Listenモード（1問1答会話形式）の実装を開始。Firebase Admin SDK の環境変数を設定。
- 2026-03-25: UIの改善、レスポンポシブ対応の強化、正解（is_perfect）時のクラッカーアイコン表示、Listeningボタン（Fixed Bottom）を追加。`20260325.md` の内容を `todo.md` に統合し、ブランチのマージを完了。
- 2026-03-23: 学習進捗（正解数・レベル）のFirestore記録機能を実装。累計正解数に応じた自動レベルアップ（Gradeアップ）に対応。ローディングUIをセンター表示のスピナーに変更。
- 2026-03-23: 子供向け「3段階学習（Read/Write/Speak）」とタブUIを実装。デザインを子供向けに最適化し、Geminiのフィードバックを「褒め上手な先生」に調整。
- 2026-03-22: APIモデルを `gemini-3-flash-preview` に変更。Markdown形式のレスポンスによるJSONパースエラーを修正。Firebase Hostingの設定（firebase.json, .firebaserc）を追加し、デプロイ完了。
- 2026-03-19: プロジェクトの初期構築完了。Vite + React + Firebase + Gemini APIの統合に成功。リポジトリのPush Protection問題を解消し、GitHub(main)へクリーンなプッシュが完了。

