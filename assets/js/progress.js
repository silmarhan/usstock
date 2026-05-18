/* ===== PROGRESS.JS: Chapter read progress + quiz scores in localStorage ===== */
(function () {
  'use strict';

  const STORAGE_KEY = 'usstock-progress';

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getChapterIdFromUrl() {
    const match = location.pathname.match(/\/(\d{2})-[^/]+\.html$/);
    return match ? match[1] : null;
  }

  // Mark current chapter as started/read
  const chapterId = getChapterIdFromUrl();
  if (chapterId) {
    const data = loadProgress();
    if (!data[chapterId]) data[chapterId] = { started: true, score: null };
    else data[chapterId].started = true;
    saveProgress(data);

    // Mark as read when user scrolls >80%
    let marked = false;
    window.addEventListener('scroll', () => {
      if (marked) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total > 0.8) {
        marked = true;
        const d = loadProgress();
        if (!d[chapterId]) d[chapterId] = {};
        d[chapterId].read = true;
        saveProgress(d);
        updateSidebarDots();
      }
    }, { passive: true });
  }

  function extractChapterId(href) {
    const m = href.match(/(?:chapters\/)?(\d{2})-/) || href.match(/\/chapters\/(\d+)/);
    return m ? m[1] : null;
  }

  // Update sidebar progress dots — current chapter green, all others amber
  function updateSidebarDots() {
    document.querySelectorAll('.sidebar-chapter-list li a').forEach(a => {
      const dot = a.querySelector('.sidebar-progress-dot');
      if (!dot) return;
      dot.classList.remove('done', 'partial');
      dot.classList.add(a.classList.contains('active') ? 'done' : 'partial');
    });
  }

  // Update chapter cards on index page
  function updateIndexCards() {
    const data = loadProgress();
    document.querySelectorAll('.chapter-card').forEach(card => {
      const href = card.getAttribute('href') || '';
      const cid = extractChapterId(href);
      if (!cid) return;
      const fill = card.querySelector('.card-progress-fill');
      if (!fill) return;
      const prog = data[cid] || {};
      if (prog.read) fill.style.width = '100%';
      else if (prog.started) fill.style.width = '30%';
      else fill.style.width = '0%';
    });
  }

  // Save quiz score for a chapter
  window.usstock = window.usstock || {};
  window.usstock.saveQuizScore = function (cid, score, total) {
    const data = loadProgress();
    if (!data[cid]) data[cid] = {};
    data[cid].score = score;
    data[cid].total = total;
    saveProgress(data);
  };

  window.usstock.getProgress = loadProgress;

  document.addEventListener('DOMContentLoaded', () => {
    updateSidebarDots();
    updateIndexCards();
  });
})();
