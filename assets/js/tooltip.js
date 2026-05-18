/* ===== TOOLTIP.JS: Glossary term hover popup ===== */
(function () {
  'use strict';

  let glossary = {};
  let popup = null;
  let hideTimer = null;

  function createPopup() {
    popup = document.createElement('div');
    popup.className = 'tooltip-popup';
    popup.setAttribute('role', 'tooltip');
    document.body.appendChild(popup);
  }

  function showPopup(term, x, y) {
    const entry = glossary[term];
    if (!entry) return;

    popup.innerHTML = `
      <div class="tooltip-en">${entry.en || term}</div>
      <div class="tooltip-def">${entry.def}</div>
    `;

    // Position
    const W = window.innerWidth;
    const left = Math.min(x + 12, W - 300);
    popup.style.left = left + 'px';
    popup.style.top = (y + 20) + 'px';
    popup.classList.add('show');
  }

  function hidePopup() {
    hideTimer = setTimeout(() => {
      popup?.classList.remove('show');
    }, 120);
  }

  async function loadGlossary() {
    try {
      // Resolve relative to root
      const base = document.querySelector('meta[name="base-url"]')?.content || '/';
      const res = await fetch(base + 'assets/data/glossary.json');
      const data = await res.json();
      data.forEach(item => { glossary[item.term] = item; });
    } catch {
      // Glossary unavailable - tooltips just won't show
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    createPopup();
    await loadGlossary();

    document.querySelectorAll('[data-term]').forEach(el => {
      const term = el.dataset.term;

      el.addEventListener('mouseenter', e => {
        clearTimeout(hideTimer);
        showPopup(term, e.clientX, e.clientY);
      });

      el.addEventListener('mousemove', e => {
        const W = window.innerWidth;
        popup.style.left = Math.min(e.clientX + 12, W - 300) + 'px';
        popup.style.top = (e.clientY + 20) + 'px';
      });

      el.addEventListener('mouseleave', hidePopup);
    });

    popup.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popup.addEventListener('mouseleave', hidePopup);
  });
})();
