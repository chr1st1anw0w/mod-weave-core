import { CanvasObject, ImageObject, TextObject, RectangleObject, LayoutObject, GroupObject } from '../types';

// Generate unique IDs
export const generateId = (type: string): string => {
  return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate bounding box for multiple objects
export const getBoundingBox = (objects: CanvasObject[]) => {
  if (objects.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  objects.forEach(obj => {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x + obj.width);
    maxY = Math.max(maxY, obj.y + obj.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

// Check if point is inside object
export const isPointInObject = (
  x: number,
  y: number,
  obj: CanvasObject
): boolean => {
  return (
    x >= obj.x &&
    x <= obj.x + obj.width &&
    y >= obj.y &&
    y <= obj.y + obj.height
  );
};

// Check if two objects are overlapping
export const isOverlapping = (
  obj1: CanvasObject,
  obj2: CanvasObject
): boolean => {
  return !(
    obj1.x + obj1.width < obj2.x ||
    obj2.x + obj2.width < obj1.x ||
    obj1.y + obj1.height < obj2.y ||
    obj2.y + obj2.height < obj1.y
  );
};

// Snap to guides
export const snapToGuides = (
  value: number,
  guides: number[],
  threshold: number = 5
): { value: number; snapped: boolean } => {
  for (const guide of guides) {
    if (Math.abs(value - guide) < threshold) {
      return { value: guide, snapped: true };
    }
  }
  return { value, snapped: false };
};

// Get all snap guides from objects
export const getSnapGuides = (objects: CanvasObject[], excludeIds: Set<string>) => {
  const guides: { vertical: number[]; horizontal: number[] } = {
    vertical: [],
    horizontal: [],
  };

  objects.forEach(obj => {
    if (!excludeIds.has(obj.id)) {
      guides.vertical.push(obj.x, obj.x + obj.width, obj.x + obj.width / 2);
      guides.horizontal.push(obj.y, obj.y + obj.height, obj.y + obj.height / 2);
    }
  });

  return guides;
};

// Transform screen coordinates to canvas coordinates
export const screenToCanvas = (
  screenX: number,
  screenY: number,
  viewport: { x: number; y: number; scale: number },
  containerRect: DOMRect
): { x: number; y: number } => {
  return {
    x: (screenX - containerRect.left - viewport.x) / viewport.scale,
    y: (screenY - containerRect.top - viewport.y) / viewport.scale,
  };
};

// Transform canvas coordinates to screen coordinates
export const canvasToScreen = (
  canvasX: number,
  canvasY: number,
  viewport: { x: number; y: number; scale: number }
): { x: number; y: number } => {
  return {
    x: canvasX * viewport.scale + viewport.x,
    y: canvasY * viewport.scale + viewport.y,
  };
};

// Render object to canvas for AI analysis
export const renderObjectToCanvas = async (
  obj: CanvasObject,
  canvas: HTMLCanvasElement
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = obj.width;
  canvas.height = obj.height;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (obj.type === 'image') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, obj.width, obj.height);
        resolve();
      };
      img.onerror = reject;
      img.src = (obj as ImageObject).src;
    });
  } else if (obj.type === 'text') {
    const textObj = obj as TextObject;
    ctx.fillStyle = textObj.color || '#000000';
    ctx.font = `${textObj.fontSize || 16}px ${textObj.fontFamily || 'sans-serif'}`;
    ctx.fillText(textObj.content, 10, 30);
  } else if (obj.type === 'rectangle') {
    const rectObj = obj as RectangleObject;
    if (rectObj.fill) {
      ctx.fillStyle = rectObj.fill;
      ctx.fillRect(0, 0, obj.width, obj.height);
    }
    if (rectObj.stroke) {
      ctx.strokeStyle = rectObj.stroke;
      ctx.lineWidth = rectObj.strokeWidth || 1;
      ctx.strokeRect(0, 0, obj.width, obj.height);
    }
  }
};

// Generate composite image for multiple objects
export const generateCompositeImage = async (
  objects: CanvasObject[]
): Promise<string> => {
  const bbox = getBoundingBox(objects);
  if (!bbox) return '';

  const canvas = document.createElement('canvas');
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const obj of objects) {
    if (obj.type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(
            img,
            obj.x - bbox.x,
            obj.y - bbox.y,
            obj.width,
            obj.height
          );
          resolve(null);
        };
        img.onerror = resolve; // Continue even if image fails
        img.src = (obj as ImageObject).src;
      });
    } else if (obj.type === 'text') {
      const textObj = obj as TextObject;
      ctx.fillStyle = textObj.color || '#000000';
      ctx.font = `${textObj.fontSize || 16}px ${textObj.fontFamily || 'sans-serif'}`;
      ctx.fillText(textObj.content, obj.x - bbox.x + 10, obj.y - bbox.y + 30);
    } else if (obj.type === 'rectangle') {
      const rectObj = obj as RectangleObject;
      if (rectObj.fill) {
        ctx.fillStyle = rectObj.fill;
        ctx.fillRect(obj.x - bbox.x, obj.y - bbox.y, obj.width, obj.height);
      }
      if (rectObj.stroke) {
        ctx.strokeStyle = rectObj.stroke;
        ctx.lineWidth = rectObj.strokeWidth || 1;
        ctx.strokeRect(obj.x - bbox.x, obj.y - bbox.y, obj.width, obj.height);
      }
    } else if (obj.type === 'layout') {
      const layoutObj = obj as LayoutObject;
      ctx.fillStyle = layoutObj.backgroundColor || '#f0f0f0';
      ctx.fillRect(obj.x - bbox.x, obj.y - bbox.y, obj.width, obj.height);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x - bbox.x, obj.y - bbox.y, obj.width, obj.height);
      
      ctx.fillStyle = '#666666';
      ctx.font = '14px sans-serif';
      ctx.fillText(layoutObj.label, obj.x - bbox.x + 10, obj.y - bbox.y + 25);
    }
  }

  return canvas.toDataURL('image/png');
};
