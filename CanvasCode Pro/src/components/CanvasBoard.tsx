import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { Upload, Loader2, Trash2, Minus, Plus, Wand2, Copy, LayoutTemplate, Pencil, Palette, Brush, RefreshCcw, ScanSearch } from './Icons';
import { analyzeImage } from '../services/geminiService';
import { AnalysisResult, AppState, CanvasObject, Viewport, ContextMenuState, CanvasHandle, CanvasBoardProps, Snapshot, AnalysisMode } from '../types';
import WebBrowser from './WebBrowser';
import HoverToolbar from './HoverToolbar';
import ContextMenu from './ContextMenu';
import { FigmaOptimizeDialog, FigmaOptimizeOptions } from './FigmaOptimizeDialog';

const CanvasBoard = forwardRef<CanvasHandle, CanvasBoardProps>(({ 
  objects,
  setObjects,
  onAnalysisComplete, 
  onError, 
  isBrowserOpen, 
  onCloseBrowser,
  settings
}, ref) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null); 
  const [renamingId, setRenamingId] = useState<string | null>(null); 
  const [renameValue, setRenameValue] = useState('');

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null); // For double-click replace

  // History & Undo/Redo
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const isHistoryAction = useRef(false);

  // Clipboard
  const clipboard = useRef<CanvasObject[]>([]);

  // Infinite Canvas Viewport State
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const [isDraggingObject, setIsDraggingObject] = useState(false);
  
  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const resizeStartData = useRef<{
    mouse: { x: number, y: number },
    objects: { [id: string]: { x: number, y: number, width: number, height: number } }
  }>({ mouse: { x: 0, y: 0 }, objects: {} });
  
  // Text Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Rubber Band Selection
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);

  // Snapping Guides
  const [guides, setGuides] = useState<{x?: number, y?: number}>({});

  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [isFigmaDialogOpen, setIsFigmaDialogOpen] = useState(false);
  
  // Touch Handling Refs
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isTouchDragging = useRef(false);

  // --- History Management ---
  const addToHistory = (newObjects: CanvasObject[]) => {
    if (isHistoryAction.current) return;
    setHistory(prev => {
        const newHistory = prev.slice(0, currentHistoryIndex + 1);
        newHistory.push({
            objects: JSON.parse(JSON.stringify(newObjects)),
            timestamp: Date.now()
        });
        if (newHistory.length > 30) newHistory.shift();
        return newHistory;
    });
    setCurrentHistoryIndex(prev => Math.min(prev + 1, 30));
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      isHistoryAction.current = true;
      const prevSnapshot = history[currentHistoryIndex - 1];
      setObjects(JSON.parse(JSON.stringify(prevSnapshot.objects)));
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setTimeout(() => { isHistoryAction.current = false; }, 0);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < history.length - 1) {
      isHistoryAction.current = true;
      const nextSnapshot = history[currentHistoryIndex + 1];
      setObjects(JSON.parse(JSON.stringify(nextSnapshot.objects)));
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setTimeout(() => { isHistoryAction.current = false; }, 0);
    }
  };

  const saveState = () => addToHistory(objects);

  const addRectangle = () => {
    const center = getViewportCenter();
    const newObj: CanvasObject = {
      id: Date.now().toString(),
      name: `Rectangle ${objects.length + 1}`,
      type: 'rectangle',
      x: center.x,
      y: center.y,
      width: 200,
      height: 200,
      zIndex: getMaxZIndex() + 1,
      backgroundColor: '#E5E7EB'
    };
    setObjects(prev => { const next = [...prev, newObj]; addToHistory(next); return next; });
    setSelectedIds(new Set([newObj.id]));
  };

  const addText = () => {
    const center = getViewportCenter();
    const newObj: CanvasObject = {
      id: Date.now().toString(),
      name: `Text ${objects.length + 1}`,
      type: 'text',
      x: center.x,
      y: center.y,
      width: 300,
      height: 60,
      zIndex: getMaxZIndex() + 1,
      content: 'Double click to edit',
      fontSize: 24
    };
    setObjects(prev => { const next = [...prev, newObj]; addToHistory(next); return next; });
    setSelectedIds(new Set([newObj.id]));
  };

  const addLayout = () => {
    const center = getViewportCenter();
    const newObj: CanvasObject = {
      id: Date.now().toString(),
      name: `Frame ${objects.length + 1}`,
      type: 'layout',
      x: center.x,
      y: center.y,
      width: 800,
      height: 600,
      zIndex: getMaxZIndex() + 1,
      backgroundColor: '#FFFFFF'
    };
    setObjects(prev => { const next = [...prev, newObj]; addToHistory(next); return next; });
    setSelectedIds(new Set([newObj.id]));
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
       setReplacingId(null); // Ensure normal upload
       fileInputRef.current.value = '';
       fileInputRef.current.click();
    }
  };

  const handleDuplicate = () => {
     if (selectedIds.size > 0) {
       const idsToDuplicate = new Set(selectedIds);
       const toClone = objects.filter(o => idsToDuplicate.has(o.id));
       
       const clones = JSON.parse(JSON.stringify(toClone)).map((o: CanvasObject) => ({ 
           ...o, 
           id: Date.now().toString() + Math.random(), 
           x: o.x + 20, 
           y: o.y + 20, 
           zIndex: getMaxZIndex() + 1 
       }));
       
       setObjects(prev => { const next = [...prev, ...clones]; addToHistory(next); return next; });
       setSelectedIds(new Set(clones.map((c: CanvasObject) => c.id)));
    }
  };

  const handleSelectAll = () => {
      setSelectedIds(new Set(objects.map(o => o.id)));
  };

  const handleZoomIn = () => setViewport(v => ({ ...v, scale: Math.min(5, v.scale + 0.1) }));
  const handleZoomOut = () => setViewport(v => ({ ...v, scale: Math.max(0.1, v.scale - 0.1) }));
  const handleZoomReset = () => setViewport({ x: 0, y: 0, scale: 1 });
  const handleZoomToFit = () => { handleZoomReset(); };

  useImperativeHandle(ref, () => ({
    triggerUpload,
    addRectangle,
    addText,
    addLayout
  }));

  const getMaxZIndex = () => objects.length > 0 ? Math.max(...objects.map(o => o.zIndex)) : 0;
  const getMinZIndex = () => objects.length > 0 ? Math.min(...objects.map(o => o.zIndex)) : 0;

  const screenToCanvas = (sx: number, sy: number) => {
    return {
      x: (sx - viewport.x) / viewport.scale,
      y: (sy - viewport.y) / viewport.scale
    };
  };

  const getViewportCenter = () => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        return screenToCanvas(rect.width / 2, rect.height / 2);
    }
    return screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
  };

  const handleGroup = () => {
    if (selectedIds.size < 2) return;
    const selectedObjs = objects.filter(o => selectedIds.has(o.id));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedObjs.forEach(o => {
      minX = Math.min(minX, o.x - o.width/2);
      minY = Math.min(minY, o.y - o.height/2);
      maxX = Math.max(maxX, o.x + o.width/2);
      maxY = Math.max(maxY, o.y + o.height/2);
    });
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width/2;
    const centerY = minY + height/2;
    
    const groupId = `group-${Date.now()}`;
    const groupObj: CanvasObject = {
      id: groupId,
      name: `Group ${objects.filter(o => o.type === 'group').length + 1}`,
      type: 'group',
      x: centerX,
      y: centerY,
      width,
      height,
      zIndex: getMaxZIndex() + 1
    };
    
    setObjects(prev => {
        const newObjects = prev.map(o => selectedIds.has(o.id) ? { ...o, groupId } : o);
        const final = [...newObjects, groupObj];
        addToHistory(final);
        return final;
    });
    setSelectedIds(new Set([groupId]));
  };

  const handleUngroup = () => {
    if (selectedIds.size === 0) return;
    setObjects(prev => {
        let newObjects = [...prev];
        const groupsToUngroup = prev.filter(o => selectedIds.has(o.id) && o.type === 'group');
        if (groupsToUngroup.length === 0) return prev;
        const groupIds = new Set(groupsToUngroup.map(g => g.id));
        newObjects = newObjects.filter(o => !groupIds.has(o.id));
        newObjects = newObjects.map(o => {
          if (o.groupId && groupIds.has(o.groupId)) {
            const { groupId, ...rest } = o;
            return rest as CanvasObject;
          }
          return o;
        });
        addToHistory(newObjects);
        return newObjects;
    });
    setSelectedIds(new Set());
  };

  const handleBringToFront = () => {
      if (selectedIds.size === 0) return;
      const maxZ = getMaxZIndex();
      setObjects(prev => {
          const next = prev.map(o => selectedIds.has(o.id) ? { ...o, zIndex: maxZ + 1 } : o);
          addToHistory(next);
          return next;
      });
  };

  const handleBringForward = () => {
      if (selectedIds.size === 0) return;
      setObjects(prev => {
          const next = prev.map(o => selectedIds.has(o.id) ? { ...o, zIndex: o.zIndex + 1 } : o);
          addToHistory(next);
          return next;
      });
  };

  const handleSendBackward = () => {
      if (selectedIds.size === 0) return;
      setObjects(prev => {
          const next = prev.map(o => selectedIds.has(o.id) ? { ...o, zIndex: Math.max(0, o.zIndex - 1) } : o);
          addToHistory(next);
          return next;
      });
  };

  const handleSendToBack = () => {
      if (selectedIds.size === 0) return;
      const minZ = getMinZIndex();
      setObjects(prev => {
          const next = prev.map(o => selectedIds.has(o.id) ? { ...o, zIndex: minZ - 1 } : o);
          addToHistory(next);
          return next;
      });
  };

  const startRenaming = (id: string, currentName: string) => {
     setRenamingId(id);
     setRenameValue(currentName);
  };

  const confirmRename = () => {
     if (renamingId) {
         setObjects(prev => prev.map(o => o.id === renamingId ? { ...o, name: renameValue } : o));
         addToHistory(objects); 
         setRenamingId(null);
     }
  };

  const generateCompositeImage = async (ids: Set<string>): Promise<string> => {
    const targetObjects: CanvasObject[] = [];
    ids.forEach(id => {
        const obj = objects.find(o => o.id === id);
        if (obj) {
            if (obj.type === 'group') {
                const children = objects.filter(o => o.groupId === id);
                children.forEach(child => targetObjects.push(child));
            } else {
                targetObjects.push(obj);
            }
        }
    });
    
    if (targetObjects.length === 0) throw new Error("No objects selected for analysis");

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    targetObjects.forEach(obj => {
        minX = Math.min(minX, obj.x - obj.width / 2);
        minY = Math.min(minY, obj.y - obj.height / 2);
        maxX = Math.max(maxX, obj.x + obj.width / 2);
        maxY = Math.max(maxY, obj.y + obj.height / 2);
    });

    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context failed");

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    targetObjects.sort((a, b) => a.zIndex - b.zIndex);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            if (src.startsWith('http')) { img.crossOrigin = "Anonymous"; }
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img); 
            img.src = src;
        });
    };

    for (const obj of targetObjects) {
        const drawX = obj.x - (obj.width / 2) - minX;
        const drawY = obj.y - (obj.height / 2) - minY;
        ctx.save();
        
        if (obj.type === 'image' && obj.src) {
            try {
                const img = await loadImage(obj.src);
                if (img.complete && img.naturalWidth !== 0) {
                     ctx.drawImage(img, drawX, drawY, obj.width, obj.height);
                } else {
                     ctx.fillStyle = '#F3F4F6';
                     ctx.fillRect(drawX, drawY, obj.width, obj.height);
                }
            } catch (e) {
                ctx.fillStyle = '#E5E7EB';
                ctx.fillRect(drawX, drawY, obj.width, obj.height);
            }
        } else if (obj.type === 'rectangle' || obj.type === 'layout') {
            ctx.fillStyle = obj.backgroundColor || '#FFFFFF';
            ctx.fillRect(drawX, drawY, obj.width, obj.height);
            if (obj.type === 'layout') {
                ctx.strokeStyle = '#E5E7EB';
                ctx.lineWidth = 1;
                ctx.strokeRect(drawX, drawY, obj.width, obj.height);
            }
        } else if (obj.type === 'text' && obj.content) {
            ctx.font = `${obj.fontSize || 16}px Inter, sans-serif`;
            ctx.fillStyle = '#111827';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.content, drawX + obj.width / 2, drawY + obj.height / 2);
        }
        ctx.restore();
    }
    return canvas.toDataURL('image/png');
  };

  const runAIAnalysis = async (ids: Set<string>, mode: AnalysisMode, customSettings?: Partial<GenerationSettings>) => {
      if (ids.size === 0) { alert("Please select at least one object."); return; }
      setAppState(AppState.ANALYZING);
      try {
        const imgSrc = await generateCompositeImage(ids);
        const prompt = "Analyze selection"; 
        
        const baseSettings = settings || { framework: 'html', device: 'desktop', type: 'component' };
        const effectiveSettings = customSettings 
            ? { ...baseSettings, ...customSettings }
            : baseSettings;

        const result = await analyzeImage(imgSrc, prompt, effectiveSettings, mode);
        onAnalysisComplete(result);
        setAppState(AppState.SUCCESS);
      } catch (err) {
        console.error("AI Error:", err);
        onError(err);
        setAppState(AppState.ERROR);
      }
  };

  const handleMakeEditable = async () => {
      const ids = selectedIds;
      if (ids.size === 0) return;
      setAppState(AppState.ANALYZING);
      try {
          const imgSrc = await generateCompositeImage(ids);
          const result = await analyzeImage(imgSrc, "Convert to editable objects", undefined, 'editable-layer');
          
          let newObjectsData: any[] = [];
          try {
              const jsonStr = result.code.replace(/```json/g, '').replace(/```/g, '').trim();
              newObjectsData = JSON.parse(jsonStr);
          } catch (e) {
              console.error("Failed to parse editable layer JSON", e);
              toast.error("Failed to parse AI response");
              setAppState(AppState.ERROR);
              return;
          }
          
          if (!Array.isArray(newObjectsData)) {
             toast.error("Invalid data format");
             setAppState(AppState.ERROR);
             return;
          }

          const selectedObjs = objects.filter(o => ids.has(o.id));
          const minX = Math.min(...selectedObjs.map(o => o.x - o.width/2));
          const minY = Math.min(...selectedObjs.map(o => o.y - o.height/2));
          
          const createdObjects: CanvasObject[] = newObjectsData.map((data, i) => ({
              id: Date.now().toString() + i + Math.random(),
              type: data.type === 'rectangle' ? 'rectangle' : data.type === 'text' ? 'text' : 'image',
              name: data.content || `Object ${i}`,
              x: minX + data.x + (data.width/2), 
              y: minY + data.y + (data.height/2),
              width: data.width,
              height: data.height,
              zIndex: getMaxZIndex() + 1 + (data.zIndex || i),
              backgroundColor: data.backgroundColor,
              content: data.content,
              fontSize: data.fontSize,
              src: data.type === 'image' ? imgSrc : undefined 
          }));

          const newAllObjects = objects.filter(o => !ids.has(o.id));
          setObjects([...newAllObjects, ...createdObjects]);
          addToHistory([...newAllObjects, ...createdObjects]);
          setSelectedIds(new Set(createdObjects.map(o => o.id)));
          
          setAppState(AppState.SUCCESS);
          toast.success("Layer converted to editable objects!");
      } catch (err) {
          console.error(err);
          onError(err);
          setAppState(AppState.ERROR);
      }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      isTouchDragging.current = false;
      
      longPressTimer.current = setTimeout(() => {
        setContextMenu({ 
          isOpen: true, 
          x: touch.clientX, 
          y: touch.clientY, 
          type: selectedIds.size > 0 ? 'object' : 'canvas',
          context: { isMulti: selectedIds.size > 1, hasGroup: selectedIds.size === 1 && objects.find(o=>o.id === Array.from(selectedIds)[0])?.type === 'group' || false } 
        });
      }, 500);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePos.current.x;
      const dy = touch.clientY - lastMousePos.current.y;
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        isTouchDragging.current = true;
        setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isTouchDragging.current = false;
  };

  const moveSelected = (dx: number, dy: number) => {
      if (selectedIds.size === 0) return;
      setObjects(prev => {
          const next = prev.map(o => selectedIds.has(o.id) || (o.groupId && selectedIds.has(o.groupId)) ? { ...o, x: o.x + dx, y: o.y + dy } : o);
          return next;
      });
  };

  useEffect(() => {
      const handlePaste = async (e: ClipboardEvent) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

          const text = e.clipboardData?.getData('text');

          // 1. Priority: SVG Code (e.g. from Figma "Copy as SVG")
          // We check this BEFORE files to prioritize vector data over fallback images
          if (text && text.includes('<svg') && text.includes('</svg>')) {
             e.preventDefault();
             const center = getViewportCenter();
             
             // Try to parse dimensions
             let width = 200;
             let height = 200;
             const wMatch = text.match(/width=["'](\d+)["']/) || text.match(/viewBox=["']\d+ \d+ (\d+) \d+["']/);
             const hMatch = text.match(/height=["'](\d+)["']/) || text.match(/viewBox=["']\d+ \d+ \d+ (\d+)["']/);
             
             if (wMatch && wMatch[1]) width = parseInt(wMatch[1]);
             if (hMatch && hMatch[1]) height = parseInt(hMatch[1]);
             
             const base64 = btoa(unescape(encodeURIComponent(text)));
             const newObj: CanvasObject = {
                 id: Date.now().toString(),
                 name: 'Figma Vector',
                 type: 'image',
                 src: `data:image/svg+xml;base64,${base64}`,
                 x: center.x,
                 y: center.y,
                 width,
                 height,
                 zIndex: getMaxZIndex() + 1
             };
             setObjects(prev => { const next = [...prev, newObj]; addToHistory(next); return next; });
             setSelectedIds(new Set([newObj.id]));
             toast.success("Figma Vector imported");
             return;
          }

          // 2. System Clipboard (Files/Images)
          if (e.clipboardData && e.clipboardData.files.length > 0) {
              e.preventDefault();
              handleFiles(e.clipboardData.files);
              toast.success("Image imported from clipboard");
              return;
          }

          if (text) {
              // 3. Internal App Objects (Synced via Text)
              if (text.startsWith('canvas-code-pro:')) {
                  try {
                      const jsonStr = text.replace('canvas-code-pro:', '');
                      const copiedObjs = JSON.parse(jsonStr) as CanvasObject[];
                      if (copiedObjs && Array.isArray(copiedObjs) && copiedObjs.length > 0) {
                          e.preventDefault();
                          const clones = copiedObjs.map((o: CanvasObject) => ({ 
                              ...o, 
                              id: Date.now().toString() + Math.random(), 
                              x: o.x + 20, 
                              y: o.y + 20, 
                              zIndex: getMaxZIndex() + 1 
                          }));
                          setObjects(prev => { const next = [...prev, ...clones]; addToHistory(next); return next; });
                          setSelectedIds(new Set(clones.map((c: CanvasObject) => c.id)));
                          toast.success(`${clones.length} objects pasted`);
                          return;
                      }
                  } catch (err) {
                      console.error('Failed to parse internal clipboard', err);
                  }
              }

              // 4. Plain Text (Create Text Node)
              if (text.trim().length > 0) {
                  e.preventDefault();
                  const center = getViewportCenter();
                  const newObj: CanvasObject = {
                    id: Date.now().toString(),
                    name: 'Text Layer',
                    type: 'text',
                    x: center.x,
                    y: center.y,
                    width: 300,
                    height: 60,
                    zIndex: getMaxZIndex() + 1,
                    content: text,
                    fontSize: 16
                  };
                  setObjects(prev => { const next = [...prev, newObj]; addToHistory(next); return next; });
                  setSelectedIds(new Set([newObj.id]));
                  toast.success("Text layer pasted");
                  return;
              }
          }

          // 5. Fallback: Internal Clipboard (Legacy/Memory)
          if (clipboard.current.length > 0) {
              e.preventDefault();
              const clones = JSON.parse(JSON.stringify(clipboard.current)).map((o: CanvasObject) => ({ 
                  ...o, 
                  id: Date.now().toString() + Math.random(), 
                  x: o.x + 20, 
                  y: o.y + 20, 
                  zIndex: getMaxZIndex() + 1 
              }));
              setObjects(prev => { const next = [...prev, ...clones]; addToHistory(next); return next; });
              setSelectedIds(new Set(clones.map((c: CanvasObject) => c.id)));
          }
      };

      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
  }, [objects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          if (e.key === 'Enter' && renamingId) confirmRename();
          return;
      }
      if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setIsSpacePanning(true); }
      
      // Modifiers
      if (e.metaKey || e.ctrlKey) {
        switch(e.key.toLowerCase()) {
          case 'c': 
            e.preventDefault(); 
            if(selectedIds.size > 0) {
                const selectedObjs = objects.filter(o => selectedIds.has(o.id));
                clipboard.current = JSON.parse(JSON.stringify(selectedObjs));
                // Sync with system clipboard to allow cross-session/external paste handling
                navigator.clipboard.writeText(`canvas-code-pro:${JSON.stringify(selectedObjs)}`).catch(err => console.error('Clipboard write failed', err));
            }
            break;
          // Paste handled by global paste event listener
          case 'd': e.preventDefault(); handleDuplicate(); break;
          case 'a': e.preventDefault(); handleSelectAll(); break;
          case 'z': e.preventDefault(); if (e.shiftKey) redo(); else undo(); break;
          case 'g': e.preventDefault(); if (e.shiftKey) handleUngroup(); else handleGroup(); break;
          case ']': e.preventDefault(); handleBringToFront(); break;
          case '[': e.preventDefault(); handleSendToBack(); break;
          case '=': case '+': e.preventDefault(); handleZoomIn(); break;
          case '-': e.preventDefault(); handleZoomOut(); break;
          case '0': e.preventDefault(); handleZoomReset(); break;
        }
      } else if (e.shiftKey) {
          switch(e.key) {
              case '0': handleZoomToFit(); break;
              case 'ArrowUp': e.preventDefault(); moveSelected(0, -10); break;
              case 'ArrowDown': e.preventDefault(); moveSelected(0, 10); break;
              case 'ArrowLeft': e.preventDefault(); moveSelected(-10, 0); break;
              case 'ArrowRight': e.preventDefault(); moveSelected(10, 0); break;
          }
      } else {
        // Tools (no modifiers)
        if (!e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'r': addRectangle(); break;
                case 't': addText(); break;
                case 'f': case 'a': addLayout(); break;
            }
        }

        switch(e.key) {
          case 'Delete':
          case 'Backspace': if (selectedIds.size > 0 && !editingId) { setObjects(prev => { const next = prev.filter(o => !selectedIds.has(o.id)); addToHistory(next); return next; }); setSelectedIds(new Set()); } break;
          case 'Escape': setSelectedIds(new Set()); setEditingId(null); setRenamingId(null); setContextMenu(null); break;
          case 'ArrowUp': e.preventDefault(); moveSelected(0, -1); break;
          case 'ArrowDown': e.preventDefault(); moveSelected(0, 1); break;
          case 'ArrowLeft': e.preventDefault(); moveSelected(-1, 0); break;
          case 'ArrowRight': e.preventDefault(); moveSelected(1, 0); break;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setIsSpacePanning(false); }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [objects, selectedIds, history, currentHistoryIndex, editingId, renamingId, viewport]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, viewport.scale + delta), 5);
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const canvasPos = screenToCanvas(mouseX, mouseY);
      const newX = mouseX - canvasPos.x * newScale;
      const newY = mouseY - canvasPos.y * newScale;
      setViewport({ x: newX, y: newY, scale: newScale });
    } else {
      e.preventDefault();
      setViewport(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.content-editable') || (e.target as HTMLElement).tagName === 'INPUT') return;
    setContextMenu(null);
    if (renamingId) confirmRename();
    if (editingId) setEditingId(null);

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    const target = e.target as HTMLElement;
    if (target.dataset.handle) {
      e.stopPropagation();
      setIsResizing(true);
      setActiveHandle(target.dataset.handle);
      const initialObjs: any = {};
      objects.forEach(o => { 
          if (selectedIds.has(o.id)) {
              initialObjs[o.id] = { 
                  x: o.x, 
                  y: o.y, 
                  width: o.width, 
                  height: o.height 
              }; 
          } 
      });
      // Store initial image scale if needed
      const activeId = Array.from(selectedIds)[0];
      const activeObj = objects.find(o => o.id === activeId);
      const initialImageScale = activeObj?.imageState?.scale || 1;
      
      resizeStartData.current = { 
          mouse: { x: e.clientX, y: e.clientY }, 
          objects: initialObjs,
          initialImageScale: initialImageScale as any
      };
      return;
    }
    if (e.button === 1 || isSpacePanning) { setIsPanning(true); return; }
    if (e.button === 0) {
       if (!isDraggingObject && !target.closest('[data-object-id]')) {
         setSelectionBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
         if (!e.shiftKey) setSelectedIds(new Set());
       }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (isPanning) {
          setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
          return;
      }


          if (isResizing && activeHandle && typeof activeHandle === 'string') { 
              const id = Array.from(selectedIds)[0];
              const initialObj = resizeStartData.current.objects[id];
              if (!initialObj) return;

              // Calculate delta in canvas coordinates
              const totalDx = (e.clientX - resizeStartData.current.mouse.x) / viewport.scale;
              const totalDy = (e.clientY - resizeStartData.current.mouse.y) / viewport.scale;
              
              let newW = initialObj.width; 
              let newH = initialObj.height; 
              let newX = initialObj.x; 
              let newY = initialObj.y;
              
              const obj = objects.find(o => o.id === id);
              const isImage = obj?.type === 'image' && obj?.imageState;

              // Scale/Corner Resize (Default Behavior)
              if (activeHandle.length === 2) { 
                  if (activeHandle.includes('e')) { newW = initialObj.width + totalDx; newX = initialObj.x + totalDx/2; }
                  if (activeHandle.includes('s')) { newH = initialObj.height + totalDy; newY = initialObj.y + totalDy/2; }
                  if (activeHandle.includes('w')) { newW = initialObj.width - totalDx; newX = initialObj.x + totalDx/2; }
                  if (activeHandle.includes('n')) { newH = initialObj.height - totalDy; newY = initialObj.y + totalDy/2; }
                  
                  // Update Scale if Image
                  let newImageState = obj?.imageState;
                  if (isImage && newImageState) {
                      const scaleX = Math.abs(newW) / initialObj.width;
                      // Assuming uniform scaling for corners for simplicity, or based on Width change
                      // For true corner resize, width and height might change independently if not locked aspect ratio.
                      // But let's just scale the content to match the new frame size? 
                      // No, standard behavior is scaling content.
                      // Let's recalculate scale based on Width ratio.
                      const ratio = Math.abs(newW) / (initialObj.width || 1);
                      newImageState = {
                          ...newImageState,
                          scale: (resizeStartData.current as any).initialImageScale * ratio, // We need initial scale. Storing it in resizeStartData might be needed.
                          // Actually, simpler: just update w/h. The rendering uses originalWidth * scale.
                          // So we MUST update scale.
                          // Let's just keep it simple: Corner resize updates W/H. 
                          // If we want to support "Content Scale", we need to update 'scale'.
                          // For now, let's just update W/H. We need to decide if this crops or scales.
                          // User wants "Drag border -> crop". "Drag corner -> scale"?
                          // Let's assume Corner = Scale, Edge = Crop.
                          scale: (newImageState.originalWidth ? (Math.abs(newW) / newImageState.originalWidth) : 1)
                      };
                  }

                  setObjects(prev => prev.map(o => o.id === id ? { 
                      ...o, 
                      x: newX, 
                      y: newY, 
                      width: Math.abs(newW), 
                      height: Math.abs(newH),
                      imageState: isImage ? {
                          ...o.imageState!,
                          scale: Math.max(0.01, Math.abs(newW) / o.imageState!.originalWidth)
                      } : undefined
                  } : o));
              } 
              // Edge Resize (Crop Behavior for Images)
              else if (isImage) {
                  let dX = 0;
                  let dY = 0;
                  let dW = 0;
                  let dH = 0;

                  if (activeHandle === 'e') { dW = totalDx; dX = totalDx/2; }
                  if (activeHandle === 'w') { dW = -totalDx; dX = totalDx/2; }
                  if (activeHandle === 's') { dH = totalDy; dY = totalDy/2; }
                  if (activeHandle === 'n') { dH = -totalDy; dY = totalDy/2; }

                  newW = Math.max(1, initialObj.width + dW);
                  newH = Math.max(1, initialObj.height + dH);
                  newX = initialObj.x + dX;
                  newY = initialObj.y + dY;

                  // Calculate offset changes
                  // If we move 'x' (center) right by dX...
                  // And we reduced width (dragged left handle right)...
                  // Container Left Edge moved Right.
                  // Image needs to move Left relative to Container to stay stationary.
                  
                  let newOffsetX = obj.imageState!.offsetX;
                  let newOffsetY = obj.imageState!.offsetY;

                  if (activeHandle === 'w') { 
                      // Dragging Left handle Right (totalDx > 0).
                      // Width decreases. X increases (moves right).
                      // Image should shift Left (-totalDx).
                      newOffsetX -= totalDx;
                  }
                  if (activeHandle === 'n') {
                      // Dragging Top handle Down (totalDy > 0).
                      // Height decreases. Y increases.
                      // Image should shift Up (-totalDy).
                      newOffsetY -= totalDy;
                  }
                  // For 'e' (Right handle): Width changes. X changes (center moves). Left edge stays same?
                  // initialObj.x - initialObj.width/2 = Left Edge.
                  // newX - newW/2 = (initialObj.x + totalDx/2) - (initialObj.width + totalDx)/2 = initialObj.x + totalDx/2 - initialObj.width/2 - totalDx/2 = initialObj.x - initialObj.width/2.
                  // Left Edge is constant. So OffsetX doesn't need change. Correct.

                   setObjects(prev => prev.map(o => o.id === id ? { 
                      ...o, 
                      x: newX, 
                      y: newY, 
                      width: Math.abs(newW), 
                      height: Math.abs(newH),
                      imageState: {
                          ...o.imageState!,
                          offsetX: newOffsetX,
                          offsetY: newOffsetY
                      }
                  } : o));

              } else {
                  // Standard edge resize for non-images (or legacy images)
                  if (activeHandle.includes('e')) { newW = initialObj.width + totalDx; newX = initialObj.x + totalDx/2; }
                  if (activeHandle.includes('s')) { newH = initialObj.height + totalDy; newY = initialObj.y + totalDy/2; }
                  if (activeHandle.includes('w')) { newW = initialObj.width - totalDx; newX = initialObj.x + totalDx/2; }
                  if (activeHandle.includes('n')) { newH = initialObj.height - totalDy; newY = initialObj.y + totalDy/2; }
                  setObjects(prev => prev.map(o => o.id === id ? { ...o, x: newX, y: newY, width: Math.abs(newW), height: Math.abs(newH) } : o));
              }
              return;
          }


      if (isDraggingObject && selectedIds.size > 0) {
          const moveX = dx / viewport.scale;
          const moveY = dy / viewport.scale;
          const idsToMove = new Set<string>(selectedIds);
          objects.forEach(obj => { if (obj.groupId && selectedIds.has(obj.groupId)) idsToMove.add(obj.id); });

          let snappedX = 0;
          let snappedY = 0;
          let guideX = undefined;
          let guideY = undefined;
          
          if (selectedIds.size === 1) {
             const activeId = Array.from(selectedIds)[0];
             const activeObj = objects.find(o => o.id === activeId);
             if (activeObj) {
                 const threshold = 5;
                 const predictedX = activeObj.x + moveX;
                 const predictedY = activeObj.y + moveY;

                 objects.forEach(target => {
                    if (target.id === activeId || idsToMove.has(target.id)) return;
                    if (Math.abs(target.x - predictedX) < threshold) {
                       snappedX = target.x - activeObj.x;
                       guideX = target.x;
                    }
                    if (Math.abs(target.y - predictedY) < threshold) {
                       snappedY = target.y - activeObj.y;
                       guideY = target.y;
                    }
                 });
             }
          }

          setGuides({ x: guideX, y: guideY });

          setObjects(prev => prev.map(o => idsToMove.has(o.id) ? { 
              ...o, 
              x: o.x + (snappedX ? snappedX : moveX), 
              y: o.y + (snappedY ? snappedY : moveY) 
          } : o));
          return;
      } else {
        setGuides({});
      }

      if (selectionBox) {
          setSelectionBox(prev => ({ x: prev!.x, y: prev!.y, w: e.clientX - prev!.x, h: e.clientY - prev!.y }));
      }
  };

  const handleMouseUp = () => {
    if (isDraggingObject || isResizing) saveState();
    setIsPanning(false); setIsDraggingObject(false); setIsResizing(false); setActiveHandle(null); setGuides({});
    if (selectionBox) {
        const rect = {
           left: Math.min(selectionBox.x, selectionBox.x + selectionBox.w),
           top: Math.min(selectionBox.y, selectionBox.y + selectionBox.h),
           right: Math.max(selectionBox.x, selectionBox.x + selectionBox.w),
           bottom: Math.max(selectionBox.y, selectionBox.y + selectionBox.h)
        };
        const selected = new Set<string>();
        objects.forEach(obj => {
           const screenPos = { x: (obj.x * viewport.scale) + viewport.x, y: (obj.y * viewport.scale) + viewport.y };
           const w = obj.width * viewport.scale; const h = obj.height * viewport.scale;
           if (screenPos.x + w/2 > rect.left && screenPos.x - w/2 < rect.right && screenPos.y + h/2 > rect.top && screenPos.y - h/2 < rect.bottom) {
               selected.add(obj.id);
           }
        });
        if (selected.size > 0) setSelectedIds(prev => new Set([...Array.from(prev), ...Array.from(selected)]));
        setSelectionBox(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { handleFiles(e.target.files); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = async (fileList: FileList, clientX?: number, clientY?: number) => {
      setIsUploading(true);
      const center = clientX && clientY ? screenToCanvas(clientX, clientY) : getViewportCenter();
      const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
      
      if (files.length === 0) { setIsUploading(false); return; }

      try {
        if (replacingId) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setObjects(prev => prev.map(o => o.id === replacingId ? { ...o, src: event.target!.result as string } : o));
                    addToHistory(objects);
                    setReplacingId(null);
                }
            };
            reader.readAsDataURL(file);
        } else {
            const newObjs = await Promise.all(files.map((file, index) => {
                return new Promise<CanvasObject>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                    if (event.target?.result) {
                        const img = new Image();
                        img.onload = () => {
                            const offset = index * 30;
                            // Correct aspect ratio calculation
                            const scale = Math.min(1, 400 / img.width);
                            const w = img.width * scale;
                            const h = img.height * scale;
                            
                            resolve({
                                id: Date.now().toString() + Math.random(),
                                name: file.name || `Image ${objects.length + index + 1}`,
                                type: 'image',
                                src: event.target!.result as string,
                                width: w,
                                height: h,
                                x: center.x + offset,
                                y: center.y + offset,
                                zIndex: getMaxZIndex() + 1 + index,
                                imageState: {
                                    originalWidth: w, // Store the initial logical width (scaled to fit canvas)
                                    originalHeight: h,
                                    scale: 1,
                                    offsetX: 0,
                                    offsetY: 0
                                }
                            });
                        };
                        img.src = event.target!.result as string;
                    }
                    };
                    reader.readAsDataURL(file);
                });
            }));
            setObjects(prev => { const next = [...prev, ...newObjs]; addToHistory(next); return next; });
        }
      } catch (error) { console.error(error); onError(error); } finally { setIsUploading(false); }
  };

  const handleImportImages = (importedData: string[]) => { 
      const center = getViewportCenter();
      const newObjs = importedData.map((data, i) => {
          if (data.startsWith('CODE_SNIPPET:')) {
             return {
                 id: Date.now().toString() + i,
                 name: 'Extracted Code',
                 type: 'text',
                 content: data.replace('CODE_SNIPPET: ', ''),
                 x: center.x + i*20, y: center.y + i*20,
                 width: 400, height: 200, zIndex: getMaxZIndex() + 1, fontSize: 14
             } as CanvasObject;
          }
          return {
             id: Date.now().toString() + i,
             name: `Imported ${i+1}`,
             type: 'image',
             src: data,
             x: center.x + i*20, y: center.y + i*20,
             width: 300, height: 200, zIndex: getMaxZIndex() + 1
          } as CanvasObject;
      });
      setObjects(prev => [...prev, ...newObjs]);
  };

  const handleContextMenuAction = async (action: string) => {
    setContextMenu(null);
    if (action === 'analyze') runAIAnalysis(selectedIds, 'code');
    else if (action === 'optimize-figma') setIsFigmaDialogOpen(true);
    else if (action === 'make-editable') handleMakeEditable();
    else if (action === 'wireframe') runAIAnalysis(selectedIds, 'wireframe');
    else if (action === 'design-system') runAIAnalysis(selectedIds, 'design-system');
    else if (action === 'style') runAIAnalysis(selectedIds, 'style');
    else if (action === 'ux-audit') runAIAnalysis(selectedIds, 'ux-audit');
    else if (action === 'add-photo' || action === 'add-files') { setReplacingId(null); setTimeout(() => fileInputRef.current?.click(), 50); }
    else if (action === 'add-text') addText();
    else if (action === 'group') handleGroup();
    else if (action === 'ungroup') handleUngroup();
    else if (action === 'bringToFront') handleBringToFront();
    else if (action === 'bringForward') handleBringForward();
    else if (action === 'sendBackward') handleSendBackward();
    else if (action === 'sendToBack') handleSendToBack();
    else if (action === 'delete') { setObjects(prev => prev.filter(o => !selectedIds.has(o.id))); setSelectedIds(new Set()); }
    else if (action === 'copy') { clipboard.current = JSON.parse(JSON.stringify(objects.filter(o => selectedIds.has(o.id)))); }
    else if (action === 'paste') {
         if (clipboard.current.length > 0) {
           const clones = JSON.parse(JSON.stringify(clipboard.current)).map((o: CanvasObject) => ({ ...o, id: Date.now().toString() + Math.random(), x: o.x + 20, y: o.y + 20, zIndex: getMaxZIndex() + 1 }));
           setObjects(prev => [...prev, ...clones]);
           setSelectedIds(new Set(clones.map((c: CanvasObject) => c.id)));
        }
    }
    else if (action === 'figma') runAIAnalysis(selectedIds, 'code', { figmaLayout: false });
    else if (action === 'inspiration') toast.info("Inspiration gallery coming soon!");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { handleFiles(e.dataTransfer.files, e.clientX, e.clientY); }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative bg-canvas touch-none ${isPanning || isSpacePanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isDraggingFile ? 'bg-blue-50 ring-4 ring-inset ring-blue-200' : ''}`}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, type: selectedIds.size > 0 ? 'object' : 'canvas', context: { isMulti: selectedIds.size > 1, hasGroup: selectedIds.size === 1 && objects.find(o=>o.id === Array.from(selectedIds)[0])?.type === 'group' || false } }); }}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }} onDragLeave={() => setIsDraggingFile(false)} onDrop={handleDrop}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
      
      <div className="absolute origin-top-left will-change-transform" style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}>
        {/* Snapping Guides */}
        {guides.x && <div className="absolute top-[-10000px] bottom-[-10000px] w-px bg-red-500 z-40" style={{ left: guides.x }} />}
        {guides.y && <div className="absolute left-[-10000px] right-[-10000px] h-px bg-red-500 z-40" style={{ top: guides.y }} />}

        {objects.map((obj) => (
          <div
            key={obj.id}
            data-object-id={obj.id}
            onMouseDown={(e) => { if (isSpacePanning) return; e.stopPropagation(); if (!e.shiftKey && !selectedIds.has(obj.id)) setSelectedIds(new Set([obj.id])); setIsDraggingObject(true); lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
            onMouseEnter={() => setHoveredId(obj.id)} onMouseLeave={() => setHoveredId(null)}
            className={`absolute group ${selectedIds.has(obj.id) ? 'z-50' : ''}`}
            style={{ left: obj.x, top: obj.y, width: obj.width, height: obj.height, transform: 'translate(-50%, -50%)', zIndex: obj.zIndex }}
          >
            {/* Smart Hover Toolbar */}
            {(hoveredId === obj.id || selectedIds.has(obj.id)) && !obj.groupId && (
                <HoverToolbar 
                  onAIAction={(mode) => runAIAnalysis(new Set([obj.id]), mode)} 
                  label={obj.name || obj.type}
                />
            )}

            <div className={`w-full h-full ${selectedIds.has(obj.id) ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300'} transition-shadow`}>
               {obj.type === 'image' && (
                 <div className="w-full h-full overflow-hidden relative">
                   {obj.imageState ? (
                     <img 
                        src={obj.src} 
                        className="absolute max-w-none max-h-none pointer-events-none select-none"
                        style={{
                            width: obj.imageState.originalWidth * obj.imageState.scale,
                            height: obj.imageState.originalHeight * obj.imageState.scale,
                            left: obj.imageState.offsetX,
                            top: obj.imageState.offsetY
                        }}
                        alt=""
                        onDoubleClick={(e) => { e.stopPropagation(); setReplacingId(obj.id); fileInputRef.current?.click(); }} 
                     />
                   ) : (
                     <img src={obj.src} className="w-full h-full object-cover pointer-events-none select-none" alt="" onDoubleClick={(e) => { e.stopPropagation(); setReplacingId(obj.id); fileInputRef.current?.click(); }} />
                   )}
                 </div>
               )}
               {obj.type === 'rectangle' && <div className="w-full h-full border border-gray-300" style={{backgroundColor: obj.backgroundColor}} />}
               {obj.type === 'text' && (<div className="w-full h-full flex items-center justify-center select-none" style={{fontSize: obj.fontSize}} onDoubleClick={() => { const newText = prompt("Edit text:", obj.content); if (newText !== null) setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, content: newText } : o)); }}>{obj.content}</div>)}
               {obj.type === 'layout' && <div className="w-full h-full bg-white border border-gray-200 shadow-sm" />}
               {obj.type === 'group' && <div className="w-full h-full border-2 border-dashed border-gray-400 rounded-lg bg-black/5" />}
            </div>
            
            {selectedIds.has(obj.id) && !obj.groupId && (
              <>
                <div className="absolute -top-2 -left-2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nw-resize z-10" data-handle="nw" />
                <div 
                  className="absolute -top-2 -right-2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ne-resize z-10" 
                  data-handle="ne" 
                />
                
                {/* Edge Handles (for cropping images) */}
                <div 
                   className="absolute top-1/2 -left-2 w-3 h-3 -translate-y-1/2 bg-white border border-blue-500 rounded-full cursor-w-resize z-10" 
                   data-handle="w" 
                   title={obj.type === 'image' ? "Drag to crop left" : "Resize width"}
                   onDoubleClick={(e) => {
                     e.stopPropagation();
                     if (obj.type === 'image' && obj.imageState) {
                       // Reset horizontal crop
                       const currentScale = obj.imageState.scale;
                       const originalW = obj.imageState.originalWidth * currentScale;
                       // To reset fully, we need to expand width to originalW and reset offsetX to 0.
                       // But changing width changes center (x).
                       // Current X (center) = LeftEdge + Width/2.
                       // LeftEdge = x - width/2.
                       // We want LeftEdge to be x - width/2 - offsetX (the visual left edge of image).
                       // Actually, offsetX is negative shift of image.
                       // Visual Left = Container Left + offsetX.
                       // We want Visual Left to be Container Left. So offsetX = 0.
                       // And we want Width = Original Width.
                       // So Left Edge should move left by offsetX? No.
                       
                       // Simplest Reset: Center the full image at current center? 
                       // Or Expand to full size?
                       
                       // Let's try: Reset width to original scaled width, reset offsetX to 0.
                       // But we must adjust X (center) so it grows outwards?
                       // If we grow width, center shifts?
                       // If we just set width = originalW, x = currentX, it grows symmetrically.
                       // But our image is shifted.
                       
                       setObjects(prev => prev.map(o => o.id === obj.id ? {
                           ...o,
                           width: originalW,
                           height: o.height, // Keep height crop? Or reset all? Let's reset specific axis if possible, or all.
                           // Let's reset ALL for simplicity as requested "double click... reset crop"
                           // To reset all:
                           // width = originalWidth * scale
                           // height = originalHeight * scale
                           // offsetX = 0, offsetY = 0
                           // But we should try to keep the image "centered" around where it is?
                           // Or just expand.
                           x: o.x, // Keep center?
                           y: o.y,
                           imageState: { ...o.imageState!, offsetX: 0, offsetY: 0 }
                       } : o));
                     }
                   }}
                />
                <div 
                   className="absolute top-1/2 -right-2 w-3 h-3 -translate-y-1/2 bg-white border border-blue-500 rounded-full cursor-e-resize z-10" 
                   data-handle="e"
                   title={obj.type === 'image' ? "Drag to crop right" : "Resize width"}
                   onDoubleClick={(e) => {
                     e.stopPropagation();
                     if (obj.type === 'image' && obj.imageState) {
                        const w = obj.imageState.originalWidth * obj.imageState.scale;
                        const h = obj.imageState.originalHeight * obj.imageState.scale;
                        setObjects(prev => prev.map(o => o.id === obj.id ? {
                           ...o, width: w, height: h, imageState: { ...o.imageState!, offsetX: 0, offsetY: 0 }
                        } : o));
                     }
                   }} 
                />
                <div 
                   className="absolute -bottom-2 left-1/2 w-3 h-3 -translate-x-1/2 bg-white border border-blue-500 rounded-full cursor-s-resize z-10" 
                   data-handle="s"
                   title={obj.type === 'image' ? "Drag to crop bottom" : "Resize height"}
                   onDoubleClick={(e) => {
                     e.stopPropagation();
                     if (obj.type === 'image' && obj.imageState) {
                        const w = obj.imageState.originalWidth * obj.imageState.scale;
                        const h = obj.imageState.originalHeight * obj.imageState.scale;
                        setObjects(prev => prev.map(o => o.id === obj.id ? {
                           ...o, width: w, height: h, imageState: { ...o.imageState!, offsetX: 0, offsetY: 0 }
                        } : o));
                     }
                   }}  
                />
                <div 
                   className="absolute -top-2 left-1/2 w-3 h-3 -translate-x-1/2 bg-white border border-blue-500 rounded-full cursor-n-resize z-10" 
                   data-handle="n"
                   title={obj.type === 'image' ? "Drag to crop top" : "Resize height"}
                   onDoubleClick={(e) => {
                     e.stopPropagation();
                     if (obj.type === 'image' && obj.imageState) {
                        const w = obj.imageState.originalWidth * obj.imageState.scale;
                        const h = obj.imageState.originalHeight * obj.imageState.scale;
                        setObjects(prev => prev.map(o => o.id === obj.id ? {
                           ...o, width: w, height: h, imageState: { ...o.imageState!, offsetX: 0, offsetY: 0 }
                        } : o));
                     }
                   }}  
                />
                
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-sw-resize z-10" data-handle="sw" />
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-se-resize z-10" data-handle="se" />
              </>
            )}
          </div>
        ))}
        
        {selectionBox && ( <div className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-50" style={{ left: Math.min(selectionBox.x, selectionBox.x + selectionBox.w), top: Math.min(selectionBox.y, selectionBox.y + selectionBox.h), width: Math.abs(selectionBox.w), height: Math.abs(selectionBox.h) }} /> )}
      </div>

      {selectionBox && ( <div className="fixed border border-blue-500 bg-blue-500/10 pointer-events-none z-50" style={{ left: Math.min(selectionBox.x, selectionBox.x + selectionBox.w), top: Math.min(selectionBox.y, selectionBox.y + selectionBox.h), width: Math.abs(selectionBox.w), height: Math.abs(selectionBox.h) }} /> )}

      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-gray-100 z-10">
         <button onClick={() => setViewport(v => ({ ...v, scale: Math.max(0.1, v.scale - 0.1) }))} className="p-1 hover:bg-gray-100 rounded"><Minus size={14} /></button>
         <span className="text-xs font-medium min-w-[3ch] text-center">{Math.round(viewport.scale * 100)}%</span>
         <button onClick={() => setViewport(v => ({ ...v, scale: Math.min(5, v.scale + 0.1) }))} className="p-1 hover:bg-gray-100 rounded"><Plus size={14} /></button>
      </div>
      
      {isDraggingFile && ( <div className="absolute inset-0 bg-blue-500/5 z-40 flex items-center justify-center pointer-events-none"><div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center animate-bounce"><Upload size={48} className="text-blue-500 mb-2" /><span className="font-bold text-blue-600">Drop images here</span></div></div> )}

      {(appState === AppState.ANALYZING || isUploading) && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
           <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <Loader2 size={32} className="animate-spin text-blue-600 mb-2"/>
              <span className="font-bold text-gray-800">{isUploading ? 'Uploading...' : 'AI Processing...'}</span>
           </div>
        </div>
      )}
      
      {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} onAction={handleContextMenuAction} />}
      <FigmaOptimizeDialog 
        isOpen={isFigmaDialogOpen} 
        onClose={() => setIsFigmaDialogOpen(false)} 
        onConfirm={(options) => {
            runAIAnalysis(selectedIds, 'code', {
                figmaLayout: options.autoLayout,
                figmaVariables: Object.values(options.variables).some(Boolean)
            });
        }}
      />
      <WebBrowser isOpen={isBrowserOpen} onClose={onCloseBrowser} onImportImages={handleImportImages} />
    </div>
  );
});

export default CanvasBoard;