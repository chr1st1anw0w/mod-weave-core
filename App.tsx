import React, { useState, useEffect, useCallback } from "react";
import { LayerPanel } from "./components/LayerPanel";
import { ChatPanel } from "./components/ChatPanel";
import { NodeSystemPanel } from "./components/NodeSystemPanel";
import { PatternGeneratorPanel } from "./components/PatternGeneratorPanel";
import { Canvas } from "./components/Canvas";
import { CommandPalette } from "./components/CommandPalette";
import { LayerEditPage } from "./components/LayerEditPage";
import { ExportPanel } from "./components/ExportPanel";
import { Icons } from "./components/Icons";
import { ToastContainer } from "./components/ui/Toast";
import { useHistory } from "./hooks/useHistory";
import { useChat } from "./hooks/useChat";
import { useToast } from "./hooks/useToast";
import { useAiActions } from "./hooks/useAiActions";
import { MODIFIER_CATALOG_FLAT } from "./constants";
import { generateSVG } from "./services/patternGenerator";
import {
  Layer,
  LayerType,
  ModifierType,
  ChatMessage,
  AiAction,
  Modifier,
} from "./types";

// --- COMPLEX INITIAL DATA ---
const INITIAL_LAYERS: Layer[] = [
  {
    id: "backdrop-noise",
    name: "Backdrop Noise",
    type: LayerType.SHAPE,
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    rotation: 0,
    opacity: 0.1,
    modifiers: [
      {
        id: "mod-noise-1",
        type: ModifierType.NOISE,
        name: "Static Noise",
        active: true,
        params: { amount: 30 },
      },
      {
        id: "mod-blur-1",
        type: ModifierType.GAUSSIAN_BLUR,
        name: "Soft Blur",
        active: true,
        params: { radius: 2 },
      },
    ],
    connections: [],
    style: { mixBlendMode: "overlay" },
  },
  {
    id: "cyber-orb",
    name: "Cyber Orb",
    type: LayerType.SHAPE,
    x: 450,
    y: 250,
    width: 300,
    height: 300,
    rotation: 0,
    opacity: 1,
    modifiers: [
      {
        id: "mod-extrude-1",
        type: ModifierType.EXTRUDE,
        name: "3D Effect",
        active: true,
        params: { depth: 40, bevel: 10 },
      },
      {
        id: "mod-bloom-1",
        type: ModifierType.BLOOM,
        name: "Neon Glow",
        active: true,
        params: { intensity: 2, threshold: 0.6 },
      },
      {
        id: "mod-perturb-1",
        type: ModifierType.PERTURB,
        name: "Energy Field",
        active: true,
        params: { amplitude: 5, frequency: 1.5 },
      },
      {
        id: "mod-glitch-1",
        type: ModifierType.GLITCH,
        name: "Data Glitch",
        active: false,
        params: { intensity: 20 },
      },
    ],
    connections: [
      {
        id: "conn-1",
        fromModId: "mod-perturb-1",
        fromPort: "Amplitude",
        toModId: "mod-bloom-1",
        toPort: "Intensity",
      },
    ],
    style: {
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(6,182,212,0.3) 100%)",
      boxShadow: "0 0 80px rgba(139,92,246,0.3)",
    },
  },
  {
    id: "title-main",
    name: "MOD-WEAVE CORE",
    type: LayerType.TEXT,
    x: 350,
    y: 580,
    width: 500,
    height: 100,
    rotation: 0,
    opacity: 0.8,
    content: "MOD-WEAVE CORE",
    modifiers: [
      {
        id: "mod-wave-1",
        type: ModifierType.WAVE,
        name: "Data Wave",
        active: true,
        params: { freq: 0.5, amp: 4 },
      },
      {
        id: "mod-ca-1",
        type: ModifierType.CHROMATIC_ABERRATION,
        name: "Fringe",
        active: true,
        params: { shift: 1.5 },
      },
    ],
    connections: [],
    style: {
      zIndex: 10,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "32px",
      fontWeight: "600",
      letterSpacing: "0.1em",
      textShadow: "0 0 10px rgba(6,182,212,0.5)",
    },
  },
  {
    id: 'procedural-pattern',
    name: 'Swiss Pattern',
    type: LayerType.PROCEDURAL,
    x: 100,
    y: 100,
    width: 600,
    height: 400,
    rotation: 0,
    opacity: 1,
    modifiers: [],
    patternState: {
        grid: { width: 40, height: 40, spacingX: 50, spacingY: 50, cols: 10, rows: 6 },
        unit: { shape: 'rect', strokeWidth: 0, strokeColor: '#ffffff', borderRadius: 0, customSvg: null },
        transform: { rotation: 0, variance: 0, scaleX: 1.0, scaleY: 1.0, skewX: 0, skewY: 0 },
        sequence: { type: 'none', min: -0.1, max: 0.1, direction: 'row', angle: 0, reverse: false, applyTo: ['size'], customValues: [] },
        mask: { type: 'image', imageUrl: null, opacity: 100, perlin: { scale: 20, seed: 12345 }, settings: { width: { enabled: false, min: 10, max: 60 }, height: { enabled: false, min: 10, max: 60 }, opacity: { enabled: false, min: 0, max: 1 }, rotation: { enabled: false, min: -45, max: 45 }, radius: { enabled: false, min: 0, max: 50 }, color: { enabled: false, min: 0, max: 50 }, strokeWidth: { enabled: false, min: 0, max: 10 }, x: { enabled: false, min: -50, max: 50 }, y: { enabled: false, min: -50, max: 50 } } },
        distortion: { waveAmount: 0, waveFreq: 1, vortexAmount: 0, vortexRadius: 200 },
        colors: { background: '#0a0a0a', gradient: { type: 'linear', angle: 45, stops: [{ id: '1', color: '#00dc82', position: 0 }, { id: '2', color: '#007fdc', position: 100 }] } }
    }
  }
];

const App = () => {
  const {
    state: layers,
    setState: setLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Layer[]>(INITIAL_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    "cyber-orb"
  );
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(["cyber-orb"]);

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);

  // Missing state declarations
  const [viewMode, setViewMode] = useState('main');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

  const {
    messages,
    isThinking,
    uploadedImage,
    setUploadedImage,
    sendMessage,
  } = useChat(layers, selectedLayerId);

  const { toasts, showToast, removeToast } = useToast();

  // Helper function for handling layer updates with history
  const setLayersWithHistory = useCallback((updater: (prev: Layer[]) => Layer[]) => {
    setLayers(updater);
  }, [setLayers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setIsCmdKOpen((p) => !p);
        } else if (e.key === "z") {
          e.preventDefault();
          e.shiftKey ? redo() : undo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    // Debounce state updates to avoid re-generating SVG on every small change.
    const handler = setTimeout(() => {
        let needsUpdate = false;
        const newLayers = layers.map(layer => {
            if (layer.type === LayerType.PROCEDURAL && layer.patternState) {
                const newSvg = generateSVG(layer.patternState, null);
                const newContent = `data:image/svg+xml;base64,${btoa(newSvg)}`;
                if (newContent !== layer.content) {
                    needsUpdate = true;
                    return { ...layer, content: newContent };
                }
            }
            return layer;
        });

        if (needsUpdate) {
            setLayers(newLayers, true); // Add a flag to skip history for this update
        }
    }, 200);

    return () => clearTimeout(handler);
  }, [layers, setLayers]);

  const handleUpdateLayer = useCallback((layerId: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === layerId) {
          let finalUpdates = { ...updates };

          // Immutable update for modifiers to handle metadata like lastUsed/isFavorite
          if (finalUpdates.modifiers) {
            finalUpdates.modifiers = finalUpdates.modifiers.map(updatedMod => {
              const existingMod = l.modifiers.find(m => m.id === updatedMod.id);
              if (existingMod) {
                return {
                  ...updatedMod,
                  lastUsed: Date.now(),
                  // Preserve favorite status if it's not explicitly updated
                  isFavorite: updatedMod.isFavorite ?? existingMod.isFavorite,
                };
              }
              return updatedMod;
            });
          }
          return { ...l, ...finalUpdates };
        }
        return l;
      })
    );
  }, [setLayers]);

  const { handleAiResponse } = useAiActions({
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    handleUpdateLayer,
    showToast,
  });

  const handleCreateGroup = useCallback(() => {
    const newGroup: Layer = {
      id: `grp-${Date.now()}`,
      name: 'New Group',
      type: LayerType.GROUP,
      x: 0,
      y: 0,
      width: 400,
      height: 400,
      rotation: 0,
      opacity: 1,
      modifiers: [],
      children: [],
    };
    setLayers((prev) => [...prev, newGroup]);
    showToast("New group created", "success");
  }, [setLayers, showToast]);

  const handleImportImage = useCallback((imageData: string) => {
    const newImageLayer: Layer = {
      id: `img-${Date.now()}`,
      name: 'Imported Image',
      type: LayerType.IMAGE,
      x: 150,
      y: 150,
      width: 512,
      height: 512,
      rotation: 0,
      opacity: 1,
      content: imageData,
      modifiers: [],
    };
    setLayers((prev) => [...prev, newImageLayer]);
    showToast("Image imported successfully", "success");
  }, [setLayers, showToast]);

  const handleOpenExportPanel = () => {
    setIsExportPanelOpen(true);
  };

  const handleToggleVisibility = (layerId: string) => {
    setLayersWithHistory((prev) =>
      prev.map((l) =>
        l.id === layerId ? { ...l, visible: l.visible === false ? true : false } : l
      )
    );
  };

  const handleToggleLock = (layerId: string) => {
    setLayersWithHistory((prev) =>
      prev.map((l) =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      )
    );
    // If locking the currently selected layer, deselect it
    if (selectedLayerId === layerId) {
      const layer = layers.find((l) => l.id === layerId);
      if (layer && !layer.locked) {
        setSelectedLayerId(null);
        setSelectedLayerIds([]);
      }
    }
  };

  const handleReorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    setLayersWithHistory((prev) => {
      const newLayers = [...prev];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      return newLayers;
    });
  }, [setLayersWithHistory]);

  const handleReorderModifiers = useCallback((layerId: string, fromIndex: number, toIndex: number) => {
    setLayersWithHistory((prev) =>
      prev.map((layer) => {
        if (layer.id === layerId) {
          const newMods = [...layer.modifiers];
          const [movedMod] = newMods.splice(fromIndex, 1);
          newMods.splice(toIndex, 0, movedMod);
          return { ...layer, modifiers: newMods };
        }
        return layer;
      })
    );
  }, [setLayersWithHistory]);

  const handleAddModifierToLayer = useCallback((layerId: string, modifierType: ModifierType) => {
    const catalogItem = MODIFIER_CATALOG_FLAT.find(m => m.type === modifierType);
    const newModifier: Modifier = {
      id: `mod-${Date.now()}`,
      type: modifierType,
      name: catalogItem?.label || 'New Modifier',
      active: true,
      params: {},
    };

    setLayersWithHistory((prev) =>
      prev.map((layer) =>
        layer.id === layerId
          ? { ...layer, modifiers: [...layer.modifiers, newModifier] }
          : layer
      )
    );
    showToast(`Added ${catalogItem?.label || 'modifier'} to layer`, "success");
  }, [setLayersWithHistory, showToast]);

  const handleRemoveModifier = useCallback((layerId: string, modifierId: string) => {
    setLayersWithHistory((prev) =>
      prev.map((layer) => {
        if (layer.id === layerId) {
          return {
            ...layer,
            modifiers: layer.modifiers.filter(m => m.id !== modifierId),
            connections: (layer.connections || []).filter(
              c => c.fromModId !== modifierId && c.toModId !== modifierId
            ),
          };
        }
        return layer;
      })
    );
  }, [setLayersWithHistory]);

  const handleToggleModifierActive = useCallback((layerId: string, modifierId: string) => {
    setLayersWithHistory((prev) =>
      prev.map((layer) => {
        if (layer.id === layerId) {
          return {
            ...layer,
            modifiers: layer.modifiers.map(m =>
              m.id === modifierId ? { ...m, active: !m.active } : m
            ),
          };
        }
        return layer;
      })
    );
  }, [setLayersWithHistory]);

  const handleSelectLayer = (layerId: string | null, multiSelect?: boolean, rangeSelect?: boolean) => {
    if (layerId === null) {
      // Deselect all
      setSelectedLayerId(null);
      setSelectedLayerIds([]);
    }

    const layer = layers.find(l => l.id === layerId);
    if (layer?.locked) {
      // Cannot select locked layers
      return;
    }

    if (multiSelect) {
      // Cmd/Ctrl+Click: Toggle layer in selection
      if (selectedLayerIds.includes(layerId)) {
        const newIds = selectedLayerIds.filter(id => id !== layerId);
        setSelectedLayerIds(newIds);
        setSelectedLayerId(newIds.length > 0 ? newIds[newIds.length - 1] : null);
      } else {
        const newIds = [...selectedLayerIds, layerId];
        setSelectedLayerIds(newIds);
        setSelectedLayerId(layerId);
      }
    } else if (rangeSelect && selectedLayerId) {
      // Shift+Click: Select range
      const visibleLayers = layers.filter(l => l.visible !== false && !l.locked);
      const currentIndex = visibleLayers.findIndex(l => l.id === selectedLayerId);
      const targetIndex = visibleLayers.findIndex(l => l.id === layerId);

      if (currentIndex !== -1 && targetIndex !== -1) {
        const start = Math.min(currentIndex, targetIndex);
        const end = Math.max(currentIndex, targetIndex);
        const rangeIds = visibleLayers.slice(start, end + 1).map(l => l.id);
        setSelectedLayerIds(rangeIds);
        setSelectedLayerId(layerId);
      }
    } else {
      // Normal click: Select single layer
      setSelectedLayerId(layerId);
      setSelectedLayerIds([layerId]);
    }
  };

  const handleSendMessage = useCallback(async (
    text: string,
    options: { uploadedImage: string | null, useFastMode: boolean }
  ) => {
    try {
      const response = await sendMessage(text, options);
      handleAiResponse(response, text);
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast("Failed to process AI request", "error");
    }
  }, [sendMessage, handleAiResponse, showToast]);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;
  const editingLayer = editingLayerId ? layers.find((l) => l.id === editingLayerId) : null;

  const [activeMobilePanel, setActiveMobilePanel] = useState<'layers' | 'nodes' | 'chat' | null>(null);

  const handleEnterEditMode = (layerId: string) => {
    setEditingLayerId(layerId);
    setViewMode('edit');
  };

  const handleExitEditMode = () => {
    setViewMode('main');
  };

  // If edit page is active, show it
  if (viewMode === 'edit' && editingLayer) {
    return (
      <LayerEditPage
        layer={editingLayer}
        onUpdateLayer={handleUpdateLayer}
        onExit={handleExitEditMode}
      />
    );
  }

  return (
    <div className="w-screen h-screen bg-mw-bg text-zinc-100 font-sans overflow-hidden flex flex-col relative">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className="absolute top-0 left-0 w-full h-12 flex items-center justify-between px-6 z-50 pointer-events-none">
         <div className="flex items-center gap-4 pointer-events-auto">
             <div className="w-8 h-8 bg-mw-accent rounded-lg flex items-center justify-center font-mono font-bold text-white shadow-lg">M</div>
             <div className="flex flex-col">
                 <span className="text-xs font-semibold tracking-wide">Cyberpunk Orb</span>
                 <span className="text-[10px] text-gray-500">Unsaved Changes</span>
             </div>
             <div className="flex items-center gap-1 ml-4 bg-black/20 rounded-lg p-1 border border-white/5 hidden md:flex">
                <button onClick={undo} disabled={!canUndo} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><Icons.Undo size={14} /></button>
                <button onClick={redo} disabled={!canRedo} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><Icons.Redo size={14} /></button>
             </div>
         </div>
         <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => selectedLayerId && handleEnterEditMode(selectedLayerId)}
                disabled={!selectedLayerId}
                className="bg-mw-cyan/20 hover:bg-mw-cyan/30 border border-mw-cyan/50 px-3 py-1 rounded text-xs font-medium text-mw-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✏️ 編輯圖層
              </button>
             <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs hidden md:block">Share</button>
             <button onClick={handleOpenExportPanel} className="bg-mw-accent hover:bg-violet-600 px-3 py-1 rounded text-xs flex items-center gap-1.5">
               <Icons.Download size={14} />
               Export
             </button>
          </div>
      </header>

      <main className="flex-1 relative z-0">
        <Canvas layers={layers} selectedLayerId={selectedLayerId} selectedLayerIds={selectedLayerIds} onSelectLayer={handleSelectLayer} onUpdateLayer={handleUpdateLayer} />
      </main>

      {/* Desktop Panels / Mobile Modals */}
      <LayerPanel
        layers={layers}
        selectedLayerId={selectedLayerId}
        selectedLayerIds={selectedLayerIds}
        onSelectLayer={handleSelectLayer}
        onToggleVisibility={handleToggleVisibility}
        onToggleLock={handleToggleLock}
        onImportImage={handleImportImage}
        onCreateGroup={handleCreateGroup}
        onReorderLayers={handleReorderLayers}
        onReorderModifiers={handleReorderModifiers}
        onAddModifierToLayer={handleAddModifierToLayer}
        onRemoveModifier={handleRemoveModifier}
        onToggleModifierActive={handleToggleModifierActive}
        className={activeMobilePanel === 'layers' ? 'fixed inset-0 z-50 w-full h-full max-h-full rounded-none' : 'hidden md:flex absolute top-20 left-6 w-64 max-h-[70vh]'}
      />

      {selectedLayer?.type === LayerType.PROCEDURAL ? (
        <PatternGeneratorPanel
          layer={selectedLayer}
          onUpdateLayer={handleUpdateLayer}
        />
      ) : (
        <NodeSystemPanel
          layer={selectedLayer}
          onUpdateLayer={handleUpdateLayer}
          selectedLayerId={selectedLayerId}
          isMobile={activeMobilePanel === 'nodes'}
        />
      )}

      <ChatPanel
        messages={messages}
        isOpen={isChatOpen}
        setIsOpen={(open) => {
          setIsChatOpen(open);
          if (!open && activeMobilePanel === 'chat') {
            setActiveMobilePanel(null);
          }
        }}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
        uploadedImage={uploadedImage}
        setUploadedImage={setUploadedImage}
        isMobile={activeMobilePanel === 'chat'}
      />

      <div className="absolute bottom-4 left-6 pointer-events-none opacity-50 text-[10px] font-mono flex gap-4 hidden md:flex">
        <span>ZOOM: 100%</span>
        <span className="flex items-center gap-1"><Icons.Command size={10} /> + K for commands</span>
      </div>

      <CommandPalette isOpen={isCmdKOpen} onClose={() => setIsCmdKOpen(false)} />

      <ExportPanel
        layers={layers}
        isOpen={isExportPanelOpen}
        onClose={() => setIsExportPanelOpen(false)}
        showToast={showToast}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-mw-panel border-t border-white/10 flex items-center justify-around z-50 pb-safe">
        <button onClick={() => setActiveMobilePanel(activeMobilePanel === 'layers' ? null : 'layers')} className={`flex flex-col items-center gap-1 p-2 ${activeMobilePanel === 'layers' ? 'text-mw-accent' : 'text-gray-500'}`}>
          <Icons.Layers size={20} />
          <span className="text-[10px]">Layers</span>
        </button>
        <button onClick={() => setActiveMobilePanel(activeMobilePanel === 'nodes' ? null : 'nodes')} className={`flex flex-col items-center gap-1 p-2 ${activeMobilePanel === 'nodes' ? 'text-mw-accent' : 'text-gray-500'}`}>
          <Icons.Cpu size={20} />
          <span className="text-[10px]">Nodes</span>
        </button>
        <button onClick={() => {
            if (activeMobilePanel === 'chat') {
                setActiveMobilePanel(null);
            } else {
                setActiveMobilePanel('chat');
                setIsChatOpen(true);
            }
        }} className={`flex flex-col items-center gap-1 p-2 ${activeMobilePanel === 'chat' ? 'text-mw-accent' : 'text-gray-500'}`}>
          <Icons.MessageSquare size={20} />
          <span className="text-[10px]">AI Chat</span>
        </button>
      </div>
    </div>
  );
};

export default App;
