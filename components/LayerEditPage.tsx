import React, { useState, useRef, useEffect } from 'react';
import { Layer, LayerType, Modifier, ModifierType } from '../types';
import { Icons } from './Icons';

// Import all modifier metadata
const MODIFIER_CATALOG = [
  // --- CORE 15 MODIFIERS ---
  { type: ModifierType.OUTLINE, label: 'Outline', category: 'Core', icon: Icons.Circle, color: 'text-cyan-400', params: [
    { key: 'thickness', label: 'Thickness', min: 0, max: 100, def: 2, unit: 'px' },
    { key: 'spacing', label: 'Spacing', min: 0, max: 50, def: 0, unit: 'px' },
  ]},
  { type: ModifierType.STRETCH, label: 'Stretch', category: 'Core', icon: Icons.MoveH, color: 'text-cyan-300', params: [
    { key: 'scaleX', label: 'Scale X', min: 0.1, max: 3, def: 1 },
    { key: 'scaleY', label: 'Scale Y', min: 0.1, max: 3, def: 1 },
  ]},
  { type: ModifierType.REPEATER, label: 'Repeater', category: 'Core', icon: Icons.Copy, color: 'text-cyan-200', params: [
    { key: 'count', label: 'Count', min: 1, max: 20, def: 3 },
    { key: 'offset', label: 'Offset', min: 0, max: 100, def: 10, unit: 'px' },
  ]},
  { type: ModifierType.PARTICLE_DISSOLVE, label: 'Particle Dissolve', category: 'Core', icon: Icons.Sparkles, color: 'text-purple-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 50, unit: '%' },
  ]},
  { type: ModifierType.SPRING, label: 'Spring', category: 'Core', icon: Icons.Activity, color: 'text-green-400', params: [
    { key: 'tension', label: 'Tension', min: 0, max: 100, def: 50 },
    { key: 'damping', label: 'Damping', min: 0, max: 100, def: 10 },
  ]},
  { type: ModifierType.WAVE, label: 'Wave', category: 'Core', icon: Icons.Waves, color: 'text-blue-400', params: [
    { key: 'amplitude', label: 'Amplitude', min: 0, max: 100, def: 10 },
    { key: 'frequency', label: 'Frequency', min: 0, max: 10, def: 2 },
  ]},
  { type: ModifierType.PARALLAX, label: 'Parallax', category: 'Core', icon: Icons.Layers, color: 'text-indigo-400', params: [
    { key: 'depth', label: 'Depth', min: 0, max: 100, def: 50 },
  ]},
  { type: ModifierType.AI_FILL, label: 'AI Fill', category: 'Core', icon: Icons.Brain, color: 'text-pink-400', params: []},
  { type: ModifierType.GLITCH, label: 'Glitch', category: 'Core', icon: Icons.Zap, color: 'text-red-400', params: [
    { key: 'intensity', label: 'Intensity', min: 0, max: 100, def: 50 },
  ]},
  { type: ModifierType.REFRACTION, label: 'Refraction', category: 'Core', icon: Icons.Glasses, color: 'text-teal-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 30 },
  ]},
  { type: ModifierType.HALFTONE_LUMA, label: 'Halftone Luma', category: 'Core', icon: Icons.Grid, color: 'text-gray-400', params: [
    { key: 'dotSize', label: 'Dot Size', min: 1, max: 20, def: 5 },
  ]},
  { type: ModifierType.EXTRUDE, label: 'Extrude', category: 'Core', icon: Icons.Box, color: 'text-orange-400', params: [
    { key: 'depth', label: 'Depth', min: 0, max: 100, def: 20 },
  ]},
  { type: ModifierType.BRIGHTNESS_CONTRAST, label: 'Bright/Contrast', category: 'Core', icon: Icons.Sun, color: 'text-yellow-200', params: [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, def: 0 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, def: 0 },
  ]},
  { type: ModifierType.GRADIENT_MAP, label: 'Gradient Map', category: 'Core', icon: Icons.Palette, color: 'text-purple-300', params: []},
  { type: ModifierType.PERTURB, label: 'Perturb', category: 'Core', icon: Icons.Wind, color: 'text-cyan-500', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 20 },
  ]},

  // --- BLUR EFFECTS ---
  { type: ModifierType.GAUSSIAN_BLUR, label: 'Gaussian Blur', category: 'Blur', icon: Icons.CloudFog, color: 'text-blue-200', params: [
    { key: 'radius', label: 'Radius', min: 0, max: 100, def: 5 },
  ]},
  { type: ModifierType.MOTION_BLUR, label: 'Motion Blur', category: 'Blur', icon: Icons.Wind, color: 'text-blue-300', params: [
    { key: 'angle', label: 'Angle', min: 0, max: 360, def: 0, unit: '°' },
    { key: 'distance', label: 'Distance', min: 0, max: 100, def: 10 },
  ]},
  { type: ModifierType.RADIAL_BLUR, label: 'Radial Blur', category: 'Blur', icon: Icons.Focus, color: 'text-blue-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 20 },
  ]},
  { type: ModifierType.TILT_SHIFT, label: 'Tilt Shift', category: 'Blur', icon: Icons.Maximize, color: 'text-blue-500', params: [
    { key: 'blur', label: 'Blur', min: 0, max: 100, def: 30 },
    { key: 'gradientSize', label: 'Gradient', min: 0, max: 100, def: 50 },
  ]},

  // --- COLOR EFFECTS ---
  { type: ModifierType.HUE_SATURATION, label: 'Hue/Saturation', category: 'Color', icon: Icons.Rainbow, color: 'text-yellow-400', params: [
    { key: 'hue', label: 'Hue', min: 0, max: 360, def: 0, unit: '°' },
    { key: 'sat', label: 'Saturation', min: -100, max: 100, def: 0, unit: '%' },
  ]},
  { type: ModifierType.COLOR_OVERLAY, label: 'Color Overlay', category: 'Color', icon: Icons.Droplets, color: 'text-yellow-300', params: [
    { key: 'opacity', label: 'Opacity', min: 0, max: 100, def: 50, unit: '%' },
  ]},
  { type: ModifierType.INVERT, label: 'Invert', category: 'Color', icon: Icons.RefreshCcw, color: 'text-purple-400', params: []},
  { type: ModifierType.POSTERIZE, label: 'Posterize', category: 'Color', icon: Icons.Palette, color: 'text-pink-400', params: [
    { key: 'levels', label: 'Levels', min: 2, max: 20, def: 5 },
  ]},
  { type: ModifierType.THRESHOLD, label: 'Threshold', category: 'Color', icon: Icons.Binary, color: 'text-gray-300', params: [
    { key: 'level', label: 'Level', min: 0, max: 255, def: 128 },
  ]},
  { type: ModifierType.CURVES, label: 'Curves', category: 'Color', icon: Icons.Activity, color: 'text-purple-200', params: []},
  { type: ModifierType.CHROMATIC_ABERRATION, label: 'Chromatic Aberr', category: 'Color', icon: Icons.Aperture, color: 'text-red-300', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 10 },
  ]},

  // --- STYLE EFFECTS ---
  { type: ModifierType.DROP_SHADOW, label: 'Drop Shadow', category: 'Style', icon: Icons.CloudFog, color: 'text-gray-500', params: [
    { key: 'distance', label: 'Distance', min: 0, max: 50, def: 5 },
    { key: 'blur', label: 'Blur', min: 0, max: 50, def: 10 },
  ]},
  { type: ModifierType.INNER_SHADOW, label: 'Inner Shadow', category: 'Style', icon: Icons.SunDim, color: 'text-gray-600', params: [
    { key: 'distance', label: 'Distance', min: 0, max: 50, def: 5 },
    { key: 'blur', label: 'Blur', min: 0, max: 50, def: 10 },
  ]},
  { type: ModifierType.BEVEL_EMBOSS, label: 'Bevel/Emboss', category: 'Style', icon: Icons.Box, color: 'text-amber-400', params: [
    { key: 'depth', label: 'Depth', min: 0, max: 100, def: 10 },
    { key: 'size', label: 'Size', min: 0, max: 50, def: 5 },
  ]},
  { type: ModifierType.EMBOSS, label: 'Emboss', category: 'Style', icon: Icons.Stamp, color: 'text-amber-300', params: [
    { key: 'height', label: 'Height', min: 0, max: 100, def: 20 },
  ]},
  { type: ModifierType.VIGNETTE, label: 'Vignette', category: 'Style', icon: Icons.Focus, color: 'text-slate-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 50 },
    { key: 'radius', label: 'Radius', min: 0, max: 100, def: 50 },
  ]},
  { type: ModifierType.LENS_FLARE, label: 'Lens Flare', category: 'Style', icon: Icons.Sun, color: 'text-yellow-500', params: [
    { key: 'intensity', label: 'Intensity', min: 0, max: 100, def: 50 },
  ]},
  { type: ModifierType.BLOOM, label: 'Bloom', category: 'Style', icon: Icons.Sparkles, color: 'text-pink-300', params: [
    { key: 'threshold', label: 'Threshold', min: 0, max: 100, def: 50 },
    { key: 'intensity', label: 'Intensity', min: 0, max: 100, def: 30 },
  ]},

  // --- DISTORT EFFECTS ---
  { type: ModifierType.LIQUIFY, label: 'Liquify', category: 'Distort', icon: Icons.Droplets, color: 'text-cyan-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 20 },
  ]},
  { type: ModifierType.DISPLACEMENT_MAP, label: 'Displacement', category: 'Distort', icon: Icons.Move, color: 'text-purple-500', params: [
    { key: 'scale', label: 'Scale', min: 0, max: 100, def: 10 },
  ]},
  { type: ModifierType.PIXELATE, label: 'Pixelate', category: 'Distort', icon: Icons.Grid, color: 'text-green-400', params: [
    { key: 'size', label: 'Size', min: 1, max: 50, def: 5 },
  ]},
  { type: ModifierType.KALEIDOSCOPE, label: 'Kaleidoscope', category: 'Distort', icon: Icons.Hexagon, color: 'text-rainbow-400', params: [
    { key: 'segments', label: 'Segments', min: 3, max: 12, def: 6 },
  ]},

  // --- SPECIAL EFFECTS ---
  { type: ModifierType.NOISE, label: 'Noise', category: 'Special', icon: Icons.Tv, color: 'text-gray-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 10, unit: '%' },
  ]},
  { type: ModifierType.SHARPEN, label: 'Sharpen', category: 'Special', icon: Icons.Focus, color: 'text-blue-500', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 30 },
  ]},
  { type: ModifierType.DITHER, label: 'Dither', category: 'Special', icon: Icons.Tv, color: 'text-gray-500', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 50 },
  ]},

  // --- AI FEATURES ---
  { type: ModifierType.REMOVE_BACKGROUND, label: 'Remove BG', category: 'AI', icon: Icons.Eraser, color: 'text-pink-500', params: []},
  { type: ModifierType.SPLIT_TO_LAYERS, label: 'Split Layers', category: 'AI', icon: Icons.Layers, color: 'text-indigo-500', params: []},
  { type: ModifierType.PEN_STROKES, label: 'Pen Strokes', category: 'AI', icon: Icons.Pen, color: 'text-blue-600', params: [
    { key: 'strokeWidth', label: 'Width', min: 1, max: 20, def: 3 },
  ]},
];

const CATEGORIES = ['Core', 'Blur', 'Color', 'Style', 'Distort', 'Special', 'AI'];

const getLayerStyle = (modifiers: Modifier[], soloModId?: string): React.CSSProperties => {
  const filters: string[] = [];
  const transforms: string[] = [];
  const style: React.CSSProperties = {};

  // 按照右側面板順序應用修飾器（從上到下）
  const activeModifiers = soloModId
    ? modifiers.filter(m => m.id === soloModId)
    : modifiers.filter(m => m.active);

  for (const mod of activeModifiers) {
    const params = mod.params;

    switch (mod.type) {
      // BLUR EFFECTS
      case ModifierType.GAUSSIAN_BLUR:
      case ModifierType.BLUR:
        filters.push(`blur(${params.radius || 0}px)`);
        break;
      case ModifierType.MOTION_BLUR:
        filters.push(`blur(${params.distance || 0}px)`);
        break;
      case ModifierType.RADIAL_BLUR:
        filters.push(`blur(${(params.amount || 0) / 5}px)`);
        break;
      case ModifierType.TILT_SHIFT:
        filters.push(`blur(${(params.blur || 0) / 5}px)`);
        break;

      // COLOR EFFECTS
      case ModifierType.BRIGHTNESS_CONTRAST:
        if (params.brightness !== undefined && params.brightness !== 0) {
          filters.push(`brightness(${1 + params.brightness / 100})`);
        }
        if (params.contrast !== undefined && params.contrast !== 0) {
          filters.push(`contrast(${1 + params.contrast / 100})`);
        }
        break;
      case ModifierType.HUE_SATURATION:
        if (params.hue !== undefined && params.hue !== 0) {
          filters.push(`hue-rotate(${params.hue}deg)`);
        }
        if (params.sat !== undefined && params.sat !== 0) {
          filters.push(`saturate(${1 + params.sat / 100})`);
        }
        break;
      case ModifierType.COLOR_OVERLAY:
        if (params.opacity) {
          style.backgroundColor = `rgba(128, 128, 255, ${params.opacity / 100})`;
          style.mixBlendMode = 'overlay';
        }
        break;
      case ModifierType.INVERT:
        filters.push('invert(1)');
        break;
      case ModifierType.POSTERIZE:
        // 簡化色階效果
        filters.push(`contrast(${(params.levels || 5) * 20}%)`);
        break;
      case ModifierType.THRESHOLD:
        filters.push(`contrast(500%) brightness(${(params.level || 128) / 128})`);
        break;
      case ModifierType.CHROMATIC_ABERRATION:
        // 模擬色差效果
        if (params.amount) {
          filters.push(`contrast(${100 + params.amount / 2}%)`);
        }
        break;

      // STYLE EFFECTS
      case ModifierType.DROP_SHADOW:
        const dist = (params.distance || 0) / 2;
        const blur = (params.blur || 0) / 2;
        filters.push(`drop-shadow(${dist}px ${dist}px ${blur}px rgba(0,0,0,0.5))`);
        break;
      case ModifierType.INNER_SHADOW:
        // CSS filter 不支援內陰影，用 invert 模擬
        filters.push(`brightness(0.8)`);
        break;
      case ModifierType.VIGNETTE:
        // 暗角效果
        if (params.amount) {
          filters.push(`brightness(${1 - params.amount / 200})`);
        }
        break;
      case ModifierType.BLOOM:
        if (params.intensity) {
          filters.push(`brightness(${1 + params.intensity / 100}) saturate(${1 + params.intensity / 100})`);
        }
        break;

      // DISTORT EFFECTS (使用 transform)
      case ModifierType.STRETCH:
        transforms.push(`scale(${params.scaleX || 1}, ${params.scaleY || 1})`);
        break;
      case ModifierType.PIXELATE:
        // 像素化效果（簡化版）
        if (params.size) {
          style.imageRendering = 'pixelated';
          transforms.push(`scale(${1 - params.size / 100})`);
        }
        break;

      // SPECIAL EFFECTS
      case ModifierType.NOISE:
        // 使用 grayscale 模擬噪點
        filters.push(`grayscale(${(params.amount || 0) / 100})`);
        break;
      case ModifierType.SHARPEN:
        if (params.amount) {
          filters.push(`contrast(${100 + params.amount}%) brightness(${1 + params.amount / 200})`);
        }
        break;
      case ModifierType.DITHER:
        filters.push(`grayscale(${(params.amount || 0) / 200}) contrast(150%)`);
        break;

      // CORE EFFECTS
      case ModifierType.GLITCH:
        if (params.intensity) {
          filters.push(`hue-rotate(${params.intensity * 3.6}deg) contrast(${100 + params.intensity}%)`);
        }
        break;
      case ModifierType.WAVE:
        // 波浪效果（簡化版使用 skew）
        if (params.amplitude) {
          transforms.push(`skewX(${params.amplitude / 10}deg)`);
        }
        break;
      case ModifierType.REFRACTION:
        if (params.amount) {
          filters.push(`blur(${params.amount / 20}px) brightness(${1 + params.amount / 200})`);
        }
        break;
      case ModifierType.PERTURB:
        if (params.amount) {
          transforms.push(`rotate(${params.amount / 10}deg)`);
        }
        break;

      // 其他修飾器的基本視覺回饋
      case ModifierType.OUTLINE:
        style.outline = `${params.thickness || 2}px solid rgba(0, 255, 255, 0.5)`;
        style.outlineOffset = `${params.spacing || 0}px`;
        break;
      case ModifierType.REPEATER:
      case ModifierType.PARTICLE_DISSOLVE:
      case ModifierType.SPRING:
      case ModifierType.PARALLAX:
      case ModifierType.AI_FILL:
      case ModifierType.HALFTONE_LUMA:
      case ModifierType.EXTRUDE:
      case ModifierType.GRADIENT_MAP:
      case ModifierType.BEVEL_EMBOSS:
      case ModifierType.EMBOSS:
      case ModifierType.LENS_FLARE:
      case ModifierType.LIQUIFY:
      case ModifierType.DISPLACEMENT_MAP:
      case ModifierType.KALEIDOSCOPE:
      case ModifierType.CURVES:
      case ModifierType.REMOVE_BACKGROUND:
      case ModifierType.SPLIT_TO_LAYERS:
      case ModifierType.PEN_STROKES:
        // 這些修飾器需要更複雜的實現（WebGL/Canvas），暫時添加視覺標記
        style.border = '2px dashed rgba(255, 0, 255, 0.3)';
        break;
    }
  }

  // 組合所有樣式
  if (filters.length > 0) {
    style.filter = filters.join(' ');
  }
  if (transforms.length > 0) {
    style.transform = transforms.join(' ');
  }

  return style;
};

// Resizable divider component
const ResizableDivider: React.FC<{ onResize: (delta: number) => void }> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.movementX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  return (
    <div
      className={`w-1 bg-white/5 hover:bg-mw-accent/50 cursor-col-resize transition-colors flex-shrink-0 ${isDragging ? 'bg-mw-accent' : ''}`}
      onMouseDown={handleMouseDown}
    />
  );
};

interface LayerEditPageProps {
  layer: Layer;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onExit: () => void;
}

export const LayerEditPage: React.FC<LayerEditPageProps> = ({ layer, onUpdateLayer, onExit }) => {
  // Component state
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(380);
  const [selectedCategory, setSelectedCategory] = useState('Core');
  const [expandedMods, setExpandedMods] = useState(new Set<string>());
  const [soloModId, setSoloModId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom limits
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5.0;

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.0001; // 增加靈敏度調整
      setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    }
  };

  // Handle pan with Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
           e.preventDefault();
           setIsSpacePressed(true);
           if (containerRef.current) {
             containerRef.current.style.cursor = 'grab';
           }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = isSpacePressed ? 'grab' : 'default';
      }
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleAddModifier = (type: ModifierType) => {
    const meta = MODIFIER_CATALOG.find(m => m.type === type);
    const defaultParams: Record<string, any> = {};

    meta?.params?.forEach(p => {
      defaultParams[p.key] = p.def;
    });

    const newModifier: Modifier = {
      id: `mod-${Date.now()}`,
      type,
      name: meta?.label || 'New Modifier',
      active: true,
      params: defaultParams,
    };

    onUpdateLayer(layer.id, {
      modifiers: [...layer.modifiers, newModifier]
    });

    // Auto-expand the new modifier
    setExpandedMods(prev => new Set(prev).add(newModifier.id));
  };

  const handleToggleModifier = (modId: string) => {
    onUpdateLayer(layer.id, {
      modifiers: layer.modifiers.map(m =>
        m.id === modId ? { ...m, active: !m.active } : m
      )
    });
  };

  const handleRemoveModifier = (modId: string) => {
    onUpdateLayer(layer.id, {
      modifiers: layer.modifiers.filter(m => m.id !== modId)
    });
    setExpandedMods(prev => {
      const next = new Set(prev);
      next.delete(modId);
      return next;
    });
    if (soloModId === modId) setSoloModId(null);
  };

  const handleToggleSolo = (modId: string) => {
    setSoloModId(prev => prev === modId ? null : modId);
  };

  const handleToggleExpand = (modId: string) => {
    setExpandedMods(prev => {
      const next = new Set(prev);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return next;
    });
  };

  const handleUpdateParam = (modId: string, paramKey: string, value: any) => {
    onUpdateLayer(layer.id, {
      modifiers: layer.modifiers.map(m =>
        m.id === modId ? { ...m, params: { ...m.params, [paramKey]: value } } : m
      )
    });
  };

  const handleClearAll = () => {
    onUpdateLayer(layer.id, {
      modifiers: []
    });
    setSoloModId(null);
    setExpandedMods(new Set());
  };

  const filteredModifiers = MODIFIER_CATALOG.filter(m => m.category === selectedCategory);
  const layerStyle = getLayerStyle(layer.modifiers, soloModId || undefined);

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-2 bg-mw-panel/80 backdrop-blur border border-white/10 rounded-lg hover:bg-mw-panel transition-all"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">返回</span>
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-mw-accent to-mw-cyan bg-clip-text text-transparent">
              {layer.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">單一圖層編輯模式</p>
          </div>
        </div>
        <button className="bg-mw-accent hover:bg-violet-600 px-4 py-2 rounded text-sm font-medium">
          保存
        </button>
      </div>

      {/* Three Column Layout with Resizable Dividers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Modifier Catalog */}
        <div style={{ width: leftWidth }} className="flex-shrink-0 flex flex-col overflow-hidden border-r border-white/10">
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold mb-3">修飾器目錄</h2>
            
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-mw-accent text-white'
                      : 'bg-black/30 text-gray-400 hover:bg-black/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredModifiers.map((modifier) => {
              const Icon = modifier.icon;
              const isApplied = layer.modifiers.some(m => m.type === modifier.type);
              
              return (
                <button
                  key={modifier.type}
                  onClick={() => handleAddModifier(modifier.type)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    isApplied
                      ? 'bg-mw-accent/10 border-mw-accent/30'
                      : 'bg-black/20 border-white/5 hover:bg-black/40'
                  }`}
                >
                  <Icon size={14} className={modifier.color} />
                  <span className="text-xs font-medium flex-1">{modifier.label}</span>
                  {isApplied && <div className="w-1.5 h-1.5 rounded-full bg-mw-accent" />}
                </button>
              );
            })}
          </div>
          
          <div className="flex-shrink-0 p-3 border-t border-white/10 bg-black/20">
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-mw-accent">{filteredModifiers.length}</div>
              <div className="text-[10px] text-gray-500">{selectedCategory} 修飾器</div>
              <div className="text-[9px] text-gray-600">總計 {MODIFIER_CATALOG.length} 個</div>
            </div>
          </div>
        </div>

        {/* Resizable Divider 1 */}
        <ResizableDivider onResize={(delta) => setLeftWidth(prev => Math.max(200, Math.min(400, prev + delta)))} />

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-shrink-0 p-4 border-b border-white/10 z-10 bg-[#0a0a0a]/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">預覽圖層</h2>
              {soloModId && (
                <div className="flex items-center gap-2 px-3 py-1 bg-mw-cyan/20 border border-mw-cyan/50 rounded-full">
                  <Icons.Eye size={14} className="text-mw-cyan" />
                  <span className="text-xs font-medium text-mw-cyan">
                    Solo: {layer.modifiers.find(m => m.id === soloModId)?.name}
                  </span>
                  <button
                    onClick={() => setSoloModId(null)}
                    className="ml-1 hover:bg-mw-cyan/30 rounded-full p-0.5 transition-all"
                    title="取消 Solo"
                  >
                    <Icons.X size={12} className="text-mw-cyan" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="flex-1 overflow-hidden flex items-center justify-center bg-black/30 grid-bg cursor-default relative"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             {/* Zoom Controls */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-black/80 backdrop-blur border border-white/10 rounded-lg p-2 z-50">
              <button
                onClick={() => setZoom(prev => Math.min(MAX_ZOOM, prev * 1.2))}
                className="p-2 hover:bg-white/10 rounded transition-all"
                title="放大 (Ctrl + 滾輪)"
              >
                <Icons.Plus size={16} />
              </button>
              <div className="text-[10px] text-center text-gray-400 py-1">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={() => setZoom(prev => Math.max(MIN_ZOOM, prev / 1.2))}
                className="p-2 hover:bg-white/10 rounded transition-all"
                title="縮小 (Ctrl + 滾輪)"
              >
                <Icons.Min size={16} />
              </button>
              <div className="w-full h-px bg-white/10 my-1" />
              <button
                onClick={handleResetView}
                className="p-2 hover:bg-white/10 rounded transition-all"
                title="重置視圖"
              >
                <Icons.RotateCcw size={16} />
              </button>
            </div>

            <div
              className="relative transition-all duration-100 ease-out"
              style={{
                width: layer.width || 350,
                height: layer.height || 350,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  ...layer.style,
                  ...layerStyle
                }}
              >
                {imageError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mw-accent/20 to-mw-cyan/20 rounded-lg border-2 border-mw-accent/30">
                    <div className="text-center">
                      <Icons.Image size={64} className="mx-auto mb-3 text-mw-accent/50" />
                      <p className="text-sm text-gray-400">無內容或載入失敗</p>
                      {layer.content && (
                        <button
                          onClick={() => setImageError(false)}
                          className="mt-3 px-3 py-1 bg-mw-accent/20 hover:bg-mw-accent/30 border border-mw-accent/50 rounded text-xs transition-all"
                        >
                          重新載入
                        </button>
                      )}
                    </div>
                  </div>
                ) : layer.type === LayerType.IMAGE && layer.content ? (
                  <img
                    src={layer.content}
                    alt={layer.name}
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                    onError={() => setImageError(true)}
                    crossOrigin="anonymous"
                  />
                ) : layer.type === LayerType.TEXT ? (
                  <div className="w-full h-full flex items-center justify-center text-center px-4">
                    <span className="text-2xl font-bold">{layer.content || layer.name}</span>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-lg" />
                )}

                {layer.modifiers.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur px-3 py-1.5 rounded-full border border-mw-accent/50">
                    <span className="text-xs text-mw-accent font-bold">
                      {soloModId ? '1 Solo' : `${layer.modifiers.filter(m => m.active).length} / ${layer.modifiers.length}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resizable Divider 2 */}
        <ResizableDivider onResize={(delta) => setRightWidth(prev => Math.max(320, Math.min(600, prev - delta)))} />

        {/* Right Sidebar - Modifier Controls */}
        <div style={{ width: rightWidth }} className="flex-shrink-0 border-l border-white/10 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold">修飾器操作</h2>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs transition-all"
            >
              清除全部
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {layer.modifiers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
                <Icons.Box size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">尚未添加修飾器</p>
                <p className="text-xs mt-1 text-gray-700">從左側目錄選擇修飾器</p>
              </div>
            ) : (
              <div className="space-y-2">
                {layer.modifiers.map((mod, index) => {
                  const meta = MODIFIER_CATALOG.find(m => m.type === mod.type);
                  const Icon = meta?.icon || Icons.Box;
                  const isExpanded = expandedMods.has(mod.id);
                  const isSolo = soloModId === mod.id;
                  
                  return (
                    <div
                      key={mod.id}
                      className={`rounded-lg border transition-all ${
                        isSolo
                          ? 'bg-mw-cyan/10 border-mw-cyan/30 ring-2 ring-mw-cyan/20'
                          : soloModId
                          ? 'bg-black/30 border-white/5 opacity-40'
                          : mod.active
                          ? 'bg-mw-accent/10 border-mw-accent/30'
                          : 'bg-black/30 border-white/5 opacity-60'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => handleToggleExpand(mod.id)}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            {isExpanded ? <Icons.Min size={12} /> : <Icons.Plus size={12} />}
                          </button>
                          <Icon size={16} className={meta?.color || 'text-gray-400'} />
                          <span className="text-sm font-medium">{mod.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleSolo(mod.id)}
                            className={`p-1.5 rounded transition-all ${
                              isSolo ? 'bg-mw-cyan text-black' : 'hover:bg-white/10 text-gray-500'
                            }`}
                            title="Solo"
                          >
                            <span className="text-[10px] font-bold">S</span>
                          </button>
                          <button
                            onClick={() => handleToggleModifier(mod.id)}
                            className={`p-1.5 rounded transition-all ${
                              mod.active ? 'text-white' : 'text-gray-600'
                            }`}
                            title={mod.active ? 'Disable' : 'Enable'}
                          >
                            {mod.active ? <Icons.Eye size={14} /> : <Icons.EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => handleRemoveModifier(mod.id)}
                            className="p-1.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded transition-all"
                            title="Remove"
                          >
                            <Icons.X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Controls */}
                      {isExpanded && (
                        <div className="p-3 border-t border-white/5 bg-black/20 space-y-3">
                          {meta?.params?.map(param => (
                            <div key={param.key} className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>{param.label}</span>
                                <span>
                                  {mod.params[param.key]}
                                  {param.unit}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={param.step || 1}
                                value={mod.params[param.key] ?? param.def}
                                onChange={(e) => handleUpdateParam(mod.id, param.key, parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-mw-accent"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
