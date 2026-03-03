// ========================================
// VERSICHERUNGS-1×1 — Knowledge Module
// Interactive insurance knowledge platform
// ========================================

(function() {
  'use strict';

  // Module state
  var moduleData = null;
  var moduleLoaded = false;
  var currentChapter = null;
  var currentSubChapterId = null;
  var currentQuizIndex = 0;
  var quizAnswered = {};
  var currentView = 'overview'; // 'overview' | 'chapter' | 'wissenscheck'

  // Progress tracking — per session only (resets each time the module is opened)
  var sessionVisited = [];

  function markChapterVisited(chapterId) {
    if (sessionVisited.indexOf(chapterId) === -1) {
      sessionVisited.push(chapterId);
    }
    updateProgressUI();
  }

  function updateProgressUI() {
    if (!moduleData) return;
    var total = moduleData.chapters.length;
    var visited = sessionVisited.length;
    var pct = total > 0 ? Math.round((visited / total) * 100) : 0;

    var fill = document.getElementById('v1x1ProgressFill');
    var value = document.getElementById('v1x1ProgressValue');
    if (fill) fill.style.width = pct + '%';
    if (value) value.textContent = pct + '%';

    // Update topnav visited dots
    moduleData.chapters.forEach(function(ch) {
      var item = document.querySelector('.v1x1-topnav-item[data-chapter="' + ch.id + '"]');
      if (item) {
        if (sessionVisited.indexOf(ch.id) !== -1) {
          item.classList.add('visited');
        }
      }
    });
  }

  // ========================================
  // SVG ICONS (Lucide-style, inline)
  // ========================================
  var icons = {
    'bar-chart-3': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    'building-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    'package': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M16.5 9.4l-9-5.19"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    'git-branch': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>',
    'coins': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1110.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/></svg>',
    'arrow-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    'arrow-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    'rotate-ccw': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
    'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    'shield-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    'network': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 011-1h12a1 1 0 011 1v3"/><path d="M12 12V8"/></svg>',
    'banknote': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    'scale': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M8 21h8"/><path d="M12 17V3"/><path d="M2 11l4-7 4 7"/><path d="M14 11l4-7 4 7"/></svg>',
    'settings-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
    'rocket': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    'landmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'lightbulb': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    'heart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'alert-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    'briefcase': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'cpu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'refresh-cw': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    'eye': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'car': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><line x1="10" y1="17" x2="15" y2="17"/></svg>',
    'building': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="4" y="2" width="16" height="20"/><path d="M9 22V12h6v10"/><line x1="8" y1="7" x2="8" y2="7.01"/><line x1="12" y1="7" x2="12" y2="7.01"/><line x1="16" y1="7" x2="16" y2="7.01"/><line x1="8" y1="11" x2="8" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/></svg>',
    'zap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'truck': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    'layers': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'bar-chart-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'pie-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
    'globe': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'layout': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
  };

  function getIcon(name) {
    return icons[name] || '';
  }

  function getCalloutIcon(variant) {
    if (variant === 'warning') return getIcon('alert-triangle');
    if (variant === 'tip') return getIcon('lightbulb');
    return getIcon('info');
  }

  // ========================================
  // TOP NAVIGATION
  // ========================================

  function setActiveNav(target) {
    var items = document.querySelectorAll('.v1x1-topnav-item');
    items.forEach(function(item) {
      item.classList.remove('active');
      if (item.getAttribute('data-target') === target || item.getAttribute('data-chapter') === target) {
        item.classList.add('active');
      }
    });
  }

  function renderTopNav() {
    var container = document.getElementById('v1x1TopNavChapters');
    if (!container || !moduleData) return;

    var html = '';
    moduleData.chapters.forEach(function(ch, i) {
      var num = String(i + 1).padStart(2, '0');
      html += '<button class="v1x1-topnav-item" data-chapter="' + ch.id + '" onclick="V1x1.openChapter(\'' + ch.id + '\')">';
      html += '<span class="v1x1-topnav-icon">' + getIcon(ch.icon) + '</span>';
      html += '<span class="v1x1-topnav-label">' + num + '. ' + ch.title + '</span>';
      html += '<span class="v1x1-topnav-dot"></span>';
      html += '</button>';
    });
    container.innerHTML = html;
  }

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  function renderChapterGrid() {
    var container = document.getElementById('v1x1ChapterGrid');
    if (!container || !moduleData) return;

    var html = '';
    moduleData.chapters.forEach(function(ch, i) {
      var num = String(i + 1).padStart(2, '0');
      html += '<div class="v1x1-chapter-card v1x1-reveal" data-delay="' + Math.min(i, 4) + '" onclick="V1x1.openChapter(\'' + ch.id + '\')">';
      html += '<div class="v1x1-chapter-card-icon">' + getIcon(ch.icon) + '</div>';
      html += '<div class="v1x1-chapter-card-number">Kapitel ' + num + '</div>';
      html += '<div class="v1x1-chapter-card-title">' + ch.title + '</div>';
      html += '<div class="v1x1-chapter-card-subtitle">' + ch.subtitle + '</div>';
      html += '</div>';
    });
    container.innerHTML = html;

    // Trigger reveal animation
    requestAnimationFrame(function() {
      var cards = container.querySelectorAll('.v1x1-reveal');
      cards.forEach(function(card) {
        card.classList.add('visible');
      });
    });
  }

  function renderWelcomeCountUp() {
    var numberEl = document.querySelector('.v1x1-welcome-number');
    if (!numberEl) return;
    var target = parseInt(numberEl.getAttribute('data-target') || '254');
    animateCountUp(numberEl, 0, target, 1200);
  }

  function animateCountUp(el, start, end, duration) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (end - start) * eased);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  // ========================================
  // CHAPTER RENDERING (without quiz)
  // ========================================

  function openChapter(chapterId) {
    if (!moduleData) return;

    var chapter = null;
    var chapterIndex = -1;
    for (var i = 0; i < moduleData.chapters.length; i++) {
      if (moduleData.chapters[i].id === chapterId) {
        chapter = moduleData.chapters[i];
        chapterIndex = i;
        break;
      }
    }
    if (!chapter) return;

    currentChapter = chapter;
    currentView = 'chapter';

    // Reset sub-chapter, auto-select first if chapter has subChapters
    currentSubChapterId = (chapter.subChapters && chapter.subChapters.length > 0)
      ? chapter.subChapters[0].id : null;

    // Mark as visited
    markChapterVisited(chapterId);

    // Update breadcrumb
    renderBreadcrumb(chapter.title);

    // Update top nav active state
    setActiveNav(chapterId);

    // Render chapter content
    var contentInner = document.getElementById('v1x1ContentInner');
    if (!contentInner) return;

    var num = String(chapterIndex + 1).padStart(2, '0');
    var total = moduleData.chapters.length;

    var html = '<div class="v1x1-chapter">';

    // Hero Section
    html += '<div class="v1x1-chapter-hero">';
    html += '<div class="v1x1-chapter-meta">';
    html += '<span class="v1x1-chapter-counter">' + num + ' / ' + String(total).padStart(2, '0') + '</span>';
    html += '<div class="v1x1-chapter-level-indicator">';
    html += '<div class="v1x1-level-dot active-1"></div>';
    html += '<div class="v1x1-level-dot active-2"></div>';
    html += '<div class="v1x1-level-dot"></div>';
    html += '</div>';
    html += '</div>';

    // Hero Stat
    var stat = chapter.heroStat;
    html += '<div class="v1x1-hero-stat">';
    html += '<div class="v1x1-hero-stat-value">';
    html += '<span class="v1x1-hero-stat-number" data-target="' + stat.value + '">0</span>';
    html += '<span class="v1x1-hero-stat-unit">' + escapeHtml(stat.unit) + '</span>';
    html += '</div>';
    if (stat.trend) {
      html += '<span class="v1x1-hero-stat-trend ' + stat.trend.direction + '">';
      html += (stat.trend.direction === 'up' ? '&#8593;' : '&#8595;') + ' ' + escapeHtml(stat.trend.value);
      html += '</span>';
    }
    html += '<p class="v1x1-hero-stat-label">' + escapeHtml(stat.label) + '</p>';
    html += '</div>';

    // Quick Stats
    if (chapter.quickStats && chapter.quickStats.length) {
      html += '<div class="v1x1-quick-stats" id="v1x1QuickStats">';
      chapter.quickStats.forEach(function(qs) {
        html += '<div class="v1x1-quick-stat-card v1x1-reveal">';
        html += '<div><span class="v1x1-quick-stat-value" data-target="' + qs.value + '">0</span>';
        if (qs.unit) html += ' <span class="v1x1-quick-stat-unit">' + escapeHtml(qs.unit) + '</span>';
        html += '</div>';
        html += '<div class="v1x1-quick-stat-label">' + escapeHtml(qs.label) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>'; // /chapter-hero

    if (chapter.subChapters && chapter.subChapters.length > 0) {
      // --- Sub-chapter navigation + content ---
      html += renderSubChapterNav(chapter);
      html += '<div id="v1x1SubContent">';
      html += renderSubChapterContent(chapter.subChapters[0], chapter, chapterIndex);
      html += '</div>';
    } else {
      // --- Legacy: flat level 1/2/3 ---
      html += '<div class="v1x1-level-section"><div class="v1x1-level-1-content">';
      html += renderContentBlocks(chapter.levels.level1);
      html += '</div></div>';

      if (chapter.id === '05-verguetung-provision') html += renderProvisionCalculator();
      if (chapter.id === '02-marktteilnehmer') html += renderMarketShareChart();

      if (chapter.levels.level2 && chapter.levels.level2.length) {
        html += '<div class="v1x1-level-section">';
        html += '<button class="v1x1-level-2-trigger" onclick="V1x1.toggleLevel2(this)">';
        html += '<span class="v1x1-level-badge">Level 2</span><span>Vertiefung aufklappen</span>';
        html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
        html += '</button>';
        html += '<div class="v1x1-level-2-body" id="v1x1Level2Body">';
        html += renderContentBlocks(chapter.levels.level2);
        html += '</div></div>';
      }
      if (chapter.levels.level3 && chapter.levels.level3.length) {
        html += '<div class="v1x1-level-section">';
        html += '<button class="v1x1-level-3-trigger" onclick="V1x1.toggleLevel3(this)">';
        html += '<span class="v1x1-level-badge">Level 3</span><span>Experten-Deep-Dive</span>';
        html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
        html += '</button>';
        html += '<div class="v1x1-level-3-body" id="v1x1Level3Body">';
        html += renderContentBlocks(chapter.levels.level3);
        html += '</div></div>';
      }
    }

    // Chapter Navigation (Prev/Next)
    html += renderChapterNav(chapterIndex);

    html += '</div>'; // /chapter

    contentInner.innerHTML = html;

    // Scroll to top
    var content = document.getElementById('v1x1Content');
    if (content) content.scrollTop = 0;

    // Animate hero stat
    setTimeout(function() {
      var heroNum = contentInner.querySelector('.v1x1-hero-stat-number');
      if (heroNum) {
        var target = parseFloat(heroNum.getAttribute('data-target'));
        animateCountUp(heroNum, 0, target, 1200);
      }
      // Quick stat count-ups
      var qsValues = contentInner.querySelectorAll('.v1x1-quick-stat-value');
      qsValues.forEach(function(el) {
        var t = parseFloat(el.getAttribute('data-target'));
        animateCountUp(el, 0, t, 1000);
      });
    }, 100);

    // Scroll reveal
    initScrollReveal();

    // Init calculator if present
    if (chapter.id === '05-verguetung-provision') {
      initCalculator();
    }

    // Init market bars if present
    if (chapter.id === '02-marktteilnehmer') {
      setTimeout(animateMarketBars, 300);
    }

    // Init Chart.js charts and D3 components
    setTimeout(function() {
      initCharts(chapter);
      initD3Components(chapter);
      initCountUpObservers();
      initGlossaryPopovers();
    }, 200);
  }

  function renderContentBlocks(blocks) {
    if (!blocks || !blocks.length) return '';
    var html = '';
    blocks.forEach(function(block, idx) {
      html += '<div class="v1x1-reveal" data-delay="' + Math.min(idx, 4) + '">';
      if (block.type === 'paragraph') {
        if (block.title) {
          html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
        }
        html += '<p class="v1x1-paragraph">' + block.content + '</p>';
      } else if (block.type === 'table') {
        html += renderTable(block);
      } else if (block.type === 'callout') {
        html += renderCallout(block);
      } else if (block.type === 'infoKachelGrid') {
        html += renderInfoKachelGrid(block);
      } else if (block.type === 'timeline') {
        html += renderTimeline(block);
      } else if (block.type === 'chartLine' || block.type === 'chartBar' || block.type === 'chartDonut') {
        html += renderChartBlock(block, idx);
      } else if (block.type === 'heatmapGrid') {
        html += renderHeatmapGrid(block);
      } else if (block.type === 'regulatoryPyramid') {
        html += renderRegulatoryPyramid(block);
      } else if (block.type === 'valueChain') {
        html += renderValueChain(block);
      } else if (block.type === 'combinedRatioCalc') {
        html += renderCombinedRatioCalc(block);
      } else if (block.type === 'trendRadar') {
        html += renderTrendRadar(block);
      } else if (block.type === 'networkGraph') {
        html += renderNetworkGraph(block);
      } else if (block.type === 'decisionTree') {
        html += renderDecisionTreeBlock(block);
      } else if (block.type === 'comparisonTable') {
        html += renderComparisonTable(block);
      }
      html += '</div>';
    });
    return html;
  }

  function renderTable(block) {
    var headers = block.headers || block.columns || [];
    var html = '<div class="v1x1-table-wrapper">';
    if (block.title || block.caption) {
      html += '<div class="v1x1-table-title">' + escapeHtml(block.title || block.caption) + '</div>';
    }
    html += '<table class="v1x1-table">';
    html += '<thead><tr>';
    headers.forEach(function(h) {
      var cls = block.sortable ? ' class="sortable"' : '';
      html += '<th' + cls + '>' + escapeHtml(h) + '</th>';
    });
    html += '</tr></thead>';
    html += '<tbody>';
    (block.rows || []).forEach(function(row) {
      html += '<tr>';
      row.forEach(function(cell) {
        html += '<td>' + escapeHtml(cell) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function renderCallout(block) {
    var iconName = block.icon || block.variant || 'info';
    var variant = (iconName === 'alert-circle' || iconName === 'warning') ? 'warning'
                : (iconName === 'lightbulb' || iconName === 'tip') ? 'tip'
                : 'info';
    var iconHtml = icons[iconName] ? icons[iconName] : getCalloutIcon(variant);
    var html = '<div class="v1x1-callout ' + variant + '">';
    html += '<span class="v1x1-callout-icon">' + iconHtml + '</span>';
    html += '<div>' + (block.text || block.content || '') + '</div>';
    html += '</div>';
    return html;
  }

  function renderSourceHtml(source, url) {
    if (!source) return '';
    var escaped = escapeHtml(source);
    if (!url) return escaped;
    return '<span class="v1x1-cite">' +
      '<span class="v1x1-source-label">' + escaped + '</span>' +
      '<span class="v1x1-cite-tooltip">' +
        '<strong>' + escaped + '</strong><br>' +
        '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="v1x1-source-tooltip-link">→ Zur Quelle öffnen</a>' +
      '</span>' +
    '</span>';
  }

  // ========================================
  // PROVISION CALCULATOR
  // ========================================

  function renderProvisionCalculator() {
    var html = '<div class="v1x1-calculator v1x1-reveal">';
    html += '<div class="v1x1-calculator-title">Provisionsrechner</div>';
    html += '<div class="v1x1-calc-inputs">';

    html += '<div class="v1x1-calc-field">';
    html += '<label>Sparte</label>';
    html += '<select id="v1x1CalcSparte" onchange="V1x1.updateCalc()">';
    html += '<option value="leben">Leben</option>';
    html += '<option value="pkv">PKV</option>';
    html += '<option value="sach">Komposit/Sach</option>';
    html += '</select></div>';

    html += '<div class="v1x1-calc-field">';
    html += '<label>Monatsbeitrag (€)</label>';
    html += '<input type="number" id="v1x1CalcBeitrag" value="150" min="10" max="5000" onchange="V1x1.updateCalc()" oninput="V1x1.updateCalc()">';
    html += '</div>';

    html += '<div class="v1x1-calc-field">';
    html += '<label>Laufzeit (Jahre)</label>';
    html += '<input type="number" id="v1x1CalcLaufzeit" value="35" min="1" max="50" onchange="V1x1.updateCalc()" oninput="V1x1.updateCalc()">';
    html += '</div>';

    html += '<div class="v1x1-calc-field">';
    html += '<label>Provisionssatz (‰)</label>';
    html += '<div class="v1x1-calc-slider-row">';
    html += '<input type="range" class="v1x1-calc-slider" id="v1x1CalcSatz" min="10" max="60" value="40" oninput="V1x1.updateCalc()">';
    html += '<span class="v1x1-calc-slider-value" id="v1x1CalcSatzValue">40‰</span>';
    html += '</div></div>';

    html += '</div>'; // /calc-inputs
    html += '<div class="v1x1-calc-divider"></div>';

    html += '<div class="v1x1-calc-results" id="v1x1CalcResults">';
    html += '<div class="v1x1-calc-result-row"><span class="v1x1-calc-result-label">BWS</span><span class="v1x1-calc-result-value" id="v1x1CalcBWS">€63.000</span></div>';
    html += '<div class="v1x1-calc-result-row highlight"><span class="v1x1-calc-result-label">Abschlussprovision</span><span class="v1x1-calc-result-value" id="v1x1CalcAbschluss">€2.520</span></div>';
    html += '<div class="v1x1-calc-result-row"><span class="v1x1-calc-result-label">Bestandsprovision/J.</span><span class="v1x1-calc-result-value" id="v1x1CalcBestand">€36</span></div>';
    html += '<div class="v1x1-calc-result-row"><span class="v1x1-calc-result-label">Storno-Einbehalt (15%)</span><span class="v1x1-calc-result-value" id="v1x1CalcStorno">€378</span></div>';
    html += '<div class="v1x1-calc-result-row"><span class="v1x1-calc-result-label">Netto-Auszahlung</span><span class="v1x1-calc-result-value" id="v1x1CalcNetto">€2.142</span></div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function initCalculator() {
    updateCalc();
  }

  function updateCalc() {
    var sparte = document.getElementById('v1x1CalcSparte');
    var beitrag = document.getElementById('v1x1CalcBeitrag');
    var laufzeit = document.getElementById('v1x1CalcLaufzeit');
    var satz = document.getElementById('v1x1CalcSatz');
    var satzValue = document.getElementById('v1x1CalcSatzValue');

    if (!sparte || !beitrag || !laufzeit || !satz) return;

    var s = sparte.value;
    var mb = parseFloat(beitrag.value) || 150;
    var lz = parseInt(laufzeit.value) || 35;
    var promille = parseInt(satz.value) || 40;

    if (satzValue) satzValue.textContent = promille + '‰';

    var bws, abschluss, bestand, stornoRate, storno, netto;

    if (s === 'leben') {
      bws = mb * 12 * lz;
      abschluss = bws * promille / 1000;
      bestand = mb * 12 * 0.02;
      stornoRate = 0.15;
    } else if (s === 'pkv') {
      bws = mb * 7; // 7 Monatsbeiträge standard
      abschluss = bws;
      bestand = mb * 12 * 0.02;
      stornoRate = 0.10;
    } else { // sach
      bws = mb * 12;
      abschluss = bws * 0.05;
      bestand = mb * 12 * 0.20;
      stornoRate = 0;
    }

    storno = abschluss * stornoRate;
    netto = abschluss - storno;

    setCalcValue('v1x1CalcBWS', formatEuro(bws));
    setCalcValue('v1x1CalcAbschluss', formatEuro(abschluss));
    setCalcValue('v1x1CalcBestand', formatEuro(bestand));
    setCalcValue('v1x1CalcStorno', formatEuro(storno));
    setCalcValue('v1x1CalcNetto', formatEuro(netto));
  }

  function setCalcValue(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatEuro(val) {
    return '€' + Math.round(val).toLocaleString('de-DE');
  }

  // ========================================
  // MARKET SHARE CHART
  // ========================================

  function renderMarketShareChart() {
    var data = [
      { label: 'Allianz', value: 17.4 },
      { label: 'R+V', value: 8.0 },
      { label: 'ERGO', value: 7.2 },
      { label: 'HUK-Coburg', value: 7.2 },
      { label: 'Debeka', value: 6.1 },
      { label: 'Talanx/HDI', value: 5.8 },
      { label: 'Generali', value: 5.5 },
      { label: 'BarmeniaGothaer', value: 3.5 }
    ];
    var maxVal = data[0].value;

    var html = '<div class="v1x1-market-chart v1x1-reveal">';
    html += '<div class="v1x1-market-chart-title">Marktanteile der Top-Versicherer (Gesamtmarkt)</div>';
    data.forEach(function(d) {
      var pct = (d.value / maxVal * 100).toFixed(0);
      html += '<div class="v1x1-market-bar-row">';
      html += '<span class="v1x1-market-bar-label">' + escapeHtml(d.label) + '</span>';
      html += '<div class="v1x1-market-bar-track">';
      html += '<div class="v1x1-market-bar-fill" data-width="' + pct + '" style="width:0%">';
      html += '<span class="v1x1-market-bar-value">' + d.value.toFixed(1) + '%</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function animateMarketBars() {
    var bars = document.querySelectorAll('.v1x1-market-bar-fill[data-width]');
    bars.forEach(function(bar, i) {
      setTimeout(function() {
        bar.style.width = bar.getAttribute('data-width') + '%';
      }, i * 100);
    });
  }

  // ========================================
  // WISSENSCHECK (separate tab)
  // ========================================

  var wissencheckChapterIndex = 0;
  var wissencheckMode = 'all'; // 'all' | 'quick'
  var wissencheckModuleFilter = 'all'; // 'all' | chapter index (number)
  var wissencheckActiveQuestions = [];
  var wissencheckCorrectByChapter = {};

  function openWissencheck() {
    if (!moduleData) return;
    currentView = 'wissenscheck';
    currentChapter = null;
    currentQuizIndex = 0;
    quizAnswered = {};
    wissencheckChapterIndex = 0;
    wissencheckMode = 'all';
    wissencheckModuleFilter = 'all';
    wissencheckActiveQuestions = [];
    wissencheckCorrectByChapter = {};

    setActiveNav('wissenscheck');
    renderBreadcrumb('Wissenscheck');

    var contentInner = document.getElementById('v1x1ContentInner');
    if (!contentInner) return;

    renderWissencheckView(contentInner);

    var content = document.getElementById('v1x1Content');
    if (content) content.scrollTop = 0;
  }

  function renderWissencheckView(container) {
    var html = '<div class="v1x1-wissenscheck">';

    html += '<div class="v1x1-wissenscheck-header">';
    html += '<h2 class="v1x1-wissenscheck-title">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    html += ' Wissenscheck';
    html += '</h2>';
    html += '<p class="v1x1-wissenscheck-subtitle">Teste dein Wissen zu allen Kapiteln des Versicherungs-1×1</p>';
    html += '</div>';

    // Filter bar: module + mode + start
    html += '<div class="v1x1-wk-filters">';

    // Module filter dropdown
    html += '<div class="v1x1-wk-filter-group">';
    html += '<label class="v1x1-wk-filter-label">Modul</label>';
    html += '<select class="v1x1-wk-select" id="v1x1WkModuleSelect" onchange="V1x1.setWkModuleFilter(this.value)">';
    html += '<option value="all"' + (wissencheckModuleFilter === 'all' ? ' selected' : '') + '>Alle Module</option>';
    moduleData.chapters.forEach(function(ch, i) {
      if (ch.quiz && ch.quiz.length > 0) {
        html += '<option value="' + i + '"' + (wissencheckModuleFilter === i ? ' selected' : '') + '>';
        html += String(i + 1).padStart(2, '0') + '. ' + escapeHtml(ch.title);
        html += '</option>';
      }
    });
    html += '</select>';
    html += '</div>';

    // Mode toggle
    html += '<div class="v1x1-wk-filter-group">';
    html += '<label class="v1x1-wk-filter-label">Modus</label>';
    html += '<div class="v1x1-wk-mode-toggle">';
    html += '<button class="v1x1-wk-mode-btn' + (wissencheckMode === 'all' ? ' active' : '') + '" onclick="V1x1.setWkMode(\'all\')">Alle Fragen</button>';
    html += '<button class="v1x1-wk-mode-btn' + (wissencheckMode === 'quick' ? ' active' : '') + '" onclick="V1x1.setWkMode(\'quick\')">Quick-Check (10)</button>';
    html += '</div>';
    html += '</div>';

    // Question count badge
    var previewCount = getWkQuestions().length;
    html += '<div class="v1x1-wk-filter-group">';
    html += '<span class="v1x1-wk-count-badge">' + previewCount + ' Fragen</span>';
    html += '</div>';

    // Start button
    html += '<div class="v1x1-wk-filter-group">';
    html += '<button class="v1x1-wk-start-btn" onclick="V1x1.startWissenscheck()">';
    html += getIcon('check') + ' Quiz starten';
    html += '</button>';
    html += '</div>';

    html += '</div>'; // .v1x1-wk-filters

    // Chapter selector cards
    html += '<div class="v1x1-wissenscheck-chapters">';
    moduleData.chapters.forEach(function(ch, i) {
      var hasQuiz = ch.quiz && ch.quiz.length > 0;
      var cls = 'v1x1-wissenscheck-card' + (hasQuiz ? '' : ' disabled') + (wissencheckModuleFilter === i ? ' active' : '');
      html += '<button class="' + cls + '" ';
      if (hasQuiz) html += 'onclick="V1x1.setWkModuleFilter(' + i + ')" ';
      html += '>';
      html += '<span class="v1x1-wissenscheck-card-icon">' + getIcon(ch.icon) + '</span>';
      html += '<span class="v1x1-wissenscheck-card-label">' + String(i + 1).padStart(2, '0') + '. ' + escapeHtml(ch.title) + '</span>';
      html += '<span class="v1x1-wissenscheck-card-count">' + (hasQuiz ? ch.quiz.length + ' Fragen' : 'Keine Fragen') + '</span>';
      html += '</button>';
    });
    html += '</div>';

    // Quiz render area
    html += '<div class="v1x1-wissenscheck-quiz" id="v1x1WissencheckQuiz"></div>';

    html += '</div>';
    container.innerHTML = html;
  }

  function getWkQuestions() {
    if (!moduleData) return [];
    var questions = [];
    if (wissencheckModuleFilter === 'all') {
      moduleData.chapters.forEach(function(ch) {
        if (ch.quiz && ch.quiz.length > 0) {
          ch.quiz.forEach(function(q) {
            questions.push({ question: q.question, options: q.options, correct: q.correct, explanation: q.explanation, chapterId: ch.id, chapterTitle: ch.title });
          });
        }
      });
    } else {
      var ch = moduleData.chapters[wissencheckModuleFilter];
      if (ch && ch.quiz) {
        ch.quiz.forEach(function(q) {
          questions.push({ question: q.question, options: q.options, correct: q.correct, explanation: q.explanation, chapterId: ch.id, chapterTitle: ch.title });
        });
      }
    }
    if (wissencheckMode === 'quick') {
      questions = shuffleArray(questions).slice(0, 10);
    }
    return questions;
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function setWkModuleFilter(value) {
    wissencheckModuleFilter = (value === 'all') ? 'all' : parseInt(value, 10);
    wissencheckActiveQuestions = [];
    currentQuizIndex = 0;
    quizAnswered = {};
    var contentInner = document.getElementById('v1x1ContentInner');
    if (contentInner) renderWissencheckView(contentInner);
  }

  function setWkMode(mode) {
    wissencheckMode = mode;
    wissencheckActiveQuestions = [];
    currentQuizIndex = 0;
    quizAnswered = {};
    var contentInner = document.getElementById('v1x1ContentInner');
    if (contentInner) renderWissencheckView(contentInner);
  }

  function startWissenscheck() {
    wissencheckActiveQuestions = getWkQuestions();
    currentQuizIndex = 0;
    quizAnswered = {};
    wissencheckCorrectByChapter = {};
    var quizContainer = document.getElementById('v1x1WissencheckQuiz');
    if (!quizContainer) return;
    quizContainer.innerHTML = renderWkQuestion(wissencheckActiveQuestions, 0);
    quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectWissencheckChapter(index) {
    setWkModuleFilter(index);
  }

  function renderWkQuestion(questions, index) {
    if (!questions || !questions.length) {
      return '<p style="color:#9CA3AF;padding:24px;">Keine Fragen verfügbar.</p>';
    }
    if (index >= questions.length) {
      return renderWkEndScreen(questions);
    }

    var q = questions[index];
    var total = questions.length;
    var progress = Math.round((index / total) * 100);

    var html = '<div class="v1x1-wk-question-card">';

    html += '<div class="v1x1-wk-progress-header">';
    html += '<span class="v1x1-wk-q-counter">Frage ' + (index + 1) + ' / ' + total + '</span>';
    if (q.chapterTitle) {
      html += '<span class="v1x1-wk-q-chapter">' + escapeHtml(q.chapterTitle) + '</span>';
    }
    html += '</div>';
    html += '<div class="v1x1-wk-progressbar"><div class="v1x1-wk-progressfill" style="width:' + progress + '%"></div></div>';

    html += '<p class="v1x1-quiz-question">' + escapeHtml(q.question) + '</p>';
    html += '<div class="v1x1-quiz-options" id="v1x1QuizOptions">';
    q.options.forEach(function(opt, oi) {
      html += '<div class="v1x1-quiz-option" data-index="' + oi + '" onclick="V1x1.answerQuiz(' + oi + ',' + q.correct + ')">';
      html += '<span class="v1x1-quiz-radio"></span>';
      html += '<span>' + escapeHtml(opt) + '</span>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div id="v1x1QuizFeedback"></div>';

    html += '</div>';
    return html;
  }

  function renderWkEndScreen(questions) {
    var correct = 0;
    var chapterScores = {};
    questions.forEach(function(q, i) {
      var isCorrect = !!quizAnswered[i];
      if (isCorrect) correct++;
      var cid = q.chapterId || 'unknown';
      if (!chapterScores[cid]) chapterScores[cid] = { title: q.chapterTitle || cid, correct: 0, total: 0 };
      chapterScores[cid].total++;
      if (isCorrect) chapterScores[cid].correct++;
    });

    var pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    var grade = pct >= 80 ? 'Ausgezeichnet!' : pct >= 60 ? 'Gut gemacht!' : pct >= 40 ? 'Ausbaufähig' : 'Weitermachen!';
    var gradeColor = pct >= 80 ? '#059669' : pct >= 60 ? '#2563EB' : pct >= 40 ? '#D97706' : '#DC2626';

    var html = '<div class="v1x1-wk-endscreen">';

    html += '<div class="v1x1-wk-score-hero">';
    html += '<div class="v1x1-wk-score-circle" style="border-color:' + gradeColor + ';color:' + gradeColor + '">';
    html += '<span class="v1x1-wk-score-pct">' + pct + '%</span>';
    html += '<span class="v1x1-wk-score-label">' + correct + ' / ' + questions.length + '</span>';
    html += '</div>';
    html += '<h3 class="v1x1-wk-grade" style="color:' + gradeColor + '">' + grade + '</h3>';
    html += '</div>';

    var chapterIds = Object.keys(chapterScores);
    if (chapterIds.length > 1) {
      html += '<div class="v1x1-wk-breakdown">';
      html += '<h4 class="v1x1-wk-breakdown-title">Ergebnisse nach Modul</h4>';
      chapterIds.forEach(function(cid) {
        var cs = chapterScores[cid];
        var cPct = Math.round((cs.correct / cs.total) * 100);
        var barColor = cPct >= 80 ? '#059669' : cPct >= 60 ? '#2563EB' : cPct >= 40 ? '#D97706' : '#DC2626';
        html += '<div class="v1x1-wk-breakdown-row">';
        html += '<span class="v1x1-wk-breakdown-chapter">' + escapeHtml(cs.title) + '</span>';
        html += '<div class="v1x1-wk-breakdown-bar-wrap">';
        html += '<div class="v1x1-wk-breakdown-bar" style="width:' + cPct + '%;background:' + barColor + '"></div>';
        html += '</div>';
        html += '<span class="v1x1-wk-breakdown-score">' + cs.correct + '/' + cs.total + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '<div class="v1x1-wk-end-actions">';
    html += '<button class="v1x1-wk-start-btn" onclick="V1x1.restartQuiz()">' + getIcon('rotate-ccw') + ' Nochmals</button>';
    html += '<button class="v1x1-wk-start-btn v1x1-wk-btn-outline" onclick="V1x1.openWissencheck()">' + getIcon('chevron-left') + ' Zurück zur Übersicht</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ========================================
  // QUIZ RENDERING
  // ========================================

  function renderQuiz(questions, index) {
    // Delegate to unified renderer
    return renderWkQuestion(questions, index);
  }

  function answerQuiz(selected, correct) {
    var options = document.querySelectorAll('#v1x1QuizOptions .v1x1-quiz-option');
    if (!options.length) return;
    if (options[0].classList.contains('disabled')) return;

    var isCorrect = selected === correct;
    quizAnswered[currentQuizIndex] = isCorrect;

    options.forEach(function(opt, i) {
      opt.classList.add('disabled');
      if (i === correct) {
        opt.classList.add('correct');
        opt.querySelector('.v1x1-quiz-radio').innerHTML = getIcon('check');
      }
      if (i === selected && !isCorrect) {
        opt.classList.add('incorrect');
      }
    });

    var feedback = document.getElementById('v1x1QuizFeedback');
    var questions = wissencheckActiveQuestions.length > 0
      ? wissencheckActiveQuestions
      : (moduleData.chapters[wissencheckChapterIndex] ? moduleData.chapters[wissencheckChapterIndex].quiz : []);
    if (feedback && questions && questions[currentQuizIndex]) {
      var q = questions[currentQuizIndex];
      var html = '<div class="v1x1-quiz-explanation">' + escapeHtml(q.explanation || '') + '</div>';
      if (currentQuizIndex < questions.length - 1) {
        html += '<button class="v1x1-quiz-next-btn" onclick="V1x1.nextQuizQuestion()">Nächste Frage ' + getIcon('chevron-right') + '</button>';
      } else {
        html += '<button class="v1x1-quiz-next-btn" onclick="V1x1.nextQuizQuestion()">Ergebnis anzeigen ' + getIcon('chevron-right') + '</button>';
      }
      feedback.innerHTML = html;
    }
  }

  function nextQuizQuestion() {
    currentQuizIndex++;
    var quizContainer = document.getElementById('v1x1WissencheckQuiz');
    var questions = wissencheckActiveQuestions.length > 0
      ? wissencheckActiveQuestions
      : (moduleData.chapters[wissencheckChapterIndex] ? moduleData.chapters[wissencheckChapterIndex].quiz : []);
    if (quizContainer && questions) {
      quizContainer.innerHTML = renderWkQuestion(questions, currentQuizIndex);
    }
  }

  function restartQuiz() {
    currentQuizIndex = 0;
    quizAnswered = {};
    var quizContainer = document.getElementById('v1x1WissencheckQuiz');
    var questions = wissencheckActiveQuestions.length > 0
      ? wissencheckActiveQuestions
      : (moduleData.chapters[wissencheckChapterIndex] ? moduleData.chapters[wissencheckChapterIndex].quiz : []);
    if (quizContainer && questions) {
      quizContainer.innerHTML = renderWkQuestion(questions, 0);
    }
  }

  // ========================================
  // SUB-CHAPTER NAVIGATION
  // ========================================

  function renderSubChapterNav(chapter) {
    var html = '<nav class="v1x1-subtabs" id="v1x1SubTabs">';
    chapter.subChapters.forEach(function(sub) {
      var isActive = sub.id === currentSubChapterId;
      html += '<button class="v1x1-subtab' + (isActive ? ' active' : '') + '"';
      html += ' data-subid="' + sub.id + '"';
      html += ' onclick="V1x1.openSubChapter(\'' + chapter.id + '\',\'' + sub.id + '\')">';
      if (sub.icon) html += '<span class="v1x1-subtab-icon">' + getIcon(sub.icon) + '</span>';
      html += '<span>' + escapeHtml(sub.title) + '</span>';
      html += '</button>';
    });
    html += '</nav>';
    return html;
  }

  function openSubChapter(chapterId, subId) {
    if (!moduleData) return;
    var chapter = null, chapterIndex = -1;
    for (var i = 0; i < moduleData.chapters.length; i++) {
      if (moduleData.chapters[i].id === chapterId) { chapter = moduleData.chapters[i]; chapterIndex = i; break; }
    }
    if (!chapter || !chapter.subChapters) return;

    var sub = null;
    for (var j = 0; j < chapter.subChapters.length; j++) {
      if (chapter.subChapters[j].id === subId) { sub = chapter.subChapters[j]; break; }
    }
    if (!sub) return;

    currentSubChapterId = subId;

    // Update quickStats if sub-chapter has its own
    var statsArea = document.getElementById('v1x1QuickStats');
    if (statsArea) {
      var statsData = sub.quickStats || chapter.quickStats;
      if (statsData && statsData.length) {
        var statsHtml = '';
        statsData.forEach(function(qs) {
          statsHtml += '<div class="v1x1-quick-stat-card">';
          statsHtml += '<div><span class="v1x1-quick-stat-value" data-target="' + qs.value + '">' + qs.value + '</span>';
          if (qs.unit) statsHtml += ' <span class="v1x1-quick-stat-unit">' + escapeHtml(qs.unit) + '</span>';
          statsHtml += '</div>';
          statsHtml += '<div class="v1x1-quick-stat-label">' + escapeHtml(qs.label) + '</div>';
          statsHtml += '</div>';
        });
        statsArea.innerHTML = statsHtml;
        // Re-run count-up for new values
        var newVals = statsArea.querySelectorAll('.v1x1-quick-stat-value');
        newVals.forEach(function(el) {
          var t = parseFloat(el.getAttribute('data-target'));
          animateCountUp(el, 0, t, 800);
        });
      }
    }

    // Update tab active states
    var tabs = document.querySelectorAll('.v1x1-subtab');
    for (var k = 0; k < tabs.length; k++) {
      tabs[k].classList.toggle('active', tabs[k].getAttribute('data-subid') === subId);
    }
    // Scroll active tab into view
    var activeTab = document.querySelector('.v1x1-subtab.active');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

    var contentArea = document.getElementById('v1x1SubContent');
    if (contentArea) {
      contentArea.innerHTML = renderSubChapterContent(sub, chapter, chapterIndex);
      var content = document.getElementById('v1x1Content');
      if (content) {
        var subNav = document.getElementById('v1x1SubTabs');
        if (subNav) content.scrollTop = subNav.offsetTop - 60;
      }
      setTimeout(function() {
        initCharts(sub);
        initD3Components(sub);
        initCountUpObservers();
        initGlossaryPopovers();
        initScrollReveal();
      }, 150);
    }
  }

  function renderSubChapterContent(sub, chapter, chapterIndex) {
    var html = '';

    // Sub header
    html += '<div class="v1x1-sub-header">';
    if (sub.icon) html += '<span class="v1x1-sub-header-icon">' + getIcon(sub.icon) + '</span>';
    html += '<div>';
    html += '<h3 class="v1x1-sub-title">' + escapeHtml(sub.title) + '</h3>';
    if (sub.subtitle) html += '<p class="v1x1-sub-subtitle">' + escapeHtml(sub.subtitle) + '</p>';
    html += '</div>';
    html += '</div>';

    // Level 1 — immer sichtbar
    if (sub.level1 && sub.level1.length) {
      html += '<div class="v1x1-level-section"><div class="v1x1-level-1-content">';
      html += renderContentBlocks(sub.level1);
      html += '</div></div>';
    }

    // Level 2 — Vertiefung Accordion
    if (sub.level2 && sub.level2.length) {
      html += '<div class="v1x1-level-section">';
      html += '<button class="v1x1-level-2-trigger" onclick="V1x1.toggleLevel2(this)">';
      html += '<span class="v1x1-level-badge">Level 2</span>';
      html += '<span>Vertiefung aufklappen</span>';
      html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
      html += '</button>';
      html += '<div class="v1x1-level-2-body" id="v1x1Level2Body">';
      html += renderContentBlocks(sub.level2);
      html += '</div></div>';
    }

    // Level 3 — Experten-Deep-Dive Accordion
    if (sub.level3 && sub.level3.length) {
      html += '<div class="v1x1-level-section">';
      html += '<button class="v1x1-level-3-trigger" onclick="V1x1.toggleLevel3(this)">';
      html += '<span class="v1x1-level-badge">Level 3</span>';
      html += '<span>Experten-Deep-Dive</span>';
      html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
      html += '</button>';
      html += '<div class="v1x1-level-3-body" id="v1x1Level3Body">';
      html += renderContentBlocks(sub.level3);
      html += '</div></div>';
    }

    return html;
  }

  // ========================================
  // CHAPTER NAVIGATION
  // ========================================

  function renderChapterNav(currentIndex) {
    if (!moduleData) return '';
    var chapters = moduleData.chapters;
    var html = '<div class="v1x1-chapter-nav">';

    if (currentIndex > 0) {
      var prev = chapters[currentIndex - 1];
      html += '<button class="v1x1-chapter-nav-btn" onclick="V1x1.openChapter(\'' + prev.id + '\')">';
      html += '<span class="v1x1-nav-arrow-left">' + getIcon('chevron-left') + '</span>';
      html += '<span>' + escapeHtml(prev.title) + '</span>';
      html += '</button>';
    } else {
      html += '<div></div>';
    }

    if (currentIndex < chapters.length - 1) {
      var next = chapters[currentIndex + 1];
      html += '<button class="v1x1-chapter-nav-btn" onclick="V1x1.openChapter(\'' + next.id + '\')">';
      html += '<span>' + escapeHtml(next.title) + '</span>';
      html += '<span class="v1x1-nav-arrow-right">' + getIcon('chevron-right') + '</span>';
      html += '</button>';
    } else {
      html += '<div></div>';
    }

    html += '</div>';
    return html;
  }

  // ========================================
  // LEVEL TOGGLES
  // ========================================

  function toggleLevel2(trigger) {
    var body = document.getElementById('v1x1Level2Body');
    if (!body) return;
    trigger.classList.toggle('open');
    body.classList.toggle('open');
    if (body.classList.contains('open')) {
      initScrollReveal();
      var dots = document.querySelectorAll('.v1x1-level-dot');
      if (dots.length >= 2) dots[1].classList.add('active-2');
    }
  }

  function toggleLevel3(trigger) {
    var body = document.getElementById('v1x1Level3Body');
    if (!body) return;
    trigger.classList.toggle('open');
    body.classList.toggle('open');
    if (body.classList.contains('open')) {
      initScrollReveal();
      var dots = document.querySelectorAll('.v1x1-level-dot');
      if (dots.length >= 3) dots[2].classList.add('active-3');
    }
  }

  // ========================================
  // GLOSSARY
  // ========================================

  var glossaryLetterFilter = '';
  var glossaryTagFilter = 'all';

  function showGlossary() {
    var overlay = document.getElementById('v1x1GlossaryOverlay');
    if (overlay) overlay.style.display = 'flex';
    glossaryLetterFilter = '';
    glossaryTagFilter = 'all';
    renderGlossaryAlpha();
    renderGlossaryTabs();
    renderGlossaryList();
  }

  function closeGlossary() {
    var overlay = document.getElementById('v1x1GlossaryOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function renderGlossaryAlpha() {
    var container = document.getElementById('v1x1GlossaryAlpha');
    if (!container || !moduleData) return;
    var terms = moduleData.glossary || [];
    var usedLetters = {};
    terms.forEach(function(t) {
      var l = t.term.charAt(0).toUpperCase();
      usedLetters[l] = true;
    });
    var html = '<button class="v1x1-alpha-btn' + (!glossaryLetterFilter ? ' active' : '') + '" onclick="V1x1.filterGlossaryLetter(\'\')">Alle</button>';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(l) {
      var has = !!usedLetters[l];
      html += '<button class="v1x1-alpha-btn' + (glossaryLetterFilter === l ? ' active' : '') + (has ? '' : ' disabled') + '"';
      if (has) html += ' onclick="V1x1.filterGlossaryLetter(\'' + l + '\')"';
      html += '>' + l + '</button>';
    });
    container.innerHTML = html;
  }

  function renderGlossaryTabs() {
    var container = document.getElementById('v1x1GlossaryTabs');
    if (!container || !moduleData) return;
    var terms = moduleData.glossary || [];
    var foundTags = {};
    terms.forEach(function(t) {
      if (t.tags) t.tags.forEach(function(tag) { foundTags[tag] = true; });
    });
    var tagOrder = ['all', 'Markt', 'Produkte', 'Vertrieb', 'Regulatorik', 'Finanzen', 'Technik'];
    var html = '';
    tagOrder.forEach(function(tag) {
      if (tag === 'all' || foundTags[tag]) {
        html += '<button class="v1x1-glossary-tab' + (glossaryTagFilter === tag ? ' active' : '') + '" onclick="V1x1.filterGlossaryTag(\'' + tag + '\')">' + (tag === 'all' ? 'Alle' : escapeHtml(tag)) + '</button>';
        delete foundTags[tag];
      }
    });
    Object.keys(foundTags).sort().forEach(function(tag) {
      html += '<button class="v1x1-glossary-tab' + (glossaryTagFilter === tag ? ' active' : '') + '" onclick="V1x1.filterGlossaryTag(\'' + tag + '\')">' + escapeHtml(tag) + '</button>';
    });
    container.innerHTML = html;
  }

  function filterGlossaryLetter(letter) {
    glossaryLetterFilter = letter;
    renderGlossaryAlpha();
    renderGlossaryList();
  }

  function filterGlossaryTag(tag) {
    glossaryTagFilter = tag;
    renderGlossaryTabs();
    renderGlossaryList();
  }

  function renderGlossaryList(textFilter) {
    var container = document.getElementById('v1x1GlossaryList');
    if (!container || !moduleData) return;

    var terms = (moduleData.glossary || []).slice();

    if (glossaryLetterFilter) {
      var lf = glossaryLetterFilter;
      terms = terms.filter(function(t) { return t.term.charAt(0).toUpperCase() === lf; });
    }

    if (glossaryTagFilter && glossaryTagFilter !== 'all') {
      var tf = glossaryTagFilter;
      terms = terms.filter(function(t) { return t.tags && t.tags.indexOf(tf) !== -1; });
    }

    if (textFilter) {
      var f = textFilter.toLowerCase();
      terms = terms.filter(function(t) {
        return t.term.toLowerCase().indexOf(f) !== -1 || t.definition.toLowerCase().indexOf(f) !== -1;
      });
    }

    terms.sort(function(a, b) { return a.term.localeCompare(b.term); });

    var html = '';
    terms.forEach(function(t) {
      html += '<div class="v1x1-glossary-entry">';
      html += '<div class="v1x1-glossary-term">' + escapeHtml(t.term) + '</div>';
      html += '<div class="v1x1-glossary-definition">' + escapeHtml(t.definition) + '</div>';
      if (t.tags && t.tags.length) {
        html += '<div class="v1x1-glossary-tags">';
        t.tags.forEach(function(tag) {
          html += '<span class="v1x1-glossary-tag" onclick="V1x1.filterGlossaryTag(\'' + escapeHtml(tag) + '\')">' + escapeHtml(tag) + '</span>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    container.innerHTML = html || '<p style="color:#9CA3AF;font-size:14px;">Keine Treffer.</p>';
  }

  // ========================================
  // SEARCH
  // ========================================

  function initSearch() {
    var input = document.getElementById('v1x1SearchInput');
    var results = document.getElementById('v1x1SearchResults');
    if (!input || !results) return;

    input.addEventListener('input', function() {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        results.style.display = 'none';
        return;
      }

      var matches = [];
      // Search chapters
      if (moduleData && moduleData.chapters) {
        moduleData.chapters.forEach(function(ch) {
          var allText = JSON.stringify(ch.levels).toLowerCase();
          if (allText.indexOf(q) !== -1 || ch.title.toLowerCase().indexOf(q) !== -1) {
            matches.push({ title: ch.title, chapter: ch.id, type: 'chapter' });
          }
        });
      }
      // Search glossary
      if (moduleData && moduleData.glossary) {
        moduleData.glossary.forEach(function(g) {
          if (g.term.toLowerCase().indexOf(q) !== -1 || g.definition.toLowerCase().indexOf(q) !== -1) {
            matches.push({ title: g.term, chapter: 'glossary', type: 'glossary', definition: g.definition });
          }
        });
      }

      if (matches.length === 0) {
        results.innerHTML = '<div class="v1x1-search-result-item" style="cursor:default;color:#9CA3AF;">Keine Treffer</div>';
      } else {
        var html = '';
        matches.slice(0, 8).forEach(function(m) {
          if (m.type === 'chapter') {
            html += '<button class="v1x1-search-result-item" onclick="V1x1.openChapter(\'' + m.chapter + '\');document.getElementById(\'v1x1SearchResults\').style.display=\'none\';document.getElementById(\'v1x1SearchInput\').value=\'\';">';
            html += '<div>' + escapeHtml(m.title) + '</div>';
            html += '<div class="v1x1-search-result-chapter">Kapitel</div>';
            html += '</button>';
          } else {
            html += '<button class="v1x1-search-result-item" onclick="V1x1.showGlossary();document.getElementById(\'v1x1SearchResults\').style.display=\'none\';document.getElementById(\'v1x1SearchInput\').value=\'\';">';
            html += '<div><span class="v1x1-search-result-match">' + escapeHtml(m.title) + '</span></div>';
            html += '<div class="v1x1-search-result-chapter">Glossar</div>';
            html += '</button>';
          }
        });
        results.innerHTML = html;
      }
      results.style.display = 'block';
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.style.display = 'none';
      }
    });
  }

  // ========================================
  // SCROLL REVEAL
  // ========================================

  function initScrollReveal() {
    var elements = document.querySelectorAll('.v1x1-reveal:not(.visible)');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      elements.forEach(function(el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all
      elements.forEach(function(el) {
        el.classList.add('visible');
      });
    }
  }

  // ========================================
  // GLOSSARY SEARCH
  // ========================================

  function initGlossarySearch() {
    var input = document.getElementById('v1x1GlossarySearch');
    if (!input) return;
    input.addEventListener('input', function() {
      renderGlossaryList(input.value.trim());
    });
  }

  // ========================================
  // UTILITIES
  // ========================================

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================
  // MODULE INIT
  // ========================================

  function showOverview() {
    currentChapter = null;
    currentView = 'overview';
    setActiveNav('overview');
    renderBreadcrumb(null);

    var contentInner = document.getElementById('v1x1ContentInner');
    if (!contentInner) return;

    // Re-render the welcome view
    var html = '<div class="v1x1-welcome" id="v1x1Welcome">';
    html += '<div class="v1x1-welcome-hero">';
    html += '<div class="v1x1-welcome-stat">';
    html += '<span class="v1x1-welcome-number" data-target="254">0</span>';
    html += '<span class="v1x1-welcome-unit">Mrd. €</span>';
    html += '</div>';
    html += '<p class="v1x1-welcome-label">Beitragsvolumen des deutschen Versicherungsmarktes 2025</p>';
    html += '</div>';
    html += '<p class="v1x1-welcome-intro">Das Versicherungs-1×1 vermittelt das Branchenwissen, das neue Strategieberater im Bereich Monitor/Strategy benötigen — von den Grundlagen über Vertiefungswissen bis hin zu Experten-Level-Insights.</p>';
    html += '<div class="v1x1-chapter-grid" id="v1x1ChapterGrid"></div>';
    html += '</div>';
    contentInner.innerHTML = html;

    renderChapterGrid();
    renderWelcomeCountUp();
  }

  async function initModule() {
    // Reset session progress every time the module is opened
    sessionVisited = [];

    if (moduleLoaded && moduleData) {
      showOverview();
      updateProgressUI();
      return;
    }

    try {
      var response = await fetch('data/versicherungs-1x1/chapters.json?v=20260303d');
      if (!response.ok) throw new Error('Failed to load data');
      moduleData = await response.json();
      moduleLoaded = true;
      console.log('Versicherungs-1×1: Data loaded', moduleData.chapters.length, 'chapters');

      renderTopNav();
      renderChapterGrid();
      renderWelcomeCountUp();
      updateProgressUI();
      initSearch();
      initGlossarySearch();
      initGlobalSearch();
      initSearchOverlay();
      initScrollReveal();
    } catch (err) {
      console.error('Versicherungs-1×1: Error loading data', err);
      var contentInner = document.getElementById('v1x1ContentInner');
      if (contentInner) {
        contentInner.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#9CA3AF;">Fehler beim Laden der Daten. Bitte Seite neu laden.</div>';
      }
    }
  }

  // ========================================
  // INFO KACHEL GRID
  // ========================================

  function renderInfoKachelGrid(block) {
    var html = '<div class="v1x1-info-kachel-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-info-kachel-grid">';
    (block.items || []).forEach(function(item) {
      html += '<div class="v1x1-info-kachel">';
      html += '<div class="v1x1-info-kachel-icon">' + getIcon(item.icon || 'info') + '</div>';
      html += '<div class="v1x1-info-kachel-title">' + escapeHtml(item.title) + '</div>';
      html += '<div class="v1x1-info-kachel-desc">' + escapeHtml(item.description) + '</div>';
      if (item.link) {
        html += '<a class="v1x1-info-kachel-link" href="' + escapeHtml(item.link) + '" target="_blank">Mehr erfahren →</a>';
      }
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  // ========================================
  // TIMELINE
  // ========================================

  function renderTimeline(block) {
    var html = '<div class="v1x1-timeline-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-timeline">';
    html += '<div class="v1x1-timeline-track">';
    (block.events || []).forEach(function(ev, i) {
      var typeClass = 'type-' + (ev.type || 'market');
      html += '<div class="v1x1-timeline-event ' + typeClass + '" data-delay="' + Math.min(i, 4) + '">';
      html += '<div class="v1x1-timeline-dot ' + typeClass + '"></div>';
      html += '<div class="v1x1-timeline-year">' + escapeHtml(String(ev.year)) + '</div>';
      html += '<div class="v1x1-timeline-content">';
      html += '<div class="v1x1-timeline-title">' + escapeHtml(ev.title) + '</div>';
      html += '<div class="v1x1-timeline-desc">' + escapeHtml(ev.description) + '</div>';
      html += '</div></div>';
    });
    html += '</div>';
    // Legend
    html += '<div class="v1x1-timeline-legend">';
    html += '<span class="v1x1-timeline-legend-item type-regulation">Regulatorik</span>';
    html += '<span class="v1x1-timeline-legend-item type-market">Marktentwicklung</span>';
    html += '<span class="v1x1-timeline-legend-item type-crisis">Krise</span>';
    html += '<span class="v1x1-timeline-legend-item type-innovation">Innovation</span>';
    html += '</div>';
    html += '</div></div>';
    return html;
  }

  // ========================================
  // CHART BLOCKS (Chart.js)
  // ========================================

  var chartInstances = {};

  function renderChartBlock(block, idx) {
    var canvasId = 'v1x1Chart_' + (block.chartKey || idx) + '_' + Date.now();
    var height = block.horizontal ? '320px' : '300px';
    var html = '<div class="v1x1-chart-container">';
    if (block.title) {
      html += '<div class="v1x1-chart-title">' + escapeHtml(block.title) + '</div>';
    }
    html += '<div class="v1x1-chart-canvas-wrapper" style="position:relative;height:' + height + ';">';
    html += '<canvas id="' + canvasId + '" data-chart-key="' + escapeHtml(block.chartKey || '') + '" data-chart-type="' + escapeHtml(block.type || 'chartLine') + '"></canvas>';
    html += '</div>';
    if (block.source) {
      html += '<div class="v1x1-chart-source">Quelle: ' + renderSourceHtml(block.source, block.sourceUrl) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function initCharts(chapter) {
    if (typeof Chart === 'undefined') return;
    var canvases = document.querySelectorAll('[id^="v1x1Chart_"]');
    canvases.forEach(function(canvas) {
      var chartKey = canvas.getAttribute('data-chart-key');
      var chartType = canvas.getAttribute('data-chart-type');
      if (!chartKey || !chapter || !chapter.chartData || !chapter.chartData[chartKey]) return;
      // Destroy existing
      if (chartInstances[canvas.id]) {
        chartInstances[canvas.id].destroy();
        delete chartInstances[canvas.id];
      }
      var cd = chapter.chartData[chartKey];
      var type = cd.type || (chartType === 'chartDonut' ? 'doughnut' : chartType === 'chartBar' ? 'bar' : 'line');
      var config = {
        type: type,
        data: { labels: cd.labels, datasets: cd.datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: type === 'doughnut' ? 'right' : 'top', labels: { font: { size: 12 }, padding: 12 } }
          },
          scales: type === 'doughnut' ? {} : {
            x: {
              stacked: cd.options && cd.options.scales && cd.options.scales.x && cd.options.scales.x.stacked,
              grid: { color: '#F3F4F6' },
              ticks: { font: { size: 11 } }
            },
            y: {
              stacked: cd.options && cd.options.scales && cd.options.scales.y && cd.options.scales.y.stacked,
              beginAtZero: true,
              grid: { color: '#F3F4F6' },
              ticks: { font: { size: 11 } }
            }
          }
        }
      };
      // Horizontal bar
      if (cd.options && cd.options.indexAxis) {
        config.options.indexAxis = cd.options.indexAxis;
      }
      chartInstances[canvas.id] = new Chart(canvas, config);
    });
  }

  // ========================================
  // HEATMAP GRID
  // ========================================

  function renderHeatmapGrid(block) {
    var rows = block.rows || [];
    var cols = block.columns || [];
    var data = block.data || [];
    var html = '<div class="v1x1-heatmap-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    if (block.source) {
      html += '<div class="v1x1-chart-source" style="margin-bottom:8px;">Quelle: ' + renderSourceHtml(block.source, block.sourceUrl) + '</div>';
    }
    html += '<div class="v1x1-heatmap-wrapper">';
    html += '<table class="v1x1-heatmap-table">';
    // Header row
    html += '<thead><tr><th class="v1x1-heatmap-corner"></th>';
    cols.forEach(function(col) {
      html += '<th class="v1x1-heatmap-col-header">' + escapeHtml(col) + '</th>';
    });
    html += '</tr></thead><tbody>';
    // Data rows
    rows.forEach(function(row, ri) {
      html += '<tr>';
      html += '<td class="v1x1-heatmap-row-header">' + escapeHtml(row) + '</td>';
      (data[ri] || []).forEach(function(val) {
        var intensity = val / 100;
        var bg = 'rgba(37,99,235,' + (intensity * 0.8 + 0.05).toFixed(2) + ')';
        var color = intensity > 0.4 ? 'white' : '#111827';
        html += '<td class="v1x1-heatmap-cell" style="background:' + bg + ';color:' + color + ';" title="' + val + '%">' + val + '%</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    // Color legend
    html += '<div class="v1x1-heatmap-legend">';
    html += '<span style="font-size:12px;color:#6B7280;">Intensität: </span>';
    html += '<span class="v1x1-heatmap-legend-bar"></span>';
    html += '<span style="font-size:11px;color:#9CA3AF;">niedrig → hoch</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ========================================
  // REGULATORY PYRAMID (SVG)
  // ========================================

  function renderRegulatoryPyramid(block) {
    var levels = block.levels || [];
    var html = '<div class="v1x1-pyramid-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-pyramid">';
    levels.forEach(function(level, i) {
      var isActive = i === 0;
      html += '<div class="v1x1-pyramid-level" style="background:' + escapeHtml(level.color || '#E5E7EB') + '1A;border-color:' + escapeHtml(level.color || '#E5E7EB') + ';" onclick="V1x1.togglePyramidLevel(this)">';
      html += '<div class="v1x1-pyramid-level-header">';
      html += '<span class="v1x1-pyramid-level-label" style="color:' + escapeHtml(level.color || '#111827') + ';">' + escapeHtml(level.label) + '</span>';
      html += '<span class="v1x1-pyramid-chevron">' + getIcon('chevron-down') + '</span>';
      html += '</div>';
      html += '<ul class="v1x1-pyramid-items">';
      (level.items || []).forEach(function(item) {
        html += '<li>' + escapeHtml(item) + '</li>';
      });
      html += '</ul></div>';
    });
    html += '</div></div>';
    return html;
  }

  function togglePyramidLevel(el) {
    el.classList.toggle('open');
  }

  // ========================================
  // VALUE CHAIN (CSS-based)
  // ========================================

  function renderValueChain(block) {
    var steps = block.steps || [];
    var html = '<div class="v1x1-valuechain-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-valuechain">';
    steps.forEach(function(step, i) {
      html += '<div class="v1x1-vc-step" onclick="V1x1.toggleVCStep(this)">';
      html += '<div class="v1x1-vc-step-icon">' + getIcon(step.icon || 'settings-2') + '</div>';
      html += '<div class="v1x1-vc-step-label">' + escapeHtml(step.label) + '</div>';
      html += '<div class="v1x1-vc-step-detail">' + escapeHtml(step.description) + '</div>';
      html += '</div>';
      if (i < steps.length - 1) {
        html += '<div class="v1x1-vc-arrow">' + getIcon('chevron-right') + '</div>';
      }
    });
    html += '</div></div>';
    return html;
  }

  function toggleVCStep(el) {
    var allSteps = document.querySelectorAll('.v1x1-vc-step');
    allSteps.forEach(function(s) {
      if (s !== el) s.classList.remove('active');
    });
    el.classList.toggle('active');
  }

  // ========================================
  // COMBINED RATIO CALCULATOR
  // ========================================

  function renderCombinedRatioCalc(block) {
    var html = '<div class="v1x1-combined-ratio v1x1-reveal">';
    html += '<div class="v1x1-calculator-title">Combined Ratio Rechner</div>';
    html += '<div class="v1x1-cr-inputs">';

    html += '<div class="v1x1-cr-slider-group">';
    html += '<label class="v1x1-cr-label">Schadenquote (Loss Ratio)<span class="v1x1-cr-value" id="v1x1CRSchadenVal">65%</span></label>';
    html += '<input type="range" class="v1x1-calc-slider" id="v1x1CRSchaden" min="30" max="120" value="65" oninput="V1x1.updateCombinedRatio()">';
    html += '</div>';

    html += '<div class="v1x1-cr-slider-group">';
    html += '<label class="v1x1-cr-label">Kostenquote (Expense Ratio)<span class="v1x1-cr-value" id="v1x1CRKostenVal">28%</span></label>';
    html += '<input type="range" class="v1x1-calc-slider" id="v1x1CRKosten" min="10" max="60" value="28" oninput="V1x1.updateCombinedRatio()">';
    html += '</div>';

    html += '</div>';
    html += '<div id="v1x1CRResult" class="v1x1-cr-result v1x1-cr-green">';
    html += '<span class="v1x1-cr-total-label">Combined Ratio</span>';
    html += '<span class="v1x1-cr-total-value" id="v1x1CRTotal">93%</span>';
    html += '<span class="v1x1-cr-interpretation" id="v1x1CRInterpret">Versicherungstechnischer Gewinn von 7%</span>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function updateCombinedRatio() {
    var schaden = parseInt(document.getElementById('v1x1CRSchaden').value) || 65;
    var kosten = parseInt(document.getElementById('v1x1CRKosten').value) || 28;
    var total = schaden + kosten;
    var s = document.getElementById('v1x1CRSchadenVal');
    var k = document.getElementById('v1x1CRKostenVal');
    var t = document.getElementById('v1x1CRTotal');
    var interp = document.getElementById('v1x1CRInterpret');
    var result = document.getElementById('v1x1CRResult');
    if (s) s.textContent = schaden + '%';
    if (k) k.textContent = kosten + '%';
    if (t) t.textContent = total + '%';
    if (interp && result) {
      if (total < 100) {
        interp.textContent = 'Versicherungstechnischer Gewinn von ' + (100 - total) + '%';
        result.className = 'v1x1-cr-result v1x1-cr-green';
      } else if (total === 100) {
        interp.textContent = 'Break-even — kein versicherungstechnischer Gewinn oder Verlust';
        result.className = 'v1x1-cr-result v1x1-cr-neutral';
      } else {
        interp.textContent = 'Versicherungstechnischer Verlust von ' + (total - 100) + '%';
        result.className = 'v1x1-cr-result v1x1-cr-red';
      }
    }
  }

  // ========================================
  // TREND RADAR (SVG)
  // ========================================

  function renderTrendRadar(block) {
    var radarId = 'v1x1TrendRadar_' + Date.now();
    var html = '<div class="v1x1-trendradar-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-trendradar-container" id="' + radarId + '" data-chart-key="' + escapeHtml(block.chartKey || '') + '">';
    html += '<div class="v1x1-trendradar-placeholder"><div class="v1x1-trendradar-loading">Trend-Radar wird geladen…</div></div>';
    html += '</div>';
    if (block.source) {
      html += '<div class="v1x1-chart-source">Quelle: ' + renderSourceHtml(block.source, block.sourceUrl) + '</div>';
    }
    html += '<div class="v1x1-trendradar-legend">';
    html += '<span class="v1x1-tr-ring adopt">Adopt</span>';
    html += '<span class="v1x1-tr-ring trial">Trial</span>';
    html += '<span class="v1x1-tr-ring assess">Assess</span>';
    html += '<span class="v1x1-tr-ring hold">Hold</span>';
    html += '</div>';
    html += '<div class="v1x1-trendradar-items" id="' + radarId + '_items"></div>';
    html += '</div>';
    return html;
  }

  function initD3Components(chapter) {
    if (!chapter || !chapter.chartData) return;

    // Trend Radar
    var radarContainers = document.querySelectorAll('[id^="v1x1TrendRadar_"]');
    radarContainers.forEach(function(container) {
      var key = container.getAttribute('data-chart-key');
      if (!key || !chapter.chartData[key]) return;
      var data = chapter.chartData[key];
      buildTrendRadarSVG(container, data);
    });

    // Network Graph
    var graphContainers = document.querySelectorAll('[id^="v1x1NetworkGraph_"]');
    graphContainers.forEach(function(container) {
      var key = container.getAttribute('data-chart-key');
      if (!key || !chapter.chartData[key]) return;
      buildNetworkGraph(container, chapter.chartData[key]);
    });
  }

  function buildTrendRadarSVG(container, data) {
    var rings = data.rings || ['Adopt','Trial','Assess','Hold'];
    var segments = data.segments || [];
    var items = data.items || [];
    var W = Math.min(container.offsetWidth || 500, 500);
    var H = W;
    var cx = W / 2, cy = H / 2;
    var maxR = W * 0.43;
    var ringColors = ['rgba(16,185,129,0.1)','rgba(37,99,235,0.1)','rgba(245,158,11,0.1)','rgba(239,68,68,0.1)'];
    var ringStroke = ['#10B981','#2563EB','#F59E0B','#EF4444'];

    var svg = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="max-width:500px;display:block;margin:0 auto;">';
    // Draw rings
    rings.forEach(function(ring, ri) {
      var r = maxR * ((rings.length - ri) / rings.length);
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + ringColors[ri] + '" stroke="' + ringStroke[ri] + '" stroke-width="1.5" stroke-dasharray="4,2"/>';
      svg += '<text x="' + cx + '" y="' + (cy - r + 14) + '" text-anchor="middle" font-size="10" fill="' + ringStroke[ri] + '" font-weight="600">' + escapeHtml(ring) + '</text>';
    });
    // Draw segment dividers
    var numSeg = segments.length;
    if (numSeg > 0) {
      for (var si = 0; si < numSeg; si++) {
        var angle = (si / numSeg) * 2 * Math.PI - Math.PI / 2;
        svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + maxR * Math.cos(angle)) + '" y2="' + (cy + maxR * Math.sin(angle)) + '" stroke="#E5E7EB" stroke-width="1"/>';
        // Segment label
        var midAngle = ((si + 0.5) / numSeg) * 2 * Math.PI - Math.PI / 2;
        var labelR = maxR + 20;
        svg += '<text x="' + (cx + labelR * Math.cos(midAngle)) + '" y="' + (cy + labelR * Math.sin(midAngle) + 4) + '" text-anchor="middle" font-size="9" fill="#6B7280" font-weight="500">' + escapeHtml(segments[si] || '') + '</text>';
      }
    }
    // Draw items
    var segAngle = numSeg > 0 ? (2 * Math.PI / numSeg) : (2 * Math.PI);
    items.forEach(function(item, ii) {
      var seg = item.segment || 0;
      var ring = item.ring !== undefined ? item.ring : 2;
      var r = maxR * ((rings.length - ring - 0.5) / rings.length);
      var baseAngle = (seg / numSeg) * 2 * Math.PI - Math.PI / 2;
      var spreadAngle = baseAngle + (segAngle * 0.2) + (ii % 3) * (segAngle * 0.25);
      var jitter = (ii * 37 % 20 - 10) / maxR;
      var x = cx + (r + jitter) * Math.cos(spreadAngle);
      var y = cy + (r + jitter) * Math.sin(spreadAngle);
      var dotColor = ringStroke[ring] || '#6B7280';
      svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="' + dotColor + '" stroke="white" stroke-width="1.5" style="cursor:pointer;" />';
    });
    svg += '</svg>';
    container.innerHTML = svg;

    // Render item list below
    var listEl = document.getElementById(container.id + '_items');
    if (listEl) {
      var ringLabels = rings;
      var grouped = {};
      items.forEach(function(item) {
        var ring = item.ring !== undefined ? item.ring : 2;
        var label = ringLabels[ring] || 'Unknown';
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(item);
      });
      var listHtml = '<div class="v1x1-tr-items-grid">';
      Object.keys(grouped).forEach(function(ringLabel, ri) {
        listHtml += '<div class="v1x1-tr-items-group">';
        listHtml += '<div class="v1x1-tr-items-ring ' + ringLabel.toLowerCase() + '">' + escapeHtml(ringLabel) + '</div>';
        grouped[ringLabel].forEach(function(item) {
          listHtml += '<div class="v1x1-tr-item"><strong>' + escapeHtml(item.label) + '</strong> — ' + escapeHtml(item.description) + '</div>';
        });
        listHtml += '</div>';
      });
      listHtml += '</div>';
      listEl.innerHTML = listHtml;
    }
  }

  // ========================================
  // NETWORK GRAPH (SVG, simplified)
  // ========================================

  function renderNetworkGraph(block) {
    var graphId = 'v1x1NetworkGraph_' + Date.now();
    var html = '<div class="v1x1-network-section">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-network-container" id="' + graphId + '" data-chart-key="' + escapeHtml(block.chartKey || '') + '">';
    html += '<div class="v1x1-trendradar-loading">Netzwerk wird geladen…</div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function buildNetworkGraph(container, data) {
    var nodes = data.nodes || [];
    var links = data.links || [];
    var W = Math.min(container.offsetWidth || 600, 640);
    var H = 400;
    var typeColors = { aufsicht: '#EF4444', verband: '#2563EB', verbraucher: '#8B5CF6', schlichtung: '#10B981', rating: '#F59E0B', sicherung: '#6B7280' };

    // Simple fixed layout
    var positions = {};
    var total = nodes.length;
    nodes.forEach(function(node, i) {
      var angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      var r = H * 0.35;
      positions[node.id] = { x: W / 2 + r * Math.cos(angle), y: H / 2 + r * Math.sin(angle) };
    });

    var svg = '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    // Draw links
    links.forEach(function(link) {
      var src = positions[link.source];
      var tgt = positions[link.target];
      if (!src || !tgt) return;
      svg += '<line x1="' + src.x.toFixed(0) + '" y1="' + src.y.toFixed(0) + '" x2="' + tgt.x.toFixed(0) + '" y2="' + tgt.y.toFixed(0) + '" stroke="#E5E7EB" stroke-width="1.5"/>';
    });
    // Draw nodes
    nodes.forEach(function(node) {
      var pos = positions[node.id];
      if (!pos) return;
      var color = typeColors[node.type] || '#6B7280';
      svg += '<circle cx="' + pos.x.toFixed(0) + '" cy="' + pos.y.toFixed(0) + '" r="18" fill="' + color + '" opacity="0.15" stroke="' + color + '" stroke-width="2"/>';
      svg += '<text x="' + pos.x.toFixed(0) + '" y="' + (pos.y - 24).toFixed(0) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#111827">' + escapeHtml(node.label) + '</text>';
    });
    svg += '</svg>';
    container.innerHTML = svg;

    // Node legend
    var legend = '<div class="v1x1-network-legend">';
    var typeLabels = { aufsicht: 'Aufsicht', verband: 'Verband', verbraucher: 'Verbraucher', schlichtung: 'Schlichtung', rating: 'Rating', sicherung: 'Sicherung' };
    Object.entries(typeColors).forEach(function(entry) {
      var type = entry[0], color = entry[1];
      legend += '<span class="v1x1-network-legend-item"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + color + ';margin-right:4px;"></span>' + escapeHtml(typeLabels[type] || type) + '</span>';
    });
    legend += '</div>';
    container.insertAdjacentHTML('afterend', legend);
  }

  // ========================================
  // DECISION TREE (Interactive)
  // ========================================

  var dtState = {};

  function renderDecisionTreeBlock(block) {
    var chapter = currentChapter;
    if (!chapter || !chapter.decisionTrees || !block.treeKey) return '';
    var tree = chapter.decisionTrees[block.treeKey];
    if (!tree) return '';
    var dtId = 'v1x1DT_' + block.treeKey;
    dtState[dtId] = { treeKey: block.treeKey, currentNode: tree.start, history: [], chapterId: chapter.id };
    var html = '<div class="v1x1-dt-section">';
    if (block.title || tree.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title || tree.title) + '</h3>';
    }
    html += '<div class="v1x1-decision-tree" id="' + dtId + '">';
    html += renderDTNode(tree, tree.start, dtId);
    html += '</div></div>';
    return html;
  }

  function renderDTNode(tree, nodeId, dtId) {
    var node = tree.nodes[nodeId];
    if (!node) return '<p style="color:#9CA3AF;">Node nicht gefunden.</p>';
    if (node.result) {
      return renderDTResult(node, dtId);
    }
    var html = '<div class="v1x1-dt-question-card">';
    html += '<p class="v1x1-dt-question">' + escapeHtml(node.question) + '</p>';
    html += '<div class="v1x1-dt-options">';
    (node.options || []).forEach(function(opt, i) {
      html += '<button class="v1x1-dt-option" onclick="V1x1.dtSelectOption(\'' + dtId + '\',\'' + escapeHtml(opt.next) + '\')">';
      html += escapeHtml(opt.label);
      html += '</button>';
    });
    html += '</div>';
    if (dtState[dtId] && dtState[dtId].history.length > 0) {
      html += '<button class="v1x1-dt-back" onclick="V1x1.dtBack(\'' + dtId + '\')">' + getIcon('chevron-left') + ' Zurück</button>';
    }
    html += '</div>';
    return html;
  }

  function renderDTResult(node, dtId) {
    var html = '<div class="v1x1-dt-result">';
    html += '<div class="v1x1-dt-result-icon">' + getIcon(node.icon || 'shield-check') + '</div>';
    html += '<h4 class="v1x1-dt-result-title">' + escapeHtml(node.title) + '</h4>';
    if (node.items && node.items.length) {
      html += '<ul class="v1x1-dt-result-list">';
      node.items.forEach(function(item) {
        html += '<li>' + escapeHtml(item) + '</li>';
      });
      html += '</ul>';
    }
    if (node.note) {
      html += '<p class="v1x1-dt-result-note">' + escapeHtml(node.note) + '</p>';
    }
    html += '<button class="v1x1-dt-restart" onclick="V1x1.dtRestart(\'' + dtId + '\')">' + getIcon('rotate-ccw') + ' Neu starten</button>';
    html += '</div>';
    return html;
  }

  function dtSelectOption(dtId, nextNodeId) {
    var state = dtState[dtId];
    if (!state) return;
    var chapter = null;
    for (var i = 0; i < moduleData.chapters.length; i++) {
      if (moduleData.chapters[i].id === state.chapterId) { chapter = moduleData.chapters[i]; break; }
    }
    if (!chapter || !chapter.decisionTrees) return;
    var tree = chapter.decisionTrees[state.treeKey];
    if (!tree) return;
    state.history.push(state.currentNode);
    state.currentNode = nextNodeId;
    var container = document.getElementById(dtId);
    if (container) container.innerHTML = renderDTNode(tree, nextNodeId, dtId);
  }

  function dtBack(dtId) {
    var state = dtState[dtId];
    if (!state || !state.history.length) return;
    var prev = state.history.pop();
    state.currentNode = prev;
    var chapter = null;
    for (var i = 0; i < moduleData.chapters.length; i++) {
      if (moduleData.chapters[i].id === state.chapterId) { chapter = moduleData.chapters[i]; break; }
    }
    if (!chapter || !chapter.decisionTrees) return;
    var tree = chapter.decisionTrees[state.treeKey];
    if (!tree) return;
    var container = document.getElementById(dtId);
    if (container) container.innerHTML = renderDTNode(tree, prev, dtId);
  }

  function dtRestart(dtId) {
    var state = dtState[dtId];
    if (!state) return;
    var chapter = null;
    for (var i = 0; i < moduleData.chapters.length; i++) {
      if (moduleData.chapters[i].id === state.chapterId) { chapter = moduleData.chapters[i]; break; }
    }
    if (!chapter || !chapter.decisionTrees) return;
    var tree = chapter.decisionTrees[state.treeKey];
    if (!tree) return;
    state.history = [];
    state.currentNode = tree.start;
    var container = document.getElementById(dtId);
    if (container) container.innerHTML = renderDTNode(tree, tree.start, dtId);
  }

  // ========================================
  // COMPARISON TABLE
  // ========================================

  function renderComparisonTable(block) {
    var rawCols = block.columns || [];
    var rows = block.rows || [];
    var highlight = block.highlightColumn || null;
    // Normalize: columns can be [{key,label}] objects OR plain strings
    var isSimple = rawCols.length > 0 && typeof rawCols[0] === 'string';
    var columns = isSimple
      ? rawCols.map(function(s, i) { return { key: i, label: s }; })
      : rawCols;
    var html = '<div class="v1x1-comparison-table-wrapper">';
    if (block.title) {
      html += '<h3 class="v1x1-section-title">' + escapeHtml(block.title) + '</h3>';
    }
    html += '<div class="v1x1-comparison-scroll">';
    html += '<table class="v1x1-comparison-table">';
    html += '<thead><tr>';
    columns.forEach(function(col) {
      var isHighlight = col.key === highlight;
      html += '<th class="' + (isHighlight ? 'highlight-col' : '') + '">' + escapeHtml(col.label) + '</th>';
    });
    html += '</tr></thead><tbody>';
    rows.forEach(function(row, ri) {
      html += '<tr class="' + (ri % 2 === 0 ? 'even' : 'odd') + '">';
      columns.forEach(function(col) {
        var isHighlight = col.key === highlight;
        var cellVal = Array.isArray(row) ? (row[col.key] !== undefined ? row[col.key] : '') : (row[col.key] !== undefined ? row[col.key] : '');
        html += '<td class="' + (isHighlight ? 'highlight-col' : '') + '">' + escapeHtml(String(cellVal)) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
  }

  // ========================================
  // COUNTUP OBSERVERS
  // ========================================

  function initCountUpObservers() {
    var targets = document.querySelectorAll('[data-countup]:not(.counted)');
    if (!targets.length) return;
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseFloat(el.getAttribute('data-countup')) || 0;
            el.classList.add('counted');
            animateCountUp(el, 0, target, 1000);
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      targets.forEach(function(el) { obs.observe(el); });
    }
  }

  // ========================================
  // CMD+K SEARCH OVERLAY
  // ========================================

  var searchOverlayOpen = false;

  function initGlobalSearch() {
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearchOverlay();
      }
      if (e.key === 'Escape' && searchOverlayOpen) {
        closeSearchOverlay();
      }
    });
  }

  function toggleSearchOverlay() {
    if (searchOverlayOpen) closeSearchOverlay();
    else openSearchOverlay();
  }

  function openSearchOverlay() {
    var overlay = document.getElementById('v1x1SearchOverlay');
    if (!overlay) return;
    overlay.classList.add('visible');
    searchOverlayOpen = true;
    var input = document.getElementById('v1x1SearchOverlayInput');
    if (input) { input.value = ''; input.focus(); renderSearchOverlayResults(''); }
  }

  function closeSearchOverlay() {
    var overlay = document.getElementById('v1x1SearchOverlay');
    if (overlay) overlay.classList.remove('visible');
    searchOverlayOpen = false;
  }

  function renderSearchOverlayResults(q) {
    var container = document.getElementById('v1x1SearchOverlayResults');
    if (!container || !moduleData) return;
    if (!q || q.length < 1) {
      container.innerHTML = '<div class="v1x1-sov-hint">Tippe um zu suchen — Kapitel, Glossar, Begriffe</div>';
      return;
    }
    var ql = q.toLowerCase();
    var results = [];
    // Chapters
    moduleData.chapters.forEach(function(ch) {
      if (ch.title.toLowerCase().indexOf(ql) !== -1) {
        results.push({ type: 'chapter', label: ch.title, sub: 'Kapitel', action: 'openChapter', arg: ch.id });
      }
    });
    // Glossary
    (moduleData.glossary || []).forEach(function(g) {
      if (g.term.toLowerCase().indexOf(ql) !== -1 || g.definition.toLowerCase().indexOf(ql) !== -1) {
        results.push({ type: 'glossary', label: g.term, sub: g.definition.substring(0, 80) + '…', action: 'showGlossary', arg: '' });
      }
    });
    if (!results.length) {
      container.innerHTML = '<div class="v1x1-sov-hint">Keine Treffer für „' + escapeHtml(q) + '"</div>';
      return;
    }
    var html = '';
    results.slice(0, 10).forEach(function(r, i) {
      html += '<button class="v1x1-sov-result" onclick="V1x1.' + r.action + '(\'' + escapeHtml(r.arg) + '\');V1x1.closeSearchOverlay();">';
      html += '<div class="v1x1-sov-result-type ' + r.type + '">' + (r.type === 'chapter' ? 'Kapitel' : 'Glossar') + '</div>';
      html += '<div class="v1x1-sov-result-label">' + escapeHtml(r.label) + '</div>';
      if (r.sub) html += '<div class="v1x1-sov-result-sub">' + escapeHtml(r.sub) + '</div>';
      html += '</button>';
    });
    container.innerHTML = html;
  }

  function initSearchOverlay() {
    var input = document.getElementById('v1x1SearchOverlayInput');
    if (!input) return;
    input.addEventListener('input', function() {
      renderSearchOverlayResults(input.value.trim());
    });
    var overlay = document.getElementById('v1x1SearchOverlay');
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeSearchOverlay();
      });
    }
  }

  // ========================================
  // INLINE GLOSSARY POPOVERS
  // ========================================

  function initGlossaryPopovers() {
    if (!moduleData || !moduleData.glossary) return;
    var termMap = {};
    moduleData.glossary.forEach(function(g) {
      termMap[g.term.toLowerCase()] = g;
    });
    var paragraphs = document.querySelectorAll('.v1x1-paragraph strong');
    paragraphs.forEach(function(strong) {
      var text = strong.textContent.trim().toLowerCase();
      if (termMap[text]) {
        var g = termMap[text];
        strong.classList.add('v1x1-glossterm');
        strong.setAttribute('data-definition', g.definition);
        strong.setAttribute('tabindex', '0');
      }
    });
    // Event delegation
    var content = document.getElementById('v1x1ContentInner');
    if (content && !content._glossarydelegated) {
      content._glossarydelegated = true;
      content.addEventListener('mouseenter', function(e) {
        var el = e.target.closest('.v1x1-glossterm');
        if (el) showGlossaryPopover(el);
      }, true);
      content.addEventListener('mouseleave', function(e) {
        var el = e.target.closest('.v1x1-glossterm');
        if (el) hideGlossaryPopover();
      }, true);
    }
  }

  function showGlossaryPopover(el) {
    var popover = document.getElementById('v1x1GlossaryPopover');
    if (!popover) return;
    var def = el.getAttribute('data-definition');
    var term = el.textContent;
    popover.querySelector('.v1x1-gp-term').textContent = term;
    popover.querySelector('.v1x1-gp-def').textContent = def;
    var rect = el.getBoundingClientRect();
    var moduleEl = document.querySelector('.v1x1-module');
    var moduleRect = moduleEl ? moduleEl.getBoundingClientRect() : { top: 0, left: 0 };
    popover.style.top = (rect.bottom - moduleRect.top + 8) + 'px';
    popover.style.left = Math.min(rect.left - moduleRect.left, window.innerWidth - 340) + 'px';
    popover.style.display = 'block';
  }

  function hideGlossaryPopover() {
    var popover = document.getElementById('v1x1GlossaryPopover');
    if (popover) popover.style.display = 'none';
  }

  // ========================================
  // BREADCRUMB
  // ========================================

  function renderBreadcrumb(chapterTitle) {
    var breadcrumb = document.getElementById('v1x1Breadcrumb');
    if (!breadcrumb) return;
    if (!chapterTitle) {
      breadcrumb.innerHTML = '';
      return;
    }
    breadcrumb.innerHTML = '<nav class="v1x1-breadcrumb">'
      + '<button class="v1x1-breadcrumb-link" onclick="V1x1.showOverview()">Übersicht</button>'
      + '<span class="v1x1-breadcrumb-sep">' + getIcon('chevron-right') + '</span>'
      + '<span class="v1x1-breadcrumb-current">' + escapeHtml(chapterTitle) + '</span>'
      + '</nav>';
  }

  // ========================================
  // GLOBAL API
  // ========================================

  window.V1x1 = {
    init: initModule,
    openChapter: openChapter,
    openSubChapter: openSubChapter,
    showOverview: showOverview,
    openWissencheck: openWissencheck,
    selectWissencheckChapter: selectWissencheckChapter,
    setWkModuleFilter: setWkModuleFilter,
    setWkMode: setWkMode,
    startWissenscheck: startWissenscheck,
    toggleLevel2: toggleLevel2,
    toggleLevel3: toggleLevel3,
    showGlossary: showGlossary,
    closeGlossary: closeGlossary,
    filterGlossaryLetter: filterGlossaryLetter,
    filterGlossaryTag: filterGlossaryTag,
    answerQuiz: answerQuiz,
    nextQuizQuestion: nextQuizQuestion,
    restartQuiz: restartQuiz,
    updateCalc: updateCalc,
    updateCombinedRatio: updateCombinedRatio,
    togglePyramidLevel: togglePyramidLevel,
    toggleVCStep: toggleVCStep,
    dtSelectOption: dtSelectOption,
    dtBack: dtBack,
    dtRestart: dtRestart,
    openSearchOverlay: openSearchOverlay,
    closeSearchOverlay: closeSearchOverlay
  };

})();
