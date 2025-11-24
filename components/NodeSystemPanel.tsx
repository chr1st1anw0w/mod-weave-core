import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Layer, Modifier, ModifierType, Connection, IoDataType } from '../types';
import { Icons } from './Icons';
import * as Nodes from './ModifierNodes';

interface NodeSystemPanelProps {
  layer: Layer | null;
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void;
  selectedLayerId: string | null; // Added to highlight selected node
  isMobile?: boolean; // Added for mobile support
}

// Define NodeComponentMap to map ModifierType to actual React Node components
const NodeComponentMap: Record<ModifierType, React.ComponentType<any>> = {
  [ModifierType.MODIFIER_GROUP]: Nodes.ModifierGroupNode,
  [ModifierType.OUTLINE]: Nodes.OutlineNode,
  [ModifierType.STRETCH]: Nodes.StretchNode,
  [ModifierType.REPEATER]: Nodes.RepeaterNode,
  [ModifierType.PARTICLE_DISSOLVE]: Nodes.ParticleNode,
  [ModifierType.SPRING]: Nodes.SpringNode,
  [ModifierType.WAVE]: Nodes.WaveNode,
  [ModifierType.PARALLAX]: Nodes.ParallaxNode,
  [ModifierType.AI_FILL]: Nodes.AIFillNode,
  [ModifierType.GLITCH]: Nodes.GlitchNode,
  [ModifierType.REFRACTION]: Nodes.RefractionNode,
  [ModifierType.HALFTONE_LUMA]: Nodes.HalftoneNode,
  [ModifierType.EXTRUDE]: Nodes.ExtrudeNode,
  [ModifierType.BRIGHTNESS_CONTRAST]: Nodes.BrightnessContrastNode,
  [ModifierType.GRADIENT_MAP]: Nodes.GradientMapNode,
  [ModifierType.PERTURB]: Nodes.PerturbNode,
  [ModifierType.REMOVE_BACKGROUND]: Nodes.RemoveBGNode,
  [ModifierType.SPLIT_TO_LAYERS]: Nodes.SplitToLayersNode,
  [ModifierType.PEN_STROKES]: Nodes.PenStrokesNode,
  [ModifierType.EMBOSS]: Nodes.EmbossNode,
  [ModifierType.DROP_SHADOW]: Nodes.DropShadowNode,
  [ModifierType.INNER_SHADOW]: Nodes.InnerShadowNode,
  [ModifierType.BEVEL_EMBOSS]: Nodes.BevelEmbossNode,
  [ModifierType.COLOR_OVERLAY]: Nodes.ColorOverlayNode,
  [ModifierType.NOISE]: Nodes.NoiseNode,
  [ModifierType.GAUSSIAN_BLUR]: Nodes.BlurNode, // Note: Using BlurNode for Gaussian Blur
  [ModifierType.MOTION_BLUR]: Nodes.MotionBlurNode,
  [ModifierType.RADIAL_BLUR]: Nodes.RadialBlurNode,
  [ModifierType.LIQUIFY]: Nodes.LiquifyNode,
  [ModifierType.DISPLACEMENT_MAP]: Nodes.DisplacementNode,
  [ModifierType.THRESHOLD]: Nodes.ThresholdNode,
  [ModifierType.INVERT]: Nodes.InvertNode,
  [ModifierType.POSTERIZE]: Nodes.PosterizeNode,
  [ModifierType.HUE_SATURATION]: Nodes.HueSaturationNode,
  [ModifierType.CURVES]: Nodes.CurvesNode,
  [ModifierType.VIGNETTE]: Nodes.VignetteNode,
  [ModifierType.LENS_FLARE]: Nodes.LensFlareNode,
  [ModifierType.BLOOM]: Nodes.BloomNode,
  [ModifierType.CHROMATIC_ABERRATION]: Nodes.ChromaticAberrationNode,
  [ModifierType.SHARPEN]: Nodes.SharpenNode,
  [ModifierType.TILT_SHIFT]: Nodes.TiltShiftNode,
  [ModifierType.DITHER]: Nodes.DitherNode,
  [ModifierType.PIXELATE]: Nodes.PixelateNode,
  [ModifierType.KALEIDOSCOPE]: Nodes.KaleidoscopeNode,
  // Fallback / Deprecated Modifier Types - map to GenericExtendedNode
  [ModifierType.EDGE]: Nodes.GenericExtendedNode,
  [ModifierType.AI_GENERATION]: Nodes.GenericExtendedNode, // This might be used for generic AI generation, not a specific modifier node
  [ModifierType.LIQUID_MOTION]: Nodes.GenericExtendedNode,
  [ModifierType.BLUR]: Nodes.BlurNode, // Generic blur maps to Gaussian Blur Node
};


const MODIFIER_CATALOG_RAW = [
  { type: ModifierType.MODIFIER_GROUP, label: 'Group', icon: Icons.Folder, color: 'text-yellow-500', cat: 'Util' },
  { type: ModifierType.OUTLINE, label: 'Outline', icon: Icons.Circle, color: 'text-cyan-400', cat: 'Shape' },
  { type: ModifierType.STRETCH, label: 'Stretch', icon: Icons.Move, color: 'text-orange-400', cat: 'Distort' },
  { type: ModifierType.REPEATER, label: 'Repeater', icon: Icons.Copy, color: 'text-indigo-400', cat: 'Pattern' },
  { type: ModifierType.PARTICLE_DISSOLVE, label: 'Particle Dissolve', icon: Icons.Wind, color: 'text-emerald-300', cat: 'Physics' },
  { type: ModifierType.SPRING, label: 'Spring', icon: Icons.Activity, color: 'text-green-400', cat: 'Physics' },
  { type: ModifierType.WAVE, label: 'Wave', icon: Icons.Waves, color: 'text-sky-400', cat: 'Distort' },
  { type: ModifierType.PARALLAX, label: 'Parallax', icon: Icons.Layers, color: 'text-purple-300', cat: 'Motion' },
  { type: ModifierType.AI_FILL, label: 'AI Fill', icon: Icons.Sparkles, color: 'text-violet-400', cat: 'AI' },
  { type: ModifierType.GLITCH, label: 'Glitch', icon: Icons.Zap, color: 'text-rose-500', cat: 'Effect' },
  { type: ModifierType.REFRACTION, label: 'Refraction', icon: Icons.Droplets, color: 'text-blue-300', cat: 'Glass' },
  { type: ModifierType.HALFTONE_LUMA, label: 'Halftone', icon: Icons.Grid, color: 'text-gray-400', cat: 'Style' },
  { type: ModifierType.EXTRUDE, label: 'Extrude 3D', icon: Icons.Box, color: 'text-amber-500', cat: '3D' },
  { type: ModifierType.BRIGHTNESS_CONTRAST, label: 'Bright/Contr', icon: Icons.Sun, color: 'text-yellow-200', cat: 'Color' },
  { type: ModifierType.GRADIENT_MAP, label: 'Gradient Map', icon: Icons.Palette, color: 'text-pink-400', cat: 'Color' },
  { type: ModifierType.PERTURB, label: 'Perturb', icon: Icons.Activity, color: 'text-teal-400', cat: 'Distort' },
  { type: ModifierType.REMOVE_BACKGROUND, label: 'Remove BG', icon: Icons.Eraser, color: 'text-red-400', cat: 'AI' },
  { type: ModifierType.SPLIT_TO_LAYERS, label: 'Split Layers', icon: Icons.Layers, color: 'text-blue-400', cat: 'Util' },
  { type: ModifierType.PEN_STROKES, label: 'Pen Strokes', icon: Icons.Pen, color: 'text-zinc-300', cat: 'Style' },
  { type: ModifierType.EMBOSS, label: 'Emboss', icon: Icons.Component, color: 'text-gray-300', cat: 'Style' },
  { type: ModifierType.DROP_SHADOW, label: 'Drop Shadow', icon: Icons.CloudFog, color: 'text-gray-500', cat: 'Style' },
  { type: ModifierType.INNER_SHADOW, label: 'Inner Shadow', icon: Icons.CloudFog, color: 'text-gray-400', cat: 'Style' },
  { type: ModifierType.BEVEL_EMBOSS, label: 'Bevel', icon: Icons.Box, color: 'text-gray-200', cat: '3D' },
  { type: ModifierType.COLOR_OVERLAY, label: 'Color Overlay', icon: Icons.Palette, color: 'text-pink-300', cat: 'Color' },
  { type: ModifierType.NOISE, label: 'Noise', icon: Icons.Tv, color: 'text-gray-400', cat: 'Effect' },
  { type: ModifierType.GAUSSIAN_BLUR, label: 'Gaussian Blur', icon: Icons.CloudFog, color: 'text-blue-200', cat: 'Blur' },
  { type: ModifierType.MOTION_BLUR, label: 'Motion Blur', icon: Icons.Wind, color: 'text-blue-300', cat: 'Blur' },
  { type: ModifierType.RADIAL_BLUR, label: 'Radial Blur', icon: Icons.Circle, color: 'text-blue-400', cat: 'Blur' },
  { type: ModifierType.LIQUIFY, label: 'Liquify', icon: Icons.Waves, color: 'text-purple-400', cat: 'Distort' },
  { type: ModifierType.DISPLACEMENT_MAP, label: 'Displace', icon: Icons.Waves, color: 'text-gray-300', cat: 'Distort' },
  { type: ModifierType.THRESHOLD, label: 'Threshold', icon: Icons.Contrast, color: 'text-gray-100', cat: 'Color' },
  { type: ModifierType.INVERT, label: 'Invert', icon: Icons.Contrast, color: 'text-white', cat: 'Color' },
  { type: ModifierType.POSTERIZE, label: 'Posterize', icon: Icons.ImgMinus, color: 'text-yellow-600', cat: 'Color' },
  { type: ModifierType.HUE_SATURATION, label: 'Hue/Sat', icon: Icons.Rainbow, color: 'text-yellow-400', cat: 'Color' },
  { type: ModifierType.CURVES, label: 'Curves', icon: Icons.Activity, color: 'text-gray-300', cat: 'Color' },
  { type: ModifierType.VIGNETTE, label: 'Vignette', icon: Icons.Circle, color: 'text-gray-500', cat: 'Effect' },
  { type: ModifierType.LENS_FLARE, label: 'Lens Flare', icon: Icons.Sun, color: 'text-yellow-100', cat: 'Light' },
  { type: ModifierType.BLOOM, label: 'Bloom', icon: Icons.Sun, color: 'text-amber-200', cat: 'Light' },
  { type: ModifierType.CHROMATIC_ABERRATION, label: 'Chromatic', icon: Icons.Glasses, color: 'text-red-500', cat: 'Effect' },
  { type: ModifierType.SHARPEN, label: 'Sharpen', icon: Icons.Triangle, color: 'text-blue-100', cat: 'Effect' },
  { type: ModifierType.TILT_SHIFT, label: 'Tilt Shift', icon: Icons.Aperture, color: 'text-blue-300', cat: 'Blur' },
  { type: ModifierType.DITHER, label: 'Dither', icon: Icons.Grid, color: 'text-gray-400', cat: 'Retro' },
  { type: ModifierType.PIXELATE, label: 'Pixelate', icon: Icons.Grid, color: 'text-indigo-300', cat: 'Retro' },
  { type: ModifierType.KALEIDOSCOPE, label: 'Kaleidoscope', icon: Icons.Hexagon, color: 'text-teal-300', cat: 'Effect' }
];

const MODIFIER_CATEGORIES = Array.from(new Set(MODIFIER_CATALOG_RAW.map(m => m.cat)));

export const NodeSystemPanel: React.FC<NodeSystemPanelProps> = ({ layer, onUpdateLayer, selectedLayerId, isMobile }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: Math.max(20, window.innerWidth - 320), y: 80 }); // Initial position (right side)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: 250, height: window.innerHeight * 0.7 });

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [wireStart, setWireStart] = useState<{modId: string, type: 'in' | 'out', portId: string, startPos: {x: number, y: number}, dataType: IoDataType} | null>(null);
  const [mousePos, setMousePos] = useState({x:0, y:0});

  // Persist panel position and size
  useEffect(() => {
    if (isMobile) return; // Don't load saved position/size on mobile
    const savedPos = localStorage.getItem('nodePanelPos');
    const savedSize = localStorage.getItem('nodePanelSize');
    if (savedPos) setPanelPosition(JSON.parse(savedPos));
    if (savedSize) setPanelSize(JSON.parse(savedSize));
  }, [isMobile]);

  if (!layer) return null;

  const handleUpdateModifier = useCallback((modId: string, paramKey: string, value: any) => {
    if (!onUpdateLayer) return;
    const newModifiers = layer.modifiers.map(m => 
      m.id === modId ? { ...m, params: { ...m.params, [paramKey]: value }, lastUsed: Date.now() } : m
    );
    onUpdateLayer(layer.id, { modifiers: newModifiers });
  }, [layer.id, layer.modifiers, onUpdateLayer]);
  
  const handleToggleActive = useCallback((modId: string) => {
    if (!onUpdateLayer) return;
    const newModifiers = layer.modifiers.map(m => 
      m.id === modId ? { ...m, active: !m.active, lastUsed: Date.now() } : m
    );
    onUpdateLayer(layer.id, { modifiers: newModifiers });
  }, [layer.id, layer.modifiers, onUpdateLayer]);

  const handleRemoveModifier = useCallback((modId: string) => {
     if (!onUpdateLayer) return;
     const newModifiers = layer.modifiers.filter(m => m.id !== modId);
     const newConnections = (layer.connections || []).filter(c => c.fromModId !== modId && c.toModId !== modId);
     onUpdateLayer(layer.id, { modifiers: newModifiers, connections: newConnections });
  }, [layer.id, layer.modifiers, layer.connections, onUpdateLayer]);

  const handleAddModifier = useCallback((type: ModifierType) => {
      if (!onUpdateLayer) return;
      const catalogItem = MODIFIER_CATALOG_RAW.find(c => c.type === type);
      const newMod: Modifier = { id: `mod-${Date.now()}`, type, name: catalogItem?.label || 'New', active: true, params: {}, lastUsed: Date.now() };
      onUpdateLayer(layer.id, { modifiers: [...layer.modifiers, newMod] });
      setShowAddMenu(false);
  }, [layer.id, layer.modifiers, onUpdateLayer]);

  const handleToggleFavorite = useCallback((modId: string) => {
    if (!onUpdateLayer) return;
    const newModifiers = layer.modifiers.map(m => 
      m.id === modId ? { ...m, isFavorite: !m.isFavorite } : m
    );
    onUpdateLayer(layer.id, { modifiers: newModifiers });
  }, [layer.id, layer.modifiers, onUpdateLayer]);

  const handleParamReset = useCallback((modId: string, paramKey: string, defaultValue: any) => {
    if (!onUpdateLayer) return;
    const newModifiers = layer.modifiers.map(m =>
      m.id === modId ? { ...m, params: { ...m.params, [paramKey]: defaultValue }, lastUsed: Date.now() } : m
    );
    onUpdateLayer(layer.id, { modifiers: newModifiers });
  }, [layer.id, layer.modifiers, onUpdateLayer]);

  // --- Wiring Logic ---
  const handlePanelMouseMove = (e: React.MouseEvent) => {
    if (wireStart && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top + containerRef.current.scrollTop });
    }
  };

  const handlePanelMouseUp = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const ioType = target.getAttribute('data-io-type');
    const modId = target.getAttribute('data-mod-id');
    const portId = target.getAttribute('data-port-id');
    const dataType = target.getAttribute('data-data-type') as IoDataType;

    if (wireStart && ioType && modId && portId && dataType) {
      // Ensure connecting different modifiers and different types (in to out)
      // And ensure compatible data types
      if (wireStart.modId !== modId && wireStart.type !== ioType && wireStart.dataType === dataType) { 
        const fromModId = wireStart.type === 'out' ? wireStart.modId : modId;
        const fromPort = wireStart.type === 'out' ? wireStart.portId : portId;
        const toModId = wireStart.type === 'in' ? wireStart.modId : modId;
        const toPort = wireStart.type === 'in' ? wireStart.portId : portId;
        const newConn: Connection = { id: `conn-${Date.now()}`, fromModId, fromPort, toModId, toPort };
        if(onUpdateLayer) {
          const exists = (layer.connections || []).some(c => 
            c.fromModId === newConn.fromModId && 
            c.fromPort === newConn.fromPort && 
            c.toModId === newConn.toModId && 
            c.toPort === newConn.toPort
          );
          if (!exists) {
            onUpdateLayer(layer.id, { connections: [...(layer.connections || []), newConn] });
          } else {
            console.log("Connection already exists, skipping:", newConn);
          }
        }
      }
    }
    setWireStart(null);
  };

  const onIOClick = useCallback((e: React.MouseEvent, modId: string, type: 'in' | 'out', portId: string, dataType: IoDataType) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    
    // If clicking on an existing wire, remove it.
    if (e.altKey && layer.connections) { // Alt-click to remove
      const newConnections = layer.connections.filter(c => 
        !( (c.fromModId === modId && c.fromPort === portId) || (c.toModId === modId && c.toPort === portId) )
      );
      if (newConnections.length < (layer.connections || []).length && onUpdateLayer) {
        onUpdateLayer(layer.id, { connections: newConnections });
        setWireStart(null);
        return;
      }
    }

    const targetEl = e.currentTarget as HTMLElement;
    const rect = targetEl.getBoundingClientRect();
    const cRect = containerRef.current.getBoundingClientRect();

    const startPos = { 
      x: rect.left + rect.width / 2 - cRect.left, 
      y: rect.top + rect.height / 2 - cRect.top + containerRef.current.scrollTop 
    };
    setWireStart({ modId, type, portId, startPos, dataType });
  }, [layer.connections, onUpdateLayer]);

  const getWirePath = useCallback((fromModId: string, fromPort: string, toModId: string, toPort: string) => {
      if (!containerRef.current) return '';
      const cRect = containerRef.current.getBoundingClientRect();
      const fromEl = containerRef.current.querySelector(`[data-mod-id="${fromModId}"] [data-port-id="${fromPort}"][data-io-type="out"]`);
      const toEl = containerRef.current.querySelector(`[data-mod-id="${toModId}"] [data-port-id="${toPort}"][data-io-type="in"]`);
      if (!fromEl || !toEl) return '';

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const x1 = fRect.left + fRect.width / 2 - cRect.left;
      const y1 = fRect.top + fRect.height / 2 - cRect.top + scrollTop;
      const x2 = tRect.left + tRect.width / 2 - cRect.left;
      const y2 = tRect.top + tRect.height / 2 - cRect.top + scrollTop;
      
      const cp1x = x1 + Math.max(80, Math.abs(x2-x1)/2);
      const cp2x = x2 - Math.max(80, Math.abs(x2-x1)/2);
      return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
  }, []);

  const onDragStart = useCallback((e: React.DragEvent, index: number) => { 
    e.dataTransfer.setData("index", index.toString()); 
    e.dataTransfer.effectAllowed = "move"; 
    e.stopPropagation(); // Stop propagation to prevent panel drag
  }, []);
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData("index"));
      if (isNaN(dragIndex) || dragIndex === dropIndex) return;

      const newModifiers = [...layer.modifiers];
      const [item] = newModifiers.splice(dragIndex, 1);
      newModifiers.splice(dropIndex, 0, item);
      if(onUpdateLayer) onUpdateLayer(layer.id, { modifiers: newModifiers });
  }, [layer.id, layer.modifiers, onUpdateLayer]);

  const getPreviewFilter = useCallback(() => {
     let filters = [];
     for(const m of layer.modifiers) {
        if(!m.active) continue;
        const params = m.params;
        switch(m.type) {
          case ModifierType.GAUSSIAN_BLUR:
          case ModifierType.BLUR:
          case ModifierType.MOTION_BLUR:
          case ModifierType.RADIAL_BLUR:
          case ModifierType.TILT_SHIFT:
            filters.push(`blur(${ (params.radius || params.distance || params.amount || params.blur || 0) / 10}px)`); break;
          case ModifierType.BRIGHTNESS_CONTRAST:
            filters.push(`brightness(${1 + (params.brightness||0)/100}) contrast(${1 + (params.contrast||0)/100})`); break;
          case ModifierType.HUE_SATURATION:
            filters.push(`hue-rotate(${params.hue||0}deg) saturate(${1 + (params.sat||0)/100})`); break;
          case ModifierType.INVERT: filters.push('invert(1)'); break;
          case ModifierType.GLITCH: filters.push(`grayscale(${params.intensity/100})`); break; // Simple approx
          case ModifierType.CHROMATIC_ABERRATION: filters.push(`sepia(${Math.abs(params.shift||0)/5})`); break; // Simple approx
          case ModifierType.DROP_SHADOW: 
            filters.push(`drop-shadow(${params.distance/5}px ${params.distance/5}px ${params.blur/5}px ${params.color || 'rgba(0,0,0,0.5)'})`); break;
        }
     }
     return filters.join(' ');
  }, [layer.modifiers]);

  const allModifiers = useMemo(() => {
    return MODIFIER_CATALOG_RAW.map(item => {
      // Find the first instance of this modifier type to get its favorite/lastUsed status
      const currentModifierInstance = layer.modifiers.find(m => m.type === item.type);
      return {
        ...item,
        isFavorite: currentModifierInstance?.isFavorite || false,
        lastUsed: currentModifierInstance?.lastUsed || 0,
      };
    });
  }, [layer.modifiers]);

  const filteredCatalog = useMemo(() => {
    let result = allModifiers;

    if (selectedCategory) {
      result = result.filter(item => item.cat === selectedCategory);
    }
    if (showFavorites) {
      result = result.filter(item => item.isFavorite);
    }
    if (showRecent) {
      result = result.filter(item => item.lastUsed > 0).sort((a,b) => (b.lastUsed || 0) - (a.lastUsed || 0));
    }

    result = result.filter(c => 
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.cat.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return result;
  }, [searchQuery, selectedCategory, showFavorites, showRecent, allModifiers]);


  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePanelDragStart = (e: React.MouseEvent) => {
    if (isMobile) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('panel-handle') && !target.closest('.panel-handle')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y
    });
  };

  const handlePanelDragMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setPanelPosition({ x: newX, y: newY });
  };

  const handlePanelDragEnd = () => {
    if (isDragging && !isMobile) {
      setIsDragging(false);
      localStorage.setItem('nodePanelPos', JSON.stringify(panelPosition));
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPanelPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        localStorage.setItem('nodePanelPos', JSON.stringify(panelPosition));
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, panelPosition, isMobile]);

  return (
      <div 
          className={`bg-[#121214]/95 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col z-40 resizable-panel ${isMobile ? 'fixed inset-0 w-full h-full rounded-none' : 'absolute rounded-xl'}`}
          style={isMobile ? { width: '100%', height: '100%' } : { width: panelSize.width, height: panelSize.height, left: panelPosition.x, top: panelPosition.y }}
          onMouseUp={handlePanelMouseUp}
          onMouseMove={handlePanelMouseMove}
          onMouseLeave={handlePanelMouseUp}
      >
        <div 
          className={`panel-handle p-3 border-b border-white/5 bg-[#18181b] flex items-center justify-between shrink-0 cursor-grab ${isMobile ? '' : 'rounded-t-lg'}`}
          onMouseDown={handlePanelDragStart}
        >
          <div className="flex items-center gap-2"><Icons.Cpu size={14} className="text-mw-accent" /><span className="text-xs font-semibold text-gray-200">Node System</span></div>
          <div className="flex items-center gap-2">
            <button title="Toggle Preview" onClick={() => setIsPreviewOpen(!isPreviewOpen)} className={isPreviewOpen ? "text-white" : "text-gray-500"}><Icons.Eye size={12} /></button>
          </div>
        </div>
        {isPreviewOpen && <div className="h-32 bg-black/50 border-b border-white/5 flex items-center justify-center shrink-0"><div className="w-20 h-20 bg-white/10 rounded overflow-hidden" style={{ filter: getPreviewFilter(), transition: 'filter 0.2s' }}><div className="w-full h-full bg-gradient-to-br from-mw-accent to-mw-cyan flex items-center justify-center text-4xl">⚡️</div></div></div>}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-grid-white/[0.02] relative min-h-[100px]">
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {layer.connections?.map(conn => <path key={conn.id} d={getWirePath(conn.fromModId, conn.fromPort, conn.toModId, conn.toPort)} stroke="#8b5cf6" strokeWidth="2" fill="none" strokeOpacity="0.6" />)}
              {wireStart && <path d={`M ${wireStart.startPos.x} ${wireStart.startPos.y} C ${wireStart.startPos.x + 80} ${wireStart.startPos.y}, ${mousePos.x - 80} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`} stroke="#fff" strokeWidth="1" strokeDasharray="4 2" fill="none" />}
          </svg>
          {layer.modifiers.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2 mt-10"><Icons.Box size={24} className="opacity-20" /><span className="text-[10px]">No Modifiers</span></div> : <div className="relative z-10 space-y-3 pb-20">{layer.modifiers.map((mod, i) => <NodeWrapper key={mod.id} mod={mod} index={i} onDragStart={onDragStart} onDrop={onDrop} onDragOver={onDragOver} handleUpdateModifier={handleUpdateModifier} handleRemoveModifier={handleRemoveModifier} handleToggleActive={handleToggleActive} handleToggleFavorite={handleToggleFavorite} handleParamReset={handleParamReset} setRef={(el:any) => nodeRefs.current[mod.id] = el} onIOClick={onIOClick} isSelected={selectedLayerId === layer.id /* Pass isSelected */} />)}</div>}
        </div>
        <div className="p-2 border-t border-white/5 bg-[#18181b] relative shrink-0 rounded-b-lg">
          {!showAddMenu ? (
              <button onClick={() => setShowAddMenu(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-mw-accent/10 border border-mw-accent/20 text-mw-accent text-[10px] hover:bg-mw-accent/20 font-medium"><Icons.Plus size={12} /> Add Node</button>
          ) : (
             <div className="absolute bottom-0 left-0 w-full bg-[#18181b] border-t border-white/10 p-2 shadow-2xl h-[300px] flex flex-col z-50 rounded-b-lg">
                 <div className="flex items-center justify-between mb-2 px-1"><input type="text" placeholder="Search..." className="bg-transparent text-[10px] text-white outline-none w-full" autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} /><button onClick={() => setShowAddMenu(false)}><Icons.X size={12} className="text-gray-500" /></button></div>
                 <div className="flex flex-wrap gap-1 mb-2 px-1 border-b border-white/5 pb-2">
                    <button onClick={() => {setSelectedCategory(null); setShowFavorites(false); setShowRecent(false);}} className={`px-2 py-1 rounded-full text-[9px] ${!selectedCategory && !showFavorites && !showRecent ? 'bg-mw-accent text-white' : 'bg-white/10 text-gray-400'} hover:bg-mw-accent/50 transition-colors`}>All</button>
                    {MODIFIER_CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => {setSelectedCategory(cat); setShowFavorites(false); setShowRecent(false);}} className={`px-2 py-1 rounded-full text-[9px] ${selectedCategory === cat ? 'bg-mw-accent text-white' : 'bg-white/10 text-gray-400'} hover:bg-mw-accent/50 transition-colors`}>{cat}</button>
                    ))}
                    <button onClick={() => {setShowFavorites(!showFavorites); setSelectedCategory(null); setShowRecent(false);}} className={`px-2 py-1 rounded-full text-[9px] ${showFavorites ? 'bg-yellow-500/80 text-white' : 'bg-white/10 text-gray-400'} hover:bg-yellow-500/50 transition-colors`}><Icons.Star size={10} /></button>
                    <button onClick={() => {setShowRecent(!showRecent); setSelectedCategory(null); setShowFavorites(false);}} className={`px-2 py-1 rounded-full text-[9px] ${showRecent ? 'bg-mw-cyan/80 text-white' : 'bg-white/10 text-gray-400'} hover:bg-mw-cyan/50 transition-colors`}><Icons.History size={10} /></button>
                 </div>
                 <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-1 content-start scrollbar-hide">
                      {filteredCatalog.map(item => <button key={item.type} onClick={() => handleAddModifier(item.type)} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 text-left group"><item.icon size={12} className={`${item.color}`} /><span className="text-[10px] text-gray-300 truncate">{item.label}</span></button>)}
                 </div>
             </div>
          )}
        </div>
      </div>
  );
};

interface NodeWrapperProps {
  mod: Modifier;
  index: number; // Added index prop
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  handleUpdateModifier: (modId: string, paramKey: string, value: any) => void;
  handleRemoveModifier: (modId: string) => void;
  handleToggleActive: (modId: string) => void;
  handleToggleFavorite: (modId: string) => void;
  handleParamReset: (modId: string, paramKey: string, defaultValue: any) => void;
  setRef: (el: HTMLDivElement | null) => void;
  onIOClick: (e: React.MouseEvent, modId: string, type: 'in' | 'out', portId: string, dataType: IoDataType) => void;
  isSelected: boolean;
}

const NodeWrapper: React.FC<NodeWrapperProps> = ({ mod, index, onDragStart, onDrop, onDragOver, handleUpdateModifier, handleRemoveModifier, handleToggleActive, handleToggleFavorite, handleParamReset, setRef, onIOClick, isSelected }) => {
    const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const ioType = target.getAttribute('data-io-type');
        const modId = target.getAttribute('data-mod-id');
        const portId = target.getAttribute('data-port-id');
        const dataType = target.getAttribute('data-data-type') as IoDataType;

        // If clicking on an IO dot, start wiring
        if (ioType && modId && portId && dataType) {
            onIOClick(e, modId, ioType as 'in'|'out', portId, dataType);
            e.stopPropagation(); // Prevent drag start when wiring
        }
        // Otherwise, let the native drag handle it via draggable="true"
    }, [onIOClick]);


    const NodeComponent = NodeComponentMap[mod.type] || Nodes.GenericExtendedNode;
    
    const finalProps = { 
      ref: setRef, 
      modId: mod.id,
      name: mod.name,
      type: mod.type,
      active: mod.active,
      params: mod.params, 
      onChange: (k: string, v: any) => handleUpdateModifier(mod.id, k, v), 
      onRemove: () => handleRemoveModifier(mod.id),
      onToggleActive: () => handleToggleActive(mod.id),
      onToggleFavorite: () => handleToggleFavorite(mod.id),
      onParamReset: (paramKey: string, defaultValue: any) => handleParamReset(mod.id, paramKey, defaultValue),
      isSelected: isSelected,
      // Fix: Use draggable attribute and onDragStart for HTML5 DnD
      containerProps: { 
        onMouseDown: handleContainerMouseDown, 
        onDrop: (e:React.DragEvent) => onDrop(e, index), 
        onDragOver,
        draggable: true,
        onDragStart: (e: React.DragEvent) => onDragStart(e, index)
      }, 
      dragHandleProps: {} 
    };

    return <NodeComponent {...finalProps} />;
}