class FlowFieldBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Configuration
    this.color = options.color || '#6366f1';
    this.trailOpacity = options.trailOpacity || 0.15;
    this.particleCount = options.particleCount || 600;
    this.speed = options.speed || 1;
    
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.animationFrameId = null;
    this.mouse = { x: -1000, y: -1000 };
    
    this.init();
    this.setupEventListeners();
    this.animate();
  }
  
  init() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    
    this.container.insertBefore(this.canvas, this.container.firstChild);
    
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new Particle(this.width, this.height, this.speed));
    }
  }
  
  animate() {
    this.ctx.fillStyle = `rgba(30, 58, 138, ${this.trailOpacity})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.particles.forEach(p => {
      p.update(this.mouse, this.width, this.height);
      p.draw(this.ctx, this.color);
    });
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  setupEventListeners() {
    this.handleResize = () => {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.init();
    };
    
    this.handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };
    
    this.handleMouseLeave = () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    };
    
    window.addEventListener('resize', this.handleResize);
    this.container.addEventListener('mousemove', this.handleMouseMove);
    this.container.addEventListener('mouseleave', this.handleMouseLeave);
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

class Particle {
  constructor(width, height, speed) {
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.reset(width, height);
  }
  
  reset(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = 0;
    this.vy = 0;
    this.age = 0;
    this.life = Math.random() * 200 + 100;
  }
  
  update(mouse, width, height) {
    // Flow field calculation
    const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
    
    this.vx += Math.cos(angle) * 0.2 * this.speed;
    this.vy += Math.sin(angle) * 0.2 * this.speed;
    
    // Mouse interaction
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const interactionRadius = 150;
    
    if (distance < interactionRadius) {
      const force = (interactionRadius - distance) / interactionRadius;
      this.vx -= dx * force * 0.05;
      this.vy -= dy * force * 0.05;
    }
    
    // Apply velocity and friction
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    
    // Aging
    this.age++;
    if (this.age > this.life) {
      this.reset(width, height);
    }
    
    // Wrap around
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  
  draw(ctx, color) {
    ctx.fillStyle = color;
    const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;
    ctx.globalAlpha = alpha;
    ctx.fillRect(this.x, this.y, 1.5, 1.5);
  }
}
