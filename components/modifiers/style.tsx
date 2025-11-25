import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── STYLE MODIFIERS ──────────────────────────────

export const DropShadowNode = createNode("Drop Shadow", Icons.CloudFog, "text-gray-500", [ 
  { label: "Distance", key: "distance", type: "slider", min: 0, max: 50, def: 5, io: true, dataType: 'number' }, 
  { label: "Blur", key: "blur", type: "slider", min: 0, max: 50, def: 10, dataType: 'number' } 
]);

export const InnerShadowNode = createNode("Inner Shadow", Icons.CloudFog, "text-gray-400", [ 
  { label: "Distance", key: "distance", type: "slider", min: 0, max: 20, def: 3, dataType: 'number' } 
]);

export const BevelEmbossNode = createNode("Bevel", Icons.Box, "text-gray-200", [ 
  { label: "Depth", key: "depth", type: "slider", min: 0, max: 1000, unit: "%", def: 100, dataType: 'number' }, 
  { label: "Size", key: "size", type: "slider", min: 0, max: 50, def: 5, dataType: 'number' } 
]);

export const EmbossNode = createNode("Emboss", Icons.Component, "text-gray-300", [ 
  { label: "Height", key: "height", type: "slider", min: 0, max: 20, def: 5, io: true, dataType: 'number' }, 
  { label: "Angle", key: "angle", type: "slider", min: 0, max: 360, def: 45, dataType: 'number' } 
]);

export const PenStrokesNode = createNode("Pen Strokes", Icons.Pen, "text-zinc-300", [ 
  { label: "Size", key: "size", type: "slider", min: 1, max: 20, unit: "px", def: 2, dataType: 'number' } 
]);
