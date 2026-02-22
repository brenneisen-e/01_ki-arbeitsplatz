// js/screenshot.js - Screenshot-Funktion mit Page-ID im Dateinamen
// ================================================================

var screenshotTool = {
    // Screenshot erstellen und herunterladen
    take: function() {
        var btn = document.getElementById('screenshotBtn');
        if (!btn) return;

        // Visuelles Feedback: Button kurz animieren
        btn.classList.add('taking');

        // html2canvas muss geladen sein
        if (typeof html2canvas !== 'function') {
            console.warn('html2canvas nicht geladen');
            btn.classList.remove('taking');
            return;
        }

        // Screenshot-Button und Page-ID während Capture ausblenden
        var pageIdEl = document.getElementById('pageIdDisplay');
        var recBtn = document.getElementById('screenRecordBtn');
        if (btn) btn.style.visibility = 'hidden';
        if (pageIdEl) pageIdEl.style.visibility = 'hidden';
        if (recBtn) recBtn.style.visibility = 'hidden';

        html2canvas(document.body, {
            useCORS: true,
            allowTaint: true,
            scale: window.devicePixelRatio || 2,
            logging: false
        }).then(function(canvas) {
            // Elemente wieder einblenden
            if (btn) btn.style.visibility = '';
            if (pageIdEl) pageIdEl.style.visibility = '';
            if (recBtn) recBtn.style.visibility = '';
            btn.classList.remove('taking');

            // Dateiname: PageID + Timestamp
            var pageId = (window.PageIDTracker && window.PageIDTracker.currentPageId) || 'unknown';
            var now = new Date();
            var ts = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + '_' +
                String(now.getHours()).padStart(2, '0') + '-' +
                String(now.getMinutes()).padStart(2, '0') + '-' +
                String(now.getSeconds()).padStart(2, '0');
            var filename = 'KI-Arbeitsplatz_' + pageId + '_' + ts + '.png';

            // Download
            var link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Flash-Effekt
            screenshotTool._flashEffect();
        }).catch(function(err) {
            console.error('Screenshot fehlgeschlagen:', err);
            if (btn) btn.style.visibility = '';
            if (pageIdEl) pageIdEl.style.visibility = '';
            if (recBtn) recBtn.style.visibility = '';
            btn.classList.remove('taking');
        });
    },

    // Kamera-Flash-Effekt
    _flashEffect: function() {
        var flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;opacity:0.6;z-index:999999;pointer-events:none;transition:opacity 0.3s ease-out;';
        document.body.appendChild(flash);
        requestAnimationFrame(function() {
            flash.style.opacity = '0';
        });
        setTimeout(function() {
            if (flash.parentNode) flash.parentNode.removeChild(flash);
        }, 400);
    }
};

// Globale Funktion für onclick
function takeScreenshot() {
    screenshotTool.take();
}
window.takeScreenshot = takeScreenshot;

// Settings-Toggle: Button ein-/ausblenden + localStorage
function toggleScreenshotVisibility() {
    var cb = document.getElementById('screenshotToggle');
    var btn = document.getElementById('screenshotBtn');
    if (!btn) return;
    var visible = cb && cb.checked;
    btn.style.display = visible ? '' : 'none';
    localStorage.setItem('screenshotEnabled', visible ? '1' : '0');
}
window.toggleScreenshotVisibility = toggleScreenshotVisibility;

// Beim Laden: gespeicherten Zustand wiederherstellen
document.addEventListener('DOMContentLoaded', function() {
    var enabled = localStorage.getItem('screenshotEnabled') === '1';
    var cb = document.getElementById('screenshotToggle');
    var btn = document.getElementById('screenshotBtn');
    if (cb) cb.checked = enabled;
    if (btn) btn.style.display = enabled ? '' : 'none';
});
