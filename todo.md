# English App: Step-by-Step Mastery - TODO List

## 🚀 プロジェクト目標
Duolingoとは対照的な「深掘り型」英会話学習。
アメリカの子供と同じように、1つの構文を完璧に（10回連続正解）使いこなせるまで反復する。

## 🛠 タスク状況

### 1. 環境構築
- [x] Gitリポジトリの初期化とリモート連携 (GitHub: vividkool/english)
- [x] Vite + React プロジェクトの作成 (React + TypeScript)
- [x] Firebase (Firestore) のセットアップ (src/firebase.ts)
- [x] .env ファイルの作成 (VITE_GEMINI_API_KEY)

### 2. 設計
- [x] Firestore データ構造の最終決定 (基本構成をsrc/firebase.tsに反映)
- [x] システムプロンプト（US Grade 1〜12担当教師）の推敲 (src/api/gemini.ts)

### 3. 実装
- [x] Gemini API 連携モジュール (src/api/gemini.ts)
- [x] 音声認識モジュール (Web Speech API) (src/components/PracticeRoom.tsx)
- [x] 学習メイン画面 UI (src/App.tsx, src/components/PracticeRoom.tsx)
- [x] 判定 & 反復ロジック (10回連続カウント)
- [x] 復習のリマインドロジック (Firestoreへの保存完了)

### 4. ブラッシュアップ
- [x] プレミアムなモダンデザインの適用 (Vanilla CSS)
- [x] モバイル対応、スムーズなアニメーション

---
## 📝 更新履歴
- 2026-03-23: 学習進捗（正解数・レベル）のFirestore記録機能を実装。累計正解数に応じた自動レベルアップ（Gradeアップ）に対応。ローディングUIをセンター表示のスピナーに変更。
- 2026-03-23: 子供向け「3段階学習（Read/Write/Speak）」とタブUIを実装。デザインを子供向けに最適化し、Geminiのフィードバックを「褒め上手な先生」に調整。
- 2026-03-22: APIモデルを `gemini-3-flash-preview` に変更。Markdown形式のレスポンスによるJSONパースエラーを修正。Firebase Hostingの設定（firebase.json, .firebaserc）を追加し、デプロイ完了。
- 2026-03-19: プロジェクトの初期構築完了。Vite + React + Firebase + Gemini APIの統合に成功。リポジトリのPush Protection問題を解消し、GitHub(main)へクリーンなプッシュが完了。
