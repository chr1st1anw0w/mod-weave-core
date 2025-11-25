import React, { useState } from 'react';
import { Layer, LayerType, Modifier, ModifierType } from '../types';
import { Icons } from './Icons';

// Import all modifier metadata
const MODIFIER_CATALOG = [
  // Core 15
  { type: ModifierType.OUTLINE, label: 'Outline', category: 'Core', icon: Icons.Circle, color: 'text-cyan-400', params: [
    { key: 'thickness', label: 'Thickness', min: 0, max: 100, def: 2, unit: 'px' },
    { key: 'spacing', label: 'Spacing', min: 0, max: 50, def: 0, unit: 'px' },
  ]},
  { type: ModifierType.GAUSSIAN_BLUR, label: 'Gaussian Blur', category: 'Blur', icon: Icons.CloudFog, color: 'text-blue-200', params: [
    { key: 'radius', label: 'Radius', min: 0, max: 100, def: 5 },
  ]},
  { type: ModifierType.BRIGHTNESS_CONTRAST, label: 'Bright/Contr', category: 'Color', icon: Icons.Sun, color: 'text-yellow-200', params: [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100, def: 0 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100, def: 0 },
  ]},
  { type: ModifierType.HUE_SATURATION, label: 'Hue/Sat', category: 'Color', icon: Icons.Rainbow, color: 'text-yellow-400', params: [
    { key: 'hue', label: 'Hue', min: 0, max: 360, def: 0, unit: '°' },
    { key: 'sat', label: 'Saturation', min: -100, max: 100, def: 0, unit: '%' },
  ]},
  { type: ModifierType.NOISE, label: 'Noise', category: 'Blur', icon: Icons.Tv, color: 'text-gray-400', params: [
    { key: 'amount', label: 'Amount', min: 0, max: 100, def: 10, unit: '%' },
  ]},
  { type: ModifierType.DROP_SHADOW, label: 'Drop Shadow', category: 'Style', icon: Icons.CloudFog, color: 'text-gray-500', params: [
    { key: 'distance', label: 'Distance', min: 0, max: 50, def: 5 },
    { key: 'blur', label: 'Blur', min: 0, max: 50, def: 10 },
  ]},
  // Add more modifiers as needed...
];

const CATEGORIES = ['Core', 'Blur', 'Color', 'Style'];

const getLayerStyle = (modifiers: Modifier[], soloModId?: string): React.CSSProperties => {
  const filters: string[] = [];
  const activeModifiers = soloModId 
    ? modifiers.filter(m => m.id === soloModId)
    : modifiers.filter(m => m.active);
  
  for (const mod of activeModifiers) {
    const params = mod.params;
    
    switch (mod.type) {
      case ModifierType.GAUSSIAN_BLUR:
      case ModifierType.BLUR:
        filters.push(`blur(${params.radius || 0}px)`);
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
      case ModifierType.NOISE:
        filters.push(`grayscale(${(params.amount || 0) / 100})`);
        break;
      case ModifierType.DROP_SHADOW:
        filters.push(`drop-shadow(${params.distance/5 || 0}px ${params.distance/5 || 0}px ${params.blur/5 || 0}px rgba(0,0,0,0.5))`);
        break;
    }
  }
  
  return filters.length > 0 ? { filter: filters.join(' ') } : {};
};

// Resizable divider component
const ResizableDivider: React.FC<{ onResize: (delta: number) => void }> = ({ onResize }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.movementX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  return (
    <div
      className={`w-1 bg-white/5 hover:bg-mw-accent/50 cursor-col-resize transition-colors flex-shrink-0 ${isDragging ? 'bg-mw-accent' : ''}`}
      onMouseDown={handleMouseDown}
    />
  );
};

export const ModifierTestPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Blur');
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(380);
  const [soloModId, setSoloModId] = useState<string | null>(null);
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set());
  
  const [testLayer, setTestLayer] = useState<Layer>({
    id: 'test-layer',
    name: 'Test Layer',
    type: LayerType.IMAGE,
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    rotation: 0,
    opacity: 1,
    content: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop',
    modifiers: [],
  });

  const handleAddModifier = (type: ModifierType) => {
    const meta = MODIFIER_CATALOG.find(m => m.type === type);
    const defaultParams: Record<string, any> = {};
    
    meta?.params?.forEach(p => {
      defaultParams[p.key] = p.def;
    });
    
    const newModifier: Modifier = {
      id: `mod-${Date.now()}`,
      type,
      name: meta?.label || 'New Modifier',
      active: true,
      params: defaultParams,
    };
    
    setTestLayer(prev => ({
      ...prev,
      modifiers: [...prev.modifiers, newModifier]
    }));
    
    // Auto-expand the new modifier
    setExpandedMods(prev => new Set(prev).add(newModifier.id));
  };

  const handleToggleModifier = (modId: string) => {
    setTestLayer(prev => ({
      ...prev,
      modifiers: prev.modifiers.map(m => 
        m.id === modId ? { ...m, active: !m.active } : m
      )
    }));
  };

  const handleRemoveModifier = (modId: string) => {
    setTestLayer(prev => ({
      ...prev,
      modifiers: prev.modifiers.filter(m => m.id !== modId)
    }));
    setExpandedMods(prev => {
      const next = new Set(prev);
      next.delete(modId);
      return next;
    });
    if (soloModId === modId) setSoloModId(null);
  };

  const handleToggleSolo = (modId: string) => {
    setSoloModId(prev => prev === modId ? null : modId);
  };

  const handleToggleExpand = (modId: string) => {
    setExpandedMods(prev => {
      const next = new Set(prev);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return next;
    });
  };

  const handleUpdateParam = (modId: string, paramKey: string, value: any) => {
    setTestLayer(prev => ({
      ...prev,
      modifiers: prev.modifiers.map(m =>
        m.id === modId ? { ...m, params: { ...m.params, [paramKey]: value } } : m
      )
    }));
  };

  const handleClearAll = () => {
    setTestLayer(prev => ({
      ...prev,
      modifiers: []
    }));
    setSoloModId(null);
    setExpandedMods(new Set());
  };

  const filteredModifiers = MODIFIER_CATALOG.filter(m => m.category === selectedCategory);
  const layerStyle = getLayerStyle(testLayer.modifiers, soloModId || undefined);

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-mw-accent to-mw-cyan bg-clip-text text-transparent">
          修飾器測試頁面
        </h1>
        <p className="text-xs text-gray-500 mt-1">測試所有修飾器 • 可調整欄位寬度 • Solo 模式</p>
      </div>

      {/* Three Column Layout with Resizable Dividers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Modifier Catalog */}
        <div style={{ width: leftWidth }} className="flex-shrink-0 flex flex-col overflow-hidden border-r border-white/10">
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <h2 className="text-sm font-semibold mb-3">修飾器目錄</h2>
            
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-mw-accent text-white'
                      : 'bg-black/30 text-gray-400 hover:bg-black/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredModifiers.map((modifier) => {
              const Icon = modifier.icon;
              const isApplied = testLayer.modifiers.some(m => m.type === modifier.type);
              
              return (
                <button
                  key={modifier.type}
                  onClick={() => handleAddModifier(modifier.type)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                    isApplied
                      ? 'bg-mw-accent/10 border-mw-accent/30'
                      : 'bg-black/20 border-white/5 hover:bg-black/40'
                  }`}
                >
                  <Icon size={14} className={modifier.color} />
                  <span className="text-xs font-medium flex-1">{modifier.label}</span>
                  {isApplied && <div className="w-1.5 h-1.5 rounded-full bg-mw-accent" />}
                </button>
              );
            })}
          </div>
          
          <div className="flex-shrink-0 p-3 border-t border-white/10 bg-black/20">
            <div className="text-center">
              <div className="text-lg font-bold text-mw-accent">{filteredModifiers.length}</div>
              <div className="text-[10px] text-gray-500">{selectedCategory} 修飾器</div>
            </div>
          </div>
        </div>

        {/* Resizable Divider 1 */}
        <ResizableDivider onResize={(delta) => setLeftWidth(prev => Math.max(200, Math.min(400, prev + delta)))} />

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">
              預覽圖層
              {soloModId && <span className="ml-2 text-xs text-mw-cyan">(Solo 模式)</span>}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-black/30">
            <div
              className="relative transition-all duration-300"
              style={{
                width: 350,
                height: 350,
                maxWidth: '100%',
                ...layerStyle
              }}
            >
              <img
                src={testLayer.content}
                alt="Test Layer"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
              />
              
              {testLayer.modifiers.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur px-3 py-1.5 rounded-full border border-mw-accent/50">
                  <span className="text-xs text-mw-accent font-bold">
                    {soloModId ? '1 Solo' : `${testLayer.modifiers.filter(m => m.active).length} / ${testLayer.modifiers.length}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resizable Divider 2 */}
        <ResizableDivider onResize={(delta) => setRightWidth(prev => Math.max(320, Math.min(600, prev - delta)))} />

        {/* Right Sidebar - Modifier Controls */}
        <div style={{ width: rightWidth }} className="flex-shrink-0 border-l border-white/10 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold">修飾器操作</h2>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs transition-all"
            >
              清除全部
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {testLayer.modifiers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
                <Icons.Box size={48} className="mb-3 opacity-20" />
                <p className="text-sm font-medium">尚未添加修飾器</p>
                <p className="text-xs mt-1 text-gray-700">從左側目錄選擇修飾器</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testLayer.modifiers.map((mod, index) => {
                  const meta = MODIFIER_CATALOG.find(m => m.type === mod.type);
                  const Icon = meta?.icon || Icons.Box;
                  const isExpanded = expandedMods.has(mod.id);
                  const isSolo = soloModId === mod.id;
                  
                  return (
                    <div
                      key={mod.id}
                      className={`rounded-lg border transition-all ${
                        mod.active && !soloModId
                          ? 'bg-mw-accent/10 border-mw-accent/30' 
                          : isSolo
                          ? 'bg-mw-cyan/10 border-mw-cyan/30'
                          : 'bg-black/30 border-white/5 opacity-60'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-[10px] text-gray-600 font-mono">#{index + 1}</span>
                          <Icon size={14} className={meta?.color || 'text-gray-400'} />
                          <span className="text-sm font-medium">{mod.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Solo Button */}
                          <button
                            onClick={() => handleToggleSolo(mod.id)}
                            className={`p-1 rounded transition-all ${
                              isSolo
                                ? 'bg-mw-cyan/30 text-mw-cyan' 
                                : 'bg-gray-500/20 text-gray-500 hover:text-mw-cyan'
                            }`}
                            title="Solo 模式"
                          >
                            <Icons.Eye size={12} />
                          </button>
                          {/* Power Button */}
                          <button
                            onClick={() => handleToggleModifier(mod.id)}
                            className={`p-1 rounded transition-all ${
                              mod.active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-500'
                            }`}
                            title={mod.active ? '停用' : '啟用'}
                          >
                            <Icons.Power size={12} />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleRemoveModifier(mod.id)}
                            className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                            title="移除"
                          >
                            <Icons.Trash2 size={12} />
                          </button>
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => handleToggleExpand(mod.id)}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 transition-all"
                            title={isExpanded ? '折疊' : '展開'}
                          >
                            {isExpanded ? <Icons.ChevronUp size={12} /> : <Icons.ChevronDown size={12} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Parameters (Expandable) */}
                      {isExpanded && meta?.params && (
                        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
                          {meta.params.map(param => (
                            <div key={param.key} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-400">{param.label}</label>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {mod.params[param.key] ?? param.def}{param.unit || ''}
                                </span>
                              </div>
                              <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                value={mod.params[param.key] ?? param.def}
                                onChange={(e) => handleUpdateParam(mod.id, param.key, parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mw-accent"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
