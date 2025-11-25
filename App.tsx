import React, { useState, useEffect, useCallback } from "react";
import { LayerPanel } from "./components/LayerPanel";
import { ChatPanel } from "./components/ChatPanel";
import { NodeSystemPanel } from "./components/NodeSystemPanel";
import { Canvas } from "./components/Canvas";
import { CommandPalette } from "./components/CommandPalette";
import { LayerEditPage } from "./components/LayerEditPage";
import { Icons } from "./components/Icons";
import { useHistory } from "./hooks/useHistory";
import { useChat } from "./hooks/useChat";
import html2canvas from 'html2canvas';
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
  const [viewMode, setViewMode] = useState<'main' | 'edit'>('main');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // AI chat minimized by default
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  const {
    messages,
    isThinking,
    uploadedImage,
    setUploadedImage,
    sendMessage,
  } = useChat(layers, selectedLayerId);

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
  }, [setLayers]);

  const handleExport = () => {
    const element = document.getElementById('canvas-to-export');
    if (element) {
      html2canvas(element, {
        backgroundColor: '#121214', // Match the app's background
        useCORS: true, // If you have external images
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mod-weave-export.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handleMoveLayer = useCallback((draggedId: string, targetId: string | null) => {
    setLayers(prev => {
        let layers = JSON.parse(JSON.stringify(prev)); // Deep copy for immutability

        let draggedLayer: Layer | null = null;
        let sourceList: Layer[] | undefined = layers;

        // Find and remove the dragged layer from its original position
        const findAndRemove = (list: Layer[]): Layer[] => {
            const index = list.findIndex(l => l.id === draggedId);
            if (index !== -1) {
                [draggedLayer] = list.splice(index, 1);
                sourceList = list;
                return list;
            }
            for (const layer of list) {
                if (layer.children) {
                    const newChildren = findAndRemove(layer.children);
                    if (newChildren !== layer.children) { // Found and removed
                        layer.children = newChildren;
                        return list;
                    }
                }
            }
            return list;
        };

        layers = findAndRemove(layers);

        if (!draggedLayer) return prev; // Should not happen

        // Reset parentId before placing it
        delete draggedLayer.parentId;

        if (targetId === null) { // Dropped at the root
            layers.push(draggedLayer);
        } else {
            // Find the target and insert the layer
            let targetFound = false;
            const findAndInsert = (list: Layer[]) => {
                const targetIndex = list.findIndex(l => l.id === targetId);
                if (targetIndex !== -1) {
                    const targetLayer = list[targetIndex];
                    if (targetLayer.type === LayerType.GROUP) {
                        // Drop into a group
                        targetLayer.children = targetLayer.children || [];
                        targetLayer.children.push(draggedLayer);
                        draggedLayer.parentId = targetLayer.id;
                    } else {
                        // Drop onto a layer, insert before it
                        list.splice(targetIndex, 0, draggedLayer);
                    }
                    targetFound = true;
                    return;
                }
                for (const layer of list) {
                    if (layer.children) findAndInsert(layer.children);
                    if (targetFound) return;
                }
            };
            findAndInsert(layers);

            if (!targetFound) { // If target wasn't in any list (e.g., something went wrong), add to root
                layers.push(draggedLayer);
            }
        }

        return layers;
    });
  }, [setLayers]);

  const handleSendMessage = async (
    text: string,
    options: { uploadedImage: string | null, useFastMode: boolean }
  ) => {
    const response = await sendMessage(text, options);

    // --- Handle AI Actions ---
    if (
      response.actionType === "MANIPULATE_NODES" &&
      response.actionPayload &&
      selectedLayerId
    ) {
      setLayers((prevLayers) => {
        return prevLayers.map((layer) => {
          if (layer.id !== selectedLayerId) return layer;

          let newModifiers = [...layer.modifiers];
          let newConnections = [...(layer.connections || [])];

          response.actionPayload?.forEach((action) => {
            switch (action.action) {
              case "update_modifier_params":
                newModifiers = newModifiers.map((mod) =>
                  mod.id === action.modId
                    ? {
                        ...mod,
                        params: { ...mod.params, ...action.params },
                        lastUsed: Date.now(),
                      }
                    : mod
                );
                break;
              case "add_modifier":
                const catalogItem = MODIFIER_CATALOG_FLAT.find(
                  (c) => c.type === action.type
                ); // Access full catalog
                const newMod: Modifier = {
                  id: `mod-${Date.now()}`,
                  type: action.type,
                  name: catalogItem?.label || action.type,
                  active: true,
                  params: {},
                  lastUsed: Date.now(),
                };
                newModifiers.push(newMod);
                break;
              case "create_connection":
                const newConn = { id: `conn-${Date.now()}`, ...action };
                // Prevent duplicate connections (same from-to pair)
                const exists = newConnections.some(
                  (c) =>
                    c.fromModId === newConn.fromModId &&
                    c.fromPort === newConn.fromPort &&
                    c.toModId === newConn.toModId &&
                    c.toPort === newConn.toPort
                );
                if (!exists) {
                  newConnections.push(newConn);
                } else {
                  console.log("Connection already exists, skipping:", newConn);
                }
                break;
            }
          });

          return {
            ...layer,
            modifiers: newModifiers,
            connections: newConnections,
          };
        });
      });
    } else if (
      response.actionType === "CREATE_LAYER" &&
      response.generatedImage
    ) {
      const newLayer: Layer = {
        id: `gen-${Date.now()}`,
        name: `AI Gen: ${text.slice(0, 15)}...`,
        type: LayerType.IMAGE,
        x: 200,
        y: 200,
        width: 512,
        height: 512,
        rotation: 0,
        opacity: 1,
        content: `data:image/png;base64,${response.generatedImage}`,
        modifiers: [],
        connections: [],
      };
      setLayers((prev) => [...prev, newLayer]);
      setSelectedLayerId(newLayer.id);
    } else if (
      response.actionType === "UPDATE_LAYER" &&
      response.generatedImage &&
      selectedLayerId
    ) {
      handleUpdateLayer(selectedLayerId, {
        content: `data:image/png;base64,${response.generatedImage}`,
      });
    }

  };

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
             <button onClick={handleExport} className="bg-mw-accent hover:bg-violet-600 px-3 py-1 rounded text-xs">Export</button>
          </div>
      </header>

      <main id="canvas-to-export" className="flex-1 relative z-0">
        <Canvas
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onEnterEditMode={handleEnterEditMode}
        />
      </main>

      {/* Desktop Panels / Mobile Modals */}
      <LayerPanel 
        layers={layers} 
        selectedLayerId={selectedLayerId} 
        onSelectLayer={setSelectedLayerId} 
        onCreateGroup={handleCreateGroup}
        onMoveLayer={handleMoveLayer}
        className={activeMobilePanel === 'layers' ? 'fixed inset-0 z-50 w-full h-full max-h-full rounded-none' : 'hidden md:flex absolute top-20 left-6 w-64 max-h-[70vh] z-40'}
      />
      
      <NodeSystemPanel 
        layer={selectedLayer} 
        onUpdateLayer={handleUpdateLayer} 
        selectedLayerId={selectedLayerId} 
        isMobile={activeMobilePanel === 'nodes'}
      />
      
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

// Flat catalog for AI to reference ModifierType by label/type
const MODIFIER_CATALOG_FLAT = [
  { type: ModifierType.OUTLINE, label: "Outline", cat: "Shape" },
  { type: ModifierType.STRETCH, label: "Stretch", cat: "Distort" },
  { type: ModifierType.REPEATER, label: "Repeater", cat: "Pattern" },
  {
    type: ModifierType.PARTICLE_DISSOLVE,
    label: "Particle Dissolve",
    cat: "Physics",
  },
  { type: ModifierType.SPRING, label: "Spring", cat: "Physics" },
  { type: ModifierType.WAVE, label: "Wave", cat: "Distort" },
  { type: ModifierType.PARALLAX, label: "Parallax", cat: "Motion" },
  { type: ModifierType.AI_FILL, label: "AI Fill", cat: "AI" },
  { type: ModifierType.GLITCH, label: "Glitch", cat: "Effect" },
  { type: ModifierType.REFRACTION, label: "Refraction", cat: "Glass" },
  { type: ModifierType.HALFTONE_LUMA, label: "Halftone", cat: "Style" },
  { type: ModifierType.EXTRUDE, label: "Extrude 3D", cat: "3D" },
  {
    type: ModifierType.BRIGHTNESS_CONTRAST,
    label: "Bright/Contr",
    cat: "Color",
  },
  { type: ModifierType.GRADIENT_MAP, label: "Gradient Map", cat: "Color" },
  { type: ModifierType.PERTURB, label: "Perturb", cat: "Distort" },
  { type: ModifierType.REMOVE_BACKGROUND, label: "Remove BG", cat: "AI" },
  { type: ModifierType.SPLIT_TO_LAYERS, label: "Split Layers", cat: "Util" },
  { type: ModifierType.PEN_STROKES, label: "Pen Strokes", cat: "Style" },
  { type: ModifierType.EMBOSS, label: "Emboss", cat: "Style" },
  { type: ModifierType.DROP_SHADOW, label: "Drop Shadow", cat: "Style" },
  { type: ModifierType.INNER_SHADOW, label: "Inner Shadow", cat: "Style" },
  { type: ModifierType.BEVEL_EMBOSS, label: "Bevel", cat: "3D" },
  { type: ModifierType.COLOR_OVERLAY, label: "Color Overlay", cat: "Color" },
  { type: ModifierType.NOISE, label: "Noise", cat: "Effect" },
  { type: ModifierType.GAUSSIAN_BLUR, label: "Gaussian Blur", cat: "Blur" },
  { type: ModifierType.MOTION_BLUR, label: "Motion Blur", cat: "Blur" },
  { type: ModifierType.RADIAL_BLUR, label: "Radial Blur", cat: "Blur" },
  { type: ModifierType.LIQUIFY, label: "Liquify", cat: "Distort" },
  { type: ModifierType.DISPLACEMENT_MAP, label: "Displace", cat: "Distort" },
  { type: ModifierType.THRESHOLD, label: "Threshold", cat: "Color" },
  { type: ModifierType.INVERT, label: "Invert", cat: "Color" },
  { type: ModifierType.POSTERIZE, label: "Posterize", cat: "Color" },
  { type: ModifierType.HUE_SATURATION, label: "Hue/Sat", cat: "Color" },
  { type: ModifierType.CURVES, label: "Curves", cat: "Color" },
  { type: ModifierType.VIGNETTE, label: "Vignette", cat: "Effect" },
  { type: ModifierType.LENS_FLARE, label: "Lens Flare", cat: "Light" },
  { type: ModifierType.BLOOM, label: "Bloom", cat: "Light" },
  {
    type: ModifierType.CHROMATIC_ABERRATION,
    label: "Chromatic",
    cat: "Effect",
  },
  { type: ModifierType.SHARPEN, label: "Sharpen", cat: "Effect" },
  { type: ModifierType.TILT_SHIFT, label: "Tilt Shift", cat: "Blur" },
  { type: ModifierType.DITHER, label: "Dither", cat: "Retro" },
  { type: ModifierType.PIXELATE, label: "Pixelate", cat: "Retro" },
  { type: ModifierType.KALEIDOSCOPE, label: "Kaleidoscope", cat: "Effect" },
  { type: ModifierType.MODIFIER_GROUP, label: "Group", cat: "Util" }, // Also include group here for AI
];
