# 更新現有 AI Studio App 指南

## 🔄 快速更新步驟

### 選項 A：透過 AI Studio 界面更新

1. **進入你的 App**
   - 訪問 https://aistudio.google.com/
   - 點擊左側 "Apps"
   - 找到你的 "Mod-Weave Core" app 並點擊進入

2. **編輯模式**
   - 點擊右上角的 "Edit" 或 "⚙️ Settings" 按鈕
   - 進入編輯模式

3. **更新文件**
   
   只需更新修改過的文件：
   
   **本次更新的關鍵文件：**
   ```
   ✅ components/ModifierNodes.tsx    (節點組件優化)
   ✅ components/NodeSystemPanel.tsx  (拖放系統優化)
   ✅ services/geminiService.ts       (API 修復)
   ✅ index.css                       (新增文件)
   ```

4. **重新部署**
   - 點擊 "Deploy" 或 "Update" 按鈕
   - 等待構建完成
   - 刷新 app 頁面查看更新

---

### 選項 B：使用 Git 整合（如果啟用）

如果你的 AI Studio app 連接了 GitHub：

```bash
# 確保所有更改已提交
git status

# 推送到遠程倉庫
git push origin claude/fix-dependency-installation-01RZwGUJcHeaJXd4yG9tVZD5

# AI Studio 會自動檢測並部署更新
```

---

### 選項 C：完全替換（謹慎使用）

如果遇到問題，可以完全替換：

1. **備份現有 App 設置**
   - 記錄 API Key 配置
   - 記錄任何自定義設置

2. **刪除舊文件並上傳新文件**
   - 或直接覆蓋所有文件

3. **重新部署**

---

## 📋 本次更新內容

### 已修復的問題 ✅
- ❌ → ✅ TypeScript 編譯錯誤
- ❌ → ✅ 缺少 index.css 文件
- ❌ → ✅ Gemini API tools 參數配置錯誤

### 新增的功能優化 ✨
1. **IO 連接點改進**
   - 尺寸增加 40%（更易點擊）
   - 增強的懸停效果和發光
   - 改進的提示框樣式

2. **節點拖放體驗**
   - 拖動時的視覺反饋（旋轉、縮放、透明度）
   - 拖動手柄指示器
   - 放置位置指示線

3. **輸入組件優化**
   - 更大的滑桿和更好的觸感
   - 改進的顏色選擇器
   - 焦點狀態增強

4. **整體 UI 改進**
   - 更流暢的動畫過渡
   - 更好的視覺層次
   - 統一的設計語言

---

## 🔍 驗證更新

更新後檢查以下功能：

1. **節點拖放**
   - [ ] 可以拖動節點重新排序
   - [ ] 拖動時有視覺反饋
   - [ ] 放置位置有指示線

2. **IO 連接**
   - [ ] IO 點更大更易點擊
   - [ ] 懸停時有提示框
   - [ ] 可以創建連接

3. **輸入控制**
   - [ ] 滑桿可以正常調節
   - [ ] 顏色選擇器可以打開
   - [ ] 重置按鈕可見並可用

4. **AI 功能**
   - [ ] 可以與 Gemini 對話
   - [ ] 圖片生成功能正常
   - [ ] API 調用沒有錯誤

---

## 🐛 如果更新後出現問題

### 清除快取
```javascript
// 在瀏覽器 Console 執行
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### 檢查錯誤
1. 打開瀏覽器 DevTools (F12)
2. 查看 Console 標籤的錯誤信息
3. 查看 Network 標籤的請求失敗

### 回滾版本
如果需要回滾到之前的版本：
- 在 AI Studio 中查看版本歷史
- 選擇之前的版本並恢復

---

## 📞 需要幫助？

常見問題：

**Q: 更新後界面沒有變化？**
A: 嘗試強制刷新 (Ctrl+Shift+R) 或清除快取

**Q: 出現 TypeScript 錯誤？**
A: 檢查是否所有文件都已上傳完整

**Q: 拖放功能不工作？**
A: 確保 ModifierNodes.tsx 和 NodeSystemPanel.tsx 都已更新

**Q: API Key 錯誤？**
A: 檢查 AI Studio 中的 API Key 設置

---

## ✅ 更新檢查清單

部署前確認：
- [ ] 本地構建成功 (`npm run build`)
- [ ] TypeScript 無錯誤 (`npx tsc --noEmit`)
- [ ] 所有更新的文件都已上傳
- [ ] API Key 配置正確

部署後確認：
- [ ] App 可以正常打開
- [ ] 節點系統功能正常
- [ ] AI 功能可以使用
- [ ] 無 Console 錯誤

---

## 📊 更新統計

本次更新涉及：
- 2 個主要組件文件修改
- 1 個服務文件修復
- 1 個新增 CSS 文件
- 143 行代碼增加/修改
- 0 個破壞性變更

更新類型：**功能增強 + Bug 修復**
風險等級：**低** ✅

---

祝部署順利！🚀
