# 🏗️ 架構重構計劃 - 雙頁面系統

## 目標概述

將測試頁面重構為完整的單一圖層編輯系統，與主編輯頁面實現雙向連動。

---

## 📐 新架構設計

### 頁面結構

```
App (主容器)
├── MainEditorPage (主編輯頁面)
│   ├── Canvas (支援縮放/滾動)
│   │   └── Layer (點擊顯示操作按鈕)
│   │       └── LayerActionButtons (關閉/Solo/編輯/刪除)
│   ├── LayerPanel
│   ├── NodeSystemPanel
│   └── ChatPanel
│
└── LayerEditPage (單一圖層編輯頁面)
    ├── LeftSidebar (修飾器目錄)
    ├── CenterCanvas (預覽 + 縮放/滾動)
    └── RightSidebar (修飾器操作)
```

### 狀態管理

```typescript
// 全域狀態 (App.tsx)
{
  layers: Layer[],              // 所有圖層
  selectedLayerId: string,      // 當前選中的圖層
  editingLayerId: string | null, // 正在編輯的圖層 (進入編輯頁面時設置)
  viewMode: 'main' | 'edit',    // 當前視圖模式
  canvasZoom: number,           // Canvas 縮放比例
  canvasOffset: { x: number, y: number }, // Canvas 偏移量
}
```

### 連動機制

#### 主頁面 → 編輯頁面
```
1. Canvas 雙擊圖層 → setEditingLayerId() → viewMode = 'edit'
2. 編輯頁面接收 editingLayerId 對應的 Layer 數據
3. 修飾器修改 → 即時更新 layers 狀態
```

#### 編輯頁面 → 主頁面
```
1. 編輯頁面修改修飾器 → updateLayer()
2. layers 狀態更新 → 主頁面 Canvas 即時重渲染
3. 點擊返回 → viewMode = 'main'
```

---

## 🎯 核心修飾器清單（優先實現）

### Tier 1: 完全實現 (CSS Native)
| 修飾器 | 實現方式 | 優先級 |
|--------|---------|-------|
| **Gaussian Blur** | `blur()` | 🔴 P0 |
| **Brightness/Contrast** | `brightness() contrast()` | 🔴 P0 |
| **Hue/Saturation** | `hue-rotate() saturate()` | 🔴 P0 |
| **Drop Shadow** | `drop-shadow()` | 🟠 P1 |
| **Invert** | `invert()` | 🟠 P1 |
| **Noise** | `grayscale()` | 🟡 P2 |
| **Sharpen** | `contrast() brightness()` | 🟡 P2 |
| **Glitch** | `hue-rotate() contrast()` | 🟡 P2 |

### Tier 2: 簡化實現
| 修飾器 | 簡化方案 | 優先級 |
|--------|---------|-------|
| **Stretch** | `scale()` | 🟠 P1 |
| **Wave** | `skewX()` | 🟡 P2 |
| **Outline** | `outline` | 🟡 P2 |

### Tier 3: 視覺標記（未來實現）
- Repeater, Liquify, Displacement Map
- Kaleidoscope, AI Fill, Remove BG
- 等 WebGL/Canvas 進階效果

---

## 🔧 Canvas 縮放/滾動實現

### 功能需求
```typescript
interface CanvasControls {
  zoom: number;        // 0.1 - 5.0 (10% - 500%)
  offsetX: number;     // 水平偏移
  offsetY: number;     // 垂直偏移

  // 操作方法
  handleWheel: (e: WheelEvent) => void;  // Ctrl+滾輪縮放
  handlePan: (dx, dy) => void;           // 空白處拖拽平移
  resetView: () => void;                 // 重置視圖
  fitToScreen: () => void;               // 適應螢幕
}
```

### 實現方式
```tsx
// 使用 transform 實現縮放和平移
<div style={{
  transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
  transformOrigin: 'center center'
}}>
  {/* Canvas 內容 */}
</div>
```

### 快捷鍵
- `Ctrl/Cmd + 滾輪`: 縮放
- `空白鍵 + 拖拽`: 平移
- `Ctrl/Cmd + 0`: 重置為 100%
- `Ctrl/Cmd + 1`: 適應螢幕

---

## 📊 實施階段

### Phase 1: 基礎架構 (2-3 hours)
- [ ] 重命名 `ModifierTestPage` → `LayerEditPage`
- [ ] 添加 `viewMode` 狀態管理
- [ ] 創建路由切換邏輯
- [ ] 實現 Context Provider 共享狀態

### Phase 2: 主頁面增強 (1-2 hours)
- [ ] Canvas 添加雙擊事件 → 進入編輯頁面
- [ ] 圖層懸停顯示操作按鈕
- [ ] 實現 Solo 模式（隱藏其他圖層）
- [ ] 實現刪除/關閉圖層

### Phase 3: 編輯頁面連動 (1 hour)
- [ ] 接收 `editingLayerId` prop
- [ ] 修飾器修改實時同步到主頁面
- [ ] 添加返回按鈕
- [ ] 實現預覽即時更新

### Phase 4: 修飾器優化 (1-2 hours)
- [ ] 移除未實現的修飾器
- [ ] 優化核心 8 個修飾器的實現
- [ ] 確保多重疊加正確運作
- [ ] 添加參數範圍驗證

### Phase 5: Canvas 縮放 (2 hours)
- [ ] 實現縮放邏輯
- [ ] 實現平移邏輯
- [ ] 添加縮放控制 UI
- [ ] 兩個頁面都支援

### Phase 6: 測試與優化 (1 hour)
- [ ] 端對端測試流程
- [ ] 效能優化
- [ ] Bug 修復

**預估總時間**: 8-11 小時

---

## 🎨 UI/UX 改進

### 主頁面圖層操作 UI
```
┌─────────────────────┐
│  Layer: Cyber Orb   │ ← 懸停時顯示
├─────────────────────┤
│ 👁️ Solo  ✏️ Edit    │
│ ❌ Close 🗑️ Delete   │
└─────────────────────┘
```

### 編輯頁面頂部導航
```
┌────────────────────────────────────┐
│ ← 返回  |  Cyber Orb  |  [保存]    │
└────────────────────────────────────┘
```

### 縮放控制 UI
```
┌──────────┐
│ 100% 🔍  │ ← 點擊顯示縮放選項
├──────────┤
│ 50%      │
│ 75%      │
│ 100%     │
│ 150%     │
│ 200%     │
│ 適應螢幕  │
└──────────┘
```

---

## 🔄 連動流程示意

### 情境 1: 在編輯頁面修改修飾器
```
LayerEditPage 調整 Blur radius
    ↓
handleUpdateParam(layerId, 'blur', { radius: 20 })
    ↓
App.tsx: setLayers() 更新
    ↓
MainEditorPage Canvas 即時重渲染
    ↓
✅ 主頁面立即看到模糊效果
```

### 情境 2: 在主頁面 Solo 圖層
```
Canvas: 點擊 Solo 按鈕
    ↓
App.tsx: setSoloLayerId(layer.id)
    ↓
Canvas: 其他圖層 opacity = 0.2
    ↓
✅ 只凸顯該圖層
```

### 情境 3: 雙擊進入編輯
```
Canvas: onDoubleClick(layer.id)
    ↓
App.tsx: setEditingLayerId(layer.id) + setViewMode('edit')
    ↓
LayerEditPage 渲染
    ↓
接收該圖層的完整 modifiers 數據
    ↓
✅ 進入單一圖層編輯模式
```

---

## 📝 關鍵代碼片段

### App.tsx 狀態管理
```typescript
const [viewMode, setViewMode] = useState<'main' | 'edit'>('main');
const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
const [soloLayerId, setSoloLayerId] = useState<string | null>(null);

const handleEnterEditMode = (layerId: string) => {
  setEditingLayerId(layerId);
  setViewMode('edit');
};

const handleExitEditMode = () => {
  setViewMode('main');
  // editingLayerId 保持，以便快速返回
};
```

### Canvas.tsx 雙擊處理
```typescript
<div
  onClick={() => onSelectLayer(layer.id)}
  onDoubleClick={() => onEnterEditMode(layer.id)}
>
  {/* Layer content */}
</div>
```

### LayerEditPage.tsx Props
```typescript
interface LayerEditPageProps {
  layer: Layer;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onExit: () => void;
}
```

---

## ⚠️ 注意事項

1. **效能優化**: 修飾器修改時使用 `debounce` 避免過度渲染
2. **狀態同步**: 確保編輯頁面和主頁面共享同一個 `layers` 狀態
3. **歷史記錄**: 修飾器修改要加入 Undo/Redo 系統
4. **錯誤處理**: 無效參數時顯示警告，不崩潰
5. **響應式**: 編輯頁面在小螢幕上調整佈局

---

## 🚀 後續優化方向

1. **批次操作**: 選中多個圖層同時編輯
2. **修飾器預設**: 保存常用修飾器組合
3. **複製粘貼**: 修飾器堆疊可以複製到其他圖層
4. **導出配置**: 修飾器設定可以導出為 JSON
5. **快捷鍵**: `E` 鍵快速進入編輯模式

---

*文檔版本: v1.0 | 最後更新: 2025-11-25*
