# Mod-Weave Core

Mod-Weave Core 是一個基於 React 的非破壞性圖像編輯應用程式，結合 AI 功能和節點系統。

## 功能特色

- **Canvas 渲染系統**：圖層渲染、變換支援、動態修飾器預覽
- **圖層面板**：階層式圖層列表、圖層選擇、修飾器指示器
- **AI 對話面板**：Gemini API 整合、多模態互動、圖片生成與編輯
- **節點系統面板**：43 種非破壞性修飾器節點、拖放重新排序、即時預覽
- **系統功能**：完整的 Undo/Redo 系統、Command Palette

## 技術堆疊

- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS
- Google Gemini API

## 安裝與運行

```bash
# 安裝依賴
npm install

# 設置環境變數
# 創建 .env.local 文件並添加：
# GEMINI_API_KEY=your_api_key_here

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build
```

## 開發文檔

- [PRD.md](./PRD.md) - 產品需求文檔
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - 設計系統文檔
- [DEVELOPMENT_STATUS.md](./DEVELOPMENT_STATUS.md) - 開發狀態報告

## License

MIT
