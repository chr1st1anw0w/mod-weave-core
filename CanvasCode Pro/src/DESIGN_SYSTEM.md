# CanvasCode Pro - Design System

**Version:** 1.0
**Style Inspiration:** LoveArt / Miro / Apple Human Interface
**Philosophy:** Minimalist, Content-First, Soft UI

---

## 1. Color Palette

### Brand Colors
*   **Brand Primary:** `#2563EB` (Blue-600) - Used for primary actions, active states, and focus rings.
*   **Brand Accent:** `#000000` (Black) - Used for high-contrast UI elements (Floating Dock, User Chat Bubbles).

### Neutral / Surface
*   **Canvas Background:** `#F9FAFB` (Gray-50)
*   **Canvas Grid/Dots:** `#E5E7EB` (Gray-200)
*   **Panel Background:** `#FFFFFF` (White)
*   **Backdrop Blur:** `bg-white/90 backdrop-blur` or `bg-black/20 backdrop-blur-sm`

### Text Colors
*   **Primary Text:** `#111827` (Gray-900)
*   **Secondary Text:** `#4B5563` (Gray-600)
*   **Tertiary/Placeholder:** `#9CA3AF` (Gray-400)
*   **Inverse Text:** `#FFFFFF` (White)

### Semantic Colors
*   **Error:** `#EF4444` (Red-500)
*   **Success:** `#22C55E` (Green-500)
*   **Warning:** `#EAB308` (Yellow-500)

---

## 2. Typography

**Font Family:** `Inter`, system-ui, sans-serif.

### Hierarchy
*   **H1 (Headings):** 20px-24px, Bold (700), Tracking-tight.
*   **H2 (Subheadings):** 16px-18px, Semibold (600).
*   **Body:** 14px-15px, Regular (400), Leading-relaxed.
*   **Small / Caption:** 12px, Medium (500), Gray-500.
*   **UI Label:** 11px-12px, Bold (700), Uppercase, Tracking-wider.

---

## 3. Shadows & Elevation

*   **Level 1 (Cards/Buttons):** `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
*   **Level 2 (Dropdowns/Popovers):** `shadow-lg` (`0 10px 15px -3px rgb(0 0 0 / 0.1)`)
*   **Level 3 (Floating Dock/Modals):** Custom Soft Shadow
    *   CSS: `box-shadow: 0 8px 30px rgb(0,0,0,0.12);`
    *   Tailwind: `shadow-[0_8px_30px_rgb(0,0,0,0.12)]`
*   **Level 4 (Chat Sidebar):** Left-side shadow
    *   CSS: `box-shadow: -4px 0 20px rgba(0,0,0,0.05);`

---

## 4. Border Radius

*   **Small:** `rounded-md` (6px) - Inner elements, tags.
*   **Medium:** `rounded-lg` (8px) - Context menus, small cards.
*   **Large:** `rounded-xl` (12px) - Dialogs, main containers.
*   **Extra Large:** `rounded-2xl` (16px) - Chat bubbles, floating panels.
*   **Pill/Circle:** `rounded-full` (9999px) - Buttons, avatars.

---

## 5. UI Components

### Buttons
*   **Primary (Icon Only):** `bg-black text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105`
*   **Secondary (Toolbar):** `text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-3 rounded-xl transition-all`
*   **Active State:** `text-black bg-gray-100`

### Inputs
*   **Standard:** `bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all`
*   **Chat Input:** `bg-gray-50 border-transparent focus:bg-white focus:shadow-sm`

### Context Menu
*   **Style:** `bg-white/95 backdrop-blur border border-gray-100 shadow-xl rounded-xl`
*   **Item:** `text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2`

### Smart Hover Toolbar
*   **Style:** `bg-black text-white rounded-lg px-2 py-1.5 shadow-xl`
*   **Animation:** `animate-fade-in`
*   **Icons:** Small (12px), specific colors for actions (Code=Purple, Wireframe=Blue, DS=Green, Style=Pink).

---

## 6. Animation

*   **Fade In:** `animate-fade-in` (0.2s ease-out)
*   **Slide In:** `animate-slide-in` (0.3s ease-out from right)
*   **Micro-interactions:** `active:scale-95` on buttons.
*   **Transitions:** `transition-all duration-200` on hover states.
