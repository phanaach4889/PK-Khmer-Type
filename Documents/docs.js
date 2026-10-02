/* ============================================================
   PK Khmer Type — Documentation Interactive Script
   Search, Scrollspy, Tabs, Copy Buttons & Bilingual Toggle
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scrollspy for Sidebar Table of Contents
  const sections = document.querySelectorAll('.doc-section');
  const tocLinks = document.querySelectorAll('.toc-link');

  function updateActiveToc() {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' + currentId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveToc, { passive: true });
  updateActiveToc();

  // 2. Interactive Search Filter
  const searchInput = document.getElementById('docsSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      sections.forEach(sec => {
        if (!q) {
          sec.style.display = '';
          return;
        }
        const text = sec.innerText.toLowerCase();
        if (text.includes(q)) {
          sec.style.display = '';
        } else {
          sec.style.display = 'none';
        }
      });
    });

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
      }
    });
  }

  // 3. One-Click Copy for Code Snippets
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeWrap = btn.closest('.code-block-wrap');
      if (!codeWrap) return;
      const codeEl = codeWrap.querySelector('pre code') || codeWrap.querySelector('pre');
      if (!codeEl) return;
      const text = codeEl.innerText;

      try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        btn.style.color = 'var(--doc-mint)';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  });

  // 4. Tab Navigation for Keyboard Layout Previews
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      tabPanes.forEach(p => p.classList.toggle('active', p.id === target));
    });
  });

  // 5. Mobile Drawer Toggle
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('docsSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close when clicking a link on mobile
    tocLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('open');
        }
      });
    });
  }

  // 6. Bilingual Language Toggle (English / Khmer)
  const langToggleBtn = document.getElementById('docsLangToggle');
  let currentDocLang = localStorage.getItem('pk_doc_lang') || 'en';

  function applyDocLanguage(lang) {
    currentDocLang = lang;
    localStorage.setItem('pk_doc_lang', lang);
    document.querySelectorAll('.doc-i18n').forEach(el => {
      const translation = el.dataset[lang];
      if (translation) el.innerHTML = translation;
    });
    if (langToggleBtn) {
      langToggleBtn.querySelector('.lang-label').textContent = lang === 'en' ? 'ខ្មែរ' : 'English';
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const nextLang = currentDocLang === 'en' ? 'km' : 'en';
      applyDocLanguage(nextLang);
    });
  }
  applyDocLanguage(currentDocLang);
});
