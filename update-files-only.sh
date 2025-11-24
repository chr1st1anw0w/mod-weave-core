#!/bin/bash
# 列出本次更新需要替換的文件

echo "📦 本次更新只需替換這 4 個文件："
echo ""
echo "1️⃣  components/ModifierNodes.tsx"
echo "   📄 路徑: ./components/ModifierNodes.tsx"
echo "   📊 大小: $(du -h components/ModifierNodes.tsx | cut -f1)"
echo "   🎯 更新: 節點 UI/UX 優化"
echo ""

echo "2️⃣  components/NodeSystemPanel.tsx"
echo "   📄 路徑: ./components/NodeSystemPanel.tsx"
echo "   📊 大小: $(du -h components/NodeSystemPanel.tsx | cut -f1)"
echo "   🎯 更新: 拖放指示器增強"
echo ""

echo "3️⃣  services/geminiService.ts"
echo "   📄 路徑: ./services/geminiService.ts"
echo "   📊 大小: $(du -h services/geminiService.ts | cut -f1)"
echo "   🎯 修復: API tools 參數配置"
echo ""

echo "4️⃣  index.css (新增)"
echo "   📄 路徑: ./index.css"
echo "   📊 大小: $(du -h index.css | cut -f1)"
echo "   🎯 新增: 全局樣式文件"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 更新步驟："
echo ""
echo "1. 訪問 https://aistudio.google.com/"
echo "2. 找到你的 Mod-Weave Core app"
echo "3. 點擊 Edit 進入編輯模式"
echo "4. 上傳/替換上述 4 個文件"
echo "5. 點擊 Deploy/Update"
echo ""
echo "⏱️  預計更新時間: 2-3 分鐘"
echo "✅ 風險等級: 低（無破壞性變更）"
echo ""

# 創建一個臨時目錄存放需要更新的文件
echo "📁 創建更新包..."
mkdir -p update-package/components
mkdir -p update-package/services
cp components/ModifierNodes.tsx update-package/components/
cp components/NodeSystemPanel.tsx update-package/components/
cp services/geminiService.ts update-package/services/
cp index.css update-package/

echo "✅ 更新包已創建在 ./update-package/"
echo ""
echo "💡 提示: 你也可以直接壓縮這個文件夾："
echo "   zip -r update-package.zip update-package/"
echo ""
