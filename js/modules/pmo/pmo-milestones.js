/**
 * PMO Milestone Modal Module
 * 
 * This module handles all milestone-related functionality including
 * opening/closing the milestone modal, confirming, delaying, reopening,
 * and saving milestones.
 * 
 * @module pmo-milestones
 */

// ============================================
// MILESTONE EDITING
// ============================================

PMO.currentMilestone = null;

PMO.openMilestoneModal = function(milestoneId) {
    // Parse the milestoneId (format: workstreamId_MilestoneName)
    const parts = milestoneId.split('_');
    const workstreamId = parts[0]; // e.g., "A1"
    const milestoneName = parts.slice(1).join(' ').replace(/_/g, ' '); // Reconstruct name with spaces

    // Find the milestone in the data
    let milestone = null;
    for (const status of this.statusData) {
        const found = status.milestones.find(m =>
            status.workstreamId === workstreamId && m.name === milestoneName
        );
        if (found) {
            milestone = {
                ...found,
                projectId: status.projectId,
                workstreamId: status.workstreamId,
                id: milestoneId
            };
            break;
        }
    }

    if (!milestone) {
        console.error('Milestone not found:', milestoneId, 'workstream:', workstreamId, 'name:', milestoneName);
        return;
    }

    this.currentMilestone = milestone;

    // Populate form
    document.getElementById('milestone-name').value = milestone.name;
    document.getElementById('milestone-project').value = `${milestone.projectId} / ${milestone.workstreamId}`;
    document.getElementById('milestone-planned-date').value = this.formatDateInput(milestone.plannedDate);
    document.getElementById('milestone-current-date').value = this.formatDateInput(milestone.currentEstimate || milestone.plannedDate);
    document.getElementById('milestone-status').value = milestone.status || 'Offen';
    document.getElementById('milestone-comment').value = '';

    // Show modal
    document.getElementById('pmo-milestone-modal').classList.add('active');
    console.log('Opened milestone modal for:', milestone.name);
};

PMO.closeMilestoneModal = function() {
    document.getElementById('pmo-milestone-modal').classList.remove('active');
    this.currentMilestone = null;
};

PMO.confirmMilestone = function() {
    if (!this.currentMilestone) return;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('milestone-current-date').value = today;
    document.getElementById('milestone-status').value = 'Geschlossen';
    
    const comment = document.getElementById('milestone-comment');
    if (!comment.value.trim()) {
        comment.value = 'Meilenstein erfolgreich abgeschlossen und bestätigt.';
    }
    
    console.log('Milestone confirmed:', this.currentMilestone.name);
};

PMO.delayMilestone = function() {
    if (!this.currentMilestone) return;
    
    const currentDate = document.getElementById('milestone-current-date').value;
    const plannedDate = document.getElementById('milestone-planned-date').value;
    
    if (currentDate === plannedDate) {
        // Add 14 days to current date
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 14);
        document.getElementById('milestone-current-date').value = newDate.toISOString().split('T')[0];
    }
    
    document.getElementById('milestone-status').value = 'Verzögert';
    
    const comment = document.getElementById('milestone-comment');
    if (!comment.value.trim()) {
        comment.focus();
        alert('Bitte geben Sie eine Begründung für die Verschiebung ein.');
    }
    
    console.log('Milestone delayed:', this.currentMilestone.name);
};

PMO.reopenMilestone = function() {
    if (!this.currentMilestone) return;
    
    document.getElementById('milestone-status').value = 'Im Plan';
    document.getElementById('milestone-comment').value = 'Meilenstein wurde wieder geöffnet.';
    
    console.log('Milestone reopened:', this.currentMilestone.name);
};

PMO.saveMilestone = function() {
    if (!this.currentMilestone) return;
    
    const newDate = document.getElementById('milestone-current-date').value;
    const newStatus = document.getElementById('milestone-status').value;
    const comment = document.getElementById('milestone-comment').value.trim();
    
    if (!comment && newStatus !== 'Im Plan') {
        alert('Bitte geben Sie einen Kommentar ein.');
        document.getElementById('milestone-comment').focus();
        return;
    }
    
    // Update the milestone in the data
    for (const status of this.statusData) {
        const milestone = status.milestones.find(m => m.id === this.currentMilestone.id);
        if (milestone) {
            milestone.actual = newDate;
            milestone.status = newStatus;
            milestone.comment = comment;
            milestone.lastModified = new Date().toISOString();
            break;
        }
    }
    
    console.log('Milestone saved:', {
        name: this.currentMilestone.name,
        newDate,
        newStatus,
        comment
    });
    
    // Refresh the milestones display
    this.renderMyMilestones();
    
    // Close modal
    this.closeMilestoneModal();
    
    // Show success message
    alert('Meilenstein erfolgreich aktualisiert!');
};

PMO.formatDateInput = function(dateString) {
    if (!dateString) return '';
    // Convert DD.MM.YYYY to YYYY-MM-DD
    const parts = dateString.split('.');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

// ============================================
// MILESTONE CLICK HANDLER ENHANCEMENT
// ============================================

// Make milestones clickable when rendered
const originalRenderMyMilestones = PMO.renderMyMilestones;
PMO.renderMyMilestones = function() {
    originalRenderMyMilestones.call(this);
    
    // Add click handlers to milestone items
    document.querySelectorAll('.pmo-milestone-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            // Get milestone ID from data attribute or find it by name
            const milestoneNameEl = item.querySelector('.pmo-milestone-info h5');
            if (milestoneNameEl) {
                const milestoneName = milestoneNameEl.textContent;
                // Find milestone by name
                for (const status of this.statusData) {
                    const milestone = status.milestones.find(m => m.name === milestoneName);
                    if (milestone) {
                        this.openMilestoneModal(milestone.id);
                        break;
                    }
                }
            }
        });
    });
};
