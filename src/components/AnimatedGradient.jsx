// AnimatedGradient.jsx
// Replicates the Stripe gradient using WebGL fragment shaders.
// Usage: <AnimatedGradient colors={['#ff6ec7', '#a855f7', '#3b82f6']} />
// Drop it as the first child of your root layout div and give it position:fixed, inset:0, zIndex:-1

import { useEffect, useRef } from 'react';

// ── VERTEX SHADER ──────────────────────────────────────────────────────────
// Runs once per vertex (just the 4 corners of a fullscreen quad).
// Passes UV coordinates to the fragment shader.
const VERT = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5; // convert from clip space [-1,1] to UV space [0,1]
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// ── FRAGMENT SHADER ────────────────────────────────────────────────────────
// Runs for every pixel on screen. This is where the gradient magic happens.
// It blends 4 animated "blobs" of color using smooth distance falloff.
const FRAG = `
  precision highp float;

  uniform float u_time;       // elapsed time in seconds (drives animation)
  uniform vec2  u_resolution; // canvas size in pixels (for aspect ratio)
  uniform vec3  u_color0;     // blob color 0
  uniform vec3  u_color1;     // blob color 1
  uniform vec3  u_color2;     // blob color 2
  uniform vec3  u_color3;     // blob color 3 (accent / highlight)

  varying vec2 vUv; // UV coords from vertex shader (0,0 bottom-left → 1,1 top-right)

  // smooth_blob: returns a soft circular influence from a moving point.
  // pos = current UV pixel, center = blob center, radius = falloff size.
  // Uses smoothstep so the edges fade out softly instead of hard cutoff.
  float smooth_blob(vec2 pos, vec2 center, float radius) {
    float d = distance(pos, center);
    return smoothstep(radius, 0.0, d);
  }

  void main() {
    // Correct UV for aspect ratio so blobs are circular, not stretched.
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vec2(vUv.x * aspect, vUv.y);

    float t = u_time * 0.35; // slow the time down so the animation isn't frantic

    // ── Blob positions ──
    // Each blob moves along a unique Lissajous-style path using sin/cos
    // with different frequencies and phase offsets — this creates the
    // organic, non-repeating flow. Multiply aspect on x so they cover the screen.
    vec2 b0 = vec2(
      aspect * (0.5 + 0.38 * sin(t * 0.7 + 0.0)),
      0.5 + 0.35 * cos(t * 0.5 + 1.0)
    );
    vec2 b1 = vec2(
      aspect * (0.5 + 0.40 * cos(t * 0.6 + 2.1)),
      0.5 + 0.38 * sin(t * 0.8 + 0.5)
    );
    vec2 b2 = vec2(
      aspect * (0.5 + 0.35 * sin(t * 0.9 + 4.2)),
      0.5 + 0.40 * cos(t * 0.4 + 3.3)
    );
    vec2 b3 = vec2(
      aspect * (0.5 + 0.42 * cos(t * 0.5 + 1.5)),
      0.5 + 0.36 * sin(t * 0.7 + 2.8)
    );

    // ── Blob influences ──
    // Each returns a 0→1 value: 1 at the blob center, 0 at the edges.
    // Radius controls how large/soft each blob is.
    float w0 = smooth_blob(uv, b0, 0.85);
    float w1 = smooth_blob(uv, b1, 0.90);
    float w2 = smooth_blob(uv, b2, 0.80);
    float w3 = smooth_blob(uv, b3, 0.70);

    // ── Color mixing ──
    // Start with color0 as the base, then blend each subsequent color
    // proportionally to its blob's influence at this pixel.
    // This creates the smooth multi-color gradient effect.
    float total = w0 + w1 + w2 + w3 + 0.001; // +0.001 avoids division by zero
    vec3 color = (u_color0 * w0 + u_color1 * w1 + u_color2 * w2 + u_color3 * w3) / total;

    // Boost saturation slightly — WebGL colors can look washed out otherwise.
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luminance), color, 1.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Helper: compile a shader ───────────────────────────────────────────────
function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// ── Helper: hex color string → normalized [r, g, b] floats (0→1) ──────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AnimatedGradient({
  // Default Stripe-like colors. Pass your own array of 4 hex strings to override.
  colors = ['#e040fb', '#ff6ec7', '#ff8c42', '#5c6bc0'],
  style = {},
}) {
  const canvasRef = useRef(null);
  // Store the 4 colors in a ref so the animation loop always reads the latest
  // value without needing to restart the loop when colors change.
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // ── Build shader program ───────────────────────────────────────────────
    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    // ── Fullscreen quad ───────────────────────────────────────────────────
    // Two triangles that cover the entire clip space [-1, 1].
    // The fragment shader runs for every pixel inside them.
    const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Uniform locations (handles to pass data into the shader) ──────────
    const uTime       = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uColor0     = gl.getUniformLocation(program, 'u_color0');
    const uColor1     = gl.getUniformLocation(program, 'u_color1');
    const uColor2     = gl.getUniformLocation(program, 'u_color2');
    const uColor3     = gl.getUniformLocation(program, 'u_color3');

    // ── Resize handler ────────────────────────────────────────────────────
    // Keeps the canvas pixel-perfect when the window resizes.
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Animation loop ────────────────────────────────────────────────────
    let rafId;
    const start = performance.now();

    const render = () => {
      const t = (performance.now() - start) / 1000; // seconds elapsed

      // Parse the current 4 colors from the ref (so color changes are live)
      const c = colorsRef.current;
      const [r0,g0,b0] = hexToRgb(c[0] || '#e040fb');
      const [r1,g1,b1] = hexToRgb(c[1] || '#ff6ec7');
      const [r2,g2,b2] = hexToRgb(c[2] || '#ff8c42');
      const [r3,g3,b3] = hexToRgb(c[3] || '#5c6bc0');

      // Pass values into the shader uniforms
      gl.uniform1f(uTime, t);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform3f(uColor0, r0, g0, b0);
      gl.uniform3f(uColor1, r1, g1, b1);
      gl.uniform3f(uColor2, r2, g2, b2);
      gl.uniform3f(uColor3, r3, g3, b3);

      // Draw the fullscreen quad (2 triangles = 4 vertices)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafId = requestAnimationFrame(render);
    };

    render();

    // ── Cleanup ───────────────────────────────────────────────────────────
    // When the component unmounts, stop the animation loop and free GPU memory.
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, []); // empty deps — only runs once on mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,        // sits behind everything
        display: 'block',
        ...style,
      }}
    />
  );
}