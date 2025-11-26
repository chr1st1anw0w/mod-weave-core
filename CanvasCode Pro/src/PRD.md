# CanvasCode Pro - Product Requirements Document (PRD)

**Version:** 3.0
**Status:** Active Development
**Core Tech Stack:** React 18, TypeScript, Tailwind CSS, Google Gemini API (gemini-2.5-flash, gemini-3-pro-preview)

---

## 1. Product Overview
**CanvasCode Pro** is a next-generation infinite canvas design tool that bridges the gap between visual inspiration and production code. It combines the freedom of a whiteboard (Miro/LoveArt) with the structured intelligence of an AI developer.

### Core Value Proposition
1.  **Infinite Creative Space:** A boundless canvas to organize screenshots, wireframes, and ideas.
2.  **Vision-to-Code:** Instantly convert any selected area or uploaded image into high-quality HTML/Tailwind CSS using Gemini 2.5.
3.  **AI-Assisted Refinement:** A context-aware chat sidebar to refine designs, ask questions, and generate design systems through natural language.

---

## 2. Architecture & Components

### 2.1 Core Canvas (`CanvasBoard.tsx`)
The central interactive area handling rendering, input events, and state.
*   **State:**
    *   `objects`: Array of `CanvasObject` (Image, Text, Rectangle, Layout, Group).
    *   `viewport`: Manages Pan (x,y) and Zoom (scale).
    *   `history`: Undo/Redo stack (Snapshot based).
    *   `selection`: `selectedIds` Set for multi-select.
*   **Interactions:**
    *   **Pan:** Wheel, or Space + Drag.
    *   **Zoom:** Ctrl/Cmd + Wheel.
    *   **Selection:** Click (Single), Shift+Click (Multi), Rubber-band (Drag on bg).
    *   **Transformation:** 8-point resize handles with Shift-lock aspect ratio.
    *   **Snapping:** Smart guides appear when dragging objects near others (<5px threshold).
*   **AI Integration:**
    *   **Composite Generation:** `generateCompositeImage` renders selected groups/shapes to a clean canvas, handles CORS, and exports Base64 for Gemini.
    *   **Smart Hover Toolbar:** Appears on object hover. Provides quick actions: Rename, Analyze Code, Wireframe, Design System, Style Analysis.

### 2.2 Chat Sidebar (`ChatSidebar.tsx`)
The command center for AI interaction.
*   **Style:** Light Mode (LoveArt), White background, clean typography.
*   **Features:**
    *   **Tool Grid:** 11 Quick Actions (Chat, Research, Slides, etc.).
    *   **TopTips:** Dynamic hints based on selected tool.
    *   **Multimodal:** Supports `@Mention` (e.g., `@Image_1`) to attach canvas objects to the chat context.
    *   **Messages:** User (Black bubble) vs AI (Gray bubble).

### 2.3 Template Selector (`TemplateSelector.tsx`)
The onboarding experience.
*   **Trigger:** App Launch.
*   **Style:** Grayscale, Minimalist Grid.
*   **Templates:**
    *   **Image to Code:** (Default) Pre-loaded UI image + instruction.
    *   **Blank Canvas:** Empty state.
    *   **Component Lab:** 3-column layout (Design/Code/Preview).
    *   **Mobile Flow:** Vertical mobile frames.
    *   **Dashboard:** Admin panel structure.
    *   **Code → Design:** Split view.

### 2.4 Web Browser / Smart Capture (`WebBrowser.tsx`)
A floating tool for gathering inspiration.
*   **Figma Mode:** Detects `figma.com` URLs, shows "Connect Account" UI simulation.
*   **Web Capture:** Standard iframe view with "Capture View" (Screenshot import) and "Extract Code" (Simulated scraping) buttons.

### 2.5 Results Panel (`ResultsPanel.tsx`)
The output display.
*   **Tabs:** Analysis (Markdown), Code (Source/Preview), Figma Guide.
*   **Actions:** Copy Code, Toggle Preview.

---

## 3. User Flows

### 3.1 The "Image to Code" Loop
1.  **Import:** Drag & drop image onto canvas OR use Web Browser capture.
2.  **Select:** Click image (or group of elements).
3.  **Analyze:**
    *   *Method A:* Right-click -> "Ask AI" -> "Analyze UI to Code".
    *   *Method B:* Hover -> Click "Wand" icon on Smart Toolbar.
4.  **Generate:** Loading state -> Gemini processes -> Results Panel opens with Code.
5.  **Refine:** Open Chat Sidebar -> "@Image_1 change button color to red" -> AI responds.

### 3.2 Wireframing
1.  Select High-Fidelity Image.
2.  Hover -> Click "Wireframe" (Blue Layout Icon).
3.  Gemini generates Low-Fidelity, Grayscale HTML structure focused on layout.

### 3.3 Design System Extraction
1.  Select Image.
2.  Hover -> Click "Design System" (Green Palette Icon).
3.  Gemini generates `tailwind.config.js` tokens (Colors, Fonts) and a Style Guide.

---

## 4. Implemented Features Checklist

| Module | Feature | Status |
| :--- | :--- | :--- |
| **Canvas** | Infinite Pan/Zoom (Wheel/Ctrl+Wheel) | ✅ Done |
| | Object Dragging & Snapping | ✅ Done |
| | 8-Point Resize | ✅ Done |
| | Multi-select / Rubber-band | ✅ Done |
| | Group / Ungroup | ✅ Done |
| | Layer Management (Z-index) | ✅ Done |
| | Double-click Replace Image | ✅ Done |
| | Smart Hover Toolbar (Rename/Actions) | ✅ Done |
| **AI** | Image to Code | ✅ Done |
| | Image to Wireframe | ✅ Done |
| | Design System Extraction | ✅ Done |
| | Style Analysis | ✅ Done |
| | Composite Generation (CORS handling) | ✅ Done |
| **UI** | Template Selector (6 Presets) | ✅ Done |
| | Chat Sidebar (Light Mode + Tools) | ✅ Done |
| | Results Panel (Code/Preview) | ✅ Done |
| | Context Menu (Right Click) | ✅ Done |
| **Tools** | Web Browser (Figma/Capture) | ✅ Done |
| | Drag & Drop Upload | ✅ Done |
| | Settings Modal | ✅ Done |

---

## 5. Missing & Suggested Features (Roadmap)

### 5.1 Live Property Panel (High Priority)
*   **Need:** Precise control over object dimensions and coordinates.
*   **Plan:** Add a sidebar panel showing `x, y, w, h, rotation, opacity` inputs for the selected object.

### 5.2 AI Code Refinement Loop (High Priority)
*   **Need:** The Chat Sidebar currently answers questions but doesn't *update* the generated code in the Results Panel.
*   **Plan:** Implement a `refineCode` function that sends the current code + user prompt to Gemini and replaces the Results Panel content with the diff/update.

### 5.3 Reverse Engineering (Code-to-Design)
*   **Need:** Pasting HTML code should render editable rectangles/text on the canvas, not just an iframe.
*   **Plan:** A parser that converts DOM elements -> CanvasObjects.

### 5.4 Real Figma Integration
*   **Need:** "Connect Figma" is currently a UI simulation.
*   **Plan:** Implement OAuth with Figma API to fetch actual file thumbnails and structures.
