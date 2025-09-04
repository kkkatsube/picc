# PICC システム構成

## 概要

PICCは現代的なWebアプリケーション開発をキャッチアップするためのフルスタック学習プロジェクトです。
バックエンドとフロントエンドを完全分離したRESTful API構成を採用し、コンテナ化とInfrastructure as Codeによる現代的な開発・運用環境を実現します。

## アーキテクチャ図

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│   Frontend      │ ◄─────────────► │   Backend       │
│   (React SPA)   │                 │   (Laravel API) │
└─────────────────┘                 └─────────────────┘
           │                                 │
    ┌──────▼──────┐                 ┌──────▼──────┐
    │ S3+CloudFront│                 │ ECS Fargate │
    │              │                 │ PostgreSQL  │
    │              │                 │ Redis       │
    └─────────────┘                 └─────────────┘
```

## 技術スタック

### バックエンド（Laravel API）

| 分類 | 技術 | バージョン | 用途 |
|------|------|------------|------|
| 言語・フレームワーク | PHP | 8.3 | サーバーサイド言語 |
| | Laravel | 11 | Webアプリケーションフレームワーク |
| API設計 | Laravel API Resources | - | RESTful APIレスポンス整形 |
| 認証 | Laravel Sanctum | - | SPA認証システム |
| データベース | PostgreSQL | 15 | メインデータベース |
| | Redis | - | キャッシュ・セッション管理 |
| テスト | Pest | - | メインテストフレームワーク |
| | PHPUnit | - | 追加テスト機能 |
| 静的解析 | PHPStan/Larastan | - | コード品質管理 |
| コード品質 | Laravel Pint | - | コードフォーマッター |

### フロントエンド（React SPA）

| 分類 | 技術 | バージョン | 用途 |
|------|------|------------|------|
| 言語・フレームワーク | TypeScript | - | 型安全な開発言語 |
| | React | 18 | UIライブラリ |
| | Vite | - | 高速ビルドツール（HMR対応） |
| スタイリング | Tailwind CSS | - | ユーティリティファーストCSS |
| | Heroicons | - | SVGアイコンライブラリ |
| HTTP通信 | Axios | - | HTTPクライアント |
| ルーティング | React Router | - | SPA内ルーティング |
| 状態管理 | React Query | - | サーバー状態管理 |
| | Zustand | - | クライアント状態管理 |
| テスト | Vitest | - | 高速テストランナー |
| | React Testing Library | - | Reactコンポーネントテスト |
| コード品質 | ESLint | - | 静的解析 |
| | Prettier | - | コードフォーマッター |

### API設計・ドキュメント

| 分類 | 技術 | バージョン | 用途 |
|------|------|------------|------|
| 仕様書 | OpenAPI | 3.0 | API仕様定義（YAML手動作成） |
| 型生成 | openapi-typescript-codegen | - | TypeScript型自動生成 |
| ドキュメント | Swagger UI | - | APIドキュメント表示 |

### 開発環境

| 分類 | 技術 | バージョン | 用途 |
|------|------|------------|------|
| コンテナ化 | Docker Compose | - | ローカル開発環境 |
| バックエンド | Laravel Sail | - | Laravel開発コンテナ |
| フロントエンド | Node.js | 20 | JavaScript実行環境 |
| データベース | PostgreSQL | 15 | 開発用データベース |
| キャッシュ | Redis | - | 開発用キャッシュ |

### Infrastructure as Code

| 分類 | 技術 | バージョン | 用途 |
|------|------|------------|------|
| IaC | Terraform | 1.6+ | インフラコード管理 |
| 言語 | HCL | - | Terraform設定言語 |
| State管理 | S3 + DynamoDB | - | Terraformstate保存・ロック |

### 本番インフラ（AWS）

| 分類 | 技術 | 用途 |
|------|------|------|
| コンテナ | ECS Fargate | バックエンドコンテナ実行 |
| データベース | RDS Aurora PostgreSQL | 本番データベース |
| キャッシュ | ElastiCache Redis | 本番キャッシュ |
| CDN | S3 + CloudFront | フロントエンド配信 |
| ネットワーク | VPC | 仮想プライベートクラウド |
| 監視 | CloudWatch | システム監視・ログ |
| ロードバランサ | ALB | アプリケーションロードバランサ |

### CI/CD

| 分類 | 技術 | 用途 |
|------|------|------|
| CI/CD | GitHub Actions | 自動テスト・デプロイ |
| 静的解析 | PHPStan + TypeScript | コード品質チェック |
| インフラCI | Terraform Plan/Apply | インフラ自動化 |

## ディレクトリ構成

```
picc/
├── docs/                       # ドキュメント
│   ├── architecture.md         # 本ドキュメント
│   ├── development.md          # 開発環境セットアップ
│   ├── api/
│   │   └── openapi.yml         # OpenAPI仕様書
│   └── infrastructure/
│       └── terraform.md        # Terraform使用方法
├── backend/                    # Laravel API
│   ├── app/
│   │   └── Http/Resources/     # API Resources
│   ├── routes/api.php          # APIルート定義
│   ├── tests/                  # バックエンドテスト
│   └── docker-compose.yml      # Laravel Sail設定
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/               # 自動生成API Client
│   │   ├── components/        # Reactコンポーネント
│   │   └── pages/             # ページコンポーネント
│   ├── package.json           # Node.js依存関係
│   └── vite.config.ts         # Vite設定
├── infrastructure/             # Terraform IaC
│   ├── modules/               # 再利用可能モジュール
│   │   ├── vpc/
│   │   ├── rds/
│   │   ├── ecs/
│   │   └── s3-cloudfront/
│   ├── environments/          # 環境別設定
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── shared/               # 共通リソース
├── docker-compose.yml        # ローカル開発環境
├── .github/workflows/        # CI/CD Pipeline
├── README.md                 # プロジェクト概要
└── CONTRIBUTING.md           # 開発ガイド
```

## 開発フロー

### Design First API開発

1. **API仕様設計**: `docs/api/openapi.yml` を手動作成
2. **型生成**: `npm run generate-api` でTypeScript型自動生成
3. **バックエンド実装**: Laravel API Resources使用
4. **フロントエンド実装**: 生成された型安全なAPI Client使用
5. **テスト**: 両端でのユニット・統合テスト

### インフラ管理

1. **ローカル開発**: Docker Compose環境
2. **インフラコード**: Terraform HCLでAWSリソース定義
3. **環境管理**: dev/staging/production環境別設定
4. **デプロイ**: GitHub ActionsによるCI/CD自動化

## セキュリティ考慮事項

- Laravel Sanctum による SPA認証
- AWSセキュリティグループによるネットワーク制限
- IAM最小権限原則
- HTTPS/TLS暗号化通信
- 環境変数による機密情報管理

## パフォーマンス考慮事項

- Redis キャッシュ活用
- CDN（CloudFront）による静的配信高速化
- DB クエリ最適化（Laravel Eloquent）
- React Query によるAPI レスポンスキャッシュ
- Vite による高速ビルド・HMR

## 監視・運用

- CloudWatch によるシステムメトリクス監視
- ALB ヘルスチェック
- アプリケーションレベルログ出力
- Terraform による設定変更履歴管理

## 学習目標

本プロジェクトを通じて以下の現代的Web開発技術をキャッチアップする：

### フルスタック開発
- RESTful API設計・実装
- SPA（Single Page Application）開発
- API First開発手法

### 現代的開発環境
- Docker コンテナ化
- Hot Module Replacement (HMR)
- 型安全プログラミング（TypeScript）

### クラウド・インフラ
- Infrastructure as Code (Terraform)
- AWS マネージドサービス活用
- CI/CD パイプライン構築

### 品質管理
- 静的解析・テスト自動化
- コード品質管理
- Git ベース開発フロー

---

**作成日**: 2025-01-09  
**バージョン**: 1.0  
**更新者**: 開発チーム