# Product Requirements Document: Mod-Weave Core

> **最後更新**：2025-11-25  
> **版本**：v1.1  
> **狀態**：Active Development - Phase 1 (Core Features) 完成

---

## 1. Overview
Mod-Weave Core is a next-generation, AI-powered design and motion graphics tool. It merges a non-destructive, node-based modifier system (inspired by Modyfi) with a deeply integrated conversational AI (powered by Gemini). The primary goal is to bridge the gap between static design and complex motion by providing an intuitive, visual, and intelligent workflow. Users can generate assets, apply complex effects, and create animations through a combination of direct manipulation and natural language commands.
2. Core Product Pillars
Non-Destructive Workflow: The original layer asset is never altered. All operations—from color adjustments to AI-generated fills and physics simulations—are applied as nodes in a modifier stack. This allows for infinite iteration and flexibility.
AI-First Integration: Gemini is not an add-on; it's a core part of the workflow. It's used for asset generation, intelligent editing (e.g., "remove the background"), layer analysis, and providing conversational assistance.
Visual Programming: The Node System Panel is the heart of the tool. It allows users to create sophisticated, procedural effects by stacking modifiers and visually wiring parameters together, enabling one effect to dynamically drive another.
Motion by Default: The architecture is designed to make animating static layers as simple as applying a filter. Parameters are animatable, and physics-based modifiers (like Spring) are first-class citizens.
3. Functional Requirements Status
This section details the current state of the application's features, divided into what is completed and what remains to be developed.

## 3.1. ✅ Completed Features (Implemented)

### Core Application Shell
- **Canvas 渲染系統**：
  - ✅ 完整的圖層渲染（Image、Text、Shape）
  - ✅ 變換支援（位置、旋轉、縮放、透明度）
  - ✅ 動態修飾器效果預覽（CSS filters for blur, brightness, contrast, hue-rotate, saturation, invert, drop-shadow）
  - ✅ 圖層選擇機制與視覺反饋（ring-2 ring-mw-accent）
  - ✅ 浮動工具列（AI Edit、Opacity、Blend Mode）
  - ✅ 選擇控點（Selection Handles）

- **Layer Panel 圖層面板**：
  - ✅ 階層式圖層列表顯示
  - ✅ 圖層選擇功能
  - ✅ 修飾器指示器顯示

- **AI Chat Panel AI 對話面板**：
  - ✅ 完整 Gemini API 整合（使用 `@google/genai` v1.30.0）
  - ✅ 多模態互動支援
  - ✅ 文字轉圖片生成（gemini-3-pro-image-preview）
  - ✅ 圖片編輯（gemini-2.5-flash-image）
  - ✅ 圖片分析（gemini-3-pro-preview）
  - ✅ AI Function Calling 實現（updateModifierParams、addModifier、createConnection）
  - ✅ 模型選擇控制（Thinking Mode、Fast Mode）
  - ✅ 圖片上傳功能（支援 base64）
  - ✅ 對話訊息歷史記錄
  - ✅ 即時思考狀態指示器

### Node System Panel 節點系統面板
- **Modifier Library 修飾器庫**：
  - ✅ 完整的 43 種非破壞性修飾器節點（已驗證所有 ModifierType 對應的 React 組件）
  - ✅ 分類系統（Shape、3D、Distort、Pattern、Physics、Color、Effect、Blur、Glass、Style、Light、Retro、AI、Util）
  - ✅ 拖放重新排序（Drag-and-Drop Reordering）
  - ✅ 修飾器圖標與顏色編碼
  
- **即時預覽與互動**：
  - ✅ 即時預覽面板（Real-Time Preview Pane）
  - ✅ 參數控制介面（滑桿、輸入框）
  - ✅ 修飾器啟用/停用切換
  - ✅ 收藏功能（isFavorite）
  - ✅ 最近使用追蹤（lastUsed）
  - ✅ 參數重置功能

- **Visual Parameter Wiring 視覺化參數連接**：
  - ✅ I/O 連接埠系統（支援 number、color、boolean、string、image、generic 數據類型）
  - ✅ 拖曳繪製連線
  - ✅ 連線視覺化顯示
  - ✅ 重複連線防護
  - ✅ AI 輔助建立連線（透過 createConnection function call）

- **Modifier Grouping 修飾器分組**：
  - ✅ 基本分組功能（MODIFIER_GROUP type）
  - ✅ 可折疊節點
  - ✅ 子修飾器支援（children array）

### 系統功能
- **Undo/Redo 系統**：
  - ✅ 完整的歷史記錄堆疊（最多 50 步）
  - ✅ Cmd/Ctrl+Z 撤銷
  - ✅ Cmd/Ctrl+Shift+Z 重做
  - ✅ UI 按鈕控制
  - ✅ 歷史狀態指示器

- **Command Palette 命令面板**：
  - ✅ Cmd/Ctrl+K 快速存取介面
  - ✅ CommandPalette 組件實現

- **技術架構**：
  - ✅ React 19.2.0 + TypeScript 5.8.2
  - ✅ Vite 6.2.0 建置系統
  - ✅ 完整的 TypeScript 型別定義（Layer, Modifier, Connection, AiAction 等）
  - ✅ 環境變數管理（.env.local for API_KEY）

## 3.2. 🚧 To Be Developed (Future Enhancements)

### Advanced Grouping 進階分組
- ⏳ 巢狀分組（群組內建立子群組）
- ⏳ 從子節點公開特定參數至父群組介面
- ⏳ 群組範本與預設設定

### Advanced Parameter Wiring 進階參數連接
- ⏳ 值域重映射介面（Value Remapping，例如將 0-1 的捲動輸入映射到 0-360 的旋轉輸出）
- ⏳ 貝茲曲線編輯器（Curve Editor for Connections）
- ⏳ 連線調變與表達式系統

### Animation Timeline 動畫時間軸
- ⏳ 專用時間軸面板
- ⏳ 關鍵影格建立與編輯
- ⏳ 緩動曲線視覺化編輯器
- ⏳ 動畫持續時間控制
- ⏳ 播放控制（播放、暫停、循環）

### Export Engine 匯出引擎
- ⏳ MP4 影片匯出
- ⏳ 動畫 GIF 匯出
- ⏳ Lottie JSON 匯出
- ⏳ 靜態圖片匯出（PNG、JPG、SVG）
- ⏳ 匯出品質與尺寸設定

### Real-Time Collaboration 即時協作
- ⏳ 多人編輯支援
- ⏳ 使用者游標與選擇狀態同步
- ⏳ WebSocket 或 WebRTC 整合
- ⏳ 衝突解決機制

### Version History 版本歷史
- ⏳ 專案快照系統
- ⏳ 版本比較與差異檢視
- ⏳ 還原到特定版本
- ⏳ 版本標記與註解

### Additional Enhancements 其他增強功能
- ⏳ 圖層變換控制（拖曳、縮放、旋轉手把）
- ⏳ 多圖層選擇與批次操作
- ⏳ 圖層鎖定與可見性控制
- ⏳ 資產管理系統
- ⏳ 自訂主題與 UI 配置
- ⏳ 鍵盤快捷鍵完整對映
- ⏳ 效能優化（虛擬化、Web Workers）
4. Modifier Library & Parameters
The following is a complete list of all 43 available modifier nodes and their key user-configurable parameters.

Category	Modifier Name	Description	Key Parameters
Shape & 3D	Outline	Adds single or multiple concentric strokes.	Thickness, Spacing, Repeats, Color
Extrude	Creates a 3D extrusion effect from a 2D layer.	Depth, Bevel, Material, Light Direction
Emboss	Simulates a raised or stamped effect.	Height, Angle, Softness, Intensity
Bevel & Emboss	Adds a combination of highlights and shadows to create depth.	Style, Depth, Size, Soften, Angle
Distortion	Stretch	Stretches or compresses a layer along its axes.	H. Stretch, V. Stretch, Intensity
Wave	Applies a sinusoidal wave distortion.	Frequency, Amplitude, Phase, Direction
Perturb	Displaces pixels using procedural noise.	Amplitude, Frequency, Octaves, Speed
Liquify	Allows for freeform distortion using a brush-based tool.	Brush Size, Pressure, Mode
Displacement Map	Distorts a layer based on the luminance of a map.	Map Source, H. Scale, V. Scale
Pattern & Physics	Repeater	Creates grid-based or radial arrays of a layer.	Copies, Rotation, Scale, Offset
Particle Dissolve	Transforms a layer into a system of animated particles.	Count, Lifetime, Velocity, Gravity
Spring Physics	Applies spring dynamics to a layer's transformations.	Stiffness, Damping, Mass, Overshoot
Kaleidoscope	Creates a mirrored, multi-segmented pattern.	Segments, Offset Angle, Mirror
Color & Tone	Brightness/Contrast	Adjusts the brightness and contrast.	Brightness, Contrast, Exposure
Gradient Map	Remaps layer luminance to a color gradient.	Gradient Stops, Blend Mode
Color Overlay	Tints a layer with a solid color.	Color, Opacity, Blend Mode
Threshold	Converts the image to a high-contrast, black-and-white result.	Level, Dithering
Invert	Inverts the colors of the layer.	Channels (RGB/Alpha)
Posterize	Reduces the number of colors in the layer.	Levels
Hue/Saturation	Adjusts the hue, saturation, and lightness.	Hue, Saturation, Lightness
Curves	Provides advanced tonal control via a curve graph.	Channel (RGB/R/G/B), Curve Points
Effects & Style	Glitch	Simulates digital glitches and RGB channel separation.	Intensity, Scanlines, RGB Split
Halftone Luma	Creates a printed, halftone dot effect.	Dot Size, Angle, Frequency, Shape
Noise	Adds procedural noise to the layer.	Amount, Distribution, Monochromatic
Drop Shadow	Adds an exterior shadow.	Distance, Angle, Blur, Spread, Color
Inner Shadow	Adds an interior shadow.	Distance, Choke, Blur, Color
Vignette	Darkens or lightens the edges of the layer.	Amount, Midpoint, Feather
Sharpen	Increases the contrast along edges to enhance sharpness.	Amount, Radius, Threshold
Dither	Applies a dithering pattern to simulate more colors.	Pattern Type, Intensity
Pixelate	Reduces the layer's resolution to create a blocky effect.	Cell Size, Shape
Blur & Glass	Gaussian Blur	Applies a standard, high-quality blur.	Radius
Motion Blur	Simulates the blur from object movement.	Angle, Distance
Radial Blur	Applies a blur that radiates from a center point.	Amount, Center Point, Quality
Tilt Shift	Simulates a shallow depth of field effect.	Blur Amount, Focus Center, Falloff
Refraction	Simulates light bending through a glass-like surface.	Refraction Index, Intensity, Distortion Map
Bloom	Creates a soft glow from the bright areas of a layer.	Threshold, Intensity, Radius
Lens Flare	Simulates the flare caused by a bright light source.	Brightness, Position, Scale
Chromatic Aberration	Simulates lens distortion by splitting color channels.	Red/Cyan Shift, Intensity
AI & Utility	AI Fill	Uses Gemini to fill a selected area based on a prompt.	Prompt, Seed, Strength
Remove Background	Intelligently removes the background from an image.	Tolerance, Feather, Edge Contraction
Split to Layers	Splits a single image into multiple layers based on color or edges.	Edge Strength, Color Threshold
Pen Strokes	Applies a brush stroke style to a vector path.	Brush Size, Pressure Curve, Spacing