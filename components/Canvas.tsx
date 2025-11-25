import React from 'react';
import { Layer, LayerType, ModifierType } from '../types';

interface CanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onEnterEditMode?: (layerId: string) => void;
}

/**
 * Generates a dynamic CSS style object based on a layer's active modifiers.
 * This function translates modifier parameters into CSS filter properties for real-time preview.
 * @param layer The layer to generate style for.
 * @returns A React.CSSProperties object with the generated filter styles.
 */
const getDynamicLayerStyle = (layer: Layer): React.CSSProperties => {
    const filters: string[] = [];
    
    if (layer.modifiers && layer.modifiers.length > 0) {
        for (const mod of layer.modifiers) {
            if (!mod.active) continue;
            
            const params = mod.params;
            
            switch (mod.type) {
                case ModifierType.GAUSSIAN_BLUR:
                case ModifierType.BLUR:
                case ModifierType.MOTION_BLUR:
                case ModifierType.RADIAL_BLUR:
                    filters.push(`blur(${params.radius || params.distance || params.amount || 0}px)`);
                    break;
                
                case ModifierType.BRIGHTNESS_CONTRAST:
                    if (params.brightness) filters.push(`brightness(${1 + (params.brightness || 0) / 100})`);
                    if (params.contrast) filters.push(`contrast(${1 + (params.contrast || 0) / 100})`);
                    break;

                case ModifierType.HUE_SATURATION:
                    if (params.hue) filters.push(`hue-rotate(${params.hue || 0}deg)`);
                    if (params.sat) filters.push(`saturate(${1 + (params.sat || 0) / 100})`);
                    break;
                
                case ModifierType.INVERT:
                    filters.push('invert(1)');
                    break;

                case ModifierType.DROP_SHADOW:
                    const distance = params.distance || 0;
                    const blur = params.blur || 0;
                    const color = params.color || 'rgba(0,0,0,0.5)';
                    // Simple diagonal drop-shadow for real-time preview
                    filters.push(`drop-shadow(${distance * 0.7}px ${distance * 0.7}px ${blur}px ${color})`);
                    break;
            }
        }
    }
    
    if (filters.length > 0) {
        return { filter: filters.join(' ') };
    }
    
    return {};
};


export const Canvas: React.FC<CanvasProps> = ({ layers, selectedLayerId, onSelectLayer, onEnterEditMode }) => {
  return (
    <div 
      className="w-full h-full relative overflow-hidden cursor-default grid-bg"
      onClick={() => onSelectLayer(null)}
    >
      {/* Mocking a center point */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 border border-white/5 rounded-full opacity-20 pointer-events-none" />

      {layers.map(layer => {
        const dynamicStyle = getDynamicLayerStyle(layer);

        return (
          <div
            key={layer.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectLayer(layer.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (onEnterEditMode) {
                onEnterEditMode(layer.id);
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
              ${selectedLayerId === layer.id ? 'z-10' : 'z-0'}
            `}
          >
            {/* Visual Content */}
            <div className={`
              w-full h-full relative overflow-hidden
              ${selectedLayerId === layer.id ? 'ring-2 ring-mw-accent shadow-[0_0_25px_rgba(139,92,246,0.5)]' : ''}
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
            {selectedLayerId === layer.id && (
              <>
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border border-mw-accent rounded-full cursor-nwse-resize" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-mw-accent rounded-full cursor-nesw-resize" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border border-mw-accent rounded-full cursor-nesw-resize" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border border-mw-accent rounded-full cursor-nwse-resize" />
              </>
            )}
          </div>
        )
      })}
    </div>
  );
};
