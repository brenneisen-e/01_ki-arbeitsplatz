/**
 * PMO Toolbox JavaScript Modules Index
 *
 * This file imports all modular JavaScript components.
 * These modules extend the PMO object with additional functionality.
 *
 * Usage:
 * 1. Load the main pmo-toolbox.esm.js first
 * 2. Then load this index or individual modules as needed
 *
 * Modules:
 * - pmo-valuemap.js: Value Map cluster overlay functionality
 * - pmo-tabs.js: Tab switching for dashboard and modals
 * - pmo-milestones.js: Milestone modal management
 */

// Import order matters - core functionality first, then features

// Value Map overlay for strategic KPIs
import './pmo-valuemap.js';

// Tab switching functionality
import './pmo-tabs.js';

// Milestone modal management
import './pmo-milestones.js';

console.log('[PMO Modules] All modules loaded');
