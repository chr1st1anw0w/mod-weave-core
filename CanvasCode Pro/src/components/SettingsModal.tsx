import React from 'react';
import { X, Monitor, Smartphone, Code2, FileType, Layout, Wand2, Palette } from './Icons';
import { GenerationSettings } from '../types';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GenerationSettings;
  onSave: (settings: GenerationSettings) => void;
  isMobile?: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, isMobile = false }) => {
  if (!isOpen) return null;

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    onSave({ ...settings, [key]: value });
  };

  // Mobile renders without overlay, as full-screen sheet
  if (isMobile) {
    return (
      <div className="w-full h-full overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Framework */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Framework</label>
            <div className="grid grid-cols-3 gap-3">
              {['html', 'react', 'vue'].map((fw) => (
                <button
                  key={fw}
                  onClick={() => updateSetting('framework', fw)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    settings.framework === fw 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 active:border-gray-300 text-gray-600'
                  }`}
                  style={{ minHeight: '88px' }}
                >
                  <Code2 size={24} className="mb-2" />
                  <span className="text-sm font-medium capitalize">{fw}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Target Device</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'responsive', icon: Layout, label: 'Responsive' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => updateSetting('device', dev.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    settings.device === dev.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 active:border-gray-300 text-gray-600'
                  }`}
                  style={{ minHeight: '88px' }}
                >
                  <dev.icon size={24} className="mb-2" />
                  <span className="text-sm font-medium">{dev.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Output Type</label>
            <div className="flex gap-3">
               <button
                  onClick={() => updateSetting('type', 'component')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    settings.type === 'component'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 active:border-gray-300 text-gray-600'
                  }`}
                  style={{ minHeight: '64px' }}
                >
                  <FileType size={20} />
                  <span className="text-sm font-medium">Component</span>
                </button>
                <button
                  onClick={() => updateSetting('type', 'page')}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                    settings.type === 'page'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 active:border-gray-300 text-gray-600'
                  }`}
                  style={{ minHeight: '64px' }}
                >
                  <Layout size={20} />
                  <span className="text-sm font-medium">Full Page</span>
                </button>
            </div>
          </div>

          {/* Figma Optimization */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Figma Optimization</label>
            <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <button 
                onClick={() => updateSetting('figmaLayout', !(settings.figmaLayout ?? false))}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white active:bg-white transition-colors"
                style={{ minHeight: '64px' }}
              >
                <div className="text-left space-y-1">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Layout size={16} className="text-blue-500"/> Auto Layout Ready
                  </Label>
                  <p className="text-xs text-gray-500">Optimize structure for Figma Auto Layout</p>
                </div>
                <Switch
                  checked={settings.figmaLayout ?? false}
                  onCheckedChange={(c) => updateSetting('figmaLayout', c)}
                />
              </button>
              
              <button 
                onClick={() => updateSetting('figmaVariables', !(settings.figmaVariables ?? false))}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white active:bg-white transition-colors"
                style={{ minHeight: '64px' }}
              >
                <div className="text-left space-y-1">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                     <Palette size={16} className="text-purple-500"/> Export Variables
                  </Label>
                  <p className="text-xs text-gray-500">Include CSS variables for color/typography</p>
                </div>
                <Switch
                  checked={settings.figmaVariables ?? false}
                  onCheckedChange={(c) => updateSetting('figmaVariables', c)}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 sticky bottom-0">
          <button 
            onClick={onClose}
            className="w-full bg-black active:bg-gray-800 text-white px-6 py-4 rounded-xl font-bold transition-colors"
            style={{ minHeight: '56px' }}
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  // Desktop: Original modal design
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Generation Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Framework */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Framework</label>
            <div className="grid grid-cols-3 gap-3">
              {['html', 'react', 'vue'].map((fw) => (
                <button
                  key={fw}
                  onClick={() => updateSetting('framework', fw)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    settings.framework === fw 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Code2 size={20} className="mb-2" />
                  <span className="text-xs font-medium capitalize">{fw}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Device */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Target Device</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                { id: 'responsive', icon: Layout, label: 'Responsive' },
                { id: 'mobile', icon: Smartphone, label: 'Mobile' }
              ].map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => updateSetting('device', dev.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    settings.device === dev.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <dev.icon size={20} className="mb-2" />
                  <span className="text-xs font-medium">{dev.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Output Type</label>
            <div className="flex gap-3">
               <button
                  onClick={() => updateSetting('type', 'component')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    settings.type === 'component'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <FileType size={18} />
                  <span className="text-sm font-medium">Component</span>
                </button>
                <button
                  onClick={() => updateSetting('type', 'page')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    settings.type === 'page'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Layout size={18} />
                  <span className="text-sm font-medium">Full Page</span>
                </button>
            </div>
          </div>

          {/* Figma Optimization */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Figma Optimization</label>
            <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Layout size={16} className="text-blue-500"/> Auto Layout Ready
                  </Label>
                  <p className="text-xs text-gray-500">Optimize structure for Figma Auto Layout</p>
                </div>
                <Switch
                  checked={settings.figmaLayout ?? false}
                  onCheckedChange={(c) => updateSetting('figmaLayout', c)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                     <Palette size={16} className="text-purple-500"/> Export Variables
                  </Label>
                  <p className="text-xs text-gray-500">Include CSS variables for color/typography</p>
                </div>
                <Switch
                  checked={settings.figmaVariables ?? false}
                  onCheckedChange={(c) => updateSetting('figmaVariables', c)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;