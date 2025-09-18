# API Testing Scripts

VS Code REST Client用のAPIテストファイル集

## 📋 ファイル一覧

| ファイル | 用途 | 推奨度 |
|---------|------|--------|
| `api_test_robust.http` | 🌟 **メイン** - 堅牢なフルテスト | ⭐⭐⭐ |
| `api_test_improved.http` | 📝 段階的テスト（説明付き） | ⭐⭐ |
| `api_test.http` | 🔧 シンプル版 | ⭐ |
| `debug_step3.http` | 🔍 デバッグ専用 | 🛠️ |

## 🚀 使用方法

### 1. VS Code REST Client インストール
```bash
# VS Code拡張機能検索で "REST Client" をインストール
```

### 2. ファイルを開いてテスト実行
```bash
# 推奨: 堅牢版を使用
code scripts/api-testing/api_test_robust.http
```

### 3. 実行順序
1. **Health Check** - システム状態確認
2. **Smart Authentication** - 登録 or ログイン
3. **Protected Routes** - 認証必須エンドポイント
4. **Error Testing** - エラーケース確認

## 📝 前提条件

- Docker環境が起動していること（`docker-compose up -d`）
- APIサーバーが `http://localhost:8000` で稼働
- PostgreSQL・Redisコンテナが稼働中

## 🔧 トラブルシューティング

### Token取得エラー
```http
# 手動でトークンを設定
@token = YOUR_ACTUAL_TOKEN_HERE
```

### 変数が取得できない
1. 前のリクエストを先に実行
2. レスポンスが200番台であることを確認
3. 手動でトークンをコピー&ペースト

## 🔗 関連ファイル

- **自動テスト**: `../test_api.sh`
- **DB確認**: `../check_db.sh` 
- **API仕様**: `../../docs/api/openapi.yml`