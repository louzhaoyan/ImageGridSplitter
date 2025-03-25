# Image Grid Splitter

一个简单易用的图片九宫格切割工具，支持Vue和React框架。

## 功能特点

- 支持将图片切割成九宫格或任意网格
- 两种切割模式：居中裁剪和原比例拉伸
- 适配Vue 3和React
- 自定义输出格式和质量
- 支持预览网格线

## 安装

```bash
npm install image-grid-splitter
# 或使用yarn
yarn add image-grid-splitter
```

## 在Vue 3中使用

### 基本用法

```vue
<template>
  <div>
    <input type="file" accept="image/*" @change="handleImageUpload" />
    
    <div class="mode-select">
      <label>切割模式：</label>
      <select v-model="mode">
        <option value="crop">居中裁剪</option>
        <option value="stretch">保持原比例</option>
      </select>
    </div>
    
    <button @click="splitImage" :disabled="!imageFile">切割图片</button>
    
    <div class="grid-container">
      <div v-for="(piece, index) in gridPieces" :key="index" class="grid-item">
        <img :src="piece.dataUrl" :alt="`片段 ${index + 1}`" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ImageGridSplitter, SplitMode, GridPiece } from 'image-grid-splitter';

export default defineComponent({
  name: 'ImageSplitter',
  setup() {
    const imageFile = ref<File | null>(null);
    const mode = ref<SplitMode>('crop');
    const gridPieces = ref<GridPiece[]>([]);
    
    const handleImageUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        imageFile.value = input.files[0];
      }
    };
    
    const splitImage = async () => {
      if (!imageFile.value) return;
      
      const splitter = new ImageGridSplitter({
        mode: mode.value,
        rows: 3,
        cols: 3
      });
      
      try {
        gridPieces.value = await splitter.split(imageFile.value);
      } catch (error) {
        console.error('图片切割失败:', error);
      }
    };
    
    return {
      imageFile,
      mode,
      gridPieces,
      handleImageUpload,
      splitImage
    };
  }
});
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  margin-top: 20px;
}
.grid-item {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #eee;
}
.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

## 在React中使用

### 基本用法

```tsx
import React, { useState, ChangeEvent } from 'react';
import { ImageGridSplitter, SplitMode, GridPiece } from 'image-grid-splitter';

const ImageSplitter: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>('crop');
  const [gridPieces, setGridPieces] = useState<GridPiece[]>([]);
  
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    }
  };
  
  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as SplitMode);
  };
  
  const splitImage = async () => {
    if (!imageFile) return;
    
    const splitter = new ImageGridSplitter({
      mode,
      rows: 3,
      cols: 3
    });
    
    try {
      const pieces = await splitter.split(imageFile);
      setGridPieces(pieces);
    } catch (error) {
      console.error('图片切割失败:', error);
    }
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      
      <div className="mode-select">
        <label>切割模式：</label>
        <select value={mode} onChange={handleModeChange}>
          <option value="crop">居中裁剪</option>
          <option value="stretch">保持原比例</option>
        </select>
      </div>
      
      <button onClick={splitImage} disabled={!imageFile}>
        切割图片
      </button>
      
      <div className="grid-container">
        {gridPieces.map((piece, index) => (
          <div key={index} className="grid-item">
            <img src={piece.dataUrl} alt={`片段 ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSplitter;
```

## 高级用法

### 自定义网格数量

```typescript
// 创建4x5的网格
const splitter = new ImageGridSplitter({
  mode: 'crop',
  rows: 4,
  cols: 5
});

const gridPieces = await splitter.split(imageFile);
// 将返回20个图片切片
```

### 自定义输出格式和质量

```typescript
const splitter = new ImageGridSplitter({
  outputFormat: 'image/jpeg',
  quality: 0.9 // 90%质量
});

const gridPieces = await splitter.split(imageFile);
```

### 获取预览网格线

```typescript
const splitter = new ImageGridSplitter({
  rows: 3,
  cols: 3
});

const gridLines = splitter.getPreviewGridLines();
// 返回 { horizontal: [33.33, 66.67], vertical: [33.33, 66.67] }
// 这些值可以用于在UI中绘制预览网格线
```

## 在Node.js服务端使用

在Node.js环境中，由于没有DOM API，需要使用额外的图像处理库，如`canvas`。

### 安装依赖

```bash
npm install image-grid-splitter canvas
# 或使用yarn
yarn add image-grid-splitter canvas
```

### 基本用法

```javascript
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { ImageGridSplitter } = require('image-grid-splitter');

// 初始化全局canvas环境
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return createCanvas(1, 1);
    }
  }
};
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  set src(src) {
    loadImage(src).then(img => {
      this.naturalWidth = img.width;
      this.naturalHeight = img.height;
      if (this.onload) this.onload();
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
};

// 切割图片函数
async function splitImageToGrid(inputImagePath, outputDir) {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 创建切割器实例
  const splitter = new ImageGridSplitter({
    mode: 'crop',
    rows: 3,
    cols: 3,
    outputFormat: 'image/png',
    quality: 0.9
  });
  
  try {
    // 切割图片
    const gridPieces = await splitter.split(inputImagePath);
    
    // 保存切割后的图片
    gridPieces.forEach((piece, index) => {
      // 将dataURL转换为Buffer
      const base64Data = piece.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // 保存文件
      const outputPath = path.join(outputDir, `piece_${piece.row}_${piece.col}.png`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`保存图片: ${outputPath}`);
    });
    
    return gridPieces;
  } catch (error) {
    console.error('图片切割失败:', error);
    throw error;
  }
}

// 使用示例
async function main() {
  const inputImage = '/path/to/your/image.jpg';
  const outputDir = '/path/to/output/directory';
  
  try {
    await splitImageToGrid(inputImage, outputDir);
    console.log('图片切割完成!');
  } catch (error) {
    console.error('处理失败:', error);
  }
}

main();
```

### 在Express应用中使用

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { ImageGridSplitter } = require('image-grid-splitter');

// 初始化全局canvas环境
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return createCanvas(1, 1);
    }
  }
};
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  
  set src(src) {
    loadImage(src).then(img => {
      this.naturalWidth = img.width;
      this.naturalHeight = img.height;
      if (this.onload) this.onload();
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
};

const app = express();
const port = 3000;

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 处理文件上传和图片切割
app.post('/split-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('没有上传文件');
  }
  
  const outputDir = path.join(__dirname, 'output', Date.now().toString());
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // 创建切割器
    const splitter = new ImageGridSplitter({
      mode: req.body.mode || 'crop',
      rows: parseInt(req.body.rows || '3'),
      cols: parseInt(req.body.cols || '3'),
      quality: parseFloat(req.body.quality || '0.8')
    });
    
    // 切割图片
    const gridPieces = await splitter.split(req.file.path);
    
    // 保存切割后的图片
    const pieceFiles = [];
    for (let i = 0; i < gridPieces.length; i++) {
      const piece = gridPieces[i];
      const base64Data = piece.dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `piece_${piece.row}_${piece.col}.png`;
      const filePath = path.join(outputDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      pieceFiles.push({
        fileName,
        path: `/output/${path.basename(outputDir)}/${fileName}`,
        row: piece.row,
        col: piece.col
      });
    }
    
    res.json({
      success: true,
      message: '图片切割成功',
      pieces: pieceFiles
    });
  } catch (error) {
    console.error('图片切割失败:', error);
    res.status(500).send('图片处理失败');
  }
});

// 提供静态文件访问
app.use('/output', express.static(path.join(__dirname, 'output')));

app.listen(port, () => {
  console.log(`服务运行在 http://localhost:${port}`);
});
```

## API参考

### ImageGridSplitterOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| mode | 'crop' \| 'stretch' | 'crop' | 切割模式 |
| rows | number | 3 | 垂直方向的格子数量 |
| cols | number | 3 | 水平方向的格子数量 |
| outputFormat | string | 'image/png' | 输出图片的格式 |
| quality | number | 0.8 | 输出图片的质量 (0-1) |

### GridPiece

| 属性 | 类型 | 描述 |
|------|------|------|
| dataUrl | string | 图片数据URL |
| row | number | 行索引 |
| col | number | 列索引 |
| width | number | 宽度（像素） |
| height | number | 高度（像素） |

### 方法

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| split | File \| Blob \| HTMLImageElement \| string | Promise<GridPiece[]> | 切割图片 |
| getPreviewGridLines | 无 | { horizontal: number[], vertical: number[] } | 获取预览网格线 |

## 许可证

MIT
