/**
 * ImageGridSplitter
 * 图片宫格切割工具，支持Vue 3和React
 */

// 定义切割模式类型
export type SplitMode = 'crop' | 'stretch';

// 定义配置选项接口
export interface ImageGridSplitterOptions {
  /**
   * 切割模式:
   * - crop: 居中裁剪，确保每个切片都是正方形
   * - stretch: 拉伸，保持原始图片比例
   * @default 'crop'
   */
  mode?: SplitMode;
  
  /**
   * 水平方向的格子数量
   * @default 3
   */
  cols?: number;
  
  /**
   * 垂直方向的格子数量
   * @default 3
   */
  rows?: number;
  
  /**
   * 输出图片的格式
   * @default 'image/png'
   */
  outputFormat?: string;
  
  /**
   * 输出图片的质量 (0-1)
   * @default 0.8
   */
  quality?: number;
}

// 图片切片结果接口
export interface GridPiece {
  /**
   * 图片数据URL
   */
  dataUrl: string;
  
  /**
   * 行索引
   */
  row: number;
  
  /**
   * 列索引
   */
  col: number;
  
  /**
   * 宽度（像素）
   */
  width: number;
  
  /**
   * 高度（像素）
   */
  height: number;
}

/**
 * 图片宫格切割类
 */
export class ImageGridSplitter {
  private options: Required<ImageGridSplitterOptions>;
  
  /**
   * 创建图片切割器实例
   */
  constructor(options: ImageGridSplitterOptions = {}) {
    // 设置默认选项
    this.options = {
      mode: options.mode || 'crop',
      cols: options.cols || 3,
      rows: options.rows || 3,
      outputFormat: options.outputFormat || 'image/png',
      quality: options.quality !== undefined ? options.quality : 0.8
    };
  }
  
  /**
   * 切割图片
   * @param imageSource - 图片源 (File, Blob, HTMLImageElement 或 图片URL)
   * @returns Promise，解析为切割后的图片数组
   */
  async split(imageSource: File | Blob | HTMLImageElement | string): Promise<GridPiece[]> {
    // 加载图片
    const image = await this.loadImage(imageSource);
    
    // 创建一个离屏Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }
    
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    
    // 根据切割模式决定处理方式
    if (this.options.mode === 'crop') {
      return this.cropAndSplit(image, canvas, ctx);
    } else {
      return this.stretchAndSplit(image, canvas, ctx);
    }
  }
  
  /**
   * 获取预览网格线数据
   * 可以用于在UI上显示切割预览
   */
  getPreviewGridLines(): { horizontal: number[], vertical: number[] } {
    const horizontal = [];
    const vertical = [];
    
    // 计算水平线的位置（百分比）
    for (let i = 1; i < this.options.rows; i++) {
      horizontal.push(i * (100 / this.options.rows));
    }
    
    // 计算垂直线的位置（百分比）
    for (let i = 1; i < this.options.cols; i++) {
      vertical.push(i * (100 / this.options.cols));
    }
    
    return { horizontal, vertical };
  }
  
  /**
   * 居中裁剪模式下的切割
   */
  private cropAndSplit(
    image: HTMLImageElement, 
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D
  ): GridPiece[] {
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    
    // 计算裁剪尺寸，保证是正方形
    const size = Math.min(imgWidth, imgHeight);
    const offsetX = (imgWidth - size) / 2;
    const offsetY = (imgHeight - size) / 2;
    
    // 设置canvas为正方形
    canvas.width = size;
    canvas.height = size;
    
    // 在canvas上绘制原图的正方形部分
    ctx.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);
    
    // 每个格子的大小
    const gridWidth = Math.floor(size / this.options.cols);
    const gridHeight = Math.floor(size / this.options.rows);
    
    // 切割结果
    const result: GridPiece[] = [];
    
    // 切割图片
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.cols; col++) {
        const x = col * gridWidth;
        const y = row * gridHeight;
        
        // 创建新的canvas来存储每个宫格
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = gridWidth;
        gridCanvas.height = gridHeight;
        const gridCtx = gridCanvas.getContext('2d');
        
        if (gridCtx) {
          // 从原canvas中截取对应区域
          gridCtx.drawImage(
            canvas, 
            x, y, gridWidth, gridHeight,
            0, 0, gridWidth, gridHeight
          );
          
          // 转换为图片
          const dataUrl = gridCanvas.toDataURL(this.options.outputFormat, this.options.quality);
          
          result.push({
            dataUrl,
            row,
            col,
            width: gridWidth,
            height: gridHeight
          });
        }
      }
    }
    
    return result;
  }
  
  /**
   * 拉伸模式下的切割
   */
  private stretchAndSplit(
    image: HTMLImageElement, 
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D
  ): GridPiece[] {
    const imgWidth = image.naturalWidth;
    const imgHeight = image.naturalHeight;
    
    // 设置canvas为原图大小
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    
    // 在canvas上绘制原图
    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);
    
    // 计算每个宫格的尺寸
    const gridWidth = Math.floor(imgWidth / this.options.cols);
    const gridHeight = Math.floor(imgHeight / this.options.rows);
    
    // 切割结果
    const result: GridPiece[] = [];
    
    // 切割图片
    for (let row = 0; row < this.options.rows; row++) {
      for (let col = 0; col < this.options.cols; col++) {
        const x = col * gridWidth;
        const y = row * gridHeight;
        
        // 创建新的canvas来存储每个宫格
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = gridWidth;
        gridCanvas.height = gridHeight;
        const gridCtx = gridCanvas.getContext('2d');
        
        if (gridCtx) {
          // 从原canvas中截取对应区域
          gridCtx.drawImage(
            canvas, 
            x, y, gridWidth, gridHeight,
            0, 0, gridWidth, gridHeight
          );
          
          // 转换为图片
          const dataUrl = gridCanvas.toDataURL(this.options.outputFormat, this.options.quality);
          
          result.push({
            dataUrl,
            row,
            col,
            width: gridWidth,
            height: gridHeight
          });
        }
      }
    }
    
    return result;
  }
  
  /**
   * 加载图片
   */
  private loadImage(source: File | Blob | HTMLImageElement | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      // 如果已经是 HTMLImageElement，直接返回
      if (source instanceof HTMLImageElement) {
        if (source.complete) {
          resolve(source);
        } else {
          source.onload = () => resolve(source);
          source.onerror = reject;
        }
        return;
      }
      
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      
      // 根据源类型，设置图片地址
      if (typeof source === 'string') {
        img.src = source;
      } else {
        // File 或 Blob
        img.src = URL.createObjectURL(source);
      }
    });
  }
}

// 默认导出
export default ImageGridSplitter;
