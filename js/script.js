document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. CARD SCROLL ANIMATION (기존 유지)
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
  const DELAYS = [120, 320, 500, 800]; // ms per element

  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), DELAYS[i] ?? i * 180);
  });


  /* ─────────────────────────────────────────
     3. TYPEWRITER EFFECT (tagline)
  ───────────────────────────────────────── */
  const taglineEl = document.getElementById('tagline');
  const FULL_TEXT = '홍보마케팅 & 기획·PM — 콘텐츠와 문화예술, 임팩트의 교차점에서 일합니다.';
  const TYPING_DELAY = 900;   // ms before typing starts
  const CHAR_INTERVAL = 45;   // ms per character

  const cursor = document.createElement('span');
  cursor.className = 'tagline-cursor';
  taglineEl.appendChild(cursor);

  let charIndex = 0;

  setTimeout(() => {
    const timer = setInterval(() => {
      if (charIndex < FULL_TEXT.length) {
        const textNode = document.createTextNode(FULL_TEXT[charIndex]);
        taglineEl.insertBefore(textNode, cursor);
        charIndex++;
      } else {
        clearInterval(timer);
        // 커서 2초 후 자연스럽게 제거
        setTimeout(() => cursor.remove(), 2000);
      }
    }, CHAR_INTERVAL);
  }, TYPING_DELAY);


  /* ─────────────────────────────────────────
     4. CANVAS PARTICLE NETWORK (hero 배경)
  ───────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  const hero   = document.querySelector('.hero');

  // 사용자가 모션 줄이기 설정 시 파티클 비활성화
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const CONFIG = {
    count:       60,    // 파티클 수
    maxDist:     130,   // 선을 그을 최대 거리 (px)
    speed:       0.4,   // 이동 속도
    radius:      2,     // 파티클 반지름
    color:       'rgba(255,255,255,',  // 알파값은 동적으로 결정
  };

  let W, H, particles;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * CONFIG.speed * (0.5 + Math.random()),
      vy: Math.sin(angle) * CONFIG.speed * (0.5 + Math.random()),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 파티클 이동
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    // 선 그리기
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.25;
          ctx.strokeStyle = CONFIG.color + alpha + ')';
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // 파티클 점 그리기
    particles.forEach((p) => {
      ctx.fillStyle = CONFIG.color + '0.6)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    // 화면 밖으로 나간 파티클 재배치
    particles.forEach((p) => {
      if (p.x > W) p.x = Math.random() * W;
      if (p.y > H) p.y = Math.random() * H;
    });
  });

  init();
  draw();

});
