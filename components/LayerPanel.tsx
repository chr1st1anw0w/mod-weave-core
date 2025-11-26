import React, { useRef, useState, useCallback } from 'react';
import { Layer, Modifier, LayerType, ModifierType } from '../types';
import { Icons } from './Icons';
import { FileInput, FileInputHandle } from './ui/FileInput';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds?: string[];
  onSelectLayer: (id: string, multiSelect?: boolean, rangeSelect?: boolean) => void;
  onToggleVisibility?: (layerId: string) => void;
  onToggleLock?: (layerId: string) => void;
  onImportImage: (imageData: string) => void;
  onCreateGroup: () => void;
  onReorderLayers?: (fromIndex: number, toIndex: number) => void;
  onReorderModifiers?: (layerId: string, fromIndex: number, toIndex: number) => void;
  onAddModifierToLayer?: (layerId: string, modifierType: ModifierType) => void;
  onRemoveModifier?: (layerId: string, modifierId: string) => void;
  onToggleModifierActive?: (layerId: string, modifierId: string) => void;
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

export const LayerPanel: React.FC<LayerPanelProps> = ({ 
  layers, 
  selectedLayerId, 
  selectedLayerIds = [], 
  onSelectLayer, 
  onToggleVisibility, 
  onToggleLock, 
  onImportImage,
  onCreateGroup,
  onReorderLayers,
  onReorderModifiers,
  onAddModifierToLayer,
  onRemoveModifier,
  onToggleModifierActive,
  className 
}) => {
  const fileInputRef = useRef<FileInputHandle>(null);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [dragOverLayerIndex, setDragOverLayerIndex] = useState<number | null>(null);
  const [dragOverModIndex, setDragOverModIndex] = useState<{ layerId: string; index: number } | null>(null);
  const [soloModifier, setSoloModifier] = useState<{ layerId: string; modId: string } | null>(null);


  const isVisible = (layer: Layer) => layer.visible !== false; // Default to visible
  const isLocked = (layer: Layer) => layer.locked === true; // Default to unlocked
  const isSelected = (layer: Layer) => selectedLayerIds.includes(layer.id);
  const isExpanded = (layerId: string) => expandedLayers.has(layerId);

  const toggleExpanded = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  // Layer drag-and-drop handlers
  const handleLayerDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("layerIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleLayerDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayerIndex(index);
  }, []);

  const handleLayerDragLeave = useCallback(() => {
    setDragOverLayerIndex(null);
  }, []);

  const handleLayerDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("layerIndex"));
    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      onReorderLayers?.(dragIndex, dropIndex);
    }
    setDragOverLayerIndex(null);
  }, [onReorderLayers]);

  // Modifier drag-and-drop handlers
  const handleModifierDragStart = useCallback((e: React.DragEvent, layerId: string, modIndex: number) => {
    e.stopPropagation(); // Prevent layer drag
    e.dataTransfer.setData("modData", JSON.stringify({ layerId, modIndex }));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleModifierDragOver = useCallback((e: React.DragEvent, layerId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverModIndex({ layerId, index });
  }, []);

  const handleModifierDragLeave = useCallback(() => {
    setDragOverModIndex(null);
  }, []);

  const handleModifierDrop = useCallback((e: React.DragEvent, layerId: string, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const data = JSON.parse(e.dataTransfer.getData("modData"));
      if (data.layerId === layerId && data.modIndex !== dropIndex) {
        onReorderModifiers?.(layerId, data.modIndex, dropIndex);
      }
    } catch (err) {
      console.error("Failed to parse modifier drag data", err);
    }
    setDragOverModIndex(null);
  }, [onReorderModifiers]);


  return (
    <div className={`bg-mw-panel/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-float ${className || 'absolute top-20 left-6 w-64 max-h-[70vh]'}`} style={{ animationDuration: '8s' }}>
      <FileInput ref={fileInputRef} onFileSelect={onImportImage} />
      <div className="p-4 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Icons.Layers size={16} /> Layers & Modifiers
          {selectedLayerIds.length > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-mw-cyan/20 text-mw-cyan rounded-full">
              {selectedLayerIds.length}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.openFileDialog()} className="hover:bg-white/10 p-1 rounded transition-colors" title="Import Image">
            <Icons.ImagePlus size={14} className="text-gray-400" />
          </button>
          <button onClick={onCreateGroup} className="hover:bg-white/10 p-1 rounded transition-colors" title="Create New Group">
            <Icons.Folder size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {layers.map((layer, layerIndex) => (
          <div key={layer.id} className="group relative">
            {/* Drop zone indicator */}
            {dragOverLayerIndex === layerIndex && (
              <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-mw-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] rounded-full z-10" />
            )}

            {/* Layer Item */}
            <div
              draggable={!isLocked(layer)}
              onDragStart={(e) => !isLocked(layer) && handleLayerDragStart(e, layerIndex)}
              onDragOver={(e) => handleLayerDragOver(e, layerIndex)}
              onDragLeave={handleLayerDragLeave}
              onDrop={(e) => handleLayerDrop(e, layerIndex)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked(layer)) {
                  const multiSelect = e.metaKey || e.ctrlKey;
                  const rangeSelect = e.shiftKey;
                  onSelectLayer(layer.id, multiSelect, rangeSelect);
                }
              }}
              className={`
                flex items-center gap-2 px-2 py-2 rounded-lg transition-all border
                ${isLocked(layer) ? 'cursor-not-allowed opacity-60' : 'cursor-move'}
                ${!isVisible(layer) ? 'opacity-40' : ''}
                ${isSelected(layer)
                  ? selectedLayerId === layer.id
                    ? 'bg-mw-accent/20 border-mw-accent/50 text-white'
                    : 'bg-mw-cyan/10 border-mw-cyan/30 text-white'
                  : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'}
              `}
            >
              {/* Drag Handle */}
              {!isLocked(layer) && (
                <Icons.Move size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
              )}

              {/* Layer Type Icon */}
              {layer.type === LayerType.IMAGE && <Icons.Image size={14} />}
              {layer.type === LayerType.TEXT && <Icons.Type size={14} />}
              {layer.type === LayerType.SHAPE && <Icons.Box size={14} />}
              {layer.type === LayerType.GROUP && <Icons.Folder size={14} />}

              <span className="text-xs font-medium truncate flex-1">{layer.name}</span>

              {/* Modifier Count & Expand Toggle */}
              {layer.modifiers.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(layer.id);
                  }}
                  className="opacity-60 hover:opacity-100 hover:bg-white/10 p-1 rounded transition-all"
                  title={isExpanded(layer.id) ? "Collapse modifiers" : "Expand modifiers"}
                >
                  <Icons.ChevronDown 
                    size={12} 
                    className={`text-gray-400 transition-transform ${isExpanded(layer.id) ? '' : '-rotate-90'}`} 
                  />
                </button>
              )}

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
            </div>

            {/* Modifiers Section (Expandable) */}
            {isExpanded(layer.id) && layer.modifiers.length > 0 && (
              <div className="ml-4 pl-2 border-l border-white/10 mt-1 space-y-1 mb-2">
                {/* Add Modifier Button */}
                {onAddModifierToLayer && (
                  <button
                    onClick={() => {
                      // TODO: Show modifier catalog modal
                      console.log('Add modifier to layer:', layer.id);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-gray-500 hover:text-gray-300 bg-black/10 hover:bg-black/30 transition-colors border border-dashed border-white/10"
                  >
                    <Icons.Plus size={12} />
                    <span>Add Modifier</span>
                  </button>
                )}

                {/* Modifier Cards */}
                {layer.modifiers.map((mod, modIndex) => {
                  const isSolo = soloModifier?.layerId === layer.id && soloModifier?.modId === mod.id;
                  const isModActive = mod.active !== false;

                  return (
                    <div key={mod.id} className="relative">
                      {/* Drop zone indicator for modifiers */}
                      {dragOverModIndex?.layerId === layer.id && dragOverModIndex?.index === modIndex && (
                        <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-mw-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] rounded-full z-10" />
                      )}

                      <div
                        draggable
                        onDragStart={(e) => handleModifierDragStart(e, layer.id, modIndex)}
                        onDragOver={(e) => handleModifierDragOver(e, layer.id, modIndex)}
                        onDragLeave={handleModifierDragLeave}
                        onDrop={(e) => handleModifierDrop(e, layer.id, modIndex)}
                        className={`
                          flex items-center gap-2 px-2 py-1.5 rounded text-[11px] cursor-move transition-all
                          ${isSolo 
                            ? 'bg-purple-500/20 border border-purple-500/50 text-white' 
                            : isModActive 
                              ? 'bg-black/20 hover:bg-black/40 text-gray-300' 
                              : 'bg-black/10 opacity-60 text-gray-500'
                          }
                        `}
                      >
                        {/* Drag Handle */}
                        <Icons.Move size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />

                        {/* Modifier Icon */}
                        <ModifierIcon type={mod.type} />

                        {/* Modifier Name */}
                        <span className="flex-1 truncate">{mod.name}</span>

                        {/* Solo Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSoloModifier(prev => 
                              prev?.layerId === layer.id && prev?.modId === mod.id 
                                ? null 
                                : { layerId: layer.id, modId: mod.id }
                            );
                          }}
                          className={`w-4 h-4 flex items-center justify-center rounded text-[9px] font-bold transition-colors ${
                            isSolo 
                              ? 'bg-purple-500/30 text-purple-300' 
                              : 'text-gray-600 hover:bg-white/10 hover:text-gray-400'
                          }`}
                          title="Solo (isolate this modifier)"
                        >
                          S
                        </button>

                        {/* Active Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleModifierActive?.(layer.id, mod.id);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                          title={isModActive ? 'Bypass modifier' : 'Enable modifier'}
                        >
                          {isModActive ? (
                            <Icons.Eye size={10} className="text-green-400" />
                          ) : (
                            <Icons.EyeOff size={10} className="text-gray-600" />
                          )}
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveModifier?.(layer.id, mod.id);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded text-gray-600 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Remove modifier"
                        >
                          <Icons.X size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};