import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── COLOR MODIFIERS ──────────────────────────────

export const BrightnessContrastNode = createNode("Bright/Contr", Icons.Sun, "text-yellow-200", [
  { label: "Brightness", key: "brightness", type: "slider", min: -100, max: 100, def: 0, io: true, dataType: 'number' },
  { label: "Contrast", key: "contrast", type: "slider", min: -100, max: 100, def: 0, dataType: 'number' }
]);

export const HueSaturationNode = createNode("Hue/Sat", Icons.Rainbow, "text-yellow-400", [ 
  { label: "Hue", key: "hue", type: "slider", min: 0, max: 360, def: 0, io: true, dataType: 'number' }, 
  { label: "Sat", key: "sat", type: "slider", min: -100, max: 100, def: 0, dataType: 'number' } 
]);

export const InvertNode = createNode("Invert", Icons.Contrast, "text-white", [ 
  { label: "Chan", key: "channel", type: "select", opts: ['RGB','Alpha'], def: 'RGB', dataType: 'string' } 
]);

export const PosterizeNode = createNode("Posterize", Icons.ImgMinus, "text-yellow-600", [ 
  { label: "Levels", key: "levels", type: "slider", min: 2, max: 20, def: 4, step: 1, dataType: 'number' } 
]);

export const ThresholdNode = createNode("Threshold", Icons.Contrast, "text-gray-100", [ 
  { label: "Level", key: "level", type: "slider", min: 0, max: 255, def: 128, dataType: 'number' } 
]);

export const CurvesNode = createNode("Curves", Icons.Activity, "text-gray-300", [ 
  { label: "Chan", key: "channel", type: "select", opts: ['RGB', 'Red'], def: 'RGB', dataType: 'string' } 
]);

export const GradientMapNode = createNode("Gradient Map", Icons.Palette, "text-pink-400", [
  { label: "Blend", key: "blend", type: "select", opts: ['Normal', 'Overlay', 'Multiply'], def: 'Normal', io: true, dataType: 'string' }
]);

export const ColorOverlayNode = createNode("Color Overlay", Icons.Palette, "text-pink-300", [ 
  { label: "Opacity", key: "opacity", type: "slider", min: 0, max: 100, unit: "%", def: 50, dataType: 'number' } 
]);
