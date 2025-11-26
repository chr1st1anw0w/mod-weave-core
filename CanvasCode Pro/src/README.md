# CanvasCode Pro v3.0

專業的設計到代碼轉換工具，支援 AI 驅動的 UI 分析、線框圖轉換、設計系統提取等功能。

## ✨ 核心功能

### 🎨 互動式畫布
- **拖曳與選取**: 支援單選、多選、框選
- **智能吸附**: 物件自動對齊，顯示紅色導引線
- **變形調整**: 8 方位縮放控制點
- **平移縮放**: Space + 拖曳平移，Ctrl/Cmd + 滾輪縮放
- **歷史記錄**: Undo/Redo (最多 30 步)

### 🤖 AI 整合 (Gemini API)
- **Analyze Code**: 分析 UI 並生成 HTML/Tailwind 代碼
- **Wireframe**: 轉換為低保真線框圖
- **Design System**: 提取設計系統 (顏色、字體、間距)
- **Style Analysis**: 視覺風格分析

### 💬 智能側邊欄
- **11 種工具模式**: Chat, Deep Research, OCR, Translate 等
- **多模態對話**: 支援 @ 提及畫布物件
- **TopTips**: 動態提示語

### 📐 模版系統
6 種預設模版：
1. **Image to Code**: 圖片轉代碼 (預設)
2. **Blank Canvas**: 空白畫布
3. **Component Lab**: 三欄設計實驗室
4. **Mobile Flow**: 手機流程設計
5. **Dashboard**: 後台佈局
6. **Code → Design**: 代碼視覺化

## 🔑 API 設定

### Google Gemini API

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 創建 API Key
3. 編輯 `/utils/ai.ts` 檔案：

```typescript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // 替換為您的 API Key
```

4. （可選）取消註解真實 API 實作：

```typescript
// 將 callGeminiAPI 替換為 callGeminiAPIReal
export const callGeminiAPI = callGeminiAPIReal;
```

**注意**: 目前使用 Mock 響應進行演示。啟用真實 API 後，將調用 Gemini 2.0 Flash 模型進行分析。

## 🚀 快速開始

### 基本操作

1. **啟動應用**: 選擇一個模版開始
2. **上傳圖片**: 點擊工具列 `+` 按鈕
3. **選取物件**: 點擊物件選取，拖曳移動
4. **AI 分析**: 
   - 方法 A: 滑鼠懸停物件 → 點擊 Hover Toolbar 圖示
   - 方法 B: 右鍵物件 → Ask AI (待實作)
5. **查看結果**: 右側面板顯示分析、代碼、Figma 指南

### 鍵盤快捷鍵

- `Space + 拖曳`: 平移畫布
- `Ctrl/Cmd + 滾輪`: 縮放
- `Ctrl/Cmd + Z`: 撤銷
- `Ctrl/Cmd + Shift + Z`: 重做
- `Delete/Backspace`: 刪除選取物件
- `Shift + 點擊`: 多選

## 📦 技術架構

### 核心技術
- **React** + **TypeScript**
- **Tailwind CSS** v4.0
- **Google Gemini API** (gemini-2.0-flash-exp)
- **Lucide React** (圖示)

### 檔案結構

```
/
├── App.tsx                  # 主應用
├── types/
│   └── index.ts            # TypeScript 類型定義
├── utils/
│   ├── canvas.ts           # 畫布工具函數
│   └── ai.ts               # AI API 整合
├── components/
│   ├── CanvasBoard.tsx     # 核心畫布組件
│   ├── ChatSidebar.tsx     # 智能側邊欄
│   ├── HoverToolbar.tsx    # 懸停工具列
│   ├── ResultsPanel.tsx    # 結果面板
│   └── TemplateSelector.tsx # 模版選擇器
└── styles/
    └── globals.css         # 全域樣式
```

## 🎯 使用場景

### 1. Image to Code (主流程)
```
上傳 UI 設計圖 → 選取圖片 → 點擊 Analyze Code → 
查看代碼 → 複製使用 → 在 Chat 中迭代優化
```

### 2. Wireframe 轉換
```
上傳高保真 UI → 選取 → 點擊 Wireframe → 
獲得低保真 HTML 架構
```

### 3. Design System 提取
```
上傳 UI → 選取 → 點擊 Design System → 
獲得 Tailwind Config + Style Guide
```

## 🔧 進階功能

### 群組與佈局
- **Layout 物件**: 用於定義區域 (Sidebar, Header, Content)
- **Group 物件**: 將多個物件組合 (待實作)

### 吸附與對齊
- 自動吸附閾值: 5px
- 支援邊緣、中心點對齊
- 紅色導引線即時反饋

### 歷史管理
- 自動保存操作歷史
- 最多儲存 30 步
- 支援跨操作撤銷/重做

## 📝 注意事項

1. **CORS 問題**: 外部圖片可能因 CORS 無法繪製到 Canvas，建議上傳本地圖片
2. **API 限制**: Gemini API 有請求速率限制，請合理使用
3. **瀏覽器支援**: 建議使用 Chrome/Edge 最新版本
4. **圖片大小**: 建議上傳 < 5MB 的圖片以獲得最佳效能

## 🎨 設計風格

- **極簡主義**: 亮色模式，白底黑字
- **LoveArt 風格**: 灰階為主，藍紫色點綴
- **現代化**: 圓角、陰影、漸層

## 📄 授權

此專案為演示用途，請勿用於收集 PII 或處理敏感資料。

---

**版本**: 3.0  
**更新日期**: 2024  
**技術支援**: CanvasCode Team
