// Core Canvas Object Types
export type ObjectType = 'image' | 'text' | 'rectangle' | 'layout' | 'group';

export interface BaseObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;
}

export interface ImageObject extends BaseObject {
  type: 'image';
  src: string;
  alt?: string;
}

export interface TextObject extends BaseObject {
  type: 'text';
  content: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
}

export interface RectangleObject extends BaseObject {
  type: 'rectangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface LayoutObject extends BaseObject {
  type: 'layout';
  label: string;
  backgroundColor?: string;
}

export interface GroupObject extends BaseObject {
  type: 'group';
  children: CanvasObject[];
  label?: string;
}

export type CanvasObject = ImageObject | TextObject | RectangleObject | LayoutObject | GroupObject;

// Viewport & Selection
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Guide {
  type: 'vertical' | 'horizontal';
  position: number;
}

// History
export interface HistoryState {
  objects: CanvasObject[];
  selectedIds: string[];
}

// AI Analysis Types
export type AIMode = 'analyze' | 'wireframe' | 'designSystem' | 'style';

export interface AIRequest {
  mode: AIMode;
  imageData?: string;
  objects?: CanvasObject[];
  prompt?: string;
}

export interface AIResponse {
  mode: AIMode;
  analysis?: string;
  code?: string;
  designSystem?: string;
}

// Template Types
export type TemplateType = 
  | 'imageToCode' 
  | 'blankCanvas' 
  | 'componentLab' 
  | 'mobileFlow' 
  | 'dashboard' 
  | 'codeToDesign';

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  initialObjects: CanvasObject[];
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  timestamp: number;
}

export type ChatTool = 
  | 'chat' 
  | 'deepResearch' 
  | 'highlight' 
  | 'slides' 
  | 'fusion' 
  | 'record' 
  | 'agent' 
  | 'write' 
  | 'translate' 
  | 'ocr' 
  | 'avatar';
