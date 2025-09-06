FROM node:20-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係インストール（package-lock.jsonがない場合はnpm install使用）
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

CMD ["npm", "run", "dev"]