/**
 * main.esm.js - ES6 Module Entry Point
 *
 * This is the main entry point for ES6 modules.
 * It imports all modules and initializes them.
 *
 * Usage in HTML:
 * <script type="module" src="js/modules/main.esm.js"></script>
 */

// Import all modules in correct order
import './config.esm.js';
import './state.esm.js';
import './utils.esm.js';
import './data-functions.esm.js';
import './charts.esm.js';
import './tables.esm.js';

// Log successful load
console.log('═══════════════════════════════════════════');
console.log('  ES6 Modules loaded successfully!');
console.log('═══════════════════════════════════════════');
console.log('  Modules:');
console.log('  ✓ config.esm.js         - KPI definitions, factors');
console.log('  ✓ state.esm.js          - Application state');
console.log('  ✓ utils.esm.js          - Utility functions');
console.log('  ✓ data-functions.esm.js - Data access');
console.log('  ✓ charts.esm.js         - Chart rendering');
console.log('  ✓ tables.esm.js         - Table rendering');
console.log('═══════════════════════════════════════════');

// Verify bridge is working
if (typeof window !== 'undefined') {
    const checks = [
        ['kpiDefinitions', window.kpiDefinitions],
        ['state', window.state],
        ['formatValue', window.formatValue],
        ['getFilteredData', window.getFilteredData],
        ['createChart', window.createChart],
        ['renderTable', window.renderTable]
    ];

    let allOk = true;
    checks.forEach(([name, value]) => {
        if (!value) {
            console.error(`[ESM] Bridge failed: ${name} is undefined`);
            allOk = false;
        }
    });

    if (allOk) {
        console.log('[ESM] Bridge verification: All globals available ✓');
    }
}

// Export a flag to indicate ES6 modules are loaded
export const ES6_MODULES_LOADED = true;

// Make it available globally
if (typeof window !== 'undefined') {
    window.ES6_MODULES_LOADED = true;
}
