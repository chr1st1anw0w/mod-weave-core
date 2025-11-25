import React, { useState, useRef, useEffect } from 'react';
import { Layer, LayerType, ModifierType } from '../types';

interface CanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds?: string[];
  onSelectLayer: (id: string | null, multiSelect?: boolean, rangeSelect?: boolean) => void;
  onUpdateLayer?: (layerId: string, updates: Partial<Layer>) => void;
}

/**
 * Generates a dynamic CSS style object based on a layer's active modifiers.
 * This function translates modifier parameters into CSS filter properties for real-time preview.
 * @param layer The layer to generate style for.
 * @returns A React.CSSProperties object with the generated filter styles.
 */
const getDynamicLayerStyle = (layer: Layer): React.CSSProperties => {
    const filters: string[] = [];
    const style: React.CSSProperties = {};

    if (layer.modifiers && layer.modifiers.length > 0) {
        for (const mod of layer.modifiers) {
            if (!mod.active) continue;

            const params = mod.params;

            switch (mod.type) {
                // ===== BLUR EFFECTS =====
                case ModifierType.GAUSSIAN_BLUR:
                case ModifierType.BLUR:
                    filters.push(`blur(${params.radius || 0}px)`);
                    break;

                case ModifierType.MOTION_BLUR:
                    // Approximate with blur + transform
                    filters.push(`blur(${params.distance ? params.distance / 2 : 0}px)`);
                    break;

                case ModifierType.RADIAL_BLUR:
                    filters.push(`blur(${params.amount || 0}px)`);
                    break;

                case ModifierType.TILT_SHIFT:
                    filters.push(`blur(${params.blur || 0}px)`);
                    break;

                // ===== COLOR ADJUSTMENTS =====
                case ModifierType.BRIGHTNESS_CONTRAST:
                    if (params.brightness !== undefined) filters.push(`brightness(${1 + (params.brightness || 0) / 100})`);
                    if (params.contrast !== undefined) filters.push(`contrast(${1 + (params.contrast || 0) / 100})`);
                    break;

                case ModifierType.HUE_SATURATION:
                    if (params.hue !== undefined) filters.push(`hue-rotate(${params.hue || 0}deg)`);
                    if (params.sat !== undefined) filters.push(`saturate(${1 + (params.sat || 0) / 100})`);
                    break;

                case ModifierType.INVERT:
                    filters.push('invert(1)');
                    break;

                case ModifierType.THRESHOLD:
                    // Approximate with high contrast + brightness
                    const threshLevel = (params.level || 128) / 255;
                    filters.push(`contrast(10) brightness(${threshLevel})`);
                    break;

                case ModifierType.POSTERIZE:
                    // Approximate with contrast
                    const levels = params.levels || 4;
                    filters.push(`contrast(${levels * 0.5})`);
                    break;

                case ModifierType.GRADIENT_MAP:
                    // CSS cannot do gradient map, use subtle hue shift
                    filters.push('hue-rotate(0deg)');
                    break;

                case ModifierType.COLOR_OVERLAY:
                    const overlayOpacity = (params.opacity || 50) / 100;
                    // Use mix-blend-mode for color overlay approximation
                    style.mixBlendMode = 'overlay';
                    style.opacity = overlayOpacity;
                    break;

                // ===== SHADOWS & LIGHTING =====
                case ModifierType.DROP_SHADOW:
                    const distance = params.distance || 0;
                    const blur = params.blur || 0;
                    const color = params.color || 'rgba(0,0,0,0.5)';
                    filters.push(`drop-shadow(${distance * 0.7}px ${distance * 0.7}px ${blur}px ${color})`);
                    break;

                case ModifierType.INNER_SHADOW:
                    // CSS cannot do inner shadow via filters, skip or approximate
                    filters.push(`brightness(0.9)`);
                    break;

                case ModifierType.VIGNETTE:
                    // Approximate with brightness reduction (not perfect)
                    const vigAmount = (params.amount || 50) / 200;
                    filters.push(`brightness(${1 - vigAmount})`);
                    break;

                case ModifierType.BLOOM:
                    const bloomInt = params.intensity || 1;
                    filters.push(`brightness(${1 + bloomInt * 0.3}) saturate(${1 + bloomInt * 0.2})`);
                    break;

                case ModifierType.LENS_FLARE:
                    const flareBright = (params.brightness || 100) / 100;
                    filters.push(`brightness(${flareBright}) saturate(1.3)`);
                    break;

                // ===== EFFECTS =====
                case ModifierType.GLITCH:
                    const glitchInt = (params.intensity || 50) / 100;
                    filters.push(`hue-rotate(${glitchInt * 180}deg) saturate(${1 + glitchInt})`);
                    break;

                case ModifierType.CHROMATIC_ABERRATION:
                    const shift = Math.abs(params.shift || 0);
                    filters.push(`hue-rotate(${shift * 5}deg)`);
                    break;

                case ModifierType.NOISE:
                    const noiseAmt = (params.amount || 10) / 100;
                    filters.push(`contrast(${1 + noiseAmt * 0.2}) brightness(${1 - noiseAmt * 0.1})`);
                    break;

                case ModifierType.SHARPEN:
                    const sharpenAmt = (params.amount || 50) / 100;
                    filters.push(`contrast(${1 + sharpenAmt * 0.3})`);
                    break;

                // ===== STYLIZE =====
                case ModifierType.PIXELATE:
                    // CSS cannot do true pixelation, use small scale approximation
                    const pixelSize = params.size || 10;
                    style.imageRendering = pixelSize > 5 ? 'pixelated' : 'auto';
                    break;

                case ModifierType.HALFTONE_LUMA:
                    // Approximate with contrast + desaturation
                    filters.push('grayscale(0.5) contrast(1.3)');
                    break;

                case ModifierType.PEN_STROKES:
                    // Approximate artistic style
                    filters.push('contrast(1.2) saturate(1.1)');
                    break;

                case ModifierType.EMBOSS:
                    // CSS cannot do true emboss, use grayscale + contrast
                    const embossHeight = (params.height || 5) / 10;
                    filters.push(`grayscale(1) contrast(${1 + embossHeight})`);
                    break;

                case ModifierType.BEVEL_EMBOSS:
                    // Approximate with brightness + contrast
                    filters.push('brightness(1.1) contrast(1.2)');
                    break;

                case ModifierType.DITHER:
                    // Approximate with posterize effect
                    filters.push('contrast(1.5)');
                    break;

                // ===== DISTORTION (Limited CSS support) =====
                case ModifierType.WAVE:
                    // CSS cannot do wave distortion, skip
                    break;

                case ModifierType.LIQUIFY:
                    // CSS cannot do liquify, skip
                    break;

                case ModifierType.DISPLACEMENT_MAP:
                    // CSS cannot do displacement, skip
                    break;

                case ModifierType.REFRACTION:
                    // Approximate with blur
                    const refrInt = params.intensity || 1;
                    filters.push(`blur(${refrInt * 2}px)`);
                    break;

                case ModifierType.PERTURB:
                    // Approximate with blur
                    const perturbAmp = (params.amplitude || 10) / 5;
                    filters.push(`blur(${perturbAmp}px)`);
                    break;

                case ModifierType.KALEIDOSCOPE:
                    // CSS cannot do kaleidoscope, use hue rotation
                    filters.push('hue-rotate(45deg) saturate(1.3)');
                    break;

                // ===== TRANSFORM =====
                case ModifierType.STRETCH:
                    const hStretch = (params.hStretch || 100) / 100;
                    const vStretch = (params.vStretch || 100) / 100;
                    style.transform = `scaleX(${hStretch}) scaleY(${vStretch})`;
                    break;

                case ModifierType.EXTRUDE:
                    // 3D extrude approximation with shadow
                    const depth = params.depth || 20;
                    filters.push(`drop-shadow(${depth * 0.3}px ${depth * 0.3}px ${depth * 0.5}px rgba(0,0,0,0.5))`);
                    break;

                // ===== REPEATER & PATTERNS (Cannot preview in CSS) =====
                case ModifierType.REPEATER:
                case ModifierType.PARALLAX:
                case ModifierType.OUTLINE:
                    // These require actual rendering, skip preview
                    break;

                // ===== PHYSICS & ANIMATION (Cannot preview statically) =====
                case ModifierType.PARTICLE_DISSOLVE:
                case ModifierType.SPRING:
                    // Physics-based, skip preview
                    break;

                // ===== AI EFFECTS (Require backend processing) =====
                case ModifierType.AI_FILL:
                case ModifierType.AI_GENERATION:
                case ModifierType.REMOVE_BACKGROUND:
                case ModifierType.SPLIT_TO_LAYERS:
                    // AI-powered, skip preview
                    break;

                default:
                    // Unknown modifier, no preview
                    break;
            }
        }
    }

    if (filters.length > 0) {
        style.filter = filters.join(' ');
    }

    return style;
};


type TransformMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'rotate' | null;
type TouchMode = 'none' | 'drag' | 'pinch' | 'rotate' | 'pan' | null;

export const Canvas: React.FC<CanvasProps> = ({ layers, selectedLayerId, selectedLayerIds = [], onSelectLayer, onUpdateLayer }) => {
  const [transformMode, setTransformMode] = useState<TransformMode>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialLayer, setInitialLayer] = useState<Layer | null>(null);

  // Touch-specific state
  const [touchMode, setTouchMode] = useState<TouchMode>('none');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number>(0);
  const [initialPinchAngle, setInitialPinchAngle] = useState<number>(0);
  const [initialScale, setInitialScale] = useState<number>(1);
  const [initialRotation, setInitialRotation] = useState<number>(0);
  const [isTouchDevice] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  // Helper functions for touch gestures
  const getTouchDistance = (touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchAngle = (touches: TouchList): number => {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent, layerId?: string) => {
    const touches = e.touches;

    if (touches.length === 1) {
      // Single finger: select or drag layer
      setTouchMode('drag');
      setTouchStart({ x: touches[0].clientX, y: touches[0].clientY });

      if (layerId) {
        const layer = layers.find(l => l.id === layerId);
        if (layer && !layer.locked) {
          setInitialLayer({ ...layer });
        }
      }
    } else if (touches.length === 2 && layerId && selectedLayerIds.includes(layerId)) {
      // Two fingers on selected layer: pinch/rotate
      e.preventDefault();
      const layer = layers.find(l => l.id === layerId);
      if (layer && !layer.locked) {
        setTouchMode('pinch');
        setInitialPinchDistance(getTouchDistance(touches));
        setInitialPinchAngle(getTouchAngle(touches));
        setInitialLayer({ ...layer });
        setInitialScale(1);
        setInitialRotation(layer.rotation);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchMode || touchMode === 'none') return;

    const touches = e.touches;

    if (touchMode === 'drag' && touches.length === 1 && touchStart && initialLayer && onUpdateLayer) {
      // Single finger drag
      e.preventDefault();
      const dx = touches[0].clientX - touchStart.x;
      const dy = touches[0].clientY - touchStart.y;

      // Apply to all selected layers
      selectedLayerIds.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId);
        if (layer && !layer.locked) {
          const offsetX = layer.id === initialLayer.id ? 0 : layer.x - initialLayer.x;
          const offsetY = layer.id === initialLayer.id ? 0 : layer.y - initialLayer.y;
          onUpdateLayer(layerId, {
            x: initialLayer.x + dx + offsetX,
            y: initialLayer.y + dy + offsetY
          });
        }
      });
    } else if (touchMode === 'pinch' && touches.length === 2 && initialLayer && onUpdateLayer) {
      // Two finger pinch/rotate
      e.preventDefault();
      const currentDistance = getTouchDistance(touches);
      const currentAngle = getTouchAngle(touches);

      // Calculate scale change
      const scaleChange = currentDistance / initialPinchDistance;
      const newWidth = Math.max(50, initialLayer.width * scaleChange);
      const newHeight = Math.max(50, initialLayer.height * scaleChange);

      // Calculate rotation change
      const angleDelta = currentAngle - initialPinchAngle;
      const newRotation = (initialRotation + angleDelta) % 360;

      onUpdateLayer(initialLayer.id, {
        width: newWidth,
        height: newHeight,
        rotation: newRotation
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchMode('none');
    setTouchStart(null);
    setInitialLayer(null);
    setInitialPinchDistance(0);
    setInitialPinchAngle(0);
  };

  const handleTransformStart = (e: React.MouseEvent, layerId: string, mode: TransformMode) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.locked) return;

    setTransformMode(mode);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayer({ ...layer });
  };

  const handleTransformMove = (e: React.MouseEvent) => {
    if (!transformMode || !dragStart || !initialLayer || !onUpdateLayer) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (transformMode === 'move') {
      // Move layer(s)
      const updates = { x: initialLayer.x + dx, y: initialLayer.y + dy };

      // Apply to all selected layers
      selectedLayerIds.forEach(layerId => {
        const layer = layers.find(l => l.id === layerId);
        if (layer && !layer.locked) {
          const offsetX = layer.id === initialLayer.id ? 0 : layer.x - initialLayer.x;
          const offsetY = layer.id === initialLayer.id ? 0 : layer.y - initialLayer.y;
          onUpdateLayer(layerId, {
            x: initialLayer.x + dx + offsetX,
            y: initialLayer.y + dy + offsetY
          });
        }
      });
    } else if (transformMode?.startsWith('resize-')) {
      // Resize layer
      const corner = transformMode.split('-')[1] as 'nw' | 'ne' | 'sw' | 'se';
      let newWidth = initialLayer.width;
      let newHeight = initialLayer.height;
      let newX = initialLayer.x;
      let newY = initialLayer.y;

      if (corner === 'se') {
        newWidth = Math.max(50, initialLayer.width + dx);
        newHeight = Math.max(50, initialLayer.height + dy);
      } else if (corner === 'nw') {
        newWidth = Math.max(50, initialLayer.width - dx);
        newHeight = Math.max(50, initialLayer.height - dy);
        newX = initialLayer.x + dx;
        newY = initialLayer.y + dy;
      } else if (corner === 'ne') {
        newWidth = Math.max(50, initialLayer.width + dx);
        newHeight = Math.max(50, initialLayer.height - dy);
        newY = initialLayer.y + dy;
      } else if (corner === 'sw') {
        newWidth = Math.max(50, initialLayer.width - dx);
        newHeight = Math.max(50, initialLayer.height + dy);
        newX = initialLayer.x + dx;
      }

      onUpdateLayer(initialLayer.id, { width: newWidth, height: newHeight, x: newX, y: newY });
    } else if (transformMode === 'rotate') {
      // Rotate layer
      const centerX = initialLayer.x + initialLayer.width / 2;
      const centerY = initialLayer.y + initialLayer.height / 2;

      const angle1 = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
      const angle2 = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const deltaAngle = (angle2 - angle1) * (180 / Math.PI);

      onUpdateLayer(initialLayer.id, { rotation: (initialLayer.rotation + deltaAngle) % 360 });
    }
  };

  const handleTransformEnd = () => {
    setTransformMode(null);
    setDragStart(null);
    setInitialLayer(null);
  };

  useEffect(() => {
    if (transformMode) {
      const handleMouseUp = () => handleTransformEnd();
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [transformMode]);

  return (
    <div
      className="w-full h-full relative overflow-hidden cursor-default grid-bg touch-none"
      onClick={() => onSelectLayer(null, false, false)}
      onMouseMove={handleTransformMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mocking a center point */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 border border-white/5 rounded-full opacity-20 pointer-events-none" />

      {layers.filter(layer => layer.visible !== false).map(layer => {
        const dynamicStyle = getDynamicLayerStyle(layer);

        return (
          <div
            key={layer.id}
            onClick={(e) => {
              e.stopPropagation();
              if (!layer.locked && !transformMode && !touchMode) {
                const multiSelect = e.metaKey || e.ctrlKey;
                const rangeSelect = e.shiftKey;
                onSelectLayer(layer.id, multiSelect, rangeSelect);
              }
            }}
            onMouseDown={(e) => {
              if (selectedLayerIds.includes(layer.id) && !layer.locked) {
                handleTransformStart(e, layer.id, 'move');
              }
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              if (!layer.locked) {
                onSelectLayer(layer.id, false, false);
                handleTouchStart(e, layer.id);
              }
            }}
            style={{
              transform: `translate(${layer.x}px, ${layer.y}px) rotate(${layer.rotation}deg)`,
              width: layer.width,
              height: layer.height,
              opacity: layer.opacity,
              ...layer.style,
              ...dynamicStyle // Apply real-time modifier effects
            }}
            className={`
              absolute transition-all duration-100 group
              ${selectedLayerIds.includes(layer.id) ? 'z-10' : 'z-0'}
              ${layer.locked ? 'cursor-not-allowed opacity-70' : selectedLayerIds.includes(layer.id) ? 'cursor-move' : 'cursor-pointer'}
            `}
          >
            {/* Visual Content */}
            <div className={`
              w-full h-full relative overflow-hidden
              ${selectedLayerIds.includes(layer.id)
                ? selectedLayerId === layer.id
                  ? 'ring-2 ring-mw-accent shadow-[0_0_25px_rgba(139,92,246,0.5)]'  // Primary selection
                  : 'ring-2 ring-mw-cyan/60 shadow-[0_0_15px_rgba(34,211,238,0.3)]'  // Secondary selection
                : ''}
            `}>
              {layer.type === LayerType.IMAGE && (
                <img src={layer.content} alt={layer.name} className="w-full h-full object-cover pointer-events-none" />
              )}
              
              {layer.type === LayerType.TEXT && (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl whitespace-nowrap p-4">
                  {layer.content}
                </div>
              )}
              
              {layer.type === LayerType.SHAPE && (
                <div className="w-full h-full" />
              )}

              {/* Modifier Indicators (Visual Only) */}
              {layer.modifiers.some(m => m.active) && (
                <div className="absolute bottom-2 right-2 flex gap-1 bg-black/30 backdrop-blur-sm p-1 rounded-full border border-white/10">
                  {layer.modifiers.filter(m=>m.active).slice(0, 3).map(m => (
                    <div key={m.id} className="w-1.5 h-1.5 rounded-full bg-mw-cyan" title={m.name} />
                  ))}
                </div>
              )}
            </div>

            {/* Context Toolbar (Floating above selected object) */}
            {selectedLayerId === layer.id && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-3 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                <button className="flex items-center gap-1.5 text-xs font-medium text-mw-accent hover:text-white transition-colors">
                   <span className="text-lg">🧠</span>
                   AI Edit
                </button>
                <div className="w-px h-3 bg-white/20" />
                <div className="text-[10px] text-gray-400">Opacity: {Math.round(layer.opacity * 100)}%</div>
                <div className="w-px h-3 bg-white/20" />
                <div className="text-[10px] text-gray-400">Blend: Normal</div>
              </div>
            )}
            
            {/* Selection Handles */}
            {selectedLayerIds.includes(layer.id) && selectedLayerId === layer.id && (
              <>
                {isTouchDevice ? (
                  /* Mobile Touch-Optimized Handles */
                  <>
                    {/* Top-Left: Resize */}
                    <div
                      className="absolute -top-5 -left-5 w-11 h-11 bg-mw-accent/80 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleTransformStart(e as any, layer.id, 'resize-nw');
                      }}
                    >
                      <Icons.Maximize2 size={20} className="text-white" />
                    </div>

                    {/* Bottom-Right: Rotate */}
                    <div
                      className="absolute -bottom-6 -right-6 w-12 h-12 bg-mw-cyan/80 rounded-full backdrop-blur-sm border-2 border-white/40 shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        // For touch, we'll use pinch gesture for rotation
                      }}
                    >
                      <Icons.RotateCw size={24} className="text-white" />
                    </div>

                    {/* Touch hint overlay */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] text-white/70 whitespace-nowrap pointer-events-none animate-pulse">
                      Two fingers to resize/rotate
                    </div>
                  </>
                ) : (
                  /* Desktop Mouse-Optimized Handles */
                  <>
                    {/* Corner Resize Handles */}
                    <div
                      className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full cursor-nwse-resize border border-mw-accent"
                      onMouseDown={(e) => handleTransformStart(e, layer.id, 'resize-nw')}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full cursor-nesw-resize border border-mw-accent"
                      onMouseDown={(e) => handleTransformStart(e, layer.id, 'resize-ne')}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-full cursor-nesw-resize border border-mw-accent"
                      onMouseDown={(e) => handleTransformStart(e, layer.id, 'resize-sw')}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white rounded-full cursor-nwse-resize border border-mw-accent"
                      onMouseDown={(e) => handleTransformStart(e, layer.id, 'resize-se')}
                    />
                    {/* Rotation Handle */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 bg-mw-accent rounded-full cursor-grab active:cursor-grabbing border border-white shadow-lg"
                      onMouseDown={(e) => handleTransformStart(e, layer.id, 'rotate')}
                      title="Rotate"
                    />
                    {/* Rotation Handle Connector Line */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-7 bg-mw-accent/50 pointer-events-none" />
                  </>
                )}
              </>
            )}
            {/* Secondary Selection Indicators (no handles) */}
            {selectedLayerIds.includes(layer.id) && selectedLayerId !== layer.id && (
              <>
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-mw-cyan/60" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-mw-cyan/60" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-mw-cyan/60" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-mw-cyan/60" />
              </>
            )}
          </div>
        )
      })}
    </div>
  );
};
