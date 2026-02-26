/* ── Global Flags ── */
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

/* ══════════════════════════════
   PARTICLE CANVAS
══════════════════════════════ */
(function() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: null, y: null, radius: 150 };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
  });

  function Particle() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.2;
  }

  function init() {
    const count = Math.min(80, Math.floor((w * h) / 12000));
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  init();
  window.addEventListener('resize', init);

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += dx / dist * force * 2;
          p.y += dy / dist * force * 2;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(91, 205, 236, ' + p.opacity + ')';
      ctx.fill();

      // Lines between nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(91, 205, 236, ' + (0.15 * (1 - dist / 160)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════
   TYPEWRITER
══════════════════════════════ */
(function() {
  const el = document.getElementById('typewriter');
  const titles = [
    'Senior Full Stack Engineer',
    'Ruby & JavaScript Expert',
    'Distributed Systems Architect',
    'Open Source Contributor',
    'Building Scalable Web Applications',
    'Problem Solver & Tech Enthusiast'
  ];
  let titleIdx = 0, charIdx = 0, deleting = false, pause = 0;

  function tick() {
    const current = titles[titleIdx];
    if (pause > 0) { pause--; requestAnimationFrame(tick); return; }
    if (!deleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) { deleting = true; pause = 90; }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) { deleting = false; titleIdx = (titleIdx + 1) % titles.length; pause = 20; }
    }
    setTimeout(function() { requestAnimationFrame(tick); }, deleting ? 30 : 60);
  }
  tick();
})();

/* ══════════════════════════════
   UNIFIED VISIBILITY OBSERVER
   (Reveals + Staggers + Separators)
══════════════════════════════ */
(function() {
  var selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-clip, .stagger, .section-separator';
  var elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stagger')) {
          var children = entry.target.children;
          for (var i = 0; i < children.length; i++) {
            children[i].classList.add('visible');
          }
        }
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(function(el) { observer.observe(el); });
})();

/* ══════════════════════════════
   CONSOLIDATED SCROLL HANDLER
   (Hero Parallax, Orbs, Timeline Draw,
    Section Title Gradient, Progress Bar)
══════════════════════════════ */
(function() {
  var heroContent = document.querySelector('.hero-content');
  var scrollIndicator = document.querySelector('.scroll-indicator');
  var heroGridLayer = document.querySelector('.hero-grid-layer');
  var heroShapesLayer = document.querySelector('.hero-shapes-layer');
  var orbs = document.querySelectorAll('.orb');
  var nav = document.querySelector('nav');
  var progressBar = document.getElementById('scrollProgress');
  var timeline = document.querySelector('.timeline');
  var sectionTitles = document.querySelectorAll('.section-title');
  var ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var scrollY = window.scrollY;
        var vh = window.innerHeight;
        var docHeight = document.documentElement.scrollHeight - vh;

        // Hero content: scale down & fade out as you scroll
        if (scrollY < vh) {
          var progress = scrollY / vh;
          var scale = 1 - progress * 0.15;
          var opacity = 1 - progress * 1.2;
          heroContent.style.transform = 'scale(' + Math.max(scale, 0.85) + ') translateY(' + (scrollY * 0.3) + 'px)';
          heroContent.style.opacity = Math.max(opacity, 0);
          if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(1 - progress * 3, 0);
          }
          // Hero layer parallax
          if (heroGridLayer) heroGridLayer.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
          if (heroShapesLayer) heroShapesLayer.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
        }

        // Subtle orb opacity shift on scroll
        var orbOpacity = Math.max(0.05, 0.12 - (scrollY / docHeight) * 0.06);
        for (var i = 0; i < orbs.length; i++) {
          orbs[i].style.opacity = orbOpacity;
        }

        // Nav background on scroll
        if (scrollY > 50) {
          nav.style.background = 'rgba(13, 17, 23, 0.95)';
        } else {
          nav.style.background = 'rgba(13, 17, 23, 0.8)';
        }

        // Scroll progress bar
        var scrollPercent = (scrollY / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';

        // Self-drawing timeline line
        if (timeline && !prefersReducedMotion) {
          var rect = timeline.getBoundingClientRect();
          var timelineTop = rect.top + scrollY;
          var timelineHeight = rect.height;
          var viewBottom = scrollY + vh;
          if (viewBottom > timelineTop && scrollY < timelineTop + timelineHeight) {
            var progress = Math.min(1, Math.max(0, (viewBottom - timelineTop) / (timelineHeight + vh * 0.5)));
            timeline.style.setProperty('--timeline-progress', progress);
          }
        }

        // Section title gradient scroll
        for (var t = 0; t < sectionTitles.length; t++) {
          var titleRect = sectionTitles[t].getBoundingClientRect();
          var titleProgress = 1 - (titleRect.top / vh);
          titleProgress = Math.min(1, Math.max(0, titleProgress));
          sectionTitles[t].style.backgroundPosition = (titleProgress * 100) + '% 50%';
        }

        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ══════════════════════════════
   3D CARD TILT
══════════════════════════════ */
(function() {
  var cards = document.querySelectorAll('[data-tilt]');
  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rotateX = (y - cy) / cy * -5;
      var rotateY = (x - cx) / cx * 5;
      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
    });
  });
})();

/* ══════════════════════════════
   MOBILE NAV + ACTIVE LINK
══════════════════════════════ */
(function() {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var navAnchors = navLinks.querySelectorAll('a');
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navAnchors.forEach(function(link) {
    link.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Highlight active nav link on scroll
  var sections = document.querySelectorAll('section[id]');
  var activeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navAnchors.forEach(function(a) { a.classList.remove('active'); });
        var activeLink = navLinks.querySelector('a[href="#' + entry.target.id + '"]');
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-64px 0px -50% 0px' });
  sections.forEach(function(s) { activeObserver.observe(s); });
})();

/* ══════════════════════════════
   COPY CODE
══════════════════════════════ */
(function() {
  var btn = document.getElementById('copyBtn');
  var label = document.getElementById('copyLabel');
  var icon = document.getElementById('copyIcon');
  var code = 'const hammadKhan = {\n  title: "Senior Full Stack Engineer",\n  experience: "8+ years building systems at scale",\n  location: "Lahore, Pakistan",\n  specialization: "Distributed Systems & Platform Architecture",\n  currentRole: "Senior Full Stack Engineer @ NexaQuanta",\n\n  expertise: {\n    systemDesign: ["Microservices", "Event-Driven", "DDD"],\n    backend: ["Rails", "NestJS", "Node", "GraphQL"],\n    frontend: ["React", "Vue", "Next.js", "PWA"],\n    infra: ["AWS", "Docker", "Redis", "BullMQ", "K8s"],\n    databases: ["PostgreSQL", "MongoDB", "MySQL", "Prisma"],\n    security: ["OWASP Top 10", "Audit Systems", "HIPAA"],\n  },\n\n  highlights: [\n    "115+ MRs delivered in 5 months @ NexaQuanta",\n    "Rails Core Contributor — merged PR to rails/rails",\n    "Zero-downtime Stripe migration with 99.9% uptime",\n    "Progressive loading: page load 12s → 2.3s",\n  ],\n\n  openSource: ["daemon-os", "rubocop-hk", "ramadan-cli-pro"],\n  currentFocus: "Platform Engineering & Technical Strategy",\n  philosophy: "Building systems that scale, teams that deliver,\\n               and solutions that last."\n};';

  btn.addEventListener('click', function() {
    navigator.clipboard.writeText(code).then(function() {
      label.textContent = 'Copied!';
      icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      btn.classList.add('copied');
      setTimeout(function() {
        label.textContent = 'Copy';
        icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
})();

/* (Hero name uses CSS-only heroReveal animation — no JS char split needed) */

/* ══════════════════════════════
   CUSTOM CURSOR (desktop only)
══════════════════════════════ */
(function() {
  if (isTouchDevice || prefersReducedMotion) return;
  var cursor = document.getElementById('customCursor');
  if (!cursor) return;
  document.body.classList.add('has-custom-cursor');
  var mx = 0, my = 0, cx = 0, cy = 0;
  var lerp = 0.15;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    if (!cursor.classList.contains('visible')) cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', function() {
    cursor.classList.remove('visible');
  });

  // Detect hover on interactive elements
  var interactiveEls = 'a, button, [data-tilt], .social-btn, .project-link, .cert-card, .skyline-card, input, textarea';
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(interactiveEls)) cursor.classList.add('hover');
  });
  document.addEventListener('mouseout', function(e) {
    if (e.target.closest(interactiveEls)) cursor.classList.remove('hover');
  });

  function animate() {
    cx += (mx - cx) * lerp;
    cy += (my - cy) * lerp;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ══════════════════════════════
   FLOATING TECH ICONS
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var techIcons = document.querySelectorAll('.tech-icon');
  techIcons.forEach(function(icon) {
    icon.style.animation = 'techFloat 2s ease-in-out infinite';
    icon.style.animationDelay = (Math.random() * 2).toFixed(2) + 's';
  });
})();

/* ══════════════════════════════
   BLUR-UP IMAGE LOADING
══════════════════════════════ */
(function() {
  var blurImages = document.querySelectorAll('.blur-up');
  blurImages.forEach(function(img) {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        img.classList.add('loaded');
      });
    }
  });
  // Also apply blur-up to all analytics images
  var analyticsImgs = document.querySelectorAll('.analytics-grid img');
  analyticsImgs.forEach(function(img) {
    if (!img.classList.contains('blur-up')) {
      img.style.filter = 'blur(8px)';
      img.style.transition = 'filter 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      if (img.complete) {
        img.style.filter = 'blur(0)';
      } else {
        img.addEventListener('load', function() {
          img.style.filter = 'blur(0)';
        });
      }
    }
  });
})();

/* ══════════════════════════════
   MOMENTUM ANCHOR SCROLLING
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  // Override CSS smooth scroll — we handle it in JS
  document.documentElement.style.scrollBehavior = 'auto';

  var navAnchors = document.querySelectorAll('a[href^="#"]');
  navAnchors.forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      var startY = window.scrollY;
      var targetY = target.getBoundingClientRect().top + startY - 64; // offset for nav
      var distance = targetY - startY;
      var absDist = Math.abs(distance);
      // Adaptive duration: 800ms – 1500ms based on distance
      var duration = Math.min(1500, Math.max(800, absDist * 0.4));
      var startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step(now) {
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var easedProgress = easeOutExpo(progress);
        window.scrollTo(0, startY + distance * easedProgress);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  });
})();

/* ══════════════════════════════
   PROJECT CARD FULL-CLICK
══════════════════════════════ */
(function() {
  var projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(function(card) {
    card.addEventListener('click', function(e) {
      // Don't override if user clicked directly on a link
      if (e.target.closest('a')) return;
      var link = card.querySelector('.project-name a') || card.querySelector('a');
      if (link) {
        window.open(link.href, '_blank', 'noopener');
      }
    });
  });
})();
