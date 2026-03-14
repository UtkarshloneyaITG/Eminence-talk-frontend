import * as THREE from 'three';

export class EminenceBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.animationId = null;
    this.mouse = new THREE.Vector2(0, 0);
    this.init();
  }

  init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    // Scene + Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 4;

    this._buildParticles();
    this._buildOrbs();
    this._buildGrid();
    this._bindEvents();
    this.animate();
  }

  _buildParticles() {
    const count = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0x6366f1), // violet
      new THREE.Color(0x8b5cf6), // purple
      new THREE.Color(0x06b6d4), // cyan
      new THREE.Color(0xec4899), // pink
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  _buildOrbs() {
    this.orbs = [];
    const orbData = [
      { color: 0x6366f1, position: [-3, 2, -2], size: 0.8 },
      { color: 0x8b5cf6, position: [3, -1, -3], size: 0.6 },
      { color: 0x06b6d4, position: [0, -3, -1], size: 0.5 },
    ];

    orbData.forEach(({ color, position, size }) => {
      const geo = new THREE.SphereGeometry(size, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...position);
      this.scene.add(mesh);
      this.orbs.push(mesh);
    });
  }

  _buildGrid() {
    const gridHelper = new THREE.GridHelper(30, 30, 0x1a1a4a, 0x0f0f2a);
    gridHelper.position.y = -5;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
    this.grid = gridHelper;
  }

  _bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('resize', this._onResize.bind(this));
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    const time = Date.now() * 0.0005;

    // Slowly rotate particles
    this.particles.rotation.y = time * 0.05;
    this.particles.rotation.x = time * 0.02;

    // Camera follows mouse (subtle parallax)
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 0.3 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);

    // Orb float animation
    this.orbs.forEach((orb, i) => {
      orb.position.y += Math.sin(time + i) * 0.002;
      orb.rotation.y = time * 0.3;
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this._onResize.bind(this));
    this.renderer.dispose();
  }
}
