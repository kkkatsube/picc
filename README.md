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

# 統合Docker環境起動（Backend + Frontend + Database）
docker-compose up -d

# フロントエンドAPI型生成（初回のみ）
cd frontend && npm run generate-api
```

### アクセス先
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000/api
- **データベース**: localhost:5432 (PostgreSQL)
- **Redis**: localhost:6379

### 開発コマンド
```bash
# 環境確認
docker-compose ps

# ログ確認
docker-compose logs -f backend
docker-compose logs -f frontend

# 環境停止
docker-compose down
```

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
- [x] 開発環境セットアップ（Docker統合環境）
- [x] OpenAPI仕様書作成（基本認証API）
- [x] CI/CD パイプライン構築（GitHub Actions）
- [x] ヘルスチェックAPI実装・テスト環境整備
- [ ] 認証システム実装
- [ ] バックエンドAPI実装（フル機能）
- [ ] フロントエンドSPA実装
- [ ] インフラ構築（AWS）

## 🤝 貢献

このプロジェクトは学習目的ですが、改善提案は歓迎します：

1. Issue作成
2. Fork & Pull Request
3. [貢献ガイド](./CONTRIBUTING.md)を参照

## 🔒 セキュリティ注意事項

**現在のセキュリティ課題（実装予定）**:
- [ ] 環境変数の適切な管理（.env.local, Docker secrets等）
- [ ] 本番環境用DB認証情報の分離
- [ ] APP_KEY自動生成とローテーション
- [ ] Secrets管理システムの導入
- [ ] 開発/本番環境設定の完全分離

⚠️ **重要**: 現在は開発環境のため、DBパスワード等がプレーンテキストで管理されています。本番環境では適切なシークレット管理を実装予定です。

## 📄 ライセンス

[MIT License](./LICENSE)