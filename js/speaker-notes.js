/**
 * Speaker Notes Teleprompter
 * Opens speaker notes in a separate window that follows mouse cursor
 */

const SpeakerNotes = {
    notesWindow: null,
    isFollowing: false,
    scrollSpeed: 30, // pixels per second
    mouseOffset: 50, // pixels left from cursor

    // Speaker notes content for PMO Toolbox presentation
    notes: [
        {
            section: "LANDING PAGE / DASHBOARD",
            content: `So, schauen wir uns das mal direkt an. Das hier ist die PMO Toolbox Landing Page – sozusagen die zentrale Einstiegsseite für alle Projektbeteiligten.

Ich sehe hier auf einen Blick die aktuelle Lage: 8 aktive Projekte, 24 Workstreams insgesamt. Von diesen 24 sind aktuell 16 im Plan – grün. 5 laufen mit kleineren Einschränkungen – gelb. Und 3 sind kritisch – rot. Das gibt mir sofort ein Gefühl dafür: Wo brennt es gerade?

Und genau das ist der Punkt: Ich muss nicht erst 5 PowerPoints öffnen oder durch SharePoint-Ordner klicken. Die Information ist da.`
        },
        {
            section: "PROJEKTÜBERSICHT",
            content: `Wenn ich jetzt zum Beispiel ins Projekt Sales Excellence reinschaue, sehe ich hier alle zugehörigen Workstreams. Jeder Workstream hat seinen eigenen Status – Termin, Budget, Scope, Risiken. Ich kann direkt erkennen: Wo gibt es Handlungsbedarf?`
        },
        {
            section: "WORKSTREAM-DETAILANSICHT",
            content: `Gehen wir mal tiefer rein – ich klicke auf einen Workstream, sagen wir 'Digitale Vertriebsplattform'.

Jetzt bin ich in der Workstream-Ansicht. Hier sehe ich als Teilprojektleiter alles, was ich brauche:

• Aktueller Status: Die vier Ampeln für Overall, Termin, Budget, Scope. Das ist mein aktueller Wochenstand.

• Statushistorie: Ich kann zurückblättern und sehen, wie sich der Status über die letzten Wochen entwickelt hat. War das schon länger rot? Oder ist das ein neues Problem? Das hilft enorm bei der Einordnung.

• Meilensteine: Hier sehe ich alle anstehenden und abgeschlossenen Meilensteine. Und ganz wichtig: Als Teilprojektleiter kann ich hier direkt Meilensteine bestätigen – mit einem Klick, ohne E-Mail-Ping-Pong. Das System trackt automatisch, wer wann was bestätigt hat.`
        },
        {
            section: "GANTT-CHART",
            content: `Wenn ich jetzt auf 'Gesamtplanung' wechsle, sehe ich den aktuellen Projektplan als Gantt-Chart. Alle Workstreams, alle Meilensteine, zeitlich aufgereiht. Die rote Linie zeigt mir: Heute ist hier. Und ich sehe sofort, wo wir im Verzug sind – das ist dann rot markiert.

Das Besondere: Diese Planung wird nicht manuell in Excel gepflegt und dann irgendwann hochgeladen. Die Daten kommen direkt aus dem SharePoint, wo die Projektleiter ihre Pläne pflegen. Das Frontend hier zeigt das nur übersichtlich an.`
        },
        {
            section: "ENTSCHEIDUNGSBOARD / KANBAN",
            content: `Ein weiterer wichtiger Punkt: Entscheidungen. In so einem Programm gibt es ständig offene Punkte, die eskaliert werden müssen.

Hier im Entscheidungsboard sehe ich alle offenen, eskalierten und bereits getroffenen Entscheidungen – als Kanban-Board. Ich kann nachvollziehen: Wann wurde was entschieden? Von wem? Und was ist gerade in der Schwebe?

Das ist Gold wert, wenn jemand nach drei Monaten fragt: 'Warum haben wir uns damals für Option A entschieden?' – Ich gehe einfach ins System und habe die Dokumentation da.`
        },
        {
            section: "GREMIENKALENDER",
            content: `Dann der Gremienkalender. Hier sehe ich alle anstehenden Steering Committees, PMO Reviews, Abstimmungen. Mit einem Blick erkenne ich: In welcher Woche sind welche Gremien? Wann muss ich meinen Status abgeben?

Das ist vor allem für die Vorbereitung extrem hilfreich. Ich weiß genau, wann ich liefern muss.`
        },
        {
            section: "PPT-EXPORT",
            content: `Und jetzt das Feature, das besonders den Workstream-Leads das Leben erleichtert: PPT-Export.

Ich kann mir aus dem System heraus direkt eine fertige PowerPoint-Seite generieren lassen – mit meinem aktuellen Status, den Ampeln, der Historie, den Meilensteinen. Die Folie ist schon im ERGO Corporate Design und kann direkt ins Reporting übernommen werden.

Das spart mir jede Woche Zeit. Ich muss nicht mehr manuell Tabellen kopieren oder Ampeln in PowerPoint malen. Das System generiert das automatisch aus den Daten.`
        },
        {
            section: "DOKUMENTE & SUCHE",
            content: `Noch ein letzter Punkt: Dokumente und Suche.

Wir haben ja anfangs über die Herausforderung gesprochen: Wie finde ich die richtige Information in hunderten von Dateien?

Hier im System gibt es eine zentrale Suche. Ich kann nach Stichworten suchen – sagen wir 'Datenmodell' – und das System zeigt mir alle relevanten Status-Einträge, Entscheidungen, Dokumente, in denen das Wort vorkommt. Ich sehe sofort: In welchem Workstream? Aus welcher Woche? Und ich kann direkt dorthin springen.

Das ist Zeiteinsparung pur.`
        },
        {
            section: "OPTIONAL: KI-DOKUMENTENASSISTENT",
            content: `Und jetzt noch ein Ausblick – das ist eine optionale Ausbaustufe, die wir anbieten können:

Ein KI-Dokumentenassistent. Ich kann dem System eine Frage stellen, zum Beispiel: 'Was ist die aktuelle Governance?' Und das System durchsucht automatisch alle hinterlegten Dokumente – Handbücher, Prozessbeschreibungen, RACI-Matrizen – und zeigt mir die relevanten PDFs an.

Das ist keine Magie, sondern einfach eine intelligente Verknüpfung der vorhandenen Dokumente. Aber es spart enorm Zeit, wenn ich nicht mehr manuell durch SharePoint-Ordner navigieren muss.

Diese KI-Funktion ist optional – das Kern-Tool funktioniert auch ohne. Aber es zeigt, in welche Richtung wir gehen können.`
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
            font-size: 18px;
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
            stopScrolling();
            scrollInterval = setInterval(() => {
                if (isScrolling) {
                    window.scrollBy(0, scrollSpeed / 60);
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
        }

        function toggleScroll() {
            isScrolling = !isScrolling;
        }

        function resetScroll() {
            window.scrollTo(0, 0);
        }

        // Start auto-scroll
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
    },

    startAutoScroll() {
        // Auto-scroll is handled in the notes window itself
    },

    closeNotesWindow() {
        if (this.notesWindow && !this.notesWindow.closed) {
            this.notesWindow.close();
            this.notesWindow = null;
        }
    }
};

// Make globally accessible
window.SpeakerNotes = SpeakerNotes;
