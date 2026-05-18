/* ===== NAV.JS: Progress bar + TOC highlighting + sidebar active ===== */
(function () {
  'use strict';

  // Reading progress bar
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // TOC: highlight active heading
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('article h2[id], article h3[id]');

  if (tocLinks.length && headings.length) {
    const NAV_OFFSET = 80;
    let ticking = false;

    const activateToc = () => {
      const scrollY = window.scrollY + NAV_OFFSET + 20;
      let activeId = null;

      headings.forEach(h => {
        if (h.offsetTop <= scrollY) activeId = h.id;
      });

      tocLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
      });
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { activateToc(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });

    activateToc();
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // Mobile sidebar toggle
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.chapter-sidebar');
  if (menuBtn && sidebar) {
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);

    function openSidebar() {
      sidebar.classList.add('open');
      backdrop.classList.add('show');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    backdrop.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
  }

  // Scroll reveal via IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }
})();
