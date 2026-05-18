/* ===== THEME.JS: Dark/Light toggle with localStorage ===== */
(function () {
  'use strict';

  const STORAGE_KEY = 'usstock-theme';
  const DEFAULT_THEME = 'dark';

  function getTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME; } catch { return DEFAULT_THEME; }
  }

  function swapHeroImages(theme) {
    document.querySelectorAll('.chapter-hero img, .card-thumb img').forEach(img => {
      const wantPaper = theme === 'paper';
      const isPaper = /-hero-paper\.png(\?.*)?$/.test(img.src);
      if (wantPaper === isPaper) return;
      const newSrc = wantPaper
        ? img.src.replace(/-hero\.png(\?.*)?$/, '-hero-paper.png$1')
        : img.src.replace(/-hero-paper\.png(\?.*)?$/, '-hero.png$1');
      const probe = new Image();
      probe.onload = () => { img.src = newSrc; };
      probe.onerror = () => { /* paper variant missing — keep current src */ };
      probe.src = newSrc;
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'paper' ? 'paper' : '');
    document.body.setAttribute('data-theme', theme === 'paper' ? 'paper' : '');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode */ }
    swapHeroImages(theme);

    // Update toggle icon
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'paper' ? '切换暗色模式' : '切换亮色模式');
      btn.innerHTML = theme === 'paper'
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
             <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
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
    }
  }

  // Apply on load
  const saved = getTheme();
  applyTheme(saved);

  // Wire toggle buttons
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getTheme());
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = getTheme();
        applyTheme(current === 'paper' ? 'dark' : 'paper');
      });
    });
  });
})();
