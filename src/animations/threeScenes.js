import * as THREE from 'three';

const createRenderer = (canvas) => {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setSize(window.innerWidth, window.innerHeight);
  r.setClearColor(0x000000, 0);
  return r;
};

// ─── AURORA ──────────────────────────────────────────────────────────────────
// Flowing northern-lights curtains with green/teal wave ribbons
export class AuroraBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationId = null;
    this.mouse = new THREE.Vector2();
    this._onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    this.init();
  }

  init() {
    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this._buildWaves();
    this._buildParticles();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize', this._onResize);
    this.animate();
  }

  _buildWaves() {
    this.waves = [];
    const configs = [
      { color: 0x10b981, y: 2.5,  z: -3,   opacity: 0.14, phase: 0             },
      { color: 0x06b6d4, y: 1.2,  z: -2.2, opacity: 0.11, phase: Math.PI / 2   },
      { color: 0x4ade80, y: -0.2, z: -1.5, opacity: 0.09, phase: Math.PI       },
      { color: 0x34d399, y: -1.8, z: -2.8, opacity: 0.10, phase: Math.PI * 1.5 },
      { color: 0x2dd4bf, y: 3.5,  z: -4,   opacity: 0.08, phase: Math.PI / 3   },
    ];
    configs.forEach(({ color, y, z, opacity, phase }) => {
      const geo = new THREE.PlaneGeometry(26, 2.5, 150, 1);
      const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, y, z);
      mesh.userData = { phase, baseY: y };
      this.scene.add(mesh);
      this.waves.push(mesh);
    });
  }

  _buildParticles() {
    const count = 1800;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [0x10b981, 0x06b6d4, 0x4ade80, 0x34d399, 0x2dd4bf].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.02, vertexColors: true, transparent: true, opacity: 0.55, sizeAttenuation: true,
    }));
    this.scene.add(this.particles);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const t = Date.now() * 0.0004;
    this.waves.forEach((wave) => {
      const pos = wave.geometry.attributes.position;
      const { phase, baseY } = wave.userData;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, Math.sin(x * 0.22 + t + phase) * 0.55 + Math.sin(x * 0.07 + t * 0.6 + phase) * 0.3);
      }
      pos.needsUpdate = true;
      wave.position.y = baseY + Math.sin(t * 0.45 + phase) * 0.28;
    });
    this.particles.rotation.y = t * 0.015;
    this.camera.position.x += (this.mouse.x * 0.4 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 0.25 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}

// ─── EMBER ───────────────────────────────────────────────────────────────────
// Rising fire sparks and embers drifting upward
export class EmberBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationId = null;
    this.mouse = new THREE.Vector2();
    this._onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    this.init();
  }

  init() {
    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this._buildEmbers();
    this._buildOrbs();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize', this._onResize);
    this.animate();
  }

  _buildEmbers() {
    const count = 2500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this._vel = new Float32Array(count * 2); // vx, vy
    this._phase = new Float32Array(count);
    const palette = [0xf97316, 0xef4444, 0xf59e0b, 0xfbbf24, 0xff6b35].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 16 - 10; // biased toward bottom
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      this._vel[i * 2]     = (Math.random() - 0.5) * 0.01;       // x drift
      this._vel[i * 2 + 1] = Math.random() * 0.03 + 0.012;       // upward speed
      this._phase[i]       = Math.random() * Math.PI * 2;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.emberGeo = geo;
    this.embers = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.03, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true,
    }));
    this.scene.add(this.embers);
  }

  _buildOrbs() {
    this.orbs = [
      { color: 0xf97316, pos: [-2.5, -4, -2], size: 1.1 },
      { color: 0xef4444, pos: [3, -5, -3],     size: 0.8 },
      { color: 0xfbbf24, pos: [0.5, -3, -1],   size: 0.6 },
    ].map(({ color, pos, size }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 20, 20),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 }),
      );
      mesh.position.set(...pos);
      this.scene.add(mesh);
      return mesh;
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const t = Date.now() * 0.0005;
    const pos = this.emberGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) + this._vel[i * 2] + Math.sin(t * 2 + this._phase[i]) * 0.004;
      let y = pos.getY(i) + this._vel[i * 2 + 1];
      const z = pos.getZ(i);
      if (y > 8) {
        x = (Math.random() - 0.5) * 16;
        y = -10 + Math.random() * 2;
      }
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    this.orbs.forEach((orb, i) => { orb.position.y += Math.sin(t + i * 1.2) * 0.003; });
    this.camera.position.x += (this.mouse.x * 0.4 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 0.2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}

// ─── OCEAN ───────────────────────────────────────────────────────────────────
// Deep-sea bioluminescent particles with wave motion
export class OceanBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationId = null;
    this.mouse = new THREE.Vector2();
    this._onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    this.init();
  }

  init() {
    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this._buildGrid();
    this._buildParticles();
    this._buildOrbs();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize', this._onResize);
    this.animate();
  }

  _buildGrid() {
    const grid = new THREE.GridHelper(32, 32, 0x1d4ed8, 0x0a1628);
    grid.position.y = -5;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    this.scene.add(grid);
  }

  _buildParticles() {
    const count = 2500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this._baseY = new Float32Array(count);
    this._phase = new Float32Array(count);
    const palette = [0x3b82f6, 0x06b6d4, 0x0ea5e9, 0x38bdf8, 0x67e8f9].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      this._baseY[i] = y;
      this._phase[i] = Math.random() * Math.PI * 2;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.oceanGeo = geo;
    this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.022, vertexColors: true, transparent: true, opacity: 0.65, sizeAttenuation: true,
    }));
    this.scene.add(this.particles);
  }

  _buildOrbs() {
    this.orbs = [
      { color: 0x1d4ed8, pos: [-3, 1, -3],  size: 1.0  },
      { color: 0x0891b2, pos: [3, -2, -4],  size: 0.75 },
      { color: 0x0369a1, pos: [0, 3, -2],   size: 0.55 },
    ].map(({ color, pos, size }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 24, 24),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14 }),
      );
      mesh.position.set(...pos);
      this.scene.add(mesh);
      return mesh;
    });
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const t = Date.now() * 0.0004;
    const pos = this.oceanGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setY(i, this._baseY[i] + Math.sin(x * 0.28 + t + this._phase[i]) * 0.22 + Math.sin(t * 0.65 + this._phase[i]) * 0.12);
    }
    pos.needsUpdate = true;
    this.particles.rotation.y = t * 0.01;
    this.orbs.forEach((orb, i) => { orb.position.y += Math.sin(t * 0.6 + i * 1.5) * 0.002; });
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.015;
    this.camera.position.y += (this.mouse.y * 0.3 - this.camera.position.y) * 0.015;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}

// ─── NEON RAIN ───────────────────────────────────────────────────────────────
// Cyberpunk particles falling like matrix / neon rain
export class NeonRainBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationId = null;
    this.mouse = new THREE.Vector2();
    this._onMouseMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    this.init();
  }

  init() {
    this.renderer = createRenderer(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 5;
    this._buildRain();
    this._buildOrbs();
    this._buildGrid();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize', this._onResize);
    this.animate();
  }

  _buildRain() {
    const count = 3500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    this._speeds = new Float32Array(count);
    const palette = [0xec4899, 0x06b6d4, 0x8b5cf6, 0xf0abfc, 0xa5f3fc].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 20 - 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      this._speeds[i] = Math.random() * 0.07 + 0.02;
      const c = palette[i % palette.length];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.rainGeo = geo;
    this.rain = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.03, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true,
    }));
    this.scene.add(this.rain);
  }

  _buildOrbs() {
    this.orbs = [
      { color: 0xec4899, pos: [-4, 0, -3],  size: 0.75 },
      { color: 0x06b6d4, pos: [4, 1, -4],   size: 0.65 },
      { color: 0x8b5cf6, pos: [0, -2, -2],  size: 0.55 },
    ].map(({ color, pos, size }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 16, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.12 }),
      );
      mesh.position.set(...pos);
      this.scene.add(mesh);
      return mesh;
    });
  }

  _buildGrid() {
    const grid = new THREE.GridHelper(22, 22, 0xec4899, 0x1a0030);
    grid.position.y = -5;
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    this.scene.add(grid);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const t = Date.now() * 0.0004;
    const pos = this.rainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - this._speeds[i];
      if (y < -10) {
        y = 10 + Math.random() * 3;
        pos.setX(i, (Math.random() - 0.5) * 20);
      }
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    this.orbs.forEach((orb, i) => { orb.position.y += Math.sin(t + i * 1.3) * 0.003; });
    this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 0.2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
  }
}
