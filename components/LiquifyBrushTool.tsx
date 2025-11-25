/**
 * Liquify Brush Tool Component
 * 交互式画笔工具，允许用户在画布上直接绘制 Liquify 效果
 */

import React, { useRef, useState, useEffect } from 'react';
import { Layer, ModifierType } from '../types';
import { getLiquifyRenderer, LiquifyMode } from '../services/liquifyRenderer';
import { Icons } from './Icons';

interface LiquifyBrushToolProps {
  layer: Layer;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onClose: () => void;
}

export const LiquifyBrushTool: React.FC<LiquifyBrushToolProps> = ({
  layer,
  onUpdateLayer,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(50);
  const [pressure, setPressure] = useState(0.7);
  const [mode, setMode] = useState<LiquifyMode>('Push');
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const liquifyRenderer = useRef(getLiquifyRenderer());

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current || layer.type !== 'IMAGE' || !layer.content) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      liquifyRenderer.current.setSourceImage(img);

      // 绘制到预览 canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          const result = liquifyRenderer.current.getCanvas();
          ctx.drawImage(result, 0, 0);
        }
      }
    };

    img.src = layer.content;
  }, [layer.content, layer.type]);

  // 应用笔刷
  const applyBrush = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    // 转换到图像坐标
    const imageX = (x - rect.left) * scaleX;
    const imageY = (y - rect.top) * scaleY;

    // 应用 liquify 效果
    const result = liquifyRenderer.current.applyBrush(
      { x: imageX, y: imageY },
      brushSize,
      pressure,
      mode
    );

    // 更新预览
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(result, 0, 0);
    }
  };

  // 鼠标/触摸事件处理
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    applyBrush(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });

    if (isDrawing) {
      applyBrush(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // 重置
  const handleReset = () => {
    liquifyRenderer.current.reset();
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const result = liquifyRenderer.current.getCanvas();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(result, 0, 0);
      }
    }
  };

  // 应用更改
  const handleApply = () => {
    if (!canvasRef.current) return;

    // 将 canvas 转换为 base64
    const dataURL = canvasRef.current.toDataURL('image/png');

    // 更新图层内容
    onUpdateLayer(layer.id, {
      content: dataURL,
    });

    onClose();
  };

  const modes: LiquifyMode[] = ['Push', 'Pull', 'Twirl', 'Bloat', 'Pinch'];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* 主工作区 */}
      <div className="w-full h-full flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-black/60 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Waves size={24} className="text-purple-400" />
              Liquify Brush Tool
            </h2>

            {/* 模式选择 */}
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${mode === m
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }
                  `}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Icons.RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              Apply
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => {
              setIsDrawing(false);
              setShowCursor(false);
            }}
            onPointerEnter={() => setShowCursor(true)}
            className="max-w-full max-h-full cursor-none shadow-2xl"
            style={{
              imageRendering: 'crisp-edges',
            }}
          />

          {/* 自定义画笔光标 */}
          {showCursor && canvasRef.current && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-purple-400 shadow-lg"
              style={{
                left: cursorPos.x - brushSize / 2,
                top: cursorPos.y - brushSize / 2,
                width: brushSize,
                height: brushSize,
                borderColor: isDrawing ? '#a855f7' : '#c084fc',
                backgroundColor: isDrawing ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                transition: 'all 0.1s ease',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-purple-400 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* 底部控制栏 */}
        <div className="bg-black/60 border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
            {/* 画笔大小 */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Icons.Circle size={16} />
                Brush Size: {brushSize}px
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-purple-500
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* 压力 */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Icons.Zap size={16} />
                Pressure: {(pressure * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pressure}
                onChange={(e) => setPressure(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-purple-500
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>

          {/* 提示 */}
          <div className="max-w-4xl mx-auto mt-4 text-xs text-gray-400 text-center">
            💡 提示：点击并拖动鼠标来应用 {mode} 效果 | 使用较小的画笔和较低的压力以获得更精细的控制
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquifyBrushTool;
