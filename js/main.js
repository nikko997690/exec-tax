/* ============================================
   Nexus Executive Management Tax & Advisory Group - Main JavaScript
   ============================================ */

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js');

// ============================================
// Custom Cursor
// ============================================
class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    if (!this.cursor) return;
    
    this.pos = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    if ('ontouchstart' in window) {
      this.cursor.style.display = 'none';
      return;
    }
    
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });
    
    const interactives = document.querySelectorAll('a, button, .accordion-item, .service-row');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
    });
    
    this.animate();
  }
  
  animate() {
    this.pos.x += (this.target.x - this.pos.x) * 0.12;
    this.pos.y += (this.target.y - this.pos.y) * 0.12;
    
    this.cursor.style.left = this.pos.x + 'px';
    this.cursor.style.top = this.pos.y + 'px';
    
    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// Navigation
// ============================================
class Navigation {
  constructor() {
    this.nav = document.querySelector('.nav');
    this.toggle = document.querySelector('.menu-toggle');
    if (!this.nav) return;
    
    this.init();
  }
  
  init() {
    if (this.toggle) {
      this.toggle.addEventListener('click', () => {
        this.nav.classList.toggle('open');
      });
    }

    const closeMenu = () => this.nav.classList.remove('open');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }
    });
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = this.nav.querySelectorAll('.nav-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html') || (currentPage === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }

      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }
}

// ============================================
// 3D Data Topology (Three.js)
// ============================================
class DataTopology {
  constructor() {
    this.container = document.getElementById('hero-canvas') || document.getElementById('page-hero-canvas');
    if (!this.container) return;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = [];
    this.connections = [];
    this.time = 0;
    this.mouse = { x: 0, y: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouse3D = new THREE.Vector2();
    
    this.init();
  }
  
  init() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x001233, 1);
    this.container.appendChild(this.renderer.domElement);
    
    this.createParticles();
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    this.animate();
  }
  
  createParticles() {
    const geometry = new THREE.SphereGeometry(0.035, 8, 8);
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const blueMat = new THREE.MeshBasicMaterial({ color: 0x0466C8, transparent: true, opacity: 0.8 });
    
    for (let i = 0; i < 120; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2 + Math.random() * 1.5;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      const mat = i % 6 === 0 ? blueMat : whiteMat;
      const particle = new THREE.Mesh(geometry, mat);
      particle.position.set(x, y, z);
      particle.userData = {
        originalPos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(),
        speed: 0.2 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2
      };
      
      this.scene.add(particle);
      this.particles.push(particle);
    }
    
    // Connection lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x0466C8, transparent: true, opacity: 0.1 });
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dist = this.particles[i].position.distanceTo(this.particles[j].position);
        if (dist < 1.0) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            this.particles[i].position,
            this.particles[j].position
          ]);
          const line = new THREE.Line(lineGeo, lineMat);
          line.userData = { indices: [i, j] };
          this.scene.add(line);
          this.connections.push(line);
        }
      }
    }
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onMouseMove(event) {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.mouse3D.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse3D.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.004;
    
    this.scene.rotation.y = this.time * 0.25;
    this.scene.rotation.x = this.time * 0.08;
    
    // Mouse repulsion
    this.raycaster.setFromCamera(this.mouse3D, this.camera);
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mousePoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(mousePlane, mousePoint);
    
    this.particles.forEach(p => {
      const dist = mousePoint.distanceTo(p.position);
      
      if (dist < 1.5) {
        const force = (1.5 - dist) * 0.04;
        const dir = new THREE.Vector3().subVectors(p.position, mousePoint).normalize();
        p.userData.velocity.add(dir.multiplyScalar(force));
      }
      
      p.position.lerp(p.userData.originalPos, 0.05);
      p.userData.velocity.multiplyScalar(0.93);
      p.position.add(p.userData.velocity);
      
      p.position.y += Math.sin(this.time * p.userData.speed + p.userData.offset) * 0.001;
    });
    
    // Update connections
    this.connections.forEach(line => {
      const [i, j] = line.userData.indices;
      const positions = line.geometry.attributes.position.array;
      positions[0] = this.particles[i].position.x;
      positions[1] = this.particles[i].position.y;
      positions[2] = this.particles[i].position.z;
      positions[3] = this.particles[j].position.x;
      positions[4] = this.particles[j].position.y;
      positions[5] = this.particles[j].position.z;
      line.geometry.attributes.position.needsUpdate = true;
    });
    
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================
// GSAP Scroll Animations
// ============================================
class ScrollAnimations {
  constructor() {
    this.init();
  }
  
  init() {
    this.heroAnimations();
    this.fadeUpAnimations();
    this.counterAnimations();
    this.parallaxAnimations();
    this.accordionEffect();
    this.textStackEffect();
  }
  
  heroAnimations() {
    const tl = gsap.timeline({ delay: 0.4 });
    
    tl.to('.hero-title', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out'
    })
    .to('.hero-ticker', {
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.7')
    .to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.5')
    .to('.hero-cta', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    .to('.scroll-indicator', {
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.3');
  }
  
  fadeUpAnimations() {
    const fadeUps = document.querySelectorAll('.fade-up');
    fadeUps.forEach(el => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
  
  counterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.count);
      gsap.fromTo(counter, 
        { innerText: 0 },
        {
          innerText: target,
          duration: 2.5,
          ease: 'power2.out',
          snap: { innerText: 1 },
          scrollTrigger: {
            trigger: counter,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          onUpdate: function() {
            const val = Math.round(this.targets()[0].innerText);
            const suffix = counter.dataset.suffix || '+';
            counter.innerText = val + suffix;
          }
        }
      );
    });
  }
  
  parallaxAnimations() {
    const serviceRows = document.querySelectorAll('.service-row');
    if (serviceRows.length) {
      gsap.from(serviceRows, {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: serviceRows[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    }
    
    // Intro section
    const introTitle = document.querySelector('.intro-title');
    const introBody = document.querySelector('.intro-body');
    if (introTitle && introBody) {
      gsap.from(introTitle, {
        x: -50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: introTitle, start: 'top 80%' }
      });
      gsap.from(introBody, {
        x: 50,
        opacity: 0,
        duration: 1.2,
        delay: 0.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: introBody, start: 'top 80%' }
      });
    }
  }
  
  accordionEffect() {
    const stage = document.querySelector('.accordion-stage');
    if (!stage) return;
    
    const bg = stage.querySelector('.accordion-bg');
    const title = stage.querySelector('.accordion-title');
    const items = stage.querySelectorAll('.accordion-item');
    let currentImage = null;
    
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const img = item.getAttribute('data-image');
        const text = item.getAttribute('data-title');
        
        if (img !== currentImage) {
          currentImage = img;
          bg.style.backgroundImage = `url(${img})`;
          bg.style.opacity = '0.12';
        }
        
        if (title && text) {
          title.textContent = text;
          title.style.opacity = '0.9';
        }
        
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
    
    stage.addEventListener('mouseleave', () => {
      bg.style.opacity = '0';
      if (title) title.style.opacity = '0';
      items.forEach(i => i.classList.remove('active'));
      currentImage = null;
    });
  }
  
  textStackEffect() {
    const container = document.querySelector('.text-stack-container');
    if (!container) return;
    
    const blocks = container.querySelectorAll('.stack-block');
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
      }
    });
    
    blocks.forEach((block, i) => {
      const isEven = i % 2 === 0;
      const zStart = isEven ? 800 : -800;
      const rotXStart = isEven ? 35 : -35;
      const rotYStart = isEven ? -25 : 25;
      const xStart = isEven ? '80vw' : '-80vw';
      
      tl.from(block, {
        z: zStart,
        rotateX: rotXStart,
        rotateY: rotYStart,
        x: xStart,
        opacity: 0,
        ease: 'none'
      }, 0);
    });
  }
}

// ============================================
// Page Transition
// ============================================
class PageTransition {
  constructor() {
    this.overlay = document.querySelector('.page-transition');
    this.init();
  }
  
  init() {
    if (this.overlay) {
      gsap.fromTo(this.overlay,
        { y: '0%' },
        { y: '-100%', duration: 1, ease: 'power3.inOut', delay: 0.2 }
      );
    }
  }
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  new CustomCursor();
  new Navigation();
  new DataTopology();
  new ScrollAnimations();
  new PageTransition();
});
