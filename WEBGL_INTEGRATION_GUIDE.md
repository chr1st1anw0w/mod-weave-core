# WebGL 渲染集成指南

本文档说明如何将 WebGL 渲染器集成到 Mod-Weave Core 的 Canvas 渲染管线中。

---

## 📦 已实现的渲染器

### 1. **WebGL Renderer** (`services/webglRenderer.ts`)

提供基于 shader 的高性能图像效果：

- ✅ **Wave Effect** - 正弦波扭曲
- ✅ **Displacement Map** - 基于纹理的位移
- ✅ **Perturb Effect** - 程序化噪声扰动

### 2. **Liquify Renderer** (`services/liquifyRenderer.ts`)

提供基于网格变形的画笔系统：

- ✅ **Push** - 推动像素
- ✅ **Pull** - 拉动像素
- ✅ **Twirl** - 旋转变形
- ✅ **Bloat** - 膨胀效果
- ✅ **Pinch** - 收缩效果

---

## 🔧 集成方法

### 方法 1：Canvas 层叠渲染（推荐）

在 `Canvas.tsx` 中，为每个需要 WebGL 的图层创建一个额外的 canvas 层，渲染 WebGL 效果后叠加显示。

```tsx
import { getWebGLRenderer } from '../services/webglRenderer';
import { getLiquifyRenderer } from '../services/liquifyRenderer';

function renderLayerWithWebGL(layer: Layer, imgElement: HTMLImageElement): HTMLCanvasElement {
  const webglRenderer = getWebGLRenderer();
  const liquifyRenderer = getLiquifyRenderer();

  let resultCanvas: HTMLCanvasElement | null = null;

  for (const mod of layer.modifiers) {
    if (!mod.active) continue;

    switch (mod.type) {
      case ModifierType.WAVE:
        resultCanvas = webglRenderer.renderWave(imgElement, {
          frequency: mod.params.frequency || 2,
          amplitude: mod.params.amplitude || 20,
          phase: mod.params.phase || 0,
          direction: mod.params.direction || 0,
        });
        break;

      case ModifierType.DISPLACEMENT_MAP:
        // 假设位移图存储在 mod.params.displacementMapUrl
        const displacementImg = new Image();
        displacementImg.src = mod.params.displacementMapUrl;
        resultCanvas = webglRenderer.renderDisplacement(imgElement, displacementImg, {
          hScale: mod.params.hScale || 10,
          vScale: mod.params.vScale || 10,
          mapSource: mod.params.mapSource || 'Luminance',
          wrap: mod.params.wrap ?? true,
        });
        break;

      case ModifierType.LIQUIFY:
        resultCanvas = liquifyRenderer.renderLiquifyEffect(imgElement, {
          brushSize: mod.params.brushSize || 50,
          pressure: mod.params.pressure || 0.5,
          mode: mod.params.mode || 'Push',
          autoDeform: true, // 自动生成变形点用于预览
        });
        break;

      case ModifierType.PERTURB:
        resultCanvas = webglRenderer.renderPerturb(imgElement, {
          amplitude: mod.params.amplitude || 10,
          frequency: mod.params.frequency || 1,
          octaves: mod.params.octaves || 3,
          speed: mod.params.speed || 0,
        });
        break;
    }
  }

  return resultCanvas || imgElement as any;
}
```

### 方法 2：修改 `getDynamicLayerStyle`

在 `Canvas.tsx` 的 `getDynamicLayerStyle` 函数中添加 WebGL 检测：

```tsx
const getDynamicLayerStyle = (layer: Layer): React.CSSProperties => {
  const needsWebGL = layer.modifiers.some(mod =>
    mod.active && [
      ModifierType.WAVE,
      ModifierType.LIQUIFY,
      ModifierType.DISPLACEMENT_MAP,
      ModifierType.PERTURB
    ].includes(mod.type)
  );

  if (needsWebGL) {
    // 标记需要 WebGL 渲染
    return {
      ...style,
      // 使用 data attribute 标记
      ['data-needs-webgl' as any]: 'true'
    };
  }

  // ... 原有 CSS filter 逻辑
};
```

### 方法 3：创建 WebGL 图层组件

创建一个专门的组件来处理 WebGL 渲染：

```tsx
// components/WebGLLayer.tsx
import React, { useEffect, useRef } from 'react';
import { Layer, ModifierType } from '../types';
import { getWebGLRenderer } from '../services/webglRenderer';

interface WebGLLayerProps {
  layer: Layer;
  sourceImage: HTMLImageElement;
}

export const WebGLLayer: React.FC<WebGLLayerProps> = ({ layer, sourceImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderer = getWebGLRenderer();

  useEffect(() => {
    if (!canvasRef.current) return;

    let result: HTMLCanvasElement = sourceImage as any;

    // 按顺序应用所有 WebGL 修饰器
    for (const mod of layer.modifiers) {
      if (!mod.active) continue;

      if (mod.type === ModifierType.WAVE) {
        result = renderer.renderWave(result, mod.params);
      }
      // ... 其他效果
    }

    // 将结果绘制到组件的 canvas
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(result, 0, 0);
    }
  }, [layer.modifiers, sourceImage]);

  return (
    <canvas
      ref={canvasRef}
      width={sourceImage.width}
      height={sourceImage.height}
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
      }}
    />
  );
};
```

---

## 🎨 使用示例

### Wave 效果

```typescript
import { getWebGLRenderer } from './services/webglRenderer';

const renderer = getWebGLRenderer();
const resultCanvas = renderer.renderWave(imageElement, {
  frequency: 5,      // 波浪频率 (Hz)
  amplitude: 30,     // 波浪振幅 (px)
  phase: 90,         // 相位偏移 (度)
  direction: 45,     // 波浪方向 (度)
});

// resultCanvas 包含渲染后的效果
document.body.appendChild(resultCanvas);
```

### Displacement Map 效果

```typescript
const displacementImage = new Image();
displacementImage.src = '/path/to/displacement-map.png';

displacementImage.onload = () => {
  const resultCanvas = renderer.renderDisplacement(sourceImage, displacementImage, {
    hScale: 50,                // 水平位移强度
    vScale: 50,                // 垂直位移强度
    mapSource: 'Luminance',    // 使用亮度通道
    wrap: true,                // 边界环绕
  });
};
```

### Liquify 效果

```typescript
import { getLiquifyRenderer } from './services/liquifyRenderer';

const liquify = getLiquifyRenderer();
liquify.setSourceImage(imageElement);

// 应用画笔变形
liquify.applyBrush(
  { x: 100, y: 100 },  // 笔刷位置
  80,                  // 笔刷大小
  0.7,                 // 压力
  'Twirl'              // 模式
);

const resultCanvas = liquify.getCanvas();
```

### Perturb 效果

```typescript
const resultCanvas = renderer.renderPerturb(imageElement, {
  amplitude: 20,     // 扰动强度
  frequency: 1.5,    // 噪声频率
  octaves: 4,        // 噪声层数
  speed: 1.0,        // 动画速度
});
```

---

## 🚀 性能优化建议

### 1. **渲染缓存**

缓存 WebGL 渲染结果，避免重复计算：

```typescript
const renderCache = new Map<string, HTMLCanvasElement>();

function getCachedRender(cacheKey: string, renderFn: () => HTMLCanvasElement) {
  if (renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!;
  }

  const result = renderFn();
  renderCache.set(cacheKey, result);
  return result;
}
```

### 2. **按需渲染**

只在修饰器参数变化时重新渲染：

```typescript
useEffect(() => {
  // 只在相关参数变化时触发
}, [mod.params.frequency, mod.params.amplitude]);
```

### 3. **降采样预览**

在编辑时使用较低分辨率进行实时预览：

```typescript
const previewScale = 0.5; // 50% 分辨率
const previewImage = scaleImage(sourceImage, previewScale);
const result = renderer.renderWave(previewImage, params);
```

### 4. **WebGL 上下文复用**

使用单例模式共享 WebGL 上下文：

```typescript
// 已在 webglRenderer.ts 中实现
const renderer = getWebGLRenderer(); // 返回全局单例
```

---

## 🧪 测试建议

### 1. **性能测试**

```typescript
console.time('Wave Render');
const result = renderer.renderWave(image, params);
console.timeEnd('Wave Render');
```

### 2. **视觉回归测试**

保存渲染结果并与预期输出比较：

```typescript
const resultDataURL = resultCanvas.toDataURL();
expect(resultDataURL).toMatchSnapshot();
```

### 3. **边界条件测试**

- 极大/极小的参数值
- 空图像
- 非常大的图像（内存限制）
- 多个效果堆叠

---

## 📝 TODO

- [ ] 在 Canvas.tsx 中集成 WebGL 渲染管线
- [ ] 添加渲染进度指示器（大图像可能需要时间）
- [ ] 实现渲染结果缓存系统
- [ ] 为 Liquify 添加交互式画笔工具 UI
- [ ] 优化 shader 性能（使用更高效的算法）
- [ ] 添加 WebGL 失败时的 fallback 方案
- [ ] 实现导出功能（保存带有 WebGL 效果的最终图像）
- [ ] 添加 WebGL 效果的预设库

---

## 🔗 相关文件

- `services/webglRenderer.ts` - WebGL 渲染器实现
- `services/liquifyRenderer.ts` - Liquify 渲染器实现
- `components/Canvas.tsx` - 主画布组件
- `components/modifiers/distort.tsx` - Distort 修饰器节点定义
- `components/NodeSystemPanel.tsx` - 节点系统面板

---

## 💡 扩展建议

### 未来可以添加的效果：

1. **Ripple** - 水波纹效果
2. **Swirl** - 漩涡扭曲
3. **Bulge** - 鱼眼/桶形失真
4. **Shear** - 切变变形
5. **Polar Transform** - 极坐标变换
6. **Mesh Warp** - 自定义网格变形

### 高级功能：

1. **动画时间轴** - 参数关键帧动画
2. **效果预设** - 保存和加载效果组合
3. **GPU 加速合成** - 多个效果的并行处理
4. **实时预览** - 参数调整时的平滑预览
