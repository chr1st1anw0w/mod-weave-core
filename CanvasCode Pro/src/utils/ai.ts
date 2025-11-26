import { AIMode, AIResponse } from '../types';

// Mock API Key - Replace with real key
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Mock Gemini API call
export const callGeminiAPI = async (
  mode: AIMode,
  imageData?: string,
  prompt?: string
): Promise<AIResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock responses based on mode
  switch (mode) {
    case 'analyze':
      return {
        mode: 'analyze',
        analysis: generateMockAnalysis(),
        code: generateMockCode(),
      };
    
    case 'wireframe':
      return {
        mode: 'wireframe',
        analysis: '# Wireframe 分析\n\n已將您的設計轉換為低保真線框圖架構。',
        code: generateMockWireframeCode(),
      };
    
    case 'designSystem':
      return {
        mode: 'designSystem',
        designSystem: generateMockDesignSystem(),
        code: generateMockDesignSystemCode(),
      };
    
    case 'style':
      return {
        mode: 'style',
        analysis: '# 視覺風格分析\n\n- **色彩**: 使用藍紫色為主色調\n- **字體**: Sans-serif 現代字體\n- **間距**: 一致的 8px 網格系統',
        code: generateMockStyleCode(),
      };
    
    default:
      return {
        mode: 'analyze',
        analysis: '無法識別的 AI 模式',
      };
  }
};

// Real Gemini API implementation (commented out for now)
/*
export const callGeminiAPIReal = async (
  mode: AIMode,
  imageData?: string,
  prompt?: string
): Promise<AIResponse> => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
  
  const modePrompts = {
    analyze: 'Analyze this UI design and provide detailed breakdown of components, layout, colors, typography. Then generate clean HTML with Tailwind CSS code that recreates this design.',
    wireframe: 'Convert this UI design into a low-fidelity wireframe. Output grayscale HTML structure with basic shapes and placeholders.',
    designSystem: 'Extract the design system from this UI: colors, typography, spacing, components. Output as Tailwind config and style guide.',
    style: 'Analyze the visual style, aesthetics, and design patterns used in this UI.',
  };

  const requestBody = {
    contents: [{
      parts: [
        { text: modePrompts[mode] + (prompt ? `\n\nAdditional context: ${prompt}` : '') },
        ...(imageData ? [{
          inline_data: {
            mime_type: 'image/png',
            data: imageData.split(',')[1], // Remove data:image/png;base64, prefix
          }
        }] : [])
      ]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse response
  const codeMatch = text.match(/```(?:html)?\n([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1] : '';

  return {
    mode,
    analysis: text,
    code,
    ...(mode === 'designSystem' && { designSystem: text }),
  };
};
*/

// Mock response generators
function generateMockAnalysis(): string {
  return `# UI 分析報告

## 組件結構

這個介面包含以下主要組件：

### 1. 導航欄 (Navigation Bar)
- 位置：頂部固定
- 背景：白色，帶陰影
- 包含 Logo 和主要導航連結

### 2. 主要內容區 (Hero Section)
- 大標題配合副標題
- CTA 按鈕組
- 背景圖片或漸層

### 3. 卡片網格 (Card Grid)
- 3 欄佈局 (響應式)
- 圖片 + 標題 + 描述
- Hover 效果

## 設計細節

**色彩系統**
- 主色：#3B82F6 (藍色)
- 次要色：#8B5CF6 (紫色)
- 中性色：#64748B (灰色)

**字體**
- 標題：Inter, 600 weight
- 內文：Inter, 400 weight

**間距**
- 使用 8px 網格系統
- 組件間距：24px, 32px, 48px

## 響應式設計

- 桌面：1280px+
- 平板：768px - 1279px
- 手機：< 768px
`;
}

function generateMockCode(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Design</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <span class="text-xl text-blue-600">Logo</span>
        </div>
        <div class="flex items-center space-x-8">
          <a href="#" class="text-gray-700 hover:text-blue-600">首頁</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">產品</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">關於</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">聯絡</a>
        </div>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 class="text-5xl text-gray-900 mb-6">打造更好的產品體驗</h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        使用現代化工具和設計系統，快速建立美觀且易用的介面
      </p>
      <div class="flex justify-center gap-4">
        <button class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          開始使用
        </button>
        <button class="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50">
          了解更多
        </button>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
          <div class="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl text-gray-900 mb-2">快速開發</h3>
          <p class="text-gray-600">使用預建組件和模板，加速您的開發流程</p>
        </div>

        <div class="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
          <div class="w-12 h-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
            </svg>
          </div>
          <h3 class="text-xl text-gray-900 mb-2">設計系統</h3>
          <p class="text-gray-600">一致的設計語言，確保品牌統一性</p>
        </div>

        <div class="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
          <div class="w-12 h-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <h3 class="text-xl text-gray-900 mb-2">可靠穩定</h3>
          <p class="text-gray-600">經過測試的組件，確保產品品質</p>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generateMockWireframeCode(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wireframe</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <!-- Header -->
  <header class="bg-gray-300 border-2 border-gray-400 h-16 flex items-center px-8">
    <div class="w-24 h-8 bg-gray-400"></div>
    <div class="ml-auto flex gap-4">
      <div class="w-16 h-8 bg-gray-400"></div>
      <div class="w-16 h-8 bg-gray-400"></div>
      <div class="w-16 h-8 bg-gray-400"></div>
    </div>
  </header>

  <!-- Hero -->
  <section class="py-16 px-8">
    <div class="max-w-4xl mx-auto text-center">
      <div class="h-12 bg-gray-400 mb-4"></div>
      <div class="h-6 bg-gray-300 max-w-2xl mx-auto mb-8"></div>
      <div class="flex justify-center gap-4">
        <div class="w-32 h-12 bg-gray-400"></div>
        <div class="w-32 h-12 bg-gray-300 border-2 border-gray-400"></div>
      </div>
    </div>
  </section>

  <!-- Grid -->
  <section class="py-16 px-8 bg-white">
    <div class="max-w-6xl mx-auto grid grid-cols-3 gap-8">
      <div class="border-2 border-gray-400 p-6">
        <div class="w-12 h-12 bg-gray-300 mb-4"></div>
        <div class="h-6 bg-gray-400 mb-2"></div>
        <div class="h-4 bg-gray-300"></div>
        <div class="h-4 bg-gray-300 mt-2"></div>
      </div>
      <div class="border-2 border-gray-400 p-6">
        <div class="w-12 h-12 bg-gray-300 mb-4"></div>
        <div class="h-6 bg-gray-400 mb-2"></div>
        <div class="h-4 bg-gray-300"></div>
        <div class="h-4 bg-gray-300 mt-2"></div>
      </div>
      <div class="border-2 border-gray-400 p-6">
        <div class="w-12 h-12 bg-gray-300 mb-4"></div>
        <div class="h-6 bg-gray-400 mb-2"></div>
        <div class="h-4 bg-gray-300"></div>
        <div class="h-4 bg-gray-300 mt-2"></div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function generateMockDesignSystem(): string {
  return `# Design System

## Colors

### Primary
- Blue 600: #3B82F6
- Blue 700: #2563EB

### Secondary
- Purple 600: #8B5CF6
- Purple 700: #7C3AED

### Neutral
- Gray 900: #111827
- Gray 600: #4B5563
- Gray 300: #D1D5DB

## Typography

### Font Family
- Primary: Inter, system-ui, sans-serif

### Font Sizes
- Display: 48px / 3rem
- Heading 1: 36px / 2.25rem
- Heading 2: 24px / 1.5rem
- Body: 16px / 1rem
- Small: 14px / 0.875rem

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing

8px Grid System
- xs: 8px
- sm: 16px
- md: 24px
- lg: 32px
- xl: 48px
- 2xl: 64px

## Components

### Button
- Primary: bg-blue-600, text-white, px-8, py-3, rounded-lg
- Secondary: bg-white, text-blue-600, border-2 border-blue-600

### Card
- Border: border border-gray-200
- Padding: p-6
- Border Radius: rounded-lg
- Hover: hover:shadow-lg
`;
}

function generateMockDesignSystemCode(): string {
  return `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: '3rem',
        h1: '2.25rem',
        h2: '1.5rem',
      },
      spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px',
      },
    },
  },
}`;
}

function generateMockStyleCode(): string {
  return `/* Visual Style CSS */
:root {
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-accent: #10B981;
  
  --font-sans: Inter, system-ui, sans-serif;
  
  --space-unit: 8px;
  --border-radius: 8px;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Modern gradient backgrounds */
.gradient-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
}

.gradient-accent {
  background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}`;
}
