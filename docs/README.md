# PICC Documentation

このディレクトリには、PICCプロジェクトの技術ドキュメントが含まれています。

## ドキュメント一覧

### 📋 基本ドキュメント
- **[architecture.md](./architecture.md)** - システム構成・技術スタック
- **[development.md](./development.md)** - 開発環境セットアップ手順
- **[deployment.md](./deployment.md)** - デプロイ・本番環境構築

### 🔌 API ドキュメント
- **[api/openapi.yml](./api/openapi.yml)** - OpenAPI仕様書（マスター）
- **[api/README.md](./api/README.md)** - API使用方法・認証

### 🏗️ インフラドキュメント
- **[infrastructure/terraform.md](./infrastructure/terraform.md)** - Terraform使用方法
- **[infrastructure/aws-setup.md](./infrastructure/aws-setup.md)** - AWS環境初期構築

## 読み進める順序

### 🔰 初回セットアップ時
1. [architecture.md](./architecture.md) - プロジェクト全体像の理解
2. [development.md](./development.md) - ローカル開発環境構築
3. [api/README.md](./api/README.md) - API仕様の理解

### 🚀 本番デプロイ時
1. [infrastructure/aws-setup.md](./infrastructure/aws-setup.md) - AWS初期設定
2. [infrastructure/terraform.md](./infrastructure/terraform.md) - インフラ構築
3. [deployment.md](./deployment.md) - アプリケーションデプロイ

## ドキュメント管理

- すべてのドキュメントはMarkdown形式
- 技術変更時は関連ドキュメントも更新
- バージョン管理はGitで実施
- プルリクエスト時にドキュメント更新も確認

## 貢献方法

ドキュメントの改善提案は以下の方法で：
1. Issue作成による改善提案
2. プルリクエストによる直接修正
3. 開発中に気づいた不整合の報告