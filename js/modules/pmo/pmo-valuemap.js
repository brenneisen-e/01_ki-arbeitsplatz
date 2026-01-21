/**
 * PMO Value Map Overlay Module
 * 
 * This module handles the Value Map overlay functionality including
 * toggling visibility and generating the overlay content with KPI clusters.
 * 
 * @module pmo-valuemap
 */

// ============================================
// VALUE MAP OVERLAY FUNCTIONS
// ============================================

PMO.toggleValueMapOverlay = function() {
    const overlay = document.getElementById('valuemap-overlay');
    if (!overlay) {
        console.error('Value Map Overlay not found');
        return;
    }

    const isHidden = overlay.classList.contains('hidden');

    if (isHidden) {
        const overlayBody = document.getElementById('valuemap-overlay-body');
        if (overlayBody) {
            overlayBody.innerHTML = PMO.generateValueMapOverlayContent();
        }
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

PMO.generateValueMapOverlayContent = function() {
    const clusters = [
        { number: 1, title: 'Kundenzufriedenheit & Beratungsqualität', color: '#3b82f6',
          kpis: [{ name: 'Kunden-NPS', value: '+42', status: 'positive' }, { name: 'Beratungsqualität', value: '87%', status: 'positive' }] },
        { number: 2, title: 'Zufriedenheit & Bindung der VP', color: '#8b5cf6',
          kpis: [{ name: 'VP-Zufriedenheit', value: '+28', status: 'warning' }, { name: 'VP-Abgangsquote', value: '8.2%', status: 'positive' }, { name: 'EoDB Score', value: '72%', status: 'warning' }] },
        { number: 3, title: 'Bestandskundenentwicklung', color: '#10b981',
          kpis: [{ name: 'Vertragsdichte', value: '2.1', status: 'warning' }, { name: 'Cross-Sell-Quote', value: '24%', status: 'positive' }] },
        { number: 4, title: 'Effizienz & AI-Nutzung', color: '#f59e0b',
          kpis: [{ name: 'AI-Nutzungsquote', value: '48%', status: 'positive' }, { name: 'Conversion Rate', value: '18%', status: 'warning' }] },
        { number: 5, title: 'Neue VP gewinnen & entwickeln', color: '#ef4444',
          kpis: [{ name: 'Rekrutierungsquote', value: '112', status: 'positive' }, { name: 'Time-to-Productivity', value: '8.5 Mo.', status: 'warning' }] }
    ];

    let html = `
        <div class="pmo-overlay-northstar">
            <div class="pmo-overlay-northstar-header">
                <span class="pmo-overlay-northstar-title">APE-Produktivität je Vertriebspartner</span>
                <span class="pmo-overlay-northstar-badge">NORTH STAR</span>
            </div>
            <div class="pmo-overlay-northstar-value">€42k</div>
            <div class="pmo-overlay-northstar-target">Ziel: €50k · +8% vs. Vorjahr</div>
        </div>
    `;

    clusters.forEach(cluster => {
        html += `
            <div class="pmo-overlay-cluster">
                <div class="pmo-overlay-cluster-header">
                    <span class="pmo-overlay-cluster-number" style="background: ${cluster.color}">${cluster.number}</span>
                    <span class="pmo-overlay-cluster-title">${cluster.title}</span>
                </div>
                <div class="pmo-overlay-cluster-kpis">
                    ${cluster.kpis.map(kpi => `
                        <div class="pmo-overlay-kpi-item">
                            <span class="pmo-overlay-kpi-name">${kpi.name}</span>
                            <span class="pmo-overlay-kpi-value ${kpi.status}">${kpi.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    return html;
};

// Event listeners for overlay
document.addEventListener('click', function(e) {
    const overlay = document.getElementById('valuemap-overlay');
    if (overlay && !overlay.classList.contains('hidden') && e.target === overlay) {
        PMO.toggleValueMapOverlay();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('valuemap-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            PMO.toggleValueMapOverlay();
        }
    }
});
