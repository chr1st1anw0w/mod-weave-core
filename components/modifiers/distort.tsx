import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── DISTORT MODIFIERS ──────────────────────────────

export const LiquifyNode = createNode("Liquify", Icons.Waves, "text-purple-400", [ 
  { label: "Brush", key: "brush", type: "slider", min: 10, max: 200, def: 50, dataType: 'number' } 
]);

export const DisplacementNode = createNode("Displace", Icons.Waves, "text-gray-300", [ 
  { label: "Scale", key: "scale", type: "slider", min: 0, max: 100, def: 10, dataType: 'number' } 
]);
