import React, { useState } from 'react';
import { Layer, LayerType } from '../types';
import { Icons } from './Icons';
import html2canvas from 'html2canvas';

interface ExportPanelProps {
  layers: Layer[];
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

type ExportFormat = 'png' | 'svg' | 'json' | 'gif' | 'mp4' | 'lottie';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  available: boolean;
  comingSoon?: boolean;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ layers, isOpen, onClose, showToast }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportQuality, setExportQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [includeBackground, setIncludeBackground] = useState(true);

  const exportOptions: ExportOption[] = [
    {
      format: 'png',
      label: 'PNG Image',
      description: 'High-quality raster image',
      icon: Icons.Image,
      available: true,
    },
    {
      format: 'svg',
      label: 'SVG Vector',
      description: 'Scalable vector graphics (procedural layers only)',
      icon: Icons.FileCode,
      available: layers.some(l => l.type === LayerType.PROCEDURAL),
    },
    {
      format: 'json',
      label: 'Project JSON',
      description: 'Export entire project data',
      icon: Icons.FileJson,
      available: true,
    },
    {
      format: 'gif',
      label: 'Animated GIF',
      description: 'Animated GIF export (requires timeline)',
      icon: Icons.Film,
      available: false,
      comingSoon: true,
    },
    {
      format: 'mp4',
      label: 'MP4 Video',
      description: 'High-quality video export',
      icon: Icons.Video,
      available: false,
      comingSoon: true,
    },
    {
      format: 'lottie',
      label: 'Lottie JSON',
      description: 'Lottie animation format',
      icon: Icons.Sparkles,
      available: false,
      comingSoon: true,
    },
  ];

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('canvas-to-export');
      if (!element) {
        throw new Error('Canvas element not found');
      }

      const scale = exportQuality === 'high' ? 2 : exportQuality === 'medium' ? 1.5 : 1;

      const canvas = await html2canvas(element, {
        backgroundColor: includeBackground ? '#121214' : null,
        useCORS: true,
        scale: scale,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `mod-weave-export-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('PNG exported successfully!', 'success');
    } catch (error) {
      console.error('PNG export failed:', error);
      showToast('PNG export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = () => {
    setIsExporting(true);
    try {
      const proceduralLayers = layers.filter(l => l.type === LayerType.PROCEDURAL && l.content);

      if (proceduralLayers.length === 0) {
        showToast('No procedural layers to export', 'warning');
        setIsExporting(false);
        return;
      }

      proceduralLayers.forEach((layer, index) => {
        // Extract SVG from data URL
        const base64Content = layer.content?.split(',')[1];
        if (!base64Content) return;

        const svgContent = atob(base64Content);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `${layer.name.replace(/\s+/g, '-')}-${Date.now()}.svg`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
      });

      showToast(`Exported ${proceduralLayers.length} SVG file(s)`, 'success');
    } catch (error) {
      console.error('SVG export failed:', error);
      showToast('SVG export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      // Create a clean project export (exclude internal state)
      const projectData = {
        version: '1.0.0',
        timestamp: Date.now(),
        layers: layers.map(layer => ({
          ...layer,
          // Optionally exclude large content for cleaner JSON
          content: layer.type === LayerType.IMAGE ? '[Image Data]' : layer.content,
        })),
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `mod-weave-project-${Date.now()}.json`;
      link.href = url;
      link.click();

      URL.revokeObjectURL(url);
      showToast('Project JSON exported successfully!', 'success');
    } catch (error) {
      console.error('JSON export failed:', error);
      showToast('JSON export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = (format: ExportFormat) => {
    switch (format) {
      case 'png':
        handleExportPNG();
        break;
      case 'svg':
        handleExportSVG();
        break;
      case 'json':
        handleExportJSON();
        break;
      default:
        showToast('This export format is coming soon!', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-mw-panel/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-mw-accent/10 to-mw-cyan/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icons.Download size={24} className="text-mw-accent" />
              Export Project
            </h2>
            <p className="text-sm text-gray-400 mt-1">Choose your export format</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isExporting}
          >
            <Icons.X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Export Options Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => option.available && !isExporting && handleExport(option.format)}
                  disabled={!option.available || isExporting}
                  className={`
                    relative p-5 rounded-xl border-2 transition-all text-left
                    ${option.available
                      ? 'border-white/10 hover:border-mw-accent/50 hover:bg-mw-accent/5 cursor-pointer group'
                      : 'border-white/5 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Coming Soon Badge */}
                  {option.comingSoon && (
                    <div className="absolute top-3 right-3 bg-mw-cyan/20 text-mw-cyan text-[10px] px-2 py-1 rounded-full font-semibold">
                      COMING SOON
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all
                      ${option.available
                        ? 'bg-mw-accent/10 group-hover:bg-mw-accent/20'
                        : 'bg-white/5'
                      }
                    `}>
                      <Icon size={24} className={option.available ? 'text-mw-accent' : 'text-gray-600'} />
                    </div>

                    <div className="flex-1">
                      <h3 className={`text-base font-semibold ${option.available ? 'text-white' : 'text-gray-500'}`}>
                        {option.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Export Settings */}
          <div className="mt-6 p-5 bg-black/20 rounded-xl border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Icons.Settings size={16} className="text-mw-accent" />
              Export Settings
            </h3>

            <div className="space-y-4">
              {/* Quality */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Quality (PNG/Video)</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setExportQuality(quality)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all
                        ${exportQuality === quality
                          ? 'bg-mw-accent text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }
                      `}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Include Background</label>
                <button
                  onClick={() => setIncludeBackground(!includeBackground)}
                  className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${includeBackground ? 'bg-mw-accent' : 'bg-white/10'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${includeBackground ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {isExporting ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-mw-accent border-t-transparent rounded-full animate-spin" />
                Exporting...
              </span>
            ) : (
              <span>{layers.length} layer(s) in project</span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
