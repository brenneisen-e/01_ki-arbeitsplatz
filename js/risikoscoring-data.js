        // Global distribution data
        let distributionData = {};
        let modifiedDistributionData = {};
        let currentSilo = 'alle';
        let measuresActive = false;
        let selectedMeasures = [];
        
        // Vermittlertyp-spezifische Schadenquoten-Bereiche (Updated for new targets)
        const vermittlerTypRanges = {
            'ao': { min: 80, max: 95, optimal: 90 },
            'grossmakler': { min: 100, max: 115, optimal: 107 },
            'kleinmakler': { min: 110, max: 125, optimal: 118 },
            'autohaus': { min: 125, max: 145, optimal: 135 }
        };
        
        // Measure effects definition
        const measureEffects = {
            schulungen: { d: 10, c: 7, b: 4, a: 2 },
            vertragspruefung: { d: 15, c: 0, b: 0, a: 0 },
            digitalisierung: { d: 6, c: 6, b: 6, a: 6 },
            incentive: { d: 3, c: 5, b: 8, a: 0 },
            prozessoptimierung: { d: 4, c: 4, b: 4, a: 4 },
            betreuung: { d: 12, c: 8, b: 0, a: 0 },
            produktkalkulation: { d: 0, c: 0, b: 0, a: 0 },
            underwriting: { d: 5, c: 5, b: 5, a: 5 }
        };
        
        // Initialize distribution data with adjusted Combined Ratios for new targets
        function initializeDistributionData() {
            // Generate individual distributions with adjusted means for new CR ranges
            distributionData = {
                'ao': generateDistribution(500, 78, 7),        // Best scores (CR ~90%)
                'grossmakler': generateDistribution(2000, 62, 10), // Medium scores (CR ~107%)
                'kleinmakler': generateDistribution(11800, 52, 12), // Lower scores (CR ~118%)
                'autohaus': generateDistribution(100, 35, 13)    // Worst scores (CR ~135%)
            };
            
            // Then create combined distributions
            distributionData['makler'] = combineDistributions(['grossmakler', 'kleinmakler']);
            distributionData['alle'] = combineDistributions(['ao', 'grossmakler', 'kleinmakler', 'autohaus']);
        }
        
        // Generate normal-ish distribution with outliers
        function generateDistribution(total, mean, stdDev) {
            const distribution = new Array(100).fill(0);
            
            for (let i = 0; i < total; i++) {
                let score;
                do {
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    score = mean + z0 * stdDev;
                    
                    if (Math.random() < 0.05) {
                        score += (Math.random() - 0.5) * 20;
                    }
                } while (score < 0 || score > 100);
                
                const bin = Math.min(99, Math.max(0, Math.floor(score)));
                distribution[bin]++;
            }
            
            if (mean < 60) {
                for (let i = 20; i < 25; i++) {
                    distribution[i] = Math.floor(distribution[i] * 0.7);
                }
                for (let i = 15; i < 20; i++) {
                    distribution[i] = Math.floor(distribution[i] * 1.1);
                }
            }
            
            return distribution;
        }
        
        // Combine multiple distributions
        function combineDistributions(silos) {
            const combined = new Array(100).fill(0);
            silos.forEach(silo => {
                if (distributionData[silo]) {
                    distributionData[silo].forEach((count, index) => {
                        combined[index] += count;
                    });
                }
            });
            return combined;
        }
        
        // Apply measures to distribution
        function applyMeasuresToDistribution(originalDist) {
            const newDist = new Array(100).fill(0);
            
            originalDist.forEach((count, score) => {
                if (count === 0) return;
                
                let level;
                if (score >= 80) level = 'a';
                else if (score >= 60) level = 'b';
                else if (score >= 40) level = 'c';
                else level = 'd';
                
                let totalImprovement = 0;
                selectedMeasures.forEach(measure => {
                    if (measureEffects[measure] && measureEffects[measure][level]) {
                        totalImprovement += measureEffects[measure][level];
                    }
                });
                
                if (score >= 80) {
                    const above80 = score - 80;
                    const diminishingFactor = Math.max(0.3, 1 - (above80 / 20) * 0.7);
                    totalImprovement *= diminishingFactor;
                }
                
                let newScore = score + totalImprovement;
                newScore = Math.min(95, newScore);
                
                const newBin = Math.min(99, Math.max(0, Math.floor(newScore)));
                newDist[newBin] += count;
            });
            
            return newDist;
        }
        
        // Calculate statistics for a distribution with adjusted Combined Ratios for new targets
        function calculateStats(distribution, siloType = null) {
            if (!distribution || !Array.isArray(distribution)) {
                return {
                    total: 0,
                    average: 0,
                    avgNeugeschaeft: 0,
                    avgBestand: 0,
                    avgCombinedRatio: 0,
                    avgErtrag: 0,
                    avgStorno: 0,
                    avgCrossSelling: 0,
                    levels: { a: 0, b: 0, c: 0, d: 0 }
                };
            }
            
            let total = 0;
            let weightedSum = 0;
            let neugeschaeftSum = 0;
            let bestandSum = 0;
            let combinedRatioSum = 0;
            let ertragSum = 0;
            let stornoSum = 0;
            let crossSellingSum = 0;
            let levelCounts = { a: 0, b: 0, c: 0, d: 0 };
            
            distribution.forEach((count, bin) => {
                const score = bin;
                total += count;
                weightedSum += count * score;
                
                if (score >= 80) levelCounts.a += count;
                else if (score >= 60) levelCounts.b += count;
                else if (score >= 40) levelCounts.c += count;
                else levelCounts.d += count;
                
                for (let i = 0; i < count; i++) {
                    neugeschaeftSum += estimateNeugeschaeft(score);
                    bestandSum += estimateBestand(score);
                    combinedRatioSum += estimateCombinedRatio(score, siloType);
                    ertragSum += estimateErtrag(score, siloType);
                    stornoSum += estimateStorno(score);
                    crossSellingSum += estimateCrossSelling(score);
                }
            });
            
            return {
                total: total,
                average: total > 0 ? weightedSum / total : 0,
                avgNeugeschaeft: total > 0 ? neugeschaeftSum / total : 0,
                avgBestand: total > 0 ? bestandSum / total : 0,
                avgCombinedRatio: total > 0 ? combinedRatioSum / total : 0,
                avgErtrag: total > 0 ? ertragSum / total : 0,
                avgStorno: total > 0 ? stornoSum / total : 0,
                avgCrossSelling: total > 0 ? crossSellingSum / total : 0,
                levels: levelCounts
            };
        }
        
        // Estimate metrics based on score
        function estimateNeugeschaeft(score) {
            if (score >= 80) return 1500000 + Math.random() * 500000;
            if (score >= 60) return 400000 + Math.random() * 400000;
            if (score >= 40) return 200000 + Math.random() * 200000;
            return 50000 + Math.random() * 150000;
        }
        
        function estimateBestand(score) {
            if (score >= 80) return 6000000 + Math.random() * 2000000;
            if (score >= 60) return 2000000 + Math.random() * 2000000;
            if (score >= 40) return 1000000 + Math.random() * 1000000;
            return 500000 + Math.random() * 500000;
        }
        
        // Adjusted Combined Ratio estimation for new targets
        function estimateCombinedRatio(score, siloType = null) {
            // Base estimation from score
            let baseRatio;
            if (score >= 80) baseRatio = 85 + Math.random() * 10;  // 85-95%
            else if (score >= 60) baseRatio = 100 + Math.random() * 15;  // 100-115%
            else if (score >= 40) baseRatio = 115 + Math.random() * 15;  // 115-130%
            else baseRatio = 130 + Math.random() * 20; // 130-150%
            
            // Adjust based on silo type if specified
            if (siloType === 'ao') {
                baseRatio = 85 + Math.random() * 10; // 85-95%, target 90%
            } else if (siloType === 'grossmakler') {
                baseRatio = 100 + Math.random() * 14; // 100-114%, target 107%
            } else if (siloType === 'kleinmakler') {
                baseRatio = 111 + Math.random() * 14; // 111-125%, target 118%
            } else if (siloType === 'autohaus') {
                baseRatio = 128 + Math.random() * 14; // 128-142%, target 135%
            }
            
            return baseRatio;
        }
        
        // Adjusted Ertrag for target of -77M total
        function estimateErtrag(score, siloType = null) {
            let baseErtrag;
            
            // AO is positive (+2M total for 500 VMs = +4k per VM average)
            if (siloType === 'ao') {
                // Positive earnings for AO
                if (score >= 80) baseErtrag = 4500 + Math.random() * 1000;  // 4.5k-5.5k per VM
                else if (score >= 60) baseErtrag = 3500 + Math.random() * 1000;  // 3.5k-4.5k
                else baseErtrag = 2500 + Math.random() * 1000;  // 2.5k-3.5k
            } else if (siloType === 'grossmakler') {
                // Slightly negative for Großmakler (-10M total for 2000 VMs = -5k per VM)
                if (score >= 80) baseErtrag = -3000 - Math.random() * 1000;  // -3k to -4k
                else if (score >= 60) baseErtrag = -4500 - Math.random() * 1000;  // -4.5k to -5.5k
                else baseErtrag = -6000 - Math.random() * 2000;  // -6k to -8k
            } else if (siloType === 'kleinmakler') {
                // More negative for Kleinmakler (-64M total for 11800 VMs = -5.4k per VM)
                if (score >= 80) baseErtrag = -3500 - Math.random() * 1000;  // -3.5k to -4.5k
                else if (score >= 60) baseErtrag = -5000 - Math.random() * 1000;  // -5k to -6k
                else baseErtrag = -6500 - Math.random() * 1500;  // -6.5k to -8k
            } else if (siloType === 'autohaus') {
                // Most negative for Autohaus (-5M total for 100 VMs = -50k per VM)
                if (score >= 80) baseErtrag = -35000 - Math.random() * 10000;  // -35k to -45k
                else if (score >= 60) baseErtrag = -45000 - Math.random() * 10000;  // -45k to -55k
                else baseErtrag = -55000 - Math.random() * 10000;  // -55k to -65k
            } else {
                // Default negative (for combined views)
                baseErtrag = -5000 - Math.random() * 1000;
            }
            
            return baseErtrag;
        }
        
        function estimateStorno(score) {
            if (score >= 80) return 3 + Math.random() * 2;
            if (score >= 60) return 8 + Math.random() * 4;
            if (score >= 40) return 15 + Math.random() * 5;
            return 25 + Math.random() * 10;
        }
        
        function estimateCrossSelling(score) {
            if (score >= 80) return 3 + Math.random() * 1;
            if (score >= 60) return 2 + Math.random() * 0.8;
            if (score >= 40) return 1.3 + Math.random() * 0.4;
            return 1 + Math.random() * 0.2;
        }
        
        // Update KPIs
        function updateKPIs() {
            const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ? 
                modifiedDistributionData[currentSilo] : distributionData[currentSilo];
            
            if (!data) return;
            
            const stats = calculateStats(data, currentSilo);
            const originalStats = calculateStats(distributionData[currentSilo], currentSilo);
            
            // Update Combined Ratio with color coding
            const crElement = document.getElementById('kpiCombinedRatio');
            const crValue = stats.avgCombinedRatio;
            crElement.textContent = crValue.toFixed(1) + '%';
            
            // Remove all color classes
            crElement.classList.remove('combined-ratio-green', 'combined-ratio-yellow', 'combined-ratio-orange', 'combined-ratio-red');
            
            // Apply color based on ranges
            if (crValue <= 90) {
                crElement.classList.add('combined-ratio-green');
            } else if (crValue <= 100) {
                crElement.classList.add('combined-ratio-yellow');
            } else if (crValue <= 105) {
                crElement.classList.add('combined-ratio-orange');
            } else {
                crElement.classList.add('combined-ratio-red');
            }
            
            // Show trend if measures active
            const crTrend = document.getElementById('kpiCombinedTrend');
            if (measuresActive && selectedMeasures.length > 0) {
                const diff = crValue - originalStats.avgCombinedRatio;
                crTrend.textContent = diff < 0 ? `↓ ${Math.abs(diff).toFixed(1)}%` : `↑ +${diff.toFixed(1)}%`;
                crTrend.style.display = 'block';
                crTrend.className = diff < 0 ? 'kpi-trend positive' : 'kpi-trend negative';
            } else {
                crTrend.style.display = 'none';
            }
            
            // Calculate Gesamtergebnis with negative base
            const totalVermittler = stats.total;
            const avgErtragPerVm = stats.avgErtrag;
            const gesamtergebnis = totalVermittler * avgErtragPerVm;
            
            const ergebnisElement = document.getElementById('kpiGesamtergebnis');
            ergebnisElement.textContent = formatCurrency(gesamtergebnis);
            
            // Color code based on positive/negative
            if (gesamtergebnis >= 0) {
                ergebnisElement.style.color = '#059669';
            } else {
                ergebnisElement.style.color = '#dc2626';
            }
            
            // Show trend for Gesamtergebnis
            const ergebnisTrend = document.getElementById('kpiErgebnisTrend');
            if (measuresActive && selectedMeasures.length > 0) {
                const originalErgebnis = originalStats.total * originalStats.avgErtrag;
                const diff = gesamtergebnis - originalErgebnis;
                
                ergebnisTrend.textContent = diff > 0 ? `↑ +${formatCurrency(diff)}` : `↓ ${formatCurrency(Math.abs(diff))}`;
                ergebnisTrend.style.display = 'block';
                ergebnisTrend.className = diff > 0 ? 'kpi-trend positive' : 'kpi-trend negative';
            } else {
                ergebnisTrend.style.display = 'none';
            }
            
            // Update VM-Entwicklung
            document.getElementById('kpiVmA').textContent = stats.levels.a;
            document.getElementById('kpiVmB').textContent = stats.levels.b;
            document.getElementById('kpiVmC').textContent = stats.levels.c;
            document.getElementById('kpiVmD').textContent = stats.levels.d;
            document.getElementById('kpiVmTotal').textContent = stats.total.toLocaleString('de-DE');
            
            // Show trends for VM levels
            if (measuresActive && selectedMeasures.length > 0) {
                document.getElementById('kpiVmATrend').textContent = stats.levels.a > originalStats.levels.a ? '↑' : '↓';
                document.getElementById('kpiVmATrend').style.display = 'inline';
                document.getElementById('kpiVmBTrend').textContent = stats.levels.b > originalStats.levels.b ? '↑' : '↓';
                document.getElementById('kpiVmBTrend').style.display = 'inline';
                document.getElementById('kpiVmCTrend').textContent = stats.levels.c > originalStats.levels.c ? '↑' : '↓';
                document.getElementById('kpiVmCTrend').style.display = 'inline';
                document.getElementById('kpiVmDTrend').textContent = stats.levels.d > originalStats.levels.d ? '↑' : '↓';
                document.getElementById('kpiVmDTrend').style.display = 'inline';
            } else {
                document.getElementById('kpiVmATrend').style.display = 'none';
                document.getElementById('kpiVmBTrend').style.display = 'none';
                document.getElementById('kpiVmCTrend').style.display = 'none';
                document.getElementById('kpiVmDTrend').style.display = 'none';
            }
        }
        
        // Draw distribution chart
        function drawDistributionChart() {
            const canvas = document.getElementById('distributionChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const distribution = distributionData[currentSilo];
            
            if (!distribution) {
                console.error('No distribution data for', currentSilo);
                return;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const padding = 50;
            const chartWidth = canvas.width - 2 * padding;
            const chartHeight = canvas.height - 2 * padding;
            const barWidth = chartWidth / 100;
            
            let maxValue = Math.max(...distribution);
            if (measuresActive && modifiedDistributionData[currentSilo]) {
                maxValue = Math.max(maxValue, ...modifiedDistributionData[currentSilo]);
            }
            
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, canvas.height - padding);
            ctx.lineTo(canvas.width - padding, canvas.height - padding);
            ctx.stroke();
            
            canvas.barPositions = [];
            
            const showModified = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo];
            
            distribution.forEach((count, score) => {
                const x = padding + score * barWidth;
                const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
                const y = canvas.height - padding - height;
                
                let color;
                const alpha = showModified ? 0.3 : 1.0;
                
                if (score >= 80) {
                    const intensity = (score - 80) / 20;
                    color = `hsla(140, ${50 + intensity * 20}%, ${75 - intensity * 10}%, ${alpha})`;
                } else if (score >= 60) {
                    const intensity = (score - 60) / 20;
                    color = `hsla(50, ${60 + intensity * 20}%, ${80 - intensity * 10}%, ${alpha})`;
                } else if (score >= 40) {
                    const intensity = (score - 40) / 20;
                    color = `hsla(30, ${65 + intensity * 20}%, ${75 - intensity * 10}%, ${alpha})`;
                } else {
                    const intensity = score / 40;
                    color = `hsla(0, ${50 + intensity * 30}%, ${80 - intensity * 15}%, ${alpha})`;
                }
                
                ctx.fillStyle = color;
                if (height > 0) {
                    ctx.fillRect(x, y, barWidth - 1, height);
                }
            });
            
            if (showModified) {
                modifiedDistributionData[currentSilo].forEach((count, score) => {
                    const x = padding + score * barWidth;
                    const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
                    const y = canvas.height - padding - height;
                    
                    let color;
                    if (score >= 80) {
                        const intensity = (score - 80) / 20;
                        color = `hsl(140, ${50 + intensity * 20}%, ${75 - intensity * 10}%)`;
                    } else if (score >= 60) {
                        const intensity = (score - 60) / 20;
                        color = `hsl(50, ${60 + intensity * 20}%, ${80 - intensity * 10}%)`;
                    } else if (score >= 40) {
                        const intensity = (score - 40) / 20;
                        color = `hsl(30, ${65 + intensity * 20}%, ${75 - intensity * 10}%)`;
                    } else {
                        const intensity = score / 40;
                        color = `hsl(0, ${50 + intensity * 30}%, ${80 - intensity * 15}%)`;
                    }
                    
                    ctx.fillStyle = color;
                    if (height > 0) {
                        ctx.fillRect(x, y, barWidth - 1, height);
                    }
                    
                    canvas.barPositions[score] = { 
                        x: x, 
                        y: y, 
                        width: barWidth - 1, 
                        height: height, 
                        count: count, 
                        score: score,
                        color: color
                    };
                });
            } else {
                distribution.forEach((count, score) => {
                    const x = padding + score * barWidth;
                    const height = count > 0 ? Math.max(2, (count / maxValue) * chartHeight) : 0;
                    const y = canvas.height - padding - height;
                    
                    canvas.barPositions[score] = { 
                        x: x, 
                        y: y, 
                        width: barWidth - 1, 
                        height: height, 
                        count: count, 
                        score: score
                    };
                });
            }
            
            const stats = calculateStats(distribution, currentSilo);
            const avgX = padding + stats.average * barWidth;
            
            ctx.strokeStyle = showModified ? '#9ca3af' : '#2563eb';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(avgX, padding);
            ctx.lineTo(avgX, canvas.height - padding);
            ctx.stroke();
            
            if (showModified) {
                const modStats = calculateStats(modifiedDistributionData[currentSilo], currentSilo);
                const modAvgX = padding + modStats.average * barWidth;
                
                ctx.strokeStyle = '#059669';
                ctx.beginPath();
                ctx.moveTo(modAvgX, padding);
                ctx.lineTo(modAvgX, canvas.height - padding);
                ctx.stroke();
                
                ctx.fillStyle = '#059669';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Ø ${modStats.average.toFixed(1)}`, modAvgX, padding - 10);
            } else {
                ctx.fillStyle = '#2563eb';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`Ø ${stats.average.toFixed(1)}`, avgX, padding - 10);
            }
            
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            for (let i = 0; i <= 100; i += 10) {
                const x = padding + i * barWidth;
                ctx.fillText(i, x, canvas.height - padding + 20);
            }
            
            ctx.textAlign = 'right';
            const ySteps = 5;
            for (let i = 0; i <= ySteps; i++) {
                const y = canvas.height - padding - (i / ySteps) * chartHeight;
                const value = Math.round((i / ySteps) * maxValue);
                ctx.fillText(value, padding - 10, y + 5);
            }
            
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Score', canvas.width / 2, canvas.height - 10);
            
            ctx.save();
            ctx.translate(15, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText('Anzahl Vermittler', 0, 0);
            ctx.restore();
        }
        
        // Handle chart hover - FIXED TOOLTIP POSITIONING
        function setupChartInteraction() {
            const canvas = document.getElementById('distributionChart');
            const tooltip = document.getElementById('chartTooltip');
            let hoveredBar = null;
            
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                let newHoveredBar = null;
                if (canvas.barPositions) {
                    canvas.barPositions.forEach(bar => {
                        if (bar && bar.height > 0 && x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height) {
                            newHoveredBar = bar;
                        }
                    });
                }
                
                if (hoveredBar !== newHoveredBar) {
                    hoveredBar = newHoveredBar;
                    
                    drawDistributionChart();
                    
                    if (hoveredBar) {
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#1e3a8a';
                        ctx.fillRect(hoveredBar.x, hoveredBar.y, hoveredBar.width, hoveredBar.height);
                    }
                }
                
                if (hoveredBar) {
                    tooltip.innerHTML = `Score: ${hoveredBar.score}<br>Anzahl: ${hoveredBar.count} Vermittler`;
                    tooltip.style.display = 'block';
                    
                    // Get actual tooltip dimensions after content is set
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const canvasRect = canvas.getBoundingClientRect();
                    
                    // Calculate center position of the bar in page coordinates
                    const barCenterX = canvasRect.left + hoveredBar.x + (hoveredBar.width / 2);
                    const barTopY = canvasRect.top + hoveredBar.y;
                    
                    // Position tooltip centered above the bar
                    let tooltipLeft = barCenterX - (tooltipRect.width / 2);
                    let tooltipTop = barTopY - tooltipRect.height - 15;
                    
                    // Keep tooltip within viewport bounds
                    if (tooltipLeft < 5) tooltipLeft = 5;
                    if (tooltipLeft + tooltipRect.width > window.innerWidth - 5) {
                        tooltipLeft = window.innerWidth - tooltipRect.width - 5;
                    }
                    
                    // If tooltip would go above viewport, show it below the bar
                    if (tooltipTop < 5) {
                        tooltipTop = canvasRect.top + hoveredBar.y + hoveredBar.height + 15;
                    }
                    
                    // Position tooltip with fixed positioning
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = tooltipLeft + 'px';
                    tooltip.style.top = tooltipTop + 'px';
                } else {
                    tooltip.style.display = 'none';
                }
            });
            
            canvas.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
                if (hoveredBar) {
                    hoveredBar = null;
                    drawDistributionChart();
                }
            });
        }
        
        // Select silo
        function selectSilo(silo) {
            if (!distributionData || !distributionData.alle) {
                initializeDistributionData();
            }
            
            currentSilo = silo;
            
            document.querySelectorAll('.toggle-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            if (measuresActive && selectedMeasures.length > 0) {
                updateMeasures();
            } else {
                drawDistributionChart();
                updateStatisticsTable();
                updateKPIs();
            }
        }
        
        // Toggle measures
        function toggleMeasures() {
            const button = event.target.closest('.measures-toggle-button');
            const content = document.getElementById('measuresContent');
            
            measuresActive = !measuresActive;
            
            if (measuresActive) {
                button.classList.add('active');
                content.classList.add('active');
                button.innerHTML = '<span>✅</span><span>Maßnahmen aktiv</span>';
                
                if (selectedMeasures.length > 0) {
                    updateMeasures();
                }
            } else {
                button.classList.remove('active');
                content.classList.remove('active');
                button.innerHTML = '<span>🎯</span><span>Maßnahmen aktivieren</span>';
                
                document.querySelectorAll('.measure-checkbox input').forEach(cb => {
                    cb.checked = false;
                });
                selectedMeasures = [];
                modifiedDistributionData = {};
                
                document.getElementById('comparisonContainer').style.display = 'none';
                
                drawDistributionChart();
                updateStatisticsTable();
                updateKPIs();
            }
        }
        
        // Update measures
        function updateMeasures() {
            selectedMeasures = [];
            document.querySelectorAll('.measure-checkbox input:checked').forEach(cb => {
                selectedMeasures.push(cb.value);
            });
            
            if (selectedMeasures.length > 0 && measuresActive) {
                modifiedDistributionData = {};
                
                Object.keys(distributionData).forEach(silo => {
                    modifiedDistributionData[silo] = applyMeasuresToDistribution(distributionData[silo]);
                });
                
                document.getElementById('comparisonContainer').style.display = 'block';
                updateComparison();
            } else {
                document.getElementById('comparisonContainer').style.display = 'none';
                modifiedDistributionData = {};
            }
            
            drawDistributionChart();
            updateStatisticsTable();
            updateKPIs();
        }
        
        // Update comparison display
        function updateComparison() {
            const originalStats = calculateStats(distributionData[currentSilo], currentSilo);
            const modifiedStats = calculateStats(modifiedDistributionData[currentSilo], currentSilo);
            
            document.getElementById('beforeAvgScore').textContent = originalStats.average.toFixed(1);
            document.getElementById('beforeA').textContent = originalStats.levels.a;
            document.getElementById('beforeB').textContent = originalStats.levels.b;
            document.getElementById('beforeC').textContent = originalStats.levels.c;
            document.getElementById('beforeD').textContent = originalStats.levels.d;
            
            document.getElementById('afterAvgScore').textContent = modifiedStats.average.toFixed(1);
            document.getElementById('afterA').textContent = modifiedStats.levels.a;
            document.getElementById('afterB').textContent = modifiedStats.levels.b;
            document.getElementById('afterC').textContent = modifiedStats.levels.c;
            document.getElementById('afterD').textContent = modifiedStats.levels.d;
            
            const improvement = modifiedStats.average - originalStats.average;
            const badge = document.querySelector('.improvement-badge');
            if (badge) {
                badge.textContent = `+${improvement.toFixed(1)}`;
            }
        }
        
        // Update statistics table
        function updateStatisticsTable() {
            const tbody = document.getElementById('statisticsTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (!distributionData || !distributionData.alle) {
                initializeDistributionData();
            }
            
            const siloInfo = {
                'ao': { name: 'Ausschließlichkeitsorganisation', data: distributionData.ao },
                'grossmakler': { name: 'Großmakler', data: distributionData.grossmakler },
                'kleinmakler': { name: 'Kleinmakler', data: distributionData.kleinmakler },
                'autohaus': { name: 'Autohäuser', data: distributionData.autohaus }
            };
            
            const silosToShow = currentSilo === 'alle' || currentSilo === 'makler' ? 
                ['ao', 'grossmakler', 'kleinmakler', 'autohaus'] : [currentSilo];
            
            silosToShow.forEach(silo => {
                if (siloInfo[silo]) {
                    const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[silo] ? 
                        modifiedDistributionData[silo] : distributionData[silo];
                    const stats = calculateStats(data, silo);
                    const originalStats = calculateStats(distributionData[silo], silo);
                    
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${siloInfo[silo].name}</td>
                        <td class="stat-value">${stats.total.toLocaleString('de-DE')}</td>
                        <td class="stat-value">
                            ${stats.average.toFixed(1)}
                            ${measuresActive && selectedMeasures.length > 0 && stats.average !== originalStats.average ? 
                                `<span class="improvement-badge">+${(stats.average - originalStats.average).toFixed(1)}</span>` : ''}
                        </td>
                        <td class="stat-value">${formatCurrency(stats.avgNeugeschaeft)}</td>
                        <td class="stat-value">${formatCurrency(stats.avgBestand)}</td>
                        <td class="stat-value">${stats.avgCombinedRatio.toFixed(1)}%</td>
                        <td class="stat-value">${formatCurrency(stats.avgErtrag)}</td>
                        <td class="stat-value">${stats.avgStorno.toFixed(1)}%</td>
                        <td class="stat-value">${stats.avgCrossSelling.toFixed(1)}</td>
                    `;
                    
                    tbody.appendChild(row);
                }
            });
            
            if (currentSilo === 'alle' || currentSilo === 'makler') {
                const data = measuresActive && selectedMeasures.length > 0 && modifiedDistributionData[currentSilo] ? 
                    modifiedDistributionData[currentSilo] : distributionData[currentSilo];
                const totalStats = calculateStats(data, currentSilo);
                const originalTotalStats = calculateStats(distributionData[currentSilo], currentSilo);
                
                const totalRow = document.createElement('tr');
                totalRow.style.fontWeight = 'bold';
                totalRow.style.background = '#f8fafc';
                
                totalRow.innerHTML = `
                    <td>Gesamt</td>
                    <td class="stat-value">${totalStats.total.toLocaleString('de-DE')}</td>
                    <td class="stat-value">
                        ${totalStats.average.toFixed(1)}
                        ${measuresActive && selectedMeasures.length > 0 && totalStats.average !== originalTotalStats.average ? 
                            `<span class="improvement-badge">+${(totalStats.average - originalTotalStats.average).toFixed(1)}</span>` : ''}
                    </td>
                    <td class="stat-value">${formatCurrency(totalStats.avgNeugeschaeft)}</td>
                    <td class="stat-value">${formatCurrency(totalStats.avgBestand)}</td>
                    <td class="stat-value">${totalStats.avgCombinedRatio.toFixed(1)}%</td>
                    <td class="stat-value">${formatCurrency(totalStats.avgErtrag)}</td>
                    <td class="stat-value">${totalStats.avgStorno.toFixed(1)}%</td>
                    <td class="stat-value">${totalStats.avgCrossSelling.toFixed(1)}</td>
                `;

                tbody.appendChild(totalRow);
            }
        }
