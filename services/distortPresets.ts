/**
 * Distort Effect Presets Library
 * 预定义的 Distort 效果组合，方便快速应用
 */

import { ModifierType } from '../types';

export interface DistortPreset {
  id: string;
  name: string;
  description: string;
  category: 'Wave' | 'Liquify' | 'Displacement' | 'Perturb' | 'Mixed';
  icon: string;
  modifiers: Array<{
    type: ModifierType;
    params: Record<string, any>;
  }>;
  thumbnail?: string;
}

// ============================================================================
// Wave Presets
// ============================================================================

export const WAVE_PRESETS: DistortPreset[] = [
  {
    id: 'wave-gentle',
    name: '轻柔波浪',
    description: '柔和的水波纹效果',
    category: 'Wave',
    icon: '🌊',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 2,
          amplitude: 10,
          phase: 0,
          direction: 0,
        },
      },
    ],
  },
  {
    id: 'wave-intense',
    name: '强烈波浪',
    description: '戏剧性的波浪扭曲',
    category: 'Wave',
    icon: '🌊',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 8,
          amplitude: 50,
          phase: 90,
          direction: 45,
        },
      },
    ],
  },
  {
    id: 'wave-vertical',
    name: '垂直波纹',
    description: '从上到下的波浪效果',
    category: 'Wave',
    icon: '📏',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 5,
          amplitude: 20,
          phase: 0,
          direction: 90,
        },
      },
    ],
  },
  {
    id: 'wave-horizontal',
    name: '水平波纹',
    description: '从左到右的波浪效果',
    category: 'Wave',
    icon: '📐',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 5,
          amplitude: 20,
          phase: 0,
          direction: 0,
        },
      },
    ],
  },
  {
    id: 'wave-circular',
    name: '环形波纹',
    description: '模拟水滴产生的同心圆波纹',
    category: 'Wave',
    icon: '⭕',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 10,
          amplitude: 15,
          phase: 0,
          direction: 180,
        },
      },
    ],
  },
];

// ============================================================================
// Perturb (Noise) Presets
// ============================================================================

export const PERTURB_PRESETS: DistortPreset[] = [
  {
    id: 'perturb-subtle',
    name: '微妙噪声',
    description: '轻微的随机扰动',
    category: 'Perturb',
    icon: '✨',
    modifiers: [
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 5,
          frequency: 1,
          octaves: 2,
          speed: 0,
        },
      },
    ],
  },
  {
    id: 'perturb-organic',
    name: '有机扭曲',
    description: '自然的不规则变形',
    category: 'Perturb',
    icon: '🌿',
    modifiers: [
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 30,
          frequency: 1.5,
          octaves: 5,
          speed: 0,
        },
      },
    ],
  },
  {
    id: 'perturb-animated',
    name: '动态噪声',
    description: '持续变化的扰动效果',
    category: 'Perturb',
    icon: '🔄',
    modifiers: [
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 20,
          frequency: 2,
          octaves: 4,
          speed: 1.5,
        },
      },
    ],
  },
  {
    id: 'perturb-turbulent',
    name: '湍流效果',
    description: '复杂的多层噪声',
    category: 'Perturb',
    icon: '🌪️',
    modifiers: [
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 40,
          frequency: 3,
          octaves: 8,
          speed: 0,
        },
      },
    ],
  },
];

// ============================================================================
// Liquify Presets
// ============================================================================

export const LIQUIFY_PRESETS: DistortPreset[] = [
  {
    id: 'liquify-push',
    name: '推动变形',
    description: '向前推动像素',
    category: 'Liquify',
    icon: '👉',
    modifiers: [
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 80,
          pressure: 0.6,
          mode: 'Push',
          autoDeform: true,
        },
      },
    ],
  },
  {
    id: 'liquify-twirl',
    name: '旋转漩涡',
    description: '螺旋扭曲效果',
    category: 'Liquify',
    icon: '🌀',
    modifiers: [
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 100,
          pressure: 0.8,
          mode: 'Twirl',
          autoDeform: true,
        },
      },
    ],
  },
  {
    id: 'liquify-bloat',
    name: '膨胀效果',
    description: '向外扩张',
    category: 'Liquify',
    icon: '💫',
    modifiers: [
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 120,
          pressure: 0.7,
          mode: 'Bloat',
          autoDeform: true,
        },
      },
    ],
  },
  {
    id: 'liquify-pinch',
    name: '收缩效果',
    description: '向内收缩',
    category: 'Liquify',
    icon: '🎯',
    modifiers: [
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 120,
          pressure: 0.7,
          mode: 'Pinch',
          autoDeform: true,
        },
      },
    ],
  },
];

// ============================================================================
// Mixed / Complex Presets
// ============================================================================

export const MIXED_PRESETS: DistortPreset[] = [
  {
    id: 'underwater',
    name: '水下效果',
    description: '模拟水下观看的效果',
    category: 'Mixed',
    icon: '🌊',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 3,
          amplitude: 15,
          phase: 45,
          direction: 30,
        },
      },
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 10,
          frequency: 1.2,
          octaves: 3,
          speed: 0.5,
        },
      },
    ],
  },
  {
    id: 'heat-haze',
    name: '热浪扭曲',
    description: '炎热空气的光学扭曲',
    category: 'Mixed',
    icon: '🔥',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 12,
          amplitude: 8,
          phase: 0,
          direction: 90,
        },
      },
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 15,
          frequency: 2.5,
          octaves: 4,
          speed: 2,
        },
      },
    ],
  },
  {
    id: 'glass-distortion',
    name: '毛玻璃效果',
    description: '透过毛玻璃观看',
    category: 'Mixed',
    icon: '🪟',
    modifiers: [
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 25,
          frequency: 4,
          octaves: 6,
          speed: 0,
        },
      },
    ],
  },
  {
    id: 'melting',
    name: '熔化效果',
    description: '向下流动的熔化感',
    category: 'Mixed',
    icon: '🍦',
    modifiers: [
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 150,
          pressure: 0.9,
          mode: 'Pull',
          autoDeform: true,
        },
      },
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 6,
          amplitude: 12,
          phase: 0,
          direction: 90,
        },
      },
    ],
  },
  {
    id: 'psychedelic',
    name: '迷幻效果',
    description: '强烈的视觉扭曲',
    category: 'Mixed',
    icon: '🎨',
    modifiers: [
      {
        type: ModifierType.WAVE,
        params: {
          frequency: 15,
          amplitude: 40,
          phase: 135,
          direction: 45,
        },
      },
      {
        type: ModifierType.PERTURB,
        params: {
          amplitude: 35,
          frequency: 3,
          octaves: 7,
          speed: 1,
        },
      },
      {
        type: ModifierType.LIQUIFY,
        params: {
          brushSize: 100,
          pressure: 0.8,
          mode: 'Twirl',
          autoDeform: true,
        },
      },
    ],
  },
];

// ============================================================================
// All Presets Combined
// ============================================================================

export const ALL_DISTORT_PRESETS: DistortPreset[] = [
  ...WAVE_PRESETS,
  ...PERTURB_PRESETS,
  ...LIQUIFY_PRESETS,
  ...MIXED_PRESETS,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 根据 ID 获取预设
 */
export function getPresetById(id: string): DistortPreset | undefined {
  return ALL_DISTORT_PRESETS.find((preset) => preset.id === id);
}

/**
 * 根据类别获取预设
 */
export function getPresetsByCategory(
  category: DistortPreset['category']
): DistortPreset[] {
  return ALL_DISTORT_PRESETS.filter((preset) => preset.category === category);
}

/**
 * 搜索预设
 */
export function searchPresets(query: string): DistortPreset[] {
  const lowerQuery = query.toLowerCase();
  return ALL_DISTORT_PRESETS.filter(
    (preset) =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      preset.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 获取随机预设
 */
export function getRandomPreset(): DistortPreset {
  const index = Math.floor(Math.random() * ALL_DISTORT_PRESETS.length);
  return ALL_DISTORT_PRESETS[index];
}

/**
 * 应用预设到图层
 * 返回需要添加的修饰器列表
 */
export function applyPresetToLayer(presetId: string) {
  const preset = getPresetById(presetId);
  if (!preset) return [];

  return preset.modifiers.map((modifier) => ({
    id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: modifier.type,
    name: preset.name,
    active: true,
    params: modifier.params,
  }));
}
