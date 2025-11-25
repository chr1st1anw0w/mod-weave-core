/**
 * Liquify Renderer Service
 * 实现基于 Canvas 的画笔变形系统
 * 支持 Push、Pull、Twirl、Bloat、Pinch 等模式
 */

export type LiquifyMode = 'Push' | 'Pull' | 'Twirl' | 'Bloat' | 'Pinch';

interface Point {
  x: number;
  y: number;
}

interface MeshVertex {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
}

/**
 * Liquify 渲染器
 * 使用网格变形技术实现画笔效果
 */
export class LiquifyRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mesh: MeshVertex[][] = [];
  private meshResolution: number = 20; // 网格分辨率
  private sourceImage: HTMLImageElement | HTMLCanvasElement | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = ctx;
  }

  /**
   * 初始化网格
   */
  private initializeMesh(width: number, height: number) {
    this.mesh = [];
    const cellWidth = width / this.meshResolution;
    const cellHeight = height / this.meshResolution;

    for (let i = 0; i <= this.meshResolution; i++) {
      this.mesh[i] = [];
      for (let j = 0; j <= this.meshResolution; j++) {
        const x = j * cellWidth;
        const y = i * cellHeight;
        this.mesh[i][j] = {
          x,
          y,
          originalX: x,
          originalY: y,
        };
      }
    }
  }

  /**
   * 应用画笔变形到网格
   */
  private applyBrushToMesh(
    center: Point,
    brushSize: number,
    pressure: number,
    mode: LiquifyMode
  ) {
    const radius = brushSize / 2;

    for (let i = 0; i <= this.meshResolution; i++) {
      for (let j = 0; j <= this.meshResolution; j++) {
        const vertex = this.mesh[i][j];
        const dx = vertex.x - center.x;
        const dy = vertex.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < radius) {
          // 计算影响强度（使用平滑衰减）
          const influence = Math.pow(1 - distance / radius, 2) * pressure;

          switch (mode) {
            case 'Push':
              // 推：沿着笔刷方向推动顶点
              vertex.x += dx * influence * 0.1;
              vertex.y += dy * influence * 0.1;
              break;

            case 'Pull':
              // 拉：向笔刷中心拉动顶点
              vertex.x -= dx * influence * 0.1;
              vertex.y -= dy * influence * 0.1;
              break;

            case 'Twirl':
              // 旋转：围绕笔刷中心旋转
              const angle = influence * Math.PI * 0.2;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              const newDx = dx * cos - dy * sin;
              const newDy = dx * sin + dy * cos;
              vertex.x = center.x + newDx;
              vertex.y = center.y + newDy;
              break;

            case 'Bloat':
              // 膨胀：远离笔刷中心
              vertex.x += dx * influence * 0.15;
              vertex.y += dy * influence * 0.15;
              break;

            case 'Pinch':
              // 收缩：向笔刷中心收缩
              vertex.x -= dx * influence * 0.15;
              vertex.y -= dy * influence * 0.15;
              break;
          }
        }
      }
    }
  }

  /**
   * 渲染变形后的图像
   */
  private renderMesh() {
    if (!this.sourceImage) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 使用三角形网格渲染
    for (let i = 0; i < this.meshResolution; i++) {
      for (let j = 0; j < this.meshResolution; j++) {
        const v00 = this.mesh[i][j];
        const v01 = this.mesh[i][j + 1];
        const v10 = this.mesh[i + 1][j];
        const v11 = this.mesh[i + 1][j + 1];

        // 渲染两个三角形形成一个四边形
        this.renderTriangle(
          v00, v01, v10,
          this.sourceImage
        );
        this.renderTriangle(
          v01, v11, v10,
          this.sourceImage
        );
      }
    }
  }

  /**
   * 渲染单个三角形（使用仿射变换）
   */
  private renderTriangle(
    v0: MeshVertex,
    v1: MeshVertex,
    v2: MeshVertex,
    image: HTMLImageElement | HTMLCanvasElement
  ) {
    this.ctx.save();

    // 创建裁剪路径
    this.ctx.beginPath();
    this.ctx.moveTo(v0.x, v0.y);
    this.ctx.lineTo(v1.x, v1.y);
    this.ctx.lineTo(v2.x, v2.y);
    this.ctx.closePath();
    this.ctx.clip();

    // 计算仿射变换矩阵
    // 从原始坐标到变形坐标的映射
    const x0 = v0.originalX;
    const y0 = v0.originalY;
    const x1 = v1.originalX;
    const y1 = v1.originalY;
    const x2 = v2.originalX;
    const y2 = v2.originalY;

    const u0 = v0.x;
    const u1 = v1.x;
    const u2 = v2.x;
    const v_0 = v0.y;
    const v_1 = v1.y;
    const v_2 = v2.y;

    // 计算变换矩阵
    const denom = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(denom) < 0.0001) {
      this.ctx.restore();
      return;
    }

    const m11 = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / denom;
    const m12 = ((x1 - x0) * (u2 - u0) - (x2 - x0) * (u1 - u0)) / denom;
    const m21 = ((v_1 - v_0) * (y2 - y0) - (v_2 - v_0) * (y1 - y0)) / denom;
    const m22 = ((x1 - x0) * (v_2 - v_0) - (x2 - x0) * (v_1 - v_0)) / denom;
    const dx = u0 - m11 * x0 - m12 * y0;
    const dy = v_0 - m21 * x0 - m22 * y0;

    // 应用变换
    this.ctx.transform(m11, m21, m12, m22, dx, dy);

    // 绘制图像
    this.ctx.drawImage(image, 0, 0);

    this.ctx.restore();
  }

  /**
   * 设置源图像
   */
  setSourceImage(image: HTMLImageElement | HTMLCanvasElement) {
    this.sourceImage = image;
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.initializeMesh(image.width, image.height);
    this.renderMesh();
  }

  /**
   * 应用笔刷操作
   */
  applyBrush(
    center: Point,
    brushSize: number,
    pressure: number,
    mode: LiquifyMode
  ): HTMLCanvasElement {
    this.applyBrushToMesh(center, brushSize, pressure, mode);
    this.renderMesh();
    return this.canvas;
  }

  /**
   * 重置变形
   */
  reset() {
    if (this.sourceImage) {
      this.initializeMesh(this.sourceImage.width, this.sourceImage.height);
      this.renderMesh();
    }
  }

  /**
   * 获取当前画布
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 简化版本：直接应用效果而不需要交互
   * 用于在修饰器堆栈中自动应用效果
   */
  renderLiquifyEffect(
    image: HTMLImageElement | HTMLCanvasElement,
    params: {
      brushSize: number;
      pressure: number;
      mode: LiquifyMode;
      // 可以添加预设的变形点或自动生成
      autoDeform?: boolean;
    }
  ): HTMLCanvasElement {
    this.setSourceImage(image);

    if (params.autoDeform) {
      // 自动应用一些随机变形（用于预览）
      const width = image.width;
      const height = image.height;
      const numPoints = 5;

      for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        this.applyBrush(
          { x, y },
          params.brushSize,
          params.pressure,
          params.mode
        );
      }
    }

    return this.canvas;
  }
}

// 全局单例
let globalLiquifyRenderer: LiquifyRenderer | null = null;

export function getLiquifyRenderer(): LiquifyRenderer {
  if (!globalLiquifyRenderer) {
    globalLiquifyRenderer = new LiquifyRenderer();
  }
  return globalLiquifyRenderer;
}
