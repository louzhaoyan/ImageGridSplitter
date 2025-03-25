"use strict";
/**
 * ImageGridSplitter
 * 图片宫格切割工具，支持Vue 3和React
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGridSplitter = void 0;
/**
 * 图片宫格切割类
 */
class ImageGridSplitter {
    constructor(options = {}) {
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
     * @param imageSource 图片文件或URL
     * @returns 切片数组
     */
    split(imageSource) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 加载图片
                const image = yield this.loadImage(imageSource);
                // 创建一个离屏Canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('无法创建Canvas上下文');
                }
                // 根据切割模式决定处理方式
                if (this.options.mode === 'crop') {
                    return this.cropAndSplit(image, canvas, ctx);
                }
                else {
                    return this.stretchAndSplit(image, canvas, ctx);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * 获取预览网格线
     * @returns 网格线位置
     */
    getPreviewGridLines() {
        const { cols = 3, rows = 3 } = this.options;
        const horizontal = Array.from({ length: rows - 1 }, (_, i) => ((i + 1) / rows) * 100);
        const vertical = Array.from({ length: cols - 1 }, (_, i) => ((i + 1) / cols) * 100);
        return { horizontal, vertical };
    }
    /**
     * 加载图片
     */
    loadImage(source) {
        return new Promise((resolve, reject) => {
            // 如果已经是 HTMLImageElement，直接返回
            if (source instanceof HTMLImageElement) {
                if (source.complete) {
                    resolve(source);
                }
                else {
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
            }
            else {
                // File 或 Blob
                img.src = URL.createObjectURL(source);
            }
        });
    }
    /**
     * 居中裁剪模式下的切割
     */
    cropAndSplit(image, canvas, ctx) {
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
        const result = [];
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
                    gridCtx.drawImage(canvas, x, y, gridWidth, gridHeight, 0, 0, gridWidth, gridHeight);
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
    stretchAndSplit(image, canvas, ctx) {
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
        const result = [];
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
                    gridCtx.drawImage(canvas, x, y, gridWidth, gridHeight, 0, 0, gridWidth, gridHeight);
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
}
exports.ImageGridSplitter = ImageGridSplitter;
// 默认导出
exports.default = ImageGridSplitter;
