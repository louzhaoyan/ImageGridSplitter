# 图片9宫格切割插件使用示例

## 安装

```bash
# 如果你使用npm打包发布到npm仓库后
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
