/**
 * pmo-toolbox.esm.js - ES6 Module for PMO Toolbox
 *
 * This module provides all PMO Toolbox functionality including:
 * - Project and workstream management
 * - Status tracking and reporting
 * - Gantt chart visualization
 * - Decision management (Kanban)
 * - PowerPoint export
 * - AI Document Assistant
 */

// ========================================
// PMO TOOLBOX - JavaScript
// ========================================

export const PMO = {
    // Program Structure
    PROGRAM_STRUCTURE: {
        projects: [
            {
                id: "A",
                name: "Hybrider Kunde",
                fullName: "Omnikanalstärkung der Agenturbetriebe",
                workstreams: [
                    { id: "A1", name: "Skalierung Neukunden-Leads und Optimierung Lead-Routing" },
                    { id: "A2", name: "Ausbau der K-EWE Servicepunkte bei Bestandskunden" },
                    { id: "A3", name: "Skalierung des Service-2-Sales Geschäfts auf weitere Segmente" },
                    { id: "A4", name: "Aufbau zentrale Telefoneinheit (Inside Sales)" }
                ]
            },
            {
                id: "B",
                name: "Vertriebssteuerung",
                fullName: "Professionalisierung der Agenturbetriebe über standardbasierte Steuerungs- und Entwicklungsprozesse",
                workstreams: [
                    { id: "B1", name: "Optimierung Vertriebssteuerung mit vereinheitlichten Reports" },
                    { id: "B2", name: "Aufbau Performance-Steuerung und Agenturentwicklungspläne" },
                    { id: "B3", name: "Optimierung Provisionsmanagement" }
                ]
            },
            {
                id: "C",
                name: "Kapazität & Ausbildung",
                fullName: "Kapazitätsstabilisierung der Agenturbetriebe durch verbessertes Recruiting und effektives Onboarding",
                workstreams: [
                    { id: "C1", name: "Optimierte Kapazitätssteuerung und Skalierung des Recruitings" },
                    { id: "C2", name: "E2E Optimierung des Einstellungsprozesses und der Ausbildungsformate" }
                ]
            },
            {
                id: "D",
                name: "A-TOM",
                fullName: "Produktivitätssteigerung der Agenturbetriebe mit standardisiertem und verbessertem Servicemodell",
                workstreams: [
                    { id: "D1", name: "Implementierung klarer Agenturformate mit einheitlichem Servicemodell" },
                    { id: "D2", name: "Optimierung der Kundenanalytik und Potenzialidentifikation" },
                    { id: "D3", name: "Einführung von einheitlichen und intuitiven Beratungsmodell" },
                    { id: "D4", name: "Optimierung von Service-Prozessen durch Innovation und Digitalisierung" },
                    { id: "D5", name: "Stringente Abarbeitung des EASY Backlogs (z.B. Antragsstrecke)" },
                    { id: "D6", name: "Prozessoptimierung im RD-ID zur Gewährleistung schlanker Strukturen" }
                ]
            },
            {
                id: "E",
                name: "DIP",
                fullName: "Ausbau der digitalen Reichweite der Agenturbetriebe über modernisierte Vermittler-Homepages, SEO und SoMe",
                workstreams: [
                    { id: "E1", name: "Ausbau EMOK und Social Media Funktionen" },
                    { id: "E2", name: "SEO-Skalierung der Vermittler Homepages" },
                    { id: "E3", name: "Einführung von KI-Optimierungen für Vermittler Homepages" },
                    { id: "E4", name: "Ausbau der Dynamisierung und Personalisierung der Vermittler Homepages" }
                ]
            },
            {
                id: "F",
                name: "Struktur",
                fullName: "Schaffung Investitionsräume für Agenturbetriebe durch effektives Kosten-Mgmt. und schlanke Strukturen",
                workstreams: [
                    { id: "F1", name: "Sicherstellung der Erreichung der Effizienzziele" }
                ]
            },
            {
                id: "G",
                name: "Change & Einführungs-Mgmt.",
                fullName: "Gemeinsame Transformation der Agenturbetriebe über aktive Einbindung des Vertriebs und effektive Kommunikation",
                workstreams: [
                    { id: "G1", name: "Koordination des Change und Einführungs-Mgmt. im Vertrieb" },
                    { id: "G2", name: "Sicherstellung des Betriebsübergangs im Innen- und Außendienst" }
                ]
            },
            {
                id: "H",
                name: "Sales Middle Layer",
                fullName: "Prozessoptimierung für Agenturbetriebe durch harmonisierte IT-Infrastruktur mit Fokus auf TAA-Prozesse",
                workstreams: [
                    { id: "H1", name: "Aufsatz eines eigenen Programms für vertriebswegübergreifende Einführung eines Sales Middle Layer" }
                ]
            }
        ]
    },

    // State
    statusData: [],
    currentView: 'landing',
    currentWorkstream: null,
    tasks: [],
    milestones: [],
    selectedTrafficLights: {},

    // Initialize
    init() {
        console.log('🚀 PMO Toolbox initialisiert');
        this.loadData();
        this.loadTasks();
        this.loadMilestones();
        this.renderLandingPage();
        this.setupEventListeners();
        this.populateProjectSelect();
        this.setDefaultDate();

        // Check if user has a saved workstream preference
        const savedWs = localStorage.getItem('pmo_current_workstream');
        if (savedWs) {
            this.selectWorkstream(savedWs);
        }
    },

    // Load tasks from localStorage
    loadTasks() {
        const stored = localStorage.getItem('pmo_tasks');
        if (stored) {
            this.tasks = JSON.parse(stored);
        } else {
            this.tasks = [];
        }
    },

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('pmo_tasks', JSON.stringify(this.tasks));
    },

    // Load milestones from localStorage
    loadMilestones() {
        const stored = localStorage.getItem('pmo_milestones');
        if (stored) {
            this.milestones = JSON.parse(stored);
        } else {
            this.milestones = [];
        }
    },

    // Save milestones to localStorage
    saveMilestones() {
        localStorage.setItem('pmo_milestones', JSON.stringify(this.milestones));
    },

    // Render Landing Page - Shows Projects (A-H)
    renderLandingPage() {
        const grid = document.getElementById('pmo-stream-grid');
        if (!grid) return;

        let html = '';
        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            const projectStatus = this.getProjectLatestStatus(project.id);
            html += `
                <div class="pmo-stream-card pmo-project-card-landing" onclick="PMO.showProjectWorkstreams('${project.id}')">
                    <div class="pmo-stream-card-header" style="justify-content: flex-end;">
                        <div class="pmo-stream-status">
                            <div class="pmo-traffic-light ${projectStatus?.overall || 'gray'}"></div>
                        </div>
                    </div>
                    <h4>${project.name}</h4>
                    <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">${project.fullName}</p>
                    <span class="pmo-stream-project-label">${project.workstreams.length} Workstreams</span>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Update header text
        const header = document.querySelector('.pmo-landing-header');
        if (header) {
            header.innerHTML = `
                <h2>Willkommen zur PMO Toolbox</h2>
                <p>Wählen Sie ein Teilprojekt aus</p>
            `;
        }
    },

    // Show Workstreams for a specific Project
    showProjectWorkstreams(projectId) {
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        if (!project) return;

        const grid = document.getElementById('pmo-stream-grid');
        if (!grid) return;

        let html = '';
        project.workstreams.forEach(ws => {
            const status = this.getWorkstreamLatestStatus(ws.id);
            html += `
                <div class="pmo-stream-card" onclick="PMO.selectWorkstream('${ws.id}')">
                    <div class="pmo-stream-card-header" style="justify-content: flex-end;">
                        <div class="pmo-stream-status">
                            <div class="pmo-traffic-light ${status?.status?.overall || 'gray'}"></div>
                        </div>
                    </div>
                    <h4>${ws.name}</h4>
                </div>
            `;
        });

        grid.innerHTML = html;

        // Update header with back button
        const header = document.querySelector('.pmo-landing-header');
        if (header) {
            header.innerHTML = `
                <button class="pmo-btn pmo-btn-secondary" onclick="PMO.renderLandingPage()" style="margin-bottom: 16px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Zurück zu Teilprojekten
                </button>
                <h2>Teilprojekt ${project.id}: ${project.name}</h2>
                <p>${project.fullName}</p>
            `;
        }
    },

    // Select a workstream
    selectWorkstream(wsId) {
        this.currentWorkstream = wsId;
        localStorage.setItem('pmo_current_workstream', wsId);

        // Find workstream info
        let wsInfo = null;
        let projectInfo = null;
        for (const project of this.PROGRAM_STRUCTURE.projects) {
            const ws = project.workstreams.find(w => w.id === wsId);
            if (ws) {
                wsInfo = ws;
                projectInfo = project;
                break;
            }
        }

        if (wsInfo && projectInfo) {
            document.getElementById('my-ws-id').textContent = wsId;
            document.getElementById('my-ws-name').textContent = wsInfo.name;
            document.getElementById('my-ws-project').textContent = `Projekt ${projectInfo.id} - ${projectInfo.name}`;
        }

        this.renderMyWorkstream();
        this.showView('my-workstream');
    },

    // Show landing page
    showLanding() {
        this.currentWorkstream = null;
        localStorage.removeItem('pmo_current_workstream');
        this.showViewInternal('landing');
    },

    // Skip landing and go to dashboard
    skipLanding() {
        this.showView('dashboard');
        this.renderDashboard();
    },

    // Render My Workstream View
    renderMyWorkstream() {
        if (!this.currentWorkstream) return;

        this.renderCurrentStatus();
        this.renderStatusHistory();
        this.renderMyMilestones();
        this.renderMyTasks();
    },

    // Render current status
    renderCurrentStatus() {
        const container = document.getElementById('my-current-status');
        if (!container) return;

        const status = this.getWorkstreamLatestStatus(this.currentWorkstream);

        if (!status) {
            container.innerHTML = `
                <div class="pmo-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                    <p>Noch kein Status vorhanden. Erstellen Sie Ihren ersten Status!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="pmo-status-lights">
                <div class="pmo-status-light-row">
                    <div class="pmo-traffic-light ${status.status?.overall || 'gray'}"></div>
                    <span>Gesamt</span>
                </div>
                <div class="pmo-status-light-row">
                    <div class="pmo-traffic-light ${status.status?.budget || 'gray'}"></div>
                    <span>Budget</span>
                </div>
                <div class="pmo-status-light-row">
                    <div class="pmo-traffic-light ${status.status?.scope || 'gray'}"></div>
                    <span>Scope</span>
                </div>
                <div class="pmo-status-light-row">
                    <div class="pmo-traffic-light ${status.status?.time || 'gray'}"></div>
                    <span>Zeit</span>
                </div>
                <div class="pmo-status-light-row">
                    <div class="pmo-traffic-light ${status.status?.resources || 'gray'}"></div>
                    <span>Ressourcen</span>
                </div>
            </div>
            <div class="pmo-status-details">
                <div class="pmo-status-detail-item">
                    <h5>Fortschritt</h5>
                    <p>${status.progress || 'Keine Angabe'}</p>
                </div>
                <div class="pmo-status-detail-item">
                    <h5>Nächste Schritte</h5>
                    <p>${status.upcoming || 'Keine Angabe'}</p>
                </div>
                <div class="pmo-status-detail-item">
                    <h5>Letzte Aktualisierung</h5>
                    <p>${this.formatDate(status.date)}</p>
                </div>
                <div class="pmo-status-detail-item">
                    <h5>Offene Risiken</h5>
                    <p>${status.risksAndIssues?.filter(r => r.status !== 'Geschlossen').length || 0} Risiken offen</p>
                </div>
            </div>
        `;
    },

    // Render status history
    renderStatusHistory() {
        const container = document.getElementById('my-status-history');
        if (!container) return;

        const history = this.statusData
            .filter(s => s.workstreamId === this.currentWorkstream)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10);

        if (history.length === 0) {
            container.innerHTML = `
                <div class="pmo-empty-state">
                    <p>Keine Historie vorhanden</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(s => `
            <div class="pmo-history-item" onclick="PMO.viewHistoryDetail('${s.id}')">
                <span class="pmo-history-date">${this.formatDate(s.date)}</span>
                <span class="pmo-history-summary">${s.progress || 'Status Update'}</span>
                <div class="pmo-history-status">
                    <div class="pmo-traffic-light ${s.status?.overall || 'gray'}" style="width:16px;height:16px;"></div>
                </div>
            </div>
        `).join('');
    },

    // View history detail
    viewHistoryDetail(statusId) {
        const status = this.statusData.find(s => s.id === statusId);
        if (!status) return;

        // Open PPT view for this status
        this.openPPTView(this.currentWorkstream, status);
    },

    // Render milestones for my workstream
    renderMyMilestones() {
        const container = document.getElementById('my-milestones');
        if (!container) return;

        // Get milestones from status data and custom milestones
        const statusMilestones = [];
        const latestStatus = this.getWorkstreamLatestStatus(this.currentWorkstream);
        if (latestStatus?.milestones) {
            statusMilestones.push(...latestStatus.milestones);
        }

        const customMilestones = this.milestones.filter(m => m.workstreamId === this.currentWorkstream);
        const allMilestones = [...statusMilestones, ...customMilestones];

        if (allMilestones.length === 0) {
            container.innerHTML = `
                <div class="pmo-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <p>Keine Meilensteine definiert</p>
                </div>
            `;
            return;
        }

        container.innerHTML = allMilestones.map((m, idx) => {
            const iconClass = m.status === 'Geschlossen' ? 'completed' :
                              m.status === 'Verzögert' ? 'delayed' : '';
            return `
                <div class="pmo-milestone-item">
                    <div class="pmo-milestone-icon ${iconClass}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            ${m.status === 'Geschlossen' ?
                                '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
                                '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>'}
                        </svg>
                    </div>
                    <div class="pmo-milestone-info">
                        <h5>${m.name}</h5>
                        <p>Status: ${m.status || 'Im Plan'}</p>
                    </div>
                    <div class="pmo-milestone-dates">
                        <p class="planned">Geplant: ${this.formatDate(m.plannedDate)}</p>
                        <p class="current">Aktuell: ${this.formatDate(m.currentEstimate || m.plannedDate)}</p>
                    </div>
                    <div class="pmo-milestone-actions">
                        <button class="pmo-btn-sm" onclick="PMO.editMilestone(${idx})" title="Bearbeiten">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Render tasks for my workstream
    renderMyTasks() {
        const container = document.getElementById('my-tasks');
        if (!container) return;

        const myTasks = this.tasks.filter(t => t.workstreamId === this.currentWorkstream);

        if (myTasks.length === 0) {
            container.innerHTML = `
                <div class="pmo-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                    <p>Keine Aufgaben vorhanden</p>
                </div>
            `;
            return;
        }

        container.innerHTML = myTasks.map((t, idx) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && !t.completed;
            return `
                <div class="pmo-task-item">
                    <div class="pmo-task-checkbox ${t.completed ? 'checked' : ''}" onclick="PMO.toggleTask(${idx})">
                        ${t.completed ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                    </div>
                    <div class="pmo-task-info ${t.completed ? 'completed' : ''}">
                        <h5>${t.title}</h5>
                    </div>
                    ${t.dueDate ? `<span class="pmo-task-due ${isOverdue ? 'overdue' : ''}">${this.formatDate(t.dueDate)}</span>` : ''}
                    <button class="pmo-btn-sm" onclick="PMO.deleteTask(${idx})" title="Löschen">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
    },

    // Toggle task completion
    toggleTask(idx) {
        const myTasks = this.tasks.filter(t => t.workstreamId === this.currentWorkstream);
        const task = myTasks[idx];
        if (task) {
            const globalIdx = this.tasks.indexOf(task);
            this.tasks[globalIdx].completed = !this.tasks[globalIdx].completed;
            this.saveTasks();
            this.renderMyTasks();
        }
    },

    // Delete task
    deleteTask(idx) {
        const myTasks = this.tasks.filter(t => t.workstreamId === this.currentWorkstream);
        const task = myTasks[idx];
        if (task && confirm('Aufgabe wirklich löschen?')) {
            const globalIdx = this.tasks.indexOf(task);
            this.tasks.splice(globalIdx, 1);
            this.saveTasks();
            this.renderMyTasks();
        }
    },

    // Add new task
    addTask() {
        const title = prompt('Aufgabe:');
        if (!title) return;

        const dueDate = prompt('Fälligkeitsdatum (YYYY-MM-DD, optional):');

        this.tasks.push({
            id: `task_${Date.now()}`,
            workstreamId: this.currentWorkstream,
            title: title,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString()
        });

        this.saveTasks();
        this.renderMyTasks();
    },

    // Add new milestone
    addMilestone() {
        const name = prompt('Meilenstein Name:');
        if (!name) return;

        const plannedDate = prompt('Geplantes Datum (YYYY-MM-DD):');
        if (!plannedDate) return;

        this.milestones.push({
            id: `ms_${Date.now()}`,
            workstreamId: this.currentWorkstream,
            name: name,
            plannedDate: plannedDate,
            currentEstimate: plannedDate,
            status: 'Im Plan'
        });

        this.saveMilestones();
        this.renderMyMilestones();
    },

    // Edit milestone
    editMilestone(idx) {
        const customMilestones = this.milestones.filter(m => m.workstreamId === this.currentWorkstream);
        const milestone = customMilestones[idx];
        if (!milestone) {
            alert('Dieser Meilenstein kann nicht bearbeitet werden');
            return;
        }

        const newStatus = prompt('Status (Im Plan / Verzögert / Geschlossen):', milestone.status);
        if (newStatus) {
            const globalIdx = this.milestones.indexOf(milestone);
            this.milestones[globalIdx].status = newStatus;

            if (newStatus === 'Verzögert') {
                const newDate = prompt('Neues geschätztes Datum (YYYY-MM-DD):', milestone.currentEstimate);
                if (newDate) {
                    this.milestones[globalIdx].currentEstimate = newDate;
                }
            }

            this.saveMilestones();
            this.renderMyMilestones();
        }
    },

    // Add new status for my workstream
    addNewStatus() {
        // Pre-fill the status modal with current workstream
        this.openStatusModal();

        // Find the project for current workstream
        for (const project of this.PROGRAM_STRUCTURE.projects) {
            const ws = project.workstreams.find(w => w.id === this.currentWorkstream);
            if (ws) {
                document.getElementById('status-project').value = project.id;
                this.updateWorkstreamSelect();
                document.getElementById('status-workstream').value = this.currentWorkstream;
                break;
            }
        }
    },

    // Export PPT for my workstream
    exportMyPPT() {
        if (this.currentWorkstream) {
            this.exportPPT(this.currentWorkstream);
        }
    },

    // Format date helper
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    // Load data from localStorage
    loadData() {
        const stored = localStorage.getItem('pmo_status_data');
        if (stored) {
            this.statusData = JSON.parse(stored);
        } else {
            this.generateDemoData();
        }
    },

    // Save data to localStorage
    saveData() {
        localStorage.setItem('pmo_status_data', JSON.stringify(this.statusData));
    },

    // Generate Demo Data
    generateDemoData() {
        const scenarios = {
            "A": { trend: "improving", currentStatus: "yellow", themes: ["Lead-Routing System in Pilotphase", "K-EWE Integration verzögert", "Inside Sales Team im Aufbau"] },
            "B": { trend: "stable", currentStatus: "green", themes: ["Reporting-Framework implementiert", "Performance-Dashboards live"] },
            "C": { trend: "declining", currentStatus: "yellow", themes: ["Recruiting-Ziele unter Plan", "Onboarding-Prozess optimiert"] },
            "D": { trend: "stable", currentStatus: "green", themes: ["Servicemodell definiert", "Pilotierung in 3 Regionen"] },
            "E": { trend: "improving", currentStatus: "green", themes: ["SEO-Maßnahmen zeigen Wirkung", "Social Media Strategie umgesetzt"] },
            "F": { trend: "critical", currentStatus: "red", themes: ["Effizienzziele gefährdet", "Kosteneinsparungen unter Plan"] },
            "G": { trend: "stable", currentStatus: "yellow", themes: ["Change-Kommunikation läuft", "Widerstand im Außendienst"] },
            "H": { trend: "starting", currentStatus: "yellow", themes: ["Programmaufsatz in Arbeit", "Anforderungsanalyse läuft"] }
        };

        const demoData = [];
        const today = new Date();

        // Generate 5 weeks of data for each workstream
        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            const scenario = scenarios[project.id];

            project.workstreams.forEach(ws => {
                for (let week = 0; week < 5; week++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - (week * 7));

                    const status = this.generateStatusForWeek(project.id, ws.id, scenario, week);
                    status.date = date.toISOString().split('T')[0];
                    status.id = `status_${project.id}_${ws.id}_${date.toISOString().split('T')[0]}`;

                    demoData.push(status);
                }
            });
        });

        this.statusData = demoData;
        this.saveData();
    },

    generateStatusForWeek(projectId, wsId, scenario, weekOffset) {
        const statuses = ['green', 'yellow', 'red'];
        const statusIndex = statuses.indexOf(scenario.currentStatus);

        // Status changes based on trend and week
        let adjustedStatus = scenario.currentStatus;
        if (scenario.trend === 'improving') {
            if (weekOffset >= 3) adjustedStatus = 'red';
            else if (weekOffset >= 1) adjustedStatus = 'yellow';
            else adjustedStatus = scenario.currentStatus === 'yellow' ? 'yellow' : 'green';
        } else if (scenario.trend === 'declining') {
            if (weekOffset >= 3) adjustedStatus = 'green';
            else if (weekOffset >= 1) adjustedStatus = 'yellow';
            else adjustedStatus = scenario.currentStatus;
        } else if (scenario.trend === 'critical') {
            adjustedStatus = weekOffset >= 2 ? 'yellow' : 'red';
        }

        // Week-specific progress texts showing real progression
        const weeklyProgress = {
            "A": [
                // Week 0 (current)
                ["Lead-Routing System: Go-Live für Region Nord erfolgreich abgeschlossen", "K-EWE Integration: 85% der Servicepunkte angebunden", "Inside Sales Team komplett (8/8 Mitarbeiter)"],
                // Week 1
                ["Lead-Routing System: UAT-Tests in Region Nord abgeschlossen", "K-EWE Integration: 70% der Servicepunkte angebunden", "Inside Sales: 7. Mitarbeiter eingestellt"],
                // Week 2
                ["Lead-Routing System: UAT-Phase gestartet", "K-EWE Integration: API-Anbindung fertiggestellt", "Inside Sales: Schulungsprogramm abgeschlossen"],
                // Week 3
                ["Lead-Routing System: Entwicklung abgeschlossen", "K-EWE Integration: 50% der Servicepunkte angebunden", "Inside Sales: 5 von 8 Mitarbeitern besetzt"],
                // Week 4
                ["Lead-Routing System: Backend-Entwicklung bei 80%", "K-EWE Integration: Pilotphase gestartet", "Inside Sales: Recruiting läuft"]
            ],
            "B": [
                ["Automatisierte Tagesberichte für alle 16 Bundesländer live", "Performance-Dashboards: Mobile App Version released", "Provisionsmodell-Optimierung: Simulation abgeschlossen"],
                ["Wochenberichte automatisiert, Tagesberichte in Entwicklung", "Performance-Dashboards: Mobile Version in Beta-Test", "Provisionsmodell: Stakeholder-Feedback eingearbeitet"],
                ["Reporting-Automatisierung: 12 von 16 Bundesländern live", "Performance-Dashboards: Drill-Down Funktion implementiert", "Provisionsmodell: Konzept finalisiert"],
                ["Reporting-Automatisierung: Template-Design abgeschlossen", "Performance-Dashboards: Rollout in 8 Regionen", "Provisionsmodell: Workshop mit Vertriebsleitern"],
                ["Reporting-Framework: Architektur definiert", "Performance-Dashboards: Prototyp vorgestellt", "Provisionsmodell: Anforderungen gesammelt"]
            ],
            "C": [
                ["32 neue Vermittler eingestellt (Ziel: 30) - übertroffen!", "Onboarding 2.0: Bundesweiter Rollout gestartet", "Digitale Schulungsplattform: 500 aktive Nutzer"],
                ["28 neue Vermittler eingestellt", "Onboarding 2.0: 5 weitere Regionen angebunden", "Digitale Schulungsplattform: Content für KV abgeschlossen"],
                ["22 neue Vermittler eingestellt", "Onboarding 2.0: Pilotregionen zeigen +40% Einarbeitungseffizienz", "Schulungsplattform: LV-Module live"],
                ["15 neue Vermittler eingestellt (unter Plan)", "Onboarding 2.0: Feedback aus Pilotregionen positiv", "Schulungsplattform: Basismodule fertig"],
                ["Recruiting unter Ziel: 10 von 25 Stellen besetzt", "Onboarding 2.0: Konzept in Pilotierung", "Schulungsplattform: Entwicklung gestartet"]
            ],
            "D": [
                ["Servicemodell in 5 Regionen live - Kundenzufriedenheit +12%", "EASY Backlog: 75% abgearbeitet", "Kundenanalytik-Tool: Produktivbetrieb gestartet"],
                ["Servicemodell: 4. und 5. Pilotregion angebunden", "EASY Backlog: 60% abgearbeitet", "Kundenanalytik-Tool: Schulungen durchgeführt"],
                ["Servicemodell: Expansion auf 5 Regionen genehmigt", "EASY Backlog: 45% abgearbeitet", "Kundenanalytik-Tool: UAT erfolgreich"],
                ["Servicemodell: 3 Pilotregionen stabil", "EASY Backlog: 30% abgearbeitet", "Kundenanalytik-Tool: Beta-Phase"],
                ["Servicemodell: Start in 3 Pilotregionen", "EASY Backlog: Priorisierung abgeschlossen", "Kundenanalytik-Tool: Entwicklung"]
            ],
            "E": [
                ["SEO: +52% organischer Traffic vs. Vorjahr", "Instagram-Kampagne: 10.000 Follower erreicht", "EMOK 3.0: Alle Features released"],
                ["SEO: +45% organischer Traffic", "Instagram-Kampagne: Launch erfolgreich", "EMOK 3.0: Letzte Features in Entwicklung"],
                ["SEO: +35% organischer Traffic", "Social Media: Content-Plan finalisiert", "EMOK 3.0: 80% der Features live"],
                ["SEO: Erste Maßnahmen zeigen Wirkung (+20%)", "Social Media: Strategie verabschiedet", "EMOK: Feature-Priorisierung"],
                ["SEO: Technical Audit abgeschlossen", "Social Media: Analyse Wettbewerb", "EMOK: Backlog-Grooming"]
            ],
            "F": [
                ["KRITISCH: Sparziele weiter verfehlt (-15% vs. Plan)", "Investitionsstopp durch Vorstand verhängt", "Notfall-Taskforce eingerichtet"],
                ["Kosteneinsparungen: -12% vs. Plan", "Investitionsplanung: Überarbeitung läuft", "Management-Review angesetzt"],
                ["Kosteneinsparungen: Erste Maßnahmen greifen nicht", "Prozessoptimierung: Quick-Wins identifiziert", "Eskalation an Vorstand vorbereitet"],
                ["Kostenanalyse abgeschlossen: Potenzial €2.5 Mio", "Effizienzmaßnahmen: 12 Handlungsfelder definiert", "Umsetzungsplan in Arbeit"],
                ["Kostenanalyse: Datenerhebung in allen Bereichen", "Benchmark mit Wettbewerb gestartet", "Projektteam aufgestellt"]
            ],
            "G": [
                ["Change-Kommunikation: 85% Awareness erreicht", "Widerstand im Außendienst reduziert", "Führungskräfte-Coaching abgeschlossen"],
                ["Townhall #3 durchgeführt (450 Teilnehmer)", "Feedback-Workshops in 8 Regionen", "FAQ-Portal live geschaltet"],
                ["Townhall #2: Fragen aus dem Außendienst beantwortet", "Regionale Change-Agents benannt", "Kommunikationsmaterialien erstellt"],
                ["Erste Townhall mit 380 Teilnehmern", "Widerstand im Außendienst identifiziert", "Change-Story entwickelt"],
                ["Change-Kommunikationsplan verabschiedet", "Stakeholder-Analyse abgeschlossen", "Kick-off mit Führungskräften"]
            ],
            "H": [
                ["Anforderungsanalyse 100% - Scope finalisiert", "IT-Architektur: Design-Review bestanden", "Vendor-Shortlist auf 3 Anbieter reduziert"],
                ["Anforderungsanalyse: 90% abgeschlossen", "IT-Architektur: Cloud vs. On-Premise entschieden", "Vendor-Evaluation läuft"],
                ["Anforderungsanalyse: 70% der Interviews geführt", "IT-Architektur: Optionen bewertet", "RFI an 8 Vendors gesendet"],
                ["Anforderungsanalyse: 50% abgeschlossen", "Fachkonzept in Abstimmung", "Marktanalyse CRM-Systeme"],
                ["Programmaufsatz genehmigt", "Anforderungsanalyse gestartet", "Projektteam formiert"]
            ]
        };

        const weeklyUpcoming = {
            "A": [
                ["Rollout Lead-Routing auf Region Süd", "K-EWE: Restliche 15% Servicepunkte", "First Line Support aufbauen"],
                ["Go-Live Region Nord vorbereiten", "K-EWE: Weitere Anbindungen", "Inside Sales: Onboarding letzter MA"],
                ["UAT-Tests abschließen", "K-EWE: API-Stabilisierung", "Schulungen durchführen"],
                ["UAT-Phase starten", "K-EWE: Entwicklung fertigstellen", "Recruiting abschließen"],
                ["Entwicklung abschließen", "K-EWE: Pilot erweitern", "Weitere Interviews führen"]
            ],
            "B": [
                ["Predictive Analytics integrieren", "Gamification-Features entwickeln", "Agenturentwicklungspläne 2.0"],
                ["Tagesberichte live schalten", "Mobile App finalisieren", "Provisionsmodell implementieren"],
                ["Automatisierung erweitern", "Mobile Beta-Test auswerten", "Simulation durchführen"],
                ["Weitere Regionen anbinden", "Mobile Version entwickeln", "Konzept präsentieren"],
                ["Template entwickeln", "Dashboard-Rollout fortsetzen", "Workshop planen"]
            ],
            "C": [
                ["Employer Branding Kampagne Q1", "Mentoring-Programm starten", "Advanced Training Module"],
                ["Bundesweiten Rollout fortsetzen", "Schulungsplattform: Sach-Module", "Recruiting-Push starten"],
                ["Weitere Regionen onboarden", "Content-Erstellung fortsetzen", "Employer Branding planen"],
                ["Pilot-Feedback umsetzen", "LV-Module fertigstellen", "Recruiting intensivieren"],
                ["Pilotierung auswerten", "Basismodule testen", "Stellenausschreibungen"]
            ],
            "D": [
                ["Rollout auf 3 weitere Regionen", "EASY Backlog abschließen", "Analytics-Erweiterungen"],
                ["Region 5 onboarden", "Backlog-Sprint", "Produktivbetrieb starten"],
                ["Genehmigung einholen", "Sprint-Planung", "Schulungen vorbereiten"],
                ["Stabilisierungsphase", "Backlog priorisieren", "UAT durchführen"],
                ["Pilotierung starten", "Backlog aufarbeiten", "Beta-Tests"]
            ],
            "E": [
                ["SEO: Voice Search Optimierung", "TikTok-Strategie entwickeln", "EMOK 4.0 Roadmap"],
                ["Instagram: Influencer-Kooperation", "EMOK: Letzte Features", "Conversion-Optimierung"],
                ["Kampagnen-Launch", "Feature-Entwicklung", "A/B-Tests"],
                ["Content-Produktion", "Feature-Priorisierung", "Analyse vertiefen"],
                ["Maßnahmen umsetzen", "Strategie finalisieren", "Development starten"]
            ],
            "F": [
                ["Taskforce-Ergebnisse präsentieren", "Sofortmaßnahmen umsetzen", "Restrukturierung planen"],
                ["Notfall-Review mit Vorstand", "Quick-Wins umsetzen", "Investitionsstopp prüfen"],
                ["Eskalation durchführen", "Quick-Win Umsetzung", "Kostenstellen analysieren"],
                ["Maßnahmenplan erstellen", "Prozesse optimieren", "Management informieren"],
                ["Potenziale validieren", "Handlungsfelder priorisieren", "Ressourcen planen"]
            ],
            "G": [
                ["Pulse-Survey durchführen", "Regional-Workshops fortsetzen", "Erfolgsgeschichten teilen"],
                ["Townhall #4 vorbereiten", "Coaching-Programm starten", "Widerstand adressieren"],
                ["Weitere Workshops planen", "FAQ erweitern", "Führungskräfte briefen"],
                ["Regionale Rollouts", "Change-Agents schulen", "Materialien verteilen"],
                ["Townhall #1 durchführen", "Workshops planen", "Story kommunizieren"]
            ],
            "H": [
                ["Vendor-Entscheidung treffen", "Projektplan finalisieren", "Kick-off Entwicklung"],
                ["Design-Review abschließen", "Shortlist erstellen", "Ressourcen planen"],
                ["Architektur finalisieren", "Vendor-Demos bewerten", "Fachkonzept fertigstellen"],
                ["Interviews fortsetzen", "Optionen bewerten", "RFI auswerten"],
                ["Interviews starten", "Konzept entwickeln", "Markt sondieren"]
            ]
        };

        const decisionTexts = {
            "A": "Entscheidung: Skalierung Lead-Routing auf alle Regionen",
            "B": "Entscheidung: Budget für Predictive Analytics Modul",
            "C": "Entscheidung: Zusätzliche Recruiting-Ressourcen",
            "D": "Entscheidung: Rollout-Geschwindigkeit Servicemodell",
            "E": "Entscheidung: TikTok-Budget Freigabe",
            "F": "DRINGEND: Freigabe Restrukturierungsmaßnahmen",
            "G": "Entscheidung: Erweiterung Change-Budget",
            "H": "Entscheidung: CRM-Vendor Auswahl"
        };

        // Get week-specific content
        const progressArr = weeklyProgress[projectId]?.[weekOffset] || scenario.themes;
        const upcomingArr = weeklyUpcoming[projectId]?.[weekOffset] || ['Nächste Schritte werden geplant'];

        // Generate risks based on status
        const risks = [];
        if (adjustedStatus !== 'green') {
            risks.push({
                type: adjustedStatus === 'red' ? 'H' : 'R',
                description: scenario.themes[0],
                identifiedDate: new Date(Date.now() - (14 + weekOffset * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                targetDate: new Date(Date.now() + (30 - weekOffset * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: weekOffset === 0 ? 'Offen' : (weekOffset < 2 ? 'In Bearbeitung' : 'Geschlossen'),
                countermeasures: 'Eskalation an Steering Committee, wöchentliches Tracking'
            });
            if (adjustedStatus === 'red' && scenario.themes[1]) {
                risks.push({
                    type: 'H',
                    description: scenario.themes[1],
                    identifiedDate: new Date(Date.now() - (7 + weekOffset * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    targetDate: new Date(Date.now() + (14 - weekOffset * 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'Offen',
                    countermeasures: 'Taskforce eingerichtet, tägliches Standup'
                });
            }
        }

        // Generate milestones with realistic dates
        const milestones = [
            {
                name: 'Konzeptphase',
                plannedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                currentEstimate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Geschlossen'
            },
            {
                name: 'Pilotierung',
                plannedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                currentEstimate: new Date(Date.now() + (adjustedStatus === 'red' ? 45 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: adjustedStatus === 'red' ? 'Verzögert' : (weekOffset < 2 ? 'Im Plan' : 'Im Plan')
            },
            {
                name: 'Go-Live',
                plannedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                currentEstimate: new Date(Date.now() + (adjustedStatus === 'red' ? 105 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'Im Plan'
            }
        ];

        return {
            projectId,
            workstreamId: wsId,
            status: {
                overall: adjustedStatus,
                budget: adjustedStatus === 'red' ? 'yellow' : 'green',
                scope: adjustedStatus,
                time: adjustedStatus,
                resources: adjustedStatus === 'green' ? 'green' : 'yellow',
                risks: risks.length > 0 ? (risks.some(r => r.type === 'H') ? 'red' : 'yellow') : 'green'
            },
            summary: progressArr,
            progress: progressArr.join('\n'),
            upcoming: upcomingArr.join('\n'),
            risksAndIssues: risks,
            milestones,
            decisions: weekOffset === 0 ? decisionTexts[projectId] : ''
        };
    },

    // Render Dashboard
    renderDashboard() {
        this.updateQuickStats();
        this.renderProjectsGrid();
    },

    updateQuickStats() {
        const latestStatuses = this.getLatestStatuses();

        let green = 0, yellow = 0, red = 0, openRisks = 0;

        latestStatuses.forEach(status => {
            if (status.status.overall === 'green') green++;
            else if (status.status.overall === 'yellow') yellow++;
            else if (status.status.overall === 'red') red++;

            openRisks += status.risksAndIssues.filter(r => r.status !== 'Geschlossen').length;
        });

        document.getElementById('stat-green').textContent = green;
        document.getElementById('stat-yellow').textContent = yellow;
        document.getElementById('stat-red').textContent = red;
        document.getElementById('stat-risks').textContent = openRisks;
    },

    getLatestStatuses() {
        const latest = {};
        this.statusData.forEach(status => {
            const key = `${status.projectId}_${status.workstreamId}`;
            if (!latest[key] || status.date > latest[key].date) {
                latest[key] = status;
            }
        });
        return Object.values(latest);
    },

    getProjectLatestStatus(projectId) {
        const projectStatuses = this.statusData
            .filter(s => s.projectId === projectId)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (projectStatuses.length === 0) return null;

        // Get the most recent status for each workstream
        const wsStatuses = {};
        projectStatuses.forEach(s => {
            if (!wsStatuses[s.workstreamId]) {
                wsStatuses[s.workstreamId] = s;
            }
        });

        // Aggregate overall status (worst case)
        const allStatuses = Object.values(wsStatuses);
        const hasRed = allStatuses.some(s => s.status.overall === 'red');
        const hasYellow = allStatuses.some(s => s.status.overall === 'yellow');

        return {
            overall: hasRed ? 'red' : (hasYellow ? 'yellow' : 'green'),
            budget: this.aggregateStatus(allStatuses.map(s => s.status.budget)),
            scope: this.aggregateStatus(allStatuses.map(s => s.status.scope)),
            time: this.aggregateStatus(allStatuses.map(s => s.status.time)),
            resources: this.aggregateStatus(allStatuses.map(s => s.status.resources)),
            risks: this.aggregateStatus(allStatuses.map(s => s.status.risks))
        };
    },

    aggregateStatus(statuses) {
        if (statuses.includes('red')) return 'red';
        if (statuses.includes('yellow')) return 'yellow';
        return 'green';
    },

    renderProjectsGrid() {
        const grid = document.getElementById('pmo-projects-grid');
        grid.innerHTML = '';

        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            const status = this.getProjectLatestStatus(project.id);
            const card = document.createElement('div');
            card.className = 'pmo-project-card';
            card.onclick = () => this.openProjectDetail(project.id);

            card.innerHTML = `
                <div class="pmo-project-header">
                    <div class="pmo-traffic-light ${status?.overall || 'gray'}"></div>
                </div>
                <h4 class="pmo-project-name">${project.name}</h4>
                <p class="pmo-project-full-name">${project.fullName}</p>
                <p class="pmo-project-workstreams">${project.workstreams.length} Workstreams</p>
                <div class="pmo-project-status-row">
                    <span class="pmo-mini-light ${status?.budget || 'gray'}" title="Budget">B</span>
                    <span class="pmo-mini-light ${status?.scope || 'gray'}" title="Scope">S</span>
                    <span class="pmo-mini-light ${status?.time || 'gray'}" title="Zeit">Z</span>
                    <span class="pmo-mini-light ${status?.resources || 'gray'}" title="Ressourcen">R</span>
                    <span class="pmo-mini-light ${status?.risks || 'gray'}" title="Risiken">I</span>
                </div>
            `;

            grid.appendChild(card);
        });
    },

    // View Management
    showView(viewId) {
        this.showViewInternal(viewId);

        // Also render dashboard if switching to it
        if (viewId === 'dashboard') this.renderDashboard();
        if (viewId === 'risiken') this.renderRisks();
        if (viewId === 'meilensteine') this.renderMilestones();
        if (viewId === 'timeline') this.renderTimeline();
        if (viewId === 'gantt') this.renderGantt();
        if (viewId === 'entscheidungen') this.renderDecisions();
        if (viewId === 'dokumente') this.renderDocumentsList();
    },

    showViewInternal(viewId) {
        document.querySelectorAll('.pmo-view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.pmo-nav-btn').forEach(b => b.classList.remove('active'));

        const view = document.getElementById(`pmo-${viewId}`);
        if (view) view.classList.add('active');

        const navBtn = document.querySelector(`[data-view="${viewId}"]`);
        if (navBtn) navBtn.classList.add('active');

        this.currentView = viewId;
    },

    // Project Detail Modal
    openProjectDetail(projectId) {
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        if (!project) return;

        document.getElementById('project-modal-title').textContent = `Projekt ${project.id}: ${project.name}`;

        const body = document.getElementById('project-modal-body');
        const status = this.getProjectLatestStatus(projectId);

        body.innerHTML = `
            <div class="pmo-project-detail-header">
                <div class="pmo-project-detail-info">
                    <h3>${project.name}</h3>
                    <p>${project.fullName}</p>
                </div>
                <div class="pmo-traffic-light ${status?.overall || 'gray'}"></div>
            </div>

            <div class="pmo-project-status-row" style="margin-bottom: 24px;">
                <span class="pmo-mini-light ${status?.budget || 'gray'}">Budget</span>
                <span class="pmo-mini-light ${status?.scope || 'gray'}">Scope</span>
                <span class="pmo-mini-light ${status?.time || 'gray'}">Zeit</span>
                <span class="pmo-mini-light ${status?.resources || 'gray'}">Ressourcen</span>
                <span class="pmo-mini-light ${status?.risks || 'gray'}">Risiken</span>
            </div>

            <h4 style="margin: 0 0 16px; color: #64748b; font-size: 13px; text-transform: uppercase;">Workstreams</h4>
            <div class="pmo-workstreams-list">
                ${project.workstreams.map(ws => {
                    const wsStatus = this.getWorkstreamLatestStatus(ws.id);
                    return `
                        <div class="pmo-workstream-item">
                            <span class="pmo-workstream-id">${ws.id}</span>
                            <span class="pmo-workstream-name">${ws.name}</span>
                            <div class="pmo-workstream-status">
                                <span class="pmo-mini-light ${wsStatus?.status?.overall || 'gray'}"></span>
                                <button class="pmo-btn-sm" onclick="event.stopPropagation(); PMO.openPPTView('${ws.id}')" style="margin-left:8px;" title="PPT-Ansicht öffnen">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <rect x="2" y="2" width="20" height="20" rx="2"/>
                                        <path d="M9 8h6M9 12h6M9 16h4"/>
                                    </svg>
                                    PPT
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="margin-top: 24px;">
                <button class="pmo-btn pmo-btn-primary" onclick="PMO.openStatusModalForProject('${projectId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Neuen Status erfassen
                </button>
            </div>
        `;

        document.getElementById('pmo-project-modal').classList.add('active');
    },

    getWorkstreamLatestStatus(wsId) {
        const wsStatuses = this.statusData
            .filter(s => s.workstreamId === wsId)
            .sort((a, b) => b.date.localeCompare(a.date));
        return wsStatuses[0] || null;
    },

    closeProjectModal() {
        document.getElementById('pmo-project-modal').classList.remove('active');
    },

    // Status Modal
    openStatusModal() {
        document.getElementById('pmo-status-modal').classList.add('active');
        this.selectedTrafficLights = {};
    },

    openStatusModalForProject(projectId) {
        this.closeProjectModal();
        this.openStatusModal();
        document.getElementById('status-project').value = projectId;
        this.updateWorkstreamOptions();
    },

    closeStatusModal() {
        document.getElementById('pmo-status-modal').classList.remove('active');
        document.getElementById('pmo-status-form').reset();
        this.selectedTrafficLights = {};
        this.resetTrafficLightSelectors();
    },

    populateProjectSelect() {
        const select = document.getElementById('status-project');
        this.PROGRAM_STRUCTURE.projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.id} - ${p.name}`;
            select.appendChild(option);
        });
    },

    updateWorkstreamOptions() {
        const projectId = document.getElementById('status-project').value;
        const wsSelect = document.getElementById('status-workstream');
        wsSelect.innerHTML = '<option value="">Workstream wählen...</option>';

        if (!projectId) return;

        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        if (!project) return;

        project.workstreams.forEach(ws => {
            const option = document.createElement('option');
            option.value = ws.id;
            option.textContent = `${ws.id} - ${ws.name}`;
            wsSelect.appendChild(option);
        });
    },

    setDefaultDate() {
        const dateInput = document.getElementById('status-date');
        dateInput.value = new Date().toISOString().split('T')[0];
    },

    saveStatus(event) {
        event.preventDefault();

        const projectId = document.getElementById('status-project').value;
        const workstreamId = document.getElementById('status-workstream').value;
        const date = document.getElementById('status-date').value;

        if (!projectId || !workstreamId || !date) {
            alert('Bitte alle Pflichtfelder ausfüllen');
            return;
        }

        const newStatus = {
            id: `status_${projectId}_${workstreamId}_${date}_${Date.now()}`,
            projectId,
            workstreamId,
            date,
            status: {
                overall: this.selectedTrafficLights.overall || 'gray',
                budget: this.selectedTrafficLights.budget || 'gray',
                scope: this.selectedTrafficLights.scope || 'gray',
                time: this.selectedTrafficLights.time || 'gray',
                resources: this.selectedTrafficLights.resources || 'gray',
                risks: this.selectedTrafficLights.risks || 'gray'
            },
            summary: [
                document.getElementById('summary-1').value,
                document.getElementById('summary-2').value,
                document.getElementById('summary-3').value,
                document.getElementById('summary-4').value
            ].filter(s => s),
            progress: document.getElementById('progress-details').value,
            upcoming: document.getElementById('upcoming-activities').value,
            risksAndIssues: [],
            milestones: [],
            decisions: document.getElementById('required-decisions').value
        };

        this.statusData.push(newStatus);
        this.saveData();
        this.renderDashboard();
        this.closeStatusModal();

        console.log('✅ Status gespeichert:', newStatus);
    },

    resetTrafficLightSelectors() {
        document.querySelectorAll('.tl-btn').forEach(btn => btn.classList.remove('active'));
    },

    // Risks View
    renderRisks() {
        const tbody = document.getElementById('pmo-risks-tbody');
        const filter = document.getElementById('risks-status-filter').value;

        const allRisks = [];
        this.statusData.forEach(status => {
            status.risksAndIssues.forEach(risk => {
                allRisks.push({
                    ...risk,
                    projectId: status.projectId,
                    workstreamId: status.workstreamId
                });
            });
        });

        const filteredRisks = filter
            ? allRisks.filter(r => r.status === filter)
            : allRisks;

        tbody.innerHTML = filteredRisks.map(risk => `
            <tr>
                <td><span class="pmo-type-badge ${risk.type}">${risk.type}</span></td>
                <td>${risk.projectId} / ${risk.workstreamId}</td>
                <td>${risk.description}</td>
                <td>${this.formatDate(risk.identifiedDate)}</td>
                <td>${this.formatDate(risk.targetDate)}</td>
                <td><span class="pmo-status-badge ${risk.status.toLowerCase()}">${risk.status}</span></td>
                <td>${risk.countermeasures}</td>
            </tr>
        `).join('') || '<tr><td colspan="7" style="text-align: center; color: #94a3b8;">Keine Risiken gefunden</td></tr>';
    },

    filterRisks() {
        this.renderRisks();
    },

    // Milestones View
    renderMilestones() {
        const tbody = document.getElementById('pmo-milestones-tbody');
        const filter = document.getElementById('milestones-status-filter').value;

        const allMilestones = [];
        this.statusData.forEach(status => {
            status.milestones.forEach(ms => {
                allMilestones.push({
                    ...ms,
                    projectId: status.projectId,
                    workstreamId: status.workstreamId
                });
            });
        });

        // Remove duplicates by name per workstream
        const uniqueMilestones = [];
        const seen = new Set();
        allMilestones.forEach(ms => {
            const key = `${ms.workstreamId}_${ms.name}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueMilestones.push(ms);
            }
        });

        const filteredMilestones = filter
            ? uniqueMilestones.filter(m => m.status === filter)
            : uniqueMilestones;

        tbody.innerHTML = filteredMilestones.map(ms => `
            <tr>
                <td>${ms.projectId}</td>
                <td>${ms.workstreamId}</td>
                <td>${ms.name}</td>
                <td>${this.formatDate(ms.plannedDate)}</td>
                <td>${this.formatDate(ms.currentEstimate)}</td>
                <td><span class="pmo-status-badge ${ms.status.toLowerCase().replace(' ', '-')}">${ms.status}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align: center; color: #94a3b8;">Keine Meilensteine gefunden</td></tr>';
    },

    filterMilestones() {
        this.renderMilestones();
    },

    // Timeline View
    renderTimeline() {
        const container = document.getElementById('pmo-timeline-container');
        const filterSelect = document.getElementById('timeline-project-filter');

        // Populate filter if empty
        if (filterSelect.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                filterSelect.appendChild(option);
            });
        }

        const filter = filterSelect.value;
        let statuses = [...this.statusData].sort((a, b) => b.date.localeCompare(a.date));

        if (filter) {
            statuses = statuses.filter(s => s.projectId === filter);
        }

        // Group by date
        const byDate = {};
        statuses.forEach(s => {
            if (!byDate[s.date]) byDate[s.date] = [];
            byDate[s.date].push(s);
        });

        const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a)).slice(0, 20);

        container.innerHTML = dates.map(date => `
            <div class="pmo-timeline-item">
                <div class="pmo-timeline-date">${this.formatDate(date)}</div>
                <div class="pmo-timeline-content">
                    ${byDate[date].map(s => `
                        <div style="margin-bottom: 8px;">
                            <div class="pmo-timeline-project">
                                <span class="pmo-mini-light ${s.status.overall}" style="margin-right: 8px;"></span>
                                ${s.projectId} / ${s.workstreamId}
                            </div>
                            <div class="pmo-timeline-summary">${s.summary[0] || 'Kein Summary'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') || '<p style="text-align: center; color: #94a3b8;">Keine Timeline-Einträge gefunden</p>';
    },

    filterTimeline() {
        this.renderTimeline();
    },

    // Search
    openSearch() {
        document.getElementById('pmo-search-modal').classList.add('active');
        document.getElementById('pmo-search-input').focus();
    },

    closeSearch() {
        document.getElementById('pmo-search-modal').classList.remove('active');
        document.getElementById('pmo-search-input').value = '';
        document.getElementById('pmo-search-results').innerHTML = '<p class="pmo-search-hint">Geben Sie einen Suchbegriff ein...</p>';
    },

    performSearch() {
        const query = document.getElementById('pmo-search-input').value.toLowerCase().trim();
        const resultsContainer = document.getElementById('pmo-search-results');

        if (query.length < 2) {
            resultsContainer.innerHTML = '<p class="pmo-search-hint">Geben Sie mindestens 2 Zeichen ein...</p>';
            return;
        }

        const results = [];

        // Search in status data
        this.statusData.forEach(status => {
            const searchableText = [
                ...status.summary,
                status.progress,
                status.upcoming,
                status.decisions,
                ...status.risksAndIssues.map(r => r.description),
                ...status.milestones.map(m => m.name)
            ].join(' ').toLowerCase();

            if (searchableText.includes(query)) {
                results.push({
                    type: 'status',
                    title: `${status.projectId} / ${status.workstreamId} - ${this.formatDate(status.date)}`,
                    context: this.highlightMatch(searchableText, query),
                    data: status
                });
            }
        });

        // Search in projects
        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            if (project.name.toLowerCase().includes(query) ||
                project.fullName.toLowerCase().includes(query)) {
                results.push({
                    type: 'project',
                    title: `Projekt ${project.id}: ${project.name}`,
                    context: project.fullName,
                    data: project
                });
            }
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="pmo-search-hint">Keine Ergebnisse gefunden</p>';
            return;
        }

        resultsContainer.innerHTML = results.slice(0, 20).map(r => `
            <div class="pmo-search-result-item" onclick="PMO.handleSearchResultClick('${r.type}', '${r.data.id || r.data.projectId}')">
                <div class="pmo-search-result-title">${r.title}</div>
                <div class="pmo-search-result-context">${r.context.substring(0, 150)}...</div>
            </div>
        `).join('');
    },

    highlightMatch(text, query) {
        const index = text.toLowerCase().indexOf(query);
        if (index === -1) return text;

        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        let excerpt = text.substring(start, end);

        if (start > 0) excerpt = '...' + excerpt;
        if (end < text.length) excerpt = excerpt + '...';

        return excerpt.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
    },

    handleSearchResultClick(type, id) {
        // Save search query for highlighting before closing search
        const searchQuery = document.getElementById('pmo-search-input')?.value?.trim() || null;
        this.closeSearch();

        if (type === 'project') {
            this.openProjectDetail(id);
        } else if (type === 'status') {
            // Open PPT view directly for the found status with search highlighting
            this.pptSearchHighlight = searchQuery;
            this.openPPTViewForStatus(id);
        }
    },

    // Setup Event Listeners
    setupEventListeners() {
        // Traffic light selectors
        document.querySelectorAll('.pmo-traffic-light-selector').forEach(selector => {
            const field = selector.dataset.field;
            selector.querySelectorAll('.tl-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    selector.querySelectorAll('.tl-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.selectedTrafficLights[field] = btn.dataset.value;
                });
            });
        });

        // Character counters
        document.querySelectorAll('.pmo-input-with-counter input, .pmo-input-with-counter textarea').forEach(input => {
            const counter = input.parentElement.querySelector('.pmo-char-counter .current');
            const max = parseInt(input.getAttribute('maxlength'));

            input.addEventListener('input', () => {
                const current = input.value.length;
                counter.textContent = current;

                const counterEl = input.parentElement.querySelector('.pmo-char-counter');
                counterEl.classList.remove('warning', 'error');

                if (current >= max) {
                    counterEl.classList.add('error');
                } else if (current >= max * 0.8) {
                    counterEl.classList.add('warning');
                }
            });
        });
    },

    // Utility
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },

    // ========================================
    // GANTT CHART
    // ========================================
    ganttZoom: 'quarter',

    setGanttZoom(zoom) {
        this.ganttZoom = zoom;
        document.querySelectorAll('.pmo-gantt-zoom .pmo-btn-sm').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.renderGantt();
    },

    renderGantt() {
        const container = document.getElementById('pmo-gantt-container');
        const projectFilter = document.getElementById('gantt-project-filter');
        const statusFilter = document.getElementById('gantt-status-filter');

        // Populate project filter if empty
        if (projectFilter.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                projectFilter.appendChild(option);
            });
        }

        // Collect all milestones
        let allMilestones = [];
        this.statusData.forEach(status => {
            status.milestones.forEach(ms => {
                allMilestones.push({
                    ...ms,
                    projectId: status.projectId,
                    workstreamId: status.workstreamId
                });
            });
        });

        // Filter
        if (projectFilter.value) {
            allMilestones = allMilestones.filter(m => m.projectId === projectFilter.value);
        }
        if (statusFilter.value) {
            allMilestones = allMilestones.filter(m => m.status === statusFilter.value);
        }

        // Remove duplicates
        const seen = new Set();
        allMilestones = allMilestones.filter(ms => {
            const key = `${ms.workstreamId}_${ms.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Calculate date range
        const today = new Date();
        let startDate, endDate, months;

        if (this.ganttZoom === 'month') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
            months = 3;
        } else if (this.ganttZoom === 'quarter') {
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 4, 0);
            months = 5;
        } else {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            months = 12;
        }

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const todayOffset = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

        // Generate month headers
        const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        let monthHeaders = '';
        for (let i = 0; i < months; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            monthHeaders += `<div class="gantt-month">${monthNames[d.getMonth()]} ${d.getFullYear()}</div>`;
        }

        // Generate rows
        let rows = '';
        allMilestones.forEach(ms => {
            const planned = new Date(ms.plannedDate);
            const current = new Date(ms.currentEstimate || ms.plannedDate);

            const plannedOffset = Math.ceil((planned - startDate) / (1000 * 60 * 60 * 24));
            const currentOffset = Math.ceil((current - startDate) / (1000 * 60 * 60 * 24));
            const barWidth = Math.max(20, Math.abs(currentOffset - plannedOffset) + 10);

            let colorClass = 'green';
            if (ms.status === 'Verzögert') colorClass = 'red';
            else if (ms.status === 'Geschlossen') colorClass = 'gray';
            else if (current > planned) colorClass = 'yellow';

            const leftPercent = Math.max(0, Math.min(100, (Math.min(plannedOffset, currentOffset) / totalDays) * 100));
            const widthPercent = Math.max(2, (barWidth / totalDays) * 100);

            rows += `
                <div class="gantt-row">
                    <div class="gantt-row-label">
                        <span class="project-id">${ms.workstreamId}</span>
                        <span class="milestone-name">${ms.name}</span>
                    </div>
                    <div class="gantt-row-timeline">
                        <div class="gantt-bar ${colorClass}" style="left: ${leftPercent}%; width: ${widthPercent}%;" title="${ms.name}: ${this.formatDate(ms.plannedDate)} → ${this.formatDate(ms.currentEstimate)}">
                            ${ms.status === 'Geschlossen' ? '✓' : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        const todayLine = (todayOffset >= 0 && todayOffset <= totalDays)
            ? `<div class="gantt-today-line" style="left: calc(200px + ${(todayOffset / totalDays) * 100}% - 1px);"></div>`
            : '';

        container.innerHTML = `
            <div class="gantt-chart">
                <div class="gantt-header">
                    <div class="gantt-label-column">Meilenstein</div>
                    <div class="gantt-timeline">${monthHeaders}</div>
                </div>
                ${rows || '<p style="text-align:center;color:#94a3b8;padding:40px;">Keine Meilensteine gefunden</p>'}
                ${todayLine}
            </div>
        `;
    },

    // ========================================
    // DECISIONS MANAGEMENT
    // ========================================
    decisions: [],
    decisionView: 'kanban',

    loadDecisions() {
        const stored = localStorage.getItem('pmo_decisions');
        if (stored) {
            this.decisions = JSON.parse(stored);
        } else {
            this.generateDemoDecisions();
        }
    },

    saveDecisions() {
        localStorage.setItem('pmo_decisions', JSON.stringify(this.decisions));
    },

    generateDemoDecisions() {
        this.decisions = [
            { id: 'dec1', type: 'strategic', title: 'Budget-Freigabe Phase 2 Rollout', projectId: 'A', dueDate: '2026-01-10', status: 'pending', description: 'Freigabe des Budgets für den Rollout der zweiten Phase', requestedBy: 'Projektleiter A', owner: 'Programmleitung' },
            { id: 'dec2', type: 'strategic', title: 'Ressourcen-Aufstockung Recruiting', projectId: 'C', dueDate: '2026-01-05', status: 'escalated', description: 'Zusätzliche Recruiter für Zielerreichung', requestedBy: 'Projektleiter C', owner: 'Vorstand' },
            { id: 'dec3', type: 'tactical', title: 'Vendor-Auswahl CRM-Integration', projectId: 'H', dueDate: '2026-01-15', status: 'pending', description: 'Auswahl des Implementierungspartners', requestedBy: 'IT-Leitung', owner: 'Programmleitung' },
            { id: 'dec4', type: 'operational', title: 'Schulungskonzept Außendienst', projectId: 'G', dueDate: '2026-01-12', status: 'pending', description: 'Finale Freigabe des Schulungskonzepts', requestedBy: 'Change Manager', owner: 'Projektleitung' },
            { id: 'dec5', type: 'tactical', title: 'Pilotregionen Auswahl', projectId: 'A', dueDate: '2025-12-28', status: 'approved', description: 'Festlegung der 3 Pilotregionen', requestedBy: 'Projektleiter A', owner: 'Programmleitung', result: 'München, Hamburg, Berlin ausgewählt' },
            { id: 'dec6', type: 'tactical', title: 'Reporting-Format Standardisierung', projectId: 'B', dueDate: '2025-12-20', status: 'approved', description: 'Einheitliches Format für alle Reports', requestedBy: 'Projektleiter B', owner: 'Programmleitung', result: 'Neues Template genehmigt' }
        ];
        this.saveDecisions();
    },

    setDecisionView(view) {
        this.decisionView = view;
        document.querySelectorAll('.pmo-view-toggle .pmo-btn-sm').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        if (view === 'kanban') {
            document.getElementById('pmo-decisions-kanban').style.display = 'grid';
            document.getElementById('pmo-decisions-list').style.display = 'none';
        } else {
            document.getElementById('pmo-decisions-kanban').style.display = 'none';
            document.getElementById('pmo-decisions-list').style.display = 'block';
        }
        this.renderDecisions();
    },

    renderDecisions() {
        this.loadDecisions();
        const projectFilter = document.getElementById('decisions-project-filter');

        // Populate filter if empty
        if (projectFilter.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                projectFilter.appendChild(option);
            });
        }

        let filtered = this.decisions;
        if (projectFilter.value) {
            filtered = filtered.filter(d => d.projectId === projectFilter.value);
        }

        if (this.decisionView === 'kanban') {
            this.renderKanban(filtered);
        } else {
            this.renderDecisionsList(filtered);
        }
    },

    renderKanban(decisions) {
        const columns = ['pending', 'escalated', 'approved', 'rejected'];
        const today = new Date().toISOString().split('T')[0];

        columns.forEach(status => {
            const container = document.getElementById(`kanban-${status}`);
            const count = document.getElementById(`kanban-count-${status}`);
            const items = decisions.filter(d => d.status === status);

            count.textContent = items.length;
            container.innerHTML = items.map(d => {
                const isOverdue = d.dueDate < today && status === 'pending';
                const typeLabels = { strategic: 'Strategisch', tactical: 'Taktisch', operational: 'Operativ' };

                return `
                    <div class="kanban-card ${d.type}" onclick="PMO.editDecision('${d.id}')">
                        <div class="kanban-card-type">${typeLabels[d.type]}</div>
                        <div class="kanban-card-title">${d.title}</div>
                        <div class="kanban-card-project">${d.projectId} - ${this.getProjectName(d.projectId)}</div>
                        <div class="kanban-card-due ${isOverdue ? 'overdue' : ''}">
                            Fällig: ${this.formatDate(d.dueDate)} ${isOverdue ? '⚠️' : ''}
                        </div>
                    </div>
                `;
            }).join('') || '<p style="color:#94a3b8;font-size:13px;text-align:center;padding:20px;">Keine Einträge</p>';
        });
    },

    renderDecisionsList(decisions) {
        const tbody = document.getElementById('pmo-decisions-tbody');
        const typeLabels = { strategic: 'Strategisch', tactical: 'Taktisch', operational: 'Operativ' };
        const statusLabels = { pending: 'Ausstehend', escalated: 'Eskaliert', approved: 'Genehmigt', rejected: 'Abgelehnt', deferred: 'Vertagt' };

        tbody.innerHTML = decisions.map(d => `
            <tr>
                <td><span class="pmo-type-badge" style="background:${d.type === 'strategic' ? '#E30613' : d.type === 'tactical' ? '#2563eb' : '#64748b'};color:white;">${typeLabels[d.type].charAt(0)}</span></td>
                <td>${d.title}</td>
                <td>${d.projectId}</td>
                <td>${this.formatDate(d.dueDate)}</td>
                <td><span class="pmo-status-badge ${d.status}">${statusLabels[d.status]}</span></td>
                <td><button class="pmo-btn-sm" onclick="PMO.editDecision('${d.id}')">Bearbeiten</button></td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Keine Entscheidungen gefunden</td></tr>';
    },

    getProjectName(id) {
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === id);
        return project ? project.name : id;
    },

    openNewDecisionModal() {
        document.getElementById('decision-modal-title').textContent = 'Neue Entscheidung';
        document.getElementById('pmo-decision-form').reset();
        document.getElementById('decision-id').value = '';

        // Populate project select
        const projectSelect = document.getElementById('decision-project');
        if (projectSelect.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                projectSelect.appendChild(option);
            });
        }

        document.getElementById('decision-due-date').value = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        document.getElementById('pmo-decision-modal').classList.add('active');
    },

    editDecision(id) {
        const decision = this.decisions.find(d => d.id === id);
        if (!decision) return;

        document.getElementById('decision-modal-title').textContent = 'Entscheidung bearbeiten';
        document.getElementById('decision-id').value = decision.id;
        document.getElementById('decision-type').value = decision.type;
        document.getElementById('decision-title').value = decision.title;
        document.getElementById('decision-description').value = decision.description || '';
        document.getElementById('decision-due-date').value = decision.dueDate;
        document.getElementById('decision-status').value = decision.status;
        document.getElementById('decision-requested-by').value = decision.requestedBy || '';
        document.getElementById('decision-owner').value = decision.owner || '';
        document.getElementById('decision-result').value = decision.result || '';

        // Populate and set project
        const projectSelect = document.getElementById('decision-project');
        if (projectSelect.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                projectSelect.appendChild(option);
            });
        }
        projectSelect.value = decision.projectId;

        document.getElementById('pmo-decision-modal').classList.add('active');
    },

    closeDecisionModal() {
        document.getElementById('pmo-decision-modal').classList.remove('active');
    },

    saveDecision(event) {
        event.preventDefault();

        const id = document.getElementById('decision-id').value || `dec_${Date.now()}`;
        const decision = {
            id,
            type: document.getElementById('decision-type').value,
            title: document.getElementById('decision-title').value,
            description: document.getElementById('decision-description').value,
            projectId: document.getElementById('decision-project').value,
            dueDate: document.getElementById('decision-due-date').value,
            status: document.getElementById('decision-status').value,
            requestedBy: document.getElementById('decision-requested-by').value,
            owner: document.getElementById('decision-owner').value,
            result: document.getElementById('decision-result').value
        };

        const existingIndex = this.decisions.findIndex(d => d.id === id);
        if (existingIndex >= 0) {
            this.decisions[existingIndex] = decision;
        } else {
            this.decisions.push(decision);
        }

        this.saveDecisions();
        this.renderDecisions();
        this.closeDecisionModal();
    },

    // ========================================
    // PPT STATUS VIEW
    // ========================================
    pptCurrentStatus: null,
    pptStatusHistory: [],
    pptCurrentIndex: 0,
    pptSearchHighlight: null,  // Search term to highlight in PPT view

    openPPTView(workstreamId, specificStatusId = null) {
        const wsStatuses = this.statusData
            .filter(s => s.workstreamId === workstreamId)
            .sort((a, b) => b.date.localeCompare(a.date));

        if (wsStatuses.length === 0) {
            alert('Keine Status-Daten für diesen Workstream gefunden.');
            return;
        }

        this.pptStatusHistory = wsStatuses;

        // If a specific status ID is given, navigate to that status
        if (specificStatusId) {
            const idx = wsStatuses.findIndex(s => s.id === specificStatusId);
            this.pptCurrentIndex = idx >= 0 ? idx : 0;
        } else {
            this.pptCurrentIndex = 0;
        }

        this.renderPPTSlide();
        document.getElementById('pmo-ppt-modal').classList.add('active');
    },

    // Open PPT view for a specific status by its ID
    openPPTViewForStatus(statusId) {
        const status = this.statusData.find(s => s.id === statusId);
        if (!status) {
            alert('Status nicht gefunden.');
            return;
        }
        this.openPPTView(status.workstreamId, statusId);
    },

    // Highlight search term in text (for PPT view)
    highlightSearchTerm(text) {
        if (!text || !this.pptSearchHighlight) return text;
        const query = this.pptSearchHighlight;
        try {
            return text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
        } catch (e) {
            return text;
        }
    },

    renderPPTSlide() {
        const status = this.pptStatusHistory[this.pptCurrentIndex];
        if (!status) return;

        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === status.projectId);
        const ws = project?.workstreams.find(w => w.id === status.workstreamId);

        document.getElementById('ppt-current-date').textContent = `Status vom ${this.formatDate(status.date)}`;

        // Update navigation buttons
        document.getElementById('ppt-prev-btn').disabled = this.pptCurrentIndex >= this.pptStatusHistory.length - 1;
        document.getElementById('ppt-next-btn').disabled = this.pptCurrentIndex <= 0;

        // History dots (last 4 weeks)
        const historyDots = this.pptStatusHistory.slice(0, 4).map((s, i) => {
            return `<div class="dot ${s.status.overall}" title="${this.formatDate(s.date)}">${i === 0 ? 'A' : `-${i}`}</div>`;
        }).join('');

        const slideContent = `
            <div class="ppt-header">
                <div class="ppt-header-left">
                    <h2>STATUS TEILPROJEKTE</h2>
                    <h1>Teilprojekt ${status.workstreamId}: ${ws?.name || ''}</h1>
                </div>
                <div class="ppt-header-right">
                    Status vom: ${this.formatDate(status.date)}
                </div>
            </div>

            <div class="ppt-content">
                <div class="ppt-left">
                    <div class="ppt-summary">
                        <h3>Management Summary</h3>
                        <ul>
                            ${status.summary.map(s => `<li>${this.highlightSearchTerm(s)}</li>`).join('') || '<li>Kein Summary vorhanden</li>'}
                        </ul>
                    </div>

                    <div class="ppt-sections">
                        <div class="ppt-section">
                            <h4>Projektfortschritt gegenüber Vorwoche</h4>
                            <p>${this.highlightSearchTerm(status.progress) || 'Keine Angabe'}</p>
                        </div>

                        <div class="ppt-section">
                            <h4>Anstehende Aktivitäten</h4>
                            <p>${this.highlightSearchTerm(status.upcoming) || 'Keine Angabe'}</p>
                        </div>

                        <div class="ppt-section-grid">
                            <div class="ppt-section">
                                <h4>Risiken & Herausforderungen</h4>
                                ${status.risksAndIssues.length > 0
                                    ? status.risksAndIssues.map(r => `
                                        <p style="margin-bottom:8px;">
                                            <strong>${r.type}:</strong> ${this.highlightSearchTerm(r.description)}
                                            <br><small style="color:#64748b;">${r.status} | ${this.formatDate(r.targetDate)}</small>
                                        </p>
                                    `).join('')
                                    : '<p style="color:#94a3b8;">Keine Risiken</p>'
                                }
                            </div>
                            <div class="ppt-section">
                                <h4>Meilensteine</h4>
                                ${status.milestones.length > 0
                                    ? status.milestones.map(m => `
                                        <p style="margin-bottom:8px;">
                                            ${m.status === 'Geschlossen' ? '✓' : m.status === 'Verzögert' ? '⚠️' : '⏳'} ${this.highlightSearchTerm(m.name)}
                                            <br><small style="color:#64748b;">${this.formatDate(m.currentEstimate || m.plannedDate)}</small>
                                        </p>
                                    `).join('')
                                    : '<p style="color:#94a3b8;">Keine Meilensteine</p>'
                                }
                            </div>
                        </div>

                        ${status.decisions ? `
                            <div class="ppt-section">
                                <h4>Erforderliche Entscheidungen</h4>
                                <p>${this.highlightSearchTerm(status.decisions)}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="ppt-status-panel">
                    <div class="ppt-main-status">
                        <div class="label">Status</div>
                        <div class="traffic-light ${status.status.overall}"></div>
                    </div>

                    <div class="ppt-sub-status">
                        <div class="ppt-sub-status-item"><div class="dot ${status.status.budget}"></div> Budget</div>
                        <div class="ppt-sub-status-item"><div class="dot ${status.status.scope}"></div> Scope</div>
                        <div class="ppt-sub-status-item"><div class="dot ${status.status.time}"></div> Zeit</div>
                        <div class="ppt-sub-status-item"><div class="dot ${status.status.resources}"></div> Ressourcen</div>
                        <div class="ppt-sub-status-item"><div class="dot ${status.status.risks}"></div> Risiken</div>
                    </div>

                    <div class="ppt-history">
                        <div class="ppt-history-label">Vorwochen</div>
                        <div class="ppt-history-dots">
                            ${historyDots}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ppt-slide-content').innerHTML = slideContent;
    },

    pptPrevWeek() {
        if (this.pptCurrentIndex < this.pptStatusHistory.length - 1) {
            this.pptCurrentIndex++;
            this.renderPPTSlide();
        }
    },

    pptNextWeek() {
        if (this.pptCurrentIndex > 0) {
            this.pptCurrentIndex--;
            this.renderPPTSlide();
        }
    },

    closePPTModal() {
        document.getElementById('pmo-ppt-modal').classList.remove('active');
        this.pptSearchHighlight = null;  // Clear search highlight
    },

    editPPTStatus() {
        const status = this.pptStatusHistory[this.pptCurrentIndex];
        if (!status) return;

        this.closePPTModal();
        this.openStatusModalForProject(status.projectId);
        document.getElementById('status-workstream').value = status.workstreamId;
    },

    async exportPPT(workstreamId = null) {
        // Get status - either from PPT modal or from current workstream
        let status = null;

        if (this.pptStatusHistory && this.pptStatusHistory[this.pptCurrentIndex]) {
            status = this.pptStatusHistory[this.pptCurrentIndex];
        } else if (workstreamId || this.currentWorkstream) {
            const wsId = workstreamId || this.currentWorkstream;
            status = this.getWorkstreamLatestStatus(wsId);
        }

        if (!status) {
            alert('Kein Status zum Exportieren vorhanden. Bitte zuerst einen Status erstellen.');
            return;
        }

        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === status.projectId);
        const ws = project?.workstreams.find(w => w.id === status.workstreamId);

        try {
            // Show loading indicator
            const exportBtn = document.querySelector('[onclick="PMO.exportPPT()"]');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<span>Exportiere...</span>';
            }

            // Fetch the template PPTX
            const templateResponse = await fetch('/2025_CPE_Status_Template.pptx');
            if (!templateResponse.ok) {
                throw new Error('Template nicht gefunden');
            }
            const templateBuffer = await templateResponse.arrayBuffer();

            // Load with JSZip
            const zip = await JSZip.loadAsync(templateBuffer);

            // Get slide XML
            const slideXmlFile = zip.file('ppt/slides/slide1.xml');
            if (!slideXmlFile) {
                throw new Error('Slide nicht gefunden im Template');
            }
            let slideXml = await slideXmlFile.async('string');

            // Prepare content
            const title = `Teilprojekt ${status.workstreamId}: ${ws?.name || ''}`;
            const progressBullets = status.progress ? status.progress.split('\n').filter(l => l.trim()) : ['Keine Angaben'];
            const upcomingBullets = status.upcoming ? status.upcoming.split('\n').filter(l => l.trim()) : ['Keine Angaben'];
            const riskBullets = status.risksAndIssues?.length > 0
                ? status.risksAndIssues.map(r => `${r.type}: ${r.description}`)
                : ['Keine offenen Risiken'];
            const milestoneBullets = status.milestones?.length > 0
                ? status.milestones.map(m => `${m.name} - ${this.formatDate(m.plannedDate)} (${m.status || 'Im Plan'})`)
                : ['Keine Meilensteine'];
            const decisions = status.decisions || 'Keine Entscheidungen erforderlich';

            // Replace title - remove CPE prefix
            slideXml = slideXml.replace(
                /<a:t>CPE – Teilprojekt<\/a:t>/g,
                `<a:t>${this.escapeXml(title)}</a:t>`
            );
            // Also replace CPE STATUS header
            slideXml = slideXml.replace(
                /<a:t>CPE STATUS TEILPROJEKTE<\/a:t>/g,
                `<a:t>STATUS TEILPROJEKTE</a:t>`
            );

            // Replace Xxx placeholders with actual content (Projektfortschritt, Aktivitäten, Risiken)
            let xxxIndex = 0;
            const xxxBullets = [
                ...progressBullets.slice(0, 3),
                ...upcomingBullets.slice(0, 3),
                ...riskBullets.slice(0, 3)
            ];

            slideXml = slideXml.replace(/<a:t>Xxx<\/a:t>/g, () => {
                const content = xxxBullets[xxxIndex] || '';
                xxxIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Replace XX placeholders for Management Summary
            let xxIndex = 0;
            const summaryBullets = Array.isArray(status.summary) ? status.summary : progressBullets;
            slideXml = slideXml.replace(/<a:t>XX<\/a:t>/g, () => {
                const content = summaryBullets[xxIndex] || '';
                xxIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Replace milestone placeholders in table
            // Template uses "MS 1", "MS 2", "MS 3" as placeholders for milestone names
            // and "TT.MM.JJ" for dates
            if (status.milestones && status.milestones.length > 0) {
                status.milestones.forEach((ms, i) => {
                    const msNum = i + 1;
                    const msName = this.escapeXml(ms.name);
                    const msPlanned = this.escapeXml(this.formatDate(ms.plannedDate));
                    const msCurrent = this.escapeXml(this.formatDate(ms.currentEstimate || ms.plannedDate));
                    const msStatus = this.escapeXml(ms.status || 'Im Plan');

                    // Replace milestone name placeholder
                    slideXml = slideXml.replace(
                        new RegExp(`<a:t>MS ${msNum}</a:t>`, 'g'),
                        `<a:t>${msName}</a:t>`
                    );

                    // Replace milestone date placeholders (pattern: TT.MM.JJ or DD.MM.YY)
                    // First occurrence per milestone = planned, second = current estimate
                });
            }

            // Replace date placeholders (TT.MM.JJ pattern)
            let dateIndex = 0;
            const allDates = [];
            if (status.milestones) {
                status.milestones.forEach(ms => {
                    allDates.push(this.formatDate(ms.plannedDate));
                    allDates.push(this.formatDate(ms.currentEstimate || ms.plannedDate));
                });
            }
            slideXml = slideXml.replace(/<a:t>TT\.MM\.JJ<\/a:t>/g, () => {
                const date = allDates[dateIndex] || '';
                dateIndex++;
                return `<a:t>${this.escapeXml(date)}</a:t>`;
            });

            // Replace milestone status placeholders
            let statusIndex = 0;
            const milestoneStatuses = status.milestones ? status.milestones.map(ms => ms.status || 'Im Plan') : [];
            slideXml = slideXml.replace(/<a:t>(Im Plan|Offen)<\/a:t>/g, () => {
                const msStatus = milestoneStatuses[statusIndex] || 'Im Plan';
                statusIndex++;
                return `<a:t>${this.escapeXml(msStatus)}</a:t>`;
            });

            // Replace decision placeholder if exists
            if (decisions) {
                slideXml = slideXml.replace(
                    /<a:t>Entscheidung[^<]*<\/a:t>/g,
                    `<a:t>${this.escapeXml(decisions)}</a:t>`
                );
            }

            // Update the slide
            zip.file('ppt/slides/slide1.xml', slideXml);

            // Generate modified PPTX
            const modifiedPptx = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 9 }
            });

            // Download
            const filename = `Status_${status.workstreamId}_${status.date}.pptx`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(modifiedPptx);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            console.log(`PPTX exported: ${filename}`);

        } catch (error) {
            console.error('PPTX Export Error:', error);
            alert('Fehler beim PPTX-Export: ' + error.message);
        } finally {
            // Reset button
            const exportBtn = document.querySelector('[onclick="PMO.exportPPT()"]');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    PPTX
                `;
            }
        }
    },

    // Helper to escape XML special characters
    escapeXml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },

    exportPDF() {
        window.print();
    },

    // ========================================
    // DOCUMENTS / AI ASSISTANT
    // ========================================
    documents: [],
    aiMessages: [],

    loadDocuments() {
        const stored = localStorage.getItem('pmo_documents');
        if (stored) {
            this.documents = JSON.parse(stored);
        }
    },

    saveDocuments() {
        localStorage.setItem('pmo_documents', JSON.stringify(this.documents));
    },

    handleDragOver(event) {
        event.preventDefault();
        document.getElementById('pmo-upload-zone').classList.add('dragover');
    },

    handleDragLeave(event) {
        document.getElementById('pmo-upload-zone').classList.remove('dragover');
    },

    handleDrop(event) {
        event.preventDefault();
        document.getElementById('pmo-upload-zone').classList.remove('dragover');
        const files = event.dataTransfer.files;
        this.processFiles(files);
    },

    handleFileSelect(event) {
        const files = event.target.files;
        this.processFiles(files);
    },

    processFiles(files) {
        Array.from(files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            const doc = {
                id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                type: ext,
                size: file.size,
                uploadDate: new Date().toISOString(),
                projectId: '',
                content: '' // In a real app, we would extract text content here
            };
            this.documents.push(doc);
        });

        this.saveDocuments();
        this.renderDocumentsList();
    },

    renderDocumentsList() {
        this.loadDocuments();
        const container = document.getElementById('pmo-docs-list');
        const projectFilter = document.getElementById('docs-project-filter');
        const typeFilter = document.getElementById('docs-type-filter');

        // Populate project filter
        if (projectFilter.options.length === 1) {
            this.PROGRAM_STRUCTURE.projects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.id;
                option.textContent = `${p.id} - ${p.name}`;
                projectFilter.appendChild(option);
            });
        }

        let filtered = this.documents;
        if (projectFilter.value) {
            filtered = filtered.filter(d => d.projectId === projectFilter.value);
        }
        if (typeFilter.value) {
            filtered = filtered.filter(d => d.type === typeFilter.value);
        }

        if (filtered.length === 0) {
            container.innerHTML = '<p class="pmo-docs-empty">Noch keine Dokumente hochgeladen</p>';
            return;
        }

        container.innerHTML = filtered.map(doc => {
            const sizeKB = Math.round(doc.size / 1024);
            return `
                <div class="pmo-doc-item" onclick="PMO.previewDocument('${doc.id}')">
                    <div class="pmo-doc-icon ${doc.type}">${doc.type.toUpperCase()}</div>
                    <div class="pmo-doc-info">
                        <div class="pmo-doc-name">${doc.name}</div>
                        <div class="pmo-doc-meta">${sizeKB} KB • ${this.formatDate(doc.uploadDate)}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterDocuments() {
        this.renderDocumentsList();
    },

    searchDocuments() {
        const query = document.getElementById('docs-search-input').value.toLowerCase();
        if (query.length < 2) {
            this.renderDocumentsList();
            return;
        }

        const container = document.getElementById('pmo-docs-list');
        const filtered = this.documents.filter(d => d.name.toLowerCase().includes(query));

        container.innerHTML = filtered.map(doc => {
            const sizeKB = Math.round(doc.size / 1024);
            return `
                <div class="pmo-doc-item">
                    <div class="pmo-doc-icon ${doc.type}">${doc.type.toUpperCase()}</div>
                    <div class="pmo-doc-info">
                        <div class="pmo-doc-name">${doc.name}</div>
                        <div class="pmo-doc-meta">${sizeKB} KB • ${this.formatDate(doc.uploadDate)}</div>
                    </div>
                </div>
            `;
        }).join('') || '<p class="pmo-docs-empty">Keine Dokumente gefunden</p>';
    },

    previewDocument(id) {
        const doc = this.documents.find(d => d.id === id);
        if (doc) {
            this.addAIMessage('assistant', `Du hast "${doc.name}" ausgewählt. Stelle mir Fragen zu diesem Dokument.`);
        }
    },

    askAI(question) {
        document.getElementById('pmo-ai-input').value = question;
        this.sendAIMessage();
    },

    sendAIMessage() {
        const input = document.getElementById('pmo-ai-input');
        const message = input.value.trim();
        if (!message) return;

        this.addAIMessage('user', message);
        input.value = '';

        // Simulate AI response (in real app, call API)
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addAIMessage('assistant', response);
        }, 500);
    },

    addAIMessage(role, content) {
        const container = document.getElementById('pmo-ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${role}`;
        messageDiv.innerHTML = `<div class="ai-message-content"><p>${content}</p></div>`;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    },

    generateAIResponse(question) {
        const q = question.toLowerCase();

        if (q.includes('risiko') || q.includes('risiken')) {
            const allRisks = [];
            this.statusData.forEach(s => {
                s.risksAndIssues.forEach(r => {
                    if (r.status !== 'Geschlossen') {
                        allRisks.push(`• ${s.projectId}/${s.workstreamId}: ${r.description}`);
                    }
                });
            });
            return `Ich habe ${allRisks.length} offene Risiken gefunden:\n\n${allRisks.slice(0, 5).join('\n')}\n\n${allRisks.length > 5 ? `... und ${allRisks.length - 5} weitere.` : ''}`;
        }

        if (q.includes('meilenstein') || q.includes('milestone')) {
            const upcoming = [];
            const today = new Date();
            this.statusData.forEach(s => {
                s.milestones.forEach(m => {
                    if (m.status !== 'Geschlossen' && new Date(m.currentEstimate || m.plannedDate) > today) {
                        upcoming.push(`• ${s.workstreamId} - ${m.name}: ${this.formatDate(m.currentEstimate || m.plannedDate)}`);
                    }
                });
            });
            return `Kommende Meilensteine:\n\n${upcoming.slice(0, 5).join('\n') || 'Keine anstehenden Meilensteine gefunden.'}`;
        }

        if (q.includes('entscheidung') || q.includes('decision')) {
            const pending = this.decisions.filter(d => d.status === 'pending' || d.status === 'escalated');
            return `${pending.length} Entscheidungen sind ausstehend:\n\n${pending.slice(0, 5).map(d => `• ${d.title} (${d.projectId}, fällig: ${this.formatDate(d.dueDate)})`).join('\n')}`;
        }

        if (q.includes('zusammenfassung') || q.includes('status') || q.includes('summary')) {
            const latest = this.getLatestStatuses();
            const green = latest.filter(s => s.status.overall === 'green').length;
            const yellow = latest.filter(s => s.status.overall === 'yellow').length;
            const red = latest.filter(s => s.status.overall === 'red').length;

            return `📊 Programmstatus Sales Excellence:\n\n` +
                `• 🟢 ${green} Workstreams im Plan\n` +
                `• 🟡 ${yellow} Workstreams mit Einschränkungen\n` +
                `• 🔴 ${red} Workstreams kritisch\n\n` +
                `Gesamt: ${latest.length} aktive Workstreams über 8 Projekte.`;
        }

        return 'Ich kann dir bei Fragen zu Risiken, Meilensteinen, Entscheidungen oder dem Gesamtstatus helfen. Versuche es mit einer spezifischeren Frage.';
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PMO.init());
} else {
    PMO.init();
}

// ============================================
// BRIDGE: Set global variable for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.PMO = PMO;
    console.log('[ESM] pmo-toolbox.esm.js loaded');
}
