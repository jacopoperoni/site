import React, { useRef, useEffect } from "react";
import { VIRIDIS } from "./viridis";

const PDEBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let nx: number, ny: number;
    let u: Float32Array, u_new: Float32Array;
    const dt = 0.15;
    const diffusion = 1;
    const noiseStrength = 0.05;

    // Box - Muller transform
    function randn_bm(mean = 0, std = 1) {
      let u = 0, v = 0;
      while (u === 0) u = Math.random(); // avoid 0
      while (v === 0) v = Math.random();
      const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return num * std + mean;
    }

    // Initialize field with random values
    function initField() {
      for (let i = 0; i < u.length; i++) {
        u[i] = randn_bm(0, 0.5);
      }
    }

    // Resize canvas and recompute grid
    function resizeCanvas() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const cssWidth = rect.width;
      const cssHeight = rect.height;

      // Fill parent visually
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      // Internal buffer for HiDPI
      canvas.width = cssWidth * window.devicePixelRatio;
      canvas.height = cssHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

      // Grid resolution: maintain aspect ratio
      ny = 250; // fixed vertical cells
      nx = Math.floor((ny * cssWidth) / cssHeight);

      u = new Float32Array(nx * ny);
      u_new = new Float32Array(nx * ny);
      initField();
    }

    resizeCanvas();

    function lap(x: number, y: number) {
      const idx = x + y * nx;
      const u0 = u[idx];

      const ux1 = u[(x + 1 < nx ? x + 1 : 0) + y * nx];
      const ux2 = u[(x - 1 >= 0 ? x - 1 : nx - 1) + y * nx];
      const uy1 = u[x + (y + 1 < ny ? y + 1 : 0) * nx];
      const uy2 = u[x + (y - 1 >= 0 ? y - 1 : ny - 1) * nx];

      return ux1 + ux2 + uy1 + uy2 - 4 * u0;
    }

    function step() {
      for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
          const idx = x + y * nx;
          u_new[idx] =
            u[idx] +
            dt * diffusion * lap(x, y) +
            noiseStrength * randn_bm(0, 0.5);
        }
      }
      u.set(u_new);
    }

    function draw() {
      const width = canvas.width;   // full internal buffer
      const height = canvas.height; // full internal buffer

      const image = ctx.createImageData(width, height);

      // Compute min/max for normalization
      let minVal = Infinity;
      let maxVal = -Infinity;
      for (let i = 0; i < u.length; i++) {
        const v = u[i];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
      const range = Math.max(maxVal - minVal, 1e-9);

      for (let j = 0; j < height; j++) {
        const y = Math.floor((j / height) * ny);
        for (let i = 0; i < width; i++) {
          const x = Math.floor((i / width) * nx);
          const v = u[x + y * nx];

          let val = (v - minVal) / range;
          val = Math.min(1, Math.max(0, val));

          let ci = Math.floor(val * (VIRIDIS.length - 1));
          ci = Math.max(0, Math.min(VIRIDIS.length - 1, ci));
          const color = VIRIDIS[ci];

          const idx = 4 * (i + j * width);
          image.data[idx] = color[0];
          image.data[idx + 1] = color[1];
          image.data[idx + 2] = color[2];
          image.data[idx + 3] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);
    }

    function loop() {
      for (let k = 0; k < 3; k++) step();
      draw();
      requestAnimationFrame(loop);
    }
    loop();

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
};

export default PDEBackground;

