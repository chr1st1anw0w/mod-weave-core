import React, { memo, useId, useRef, useState, useCallback } from 'react';
import { Icons } from './Icons';
import { ModifierType, IoDataType } from '../types';

// ────────────────────────────── CORE UI PRIMITIVES ──────────────────────────────

const IO = memo(({ type, active = false, modId, portId = 'main', dataType = 'generic' }: { type: 'in' | 'out'; active?: boolean; modId?: string; portId?: string; dataType?: IoDataType; }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colorClass = `bg-io-${dataType}`;

  return (
    <div
      data-io-type={type}
      data-mod-id={modId}
      data-port-id={portId}
      data-data-type={dataType}
      className={`
        w-3.5 h-3.5 rounded-full border-2 border-white/40 transition-all duration-200
        ${active ? `${colorClass} shadow-[0_0_12px_rgba(139,92,246,0.8)] animate-pulse scale-110` : `bg-[#1a1a1a]`}
        hover:scale-[1.8] hover:bg-white hover:border-mw-accent hover:shadow-[0_0_16px_rgba(139,92,246,1)]
        cursor-crosshair z-20 relative ring-2 ring-transparent hover:ring-white/20
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <span className="absolute top-1/2 -translate-y-1/2 text-[9px] text-white whitespace-nowrap px-2 py-1 bg-black/90 rounded border border-mw-accent/30 pointer-events-none z-30 font-medium shadow-lg" style={type === 'in' ? {left: 'calc(100% + 8px)'} : {right: 'calc(100% + 8px)'}}>{portId} <span className="text-mw-accent">({dataType})</span></span>}
    </div>
  );
});
IO.displayName = 'IO';

const Control = memo(({ label, children, input, output, modId, dataType = 'number', onReset }: { label: string; children?: React.ReactNode; input?: boolean; output?: boolean; modId?: string; dataType?: IoDataType; onReset?: (paramKey: string) => void }) => {
  const paramKey = typeof label === 'string' ? label : ''; // Use label as paramKey for reset

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-1 group/row relative hover:bg-white/5 rounded transition-all">
      <div className={`transition-all duration-200 ${input ? 'opacity-30 group-hover/row:opacity-100 group-hover/row:scale-110' : 'opacity-0'}`}>
        <IO type="in" modId={modId} portId={paramKey} dataType={dataType} />
      </div>
      <label className="text-[10px] text-gray-400 font-medium w-20 truncate select-none group-hover/row:text-gray-200 transition-colors" title={label}>{label}</label>
      <div className="flex-1 flex items-center justify-end min-w-0 gap-1">
        {children}
        {onReset && (
          <button
            onClick={() => onReset(paramKey)}
            className="text-gray-600 hover:text-mw-accent opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 p-0.5 rounded hover:bg-mw-accent/10"
            title="Reset to default"
          >
            <Icons.RefreshCcw size={10} />
          </button>
        )}
      </div>
      <div className={`transition-all duration-200 ${output ? 'opacity-30 group-hover/row:opacity-100 group-hover/row:scale-110' : 'opacity-0'}`}>
        <IO type="out" modId={modId} portId={paramKey} dataType={dataType} />
      </div>
    </div>
  );
});
Control.displayName = 'Control';

const Slider = ({ value, min, max, unit = '', step = 1, onChange, label, modId }: any) => {
  const id = useId();
  const safeValue = value ?? 0;
  const [inputValue, setInputValue] = useState(String(Math.round(safeValue * 100) / 100));
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    setInputValue(String(Math.round(safeValue * 100) / 100));
  }, [safeValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(Math.max(min, Math.min(max, numValue))); // Clamp value
    } else {
      setInputValue(String(Math.round(safeValue * 100) / 100)); // Revert if invalid
    }
  };

  return (
    <div
      className="flex items-center gap-1.5 w-full max-w-[140px]"
      onMouseDown={(e) => e.stopPropagation()} // Prevent drag-and-drop
    >
      <input
        id={id}
        draggable="false"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize hover:bg-white/15 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mw-accent [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.6)] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-all"
      />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        className={`w-11 bg-black/30 border rounded px-1.5 py-1 text-[9px] text-gray-300 text-right tabular-nums focus:outline-none transition-all ${isFocused ? 'border-mw-accent/70 bg-black/40' : 'border-white/10'}`}
      />
      <label htmlFor={id} className="text-[9px] text-gray-400 select-none font-mono min-w-[16px]">{unit}</label>
    </div>
  );
};

const Select = ({ options, value, onChange }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-black/30 border border-white/10 rounded text-[9px] text-gray-300 px-2 py-1 outline-none focus:border-mw-accent/70 hover:border-white/20 w-24 cursor-pointer transition-all focus:bg-black/40"
  >
    {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const ColorPicker = ({ color, onChange }: { color?: string; onChange: (color: string) => void }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null); // For click outside

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // Basic ClickOutside logic
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    if (displayColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [displayColorPicker]);


  return (
    <div className="relative">
      <div className="flex items-center gap-2 cursor-pointer group" onClick={handleClick}>
        <div className="w-9 h-5 rounded border-2 border-white/20 relative overflow-hidden ring-0 group-hover:ring-2 ring-mw-accent/50 transition-all shadow-sm">
          <div className="absolute inset-0" style={{ backgroundColor: color || '#fff' }} />
        </div>
        <span className="text-[9px] text-gray-500 font-mono group-hover:text-white transition-colors uppercase">{color || 'HEX'}</span>
      </div>
      { displayColorPicker ? (
        <div ref={pickerRef} className="absolute z-10 p-3 bg-[#1e1e21] border border-mw-accent/30 rounded-lg shadow-2xl top-8 left-0 backdrop-blur-xl">
          <input
            type="color"
            value={color || '#ffffff'}
            onChange={handleChange}
            className="w-20 h-20 cursor-pointer rounded border-2 border-white/10 hover:border-mw-accent/50 transition-all"
          />
        </div>
      ) : null }
    </div>
  );
};

// ────────────────────────────── NODE CONTAINER ──────────────────────────────

export const NodeContainer = React.forwardRef(({ title, icon: Icon, color = "text-gray-300", children, dragHandleProps, containerProps, onRemove, modId, active, onToggleActive, isSelected, onParamReset }: any, ref: any) => {
  const [isDragging, setIsDragging] = useState(false);

  const enhancedContainerProps = {
    ...containerProps,
    onDragStart: (e: React.DragEvent) => {
      setIsDragging(true);
      if (containerProps.onDragStart) containerProps.onDragStart(e);
    },
    onDragEnd: (e: React.DragEvent) => {
      setIsDragging(false);
      if (containerProps.onDragEnd) containerProps.onDragEnd(e);
    },
  };

  return (
    <div
      ref={ref}
      {...enhancedContainerProps}
      className={`
        bg-[#1e1e21] border transition-all duration-200 group select-none relative z-10
        ${isSelected ? 'border-mw-accent shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'border-white/10 hover:border-white/20'}
        ${!active ? 'opacity-50' : ''}
        ${isDragging ? 'opacity-60 scale-95 rotate-2 shadow-2xl' : 'opacity-100 scale-100 rotate-0'}
        rounded-lg shadow-lg hover:shadow-xl
      `}
    >
      <div {...dragHandleProps} className="flex items-center justify-between p-2.5 border-b border-white/5 bg-[#27272a]/30 rounded-t-lg hover:bg-[#27272a]/60 transition-all cursor-grab active:cursor-grabbing group/handle">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5 opacity-40 group-hover/handle:opacity-100 transition-opacity">
            <div className="w-3 h-0.5 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-0.5 bg-gray-600 rounded-full"></div>
          </div>
          <button onClick={onToggleActive} className="p-1 rounded-full hover:bg-white/10 transition-all" title={active ? 'Bypass Modifier' : 'Activate Modifier'}>
            <Icons.Power size={12} className={`transition-all ${active ? 'text-green-500' : 'text-gray-600'}`} />
          </button>
          <Icon size={14} className={color} />
          <span className="text-xs font-semibold text-gray-200 tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="text-gray-500 hover:text-mw-accent transition-colors p-1 rounded hover:bg-white/5"><Icons.Link2 size={12} /></button>
           <button onClick={onRemove} className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"><Icons.Trash2 size={12} /></button>
        </div>
      </div>
      <div className={`p-2 space-y-0.5 transition-opacity ${!active ? 'pointer-events-none' : ''}`}>
          {React.Children.map(children, child =>
            React.isValidElement(child) && child.type === Control
              ? React.cloneElement(child, { onReset: onParamReset } as any) // Pass onReset to Controls
              : child
          )}
      </div>
      <div className="border-t border-white/5 flex justify-between items-center px-3 py-1.5 bg-black/20 rounded-b-lg">
         <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold">
           <IO type="in" modId={modId} portId="main" /> In
         </div>
         <div className="flex items-center gap-2 text-[9px] text-gray-600 uppercase tracking-widest font-bold">
           Out <IO type="out" modId={modId} portId="main" />
         </div>
      </div>
    </div>
  );
});
NodeContainer.displayName = 'NodeContainer';

// ────────────────────────────── MODIFIER FACTORY & IMPLEMENTATIONS ──────────────────────────────

export const ModifierGroupNode = (props: any) => (
  <NodeContainer title="Modifier Group" icon={Icons.Folder} color="text-yellow-500" {...props}>
    <Control label="Name" modId={props.modId} dataType="string"><input type="text" value={props.params.groupName || "New Group"} onChange={(e) => props.onChange('groupName', e.target.value)} className="bg-transparent text-right text-[10px] text-gray-300 outline-none border-b border-transparent focus:border-mw-accent" /></Control>
    <div className="px-2 py-1 text-[9px] text-gray-500 bg-black/20 rounded text-center">{props.params.childCount || 0} modifiers</div>
  </NodeContainer>
);

const createNode = (title: string, icon: any, color: string, controls: any[]) => {
  return (props: any) => {
    // Collect default values for reset functionality
    const defaultParams: Record<string, any> = {};
    controls.forEach(c => {
      if (c.def !== undefined) {
        defaultParams[c.key] = c.def;
      }
    });

    const onParamReset = useCallback((paramKey: string) => {
      if (defaultParams[paramKey] !== undefined) {
        props.onChange(paramKey, defaultParams[paramKey]);
      }
    }, [props.onChange, defaultParams]);

    return (
      <NodeContainer title={title} icon={icon} color={color} onParamReset={onParamReset} {...props}>
        {controls.map((c, i) => (
          <Control key={i} label={c.label} input={c.io} output={c.io} modId={props.modId} dataType={c.dataType}>
            {c.type === 'slider' && <Slider value={props.params[c.key] ?? c.def} min={c.min} max={c.max} unit={c.unit} step={c.step} onChange={(v:number) => props.onChange(c.key, v)} />}
            {c.type === 'color' && <ColorPicker color={props.params[c.key] ?? c.def} onChange={(v: string) => props.onChange(c.key, v)} />}
            {c.type === 'select' && <Select options={c.opts} value={props.params[c.key] || c.def} onChange={(v:string) => props.onChange(c.key, v)} />}
          </Control>
        ))}
      </NodeContainer>
    );
  };
};

// --- CORE 15 ---
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

export const GlitchNode = createNode("Glitch", Icons.Zap, "text-rose-500", [
  { label: "Intensity", key: "intensity", type: "slider", min: 0, max: 100, unit: "%", def: 50, io: true, dataType: 'number' },
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

export const BrightnessContrastNode = createNode("Bright/Contr", Icons.Sun, "text-yellow-200", [
  { label: "Brightness", key: "brightness", type: "slider", min: -100, max: 100, def: 0, io: true, dataType: 'number' },
  { label: "Contrast", key: "contrast", type: "slider", min: -100, max: 100, def: 0, dataType: 'number' }
]);

export const GradientMapNode = createNode("Gradient Map", Icons.Palette, "text-pink-400", [
  { label: "Blend", key: "blend", type: "select", opts: ['Normal', 'Overlay', 'Multiply'], def: 'Normal', io: true, dataType: 'string' }
]);

export const PerturbNode = createNode("Perturb", Icons.Activity, "text-teal-400", [
  { label: "Amplitude", key: "amplitude", type: "slider", min: 0, max: 100, def: 10, io: true, dataType: 'number' },
  { label: "Frequency", key: "frequency", type: "slider", min: 0.1, max: 5, def: 1, dataType: 'number' }
]);

export const RemoveBGNode = createNode("Remove BG", Icons.Eraser, "text-red-400", [ { label: "Tolerance", key: "tolerance", type: "slider", min: 0, max: 100, def: 20, dataType: 'number' } ]);
export const SplitToLayersNode = createNode("Split Layers", Icons.Layers, "text-blue-400", [ { label: "Edge Str", key: "edgeStrength", type: "slider", min: 0, max: 10, def: 5, dataType: 'number' } ]);
export const PenStrokesNode = createNode("Pen Strokes", Icons.Pen, "text-zinc-300", [ { label: "Size", key: "size", type: "slider", min: 1, max: 20, unit: "px", def: 2, dataType: 'number' } ]);
export const DropShadowNode = createNode("Drop Shadow", Icons.CloudFog, "text-gray-500", [ { label: "Distance", key: "distance", type: "slider", min: 0, max: 50, def: 5, io: true, dataType: 'number' }, { label: "Blur", key: "blur", type: "slider", min: 0, max: 50, def: 10, dataType: 'number' } ]);
export const InnerShadowNode = createNode("Inner Shadow", Icons.CloudFog, "text-gray-400", [ { label: "Distance", key: "distance", type: "slider", min: 0, max: 20, def: 3, dataType: 'number' } ]);
export const BevelEmbossNode = createNode("Bevel", Icons.Box, "text-gray-200", [ { label: "Depth", key: "depth", type: "slider", min: 0, max: 1000, unit: "%", def: 100, dataType: 'number' }, { label: "Size", key: "size", type: "slider", min: 0, max: 50, def: 5, dataType: 'number' } ]);
export const ColorOverlayNode = createNode("Color Overlay", Icons.Palette, "text-pink-300", [ { label: "Opacity", key: "opacity", type: "slider", min: 0, max: 100, unit: "%", def: 50, dataType: 'number' } ]);
export const NoiseNode = createNode("Noise", Icons.Tv, "text-gray-400", [ { label: "Amount", key: "amount", type: "slider", min: 0, max: 100, unit: "%", def: 10, io: true, dataType: 'number' } ]);
export const BlurNode = createNode("Gaussian Blur", Icons.CloudFog, "text-blue-200", [ { label: "Radius", key: "radius", type: "slider", min: 0, max: 100, def: 5, io: true, dataType: 'number' } ]);
export const MotionBlurNode = createNode("Motion Blur", Icons.Wind, "text-blue-300", [ { label: "Angle", key: "angle", type: "slider", min: 0, max: 360, def: 0, dataType: 'number' }, { label: "Dist", key: "distance", type: "slider", min: 0, max: 200, def: 10, io: true, dataType: 'number' } ]);
export const RadialBlurNode = createNode("Radial Blur", Icons.Circle, "text-blue-400", [ { label: "Amount", key: "amount", type: "slider", min: 0, max: 100, def: 10, dataType: 'number' } ]);
export const LiquifyNode = createNode("Liquify", Icons.Waves, "text-purple-400", [ { label: "Brush", key: "brush", type: "slider", min: 10, max: 200, def: 50, dataType: 'number' } ]);
export const DisplacementNode = createNode("Displace", Icons.Waves, "text-gray-300", [ { label: "Scale", key: "scale", type: "slider", min: 0, max: 100, def: 10, dataType: 'number' } ]);
export const ThresholdNode = createNode("Threshold", Icons.Contrast, "text-gray-100", [ { label: "Level", key: "level", type: "slider", min: 0, max: 255, def: 128, dataType: 'number' } ]);
export const InvertNode = createNode("Invert", Icons.Contrast, "text-white", [ { label: "Chan", key: "channel", type: "select", opts: ['RGB','Alpha'], def: 'RGB', dataType: 'string' } ]);
export const PosterizeNode = createNode("Posterize", Icons.ImgMinus, "text-yellow-600", [ { label: "Levels", key: "levels", type: "slider", min: 2, max: 20, def: 4, step: 1, dataType: 'number' } ]);
export const HueSaturationNode = createNode("Hue/Sat", Icons.Rainbow, "text-yellow-400", [ { label: "Hue", key: "hue", type: "slider", min: 0, max: 360, def: 0, io: true, dataType: 'number' }, { label: "Sat", key: "sat", type: "slider", min: -100, max: 100, def: 0, dataType: 'number' } ]);
export const CurvesNode = createNode("Curves", Icons.Activity, "text-gray-300", [ { label: "Chan", key: "channel", type: "select", opts: ['RGB', 'Red'], def: 'RGB', dataType: 'string' } ]);
export const VignetteNode = createNode("Vignette", Icons.Circle, "text-gray-500", [ { label: "Amt", key: "amount", type: "slider", min: 0, max: 100, def: 50, dataType: 'number' } ]);
export const LensFlareNode = createNode("Lens Flare", Icons.Sun, "text-yellow-100", [ { label: "Bright", key: "brightness", type: "slider", min: 0, max: 200, def: 100, dataType: 'number' } ]);
export const BloomNode = createNode("Bloom", Icons.Sun, "text-amber-200", [ { label: "Thresh", key: "threshold", type: "slider", min: 0, max: 1, def: 0.7, step: 0.05, dataType: 'number' }, { label: "Int", key: "intensity", type: "slider", min: 0, max: 3, def: 1, step: 0.1, io: true, dataType: 'number' } ]);
export const ChromaticAberrationNode = createNode("Chromatic", Icons.Glasses, "text-red-500", [ { label: "Shift", key: "shift", type: "slider", min: -10, max: 10, def: 2, step: 0.5, dataType: 'number' }, { label: "Int", key: "intensity", type: "slider", min: 0, max: 5, def: 1, io: true, dataType: 'number' } ]);
export const SharpenNode = createNode("Sharpen", Icons.Triangle, "text-blue-100", [ { label: "Amt", key: "amount", type: "slider", min: 0, max: 100, def: 50, dataType: 'number' } ]);
export const TiltShiftNode = createNode("Tilt Shift", Icons.Aperture, "text-blue-300", [ { label: "Blur", key: "blur", type: "slider", min: 0, max: 50, def: 10, dataType: 'number' } ]);
export const DitherNode = createNode("Dither", Icons.Grid, "text-gray-400", [ { label: "Type", key: "type", type: "select", opts: ['Bayer', 'Floyd'], def: 'Bayer', dataType: 'string' } ]);
export const PixelateNode = createNode("Pixelate", Icons.Grid, "text-indigo-300", [ { label: "Size", key: "size", type: "slider", min: 1, max: 100, def: 10, dataType: 'number' } ]);
export const KaleidoscopeNode = createNode("Kaleidoscope", Icons.Hexagon, "text-teal-300", [ { label: "Segs", key: "segments", type: "slider", min: 3, max: 20, def: 6, step: 1, dataType: 'number' } ]);
export const EmbossNode = createNode("Emboss", Icons.Component, "text-gray-300", [ { label: "Height", key: "height", type: "slider", min: 0, max: 20, def: 5, io: true, dataType: 'number' }, { label: "Angle", key: "angle", type: "slider", min: 0, max: 360, def: 45, dataType: 'number' } ]);

export const GenericExtendedNode = (props: any) => (
  <NodeContainer title={props.name || props.type} icon={Icons.Box} color="text-gray-500" {...props}>
    {Object.keys(props.params).slice(0, 3).map(k => (
        <Control key={k} label={k.slice(0,6)} modId={props.modId}><Slider value={props.params[k] || 0} min={0} max={100} onChange={(v: number) => props.onChange(k, v)} /></Control>
    ))}
  </NodeContainer>
);