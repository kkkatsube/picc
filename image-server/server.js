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
 * GET /folders?path=xxx
 * 指定パス配下のサブフォルダ一覧を取得
 */
app.get('/folders', (req, res) => {
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

  const currentPath = req.query.path || '';
  const fullPath = path.join(IMAGES_DIR, currentPath);

  // セキュリティ: パストラバーサル防止
  const normalizedFull = path.normalize(fullPath);
  const normalizedBase = path.normalize(IMAGES_DIR);

  if (!normalizedFull.startsWith(normalizedBase)) {
    return res.status(403).json({ error: 'Invalid path: Access denied' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Path not found' });
  }

  try {
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const folders = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: currentPath ? `${currentPath}/${item.name}` : item.name
      }));

    res.json({
      folders,
      currentPath
    });
  } catch (error) {
    console.error('Error reading folders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /random?count=N&path=xxx&sort=random|asc|desc&skip=N
 * 画像をN件取得（指定パス配下から、ソート順指定可能）
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
  const skip = parseInt(req.query.skip) || 0;
  const currentPath = req.query.path || '';
  const sort = req.query.sort || 'random'; // 'random' | 'asc' | 'desc'
  const fullPath = path.join(IMAGES_DIR, currentPath);

  // セキュリティ: パストラバーサル防止
  const normalizedFull = path.normalize(fullPath);
  const normalizedBase = path.normalize(IMAGES_DIR);

  if (!normalizedFull.startsWith(normalizedBase)) {
    return res.status(403).json({ error: 'Invalid path: Access denied' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Path not found' });
  }

  try {
    // 指定パス以下の画像を取得
    const allImages = getAllImages(fullPath);

    if (allImages.length === 0) {
      return res.json([]);
    }

    let selectedImages;
    if (sort === 'random') {
      // ランダムに選択（skipは無視）
      selectedImages = getRandomItems(allImages, count);
    } else {
      // ファイルの stat を取得して timestamp でソート
      const imagesWithStats = allImages.map(filePath => ({
        path: filePath,
        mtime: fs.statSync(filePath).mtime.getTime()
      }));

      // ソート
      imagesWithStats.sort((a, b) => {
        return sort === 'asc' ? a.mtime - b.mtime : b.mtime - a.mtime;
      });

      // skip件スキップしてcount件取得
      selectedImages = imagesWithStats.slice(skip, skip + count).map(item => item.path);
    }

    // レスポンス形式に整形
    const response = selectedImages.map(filePath => {
      const relativePath = path.relative(IMAGES_DIR, filePath);
      return {
        id: path.basename(filePath),
        url: `http://${req.get('host')}/images/${relativePath.replace(/\\/g, '/')}`
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error processing images:', error);
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

// サーバー起動（全ネットワークインターフェースでリッスン）
app.listen(PORT, '0.0.0.0', () => {
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
  console.log(`  GET http://localhost:${PORT}/random?count=10&path=folder`);
  console.log(`  GET http://localhost:${PORT}/folders?path=folder`);
  console.log(`  GET http://localhost:${PORT}/images/:path`);
  console.log(`  GET http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});
