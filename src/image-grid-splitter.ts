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
  private options: ImageGridSplitterOptions;

  constructor(options: ImageGridSplitterOptions = {}) {
    this.options = {
      mode: 'crop',
      cols: 3,
      rows: 3,
      outputFormat: 'image/png',
      quality: 0.8,
      ...options
    };
  }

  /**
   * 切割图片
   * @param image 图片文件或URL
   * @returns 切片数组
   */
  async split(image: File | Blob | HTMLImageElement | string): Promise<GridPiece[]> {
    // ...existing code...
  }

  /**
   * 获取预览网格线
   * @returns 网格线位置
   */
  getPreviewGridLines(): { horizontal: number[], vertical: number[] } {
    const { cols, rows } = this.options;
    const horizontal = Array.from({ length: rows - 1 }, (_, i) => ((i + 1) / rows) * 100);
    const vertical = Array.from({ length: cols - 1 }, (_, i) => ((i + 1) / cols) * 100);
    return { horizontal, vertical };
  }
}

// 默认导出
export default ImageGridSplitter;