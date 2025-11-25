/**
 * WebGL Renderer Service
 * 提供高性能的 shader-based 图像效果渲染
 * 支持 Wave、Displacement Map 等需要像素级操作的修饰器
 */

// ============================================================================
// WebGL 工具函数
// ============================================================================

/**
 * 创建并编译 shader
 */
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * 创建 shader 程序
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// ============================================================================
// 基础 Vertex Shader（所有效果共用）
// ============================================================================

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// ============================================================================
// Wave Effect Fragment Shader
// ============================================================================

const WAVE_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform float u_frequency;
  uniform float u_amplitude;
  uniform float u_phase;
  uniform float u_direction; // 方向角度（弧度）
  uniform float u_time;

  varying vec2 v_texCoord;

  void main() {
    vec2 uv = v_texCoord;

    // 计算方向向量
    vec2 dir = vec2(cos(u_direction), sin(u_direction));

    // 计算沿方向的距离
    float dist = dot(uv, dir);

    // 应用波浪偏移
    float wave = sin(dist * u_frequency + u_phase + u_time) * u_amplitude;

    // 垂直于方向的偏移
    vec2 perpDir = vec2(-dir.y, dir.x);
    vec2 offset = perpDir * wave / u_resolution;

    // 采样纹理
    vec4 color = texture2D(u_image, uv + offset);

    gl_FragColor = color;
  }
`;

// ============================================================================
// Displacement Map Fragment Shader
// ============================================================================

const DISPLACEMENT_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform sampler2D u_displacementMap;
  uniform vec2 u_resolution;
  uniform float u_hScale;
  uniform float u_vScale;
  uniform int u_mapSource; // 0=Luminance, 1=Red, 2=Green, 3=Blue
  uniform bool u_wrap;

  varying vec2 v_texCoord;

  void main() {
    // 读取位移图
    vec4 mapColor = texture2D(u_displacementMap, v_texCoord);

    // 根据 mapSource 选择通道
    float displacement;
    if (u_mapSource == 0) {
      // Luminance
      displacement = dot(mapColor.rgb, vec3(0.299, 0.587, 0.114));
    } else if (u_mapSource == 1) {
      displacement = mapColor.r;
    } else if (u_mapSource == 2) {
      displacement = mapColor.g;
    } else {
      displacement = mapColor.b;
    }

    // 将 [0, 1] 映射到 [-1, 1]
    displacement = displacement * 2.0 - 1.0;

    // 计算位移偏移
    vec2 offset = vec2(
      displacement * u_hScale / u_resolution.x,
      displacement * u_vScale / u_resolution.y
    );

    // 计算新的 UV 坐标
    vec2 newUV = v_texCoord + offset;

    // 处理边界
    if (u_wrap) {
      newUV = fract(newUV);
    } else {
      newUV = clamp(newUV, 0.0, 1.0);
    }

    // 采样纹理
    vec4 color = texture2D(u_image, newUV);

    gl_FragColor = color;
  }
`;

// ============================================================================
// Perturb (Noise) Fragment Shader
// ============================================================================

const PERTURB_FRAGMENT_SHADER = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform float u_amplitude;
  uniform float u_frequency;
  uniform int u_octaves;
  uniform float u_time;

  varying vec2 v_texCoord;

  // Simplex Noise 2D
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                              + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 分形噪声
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = u_frequency;

    for (int i = 0; i < 8; i++) {
      if (i >= u_octaves) break;
      value += amplitude * snoise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 p = v_texCoord * u_resolution / 100.0;

    // 生成噪声偏移
    float noiseX = fbm(p + vec2(u_time * 0.1, 0.0));
    float noiseY = fbm(p + vec2(0.0, u_time * 0.1));

    vec2 offset = vec2(noiseX, noiseY) * u_amplitude / u_resolution;

    // 采样纹理
    vec2 newUV = v_texCoord + offset;
    newUV = clamp(newUV, 0.0, 1.0);

    vec4 color = texture2D(u_image, newUV);

    gl_FragColor = color;
  }
`;

// ============================================================================
// WebGL Renderer Class
// ============================================================================

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null;
  private programs: Map<string, WebGLProgram> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();
  private time: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;

    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    this.initializeShaders();
  }

  /**
   * 初始化所有 shader 程序
   */
  private initializeShaders() {
    if (!this.gl) return;

    const gl = this.gl;
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    if (!vertexShader) return;

    // 编译所有 fragment shaders
    const shaders = {
      wave: WAVE_FRAGMENT_SHADER,
      displacement: DISPLACEMENT_FRAGMENT_SHADER,
      perturb: PERTURB_FRAGMENT_SHADER,
    };

    for (const [name, source] of Object.entries(shaders)) {
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, source);
      if (!fragmentShader) continue;

      const program = createProgram(gl, vertexShader, fragmentShader);
      if (program) {
        this.programs.set(name, program);
      }
    }
  }

  /**
   * 设置渲染目标尺寸
   */
  private setupCanvas(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.gl) {
      this.gl.viewport(0, 0, width, height);
    }
  }

  /**
   * 创建纹理
   */
  private createTexture(image: HTMLImageElement | HTMLCanvasElement): WebGLTexture | null {
    if (!this.gl) return null;

    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  /**
   * 设置顶点缓冲区
   */
  private setupBuffers(program: WebGLProgram) {
    if (!this.gl) return;

    const gl = this.gl;

    // 位置缓冲区（全屏四边形）
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 纹理坐标缓冲区
    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0,
    ]);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
  }

  /**
   * 渲染 Wave 效果
   */
  renderWave(
    image: HTMLImageElement | HTMLCanvasElement,
    params: {
      frequency: number;
      amplitude: number;
      phase: number;
      direction: number;
    }
  ): HTMLCanvasElement {
    if (!this.gl) return this.canvas;

    const gl = this.gl;
    const program = this.programs.get('wave');
    if (!program) return this.canvas;

    this.setupCanvas(image.width, image.height);

    const texture = this.createTexture(image);
    if (!texture) return this.canvas;

    gl.useProgram(program);
    this.setupBuffers(program);

    // 设置 uniforms
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), image.width, image.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_frequency'), params.frequency);
    gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude / 1000); // 归一化
    gl.uniform1f(gl.getUniformLocation(program, 'u_phase'), params.phase * Math.PI / 180);
    gl.uniform1f(gl.getUniformLocation(program, 'u_direction'), params.direction * Math.PI / 180);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), this.time);

    // 渲染
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 清理
    gl.deleteTexture(texture);

    this.time += 0.016; // ~60fps

    return this.canvas;
  }

  /**
   * 渲染 Displacement Map 效果
   */
  renderDisplacement(
    image: HTMLImageElement | HTMLCanvasElement,
    displacementMap: HTMLImageElement | HTMLCanvasElement,
    params: {
      hScale: number;
      vScale: number;
      mapSource: 'Luminance' | 'Red' | 'Green' | 'Blue';
      wrap: boolean;
    }
  ): HTMLCanvasElement {
    if (!this.gl) return this.canvas;

    const gl = this.gl;
    const program = this.programs.get('displacement');
    if (!program) return this.canvas;

    this.setupCanvas(image.width, image.height);

    const texture = this.createTexture(image);
    const displacementTexture = this.createTexture(displacementMap);
    if (!texture || !displacementTexture) return this.canvas;

    gl.useProgram(program);
    this.setupBuffers(program);

    // 设置 uniforms
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, displacementTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_displacementMap'), 1);

    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), image.width, image.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_hScale'), params.hScale);
    gl.uniform1f(gl.getUniformLocation(program, 'u_vScale'), params.vScale);

    const mapSourceMap = { 'Luminance': 0, 'Red': 1, 'Green': 2, 'Blue': 3 };
    gl.uniform1i(gl.getUniformLocation(program, 'u_mapSource'), mapSourceMap[params.mapSource]);
    gl.uniform1i(gl.getUniformLocation(program, 'u_wrap'), params.wrap ? 1 : 0);

    // 渲染
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 清理
    gl.deleteTexture(texture);
    gl.deleteTexture(displacementTexture);

    return this.canvas;
  }

  /**
   * 渲染 Perturb 效果
   */
  renderPerturb(
    image: HTMLImageElement | HTMLCanvasElement,
    params: {
      amplitude: number;
      frequency: number;
      octaves: number;
      speed: number;
    }
  ): HTMLCanvasElement {
    if (!this.gl) return this.canvas;

    const gl = this.gl;
    const program = this.programs.get('perturb');
    if (!program) return this.canvas;

    this.setupCanvas(image.width, image.height);

    const texture = this.createTexture(image);
    if (!texture) return this.canvas;

    gl.useProgram(program);
    this.setupBuffers(program);

    // 设置 uniforms
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), image.width, image.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_amplitude'), params.amplitude / 100); // 归一化
    gl.uniform1f(gl.getUniformLocation(program, 'u_frequency'), params.frequency);
    gl.uniform1i(gl.getUniformLocation(program, 'u_octaves'), Math.floor(params.octaves));
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), this.time * params.speed);

    // 渲染
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 清理
    gl.deleteTexture(texture);

    this.time += 0.016;

    return this.canvas;
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    if (!this.gl) return;

    // 删除所有程序
    this.programs.forEach(program => {
      this.gl?.deleteProgram(program);
    });
    this.programs.clear();

    // 删除所有纹理
    this.textures.forEach(texture => {
      this.gl?.deleteTexture(texture);
    });
    this.textures.clear();
  }
}

// 全局单例
let globalRenderer: WebGLRenderer | null = null;

export function getWebGLRenderer(): WebGLRenderer {
  if (!globalRenderer) {
    globalRenderer = new WebGLRenderer();
  }
  return globalRenderer;
}
