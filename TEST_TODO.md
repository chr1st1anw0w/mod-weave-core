# 📋 瀏覽器測試功能的 To‑Do List

以下列出在 **mod‑weave‑core** 專案中，針對瀏覽器端功能（尤其是 `components/modifiers`）需要完成的測試項目。請依序執行，並於每項完成後在對應的 **✅** 勾選。

---

### 1️⃣ 基礎功能測試（Functional Tests）

| 編號 | 測試項目 | 目的 | 預期結果 | 備註 |
|------|----------|------|----------|------|
| 1.1 | **核心 `core.tsx` 匯入與渲染** | 確認 `core` 組件能正確載入並渲染 | 頁面無錯誤、DOM 中出現預期的根節點 `<div class="core-modifier">` | 使用 Jest + React Testing Library |
| 1.2 | **模糊效果 `blur.tsx`** | 測試 `blur` 參數變更時的 CSS `filter: blur()` 是否正確套用 | 改變 `blurAmount` 後，元素的 `filter` 樣式即時更新 | 可加入快照測試 |
| 1.3 | **樣式組件 `style.tsx`** | 確認自訂樣式屬性（如 `borderRadius`, `boxShadow`）正確傳遞 | 元素樣式與傳入的 props 完全對應 |  |
| 1.4 | **實用工具 `utility.tsx`** | 測試工具函式（如 `mergeStyles`, `clampValue`）的邏輯正確性 | 回傳值符合預期範圍或結構 | 單元測試 (unit) |
| 1.5 | **顏色組件 `color.tsx`** | 測試顏色轉換、透明度處理是否正確 | 輸入 HEX / RGB 後，產生正確的 CSS `color` |  |
| 1.6 | **參數控制面板** | 確認 UI 控制項（滑桿、輸入框）能即時更新對應的 Modifier | UI 變更 → 組件即時重新渲染 |  |

---

### 2️⃣ UI/UX 測試（UI Tests）

| 編號 | 測試項目 | 目的 | 預期結果 |
|------|----------|------|----------|
| 2.1 | **三欄布局（Catalog / Preview / Controls）** | 確認三欄在不同螢幕寬度下仍保持可視且不重疊 | 在 320‑1920px 範圍內，欄位寬度自適應，無水平滾動 |
| 2.2 | **可調整欄寬（Resizable Columns）** | 拖曳分隔線時，欄寬即時更新且不破版 | 拖曳後，左/中/右欄寬度比例保持合理（最小 10%） |
| 2.3 | **Solo Mode** | 點擊「Solo」時，只顯示單一 Modifier 的效果 | 其他 Modifier 隱藏，Preview 僅呈現選中效果 |
| 2.4 | **展開/收合參數區塊** | 點擊標題可折疊/展開參數列表 | 折疊時高度縮減，展開時恢復原高度 |
| 2.5 | **動畫與過渡** | 確認 UI 互動（滑桿、切換）有平滑過渡 | 0.2‑0.3s 的 CSS transition，無卡頓 |

---

### 3️⃣ 跨瀏覽器相容性（Cross‑Browser Compatibility）

| 編號 | 瀏覽器 | 測試項目 |
|------|--------|----------|
| 3.1 | Chrome (最新) | 全功能測試 |
| 3.2 | Safari (macOS) | CSS `filter`, `backdrop-filter` 是否正確 |
| 3.3 | Firefox | Flexbox、Grid 佈局是否正常 |
| 3.4 | Edge | 兼容性檢查 |
| 3.5 | iOS Safari (模擬器) | 手機尺寸下的觸控滑桿、點擊是否正常 |

> **工具建議**：使用 **BrowserStack** 或 **Sauce Labs** 進行自動化跨瀏覽器測試；或在本機安裝多個瀏覽器手動驗證。

---

### 4️⃣ 性能測試（Performance Tests）

| 編號 | 測試項目 | 目的 | 工具 |
|------|----------|------|------|
| 4.1 | **首次渲染時間 (First Paint / FCP)** | 確保 UI 快速呈現 | Lighthouse、Chrome DevTools |
| 4.2 | **交互延遲 (Input Latency)** | 滑桿拖曳、參數變更的即時回饋 | Chrome Performance Profiler |
| 4.3 | **記憶體使用** | 防止記憶體泄漏，特別是大量切換 Modifier 時 | Chrome Memory Tab |
| 4.4 | **CPU 使用率** | 多個 Modifier 同時啟用時的 CPU 負載 | Chrome Performance → CPU Profiler |

---

### 5️⃣ 可存取性測試（Accessibility Tests）

| 編號 | 測試項目 | 目的 | 預期結果 |
|------|----------|------|----------|
| 5.1 | **鍵盤導覽** | 所有控制項可透過 Tab、Enter、Space 操作 | 方向鍵、Enter 能調整參數 |
| 5.2 | **ARIA 標籤** | 為滑桿、按鈕、切換提供適當的 `aria-label` | 螢幕閱讀器讀出正確描述 |
| 5.3 | **色彩對比** | 確保文字與背景的對比度 ≥ 4.5:1 | 使用 axe、Lighthouse 檢測 |
| 5.4 | **焦點樣式** | 交互元素在取得焦點時有明顯的視覺指示 | `outline` 或自訂焦點樣式 |

---

### 6️⃣ 回歸測試（Regression Tests）

| 編號 | 測試項目 | 目的 |
|------|----------|------|
| 6.1 | **新增 Modifier 後的整體渲染** | 確保舊有功能不受影響 |
| 6.2 | **移除或禁用 Modifier** | 確認 UI 能正確回到預設狀態 |
| 6.3 | **版本升級（React / TypeScript）** | 測試升級後的相容性 |

> **建議**：將上述測試寫成 **Jest + React Testing Library**（單元/整合）與 **Cypress**（端到端）兩套測試腳本，並在 CI（GitHub Actions）中自動執行。

---

### 7️⃣ 文件化與測試報告

| 編號 | 任務 |
|------|------|
| 7.1 | 為每個測試案例撰寫 **Test Plan**（測試目的、步驟、預期結果） |
| 7.2 | 在 `README.md` 中加入 **測試指令**（`npm test`, `npm run cypress`） |
| 7.3 | 產出測試覆蓋率報告（`nyc`、`cobertura`）並上傳至 **Codecov** |
| 7.4 | 每次 PR 必須通過所有測試，否則阻止合併（GitHub Actions 設定） |

---

## ✅ 完成檢查表

```
- [ ] 1. 基礎功能測試
- [ ] 2. UI/UX 測試
- [ ] 3. 跨瀏覽器相容性
- [ ] 4. 性能測試
- [ ] 5. 可存取性測試
- [ ] 6. 回歸測試
- [ ] 7. 文件化與測試報告
```

完成上述項目後，即可確保 **mod‑weave‑core** 的瀏覽器測試功能具備完整、可靠且可維護的測試基礎。祝開發順利 🚀！
