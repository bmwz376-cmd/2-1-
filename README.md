# 2級土木施工管理技士 第一次検定 過去問題集

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📖 概要

2級土木施工管理技士の第一次検定対策用のWebアプリケーションです。令和2年度（2020年）から令和6年度（2024年）までの過去問題を250問収録しています。

### ✨ 主な特徴

- **📚 250問収録**: 過去5年分（令和2年度～令和6年度）の試験問題を網羅
- **🎨 モダンなUI**: 直感的で使いやすいインターフェース
- **📱 レスポンシブ対応**: スマートフォン、タブレット、PCで快適に学習可能
- **🔖 総ルビ対応**: 全ての漢字にふりがな付きで外国人学習者にも配慮
- **📊 学習統計**: 進捗状況、正答率、連続正解数などを可視化
- **🔍 詳細解説**: 全選択肢に正誤理由を明記
- **🏷️ 分野別分類**: 土工、コンクリート、施工計画、法規など
- **💾 自動保存**: ブラウザのLocalStorageで学習履歴を保存

## 🎯 対象者

- 2級土木施工管理技士の資格取得を目指す方
- 土木工事の施工管理について学びたい方
- 外国人技能実習生・特定技能労働者

## 📋 収録内容

### 年度別
- **令和6年度（2024年）**: 50問
- **令和5年度（2023年）**: 50問
- **令和4年度（2022年）**: 50問
- **令和3年度（2021年）**: 50問
- **令和2年度（2020年）**: 50問

### 分野別
- **土工**: 約50問（土質、掘削、盛土、締固め等）
- **コンクリート工**: 約50問（材料、配合、打設、養生等）
- **施工計画**: 約50問（工程管理、品質管理、安全管理等）
- **法規**: 約50問（建設業法、労働安全衛生法等）
- **その他**: 約50問（建設機械、測量、環境保全等）

### 重要度分類
- **A: 頻出問題**: 試験によく出題される重要問題
- **B: 標準問題**: 基本的な知識を問う問題
- **C: 難問**: 応用力が必要な発展的問題

## 🚀 使い方

### 1. オンラインで利用

デプロイされたサイトにアクセスするだけで利用可能です。

### 2. ローカルで実行

```bash
# リポジトリをクローン
git clone https://github.com/bmwz376-cmd/2-1-.git
cd 2-1-

# シンプルなHTTPサーバーを起動（Python 3の場合）
python3 -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

## 📂 プロジェクト構造

```
.
├── index.html              # トップページ
├── questions.html          # 問題一覧ページ
├── question.html           # 個別問題ページ
├── stats.html              # 学習統計ページ
├── css/
│   ├── style.css           # メインスタイル
│   ├── animations.css      # アニメーション定義
│   └── notification.css    # 通知システム
├── js/
│   ├── common.js           # 共通機能（データ管理、通知等）
│   ├── index.js            # トップページ用スクリプト
│   ├── questions.js        # 問題一覧用スクリプト
│   ├── question.js         # 個別問題用スクリプト
│   └── stats.js            # 統計ページ用スクリプト
├── data/
│   └── questions.json      # 問題データ（JSON形式）
└── images/                 # 画像ファイル（図解等）
```

## 💡 機能詳細

### トップページ
- 学習進捗の概要表示
- 解答済み問題数、正答率、連続正解数
- 分野別の問題構成
- 直感的なナビゲーション

### 問題一覧ページ
- 年度、分野、重要度、学習状況でフィルタリング
- キーワード検索機能
- 問題の状態表示（未解答/正解/不正解）

### 個別問題ページ
- ルビ付きの問題文表示
- 選択肢の選択と回答
- 詳細な解説（全選択肢の正誤理由）
- 参考図・関連法規の表示
- 学習のコツ（英語のヒント付き）

### 学習統計ページ
- 全体の学習状況
- 年度別・分野別・重要度別の正答率
- 復習が必要な問題の一覧
- 学習履歴のリセット機能

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **デザイン**: レスポンシブデザイン、モダンUI/UX
- **アイコン**: Font Awesome 6.4.0
- **フォント**: Noto Sans JP (Google Fonts)
- **データ保存**: LocalStorage API

## 🌐 ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge
- モバイルブラウザ（iOS Safari, Chrome for Android）

## 📝 データ形式

問題データは以下のJSON形式で管理されています：

```json
{
  "id": "r06_001",
  "number": 1,
  "year": "r06",
  "category": "earthwork",
  "difficulty": "A",
  "title": "問題タイトル（ルビ付き）",
  "text": "問題本文（ルビ付き）",
  "image": "問題図のHTML",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctAnswer": 4,
  "explanation": {
    "main": "メイン解説",
    "choices": ["選択肢1の解説", "選択肢2の解説", ...]
  },
  "referenceImages": [...],
  "lawReferences": [...],
  "tip": "学習のコツ（英語）"
}
```

## 🔒 プライバシー

- ユーザーの学習データはブラウザのLocalStorageに保存されます
- サーバーにデータを送信することはありません
- 完全にオフラインで動作可能（初回読み込み後）

## 📄 ライセンス

MIT License

## 👥 制作

- **NL-DG Co., Ltd.**
- **Narukawa Co., Ltd.**

## 🙏 謝辞

問題データは全国建設研修センター（JCTS）の公式サイトで公開されている過去問・正答を参考にしています。

## 📞 お問い合わせ

ご質問、バグ報告、機能リクエストは[Issues](https://github.com/bmwz376-cmd/2-1-/issues)までお願いします。

---

**Good luck with your studies! / 勉強頑張ってください！**
