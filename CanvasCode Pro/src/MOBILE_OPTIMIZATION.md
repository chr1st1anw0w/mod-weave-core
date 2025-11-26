# CanvasCode Pro - 手機端優化指南

## 📱 概述

CanvasCode Pro 已完成完整的手機端 UI/UX 優化，專為 iPhone/Android 裝置（寬度 375px～430px）設計，符合現代移動端交互標準。

## ✨ 核心優化特性

### 1. 響應式佈局轉換
- **桌面端**：多欄佈局，包含左側工具欄、中央畫布、右側結果面板
- **手機端**：單欄直向排列，所有內容堆疊顯示，優化觸控體驗

### 2. 底部導航欄 (Bottom Navigation)
取代桌面版的側欄，提供 5 個主要功能入口：
- 🏠 **畫布** - 返回主畫布視圖
- 🔧 **工具** - 開啟工具箱 Bottom Sheet
- 📐 **模板** - 全屏模板選擇器
- 💬 **對話** - AI 聊天助手
- 📄 **結果** - 查看生成的程式碼

**設計特點：**
- 固定在螢幕底部，始終可見
- 最小觸控區域：60px × 60px (超過 44px 標準)
- 包含圖示、標籤和活動指示器
- Badge 通知顯示新結果

### 3. Bottom Sheet 互動模式
所有彈出面板改用 Bottom Sheet 設計：

#### 工具箱 Sheet
- 從底部滑出，最高 85vh
- 拖動把手指示可滑動
- 每個工具項目最小高度 88px
- 大尺寸圖示 (24px) 和清晰描述

#### 結果面板 Sheet
- 可拖動的底部彈窗
- 三個標籤：分析、程式、Figma
- 複製按鈕擴展至全寬（手機模式）
- 預覽/原始碼切換按鈕觸控優化

### 4. 全屏 Sheet 模式
部分功能使用全屏 Sheet：

- **模板選擇器** - 完整的模板瀏覽體驗
- **聊天助手** - 完整的對話界面
- **設定面板** - 所有設定選項

每個全屏 Sheet 包含：
- 固定頂部導航（標題 + 關閉按鈕）
- 可滾動內容區域
- 最小觸控目標 44px × 44px

### 5. 觸控優化標準

#### 最小觸控尺寸
所有可互動元素符合 WCAG 2.1 標準：
- **按鈕**：最小 44px × 44px
- **工具項**：88px 高度
- **設定選項**：64px～88px 高度
- **輸入框**：52px 高度

#### 視覺反饋
- `hover:` 效果改為 `active:` (適合觸控)
- 點按時顏色變化
- 禁用 tap highlight (`-webkit-tap-highlight-color: transparent`)

#### 手勢支援
- Bottom Sheet 支援向下滑動關閉
- 拖動把手視覺提示
- 平滑過渡動畫 (300ms)

### 6. 安全區域支援
使用 CSS `env()` 適配 iPhone 瀏海和底部橫條：

```css
.safe-area-bottom {
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}
```

應用於：
- 底部導航欄
- 聊天輸入框
- 設定面板底部按鈕

### 7. 打字體驗優化
- 輸入框 `font-size: 16px` 防止 iOS 自動縮放
- 移除自動完成的不必要縮放
- 鍵盤彈出時視圖自動調整

### 8. 中文介面本地化
手機端使用中文界面：
- 按鈕標籤翻譯 (「複製程式碼」、「完成」)
- 分頁標籤翻譯 (「分析」、「程式」)
- 提示文字翻譯

## 🎨 視覺設計

### 間距系統
- 頁面邊距：16px (手機) vs 24px (桌面)
- 卡片間距：12px (手機) vs 16px (桌面)
- 底部導航高度：80px

### 字體大小
- 標題：14px～16px
- 正文：14px～15px
- 說明文字：11px～12px
- 標籤：10px～12px

### 圓角
- 按鈕：10px～14px
- 卡片：16px～20px
- Bottom Sheet：24px (頂部)

### 陰影
- Bottom Sheet：`shadow-2xl`
- 卡片：`shadow-sm`
- 浮動按鈕：`shadow-lg`

## 📊 佈局結構

### 手機端層級
```
┌─────────────────────────┐
│   Header (56px)         │ ← 固定頂部
├─────────────────────────┤
│                         │
│   Canvas Area           │
│   (可滾動/可縮放)        │ ← 主內容區
│                         │
├─────────────────────────┤
│   Bottom Nav (80px)     │ ← 固定底部
└─────────────────────────┘
```

### Sheet 層級 (z-index)
- Header: `z-30`
- Bottom Nav: `z-30`
- Bottom Sheet: `z-40`
- Full Screen Sheet: `z-50`

## 🔧 技術實現

### 自動檢測
應用自動檢測視窗寬度：
```typescript
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
```

### 條件渲染
根據 `isMobile` prop 切換不同的 UI：
```typescript
{isMobile ? <MobileLayout /> : <DesktopLayout />}
```

### 組件適配
所有主要組件支援 `isMobile` prop：
- `ResultsPanel`
- `ChatSidebar`
- `SettingsModal`

## 🚀 使用方式

1. **在手機瀏覽器中打開**
   - 應用會自動切換到手機模式

2. **使用開發者工具測試**
   - 開啟 Chrome DevTools
   - 切換到設備模式 (Cmd/Ctrl + Shift + M)
   - 選擇 iPhone 或 Android 設備

3. **調整視窗大小**
   - 視窗寬度 ≤ 768px 自動切換手機模式
   - 實時響應視窗大小變化

## 📐 設計規範遵循

### Apple Human Interface Guidelines
- ✅ 44pt 最小觸控目標
- ✅ Safe Area 支援
- ✅ 模態視圖的標準呈現方式
- ✅ Tab Bar 導航模式

### Material Design (Android)
- ✅ 48dp 最小觸控目標
- ✅ Bottom Navigation
- ✅ Bottom Sheet 手勢
- ✅ Elevation 層次

### WCAG 2.1
- ✅ AA 級觸控目標尺寸
- ✅ 色彩對比度
- ✅ 鍵盤導航
- ✅ ARIA 標籤

## 🎯 性能優化

- 條件渲染減少 DOM 節點
- CSS 過渡使用 GPU 加速
- `-webkit-overflow-scrolling: touch` 慣性滾動
- 事件監聽器正確清理

## 🐛 已知限制

1. **桌面版工具欄** - 在手機模式下暫時移除 FloatingDock
2. **拖放手勢** - 畫布物件移動在觸控裝置上需要優化
3. **多點觸控** - 縮放/旋轉手勢尚未實現

## 📝 下一步計畫

- [ ] 畫布多點觸控縮放
- [ ] 物件拖放手勢優化
- [ ] 離線模式支援
- [ ] PWA 安裝提示
- [ ] 橫屏模式優化

---

**版本**: v3.0  
**更新日期**: 2024-11  
**維護**: CanvasCode Pro Team
