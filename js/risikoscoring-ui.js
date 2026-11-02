(function(){var r=['risikoScoringData'];var m=r.filter(function(f){return typeof window[f]==='undefined'});if(m.length)console.debug('[risikoscoring-ui.js] Fehlende Deps:',m.join(', '),'← Lade risikoscoring-data.js zuerst!');})();
        // Load vermittler profile
        function loadVermittlerProfile() {
            const selectedProfile = document.getElementById('vermittlerSelect').value;
            
            const profiles = {
                'a-ao': {
                    typ: 'ao',
                    neugeschaeft: 1800000,
                    bestand: 7500000,
                    margen: 70,
                    crossSelling: 3.5,
                    schadenquote: 82,
                    grossschaden: 0.8,
                    underwriting: 96,
                    storno: 3,
                    dauer: 15,
                    ausschoepfung: 92,
                    nps: 85,
                    beratung: 95,
                    beschwerden: 0.5,
                    deckungsbeitrag: 350000,
                    kostenertrag: 45,
                    neuSchaden: 720000,
                    neuKranken: 540000,
                    neuLeben: 540000,
                    bestandSchaden: 3000000,
                    bestandKranken: 2250000,
                    bestandLeben: 2250000
                },
                'a-makler': {
                    typ: 'grossmakler',
                    neugeschaeft: 1600000,
                    bestand: 7000000,
                    margen: 65,
                    crossSelling: 3.2,
                    schadenquote: 100,
                    grossschaden: 1.0,
                    underwriting: 93,
                    storno: 4,
                    dauer: 14,
                    ausschoepfung: 88,
                    nps: 75,
                    beratung: 92,
                    beschwerden: 0.8,
                    deckungsbeitrag: 320000,
                    kostenertrag: 50,
                    neuSchaden: 640000,
                    neuKranken: 480000,
                    neuLeben: 480000,
                    bestandSchaden: 2800000,
                    bestandKranken: 2100000,
                    bestandLeben: 2100000
                },
                'b-ao': {
                    typ: 'ao',
                    neugeschaeft: 600000,
                    bestand: 3000000,
                    margen: 40,
                    crossSelling: 2.0,
                    schadenquote: 88,
                    grossschaden: 2.0,
                    underwriting: 88,
                    storno: 10,
                    dauer: 8,
                    ausschoepfung: 70,
                    nps: 50,
                    beratung: 80,
                    beschwerden: 2.5,
                    deckungsbeitrag: 100000,
                    kostenertrag: 65,
                    neuSchaden: 240000,
                    neuKranken: 180000,
                    neuLeben: 180000,
                    bestandSchaden: 1200000,
                    bestandKranken: 900000,
                    bestandLeben: 900000
                },
                'b-makler': {
                    typ: 'grossmakler',
                    neugeschaeft: 500000,
                    bestand: 2500000,
                    margen: 35,
                    crossSelling: 1.8,
                    schadenquote: 105,
                    grossschaden: 2.5,
                    underwriting: 85,
                    storno: 12,
                    dauer: 7.5,
                    ausschoepfung: 65,
                    nps: 40,
                    beratung: 75,
                    beschwerden: 3,
                    deckungsbeitrag: 85000,
                    kostenertrag: 68,
                    neuSchaden: 200000,
                    neuKranken: 150000,
                    neuLeben: 150000,
                    bestandSchaden: 1000000,
                    bestandKranken: 750000,
                    bestandLeben: 750000
                },
                'c-makler': {
                    typ: 'kleinmakler',
                    neugeschaeft: 250000,
                    bestand: 1200000,
                    margen: 20,
                    crossSelling: 1.4,
                    schadenquote: 115,
                    grossschaden: 4,
                    underwriting: 72,
                    storno: 20,
                    dauer: 5,
                    ausschoepfung: 45,
                    nps: 10,
                    beratung: 60,
                    beschwerden: 6,
                    deckungsbeitrag: 35000,
                    kostenertrag: 85,
                    neuSchaden: 100000,
                    neuKranken: 75000,
                    neuLeben: 75000,
                    bestandSchaden: 480000,
                    bestandKranken: 360000,
                    bestandLeben: 360000
                },
                'd-autohaus': {
                    typ: 'autohaus',
                    neugeschaeft: 150000,
                    bestand: 800000,
                    margen: 10,
                    crossSelling: 1.1,
                    schadenquote: 130,
                    grossschaden: 7,
                    underwriting: 55,
                    storno: 30,
                    dauer: 3,
                    ausschoepfung: 25,
                    nps: -20,
                    beratung: 45,
                    beschwerden: 12,
                    deckungsbeitrag: 15000,
                    kostenertrag: 105,
                    neuSchaden: 60000,
                    neuKranken: 45000,
                    neuLeben: 45000,
                    bestandSchaden: 320000,
                    bestandKranken: 240000,
                    bestandLeben: 240000
                }
            };
            
            const profile = profiles[selectedProfile];
            if (!profile) return;
            
            // Set vermittler type display
            document.getElementById('vermittlerTypSelect').value = profile.typ;
            const typeDisplay = document.getElementById('vermittlerTypDisplay');
            const typeTexts = {
                'ao': 'Ausschließlichkeitsorganisation (AO)',
                'grossmakler': 'Großmakler',
                'kleinmakler': 'Kleinmakler',
                'autohaus': 'Autohaus'
            };
            typeDisplay.textContent = typeTexts[profile.typ] || profile.typ;
            
            // Set segment values FIRST
            document.getElementById('neuSchadenSlider').value = profile.neuSchaden;
            document.getElementById('neuKrankenSlider').value = profile.neuKranken;
            document.getElementById('neuLebenSlider').value = profile.neuLeben;
            document.getElementById('bestandSchadenSlider').value = profile.bestandSchaden;
            document.getElementById('bestandKrankenSlider').value = profile.bestandKranken;
            document.getElementById('bestandLebenSlider').value = profile.bestandLeben;
            
            // Update segment display values
            document.getElementById('neuSchadenValue').textContent = formatCurrency(profile.neuSchaden);
            document.getElementById('neuKrankenValue').textContent = formatCurrency(profile.neuKranken);
            document.getElementById('neuLebenValue').textContent = formatCurrency(profile.neuLeben);
            document.getElementById('bestandSchadenValue').textContent = formatCurrency(profile.bestandSchaden);
            document.getElementById('bestandKrankenValue').textContent = formatCurrency(profile.bestandKranken);
            document.getElementById('bestandLebenValue').textContent = formatCurrency(profile.bestandLeben);
            
            // Update products proportionally
            updateProductsProportionally('neuSchaden', profile.neuSchaden);
            updateProductsProportionally('neuKranken', profile.neuKranken);
            updateProductsProportionally('neuLeben', profile.neuLeben);
            updateProductsProportionally('bestandSchaden', profile.bestandSchaden);
            updateProductsProportionally('bestandKranken', profile.bestandKranken);
            updateProductsProportionally('bestandLeben', profile.bestandLeben);
            
            // Set main values (without triggering proportional distribution)
            document.getElementById('neugeschaeftSlider').value = profile.neugeschaeft;
            document.getElementById('bestandSlider').value = profile.bestand;
            document.getElementById('neugeschaeftValue').textContent = formatCurrency(profile.neugeschaeft);
            document.getElementById('bestandValue').textContent = formatCurrency(profile.bestand);
            
            // Set all other values
            document.getElementById('margenSlider').value = profile.margen;
            document.getElementById('crossSellingSlider').value = profile.crossSelling;
            document.getElementById('schadenquoteSlider').value = profile.schadenquote;
            document.getElementById('grossschadenSlider').value = profile.grossschaden;
            document.getElementById('underwritingSlider').value = profile.underwriting;
            document.getElementById('stornoSlider').value = profile.storno;
            document.getElementById('dauerSlider').value = profile.dauer;
            document.getElementById('ausschoepfungSlider').value = profile.ausschoepfung;
            document.getElementById('npsSlider').value = profile.nps;
            document.getElementById('beratungSlider').value = profile.beratung;
            document.getElementById('beschwerdenSlider').value = profile.beschwerden;
            document.getElementById('deckungsbeitragSlider').value = profile.deckungsbeitrag;
            document.getElementById('kostenertragSlider').value = profile.kostenertrag;
            
            // Update all displays
            updateScoring();
        }
        
        // Tab Switching (renamed for VST integration)
        function switchRsTab(event, tabName) {
            document.querySelectorAll('.rs-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.rs-tab-content').forEach(content => content.classList.remove('active'));

            event.target.classList.add('active');
            document.getElementById('rs-' + tabName).classList.add('active');

            // Initialize enterprise view if switching to it
            if (tabName === 'unternehmen') {
                if (!distributionData || !distributionData.alle) {
                    initializeDistributionData();
                }
                drawDistributionChart();
                updateStatisticsTable();
                updateKPIs();

                // Setup interaction only once
                const canvas = document.getElementById('distributionChart');
                if (canvas && !canvas.interactionSetup) {
                    setupChartInteraction();
                    canvas.interactionSetup = true;
                }
            }
        }

        // Legacy alias for compatibility
        window.switchTab = switchRsTab;
        
        // Update main slider and distribute proportionally
        function updateMainSlider(type, userTriggered = false) {
            const newTotal = parseFloat(document.getElementById(type + 'Slider').value);
            
            // Update display value
            document.getElementById(type + 'Value').textContent = formatCurrency(newTotal);
            
            // Only redistribute segments if user manually changed the slider
            if (!userTriggered) {
                updateScoring();
                return;
            }
            
            if (type === 'neugeschaeft') {
                // Get current segment values
                const schaden = parseFloat(document.getElementById('neuSchadenSlider').value) || 0;
                const kranken = parseFloat(document.getElementById('neuKrankenSlider').value) || 0;
                const leben = parseFloat(document.getElementById('neuLebenSlider').value) || 0;
                const currentTotal = schaden + kranken + leben;
                
                if (currentTotal > 0) {
                    // Calculate proportions
                    const schadenRatio = schaden / currentTotal;
                    const krankenRatio = kranken / currentTotal;
                    const lebenRatio = leben / currentTotal;
                    
                    // Apply new total proportionally
                    document.getElementById('neuSchadenSlider').value = Math.round(newTotal * schadenRatio);
                    document.getElementById('neuKrankenSlider').value = Math.round(newTotal * krankenRatio);
                    document.getElementById('neuLebenSlider').value = Math.round(newTotal * lebenRatio);
                    
                    // Update segment display values
                    document.getElementById('neuSchadenValue').textContent = formatCurrency(document.getElementById('neuSchadenSlider').value);
                    document.getElementById('neuKrankenValue').textContent = formatCurrency(document.getElementById('neuKrankenSlider').value);
                    document.getElementById('neuLebenValue').textContent = formatCurrency(document.getElementById('neuLebenSlider').value);
                    
                    // Update products proportionally
                    updateProductsProportionally('neuSchaden', document.getElementById('neuSchadenSlider').value);
                    updateProductsProportionally('neuKranken', document.getElementById('neuKrankenSlider').value);
                    updateProductsProportionally('neuLeben', document.getElementById('neuLebenSlider').value);
                } else {
                    // Default distribution if no current values
                    document.getElementById('neuSchadenSlider').value = Math.round(newTotal * 0.4);
                    document.getElementById('neuKrankenSlider').value = Math.round(newTotal * 0.3);
                    document.getElementById('neuLebenSlider').value = Math.round(newTotal * 0.3);
                }
            } else if (type === 'bestand') {
                // Get current segment values
                const schaden = parseFloat(document.getElementById('bestandSchadenSlider').value) || 0;
                const kranken = parseFloat(document.getElementById('bestandKrankenSlider').value) || 0;
                const leben = parseFloat(document.getElementById('bestandLebenSlider').value) || 0;
                const currentTotal = schaden + kranken + leben;
                
                if (currentTotal > 0) {
                    // Calculate proportions
                    const schadenRatio = schaden / currentTotal;
                    const krankenRatio = kranken / currentTotal;
                    const lebenRatio = leben / currentTotal;
                    
                    // Apply new total proportionally
                    document.getElementById('bestandSchadenSlider').value = Math.round(newTotal * schadenRatio);
                    document.getElementById('bestandKrankenSlider').value = Math.round(newTotal * krankenRatio);
                    document.getElementById('bestandLebenSlider').value = Math.round(newTotal * lebenRatio);
                    
                    // Update segment display values
                    document.getElementById('bestandSchadenValue').textContent = formatCurrency(document.getElementById('bestandSchadenSlider').value);
                    document.getElementById('bestandKrankenValue').textContent = formatCurrency(document.getElementById('bestandKrankenSlider').value);
                    document.getElementById('bestandLebenValue').textContent = formatCurrency(document.getElementById('bestandLebenSlider').value);
                    
                    // Update products proportionally
                    updateProductsProportionally('bestandSchaden', document.getElementById('bestandSchadenSlider').value);
                    updateProductsProportionally('bestandKranken', document.getElementById('bestandKrankenSlider').value);
                    updateProductsProportionally('bestandLeben', document.getElementById('bestandLebenSlider').value);
                } else {
                    // Default distribution if no current values
                    document.getElementById('bestandSchadenSlider').value = Math.round(newTotal * 0.4);
                    document.getElementById('bestandKrankenSlider').value = Math.round(newTotal * 0.3);
                    document.getElementById('bestandLebenSlider').value = Math.round(newTotal * 0.3);
                }
            }
            
            // Update scoring
            updateScoring();
        }
        
        // Toggle expandable content
        function toggleExpand(section) {
            const content = document.getElementById(section + 'Content');
            const arrow = event.target;
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                arrow.classList.remove('expanded');
            } else {
                content.classList.add('expanded');
                arrow.classList.add('expanded');
            }
        }
        
        // Toggle segment expansion
        function toggleSegment(segmentId) {
            const content = document.getElementById(segmentId + 'Content');
            const header = event.currentTarget;
            const arrow = header.querySelector('.expand-arrow');
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                arrow.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('expanded');
                arrow.style.transform = 'rotate(90deg)';
            }
        }
        
        // Format currency with proper negative handling
        function formatCurrency(value) {
            const absValue = Math.abs(value);
            let formatted = '';
            
            if (absValue >= 1000000000) {
                formatted = '€' + (absValue / 1000000000).toFixed(1) + 'B';
            } else if (absValue >= 1000000) {
                formatted = '€' + (absValue / 1000000).toFixed(0) + 'M';
            } else if (absValue >= 1000) {
                formatted = '€' + (absValue / 1000).toFixed(0) + 'k';
            } else {
                formatted = '€' + absValue.toFixed(0);
            }
            
            return value < 0 ? '-' + formatted : formatted;
        }
        
        // Update segment values
        function updateSegmentValues(type, fromProductUpdate = false) {
            if (type === 'neugeschaeft') {
                const schaden = parseFloat(document.getElementById('neuSchadenSlider').value);
                const kranken = parseFloat(document.getElementById('neuKrankenSlider').value);
                const leben = parseFloat(document.getElementById('neuLebenSlider').value);
                const total = schaden + kranken + leben;
                
                document.getElementById('neuSchadenValue').textContent = formatCurrency(schaden);
                document.getElementById('neuKrankenValue').textContent = formatCurrency(kranken);
                document.getElementById('neuLebenValue').textContent = formatCurrency(leben);
                document.getElementById('neugeschaeftSlider').value = total;
                document.getElementById('neugeschaeftValue').textContent = formatCurrency(total);
                
                // Update products proportionally if segment was changed directly
                if (!fromProductUpdate) {
                    updateProductsProportionally('neuSchaden', schaden);
                    updateProductsProportionally('neuKranken', kranken);
                    updateProductsProportionally('neuLeben', leben);
                }
            } else if (type === 'bestand') {
                const schaden = parseFloat(document.getElementById('bestandSchadenSlider').value);
                const kranken = parseFloat(document.getElementById('bestandKrankenSlider').value);
                const leben = parseFloat(document.getElementById('bestandLebenSlider').value);
                const total = schaden + kranken + leben;
                
                document.getElementById('bestandSchadenValue').textContent = formatCurrency(schaden);
                document.getElementById('bestandKrankenValue').textContent = formatCurrency(kranken);
                document.getElementById('bestandLebenValue').textContent = formatCurrency(leben);
                document.getElementById('bestandSlider').value = total;
                document.getElementById('bestandValue').textContent = formatCurrency(total);
                
                // Update products proportionally if segment was changed directly
                if (!fromProductUpdate) {
                    updateProductsProportionally('bestandSchaden', schaden);
                    updateProductsProportionally('bestandKranken', kranken);
                    updateProductsProportionally('bestandLeben', leben);
                }
            }
            
            updateScoring();
        }
        
        // Update products proportionally when segment value changes
        function updateProductsProportionally(segment, newTotal) {
            let products = [];
            
            // Define products for each segment
            if (segment === 'neuSchaden') {
                products = [
                    { slider: 'neuHaftpflichtSlider', value: 'neuHaftpflichtValue', ratio: 0.3 },
                    { slider: 'neuUnfallSlider', value: 'neuUnfallValue', ratio: 0.2 },
                    { slider: 'neuHausratSlider', value: 'neuHausratValue', ratio: 0.15 },
                    { slider: 'neuRechtsschutzSlider', value: 'neuRechtsschutzValue', ratio: 0.15 },
                    { slider: 'neuKfzSlider', value: 'neuKfzValue', ratio: 0.2 }
                ];
            } else if (segment === 'neuKranken') {
                products = [
                    { slider: 'neuVollSlider', value: 'neuVollValue', ratio: 0.533 },
                    { slider: 'neuZusatzSlider', value: 'neuZusatzValue', ratio: 0.333 },
                    { slider: 'neuPflegeSlider', value: 'neuPflegeValue', ratio: 0.134 }
                ];
            } else if (segment === 'neuLeben') {
                products = [
                    { slider: 'neuRisikoSlider', value: 'neuRisikoValue', ratio: 0.267 },
                    { slider: 'neuBuSlider', value: 'neuBuValue', ratio: 0.4 },
                    { slider: 'neuRenteSlider', value: 'neuRenteValue', ratio: 0.333 }
                ];
            } else if (segment === 'bestandSchaden') {
                products = [
                    { slider: 'bestandHaftpflichtSlider', value: 'bestandHaftpflichtValue', ratio: 0.3 },
                    { slider: 'bestandUnfallSlider', value: 'bestandUnfallValue', ratio: 0.2 },
                    { slider: 'bestandHausratSlider', value: 'bestandHausratValue', ratio: 0.15 },
                    { slider: 'bestandRechtsschutzSlider', value: 'bestandRechtsschutzValue', ratio: 0.15 },
                    { slider: 'bestandKfzSlider', value: 'bestandKfzValue', ratio: 0.2 }
                ];
            } else if (segment === 'bestandKranken') {
                products = [
                    { slider: 'bestandVollSlider', value: 'bestandVollValue', ratio: 0.533 },
                    { slider: 'bestandZusatzSlider', value: 'bestandZusatzValue', ratio: 0.333 },
                    { slider: 'bestandPflegeSlider', value: 'bestandPflegeValue', ratio: 0.134 }
                ];
            } else if (segment === 'bestandLeben') {
                products = [
                    { slider: 'bestandRisikoSlider', value: 'bestandRisikoValue', ratio: 0.267 },
                    { slider: 'bestandBuSlider', value: 'bestandBuValue', ratio: 0.4 },
                    { slider: 'bestandRenteSlider', value: 'bestandRenteValue', ratio: 0.333 }
                ];
            }
            
            // Update each product proportionally
            products.forEach(product => {
                const newValue = Math.round(newTotal * product.ratio);
                const sliderEl = document.getElementById(product.slider);
                const valueEl = document.getElementById(product.value);
                if (sliderEl && valueEl) {
                    sliderEl.value = newValue;
                    valueEl.textContent = formatCurrency(newValue);
                }
            });
        }
        
        // Update product values and recalculate segment total
        function updateProductValues(segment) {
            let total = 0;
            let segmentSlider = '';
            let type = '';
            
            // Determine which segment and type we're working with
            if (segment === 'neuSchaden') {
                total += parseFloat(document.getElementById('neuHaftpflichtSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuUnfallSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuHausratSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuRechtsschutzSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuKfzSlider')?.value || 0);
                segmentSlider = 'neuSchadenSlider';
                type = 'neugeschaeft';
                
                // Update display values
                document.getElementById('neuHaftpflichtValue').textContent = formatCurrency(document.getElementById('neuHaftpflichtSlider').value);
                document.getElementById('neuUnfallValue').textContent = formatCurrency(document.getElementById('neuUnfallSlider').value);
                document.getElementById('neuHausratValue').textContent = formatCurrency(document.getElementById('neuHausratSlider').value);
                document.getElementById('neuRechtsschutzValue').textContent = formatCurrency(document.getElementById('neuRechtsschutzSlider').value);
                document.getElementById('neuKfzValue').textContent = formatCurrency(document.getElementById('neuKfzSlider').value);
            } else if (segment === 'neuKranken') {
                total += parseFloat(document.getElementById('neuVollSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuZusatzSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuPflegeSlider')?.value || 0);
                segmentSlider = 'neuKrankenSlider';
                type = 'neugeschaeft';
                
                document.getElementById('neuVollValue').textContent = formatCurrency(document.getElementById('neuVollSlider').value);
                document.getElementById('neuZusatzValue').textContent = formatCurrency(document.getElementById('neuZusatzSlider').value);
                document.getElementById('neuPflegeValue').textContent = formatCurrency(document.getElementById('neuPflegeSlider').value);
            } else if (segment === 'neuLeben') {
                total += parseFloat(document.getElementById('neuRisikoSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuBuSlider')?.value || 0);
                total += parseFloat(document.getElementById('neuRenteSlider')?.value || 0);
                segmentSlider = 'neuLebenSlider';
                type = 'neugeschaeft';
                
                document.getElementById('neuRisikoValue').textContent = formatCurrency(document.getElementById('neuRisikoSlider').value);
                document.getElementById('neuBuValue').textContent = formatCurrency(document.getElementById('neuBuSlider').value);
                document.getElementById('neuRenteValue').textContent = formatCurrency(document.getElementById('neuRenteSlider').value);
            } else if (segment === 'bestandSchaden') {
                total += parseFloat(document.getElementById('bestandHaftpflichtSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandUnfallSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandHausratSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandRechtsschutzSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandKfzSlider')?.value || 0);
                segmentSlider = 'bestandSchadenSlider';
                type = 'bestand';
                
                document.getElementById('bestandHaftpflichtValue').textContent = formatCurrency(document.getElementById('bestandHaftpflichtSlider').value);
                document.getElementById('bestandUnfallValue').textContent = formatCurrency(document.getElementById('bestandUnfallSlider').value);
                document.getElementById('bestandHausratValue').textContent = formatCurrency(document.getElementById('bestandHausratSlider').value);
                document.getElementById('bestandRechtsschutzValue').textContent = formatCurrency(document.getElementById('bestandRechtsschutzSlider').value);
                document.getElementById('bestandKfzValue').textContent = formatCurrency(document.getElementById('bestandKfzSlider').value);
            } else if (segment === 'bestandKranken') {
                total += parseFloat(document.getElementById('bestandVollSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandZusatzSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandPflegeSlider')?.value || 0);
                segmentSlider = 'bestandKrankenSlider';
                type = 'bestand';
                
                document.getElementById('bestandVollValue').textContent = formatCurrency(document.getElementById('bestandVollSlider').value);
                document.getElementById('bestandZusatzValue').textContent = formatCurrency(document.getElementById('bestandZusatzSlider').value);
                document.getElementById('bestandPflegeValue').textContent = formatCurrency(document.getElementById('bestandPflegeSlider').value);
            } else if (segment === 'bestandLeben') {
                total += parseFloat(document.getElementById('bestandRisikoSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandBuSlider')?.value || 0);
                total += parseFloat(document.getElementById('bestandRenteSlider')?.value || 0);
                segmentSlider = 'bestandLebenSlider';
                type = 'bestand';
                
                document.getElementById('bestandRisikoValue').textContent = formatCurrency(document.getElementById('bestandRisikoSlider').value);
                document.getElementById('bestandBuValue').textContent = formatCurrency(document.getElementById('bestandBuSlider').value);
                document.getElementById('bestandRenteValue').textContent = formatCurrency(document.getElementById('bestandRenteSlider').value);
            }
            
            // Update segment slider with new total
            if (segmentSlider && document.getElementById(segmentSlider)) {
                document.getElementById(segmentSlider).value = total;
                // Update segment values with flag to prevent circular updates
                updateSegmentValues(type, true);
            }
        }
        
        // Calculate individual scores with type-specific adjustments
        function calculatePerformanceScore() {
            const neugeschaeft = parseFloat(document.getElementById('neugeschaeftSlider').value);
            const bestand = parseFloat(document.getElementById('bestandSlider').value);
            const marge = parseFloat(document.getElementById('margenSlider').value);
            const crossSelling = parseFloat(document.getElementById('crossSellingSlider').value);
            
            // Normalize values (0-100)
            const neuScore = Math.min(100, (neugeschaeft / 1000000) * 50);
            const bestandScore = Math.min(100, (bestand / 5000000) * 50);
            const margeScore = marge;
            const crossScore = Math.min(100, (crossSelling - 1) * 25);
            
            return ((neuScore + bestandScore + margeScore + crossScore) / 4) * 0.2;
        }
        
        function calculateRiskScore() {
            const schadenquote = parseFloat(document.getElementById('schadenquoteSlider').value);
            const grossschaden = parseFloat(document.getElementById('grossschadenSlider').value);
            const underwriting = parseFloat(document.getElementById('underwritingSlider').value);
            const vermittlerTyp = document.getElementById('vermittlerTypSelect').value;
            
            // Get type-specific optimal range
            const typeRange = vermittlerTypRanges[vermittlerTyp];
            
            // Adjust scoring based on vermittler type
            let schadenScore;
            if (schadenquote <= typeRange.min) {
                schadenScore = 100; // Perfect score if at or below minimum
            } else if (schadenquote <= typeRange.optimal) {
                // Linear interpolation between min and optimal
                schadenScore = 100 - ((schadenquote - typeRange.min) / (typeRange.optimal - typeRange.min)) * 10;
            } else if (schadenquote <= typeRange.max) {
                // Linear interpolation between optimal and max
                schadenScore = 90 - ((schadenquote - typeRange.optimal) / (typeRange.max - typeRange.optimal)) * 40;
            } else {
                // Above max is bad
                schadenScore = Math.max(0, 50 - ((schadenquote - typeRange.max) * 2));
            }
            
            const grossScore = Math.max(0, 100 - (grossschaden * 10));
            const underScore = underwriting;
            
            return ((schadenScore + grossScore + underScore) / 3) * 0.4;
        }
        
        function calculateStabilityScore() {
            const storno = parseFloat(document.getElementById('stornoSlider').value);
            const dauer = parseFloat(document.getElementById('dauerSlider').value);
            const ausschoepfung = parseFloat(document.getElementById('ausschoepfungSlider').value);
            
            // Lower is better for Storno
            const stornoScore = Math.max(0, 100 - (storno * 2.5));
            const dauerScore = Math.min(100, dauer * 5);
            const ausScore = ausschoepfung;
            
            return ((stornoScore + dauerScore + ausScore) / 3) * 0.15;
        }
        
        function calculateCustomerScore() {
            const nps = parseFloat(document.getElementById('npsSlider').value);
            const beratung = parseFloat(document.getElementById('beratungSlider').value);
            const beschwerden = parseFloat(document.getElementById('beschwerdenSlider').value);
            
            // Normalize NPS (-100 to +100) to 0-100
            const npsScore = (nps + 100) / 2;
            const beratungScore = beratung;
            // Lower is better for Beschwerden
            const beschwerdenScore = Math.max(0, 100 - (beschwerden * 5));
            
            return ((npsScore + beratungScore + beschwerdenScore) / 3) * 0.1;
        }
        
        function calculateProfitScore() {
            const deckungsbeitrag = parseFloat(document.getElementById('deckungsbeitragSlider').value);
            const kostenertrag = parseFloat(document.getElementById('kostenertragSlider').value);
            
            const dbScore = Math.min(100, (deckungsbeitrag / 200000) * 100);
            // Lower is better for Kosten-Ertrag
            const keScore = Math.max(0, 100 - (kostenertrag - 50));
            
            return ((dbScore + keScore) / 2) * 0.15;
        }
        
        // Update traffic light with 3 lights
        function updateTrafficLight(score, combinedRatio) {
            // Reset all lights
            document.getElementById('redLight').classList.remove('active');
            document.getElementById('yellowLight').classList.remove('active');
            document.getElementById('greenLight').classList.remove('active');
            
            // Use Score for traffic light, not Combined Ratio
            if (score >= 80) {
                // A-Vermittler: Green
                document.getElementById('greenLight').classList.add('active');
            } else if (score >= 60) {
                // B-Vermittler: Yellow
                document.getElementById('yellowLight').classList.add('active');
            } else {
                // C/D-Vermittler: Red
                document.getElementById('redLight').classList.add('active');
            }
        }
        
        // Main update function
        function updateScoring() {
            // Update display values
            document.getElementById('neugeschaeftValue').textContent = formatCurrency(document.getElementById('neugeschaeftSlider').value);
            document.getElementById('bestandValue').textContent = formatCurrency(document.getElementById('bestandSlider').value);
            document.getElementById('margenValue').textContent = document.getElementById('margenSlider').value + '%';
            document.getElementById('crossSellingValue').textContent = document.getElementById('crossSellingSlider').value;
            document.getElementById('schadenquoteValue').textContent = document.getElementById('schadenquoteSlider').value + '%';
            document.getElementById('grossschadenValue').textContent = document.getElementById('grossschadenSlider').value + '%';
            document.getElementById('underwritingValue').textContent = document.getElementById('underwritingSlider').value + '%';
            document.getElementById('stornoValue').textContent = document.getElementById('stornoSlider').value + '%';
            document.getElementById('dauerValue').textContent = document.getElementById('dauerSlider').value + ' Jahre';
            document.getElementById('ausschoepfungValue').textContent = document.getElementById('ausschoepfungSlider').value + '%';
            document.getElementById('npsValue').textContent = document.getElementById('npsSlider').value;
            document.getElementById('beratungValue').textContent = document.getElementById('beratungSlider').value + '%';
            document.getElementById('beschwerdenValue').textContent = document.getElementById('beschwerdenSlider').value + '%';
            document.getElementById('deckungsbeitragValue').textContent = formatCurrency(document.getElementById('deckungsbeitragSlider').value);
            document.getElementById('kostenertragValue').textContent = document.getElementById('kostenertragSlider').value + '%';
            
            // Calculate scores
            const performanceScore = calculatePerformanceScore();
            const riskScore = calculateRiskScore();
            const stabilityScore = calculateStabilityScore();
            const customerScore = calculateCustomerScore();
            const profitScore = calculateProfitScore();
            
            const totalScore = performanceScore + riskScore + stabilityScore + customerScore + profitScore;
            
            // Update score displays
            document.getElementById('performanceScore').textContent = performanceScore.toFixed(1) + '/20';
            document.getElementById('riskScore').textContent = riskScore.toFixed(1) + '/40';
            document.getElementById('stabilityScore').textContent = stabilityScore.toFixed(1) + '/15';
            document.getElementById('customerScore').textContent = customerScore.toFixed(1) + '/10';
            document.getElementById('profitScore').textContent = profitScore.toFixed(1) + '/15';
            document.getElementById('totalScore').textContent = Math.round(totalScore);
            
            // Get Combined Ratio for traffic light
            const combinedRatio = parseFloat(document.getElementById('schadenquoteSlider').value);
            
            // Update traffic light
            updateTrafficLight(totalScore, combinedRatio);
            
            // Update category
            const categoryEl = document.getElementById('scoreCategory');
            categoryEl.classList.remove('a-level', 'b-level', 'c-level', 'd-level');
            
            if (totalScore >= 80) {
                categoryEl.textContent = 'A-Vermittler';
                categoryEl.classList.add('a-level');
                document.getElementById('totalScore').style.color = '#059669';
            } else if (totalScore >= 60) {
                categoryEl.textContent = 'B-Vermittler';
                categoryEl.classList.add('b-level');
                document.getElementById('totalScore').style.color = '#d97706';
            } else if (totalScore >= 40) {
                categoryEl.textContent = 'C-Vermittler';
                categoryEl.classList.add('c-level');
                document.getElementById('totalScore').style.color = '#ea580c';
            } else {
                categoryEl.textContent = 'D-Vermittler';
                categoryEl.classList.add('d-level');
                document.getElementById('totalScore').style.color = '#dc2626';
            }
        }
        
        // Initialize Risikoscoring module
        function initRisikoscoring() {
            // Set initial segment values that match the product sums
            const neuSchadenSlider = document.getElementById('neuSchadenSlider');
            if (neuSchadenSlider) {
                document.getElementById('neuSchadenSlider').value = 200000;
                document.getElementById('neuKrankenSlider').value = 150000;
                document.getElementById('neuLebenSlider').value = 150000;
                document.getElementById('bestandSchadenSlider').value = 1000000;
                document.getElementById('bestandKrankenSlider').value = 750000;
                document.getElementById('bestandLebenSlider').value = 750000;

                // Set default vermittler type
                document.getElementById('vermittlerTypSelect').value = 'grossmakler';
                document.getElementById('vermittlerTypDisplay').textContent = 'Großmakler';

                updateScoring();
            }
        }

        // Make functions globally accessible
        window.switchRsTab = switchRsTab;
        window.loadVermittlerProfile = loadVermittlerProfile;
        window.toggleExpand = toggleExpand;
        window.toggleSegment = toggleSegment;
        window.updateMainSlider = updateMainSlider;
        window.updateSegmentValues = updateSegmentValues;
        window.updateProductValues = updateProductValues;
        window.updateScoring = updateScoring;
        window.selectSilo = selectSilo;
        window.toggleMeasures = toggleMeasures;
        window.updateMeasures = updateMeasures;
        window.initRisikoscoring = initRisikoscoring;
window.__registerModule('risikoscoring-ui.js');
