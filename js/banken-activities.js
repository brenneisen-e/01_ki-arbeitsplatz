// ========================================
// CUSTOMER ACTIVITIES & NOTES SYSTEM
// ========================================

// Get current customer ID from modal
let currentCustomerId = null;

// Get customer activities from localStorage
function getCustomerActivities(customerId) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    return activities[customerId] || [];
}

// Save customer activity to localStorage
function saveCustomerActivity(customerId, activity) {
    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    if (!activities[customerId]) {
        activities[customerId] = [];
    }
    activities[customerId].unshift(activity);
    localStorage.setItem('customerActivities', JSON.stringify(activities));
    return activity;
}

// Get customer notes from localStorage
function getCustomerNotes(customerId) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') || '{}');
    return notes[customerId] || [];
}

// Save customer note to localStorage
function saveCustomerNote(customerId, note) {
    const notes = JSON.parse(localStorage.getItem('customerNotes') || '{}');
    if (!notes[customerId]) {
        notes[customerId] = [];
    }
    notes[customerId].unshift(note);
    localStorage.setItem('customerNotes', JSON.stringify(notes));
    return note;
}

// Get customer Stammdaten modifications from localStorage
function getCustomerStammdaten(customerId) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') || '{}');
    return stammdaten[customerId] || {};
}

// Save customer Stammdaten to localStorage
function saveCustomerStammdaten(customerId, field, value) {
    const stammdaten = JSON.parse(localStorage.getItem('customerStammdaten') || '{}');
    if (!stammdaten[customerId]) {
        stammdaten[customerId] = {};
    }
    stammdaten[customerId][field] = value;
    localStorage.setItem('customerStammdaten', JSON.stringify(stammdaten));
}

// ========================================
// NEW: Workflow Actions
// ========================================

// Add Note - Opens activity creation modal
function addNote() {
    openActivityModal('notiz');
}

// Open activity modal with type preselected
function openActivityModal(type = 'notiz') {
    let modal = document.getElementById('activityModal');
    if (!modal) {
        // Create modal dynamically if not present
        modal = document.createElement('div');
        modal.id = 'activityModal';
        modal.className = 'activity-modal';
        modal.innerHTML = `
            <div class="activity-modal-content">
                <div class="activity-modal-header">
                    <h3>Aktivität hinzufügen</h3>
                    <button class="activity-modal-close" onclick="closeActivityModal()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="activity-modal-body">
                    <div class="activity-form-group">
                        <label>Typ</label>
                        <select id="activityType">
                            <option value="notiz">Notiz</option>
                            <option value="anruf">Telefonat</option>
                            <option value="email">E-Mail</option>
                            <option value="brief">Brief</option>
                            <option value="termin">Termin</option>
                            <option value="aufgabe">Aufgabe erledigt</option>
                        </select>
                    </div>
                    <div class="activity-form-group">
                        <label>Beschreibung</label>
                        <textarea id="activityText" placeholder="Beschreiben Sie die Aktivität..."></textarea>
                    </div>
                </div>
                <div class="activity-modal-footer">
                    <button class="activity-cancel-btn" onclick="closeActivityModal()">Abbrechen</button>
                    <button class="activity-submit-btn" onclick="submitActivity()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Speichern
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        addActivityModalStyles();
    }

    modal.style.display = 'flex';
    document.getElementById('activityType').value = type;
    document.getElementById('activityText').value = '';
    setTimeout(() => document.getElementById('activityText').focus(), 100);
}

// Add CSS styles for activity modal
function addActivityModalStyles() {
    if (document.getElementById('activity-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'activity-modal-styles';
    styles.textContent = `
        .activity-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        }
        .activity-modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .activity-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #e2e8f0;
        }
        .activity-modal-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .activity-modal-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #64748b;
        }
        .activity-modal-close:hover { color: #1e293b; }
        .activity-modal-body {
            padding: 20px;
        }
        .activity-form-group {
            margin-bottom: 16px;
        }
        .activity-form-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        .activity-form-group select,
        .activity-form-group textarea {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
        }
        .activity-form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .activity-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding: 16px 20px;
            border-top: 1px solid #e2e8f0;
        }
        .activity-cancel-btn {
            padding: 10px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
        }
        .activity-submit-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #3b82f6;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
        }
        .activity-submit-btn:hover { background: #2563eb; }
        .btn-delete-activity {
            background: none;
            border: none;
            cursor: pointer;
            color: #94a3b8;
            padding: 4px;
            margin-left: 8px;
        }
        .btn-delete-activity:hover { color: #ef4444; }
        .komm-item.custom-activity {
            background: #f0f9ff;
            border-left: 3px solid #3b82f6;
        }
        .komm-item.custom-activity .komm-icon { color: #3b82f6; }
    `;
    document.head.appendChild(styles);
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Submit activity from modal
function submitActivity() {
    const type = document.getElementById('activityType').value;
    const text = document.getElementById('activityText').value.trim();

    if (!text) {
        showNotification('Bitte geben Sie einen Text ein', 'error');
        return;
    }

    const typeLabels = {
        'notiz': 'Notiz',
        'anruf': 'Telefonat',
        'email': 'E-Mail',
        'brief': 'Brief',
        'termin': 'Termin',
        'aufgabe': 'Aufgabe erledigt'
    };

    const activity = {
        id: Date.now().toString(),
        type: type,
        typeLabel: typeLabels[type] || type,
        text: text,
        author: localStorage.getItem('feedbackAuthor') || 'Eike',
        timestamp: new Date().toISOString()
    };

    if (currentCustomerId) {
        saveCustomerActivity(currentCustomerId, activity);
        renderCustomerActivities(currentCustomerId);
    }

    closeActivityModal();
    showNotification(`${typeLabels[type]} hinzugefügt`, 'success');
}

// Render customer activities in the Kommunikation timeline
function renderCustomerActivities(customerId) {
    const timeline = document.querySelector('#tab-kommunikation .kommunikation-timeline');
    if (!timeline) return;

    // Remove previously added custom activities
    timeline.querySelectorAll('.komm-item.custom-activity').forEach(el => el.remove());

    const activities = getCustomerActivities(customerId);
    const h4 = timeline.querySelector('h4');

    activities.forEach(activity => {
        const item = createActivityElement(activity);
        if (h4 && h4.nextSibling) {
            timeline.insertBefore(item, h4.nextSibling);
        } else {
            timeline.appendChild(item);
        }
    });
}

// Create activity DOM element
function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = `komm-item ${activity.type} custom-activity`;
    div.dataset.activityId = activity.id;

    const iconMap = {
        'notiz': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
        'anruf': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
        'email': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'brief': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
        'termin': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
        'aufgabe': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    };

    const date = new Date(activity.timestamp);
    const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <div class="komm-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                ${iconMap[activity.type] || iconMap['notiz']}
            </svg>
        </div>
        <div class="komm-content">
            <div class="komm-header">
                <span class="komm-type">${activity.typeLabel || activity.type}</span>
                <span class="komm-date">${dateStr}, ${timeStr}</span>
            </div>
            <div class="komm-body">
                <p>${activity.text}</p>
            </div>
            <div class="komm-meta">
                <span class="meta-item">Bearbeiter: ${activity.author}</span>
                <button class="btn-delete-activity" onclick="deleteActivity('${activity.id}')" title="Löschen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return div;
}

// Delete activity
function deleteActivity(activityId) {
    if (!confirm('Aktivität wirklich löschen?')) return;

    const activities = JSON.parse(localStorage.getItem('customerActivities') || '{}');
    if (activities[currentCustomerId]) {
        activities[currentCustomerId] = activities[currentCustomerId].filter(a => a.id !== activityId);
        localStorage.setItem('customerActivities', JSON.stringify(activities));
        renderCustomerActivities(currentCustomerId);
        showNotification('Aktivität gelöscht', 'success');
    }
}

// Write Off Case (from modal)
function writeOffCase() {
    showNotification('Fall zur Abschreibung vorgemerkt', 'warning');
    closeCustomerDetail();
}

// Show notification helper
function showNotification(message, type = 'info') {
    // Check if there's already a notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 80px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    const colors = {
        'info': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
        'success': { bg: '#dcfce7', color: '#166534', border: '#86efac' },
        'warning': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
        'error': { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
    };
    const style = colors[type] || colors.info;

    notification.style.cssText = `
        padding: 12px 20px;
        background: ${style.bg};
        color: ${style.color};
        border: 1px solid ${style.border};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show new cases panel
function showNewCases() {
    // Scroll to and highlight the updates panel
    const updatesPanel = document.querySelector('.updates-panel');
    if (updatesPanel) {
        updatesPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        updatesPanel.classList.add('highlight-pulse');
        setTimeout(() => updatesPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('47 neue Fälle seit letztem Login', 'info');
}

// Show payments panel
function showPayments() {
    // Scroll to and highlight the payments panel
    const paymentsPanel = document.querySelector('.payments-panel');
    if (paymentsPanel) {
        paymentsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        paymentsPanel.classList.add('highlight-pulse');
        setTimeout(() => paymentsPanel.classList.remove('highlight-pulse'), 2000);
    }
    showNotification('31 Zahlungseingänge heute erfasst', 'success');
}

// Show promises panel
function showPromises() {
    showNotification('18 aktive Zahlungszusagen', 'info');
}

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes highlightPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3); }
    }
    .highlight-pulse {
        animation: highlightPulse 0.5s ease-in-out 3;
    }
`;
document.head.appendChild(animationStyles);

// Exports
window.openActivityModal = openActivityModal;
window.closeActivityModal = closeActivityModal;
window.submitActivity = submitActivity;
window.deleteActivity = deleteActivity;
window.renderCustomerActivities = renderCustomerActivities;
window.getCustomerActivities = getCustomerActivities;
window.saveCustomerActivity = saveCustomerActivity;
window.addNote = addNote;
window.writeOffCase = writeOffCase;
window.showNotification = showNotification;
window.showNewCases = showNewCases;
window.showPayments = showPayments;
window.showPromises = showPromises;
