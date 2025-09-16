# PICC Backend (Laravel API)

PHP 8.3 + Laravel 11 による RESTful API サーバー

## 🛠️ 技術スタック

- **PHP**: 8.3
- **フレームワーク**: Laravel 11
- **データベース**: PostgreSQL 15
- **キャッシュ**: Redis
- **認証**: Laravel Sanctum
- **テスト**: Pest v4 + PHPUnit
- **静的解析**: PHPStan Level 8 + Larastan
- **コードフォーマット**: Laravel Pint

## 🚀 セットアップ

### Docker環境（推奨）
```bash
# ルートディレクトリから統合環境起動
cd .. && docker-compose up -d

# コンテナ内でのコマンド実行
docker exec picc-backend-1 php artisan migrate
docker exec picc-backend-1 composer install
```

### 開発コマンド
```bash
# テスト実行
./vendor/bin/pest
./vendor/bin/phpunit

# 静的解析
./vendor/bin/phpstan analyse

# コードフォーマット
./vendor/bin/pint

# マイグレーション
php artisan migrate

# ヘルスチェック
curl http://localhost:8000/api/health
```

## 🔧 API エンドポイント

### ヘルスチェック
- **GET** `/api/health` - システム状態確認
  - データベース接続確認
  - Redis接続確認
  - パフォーマンス測定

### 認証（予定）
- **POST** `/api/auth/register` - ユーザー登録
- **POST** `/api/auth/login` - ログイン
- **POST** `/api/auth/logout` - ログアウト

## 📊 テスト・品質管理

### テスト構成
- **Unit Tests**: `tests/Unit/` - サービス・ユーティリティクラス
- **Feature Tests**: `tests/Feature/` - HTTP API エンドポイント
- **カバレッジ**: GitHub Actions CI で自動測定

### コード品質
- **PHPStan Level 8**: 最高レベルの静的解析
- **Laravel Pint**: PSR-12準拠コードフォーマット
- **GitHub Actions**: PR時の自動品質チェック

## 🔒 セキュリティ

### 現在の設定
- **APP_KEY**: 開発環境用（本番では要変更）
- **DB認証**: 開発環境デフォルト値
- **Redis**: パスワードなし設定

### 実装予定
- [ ] Laravel Sanctum認証システム
- [ ] 本番環境用シークレット管理
- [ ] セキュリティヘッダー設定
- [ ] レート制限設定

## 📁 ディレクトリ構成

```
backend/
├── app/
│   ├── Http/Controllers/     # API コントローラー
│   ├── Services/            # ビジネスロジック
│   └── Models/              # Eloquent モデル
├── tests/
│   ├── Unit/               # 単体テスト
│   └── Feature/            # 機能テスト
├── config/                 # 設定ファイル
└── database/
    ├── migrations/         # DBマイグレーション
    └── seeders/           # テストデータ
```

## 🔗 関連ドキュメント

- [プロジェクトルート README](../README.md)
- [API仕様書](../docs/api/openapi.yml)
- [システム構成](../docs/architecture.md)
