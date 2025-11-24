import React from 'react';
import { Layer, Modifier, LayerType, ModifierType } from '../types';
import { Icons } from './Icons';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
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

export const LayerPanel: React.FC<LayerPanelProps> = ({ layers, selectedLayerId, onSelectLayer, className }) => {
  return (
    <div className={`bg-mw-panel/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-float ${className || 'absolute top-20 left-6 w-64 max-h-[70vh]'}`} style={{ animationDuration: '8s' }}>
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Icons.Layers size={16} /> Layers & Modifiers
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
              onClick={(e) => { e.stopPropagation(); onSelectLayer(layer.id); }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border
                ${selectedLayerId === layer.id 
                  ? 'bg-mw-accent/20 border-mw-accent/50 text-white' 
                  : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'}
              `}
            >
              {layer.type === LayerType.IMAGE && <Icons.Image size={14} />}
              {layer.type === LayerType.TEXT && <Icons.Type size={14} />}
              {layer.type === LayerType.SHAPE && <Icons.Box size={14} />}
              
              <span className="text-xs font-medium truncate flex-1">{layer.name}</span>
              
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