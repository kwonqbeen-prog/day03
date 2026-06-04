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
     5. PALETTE SWITCHER
  ───────────────────────────────────────── */
  const toggle     = document.getElementById('palette-toggle');
  const panel      = document.getElementById('palette-panel');
  const paletteCss = document.getElementById('palette-css');
  const swatches   = document.querySelectorAll('.swatch');
  const palBtns    = document.querySelectorAll('.pal-btn');

  // 라벨 맵 (팔레트별 swatch 이름)
  const LABELS = {
    skyblush:  ['Sky', 'Blush', 'Peach', 'Lilac', 'Mist'],
    oceandusk: ['Teal', 'Coral', 'Amber', 'Peri', 'Sage'],
  };

  function setPalette(name) {
    paletteCss.href = `css/palette-${name}.css`;

    // 버튼 active 상태
    palBtns.forEach(btn =>
      btn.classList.toggle('active', btn.dataset.palette === name)
    );

    // swatch 툴팁 라벨 교체
    const labels = LABELS[name] || LABELS.skyblush;
    swatches.forEach((s, i) => s.setAttribute('data-name', labels[i] || ''));

    localStorage.setItem('resume-palette', name);
  }

  // 저장된 팔레트 복원
  const saved = localStorage.getItem('resume-palette') || 'skyblush';
  if (saved !== 'skyblush') setPalette(saved);

  // 패널 토글
  toggle.addEventListener('click', () => {
    const isHidden = panel.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!isHidden));
  });

  // 패널 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#palette-widget')) {
      panel.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // 팔레트 선택
  palBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setPalette(btn.dataset.palette);
    });
  });

});
