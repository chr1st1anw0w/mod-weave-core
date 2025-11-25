/**
 * Distort Presets Panel
 * 效果预设选择面板，提供快速应用预定义效果的功能
 */

import React, { useState } from 'react';
import { Icons } from './Icons';
import {
  ALL_DISTORT_PRESETS,
  getPresetsByCategory,
  applyPresetToLayer,
  DistortPreset,
} from '../services/distortPresets';

interface DistortPresetsPanelProps {
  onApplyPreset: (modifiers: any[]) => void;
  onClose: () => void;
}

export const DistortPresetsPanel: React.FC<DistortPresetsPanelProps> = ({
  onApplyPreset,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | 'Wave' | 'Perturb' | 'Liquify' | 'Mixed'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

  // 根据类别和搜索过滤预设
  const filteredPresets = ALL_DISTORT_PRESETS.filter((preset) => {
    const matchesCategory =
      selectedCategory === 'All' || preset.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApplyPreset = (preset: DistortPreset) => {
    const modifiers = applyPresetToLayer(preset.id);
    onApplyPreset(modifiers);
    onClose();
  };

  const categories = [
    { id: 'All' as const, name: '全部', icon: '🎨' },
    { id: 'Wave' as const, name: '波浪', icon: '🌊' },
    { id: 'Perturb' as const, name: '噪声', icon: '✨' },
    { id: 'Liquify' as const, name: '液化', icon: '💧' },
    { id: 'Mixed' as const, name: '混合', icon: '🎭' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="bg-black/40 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                Distort Effect Presets
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                选择一个预设快速应用 Distort 效果
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center group"
            >
              <Icons.X size={20} className="text-gray-400 group-hover:text-white" />
            </button>
          </div>

          {/* Search and Categories */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Icons.Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="搜索预设..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                    ${
                      selectedCategory === cat.id
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <span className="text-xs opacity-60">
                    ({getPresetsByCategory(cat.id === 'All' ? 'Wave' : cat.id).length})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg">未找到匹配的预设</p>
              <p className="text-gray-500 text-sm mt-2">
                尝试其他搜索词或选择不同的类别
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  onMouseEnter={() => setHoveredPreset(preset.id)}
                  onMouseLeave={() => setHoveredPreset(null)}
                  className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all hover:scale-105 hover:shadow-xl hover:border-purple-500/50 text-left"
                >
                  {/* Icon */}
                  <div className="text-4xl mb-3">{preset.icon}</div>

                  {/* Name */}
                  <h3 className="font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {preset.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {preset.description}
                  </p>

                  {/* Modifiers Count */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">
                      {preset.modifiers.length} 效果
                    </div>
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">
                      {preset.category}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  {hoveredPreset === preset.id && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-xl pointer-events-none" />
                  )}

                  {/* Apply indicator */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Icons.Plus size={16} className="text-white" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-white/10 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            共 {filteredPresets.length} 个预设可用
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistortPresetsPanel;
