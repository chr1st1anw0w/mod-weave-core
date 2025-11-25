# Modifier Preview Status

This document outlines the real-time preview capabilities for all 45 modifiers in Mod-Weave Core.

## ✅ Full CSS Preview Support (28 modifiers)

These modifiers have accurate real-time preview using CSS filters:

### Blur Effects
- **Gaussian Blur** - `filter: blur(Npx)`
- **Motion Blur** - Approximated with `blur()`
- **Radial Blur** - Approximated with `blur()`
- **Tilt Shift** - `filter: blur(Npx)`

### Color Adjustments
- **Brightness/Contrast** - `filter: brightness() contrast()`
- **Hue/Saturation** - `filter: hue-rotate() saturate()`
- **Invert** - `filter: invert(1)`
- **Threshold** - Approximated with high `contrast()` + `brightness()`
- **Posterize** - Approximated with `contrast()`
- **Gradient Map** - Limited approximation with `hue-rotate()`

### Shadows & Lighting
- **Drop Shadow** - `filter: drop-shadow()`
- **Inner Shadow** - Approximated with `brightness()`
- **Vignette** - Approximated with `brightness()` reduction
- **Bloom** - `filter: brightness() saturate()`
- **Lens Flare** - `filter: brightness() saturate()`

### Effects
- **Glitch** - `filter: hue-rotate() saturate()`
- **Chromatic Aberration** - Approximated with `hue-rotate()`
- **Noise** - Approximated with `contrast() brightness()`
- **Sharpen** - Approximated with `contrast()`

### Stylize
- **Halftone** - Approximated with `grayscale() contrast()`
- **Pen Strokes** - Approximated with `contrast() saturate()`
- **Emboss** - Approximated with `grayscale() contrast()`
- **Bevel/Emboss** - Approximated with `brightness() contrast()`
- **Dither** - Approximated with `contrast()`
- **Pixelate** - Uses `image-rendering: pixelated`

### Distortion (Limited)
- **Refraction** - Approximated with `blur()`
- **Perturb** - Approximated with `blur()`
- **Kaleidoscope** - Approximated with `hue-rotate() saturate()`

### 3D Effects (Approximated)
- **Extrude** - Approximated with `drop-shadow()`

## ⚠️ Partial CSS Preview (2 modifiers)

These have limited CSS support:

- **Stretch** - Uses `transform: scaleX() scaleY()`
- **Color Overlay** - Uses `mix-blend-mode: overlay`

## ❌ No CSS Preview (15 modifiers)

These modifiers require WebGL, Canvas API, or backend processing:

### Geometric Patterns
- **Outline** - Requires stroke rendering
- **Repeater** - Requires element duplication
- **Parallax** - Requires layer splitting

### Distortion (Advanced)
- **Wave** - Requires vertex displacement
- **Liquify** - Requires interactive mesh deformation
- **Displacement Map** - Requires texture sampling

### Physics & Animation
- **Particle Dissolve** - Requires particle system
- **Spring** - Requires physics simulation

### AI-Powered
- **AI Fill** - Requires AI backend
- **AI Generation** - Requires AI backend
- **Remove Background** - Requires AI backend
- **Split to Layers** - Requires edge detection + segmentation

### 3D (Complex)
- **Bevel (advanced)** - Requires 3D rendering (note: basic approximation available)

## Preview Implementation

### Canvas Layer Preview
Location: `components/Canvas.tsx` - `getDynamicLayerStyle()`

The function generates CSS styles that are applied to layers in real-time as modifier parameters change. This provides instant visual feedback without requiring server-side rendering.

### NodeSystemPanel Preview
Location: `components/NodeSystemPanel.tsx` - `getPreviewFilter()`

Similar implementation for the preview thumbnail in the node system panel, with slightly reduced effect intensity for better visualization at small scales.

## Future Enhancements

For modifiers without CSS preview support, we can implement:
1. **WebGL Shaders** - For advanced distortion and 3D effects
2. **Canvas API** - For geometric patterns and particle systems
3. **Web Workers** - For heavy computational effects
4. **Progressive Preview** - Low-quality instant preview → high-quality rendered result

## Usage Notes

- Preview effects are **approximations** - final render may differ
- Complex modifiers (AI, Physics, 3D) show parameter UI but no visual preview
- Multiple modifiers stack their CSS filters in order
- Some combinations may produce unexpected results due to CSS filter limitations
