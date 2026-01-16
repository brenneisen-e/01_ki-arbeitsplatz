/**
 * Speaker Notes Teleprompter
 * Opens speaker notes in a separate window that follows mouse cursor
 */

const SpeakerNotes = {
    notesWindow: null,
    isFollowing: false,
    scrollSpeed: 30, // pixels per second
    mouseOffset: 50, // pixels left from cursor
    keepOnTopInterval: null, // Interval to keep window on top

    // Speaker notes content for PMO Toolbox presentation
    notes: [
        {
            section: "EINLEITUNG",
            content: `Ich bin Eike Brenneisen, ich bin seit 4 Jahren für Deloitte im Bereich Financial Services unterwegs und schwerpunktmäßig begleite ich Transformationsprogrammen bei Versicherungen. Beispielsweise das ERGO ZAV-Programm kenne ich sehr gut aus der Vergangenheit – dort war ich unter anderem für die gesamte Gremienbegleitung verantwortlich.

Was mich besonders antreibt: Ich mag keine Ineffizienzen. Deswegen baue ich gerne selbst Tools und Lösungen, die das Programmleben einfacher machen – sei es ein Dashboard, eine Automatisierung oder gar eben eine ganze PMO-Plattform - darauf kommen wir später nochmal zurück.`
        },
        {
            section: "PROBLEMSTELLUNG & LÖSUNG",
            content: `Bei einem Programm dieser Größenordnung – mit so vielen Workstreams, Beteiligten und Abhängigkeiten – ist eine saubere, durchstrukturierte Termin- und Prozesssteuerung absolut erfolgskritisch. Gleichzeitig brauchen alle Stakeholder auf ihren jeweiligen Ebenen regelmäßig Transparenz: Wo stehen wir bei Time, Scope und Budget?

Jetzt ist es so: Typischerweise werden solche Programme – und das war auch bei ERGO ZAV in der Vergangenheit nicht anders – im Wesentlichen über PowerPoint und Excel koordiniert. Und das wird auch erstmal so bleiben, das ist auch völlig in Ordnung.

Aber es gibt einen großen Nachteil: Die schiere Datenmenge. Die Anzahl an Dateien. Selbst auf einem gut strukturierten SharePoint verliert man irgendwann den Überblick. Wie war nochmal die Entscheidung zu Thema XY vor einem Monat? Wo finde ich den aktuellen Status zu Workstream Z? Das kostet Zeit und Nerven.

Genau hier wollen wir Abhilfe schaffen. Wir ergänzen die bestehenden Microsoft-Strukturen durch eine PMO-Toolbox, die wir individuell auf ERGO anpassen. Diese läuft als Frontend direkt auf dem SharePoint und dient als zentrale Startplattform für alle Projekterfordernisse: Status abgeben, Status einsehen, Meilensteine bestätigen, Entscheidungen nachvollziehen – alles an einem Ort.

Das Gute dabei: Wir bauen das ohne zusätzliches Hosting als eigenständiges Tool auf. Es greift einfach auf den bestehenden SharePoint zu und zeigt alle relevanten Informationen gebündelt an einer Stelle an.

Wie das konkret aussieht, zeige ich Ihnen jetzt direkt im System.`
        },
        {
            section: "LANDING PAGE / DASHBOARD",
            content: `So, schauen wir uns das mal direkt an. Das hier ist die PMO Toolbox Landing Page – sozusagen die zentrale Einstiegsseite für alle Projektbeteiligten.

Ich sehe hier auf einen Blick die aktuelle Lage: 8 aktive Projekte im Sales Excellence Programm. Von diesen 8 Projekten sind aktuell 3 im Plan – grün. 4 laufen mit kleineren Einschränkungen – gelb. Und 1 Projekt ist kritisch – rot.

Rechts sehe ich den Gremienkalender und die kommenden Meilensteine über alle Projekte hinweg. Das gibt mir sofort Transparenz: Wo brennt es? Welche Termine stehen an?`
        },
        {
            section: "PROJEKTANSICHT",
            content: `Wenn ich jetzt zum Beispiel ins Projekt "Hybrider Kunde" reinschaue, sehe ich hier alle zugehörigen Workstreams mit ihrem jeweiligen Status – Budget, Scope, Zeit, Ressourcen. Auf einen Blick erkennbar: Wo stehen wir?`
        },
        {
            section: "WORKSTREAM MIT WOCHENWECHSEL & PPT",
            content: `Gehen wir mal tiefer rein – ich klicke auf Workstream A1.

Hier sehe ich den aktuellen Wochenstatus mit Ampeln. Das Praktische: Ich kann hier zwischen den Wochen hin- und herwechseln. Ich kann zurückblättern und sehen, wie sich der Status entwickelt hat. War das schon länger gelb? Oder ist das neu?

Und jetzt das Feature für Workstream-Leads: PPT-Export. Ein Klick – und ich bekomme eine fertige PowerPoint-Folie mit meinem Wochenstatus, bereits formatiert im Corporate Design. Direkt nutzbar fürs Reporting.`
        },
        {
            section: "GANTT-CHART",
            content: `Wenn ich auf 'Gesamtplanung' wechsle, sehe ich den aktuellen Projektplan als Gantt-Chart. Alle Workstreams, alle Meilensteine, zeitlich aufgereiht. Und hier sehe ich auch immer den aktuellen Stand – was ist überfällig, was läuft noch im Plan.`
        },
        {
            section: "SUCHE",
            content: `Wir haben anfangs über die Herausforderung gesprochen: Wie finde ich die richtige Information?

Hier gibt es eine zentrale Suche. Ich suche nach einem Stichwort – und das System zeigt mir alle relevanten Einträge: Status, Entscheidungen, Dokumente. Sofort sichtbar: In welchem Workstream? Aus welcher Woche?`
        },
        {
            section: "KI-DOKUMENTENASSISTENT",
            content: `Und noch ein Ausblick – das ist optional: Ein KI-Dokumentenassistent. Ich stelle eine Frage wie 'Was ist die aktuelle Governance?' – und das System durchsucht automatisch alle Dokumente und zeigt mir die relevanten PDFs.`
        },
        {
            section: "WEITERE FUNKTIONEN",
            content: `Darüber hinaus gibt es noch: Entscheidungsboard als Kanban, Gremienkalender mit Terminen, Meilenstein-Management. Das schauen wir uns bei Bedarf gerne im Detail an.`
        },
        {
            section: "ABSCHLUSS",
            content: `Zusammengefasst:

Die PMO Toolbox ist eine Frontend-Plattform, die auf Ihrem bestehenden SharePoint aufsetzt. Kein zusätzliches Hosting, keine separate Datenhaltung. Wir greifen einfach auf die Daten zu, die Sie ohnehin pflegen, und bereiten sie übersichtlich auf.

Das Ergebnis: Schnellere Entscheidungen. Weniger Suchaufwand. Mehr Transparenz für alle Stakeholder.

Und das Beste: Es ist individuell anpassbar. Wir können das exakt auf Ihre Programm-Governance, Ihre Gremien, Ihre Prozesse zuschneiden.

Haben Sie dazu Fragen? Oder soll ich nochmal auf einen bestimmten Bereich tiefer eingehen?`
        }
    ],

    openNotesWindow() {
        // Open new window for speaker notes
        const width = 400;
        const height = 600;
        const left = 100;
        const top = 100;

        this.notesWindow = window.open(
            '',
            'SpeakerNotes',
            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
        );

        if (!this.notesWindow) {
            alert('Popup wurde blockiert! Bitte erlauben Sie Popups für diese Seite.');
            return;
        }

        // Build HTML content for notes window
        const html = this.buildNotesHTML();
        this.notesWindow.document.write(html);
        this.notesWindow.document.close();

        // Start mouse tracking
        this.startMouseTracking();

        // Start auto-scroll
        this.startAutoScroll();

        // Keep window on top
        this.startKeepOnTop();
    },

    buildNotesHTML() {
        const sectionsHTML = this.notes.map((note, index) => `
            <div class="note-section" data-index="${index}">
                <h3>${note.section}</h3>
                <p>${note.content.replace(/\n/g, '<br>')}</p>
            </div>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Speaker Notes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: rgba(30, 30, 30, 0.95);
            color: #ffffff;
            padding: 20px;
            line-height: 1.6;
            overflow-y: auto;
            height: 100vh;
        }

        .note-section {
            margin-bottom: 40px;
            padding: 20px;
            background: rgba(50, 50, 50, 0.8);
            border-radius: 12px;
            border-left: 4px solid #E30613;
        }

        .note-section h3 {
            color: #E30613;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }

        .note-section p {
            font-size: 24px;
            line-height: 1.8;
            color: #e0e0e0;
        }

        .controls {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(227, 6, 19, 0.9);
            padding: 12px;
            border-radius: 8px;
            display: flex;
            gap: 12px;
            align-items: center;
            backdrop-filter: blur(10px);
        }

        .controls button {
            background: white;
            color: #E30613;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .controls button:hover {
            background: #f0f0f0;
            transform: scale(1.05);
        }

        .controls .speed-label {
            color: white;
            font-size: 14px;
            margin-left: auto;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
            background: #E30613;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #b8000f;
        }
    </style>
</head>
<body>
    <div id="notes-content">
        ${sectionsHTML}
    </div>

    <div class="controls">
        <button onclick="changeSpeed(-10)">Langsamer</button>
        <button onclick="changeSpeed(10)">Schneller</button>
        <button onclick="toggleScroll()">Pause/Play</button>
        <button onclick="resetScroll()">Zurücksetzen</button>
        <span class="speed-label" id="speed-label">Speed: 30 px/s</span>
    </div>

    <script>
        let scrollSpeed = 30;
        let isScrolling = true;
        let scrollInterval = null;

        function startScrolling() {
            console.log('Starting auto-scroll at', scrollSpeed, 'px/s');
            stopScrolling();
            scrollInterval = setInterval(() => {
                if (isScrolling) {
                    const scrollAmount = scrollSpeed / 60;
                    window.scrollBy({
                        top: scrollAmount,
                        behavior: 'auto'
                    });
                }
            }, 1000 / 60); // 60 FPS
        }

        function stopScrolling() {
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
        }

        function changeSpeed(delta) {
            scrollSpeed = Math.max(0, Math.min(100, scrollSpeed + delta));
            document.getElementById('speed-label').textContent = 'Speed: ' + scrollSpeed + ' px/s';
            console.log('Speed changed to:', scrollSpeed);
        }

        function toggleScroll() {
            isScrolling = !isScrolling;
            console.log('Scrolling', isScrolling ? 'resumed' : 'paused');
        }

        function resetScroll() {
            window.scrollTo(0, 0);
            console.log('Scroll reset to top');
        }

        // Start auto-scroll when page loads
        window.addEventListener('load', function() {
            console.log('Page loaded, starting auto-scroll');
            startScrolling();
        });

        // Fallback: start immediately
        startScrolling();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                toggleScroll();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                changeSpeed(5);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                changeSpeed(-5);
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                resetScroll();
            }
        });
    </script>
</body>
</html>
        `;
    },

    startMouseTracking() {
        // Track mouse in main window and move notes window accordingly
        document.addEventListener('mousemove', (e) => {
            if (this.notesWindow && !this.notesWindow.closed) {
                const newLeft = e.screenX - this.notesWindow.outerWidth - this.mouseOffset;
                const newTop = e.screenY - 100; // Slight offset from cursor

                // Keep window on screen
                const finalLeft = Math.max(0, newLeft);
                const finalTop = Math.max(0, Math.min(screen.height - this.notesWindow.outerHeight, newTop));

                this.notesWindow.moveTo(finalLeft, finalTop);
            }
        });

        // Track mouse wheel in main window and scroll notes window
        document.addEventListener('wheel', (e) => {
            if (this.notesWindow && !this.notesWindow.closed) {
                // Scroll the teleprompter window
                const scrollAmount = e.deltaY;
                this.notesWindow.scrollBy({
                    top: scrollAmount,
                    behavior: 'auto'
                });
            }
        });
    },

    startAutoScroll() {
        // Auto-scroll is handled in the notes window itself
    },

    startKeepOnTop() {
        // Periodically bring the notes window to the front
        // This prevents it from being hidden by modals or other windows
        this.keepOnTopInterval = setInterval(() => {
            if (this.notesWindow && !this.notesWindow.closed) {
                try {
                    this.notesWindow.focus();
                } catch (e) {
                    // Ignore errors if window is closed or inaccessible
                    console.log('Could not focus notes window:', e);
                }
            } else {
                // Window was closed, clear the interval
                if (this.keepOnTopInterval) {
                    clearInterval(this.keepOnTopInterval);
                    this.keepOnTopInterval = null;
                }
            }
        }, 300); // Check every 300ms for faster response

        // Also bring teleprompter back when main window regains focus
        // (e.g., after closing email window)
        window.addEventListener('focus', this.focusTeleprompter);
        window.addEventListener('click', this.focusTeleprompter);
    },

    focusTeleprompter() {
        // Bound function to refocus teleprompter
        if (SpeakerNotes.notesWindow && !SpeakerNotes.notesWindow.closed) {
            try {
                SpeakerNotes.notesWindow.focus();
            } catch (e) {
                // Ignore errors
            }
        }
    },

    closeNotesWindow() {
        // Clear the keep-on-top interval
        if (this.keepOnTopInterval) {
            clearInterval(this.keepOnTopInterval);
            this.keepOnTopInterval = null;
        }

        // Remove event listeners
        window.removeEventListener('focus', this.focusTeleprompter);
        window.removeEventListener('click', this.focusTeleprompter);

        // Close the window
        if (this.notesWindow && !this.notesWindow.closed) {
            this.notesWindow.close();
            this.notesWindow = null;
        }
    }
};

// Make globally accessible
window.SpeakerNotes = SpeakerNotes;
