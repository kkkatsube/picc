# PICC Frontend (React SPA)

React 18 + TypeScript + Vite による モダンSPA

## 🛠️ 技術スタック

- **React**: 18 (最新LTS)
- **TypeScript**: 厳密型チェック
- **ビルドツール**: Vite (高速HMR)
- **スタイリング**: Tailwind CSS + Heroicons
- **状態管理**: React Query (サーバー) + Zustand (クライアント)
- **HTTP Client**: Axios (型安全API通信)
- **ルーティング**: React Router
- **テスト**: Vitest + React Testing Library

## 🚀 セットアップ

### Docker環境（推奨）
```bash
# ルートディレクトリから統合環境起動
cd .. && docker-compose up -d

# 開発サーバーにアクセス
open http://localhost:3000
```

### ローカル開発
```bash
# 依存関係インストール
npm install

# API型生成（初回のみ）
npm run generate-api

# 開発サーバー起動
npm run dev
```

## 🔧 開発コマンド

```bash
# テスト実行
npm run test

# 型チェック
npm run type-check

# ESLint（品質チェック）
npm run lint

# ビルド
npm run build

# API型生成（OpenAPIから）
npm run generate-api
```

## 📊 テスト・品質管理

### テスト構成
- **Unit Tests**: コンポーネント・フック単体テスト
- **Integration Tests**: API通信・ルーティング
- **カバレッジ**: GitHub Actions CI で自動測定

### コード品質
- **TypeScript Strict**: 厳密型チェック有効
- **ESLint v9**: 最新フラット設定
- **Prettier**: 自動フォーマット
- **GitHub Actions**: PR時の自動品質チェック

## 🎨 UI/UXデザイン

### デザインシステム
- **Tailwind CSS**: ユーティリティファースト
- **Heroicons**: 統一アイコンセット
- **レスポンシブ**: モバイルファースト設計
- **ダークモード**: 対応予定

### コンポーネント設計
- **Atomic Design**: 再利用可能コンポーネント
- **TypeScript**: Props型定義必須
- **Storybook**: コンポーネントカタログ（予定）

## 🔗 API統合

### 型安全通信
- **OpenAPI生成**: バックエンドAPI仕様から自動型生成
- **Axios**: HTTP クライアント
- **React Query**: サーバー状態管理・キャッシュ

```bash
# API型の再生成
npm run generate-api
```

## 📁 ディレクトリ構成

```
frontend/
├── src/
│   ├── components/         # 再利用コンポーネント
│   ├── pages/             # ページコンポーネント
│   ├── hooks/             # カスタムフック
│   ├── api/               # API通信（自動生成）
│   ├── stores/            # Zustand ストア
│   ├── types/             # 型定義
│   └── test/              # テストユーティリティ
├── public/                # 静的ファイル
└── tests/                 # テストファイル
```

## 🔗 関連ドキュメント

- [プロジェクトルート README](../README.md)
- [API仕様書](../docs/api/openapi.yml)
- [システム構成](../docs/architecture.md)