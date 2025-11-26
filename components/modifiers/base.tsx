import React, { memo, useId, useRef, useState, useCallback } from 'react';
import { Icons } from '../Icons';
import { IoDataType } from '../../types';
import { TouchSlider } from '../TouchSlider';
import { deviceCapabilities } from '../../hooks/useMobileOptimizations';

// ────────────────────────────── CORE UI PRIMITIVES ──────────────────────────────

export const IO = memo(({ type, active = false, modId, portId = 'main', dataType = 'generic' }: { type: 'in' | 'out'; active?: boolean; modId?: string; portId?: string; dataType?: IoDataType; }) => {
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

export const Control = memo(({ label, children, input, output, modId, dataType = 'number', onReset }: { label: string; children?: React.ReactNode; input?: boolean; output?: boolean; modId?: string; dataType?: IoDataType; onReset?: (paramKey: string) => void }) => {
  const paramKey = typeof label === 'string' ? label : '';

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

export const Slider = ({ value, min, max, unit = '', step = 1, onChange, label, modId }: any) => {
  const id = useId();
  const safeValue = value ?? 0;
  const [inputValue, setInputValue] = useState(String(Math.round(safeValue * 100) / 100));
  const [isFocused, setIsFocused] = useState(false);
  const isTouchDevice = deviceCapabilities.isTouchDevice();

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
      onChange(Math.max(min, Math.min(max, numValue)));
    } else {
      setInputValue(String(Math.round(safeValue * 100) / 100));
    }
  };

  // Use TouchSlider for mobile devices
  if (isTouchDevice) {
    return (
      <div
        className="w-full max-w-[240px]"
        onMouseDown={(e) => e.stopPropagation()} // Prevent node drag-and-drop
        onTouchStart={(e) => e.stopPropagation()} // Prevent node drag-and-drop
      >
        <TouchSlider
          value={safeValue}
          min={min}
          max={max}
          step={step}
          unit={unit}
          onChange={onChange}
        />
      </div>
    );
  }

  // Desktop version with compact layout
  return (
    <div
      className="flex items-center gap-1.5 w-full max-w-[200px]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        id={id}
        draggable="false"
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => {
          const newValue = parseFloat(e.target.value);
          console.log('🎚️ Slider changed:', { label, modId, newValue, min, max });
          onChange(newValue);
        }}
        className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize hover:bg-white/15 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mw-accent [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(139,92,246,0.6)] hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-all"
      />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        className={`w-12 bg-black/30 border rounded px-1.5 py-1 text-[9px] text-gray-300 text-right tabular-nums focus:outline-none transition-all ${isFocused ? 'border-mw-accent/70 bg-black/40' : 'border-white/10'}`}
      />
      <label htmlFor={id} className="text-[9px] text-gray-400 select-none font-mono min-w-[18px]">{unit}</label>
    </div>
  );
};

export const Select = ({ options, value, onChange }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="bg-black/30 border border-white/10 rounded text-[9px] text-gray-300 px-2 py-1 outline-none focus:border-mw-accent/70 hover:border-white/20 w-24 cursor-pointer transition-all focus:bg-black/40"
  >
    {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
  </select>
);

export const ColorPicker = ({ color, onChange }: { color?: string; onChange: (color: string) => void }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

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
      <div {...dragHandleProps} className="flex items-center justify-between p-2.5 border-b border-white/5 bg-[#27272a]/30 rounded-t-lg transition-all group/handle">
        <div className="flex items-center gap-2">
          <div 
            className="drag-handle-icon flex flex-col gap-0.5 opacity-40 group-hover/handle:opacity-100 transition-opacity cursor-grab active:cursor-grabbing px-1"
            title="Drag to reorder"
          >
            <div className="w-3 h-0.5 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-0.5 bg-gray-600 rounded-full"></div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }} 
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1 rounded-full hover:bg-white/10 transition-all" 
            title={active ? 'Bypass Modifier' : 'Activate Modifier'}
          >
            <Icons.Power size={12} className={`transition-all ${active ? 'text-green-500' : 'text-gray-600'}`} />
          </button>
          <Icon size={14} className={color} />
          <span className="text-xs font-semibold text-gray-200 tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onMouseDown={(e) => e.stopPropagation()}
             onClick={(e) => e.stopPropagation()}
             className="text-gray-500 hover:text-mw-accent transition-colors p-1 rounded hover:bg-white/5"
           >
             <Icons.Link2 size={12} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onRemove(); }} 
             onMouseDown={(e) => e.stopPropagation()}
             className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
           >
             <Icons.Trash2 size={12} />
           </button>
        </div>
      </div>
      <div className={`p-2 space-y-0.5 transition-opacity ${!active ? 'pointer-events-none' : ''}`}>
          {React.Children.map(children, child =>
            React.isValidElement(child) && child.type === Control
              ? React.cloneElement(child, { onReset: onParamReset } as any)
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

// ────────────────────────────── MODIFIER FACTORY ──────────────────────────────

export const createNode = (title: string, icon: any, color: string, controls: any[]) => {
  return (props: any) => {
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
