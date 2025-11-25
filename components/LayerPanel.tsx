import React, { useRef } from 'react';
import { Layer, Modifier, LayerType, ModifierType } from '../types';
import { Icons } from './Icons';
import { FileInput, FileInputHandle } from './ui/FileInput';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onCreateGroup: () => void;
  onMoveLayer: (draggedId: string, targetId: string | null) => void;
  onImportImage: (imageData: string) => void;
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

const LayerItem: React.FC<{
  layer: Layer;
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onMoveLayer: (draggedId: string, targetId: string | null) => void;
  level?: number;
}> = ({ layer, selectedLayerId, onSelectLayer, onMoveLayer, level = 0 }) => {
  const isGroup = layer.type === LayerType.GROUP;
  const isSelected = selectedLayerId === layer.id;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('layerId', layer.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('layerId');
    if (draggedId && draggedId !== layer.id) {
      onMoveLayer(draggedId, layer.id);
    }
  };

  return (
    <div
      className="group"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onSelectLayer(layer.id); }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
          isSelected
            ? 'bg-mw-accent/20 border-mw-accent/50 text-white'
            : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {isGroup && <Icons.Folder size={14} className={isSelected ? 'text-mw-accent' : ''} />}
        {layer.type === LayerType.IMAGE && <Icons.Image size={14} />}
        {layer.type === LayerType.TEXT && <Icons.Type size={14} />}
        {layer.type === LayerType.SHAPE && <Icons.Box size={14} />}

        <span className="text-xs font-medium truncate flex-1">{layer.name}</span>

        {isSelected && <Icons.More size={12} className="opacity-50" />}
      </div>

      {isGroup && layer.children && (
        <div className="mt-1 space-y-1">
          {layer.children.map(child => (
            <LayerItem key={child.id} layer={child} selectedLayerId={selectedLayerId} onSelectLayer={onSelectLayer} onMoveLayer={onMoveLayer} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};


export const LayerPanel: React.FC<LayerPanelProps> = ({ layers, selectedLayerId, onSelectLayer, onCreateGroup, onMoveLayer, onImportImage, className }) => {
  const fileInputRef = useRef<FileInputHandle>(null);

  return (
    <div className={`bg-mw-panel/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-float ${className || 'absolute top-20 left-6 w-64 max-h-[70vh]'}`} style={{ animationDuration: '8s' }}>
      <FileInput ref={fileInputRef} onFileSelect={onImportImage} />
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Icons.Layers size={16} /> Layers
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.openFileDialog()} className="hover:bg-white/10 p-1 rounded transition-colors" title="Import Image">
            <Icons.ImagePlus size={14} className="text-gray-400" />
          </button>
          <button onClick={onCreateGroup} className="hover:bg-white/10 p-1 rounded transition-colors" title="Create New Group">
            <Icons.FolderPlus size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {layers.filter(l => !l.parentId).map(layer => (
           <LayerItem key={layer.id} layer={layer} selectedLayerId={selectedLayerId} onSelectLayer={onSelectLayer} onMoveLayer={onMoveLayer} />
        ))}
      </div>
    </div>
  );
};