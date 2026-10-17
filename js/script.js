(function () {
  'use strict';

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  var storedTheme = null;
  try { storedTheme = localStorage.getItem('theme'); } catch (e) {}
  root.setAttribute('data-theme', storedTheme === 'light' ? 'light' : 'dark');

  themeToggle.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    var isDark = current
      ? current === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  menuToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });

  /* ---------- Nav scroll state + active link + pen progress line ---------- */
  var nav = document.getElementById('nav');
  var inkLine = document.getElementById('inkLine');
  var inkPool = document.getElementById('inkPool');
  var inkPen = document.getElementById('inkPen');
  var inkStrip = document.querySelector('.ink-strip');
  var INK_Y = 19, INK_ANGLE = -20, inkLen = 1;

  function buildInk() {
    var w = inkStrip.clientWidth, x = 0, d = 'M0 ' + INK_Y;
    while (x < w) {
      x += 9 + Math.abs(Math.sin(x * 0.37)) * 7;
      var y = INK_Y + Math.sin(x * 0.03) * 0.9 + Math.sin(x * 0.17 + 1) * 0.5;
      d += ' L' + Math.min(x, w).toFixed(1) + ' ' + y.toFixed(2);
    }
    inkLine.setAttribute('d', d);
    inkLen = inkLine.getTotalLength();
    inkLine.style.strokeDasharray = inkLen;
  }
  function updateInk(p) {
    if (!isFinite(p) || !inkLen) return;
    inkLine.style.strokeDashoffset = inkLen * (1 - p);
    var at = Math.max(0.01, inkLen * p);
    var pt = inkLine.getPointAtLength(at);
    var ahead = inkLine.getPointAtLength(Math.min(inkLen, at + 3));
    var slope = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
    inkPool.setAttribute('cx', pt.x);
    inkPool.setAttribute('cy', pt.y);
    inkPool.style.opacity = p > 0.003 ? 1 : 0;
    inkPen.setAttribute('transform', 'translate(' + pt.x + ' ' + pt.y + ') rotate(' + (INK_ANGLE + slope * 0.5) + ')');
  }
  buildInk();
  window.addEventListener('resize', function () { buildInk(); onScroll(); });
  var sections = document.querySelectorAll('main > section');
  var navAnchors = document.querySelectorAll('[data-nav]');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 10);

    var doc = document.documentElement;
    var maxScroll = doc.scrollHeight - doc.clientHeight;
    if (maxScroll > 0 && document.body.style.position !== 'fixed') {
      updateInk(Math.max(0, Math.min(1, doc.scrollTop / maxScroll)));
    }

    var current = '';
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom > 120) current = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  document.getElementById('toTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Typewriter ---------- */
  var phrases = ['Researcher.', 'Builder.', 'Problem Solver.', 'Lifelong Learner.'];
  var tw = document.getElementById('typewriter');
  var phraseIndex = 0, charIndex = 0, deleting = false;

  function typeTick() {
    var phrase = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      tw.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(typeTick, 1400);
        return;
      }
    } else {
      charIndex--;
      tw.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(typeTick, deleting ? 40 : 80);
  }
  typeTick();

  /* ---------- Projects: render, filter, detail modal ---------- */
  var projects = (typeof PROJECTS !== 'undefined') ? PROJECTS : [];
  var categories = (typeof CATEGORIES !== 'undefined') ? CATEGORIES : { all: 'All' };

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function initials(title) {
    return (title || '').trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w[0] || ''; }).join('').toUpperCase() || '•';
  }

  function inline(text) {
    return esc(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      if (!/^(assets\/|https:\/\/)/.test(url)) return m;
      return '<a class="text-link" href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
  }

  function primaryLink(project) {
    return (project.links || []).find(function (l) { return l.primary; });
  }

  function statusClass(status) {
    var s = (status || '').toLowerCase();
    if (s.indexOf('progress') >= 0) return 'status-progress';
    if (s.indexOf('completed') >= 0) return 'status-completed';
    if (s.indexOf('concept') >= 0 || s.indexOf('archived') >= 0) return 'status-muted';
    return '';
  }

  function mediaMarkup(project) {
    if (project.image) {
      return '<img src="' + esc(project.image) + '" alt="' + esc(project.title) + '" loading="lazy">';
    }
    return '<div class="card-placeholder"><span>' + esc(initials(project.title)) + '</span></div>';
  }

  function cardMarkup(project) {
    var tags = (project.stack || []).slice(0, 4)
      .map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    var pl = primaryLink(project);
    var primaryBtn = !pl ? ''
      : pl.action === 'demo'
        ? '<button class="btn btn-primary btn-sm" type="button" data-action="try-demo">' + esc(pl.label) + '</button>'
        : '<a class="btn btn-primary btn-sm" href="' + esc(pl.url) + '" target="_blank" rel="noopener">' + esc(pl.label) + ' ↗</a>';
    var entryNum = projects.indexOf(project) + 1;
    var entryTag = '<span class="card-entry-tag">ENTRY ' + (entryNum < 10 ? '0' + entryNum : entryNum) + '</span>';
    return (
      '<article class="project-card reveal visible ' + statusClass(project.status) + '" data-id="' + esc(project.id) + '" data-category="' + esc(project.category) + '">' +
        '<div class="card-entry-bar">' + entryTag + '</div>' +
        '<div class="card-media">' + mediaMarkup(project) + '</div>' +
        '<div class="project-card-top">' +
          '<span class="project-status ' + statusClass(project.status) + '">' + esc(project.status || '') + '</span>' +
          '<span class="project-year">' + esc(project.year || '') + '</span>' +
        '</div>' +
        '<h3>' + esc(project.title) + '</h3>' +
        '<p>' + inline(project.tagline || '') + '</p>' +
        '<div class="project-tags">' + tags + '</div>' +
        '<div class="card-actions">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-action="details">Learn More →</button>' +
          primaryBtn +
        '</div>' +
      '</article>'
    );
  }

  function modalMarkup(project) {
    var stack = (project.stack || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    var desc = (project.description || []).map(function (p) { return '<p>' + inline(p) + '</p>'; }).join('');
    var highlights = (project.highlights || []).length
      ? '<h4>Highlights</h4><ul class="dialog-highlights">' +
        project.highlights.map(function (h) { return '<li>' + inline(h) + '</li>'; }).join('') + '</ul>'
      : '';
    var links = (project.links || []).filter(function (l) { return l.url; }).map(function (l) {
      return '<a class="btn btn-ghost" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + ' ↗</a>';
    }).join('');
    var image = project.image
      ? '<img class="dialog-image" src="' + esc(project.image) + '" alt="' + esc(project.title) + '">'
      : '';
    var demo = (project.demo && project.demo.type === 'replay') ? demoMarkup() : '';

    return (
      image +
      '<p class="dialog-tag"><span class="' + statusClass(project.status) + '">' + esc(project.status || '') + '</span>' + (project.year ? ' · ' + esc(project.year) : '') + '</p>' +
      '<h2 id="dialogTitle">' + esc(project.title) + '</h2>' +
      '<p class="dialog-tagline">' + inline(project.tagline || '') + '</p>' +
      desc +
      highlights +
      demo +
      (stack ? '<h4>Built with</h4><div class="project-tags">' + stack + '</div>' : '') +
      (links ? '<div class="dialog-links">' + links + '</div>' : '')
    );
  }

  /* ---------- Cognify replay demo (recorded real runs, see cognify-demo-data.js) ---------- */
  function demoMarkup() {
    var data = (typeof COGNIFY_DEMO !== 'undefined') ? COGNIFY_DEMO : null;
    if (!data) return '';
    var patientBtns = data.patients.map(function (p, i) {
      return '<button class="demo-patient-btn' + (i === 0 ? ' active' : '') + '" data-patient="' + esc(p.id) + '">' + esc(p.label) + '</button>';
    }).join('');
    return (
      '<div class="cognify-demo" data-demo="replay">' +
        '<h4>Try it — replayed from a sample run</h4>' +
        '<p class="demo-note">⚠ ' + esc(data.note) + '</p>' +
        '<div class="demo-patients">' + patientBtns + '</div>' +
        '<div class="demo-trace" id="demoTrace"></div>' +
        '<div class="demo-controls">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-demo-action="step">Next step →</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-demo-action="restart">Restart</button>' +
        '</div>' +
      '</div>'
    );
  }

  var demoState = { patientId: null, roundsShown: 0, noteShown: false };

  function demoPatient() {
    if (typeof COGNIFY_DEMO === 'undefined') return null;
    return COGNIFY_DEMO.patients.find(function (p) { return p.id === demoState.patientId; }) || COGNIFY_DEMO.patients[0];
  }

  function roundMarkup(round, index) {
    return (
      '<div class="demo-round reveal visible">' +
        '<p class="demo-round-label">Round ' + (index + 1) + '</p>' +
        '<p class="demo-reasoning">' + esc(round.purpose) + '</p>' +
        '<div class="demo-tool-call">' +
          '<span class="demo-tool-name">' + esc(round.tool) + '(' + esc(JSON.stringify(round.args)) + ')</span>' +
        '</div>' +
        '<p class="demo-observation">' + esc(round.observation) + '</p>' +
      '</div>'
    );
  }

  function noteMarkup(note) {
    return (
      '<div class="demo-final-note reveal visible">' +
        '<h4>Model Conclusion</h4><p>' + esc(note.conclusion) + '</p>' +
        '<h4>Key Drivers</h4><ul class="dialog-highlights">' +
          note.drivers.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') +
        '</ul>' +
        '<h4>Clinical Interpretation</h4><p>' + esc(note.interpretation) + '</p>' +
        '<h4>Caveats</h4><p>' + esc(note.caveats) + '</p>' +
        '<p class="demo-synth">Synthetic patient data. Research prototype, not a validated medical device.</p>' +
      '</div>'
    );
  }

  function renderDemoTrace() {
    var el = document.getElementById('demoTrace');
    if (!el) return;
    var patient = demoPatient();
    if (!patient) return;
    var html = patient.rounds.slice(0, demoState.roundsShown).map(roundMarkup).join('');
    if (demoState.noteShown) html += noteMarkup(patient.noteOut);
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
    var nextBtn = dialogBody.querySelector('[data-demo-action="step"]');
    if (nextBtn) nextBtn.style.display = demoState.noteShown ? 'none' : '';
  }

  function resetDemo(patientId) {
    demoState = { patientId: patientId || demoState.patientId, roundsShown: 0, noteShown: false };
    renderDemoTrace();
  }

  function stepDemo() {
    var patient = demoPatient();
    if (!patient) return;
    if (demoState.roundsShown < patient.rounds.length) {
      demoState.roundsShown++;
    } else if (!demoState.noteShown) {
      demoState.noteShown = true;
    }
    renderDemoTrace();
  }

  function initCognifyDemo() {
    if (!dialogBody) return;
    dialogBody.addEventListener('click', function (e) {
      var patientBtn = e.target.closest('.demo-patient-btn');
      if (patientBtn) {
        dialogBody.querySelectorAll('.demo-patient-btn').forEach(function (b) { b.classList.remove('active'); });
        patientBtn.classList.add('active');
        resetDemo(patientBtn.getAttribute('data-patient'));
        return;
      }
      var action = e.target.closest('[data-demo-action]');
      if (action) {
        var act = action.getAttribute('data-demo-action');
        if (act === 'step') stepDemo();
        if (act === 'restart') resetDemo();
      }
    });
  }

  function renderProjects(list) {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = list.map(cardMarkup).join('');
  }

  function initFilters() {
    var bar = document.getElementById('filterBar');
    if (!bar) return;
    var present = Object.keys(categories).filter(function (key) {
      return key === 'all' || projects.some(function (p) { return p.category === key; });
    });
    // A filter with only "All" and one category does nothing, so hide the bar until there are two or more.
    if (present.length <= 2) { bar.style.display = 'none'; return; }
    bar.innerHTML = present.map(function (key, i) {
      return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" data-filter="' + esc(key) + '">' + esc(categories[key]) + '</button>';
    }).join('');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      var filtered = filter === 'all' ? projects : projects.filter(function (p) { return p.category === filter; });
      renderProjects(filtered);
    });
  }

  var projectDialog = document.getElementById('projectDialog');
  var dialogBody = document.getElementById('dialogBody');

  var scrollLockY = 0;
  var bodyLocked = false;
  function lockBodyScroll() {
    if (bodyLocked) return;
    bodyLocked = true;
    scrollLockY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockBodyScroll() {
    if (!bodyLocked) return;
    bodyLocked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    var root = document.documentElement, prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollLockY);
    root.style.scrollBehavior = prevBehavior;
  }

  function openProject(id, goToDemo) {
    var project = projects.find(function (p) { return p.id === id; });
    if (!project || !projectDialog || !dialogBody) return;
    dialogBody.innerHTML = modalMarkup(project);
    dialogBody.scrollTop = 0;
    if (project.demo && project.demo.type === 'replay' && typeof COGNIFY_DEMO !== 'undefined') {
      resetDemo(COGNIFY_DEMO.patients[0].id);
    }
    lockBodyScroll();
    if (typeof projectDialog.showModal === 'function') projectDialog.showModal();
    if (goToDemo) {
      var toDemo = function () {
        var demoEl = dialogBody.querySelector('.cognify-demo');
        if (!demoEl) return;
        dialogBody.scrollTop += demoEl.getBoundingClientRect().top - dialogBody.getBoundingClientRect().top - 12;
      };
      toDemo();
      setTimeout(toDemo, 250);
    }
  }

  function initProjectGrid() {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var tryBtn = e.target.closest('[data-action="try-demo"]');
      if (tryBtn) {
        openProject(tryBtn.closest('.project-card').getAttribute('data-id'), true);
        return;
      }
      var card = e.target.closest('.project-card');
      if (card) openProject(card.getAttribute('data-id'));
    });
  }

  function initDialog() {
    if (!projectDialog) return;
    var closeBtn = document.getElementById('dialogClose');
    if (closeBtn) closeBtn.addEventListener('click', function () { unlockBodyScroll(); projectDialog.close(); });
    projectDialog.addEventListener('click', function (e) {
      if (e.target === projectDialog) { unlockBodyScroll(); projectDialog.close(); }
    });
    projectDialog.addEventListener('cancel', unlockBodyScroll);
    projectDialog.addEventListener('close', unlockBodyScroll);
  }

  initFilters();
  renderProjects(projects);
  initProjectGrid();
  initDialog();
  initCognifyDemo();

  /* ---------- Copy email ---------- */
  var copyEmailBtn = document.getElementById('copyEmail');
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, 2200);
  }
  // The address is only assembled when someone interacts, so it never sits in the page source or DOM for scrapers to harvest.
  function emailFrom(el) {
    return el ? (el.getAttribute('data-u') || '') + '@' + (el.getAttribute('data-d') || '') : '';
  }
  var emailLink = document.getElementById('emailLink');
  if (emailLink) {
    var armEmail = function () { emailLink.setAttribute('href', 'mailto:' + emailFrom(emailLink)); };
    ['pointerenter', 'focus', 'touchstart'].forEach(function (t) { emailLink.addEventListener(t, armEmail, { passive: true }); });
    emailLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'mailto:' + emailFrom(emailLink);
    });
  }
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      var address = emailFrom(copyEmailBtn);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(function () {
          showToast('Email address copied');
        }, function () { showToast(address); });
      } else {
        showToast(address);
      }
    });
  }

  /* ---------- Photo strip: slow auto-scroll, pauses on manual scroll, loops forever ---------- */
  function initPhotoStrip() {
    var strip = document.querySelector('.photo-strip');
    if (!strip) return;
    var originals = Array.prototype.slice.call(strip.children);
    if (!originals.length) return;

    // Duplicate the set so the strip can scroll past the end and wrap seamlessly.
    originals.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      strip.appendChild(clone);
    });

    var period = 0;
    function measure() {
      period = strip.children[originals.length].offsetLeft - originals[0].offsetLeft;
    }
    measure();
    window.addEventListener('resize', measure);

    var lastInput = 0;
    var pos = 0;
    function markInput() { lastInput = performance.now(); }
    ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function (type) {
      strip.addEventListener(type, markInput, { passive: true });
    });
    strip.addEventListener('scroll', function () {
      if (Math.abs(strip.scrollLeft - pos) > 2) markInput();
    }, { passive: true });

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var prev = performance.now();
    setInterval(function () {
      var now = performance.now();
      var dt = Math.min(now - prev, 100);
      prev = now;
      if (!reduceMotion.matches && now - lastInput > 1500) {
        pos += dt * 0.012;
        if (period > 0 && pos >= period) pos -= period;
        strip.scrollLeft = pos;
      } else {
        pos = strip.scrollLeft;
        if (period > 0 && pos >= period) {
          strip.scrollLeft = pos - period;
          pos = strip.scrollLeft;
        }
      }
    }, 50);
  }
  initPhotoStrip();

  /* ---------- About: expander only on narrow screens; always open beside the photo column ---------- */
  (function () {
    var more = document.querySelector('.about-more');
    if (!more) return;
    var wide = window.matchMedia('(min-width: 861px)');
    function sync() { if (wide.matches) more.open = true; }
    sync();
    if (wide.addEventListener) wide.addEventListener('change', function (e) { if (e.matches) more.open = true; else more.open = false; });
  })();

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Hero field-log date stamp ---------- */
  var heroDateEl = document.getElementById('heroDate');
  if (heroDateEl) {
    var now = new Date();
    var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    heroDateEl.textContent = months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
  }

  /* ---------- Particle background (hero) ---------- */
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var hero = document.getElementById('hero');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function initParticles() {
    var count = Math.min(60, Math.floor(canvas.width / 20));
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        twPhase: Math.random() * Math.PI * 2,
        twSpeed: 0.0008 + Math.random() * 0.0012
      });
    }
  }

  /* A couple of fixed star patterns (normalized 0-1 coordinates, scaled to the
     canvas each frame) so the night sky reads as deliberate constellations
     rather than just a random particle field. */
  var CONSTELLATIONS = [
    {
      points: [[0.08, 0.18], [0.14, 0.13], [0.195, 0.19], [0.25, 0.15], [0.29, 0.24], [0.35, 0.21]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]
    },
    {
      points: [[0.7, 0.12], [0.78, 0.24], [0.87, 0.14], [0.82, 0.32], [0.91, 0.36]],
      edges: [[0, 1], [1, 2], [1, 3], [3, 4]]
    },
    {
      points: [[0.15, 0.78], [0.22, 0.7], [0.3, 0.76], [0.36, 0.66], [0.44, 0.72]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4]]
    }
  ];

  function drawConstellations(color, t) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    CONSTELLATIONS.forEach(function (c) {
      var pts = c.points.map(function (p) { return { x: p[0] * canvas.width, y: p[1] * canvas.height }; });
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1.1;
      c.edges.forEach(function (e) {
        var a = pts[e[0]], b = pts[e[1]];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
      pts.forEach(function (p, i) {
        var tw = 0.55 + 0.45 * Math.sin(t * 0.0012 + i * 1.7);
        ctx.globalAlpha = tw * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = tw;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.globalAlpha = 1;
  }

  function drawMoon(color) {
    var r = Math.max(20, Math.min(36, canvas.width * 0.032));
    var mx = canvas.width - r * 2.6;
    var my = r * 2.2;
    ctx.save();

    ctx.globalAlpha = 0.14;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(mx, my, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(mx + r * 0.62, my - r * 0.4, r * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* Occasional shooting star streak for a bit of "space" motion. */
  var shootingStars = [];
  function maybeSpawnShootingStar() {
    if (reduceMotion) return;
    if (shootingStars.length) return;
    if (Math.random() > 0.0025) return;
    shootingStars.push({
      x: Math.random() * canvas.width * 0.6,
      y: Math.random() * canvas.height * 0.35,
      vx: 4 + Math.random() * 3,
      vy: 2 + Math.random() * 1.5,
      life: 0,
      maxLife: 40 + Math.random() * 20
    });
  }
  function drawShootingStars(color) {
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    shootingStars = shootingStars.filter(function (s) { return s.life < s.maxLife; });
    shootingStars.forEach(function (s) {
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      var fade = 1 - s.life / s.maxLife;
      ctx.globalAlpha = Math.max(0, fade * 0.7);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  /* A few simple fish silhouettes drifting slowly across the night sky, nodding
     to the fish-keeping hobby in About. Pure canvas shapes — no image assets. */
  var fish = [];
  function initFish() {
    var count = Math.max(3, Math.min(6, Math.floor(canvas.width / 260)));
    fish = [];
    for (var i = 0; i < count; i++) {
      var dir = Math.random() < 0.5 ? 1 : -1;
      var size = 9 + Math.random() * 9;
      fish.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.12 + Math.random() * canvas.height * 0.76,
        size: size,
        speed: 0.02 + Math.random() * 0.025,
        dir: dir,
        phase: Math.random() * Math.PI * 2,
        bob: Math.random() * Math.PI * 2
      });
    }
  }

  function drawFish(f, color, t) {
    var wag = Math.sin(t * 0.003 + f.phase);
    var y = f.y + Math.sin(t * 0.0008 + f.bob) * 6;
    ctx.save();
    ctx.translate(f.x, y);
    ctx.scale(f.dir, 1);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.ellipse(0, 0, f.size, f.size * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    var tailX = -f.size * 0.92;
    ctx.beginPath();
    ctx.moveTo(tailX, 0);
    ctx.lineTo(tailX - f.size * 0.6, -f.size * 0.5 + wag * f.size * 0.35);
    ctx.lineTo(tailX - f.size * 0.6, f.size * 0.5 + wag * f.size * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function updateFish(dt) {
    fish.forEach(function (f) {
      f.x += f.dir * f.speed * dt;
      var margin = f.size * 2;
      if (f.dir > 0 && f.x - margin > canvas.width) f.x = -margin;
      if (f.dir < 0 && f.x + margin < 0) f.x = canvas.width + margin;
    });
  }

  function getAccentColor() {
    /* Hero background is always dark (a night sky), independent of the
       light/dark toggle, so the stars always use the pale-gold tone
       rather than flipping to the darker light-theme accent. */
    return '#ffe6b0';
  }

  var lastFrame = null;

  function drawParticles(now) {
    var dt = lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now || performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var color = getAccentColor();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    drawMoon(color);

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      var tw = 0.35 + 0.35 * Math.sin(lastFrame * p.twSpeed + p.twPhase);
      ctx.globalAlpha = tw;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 0.12;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var a = particles[i], b = particles[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    drawConstellations(color, lastFrame);

    maybeSpawnShootingStar();
    drawShootingStars(color);

    updateFish(dt);
    fish.forEach(function (f) { drawFish(f, color, lastFrame); });

    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }

  if (canvas && !reduceMotion) {
    resizeCanvas();
    initParticles();
    initFish();
    requestAnimationFrame(drawParticles);
    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles();
      initFish();
    });
  } else if (canvas) {
    resizeCanvas();
    initParticles();
    initFish();
    drawParticles(performance.now());
  }
})();
