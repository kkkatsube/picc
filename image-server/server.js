const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const IMAGES_DIR = process.env.IMAGE_DIRECTORY;

// 画像拡張子の判定
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

// CORS設定（すべてのオリジンから許可）
app.use(cors());

/**
 * 指定ディレクトリ以下の画像ファイルを再帰的に取得
 * @param {string} dir - スキャンするディレクトリパス
 * @returns {string[]} - 画像ファイルの絶対パスリスト
 */
function getAllImages(dir) {
  const files = [];

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        // サブディレクトリを再帰的にスキャン
        files.push(...getAllImages(fullPath));
      } else if (IMAGE_EXTENSIONS.test(item.name)) {
        // 画像ファイルを追加
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * 配列からランダムにN件取得
 * @param {Array} array - 元の配列
 * @param {number} count - 取得件数
 * @returns {Array} - ランダムに選ばれた要素
 */
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * GET /random?count=N
 * ランダムに画像をN件取得
 */
app.get('/random', (req, res) => {
  if (!IMAGES_DIR) {
    return res.status(500).json({
      error: 'IMAGE_DIRECTORY is not configured in .env'
    });
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    return res.status(500).json({
      error: `IMAGE_DIRECTORY does not exist: ${IMAGES_DIR}`
    });
  }

  const count = parseInt(req.query.count) || 10;

  try {
    // すべての画像を取得
    const allImages = getAllImages(IMAGES_DIR);

    if (allImages.length === 0) {
      return res.json([]);
    }

    // ランダムに選択
    const randomImages = getRandomItems(allImages, count);

    // レスポンス形式に整形
    const response = randomImages.map(filePath => {
      const relativePath = path.relative(IMAGES_DIR, filePath);
      return {
        id: path.basename(filePath),
        url: `http://localhost:${PORT}/images/${relativePath.replace(/\\/g, '/')}`
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error processing random images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /images/:path
 * 画像ファイルの静的配信
 */
app.use('/images', express.static(IMAGES_DIR));

/**
 * GET /health
 * ヘルスチェックエンドポイント
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    imageDirectory: IMAGES_DIR,
    imageDirectoryExists: fs.existsSync(IMAGES_DIR)
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('PICC Image Server');
  console.log('='.repeat(50));
  console.log(`Server running on port: ${PORT}`);
  console.log(`Image directory: ${IMAGES_DIR || 'NOT CONFIGURED'}`);

  if (IMAGES_DIR && fs.existsSync(IMAGES_DIR)) {
    const imageCount = getAllImages(IMAGES_DIR).length;
    console.log(`Total images found: ${imageCount}`);
  } else if (!IMAGES_DIR) {
    console.warn('⚠️  WARNING: IMAGE_DIRECTORY not set in .env');
  } else {
    console.warn(`⚠️  WARNING: IMAGE_DIRECTORY does not exist: ${IMAGES_DIR}`);
  }

  console.log('='.repeat(50));
  console.log('Endpoints:');
  console.log(`  GET http://localhost:${PORT}/random?count=10`);
  console.log(`  GET http://localhost:${PORT}/images/:path`);
  console.log(`  GET http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});
