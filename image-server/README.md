# PICC Image Server

ローカル画像フォルダから画像をランダムに取得するシンプルなHTTPサーバー

## セットアップ

1. 依存パッケージのインストール
```bash
npm install
```

2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集してIMAGE_DIRECTORYに画像フォルダのパスを設定
```

3. サーバー起動
```bash
npm start
```

## API

### `GET /random?count=N`

指定したフォルダ以下から画像をランダムにN件取得

**パラメータ**
- `count` (optional): 取得件数（デフォルト: 10）

**レスポンス例**
```json
[
  {
    "id": "image1.jpg",
    "url": "http://localhost:3001/images/subfolder/image1.jpg"
  },
  {
    "id": "image2.png",
    "url": "http://localhost:3001/images/image2.png"
  }
]
```

### `GET /images/:path`

指定パスの画像を直接取得（静的ファイル配信）

## 対応画像形式

- .jpg / .jpeg
- .png
- .gif
- .webp

## 注意事項

- IMAGE_DIRECTORYで指定したフォルダ以下を再帰的にスキャンします
- ランダム取得は完全ランダム（重複の可能性あり）
- CORS設定済み（すべてのオリジンから許可）
