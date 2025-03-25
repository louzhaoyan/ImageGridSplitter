/**
 * ImageGridSplitter
 * 图片宫格切割工具，支持Vue 3和React
 */
export type SplitMode = 'crop' | 'stretch';
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
export declare class ImageGridSplitter {
    private options;
    constructor(options?: ImageGridSplitterOptions);
    /**
     * 切割图片
     * @param imageSource 图片文件或URL
     * @returns 切片数组
     */
    split(imageSource: File | Blob | HTMLImageElement | string): Promise<GridPiece[]>;
    /**
     * 获取预览网格线
     * @returns 网格线位置
     */
    getPreviewGridLines(): {
        horizontal: number[];
        vertical: number[];
    };
    /**
     * 加载图片
     */
    private loadImage;
    /**
     * 居中裁剪模式下的切割
     */
    private cropAndSplit;
    /**
     * 拉伸模式下的切割
     */
    private stretchAndSplit;
}
export default ImageGridSplitter;
