
import React from 'react';

export interface AnalysisResult {
  analysis: string;
  code: string;
  figmaGuide: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GenerationSettings {
  framework: 'html' | 'react' | 'vue';
  device: 'desktop' | 'mobile' | 'responsive';
  type: 'component' | 'page';
  figmaLayout?: boolean;
  figmaVariables?: boolean;
}

export type AnalysisMode = 'code' | 'wireframe' | 'design-system' | 'style' | 'ux-audit' | 'editable-layer';

export type CanvasObjectType = 'image' | 'text' | 'rectangle' | 'layout' | 'group';

export interface CanvasObject {
  id: string;
  name?: string; 
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  groupId?: string; 
  src?: string; 
  thumbnailSrc?: string;
  content?: string;
  fontSize?: number;
  backgroundColor?: string;
  imageState?: {
    originalWidth: number;
    originalHeight: number;
    scale: number;
    offsetX: number;
    offsetY: number;
  };
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'canvas' | 'object';
  targetId?: string;
  context?: {
    isMulti: boolean;
    hasGroup: boolean;
  };
}

export interface CanvasHandle {
  triggerUpload: () => void;
  addRectangle: () => void;
  addText: () => void;
  addLayout: () => void;
}

export interface CanvasBoardProps {
  objects: CanvasObject[];
  setObjects: React.Dispatch<React.SetStateAction<CanvasObject[]>>;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onError: (error: any) => void;
  isBrowserOpen: boolean;
  onCloseBrowser: () => void;
  settings?: GenerationSettings;
  ref?: React.Ref<CanvasHandle>;
}

export interface Snapshot {
  objects: CanvasObject[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  attachments?: { type: 'image', data: string }[];
}

export type ChatRole = 'user' | 'model';

export interface PropertyPanel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  backgroundColor?: string;
  content?: string;
}
