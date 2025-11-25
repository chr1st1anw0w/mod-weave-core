import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── BLUR MODIFIERS ──────────────────────────────

export const NoiseNode = createNode("Noise", Icons.Tv, "text-gray-400", [ 
  { label: "Amount", key: "amount", type: "slider", min: 0, max: 100, unit: "%", def: 10, io: true, dataType: 'number' } 
]);

export const BlurNode = createNode("Gaussian Blur", Icons.CloudFog, "text-blue-200", [ 
  { label: "Radius", key: "radius", type: "slider", min: 0, max: 100, def: 5, io: true, dataType: 'number' } 
]);

export const MotionBlurNode = createNode("Motion Blur", Icons.Wind, "text-blue-300", [ 
  { label: "Angle", key: "angle", type: "slider", min: 0, max: 360, def: 0, dataType: 'number' }, 
  { label: "Dist", key: "distance", type: "slider", min: 0, max: 200, def: 10, io: true, dataType: 'number' } 
]);

export const RadialBlurNode = createNode("Radial Blur", Icons.Circle, "text-blue-400", [ 
  { label: "Amount", key: "amount", type: "slider", min: 0, max: 100, def: 10, dataType: 'number' } 
]);

export const TiltShiftNode = createNode("Tilt Shift", Icons.Aperture, "text-blue-300", [ 
  { label: "Blur", key: "blur", type: "slider", min: 0, max: 50, def: 10, dataType: 'number' } 
]);
