// --- Types (extracted from GeneratorContext.tsx) ---

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'custom';
export type SequenceType = 'none' | 'linear' | 'geometric' | 'fibonacci' | 'power' | 'custom';
export type SequenceDirection = 'row' | 'column' | 'radial' | 'diagonal';
export type CurveType = 'linear' | 'quadratic' | 'cubic' | 'exponential' | 'sine' | 'logarithmic';

export interface GradientStop {
    id: string;
    color: string;
    position: number; // 0 to 100
}

export interface GradientState {
    type: 'linear' | 'radial';
    angle: number;
    stops: GradientStop[];
}

export interface MaskInfluenceSettings {
    enabled: boolean;
    min: number;
    max: number;
}

export interface GeneratorState {
  grid: {
    width: number;
    height: number;
    spacingX: number;
    spacingY: number;
    cols: number;
    rows: number;
  };
  unit: {
    shape: ShapeType;
    strokeWidth: number;
    strokeColor: string;
    borderRadius: number | [number, number, number, number];
    customSvg: string | null;
  };
  transform: {
    rotation: number;
    variance: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
  };
  sequence: {
    type: SequenceType;
    min: number;
    max: number;
    direction: SequenceDirection;
    angle: number;
    reverse: boolean;
    applyTo: string[];
    customValues: number[];
  };
  mask: {
    type: 'image' | 'perlin';
    imageUrl: string | null;
    opacity: number;
    perlin: {
        scale: number;
        seed: number;
    };
    settings: {
        width: MaskInfluenceSettings;
        height: MaskInfluenceSettings;
        opacity: MaskInfluenceSettings;
        rotation: MaskInfluenceSettings;
        radius: MaskInfluenceSettings;
        color: MaskInfluenceSettings;
        strokeWidth: MaskInfluenceSettings;
        x: MaskInfluenceSettings;
        y: MaskInfluenceSettings;
    };
  };
  distortion: {
    waveAmount: number;
    waveFreq: number;
    vortexAmount: number;
    vortexRadius: number;
  };
  colors: {
    background: string;
    gradient: GradientState;
  };
}

// --- Utilities (from generatorUtils.ts) ---

export interface MaskData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
}

export function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

export function interpolateColor(color1: string, color2: string, factor: number) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r},${g},${b})`;
}

export function getGradientColor(stops: any[], position: number) {
    if (stops.length === 0) return '#ffffff';
    if (position <= stops[0].position) return stops[0].color;
    if (position >= stops[stops.length - 1].position) return stops[stops.length - 1].color;

    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (position >= start.position && position <= end.position) {
            const t = (position - start.position) / (end.position - start.position);
            return interpolateColor(start.color, end.color, t);
        }
    }
    return stops[0].color;
}

export function calculateProps(
    x: number, y: number, i: number, j: number,
    cols: number, rows: number, width: number, height: number,
    state: GeneratorState, maskData: MaskData | null
) {
    let seqVal = 1.0;
    if (state.sequence.type !== 'none') {
        const angleRad = (state.sequence.angle || 0) * Math.PI / 180;
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const px = i - cx;
        const py = j - cy;

        let t = 0;
        let patternIdx = 0;

        if (state.sequence.direction === 'radial') {
             const maxDist = Math.sqrt(cx * cx + cy * cy);
             const dist = Math.sqrt(px * px + py * py);
             t = dist / Math.max(1, maxDist);
             patternIdx = Math.floor(dist);
        } else {
             let theta = angleRad;
             if (state.sequence.direction === 'column') theta += Math.PI / 2;
             else if (state.sequence.direction === 'diagonal') theta += Math.PI / 4;

             const getProj = (x: number, y: number) => x * Math.cos(theta) + y * Math.sin(theta);
             const proj = getProj(px, py);
             patternIdx = Math.floor(proj);

             const corners = [
                { x: -cx, y: -cy }, { x: cols - 1 - cx, y: -cy },
                { x: -cx, y: rows - 1 - cy }, { x: cols - 1 - cx, y: rows - 1 - cy }
             ];
             let minProj = Infinity, maxProj = -Infinity;
             for (const c of corners) {
                 const p = getProj(c.x, c.y);
                 minProj = Math.min(minProj, p);
                 maxProj = Math.max(maxProj, p);
             }
             t = (proj - minProj) / Math.max(0.001, maxProj - minProj);
        }

        if (state.sequence.reverse) t = 1 - t;

        if (state.sequence.type === 'custom' && state.sequence.customValues?.length) {
            const len = state.sequence.customValues.length;
            const idx = ((patternIdx % len) + len) % len;
            seqVal = state.sequence.customValues[idx];
        } else {
            const { min, max } = state.sequence;
            seqVal = lerp(min, max, t);
        }
    }

    let sizeMod = state.sequence.applyTo.includes('size') ? seqVal : 0;
    let rotMod = state.sequence.applyTo.includes('rotation') ? seqVal : 0;
    let opacityMod = 1 + (state.sequence.applyTo.includes('opacity') ? seqVal : 0);

    let dx = x, dy = y;
    if (state.distortion.waveAmount !== 0) {
         dx += Math.sin(dy * 0.01 * state.distortion.waveFreq) * state.distortion.waveAmount;
         dy += Math.cos(dx * 0.01 * state.distortion.waveFreq) * state.distortion.waveAmount;
    }

    let maskLum = 0;
    if (maskData) {
         const mx = Math.floor((dx / width) * maskData.width);
         const my = Math.floor((dy / height) * maskData.height);
         if (mx >= 0 && mx < maskData.width && my >= 0 && my < maskData.height) {
             const idx = (my * maskData.width + mx) * 4;
             maskLum = (0.299 * maskData.data[idx] + 0.587 * maskData.data[idx+1] + 0.114 * maskData.data[idx+2]) / 255;
         }
    }

    const { settings } = state.mask;
    const maskIntensity = state.mask.opacity / 100;

    let radiusMod = 0;
    let colorShift = 0;
    let xMod = 0;
    let yMod = 0;
    let strokeWidth = state.unit.strokeWidth;

    let scaleXMod = 1 + sizeMod;
    let scaleYMod = 1 + sizeMod;

    if (settings.width?.enabled) {
        const targetPx = lerp(settings.width.min, settings.width.max, maskLum);
        scaleXMod = lerp(scaleXMod, targetPx / (state.grid.width || 1), maskIntensity);
    }
    if (settings.height?.enabled) {
        const targetPx = lerp(settings.height.min, settings.height.max, maskLum);
        scaleYMod = lerp(scaleYMod, targetPx / (state.grid.height || 1), maskIntensity);
    }
    if (settings.opacity?.enabled) {
        const target = lerp(settings.opacity.min, settings.opacity.max, maskLum);
        opacityMod *= lerp(1, target, maskIntensity);
    }
    if (settings.rotation?.enabled) {
        const target = lerp(settings.rotation.min, settings.rotation.max, maskLum);
        rotMod += lerp(0, target, maskIntensity);
    }
    if (settings.radius?.enabled) {
        const target = lerp(settings.radius.min, settings.radius.max, maskLum);
        radiusMod = lerp(0, target, maskIntensity);
    }
    if (settings.color?.enabled) {
        const target = lerp(settings.color.min, settings.color.max, maskLum);
        colorShift = lerp(0, target, maskIntensity);
    }
    if (settings.strokeWidth?.enabled) {
        const target = lerp(settings.strokeWidth.min, settings.strokeWidth.max, maskLum);
        strokeWidth = lerp(strokeWidth, target, maskIntensity);
    }
    if (settings.x?.enabled) {
        const target = lerp(settings.x.min, settings.x.max, maskLum);
        xMod = lerp(0, target, maskIntensity);
    }
    if (settings.y?.enabled) {
        const target = lerp(settings.y.min, settings.y.max, maskLum);
        yMod = lerp(0, target, maskIntensity);
    }

    const angleRad = state.colors.gradient.angle * Math.PI / 180;
    const cx = width / 2;
    const cy = height / 2;
    const px = dx - cx;
    const py = dy - cy;
    const rotatedX = px * Math.cos(-angleRad) - py * Math.sin(-angleRad);
    const maxDist = Math.sqrt(width*width + height*height) / 2;
    let t = (rotatedX + maxDist) / (maxDist * 2);

    return {
        x: dx, y: dy, xOffset: 0, yOffset: 0,
        rotation: state.transform.rotation + rotMod,
        scaleX: state.transform.scaleX * scaleXMod,
        scaleY: state.transform.scaleY * scaleYMod,
        skewX: state.transform.skewX || 0,
        skewY: state.transform.skewY || 0,
        opacity: opacityMod,
        radiusMod: 0,
        strokeWidth: state.unit.strokeWidth,
        colorT: t * 100
    };
}

export function generateSVG(state: GeneratorState, maskData: MaskData | null) {
    const { spacingX, spacingY, width: w, height: h, cols, rows } = state.grid;
    const gridWidth = (cols - 1) * spacingX;
    const gridHeight = (rows - 1) * spacingY;
    const exportW = gridWidth + spacingX * 4;
    const exportH = gridHeight + spacingY * 4;
    const startX = (exportW - gridWidth) / 2;
    const startY = (exportH - gridHeight) / 2;
    const sortedStops = [...state.colors.gradient.stops].sort((a, b) => a.position - b.position);

    let shapesSVG = '';
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = startX + i * spacingX;
        let y = startY + j * spacingY;
        const props = calculateProps(x, y, i, j, cols, rows, exportW, exportH, state, maskData);
        const color = getGradientColor(sortedStops, props.colorT);
        const transform = `translate(${props.x}, ${props.y}) rotate(${props.rotation}) scale(${props.scaleX}, ${props.scaleY})`;

        let shapeInner = '';
        if (state.unit.shape === 'rect') {
             const radius = Math.max(0, (typeof state.unit.borderRadius === 'number' ? state.unit.borderRadius : 0) + props.radiusMod);
             shapeInner = `<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${radius}" fill="${color}" fill-opacity="${props.opacity}" stroke="${state.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        } else if (state.unit.shape === 'circle') {
             shapeInner = `<circle cx="0" cy="0" r="${w/2}" fill="${color}" fill-opacity="${props.opacity}" stroke="${state.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        } else if (state.unit.shape === 'triangle') {
             shapeInner = `<polygon points="0,${-h/2} ${w/2},${h/2} ${-w/2},${h/2}" fill="${color}" fill-opacity="${props.opacity}" stroke="${state.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        } else if (state.unit.shape === 'custom' && state.unit.customSvg) {
             const pathData = state.unit.customSvg.replace(/"/g, "'");
             shapeInner = `<path d="${pathData}" transform="translate(${-w/2}, ${-h/2})" fill="${color}" fill-opacity="${props.opacity}" stroke="${state.unit.strokeColor}" stroke-width="${props.strokeWidth}" />`;
        }
        shapesSVG += `<g transform="${transform}">${shapeInner}</g>`;
      }
    }

    return `
<svg width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${state.colors.background}" />
  ${shapesSVG}
</svg>`;
}
