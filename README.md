# Mod-Weave Core

<div align="center">

**🎨 AI 驅動的新世代非破壞性設計與動態圖形工具**

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

</div>

---

## 📖 簡介

Mod-Weave Core 是一個融合**節點式修飾器系統**與 **AI 深度整合**的現代設計工具。靈感源自 Modyfi，它提供完全非破壞性的工作流程，讓使用者透過視覺化節點堆疊和自然語言指令來創建複雜的視覺效果和動畫。

### 🎯 核心理念

- **非破壞性工作流**：原始圖層資產永不改變，所有操作都以節點形式應用於修飾器堆疊
- **AI 優先整合**：Gemini 不是附加功能，而是工作流程的核心部分
- **視覺化程式設計**：透過節點系統面板創建精緻的程序化效果
- **動畫為預設**：參數可動畫化，物理基礎修飾器是一等公民

---

## ✨ 功能特色

### 🖼️ Canvas 渲染系統
- ✅ 完整的圖層渲染（Image、Text、Shape）
- ✅ 變換支援（位置、旋轉、縮放、透明度）
- ✅ 動態修飾器效果預覽（CSS filters）
- ✅ 圖層選擇機制與視覺反饋
- ✅ 浮動工具列（AI Edit、Opacity、Blend Mode）
- ✅ 選擇控點（Selection Handles）

### 📑 圖層管理系統
- ✅ 階層式圖層列表顯示
- ✅ 圖層選擇功能
- ✅ 修飾器指示器顯示
- ✅ 拖放重新排序

### 🤖 AI 對話面板
- ✅ **完整 Gemini API 整合**（`@google/genai` v1.30.0）
- ✅ **多模態互動支援**
- ✅ **文字轉圖片生成**（gemini-3-pro-image-preview）
- ✅ **圖片編輯**（gemini-2.5-flash-image）
- ✅ **圖片分析**（gemini-3-pro-preview）
- ✅ **AI Function Calling**（updateModifierParams、addModifier、createConnection）
- ✅ 模型選擇控制（Thinking Mode、Fast Mode）
- ✅ 圖片上傳功能（支援 base64）
- ✅ 對話訊息歷史記錄

### 🔧 節點系統面板
- ✅ **43 種非破壞性修飾器節點**
  - 14 個類別：Shape、3D、Distort、Pattern、Physics、Color、Effect、Blur、Glass、Style、Light、Retro、AI、Util
- ✅ **視覺化參數連接（Visual Parameter Wiring）**
  - I/O 連接埠系統（支援 number、color、boolean、string、image、generic）
  - 拖曳繪製連線
  - 連線視覺化顯示
  - AI 輔助建立連線
- ✅ **即時預覽與互動**
  - 即時預覽面板
  - 參數控制介面（滑桿、輸入框、顏色選擇器）
  - 修飾器啟用/停用切換
- ✅ **修飾器分組**
  - 基本分組功能
  - 可折疊節點
  - 子修飾器支援

### ⚙️ 系統功能
- ✅ **完整的 Undo/Redo 系統**（最多 50 步）
  - Cmd/Ctrl+Z 撤銷
  - Cmd/Ctrl+Shift+Z 重做
- ✅ **Command Palette 命令面板**（Cmd/Ctrl+K）
- ✅ 收藏系統與最近使用追蹤

---

## 🚀 快速開始

### 前置需求
- Node.js 18+
- npm 或 yarn
- Google Gemini API Key

### 安裝步驟

```bash
# 1. 克隆專案
git clone https://github.com/chr1st1anw0w/mod-weave-core.git
cd mod-weave-core

# 2. 安裝依賴
npm install

# 3. 設置環境變數
# 創建 .env.local 文件並添加您的 Gemini API Key：
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# 4. 啟動開發伺服器
npm run dev

# 5. 在瀏覽器中打開
# 訪問 http://localhost:5173
```

### 構建生產版本

```bash
npm run build
npm run preview
```

### 運行測試

```bash
npm test
```

---

## 📁 專案結構

```
mod-weave-core/
├── components/              # React 組件
│   ├── Canvas.tsx          # Canvas 渲染引擎
│   ├── ChatPanel.tsx       # AI 對話面板
│   ├── LayerPanel.tsx      # 圖層管理面板
│   ├── NodeSystemPanel.tsx # 節點系統面板
│   ├── CommandPalette.tsx  # 命令面板
│   ├── PatternGeneratorPanel.tsx # 程序化圖案生成器
│   ├── modifiers/          # 修飾器組件
│   │   ├── base.tsx        # 基礎修飾器
│   │   ├── blur.tsx        # 模糊效果
│   │   ├── color.tsx       # 顏色調整
│   │   ├── effects.tsx     # 特效
│   │   ├── distort.tsx     # 扭曲效果
│   │   └── ...
│   └── ui/                 # UI 基礎組件
├── hooks/                  # React Hooks
│   ├── useHistory.ts       # Undo/Redo 邏輯
│   ├── useChat.ts          # AI 聊天邏輯
│   └── useMobileOptimizations.ts
├── services/               # 服務層
│   ├── geminiService.ts    # Gemini API 整合
│   └── patternGenerator/   # 圖案生成服務
├── types.ts                # TypeScript 類型定義
├── App.tsx                 # 主應用組件
└── docs/                   # 文檔
```

---

## 🛠️ 技術堆疊

| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.0 | UI 框架 |
| **TypeScript** | 5.8.2 | 類型安全 |
| **Vite** | 6.2.0 | 建置工具 |
| **Tailwind CSS** | - | 樣式框架 |
| **@google/genai** | 1.30.0 | Gemini API SDK |
| **lucide-react** | 0.554.0 | 圖標庫 |
| **html2canvas** | 1.4.1 | Canvas 快照 |
| **react-draggable** | 4.5.0 | 拖放功能 |
| **Jest** | 30.2.0 | 測試框架 |

---

## 📚 開發文檔

| 文檔 | 描述 |
|------|------|
| [PRD.md](./PRD.md) | 產品需求文檔 - 詳細的功能規格與實現狀態 |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | 設計系統文檔 - UI/UX 設計規範 |
| [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) | 開發狀態報告 - Phase 1 完成度 100% |
| [ARCHITECTURE_REFACTOR.md](./ARCHITECTURE_REFACTOR.md) | 架構重構計劃 |
| [MODIFIER_PREVIEW_STATUS.md](./MODIFIER_PREVIEW_STATUS.md) | 修飾器預覽狀態 |
| [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) | 部署指南 |
| [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md) | 快速測試指南 |

---

## 🎯 開發狀態

**當前版本**：v1.1
**Phase 1 狀態**：✅ 核心功能開發已完成（100%）

### ✅ 已完成（Phase 1）
- Canvas 渲染引擎
- Layer 管理系統
- AI Chat 整合
- Node System 面板
- 43 種 Modifier 節點庫
- Visual Parameter Wiring
- Undo/Redo 系統
- Command Palette

### 🚧 待開發（Phase 2）
- Animation Timeline
- Export Engine
- Real-Time Collaboration
- Advanced Grouping
- Version History

---

## 🤝 貢獻

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 創建您的特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交您的變更（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 開啟 Pull Request

---

## 📝 License

本專案採用 MIT License - 詳見 [LICENSE](./LICENSE) 文件

---

## 📧 聯絡方式

**專案連結**：[https://github.com/chr1st1anw0w/mod-weave-core](https://github.com/chr1st1anw0w/mod-weave-core)

---

<div align="center">

**⭐ 如果這個專案對您有幫助，請給我們一個星標！**

Made with ❤️ by the Mod-Weave Team

</div>
