import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── EFFECT MODIFIERS ──────────────────────────────

export const GlitchNode = createNode("Glitch", Icons.Zap, "text-rose-500", [
  { label: "Intensity", key: "intensity", type: "slider", min: 0, max: 100, unit: "%", def: 50, io: true, dataType: 'number'},
  { label: "Scanlines", key: "scanlines", type: "slider", min: 0, max: 50, def: 10, step: 1, dataType: 'number' }
]);

export const RefractionNode = createNode("Refraction", Icons.Droplets, "text-blue-300", [
  { label: "Index", key: "index", type: "slider", min: 1, max: 3, def: 1.5, step: 0.1, dataType: 'number' },
  { label: "Intensity", key: "intensity", type: "slider", min: 0, max: 5, def: 1, io: true, dataType: 'number' }
]);

export const HalftoneNode = createNode("Halftone", Icons.Grid, "text-gray-400", [
  { label: "Dot Size", key: "dotSize", type: "slider", min: 1, max: 50, unit: "px", def: 4, io: true, dataType: 'number' },
  { label: "Angle", key: "angle", type: "slider", min: 0, max: 360, unit: "°", def: 45, dataType: 'number' }
]);

export const ExtrudeNode = createNode("3D Extrude", Icons.Box, "text-amber-500", [
  { label: "Depth", key: "depth", type: "slider", min: 0, max: 100, unit: "px", def: 20, io: true, dataType: 'number' },
  { label: "Bevel", key: "bevel", type: "slider", min: 0, max: 90, unit: "°", def: 30, dataType: 'number' }
]);

export const VignetteNode = createNode("Vignette", Icons.Circle, "text-gray-500", [ 
  { label: "Amt", key: "amount", type: "slider", min: 0, max: 100, def: 50, dataType: 'number' } 
]);

export const LensFlareNode = createNode("Lens Flare", Icons.Sun, "text-yellow-100", [ 
  { label: "Bright", key: "brightness", type: "slider", min: 0, max: 200, def: 100, dataType: 'number' } 
]);

export const BloomNode = createNode("Bloom", Icons.Sun, "text-amber-200", [ 
  { label: "Thresh", key: "threshold", type: "slider", min: 0, max: 1, def: 0.7, step: 0.05, dataType: 'number' }, 
  { label: "Int", key: "intensity", type: "slider", min: 0, max: 3, def: 1, step: 0.1, io: true, dataType: 'number' } 
]);

export const ChromaticAberrationNode = createNode("Chromatic", Icons.Glasses, "text-red-500", [ 
  { label: "Shift", key: "shift", type: "slider", min: -10, max: 10, def: 2, step: 0.5, dataType: 'number' }, 
  { label: "Int", key: "intensity", type: "slider", min: 0, max: 5, def: 1, io: true, dataType: 'number' } 
]);

export const SharpenNode = createNode("Sharpen", Icons.Triangle, "text-blue-100", [ 
  { label: "Amt", key: "amount", type: "slider", min: 0, max: 100, def: 50, dataType: 'number' } 
]);

export const DitherNode = createNode("Dither", Icons.Grid, "text-gray-400", [ 
  { label: "Type", key: "type", type: "select", opts: ['Bayer', 'Floyd'], def: 'Bayer', dataType: 'string' } 
]);

export const PixelateNode = createNode("Pixelate", Icons.Grid, "text-indigo-300", [ 
  { label: "Size", key: "size", type: "slider", min: 1, max: 100, def: 10, dataType: 'number' } 
]);

export const KaleidoscopeNode = createNode("Kaleidoscope", Icons.Hexagon, "text-teal-300", [ 
  { label: "Segs", key: "segments", type: "slider", min: 3, max: 20, def: 6, step: 1, dataType: 'number' } 
]);
