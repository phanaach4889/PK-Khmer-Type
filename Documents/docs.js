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
    const scrollPos = window.scrollY + 130;

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

  // 2. High-Performance Omnisearch Engine with Dropdown & In-Page Jumps
  function initSearchEngine() {
    const searchInput = document.getElementById('docsSearchInput');
    const searchWrap = document.querySelector('.search-wrap');
    if (!searchInput || !searchWrap) return;

    let dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'searchResultsDropdown';
      dropdown.className = 'search-dropdown';
      dropdown.hidden = true;
      searchWrap.appendChild(dropdown);
    }

    let clearBtn = document.getElementById('searchClearBtn');
    if (!clearBtn) {
      clearBtn = document.createElement('button');
      clearBtn.id = 'searchClearBtn';
      clearBtn.className = 'search-clear-btn';
      clearBtn.type = 'button';
      clearBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      clearBtn.title = 'Clear search';
      clearBtn.hidden = true;
      searchWrap.appendChild(clearBtn);
    }

    // Category mappings for breadcrumb display
    const sectionCategories = {
      'overview': { en: 'Getting Started', km: 'ការចាប់ផ្តើម' },
      'keycap-3d': { en: 'Interactive 3D Object', km: 'ម៉ូឌែល 3D ផ្ទាល់' },
      'quickstart': { en: 'Getting Started', km: 'ការចាប់ផ្តើម' },
      'shortcuts': { en: 'Getting Started', km: 'ការចាប់ផ្តើម' },
      'keyboard-layouts': { en: 'Keyboards & Script', km: 'ក្តារចុច និងអក្សរ' },
      'khmer-mechanics': { en: 'Keyboards & Script', km: 'ក្តារចុច និងអក្សរ' },
      'modifier-layers': { en: 'Keyboards & Script', km: 'ក្តារចុច និងអក្សរ' },
      'curriculum': { en: 'Pedagogy & Drills', km: 'គរុកោសល្យ និងលំហាត់' },
      'adaptive-practice': { en: 'Pedagogy & Drills', km: 'គរុកោសល្យ និងលំហាត់' },
      'interactive-modes': { en: 'Pedagogy & Drills', km: 'គរុកោសល្យ និងលំហាត់' },
      'persistence': { en: 'System & Specs', km: 'ប្រព័ន្ធ និងបច្ចេកទេស' },
      'audio-engine': { en: 'System & Specs', km: 'ប្រព័ន្ធ និងបច្ចេកទេស' },
      'tech-reference': { en: 'System & Specs', km: 'ប្រព័ន្ធ និងបច្ចេកទេស' },
      'faq': { en: 'FAQ & Support', km: 'សំណួរញឹកញាប់' }
    };

    // Semantic keyword aliases for rapid discoverability
    const sectionKeywords = {
      'keycap-3d': '3d, threejs, webgl, model, keycap, switch, spring, stem, explode, wireframe, mechanical, cherry, oem, angkor gold, cyber neon, ceramic, ម៉ូឌែល, គ្រាប់ចុច, ស្ព្រីង, មេកានិច',
      'overview': 'overview, philosophy, vision, muscle memory, abugida, mission, ทស្សនវិស័យ, ទិដ្ឋភាពទូទៅ, ចក្ខុវិស័យ',
      'quickstart': 'quick start, guide, beginner, steps, tutorial, getting started, ចាប់ផ្តើម, មគ្គុទ្ទេសក៍, ជំហាន',
      'shortcuts': 'shortcuts, hotkeys, keys, focus mode, language, caps lock, search, space, shift, alt+f, alt+l, esc, គ្រាប់ចុចកាត់, ផ្លូវកាត់',
      'keyboard-layouts': 'layouts, standard, nida, qwerty, english, mondol, home row, fingers, f j bumps, ប្លង់, ក្តារចុច, ស្តង់ដារ, នីដា',
      'khmer-mechanics': 'mechanics, rules, grammar, subscript, coeng, base consonant, ្, spacing, shift space, ជើង, ព្យញ្ជនៈ, ស្រៈ, ក្បួន',
      'modifier-layers': 'layers, modifiers, base, shift, altgr, ctrl, currency, riel, ៛, pikuu, ៖, ស្រទាប់, គ្រាប់ចុច',
      'curriculum': 'curriculum, levels, lessons, exercises, 40 levels, 218 lessons, 664 exercises, track, master unlock, កម្មវិធីសិក្សា, កម្រិត, មេរៀន',
      'adaptive-practice': 'adaptive, keybr, mastery, dynamic, penalty, -3%, speed, wpm, gain, +5%, weak keys, remedial, continuous, បត់បែន, ពិន័យ, ដកពិន្ទុ, ល្បឿន',
      'interactive-modes': 'modes, race, temple trial, bots, pacers, competitive, guided, remedial, drills, ការប្រណាំង, ប្រកួត, ហាត់',
      'persistence': 'persistence, refresh, session, localstorage, state, resume, backup, export, import, រក្សាទុក, ទិន្នន័យ, refresh',
      'audio-engine': 'audio, sound, web audio, synthesizer, click, switch, clack, chime, oscillator, zero files, សំឡេង, ចុច',
      'tech-reference': 'architecture, technical, repository, files, scripts, validate, audit, pwa, offline, រចនាសម្ព័ន្ធ, ឯកសារយោង, កូដ',
      'faq': 'faq, frequently asked questions, dotted circle, ◌, offline, backup, export, help, support, សំណួរ, ស្រៈនិស្ស័យ'
    };

    // Build Search Index
    const searchIndex = [];
    sections.forEach(sec => {
      const id = sec.id;
      const titleEl = sec.querySelector('.section-title .doc-i18n') || sec.querySelector('.section-title');
      const titleEn = titleEl ? (titleEl.dataset?.en || titleEl.textContent.trim()) : id;
      const titleKm = titleEl ? (titleEl.dataset?.km || titleEl.textContent.trim()) : id;

      const chunks = [];
      sec.querySelectorAll('.doc-p, .callout, tr, .feature-box, .spec-list li, pre code').forEach(el => {
        const i18n = el.querySelector('.doc-i18n');
        if (i18n) {
          if (i18n.dataset?.en) chunks.push({ text: i18n.dataset.en, lang: 'en' });
          if (i18n.dataset?.km) chunks.push({ text: i18n.dataset.km, lang: 'km' });
        }
        const text = el.textContent.trim();
        if (text) chunks.push({ text: text, lang: 'both' });
      });

      const cat = sectionCategories[id] || { en: 'Documentation', km: 'ឯកសារ' };
      const keywords = sectionKeywords[id] || '';

      searchIndex.push({
        id: id,
        titleEn: titleEn,
        titleKm: titleKm,
        catEn: cat.en,
        catKm: cat.km,
        keywords: keywords,
        chunks: chunks,
        element: sec
      });
    });

    let selectedIndex = -1;
    let currentMatches = [];

    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightTerms(text, terms) {
      if (!terms || terms.length === 0) return text;
      let res = text;
      terms.forEach(t => {
        if (!t) return;
        const re = new RegExp(`(${escapeRegex(t)})`, 'gi');
        res = res.replace(re, '<mark class="search-highlight">$1</mark>');
      });
      return res;
    }

    function createSnippet(chunks, queryTerms, isKmQuery) {
      let bestChunk = null;
      let bestScore = -1;

      for (const c of chunks) {
        const textLower = c.text.toLowerCase();
        let matches = 0;
        for (const t of queryTerms) {
          if (textLower.includes(t)) matches++;
        }
        if (matches > bestScore) {
          bestScore = matches;
          bestChunk = c.text;
        }
      }

      if (!bestChunk && chunks.length > 0) {
        bestChunk = chunks[0].text;
      }
      if (!bestChunk) return '';

      const cleaned = bestChunk.replace(/\s+/g, ' ').trim();
      const firstTerm = queryTerms[0] || '';
      const idx = cleaned.toLowerCase().indexOf(firstTerm.toLowerCase());

      let excerpt = '';
      if (idx === -1 || cleaned.length <= 130) {
        excerpt = cleaned.slice(0, 130) + (cleaned.length > 130 ? '...' : '');
      } else {
        const start = Math.max(0, idx - 45);
        const end = Math.min(cleaned.length, idx + firstTerm.length + 80);
        const prefix = start > 0 ? '...' : '';
        const suffix = end < cleaned.length ? '...' : '';
        excerpt = prefix + cleaned.slice(start, end).trim() + suffix;
      }

      return highlightTerms(excerpt, queryTerms);
    }

    function jumpToTarget(targetId) {
      const targetSec = document.getElementById(targetId);
      if (!targetSec) return;

      dropdown.hidden = true;
      selectedIndex = -1;
      searchInput.blur();

      // Ensure all sections are displayed
      sections.forEach(s => s.style.display = '');

      // Smooth scroll to section
      targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Pulse glow
      targetSec.classList.remove('search-pulse-glow');
      void targetSec.offsetWidth; // force reflow
      targetSec.classList.add('search-pulse-glow');
      setTimeout(() => targetSec.classList.remove('search-pulse-glow'), 2200);
    }

    function renderResults(rawQuery) {
      dropdown.innerHTML = '';
      currentMatches = [];
      selectedIndex = -1;

      const q = rawQuery.trim().toLowerCase();
      if (!q) {
        dropdown.hidden = true;
        clearBtn.hidden = true;
        return;
      }

      clearBtn.hidden = false;
      const terms = q.split(/\s+/).filter(t => t.length > 0);
      const isKmQuery = /[\u1780-\u17FF]/.test(q);
      const activeLang = localStorage.getItem('pk_doc_lang') || 'en';

      searchIndex.forEach(item => {
        let score = 0;
        const titleToSearch = (item.titleEn + ' ' + item.titleKm + ' ' + item.id).toLowerCase();
        const kwToSearch = item.keywords.toLowerCase();

        terms.forEach(t => {
          if (item.id === t) score += 100;
          if (titleToSearch.includes(t)) score += 60;
          if (kwToSearch.includes(t)) score += 40;
        });

        for (const c of item.chunks) {
          const textLower = c.text.toLowerCase();
          for (const t of terms) {
            if (textLower.includes(t)) {
              score += 15;
            }
          }
        }

        if (score > 0) {
          const displayTitle = (isKmQuery || activeLang === 'km') ? item.titleKm : item.titleEn;
          const displayCat = (isKmQuery || activeLang === 'km') ? item.catKm : item.catEn;
          const snippet = createSnippet(item.chunks, terms, isKmQuery);

          currentMatches.push({
            id: item.id,
            title: displayTitle,
            cat: displayCat,
            score: score,
            snippet: snippet
          });
        }
      });

      currentMatches.sort((a, b) => b.score - a.score);

      if (currentMatches.length === 0) {
        dropdown.hidden = false;
        dropdown.innerHTML = `
          <div class="search-empty-state">
            <div style="font-weight:600; color:#fff;">No documentation results for <strong>"${rawQuery}"</strong></div>
            <div style="margin-top:8px; font-size:0.8rem; color:var(--doc-ink-dim);">
              Suggestions: <code>3d</code>, <code>keycap</code>, <code>coeng</code>, <code>adaptive</code>, <code>shortcuts</code>, <code>race</code>, <code>ប្លង់</code>, <code>ជើង</code>
            </div>
          </div>
        `;
        return;
      }

      dropdown.hidden = false;
      const header = document.createElement('div');
      header.className = 'search-dropdown-header';
      header.innerHTML = `
        <span>${currentMatches.length} ${currentMatches.length === 1 ? 'Result' : 'Results'}</span>
        <span style="font-size:0.68rem; color:var(--doc-ink-dim); font-weight:normal;">&uarr;&darr; navigate · &crarr; jump · Esc close</span>
      `;
      dropdown.appendChild(header);

      const topResults = currentMatches.slice(0, 9);
      topResults.forEach((match, index) => {
        const itemEl = document.createElement('a');
        itemEl.href = '#' + match.id;
        itemEl.className = 'search-result-item';
        itemEl.dataset.index = index;

        const highlightedTitle = highlightTerms(match.title, terms);

        itemEl.innerHTML = `
          <div class="search-result-title">
            <span>${highlightedTitle}</span>
            <span class="search-result-badge">${match.cat}</span>
          </div>
          <div class="search-result-snippet">${match.snippet}</div>
        `;

        itemEl.addEventListener('click', (e) => {
          e.preventDefault();
          jumpToTarget(match.id);
        });

        dropdown.appendChild(itemEl);
      });
    }

    searchInput.addEventListener('input', (e) => {
      renderResults(e.target.value);
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        renderResults(searchInput.value);
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      renderResults('');
      searchInput.focus();
    });

    // Keyboard Navigation within search input
    searchInput.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.search-result-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        selectedIndex = (selectedIndex + 1) % items.length;
        items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && currentMatches[selectedIndex]) {
          jumpToTarget(currentMatches[selectedIndex].id);
        } else if (currentMatches.length > 0) {
          jumpToTarget(currentMatches[0].id);
        }
      } else if (e.key === 'Escape') {
        dropdown.hidden = true;
        searchInput.blur();
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchWrap.contains(e.target)) {
        dropdown.hidden = true;
      }
    });

    // Global Hotkeys: '/' or 'Ctrl+K'
    window.addEventListener('keydown', (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  initSearchEngine();

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
        btn.innerHTML = `<svg class="doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
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
      const lbl = langToggleBtn.querySelector('.lang-label');
      if (lbl) lbl.textContent = lang === 'en' ? 'ខ្មែរ' : 'English';
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
