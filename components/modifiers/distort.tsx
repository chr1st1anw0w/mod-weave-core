import { Icons } from '../Icons';
import { createNode } from './base';

// ────────────────────────────── DISTORT MODIFIERS ──────────────────────────────
// 5 种扭曲变形修饰器：Stretch, Wave, Perturb, Liquify, Displacement Map

/**
 * Stretch - 拉伸或压缩图层
 * 允许沿水平和垂直轴独立缩放，带有强度控制
 */
export const StretchNode = createNode("Stretch", Icons.Move, "text-orange-400", [
  { label: "H. Stretch", key: "hStretch", type: "slider", min: -200, max: 200, unit: "%", def: 100, io: true, dataType: 'number' },
  { label: "V. Stretch", key: "vStretch", type: "slider", min: -200, max: 200, unit: "%", def: 100, io: true, dataType: 'number' },
  { label: "Intensity", key: "intensity", type: "slider", min: 0, max: 5, def: 1, step: 0.1, io: true, dataType: 'number' }
]);

/**
 * Wave - 正弦波扭曲效果
 * 应用波浪形变形，可调节频率、振幅、相位和方向
 */
export const WaveNode = createNode("Wave Warp", Icons.Waves, "text-sky-400", [
  { label: "Frequency", key: "frequency", type: "slider", min: 0.1, max: 20, unit: "Hz", def: 2, step: 0.1, io: true, dataType: 'number' },
  { label: "Amplitude", key: "amplitude", type: "slider", min: 0, max: 200, unit: "px", def: 20, io: true, dataType: 'number' },
  { label: "Phase", key: "phase", type: "slider", min: 0, max: 360, unit: "°", def: 0, io: true, dataType: 'number' },
  { label: "Direction", key: "direction", type: "slider", min: 0, max: 360, unit: "°", def: 0, step: 15, dataType: 'number' }
]);

/**
 * Perturb - 程序化噪声位移
 * 使用 Perlin/Simplex 噪声对像素进行随机位移
 */
export const PerturbNode = createNode("Perturb", Icons.Activity, "text-teal-400", [
  { label: "Amplitude", key: "amplitude", type: "slider", min: 0, max: 100, unit: "px", def: 10, io: true, dataType: 'number' },
  { label: "Frequency", key: "frequency", type: "slider", min: 0.1, max: 5, def: 1, step: 0.1, io: true, dataType: 'number' },
  { label: "Octaves", key: "octaves", type: "slider", min: 1, max: 8, def: 3, step: 1, dataType: 'number' },
  { label: "Speed", key: "speed", type: "slider", min: 0, max: 10, unit: "x", def: 0, step: 0.1, io: true, dataType: 'number' }
]);

/**
 * Liquify - 自由形式画笔扭曲
 * 允许使用画笔工具进行推、拉、旋转、膨胀、收缩等变形
 */
export const LiquifyNode = createNode("Liquify", Icons.Waves, "text-purple-400", [
  { label: "Brush Size", key: "brushSize", type: "slider", min: 10, max: 200, unit: "px", def: 50, io: true, dataType: 'number' },
  { label: "Pressure", key: "pressure", type: "slider", min: 0, max: 1, def: 0.5, step: 0.01, io: true, dataType: 'number' },
  { label: "Mode", key: "mode", type: "select", options: ["Push", "Pull", "Twirl", "Bloat", "Pinch"], def: "Push", dataType: 'string' }
]);

/**
 * Displacement Map - 基于图像的位移
 * 使用灰度图或颜色通道来位移像素，创建复杂的扭曲效果
 */
export const DisplacementNode = createNode("Displace", Icons.Waves, "text-gray-300", [
  { label: "H. Scale", key: "hScale", type: "slider", min: -100, max: 100, unit: "px", def: 10, io: true, dataType: 'number' },
  { label: "V. Scale", key: "vScale", type: "slider", min: -100, max: 100, unit: "px", def: 10, io: true, dataType: 'number' },
  { label: "Map Source", key: "mapSource", type: "select", options: ["Layer", "Luminance", "Red", "Green", "Blue"], def: "Luminance", dataType: 'string' },
  { label: "Wrap", key: "wrap", type: "toggle", def: true, dataType: 'boolean' }
]);
