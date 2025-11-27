import React, { useRef, useEffect } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment shader: diffusion + dynamic noise + viridis colormap
const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;
  uniform sampler2D u_texture;
  uniform vec2 u_texelSize;
  uniform float u_dt;
  uniform float u_diffusion;
  uniform float u_time;

  // Simple hash-based pseudo-random
  float rand(vec2 co, float time) {
    return fract(sin(dot(co.xy + time, vec2(12.9898,78.233))) * 43758.5453);
  }

  float gaussianNoise(vec2 co, float time) {
    float u1 = rand(co, time);
    float u2 = rand(co + 0.1, time + 0.1);
    return sqrt(-2.0 * log(u1 + 1e-6)) * cos(6.2831853 * u2);
  }

  // VIRIDIS colormap approximation
  vec3 viridis(float t){
      const vec3 c0 = vec3(68.0/255.0, 1.0/255.0, 84.0/255.0);
      const vec3 c1 = vec3(71.0/255.0, 44.0/255.0, 122.0/255.0);
      const vec3 c2 = vec3(59.0/255.0, 81.0/255.0, 139.0/255.0);
      const vec3 c3 = vec3(44.0/255.0, 113.0/255.0, 142.0/255.0);
      const vec3 c4 = vec3(33.0/255.0, 144.0/255.0, 141.0/255.0);
      const vec3 c5 = vec3(39.0/255.0, 173.0/255.0, 129.0/255.0);
      const vec3 c6 = vec3(92.0/255.0, 200.0/255.0, 99.0/255.0);
      const vec3 c7 = vec3(253.0/255.0, 231.0/255.0, 37.0/255.0);

      if(t < 0.125) return mix(c0, c1, t/0.125);
      else if(t < 0.25) return mix(c1, c2, (t-0.125)/0.125);
      else if(t < 0.375) return mix(c2, c3, (t-0.25)/0.125);
      else if(t < 0.5) return mix(c3, c4, (t-0.375)/0.125);
      else if(t < 0.625) return mix(c4, c5, (t-0.5)/0.125);
      else if(t < 0.75) return mix(c5, c6, (t-0.625)/0.125);
      else if(t < 0.875) return mix(c6, c7, (t-0.75)/0.125);
      else return mix(c7, c7, (t-0.875)/0.125);
  }

  void main() {
      vec4 u = texture2D(u_texture, v_uv);
      vec4 up = texture2D(u_texture, v_uv + vec2(0.0, u_texelSize.y));
      vec4 down = texture2D(u_texture, v_uv - vec2(0.0, u_texelSize.y));
      vec4 left = texture2D(u_texture, v_uv - vec2(u_texelSize.x, 0.0));
      vec4 right = texture2D(u_texture, v_uv + vec2(u_texelSize.x, 0.0));

      vec4 lap = up + down + left + right - 4.0 * u;

      // Gaussian noise per cell
      float noise = gaussianNoise(v_uv, u_time) * 0.5;

      vec4 next = u + u_dt * u_diffusion * lap + vec4(noise,0,0,0);
      next = clamp(next, -5.0, 5.0);

      gl_FragColor = vec4(viridis((next.r+5.0)/10.0),1.0);
  }
`;

const PDEBackgroundWebGL: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const nx = 100;
    const ny = 100;

    function compileShader(type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    function createFloatTexture() {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const data = new Float32Array(nx * ny * 4);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nx, ny, 0, gl.RGBA, gl.FLOAT, data);
      return tex;
    }

    const texA = createFloatTexture();
    const texB = createFloatTexture();
    const fb = gl.createFramebuffer()!;
    let readTex = texA;
    let writeTex = texB;

    const u_texture = gl.getUniformLocation(program,"u_texture");
    const u_texelSize = gl.getUniformLocation(program,"u_texelSize");
    const u_dt = gl.getUniformLocation(program,"u_dt");
    const u_diffusion = gl.getUniformLocation(program,"u_diffusion");
    const u_time = gl.getUniformLocation(program,"u_time");

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      gl.viewport(0,0,canvas.width,canvas.height);
    }

    resize();
    window.addEventListener("resize", resize);

    function step(time: number) {
      const t = (time - startTimeRef.current) * 0.001;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, writeTex, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readTex);
      gl.uniform1i(u_texture, 0);

      gl.uniform2f(u_texelSize, 1/nx, 1/ny);
      gl.uniform1f(u_dt, 0.00002);
      gl.uniform1f(u_diffusion, 0.5);
      gl.uniform1f(u_time, t);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      [readTex, writeTex] = [writeTex, readTex];

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readTex);
      gl.uniform1i(u_texture, 0);
      gl.uniform1f(u_time, t);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(step);
    }

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if(animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{display:"block"}} />;
};

export default PDEBackgroundWebGL;

