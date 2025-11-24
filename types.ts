
export enum LayerType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  SHAPE = 'SHAPE',
  GROUP = 'GROUP'
}

export enum ModifierType {
  // --- 1-15 CORE MODIFIERS ---
  OUTLINE = 'OUTLINE',
  STRETCH = 'STRETCH',
  REPEATER = 'REPEATER',
  PARTICLE_DISSOLVE = 'PARTICLE_DISSOLVE',
  SPRING = 'SPRING',
  WAVE = 'WAVE',
  PARALLAX = 'PARALLAX',
  AI_FILL = 'AI_FILL',
  GLITCH = 'GLITCH',
  REFRACTION = 'REFRACTION',
  HALFTONE_LUMA = 'HALFTONE_LUMA',
  EXTRUDE = 'EXTRUDE',
  BRIGHTNESS_CONTRAST = 'BRIGHTNESS_CONTRAST',
  GRADIENT_MAP = 'GRADIENT_MAP',
  PERTURB = 'PERTURB',

  // --- 16-43 EXTENDED MODIFIERS ---
  REMOVE_BACKGROUND = 'REMOVE_BACKGROUND',
  SPLIT_TO_LAYERS = 'SPLIT_TO_LAYERS',
  PEN_STROKES = 'PEN_STROKES',
  EMBOSS = 'EMBOSS',
  DROP_SHADOW = 'DROP_SHADOW',
  INNER_SHADOW = 'INNER_SHADOW',
  BEVEL_EMBOSS = 'BEVEL_EMBOSS',
  COLOR_OVERLAY = 'COLOR_OVERLAY',
  NOISE = 'NOISE',
  GAUSSIAN_BLUR = 'GAUSSIAN_BLUR',
  MOTION_BLUR = 'MOTION_BLUR',
  RADIAL_BLUR = 'RADIAL_BLUR',
  LIQUIFY = 'LIQUIFY',
  DISPLACEMENT_MAP = 'DISPLACEMENT_MAP',
  THRESHOLD = 'THRESHOLD',
  INVERT = 'INVERT',
  POSTERIZE = 'POSTERIZE',
  HUE_SATURATION = 'HUE_SATURATION',
  CURVES = 'CURVES',
  VIGNETTE = 'VIGNETTE',
  LENS_FLARE = 'LENS_FLARE',
  BLOOM = 'BLOOM',
  CHROMATIC_ABERRATION = 'CHROMATIC_ABERRATION',
  SHARPEN = 'SHARPEN',
  TILT_SHIFT = 'TILT_SHIFT',
  DITHER = 'DITHER',
  PIXELATE = 'PIXELATE',
  KALEIDOSCOPE = 'KALEIDOSCOPE',
  
  // Utility
  MODIFIER_GROUP = 'MODIFIER_GROUP',
  
  // Fallbacks
  EDGE = 'EDGE',
  AI_GENERATION = 'AI_GENERATION',
  LIQUID_MOTION = 'LIQUID_MOTION',
  BLUR = 'BLUR'
}

export type IoDataType = 'number' | 'color' | 'boolean' | 'string' | 'image' | 'generic';

export interface Modifier {
  id: string;
  type: ModifierType;
  name: string;
  active: boolean;
  params: Record<string, any>;
  lastUsed?: number; // Added for 'Recently Used'
  isFavorite?: boolean; // Added for 'Favorites'
  children?: Modifier[]; // For Groups
}

export interface Connection {
  id: string;
  fromModId: string;
  fromPort: string;
  toModId: string;
  toPort: string;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  content?: string; 
  style?: Record<string, any>; 
  modifiers: Modifier[];
  connections?: Connection[]; // Node Wiring
  children?: Layer[]; 
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; 
  text: string;
  timestamp: number;
  widgets?: ChatWidget[]; 
  attachment?: {
    type: 'image';
    url: string;
    base64?: string;
  };
}

export interface ChatWidget {
  type: 'BUTTON' | 'SUGGESTION_CHIP';
  label: string;
  action: string;
  payload?: any;
}

// Added for AI Function Calling
export type AiAction = 
    | { action: 'update_modifier_params'; modId: string; params: Record<string, any> }
    | { action: 'add_modifier'; type: ModifierType; }
    | { action: 'create_connection'; fromModId: string; fromPort: string; toModId: string; toPort: string; };

export interface GeminiResponse {
  text: string;
  generatedImage?: string; // base64
  actionType?: 'NONE' | 'UPDATE_LAYER' | 'CREATE_LAYER' | 'MANIPULATE_NODES';
  actionPayload?: AiAction[]; // New payload for structured actions
}