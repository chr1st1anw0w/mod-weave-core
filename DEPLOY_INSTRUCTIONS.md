# Mod-Weave Core - AI Studio 部署指南

## 🚀 快速部署步驟

### 方法 1：源碼部署（推薦）

1. **訪問 Google AI Studio**
   - URL: https://aistudio.google.com/
   - 登入你的 Google 帳號

2. **創建新 App**
   - 點擊左側 "Apps" 
   - 點擊 "Create new app"

3. **上傳這些文件：**
   ```
   📁 根目錄
   ├── index.html          ⭐ 必需
   ├── index.tsx           ⭐ 必需
   ├── index.css           ⭐ 必需
   ├── App.tsx             ⭐ 必需
   ├── types.ts            ⭐ 必需
   ├── metadata.json       ⭐ 必需（App 配置）
   ├── vite.config.ts      ⭐ 必需（構建配置）
   ├── tsconfig.json       ⭐ 必需（TypeScript 配置）
   ├── package.json        ⭐ 必需（依賴配置）
   │
   ├── 📁 components/      ⭐ 必需（所有 .tsx 文件）
   │   ├── Canvas.tsx
   │   ├── ChatPanel.tsx
   │   ├── CommandPalette.tsx
   │   ├── Icons.tsx
   │   ├── LayerPanel.tsx
   │   ├── ModifierNodes.tsx
   │   └── NodeSystemPanel.tsx
   │
   └── 📁 services/        ⭐ 必需
       └── geminiService.ts
   ```

4. **配置環境**
   - AI Studio 會自動提供 Gemini API Key
   - 不需要手動設置 .env 文件

5. **發布**
   - 點擊 "Deploy" 按鈕
   - 等待構建完成（約 1-2 分鐘）

### 方法 2：構建版本部署

1. **使用已構建的 dist/ 目錄**
   ```bash
   npm run build  # 如果需要重新構建
   ```

2. **上傳 dist/ 目錄內容**
   - dist/index.html
   - dist/assets/ (所有文件)

3. **確保 metadata.json 在根目錄**

## ⚙️ 重要配置

### metadata.json
```json
{
  "name": "Mod-Weave Core",
  "description": "A futuristic, AI-powered design tool blending generative modifiers with conversational collaboration.",
  "requestFramePermissions": []
}
```

### API Key 配置
- AI Studio 會自動注入 API Key 到 `process.env.API_KEY`
- 代碼中使用：`const apiKey = process.env.API_KEY`

## 🔧 本地測試

在部署前測試：
```bash
# 安裝依賴
npm install

# 本地運行
npm run dev

# 訪問 http://localhost:3000
```

## 📝 部署檢查清單

- [ ] 所有 TypeScript 文件無錯誤 (`npx tsc --noEmit`)
- [ ] 構建成功 (`npm run build`)
- [ ] metadata.json 配置正確
- [ ] 所有組件文件都已上傳
- [ ] API Key 配置已確認

## 🐛 常見問題

**Q: 上傳後看不到效果？**
A: 確保 index.html 中的 importmap 正確配置，使用 aistudiocdn.com

**Q: API Key 錯誤？**
A: 在 AI Studio 中檢查 API Key 設置，確保有權限

**Q: 構建失敗？**
A: 檢查 package.json 和 vite.config.ts 配置

## 📞 需要幫助？

如果遇到問題，檢查：
1. Browser Console (F12) 查看錯誤
2. Network Tab 查看資源加載
3. AI Studio 構建日誌

## ✨ 部署後的改進

已完成的優化：
- ✅ 修復依賴安裝問題
- ✅ 優化節點拖放 UI/UX
- ✅ 增強 IO 連接點視覺效果
- ✅ 改進拖動反饋動畫
- ✅ 提升輸入組件交互體驗
