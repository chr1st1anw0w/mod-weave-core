/**
 * WebGL Layer Component
 * 专门处理需要 WebGL 渲染的图层
 * 支持 Wave、Displacement Map、Perturb、Liquify 等高级效果
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layer, ModifierType } from '../types';
import { getWebGLRenderer } from '../services/webglRenderer';
import { getLiquifyRenderer } from '../services/liquifyRenderer';

interface WebGLLayerProps {
  layer: Layer;
  onRendered?: (canvas: HTMLCanvasElement) => void;
  enableAnimation?: boolean;
}

/**
 * 检查图层是否需要 WebGL 渲染
 */
export function layerNeedsWebGL(layer: Layer): boolean {
  return layer.modifiers.some(
    (mod) =>
      mod.active &&
      [
        ModifierType.WAVE,
        ModifierType.DISPLACEMENT_MAP,
        ModifierType.LIQUIFY,
        ModifierType.PERTURB,
      ].includes(mod.type)
  );
}

/**
 * WebGL 图层组件
 */
export const WebGLLayer: React.FC<WebGLLayerProps> = ({
  layer,
  onRendered,
  enableAnimation = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  /**
   * 加载源图像
   */
  useEffect(() => {
    if (layer.type !== 'IMAGE' || !layer.content) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // 允许跨域

    img.onload = () => {
      sourceImageRef.current = img;
      setIsLoading(false);
      renderLayer();
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };

    img.src = layer.content;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [layer.content]);

  /**
   * 渲染图层（应用所有 WebGL 修饰器）
   */
  const renderLayer = useCallback(() => {
    if (!sourceImageRef.current || !canvasRef.current) return;

    try {
      const webglRenderer = getWebGLRenderer();
      const liquifyRenderer = getLiquifyRenderer();

      // 初始化画布尺寸
      canvasRef.current.width = sourceImageRef.current.width;
      canvasRef.current.height = sourceImageRef.current.height;

      // 按顺序应用修饰器
      let currentImage: HTMLImageElement | HTMLCanvasElement = sourceImageRef.current;

      for (const mod of layer.modifiers) {
        if (!mod.active) continue;

        switch (mod.type) {
          case ModifierType.WAVE:
            currentImage = webglRenderer.renderWave(currentImage, {
              frequency: mod.params.frequency ?? 2,
              amplitude: mod.params.amplitude ?? 20,
              phase: mod.params.phase ?? 0,
              direction: mod.params.direction ?? 0,
            });
            break;

          case ModifierType.PERTURB:
            currentImage = webglRenderer.renderPerturb(currentImage, {
              amplitude: mod.params.amplitude ?? 10,
              frequency: mod.params.frequency ?? 1,
              octaves: mod.params.octaves ?? 3,
              speed: mod.params.speed ?? 0,
            });
            break;

          case ModifierType.DISPLACEMENT_MAP:
            // 需要位移图，这里假设存储在 params 中
            if (mod.params.displacementMapCanvas) {
              currentImage = webglRenderer.renderDisplacement(
                currentImage,
                mod.params.displacementMapCanvas,
                {
                  hScale: mod.params.hScale ?? 10,
                  vScale: mod.params.vScale ?? 10,
                  mapSource: mod.params.mapSource ?? 'Luminance',
                  wrap: mod.params.wrap ?? true,
                }
              );
            }
            break;

          case ModifierType.LIQUIFY:
            currentImage = liquifyRenderer.renderLiquifyEffect(currentImage, {
              brushSize: mod.params.brushSize ?? 50,
              pressure: mod.params.pressure ?? 0.5,
              mode: mod.params.mode ?? 'Push',
              autoDeform: true,
            });
            break;
        }
      }

      // 将最终结果绘制到组件 canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(currentImage, 0, 0);
      }

      // 通知父组件渲染完成
      if (onRendered) {
        onRendered(canvasRef.current);
      }
    } catch (err) {
      console.error('WebGL rendering error:', err);
      setError(err instanceof Error ? err.message : 'Rendering failed');
    }
  }, [layer.modifiers, onRendered]);

  /**
   * 动画循环（用于需要动画的效果）
   */
  useEffect(() => {
    if (!enableAnimation) {
      renderLayer();
      return;
    }

    const animate = () => {
      renderLayer();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableAnimation, renderLayer]);

  /**
   * 修饰器参数变化时重新渲染
   */
  useEffect(() => {
    if (!enableAnimation && !isLoading) {
      renderLayer();
    }
  }, [layer.modifiers, renderLayer, enableAnimation, isLoading]);

  if (error) {
    return (
      <div
        style={{
          position: 'absolute',
          left: layer.x,
          top: layer.y,
          width: layer.width,
          height: layer.height,
          background: 'rgba(255, 0, 0, 0.1)',
          border: '2px dashed red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
          fontSize: '12px',
          padding: '10px',
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          position: 'absolute',
          left: layer.x,
          top: layer.y,
          width: layer.width,
          height: layer.height,
          background: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '12px',
        }}
      >
        Loading WebGL...
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

export default WebGLLayer;
