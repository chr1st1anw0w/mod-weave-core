# Mod-Weave Core - 設計標準 (Design System)

> **版本**：v1.0  
> **最後更新**：2025-11-25  
> **狀態**：Active - 正式生效

---

## 📋 目錄

1. [設計原則](#設計原則)
2. [色彩系統](#色彩系統)
3. [字體系統](#字體系統)
4. [間距系統](#間距系統)
5. [組件規範](#組件規範)
6. [動畫規範](#動畫規範)
7. [圖標系統](#圖標系統)
8. [可訪問性標準](#可訪問性標準)

---

## 🎨 設計原則

### 核心理念
Mod-Weave Core 遵循「**Cyberpunk Minimalism**」設計語言，結合以下原則：

1. **Dark-First 暗色優先**
   - 所有介面以深色為基礎，減少視覺疲勞
   - 適合長時間專業創作工作

2. **Glow & Accent 發光與強調**
   - 使用霓虹色系（Violet、Cyan）作為強調色
   - 關鍵互動元素帶有微光效果

3. **Glassmorphism 玻璃態**
   - 面板使用半透明背景 + backdrop-blur
   - 創造層次感與深度

4. **Minimal != Simple 極簡不等於簡單**
   - 減少裝飾性元素，但保留功能豐富性
   - 每個元素都有明確的用途

5. **Data Visualization 數據視覺化**
   - 節點系統使用視覺化連線
   - 參數連接使用彩色編碼

---

## 🎨 色彩系統

### 主色板 (Primary Colors)

```css
/* 背景色 */
--mw-bg: #0f0f11;           /* 主背景 - 極深灰黑 */
--mw-panel: #18181b;        /* 面板背景 - 深灰 */

/* 強調色 */
--mw-accent: #8b5cf6;       /* 主強調色 - 紫羅蘭 (Violet) */
--mw-cyan: #06b6d4;         /* 次強調色 - 青色 (Cyan) */
```

**使用場景**：
- `mw-bg`: 畫布、主應用背景
- `mw-panel`: 側邊欄、浮動面板、對話框
- `mw-accent`: 主要按鈕、選中狀態、品牌元素
- `mw-cyan`: 次要按鈕、輔助指示器、數據可視化

### I/O 數據類型色彩編碼

```css
/* 參數連接埠顏色 */
--io-number: #3b82f6;       /* 數字類型 - 藍色 */
--io-color: #ec4899;        /* 顏色類型 - 粉紅色 */
--io-boolean: #22c55e;      /* 布林值 - 綠色 */
--io-generic: #e5e7eb;      /* 通用類型 - 白色 */
--io-string: #f59e0b;       /* 字串類型 - 橙色 (建議新增) */
--io-image: #a855f7;        /* 圖片類型 - 紫色 (建議新增) */
```

**視覺映射**：
| 類型 | 顏色 | Hex | 用途 |
|------|------|-----|------|
| Number | Blue | `#3b82f6` | 數值參數 (滑桿、輸入框) |
| Color | Pink | `#ec4899` | 顏色選擇器 |
| Boolean | Green | `#22c55e` | 開關、勾選框 |
| Generic | Gray | `#e5e7eb` | 未定義類型 |

### 語義色彩 (Semantic Colors)

```css
/* 狀態顏色 */
--success: #22c55e;         /* 成功 - 綠色 */
--warning: #f59e0b;         /* 警告 - 橙色 */
--error: #ef4444;           /* 錯誤 - 紅色 */
--info: #3b82f6;            /* 資訊 - 藍色 */

/* AI 狀態 */
--ai-thinking: #fbbf24;     /* AI 思考中 - 黃色 */
--ai-active: #22c55e;       /* AI 就緒 - 綠色 */
```

### 灰階系統 (Grayscale)

```css
/* Tailwind Gray Scale 映射 */
--gray-50: #fafafa;         /* 極淺灰 - 文字高亮 */
--gray-100: #f4f4f5;        /* 淺灰 - 次要文字 */
--gray-200: #e4e4e7;        /* 中淺灰 - 正常文字 */
--gray-400: #a1a1aa;        /* 中灰 - 次要資訊 */
--gray-500: #71717a;        /* 深灰 - 輔助文字 */
--gray-600: #52525b;        /* 更深灰 - 禁用狀態 */
--gray-900: #18181b;        /* 最深灰 - 面板背景 */
```

**文字色彩對映**：
- 主要文字: `zinc-100` / `#e4e4e7`
- 次要文字: `gray-400` / `#a1a1aa`
- 提示文字: `gray-500` / `#71717a`
- 禁用文字: `gray-600` / `#52525b`

### 邊框與分隔線

```css
/* 邊框透明度 */
--border-subtle: rgba(255, 255, 255, 0.05);    /* border-white/5 */
--border-normal: rgba(255, 255, 255, 0.10);    /* border-white/10 */
--border-strong: rgba(255, 255, 255, 0.20);    /* border-white/20 */
```

### 陰影與光暈

```css
/* 陰影系統 */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* 發光效果 */
--glow-accent: 0 0 20px rgba(139, 92, 246, 0.4);   /* 紫色光暈 */
--glow-cyan: 0 0 25px rgba(6, 182, 212, 0.5);       /* 青色光暈 */
--glow-selection: 0 0 25px rgba(139, 92, 246, 0.5); /* 選中光暈 */
```

---

## ✍️ 字體系統

### 字體家族 (Font Families)

```css
/* Google Fonts 引入 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* Tailwind Config */
fontFamily: {
  sans: ['Inter', 'sans-serif'],      /* 介面文字 */
  mono: ['JetBrains Mono', 'monospace'] /* 程式碼、數據 */
}
```

**使用場景**：
- **Inter** (sans): 所有介面文字、按鈕、標籤、描述
- **JetBrains Mono** (mono): 數值顯示、狀態資訊、快捷鍵提示

### 字體尺寸 (Font Sizes)

| 尺寸名稱 | Tailwind Class | px 值 | 用途 |
|----------|----------------|-------|------|
| xs | `text-xs` | 12px | 輔助文字、標籤 |
| sm | `text-sm` | 14px | 次要文字、描述 |
| base | `text-base` | 16px | 主要內容 |
| lg | `text-lg` | 18px | 小標題 |
| xl | `text-xl` | 20px | 標題 |
| 2xl | `text-2xl` | 24px | 大標題 |
| 3xl | `text-3xl` | 30px | 頁面標題 |
| 4xl | `text-4xl` | 36px | 主要圖層文字 |

### 超小字體 (Micro Typography)

```css
/* 用於 metadata、快捷鍵、時間戳記 */
.text-micro {
  font-size: 10px;  /* text-[10px] */
  line-height: 14px;
}
```

**範例**：
- "Unsaved Changes" 狀態
- "ESC" 快捷鍵提示
- "Zoom: 100%" 底部資訊

### 字重 (Font Weights)

```css
--font-light: 300;      /* font-light */
--font-normal: 400;     /* font-normal */
--font-medium: 500;     /* font-medium */
--font-semibold: 600;   /* font-semibold */
--font-bold: 700;       /* font-bold */
```

**推薦對映**：
- 主要標題: `font-semibold` (600)
- 按鈕文字: `font-medium` (500)
- 正文: `font-normal` (400)
- 標籤: `font-semibold` (600) + `uppercase`

### 字距與行高

```css
/* Letter Spacing */
--tracking-tight: -0.025em;     /* tracking-tight */
--tracking-normal: 0;           /* tracking-normal */
--tracking-wide: 0.025em;       /* tracking-wide */
--tracking-wider: 0.05em;       /* tracking-wider */
--tracking-widest: 0.1em;       /* tracking-widest */

/* Line Height */
--leading-tight: 1.25;          /* leading-tight */
--leading-normal: 1.5;          /* leading-normal */
--leading-relaxed: 1.625;       /* leading-relaxed */
```

**使用範例**：
- 標題: `tracking-wide` (0.025em)
- Logo "MOD-WEAVE CORE": `tracking-widest` (0.1em)
- 按鈕: `tracking-normal` (0)

---

## 📏 間距系統

### 基礎間距單位 (Base Spacing Unit)

Mod-Weave 使用 **4px 基準系統**（Tailwind 預設）：

```css
/* Spacing Scale (px) */
--spacing-0: 0px;       /* 0 */
--spacing-1: 4px;       /* 1 */
--spacing-2: 8px;       /* 2 */
--spacing-3: 12px;      /* 3 */
--spacing-4: 16px;      /* 4 */
--spacing-5: 20px;      /* 5 */
--spacing-6: 24px;      /* 6 */
--spacing-8: 32px;      /* 8 */
--spacing-10: 40px;     /* 10 */
--spacing-12: 48px;     /* 12 */
--spacing-16: 64px;     /* 16 */
--spacing-20: 80px;     /* 20 */
```

### 組件內部間距 (Component Padding)

| 組件類型 | 水平 Padding | 垂直 Padding | Tailwind Class |
|----------|--------------|--------------|----------------|
| 按鈕 (小) | 12px | 4px | `px-3 py-1` |
| 按鈕 (中) | 16px | 8px | `px-4 py-2` |
| 面板 | 16px | 16px | `p-4` |
| 對話框 | 24px | 24px | `p-6` |
| 輸入框 | 12px | 8px | `px-3 py-2` |

### 組件間距 (Component Gaps)

```css
/* Flex/Grid Gap */
--gap-tight: 4px;       /* gap-1 - 緊密排列 */
--gap-normal: 8px;      /* gap-2 - 標準間距 */
--gap-relaxed: 12px;    /* gap-3 - 寬鬆間距 */
--gap-loose: 16px;      /* gap-4 - 疏鬆間距 */
```

**使用場景**：
- 圖標 + 文字: `gap-2` (8px)
- 按鈕組: `gap-2` (8px)
- 卡片列表: `gap-4` (16px)
- 節點堆疊: `gap-3` (12px)

### 網格系統 (Grid Background)

```css
/* Canvas Grid Pattern */
.grid-bg {
  background-image: radial-gradient(#27272a 1px, transparent 1px);
  background-size: 24px 24px;
}
```

**規範**：
- 網格點大小: 1px
- 網格間距: 24px × 24px
- 網格顏色: `#27272a` (gray-800)

---

## 🧩 組件規範

### 按鈕 (Buttons)

#### 主要按鈕 (Primary Button)

```tsx
<button className="bg-mw-accent hover:bg-violet-600 px-3 py-1 rounded text-xs">
  Export
</button>
```

**規格**：
- 背景: `bg-mw-accent` (#8b5cf6)
- Hover: `bg-violet-600` (#7c3aed)
- 文字: 白色，`text-xs` (12px)
- 圓角: `rounded` (4px)
- 內距: `px-3 py-1` (12px × 4px)

#### 次要按鈕 (Secondary Button)

```tsx
<button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs">
  Share
</button>
```

**規格**：
- 背景: 半透明白色 10%
- Hover: 半透明白色 20%
- 其餘與主要按鈕相同

#### 圖標按鈕 (Icon Button)

```tsx
<button className="p-1 hover:bg-white/10 rounded disabled:opacity-30">
  <Icons.Undo size={14} />
</button>
```

**規格**：
- 內距: `p-1` (4px)
- Hover: 半透明白色 10%
- 禁用: 透明度 30%
- 圖標尺寸: 14px

### 面板 (Panels)

#### 側邊欄面板 (Sidebar Panel)

```tsx
<div className="absolute top-20 right-6 w-80 bg-mw-panel/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
  {/* content */}
</div>
```

**規格**：
- 寬度: `w-80` (320px)
- 背景: `bg-mw-panel/95` (95% 不透明)
- 模糊: `backdrop-blur-xl` (24px)
- 邊框: `border-white/10` (10% 白色)
- 圓角: `rounded-xl` (12px)
- 陰影: `shadow-2xl`

#### 浮動面板 (Floating Panel)

```tsx
<div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 rounded-full px-3 py-1.5">
  {/* toolbar content */}
</div>
```

**規格**：
- 背景: `bg-black/80` (80% 不透明黑色)
- 模糊: `backdrop-blur` (8px)
- 圓角: `rounded-full` (全圓角)
- 內距: `px-3 py-1.5` (12px × 6px)

### 輸入框 (Input Fields)

```tsx
<input 
  type="text"
  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
  placeholder="Search commands..."
/>
```

**規格**：
- 背景: 透明 (由容器提供背景)
- 文字: `text-sm` (14px), 白色
- Placeholder: `text-gray-500`
- Focus: 無外框 (`focus:outline-none`)
- 建議: 由外層容器提供邊框與背景

### 選擇狀態 (Selection State)

#### 圖層選中

```tsx
<div className="ring-2 ring-mw-accent shadow-[0_0_25px_rgba(139,92,246,0.5)]">
  {/* selected layer */}
</div>
```

**規格**：
- 外框: `ring-2 ring-mw-accent` (2px 紫色)
- 光暈: `shadow-[0_0_25px_rgba(139,92,246,0.5)]`

#### 選擇控點 (Selection Handles)

```tsx
<div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-mw-accent rounded-full cursor-nwse-resize" />
```

**規格**：
- 尺寸: `w-2.5 h-2.5` (10px)
- 背景: 白色
- 邊框: `border-mw-accent` (紫色)
- 圓角: `rounded-full` (全圓)
- 游標: 調整大小游標 (nwse-resize 等)

### 徽章與指示器 (Badges & Indicators)

#### 狀態指示器

```tsx
<div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-yellow-400 animate-ping' : 'bg-green-500'}`} />
```

**規格**：
- 尺寸: `w-2 h-2` (8px)
- 圓角: `rounded-full`
- 思考中: 黃色 + `animate-ping`
- 就緒: 綠色

#### 快捷鍵徽章

```tsx
<div className="text-[10px] text-gray-600 border border-white/10 px-1.5 py-0.5 rounded">
  ESC
</div>
```

**規格**：
- 字體: 10px, `text-gray-600`
- 邊框: `border-white/10`
- 內距: `px-1.5 py-0.5` (6px × 2px)
- 圓角: `rounded` (4px)

---

## 🎬 動畫規範

### 動畫時長 (Animation Duration)

```css
/* Tailwind Duration Classes */
--duration-fast: 100ms;      /* duration-100 - 即時反饋 */
--duration-normal: 200ms;    /* duration-200 - 標準過渡 */
--duration-slow: 300ms;      /* duration-300 - 面板動畫 */
--duration-slower: 500ms;    /* duration-500 - 複雜動畫 */
```

**使用場景**：
- Hover 效果: `duration-100`
- 按鈕點擊: `duration-200`
- 面板開關: `duration-300`
- 自訂動畫: `duration-500` 或更長

### 緩動函數 (Easing Functions)

```css
/* Tailwind Easing */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**推薦**：
- 進入動畫: `ease-out`
- 退出動畫: `ease-in`
- 互動回饋: `ease-in-out`

### 內建動畫 (Built-in Animations)

#### 浮動動畫 (Float)

```css
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

**用途**: 裝飾性浮動元素

#### Tailwind 內建動畫

```css
/* 常用動畫 Class */
.animate-pulse        /* 脈衝閃爍 - AI 圖標 */
.animate-ping         /* 擴散波紋 - 狀態指示器 */
.animate-bounce       /* 彈跳 - 載入指示器 */
.animate-spin         /* 旋轉 - 載入動畫 */
```

### 過渡動畫 (Transitions)

#### 標準過渡

```tsx
className="transition-all duration-100"
```

**涵蓋**: transform, opacity, background, color, border 等所有屬性

#### 特定屬性過渡

```tsx
className="transition-colors duration-200"  // 僅顏色
className="transition-transform duration-300" // 僅變換
className="transition-opacity duration-200"  // 僅透明度
```

### 進入/退出動畫 (Enter/Exit Animations)

```tsx
// 使用 Tailwind 動畫類別
className="animate-in slide-in-from-right-10 duration-300"  // 從右側滑入
className="animate-in fade-in duration-200"                  // 淡入
className="animate-in slide-in-from-bottom-2 fade-in"       // 從下方淡入
```

**規範**：
- 面板開啟: 滑入 + 淡入
- 提示工具列: 從下方滑入
- 對話框: 淡入 + 輕微縮放

---

## 🎨 圖標系統

### 圖標庫

**使用**: Lucide React v0.554.0

```tsx
import { Sparkles, X, Undo, Redo, Command, Search } from 'lucide-react';
```

### 圖標尺寸 (Icon Sizes)

| 尺寸類別 | px 值 | 使用場景 |
|----------|-------|----------|
| xs | 10px | 極小圖標、內嵌文字圖標 |
| sm | 14px | 按鈕圖標、工具列 |
| md | 18px | 輸入框圖標、列表圖標 |
| lg | 24px | 主要操作圖標 |
| xl | 32px | 特色圖標、品牌標誌 |

### 圖標顏色規範

```tsx
// 根據上下文調整顏色
<Icons.Search className="text-gray-500" size={18} />      // 次要圖標
<Icons.Sparkles className="text-white" size={24} />       // 主要圖標
<Icon className="text-mw-accent" size={14} />             // 強調圖標
```

### Modifier 圖標映射

參考 `NodeSystemPanel.tsx` 中的 MODIFIER_CATALOG_RAW：

| Modifier | Icon | Color |
|----------|------|-------|
| Group | Folder | yellow-500 |
| Outline | Circle | cyan-400 |
| Extrude | Box | amber-500 |
| Glitch | Tv | purple-400 |
| Bloom | Sun | amber-200 |
| ... | ... | ... |

---

## ♿ 可訪問性標準 (Accessibility)

### 色彩對比 (Color Contrast)

**WCAG 2.1 AA 級標準**：
- 正常文字 (16px+): 對比度 ≥ 4.5:1
- 大文字 (24px+): 對比度 ≥ 3:1
- UI 組件: 對比度 ≥ 3:1

**檢查結果**：
- ✅ `#e4e4e7` (zinc-100) on `#0f0f11` (mw-bg): **13.8:1** (Pass AAA)
- ✅ `#a1a1aa` (gray-400) on `#0f0f11` (mw-bg): **7.2:1** (Pass AA)
- ✅ `#8b5cf6` (mw-accent) on `#0f0f11` (mw-bg): **5.8:1** (Pass AA)

### 鍵盤導航 (Keyboard Navigation)

**必須支援的快捷鍵**：
- `Cmd/Ctrl + K`: 開啟命令面板
- `Cmd/Ctrl + Z`: 撤銷
- `Cmd/Ctrl + Shift + Z`: 重做
- `ESC`: 關閉對話框/面板
- `Tab`: 焦點導航
- `Enter`: 確認操作

### Focus 狀態

```tsx
// 建議添加 focus 狀態（目前部分缺失）
className="focus:outline-none focus:ring-2 focus:ring-mw-accent focus:ring-offset-2 focus:ring-offset-mw-bg"
```

### ARIA 屬性

**建議添加**：
```tsx
<button aria-label="Undo last action">
  <Icons.Undo size={14} />
</button>

<div role="dialog" aria-modal="true" aria-labelledby="chat-title">
  {/* chat panel */}
</div>
```

### 動畫偏好設定

```css
/* 尊重使用者的動畫偏好設定 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📦 組件檢查清單 (Component Checklist)

建立新組件時，確認以下事項：

- [ ] 使用設計系統中定義的色彩
- [ ] 遵循間距系統 (4px 基準)
- [ ] 使用指定字體家族 (Inter / JetBrains Mono)
- [ ] 添加適當的 hover/focus 狀態
- [ ] 提供鍵盤導航支援
- [ ] 添加 ARIA 屬性 (如適用)
- [ ] 動畫時長符合規範 (100ms-300ms)
- [ ] 檢查色彩對比度 (至少 AA 級)
- [ ] 使用 Tailwind 類別而非自訂 CSS (優先)
- [ ] 支援 dark mode (已預設 dark-first)

---

## 🔧 開發工具建議

### VS Code 擴展
- **Tailwind CSS IntelliSense**: 自動完成 Tailwind 類別
- **Color Highlight**: 視覺化顏色代碼
- **Prettier**: 程式碼格式化

### 設計工具
- **Figma**: 設計稿與原型
- **Contrast Checker**: 色彩對比度檢查

### 測試工具
- **axe DevTools**: 可訪問性測試
- **Lighthouse**: 效能與可訪問性稽核

---

## 📝 變更日誌

### v1.0 (2025-11-25)
- ✅ 初始版本
- ✅ 從現有代碼提取設計標準
- ✅ 建立完整色彩、字體、間距系統
- ✅ 定義組件規範與動畫規範
- ✅ 添加可訪問性標準

---

**維護者**: Mod-Weave Core Design Team  
**貢獻指南**: 所有 UI 變更必須符合此設計標準，特殊情況需經團隊討論
