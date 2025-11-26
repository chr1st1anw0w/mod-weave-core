import React, { useState, useCallback } from 'react';
import { Modifier, ModifierType } from '../types';
import { Icons } from './Icons';

interface ModifierCardProps {
  modifier: Modifier;
  index: number;
  isSolo: boolean;
  isExpanded: boolean;
  onToggleActive: () => void;
  onToggleSolo: () => void;
  onToggleExpand: () => void;
  onRemove: () => void;
  onUpdateParam: (modId: string, key: string, value: any) => void;
  dragHandleProps: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
  };
  containerProps: {
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

// Modifier metadata catalog for icons and colors
const MODIFIER_META: Record<ModifierType, { icon: any; color: string; label: string; params?: Array<{ key: string; label: string; min: number; max: number; def: number; step?: number; unit?: string }> }> = {
  [ModifierType.OUTLINE]: { 
    icon: Icons.Circle, 
    color: 'text-cyan-400', 
    label: 'Outline',
    params: [
      { key: 'thickness', label: 'Thickness', min: 0, max: 100, def: 2, unit: 'px' },
      { key: 'spacing', label: 'Spacing', min: 0, max: 50, def: 0, unit: 'px' },
    ]
  },
  [ModifierType.STRETCH]: { 
    icon: Icons.MoveH, 
    color: 'text-cyan-300', 
    label: 'Stretch',
    params: [
      { key: 'scaleX', label: 'Scale X', min: 0.1, max: 3, def: 1, step: 0.1 },
      { key: 'scaleY', label: 'Scale Y', min: 0.1, max: 3, def: 1, step: 0.1 },
    ]
  },
  [ModifierType.REPEATER]: { 
    icon: Icons.Copy, 
    color: 'text-cyan-200', 
    label: 'Repeater',
    params: [
      { key: 'count', label: 'Count', min: 1, max: 20, def: 3 },
      { key: 'offset', label: 'Offset', min: 0, max: 100, def: 10, unit: 'px' },
    ]
  },
  [ModifierType.PARTICLE_DISSOLVE]: { icon: Icons.Sparkles, color: 'text-purple-400', label: 'Particle Dissolve' },
  [ModifierType.SPRING]: { icon: Icons.Activity, color: 'text-green-400', label: 'Spring' },
  [ModifierType.WAVE]: { 
    icon: Icons.Waves, 
    color: 'text-blue-400', 
    label: 'Wave',
    params: [
      { key: 'amplitude', label: 'Amplitude', min: 0, max: 100, def: 10 },
      { key: 'frequency', label: 'Frequency', min: 0, max: 10, def: 2, step: 0.1 },
    ]
  },
  [ModifierType.PARALLAX]: { icon: Icons.Layers, color: 'text-indigo-400', label: 'Parallax' },
  [ModifierType.AI_FILL]: { icon: Icons.Brain, color: 'text-pink-400', label: 'AI Fill' },
  [ModifierType.GLITCH]: { 
    icon: Icons.Zap, 
    color: 'text-red-400', 
    label: 'Glitch',
    params: [
      { key: 'intensity', label: 'Intensity', min: 0, max: 100, def: 50 },
    ]
  },
  [ModifierType.REFRACTION]: { icon: Icons.Glasses, color: 'text-teal-400', label: 'Refraction' },
  [ModifierType.HALFTONE_LUMA]: { icon: Icons.Grid, color: 'text-gray-400', label: 'Halftone Luma' },
  [ModifierType.EXTRUDE]: { icon: Icons.Box, color: 'text-orange-400', label: 'Extrude' },
  [ModifierType.BRIGHTNESS_CONTRAST]: { 
    icon: Icons.Sun, 
    color: 'text-yellow-200', 
    label: 'Bright/Contrast',
    params: [
      { key: 'brightness', label: 'Brightness', min: -100, max: 100, def: 0 },
      { key: 'contrast', label: 'Contrast', min: -100, max: 100, def: 0 },
    ]
  },
  [ModifierType.GRADIENT_MAP]: { icon: Icons.Palette, color: 'text-purple-300', label: 'Gradient Map' },
  [ModifierType.PERTURB]: { icon: Icons.Wind, color: 'text-cyan-500', label: 'Perturb' },
  [ModifierType.GAUSSIAN_BLUR]: { 
    icon: Icons.CloudFog, 
    color: 'text-blue-200', 
    label: 'Gaussian Blur',
    params: [
      { key: 'radius', label: 'Radius', min: 0, max: 100, def: 5 },
    ]
  },
  [ModifierType.MOTION_BLUR]: { icon: Icons.Wind, color: 'text-blue-300', label: 'Motion Blur' },
  [ModifierType.RADIAL_BLUR]: { icon: Icons.Focus, color: 'text-blue-400', label: 'Radial Blur' },
  [ModifierType.TILT_SHIFT]: { icon: Icons.Maximize, color: 'text-blue-500', label: 'Tilt Shift' },
  [ModifierType.HUE_SATURATION]: { 
    icon: Icons.Rainbow, 
    color: 'text-yellow-400', 
    label: 'Hue/Saturation',
    params: [
      { key: 'hue', label: 'Hue', min: 0, max: 360, def: 0, unit: '°' },
      { key: 'sat', label: 'Saturation', min: -100, max: 100, def: 0, unit: '%' },
    ]
  },
  [ModifierType.COLOR_OVERLAY]: { icon: Icons.Droplets, color: 'text-yellow-300', label: 'Color Overlay' },
  [ModifierType.INVERT]: { icon: Icons.RefreshCcw, color: 'text-purple-400', label: 'Invert' },
  [ModifierType.POSTERIZE]: { icon: Icons.Palette, color: 'text-pink-400', label: 'Posterize' },
  [ModifierType.THRESHOLD]: { icon: Icons.Binary, color: 'text-gray-300', label: 'Threshold' },
  [ModifierType.CURVES]: { icon: Icons.Activity, color: 'text-purple-200', label: 'Curves' },
  [ModifierType.CHROMATIC_ABERRATION]: { icon: Icons.Aperture, color: 'text-red-300', label: 'Chromatic Aberr' },
  [ModifierType.DROP_SHADOW]: { icon: Icons.CloudFog, color: 'text-gray-500', label: 'Drop Shadow' },
  [ModifierType.INNER_SHADOW]: { icon: Icons.SunDim, color: 'text-gray-600', label: 'Inner Shadow' },
  [ModifierType.BEVEL_EMBOSS]: { icon: Icons.Box, color: 'text-amber-400', label: 'Bevel/Emboss' },
  [ModifierType.EMBOSS]: { icon: Icons.Stamp, color: 'text-amber-300', label: 'Emboss' },
  [ModifierType.VIGNETTE]: { icon: Icons.Focus, color: 'text-slate-400', label: 'Vignette' },
  [ModifierType.LENS_FLARE]: { icon: Icons.Sun, color: 'text-yellow-500', label: 'Lens Flare' },
  [ModifierType.BLOOM]: { icon: Icons.Sparkles, color: 'text-pink-300', label: 'Bloom' },
  [ModifierType.LIQUIFY]: { icon: Icons.Droplets, color: 'text-cyan-400', label: 'Liquify' },
  [ModifierType.DISPLACEMENT_MAP]: { icon: Icons.Move, color: 'text-purple-500', label: 'Displacement' },
  [ModifierType.PIXELATE]: { icon: Icons.Grid, color: 'text-green-400', label: 'Pixelate' },
  [ModifierType.KALEIDOSCOPE]: { icon: Icons.Hexagon, color: 'text-rainbow-400', label: 'Kaleidoscope' },
  [ModifierType.NOISE]: { icon: Icons.Tv, color: 'text-gray-400', label: 'Noise' },
  [ModifierType.SHARPEN]: { icon: Icons.Focus, color: 'text-blue-500', label: 'Sharpen' },
  [ModifierType.DITHER]: { icon: Icons.Tv, color: 'text-gray-500', label: 'Dither' },
  [ModifierType.REMOVE_BACKGROUND]: { icon: Icons.Eraser, color: 'text-pink-500', label: 'Remove BG' },
  [ModifierType.SPLIT_TO_LAYERS]: { icon: Icons.Layers, color: 'text-indigo-500', label: 'Split Layers' },
  [ModifierType.PEN_STROKES]: { icon: Icons.Pen, color: 'text-blue-600', label: 'Pen Strokes' },
  [ModifierType.MODIFIER_GROUP]: { icon: Icons.Folder, color: 'text-yellow-500', label: 'Group' },
  [ModifierType.EDGE]: { icon: Icons.Box, color: 'text-gray-400', label: 'Edge' },
  [ModifierType.AI_GENERATION]: { icon: Icons.Sparkles, color: 'text-violet-400', label: 'AI Generation' },
  [ModifierType.LIQUID_MOTION]: { icon: Icons.Droplets, color: 'text-blue-300', label: 'Liquid Motion' },
  [ModifierType.BLUR]: { icon: Icons.CloudFog, color: 'text-blue-200', label: 'Blur' },
};

export const ModifierCard: React.FC<ModifierCardProps> = ({
  modifier,
  index,
  isSolo,
  isExpanded,
  onToggleActive,
  onToggleSolo,
  onToggleExpand,
  onRemove,
  onUpdateParam,
  dragHandleProps,
  containerProps,
}) => {
  const meta = MODIFIER_META[modifier.type] || { icon: Icons.Box, color: 'text-gray-400', label: modifier.name };
  const Icon = meta.icon;

  return (
    <div
      {...containerProps}
      className={`
        group relative rounded-lg overflow-hidden transition-all duration-200
        ${isSolo 
          ? 'bg-purple-500/10 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20' 
          : modifier.active 
            ? 'bg-[#1a1a1c] border border-[#2a2a2c] hover:border-[#3a3a3c]' 
            : 'bg-[#1a1a1c]/50 border border-[#2a2a2c]/50 opacity-60'
        }
      `}
    >
      {/* Main Card Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="drag-handle-icon cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity"
        >
          <Icons.Move size={14} className="text-gray-500" />
        </div>

        {/* Icon & Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon size={16} className={meta.color} />
          <span className="text-sm font-medium text-gray-200 truncate">{meta.label}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1">
          {/* Expand/Collapse */}
          {meta.params && meta.params.length > 0 && (
            <button
              onClick={onToggleExpand}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              title="Toggle Parameters"
            >
              {isExpanded ? (
                <Icons.ChevronDown size={14} className="text-gray-400" />
              ) : (
                <Icons.ChevronDown size={14} className="text-gray-400 transform -rotate-90" />
              )}
            </button>
          )}

          {/* Solo Button */}
          <button
            onClick={onToggleSolo}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              isSolo 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'text-gray-500 hover:bg-white/10 hover:text-gray-300'
            }`}
            title="Solo (isolate this modifier)"
          >
            S
          </button>

          {/* Active/Bypass Toggle */}
          <button
            onClick={onToggleActive}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              modifier.active 
                ? 'text-green-400 hover:bg-green-400/10' 
                : 'text-gray-600 hover:bg-white/10'
            }`}
            title={modifier.active ? 'Bypass' : 'Enable'}
          >
            {modifier.active ? <Icons.Eye size={14} /> : <Icons.EyeOff size={14} />}
          </button>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Remove modifier"
          >
            <Icons.X size={14} />
          </button>
        </div>
      </div>

      {/* Expandable Parameters Section */}
      {isExpanded && meta.params && meta.params.length > 0 && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
          {meta.params.map(param => (
            <div key={param.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-400">{param.label}</label>
                <span className="text-[10px] text-gray-500 font-mono">
                  {modifier.params[param.key] ?? param.def}{param.unit || ''}
                </span>
              </div>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step || 1}
                value={modifier.params[param.key] ?? param.def}
                onChange={(e) => onUpdateParam(modifier.id, param.key, parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mw-accent"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
