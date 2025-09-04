# PICC

PICCは現代的なWebアプリケーション開発技術をキャッチアップするためのフルスタック学習プロジェクトです。

## 🎯 プロジェクト概要

10年のブランクからのWebアプリケーション開発復帰を目的とし、以下の現代的技術スタックを採用：

- **バックエンド**: PHP 8.3 + Laravel 11 (RESTful API)
- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **インフラ**: AWS + Docker + Terraform (IaC)
- **API設計**: OpenAPI 3.0 (Design First)

## 🚀 クイックスタート

### 前提条件
- Docker Desktop
- Node.js 20+
- Git

### ローカル開発環境起動
```bash
# リポジトリクローン
git clone https://github.com/your-username/picc.git
cd picc

# 開発環境起動
docker-compose up -d

# フロントエンド開発サーバー起動
cd frontend
npm install
npm run dev
```

- **API**: http://localhost:8000/api
- **フロントエンド**: http://localhost:3000
- **API ドキュメント**: http://localhost:8000/docs

## 📚 ドキュメント

詳細なドキュメントは [docs/](./docs/) ディレクトリを参照：

- **[システム構成](./docs/architecture.md)** - 技術スタック・アーキテクチャ
- **[開発環境](./docs/development.md)** - セットアップ・開発手順
- **[API仕様](./docs/api/)** - OpenAPI仕様書・使用方法
- **[インフラ](./docs/infrastructure/)** - Terraform・AWS設定

## 🛠️ 技術スタック

### バックエンド
- PHP 8.3 + Laravel 11
- PostgreSQL 15 + Redis
- Laravel Sanctum (認証)
- Pest + PHPUnit (テスト)

### フロントエンド
- React 18 + TypeScript
- Vite (ビルドツール)
- Tailwind CSS + Heroicons
- React Query + Zustand

### 開発・インフラ
- Docker + Laravel Sail
- Terraform (IaC)
- GitHub Actions (CI/CD)
- AWS (ECS, RDS, S3, CloudFront)

## 🎯 学習目標

このプロジェクトを通じて習得する技術：

- [x] **API First開発**: OpenAPI仕様書駆動開発
- [x] **型安全開発**: TypeScript + 自動型生成
- [x] **コンテナ化**: Docker開発環境
- [x] **クラウド開発**: AWS + Infrastructure as Code
- [x] **現代的UI**: React + Tailwind CSS
- [x] **CI/CD**: 自動テスト・デプロイ

## 📝 開発状況

- [x] 技術選定・アーキテクチャ設計
- [ ] 開発環境セットアップ
- [ ] OpenAPI仕様書作成
- [ ] バックエンドAPI実装
- [ ] フロントエンドSPA実装
- [ ] インフラ構築
- [ ] CI/CD パイプライン構築

## 🤝 貢献

このプロジェクトは学習目的ですが、改善提案は歓迎します：

1. Issue作成
2. Fork & Pull Request
3. [貢献ガイド](./CONTRIBUTING.md)を参照

## 📄 ライセンス

[MIT License](./LICENSE)