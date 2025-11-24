import React from 'react';
import { Layer, Modifier, LayerType, ModifierType } from '../types';
import { Icons } from './Icons';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds?: string[];
  onSelectLayer: (id: string, multiSelect?: boolean, rangeSelect?: boolean) => void;
  onToggleVisibility?: (layerId: string) => void;
  onToggleLock?: (layerId: string) => void;
  className?: string; // Added for mobile override
}

const ModifierIcon = ({ type }: { type: ModifierType }) => {
  switch (type) {
    case ModifierType.AI_GENERATION: return <Icons.Cpu className="w-3 h-3 text-mw-accent" />;
    case ModifierType.LIQUID_MOTION: return <Icons.Waves className="w-3 h-3 text-cyan-400" />;
    case ModifierType.GLITCH: return <Icons.Activity className="w-3 h-3 text-rose-400" />;
    default: return <Icons.Sparkles className="w-3 h-3 text-yellow-400" />;
  }
};

export const LayerPanel: React.FC<LayerPanelProps> = ({ layers, selectedLayerId, selectedLayerIds = [], onSelectLayer, onToggleVisibility, onToggleLock, className }) => {
  const isVisible = (layer: Layer) => layer.visible !== false; // Default to visible
  const isLocked = (layer: Layer) => layer.locked === true; // Default to unlocked
  const isSelected = (layer: Layer) => selectedLayerIds.includes(layer.id);

  return (
    <div className={`bg-mw-panel/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-float ${className || 'absolute top-20 left-6 w-64 max-h-[70vh]'}`} style={{ animationDuration: '8s' }}>
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Icons.Layers size={16} /> Layers & Modifiers
          {selectedLayerIds.length > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-mw-cyan/20 text-mw-cyan rounded-full">
              {selectedLayerIds.length}
            </span>
          )}
        </h2>
        <button className="hover:bg-white/10 p-1 rounded transition-colors">
          <Icons.Plus size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {layers.map(layer => (
          <div key={layer.id} className="group">
            {/* Layer Item */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked(layer)) {
                  const multiSelect = e.metaKey || e.ctrlKey;
                  const rangeSelect = e.shiftKey;
                  onSelectLayer(layer.id, multiSelect, rangeSelect);
                }
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all border
                ${isLocked(layer) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                ${!isVisible(layer) ? 'opacity-40' : ''}
                ${isSelected(layer)
                  ? selectedLayerId === layer.id
                    ? 'bg-mw-accent/20 border-mw-accent/50 text-white'  // Primary selection
                    : 'bg-mw-cyan/10 border-mw-cyan/30 text-white'      // Secondary selection
                  : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'}
              `}
            >
              {layer.type === LayerType.IMAGE && <Icons.Image size={14} />}
              {layer.type === LayerType.TEXT && <Icons.Type size={14} />}
              {layer.type === LayerType.SHAPE && <Icons.Box size={14} />}

              <span className="text-xs font-medium truncate flex-1">{layer.name}</span>

              {/* Visibility Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility?.(layer.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 p-1 rounded transition-all"
                title={isVisible(layer) ? 'Hide layer' : 'Show layer'}
              >
                {isVisible(layer) ? (
                  <Icons.Eye size={12} className="text-gray-400 hover:text-white" />
                ) : (
                  <Icons.EyeOff size={12} className="text-gray-600" />
                )}
              </button>

              {/* Lock Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLock?.(layer.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 p-1 rounded transition-all"
                title={isLocked(layer) ? 'Unlock layer' : 'Lock layer'}
              >
                {isLocked(layer) ? (
                  <Icons.Lock size={12} className="text-amber-500" />
                ) : (
                  <Icons.Unlock size={12} className="text-gray-400 hover:text-white" />
                )}
              </button>

              {selectedLayerId === layer.id && (
                <Icons.More size={12} className="opacity-50" />
              )}
            </div>

            {/* Modifiers Stack (Indented) */}
            {layer.modifiers.length > 0 && (
              <div className="ml-4 pl-2 border-l border-white/10 mt-1 space-y-1 mb-2">
                {layer.modifiers.map(mod => (
                  <div key={mod.id} className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-gray-500 bg-black/20 hover:bg-black/40 cursor-pointer">
                    <ModifierIcon type={mod.type} />
                    <span>{mod.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};