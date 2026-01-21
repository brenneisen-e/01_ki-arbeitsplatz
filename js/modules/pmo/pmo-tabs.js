/**
 * PMO Workstream Tabs Module
 * 
 * This module handles tab switching functionality for the PMO dashboard,
 * including both main dashboard tabs and project modal tabs.
 * 
 * @module pmo-tabs
 */

// ============================================
// WORKSTREAM TABS
// ============================================

PMO.switchMyTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.pmo-my-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.pmo-my-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetContent = document.getElementById(`tab-content-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    console.log('Switched to tab:', tabName);
};

PMO.switchProjectTab = function(tabName) {
    // Update tab buttons in project modal
    const modal = document.getElementById('pmo-project-modal');
    if (!modal) return;

    modal.querySelectorAll('.pmo-my-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update tab content in project modal
    modal.querySelectorAll('.pmo-my-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const targetContent = modal.querySelector(`#tab-content-${tabName}`);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    console.log('Switched to project tab:', tabName);
};
