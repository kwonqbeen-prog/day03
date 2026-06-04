document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. CARD SCROLL ANIMATION
  ───────────────────────────────────────── */
  const cards = document.querySelectorAll('.card');
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  cards.forEach((card) => {
    card.style.animationPlayState = 'paused';
    cardObserver.observe(card);
  });


  /* ─────────────────────────────────────────
     2. HERO ELEMENT STAGGERED ENTRANCE
  ───────────────────────────────────────── */
  const heroEls = document.querySelectorAll('.hero-el');
  const DELAYS = [120, 320, 500, 800];
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), DELAYS[i] ?? i * 180);
  });


  /* ─────────────────────────────────────────
     3. TYPEWRITER EFFECT (tagline)
  ───────────────────────────────────────── */
  const taglineEl  = document.getElementById('tagline');
  const FULL_TEXT  = '홍보마케팅 & 기획·PM — 콘텐츠와 문화예술, 임팩트의 교차점에서 일합니다.';
  const TYPING_START = 900;
  const CHAR_MS      = 45;

  const cursor = document.createElement('span');
  cursor.className = 'tagline-cursor';
  taglineEl.appendChild(cursor);

  let charIndex = 0;
  setTimeout(() => {
    const timer = setInterval(() => {
      if (charIndex < FULL_TEXT.length) {
        taglineEl.insertBefore(document.createTextNode(FULL_TEXT[charIndex]), cursor);
        charIndex++;
      } else {
        clearInterval(timer);
        setTimeout(() => cursor.remove(), 2000);
      }
    }, CHAR_MS);
  }, TYPING_START);


  /* ─────────────────────────────────────────
     4. CANVAS PARTICLE NETWORK (hero 배경)
  ───────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  const hero   = document.querySelector('.hero');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
  } else {
    const CFG = { count: 60, maxDist: 130, speed: 0.4, radius: 2 };
    let W, H, particles;

    function resize() {
      W = canvas.width  = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function mkParticle() {
      const a = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(a) * CFG.speed * (0.5 + Math.random()),
        vy: Math.sin(a) * CFG.speed * (0.5 + Math.random()),
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CFG.maxDist) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / CFG.maxDist) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, CFG.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
      particles.forEach((p) => {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      });
    });

    resize();
    particles = Array.from({ length: CFG.count }, mkParticle);
    draw();
  }


  /* ─────────────────────────────────────────
     5. PALETTE SWITCHER + DARK MODE TOGGLE
  ───────────────────────────────────────── */
  const toggle     = document.getElementById('palette-toggle');
  const panel      = document.getElementById('palette-panel');
  const paletteCss = document.getElementById('palette-css');
  const palOptions = document.querySelectorAll('.pal-option');
  const themeBtn   = document.getElementById('theme-btn');

  // ── 아이콘 SVG ──
  const SUN_SVG  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>`;

  const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`;

  // ── 현재 표시 모드 판별 ──
  function isDark() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // ── 테마 버튼 라벨 갱신 ──
  function updateThemeBtn() {
    const dark = isDark();
    themeBtn.innerHTML = dark
      ? SUN_SVG  + ' 라이트'   // 현재 다크 → 라이트로 전환 제안
      : MOON_SVG + ' 다크';    // 현재 라이트 → 다크로 전환 제안
    themeBtn.title = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
  }

  // ── 테마 토글 ──
  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('resume-theme', next);
    updateThemeBtn();
  }

  // ── 팔레트 전환 ──
  function setPalette(name) {
    paletteCss.href = `css/palette-${name}.css`;
    palOptions.forEach(opt =>
      opt.classList.toggle('active', opt.dataset.palette === name)
    );
    localStorage.setItem('resume-palette', name);
  }

  // ── 초기화: 저장값 복원 ──
  const savedTheme   = localStorage.getItem('resume-theme');
  const savedPalette = localStorage.getItem('resume-palette') || 'skyblush';

  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedPalette !== 'skyblush') setPalette(savedPalette);
  updateThemeBtn();

  // 시스템 다크모드 변경 감지 (attribute 없을 때만)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!document.documentElement.getAttribute('data-theme')) updateThemeBtn();
  });

  // ── 이벤트 ──
  themeBtn.addEventListener('click', toggleTheme);

  toggle.addEventListener('click', () => {
    const isHidden = panel.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isHidden));
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#palette-widget')) {
      panel.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  palOptions.forEach(opt => {
    opt.addEventListener('click', () => setPalette(opt.dataset.palette));
  });

});
