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

    // Gremien (Committees) with their meeting schedules
    GREMIEN: [
        { id: 'steerco', name: 'Steering Committee (SteerCo)', color: '#E30613', day: 3, week: 'first' },             // Monatlich, erster Mittwoch
        { id: 'programmleiter', name: 'Programmleiter Meeting', color: '#2563eb', day: 4, week: 'every' },             // Wöchentlich, Donnerstag
        { id: 'pmm', name: 'Programmmanagement Meeting (PMM)', color: '#7c3aed', day: 4, week: 'biweekly' },          // 2-wöchentlich, Donnerstag
        { id: 'projektteam', name: 'Einzel-Projektteam Meetings', color: '#16a34a', day: 1, week: 'every' }           // Wöchentlich, Montag
    ],

    // State
    statusData: [],
    projectStatusData: [],  // Project-level status (separate from workstream status)
    currentView: 'landing',
    currentWorkstream: null,
    tasks: [],
    milestones: [],
    selectedTrafficLights: {},
    DEMO_DATA_VERSION: 8,  // Increment to force regeneration of demo data

    // Initialize
    init() {
        console.log('PMO Toolbox initialisiert');
        this.loadData();
        this.loadTasks();
        this.loadMilestones();
        this.setupEventListeners();
        this.populateProjectSelect();
        this.setDefaultDate();

        // Show Dashboard as landing page
        this.showView('dashboard');
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
        const storedProjectStatus = localStorage.getItem('pmo_project_status_data');
        const storedVersion = localStorage.getItem('pmo_demo_version');

        // Check if we need to regenerate demo data (version mismatch or no data)
        if (!stored || storedVersion !== String(this.DEMO_DATA_VERSION)) {
            console.log('Generiere neue Demo-Daten (Version ' + this.DEMO_DATA_VERSION + ')');
            this.generateDemoData();
            this.generateProjectDemoData();
            localStorage.setItem('pmo_demo_version', String(this.DEMO_DATA_VERSION));
        } else {
            this.statusData = JSON.parse(stored);
            this.projectStatusData = storedProjectStatus ? JSON.parse(storedProjectStatus) : [];

            // Generate project data if missing
            if (this.projectStatusData.length === 0) {
                this.generateProjectDemoData();
            }
        }
    },

    // Save data to localStorage
    saveData() {
        localStorage.setItem('pmo_status_data', JSON.stringify(this.statusData));
        localStorage.setItem('pmo_project_status_data', JSON.stringify(this.projectStatusData));
    },

    // Generate Demo Data
    generateDemoData() {
        const scenarios = {
            "A": { trend: "improving", currentStatus: "yellow", themes: ["Lead-Routing Skalierung: Konversion +18% vs. Baseline", "K-EWE Sammelpunkte: 12/20 Standorte operativ, IT-Anbindung verzögert", "Inside Sales Telefonie-Einheit: 8/8 FTE besetzt, Produktivität unter Ziel (-22%)"] },
            "B": { trend: "stable", currentStatus: "green", themes: ["Reporting-Automatisierung: Alle 16 Bundesländer live, KPI-Konsistenz erreicht", "Performance-Steuerung: Agentur-Scorecards produktiv, 94% Nutzerakzeptanz", "Provisionsmanagement-Optimierung: Simulation abgeschlossen, Umsetzung Q2"] },
            "C": { trend: "declining", currentStatus: "yellow", themes: ["Recruiting-Pipeline: 28/35 Stellen besetzt (80%), Employer Branding zeigt Wirkung", "Onboarding 2.0: Digitale Lernplattform live, Einarbeitungszeit -30%", "Fluktuation 1. Jahr: 22% - über Benchmark (18%), Mentoring-Programm startet"] },
            "D": { trend: "stable", currentStatus: "green", themes: ["Servicemodell: Rollout in 5 Regionen abgeschlossen, NPS +12 Punkte", "Kundenanalytik A-TOM: Potentialidentifikation produktiv, 2.400 Leads generiert", "EASY Backlog: 60% abgearbeitet, kritische Bugs behoben"] },
            "E": { trend: "improving", currentStatus: "green", themes: ["EMOK 3.0: Alle Features released, Vermittler-Aktivierungsquote 67%", "SEO-Skalierung: Organischer Traffic +52% YoY, 380 Homepages optimiert", "Social Media: Follower-Wachstum +145%, GenAI-Content-Tool pilotiert"] },
            "F": { trend: "critical", currentStatus: "red", themes: ["KRITISCH: Effizienzziele verfehlt -€1.8 Mio vs. Plan", "Kostenoptimierung: Investitionsstopp verhängt, Projektportfolio-Review läuft", "Strukturmaßnahmen: Vorstand fordert Beschleunigung, Notfall-Taskforce eingesetzt"] },
            "G": { trend: "stable", currentStatus: "yellow", themes: ["Change-Kommunikation: 85% Awareness erreicht, 3 Townhalls durchgeführt", "Führungskräfte-Readiness: Coaching-Programm abgeschlossen, Multiplikatoren aktiv", "Widerstand Außendienst: Regional unterschiedlich, Süd-Region kritisch"] },
            "H": { trend: "starting", currentStatus: "yellow", themes: ["Anforderungsanalyse: 90% abgeschlossen, 45 Stakeholder-Interviews geführt", "IT-Architektur: Cloud-First entschieden, Security-Review läuft", "Vendor-Selection: Shortlist auf 3 CRM-Anbieter (Salesforce, MS Dynamics, SAP)"] }
        };

        const demoData = [];
        // Start from yesterday for consistent demo data (07.01 instead of 08.01)
        const today = new Date();
        today.setDate(today.getDate() - 1);

        // Generate 5 weeks of data for each workstream
        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            const scenario = scenarios[project.id];

            project.workstreams.forEach(ws => {
                for (let week = 0; week < 5; week++) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - (week * 7));
                    // Skip holidays (24.12 and 31.12)
                    this.adjustForHolidays(date);

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

    // Generate Project-Level Demo Data (aggregated status for each of the 8 projects)
    generateProjectDemoData() {
        const projectScenarios = {
            "A": {
                currentStatus: 'yellow',
                trend: 'improving',
                summary: [
                    "Neukunden-Lead-Generierung: +18% Konversion durch optimiertes Routing, 2.400 qualifizierte Leads in Q1",
                    "K-EWE Sammelpunkte: 12/20 Standorte live, IT-Anbindung Verzögerung -3 Wochen",
                    "Inside Sales Telefonie-Einheit: Team komplett (8 FTE), Produktivität 78% des Ziels"
                ],
                risks: "IT-Abhängigkeiten K-EWE API verzögern Rollout, Schulungskapazität begrenzt",
                nextSteps: "Eskalation IT-Roadmap, Express-Rollout verbleibende 8 Servicepunkte bis 28.02"
            },
            "B": {
                currentStatus: 'green',
                trend: 'stable',
                summary: [
                    "Reporting-Automatisierung: Bundesweiter Rollout abgeschlossen, alle 16 Bundesländer live",
                    "Performance-Steuerung: Agentur-Scorecards produktiv, 94% Nutzerakzeptanz, 450 aktive User",
                    "Provisionsmanagement: Simulationsmodell validiert, Freigabe für Umsetzung Q2 erhalten"
                ],
                risks: "Keine kritischen Risiken - Projekt im grünen Bereich",
                nextSteps: "Schulung Regionalleiter abschließen, Predictive Analytics Modul vorbereiten"
            },
            "C": {
                currentStatus: 'yellow',
                trend: 'stable',
                summary: [
                    "Recruiting: 28/35 Stellen besetzt (80%), Employer Branding Kampagne zeigt Wirkung (+35% Bewerbungen)",
                    "Onboarding 2.0: Digitale Lernplattform live, Einarbeitungszeit -30% (11 → 7,7 Wochen)",
                    "Fluktuation kritisch: 22% im 1. Jahr - über Benchmark (18%), Exit-Interviews laufen"
                ],
                risks: "Hohe Fluktuation gefährdet Kapazitätsaufbau, Regional unterschiedliche Performance",
                nextSteps: "Mentoring-Programm Q2 starten, Vergütungsmodell-Review, Recruiting-Push Süd-Region"
            },
            "D": {
                currentStatus: 'green',
                trend: 'improving',
                summary: [
                    "Servicemodell: Rollout 5 Regionen abgeschlossen, NPS +12 Punkte (72 → 84), 98% SLA-Einhaltung",
                    "Kundenanalytik A-TOM: Potentialidentifikation produktiv, 2.400 qualifizierte Cross-Sell-Leads",
                    "EASY Backlog: 60% abgearbeitet (180/300 Items), kritische Performance-Bugs behoben"
                ],
                risks: "Keine kritischen Risiken - Expansion on track",
                nextSteps: "Rollout auf 5 weitere Regionen Q2, Enhanced Analytics Features, EASY-Finalisierung Q3"
            },
            "E": {
                currentStatus: 'green',
                trend: 'stable',
                summary: [
                    "EMOK 3.0: Feature-Rollout komplett, Vermittler-Aktivierung 67% (380/570 Homepages migriert)",
                    "SEO-Skalierung: Organischer Traffic +52% YoY, Google-Rankings Top 3 für 45 Keywords",
                    "Social Media: Follower +145% (LinkedIn 12k, Instagram 8k), GenAI Content-Tool pilotiert"
                ],
                risks: "Keine kritischen Risiken - Digitalisierung läuft plangemäß",
                nextSteps: "Conversion-Rate-Optimierung, Voice Search Integration, TikTok-Strategie entwickeln"
            },
            "F": {
                currentStatus: 'red',
                trend: 'critical',
                summary: [
                    "KRITISCH: Effizienzziele massiv verfehlt -€1.8 Mio vs. Plan (-15%), Vorstand eskaliert",
                    "Investitionsstopp: Alle Nicht-Business-Critical-Projekte frozen, Portfolio-Review läuft",
                    "Notfall-Taskforce: CFO-geleitet, wöchentliches Steering, Sofortmaßnahmen-Katalog erstellt"
                ],
                risks: "Budgetüberschreitung gefährdet Gesamt-ESP III, Reputationsrisiko bei Aufsichtsrat",
                nextSteps: "Vorstandspräsentation 15.01, Restrukturierungsplan vorlegen, Quick-Wins identifizieren"
            },
            "G": {
                currentStatus: 'yellow',
                trend: 'improving',
                summary: [
                    "Change-Kommunikation: 85% Awareness (Pulse Survey Dez.), 3 Townhalls à 400+ Teilnehmer",
                    "Führungskräfte-Readiness: Coaching-Programm für 120 FK abgeschlossen, Multiplikatoren aktiv",
                    "Widerstand: Außendienst regional unterschiedlich - Nord grün, Süd-Region kritisch (NPS -18)"
                ],
                risks: "Persistenter Widerstand Süd-Region gefährdet Akzeptanz, Betriebsrat involviert",
                nextSteps: "Intensive Dialoge Süd-Region, Townhall #4 mit Vorstand, Erfolgsgeschichten skalieren"
            },
            "H": {
                currentStatus: 'yellow',
                trend: 'stable',
                summary: [
                    "Anforderungsanalyse: 90% abgeschlossen (45 Stakeholder-Interviews), Fachkonzept final",
                    "IT-Architektur: Cloud-First entschieden (Azure), Security & Compliance Review läuft",
                    "Vendor-Selection: Shortlist 3 CRM-Anbieter (Salesforce, MS Dynamics 365, SAP C4C), POC Q2"
                ],
                risks: "Zeitplan ambitioniert für Go-Live Q3, IT-Ressourcen-Konflikt mit Projekt D",
                nextSteps: "Vendor-Demos Feb, POC-Design finalisieren, Ressourcen-Eskalation IT-Leitung"
            }
        };

        const projectData = [];
        // Start from yesterday for consistent demo data
        const today = new Date();
        today.setDate(today.getDate() - 1);

        // Generate 4 weeks of project status history for each project
        this.PROGRAM_STRUCTURE.projects.forEach(project => {
            const scenario = projectScenarios[project.id];
            if (!scenario) return;

            for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
                const date = new Date(today);
                date.setDate(date.getDate() - (weekOffset * 7));
                // Skip holidays (24.12 and 31.12)
                this.adjustForHolidays(date);
                const dateStr = date.toISOString().split('T')[0];

                // Adjust status based on trend and week offset
                let adjustedStatus = scenario.currentStatus;
                if (scenario.trend === 'improving' && weekOffset >= 2) {
                    adjustedStatus = scenario.currentStatus === 'green' ? 'yellow' : 'red';
                } else if (scenario.trend === 'critical' && weekOffset >= 2) {
                    adjustedStatus = 'yellow';
                }

                projectData.push({
                    projectId: project.id,
                    date: dateStr,
                    status: {
                        overall: adjustedStatus,
                        budget: this.randomStatus(adjustedStatus),
                        scope: this.randomStatus(adjustedStatus),
                        time: this.randomStatus(adjustedStatus),
                        resources: this.randomStatus(adjustedStatus),
                        risks: scenario.currentStatus === 'red' ? 'red' : this.randomStatus(adjustedStatus)
                    },
                    summary: weekOffset === 0 ? scenario.summary : this.adjustSummaryForWeek(scenario.summary, weekOffset),
                    risks: scenario.risks,
                    nextSteps: scenario.nextSteps,
                    progress: this.getProgressText(project.id, weekOffset),
                    upcoming: scenario.nextSteps
                });
            }
        });

        this.projectStatusData = projectData;
        this.saveData();
    },

    randomStatus(baseStatus) {
        const rand = Math.random();
        if (baseStatus === 'green') return rand > 0.8 ? 'yellow' : 'green';
        if (baseStatus === 'yellow') return rand > 0.7 ? 'red' : (rand > 0.3 ? 'yellow' : 'green');
        if (baseStatus === 'red') return rand > 0.6 ? 'yellow' : 'red';
        return baseStatus;
    },

    adjustForHolidays(date) {
        const month = date.getMonth();
        const day = date.getDate();
        // Skip 24.12 and 31.12 (Christmas Eve and New Year's Eve)
        if (month === 11) { // December
            if (day === 24) {
                date.setDate(23); // Move to 23.12
            } else if (day === 31) {
                date.setDate(30); // Move to 30.12
            }
        }
        return date;
    },

    adjustSummaryForWeek(summary, weekOffset) {
        // Return slightly modified summary for older weeks
        return summary.map(s => s.replace(/\d+%/, m => {
            const num = parseInt(m) - (weekOffset * 5);
            return Math.max(0, num) + '%';
        }));
    },

    getProgressText(projectId, weekOffset) {
        const progressTexts = {
            "A": ["Lead-Routing Feintuning", "Servicepunkte Rollout läuft", "Inside Sales Schulungen", "Konzeptphase"],
            "B": ["Reports-Optimierung", "Dashboard-Feedback einarbeiten", "KPI-Definition", "Anforderungsanalyse"],
            "C": ["Recruiting intensiviert", "E-Learning Content erstellt", "Prozessanpassungen", "Ist-Analyse"],
            "D": ["Regionen-Expansion", "Tool-Optimierung", "Pilotierung", "Entwicklung"],
            "E": ["SEO-Optimierung", "Automation-Tests", "Feature-Entwicklung", "Planung"],
            "F": ["Maßnahmenplan erstellt", "Analyse vertieft", "Kostenstellen geprüft", "Datenerhebung"],
            "G": ["Workshops durchgeführt", "Kommunikation verstärkt", "Stakeholder-Analyse", "Konzept erstellt"],
            "H": ["Vendor-Gespräche", "Anforderungen finalisiert", "Marktanalyse", "Projektsetup"]
        };
        const texts = progressTexts[projectId] || ["Fortschritt"];
        return texts[Math.min(weekOffset, texts.length - 1)];
    },

    getLatestProjectStatus(projectId) {
        const statuses = this.projectStatusData.filter(s => s.projectId === projectId);
        statuses.sort((a, b) => b.date.localeCompare(a.date));
        return statuses.length > 0 ? statuses[0] : null;
    },

    getProjectStatusHistory(projectId) {
        return this.projectStatusData
            .filter(s => s.projectId === projectId)
            .sort((a, b) => b.date.localeCompare(a.date));
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
                ["SEO: +52% organischer Traffic vs. Vorjahr", "Marketing-Automation: Alle Workflows aktiv", "EMOK 3.0: Alle Features released"],
                ["SEO: +45% organischer Traffic", "Marketing-Automation: Lead-Scoring implementiert", "EMOK 3.0: Letzte Features in Entwicklung"],
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
                ["SEO: Voice Search Optimierung", "Omnichannel-Strategie entwickeln", "EMOK 4.0 Roadmap"],
                ["Lead-Nurturing Workflows testen", "EMOK: Letzte Features", "Conversion-Optimierung"],
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

        // Project-specific milestones (5 per project) - with varied timing and 2 overdue
        const projectMilestones = {
            "A": [
                { name: 'Lead-Routing MVP abgeschlossen', daysOffset: -45, status: 'Geschlossen' },
                { name: 'K-EWE API-Integration', daysOffset: -5, status: 'Verzögert' },  // OVERDUE!
                { name: 'Inside Sales Recruiting 8/8', daysOffset: 3, status: 'Im Plan' },
                { name: 'Go-Live Region Nord', daysOffset: 18, status: 'Im Plan' },
                { name: 'Bundesweiter Rollout Start', daysOffset: 55, status: 'Im Plan' }
            ],
            "B": [
                { name: 'Dashboard-Architektur final', daysOffset: -60, status: 'Geschlossen' },
                { name: 'Reports Automatisierung', daysOffset: -3, status: 'Verzögert' },  // OVERDUE!
                { name: 'Mobile App Beta Release', daysOffset: 5, status: 'Im Plan' },
                { name: 'Provisionsmodell Simulation', daysOffset: 25, status: 'Im Plan' },
                { name: 'Analytics Go-Live', daysOffset: 70, status: 'Im Plan' }
            ],
            "C": [
                { name: 'Recruiting-Pipeline Setup', daysOffset: -50, status: 'Geschlossen' },
                { name: 'Onboarding Pilotphase Ende', daysOffset: -21, status: 'Geschlossen' },
                { name: 'E-Learning Plattform Live', daysOffset: 12, status: 'Im Plan' },
                { name: '25 Vermittler onboarded', daysOffset: 30, status: 'Im Plan' },
                { name: 'Mentoring-Programm Start', daysOffset: 50, status: 'Im Plan' }
            ],
            "D": [
                { name: 'Servicemodell Pilotregionen', daysOffset: -55, status: 'Geschlossen' },
                { name: 'Kundenanalytik UAT', daysOffset: -14, status: 'Geschlossen' },
                { name: 'EASY Backlog Sprint 3', daysOffset: 8, status: 'Im Plan' },
                { name: 'Beratungsmodell Rollout', daysOffset: 40, status: 'Im Plan' },
                { name: '5 weitere Regionen Live', daysOffset: 85, status: 'Im Plan' }
            ],
            "E": [
                { name: 'SEO Technical Fixes', daysOffset: -40, status: 'Geschlossen' },
                { name: 'EMOK 3.0 Feature Freeze', daysOffset: -20, status: 'Geschlossen' },
                { name: 'Marketing-Automation Live', daysOffset: 2, status: 'Im Plan' },
                { name: 'Conversion Rate +15%', daysOffset: 28, status: 'Im Plan' },
                { name: 'Organic Traffic Verdopplung', daysOffset: 65, status: 'Im Plan' }
            ],
            "F": [
                { name: 'Kostenstellenanalyse', daysOffset: -30, status: 'Geschlossen' },
                { name: 'Vorstandspräsentation', daysOffset: 1, status: 'Im Plan' },
                { name: 'Quick-Wins Phase 1', daysOffset: 20, status: 'Im Plan' },
                { name: 'Restrukturierung genehmigt', daysOffset: 35, status: 'Im Plan' },
                { name: '€1.5M Savings Q1', daysOffset: 80, status: 'Im Plan' }
            ],
            "G": [
                { name: 'Change-Kommunikation fertig', daysOffset: -35, status: 'Geschlossen' },
                { name: 'Führungskräfte-Workshops', daysOffset: -21, status: 'Geschlossen' },
                { name: 'Townhall #3 durchgeführt', daysOffset: 10, status: 'Im Plan' },
                { name: 'Pulse Survey Ergebnisse', daysOffset: 32, status: 'Im Plan' },
                { name: 'Change-Agents aktiv', daysOffset: 60, status: 'Im Plan' }
            ],
            "H": [
                { name: 'CRM Anforderungen final', daysOffset: -42, status: 'Geschlossen' },
                { name: 'Vendor Shortlist erstellt', daysOffset: -7, status: 'Geschlossen' },
                { name: 'Vendor Demo-Runde', daysOffset: 15, status: 'Im Plan' },
                { name: 'Vertragsverhandlung Start', daysOffset: 38, status: 'Im Plan' },
                { name: 'Implementierung Kickoff', daysOffset: 90, status: 'Im Plan' }
            ]
        };

        const baseMilestones = projectMilestones[projectId] || projectMilestones["A"];
        const milestones = baseMilestones.map(ms => {
            const plannedDate = new Date(Date.now() + ms.daysOffset * 24 * 60 * 60 * 1000);
            const delayDays = adjustedStatus === 'red' ? 14 : 0;
            const currentEstimate = new Date(Date.now() + (ms.daysOffset + delayDays) * 24 * 60 * 60 * 1000);

            return {
                name: ms.name,
                plannedDate: plannedDate.toISOString().split('T')[0],
                currentEstimate: currentEstimate.toISOString().split('T')[0],
                status: ms.status === 'Geschlossen' ? 'Geschlossen' :
                        (adjustedStatus === 'red' && ms.daysOffset < 30 ? 'Verzögert' : ms.status)
            };
        });

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
        this.renderUpcomingMilestones();
        this.renderGremienCalendar();
        // Render new KPI dashboard
        this.renderKPICharts();
        this.renderUSStackedBar();
        this.renderEarlyWarnings();
    },

    // ========================================
    // NEW KPI DASHBOARD FUNCTIONS
    // ========================================

    // Demo data for KPIs (timeline until Jan 2026)
    KPI_DATA: {
        vertraegeProKunde: {
            current: 2.10,
            target: 2.80,
            history: [
                { month: 'Jan 25', value: 2.03 },
                { month: 'Feb 25', value: 2.05 },
                { month: 'Mrz 25', value: 2.04 },
                { month: 'Apr 25', value: 2.06 },
                { month: 'Mai 25', value: 2.07 },
                { month: 'Jun 25', value: 2.08 },
                { month: 'Jul 25', value: 2.07 },
                { month: 'Aug 25', value: 2.09 },
                { month: 'Sep 25', value: 2.08 },
                { month: 'Okt 25', value: 2.10 },
                { month: 'Nov 25', value: 2.12 },
                { month: 'Dez 25', value: 2.11 },
                { month: 'Jan 26', value: 2.13 }
            ]
        },
        apeProKunde: {
            current: 140000,
            target: 180000,
            history: [
                { month: 'Jan 25', value: 128000 },
                { month: 'Feb 25', value: 130000 },
                { month: 'Mrz 25', value: 131000 },
                { month: 'Apr 25', value: 133000 },
                { month: 'Mai 25', value: 134500 },
                { month: 'Jun 25', value: 135000 },
                { month: 'Jul 25', value: 136000 },
                { month: 'Aug 25', value: 137500 },
                { month: 'Sep 25', value: 138000 },
                { month: 'Okt 25', value: 139000 },
                { month: 'Nov 25', value: 140000 },
                { month: 'Dez 25', value: 141000 },
                { month: 'Jan 26', value: 142500 }
            ]
        },
        nps: { current: 38, previousMonth: 45, benchmark: 35, trend: '-7' },
        userAdoption: { current: 67, target: 85, activeUsers: 1240, totalUsers: 1850 },
        userStories: {
            backlog: 45,
            inProgress: 23,
            review: 12,
            done: 67,
            epics: 8,
            konzeption: { fachlich: 5, technisch: 3 },
            umsetzung: { entwicklung: 15, test: 8, release: 4 }
        },
        milestones: {
            total: 18,
            imPlan: 14,
            gefaehrdet: 2,
            verzoegert: 2,
            avgDelayDays: 4.5
        },
        tests: { passed: 342, failed: 18, pending: 24 },
        defects: { critical: 3, major: 12, minor: 28 },
        resources: { overall: 87, entwicklung: 92, testing: 78, design: 85 },
        budget: { spent: 2400000, total: 3200000, progress: 68 }
    },

    // Subproject demo data
    SUBPROJECT_DATA: {
        tp1: {
            name: 'TP1 - Hybrider Kunde',
            milestones: { total: 5, imPlan: 4, gefaehrdet: 1, verzoegert: 0, avgDelay: 2 },
            userStories: { backlog: 12, inProgress: 8, review: 3, done: 22 },
            tests: { passed: 85, failed: 3, pending: 7 },
            defects: { critical: 1, major: 3, minor: 8 },
            resources: { overall: 92 },
            budget: { spent: 580000, total: 750000 }
        },
        tp2: {
            name: 'TP2 - Bestandsmanagement',
            milestones: { total: 4, imPlan: 3, gefaehrdet: 0, verzoegert: 1, avgDelay: 8 },
            userStories: { backlog: 8, inProgress: 5, review: 2, done: 15 },
            tests: { passed: 62, failed: 5, pending: 4 },
            defects: { critical: 0, major: 4, minor: 6 },
            resources: { overall: 85 },
            budget: { spent: 420000, total: 550000 }
        },
        tp3: {
            name: 'TP3 - Digitale Antragsstrecke',
            milestones: { total: 3, imPlan: 2, gefaehrdet: 1, verzoegert: 0, avgDelay: 3 },
            userStories: { backlog: 15, inProgress: 6, review: 4, done: 18 },
            tests: { passed: 95, failed: 8, pending: 10 },
            defects: { critical: 2, major: 3, minor: 9 },
            resources: { overall: 88 },
            budget: { spent: 620000, total: 800000 }
        },
        tp4: {
            name: 'TP4 - CRM Integration',
            milestones: { total: 3, imPlan: 3, gefaehrdet: 0, verzoegert: 0, avgDelay: 0 },
            userStories: { backlog: 5, inProgress: 2, review: 2, done: 8 },
            tests: { passed: 55, failed: 1, pending: 2 },
            defects: { critical: 0, major: 1, minor: 3 },
            resources: { overall: 78 },
            budget: { spent: 380000, total: 500000 }
        },
        tp5: {
            name: 'TP5 - Reporting & Analytics',
            milestones: { total: 3, imPlan: 2, gefaehrdet: 0, verzoegert: 1, avgDelay: 5 },
            userStories: { backlog: 5, inProgress: 2, review: 1, done: 4 },
            tests: { passed: 45, failed: 1, pending: 1 },
            defects: { critical: 0, major: 1, minor: 2 },
            resources: { overall: 82 },
            budget: { spent: 400000, total: 600000 }
        }
    },

    // Early warning indicators
    EARLY_WARNINGS: [
        {
            id: 'nps_warning',
            type: 'warning',
            indicator: 'NPS Score',
            condition: 'Gefallen von +45 auf +38',
            active: true,
            recommendation: 'Sondermeeting mit VVE im Projekt aufplanen',
            details: 'NPS ist auf +38 gesunken (-7 vs. Vormonat), Trend negativ',
            navigateTo: 'kpis',
            filterTo: 'nps'
        },
        {
            id: 'milestone_warning',
            type: 'critical',
            indicator: 'Meilensteinverschiebungen',
            condition: '3+ Verschiebungen in 4 Wochen',
            active: true,
            recommendation: 'Ressourcenallokation prüfen, Scope Review durchführen',
            details: '4 Meilensteine in den letzten 4 Wochen verschoben',
            navigateTo: 'meilensteine',
            filterTo: 'Verzögert'
        },
        {
            id: 'change_request',
            type: 'info',
            indicator: 'Change Request Quote',
            condition: 'Steigend (+15% vs. Vormonat)',
            active: false,
            recommendation: 'Anforderungsmanagement-Workshop planen',
            details: 'Quote aktuell bei 12%, Trend steigend',
            navigateTo: 'entscheidungen'
        },
        {
            id: 'defect_critical',
            type: 'critical',
            indicator: 'Kritische Defects',
            condition: '3 kritische Defects offen',
            active: true,
            recommendation: 'Bug-Fixing Sprint priorisieren',
            details: '3 kritische Defects seit > 5 Tagen offen',
            navigateTo: 'kpis',
            filterTo: 'defects'
        },
        {
            id: 'resource_intern_overload',
            type: 'warning',
            indicator: 'Interne Ressourcen',
            condition: 'Auslastung >100%',
            active: true,
            recommendation: 'Prüfung Ressourcenverlagerung auf externe, ggf. Scope reduzieren',
            details: 'Interne Ressourcen bei 106% Auslastung - mehr angefragt als verfügbar',
            navigateTo: 'kpis',
            filterTo: 'ressourcen'
        }
    ],

    // Switch between Program and Subproject level
    switchLevel(level) {
        const programLevel = document.getElementById('pmo-program-level');
        const subprojectLevel = document.getElementById('pmo-subproject-level');
        const buttons = document.querySelectorAll('.pmo-level-btn');

        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.pmo-level-btn[data-level="${level}"]`)?.classList.add('active');

        if (level === 'program') {
            programLevel?.classList.add('active');
            subprojectLevel?.classList.remove('active');
        } else {
            programLevel?.classList.remove('active');
            subprojectLevel?.classList.add('active');
            this.loadSubprojectData();
        }
    },

    // Load subproject data
    loadSubprojectData() {
        const select = document.getElementById('pmo-subproject-select');
        const nameSpan = document.getElementById('subproject-name');
        const grid = document.getElementById('subproject-kpi-grid');

        if (!select || !grid) return;

        const tpId = select.value;
        const data = this.SUBPROJECT_DATA[tpId];

        if (!data) return;

        if (nameSpan) nameSpan.textContent = data.name;

        // Render subproject KPIs (same structure as program operativ)
        const ms = data.milestones;
        const msPercent = Math.round((ms.imPlan / ms.total) * 100);
        const us = data.userStories;
        const usTotal = us.backlog + us.inProgress + us.review + us.done;
        const t = data.tests;
        const tTotal = t.passed + t.failed + t.pending;
        const d = data.defects;
        const b = data.budget;
        const bPercent = Math.round((b.spent / b.total) * 100);

        grid.innerHTML = `
            <!-- Meilensteine -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">Meilensteine im Plan</span>
                </div>
                <div class="pmo-kpi-value-row">
                    <span class="pmo-kpi-value pmo-kpi-percent">${msPercent}%</span>
                    <span class="pmo-kpi-sub">${ms.imPlan} / ${ms.total} Meilensteine</span>
                </div>
                <div class="pmo-milestone-bar">
                    <div class="pmo-milestone-fill green" style="width: ${msPercent}%;"></div>
                    <div class="pmo-milestone-fill yellow" style="width: ${Math.round((ms.gefaehrdet / ms.total) * 100)}%;"></div>
                    <div class="pmo-milestone-fill red" style="width: ${Math.round((ms.verzoegert / ms.total) * 100)}%;"></div>
                </div>
                <div class="pmo-kpi-footer">
                    <span class="pmo-status-dot green"></span> ${ms.imPlan} Im Plan
                    <span class="pmo-status-dot yellow"></span> ${ms.gefaehrdet} Gefährdet
                    <span class="pmo-status-dot red"></span> ${ms.verzoegert} Verzögert
                </div>
            </div>

            <!-- User Stories -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">User Stories</span>
                </div>
                <div class="pmo-us-content">
                    <div class="pmo-stacked-bar">
                        <div class="pmo-stacked-segment backlog" style="width: ${(us.backlog/usTotal*100).toFixed(0)}%;">${us.backlog}</div>
                        <div class="pmo-stacked-segment inprogress" style="width: ${(us.inProgress/usTotal*100).toFixed(0)}%;">${us.inProgress}</div>
                        <div class="pmo-stacked-segment review" style="width: ${(us.review/usTotal*100).toFixed(0)}%;">${us.review}</div>
                        <div class="pmo-stacked-segment done" style="width: ${(us.done/usTotal*100).toFixed(0)}%;">${us.done}</div>
                    </div>
                    <div class="pmo-us-legend">
                        <span><span class="dot backlog"></span> Backlog (${us.backlog})</span>
                        <span><span class="dot inprogress"></span> In Arbeit (${us.inProgress})</span>
                        <span><span class="dot review"></span> Review (${us.review})</span>
                        <span><span class="dot done"></span> Done (${us.done})</span>
                    </div>
                </div>
            </div>

            <!-- Tests -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">Tests</span>
                </div>
                <div class="pmo-test-content">
                    <div class="pmo-test-stats">
                        <div class="pmo-test-stat passed">
                            <span class="pmo-test-value">${t.passed}</span>
                            <span class="pmo-test-label">Bestanden</span>
                        </div>
                        <div class="pmo-test-stat failed">
                            <span class="pmo-test-value">${t.failed}</span>
                            <span class="pmo-test-label">Fehlgeschlagen</span>
                        </div>
                        <div class="pmo-test-stat pending">
                            <span class="pmo-test-value">${t.pending}</span>
                            <span class="pmo-test-label">Ausstehend</span>
                        </div>
                    </div>
                    <div class="pmo-test-bar">
                        <div class="pmo-test-fill passed" style="width: ${(t.passed/tTotal*100).toFixed(0)}%;"></div>
                        <div class="pmo-test-fill failed" style="width: ${(t.failed/tTotal*100).toFixed(0)}%;"></div>
                        <div class="pmo-test-fill pending" style="width: ${(t.pending/tTotal*100).toFixed(0)}%;"></div>
                    </div>
                </div>
            </div>

            <!-- Defects -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">Defects</span>
                </div>
                <div class="pmo-defect-content">
                    <div class="pmo-defect-stats">
                        <div class="pmo-defect-stat critical">
                            <span class="pmo-defect-value">${d.critical}</span>
                            <span class="pmo-defect-label">Kritisch</span>
                        </div>
                        <div class="pmo-defect-stat major">
                            <span class="pmo-defect-value">${d.major}</span>
                            <span class="pmo-defect-label">Major</span>
                        </div>
                        <div class="pmo-defect-stat minor">
                            <span class="pmo-defect-value">${d.minor}</span>
                            <span class="pmo-defect-label">Minor</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resources -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">Ressourcen-Auslastung</span>
                </div>
                <div class="pmo-resource-content">
                    <div class="pmo-resource-gauge">
                        <div class="pmo-gauge-value">${data.resources.overall}%</div>
                        <div class="pmo-gauge-label">Auslastung</div>
                    </div>
                </div>
            </div>

            <!-- Budget -->
            <div class="pmo-kpi-card">
                <div class="pmo-kpi-header">
                    <span class="pmo-kpi-title">Budget</span>
                </div>
                <div class="pmo-budget-content">
                    <div class="pmo-budget-main">
                        <div class="pmo-budget-spent">
                            <span class="pmo-budget-value">€${(b.spent/1000).toFixed(0)}k</span>
                            <span class="pmo-budget-label">verbraucht</span>
                        </div>
                        <div class="pmo-budget-total">
                            <span>von €${(b.total/1000).toFixed(0)}k</span>
                        </div>
                    </div>
                    <div class="pmo-budget-bar">
                        <div class="pmo-budget-fill" style="width: ${bPercent}%;"></div>
                    </div>
                    <div class="pmo-budget-legend">
                        <span>${bPercent}% verbraucht</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Render KPI line charts
    renderKPICharts() {
        this.renderVertraegeChart();
        this.renderAPEChart();
        this.renderUserAdoptionChart();
    },

    renderVertraegeChart() {
        const container = document.getElementById('chart-vertraege-kunde');
        if (!container) return;

        const data = this.KPI_DATA.vertraegeProKunde;
        const history = data.history;
        const target = data.target;

        // Simple SVG line chart
        const width = container.offsetWidth || 200;
        const height = 80;
        const padding = 10;

        const minVal = Math.min(...history.map(h => h.value)) - 0.1;
        const maxVal = Math.max(target, ...history.map(h => h.value)) + 0.1;

        const xScale = (i) => padding + (i / (history.length - 1)) * (width - 2 * padding);
        const yScale = (v) => height - padding - ((v - minVal) / (maxVal - minVal)) * (height - 2 * padding);

        const points = history.map((h, i) => `${xScale(i)},${yScale(h.value)}`).join(' ');
        const targetY = yScale(target);

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <!-- Target line -->
                <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}"
                      stroke="#86BC25" stroke-width="2" stroke-dasharray="4,4"/>
                <!-- Data line -->
                <polyline points="${points}" fill="none" stroke="#3b82f6" stroke-width="2"/>
                <!-- Current point -->
                <circle cx="${xScale(history.length - 1)}" cy="${yScale(history[history.length - 1].value)}"
                        r="4" fill="#3b82f6"/>
            </svg>
        `;
    },

    renderAPEChart() {
        const container = document.getElementById('chart-ape-kunde');
        if (!container) return;

        const data = this.KPI_DATA.apeProKunde;
        const history = data.history;
        const target = data.target;

        const width = container.offsetWidth || 200;
        const height = 80;
        const padding = 10;

        const minVal = Math.min(...history.map(h => h.value)) - 5000;
        const maxVal = Math.max(target, ...history.map(h => h.value)) + 5000;

        const xScale = (i) => padding + (i / (history.length - 1)) * (width - 2 * padding);
        const yScale = (v) => height - padding - ((v - minVal) / (maxVal - minVal)) * (height - 2 * padding);

        const points = history.map((h, i) => `${xScale(i)},${yScale(h.value)}`).join(' ');
        const targetY = yScale(target);

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}"
                      stroke="#86BC25" stroke-width="2" stroke-dasharray="4,4"/>
                <polyline points="${points}" fill="none" stroke="#0ea5e9" stroke-width="2"/>
                <circle cx="${xScale(history.length - 1)}" cy="${yScale(history[history.length - 1].value)}"
                        r="4" fill="#0ea5e9"/>
            </svg>
        `;
    },

    renderUserAdoptionChart() {
        const container = document.getElementById('chart-user-adoption');
        if (!container) return;

        // Simple bar chart progression
        const months = ['Sep', 'Okt', 'Nov', 'Dez', 'Jan'];
        const values = [52, 58, 62, 64, 67];
        const target = 85;

        const width = container.offsetWidth || 200;
        const height = 80;
        const barWidth = (width - 40) / months.length - 4;

        let bars = '';
        values.forEach((v, i) => {
            const x = 20 + i * (barWidth + 4);
            const barHeight = (v / 100) * (height - 20);
            bars += `<rect x="${x}" y="${height - 10 - barHeight}" width="${barWidth}" height="${barHeight}"
                          fill="${i === values.length - 1 ? '#86BC25' : '#e2e8f0'}" rx="2"/>`;
        });

        const targetY = height - 10 - (target / 100) * (height - 20);

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                ${bars}
                <line x1="10" y1="${targetY}" x2="${width - 10}" y2="${targetY}"
                      stroke="#ef4444" stroke-width="1" stroke-dasharray="4,4"/>
            </svg>
        `;
    },

    // Render US stacked bar
    renderUSStackedBar() {
        const container = document.getElementById('us-stacked-bar');
        if (!container) return;

        const us = this.KPI_DATA.userStories;
        const total = us.backlog + us.inProgress + us.review + us.done;

        container.innerHTML = `
            <div class="pmo-stacked-segment backlog" style="width: ${(us.backlog/total*100).toFixed(0)}%;">${us.backlog}</div>
            <div class="pmo-stacked-segment inprogress" style="width: ${(us.inProgress/total*100).toFixed(0)}%;">${us.inProgress}</div>
            <div class="pmo-stacked-segment review" style="width: ${(us.review/total*100).toFixed(0)}%;">${us.review}</div>
            <div class="pmo-stacked-segment done" style="width: ${(us.done/total*100).toFixed(0)}%;">${us.done}</div>
        `;
    },

    // Render early warning indicators
    renderEarlyWarnings() {
        // Find or create early warnings container
        let container = document.getElementById('pmo-early-warnings');
        if (!container) {
            // Create container if not exists in sidebar
            const sidebar = document.querySelector('.pmo-dashboard-sidebar-grid') ||
                           document.querySelector('#section-operativ');
            if (!sidebar) return;

            // Add to DOM after operativ section
            const operativSection = document.getElementById('section-operativ');
            if (operativSection) {
                const warningsSection = document.createElement('div');
                warningsSection.className = 'pmo-dashboard-section pmo-warnings-section';
                warningsSection.innerHTML = `
                    <h3 class="pmo-section-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Frühwarnindikatoren
                    </h3>
                    <div class="pmo-warnings-grid" id="pmo-early-warnings"></div>
                `;
                operativSection.parentNode.insertBefore(warningsSection, operativSection.nextSibling);
                container = document.getElementById('pmo-early-warnings');
            }
        }

        if (!container) return;

        const activeWarnings = this.EARLY_WARNINGS.filter(w => w.active);
        console.log('Rendering early warnings:', activeWarnings.length, 'active warnings');

        if (activeWarnings.length === 0) {
            container.innerHTML = `
                <div class="pmo-no-warnings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="24" height="24">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span>Keine aktiven Warnungen</span>
                </div>
            `;
            return;
        }

        container.innerHTML = activeWarnings.map(w => `
            <div class="pmo-warning-card ${w.type} ${w.navigateTo ? 'clickable' : ''}"
                 ${w.navigateTo ? `onclick="PMO.navigateFromWarning('${w.id}', '${w.navigateTo}', '${w.filterTo || ''}')"` : ''}
                 ${w.navigateTo ? 'title="Klicken zum Anzeigen"' : ''}>
                <div class="pmo-warning-icon">
                    ${w.type === 'critical' ?
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' :
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
                    }
                </div>
                <div class="pmo-warning-content">
                    <div class="pmo-warning-header">
                        <strong>${w.indicator}</strong>
                        <span class="pmo-warning-condition">${w.condition}</span>
                    </div>
                    <div class="pmo-warning-details">${w.details}</div>
                    <div class="pmo-warning-recommendation">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        ${w.recommendation}
                    </div>
                </div>
                ${w.navigateTo ? `
                <div class="pmo-warning-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
                ` : ''}
            </div>
        `).join('');
    },

    // Switch milestone KPI view
    switchMilestoneKPI(mode) {
        const title = document.getElementById('milestone-kpi-title');
        const content = document.getElementById('milestone-kpi-content');
        const buttons = document.querySelectorAll('.pmo-kpi-card.pmo-kpi-switchable:first-of-type .pmo-switch-btn');

        buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

        const ms = this.KPI_DATA.milestones;

        if (mode === 'plan') {
            if (title) title.textContent = 'Meilensteine im Plan';
            if (content) {
                const percent = Math.round((ms.imPlan / ms.total) * 100);
                content.innerHTML = `
                    <span class="pmo-kpi-value pmo-kpi-percent">${percent}%</span>
                    <span class="pmo-kpi-sub">${ms.imPlan} / ${ms.total} Meilensteine</span>
                `;
            }
        } else {
            if (title) title.textContent = 'Durchschn. Verzögerung';
            if (content) {
                content.innerHTML = `
                    <span class="pmo-kpi-value">${ms.avgDelayDays}</span>
                    <span class="pmo-kpi-sub">Tage Ø Verzögerung</span>
                `;
            }
        }
    },

    // Switch US KPI view
    switchUSKPI(mode) {
        const title = document.getElementById('us-kpi-title');
        const content = document.getElementById('us-kpi-content');
        const buttons = document.querySelectorAll('#section-operativ .pmo-kpi-card:nth-child(2) .pmo-switch-btn');

        buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

        const us = this.KPI_DATA.userStories;
        const total = us.backlog + us.inProgress + us.review + us.done;

        if (mode === 'status') {
            if (title) title.textContent = 'User Stories nach Status';
            if (content) {
                content.innerHTML = `
                    <div class="pmo-stacked-bar" id="us-stacked-bar">
                        <div class="pmo-stacked-segment backlog" style="width: ${(us.backlog/total*100).toFixed(0)}%;">${us.backlog}</div>
                        <div class="pmo-stacked-segment inprogress" style="width: ${(us.inProgress/total*100).toFixed(0)}%;">${us.inProgress}</div>
                        <div class="pmo-stacked-segment review" style="width: ${(us.review/total*100).toFixed(0)}%;">${us.review}</div>
                        <div class="pmo-stacked-segment done" style="width: ${(us.done/total*100).toFixed(0)}%;">${us.done}</div>
                    </div>
                    <div class="pmo-us-legend">
                        <span><span class="dot backlog"></span> Backlog (${us.backlog})</span>
                        <span><span class="dot inprogress"></span> In Arbeit (${us.inProgress})</span>
                        <span><span class="dot review"></span> Review (${us.review})</span>
                        <span><span class="dot done"></span> Done (${us.done})</span>
                    </div>
                `;
            }
        } else if (mode === 'konzeption') {
            if (title) title.textContent = 'US in Konzeption';
            if (content) {
                content.innerHTML = `
                    <div class="pmo-us-konzeption">
                        <div class="pmo-konzeption-stat">
                            <span class="pmo-konzeption-value">${us.epics}</span>
                            <span class="pmo-konzeption-label">Epics</span>
                        </div>
                        <div class="pmo-konzeption-stat">
                            <span class="pmo-konzeption-value">${us.konzeption.fachlich}</span>
                            <span class="pmo-konzeption-label">Fachlich abgenommen</span>
                        </div>
                        <div class="pmo-konzeption-stat">
                            <span class="pmo-konzeption-value">${us.konzeption.technisch}</span>
                            <span class="pmo-konzeption-label">Technisch abgenommen</span>
                        </div>
                    </div>
                `;
            }
        } else if (mode === 'umsetzung') {
            if (title) title.textContent = 'US in Umsetzung';
            if (content) {
                const uTotal = us.umsetzung.entwicklung + us.umsetzung.test + us.umsetzung.release;
                content.innerHTML = `
                    <div class="pmo-stacked-bar">
                        <div class="pmo-stacked-segment" style="background: #3b82f6; width: ${(us.umsetzung.entwicklung/uTotal*100).toFixed(0)}%;">${us.umsetzung.entwicklung}</div>
                        <div class="pmo-stacked-segment" style="background: #f59e0b; width: ${(us.umsetzung.test/uTotal*100).toFixed(0)}%;">${us.umsetzung.test}</div>
                        <div class="pmo-stacked-segment" style="background: #22c55e; width: ${(us.umsetzung.release/uTotal*100).toFixed(0)}%;">${us.umsetzung.release}</div>
                    </div>
                    <div class="pmo-us-legend">
                        <span><span class="dot" style="background: #3b82f6;"></span> Entwicklung (${us.umsetzung.entwicklung})</span>
                        <span><span class="dot" style="background: #f59e0b;"></span> Test (${us.umsetzung.test})</span>
                        <span><span class="dot" style="background: #22c55e;"></span> Release (${us.umsetzung.release})</span>
                    </div>
                `;
            }
        }
    },

    // Switch Test KPI view
    switchTestKPI(mode) {
        console.log('Switch test KPI to:', mode);
    },

    // Switch Defect KPI view
    switchDefectKPI(mode) {
        console.log('Switch defect KPI to:', mode);
    },

    // Switch Resource KPI view
    switchResourceKPI(mode) {
        console.log('Switch resource KPI to:', mode);
    },

    // Switch Budget KPI view
    switchBudgetKPI(mode) {
        console.log('Switch budget KPI to:', mode);
    },

    // Open Value Map detail
    openValueMap() {
        alert('Value Map Details würden hier in einem Modal geöffnet werden.');
    },

    renderUpcomingMilestones() {
        const container = document.getElementById('pmo-upcoming-milestones');
        if (!container) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Collect all milestones from all status data
        let allMilestones = [];
        const latestStatuses = this.getLatestStatuses();

        // Deduplicate milestones by name + project (same milestone can appear in multiple workstreams)
        const seen = new Set();

        latestStatuses.forEach(status => {
            const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === status.projectId);

            status.milestones.forEach(ms => {
                const key = `${status.projectId}_${ms.name}`;
                if (seen.has(key)) return;
                seen.add(key);

                const dueDate = new Date(ms.currentEstimate || ms.plannedDate);
                const isOverdue = dueDate < today && ms.status !== 'Geschlossen';

                allMilestones.push({
                    ...ms,
                    projectId: status.projectId,
                    projectName: project?.name || status.projectId,
                    dueDate,
                    isOverdue
                });
            });
        });

        // Filter: only show non-closed milestones in the next 90 days or overdue
        const ninetyDaysFromNow = new Date(today);
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

        allMilestones = allMilestones
            .filter(ms => ms.status !== 'Geschlossen')
            .filter(ms => ms.isOverdue || ms.dueDate <= ninetyDaysFromNow)
            .sort((a, b) => a.dueDate - b.dueDate);

        // Limit to 12 entries
        allMilestones = allMilestones.slice(0, 12);

        if (allMilestones.length === 0) {
            container.innerHTML = '<p class="pmo-no-milestones">Keine kommenden Meilensteine</p>';
            return;
        }

        let html = '<div class="pmo-milestone-structured-list">';

        allMilestones.forEach(ms => {
            const daysUntil = Math.ceil((ms.dueDate - today) / (1000 * 60 * 60 * 24));
            let dateLabel;
            let dateClass = '';

            if (ms.isOverdue) {
                const absDays = Math.abs(daysUntil);
                dateLabel = absDays === 1 ? '1 Tag überfällig' : `${absDays} Tage überfällig`;
                dateClass = 'overdue';
            } else if (daysUntil === 0) {
                dateLabel = 'Heute';
                dateClass = 'today';
            } else if (daysUntil === 1) {
                dateLabel = 'Morgen';
                dateClass = 'soon';
            } else if (daysUntil <= 7) {
                dateLabel = `In ${daysUntil} Tagen`;
                dateClass = 'soon';
            } else {
                dateLabel = this.formatDate(ms.dueDate.toISOString().split('T')[0]);
            }

            html += `
                <div class="pmo-milestone-row ${ms.isOverdue ? 'overdue' : ''}">
                    <div class="pmo-milestone-content">
                        <span class="pmo-milestone-name">${ms.name}</span>
                        <span class="pmo-milestone-project-name">${ms.projectName}</span>
                    </div>
                    <span class="pmo-milestone-date ${dateClass}">${dateLabel}</span>
                    <button class="pmo-reminder-btn" onclick="PMO.sendReminder('${ms.projectId}', '${ms.name}')" title="Erinnerung senden">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
                        </svg>
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    sendReminder(projectId, milestoneName) {
        // Hole Projekt-Informationen
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        const projectName = project?.name || projectId;
        const projectFullName = project?.fullName || '';

        // Hole Meilenstein-Details falls verfügbar
        const milestone = this.getMilestoneDetails(projectId, milestoneName);
        const dueDate = milestone?.date ? new Date(milestone.date).toLocaleDateString('de-DE') : 'TBD';

        // E-Mail-Inhalte vorbereiten
        const subject = encodeURIComponent(`Erinnerung: Meilenstein "${milestoneName}" - Projekt ${projectName}`);

        const body = encodeURIComponent(`Sehr geehrte Damen und Herren,

hiermit möchte ich Sie an den bevorstehenden Meilenstein erinnern:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEILENSTEIN-INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Projekt:      ${projectName}
              ${projectFullName}

Meilenstein:  ${milestoneName}
Fällig am:    ${dueDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bitte stellen Sie sicher, dass alle erforderlichen Arbeiten rechtzeitig abgeschlossen werden.

Bei Fragen oder falls Sie Unterstützung benötigen, melden Sie sich bitte umgehend.

Mit freundlichen Grüßen,
PMO Team
`);

        // Öffne mailto-Link (öffnet Outlook/Standard-Mail-Client)
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
    },

    // Hilfsfunktion um Meilenstein-Details zu holen
    getMilestoneDetails(projectId, milestoneName) {
        if (!this.statusData) return null;

        // Suche in den Status-Daten nach dem Meilenstein
        for (const status of this.statusData) {
            if (status.projectId === projectId && status.milestones) {
                const milestone = status.milestones.find(m => m.name === milestoneName);
                if (milestone) return milestone;
            }
        }
        return null;
    },

    // Gremien Calendar
    renderGremienCalendar() {
        const container = document.getElementById('pmo-gremien-calendar');
        if (!container) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Get first and last day of month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

        // Calculate meetings for each day
        const meetingsMap = this.calculateMeetings(currentYear, currentMonth);

        // Build calendar HTML
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        // Adjust startDayOfWeek for 6-day grid (no Sunday)
        let startPos = startDayOfWeek >= 6 ? 0 : startDayOfWeek;

        let html = `
            <div class="gremien-calendar">
                <div class="gremien-calendar-header">
                    <button class="gremien-nav-btn" onclick="PMO.changeCalendarMonth(-1)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span class="gremien-month-title">${monthNames[currentMonth]} ${currentYear}</span>
                    <button class="gremien-nav-btn" onclick="PMO.changeCalendarMonth(1)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>
                <div class="gremien-calendar-grid">
                    ${dayNames.map(d => `<div class="gremien-day-header">${d}</div>`).join('')}
        `;

        // Empty cells before first day
        for (let i = 0; i < startPos; i++) {
            html += '<div class="gremien-day empty"></div>';
        }

        // Days of month (skip Sundays)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            if (date.getDay() === 0) continue; // Skip Sunday

            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const meetings = meetingsMap[dateKey] || [];
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            const meetingDots = meetings.map(m =>
                `<div class="gremien-dot" style="background: ${m.color};" title="${m.name}"></div>`
            ).join('');

            html += `
                <div class="gremien-day ${isToday ? 'today' : ''}" ${meetings.length > 0 ? `onclick="PMO.showDayMeetings('${dateKey}')"` : ''}>
                    <span class="gremien-day-number">${day}</span>
                    ${meetings.length > 0 ? `<div class="gremien-dots">${meetingDots}</div>` : ''}
                </div>
            `;
        }

        html += `
                </div>
                <div class="gremien-legend">
                    ${this.GREMIEN.map(g => `
                        <div class="gremien-legend-item">
                            <div class="gremien-legend-dot" style="background: ${g.color};"></div>
                            <span>${g.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    calendarOffset: 0,

    changeCalendarMonth(delta) {
        this.calendarOffset += delta;
        const today = new Date();
        const targetDate = new Date(today.getFullYear(), today.getMonth() + this.calendarOffset, 1);
        this.renderGremienCalendarForMonth(targetDate.getFullYear(), targetDate.getMonth());
    },

    renderGremienCalendarForMonth(year, month) {
        const container = document.getElementById('pmo-gremien-calendar');
        if (!container) return;

        const today = new Date();

        // Get first and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;

        const meetingsMap = this.calculateMeetings(year, month);

        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

        // Adjust startDayOfWeek for 6-day grid (no Sunday)
        let startPos = startDayOfWeek >= 6 ? 0 : startDayOfWeek;

        let html = `
            <div class="gremien-calendar">
                <div class="gremien-calendar-header">
                    <button class="gremien-nav-btn" onclick="PMO.changeCalendarMonth(-1)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span class="gremien-month-title">${monthNames[month]} ${year}</span>
                    <button class="gremien-nav-btn" onclick="PMO.changeCalendarMonth(1)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>
                <div class="gremien-calendar-grid">
                    ${dayNames.map(d => `<div class="gremien-day-header">${d}</div>`).join('')}
        `;

        for (let i = 0; i < startPos; i++) {
            html += '<div class="gremien-day empty"></div>';
        }

        // Days of month (skip Sundays)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date.getDay() === 0) continue; // Skip Sunday

            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const meetings = meetingsMap[dateKey] || [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            const meetingDots = meetings.map(m =>
                `<div class="gremien-dot" style="background: ${m.color};" title="${m.name}"></div>`
            ).join('');

            html += `
                <div class="gremien-day ${isToday ? 'today' : ''}" ${meetings.length > 0 ? `onclick="PMO.showDayMeetings('${dateKey}')"` : ''}>
                    <span class="gremien-day-number">${day}</span>
                    ${meetings.length > 0 ? `<div class="gremien-dots">${meetingDots}</div>` : ''}
                </div>
            `;
        }

        html += `
                </div>
                <div class="gremien-legend">
                    ${this.GREMIEN.map(g => `
                        <div class="gremien-legend-item">
                            <div class="gremien-legend-dot" style="background: ${g.color};"></div>
                            <span>${g.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    calculateMeetings(year, month) {
        const meetingsMap = {};
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        this.GREMIEN.forEach(gremium => {
            const meetingDates = this.getMeetingDates(gremium, year, month);
            meetingDates.forEach(date => {
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                if (!meetingsMap[dateKey]) meetingsMap[dateKey] = [];
                meetingsMap[dateKey].push({ name: gremium.name, color: gremium.color });
            });
        });

        return meetingsMap;
    },

    getMeetingDates(gremium, year, month) {
        const dates = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // day: 1=Monday, 2=Tuesday, etc. (JS: 0=Sunday, 1=Monday...)
        const targetDayJS = gremium.day % 7; // Convert to JS day (0=Sunday)

        if (gremium.week === 'every') {
            // Every week
            let d = new Date(year, month, 1);
            while (d.getMonth() === month) {
                if (d.getDay() === targetDayJS) {
                    dates.push(new Date(d));
                }
                d.setDate(d.getDate() + 1);
            }
        } else if (gremium.week === 'biweekly') {
            // Every 2 weeks (starting from first occurrence)
            let d = new Date(year, month, 1);
            let count = 0;
            while (d.getMonth() === month) {
                if (d.getDay() === targetDayJS) {
                    if (count % 2 === 0) dates.push(new Date(d));
                    count++;
                }
                d.setDate(d.getDate() + 1);
            }
        } else if (gremium.week === 'first') {
            // First occurrence in month
            let d = new Date(year, month, 1);
            while (d.getMonth() === month) {
                if (d.getDay() === targetDayJS) {
                    dates.push(new Date(d));
                    break;
                }
                d.setDate(d.getDate() + 1);
            }
        } else if (gremium.week === 'last') {
            // Last occurrence in month
            let d = new Date(year, month + 1, 0);
            while (d.getMonth() === month) {
                if (d.getDay() === targetDayJS) {
                    dates.push(new Date(d));
                    break;
                }
                d.setDate(d.getDate() - 1);
            }
        }

        return dates;
    },

    showDayMeetings(dateKey) {
        const [year, month, day] = dateKey.split('-').map(Number);
        const meetingsMap = this.calculateMeetings(year, month - 1);
        const meetings = meetingsMap[dateKey] || [];

        const dateStr = new Date(year, month - 1, day).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const meetingsList = meetings.map(m => `• ${m.name}`).join('\n');
        alert(`Termine am ${dateStr}:\n\n${meetingsList}`);
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

        // Only update if elements exist (they may not in the new KPI dashboard view)
        const statGreen = document.getElementById('stat-green');
        const statYellow = document.getElementById('stat-yellow');
        const statRed = document.getElementById('stat-red');
        const statRisks = document.getElementById('stat-risks');

        if (statGreen) statGreen.textContent = green;
        if (statYellow) statYellow.textContent = yellow;
        if (statRed) statRed.textContent = red;
        if (statRisks) statRisks.textContent = openRisks;
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

            // Get workstream statuses
            const workstreamHtml = project.workstreams.map(ws => {
                const wsStatus = this.getWorkstreamLatestStatus(project.id, ws.id);
                const wsColor = wsStatus?.status?.overall || 'gray';
                return `
                    <div class="pmo-ws-item">
                        <div class="pmo-traffic-light-small ${wsColor}"></div>
                        <span class="pmo-ws-name">${ws.name}</span>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="pmo-project-header">
                    <div class="pmo-traffic-light ${status?.overall || 'gray'}"></div>
                </div>
                <h4 class="pmo-project-name">${project.name}</h4>
                <p class="pmo-project-full-name">${project.fullName}</p>
                <div class="pmo-project-workstreams-list">
                    <span class="pmo-ws-header">Workstreams</span>
                    ${workstreamHtml}
                </div>
            `;

            grid.appendChild(card);
        });
    },

    getWorkstreamLatestStatus(projectIdOrWsId, workstreamId = null) {
        let statuses;
        if (workstreamId) {
            // Called with (projectId, workstreamId)
            statuses = this.statusData
                .filter(s => s.projectId === projectIdOrWsId && s.workstreamId === workstreamId);
        } else {
            // Called with (wsId) only
            statuses = this.statusData
                .filter(s => s.workstreamId === projectIdOrWsId);
        }
        statuses.sort((a, b) => b.date.localeCompare(a.date));
        return statuses.length > 0 ? statuses[0] : null;
    },

    // View Management
    showView(viewId) {
        console.log('showView aufgerufen mit viewId:', viewId);
        try {
            this.showViewInternal(viewId);

            // Also render dashboard if switching to it
            if (viewId === 'dashboard') this.renderDashboard();
            if (viewId === 'risiken') this.renderRisks();
            if (viewId === 'meilensteine') this.renderMilestones();
            if (viewId === 'timeline') this.renderTimeline();
            if (viewId === 'gantt') this.renderGantt();
            if (viewId === 'entscheidungen') this.renderDecisions();
            if (viewId === 'dokumente') this.renderDocumentsList();
            if (viewId === 'kpis') {
                console.log('viewId === kpis, calling renderKPIs()');
                this.renderKPIs();
            }
            if (viewId === 'suche') {
                // Focus search input when switching to search view
                setTimeout(() => {
                    const searchInput = document.getElementById('pmo-view-search-input');
                    if (searchInput) searchInput.focus();
                }, 100);
            }
        } catch (error) {
            console.error('Error in showView:', error);
        }
    },

    showViewInternal(viewId) {
        document.querySelectorAll('.pmo-view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.pmo-nav-btn').forEach(b => b.classList.remove('active'));

        const view = document.getElementById(`pmo-${viewId}`);
        if (view) view.classList.add('active');

        const navBtn = document.querySelector(`[data-view="${viewId}"]`);
        if (navBtn) navBtn.classList.add('active');

        this.currentView = viewId;

        // Dispatch event for Page ID Tracker
        document.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { module: 'pmo-toolbox', view: viewId }
        }));
    },

    // Project Detail Modal
    openProjectDetail(projectId) {
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        if (!project) return;

        document.getElementById('project-modal-title').textContent = `Projekt ${project.id}: ${project.name}`;

        const body = document.getElementById('project-modal-body');
        const projectStatus = this.getLatestProjectStatus(projectId);
        const statusHistory = this.getProjectStatusHistory(projectId);

        // Build status history calendar
        const historyCalendar = statusHistory.slice(0, 4).map((s, i) => {
            const date = new Date(s.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('de-DE', { month: 'short' });
            const isCurrent = i === 0;
            return `
                <div class="ppt-cal-week ${s.status.overall} ${isCurrent ? 'current' : ''}"
                     title="${this.formatDate(s.date)}"
                     onclick="PMO.showProjectStatusForDate('${projectId}', ${i})"
                     style="cursor: pointer;">
                    <span class="ppt-cal-day">${day}</span>
                    <span class="ppt-cal-month">${month}</span>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <!-- Project Tabs -->
            <div class="pmo-my-tabs" style="margin-bottom: 24px;">
                <button class="pmo-my-tab active" data-tab="overview" onclick="PMO.switchProjectTab('overview')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    Übersicht
                </button>
                <button class="pmo-my-tab" data-tab="workstreams" onclick="PMO.switchProjectTab('workstreams')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    Workstreams
                </button>
                <button class="pmo-my-tab" data-tab="milestones" onclick="PMO.switchProjectTab('milestones')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Meilensteine
                </button>
            </div>

            <!-- Tab Content: Overview -->
            <div class="pmo-my-tab-content active" id="tab-content-overview">
                <!-- Project Status Section (like PPT viewer) -->
                <div class="pmo-project-status-view" style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div>
                            <h3 style="margin: 0 0 4px; font-size: 18px; color: #1e293b;">${project.name}</h3>
                            <p style="margin: 0; font-size: 13px; color: #64748b;">${project.fullName}</p>
                            <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Status vom ${projectStatus ? this.formatDate(projectStatus.date) : '-'}</p>
                        </div>
                        <div style="text-align: center;">
                            <div class="pmo-traffic-light ${projectStatus?.status?.overall || 'gray'}" style="width: 50px; height: 50px;"></div>
                            <span style="font-size: 11px; color: #64748b; display: block; margin-top: 4px;">Gesamtstatus</span>
                        </div>
                    </div>

                    <!-- Sub-Status Grid -->
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
                        ${['budget', 'scope', 'time', 'resources', 'risks'].map(key => `
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 8px;">
                                <div class="pmo-traffic-light-small ${projectStatus?.status?.[key] || 'gray'}" style="width: 16px; height: 16px; margin: 0 auto 4px;"></div>
                                <span style="font-size: 10px; color: #64748b; text-transform: capitalize;">${key === 'risks' ? 'Risiken' : key === 'time' ? 'Zeit' : key === 'resources' ? 'Ressourcen' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Management Summary -->
                    ${projectStatus?.summary ? `
                        <div style="margin-bottom: 16px;">
                            <h4 style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Management Summary</h4>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">
                                ${projectStatus.summary.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <!-- Risks & Next Steps -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        ${projectStatus?.risks ? `
                            <div style="background: white; padding: 12px; border-radius: 8px;">
                                <h4 style="margin: 0 0 6px; font-size: 11px; color: #64748b; text-transform: uppercase;">Risiken</h4>
                                <p style="margin: 0; font-size: 12px; color: #334155;">${projectStatus.risks}</p>
                            </div>
                        ` : ''}
                        ${projectStatus?.nextSteps ? `
                            <div style="background: white; padding: 12px; border-radius: 8px;">
                                <h4 style="margin: 0 0 6px; font-size: 11px; color: #64748b; text-transform: uppercase;">Nächste Schritte</h4>
                                <p style="margin: 0; font-size: 12px; color: #334155;">${projectStatus.nextSteps}</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Status History Calendar -->
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 8px; font-size: 11px; color: #94a3b8; text-align: center;">Statusverlauf</h4>
                        <div style="display: flex; gap: 6px; justify-content: center;">
                            ${historyCalendar}
                        </div>
                    </div>
                </div>

                <div style="margin-top: 24px;">
                    <button class="pmo-btn pmo-btn-primary" onclick="PMO.openStatusModalForProject('${projectId}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Neuen Status erfassen
                    </button>
                </div>
            </div>

            <!-- Tab Content: Workstreams -->
            <div class="pmo-my-tab-content" id="tab-content-workstreams">
                <div class="pmo-workstreams-list">
                    ${project.workstreams.map(ws => {
                        const wsStatus = this.getWorkstreamLatestStatus(ws.id);
                        return `
                            <div class="pmo-workstream-item" style="display: flex; align-items: center; padding: 12px 16px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
                                <div class="pmo-traffic-light-small ${wsStatus?.status?.overall || 'gray'}" style="width: 12px; height: 12px; border-radius: 50%; margin-right: 12px;"></div>
                                <span class="pmo-workstream-id" style="font-weight: 600; color: #E30613; margin-right: 8px; font-size: 13px;">${ws.id}</span>
                                <span class="pmo-workstream-name" style="flex: 1; font-size: 14px; color: #1e293b;">${ws.name}</span>
                                <button class="pmo-btn-sm" onclick="event.stopPropagation(); PMO.openPPTView('${ws.id}')" title="PPT-Ansicht öffnen" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 12px;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <rect x="2" y="2" width="20" height="20" rx="2"/>
                                        <path d="M9 8h6M9 12h6M9 16h4"/>
                                    </svg>
                                    PPT
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Tab Content: Milestones -->
            <div class="pmo-my-tab-content" id="tab-content-milestones">
                ${this.renderProjectMilestones(projectId)}
            </div>
        `;

        document.getElementById('pmo-project-modal').classList.add('active');
    },

    // Current project status index for navigation
    currentProjectStatusIndex: 0,

    // Show project status for a specific date (from history calendar)
    showProjectStatusForDate(projectId, historyIndex) {
        this.currentProjectStatusIndex = historyIndex;
        this.renderProjectStatusInModal(projectId, historyIndex);
    },

    // Render project status section in modal for a specific history index
    renderProjectStatusInModal(projectId, historyIndex) {
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);
        if (!project) return;

        const statusHistory = this.getProjectStatusHistory(projectId);
        const projectStatus = statusHistory[historyIndex];
        if (!projectStatus) return;

        // Build status history calendar
        const historyCalendar = statusHistory.slice(0, 4).map((s, i) => {
            const date = new Date(s.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('de-DE', { month: 'short' });
            const isCurrent = i === historyIndex;
            return `
                <div class="ppt-cal-week ${s.status.overall} ${isCurrent ? 'current' : ''}"
                     title="${this.formatDate(s.date)} - Klicken zum Anzeigen"
                     onclick="PMO.showProjectStatusForDate('${projectId}', ${i})"
                     style="cursor: pointer;">
                    <span class="ppt-cal-day">${day}</span>
                    <span class="ppt-cal-month">${month}</span>
                </div>
            `;
        }).join('');

        // Update only the status section
        const statusView = document.querySelector('.pmo-project-status-view');
        if (statusView) {
            statusView.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0 0 4px; font-size: 18px; color: #1e293b;">${project.name}</h3>
                        <p style="margin: 0; font-size: 13px; color: #64748b;">${project.fullName}</p>
                        <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Status vom ${this.formatDate(projectStatus.date)}</p>
                    </div>
                    <div style="text-align: center;">
                        <div class="pmo-traffic-light ${projectStatus?.status?.overall || 'gray'}" style="width: 50px; height: 50px;"></div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-top: 4px;">Gesamtstatus</span>
                    </div>
                </div>

                <!-- Sub-Status Grid -->
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
                    ${['budget', 'scope', 'time', 'resources', 'risks'].map(key => `
                        <div style="text-align: center; padding: 8px; background: white; border-radius: 8px;">
                            <div class="pmo-traffic-light-small ${projectStatus?.status?.[key] || 'gray'}" style="width: 16px; height: 16px; margin: 0 auto 4px;"></div>
                            <span style="font-size: 10px; color: #64748b; text-transform: capitalize;">${key === 'risks' ? 'Risiken' : key === 'time' ? 'Zeit' : key === 'resources' ? 'Ressourcen' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- Management Summary -->
                ${projectStatus?.summary ? `
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Management Summary</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">
                            ${projectStatus.summary.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <!-- Risks & Next Steps -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    ${projectStatus?.risks ? `
                        <div style="background: white; padding: 12px; border-radius: 8px;">
                            <h4 style="margin: 0 0 6px; font-size: 11px; color: #64748b; text-transform: uppercase;">Risiken</h4>
                            <p style="margin: 0; font-size: 12px; color: #334155;">${projectStatus.risks}</p>
                        </div>
                    ` : ''}
                    ${projectStatus?.nextSteps ? `
                        <div style="background: white; padding: 12px; border-radius: 8px;">
                            <h4 style="margin: 0 0 6px; font-size: 11px; color: #64748b; text-transform: uppercase;">Nächste Schritte</h4>
                            <p style="margin: 0; font-size: 12px; color: #334155;">${projectStatus.nextSteps}</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Status History Calendar -->
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                    <h4 style="margin: 0 0 8px; font-size: 11px; color: #94a3b8; text-align: center;">Statusverlauf</h4>
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        ${historyCalendar}
                    </div>
                </div>
            `;
        }
    },

    closeProjectModal() {
        document.getElementById('pmo-project-modal').classList.remove('active');
    },

    // Render milestones for a specific project in detail modal
    renderProjectMilestones(projectId) {
        // Collect all milestones for this project from status data
        const projectMilestones = [];
        const seen = new Set();

        this.statusData
            .filter(s => s.projectId === projectId)
            .forEach(status => {
                status.milestones.forEach(ms => {
                    const key = `${ms.name}_${ms.plannedDate}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        projectMilestones.push({
                            ...ms,
                            workstreamId: status.workstreamId
                        });
                    }
                });
            });

        if (projectMilestones.length === 0) {
            return '';
        }

        // Sort by date
        projectMilestones.sort((a, b) => {
            const dateA = new Date(a.currentEstimate || a.plannedDate);
            const dateB = new Date(b.currentEstimate || b.plannedDate);
            return dateA - dateB;
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return `
            <h4 style="margin: 24px 0 16px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="vertical-align: middle; margin-right: 6px;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Meilensteine
            </h4>
            <div class="pmo-project-milestones-list">
                ${projectMilestones.map(ms => {
                    const dueDate = new Date(ms.currentEstimate || ms.plannedDate);
                    const isOverdue = ms.status !== 'Geschlossen' && dueDate < today;
                    const isClosed = ms.status === 'Geschlossen';
                    const isDelayed = ms.status === 'Verzögert';

                    let statusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
                    let statusColor = '#64748b';
                    if (isClosed) {
                        statusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="14" height="14"><path d="M20 6L9 17l-5-5"/></svg>';
                        statusColor = '#22c55e';
                    } else if (isOverdue) {
                        statusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
                        statusColor = '#ef4444';
                    } else if (isDelayed) {
                        statusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
                        statusColor = '#eab308';
                    }

                    const milestoneId = `${ms.workstreamId}_${ms.name.replace(/\s/g, '_')}`;
                    return `
                        <div class="pmo-milestone-item" style="display: flex; align-items: center; padding: 10px 16px; background: ${isOverdue ? '#fef2f2' : '#f8fafc'}; border-radius: 8px; margin-bottom: 6px; border-left: 3px solid ${statusColor}; cursor: pointer; transition: all 0.2s;" onclick="PMO.openMilestoneModal('${milestoneId}')">
                            <span style="margin-right: 10px; display: flex; align-items: center;">${statusIcon}</span>
                            <span style="font-weight: 500; color: #E30613; margin-right: 8px; font-size: 11px;">${ms.workstreamId}</span>
                            <span style="flex: 1; font-size: 13px; color: #1e293b; ${isClosed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${ms.name}</span>
                            <span style="font-size: 12px; color: ${isOverdue ? '#ef4444' : '#64748b'}; font-weight: ${isOverdue ? '600' : '400'};">${this.formatDate(ms.currentEstimate || ms.plannedDate)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
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

        console.log('Status gespeichert:', newStatus);
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
        const filter = document.getElementById('milestones-status-filter')?.value || '';

        const allMilestones = [];
        this.statusData.forEach(status => {
            status.milestones.forEach(ms => {
                // Calculate delay days
                const planned = new Date(ms.plannedDate);
                const current = ms.currentEstimate ? new Date(ms.currentEstimate) : planned;
                const today = new Date();
                const delayDays = Math.ceil((current - planned) / (1000 * 60 * 60 * 24));
                const daysUntil = Math.ceil((current - today) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntil < 0 && ms.status !== 'Geschlossen';

                allMilestones.push({
                    ...ms,
                    projectId: status.projectId,
                    workstreamId: status.workstreamId,
                    delayDays,
                    daysUntil,
                    isOverdue
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

        // Update stats summary
        this.updateMilestoneStats(uniqueMilestones);

        const filteredMilestones = filter
            ? uniqueMilestones.filter(m => m.status === filter)
            : uniqueMilestones;

        // Sort: overdue first, then by date
        filteredMilestones.sort((a, b) => {
            if (a.isOverdue && !b.isOverdue) return -1;
            if (!a.isOverdue && b.isOverdue) return 1;
            if (a.status === 'Verzögert' && b.status !== 'Verzögert') return -1;
            if (a.status !== 'Verzögert' && b.status === 'Verzögert') return 1;
            return new Date(a.currentEstimate) - new Date(b.currentEstimate);
        });

        tbody.innerHTML = filteredMilestones.map(ms => {
            const rowClass = ms.isOverdue ? 'overdue-row' : (ms.status === 'Verzögert' ? 'delayed-row' : '');
            const delayBadge = ms.delayDays > 0
                ? `<span class="pmo-delay-badge">${ms.delayDays > 0 ? '+' : ''}${ms.delayDays}d</span>`
                : '';
            const statusClass = ms.status.toLowerCase().replace(' ', '-');

            return `
            <tr class="${rowClass}" onclick="PMO.openMilestoneDetail('${ms.workstreamId}', '${ms.name.replace(/'/g, "\\'")}')">
                <td><span class="pmo-project-badge">${ms.projectId}</span></td>
                <td>${ms.workstreamId}</td>
                <td>
                    <div class="pmo-milestone-name-cell">
                        ${ms.isOverdue ? '<span class="pmo-overdue-icon">!</span>' : ''}
                        <span>${ms.name}</span>
                    </div>
                </td>
                <td>${this.formatDate(ms.plannedDate)}</td>
                <td>
                    <div class="pmo-current-date-cell">
                        <span>${this.formatDate(ms.currentEstimate)}</span>
                        ${delayBadge}
                    </div>
                </td>
                <td><span class="pmo-status-badge ${statusClass}">${ms.status}</span></td>
            </tr>
        `;
        }).join('') || '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 40px;">Keine Meilensteine gefunden</td></tr>';
    },

    // Update milestone stats summary
    updateMilestoneStats(milestones) {
        const statsContainer = document.getElementById('milestone-stats');
        if (!statsContainer) return;

        const total = milestones.length;
        const imPlan = milestones.filter(m => m.status === 'Im Plan').length;
        const verzoegert = milestones.filter(m => m.status === 'Verzögert').length;
        const geschlossen = milestones.filter(m => m.status === 'Geschlossen').length;
        const overdue = milestones.filter(m => m.isOverdue).length;

        statsContainer.innerHTML = `
            <div class="pmo-milestone-stat">
                <span class="stat-value">${total}</span>
                <span class="stat-label">Gesamt</span>
            </div>
            <div class="pmo-milestone-stat green">
                <span class="stat-value">${imPlan}</span>
                <span class="stat-label">Im Plan</span>
            </div>
            <div class="pmo-milestone-stat yellow">
                <span class="stat-value">${verzoegert}</span>
                <span class="stat-label">Verzögert</span>
            </div>
            <div class="pmo-milestone-stat gray">
                <span class="stat-value">${geschlossen}</span>
                <span class="stat-label">Geschlossen</span>
            </div>
            ${overdue > 0 ? `
            <div class="pmo-milestone-stat red blink-stat">
                <span class="stat-value">${overdue}</span>
                <span class="stat-label">Überfällig!</span>
            </div>
            ` : ''}
        `;
    },

    // Open milestone detail for editing
    openMilestoneDetail(workstreamId, milestoneName) {
        const milestoneId = `${workstreamId}_${milestoneName.replace(/\s/g, '_')}`;
        this.openMilestoneModal(milestoneId);
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

    // ========================================
    // VIEW-BASED SEARCH (Dedicated Search Tab)
    // ========================================
    performViewSearch() {
        const query = document.getElementById('pmo-view-search-input').value.toLowerCase().trim();
        const resultsContainer = document.getElementById('pmo-view-search-results');

        if (query.length < 2) {
            resultsContainer.innerHTML = `
                <div class="pmo-search-hint-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <p>Geben Sie mindestens 2 Zeichen ein, um zu suchen</p>
                </div>
            `;
            return;
        }

        const results = [];

        // Search in status data
        this.statusData.forEach(status => {
            const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === status.projectId);
            const ws = project?.workstreams.find(w => w.id === status.workstreamId);

            // Search in all text fields
            const fields = [
                { name: 'Management Summary', content: status.summary.join(' ') },
                { name: 'Projektfortschritt', content: status.progress },
                { name: 'Anstehende Aktivitäten', content: status.upcoming },
                { name: 'Erforderliche Entscheidungen', content: status.decisions }
            ];

            // Add risks and issues
            status.risksAndIssues.forEach((r, idx) => {
                fields.push({ name: `Risiko/Issue #${idx + 1}`, content: r.description });
            });

            // Add milestones
            status.milestones.forEach((m, idx) => {
                fields.push({ name: `Meilenstein: ${m.name}`, content: m.name });
            });

            // Check each field for matches
            fields.forEach(field => {
                if (field.content && field.content.toLowerCase().includes(query)) {
                    const context = this.extractContext(field.content, query);
                    results.push({
                        type: 'status',
                        statusId: status.id,
                        projectId: status.projectId,
                        workstreamId: status.workstreamId,
                        workstreamName: ws?.name || status.workstreamId,
                        date: status.date,
                        field: field.name,
                        context: context,
                        fullText: field.content
                    });
                }
            });
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="pmo-search-hint-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <p>Keine Ergebnisse gefunden für "${query}"</p>
                    <small>Versuchen Sie andere Suchbegriffe</small>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        results.sort((a, b) => b.date.localeCompare(a.date));

        // Render results
        resultsContainer.innerHTML = `
            <div class="pmo-search-stats">
                <strong>${results.length}</strong> ${results.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden für "<mark>${query}</mark>"
            </div>
            <div class="pmo-search-results-list">
                ${results.map(r => `
                    <div class="pmo-search-result-card" onclick="PMO.handleViewSearchResultClick('${r.statusId}', '${query}')">
                        <div class="pmo-search-result-header">
                            <div class="pmo-search-result-meta">
                                <span class="pmo-search-result-ws">${r.projectId} / ${r.workstreamId}</span>
                                <span class="pmo-search-result-date">${this.formatDate(r.date)}</span>
                            </div>
                            <div class="pmo-search-result-field">${r.field}</div>
                        </div>
                        <div class="pmo-search-result-title">${r.workstreamName}</div>
                        <div class="pmo-search-result-context">${r.context}</div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    extractContext(text, query, contextLength = 100) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);

        if (index === -1) return text.substring(0, contextLength) + '...';

        const start = Math.max(0, index - contextLength);
        const end = Math.min(text.length, index + query.length + contextLength);
        let excerpt = text.substring(start, end);

        if (start > 0) excerpt = '...' + excerpt;
        if (end < text.length) excerpt = excerpt + '...';

        // Highlight the query
        return excerpt.replace(new RegExp(`(${this.escapeRegex(query)})`, 'gi'), '<mark>$1</mark>');
    },

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    handleViewSearchResultClick(statusId, searchQuery) {
        // Save search query for highlighting
        this.pptSearchHighlight = searchQuery;
        // Open PPT view for the status
        this.openPPTViewForStatus(statusId);
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
                            ${ms.status === 'Geschlossen' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
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
                            Fällig: ${this.formatDate(d.dueDate)} ${isOverdue ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align: middle; margin-left: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' : ''}
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

        // History calendar (last 4 weeks) - clickable to navigate
        const historyCalendar = this.pptStatusHistory.slice(0, 4).map((s, i) => {
            const date = new Date(s.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('de-DE', { month: 'short' });
            const isCurrentWeek = i === this.pptCurrentIndex;
            return `
                <div class="ppt-cal-week ${s.status.overall} ${isCurrentWeek ? 'current' : ''}"
                     title="${this.formatDate(s.date)} - Klicken zum Anzeigen"
                     onclick="PMO.pptJumpToWeek(${i})"
                     style="cursor: pointer;">
                    <span class="ppt-cal-day">${day}</span>
                    <span class="ppt-cal-month">${month}</span>
                </div>
            `;
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
                                        <p style="margin-bottom:8px; display: flex; align-items: flex-start; gap: 6px;">
                                            ${m.status === 'Geschlossen'
                                                ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" width="14" height="14" style="flex-shrink:0; margin-top:2px;"><path d="M20 6L9 17l-5-5"/></svg>'
                                                : m.status === 'Verzögert'
                                                    ? '<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" width="14" height="14" style="flex-shrink:0; margin-top:2px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
                                                    : '<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" width="14" height="14" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
                                            }
                                            <span>${this.highlightSearchTerm(m.name)}<br><small style="color:#64748b;">${this.formatDate(m.currentEstimate || m.plannedDate)}</small></span>
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
                        <div class="ppt-history-label">Statusverlauf</div>
                        <div class="ppt-history-calendar">
                            ${historyCalendar}
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

    pptJumpToWeek(index) {
        if (index >= 0 && index < this.pptStatusHistory.length) {
            this.pptCurrentIndex = index;
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
            const templateResponse = await fetch('/assets/2025_CPE_Status_Template.pptx');
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
            const title = ws?.name || status.workstreamId;
            const progressBullets = status.progress ? status.progress.split('\n').filter(l => l.trim()) : ['Keine Angaben'];
            const upcomingBullets = status.upcoming ? status.upcoming.split('\n').filter(l => l.trim()) : ['Keine Angaben'];

            // Separate risks (R) and challenges (H)
            const risks = status.risksAndIssues?.filter(r => r.type === 'R') || [];
            const challenges = status.risksAndIssues?.filter(r => r.type === 'H') || [];

            const milestoneBullets = status.milestones?.length > 0
                ? status.milestones.map(m => `${m.name} - ${this.formatDate(m.plannedDate)} (${m.status || 'Im Plan'})`)
                : ['Keine Meilensteine'];
            const decisions = status.decisions || '';
            const summaryBullets = Array.isArray(status.summary) ? status.summary : progressBullets;

            // Color mapping for status bubbles (ERGO brand colors from template)
            const colorMap = {
                'green': '009284',  // ERGO Teal/Green
                'yellow': 'F6CB00', // ERGO Yellow/Gold
                'red': 'BF1528'     // ERGO Red
            };

            // Replace title
            slideXml = slideXml.replace(
                /<a:t>CPE – Teilprojekt<\/a:t>/g,
                `<a:t>${this.escapeXml(title)}</a:t>`
            );
            slideXml = slideXml.replace(
                /<a:t>CPE STATUS TEILPROJEKTE<\/a:t>/g,
                `<a:t>STATUS TEILPROJEKTE</a:t>`
            );
            // Alternative title pattern
            slideXml = slideXml.replace(
                /<a:t>Teilprojekt [A-Z]\d*:[^<]*<\/a:t>/g,
                `<a:t>${this.escapeXml(title)}</a:t>`
            );

            // Replace date placeholder "tt.mm.2025" or "Status vom: tt.mm.2025"
            const statusDate = this.formatDate(status.date);
            slideXml = slideXml.replace(
                /<a:t>tt\.mm\.2025<\/a:t>/g,
                `<a:t>${statusDate}</a:t>`
            );
            slideXml = slideXml.replace(
                /<a:t>Status vom: tt\.mm\.2025<\/a:t>/g,
                `<a:t>Status vom: ${statusDate}</a:t>`
            );

            // Debug: Check what patterns exist in ORIGINAL template BEFORE any replacements
            const xxMatchesBefore = (slideXml.match(/<a:t>xx<\/a:t>/g) || []).length;
            const xxxMatchesBefore = (slideXml.match(/<a:t>: xxx<\/a:t>/g) || []).length;
            const XxxMatchesBefore = (slideXml.match(/<a:t>Xxx<\/a:t>/g) || []).length;
            console.log('ORIGINAL Template patterns:', { xx: xxMatchesBefore, colonXxx: xxxMatchesBefore, Xxx: XxxMatchesBefore });

            // Combine all content for Xxx placeholders in order:
            // 1-3: Projektfortschritt (3 bullets)
            // 4-6: Anstehende Aktivitäten (3 bullets)
            // 7+: Milestone names (3 rows typically) and decision items
            const milestoneNames = status.milestones ? status.milestones.map(m => m.name || '') : ['', '', ''];
            const decisionText = status.decisions || '';

            const allXxxContent = [
                ...progressBullets.slice(0, 3),           // Position 0-2
                ...upcomingBullets.slice(0, 3),           // Position 3-5
                ...milestoneNames.slice(0, 3),            // Position 6-8 (milestone names)
                decisionText                               // Position 9 (decision)
            ];

            // Pad with empty strings if needed
            while (allXxxContent.length < 12) {
                allXxxContent.push('');
            }

            // Replace Xxx placeholders with combined content
            let xxxIndex = 0;
            slideXml = slideXml.replace(/<a:t>Xxx<\/a:t>/g, () => {
                const content = allXxxContent[xxxIndex] || '';
                xxxIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Replace Yyy placeholders with Anstehende Aktivitäten bullets (if template uses Yyy)
            let yyyIndex = 0;
            slideXml = slideXml.replace(/<a:t>Yyy<\/a:t>/g, () => {
                const content = upcomingBullets[yyyIndex] || '';
                yyyIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Debug: Log data being used for replacements
            console.log('Summary bullets:', summaryBullets);
            console.log('Risks/Challenges:', status.risksAndIssues);

            // Replace xx (lowercase) placeholders for Management Summary
            let xxIndex = 0;
            slideXml = slideXml.replace(/<a:t>xx<\/a:t>/g, () => {
                const content = summaryBullets[xxIndex] || '';
                console.log(`Replacing xx[${xxIndex}] with: "${content}"`);
                xxIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Also handle XX (uppercase) if present
            xxIndex = 0;
            slideXml = slideXml.replace(/<a:t>XX<\/a:t>/g, () => {
                const content = summaryBullets[xxIndex] || '';
                console.log(`Replacing XX[${xxIndex}] with: "${content}"`);
                xxIndex++;
                return `<a:t>${this.escapeXml(content)}</a:t>`;
            });

            // Replace ": xxx" pattern after R and H labels in Risks/Challenges table
            // The template has separate <a:t>R</a:t> and <a:t>: xxx</a:t>
            const allRisksAndChallenges = status.risksAndIssues || [];
            let riskChallengeIndex = 0;

            // Replace ": xxx" patterns with actual risk/challenge descriptions
            slideXml = slideXml.replace(/<a:t>: xxx<\/a:t>/g, () => {
                const item = allRisksAndChallenges[riskChallengeIndex];
                console.log(`Replacing : xxx[${riskChallengeIndex}] with:`, item?.description);
                riskChallengeIndex++;
                if (item) {
                    return `<a:t>: ${this.escapeXml(item.description)}</a:t>`;
                }
                return `<a:t></a:t>`;
            });

            // Replace risk/challenge status placeholders (Geschlossen, Offen, Neu)
            let rcStatusIndex = 0;
            slideXml = slideXml.replace(/<a:t>(Geschlossen|Offen|Neu)<\/a:t>/g, (match) => {
                const item = allRisksAndChallenges[rcStatusIndex];
                rcStatusIndex++;
                if (item && item.status) {
                    return `<a:t>${this.escapeXml(item.status)}</a:t>`;
                }
                return match; // Keep original if no replacement
            });

            // Replace dates in milestone table (format: DD.MM.YYYY like 15.01.2025)
            let dateIndex = 0;
            const allDates = [];
            if (status.milestones) {
                status.milestones.forEach(ms => {
                    allDates.push(this.formatDate(ms.plannedDate));
                    allDates.push(this.formatDate(ms.currentEstimate || ms.plannedDate));
                });
            }

            // Replace specific date patterns like "15.01.2025", "20.01.2025", "30.03.2025"
            slideXml = slideXml.replace(/<a:t>\d{2}\.\d{2}\.2025<\/a:t>/g, () => {
                const date = allDates[dateIndex] || '';
                dateIndex++;
                return `<a:t>${this.escapeXml(date)}</a:t>`;
            });

            // Also handle TT.MM.JJ pattern if present
            dateIndex = 0;
            slideXml = slideXml.replace(/<a:t>TT\.MM\.JJ<\/a:t>/g, () => {
                const date = allDates[dateIndex] || '';
                dateIndex++;
                return `<a:t>${this.escapeXml(date)}</a:t>`;
            });

            // Replace milestone status placeholders (Im Plan, Verzögert)
            // Note: These appear in milestone table, not in risk status section
            let msStatusIndex = 0;
            const milestoneStatuses = status.milestones ? status.milestones.map(ms => ms.status || 'Im Plan') : [];
            // Match "Im Plan" and "Verzögert" in milestone table context
            slideXml = slideXml.replace(/<a:t>(Im Plan|Verzögert)<\/a:t>/g, () => {
                const msStatus = milestoneStatuses[msStatusIndex] || 'Im Plan';
                msStatusIndex++;
                return `<a:t>${this.escapeXml(msStatus)}</a:t>`;
            });

            // Replace decision placeholders
            if (decisions) {
                slideXml = slideXml.replace(
                    /<a:t>R: Lead-Routing System in Pilotphase<\/a:t>/g,
                    `<a:t>${this.escapeXml(decisions)}</a:t>`
                );
                slideXml = slideXml.replace(
                    /<a:t>Entscheidung[^<]*<\/a:t>/g,
                    `<a:t>${this.escapeXml(decisions)}</a:t>`
                );
            }

            // Update status bubble colors
            // The template uses these colors: green=009284, yellow=F6CB00, red=BF1528
            const statusColors = status.status || {};

            // Replace status indicator colors based on current status
            // The oval shapes in the template have colors that need to be swapped
            // Note: This approach replaces ALL occurrences of a color, which works
            // if the template only uses these colors for status indicators

            // For simplicity, we'll update the main status indicator
            // by replacing the default green with the actual status color
            if (statusColors.overall && statusColors.overall !== 'green') {
                // If overall status is yellow, replace green with yellow
                if (statusColors.overall === 'yellow') {
                    // Find the large status oval (first green occurrence) and make it yellow
                    // This is tricky without XML parsing, so we'll do a targeted replacement
                }
                // If overall status is red, make it red
                else if (statusColors.overall === 'red') {
                    // Similar approach
                }
            }

            // Add Erforderliche Entscheidungen if present
            if (status.decisions) {
                slideXml = slideXml.replace(
                    /<a:t>Keine Entscheidungen<\/a:t>/g,
                    `<a:t>${this.escapeXml(status.decisions)}</a:t>`
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

            // Demo-Modus: Versuche PowerPoint in den Vordergrund zu holen
            // Nutze ms-powerpoint: Protokoll um PowerPoint zu aktivieren
            setTimeout(() => {
                try {
                    // Versuche PowerPoint über Protokoll-Handler zu öffnen
                    const pptFrame = document.createElement('iframe');
                    pptFrame.style.display = 'none';
                    pptFrame.src = 'ms-powerpoint:';
                    document.body.appendChild(pptFrame);
                    setTimeout(() => {
                        document.body.removeChild(pptFrame);
                    }, 100);

                    // Zusätzlich: Browser-Fenster in den Hintergrund
                    window.blur();
                } catch (e) {
                    console.log('PowerPoint Protokoll nicht verfügbar');
                }
            }, 300);

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

    // ==========================================
    // KPIs View
    // ==========================================

    // KPI Data for P-10 (Apr 2025 - Jan 2026)
    kpiData: {
        // Strategisch
        vertraege: {
            current: 2.10,
            target: 2.80,
            history: [2.02, 2.04, 2.05, 2.07, 2.08, 2.10, 2.13, 2.12, 2.12, 2.10]
        },
        ape: {
            current: 42000,
            target: 180000,
            history: [35000, 36000, 37000, 38000, 39000, 40000, 40000, 41000, 42000, 42000]
        },
        // Vertrieblich
        nps: {
            current: 38,
            benchmark: 35,
            previousMonth: 45,
            history: [28, 30, 32, 34, 36, 40, 43, 45, 45, 38]  // Drop in January from 45 to 38
        },
        adoption: {
            tools: {
                'Vertriebsportal': { start: 0, data: [15, 25, 38, 48, 55, 62, 68, 72, 75, 78, 80, 82, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95] },
                'Risikoscoring': { start: 6, data: [null, null, null, null, null, null, 12, 22, 35, 45, 52, 58, 62, 65, 68, 70, 72, 74] },
                'KI-Assistent': { start: 12, data: [null, null, null, null, null, null, null, null, null, null, null, null, 8, 18, 28, 35, 42, 48] }
            }
        },
        // Operativ
        meilensteine: {
            imPlan: 78,
            total: 41,
            inPlan: 32,
            history: [72, 74, 75, 76, 77, 78, 79, 78, 77, 78]
        },
        userstories: {
            konzeption: {
                total: 156,
                byStatus: { backlog: 42, inprogress: 28, review: 18, done: 68 },
                monthly: [
                    { month: 'Apr', backlog: 80, inprogress: 15, review: 5, done: 12 },
                    { month: 'Mai', backlog: 75, inprogress: 18, review: 8, done: 22 },
                    { month: 'Jun', backlog: 68, inprogress: 22, review: 10, done: 32 },
                    { month: 'Jul', backlog: 62, inprogress: 25, review: 12, done: 42 },
                    { month: 'Aug', backlog: 55, inprogress: 28, review: 15, done: 52 },
                    { month: 'Sep', backlog: 50, inprogress: 28, review: 16, done: 58 },
                    { month: 'Okt', backlog: 48, inprogress: 26, review: 18, done: 62 },
                    { month: 'Nov', backlog: 45, inprogress: 28, review: 17, done: 65 },
                    { month: 'Dez', backlog: 43, inprogress: 27, review: 18, done: 67 },
                    { month: 'Jan', backlog: 42, inprogress: 28, review: 18, done: 68 }
                ]
            },
            umsetzung: {
                total: 124,
                byStatus: { backlog: 18, inprogress: 22, review: 12, done: 72 },
                monthly: [
                    { month: 'Apr', backlog: 45, inprogress: 12, review: 8, done: 20 },
                    { month: 'Mai', backlog: 40, inprogress: 15, review: 10, done: 28 },
                    { month: 'Jun', backlog: 35, inprogress: 18, review: 12, done: 38 },
                    { month: 'Jul', backlog: 30, inprogress: 20, review: 10, done: 48 },
                    { month: 'Aug', backlog: 26, inprogress: 22, review: 11, done: 56 },
                    { month: 'Sep', backlog: 24, inprogress: 24, review: 10, done: 62 },
                    { month: 'Okt', backlog: 22, inprogress: 23, review: 11, done: 66 },
                    { month: 'Nov', backlog: 20, inprogress: 22, review: 12, done: 69 },
                    { month: 'Dez', backlog: 19, inprogress: 22, review: 12, done: 71 },
                    { month: 'Jan', backlog: 18, inprogress: 22, review: 12, done: 72 }
                ]
            }
        },
        tests: {
            total: 48,
            started: 42,
            completed: 38,
            history: {
                total: [30, 32, 35, 38, 40, 42, 44, 45, 47, 48],
                started: [28, 30, 32, 35, 37, 39, 40, 41, 42, 42],
                completed: [22, 25, 28, 30, 32, 34, 35, 36, 37, 38]
            }
        },
        defects: {
            critical: 3,
            major: 12,
            minor: 28,
            monthly: [
                { month: 'Apr', critical: 5, major: 18, minor: 35 },
                { month: 'Mai', critical: 6, major: 20, minor: 38 },
                { month: 'Jun', critical: 5, major: 18, minor: 36 },
                { month: 'Jul', critical: 4, major: 16, minor: 34 },
                { month: 'Aug', critical: 4, major: 15, minor: 32 },
                { month: 'Sep', critical: 3, major: 14, minor: 30 },
                { month: 'Okt', critical: 3, major: 13, minor: 29 },
                { month: 'Nov', critical: 3, major: 12, minor: 28 },
                { month: 'Dez', critical: 3, major: 12, minor: 28 },
                { month: 'Jan', critical: 3, major: 12, minor: 28 }
            ]
        },
        ressourcen: {
            ptIst: 245,
            ptAngefragt: 280,
            auslastung: 87,
            // Breakdown by intern/extern
            intern: {
                ist: 155,        // Verfügbare interne PT
                angefragt: 165,  // Nachgefragte interne PT - mehr als verfügbar!
                auslastung: 106, // 165/155 = 106% = Überlastung!
                history: {
                    ist: [135, 138, 140, 142, 145, 148, 150, 152, 155, 155],      // Verfügbar
                    angefragt: [140, 142, 145, 148, 150, 152, 155, 158, 163, 165] // Nachgefragt - steigt!
                }
            },
            extern: {
                ist: 80,
                angefragt: 125,
                auslastung: 64,
                history: {
                    ist: [80, 83, 85, 87, 88, 88, 87, 86, 85, 80],
                    angefragt: [115, 117, 120, 123, 125, 127, 128, 127, 125, 125]
                }
            },
            history: {
                ist: [220, 225, 230, 235, 238, 240, 242, 244, 245, 245],
                angefragt: [250, 255, 260, 265, 270, 275, 278, 279, 280, 280]
            }
        },
        budget: {
            plan: 3200000,
            verbrauch: 2400000,
            abweichung: -100000,
            forecast: 3100000,
            history: {
                plan: [320, 640, 960, 1280, 1600, 1920, 2240, 2560, 2880, 3200],
                verbrauch: [280, 580, 870, 1180, 1480, 1780, 2050, 2250, 2400, 2400],
                forecast: [280, 580, 870, 1180, 1480, 1780, 2100, 2450, 2800, 3100]
            }
        },
        // ERGO North Star KPIs
        northStar: {
            apeProduktivitaet: { current: 42, target: 50, history: [35, 36, 37, 38, 39, 40, 40, 41, 42, 42] },
            kundenNps: { current: 42, benchmark: 35, history: [32, 34, 35, 36, 37, 38, 39, 40, 41, 42] },
            beratungsqualitaet: { current: 87, target: 90, history: [78, 80, 81, 82, 83, 84, 85, 86, 86, 87] },
            vpNps: { current: 28, target: 40, history: [18, 20, 21, 22, 23, 24, 25, 26, 27, 28] },
            vpAbgang: { current: 8.2, target: 10, history: [12, 11.5, 11, 10.5, 10, 9.5, 9, 8.8, 8.5, 8.2] },
            eodb: { current: 72, target: 85, history: [55, 58, 60, 62, 64, 66, 68, 70, 71, 72] },
            vertragsdichte: { current: 2.1, target: 2.8, history: [1.85, 1.88, 1.90, 1.93, 1.96, 1.99, 2.02, 2.05, 2.08, 2.10] },
            crossSell: { current: 24, target: 25, history: [16, 17, 18, 19, 20, 21, 22, 22, 23, 24] },
            aiNutzung: { current: 48, target: 60, history: [8, 12, 18, 24, 28, 32, 38, 42, 45, 48] },
            conversion: { current: 18, target: 22, history: [12, 13, 14, 14, 15, 15, 16, 17, 17, 18] },
            rekrutierung: { current: 112, target: 100, history: [85, 88, 92, 95, 98, 100, 104, 106, 110, 112] },
            timeToProd: { current: 8.5, target: 6, history: [12, 11.5, 11, 10.5, 10, 9.5, 9, 8.8, 8.6, 8.5] }
        }
    },

    renderKPIs() {
        console.log('renderKPIs() aufgerufen');
        // Render all P-10 KPI charts
        this.renderP10Charts();

        // Render early warning indicators in sidebar
        this.renderEarlyWarnings();
    },

    renderP10Charts() {
        console.log('renderP10Charts() aufgerufen');

        // Wait a tick for DOM to be ready, then render
        setTimeout(() => this._doRenderP10Charts(), 100);
    },

    _doRenderP10Charts() {
        const labels = ['Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan'];

        // Try Chart.js first (like A-03), fallback to SVG
        if (typeof Chart !== 'undefined') {
            console.log('Chart.js verfuegbar - verwende Chart.js');
            this._renderP10WithChartJS(labels);
        } else {
            console.log('Chart.js nicht verfuegbar - verwende SVG');
            this._renderP10WithSVG(labels);
        }
    },

    _renderP10WithChartJS(labels) {
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0 }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                    ticks: { color: '#94a3b8', font: { size: 10 } }
                }
            }
        };

        // Helper to create Chart.js chart
        const createChart = (canvasId, datasets, yMin, yMax, tickCallback) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) { console.warn('Canvas nicht gefunden:', canvasId); return; }

            // Destroy existing chart using Chart.js API
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }

            const ctx = canvas.getContext('2d');

            const opts = JSON.parse(JSON.stringify(chartOptions));
            if (yMin !== undefined) opts.scales.y.min = yMin;
            if (yMax !== undefined) opts.scales.y.max = yMax;
            if (tickCallback) opts.scales.y.ticks.callback = tickCallback;

            canvas._chart = new Chart(ctx, {
                type: 'line',
                data: { labels, datasets },
                options: opts
            });
        };

        // Verträge pro Kunde
        createChart('chart-vertraege', [
            { label: 'Ist', data: this.kpiData.vertraege.history, borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 },
            { label: 'Ziel', data: Array(10).fill(this.kpiData.vertraege.target), borderColor: '#86BC25', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 }
        ], 1.8, 3.0);

        // APE pro Vertriebspartner
        createChart('chart-ape', [
            { label: 'Ist', data: this.kpiData.ape.history.map(v => v/1000), borderColor: '#0ea5e9', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 },
            { label: 'Ziel', data: Array(10).fill(this.kpiData.ape.target/1000), borderColor: '#86BC25', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 }
        ], 0, 200, v => '€' + v + 'k');

        // NPS Score - with warning overlay since it dropped
        const npsCanvas = document.getElementById('pmo-chart-nps');
        if (npsCanvas) {
            const existingNPS = Chart.getChart(npsCanvas);
            if (existingNPS) existingNPS.destroy();
            const npsCtx = npsCanvas.getContext('2d');

            // Check if NPS dropped (current < previous)
            const npsHistory = this.kpiData.nps.history;
            const npsDropped = npsHistory[npsHistory.length - 1] < npsHistory[npsHistory.length - 2];

            // Plugin to draw warning icon directly on canvas (more reliable than overlay)
            const npsWarningPlugin = {
                id: 'npsWarningIcon',
                afterDatasetsDraw: (chart) => {
                    if (!npsDropped) return;

                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    const lastPoint = meta.data[meta.data.length - 1];

                    if (!lastPoint) return;

                    const x = lastPoint.x;
                    const y = lastPoint.y - 22; // 22px above the data point

                    // Draw circle background
                    ctx.save();
                    ctx.fillStyle = '#f59e0b';
                    ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(x, y, 11, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw exclamation mark
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 13px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('!', x, y);
                    ctx.restore();
                }
            };

            npsCanvas._chart = new Chart(npsCtx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        { label: 'NPS', data: this.kpiData.nps.history, borderColor: '#8b5cf6', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 },
                        { label: 'Benchmark', data: Array(10).fill(this.kpiData.nps.benchmark), borderColor: '#86BC25', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 }
                    ]
                },
                options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: -20, max: 60 } } },
                plugins: [npsWarningPlugin]
            });
        }

        // Pulse Check OPL & WS
        createChart('chart-pulse-check', [
            { label: 'Score', data: [3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.2, 4.2], borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 },
            { label: 'Ziel', data: Array(10).fill(4.0), borderColor: '#86BC25', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 }
        ], 3.5, 5.0);

        // User Adoption
        const adoptionLabels = ['Jan 24', 'Apr', 'Jul', 'Okt', 'Jan 25', 'Apr', 'Jul', 'Okt', 'Jan 26'];
        const adoptionCanvas = document.getElementById('chart-adoption');
        if (adoptionCanvas) {
            const existingAdoption = Chart.getChart(adoptionCanvas);
            if (existingAdoption) existingAdoption.destroy();
            const ctx = adoptionCanvas.getContext('2d');
            adoptionCanvas._chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: adoptionLabels,
                    datasets: [
                        { label: 'Portal', data: [10, 25, 45, 65, 78, 85, 90, 93, 95], borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                        { label: 'Risk', data: [null, null, 5, 18, 35, 52, 62, 70, 74], borderColor: '#f59e0b', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                        { label: 'KI', data: [null, null, null, null, null, 8, 22, 38, 48], borderColor: '#8b5cf6', tension: 0.3, pointRadius: 3, borderWidth: 2 }
                    ]
                },
                options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 100, ticks: { ...chartOptions.scales.y.ticks, callback: v => v + '%' } } } }
            });
        }

        // Meilensteine
        createChart('chart-meilensteine', [
            { label: 'Im Plan', data: this.kpiData.meilensteine.history, borderColor: '#16a34a', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 }
        ], 50, 100, v => v + '%');

        // User Stories (stacked bar) - use current mode
        const usCanvas = document.getElementById('chart-userstories');
        if (usCanvas) {
            const usInitModeChart = this.userStoriesMode || 'konzeption';
            const usInitData = this.kpiData.userstories[usInitModeChart];
            const existingUS = Chart.getChart(usCanvas);
            if (existingUS) existingUS.destroy();
            const ctx = usCanvas.getContext('2d');
            usCanvas._chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Backlog', data: usInitData.monthly.map(m => m.backlog), backgroundColor: '#cbd5e1', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                        { label: 'In Progress', data: usInitData.monthly.map(m => m.inprogress), backgroundColor: '#3b82f6', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                        { label: 'Review', data: usInitData.monthly.map(m => m.review), backgroundColor: '#f59e0b', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                        { label: 'Done', data: usInitData.monthly.map(m => m.done), backgroundColor: '#86BC25', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 }
                    ]
                },
                options: { ...chartOptions, scales: { x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true, max: 200 } } }
            });
        }

        // Tests
        createChart('chart-tests', [
            { label: 'Gesamt', data: this.kpiData.tests.history.total, borderColor: '#64748b', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            { label: 'Gestartet', data: this.kpiData.tests.history.started, borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            { label: 'Fertig', data: this.kpiData.tests.history.completed, borderColor: '#86BC25', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 20, 55);

        // Defects (stacked bar) with warning icon on last bar
        const defCanvas = document.getElementById('chart-defects');
        if (defCanvas) {
            const existingDef = Chart.getChart(defCanvas);
            if (existingDef) existingDef.destroy();
            const ctx = defCanvas.getContext('2d');

            // Plugin to draw warning icon directly on canvas
            const defectsWarningPlugin = {
                id: 'defectsWarningIcon',
                afterDatasetsDraw: (chart) => {
                    const criticalCount = this.kpiData.defects.critical;
                    if (criticalCount <= 0) return;

                    const ctx = chart.ctx;
                    const lastIndex = chart.data.labels.length - 1;

                    // Get the top of the stacked bar (highest point)
                    let topY = chart.chartArea.bottom;
                    for (let i = 0; i < chart.data.datasets.length; i++) {
                        const meta = chart.getDatasetMeta(i);
                        const bar = meta.data[lastIndex];
                        if (bar && bar.y < topY) {
                            topY = bar.y;
                        }
                    }

                    const lastBar = chart.getDatasetMeta(0).data[lastIndex];
                    const x = lastBar.x;
                    const y = topY - 20; // 20px above the bar

                    // Draw circle background
                    ctx.save();
                    ctx.fillStyle = '#dc2626';
                    ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(x, y, 12, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw exclamation mark
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('!', x, y);
                    ctx.restore();
                }
            };

            defCanvas._chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Kritisch', data: this.kpiData.defects.monthly.map(m => m.critical), backgroundColor: '#dc2626', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                        { label: 'Major', data: this.kpiData.defects.monthly.map(m => m.major), backgroundColor: '#f59e0b', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                        { label: 'Minor', data: this.kpiData.defects.monthly.map(m => m.minor), backgroundColor: '#86BC25', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 }
                    ]
                },
                options: { ...chartOptions, scales: { x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true, max: 100 } } },
                plugins: [defectsWarningPlugin]
            });
        }

        // Ressourcen - use intern data by default (matching the selected button)
        const resScope = this.resourceScope || 'intern';
        const resData = resScope === 'gesamt' ? this.kpiData.ressourcen.history : this.kpiData.ressourcen[resScope].history;
        createChart('chart-ressourcen', [
            { label: 'Verfügbar', data: resData.ist, borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            { label: 'Bedarf', data: resData.angefragt, borderColor: '#94a3b8', borderDash: [5, 5], tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 100, 200);

        // Budget
        createChart('chart-budget', [
            { label: 'Plan', data: this.kpiData.budget.history.plan.map(v => v/1000), borderColor: '#86BC25', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            { label: 'Verbrauch', data: this.kpiData.budget.history.verbrauch.map(v => v/1000), borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
            { label: 'Forecast', data: this.kpiData.budget.history.forecast.map(v => v/1000), borderColor: '#8b5cf6', borderDash: [5, 5], tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 0, 3.5, v => '€' + v.toFixed(1) + 'M');

        // Render North Star KPI charts
        this._renderNorthStarCharts(labels, createChart);
    },

    _renderNorthStarCharts(labels, createChart) {
        const ns = this.kpiData.northStar;
        if (!ns) return;

        // Kunden-NPS
        createChart('chart-kunden-nps', [
            { label: 'NPS', data: ns.kundenNps.history, borderColor: '#8b5cf6', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 25, 50);

        // 3. Beratungsqualität
        createChart('chart-beratungsqualitaet', [
            { label: 'Score', data: ns.beratungsqualitaet.history, borderColor: '#10b981', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 70, 95, v => v + '%');

        // 4. VP-NPS
        createChart('chart-vp-nps', [
            { label: 'VP-NPS', data: ns.vpNps.history, borderColor: '#f59e0b', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 10, 45);

        // 5. VP-Abgangsquote (inverted - lower is better)
        createChart('chart-vp-abgang', [
            { label: 'Abgang', data: ns.vpAbgang.history, borderColor: '#ef4444', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 5, 15, v => v + '%');

        // 6. EoDB Score
        createChart('chart-eodb', [
            { label: 'Score', data: ns.eodb.history, borderColor: '#6366f1', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 50, 90, v => v + '%');

        // 7. Vertragsdichte
        createChart('chart-vertragsdichte', [
            { label: 'Dichte', data: ns.vertragsdichte.history, borderColor: '#0ea5e9', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 1.7, 2.3);

        // 8. Cross-Sell-Quote
        createChart('chart-cross-sell', [
            { label: 'Quote', data: ns.crossSell.history, borderColor: '#22c55e', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 10, 30, v => v + '%');

        // 9. AI-Nutzungsquote
        createChart('chart-ai-nutzung', [
            { label: 'Nutzung', data: ns.aiNutzung.history, borderColor: '#8b5cf6', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 0, 65, v => v + '%');

        // 10. Conversion Rate
        createChart('chart-conversion', [
            { label: 'Conversion', data: ns.conversion.history, borderColor: '#f97316', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 8, 25, v => v + '%');

        // 11. Rekrutierungsquote
        createChart('chart-rekrutierung', [
            { label: 'Neue VPs', data: ns.rekrutierung.history, borderColor: '#14b8a6', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 70, 130);

        // 12. Time-to-Productivity (inverted - lower is better)
        createChart('chart-time-to-prod', [
            { label: 'Monate', data: ns.timeToProd.history, borderColor: '#f43f5e', tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ], 5, 15);
    },

    _renderP10WithSVG(labels) {

        // Verträge pro Kunde
        this.renderSVGLineChart('chart-vertraege', labels,
            [{ data: this.kpiData.vertraege.history, color: '#3b82f6', label: 'Ist' }],
            this.kpiData.vertraege.target, '#86BC25', 1.8, 3.0);

        // APE pro Vertriebspartner
        this.renderSVGLineChart('chart-ape', labels,
            [{ data: this.kpiData.ape.history.map(v => v/1000), color: '#0ea5e9', label: 'Ist' }],
            this.kpiData.ape.target/1000, '#86BC25', 0, 200, '€', 'k');

        // NPS Score (time series)
        this.renderSVGLineChart('pmo-chart-nps', labels,
            [{ data: this.kpiData.nps.history, color: '#8b5cf6', label: 'NPS' }],
            this.kpiData.nps.benchmark, '#86BC25', -20, 60);

        // Pulse Check OPL & WS
        this.renderSVGLineChart('chart-pulse-check', labels,
            [{ data: [3.8, 3.9, 4.0, 4.1, 4.0, 4.1, 4.2, 4.1, 4.2, 4.2], color: '#10b981', label: 'Score' }],
            4.0, '#86BC25', 3.5, 5.0);

        // User Adoption (2-year multi-line)
        const adoptionLabels = ['Jan 24', 'Apr', 'Jul', 'Okt', 'Jan 25', 'Apr', 'Jul', 'Okt', 'Jan 26'];
        this.renderSVGMultiLineChart('chart-adoption', adoptionLabels, [
            { data: [10, 25, 45, 65, 78, 85, 90, 93, 95], color: '#3b82f6', label: 'Portal' },
            { data: [null, null, 5, 18, 35, 52, 62, 70, 74], color: '#f59e0b', label: 'Risk' },
            { data: [null, null, null, null, null, 8, 22, 38, 48], color: '#8b5cf6', label: 'KI' }
        ], 0, 100, '', '%');

        // Meilensteine
        this.renderSVGLineChart('chart-meilensteine', labels,
            [{ data: this.kpiData.meilensteine.history, color: '#16a34a', label: 'Im Plan' }],
            null, null, 50, 100, '', '%');

        // User Stories (stacked bar) - use current mode
        const usInitMode = this.userStoriesMode || 'konzeption';
        this.renderSVGStackedBarChart('chart-userstories', labels, this.kpiData.userstories[usInitMode].monthly,
            ['backlog', 'inprogress', 'review', 'done'],
            ['#94a3b8', '#3b82f6', '#f59e0b', '#16a34a']);

        // Tests
        this.renderSVGMultiLineChart('chart-tests', labels, [
            { data: this.kpiData.tests.history.total, color: '#64748b', label: 'Gesamt' },
            { data: this.kpiData.tests.history.started, color: '#3b82f6', label: 'Gestartet' },
            { data: this.kpiData.tests.history.completed, color: '#16a34a', label: 'Fertig' }
        ], 20, 55);

        // Defects (stacked bar)
        this.renderSVGStackedBarChart('chart-defects', labels, this.kpiData.defects.monthly,
            ['critical', 'major', 'minor'],
            ['#dc2626', '#f59e0b', '#fbbf24']);

        // Ressourcen - use intern data by default
        const resScopeSVG = this.resourceScope || 'intern';
        const resDataSVG = resScopeSVG === 'gesamt' ? this.kpiData.ressourcen.history : this.kpiData.ressourcen[resScopeSVG].history;
        this.renderSVGMultiLineChart('chart-ressourcen', labels, [
            { data: resDataSVG.ist, color: '#3b82f6', label: 'Verfügbar' },
            { data: resDataSVG.angefragt, color: '#94a3b8', label: 'Bedarf', dashed: true }
        ], 100, 200);

        // Budget
        this.renderSVGMultiLineChart('chart-budget', labels, [
            { data: this.kpiData.budget.history.plan.map(v => v/1000), color: '#86BC25', label: 'Plan' },
            { data: this.kpiData.budget.history.verbrauch.map(v => v/1000), color: '#3b82f6', label: 'Verbr.' },
            { data: this.kpiData.budget.history.forecast.map(v => v/1000), color: '#8b5cf6', label: 'Forecast', dashed: true }
        ], 0, 3.5, '€', 'M');
    },

    renderSVGLineChart(containerId, labels, lines, targetValue, targetColor, minY, maxY, prefix = '', suffix = '') {
        let container = document.getElementById(containerId);
        if (!container) { console.warn('Container not found:', containerId); return; }

        // If it's a canvas, replace with a div for SVG rendering
        if (container.tagName === 'CANVAS') {
            const div = document.createElement('div');
            div.id = containerId;
            div.style.width = '100%';
            div.style.height = '130px';
            container.parentElement.replaceChild(div, container);
            container = div;
        }

        // Clear existing content and get parent dimensions
        const parent = container.parentElement;
        const width = parent ? parent.offsetWidth - 20 : 280;
        const height = 130;
        const padding = { top: 15, right: 15, bottom: 25, left: 45 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const xScale = (i, len) => padding.left + (i / (len - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

        let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">`;

        // Y-axis grid lines and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const yVal = minY + (maxY - minY) * (i / ySteps);
            const y = yScale(yVal);
            svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
            svg += `<text x="${padding.left - 5}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="10">${prefix}${yVal.toFixed(1)}${suffix}</text>`;
        }

        // X-axis labels
        labels.forEach((label, i) => {
            if (i % 2 === 0 || i === labels.length - 1) {
                svg += `<text x="${xScale(i, labels.length)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="9">${label}</text>`;
            }
        });

        // Target line if exists
        if (targetValue !== null && targetColor) {
            const targetY = yScale(targetValue);
            svg += `<line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="${targetColor}" stroke-width="2" stroke-dasharray="6,4"/>`;
        }

        // Data lines
        lines.forEach(line => {
            const points = line.data.map((v, i) => `${xScale(i, line.data.length)},${yScale(v)}`).join(' ');
            svg += `<polyline points="${points}" fill="none" stroke="${line.color}" stroke-width="2.5"/>`;
            // End point
            const lastIdx = line.data.length - 1;
            svg += `<circle cx="${xScale(lastIdx, line.data.length)}" cy="${yScale(line.data[lastIdx])}" r="5" fill="${line.color}"/>`;
        });

        svg += '</svg>';
        container.innerHTML = svg;
    },

    renderSVGMultiLineChart(containerId, labels, lines, minY, maxY, prefix = '', suffix = '') {
        let container = document.getElementById(containerId);
        if (!container) { console.warn('Container not found:', containerId); return; }

        // If it's a canvas, replace with a div for SVG rendering
        if (container.tagName === 'CANVAS') {
            const div = document.createElement('div');
            div.id = containerId;
            div.style.width = '100%';
            div.style.height = '130px';
            container.parentElement.replaceChild(div, container);
            container = div;
        }

        const parent = container.parentElement;
        const width = parent ? parent.offsetWidth - 20 : 280;
        const height = 130;
        const padding = { top: 15, right: 15, bottom: 25, left: 45 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const xScale = (i, len) => padding.left + (i / (len - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

        let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">`;

        // Y-axis grid and labels
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const yVal = minY + (maxY - minY) * (i / ySteps);
            const y = yScale(yVal);
            svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
            svg += `<text x="${padding.left - 5}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="10">${prefix}${Number.isInteger(yVal) ? yVal : yVal.toFixed(1)}${suffix}</text>`;
        }

        // X-axis labels
        labels.forEach((label, i) => {
            if (i % 2 === 0 || i === labels.length - 1) {
                svg += `<text x="${xScale(i, labels.length)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="9">${label}</text>`;
            }
        });

        // Data lines
        lines.forEach(line => {
            const validPoints = line.data.map((v, i) => v !== null ? { x: xScale(i, line.data.length), y: yScale(v) } : null).filter(p => p !== null);
            if (validPoints.length > 1) {
                const pathPoints = validPoints.map(p => `${p.x},${p.y}`).join(' ');
                const dashAttr = line.dashed ? 'stroke-dasharray="5,3"' : '';
                svg += `<polyline points="${pathPoints}" fill="none" stroke="${line.color}" stroke-width="2" ${dashAttr}/>`;
                // End point
                const last = validPoints[validPoints.length - 1];
                svg += `<circle cx="${last.x}" cy="${last.y}" r="4" fill="${line.color}"/>`;
            }
        });

        svg += '</svg>';
        container.innerHTML = svg;
    },

    renderSVGStackedBarChart(containerId, labels, monthlyData, keys, colors) {
        let container = document.getElementById(containerId);
        if (!container) { console.warn('Container not found:', containerId); return; }

        // If it's a canvas, replace with a div for SVG rendering
        if (container.tagName === 'CANVAS') {
            const div = document.createElement('div');
            div.id = containerId;
            div.style.width = '100%';
            div.style.height = '130px';
            container.parentElement.replaceChild(div, container);
            container = div;
        }

        const parent = container.parentElement;
        const width = parent ? parent.offsetWidth - 20 : 280;
        const height = 130;
        const padding = { top: 15, right: 15, bottom: 25, left: 35 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const barWidth = (chartWidth / monthlyData.length) - 6;

        const maxTotal = Math.max(...monthlyData.map(m => keys.reduce((sum, k) => sum + (m[k] || 0), 0)));
        const yScale = (v) => (v / maxTotal) * chartHeight;

        let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible">`;

        // Y-axis labels
        [0, Math.round(maxTotal/2), maxTotal].forEach((v, i) => {
            const y = padding.top + chartHeight - yScale(v);
            svg += `<text x="${padding.left - 5}" y="${y + 3}" text-anchor="end" fill="#94a3b8" font-size="10">${v}</text>`;
        });

        // Bars
        monthlyData.forEach((month, i) => {
            const x = padding.left + i * (barWidth + 6) + 3;
            let currentY = padding.top + chartHeight;

            keys.forEach((key, ki) => {
                const value = month[key] || 0;
                const barHeight = yScale(value);
                currentY -= barHeight;
                svg += `<rect x="${x}" y="${currentY}" width="${barWidth}" height="${barHeight}" fill="${colors[ki]}" rx="2"/>`;
            });

            // X-axis label
            if (i % 2 === 0 || i === monthlyData.length - 1) {
                svg += `<text x="${x + barWidth/2}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="9">${labels[i]}</text>`;
            }
        });

        svg += '</svg>';
        container.innerHTML = svg;
    },

    // Keep renderChartJS as fallback for Chart.js if available
    renderChartJS(canvasId, type, labels, datasets, options) {
        // This function is now deprecated in favor of SVG rendering
        console.log('renderChartJS called but using SVG instead');
        return;

        canvas._chart = new Chart(ctx, {
            type: type,
            data: { labels, datasets },
            options
        });
    },

    renderLineChartWithTarget(containerId, data, target, labels, color, minY, maxY, prefix = '', suffix = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth || 280;
        const height = 120;
        const padding = { top: 10, right: 10, bottom: 25, left: 40 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

        const points = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
        const targetY = yScale(target);

        // X-axis labels (show every 3rd)
        let xLabels = '';
        labels.forEach((label, i) => {
            if (i % 3 === 0 || i === labels.length - 1) {
                xLabels += `<text x="${xScale(i)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="10">${label}</text>`;
            }
        });

        // Y-axis labels
        const yLabels = `
            <text x="${padding.left - 5}" y="${yScale(maxY)}" text-anchor="end" fill="#94a3b8" font-size="10">${prefix}${maxY}${suffix}</text>
            <text x="${padding.left - 5}" y="${yScale(minY)}" text-anchor="end" fill="#94a3b8" font-size="10">${prefix}${minY}${suffix}</text>
        `;

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                ${yLabels}
                ${xLabels}
                <!-- Target line -->
                <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}"
                      stroke="#86BC25" stroke-width="2" stroke-dasharray="6,4"/>
                <!-- Data line -->
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5"/>
                <!-- Current point -->
                <circle cx="${xScale(data.length - 1)}" cy="${yScale(data[data.length - 1])}" r="5" fill="${color}"/>
            </svg>
        `;
    },

    renderLineChart(containerId, data, labels, color, minY, maxY, prefix = '', suffix = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth || 280;
        const height = 120;
        const padding = { top: 10, right: 10, bottom: 25, left: 35 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

        const points = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');

        let xLabels = '';
        labels.forEach((label, i) => {
            if (i % 3 === 0 || i === labels.length - 1) {
                xLabels += `<text x="${xScale(i)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="10">${label}</text>`;
            }
        });

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                ${xLabels}
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5"/>
                <circle cx="${xScale(data.length - 1)}" cy="${yScale(data[data.length - 1])}" r="5" fill="${color}"/>
            </svg>
        `;
    },

    renderMultiLineChart(containerId, datasets, labels, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth || 280;
        const height = 120;
        const padding = { top: 10, right: 10, bottom: 25, left: 35 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const allValues = datasets.flat();
        const minY = Math.min(...allValues) * 0.9;
        const maxY = Math.max(...allValues) * 1.1;

        const xScale = (i) => padding.left + (i / (labels.length - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - ((v - minY) / (maxY - minY)) * chartHeight;

        let lines = '';
        datasets.forEach((data, di) => {
            const points = data.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
            const isDashed = di === datasets.length - 1 && datasets.length === 3; // Forecast line dashed
            lines += `<polyline points="${points}" fill="none" stroke="${colors[di]}" stroke-width="2" ${isDashed ? 'stroke-dasharray="4,4"' : ''}/>`;
        });

        let xLabelsHtml = '';
        labels.forEach((label, i) => {
            if (i % 3 === 0 || i === labels.length - 1) {
                xLabelsHtml += `<text x="${xScale(i)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="10">${label}</text>`;
            }
        });

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                ${xLabelsHtml}
                ${lines}
            </svg>
        `;
    },

    renderStackedBarChart(containerId, monthlyData, keys, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.offsetWidth || 280;
        const height = 120;
        const padding = { top: 10, right: 10, bottom: 25, left: 10 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const barWidth = (chartWidth / monthlyData.length) - 4;

        const maxTotal = Math.max(...monthlyData.map(m => keys.reduce((sum, k) => sum + m[k], 0)));

        let bars = '';
        monthlyData.forEach((m, i) => {
            const x = padding.left + i * (barWidth + 4) + 2;
            let y = padding.top + chartHeight;

            keys.forEach((key, ki) => {
                const h = (m[key] / maxTotal) * chartHeight;
                y -= h;
                bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="${colors[ki]}" rx="2"/>`;
            });
        });

        let xLabels = '';
        monthlyData.forEach((m, i) => {
            if (i % 3 === 0 || i === monthlyData.length - 1) {
                xLabels += `<text x="${padding.left + i * (barWidth + 4) + barWidth/2 + 2}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="9">${m.month}</text>`;
            }
        });

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                ${bars}
                ${xLabels}
            </svg>
        `;
    },

    renderAdoptionChart(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tools = this.kpiData.adoption.tools;
        const width = container.offsetWidth || 400;
        const height = 140;
        const padding = { top: 10, right: 10, bottom: 25, left: 35 };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // 24 months
        const months = 24;
        const xScale = (i) => padding.left + (i / (months - 1)) * chartWidth;
        const yScale = (v) => padding.top + chartHeight - (v / 100) * chartHeight;

        const colors = { 'Vertriebsportal': '#3b82f6', 'Risikoscoring': '#8b5cf6', 'KI-Assistent': '#f59e0b' };

        let lines = '';
        Object.entries(tools).forEach(([name, tool]) => {
            const validPoints = tool.data
                .map((v, i) => v !== null ? `${xScale(tool.start + i)},${yScale(v)}` : null)
                .filter(p => p !== null);
            if (validPoints.length > 0) {
                lines += `<polyline points="${validPoints.join(' ')}" fill="none" stroke="${colors[name]}" stroke-width="2"/>`;
            }
        });

        // X-axis: show year labels
        const xLabels = `
            <text x="${xScale(0)}" y="${height - 5}" text-anchor="start" fill="#94a3b8" font-size="10">Jan 24</text>
            <text x="${xScale(12)}" y="${height - 5}" text-anchor="middle" fill="#94a3b8" font-size="10">Jan 25</text>
            <text x="${xScale(23)}" y="${height - 5}" text-anchor="end" fill="#94a3b8" font-size="10">Dez 25</text>
        `;

        // Y-axis
        const yLabels = `
            <text x="${padding.left - 5}" y="${yScale(100)}" text-anchor="end" fill="#94a3b8" font-size="10">100%</text>
            <text x="${padding.left - 5}" y="${yScale(50)}" text-anchor="end" fill="#94a3b8" font-size="10">50%</text>
            <text x="${padding.left - 5}" y="${yScale(0)}" text-anchor="end" fill="#94a3b8" font-size="10">0%</text>
        `;

        container.innerHTML = `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}">
                ${yLabels}
                ${xLabels}
                ${lines}
            </svg>
        `;
    },

    updateKPIValues() {
        // Update Milestone Delays KPI
        const milestoneDelays = document.getElementById('kpi-milestone-delays');
        const milestoneDelaysTrend = document.getElementById('kpi-milestone-delays-trend');
        if (milestoneDelays) {
            milestoneDelays.textContent = this.kpiData['milestone-delays'].value;
        }
        if (milestoneDelaysTrend) {
            milestoneDelaysTrend.textContent = this.kpiData['milestone-delays'].trend;
        }

        // Update CR Requests KPI
        const crRequests = document.getElementById('kpi-cr-requests');
        const crRequestsTrend = document.getElementById('kpi-cr-requests-trend');
        if (crRequests) {
            crRequests.textContent = this.kpiData['cr-requests'].value;
        }
        if (crRequestsTrend) {
            crRequestsTrend.textContent = this.kpiData['cr-requests'].trend;
        }

        // Render mini charts for active KPIs
        this.renderKPIMiniCharts();
    },

    renderKPIMiniCharts() {
        // Render chart for Milestone Delays (A-03 Style)
        const milestoneCanvas = document.getElementById('chart-milestone-delays');
        if (milestoneCanvas && typeof Chart !== 'undefined') {
            const ctx = milestoneCanvas.getContext('2d');

            // Destroy existing chart if any
            if (milestoneCanvas._chart) {
                milestoneCanvas._chart.destroy();
            }

            milestoneCanvas._chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt'],
                    datasets: [{
                        label: 'Ist',
                        data: [2, 3, 3, 4, 5, 4, 5, 6, 5, 7],
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        borderWidth: 2
                    }, {
                        label: 'Vorwoche',
                        data: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5],
                        borderColor: '#94a3b8',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#94a3b8',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { display: false },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 },
                                maxRotation: 0
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 },
                                stepSize: 2
                            }
                        }
                    }
                }
            });
        }

        // Render chart for CR Requests (A-03 Style)
        const crCanvas = document.getElementById('chart-cr-requests');
        if (crCanvas && typeof Chart !== 'undefined') {
            const ctx = crCanvas.getContext('2d');

            // Destroy existing chart if any
            if (crCanvas._chart) {
                crCanvas._chart.destroy();
            }

            crCanvas._chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt'],
                    datasets: [{
                        label: 'Ist',
                        data: [5, 6, 8, 7, 9, 10, 8, 11, 10, 12],
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        borderWidth: 2
                    }, {
                        label: 'Vorwoche',
                        data: [4, 5, 6, 6, 7, 8, 7, 9, 9, 9],
                        borderColor: '#94a3b8',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: '#94a3b8',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { display: false },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 },
                                maxRotation: 0
                            }
                        },
                        y: {
                            display: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 },
                                stepSize: 3
                            }
                        }
                    }
                }
            });
        }

        // Helper function to render standard KPI charts
        const renderKPIChart = (canvasId, data, planData, isPercentage = false) => {
            const canvas = document.getElementById(canvasId);
            if (canvas && typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');
                if (canvas._chart) canvas._chart.destroy();

                canvas._chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan'],
                        datasets: [{
                            label: 'Ist',
                            data: data,
                            borderColor: '#3b82f6',
                            backgroundColor: 'transparent',
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: '#3b82f6',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            borderWidth: 2
                        }, {
                            label: 'Plan',
                            data: planData,
                            borderColor: '#94a3b8',
                            backgroundColor: 'transparent',
                            tension: 0.3,
                            pointRadius: 4,
                            pointBackgroundColor: '#94a3b8',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            borderWidth: 2,
                            borderDash: [5, 5]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: {
                                display: true,
                                grid: { display: false },
                                ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0 }
                            },
                            y: {
                                display: true,
                                grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                                ticks: {
                                    color: '#94a3b8',
                                    font: { size: 10 },
                                    callback: (value) => isPercentage ? value + '%' : value
                                }
                            }
                        }
                    }
                });
            }
        };

        // Render charts for new KPIs
        const kpis = this.kpiData;
        renderKPIChart('chart-budget-efficiency', kpis['budget-efficiency'].history, kpis['budget-efficiency'].historyPlan, true);
        renderKPIChart('chart-resource-utilization', kpis['resource-utilization'].history, kpis['resource-utilization'].historyPlan, true);
        renderKPIChart('chart-decision-backlog', kpis['decision-backlog'].history, kpis['decision-backlog'].historyPlan);
        renderKPIChart('chart-critical-path', kpis['critical-path'].history, kpis['critical-path'].historyPlan);
        renderKPIChart('chart-value-realization', kpis['value-realization'].history, kpis['value-realization'].historyPlan, true);
        renderKPIChart('chart-partner-nps', kpis['partner-nps'].history, kpis['partner-nps'].historyPlan);
        renderKPIChart('chart-adoption-rate', kpis['adoption-rate'].history, kpis['adoption-rate'].historyPlan, true);
        // Vertriebliche KPIs
        renderKPIChart('chart-vertraege-pro-kunde', kpis['vertraege-pro-kunde'].history, kpis['vertraege-pro-kunde'].historyPlan);
        renderKPIChart('chart-ape-pro-kunde', kpis['ape-pro-kunde'].history, kpis['ape-pro-kunde'].historyPlan);
    },

    filterKPIs() {
        // Re-render KPIs with filters applied
        // For now, just update the values (filters can be implemented later)
        this.updateKPIValues();
    },

    // Track current view mode for each KPI
    kpiViewModes: {
        userstories: 'timeline',
        tests: 'timeline',
        defects: 'timeline',
        ressourcen: 'timeline',
        budget: 'timeline'
    },

    // Track resource scope (gesamt/intern/extern) - default to intern to show warning
    resourceScope: 'intern',

    // Switch resource scope and re-render chart
    switchResourceScope(scope) {
        console.log(`Switching resource scope to: ${scope}`);
        this.resourceScope = scope;

        // Update toggle buttons
        const toggleContainer = document.getElementById('ressourcen-scope-toggle');
        if (toggleContainer) {
            toggleContainer.querySelectorAll('.pmo-scope-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.scope === scope);
            });
        }

        // Update description
        const descEl = document.getElementById('desc-ressourcen');
        if (descEl) {
            const descriptions = {
                gesamt: 'Personentage Ist vs. Angefragt pro Monat',
                intern: 'Interne Ressourcen: Ist vs. Angefragt',
                extern: 'Externe Ressourcen: Ist vs. Angefragt'
            };
            descEl.textContent = descriptions[scope];
        }

        // Update legend
        const legendEl = document.getElementById('legend-ressourcen');
        if (legendEl) {
            const labels = {
                gesamt: { ist: 'PT Ist', angef: 'PT Angefragt' },
                intern: { ist: 'Intern Ist', angef: 'Intern Angefr.' },
                extern: { ist: 'Extern Ist', angef: 'Extern Angefr.' }
            };
            legendEl.innerHTML = `
                <span class="pmo-kpi-legend-item"><span class="pmo-kpi-legend-dot ist"></span> ${labels[scope].ist}</span>
                <span class="pmo-kpi-legend-item"><span class="pmo-kpi-legend-dot prognose"></span> ${labels[scope].angef}</span>
            `;
        }

        // Re-render the current view
        const currentView = this.kpiViewModes.ressourcen;
        if (currentView === 'timeline') {
            this.renderTimelineChart('ressourcen');
        } else if (currentView === 'distribution') {
            this.renderDistributionChart('ressourcen');
        }
    },

    // Track User Stories mode (konzeption/umsetzung)
    userStoriesMode: 'konzeption',

    // Switch User Stories mode and re-render chart
    switchUserStoriesMode(mode) {
        console.log(`Switching User Stories mode to: ${mode}`);
        this.userStoriesMode = mode;

        // Update toggle buttons
        const toggleContainer = document.getElementById('userstories-mode-toggle');
        if (toggleContainer) {
            toggleContainer.querySelectorAll('.pmo-scope-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
        }

        // Get data for current mode
        const data = this.kpiData.userstories[mode];

        // Update description
        const descEl = document.getElementById('desc-userstories');
        if (descEl) {
            const descriptions = {
                konzeption: 'Konzeption: User Stories nach Status',
                umsetzung: 'Umsetzung: User Stories nach Status'
            };
            descEl.textContent = descriptions[mode];
        }

        // Update value
        const valueEl = document.getElementById('kpi-userstories');
        if (valueEl) {
            valueEl.textContent = data.total;
        }

        // Update badge
        const badgeEl = document.getElementById('badge-userstories');
        if (badgeEl) {
            badgeEl.textContent = `${data.total} gesamt`;
        }

        // Re-render the current view
        const currentView = this.kpiViewModes.userstories;
        if (currentView === 'timeline') {
            this.renderTimelineChart('userstories');
        } else if (currentView === 'distribution') {
            this.renderDistributionChart('userstories');
        }
    },

    // Toggle view dropdown
    toggleViewDropdown(kpiId) {
        const dropdown = document.querySelector(`.pmo-view-dropdown[data-kpi="${kpiId}"]`);
        if (!dropdown) return;

        // Close other dropdowns
        document.querySelectorAll('.pmo-view-dropdown.open').forEach(d => {
            if (d !== dropdown) d.classList.remove('open');
        });

        dropdown.classList.toggle('open');

        // Close on click outside
        if (dropdown.classList.contains('open')) {
            const closeHandler = (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                    document.removeEventListener('click', closeHandler);
                }
            };
            setTimeout(() => document.addEventListener('click', closeHandler), 0);
        }
    },

    // Select view from dropdown and update UI
    selectViewFromDropdown(kpiId, viewMode) {
        const dropdown = document.querySelector(`.pmo-view-dropdown[data-kpi="${kpiId}"]`);
        if (dropdown) {
            // Update trigger label and icon
            const trigger = dropdown.querySelector('.pmo-view-dropdown-trigger');
            const selectedItem = dropdown.querySelector(`.pmo-view-dropdown-item[data-view="${viewMode}"]`);

            if (trigger && selectedItem) {
                const label = trigger.querySelector('.pmo-view-dropdown-label');
                const icon = trigger.querySelector('.pmo-view-dropdown-icon');
                const itemIcon = selectedItem.querySelector('svg');
                const itemTitle = selectedItem.querySelector('.pmo-view-dropdown-item-title');

                if (label && itemTitle) label.textContent = itemTitle.textContent;
                if (icon && itemIcon) {
                    const newIcon = itemIcon.cloneNode(true);
                    newIcon.setAttribute('width', '16');
                    newIcon.setAttribute('height', '16');
                    newIcon.classList.add('pmo-view-dropdown-icon');
                    icon.replaceWith(newIcon);
                }
            }

            // Update active state in menu
            dropdown.querySelectorAll('.pmo-view-dropdown-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === viewMode);
            });

            // Close dropdown
            dropdown.classList.remove('open');
        }

        // Switch the chart view
        this.switchChartView(kpiId, viewMode);
    },

    // Switch between timeline and distribution view for a KPI
    switchChartView(kpiId, viewMode) {
        console.log(`Switching ${kpiId} to ${viewMode} view`);

        // Update stored view mode
        this.kpiViewModes[kpiId] = viewMode;

        // Update toggle buttons (for non-dropdown toggles)
        const toggleContainer = document.querySelector(`.pmo-chart-toggle[data-kpi="${kpiId}"]`);
        if (toggleContainer) {
            toggleContainer.querySelectorAll('.pmo-chart-toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === viewMode);
            });
        }

        // Update description text
        const descEl = document.getElementById(`desc-${kpiId}`);
        if (descEl) {
            const descriptions = {
                userstories: { timeline: 'User Stories nach Status im Zeitverlauf', distribution: 'User Stories nach aktuellem Status' },
                tests: { timeline: 'Testreihen: Gesamt, Gestartet, Abgeschlossen', distribution: 'Testreihen nach aktuellem Status' },
                defects: { timeline: 'Defects nach Severity im Zeitverlauf', distribution: 'Defects nach aktueller Severity' },
                ressourcen: { timeline: 'Personentage Ist vs. Angefragt pro Monat', distribution: 'Ressourcen Ist vs. Angefragt aktuell', breakdown: 'Interne vs. Externe Ressourcen im Vergleich' },
                budget: { timeline: 'Budget: Plan, Verbrauch, Forecast', distribution: 'Budget Verteilung aktuell' }
            };
            descEl.textContent = descriptions[kpiId]?.[viewMode] || descEl.textContent;
        }

        // Render the appropriate chart
        if (viewMode === 'timeline') {
            this.renderTimelineChart(kpiId);
        } else if (viewMode === 'breakdown') {
            this.renderBreakdownChart(kpiId);
        } else {
            this.renderDistributionChart(kpiId);
        }
    },

    // Render timeline chart (the default view)
    renderTimelineChart(kpiId) {
        const labels = ['Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan'];
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: true, grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 0 } },
                y: { display: true, grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
            }
        };

        const canvasId = `chart-${kpiId}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();

        const ctx = canvas.getContext('2d');

        switch (kpiId) {
            case 'userstories':
                const usMode = this.userStoriesMode || 'konzeption';
                const usData = this.kpiData.userstories[usMode];
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Backlog', data: usData.monthly.map(m => m.backlog), backgroundColor: '#cbd5e1', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                            { label: 'In Progress', data: usData.monthly.map(m => m.inprogress), backgroundColor: '#3b82f6', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                            { label: 'Review', data: usData.monthly.map(m => m.review), backgroundColor: '#f59e0b', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                            { label: 'Done', data: usData.monthly.map(m => m.done), backgroundColor: '#86BC25', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 }
                        ]
                    },
                    options: { ...chartOptions, scales: { x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true, max: 200 } } }
                });
                break;

            case 'tests':
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Gesamt', data: this.kpiData.tests.history.total, borderColor: '#64748b', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                            { label: 'Gestartet', data: this.kpiData.tests.history.started, borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                            { label: 'Fertig', data: this.kpiData.tests.history.completed, borderColor: '#86BC25', tension: 0.3, pointRadius: 3, borderWidth: 2 }
                        ]
                    },
                    options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 20, max: 55 } } }
                });
                break;

            case 'defects':
                const defectsWarningPlugin = {
                    id: 'defectsWarningIcon',
                    afterDatasetsDraw: (chart) => {
                        if (this.kpiData.defects.critical <= 0) return;
                        const ctx = chart.ctx;
                        const lastIndex = chart.data.labels.length - 1;
                        let topY = chart.chartArea.bottom;
                        for (let i = 0; i < chart.data.datasets.length; i++) {
                            const bar = chart.getDatasetMeta(i).data[lastIndex];
                            if (bar && bar.y < topY) topY = bar.y;
                        }
                        const x = chart.getDatasetMeta(0).data[lastIndex].x;
                        const y = topY - 20;
                        ctx.save();
                        ctx.fillStyle = '#dc2626';
                        ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(x, y, 12, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('!', x, y);
                        ctx.restore();
                    }
                };
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Kritisch', data: this.kpiData.defects.monthly.map(m => m.critical), backgroundColor: '#dc2626', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                            { label: 'Major', data: this.kpiData.defects.monthly.map(m => m.major), backgroundColor: '#f59e0b', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 },
                            { label: 'Minor', data: this.kpiData.defects.monthly.map(m => m.minor), backgroundColor: '#86BC25', stack: 's1', barPercentage: 0.5, categoryPercentage: 0.6 }
                        ]
                    },
                    options: { ...chartOptions, scales: { x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true, max: 100 } } },
                    plugins: [defectsWarningPlugin]
                });
                break;

            case 'ressourcen':
                const scope = this.resourceScope || 'gesamt';
                const rData = this.kpiData.ressourcen;
                let istData, angefragtData, yMin, yMax;

                console.log('Rendering ressourcen chart with scope:', scope);

                if (scope === 'intern') {
                    istData = rData.intern.history.ist;
                    angefragtData = rData.intern.history.angefragt;
                    yMin = 120; yMax = 180;
                    console.log('Using intern data:', istData, angefragtData);
                } else if (scope === 'extern') {
                    istData = rData.extern.history.ist;
                    angefragtData = rData.extern.history.angefragt;
                    yMin = 60; yMax = 140;
                    console.log('Using extern data:', istData, angefragtData);
                } else {
                    istData = rData.history.ist;
                    angefragtData = rData.history.angefragt;
                    yMin = 200; yMax = 300;
                    console.log('Using gesamt data:', istData, angefragtData);
                }

                // Check if intern and overloaded - show warning icon
                const showInternWarning = scope === 'intern' && rData.intern.auslastung > 100;

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Ist', data: istData, borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                            { label: 'Angefragt', data: angefragtData, borderColor: showInternWarning ? '#f59e0b' : '#94a3b8', borderDash: [5, 5], tension: 0.3, pointRadius: 3, borderWidth: 2 }
                        ]
                    },
                    options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: yMin, max: yMax } } },
                    plugins: showInternWarning ? [{
                        id: 'ressourcenWarningIcon',
                        afterDatasetsDraw: (chart) => {
                            const ctx = chart.ctx;
                            const meta = chart.getDatasetMeta(1); // Angefragt line
                            const lastPoint = meta.data[meta.data.length - 1];
                            if (lastPoint) {
                                const x = lastPoint.x;
                                const y = lastPoint.y - 18; // Über dem Punkt
                                // Draw warning circle
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(x, y, 10, 0, Math.PI * 2);
                                ctx.fillStyle = '#f59e0b';
                                ctx.fill();
                                // Draw exclamation mark
                                ctx.fillStyle = 'white';
                                ctx.font = 'bold 14px system-ui';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText('!', x, y);
                                ctx.restore();
                            }
                        }
                    }] : []
                });
                break;

            case 'budget':
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Plan', data: this.kpiData.budget.history.plan.map(v => v/1000), borderColor: '#86BC25', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                            { label: 'Verbrauch', data: this.kpiData.budget.history.verbrauch.map(v => v/1000), borderColor: '#3b82f6', tension: 0.3, pointRadius: 3, borderWidth: 2 },
                            { label: 'Forecast', data: this.kpiData.budget.history.forecast.map(v => v/1000), borderColor: '#8b5cf6', borderDash: [5, 5], tension: 0.3, pointRadius: 3, borderWidth: 2 }
                        ]
                    },
                    options: { ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, min: 0, max: 3.5, ticks: { ...chartOptions.scales.y.ticks, callback: v => '€' + v.toFixed(1) + 'M' } } } }
                });
                break;
        }
    },

    // Render distribution chart (pie/doughnut or horizontal bar)
    renderDistributionChart(kpiId) {
        const canvasId = `chart-${kpiId}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();

        const ctx = canvas.getContext('2d');

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } }
            },
            cutout: '55%'
        };

        const barOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { display: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                y: { display: true, grid: { display: false }, ticks: { color: '#1e293b', font: { size: 11 } } }
            }
        };

        switch (kpiId) {
            case 'userstories':
                const usDistMode = this.userStoriesMode || 'konzeption';
                const us = this.kpiData.userstories[usDistMode].byStatus;
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Backlog', 'In Progress', 'Review', 'Done'],
                        datasets: [{
                            data: [us.backlog, us.inprogress, us.review, us.done],
                            backgroundColor: ['#cbd5e1', '#3b82f6', '#f59e0b', '#86BC25'],
                            borderWidth: 0
                        }]
                    },
                    options: doughnutOptions
                });
                break;

            case 'tests':
                const t = this.kpiData.tests;
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Abgeschlossen', 'Gestartet', 'Ausstehend'],
                        datasets: [{
                            data: [t.completed, t.started - t.completed, t.total - t.started],
                            backgroundColor: ['#86BC25', '#3b82f6', '#cbd5e1'],
                            borderWidth: 0
                        }]
                    },
                    options: doughnutOptions
                });
                break;

            case 'defects':
                const d = this.kpiData.defects;
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Kritisch', 'Major', 'Minor'],
                        datasets: [{
                            data: [d.critical, d.major, d.minor],
                            backgroundColor: ['#dc2626', '#f59e0b', '#86BC25'],
                            borderWidth: 0
                        }]
                    },
                    options: doughnutOptions
                });
                break;

            case 'ressourcen':
                const rScope = this.resourceScope || 'gesamt';
                const rr = this.kpiData.ressourcen;
                let rIst, rAngef, rMax;

                if (rScope === 'intern') {
                    rIst = rr.intern.ist;
                    rAngef = rr.intern.angefragt;
                    rMax = 200;
                } else if (rScope === 'extern') {
                    rIst = rr.extern.ist;
                    rAngef = rr.extern.angefragt;
                    rMax = 150;
                } else {
                    rIst = rr.ptIst;
                    rAngef = rr.ptAngefragt;
                    rMax = 300;
                }

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['PT Ist', 'PT Angefragt'],
                        datasets: [{
                            data: [rIst, rAngef],
                            backgroundColor: ['#3b82f6', '#94a3b8'],
                            borderRadius: 4
                        }]
                    },
                    options: { ...barOptions, scales: { ...barOptions.scales, x: { ...barOptions.scales.x, max: rMax } } }
                });
                break;

            case 'budget':
                const b = this.kpiData.budget;
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Plan', 'Verbrauch', 'Forecast'],
                        datasets: [{
                            data: [b.plan / 1000000, b.verbrauch / 1000000, b.forecast / 1000000],
                            backgroundColor: ['#86BC25', '#3b82f6', '#8b5cf6'],
                            borderRadius: 4
                        }]
                    },
                    options: {
                        ...barOptions,
                        scales: {
                            ...barOptions.scales,
                            x: { ...barOptions.scales.x, max: 4, ticks: { ...barOptions.scales.x.ticks, callback: v => '€' + v + 'M' } }
                        }
                    }
                });
                break;
        }
    },

    // Render breakdown chart (intern/extern for Ressourcen)
    renderBreakdownChart(kpiId) {
        const canvasId = `chart-${kpiId}`;
        const canvas = document.getElementById(canvasId);
        if (!canvas || typeof Chart === 'undefined') return;

        const existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();

        const ctx = canvas.getContext('2d');

        if (kpiId === 'ressourcen') {
            const r = this.kpiData.ressourcen;
            const internOverload = r.intern.auslastung > 100;

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Intern', 'Extern'],
                    datasets: [
                        {
                            label: 'Verfügbar (Ist)',
                            data: [r.intern.ist, r.extern.ist],
                            backgroundColor: ['#3b82f6', '#3b82f6'],
                            borderRadius: 4
                        },
                        {
                            label: 'Angefragt',
                            data: [r.intern.angefragt, r.extern.angefragt],
                            backgroundColor: [internOverload ? '#f59e0b' : '#86BC25', '#86BC25'],
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: { boxWidth: 12, padding: 8, font: { size: 10 } }
                        },
                        tooltip: {
                            callbacks: {
                                afterLabel: (context) => {
                                    if (context.datasetIndex === 1 && context.dataIndex === 0 && internOverload) {
                                        return '⚠️ Überlastung: ' + r.intern.auslastung + '%';
                                    }
                                    return '';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            grid: { display: false },
                            ticks: { color: '#94a3b8', font: { size: 10 } },
                            max: 200
                        },
                        y: {
                            display: true,
                            grid: { display: false },
                            ticks: { color: '#64748b', font: { size: 11, weight: 500 } }
                        }
                    }
                },
                plugins: internOverload ? [{
                    id: 'internWarningLabel',
                    afterDraw: (chart) => {
                        const ctx = chart.ctx;
                        const meta = chart.getDatasetMeta(1);
                        const bar = meta.data[0];
                        if (bar) {
                            ctx.save();
                            ctx.fillStyle = '#f59e0b';
                            ctx.font = 'bold 10px system-ui';
                            ctx.textAlign = 'left';
                            ctx.fillText('⚠️ ' + r.intern.auslastung + '%', bar.x + 5, bar.y + 4);
                            ctx.restore();
                        }
                    }
                }] : []
            });

            // Update the legend to show intern/extern info
            const legendEl = document.getElementById('legend-ressourcen');
            if (legendEl) {
                legendEl.innerHTML = `
                    <span class="pmo-kpi-legend-item"><span class="pmo-kpi-legend-dot ist"></span> Intern: ${r.intern.ist} / ${r.intern.angefragt} PT</span>
                    <span class="pmo-kpi-legend-item"><span class="pmo-kpi-legend-dot" style="background: #86BC25"></span> Extern: ${r.extern.ist} / ${r.extern.angefragt} PT</span>
                `;
            }
        }
    },

    // Scroll to early warning indicator in sidebar
    scrollToEarlyWarning(warningId) {
        const warningsContainer = document.getElementById('pmo-early-warnings');
        if (warningsContainer) {
            // Find the warning card
            const warningCards = warningsContainer.querySelectorAll('.pmo-warning-card');
            warningCards.forEach(card => {
                // Flash highlight effect
                card.style.transition = 'transform 0.3s, box-shadow 0.3s';
            });

            // Scroll to the warnings section
            warningsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight the relevant warning briefly
            setTimeout(() => {
                const targetCard = warningsContainer.querySelector(`.pmo-warning-card:has([onclick*="${warningId}"])`) ||
                                   Array.from(warningCards).find(c => c.textContent.includes(warningId === 'defect_critical' ? 'Defects' : warningId === 'nps_warning' ? 'NPS' : 'Meilenstein'));
                if (targetCard) {
                    targetCard.classList.add('highlight-flash');
                    setTimeout(() => targetCard.classList.remove('highlight-flash'), 2000);
                }
            }, 500);
        }
    },

    // Navigate from early warning card to related view
    navigateFromWarning(warningId, viewId, filterTo) {
        console.log(`Navigating from warning ${warningId} to ${viewId} with filter ${filterTo}`);

        // Navigate to the view
        this.showView(viewId);

        // Apply filter if specified
        setTimeout(() => {
            if (viewId === 'meilensteine' && filterTo) {
                // Set the milestone status filter
                const statusFilter = document.getElementById('milestones-status-filter');
                if (statusFilter) {
                    statusFilter.value = filterTo;
                    this.filterMilestones();
                }
                // Highlight delayed milestones
                setTimeout(() => {
                    const delayedRows = document.querySelectorAll('#pmo-milestones-tbody tr');
                    delayedRows.forEach(row => {
                        if (row.textContent.includes('Verzögert')) {
                            row.classList.add('highlight-flash');
                            setTimeout(() => row.classList.remove('highlight-flash'), 2000);
                        }
                    });
                }, 300);
            } else if (viewId === 'kpis' && filterTo) {
                // Scroll to and highlight the KPI card
                const kpiCard = document.querySelector(`.pmo-kpi-card[data-kpi="${filterTo}"]`);
                if (kpiCard) {
                    kpiCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    kpiCard.classList.add('highlight-flash');
                    setTimeout(() => kpiCard.classList.remove('highlight-flash'), 2000);
                }
            }
        }, 100);
    },

    switchKPILevel(level) {
        // Toggle between Programm and Projekt level
        const buttons = document.querySelectorAll('.pmo-kpis-toggle .pmo-toggle-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });

        // Show/hide sections based on level
        // Linie-level (only show on Programm)
        const strategischCards = document.querySelectorAll('.pmo-kpi-card[data-category="strategisch"]');
        const vertrieblichCards = document.querySelectorAll('.pmo-kpi-card[data-category="vertrieblich"]');
        const valuemapCards = document.querySelectorAll('.pmo-kpi-card[data-category="valuemap"]');
        const strategischDivider = document.querySelector('.pmo-kpi-section-divider[data-category="strategisch"]');
        const vertrieblichDivider = document.querySelector('.pmo-kpi-section-divider[data-category="vertrieblich"]');
        const valuemapContainer = document.getElementById('valuemap-container');
        const valuemapClusterBox = document.querySelector('.pmo-valuemap-cluster-overview');

        // Programm-level (only show on Programm)
        const zufriedenheitCards = document.querySelectorAll('.pmo-kpi-card[data-category="zufriedenheit"]');
        const zufriedenheitDivider = document.querySelector('.pmo-kpi-section-divider[data-category="zufriedenheit"]');

        // Show/hide project dropdown
        const projectDropdown = document.getElementById('kpis-project-dropdown');

        if (level === 'projekt') {
            // Hide Linie-level: Strategisch, Vertrieblich, Value Map
            if (strategischDivider) strategischDivider.style.display = 'none';
            if (vertrieblichDivider) vertrieblichDivider.style.display = 'none';
            strategischCards.forEach(card => card.style.display = 'none');
            vertrieblichCards.forEach(card => card.style.display = 'none');
            valuemapCards.forEach(card => card.style.display = 'none');
            if (valuemapContainer) valuemapContainer.style.display = 'none';
            if (valuemapClusterBox) valuemapClusterBox.style.display = 'none';

            // Hide Programm-level: Zufriedenheit und Nutzung
            if (zufriedenheitDivider) zufriedenheitDivider.style.display = 'none';
            zufriedenheitCards.forEach(card => card.style.display = 'none');

            // Show project dropdown
            if (projectDropdown) projectDropdown.style.display = 'flex';
        } else {
            // Show all sections
            if (strategischDivider) strategischDivider.style.display = '';
            if (vertrieblichDivider) vertrieblichDivider.style.display = '';
            strategischCards.forEach(card => card.style.display = '');
            vertrieblichCards.forEach(card => card.style.display = '');
            valuemapCards.forEach(card => card.style.display = '');
            if (valuemapContainer) valuemapContainer.style.display = '';
            if (valuemapClusterBox) valuemapClusterBox.style.display = '';

            // Show Programm-level
            if (zufriedenheitDivider) zufriedenheitDivider.style.display = '';
            zufriedenheitCards.forEach(card => card.style.display = '');

            // Hide project dropdown
            if (projectDropdown) projectDropdown.style.display = 'none';
        }

        this.currentKPILevel = level;
        // Re-render charts (in future: with project-specific data)
        this.renderP10Charts();
    },

    selectProject(projectId) {
        this.currentSelectedProject = projectId;
        const project = this.PROGRAM_STRUCTURE.projects.find(p => p.id === projectId);

        if (project) {
            // Update title to show selected project
            const title = document.querySelector('.pmo-section-title');
            if (title) {
                title.textContent = `Projekt ${projectId}: ${project.name}`;
            }
            console.log('Projekt ausgewaehlt:', projectId, project.name);
        } else {
            const title = document.querySelector('.pmo-section-title');
            if (title) {
                title.textContent = 'Projekt-KPIs';
            }
        }

        // Re-render charts with project-specific data (mock for now)
        this.renderP10Charts();
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
            const { content, isHTML } = this.generateAIResponse(message);
            this.addAIMessage('assistant', content, isHTML);
        }, 500);
    },

    addAIMessage(role, content, isHTML = false) {
        const container = document.getElementById('pmo-ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-${role}`;

        if (isHTML) {
            messageDiv.innerHTML = `<div class="ai-message-content">${content}</div>`;
        } else {
            messageDiv.innerHTML = `<div class="ai-message-content"><p>${content}</p></div>`;
        }

        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    },

    generateAIResponse(question) {
        const q = question.toLowerCase();

        // Governance Dokumentation
        if (q.includes('governance')) {
            const htmlContent = `
                <p><strong>Relevante Governance-Dokumente gefunden:</strong></p>
                <div class="ai-document-list">
                    <div class="ai-document-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div class="ai-document-info">
                            <div class="ai-document-title">Programm-Governance-Handbuch_v2.4.pdf</div>
                            <div class="ai-document-meta">Sales Excellence • Aktualisiert: 15.12.2024 • 2,3 MB</div>
                        </div>
                    </div>
                    <div class="ai-document-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div class="ai-document-info">
                            <div class="ai-document-title">Steering-Committee-Satzung_2024.pdf</div>
                            <div class="ai-document-meta">Governance • Aktualisiert: 08.01.2025 • 856 KB</div>
                        </div>
                    </div>
                    <div class="ai-document-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div class="ai-document-info">
                            <div class="ai-document-title">Entscheidungsprozesse_und_Eskalation.pdf</div>
                            <div class="ai-document-meta">Prozesse • Aktualisiert: 03.12.2024 • 1,1 MB</div>
                        </div>
                    </div>
                    <div class="ai-document-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div class="ai-document-info">
                            <div class="ai-document-title">RACI-Matrix_Programmorganisation.pdf</div>
                            <div class="ai-document-meta">Organisation • Aktualisiert: 20.11.2024 • 645 KB</div>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 12px; font-size: 12px; color: #64748b;">Die Governance-Struktur umfasst Steering Committee (monatlich), PMO Reviews (wöchentlich) und Workstream-Leads (daily standups).</p>
            `;
            return { content: htmlContent, isHTML: true };
        }

        if (q.includes('risiko') || q.includes('risiken')) {
            const allRisks = [];
            this.statusData.forEach(s => {
                s.risksAndIssues.forEach(r => {
                    if (r.status !== 'Geschlossen') {
                        allRisks.push(`• ${s.projectId}/${s.workstreamId}: ${r.description}`);
                    }
                });
            });
            return {
                content: `Ich habe ${allRisks.length} offene Risiken gefunden:\n\n${allRisks.slice(0, 5).join('\n')}\n\n${allRisks.length > 5 ? `... und ${allRisks.length - 5} weitere.` : ''}`,
                isHTML: false
            };
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
            return {
                content: `Kommende Meilensteine:\n\n${upcoming.slice(0, 5).join('\n') || 'Keine anstehenden Meilensteine gefunden.'}`,
                isHTML: false
            };
        }

        if (q.includes('entscheidung') || q.includes('decision')) {
            const pending = this.decisions.filter(d => d.status === 'pending' || d.status === 'escalated');
            return {
                content: `${pending.length} Entscheidungen sind ausstehend:\n\n${pending.slice(0, 5).map(d => `• ${d.title} (${d.projectId}, fällig: ${this.formatDate(d.dueDate)})`).join('\n')}`,
                isHTML: false
            };
        }

        if (q.includes('zusammenfassung') || q.includes('status') || q.includes('summary')) {
            const latest = this.getLatestStatuses();
            const green = latest.filter(s => s.status.overall === 'green').length;
            const yellow = latest.filter(s => s.status.overall === 'yellow').length;
            const red = latest.filter(s => s.status.overall === 'red').length;

            return {
                content: `📊 Programmstatus Sales Excellence:\n\n` +
                    `• 🟢 ${green} Workstreams im Plan\n` +
                    `• 🟡 ${yellow} Workstreams mit Einschränkungen\n` +
                    `• 🔴 ${red} Workstreams kritisch\n\n` +
                    `Gesamt: ${latest.length} aktive Workstreams über 8 Projekte.`,
                isHTML: false
            };
        }

        return {
            content: 'Ich kann dir bei Fragen zu Risiken, Meilensteinen, Entscheidungen, Governance oder dem Gesamtstatus helfen. Versuche es mit einer spezifischeren Frage.',
            isHTML: false
        };
    }
};

// ============================================
// BRIDGE: Set global variable for backward compatibility
// ============================================
if (typeof window !== 'undefined') {
    window.PMO = PMO;
    // Explicitly expose new functions
    window.PMO.switchResourceScope = PMO.switchResourceScope.bind(PMO);
    window.PMO.switchUserStoriesMode = PMO.switchUserStoriesMode.bind(PMO);
    window.PMO.toggleViewDropdown = PMO.toggleViewDropdown.bind(PMO);
    window.PMO.selectViewFromDropdown = PMO.selectViewFromDropdown.bind(PMO);

    // Toggle Value Map section collapse
    window.PMO.toggleValueMapSection = function() {
        const container = document.getElementById('valuemap-container');
        const clusterBox = document.querySelector('.pmo-valuemap-cluster-overview');
        const hint = document.getElementById('valuemap-expand-hint');

        if (container) {
            const isCollapsed = container.classList.contains('collapsed');
            container.classList.toggle('collapsed');

            // Update cluster box state
            if (clusterBox) {
                clusterBox.classList.toggle('expanded', isCollapsed);
            }

            // Update hint text
            if (hint) {
                const hintText = hint.querySelector('span');
                const hintIcon = hint.querySelector('svg');
                if (hintText) {
                    hintText.textContent = isCollapsed ? 'Klicken zum Einklappen' : 'Klicken zum Aufklappen';
                }
                if (hintIcon) {
                    hintIcon.style.transform = isCollapsed ? 'rotate(180deg)' : '';
                }
            }
        }
    };

    console.log('[ESM] pmo-toolbox.esm.js loaded');
}

// ============================================
// VALUE MAP OVERLAY FUNCTIONS (must be before init)
// ============================================

// Ensure window.PMO exists for onclick handlers
window.PMO = window.PMO || PMO;

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
                <span class="pmo-overlay-northstar-title">APE-Produktivität je VP</span>
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PMO.init());
} else {
    PMO.init();
}

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

