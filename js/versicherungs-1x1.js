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
  var currentQuizIndex = 0;
  var quizAnswered = {};

  // Progress tracking (localStorage)
  var STORAGE_KEY = 'v1x1_progress';

  function loadProgress() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { visited: [], quizScores: {} };
    } catch (e) {
      return { visited: [], quizScores: {} };
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  function markChapterVisited(chapterId) {
    var progress = loadProgress();
    if (progress.visited.indexOf(chapterId) === -1) {
      progress.visited.push(chapterId);
      saveProgress(progress);
    }
    updateProgressUI();
  }

  function updateProgressUI() {
    if (!moduleData) return;
    var progress = loadProgress();
    var total = moduleData.chapters.length;
    var visited = progress.visited.length;
    var pct = total > 0 ? Math.round((visited / total) * 100) : 0;

    var fill = document.getElementById('v1x1ProgressFill');
    var value = document.getElementById('v1x1ProgressValue');
    if (fill) fill.style.width = pct + '%';
    if (value) value.textContent = pct + '%';

    // Update sidebar visited dots
    moduleData.chapters.forEach(function(ch) {
      var item = document.querySelector('[data-chapter="' + ch.id + '"]');
      if (item) {
        if (progress.visited.indexOf(ch.id) !== -1) {
          item.classList.add('visited');
        }
      }
    });
  }

  // ========================================
  // SVG ICONS (Lucide-style, inline)
  // ========================================
  var icons = {
    'bar-chart-3': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    'building-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18Z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
    'shield-check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    'network': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 011-1h12a1 1 0 011 1v3"/><path d="M12 12V8"/></svg>',
    'banknote': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>',
    'scale': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M8 21h8"/><path d="M12 17V3"/><path d="M2 11l4-7 4 7"/><path d="M14 11l4-7 4 7"/></svg>',
    'settings-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>',
    'rocket': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    'landmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    'lightbulb': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>'
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
  // RENDER FUNCTIONS
  // ========================================

  function renderSidebar() {
    var container = document.getElementById('v1x1SidebarChapters');
    if (!container || !moduleData) return;

    var html = '';
    moduleData.chapters.forEach(function(ch, i) {
      var num = String(i + 1).padStart(2, '0');
      html += '<button class="v1x1-sidebar-item" data-chapter="' + ch.id + '" onclick="V1x1.openChapter(\'' + ch.id + '\')">';
      html += '<span class="v1x1-sidebar-item-icon">' + getIcon(ch.icon) + '</span>';
      html += '<span>' + ch.title + '</span>';
      html += '<span class="v1x1-visited-dot"></span>';
      html += '</button>';
    });
    container.innerHTML = html;
  }

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
  // CHAPTER RENDERING
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
    currentQuizIndex = 0;
    quizAnswered = {};

    // Mark as visited
    markChapterVisited(chapterId);

    // Update sidebar active
    var sidebarItems = document.querySelectorAll('.v1x1-sidebar-item');
    sidebarItems.forEach(function(item) {
      item.classList.remove('active');
      if (item.getAttribute('data-chapter') === chapterId) {
        item.classList.add('active');
      }
    });

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
      html += '<div class="v1x1-quick-stats">';
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

    // Level 1 — Grundlagen
    html += '<div class="v1x1-level-section">';
    html += '<div class="v1x1-level-1-content">';
    html += renderContentBlocks(chapter.levels.level1);
    html += '</div>';
    html += '</div>';

    // Provision Calculator for chapter 05
    if (chapter.id === '05-verguetung-provision') {
      html += renderProvisionCalculator();
    }

    // Market Share Chart for chapter 02
    if (chapter.id === '02-marktteilnehmer') {
      html += renderMarketShareChart();
    }

    // Level 2 — Vertiefung (Accordion)
    if (chapter.levels.level2 && chapter.levels.level2.length) {
      html += '<div class="v1x1-level-section">';
      html += '<button class="v1x1-level-2-trigger" onclick="V1x1.toggleLevel2(this)">';
      html += '<span class="v1x1-level-badge">Level 2</span>';
      html += '<span>Vertiefung aufklappen</span>';
      html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
      html += '</button>';
      html += '<div class="v1x1-level-2-body" id="v1x1Level2Body">';
      html += renderContentBlocks(chapter.levels.level2);
      html += '</div>';
      html += '</div>';
    }

    // Level 3 — Experten (Accordion)
    if (chapter.levels.level3 && chapter.levels.level3.length) {
      html += '<div class="v1x1-level-section">';
      html += '<button class="v1x1-level-3-trigger" onclick="V1x1.toggleLevel3(this)">';
      html += '<span class="v1x1-level-badge">Level 3</span>';
      html += '<span>Experten-Deep-Dive</span>';
      html += '<span class="v1x1-level-2-chevron">' + getIcon('chevron-down') + '</span>';
      html += '</button>';
      html += '<div class="v1x1-level-3-body" id="v1x1Level3Body">';
      html += renderContentBlocks(chapter.levels.level3);
      html += '</div>';
      html += '</div>';
    }

    // Quiz
    if (chapter.quiz && chapter.quiz.length) {
      html += '<div class="v1x1-quiz" id="v1x1Quiz">';
      html += renderQuiz(chapter.quiz, 0);
      html += '</div>';
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

    // Close mobile sidebar if open
    var sidebar = document.getElementById('v1x1Sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      toggleSidebar();
    }
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
      }
      html += '</div>';
    });
    return html;
  }

  function renderTable(block) {
    var html = '<div class="v1x1-table-wrapper">';
    if (block.title) {
      html += '<div class="v1x1-table-title">' + escapeHtml(block.title) + '</div>';
    }
    html += '<table class="v1x1-table">';
    html += '<thead><tr>';
    block.headers.forEach(function(h) {
      var cls = block.sortable ? ' class="sortable"' : '';
      html += '<th' + cls + '>' + escapeHtml(h) + '</th>';
    });
    html += '</tr></thead>';
    html += '<tbody>';
    block.rows.forEach(function(row) {
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
    var variant = block.variant || 'info';
    var html = '<div class="v1x1-callout ' + variant + '">';
    html += '<span class="v1x1-callout-icon">' + getCalloutIcon(variant) + '</span>';
    html += '<div>' + block.content + '</div>';
    html += '</div>';
    return html;
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
  // QUIZ
  // ========================================

  function renderQuiz(questions, index) {
    if (index >= questions.length) {
      // Quiz complete
      var correct = 0;
      for (var k in quizAnswered) {
        if (quizAnswered[k]) correct++;
      }
      var html = '<div class="v1x1-quiz-header">';
      html += '<span class="v1x1-quiz-title">Wissenscheck abgeschlossen!</span>';
      html += '</div>';
      html += '<p class="v1x1-quiz-question">Du hast ' + correct + ' von ' + questions.length + ' Fragen richtig beantwortet.</p>';
      html += '<button class="v1x1-quiz-next-btn" onclick="V1x1.restartQuiz()">Nochmal versuchen</button>';
      return html;
    }

    var q = questions[index];
    var html = '<div class="v1x1-quiz-header">';
    html += '<span class="v1x1-quiz-title">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    html += ' Wissenscheck</span>';
    html += '<span class="v1x1-quiz-counter">' + (index + 1) + ' / ' + questions.length + '</span>';
    html += '</div>';

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

    return html;
  }

  function answerQuiz(selected, correct) {
    var options = document.querySelectorAll('#v1x1QuizOptions .v1x1-quiz-option');
    if (!options.length) return;

    // Prevent multiple answers
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

    // Show explanation
    var feedback = document.getElementById('v1x1QuizFeedback');
    if (feedback && currentChapter && currentChapter.quiz && currentChapter.quiz[currentQuizIndex]) {
      var q = currentChapter.quiz[currentQuizIndex];
      var html = '<div class="v1x1-quiz-explanation">' + escapeHtml(q.explanation) + '</div>';
      if (currentQuizIndex < currentChapter.quiz.length - 1) {
        html += '<button class="v1x1-quiz-next-btn" onclick="V1x1.nextQuizQuestion()">Nächste Frage ' + getIcon('chevron-right') + '</button>';
      } else {
        html += '<button class="v1x1-quiz-next-btn" onclick="V1x1.nextQuizQuestion()">Ergebnis anzeigen ' + getIcon('chevron-right') + '</button>';
      }
      feedback.innerHTML = html;
    }
  }

  function nextQuizQuestion() {
    currentQuizIndex++;
    var quizContainer = document.getElementById('v1x1Quiz');
    if (quizContainer && currentChapter && currentChapter.quiz) {
      quizContainer.innerHTML = renderQuiz(currentChapter.quiz, currentQuizIndex);
    }
  }

  function restartQuiz() {
    currentQuizIndex = 0;
    quizAnswered = {};
    var quizContainer = document.getElementById('v1x1Quiz');
    if (quizContainer && currentChapter && currentChapter.quiz) {
      quizContainer.innerHTML = renderQuiz(currentChapter.quiz, 0);
    }
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
      // Update level indicator
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
  // SIDEBAR TOGGLE (Mobile)
  // ========================================

  function toggleSidebar() {
    var sidebar = document.getElementById('v1x1Sidebar');
    var backdrop = document.getElementById('v1x1SidebarBackdrop');
    if (!sidebar) return;
    var isOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open');
    if (backdrop) backdrop.style.display = isOpen ? 'none' : 'block';
  }

  // ========================================
  // GLOSSARY
  // ========================================

  function showGlossary() {
    var overlay = document.getElementById('v1x1GlossaryOverlay');
    if (overlay) overlay.style.display = 'flex';
    renderGlossaryList();
  }

  function closeGlossary() {
    var overlay = document.getElementById('v1x1GlossaryOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  function renderGlossaryList(filter) {
    var container = document.getElementById('v1x1GlossaryList');
    if (!container || !moduleData) return;

    var terms = moduleData.glossary || [];
    if (filter) {
      var f = filter.toLowerCase();
      terms = terms.filter(function(t) {
        return t.term.toLowerCase().indexOf(f) !== -1 || t.definition.toLowerCase().indexOf(f) !== -1;
      });
    }

    var html = '';
    terms.forEach(function(t) {
      html += '<div class="v1x1-glossary-entry">';
      html += '<div class="v1x1-glossary-term">' + escapeHtml(t.term) + '</div>';
      html += '<div class="v1x1-glossary-definition">' + escapeHtml(t.definition) + '</div>';
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

    // Clear sidebar active
    var sidebarItems = document.querySelectorAll('.v1x1-sidebar-item');
    sidebarItems.forEach(function(item) { item.classList.remove('active'); });
  }

  async function initModule() {
    if (moduleLoaded && moduleData) {
      showOverview();
      updateProgressUI();
      return;
    }

    try {
      var response = await fetch('data/versicherungs-1x1/chapters.json');
      if (!response.ok) throw new Error('Failed to load data');
      moduleData = await response.json();
      moduleLoaded = true;
      console.log('Versicherungs-1×1: Data loaded', moduleData.chapters.length, 'chapters');

      renderSidebar();
      renderChapterGrid();
      renderWelcomeCountUp();
      updateProgressUI();
      initSearch();
      initGlossarySearch();
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
  // GLOBAL API
  // ========================================

  window.V1x1 = {
    init: initModule,
    openChapter: openChapter,
    showOverview: showOverview,
    toggleLevel2: toggleLevel2,
    toggleLevel3: toggleLevel3,
    toggleSidebar: toggleSidebar,
    showGlossary: showGlossary,
    closeGlossary: closeGlossary,
    answerQuiz: answerQuiz,
    nextQuizQuestion: nextQuizQuestion,
    restartQuiz: restartQuiz,
    updateCalc: updateCalc
  };

})();
