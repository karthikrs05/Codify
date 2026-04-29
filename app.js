function setActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach((el) => {
    if (el.dataset.page === page) el.classList.add('active');
  });
}

function typeHero() {
  const line = document.querySelector('[data-typing]');
  if (!line) return;

  const text = line.dataset.typing;
  let idx = 0;
  line.textContent = '';
  line.classList.add('typing');

  const timer = setInterval(() => {
    idx += 1;
    line.textContent = text.slice(0, idx);
    if (idx >= text.length) {
      clearInterval(timer);
      setTimeout(() => line.classList.remove('typing'), 600);
    }
  }, 30);
}

function animateXP() {
  document.querySelectorAll('[data-xp]').forEach((el) => {
    const pct = Number(el.dataset.xp || 0);
    requestAnimationFrame(() => {
      el.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    });
  });
}

function staggerCards() {
  document.querySelectorAll('.problem-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 95}ms`;
  });
}

function initBadgeUnlock() {
  const btn = document.querySelector('[data-unlock-btn]');
  const badge = document.querySelector('[data-badge]');
  if (!btn || !badge) return;

  btn.addEventListener('click', () => {
    badge.classList.remove('unlock');
    void badge.offsetWidth;
    badge.classList.add('unlock');
    badge.innerHTML = '🏆 <span>Badge Unlocked: Runtime Crusher</span>';
  });
}

function initVerdict() {
  const ac = document.querySelector('[data-ac]');
  const wa = document.querySelector('[data-wa]');
  const panel = document.querySelector('[data-verdict]');
  if (!ac || !wa || !panel) return;

  function show(type, text) {
    panel.className = `verdict ${type}`;
    panel.textContent = text;
    void panel.offsetWidth;
    panel.classList.add('show');
  }

  ac.addEventListener('click', () => show('ac', 'Accepted • +120 XP • 100/100 tests passed'));
  wa.addEventListener('click', () => show('wa', 'Wrong Answer • Failed on hidden test #7'));
}

setActiveNav();
typeHero();
animateXP();
staggerCards();
initBadgeUnlock();
initVerdict();
