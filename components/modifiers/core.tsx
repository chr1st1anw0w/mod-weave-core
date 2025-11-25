import React from 'react';
import { Icons } from '../Icons';
import { createNode, NodeContainer, Control, Slider } from './base';

// ────────────────────────────── CORE 15 MODIFIERS ──────────────────────────────

export const ModifierGroupNode = (props: any) => (
  <NodeContainer title="Modifier Group" icon={Icons.Folder} color="text-yellow-500" {...props}>
    <Control label="Name" modId={props.modId} dataType="string"><input type="text" value={props.params.groupName || "New Group"} onChange={(e) => props.onChange('groupName', e.target.value)} className="bg-transparent text-right text-[10px] text-gray-300 outline-none border-b border-transparent focus:border-mw-accent" /></Control>
    <div className="px-2 py-1 text-[9px] text-gray-500 bg-black/20 rounded text-center">{props.params.childCount || 0} modifiers</div>
  </NodeContainer>
);

export const OutlineNode = createNode("Outline", Icons.Circle, "text-cyan-400", [
  { label: "Thickness", key: "thickness", type: "slider", min: 0, max: 100, unit: "px", def: 2, io: true, dataType: 'number' },
  { label: "Spacing", key: "spacing", type: "slider", min: 0, max: 50, unit: "px", def: 0, io: true, dataType: 'number' },
  { label: "Repeats", key: "repeatCount", type: "slider", min: 1, max: 20, def: 1, step: 1, dataType: 'number' },
  { label: "Color", key: "color", type: "color", def: "#00ffff", dataType: 'color' }
]);

export const StretchNode = createNode("Stretch", Icons.Move, "text-orange-400", [
  { label: "H. Stretch", key: "hStretch", type: "slider", min: -200, max: 200, unit: "%", def: 100, io: true, dataType: 'number' },
  { label: "V. Stretch", key: "vStretch", type: "slider", min: -200, max: 200, unit: "%", def: 100, io: true, dataType: 'number' },
  { label: "Intensity", key: "intensity", type: "slider", min: 0, max: 5, def: 1, io: true, dataType: 'number' }
]);

export const RepeaterNode = createNode("Repeater", Icons.Copy, "text-indigo-400", [
  { label: "Copies", key: "copies", type: "slider", min: 1, max: 50, def: 5, step: 1, io: true, dataType: 'number' },
  { label: "Rotation", key: "rotation", type: "slider", min: 0, max: 360, unit: "°", def: 0, dataType: 'number' },
  { label: "Scale", key: "scale", type: "slider", min: 10, max: 200, unit: "%", def: 100, io: true, dataType: 'number' }
]);

export const ParticleNode = createNode("Particle Dissolve", Icons.Wind, "text-emerald-300", [
  { label: "Count", key: "count", type: "slider", min: 100, max: 5000, def: 1000, step: 100, dataType: 'number' },
  { label: "Lifetime", key: "lifetime", type: "slider", min: 0.1, max: 5, unit: "s", def: 2, io: true, dataType: 'number' },
  { label: "Gravity", key: "gravity", type: "slider", min: 0, max: 2, def: 0.5, step: 0.1, dataType: 'number' }
]);

export const SpringNode = createNode("Spring Physics", Icons.Activity, "text-green-400", [
  { label: "Stiffness", key: "stiffness", type: "slider", min: 10, max: 500, def: 100, io: true, dataType: 'number' },
  { label: "Damping", key: "damping", type: "slider", min: 0, max: 1, def: 0.7, step: 0.05, io: true, dataType: 'number' }
]);

export const WaveNode = createNode("Wave Warp", Icons.Waves, "text-sky-400", [
  { label: "Freq", key: "freq", type: "slider", min: 0.1, max: 20, unit: "Hz", def: 2, dataType: 'number' },
  { label: "Amp", key: "amp", type: "slider", min: 0, max: 200, unit: "px", def: 20, io: true, dataType: 'number' }
]);

export const ParallaxNode = createNode("Parallax", Icons.Layers, "text-purple-300", [
  { label: "Layers", key: "layers", type: "slider", min: 1, max: 10, def: 3, step: 1, io: true, dataType: 'number' },
  { label: "Speed", key: "speed", type: "slider", min: 0.1, max: 3, unit: "x", def: 1, step: 0.1, dataType: 'number' }
]);

export const AIFillNode = (props: any) => (
  <NodeContainer title="Gen Fill" icon={Icons.Sparkles} color="text-violet-400" {...props}>
     <Control label="Prompt" modId={props.modId} dataType="string"><input type="text" value={props.params.prompt || "Cyberpunk"} onChange={(e) => props.onChange('prompt', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded text-[9px] px-1 py-0.5 text-gray-300" /></Control>
     <Control label="Strength" modId={props.modId} dataType="number"><Slider value={props.params.strength ?? 0.75} min={0} max={1} step={0.01} onChange={(v: number) => props.onChange('strength', v)} /></Control>
  </NodeContainer>
);

export const PerturbNode = createNode("Perturb", Icons.Activity, "text-teal-400", [
  { label: "Amplitude", key: "amplitude", type: "slider", min: 0, max: 100, def: 10, io: true, dataType: 'number' },
  { label: "Frequency", key: "frequency", type: "slider", min: 0.1, max: 5, def: 1, dataType: 'number' }
]);
