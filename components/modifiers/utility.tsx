import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── AI & UTILITY MODIFIERS ──────────────────────────────

export const RemoveBGNode = createNode("Remove BG", Icons.Eraser, "text-red-400", [ 
  { label: "Tolerance", key: "tolerance", type: "slider", min: 0, max: 100, def: 20, dataType: 'number' } 
]);

export const SplitToLayersNode = createNode("Split Layers", Icons.Layers, "text-blue-400", [ 
  { label: "Edge Str", key: "edgeStrength", type: "slider", min: 0, max: 10, def: 5, dataType: 'number' } 
]);

// Generic/Fallback node
export const GenericExtendedNode = (props: any) => {
  const { NodeContainer, Control, Slider } = require('./base');
  
  return (
    <NodeContainer title={props.name || props.type} icon={Icons.Box} color="text-gray-500" {...props}>
      {Object.keys(props.params).slice(0, 3).map(k => (
          <Control key={k} label={k.slice(0,6)} modId={props.modId}><Slider value={props.params[k] || 0} min={0} max={100} onChange={(v: number) => props.onChange(k, v)} /></Control>
      ))}
    </NodeContainer>
  );
};
