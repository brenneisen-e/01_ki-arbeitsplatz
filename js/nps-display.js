// js/nps-display.js - NPS Stars Display + Hover Popup
// Extracted from landing.js for modularity

// NPS STARS DISPLAY (5er Skala)
// ========================================
function renderNpsStars(score, cssClass) {
    var stars5 = (score / 10) * 5;
    var display = Math.round(stars5 * 10) / 10;
    var full = Math.floor(stars5);
    var half = (stars5 - full) >= 0.25 ? 1 : 0;
    var empty = 5 - full - half;
    var cls = cssClass || 'nps-stars';
    var html = '<span class="' + cls + '">';
    for (var i = 0; i < full; i++) html += '<span class="nps-star filled">\u2605</span>';
    for (var i = 0; i < half; i++) html += '<span class="nps-star half">\u2605</span>';
    for (var i = 0; i < empty; i++) html += '<span class="nps-star empty">\u2605</span>';
    html += '<span class="nps-score-num">' + display.toFixed(1) + '</span></span>';
    return html;
}

function renderNpsStyleAll() {
    var rows = document.querySelectorAll('#kundenlisteTableBody tr');
    rows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            var npsCell = cells[6];
            var score = npsCell.getAttribute('data-nps');
            if (!score) {
                var badge = npsCell.querySelector('.nps-badge');
                if (badge) {
                    score = parseInt(badge.textContent);
                    npsCell.setAttribute('data-nps', score);
                }
            }
            if (score) {
                npsCell.innerHTML = renderNpsStars(parseInt(score));
            }
        }
    });
}
window.renderNpsStyleAll = renderNpsStyleAll;
window.__registerModule('nps-display.js');
