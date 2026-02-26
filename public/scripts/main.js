/* ── Global Flags ── */
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

/* ══════════════════════════════
   BOOT SEQUENCE
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) {
    var boot = document.getElementById('bootScreen');
    if (boot) { boot.classList.add('hidden'); }
    return;
  }
  var bootScreen = document.getElementById('bootScreen');
  var bootLines = document.getElementById('bootLines');
  if (!bootScreen || !bootLines) return;

  var lines = [
    { text: '$ uname -a', cls: 'boot-cmd' },
    { text: 'Linux mainframe 6.1.0-kali9 #1 SMP x86_64 GNU/Linux', cls: 'boot-output' },
    { text: '$ sudo systemctl start portfolio.service', cls: 'boot-cmd' },
    { text: '[  OK  ] Started portfolio.service — Hammad Khan Runtime', cls: 'boot-ok' },
    { text: '$ nmap -sS 10.0.0.0/24 --top-ports 5', cls: 'boot-cmd' },
    { text: 'Starting Nmap 7.94 ( https://nmap.org )', cls: 'boot-output' },
    { text: 'PORT    STATE SERVICE', cls: 'boot-output' },
    { text: '22/tcp  open  ssh', cls: 'boot-output' },
    { text: '80/tcp  open  http', cls: 'boot-output' },
    { text: '443/tcp open  https', cls: 'boot-output' },
    { text: '$ ssh -i ~/.ssh/id_rsa root@portfolio', cls: 'boot-cmd' },
    { text: 'Authenticating with public key...', cls: 'boot-output' },
    { text: 'Last login: Thu Feb 27 03:14:15 2026 from 10.0.0.1', cls: 'boot-output' },
    { text: 'root@portfolio:~# cat /etc/motd', cls: 'boot-cmd' },
    { text: '', cls: '' },
    { text: '>>> WELCOME, HAMMAD <<<', cls: 'boot-access' }
  ];

  lines.forEach(function(l) {
    var span = document.createElement('span');
    span.textContent = l.text;
    if (l.cls) span.classList.add(l.cls);
    bootLines.appendChild(span);
  });

  var spans = bootLines.querySelectorAll('span');
  var delay = 200;
  spans.forEach(function(span, i) {
    setTimeout(function() { span.classList.add('show'); }, delay + i * 250);
  });

  // Fade out after all lines shown
  var totalTime = delay + spans.length * 250 + 400;
  setTimeout(function() {
    bootScreen.classList.add('fade-out');
    setTimeout(function() { bootScreen.classList.add('hidden'); }, 500);
  }, totalTime);
})();

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
   MATRIX RAIN CANVAS
══════════════════════════════ */
(function() {
  if (prefersReducedMotion || isTouchDevice) return;
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, columns, drops;
  var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
  var fontSize = 14;
  var frameCount = 0;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    columns = Math.floor(w / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    frameCount++;
    // Run at ~20fps (skip 2 of every 3 frames at 60fps) — slower, moodier rain
    if (frameCount % 3 !== 0) { requestAnimationFrame(draw); return; }

    ctx.fillStyle = 'rgba(10, 14, 20, 0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 191, 191, 0.6)';
    ctx.font = fontSize + 'px monospace';

    for (var i = 0; i < drops.length; i++) {
      // Only advance ~70% of columns per frame for staggered feel
      if (Math.random() > 0.3) {
        var char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════
   HERO NAME — CONTINUOUS ENCRYPT / DECRYPT
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var nameEl = document.getElementById('heroName');
  var innerEl = document.getElementById('heroNameInner');
  if (!nameEl || !innerEl) return;

  var finalText = 'Hammad Khan';
  var scrambleChars = '$@#K!x%&*?><{}[]~^₿Ξ∆ΩΣ░▒▓█◊∞≈';
  var chars = finalText.split('');
  var state = new Array(chars.length); // true = resolved, false = scrambled
  for (var s = 0; s < state.length; s++) state[s] = false;
  var flickerTimer = null;
  var busy = false;

  function randChar() {
    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
  }

  // Render current state — resolved chars show real letter, others show random
  function render() {
    var text = '';
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') { text += ' '; }
      else if (state[i]) { text += chars[i]; }
      else { text += randChar(); }
    }
    innerEl.textContent = text;
  }

  // Flicker: re-render scrambled chars at 50ms to make them dance
  function startFlicker() {
    if (flickerTimer) return;
    flickerTimer = setInterval(render, 50);
  }
  function stopFlicker() {
    clearInterval(flickerTimer);
    flickerTimer = null;
  }

  // Get non-space indices in shuffled order
  function shuffledIndices(filterResolved) {
    var indices = [];
    for (var i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') continue;
      if (filterResolved === true && !state[i]) continue;
      if (filterResolved === false && state[i]) continue;
      indices.push(i);
    }
    // Fisher-Yates shuffle
    for (var j = indices.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = indices[j]; indices[j] = indices[k]; indices[k] = tmp;
    }
    return indices;
  }

  // Decrypt: resolve chars one by one (scrambled → real)
  function decrypt(callback) {
    busy = true;
    startFlicker();
    var indices = shuffledIndices(false); // get currently-scrambled chars
    var idx = 0;
    var timer = setInterval(function() {
      if (idx < indices.length) {
        state[indices[idx]] = true;
        render();
        idx++;
      } else {
        clearInterval(timer);
        stopFlicker();
        innerEl.textContent = finalText;
        busy = false;
        if (callback) callback();
      }
    }, 100);
  }

  // Encrypt: corrupt chars one by one (real → scrambled)
  function encrypt(callback) {
    busy = true;
    var indices = shuffledIndices(true); // get currently-resolved chars
    var idx = 0;
    var timer = setInterval(function() {
      if (idx < indices.length) {
        state[indices[idx]] = false;
        render();
        idx++;
      } else {
        clearInterval(timer);
        startFlicker();
        busy = false;
        if (callback) callback();
      }
    }, 80);
  }

  // ── Continuous loop: decrypt → hold → encrypt → hold → repeat ──
  function cycle() {
    // Decrypt
    decrypt(function() {
      // Hold readable for 3-5s
      setTimeout(function() {
        // Encrypt
        encrypt(function() {
          // Hold scrambled for 0.8-1.5s while chars dance
          setTimeout(function() {
            cycle();
          }, 800 + Math.random() * 700);
        });
      }, 3000 + Math.random() * 2000);
    });
  }

  // ── Boot: wait for boot sequence then start ──
  var bootDelay = 3000;
  setTimeout(function() {
    // Start fully scrambled
    for (var i = 0; i < state.length; i++) state[i] = false;
    startFlicker();
    // Begin first decrypt after brief scramble display
    setTimeout(function() {
      cycle();
    }, 600);
  }, bootDelay);
})();

/* ══════════════════════════════
   TYPEWRITER
══════════════════════════════ */
(function() {
  const el = document.getElementById('typewriter');
  const titles = [
    '> Senior Software Engineer',
    '> Ruby on Rails Virtuoso',
    '> Initializing neural interface...',
    '> Node.js Systems Architect',
    '> Bypassing firewall protocols...',
    '> React & Vue Evangelist',
    '> Decrypting classified payloads...',
    '> AWS Infrastructure Strategist',
    '> Establishing encrypted tunnel...',
    '> PostgreSQL Performance Alchemist',
    '> Compiling exploit modules...',
    '> Docker & Kubernetes Orchestrator',
    '> GraphQL Schema Architect',
    '> TypeScript Perfectionist',
    '> Redis & Distributed Queue Specialist',
    '> Open Source Advocate & Contributor',
    '> Root access granted. Welcome back.'
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
   BACKGROUND HACKER LOG
══════════════════════════════ */
(function() {
  if (prefersReducedMotion || isTouchDevice) return;
  var container = document.getElementById('hackerLog');
  if (!container) return;
  var maxNodes = 20;
  var nodeCount = 0;

  var templates = [
    function() { return '[SCAN] ' + randIP() + ' — port ' + randPort() + ' open'; },
    function() { return '[AUTH] Token refresh: SHA256:' + randHex(7); },
    function() { return '[REDIS] PING → PONG (' + rand(1,9) + 'ms)'; },
    function() { return '[K8S] pod/api-deployment-' + randHex(6) + ' ready'; },
    function() { return '[NET] TLS handshake ' + randIP() + ':' + randPort(); },
    function() { return '[SYS] CPU: ' + rand(12,78) + '% | MEM: ' + rand(40,88) + '%'; },
    function() { return '[LOG] PID ' + rand(1000,9999) + ' — request completed 200 OK'; },
    function() { return '[DB] Query executed in ' + rand(1,45) + 'ms — ' + rand(1,500) + ' rows'; },
    function() { return '[SSH] Session ' + randHex(8) + ' authenticated'; },
    function() { return '[GIT] push origin main — ' + randHex(7); },
    function() { return '[DNS] Resolved ' + randDomain() + ' → ' + randIP(); },
    function() { return '[CRON] Job #' + rand(100,999) + ' completed successfully'; },
    function() { return '[SSL] Certificate valid — expires in ' + rand(30,365) + 'd'; },
    function() { return '[API] POST /v2/deploy — 201 Created (' + rand(80,400) + 'ms)'; },
    function() { return '[DOCKER] Container ' + randHex(12) + ' healthy'; },
    function() { return '[PROXY] 301 redirect → /api/v' + rand(1,3); },
    function() { return '[FS] /var/log/syslog rotated — ' + rand(1,50) + 'MB freed'; },
    function() { return '[CACHE] HIT ratio: ' + rand(85,99) + '.' + rand(0,9) + '%'; },
    function() { return '[QUEUE] ' + rand(0,15) + ' jobs pending — ' + rand(100,999) + ' processed'; },
    function() { return '[MONITOR] Uptime: ' + rand(1,999) + 'd ' + rand(0,23) + 'h ' + rand(0,59) + 'm'; }
  ];

  function rand(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
  function randHex(n) { var s=''; for(var i=0;i<n;i++) s+='0123456789abcdef'[Math.floor(Math.random()*16)]; return s; }
  function randIP() { return rand(10,192)+'.'+rand(0,255)+'.'+rand(0,255)+'.'+rand(1,254); }
  function randPort() { return [22,80,443,3000,5432,6379,8080,8443,9090][Math.floor(Math.random()*9)]; }
  function randDomain() { return ['api','cdn','db','cache','auth'][Math.floor(Math.random()*5)] + '.internal'; }

  function spawnLine() {
    if (nodeCount >= maxNodes) return;
    var line = document.createElement('div');
    line.className = 'hacker-log-line';
    line.textContent = templates[Math.floor(Math.random() * templates.length)]();
    line.style.left = rand(5, 85) + '%';
    line.style.top = rand(20, 90) + '%';
    container.appendChild(line);
    nodeCount++;
    line.addEventListener('animationend', function() {
      line.remove();
      nodeCount--;
    });
  }

  setInterval(spawnLine, 800);
})();

/* ══════════════════════════════
   CLICK SCREEN GLITCH + HACKER TOASTS
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var toastContainer = document.getElementById('hackerToastContainer');
  var glitchOverlay = document.getElementById('clickGlitchOverlay');
  if (!toastContainer) return;

  var clickMessages = [
    '# Firewall bypassed on port 443',
    '> Packet intercepted: 192.168.x.x',
    '$ Buffer overflow in sector 7',
    '# Encryption key rotated: SHA256:a3f82c',
    '> SSH tunnel to darknet established',
    '$ Payload delivered — 0 traces',
    '# Root shell spawned (PID 31337)',
    '> Memory dump: 0xDEADBEEF',
    '$ Brute force: 12,847 combos/sec',
    '# Certificate pinning bypassed'
  ];

  var maxToasts = 3;

  function spawnToast(message, isAmbient) {
    var toast = document.createElement('div');
    toast.className = 'hacker-toast' + (isAmbient ? ' ambient' : '');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Cap at max toasts
    var toasts = toastContainer.querySelectorAll('.hacker-toast');
    while (toasts.length > maxToasts) {
      toasts[0].remove();
      toasts = toastContainer.querySelectorAll('.hacker-toast');
    }

    // Auto-dismiss after 2.5s
    setTimeout(function() {
      toast.classList.add('dismiss');
      toast.addEventListener('animationend', function() { toast.remove(); });
    }, 2500);
  }

  function triggerGlitch() {
    if (!glitchOverlay) return;
    glitchOverlay.classList.add('active');
    setTimeout(function() {
      glitchOverlay.classList.remove('active');
    }, 150);
  }

  document.addEventListener('click', function() {
    triggerGlitch();
    var msg = clickMessages[Math.floor(Math.random() * clickMessages.length)];
    spawnToast(msg, false);
  });

  // ── Ambient Auto-Toasts (Change 8) ──
  var ambientMessages = [
    '[CRON] Scheduled recon scan completed',
    '[ALERT] New device detected on network',
    '[SYNC] Encrypted backup: 100% complete',
    '[MONITOR] Intrusion detection: all clear',
    '[DAEMON] Process health check: nominal'
  ];

  function scheduleAmbient() {
    var delay = 12000 + Math.random() * 6000; // 12-18s
    setTimeout(function() {
      var msg = ambientMessages[Math.floor(Math.random() * ambientMessages.length)];
      spawnToast(msg, true);
      scheduleAmbient();
    }, delay);
  }
  if (!isTouchDevice) scheduleAmbient();

  // ── Periodic Global Environment Glitch ──
  function triggerGlobalGlitch() {
    triggerGlitch(); // overlay flash
    // Also glitch the entire page body
    document.body.classList.add('env-glitch');
    setTimeout(function() {
      document.body.classList.remove('env-glitch');
    }, 200);
  }

  function scheduleEnvGlitch() {
    var delay = 6000 + Math.random() * 6000; // 6-12s
    setTimeout(function() {
      triggerGlobalGlitch();
      scheduleEnvGlitch();
    }, delay);
  }
  if (!isTouchDevice) scheduleEnvGlitch();
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

        if (scrollY < vh) {
          var progress = scrollY / vh;
          var scale = 1 - progress * 0.15;
          var opacity = 1 - progress * 1.2;
          heroContent.style.transform = 'scale(' + Math.max(scale, 0.85) + ') translateY(' + (scrollY * 0.3) + 'px)';
          heroContent.style.opacity = Math.max(opacity, 0);
          if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(1 - progress * 3, 0);
          }
          if (heroGridLayer) heroGridLayer.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
          if (heroShapesLayer) heroShapesLayer.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
        }

        var orbOpacity = Math.max(0.05, 0.12 - (scrollY / docHeight) * 0.06);
        for (var i = 0; i < orbs.length; i++) {
          orbs[i].style.opacity = orbOpacity;
        }

        if (scrollY > 50) {
          nav.style.background = 'rgba(13, 17, 23, 0.95)';
        } else {
          nav.style.background = 'rgba(13, 17, 23, 0.8)';
        }

        var scrollPercent = (scrollY / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';

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
  var code = '#!/bin/bash\n# ═══════════════════════════════════════\n# CLASSIFIED — SECURITY CLEARANCE: ROOT\n# ═══════════════════════════════════════\n\nCODENAME="hammad_khan"\nTITLE="Senior Full Stack Engineer"\nEXPERIENCE="8+ years building systems at scale"\nLOCATION="Lahore, Pakistan"\nCLEARANCE="Level 5 — Platform Architecture"\nCURRENT_OP="Senior Full Stack Engineer @ NexaQuanta"\n\ndeclare -A ARSENAL=(\n  [system_design]="Microservices | Event-Driven | DDD"\n  [backend]="Rails | NestJS | Node | GraphQL"\n  [frontend]="React | Vue | Next.js | PWA"\n  [infrastructure]="AWS | Docker | Redis | BullMQ | K8s"\n  [databases]="PostgreSQL | MongoDB | MySQL | Prisma"\n  [security]="OWASP Top 10 | Audit Systems | HIPAA"\n)\n\nMISSION_LOG=(\n  "115+ MRs delivered in 5 months @ NexaQuanta"\n  "Rails Core Contributor — merged PR to rails/rails"\n  "Zero-downtime Stripe migration — 99.9% uptime"\n  "Progressive loading: page load 12s → 2.3s"\n)\n\nKNOWN_ALIASES=("daemon-os" "rubocop-hk" "ramadan-cli-pro")\nCURRENT_FOCUS="Platform Engineering & Technical Strategy"\nPHILOSOPHY="Building systems that scale, teams that deliver,\n            and solutions that last."\n\necho "[STATUS] Dossier loaded. Target identified."';

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

/* ══════════════════════════════
   CROSSHAIR CURSOR + TRAIL (desktop only)
══════════════════════════════ */
(function() {
  if (isTouchDevice || prefersReducedMotion) return;
  var cursor = document.getElementById('crosshairCursor');
  var trailContainer = document.getElementById('cursorTrail');
  if (!cursor) return;
  document.body.classList.add('has-custom-cursor');

  var mx = 0, my = 0, cx = 0, cy = 0;
  var lerp = 0.15;

  // Trail pool
  var trailDots = trailContainer ? trailContainer.querySelectorAll('span') : [];
  var trailPositions = [];
  for (var i = 0; i < trailDots.length; i++) {
    trailPositions.push({ x: 0, y: 0 });
  }

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    if (!cursor.classList.contains('visible')) cursor.classList.add('visible');
  });

  document.addEventListener('mouseleave', function() {
    cursor.classList.remove('visible');
    for (var i = 0; i < trailDots.length; i++) {
      trailDots[i].style.opacity = '0';
    }
  });

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

    // Update trail positions with staggered delay
    for (var i = trailDots.length - 1; i > 0; i--) {
      trailPositions[i].x = trailPositions[i - 1].x;
      trailPositions[i].y = trailPositions[i - 1].y;
    }
    if (trailPositions.length > 0) {
      trailPositions[0].x = cx;
      trailPositions[0].y = cy;
    }

    for (var j = 0; j < trailDots.length; j++) {
      trailDots[j].style.left = trailPositions[j].x + 'px';
      trailDots[j].style.top = trailPositions[j].y + 'px';
      trailDots[j].style.opacity = cursor.classList.contains('visible') ? (1 - j / trailDots.length) * 0.4 : 0;
    }

    requestAnimationFrame(animate);
  }
  animate();
})();

/* ══════════════════════════════
   KEYBOARD VISUAL FEEDBACK
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var flash = document.getElementById('keyFlash');
  if (!flash) return;
  var timeout;

  document.addEventListener('keydown', function(e) {
    var key = e.key;
    if (key === ' ') key = 'Space';
    if (key.length > 10) return; // skip weird keys
    flash.textContent = '> ' + key;
    flash.classList.add('show');
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      flash.classList.remove('show');
    }, 600);
  });
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
      var targetY = target.getBoundingClientRect().top + startY - 64;
      var distance = targetY - startY;
      var absDist = Math.abs(distance);
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
      if (e.target.closest('a')) return;
      var link = card.querySelector('.project-name a') || card.querySelector('a');
      if (link) {
        window.open(link.href, '_blank', 'noopener');
      }
    });
  });
})();

/* ══════════════════════════════
   KONAMI CODE EASTER EGG
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var konamiOverlay = document.getElementById('konamiOverlay');
  var toastContainer = document.getElementById('hackerToastContainer');
  if (!konamiOverlay) return;

  var sequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var position = 0;

  document.addEventListener('keydown', function(e) {
    var expected = sequence[position];
    if (e.key === expected || e.key.toLowerCase() === expected) {
      position++;
      if (position === sequence.length) {
        position = 0;
        // Trigger konami overlay
        konamiOverlay.classList.add('active');
        setTimeout(function() {
          konamiOverlay.classList.remove('active');
          // Spawn follow-up toast
          if (toastContainer) {
            var toast = document.createElement('div');
            toast.className = 'hacker-toast';
            toast.textContent = '# Security breach contained';
            toastContainer.appendChild(toast);
            setTimeout(function() {
              toast.classList.add('dismiss');
              toast.addEventListener('animationend', function() { toast.remove(); });
            }, 2500);
          }
        }, 1500);
      }
    } else {
      position = 0;
    }
  });
})();

/* ══════════════════════════════
   TERMINAL STATUS BAR
══════════════════════════════ */
(function() {
  if (prefersReducedMotion) return;
  var uptimeEl = document.getElementById('statusUptime');
  var upSpeedEl = document.getElementById('statusUpSpeed');
  var downSpeedEl = document.getElementById('statusDownSpeed');
  var processesEl = document.getElementById('statusProcesses');
  if (!uptimeEl) return;

  var startTime = Date.now();

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function update() {
    // Uptime
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var hours = Math.floor(elapsed / 3600);
    var minutes = Math.floor((elapsed % 3600) / 60);
    var seconds = elapsed % 60;
    uptimeEl.textContent = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);

    // Fluctuating stats
    upSpeedEl.textContent = (Math.random() * 4 + 0.5).toFixed(1);
    downSpeedEl.textContent = (Math.random() * 12 + 2).toFixed(1);
    processesEl.textContent = Math.floor(Math.random() * 10 + 18);
  }

  update();
  setInterval(update, 2000);
})();
