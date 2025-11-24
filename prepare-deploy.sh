#!/bin/bash
# Mod-Weave Core - 部署準備腳本

echo "🚀 準備部署到 Gemini AI Studio..."
echo ""

# 1. 檢查 TypeScript 錯誤
echo "📝 檢查 TypeScript 類型..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript 錯誤，請修復後再部署"
    exit 1
fi
echo "✅ TypeScript 檢查通過"
echo ""

# 2. 構建項目
echo "🔨 構建生產版本..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 構建失敗"
    exit 1
fi
echo "✅ 構建完成"
echo ""

# 3. 列出需要上傳的文件
echo "📦 需要上傳的文件列表："
echo ""
echo "根目錄文件："
ls -lh index.html index.tsx index.css App.tsx types.ts metadata.json vite.config.ts tsconfig.json package.json 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo "components/ 目錄："
ls -lh components/*.tsx 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
echo "services/ 目錄："
ls -lh services/*.ts 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}'
echo ""

# 4. 檢查關鍵文件
echo "🔍 檢查關鍵文件..."
MISSING_FILES=0
for file in index.html index.tsx App.tsx metadata.json; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必需文件: $file"
        MISSING_FILES=1
    fi
done

if [ $MISSING_FILES -eq 1 ]; then
    echo "❌ 有文件缺失，請檢查"
    exit 1
fi
echo "✅ 所有關鍵文件都存在"
echo ""

# 5. 顯示構建統計
echo "📊 構建統計："
if [ -d "dist" ]; then
    echo "  構建輸出："
    du -sh dist/
    echo ""
    echo "  文件列表："
    find dist -type f | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "    - $file ($size)"
    done
fi
echo ""

echo "✅ 部署準備完成！"
echo ""
echo "📋 下一步："
echo "1. 訪問 https://aistudio.google.com/"
echo "2. 點擊 'Apps' -> 'Create new app'"
echo "3. 上傳上述列出的所有文件"
echo "4. 點擊 'Deploy' 完成部署"
echo ""
echo "📖 查看完整指南: cat DEPLOY_INSTRUCTIONS.md"
