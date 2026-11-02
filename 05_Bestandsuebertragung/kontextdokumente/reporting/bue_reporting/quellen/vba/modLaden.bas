Option Explicit
' ============================================================================
' modLaden – Rohdaten (OPAG- und Verbund-Rueckstandsabzuege) laden, Anwesenheitsliste importieren
'
' Ablauf "Neue Daten laden":
'   1. Ordner "Rohdaten" (relativ zur Master-Datei, Konfiguration!B3) nach Excel-Dateien durchsuchen
'   2. In jeder Datei jedes Blatt pruefen: Stichtag aus "Rückstandsstichtag = …", Quelle aus den Spaltenkoepfen
'      (OPS_AUFTR_ID vorhanden = OPAG, sonst Verbund)
'   3. Alle gefundenen Staende nach Stichtag und Quelle sortieren, bereits geladene ueberspringen
'   4. Je Stand: Rueckstand je Sparte/VSS/Themenpostkorb/GeVo mit Altersklassen zaehlen,
'      Eingaenge (Schluessel neu gegenueber dem letzten Stand) und Abgaenge (Schluessel weg) bestimmen,
'      Zeilen an "Fakten" anhaengen, Snapshot der Schluessel ersetzen, Zeile in "Verlauf" ergaenzen
'   5. Ladeprotokoll fortschreiben, neu berechnen
' Liegt im Ordner Rohdaten ein neuer Abzug fuer einen schon geladenen Stand, bleibt die Datei liegen und eine Karte fragt
' (modTagesablauf.ErsatzFrageZeigen): Ersetzen loescht den alten Stand und rechnet ihn aus der neuen Datei neu – Eingaenge und
' Abgaenge gegen den Stand davor (aus dessen Datei gelesen), danach alle spaeteren Staende dieser Quelle aus ihren Dateien.
' Die alte Datei heisst danach …_ersetzt, eine nicht uebernommene neue …_verworfen; beide werden nicht mehr gelesen.
' Erkannte Dateien werden als JJJJMMTT_BUe_<OPAG|Verbund> in die Ablage Rohdaten\JJJJ\MM_Monat verschoben
' (Sammeldatei: JJJJMMTT-JJJJMMTT, beide Quellen: OPAG_Verbund); scheitert das Umbenennen, bleibt der Name und das Log vermerkt es.
' Fremde Dateien werden ohne Makros, ohne Dialoge und schreibgeschuetzt geoeffnet (QuelleOeffnen).
' Bereich MAKLER (Konfiguration!F7): Die Abzuege enthalten mehrere Einheiten (OE-Ebene 4: ODPB D, ODPP D, MSUE D …), auch verteilt auf
' mehrere Dateien am selben Tag. Je Zeile ergibt sich die Einheit aus OE_NR (ODPB1 D, ODPB2HH, ODPBHH -> ODPB; Zuordnung in
' Konfiguration!Q11:R40, sonst die fuehrenden Buchstaben ohne HH). Seit 12.88 ist jede Einheit aus Konfiguration!R11:R40 ein
' eigener Strang – unabhaengig davon, wie MIS-O die Einheiten auf Dateien verteilt: eigener Stand je Quelle und Stichtag, eigener
' Snapshot, eigene Ersatz-Frage; Zeilen anderer OEs zaehlen zur Haupteinheit des Blatts. Alle Einheiten eines Stichtags werden
' gemeinsam verarbeitet (Wechsel zwischen ihnen = Umbuchung); ein Nachzuegler wird eingefuegt (StandErsetzen mit einfuegen).
' Fakten (R Einheit, S Strang), Umbuchungen (Q/S Einheit heute/vorher, R Strang), Ladeprotokoll (K Strang) und Snapshot
' (F "Strang|Einheit") fuehren beides mit; der Dateiname traegt die Einheiten der Datei. Blatt Dateiinhalt merkt sich je Rohdatei
' Blaetter und Einheiten (InhaltMerken), damit sie nicht zum Erkennen erneut geoeffnet wird.
' Im Bereich HS bleiben Einheit und Gruppe leer (wie bisher).
' Seit 12.91 ignoriert der Bereich MAKLER Zeilen der HS-Einheit (OE HSB4 K -> Einheit HSB, HS_EINHEITEN): sie zaehlen weder als
' Rueckstand noch als Eingang. Ein reiner HS-Abzug im Ordner Rohdaten wird nicht geladen, nicht an Celonis uebergeben und heisst
' danach …_HS-ignoriert (SharePoint ohne Dateipfad: im Tool ausgeblendet). Stehen aus der Zeit davor schon HS-Zeilen in den
' Fakten, baut „Neue Daten laden“ das Tool einmal ohne sie neu auf (HsDatenGeladen, ToolLeeren).
' Seit 12.92 gilt ein Stand mit der Verkettungs-Angabe im Hinweis des Ladeprotokolls (seit 12.69 jeder normal geladene Stand) als
' geladen (StandGueltig). Bis 12.91 las „Neue Daten laden“ mit Dateipfad den zuletzt geladenen Stand jeder Quelle beim naechsten
' Laden deshalb erneut ein, sein Rueckstand stand doppelt; DoppelteStaendeBereinigen raeumt das beim ersten Laden auf.
' Waehrend des Ladens ist die Eingabe gesperrt (LadeModusEin/-Aus), Fehler raeumen immer auf.
' SharePoint ohne OneDrive (BasisOrdner liefert dann die https-Adresse): Dir, Name, MkDir und Kill gehen dort nicht. Die Ordner
' werden ueber Power Query aufgelistet (SpListe, Abfrage BUE_SharePoint_Liste, Anmeldung mit dem Office-Konto), die Dateien
' direkt ueber https geoeffnet. Seit 12.80 legt das Tool auch dort ab (JJJJ\MM_Monat, einheitlicher Name): ueber die
' SharePoint-Schnittstelle per Power Query mit derselben Anmeldung (SpAblagePruefen, SpVerschieben). Geht das nicht (Rechte,
' Richtlinie), bleibt es beim Folgenden: Ablage in JJJJ\MM_Monat und Umbenennen entfallen; schon geladene Dateien werden am Namen erkannt
' und nicht erneut geoeffnet. Logs liegen dann unter %LOCALAPPDATA%\BUE_Reporting.
' ============================================================================

Private Const FAKTEN_SPALTEN As Long = 16       ' A..O Daten, P = Aktiv (Formel), Q = Standard (Formel, Spalte 17)
Private Const STANDARD_VORSCHLAG As String = "|KO 23724|MV 23724|"   ' neue Postkoerbe mit diesem Namen kommen als "ja" in den Standard
Private Const FAKTEN_MAX As Long = 300000       ' Ende der benannten Bereiche F_* (Fakten!X2:X300000)
Private Const UMB_MAX As Long = 100000          ' Ende der benannten Bereiche U_* (Umbuchungen!X2:X100000)
Private Const VERLAUF_MAX As Long = 1000        ' Ende der Verlauf-Bezuege
Private Const MAX_KOPFZEILEN As Long = 15
Private Const SP_EINHEIT_F As Long = 18         ' Fakten!R: Einheit der Zeile (aus OE_NR, Bereich MAKLER)
Private Const SP_GRUPPE_F As Long = 19          ' Fakten!S: Gruppe = Einheiten der Rohdatei (Strang fuer den Vergleich)
Private Const SP_ALTER_F As Long = 20           ' Fakten!T: hoechstes Rueckstandsalter (Tage) der Zeile – KPI „Ältester Vorgang“
Private Const SP_VORGANG_F As Long = 21         ' Fakten!U: Schluessel des aeltesten Datensatzes der Zeile (VSS|Ordnungsbegriff|LNR[|Auftrag|Arbeitsgut])
Private Const SP_ALTSUM_F As Long = 22          ' Fakten!V: Summe der Rueckstandsalter (Tage) der Zeile – Ø Alter = V / Rueckstand (seit 12.84)
Private Const SP_EINHEIT_U As Long = 17         ' Umbuchungen!Q: Einheit heute
Private Const SP_GRUPPE_U As Long = 18          ' Umbuchungen!R: Gruppe
Private Const SP_EINHEIT_VOR_U As Long = 19     ' Umbuchungen!S: Einheit vorher
Private Const SP_GRUPPE_L As Long = 11          ' Ladeprotokoll!K: Gruppe (Einheiten der Datei)
Private Const SNAP_EINHEITEN As Long = 40       ' Snapshot_*!J2:L41: Stichtag und Schluessel je Gruppe
Private Const TRENNER As String = "|"
' Bereich MAKLER: BUe-Bearbeiter der Vertriebsunterstuetzung MSUED (Mail K. Staudt, 13.10.2026), zusaetzlich zum Anwesenheitsplan
Private Const ZUSATZ_MA As String = "Hubertus Baumgarten|Melanie Möller|Claudia Plottke|Nicolo Schuchnelski|Renate Friedrich|Silke Hutter|Ira Püttjer|Rohit Singh Puri"
Private Const ZUSATZ_EINHEIT As String = "MSUE"
Public Const MA_START As Long = 5               ' erste Mitarbeiterzeile im Blatt Mitarbeiter
Public Const MA_ZEILEN As Long = 60             ' reservierte Mitarbeiterzeilen
Public Const PL_VERSATZ As Long = 2             ' Kalender-Zeile = Mitarbeiter-Zeile + 2 (Kalender beginnt in Zeile 7)
Public Const PK_VON As Long = 5                 ' Filter!B5:B44 Themenpostkoerbe
Public Const PK_BIS As Long = 44

Private Type Stand
    Datei As String
    Blatt As String
    Quelle As String
    Gruppe As String                            ' nur Bereich MAKLER: Strang = Einheit (seit 12.88, z. B. "ODPB"), sonst leer
    DateiGruppe As String                       ' nur Bereich MAKLER: alle Einheiten der Datei (z. B. "MSUE+ODPB"), fuer den Dateinamen
    Stichtag As Date
    Zeilen As Long                              ' Datensaetze laut Blatt (fuer die Ersatz-Frage)
    Ersetzen As Boolean                         ' schon geladener Stand, neue Datei soll ihn ersetzen
End Type

Private calcVorher As XlCalculation
Private logPfad As String                      ' Ladelog.txt neben der Master-Datei
Private importMeldung As String                ' Ergebnis des letzten Anwesenheits-Imports (fuer die gemeinsame Meldung)
Private anwImLaden As Boolean                  ' AnwesenheitLaden laeuft innerhalb von NeueDatenLaden (dessen Lademodus, keine eigene Neuberechnung)
Private anwPlan As Boolean                     ' letzter Import (diese Sitzung): Anwesenheitsplan (Blatt Verwaltung), gelungen
Private anwHeute As String                     ' Plan: heutige Anwesenheit als Text fuer den Tagesablauf
Private anwFehltHeute As Long                  ' Plan: heute abwesend laut Plan (-1 = heute arbeitsfrei, -2 = heute nicht im Plan)
Private anwFehlschlag As Boolean               ' letzter Import (diese Sitzung) versucht, aber nicht gelungen
Private lademodusAktiv As Boolean
Private ersatzWahl As Object                   ' Quelle|Stichtag -> True (ersetzen) / False (alten behalten)
Private ersatzOffen As Object                  ' Quelle|Stichtag -> Beschreibung, solange die Frage offen ist
Private celonisAnzahl As Long                  ' an Celonis uebergebene Dateien (dieses Laden)
Private neuePK As Object                       ' neue Themenpostkoerbe ausserhalb HS (dieses Laden), Standard "ja", Frage folgt
Private oeEinheit As Object                    ' OE_NR -> Einheit (Cache; Zuordnung Konfiguration!Q11:R40)
Private inhaltIndex As Object                  ' Blatt Dateiinhalt als Index (je Laden neu gelesen)
Private gruppenListe As Object                 ' Einheiten aus Konfiguration!R11:R40 (Cache je Laden; leer = jede Einheit)
Private lesenSchluessel As String              ' zuletzt gelesenes Blatt (Datei|Blatt|Quelle|Stichtag) – Straenge einer Datei lesen sie nur einmal
Private lesenDaten As Variant
Private lesenSp() As Long
Private lesenZeilen As Long
Private basisCache As String                   ' aufgeloester Ordner der Master-Datei bei SharePoint-Adresse (je Sitzung)
Private basisCacheUrl As String
Private spListen As Object                     ' SharePoint: Ordneradresse (klein) -> Dictionary rel (Trenner \) -> Array(rel, geaendert, groesse)
Private spFehler As String                     ' SharePoint: Fehlertext der letzten Auflistung
Private Const SP_ABFRAGE As String = "BUE_SharePoint_Liste"
Private Const SP_BLATT As String = "SP_Liste"
Private celonisLog As Object                   ' Celonis_Upload_Log.txt: Datei -> Groesse der uebergebenen Fassung
Private celonisVorhanden As Long               ' lagen schon im Celonis-Ordner (nicht erneut kopiert)
Private celonisFehler As String                ' Hinweis, wenn der Celonis-Ordner nicht erreichbar war
Private celonisAlt As Long                     ' vor „Celonis ab Stichtag“ (Konfiguration!F8), nicht uebergeben
Private celonisSp As Collection                ' SharePoint: Zeilen von Celonis_Upload_Log.txt neben der Master-Datei (Nothing = nicht gelesen)
Private celonisSpNeu As Collection             ' SharePoint: in diesem Laden neu uebergebene Dateien (werden dort angehaengt)
Private celonisNamen As Object                 ' SharePoint: Rohdatei (klein) -> einheitlicher Name JJJJMMTT_BUe_<Quelle>… fuer die Celonis-Kopie
Private celonisAlias As Object                 ' Rohdatei (klein, wie geladen) -> frueherer Name (vor dem Umbenennen bzw. MIS-O-Name) fuer den Abgleich
Private celonisSpFehler As String              ' SharePoint: Fehlertext, wenn das Protokoll nicht gelesen werden konnte
Private Const CELONIS_LOG As String = "Celonis_Upload_Log.txt"
Private Const PROTOKOLL_ORDNER As String = "Protokolle"      ' Textdateien des Tools (Sperrdatei, Celonis-Protokoll, Ladelog) neben der Master-Datei (12.90)
Private Const SP_TEXT_ABFRAGE As String = "BUE_SharePoint_Text"
Private Const SP_SPERRE_ABFRAGE As String = "BUE_SharePoint_Sperre"   ' Sperrdatei „Beladung läuft“ (Blatt SP_Liste ab N1)
Private ersatzImAblauf As Boolean              ' Frage kam aus dem Tagesablauf (danach dort weiter)
Private ersatzLaeuft As Boolean                ' StandErsetzen laeuft: alter Stand schon entfernt, ein Abbruch speichert nicht
Private ladeOrt As String                      ' aktueller Schritt beim Laden (fuer die Fehlermeldung)
Private ladeAnteil As Double                   ' aktueller Stand des Fortschrittsbalkens (Celonis-Meldung haelt ihn, statt zu springen)
Private ladeStatus As String                   ' aktuelle Statuszeile (Celonis-Meldung steht darunter)
Private cacheOrdner As String                  ' SharePoint: %TEMP%\BUE_Cache_… mit lokalen Kopien der Rohdateien (dieses Laden)
Private cacheDateien As Object                 ' https-Adresse (klein) -> lokale Kopie
Private spAblage As Long                       ' SharePoint: Ablage ueber Power Query moeglich? 0 = ungeprueft, 1 = ja, -1 = nein (je Laden)
Private spAblageFehler As String               ' SharePoint: warum nicht (fuer Ladelog und Meldung)
Private spSyncGefragt As Boolean
Private rohLokalUrl As String                                 ' SharePoint-Adresse des Rohdaten-Ordners, zu der rohLokal gefunden wurde
Private rohLokal As String                                    ' lokaler Ordner dazu (OneDrive-Verknuepfung/Sync), mit Trenner               ' „Ordner synchronisieren?“ in dieser Sitzung schon gefragt
Private Const SP_ABLAGE_ABFRAGE As String = "BUE_SharePoint_Ablage"     ' Ordner anlegen, Datei verschieben (Blatt SP_Liste ab T1)
' Bereich MAKLER (12.91): Abzuege des HS-Reportings (OE HSB4 K) gehoeren nicht ins Makler-Reporting
Private Const HS_EINHEITEN As String = "|HSB|HS|"      ' Einheiten (EinheitAusOE), deren Zeilen der Makler-Master ignoriert
Private Const HS_ENDUNG As String = "_HS-ignoriert"     ' Name eines reinen HS-Abzugs nach dem Laden (wird nicht mehr gelesen)
Private blattNurHs As Boolean                  ' BlattErkennen: Blatt hat nur Zeilen der HS-Einheit (kein Stand)
Private hsDateien As Collection                ' dieses Laden: reine HS-Abzuege, nicht geladen (Namen fuer die Meldung)
Private hsAusgeblendet As Long                 ' davon im SharePoint-Modus nur ausgeblendet (nicht umbenannt)
Private hsZeilen As Long                       ' dieses Laden: ignorierte HS-Zeilen in Makler-Abzuegen
Private hsNeuaufbau As Boolean                 ' dieses Laden: Tool ohne vorher mitgeladene HS-Zeilen neu aufgebaut
Private doppeltText As String                  ' bereinigte doppelt geladene Staende (12.92), bis zur naechsten Abschlussmeldung

' ---------------------------------------------------------------- Lademodus (Sperre, Zustand sichern und zurueckgeben)
Private Sub LadeModusEin(titel As String)
    If Not lademodusAktiv Then calcVorher = Application.Calculation
    lademodusAktiv = True
    modFortschritt.FortschrittZeigen titel
    Application.ScreenUpdating = False
    Application.EnableEvents = False            ' kein SelectionChange, keine Ereignisse fremder Dateien
    ' Application.Interactive wird bewusst nicht gesetzt: zusammen mit DoEvents und Workbooks.Open kann Excel abstuerzen.
    ' Die Schaltflaechen pruefen stattdessen LadenLaeuft() und tun waehrend des Ladens nichts.
    Application.Calculation = xlCalculationManual
End Sub

Private Sub LadeModusAus()
    On Error Resume Next
    modFortschritt.FortschrittSchliessen
    If calcVorher = 0 Then calcVorher = xlCalculationAutomatic
    Application.Calculation = calcVorher
    Application.EnableEvents = True
    Application.StatusBar = False
    Application.ScreenUpdating = True
    lademodusAktiv = False
    On Error GoTo 0
End Sub

Public Function LadenLaeuft() As Boolean
    LadenLaeuft = lademodusAktiv
End Function

Public Sub LogSchreiben(text As String)
    ' Ladelog.txt neben der Master-Datei: jeder Schritt eine Zeile (Datei wird je Zeile geoeffnet und geschlossen,
    ' damit nach einem Absturz von Excel der letzte Schritt sichtbar ist)
    Dim f As Integer
    On Error Resume Next
    If Len(logPfad) = 0 Then logPfad = LokalerProtokollPfad("Ladelog.txt")
    f = FreeFile
    Open logPfad For Append As #f
    Print #f, Format(Now, "yyyy-mm-dd hh:nn:ss") & "  " & text
    Close #f
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Einstieg
Public Sub NeueDatenLaden()
    Dim ordner As String, datei As String, pfad As String
    Dim staende() As Stand, n As Long, i As Long, j As Long, st As Stand
    Dim wbQ As Workbook, ws As Worksheet
    Dim geladen As Long, uebersprungen As Long, meldung As String
    Dim dateien() As String, nDateien As Long, d As Long, protokolliert As Object
    Dim nVorher As Long, neuName As String, k As Long, umbenannt As Long, fehlerUmb As String, abgelegt As Long
    Dim geladenInfo As Object, schluessel As String, zurueckhalten As Boolean, verworfen As Long, alleVerworfen As Boolean
    Dim ersetzt As Long, nachgerechnet As Long, gesendet As Object, celonisNachgeholt As Long, sperre As String
    Dim anwText As String
    Dim nurAblegen As Boolean                                ' SharePoint (12.80): schon geladene Datei, wird nur noch abgelegt
    Dim nichtAbgelegt As Long, ablageFehler As String         ' SharePoint (12.81): Verschieben gescheitert (fuer die Meldung)
    Dim bl() As Stand, blS() As Object, nBl As Long, b As Long, u As Variant, straenge As Object   ' erkannte Blaetter und ihre Einheiten (12.88)
    Dim erledigt() As Boolean, stapel() As Stand, nStapel As Long, imStapel As Object, x As Long, nachtrag As Long
    Dim nHsBl As Long, hsEinheit As String                   ' Blaetter nur mit HS-Zeilen (12.91)
    Dim doppeltNeu As String                                 ' eben bereinigte doppelt geladene Staende (12.92)

    If lademodusAktiv Then Exit Sub
    sperre = BeladungAndererText()                           ' einmal lesen (im SharePoint-Modus ein Abruf der Sperrdatei)
    If Len(sperre) > 0 Then                                  ' laeuft gerade bei jemand anderem: warten statt doppelt laden
        ' im Tagesablauf als Fehler melden: dort folgt „Nochmal laden / Ohne Laden weiter“ statt „erledigt“
        modFortschritt.HinweisZeigen "Beladung läuft", sperre, modTagesablauf.WartetAufLaden()
        Exit Sub
    End If
    If AlteGruppenStraenge() Then
        ' bis 12.87 war im Bereich Makler die Gruppe der Datei der Strang; seit 12.88 ist es die Einheit – alte Staende passen nicht dazu
        modFortschritt.HinweisZeigen "Hinweis", "Seit Version 12.88 vergleicht das Tool jede Einheit einzeln mit ihrem Vortag – " & _
            "auch wenn MIS-O die Einheiten von Tag zu Tag anders auf die Dateien verteilt. Die bisher geladenen Stände sind noch nach " & _
            "Datei-Gruppen gespeichert (z. B. „MSUE+ODPB“)." & vbCrLf & vbCrLf & "Bitte einmal im Cockpit „Zurücksetzen …“ (ohne Anwesenheit) " & _
            "und danach „Neue Daten laden“ klicken: alle Abzüge aus dem Ordner Rohdaten werden neu eingelesen.", True
        Exit Sub
    End If
    ersatzLaeuft = False
    Set spListen = Nothing                                   ' SharePoint-Ordner bei jedem Laden frisch auflisten
    On Error Resume Next
    ordner = RohdatenOrdner()
    If Err.Number <> 0 Then
        modFortschritt.HinweisZeigen "Fehler", Err.Description, True
        Exit Sub
    End If
    On Error GoTo 0
    Application.StatusBar = IIf(IstUrl(ordner), "SharePoint-Ordner Rohdaten wird aufgelistet …", False)
    If Not OrdnerVorhanden(ordner) Then
        Application.StatusBar = False
        If IstUrl(ordner) Then
            modFortschritt.HinweisZeigen "Fehler", SpHinweis(ordner), True
        Else
            modFortschritt.HinweisZeigen "Fehler", "Der Rohdaten-Ordner wurde nicht gefunden:" & vbCrLf & ordner & vbCrLf & vbCrLf & _
                   "Bitte den Ordner neben der Master-Datei anlegen oder den Pfad in 'Konfiguration' anpassen.", True
        End If
        Exit Sub
    End If

    ' Bereich MAKLER (12.91): vorher mitgeladene HS-Zeilen (Einheit HSB) in den Fakten – einmal leeren und ohne sie neu aufbauen
    hsNeuaufbau = False
    hsEinheit = HsDatenGeladen()
    If Len(hsEinheit) > 0 Then
        LogSchreiben "---- HS-Zeilen (Einheit " & hsEinheit & ") in den Fakten: Tool wird ohne sie neu aufgebaut"
        ToolLeeren False
        hsNeuaufbau = True
    End If

    BeladungMarkieren True                                   ' orange Box im Cockpit (auch fuer Kollegen: Datei wird gespeichert)
    LogSchreiben "---- NeueDatenLaden Start, Ordner " & ordner
    LadeModusEin "Rohdaten werden geladen"
    Application.StatusBar = "Rohdaten werden gesucht …"
    On Error GoTo Fehler

    ' 12.92: bis 12.91 doppelt geladene Staende (Ladeprotokoll fuehrt einen Stand mehrfach) aus Fakten und Protokoll entfernen
    ladeOrt = "Doppelt geladene Stände bereinigen"
    doppeltNeu = DoppelteStaendeBereinigen()
    If Len(doppeltNeu) > 0 Then doppeltText = doppeltNeu

    ' 1. Dateien sammeln: Rohdaten selbst und die Ablage Rohdaten\JJJJ\MM_Monat (relative Pfade), nur echte Excel-Endungen
    ladeOrt = "Ladeprotokoll lesen"
    ladeStatus = ""
    Set protokolliert = ProtokollLesen()
    Set geladenInfo = GeladenLesen()
    celonisAnzahl = 0: celonisVorhanden = 0: celonisFehler = "": celonisAlt = 0: Set celonisLog = Nothing
    Set celonisSp = Nothing: Set celonisSpNeu = New Collection: Set celonisNamen = CreateObject("Scripting.Dictionary"): celonisSpFehler = "": Set celonisAlias = CreateObject("Scripting.Dictionary")
    Set neuePK = CreateObject("Scripting.Dictionary")
    Set hsDateien = New Collection: hsAusgeblendet = 0: hsZeilen = 0
    Set oeEinheit = Nothing                                  ' Zuordnung OE -> Einheit frisch aus der Konfiguration
    Set gruppenListe = Nothing
    Set inhaltIndex = Nothing
    LesenVergessen
    If ersatzWahl Is Nothing Then Set ersatzWahl = CreateObject("Scripting.Dictionary")
    Set ersatzOffen = CreateObject("Scripting.Dictionary")
    ladeOrt = "Dateien im Ordner Rohdaten auflisten"
    nDateien = DateienSammeln(ordner, dateien)
    spAblage = 0
    spAblageFehler = ""
    ' SharePoint ohne Dateipfad: Excel kann dort nicht verschieben (Power Query schickt POST nur anonym, kein Power Automate) -
    ' die Dateien bleiben liegen und werden abgelegt, sobald jemand mit OneDrive-Verknuepfung laedt (12.81; SpAblagePruefen bleibt
    ' fuer Tenants, in denen es gehen sollte, wird aber nicht mehr aufgerufen)
    If IstUrl(ordner) Then
        spAblage = -1
        spAblageFehler = "SharePoint ohne Dateipfad"
        LogSchreiben "  SharePoint-Modus: Rohdateien bleiben liegen (Ablage durch jemanden mit OneDrive-Verknuepfung)"
    End If
    DateienChronologisch ordner, dateien, nDateien           ' aelteste zuerst, damit die Anzeige dem Datum folgt
    ' 2. Staende erkennen: jede Datei kurz oeffnen und Stichtag und Quelle lesen (stehen im Blatt, nicht sicher im Namen)
    modFortschritt.FortschrittSchritt "Schritt 1 von 2 · Dateien prüfen (Stichtag, Quelle)"
    n = 0
    For d = 0 To nDateien - 1
        datei = dateien(d)
        ladeAnteil = 0.05 + 0.25 * d / IIf(nDateien = 0, 1, nDateien)
        modFortschritt.FortschrittSetzen ladeAnteil, "Datei " & (d + 1) & " von " & nDateien & DatumAusName(datei), DateiName(datei)
        pfad = PfadVon(ordner, datei)
        ' Bereits abgelegte Datei, deren Stand laut Ladeprotokoll geladen ist: nicht oeffnen (der Name traegt Stichtag und Quelle)
        ' Ausnahme: ein Doppel (…_2) zu einem Stand, der aus einer anderen Datei geladen ist – das ist ein neuer Abzug zum selben Tag
        If InStr(datei, Application.PathSeparator) > 0 And AbgelegtUndGeladen(datei, protokolliert) Then
            If Not DoppelZuGeladen(datei, geladenInfo) Then
                abgelegt = abgelegt + 1
                GoTo NaechsteDatei
            End If
        End If
        ' Im SharePoint-Modus (Kollege ohne OneDrive) ausgeblendet – ersetzt, nicht uebernommen oder „geloescht“: lokal wie dort
        ' behandeln, also umbenennen (…_verworfen) und nicht laden
        If Not IstUrl(ordner) Then
            If SpAusgeblendet(datei, DateiGroesse(PfadVon(ordner, datei))) Then
                On Error Resume Next
                neuName = FreierDateiname(ordner, Left$(datei, InStrRev(datei, ".") - 1) & "_verworfen" & Mid$(datei, InStrRev(datei, ".")))
                Name ordner & datei As ordner & neuName
                If Err.Number = 0 Then LogSchreiben "  ausgeblendet (SharePoint), umbenannt: " & datei & " -> " & neuName
                Err.Clear
                On Error GoTo Fehler
                verworfen = verworfen + 1
                GoTo NaechsteDatei
            End If
        End If
        ' SharePoint: Eine Datei, aus der schon geladen wurde, nicht erneut oeffnen – ausser sie liegt noch unsortiert im Ordner
        ' Rohdaten und die Ablage geht (12.80): dann wird sie erkannt und wie mit Dateipfad abgelegt (der Stand selbst ist schon da)
        nurAblegen = False
        If IstUrl(ordner) Then
            If DateiSchonGeladen(datei, ordner) Then
                If spAblage = 1 And InStr(datei, Application.PathSeparator) = 0 Then
                    nurAblegen = True
                    LogSchreiben "Schon geladen, liegt noch im Ordner Rohdaten - wird abgelegt: " & datei
                Else
                    abgelegt = abgelegt + 1
                    GoTo NaechsteDatei
                End If
            End If
        ElseIf InStr(datei, Application.PathSeparator) = 0 Then
            ' Dateipfad (z. B. OneDrive-Verknuepfung): eine schon geladene Datei, die noch unsortiert im Ordner Rohdaten liegt
            ' (von Kollegen im SharePoint-Modus geladen), nur ablegen – keine Ersatz-Frage, der Stand ist schon da
            If DateiSchonGeladen(datei, ordner) Then
                nurAblegen = True
                LogSchreiben "Schon geladen, liegt noch im Ordner Rohdaten - wird abgelegt: " & datei
            End If
        End If
        nVorher = n
        zurueckhalten = False
        alleVerworfen = True
        ladeOrt = "Datei " & datei & " prüfen"
        ' Schneller Weg: einheitlich benannte Datei aus der Ablage (JJJJMMTT_BUe_<Quelle>[_Einheit][_n]) – Stichtag und Quelle stehen
        ' im Namen, den das Tool selbst aus dem Inhalt vergeben hat. Die Datei wird erst zum Verarbeiten geoeffnet.
        If StandAusName(datei, staende, n, geladenInfo) Then
            alleVerworfen = False
            LogSchreiben "Stand aus Dateiname (nicht geoeffnet): " & datei
            GoTo NachErkennung
        End If
        ' Inhalt der Datei (Blaetter, Quelle, Stichtag, Einheiten): aus dem Blatt Dateiinhalt, wenn die Datei schon einmal geprueft
        ' wurde (gleicher Name, gleiche Groesse) – dann wird sie hier nicht geoeffnet; sonst oeffnen und vermerken
        nBl = 0
        nHsBl = 0
        If InhaltBekannt(ordner, datei, bl, blS, nBl) Then
            LogSchreiben "Inhalt aus Blatt Dateiinhalt (nicht geoeffnet): " & datei
        Else
            LogSchreiben "Pruefe Datei " & datei
            Set wbQ = QuelleOeffnenRel(ordner, datei)
            LogSchreiben "  geoeffnet, Blaetter: " & wbQ.Worksheets.Count
            For Each ws In wbQ.Worksheets
                If BlattErkennen(ws, st, straenge) Then
                    st.Datei = datei
                    st.Blatt = ws.Name
                    ReDim Preserve bl(0 To nBl)
                    ReDim Preserve blS(0 To nBl)
                    bl(nBl) = st
                    Set blS(nBl) = straenge
                    nBl = nBl + 1
                ElseIf blattNurHs Then
                    nHsBl = nHsBl + 1
                End If
            Next ws
            wbQ.Close SaveChanges:=False
            Set wbQ = Nothing
            LogSchreiben "  geschlossen"
            InhaltMerken ordner, datei, bl, blS, nBl
        End If
        ' Bereich MAKLER (12.91): reiner HS-Abzug (alle Zeilen OE HSB4 K) – gehoert ins HS-Reporting, wird nicht geladen
        If nBl = 0 And nHsBl > 0 Then
            HsAbzugAusmustern ordner, datei
            GoTo NaechsteDatei
        End If
        ' Bereich MAKLER: je Einheit ein Stand (Strang), auch wenn mehrere Einheiten in einer Datei stehen
        For b = 0 To nBl - 1
            LogSchreiben "  erkannt: " & bl(b).Blatt & " = " & Strang(bl(b).Quelle, bl(b).DateiGruppe) & " " & Format(bl(b).Stichtag, "dd.mm.yyyy") & _
                         IIf(blS(b).Count > 1, " (" & blS(b).Count & " Einheiten)", "")
            For Each u In blS(b).Keys
                st = bl(b)
                st.Gruppe = CStr(u)
                st.Zeilen = CLng(blS(b).Item(u))
                st.Ersetzen = False
                ' Neue Datei (im Ordner Rohdaten oder Doppel …_2 in der Ablage) fuer einen Stand, der aus einer anderen Datei
                ' geladen ist: fragen, dann ersetzen oder verwerfen
                schluessel = StandSchluessel(st.Quelle, st.Gruppe, st.Stichtag)
                If nurAblegen Then
                    ' schon geladen (Ladeprotokoll nennt diese Datei): keine Ersatz-Frage – die Entscheidung von damals gilt,
                    ' die Staende werden in Schritt 4 als vorhanden uebersprungen
                    alleVerworfen = False
                ElseIf NeuerAbzugZuGeladen(datei, schluessel, geladenInfo) Then
                    If ersatzWahl.Exists(schluessel) Then
                        st.Ersetzen = ersatzWahl(schluessel)
                        If st.Ersetzen Then alleVerworfen = False
                    Else
                        zurueckhalten = True
                        If Not ersatzOffen.Exists(schluessel) Then ersatzOffen.Add schluessel, ErsatzDaten(st, geladenInfo(schluessel))
                    End If
                Else
                    alleVerworfen = False
                End If
                ReDim Preserve staende(0 To n)
                staende(n) = st
                n = n + 1
            Next u
        Next b
NachErkennung:
        ' SharePoint: die Datei behaelt ihren Namen; die Celonis-Kopie bekommt trotzdem den einheitlichen Namen wie in der Ablage
        If n > nVorher And IstUrl(ordner) Then
            celonisNamen(LCase$(datei)) = DateiName(ZielDateiname(staende, nVorher, n - 1, datei))
            celonisAlias(LCase$(datei)) = DateiName(datei)      ' MIS-O-Name (so stand er bis 12.64 im Protokoll)
        End If
        ' Datei einheitlich benennen und in die Ablage JJJJ\MM_Monat verschieben (nur erkannte Dateien). Bei offener Ersatz-Frage
        ' bleibt die Datei liegen, damit sie beim naechsten Laden wieder gefunden wird. Auf SharePoint (https) wird nicht verschoben;
        ' eine nicht uebernommene Datei wird dort im Tool ausgeblendet (statt …_verworfen).
        If n > nVorher And Not zurueckhalten And alleVerworfen And IstUrl(ordner) And spAblage <> 1 Then
            SpAusblenden datei, ordner
            verworfen = verworfen + 1
            LogSchreiben "  nicht uebernommen, ausgeblendet: " & datei
        End If
        If n > nVorher And Not zurueckhalten And (Not IstUrl(ordner) Or spAblage = 1) Then
            neuName = ZielDateiname(staende, nVorher, n - 1, datei)
            If alleVerworfen Then
                neuName = Left$(neuName, InStrRev(neuName, ".") - 1) & "_verworfen" & Mid$(neuName, InStrRev(neuName, "."))
                verworfen = verworfen + 1
            End If
            If Not SchonAbgelegt(datei, neuName) Then
                fehlerUmb = ""
                On Error Resume Next
                If Not IstUrl(ordner) Then OrdnerAnlegen ordner, Left$(neuName, InStrRev(neuName, Application.PathSeparator) - 1)
                neuName = FreierDateiname(ordner, neuName)
                Err.Clear
                On Error GoTo Fehler
                fehlerUmb = DateiUmbenennen(ordner, datei, neuName)     ' SharePoint: ueber die Schnittstelle (legt die Ordner an)
                If Len(fehlerUmb) = 0 Then
                    For k = nVorher To n - 1
                        staende(k).Datei = neuName
                    Next k
                    celonisAlias(LCase$(neuName)) = DateiName(datei)   ' Originalname (Uebergaben aus dem SharePoint-Modus)
                    CelonisAliasAblegen ordner, DateiName(datei), neuName   ' dauerhaft, falls unter dem Originalnamen schon uebergeben
                    CelonisOffenUmbenennen datei, neuName              ' offene Uebergabe (z. B. eines Kollegen) folgt der Datei
                    If ProtokollDateiUmschreiben(datei, neuName) > 0 Then Set geladenInfo = GeladenLesen()   ' schon geladen: Protokoll folgt
                    umbenannt = umbenannt + 1
                    LogSchreiben "  abgelegt: " & datei & " -> " & neuName
                Else
                    LogSchreiben "  nicht abgelegt (" & fehlerUmb & "): " & datei
                    nichtAbgelegt = nichtAbgelegt + 1
                    If Len(ablageFehler) = 0 Then ablageFehler = fehlerUmb
                    If IstUrl(ordner) And alleVerworfen Then        ' SharePoint: nicht verschoben – wie ohne Ablage ausblenden
                        SpAusblenden datei, ordner
                        LogSchreiben "  nicht uebernommen, ausgeblendet: " & datei
                    End If
                End If
            End If
        End If
NaechsteDatei:
    Next d

    ' Offene Ersatz-Frage: nichts verarbeiten, Karte zeigen; die Antwort startet das Laden erneut
    If ersatzOffen.Count > 0 Then
        LogSchreiben "Ersatz-Frage: " & ersatzOffen.Count & " Stand/Staende schon geladen"
        CacheAufraeumen
        BeladungMarkieren False
        LadeModusAus
        ersatzImAblauf = modTagesablauf.WartetAufLaden()
        On Error Resume Next
        Application.OnTime Now + TimeSerial(0, 0, 1), "'" & ThisWorkbook.Name & "'!modTagesablauf.ErsatzFrageZeigen"
        On Error GoTo 0
        Exit Sub
    End If

    If n = 0 Then
        ' kein neuer Abzug: die Anwesenheit (Plan) trotzdem auffrischen, damit MAK und Produktivitaet den heutigen Plan zeigen
        anwText = AnwesenheitImLaden()
        If Len(anwText) > 0 Or Len(doppeltText) > 0 Then
            ladeOrt = "Kennzahlen und Diagramme neu berechnen"
            Application.Calculation = xlCalculationAutomatic
            Application.Calculate
            modCockpit.DiagrammeAnpassen True
        End If
        CacheAufraeumen
        BeladungMarkieren False
        LadeModusAus
        If abgelegt + verworfen = 0 And hsDateien.Count > 0 Then
            meldung = "Keine neuen Makler-Abzüge"
        ElseIf abgelegt + verworfen > 0 Then
            meldung = "Keine neuen Abzüge – alles im Ordner ist schon geladen" & IIf(verworfen > 0, " (" & verworfen & " ausgeblendet)", "")
        Else
            meldung = "Im Ordner " & ordner & " wurde kein Rückstandsabzug erkannt." & vbCrLf & _
                      "Erwartet werden Blätter mit 'Rückstandsstichtag = …' in den ersten Zeilen und einer Kopfzeile mit 'Themenpostkorb'"
        End If
        If Len(HsMeldung()) > 0 Then meldung = meldung & "." & vbCrLf & HsMeldung()
        meldung = meldung & DoppeltMeldung()
        If Len(anwText) > 0 And Not modTagesablauf.WartetAufLaden() Then meldung = meldung & "." & vbCrLf & anwText
        modFortschritt.HinweisZeigen "Hinweis", meldung & ".", False
        Exit Sub
    End If

    ' 3. sortieren nach Stichtag, dann Quelle (und Einheit), dann Datei absteigend: liegt ein Stand zweimal vor (Grunddatei und Doppel …_2,
    '    etwa beim ersten Laden aus der fertigen Ablage), wird das Doppel als aktuellerer Abzug geladen, die Grunddatei uebersprungen
    For i = 0 To n - 2
        For j = i + 1 To n - 1
            If staende(j).Stichtag < staende(i).Stichtag Or _
               (staende(j).Stichtag = staende(i).Stichtag And Strang(staende(j).Quelle, staende(j).Gruppe) < Strang(staende(i).Quelle, staende(i).Gruppe)) Or _
               (staende(j).Stichtag = staende(i).Stichtag And Strang(staende(j).Quelle, staende(j).Gruppe) = Strang(staende(i).Quelle, staende(i).Gruppe) And _
                StrComp(staende(j).Datei, staende(i).Datei, vbTextCompare) > 0) Then
                st = staende(i): staende(i) = staende(j): staende(j) = st
            End If
        Next j
    Next i

    ' 4. verarbeiten (Protokoll einmal lesen statt je Stand zu suchen). Jede Datei, aus der ein Stand geladen oder ersetzt wird,
    '    geht einmal als Kopie an Celonis – auch beim ersten Laden einer leeren Datei aus der fertigen Ablage.
    '    Streng nach Stichtag: Eingaenge und Abgaenge vergleichen jeden Stand mit dem vorigen derselben Quelle.
    modFortschritt.FortschrittSchritt "Schritt 2 von 2 · Stände nach Datum verarbeiten"
    Set protokolliert = ProtokollLesen()
    Set gesendet = CreateObject("Scripting.Dictionary")
    ladeOrt = "offene Celonis-Übergaben nachholen"
    celonisNachgeholt = CelonisOffenNachholen(ordner)
    ReDim erledigt(0 To n - 1)
    For i = 0 To n - 1
        If erledigt(i) Then GoTo NaechsterStand
        schluessel = StandSchluessel(staende(i).Quelle, staende(i).Gruppe, staende(i).Stichtag)
        If staende(i).Ersetzen And geladenInfo.Exists(schluessel) Then
            ladeAnteil = 0.3 + 0.6 * i / n
            ladeStatus = "Stand " & (i + 1) & " von " & n & ": " & Format$(staende(i).Stichtag, "dd.mm.yyyy") & " · " & Strang(staende(i).Quelle, staende(i).Gruppe) & " ersetzen"
            modFortschritt.FortschrittSetzen ladeAnteil, ladeStatus, DateiName(staende(i).Datei)
            LogSchreiben "Ersetze " & Strang(staende(i).Quelle, staende(i).Gruppe) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " durch " & staende(i).Datei
            ladeOrt = "Stand " & Strang(staende(i).Quelle, staende(i).Gruppe) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " aus " & staende(i).Datei & " ersetzen"
            ersatzLaeuft = True                                 ' ab hier ist der alte Stand weg: ein Abbruch darf nicht gespeichert werden
            nachgerechnet = nachgerechnet + StandErsetzen(ordner, staende(i), geladenInfo, False)
            ersatzLaeuft = False
            ersetzt = ersetzt + 1
            CelonisEinmal ordner, staende(i).Datei, gesendet, True, 0       ' Ersatz ueberschreibt die alte Kopie
            If Not protokolliert.Exists(schluessel) Then protokolliert.Add schluessel, True
            Set geladenInfo = GeladenLesen()
        ElseIf protokolliert.Exists(schluessel) Then
            uebersprungen = uebersprungen + 1
        ElseIf staende(i).Stichtag < LetzterStand(staende(i).Quelle, staende(i).Gruppe) Then
            ' Nachzuegler: dieser Stichtag kommt fuer diese Einheit erst nach spaeteren Tagen. Bereich MAKLER: einfuegen und die
            ' spaeteren Staende der Einheit aus ihren Dateien neu rechnen (wie beim Ersetzen). Fehlt eine dieser Dateien, oder im
            ' Bereich HS: ueberspringen wie bisher.
            nachtrag = -1
            If IstMakler() Then
                ladeAnteil = 0.3 + 0.6 * i / n
                ladeStatus = "Stand " & (i + 1) & " von " & n & ": " & Format$(staende(i).Stichtag, "dd.mm.yyyy") & " · " & Strang(staende(i).Quelle, staende(i).Gruppe) & " nachtragen"
                modFortschritt.FortschrittSetzen ladeAnteil, ladeStatus, DateiName(staende(i).Datei)
                LogSchreiben "Trage nach " & Strang(staende(i).Quelle, staende(i).Gruppe) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " aus " & staende(i).Datei
                ladeOrt = "Stand " & Strang(staende(i).Quelle, staende(i).Gruppe) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " aus " & staende(i).Datei & " nachtragen"
                ersatzLaeuft = True                             ' spaetere Staende der Einheit werden entfernt und neu gerechnet
                nachtrag = StandErsetzen(ordner, staende(i), geladenInfo, True)
                ersatzLaeuft = False
            End If
            If nachtrag >= 0 Then
                nachgerechnet = nachgerechnet + nachtrag
                geladen = geladen + 1
                CelonisEinmal ordner, staende(i).Datei, gesendet, False, staende(i).Stichtag
                Set geladenInfo = GeladenLesen()
            Else
                Protokoll staende(i), 0, 0, 0, 0, "übersprungen: Stichtag liegt vor dem zuletzt geladenen Stand (" & Format(LetzterStand(staende(i).Quelle, staende(i).Gruppe), "dd.mm.yyyy") & ")"
                uebersprungen = uebersprungen + 1
            End If
            protokolliert.Add schluessel, True
        Else
            ' alle normalen Staende dieser Quelle und dieses Stichtags gemeinsam (je Einheit ein Strang, auch aus mehreren Dateien):
            ' wechselt ein Vorgang zwischen zwei dieser Einheiten, ist das eine Umbuchung statt Abgang und Eingang
            Set imStapel = CreateObject("Scripting.Dictionary")
            nStapel = 0
            For x = i To n - 1
                If staende(x).Quelle <> staende(i).Quelle Or CLng(staende(x).Stichtag) <> CLng(staende(i).Stichtag) Then Exit For
                If Not erledigt(x) And Not imStapel.Exists(staende(x).Gruppe) Then
                    schluessel = StandSchluessel(staende(x).Quelle, staende(x).Gruppe, staende(x).Stichtag)
                    If Not (staende(x).Ersetzen And geladenInfo.Exists(schluessel)) And Not protokolliert.Exists(schluessel) Then
                        If Not staende(x).Stichtag < LetzterStand(staende(x).Quelle, staende(x).Gruppe) Then
                            ReDim Preserve stapel(0 To nStapel)
                            stapel(nStapel) = staende(x)
                            nStapel = nStapel + 1
                            imStapel.Add staende(x).Gruppe, True
                            erledigt(x) = True
                        End If
                    End If
                End If
            Next x
            Application.StatusBar = "Verarbeite " & staende(i).Quelle & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " …"
            ladeAnteil = 0.3 + 0.6 * i / n
            ladeStatus = "Stand " & (i + 1) & " von " & n & ": " & Format$(staende(i).Stichtag, "dd.mm.yyyy") & " · " & Strang(staende(i).Quelle, StapelText(stapel, nStapel))
            modFortschritt.FortschrittSetzen ladeAnteil, ladeStatus, DateiName(staende(i).Datei)
            LogSchreiben "Stand " & Strang(staende(i).Quelle, StapelText(stapel, nStapel)) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " aus " & staende(i).Datei & " / " & staende(i).Blatt
            ladeOrt = "Stand " & Strang(staende(i).Quelle, StapelText(stapel, nStapel)) & " " & Format(staende(i).Stichtag, "dd.mm.yyyy") & " aus " & staende(i).Datei & " / " & staende(i).Blatt
            StaendeVerarbeiten ordner, stapel, nStapel
            LogSchreiben "  Stand fertig"
            For x = 0 To nStapel - 1
                ladeOrt = "Celonis-Kopie von " & stapel(x).Datei
                CelonisEinmal ordner, stapel(x).Datei, gesendet, False, stapel(x).Stichtag
                schluessel = StandSchluessel(stapel(x).Quelle, stapel(x).Gruppe, stapel(x).Stichtag)
                If Not protokolliert.Exists(schluessel) Then protokolliert.Add schluessel, True
                geladen = geladen + 1
            Next x
        End If
NaechsterStand:
    Next i

    ' 4b. Anwesenheit (erster Import oder Anwesenheitsplan) vor der Neuberechnung und dem Speichern: MAK und Produktivitaet
    '     werden so mit dem heutigen Plan gerechnet und gespeichert
    anwText = AnwesenheitImLaden()

    ' 5. neu berechnen
    ladeOrt = "Kennzahlen und Diagramme neu berechnen"
    modFortschritt.FortschrittSchritt "Abschluss"
    modFortschritt.FortschrittSetzen 0.92, "Kennzahlen und Diagramme werden neu berechnet"
    LogSchreiben "Neuberechnung"
    QuelleBewegungenWaehlen
    EinheitenNamenSetzen
    Application.Calculation = xlCalculationAutomatic
    Application.Calculate
    If geladen + ersetzt > 0 Then                      ' Chips im Cockpit: groesste Postkoerbe der geladenen Daten zuerst
        modCockpit.PostkoerbeSortieren
        Application.Calculate
    End If
    LogSchreiben "Diagramme anpassen"
    modCockpit.DiagrammeAnpassen True
    ladeOrt = "Celonis-Protokoll auf SharePoint fortschreiben"
    fehlerUmb = CelonisSpZurueckschreiben()
    If Len(fehlerUmb) > 0 Then
        If InStr(fehlerUmb, CELONIS_LOG) = 0 Then fehlerUmb = "Protokoll " & CELONIS_LOG & " auf SharePoint nicht fortgeschrieben (" & fehlerUmb & ")"
        CelonisFehlerMerken fehlerUmb & " – die Einträge stehen lokal und werden beim nächsten Laden nachgetragen"
    End If
    CacheAufraeumen
    LogSchreiben "Fertig: " & geladen & " geladen, " & ersetzt & " ersetzt, " & uebersprungen & " uebersprungen"
    modFortschritt.FortschrittSetzen 0.98, "Datei speichern (orange Box für Kollegen ausblenden)"
    BeladungMarkieren False                            ' entfernt zuerst das Ladefenster, dann wird gespeichert
    LadeModusAus
    ersatzWahl.RemoveAll
    If geladen = 0 And ersetzt = 0 Then
        meldung = "Keine neuen Stände geladen"
    ElseIf geladen = 0 Then
        meldung = StaendeText(ersetzt) & " ersetzt"
    Else
        meldung = StaendeText(geladen) & " geladen"
        If ersetzt > 0 Then meldung = meldung & ", " & StaendeText(ersetzt) & " ersetzt"
    End If
    If nachgerechnet > 0 Then meldung = meldung & ", " & StaendeText(nachgerechnet) & " danach neu gerechnet"
    If celonisAnzahl > 0 Then meldung = meldung & ", " & IIf(celonisAnzahl = 1, "1 Datei", celonisAnzahl & " Dateien") & " an Celonis übergeben" & _
        IIf(celonisNachgeholt > 0, " (davon " & celonisNachgeholt & " nachgeholt)", "")
    If celonisVorhanden > 0 Then meldung = meldung & " (" & IIf(celonisVorhanden = 1, "1 Datei war", celonisVorhanden & " Dateien waren") & " schon übergeben)"
    If celonisAlt > 0 Then meldung = meldung & ", " & IIf(celonisAlt = 1, "1 Datei", celonisAlt & " Dateien") & " vor dem " & Format(CelonisAb(), "dd.mm.yyyy") & " nicht an Celonis (Konfiguration F8)"
    If Len(celonisFehler) > 0 Then meldung = meldung & ". Celonis: " & celonisFehler
    If NeuePostkoerbeAnzahl() > 0 Then meldung = meldung & ". Neue Themenpostkörbe (nicht HS) zählen zum Standard: " & NeuePostkoerbeText() & _
        " – „Standard festlegen …“ nimmt einzelne heraus"
    If verworfen > 0 Then meldung = meldung & ", " & IIf(verworfen = 1, "1 neue Datei", verworfen & " neue Dateien") & " nicht übernommen (alter Stand bleibt)"
    If uebersprungen > 0 Then meldung = meldung & ", " & StaendeText(uebersprungen) & " bereits vorhanden oder übersprungen"
    If umbenannt > 0 Then meldung = meldung & ", " & IIf(umbenannt = 1, "1 Rohdatei", umbenannt & " Rohdateien") & " umbenannt und in JJJJ\MM_Monat abgelegt"
    If abgelegt > 0 Then meldung = meldung & ", " & IIf(abgelegt = 1, "1 abgelegte Datei", abgelegt & " abgelegte Dateien") & " bereits geladen"
    If nichtAbgelegt > 0 Then
        meldung = meldung & "." & vbCrLf & IIf(nichtAbgelegt = 1, "1 Rohdatei", nichtAbgelegt & " Rohdateien") & _
                  " konnte" & IIf(nichtAbgelegt = 1, "", "n") & " nicht in JJJJ\MM_Monat abgelegt werden (" & Left$(ablageFehler, 160) & "). Abhilfe (einmal je Person): auf " & _
                  "SharePoint beim Ordner der Master-Datei „Verknüpfung zu OneDrive hinzufügen“ klicken"
    ElseIf IstUrl(ordner) And spAblage = 1 And umbenannt > 0 Then
        meldung = meldung & " (über SharePoint)"
    End If
    If IstUrl(ordner) And spAblage = -1 Then
        k = SpUnsortiert(ordner)
        If k > 0 Then
            meldung = meldung & "." & vbCrLf & IIf(k = 1, "1 Rohdatei liegt", k & " Rohdateien liegen") & " noch unsortiert im Ordner " & _
                      "Rohdaten – sie werden umbenannt und abgelegt, sobald jemand lädt, bei dem der Ordner über OneDrive auf dem Rechner liegt " & _
                      "(„Verknüpfung zu OneDrive hinzufügen“ auf „BÜ - HS“ oder „Rohdaten“, OneDrive-Client angemeldet und synchronisiert)"
        End If
    End If
    If hsNeuaufbau Then meldung = meldung & "." & vbCrLf & "Neu aufgebaut ohne HS-Daten: In den geladenen Ständen standen Zeilen der HS-Einheit " & _
        "(OE HSB4 K) aus HS-Abzügen, die im Ordner Rohdaten lagen. Seit 12.91 ignoriert das Makler-Reporting sie. Die Auswahl der " & _
        "Standard-Postkörbe bitte einmal prüfen („Standard festlegen …“)"
    If Len(HsMeldung()) > 0 Then meldung = meldung & "." & vbCrLf & HsMeldung()
    meldung = meldung & DoppeltMeldung()
    ' Ergebnis der Anwesenheit (4b) in die gemeinsame Meldung – im Tagesablauf zeigt sie Schritt 2 selbst
    If Len(anwText) > 0 And Not modTagesablauf.WartetAufLaden() Then meldung = meldung & "." & vbCrLf & anwText
    modFortschritt.HinweisZeigen "Fertig", meldung & ".", False
    Exit Sub

Fehler:
    ' Beschreibung zuerst sichern: jedes On Error in einer aufgerufenen Prozedur leert das Err-Objekt
    Dim fehlertext As String
    fehlertext = "Fehler " & Err.Number & ": " & Err.Description
    If Len(ladeOrt) > 0 Then fehlertext = fehlertext & vbCrLf & "Schritt: " & ladeOrt
    On Error Resume Next
    LogSchreiben "FEHLER " & fehlertext
    fehlertext = fehlertext & vbCrLf & "Protokoll: " & logPfad
    If Not wbQ Is Nothing Then wbQ.Close SaveChanges:=False
    Dim spText As String
    spText = CelonisSpZurueckschreiben()                      ' schon uebergebene Dateien trotz Abbruch vermerken
    If Len(spText) > 0 Then fehlertext = fehlertext & vbCrLf & "Celonis: " & spText
    CacheAufraeumen
    If Not ersatzWahl Is Nothing Then ersatzWahl.RemoveAll
    VerlaufGrenzenNeu
    Application.Calculation = xlCalculationAutomatic
    Application.Calculate
    Dim zusatz As String
    zusatz = "Bis dahin geladen: " & StaendeText(geladen) & ", übersprungen: " & StaendeText(uebersprungen) & ". Bereits geladene Stände bleiben erhalten."
    If ersatzLaeuft Then
        ' Abbruch mitten im Ersetzen: alter Stand entfernt, neuer nur teilweise gerechnet. Nicht speichern – sonst bliebe die Luecke
        ' dauerhaft (im SharePoint-Modus wird die Datei danach nicht mehr geoeffnet). Sperre und Ladefenster werden trotzdem aufgehoben.
        ersatzLaeuft = False
        BeladungMarkieren False, False
        zusatz = "Der Abbruch kam mitten im Ersetzen eines Stands (der alte Stand war schon entfernt). Die Datei wurde deshalb nicht " & _
                 "gespeichert: bitte schließen, ohne zu speichern, neu öffnen und erneut laden."
    Else
        BeladungMarkieren False
    End If
    LadeModusAus
    modFortschritt.HinweisZeigen "Fehler", "Fehler beim Laden: " & fehlertext & vbCrLf & vbCrLf & zusatz, True
End Sub

' "1 Stand" / "3 Stände" – Zaehlwort mit korrektem Singular und Plural
Private Function StaendeText(n As Long) As String
    If n = 1 Then
        StaendeText = "1 Stand"
    Else
        StaendeText = n & " Stände"
    End If
End Function

' ---------------------------------------------------------------- Einheitliche Dateinamen und Ablage
' Ein Stand: 2026\09_September\20260923_BUe_OPAG.xlsx; Sammeldatei: 2026\09_September\20260921-20260923_BUe_OPAG_Verbund.xlsx;
' mit Einheit (MAKLER): 20260923_BUe_Verbund_ODPB-D.xlsx
' (relativer Pfad unterhalb des Rohdaten-Ordners; der Monatsordner richtet sich nach dem ersten Stichtag der Datei)
Private Function ZielDateiname(staende() As Stand, von As Long, bis As Long, datei As String) As String
    Dim i As Long, minD As Date, maxD As Date, opag As Boolean, verbund As Boolean, teil As String, quelle As String, einheit As String
    minD = staende(von).Stichtag: maxD = minD
    einheit = staende(von).DateiGruppe
    For i = von To bis
        If staende(i).Stichtag < minD Then minD = staende(i).Stichtag
        If staende(i).Stichtag > maxD Then maxD = staende(i).Stichtag
        If staende(i).Quelle = "OPAG" Then opag = True Else verbund = True
        If staende(i).DateiGruppe <> einheit Then einheit = ""  ' Blaetter mit verschiedenen Einheiten: Name ohne Einheit
    Next i
    teil = Format$(minD, "yyyymmdd")
    If maxD > minD Then teil = teil & "-" & Format$(maxD, "yyyymmdd")
    If opag And verbund Then
        quelle = "OPAG_Verbund"
    ElseIf opag Then
        quelle = "OPAG"
    Else
        quelle = "Verbund"
    End If
    If Len(einheit) > 0 Then quelle = quelle & "_" & EinheitDateiteil(einheit)
    ZielDateiname = MonatsOrdner(minD) & Application.PathSeparator & teil & "_BUe_" & quelle & LCase$(Mid$(datei, InStrRev(datei, ".")))
End Function

Private Function MonatsOrdner(d As Date) As String
    ' 2026\09_September – Monatsnamen fest auf Deutsch (unabhaengig von der Sprache von Windows/Office)
    Dim namen As Variant
    namen = Array("Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember")
    MonatsOrdner = CStr(Year(d)) & Application.PathSeparator & Format$(Month(d), "00") & "_" & namen(Month(d) - 1)
End Function

Private Function SchonAbgelegt(datei As String, ziel As String) As Boolean
    ' Liegt die Datei schon unter dem Zielnamen – auch als Doppel mit _2, _3 …? Dann nicht erneut verschieben.
    Dim basis As String, endung As String, rest As String
    If StrComp(datei, ziel, vbTextCompare) = 0 Then SchonAbgelegt = True: Exit Function
    basis = Left$(ziel, InStrRev(ziel, ".") - 1)
    endung = Mid$(ziel, InStrRev(ziel, "."))
    If StrComp(Left$(datei, Len(basis) + 1), basis & "_", vbTextCompare) <> 0 Then Exit Function
    If StrComp(Right$(datei, Len(endung)), endung, vbTextCompare) <> 0 Then Exit Function
    rest = Mid$(datei, Len(basis) + 2, Len(datei) - Len(basis) - 1 - Len(endung))
    SchonAbgelegt = (Len(rest) > 0 And rest Like String(Len(rest), "#"))
End Function

Private Sub OrdnerAnlegen(ordner As String, rel As String)
    ' legt rel (z. B. 2026\09_September) unterhalb von ordner Stufe fuer Stufe an
    Dim teile As Variant, i As Long, pfad As String
    teile = Split(rel, Application.PathSeparator)
    pfad = ordner
    For i = LBound(teile) To UBound(teile)
        pfad = pfad & teile(i) & Application.PathSeparator
        If Not OrdnerVorhanden(pfad) Then MkDir Left$(pfad, Len(pfad) - 1)
    Next i
End Sub

Private Function DateienSammeln(ordner As String, dateien() As String) As Long
    ' Excel-Dateien im Rohdaten-Ordner und in der Ablage JJJJ\MM_Monat als relative Pfade (Dir nicht verschachtelt: je Ebene
    ' erst vollstaendig lesen, dann absteigen). Andere Unterordner (z. B. Archiv) bleiben aussen vor.
    Dim n As Long, sep As String, jahre As Collection, monate As Collection, j As Variant, m As Variant, eintrag As String, rel As String
    Dim liste As Object, k As Variant, t() As String, nm As String, ok As Boolean
    sep = Application.PathSeparator
    n = 0
    If IstUrl(ordner) Then                                   ' SharePoint: aus der Power-Query-Auflistung (gleiche Regeln wie unten)
        Set liste = SpListe(ordner)
        If liste Is Nothing Then Err.Raise vbObjectError + 13, , SpHinweis(ordner)
        For Each k In liste.Keys
            rel = CStr(liste(k)(0))
            t = Split(rel, sep)
            nm = t(UBound(t))
            ' VBA wertet And/Or immer ganz aus: t(1) erst pruefen, wenn es die Ebene gibt (sonst Laufzeitfehler 9)
            ok = (UBound(t) = 0)
            If UBound(t) = 2 Then ok = (t(0) Like "####" And t(1) Like "##_*")
            If ok Then
                If Left$(nm, 2) <> "~$" And InStr(nm, ".") > 0 Then
                    If IstExcelDatei(nm) Then
                        If Not AusgemustertName(nm) And Not SpAusgeblendet(rel, ZahlOder(liste(k)(2), -1)) Then
                            ReDim Preserve dateien(0 To n)
                            dateien(n) = rel
                            n = n + 1
                        End If
                    End If
                End If
            End If
        Next k
        DateienSammeln = n
        Exit Function
    End If
    n = DateienEinesOrdners(ordner, "", dateien, n)
    Set jahre = New Collection
    eintrag = Dir(ordner & "*", vbDirectory)
    Do While Len(eintrag) > 0
        If eintrag Like "####" Then
            If (GetAttr(ordner & eintrag) And vbDirectory) = vbDirectory Then jahre.Add eintrag
        End If
        eintrag = Dir()
    Loop
    For Each j In jahre
        Set monate = New Collection
        eintrag = Dir(ordner & j & sep & "*", vbDirectory)
        Do While Len(eintrag) > 0
            If eintrag Like "##_*" Then
                If (GetAttr(ordner & j & sep & eintrag) And vbDirectory) = vbDirectory Then monate.Add eintrag
            End If
            eintrag = Dir()
        Loop
        For Each m In monate
            rel = j & sep & m & sep
            n = DateienEinesOrdners(ordner, rel, dateien, n)
        Next m
    Next j
    DateienSammeln = n
End Function

' Dateien aelteste zuerst: Datum am Anfang des Namens (JJJJMMTT_… wie in der Ablage und in den MIS-O-Abzuegen), sonst das
' Aenderungsdatum (SharePoint-Auflistung bzw. Dateisystem); gleiches Datum nach Name (OPAG vor Verbund). Nur fuer die Reihenfolge
' von Schritt 1 – verarbeitet wird ohnehin nach dem Stichtag im Blatt.
Private Sub DateienChronologisch(ordner As String, dateien() As String, n As Long)
    Dim schl() As String, i As Long, j As Long, t As String, k As String
    If n < 2 Then Exit Sub
    ReDim schl(0 To n - 1)
    For i = 0 To n - 1
        schl(i) = DateiSortSchluessel(ordner, dateien(i))
    Next i
    For i = 1 To n - 1                                       ' Einfuegesortierung (wenige hundert Dateien)
        t = dateien(i): k = schl(i)
        j = i - 1
        Do While j >= 0
            If StrComp(schl(j), k, vbTextCompare) <= 0 Then Exit Do
            dateien(j + 1) = dateien(j): schl(j + 1) = schl(j)
            j = j - 1
        Loop
        dateien(j + 1) = t: schl(j + 1) = k
    Next i
End Sub

' " · 03.10.2026", wenn der Dateiname mit JJJJMMTT beginnt (sonst leer) – fuer die Statuszeile von Schritt 1
Private Function DatumAusName(rel As String) As String
    Dim nm As String
    nm = DateiName(rel)
    If nm Like "20######*" Then
        If Mid$(nm, 5, 2) Like "[01]#" And Mid$(nm, 7, 2) Like "[0-3]#" Then DatumAusName = " · " & Mid$(nm, 7, 2) & "." & Mid$(nm, 5, 2) & "." & Left$(nm, 4)
    End If
End Function

Private Function DateiSortSchluessel(ordner As String, rel As String) As String
    Dim nm As String, d As Double, e As Variant
    nm = DateiName(rel)
    If nm Like "20######*" Then
        If Mid$(nm, 5, 2) Like "[01]#" And Mid$(nm, 7, 2) Like "[0-3]#" Then DateiSortSchluessel = Left$(nm, 8) & "|" & LCase$(nm): Exit Function
    End If
    On Error Resume Next
    If IstUrl(ordner) Then
        e = SpEintrag(PfadVon(ordner, rel))
        If IsArray(e) Then d = ZeitWert(e(1))
    Else
        d = CDbl(FileDateTime(ordner & rel))
    End If
    On Error GoTo 0
    If d > 0 Then
        DateiSortSchluessel = Format$(CDate(d), "yyyymmdd") & "|" & LCase$(nm)
    Else
        DateiSortSchluessel = "99999999|" & LCase$(nm)
    End If
End Function

Private Function DateienEinesOrdners(ordner As String, rel As String, dateien() As String, n As Long) As Long
    Dim datei As String
    datei = Dir(ordner & rel & "*.xls*")
    Do While Len(datei) > 0
        If Left$(datei, 2) <> "~$" And IstExcelDatei(datei) And Not AusgemustertName(datei) Then
            ReDim Preserve dateien(0 To n)
            dateien(n) = rel & datei
            n = n + 1
        End If
        datei = Dir()
    Loop
    DateienEinesOrdners = n
End Function

Private Function AbgelegtUndGeladen(rel As String, protokolliert As Object) As Boolean
    ' Abgelegte Datei JJJJMMTT_BUe_<Quelle>[_n].xlsx: Stand aus dem Namen; True, wenn er im Ladeprotokoll steht.
    ' Sammeldateien (JJJJMMTT-JJJJMMTT_…) werden geoeffnet, weil der Name nicht jeden Stichtag nennt.
    ' Vergleich ueber die Namensschluessel "@Quelle[_Einheit]|Tag", die ProtokollLesen zu jedem Stand mitfuehrt
    Dim tag As Date, quellen As Variant, teil As String, q As Variant, alle As Boolean
    If Not NameZerlegen(rel, tag, quellen, teil) Then Exit Function
    alle = True
    For Each q In quellen
        If Not protokolliert.Exists(NamensSchluessel(CStr(q), teil, tag)) Then alle = False
    Next q
    AbgelegtUndGeladen = alle
    Exit Function
Nein:
    AbgelegtUndGeladen = False
End Function

' Ist der Name schon vergeben (zweiter Abzug zum selben Stand), wird _2, _3 … angehaengt
Private Function FreierDateiname(ordner As String, wunsch As String) As String
    Dim basis As String, endung As String, i As Long, kand As String
    basis = Left$(wunsch, InStrRev(wunsch, ".") - 1)
    endung = Mid$(wunsch, InStrRev(wunsch, "."))
    kand = wunsch
    i = 1
    Do While DateiVorhanden(ordner & kand)
        i = i + 1
        kand = basis & "_" & i & endung
    Loop
    FreierDateiname = kand
End Function

' ---------------------------------------------------------------- Fremde Datei sicher oeffnen
Private Function IstExcelDatei(datei As String) As Boolean
    Select Case LCase$(Mid$(datei, InStrRev(datei, ".") + 1))
        Case "xlsx", "xlsm", "xlsb", "xls": IstExcelDatei = True
    End Select
End Function

' Stand(e) aus einem einheitlichen Dateinamen (siehe NameZerlegen). Nur Einzeldateien; Sammeldateien (JJJJMMTT-JJJJMMTT_…) und
' Staende, die schon geladen sind (dann greift die Ersatz-Logik mit dem Inhalt der Datei), werden geoeffnet, im Bereich MAKLER
' jede Datei (die Gruppe ergibt sich aus dem Inhalt, siehe unten).
Private Function StandAusName(rel As String, staende() As Stand, n As Long, geladenInfo As Object) As Boolean
    Dim tag As Date, quellen As Variant, teil As String, q As Variant, gruppe As String, st As Stand
    ' Bereich MAKLER: immer oeffnen. Die Gruppe im Namen stammt aus der Zuordnung OE -> Einheit beim Ablegen; nach einer Aenderung
    ' (Konfiguration!Q11:R40) und Neuaufbau faende StandDatenLesen kein Blatt dieser Gruppe mehr und das Laden braeche ab.
    If IstMakler() Then Exit Function
    If Not NameZerlegen(rel, tag, quellen, teil) Then Exit Function
    If Len(teil) > 0 Then Exit Function
    For Each q In quellen
        If geladenInfo.Exists(StandSchluessel(CStr(q), gruppe, tag)) Then Exit Function
    Next q
    For Each q In quellen
        st.Datei = rel: st.Blatt = "": st.Quelle = CStr(q): st.Gruppe = gruppe: st.DateiGruppe = gruppe: st.Stichtag = tag: st.Zeilen = 0: st.Ersetzen = False
        ReDim Preserve staende(0 To n)
        staende(n) = st
        n = n + 1
    Next q
    StandAusName = True
End Function

' Rohdatei oeffnen. SharePoint: beim ersten Mal ueber https und sofort als lokale Kopie in %TEMP% sichern; weitere Zugriffe in
' diesem Laden (Verarbeiten, Celonis) nehmen die Kopie – eine Datei wird so nur einmal ueber das Netz geholt.
Private Function QuelleOeffnenRel(ordner As String, rel As String) As Workbook
    Dim url As String, wb As Workbook, lokal As String
    If Not IstUrl(ordner) Then Set QuelleOeffnenRel = QuelleOeffnen(ordner & rel): Exit Function
    url = PfadVon(ordner, rel)
    lokal = CacheVon(url)
    If Len(lokal) > 0 Then Set QuelleOeffnenRel = QuelleOeffnen(lokal): Exit Function
    Set wb = QuelleOeffnen(url)
    CacheAblegen wb, url
    Set QuelleOeffnenRel = wb
End Function

Private Function CacheVon(url As String) As String
    On Error Resume Next
    If cacheDateien Is Nothing Then Exit Function
    If cacheDateien.Exists(LCase$(url)) Then
        If Len(Dir(CStr(cacheDateien(LCase$(url))))) > 0 Then CacheVon = CStr(cacheDateien(LCase$(url)))
    End If
End Function

Private Sub CacheAblegen(wb As Workbook, url As String)
    Dim lokal As String
    On Error GoTo Ende
    If cacheDateien Is Nothing Then Set cacheDateien = CreateObject("Scripting.Dictionary")
    If Len(cacheOrdner) = 0 Then
        cacheOrdner = Environ$("TEMP") & Application.PathSeparator & "BUE_Cache_" & Format$(Now, "yyyymmdd_hhnnss")
        If Len(Dir(cacheOrdner, vbDirectory)) = 0 Then MkDir cacheOrdner
    End If
    lokal = cacheOrdner & Application.PathSeparator & (cacheDateien.Count + 1) & "_" & DateiName(url)
    Application.DisplayAlerts = False
    wb.SaveCopyAs lokal
    Application.DisplayAlerts = True
    cacheDateien(LCase$(url)) = lokal
    Exit Sub
Ende:
    Application.DisplayAlerts = True
End Sub

' lokale Kopien am Ende des Ladens loeschen
Private Sub CacheAufraeumen()
    Dim k As Variant
    On Error Resume Next
    If Not cacheDateien Is Nothing Then
        For Each k In cacheDateien.Keys
            Kill CStr(cacheDateien(k))
        Next k
    End If
    If Len(cacheOrdner) > 0 Then RmDir cacheOrdner
    Set cacheDateien = Nothing
    cacheOrdner = ""
End Sub

Private Function QuelleOeffnen(pfad As String) As Workbook
    ' Ohne Makros (AutomationSecurity), ohne Dialoge, schreibgeschuetzt; bereits offene Datei wird nicht erneut geoeffnet
    Dim sicherheit As MsoAutomationSecurity, nm As String, wb As Workbook
    Dim fehlerNr As Long, fehlerText As String, versuch As Long
    nm = Mid$(pfad, InStrRev(Replace(pfad, "/", Application.PathSeparator), Application.PathSeparator) + 1)
    If IstUrl(pfad) Then nm = UrlDekodieren(nm)
    On Error Resume Next
    Set wb = Workbooks(nm)
    On Error GoTo 0
    If Not wb Is Nothing Then Err.Raise vbObjectError + 8, , "Die Datei " & nm & " ist bereits in Excel geöffnet. Bitte schließen und erneut laden."
    sicherheit = Application.AutomationSecurity
    Application.AutomationSecurity = msoAutomationSecurityForceDisable
    Application.DisplayAlerts = False
    ' SharePoint antwortet beim Massenladen gelegentlich kurz nicht (Fehler 1004 "kann nicht zugreifen"): bis zu drei
    ' weitere Versuche mit wachsender Pause, erst danach Abbruch
    For versuch = 1 To IIf(IstUrl(pfad), 4, 1)
        If versuch > 1 Then
            LogSchreiben "Öffnen von " & nm & " fehlgeschlagen (" & fehlerText & "), Versuch " & versuch & " von 4"
            Application.Wait Now + TimeSerial(0, 0, 3 * (versuch - 1))
        End If
        On Error Resume Next
        Err.Clear
        Set wb = Workbooks.Open(FileName:=pfad, UpdateLinks:=0, ReadOnly:=True, IgnoreReadOnlyRecommended:=True)
        fehlerNr = Err.Number: fehlerText = Err.Description
        On Error GoTo 0
        If fehlerNr = 0 Then Exit For
    Next versuch
    Application.DisplayAlerts = True
    Application.AutomationSecurity = sicherheit
    If fehlerNr <> 0 Then Err.Raise fehlerNr, , "Datei " & nm & " konnte nicht geöffnet werden: " & fehlerText & vbCrLf & _
        "(Aus dem Internet oder Teams heruntergeladene Dateien: Eigenschaften > 'Zulassen' setzen oder den Ordner als vertrauenswürdigen Speicherort eintragen.)"
    If wb Is Nothing Then Err.Raise vbObjectError + 9, , "Datei " & nm & " wurde in der geschützten Ansicht geöffnet und kann nicht gelesen werden."
    Set QuelleOeffnen = wb
End Function

' ---------------------------------------------------------------- Blatt erkennen
' straenge (optional): Einheit -> Zeilen. HS: eine leere Einheit; MAKLER mit Spalte OE_NR: jede Einheit aus Konfiguration!R11:R40,
' Zeilen anderer OEs zaehlen zur Haupteinheit des Blatts (HauptAusZaehlung); ohne Spalte OE_NR: die Gruppe aus der Kopfzeile.
Private Function BlattErkennen(ws As Worksheet, ByRef st As Stand, Optional straenge As Object) As Boolean
    Dim r As Long, c As Long, t As String, kopf As Long, letzteSpalte As Long
    Dim stichtag As Date, gefunden As Boolean, kopfdaten As Variant
    Dim zaehl As Object, rest As Long, mitOE As Boolean, haupt As String, u As Variant, hs As Long
    BlattErkennen = False
    blattNurHs = False
    If ws.UsedRange.Rows.Count < 3 Then Exit Function
    letzteSpalte = ws.UsedRange.Column + ws.UsedRange.Columns.Count - 1
    kopfdaten = ws.Range(ws.Cells(1, 1), ws.Cells(MAX_KOPFZEILEN, letzteSpalte)).Value2     ' MAX_KOPFZEILEN >= 2 -> immer 2D
    kopf = 0
    For r = 1 To MAX_KOPFZEILEN
        For c = 1 To letzteSpalte
            t = Trim$(CStr(Nz(kopfdaten(r, c))))
            If Not gefunden And InStr(1, t, "stichtag", vbTextCompare) > 0 Then
                stichtag = StichtagAusText(t)
                If stichtag > 0 Then gefunden = True
            End If
            If t = "Themenpostkorb" Then kopf = r
        Next c
        If kopf > 0 Then Exit For
    Next r
    If kopf = 0 Or Not gefunden Then Exit Function
    st.Stichtag = stichtag
    st.Zeilen = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1 - kopf
    st.Quelle = "Verbund"
    For c = 1 To letzteSpalte
        If UCase$(Trim$(CStr(Nz(kopfdaten(kopf, c))))) = "OPS_AUFTR_ID" Then st.Quelle = "OPAG"
    Next c
    st.DateiGruppe = ""
    Set zaehl = CreateObject("Scripting.Dictionary")
    If IstMakler() Then st.DateiGruppe = GruppeErkennen(ws, kopfdaten, kopf, letzteSpalte, zaehl, rest, mitOE, hs)
    ' Bereich MAKLER (12.91): nur Zeilen der HS-Einheit (OE HSB4 K) – ein HS-Abzug, kein Stand fuer das Makler-Reporting
    If hs > 0 And rest = 0 And Len(st.DateiGruppe) = 0 Then
        blattNurHs = True
        Exit Function
    End If
    st.Gruppe = st.DateiGruppe
    Set straenge = CreateObject("Scripting.Dictionary")
    If mitOE And zaehl.Count > 0 Then
        haupt = HauptAusZaehlung(zaehl)
        For Each u In zaehl.Keys
            straenge.Add CStr(u), CLng(zaehl(u))
        Next u
        straenge(haupt) = straenge(haupt) + rest
    ElseIf mitOE Then
        straenge.Add "", IIf(hs > 0, rest, st.Zeilen)
    Else
        straenge.Add st.DateiGruppe, st.Zeilen
    End If
    BlattErkennen = True
End Function

Public Function StichtagAusText(t As String) As Date
    ' "Rückstandsstichtag = Mittwoch, 23. September 2026" / "= 23. September 2026" / "= 23.09.2026" -> 23.09.2026
    Dim s As String, teile() As String, tag As Long, jahr As Long, monat As Long, i As Long
    Dim monate As Variant
    monate = Array("januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember")
    s = t
    If InStr(s, "=") > 0 Then s = Mid$(s, InStr(s, "=") + 1)
    If InStr(s, ",") > 0 Then s = Mid$(s, InStrRev(s, ",") + 1)
    s = Trim$(s)
    ' numerisches Datum dd.mm.yyyy
    teile = Split(s, ".")
    If UBound(teile) = 2 Then
        If IsNumeric(Trim$(teile(0))) And IsNumeric(Trim$(teile(1))) And IsNumeric(Trim$(teile(2))) Then
            If Len(Trim$(teile(2))) = 4 Then
                StichtagAusText = DateSerial(CLng(teile(2)), CLng(teile(1)), CLng(teile(0)))
                Exit Function
            End If
        End If
    End If
    s = Trim$(Replace(s, ".", " "))
    Do While InStr(s, "  ") > 0: s = Replace(s, "  ", " "): Loop
    teile = Split(s, " ")
    If UBound(teile) < 2 Then Exit Function
    If Not IsNumeric(teile(0)) Or Not IsNumeric(teile(2)) Then Exit Function
    tag = CLng(teile(0)): jahr = CLng(teile(2))
    For i = 0 To 11
        If LCase$(teile(1)) = monate(i) Then monat = i + 1
    Next i
    If monat = 0 Then Exit Function
    StichtagAusText = DateSerial(jahr, monat, tag)
End Function

' ---------------------------------------------------------------- Stand verarbeiten
' Blatt eines Stands oeffnen und die Datenzeilen unter der Kopfzeile lesen. sp(1..8) = Spalten VSS, Ordnungsbegriff,
' VORG_VERBU_LNR, Themenpostkorb, Rueckstandsalter, GEVO_SL, OPS_AUFTR_ID, OPS_ARBGUT_LNR, sp(9) = OE_NR, sp(10) = Verkettungskennzeichen
' (0 = fehlt). Ergebnis: Anzahl Zeilen.
' Fehlt das Blatt unter seinem Namen (Datei neu abgelegt), wird es ueber Quelle und Stichtag gesucht.
Private Function StandDatenLesen(ordner As String, st As Stand, ByRef daten As Variant, ByRef sp() As Long) As Long
    Dim wbQ As Workbook, ws As Worksheet, kopfdaten As Variant, w As Worksheet, pruef As Stand
    Dim kopf As Long, r As Long, c As Long, letzteZeile As Long, letzteSpalte As Long, letzte As Range
    Dim fehlerNr As Long, fehlerText As String, schl As String, pruefS As Object
    ' dasselbe Blatt eben schon gelesen (weitere Einheit derselben Datei, Ersetzen): nicht erneut oeffnen
    schl = LCase$(st.Datei) & "|" & st.Blatt & "|" & st.Quelle & "|" & CLng(st.Stichtag)
    If schl = lesenSchluessel And Len(lesenSchluessel) > 0 Then
        daten = lesenDaten
        sp = lesenSp
        StandDatenLesen = lesenZeilen
        Exit Function
    End If
    LesenVergessen
    ReDim sp(1 To 10)
    On Error GoTo Fehler
    LogSchreiben "  oeffne " & st.Datei
    Set wbQ = QuelleOeffnenRel(ordner, st.Datei)
    On Error Resume Next
    Set ws = wbQ.Worksheets(st.Blatt)
    On Error GoTo Fehler
    If ws Is Nothing Then
        For Each w In wbQ.Worksheets
            If BlattErkennen(w, pruef, pruefS) Then
                If pruef.Quelle = st.Quelle And CLng(pruef.Stichtag) = CLng(st.Stichtag) Then
                    If pruefS.Exists(st.Gruppe) Or pruef.DateiGruppe = st.Gruppe Then Set ws = w: Exit For
                End If
            End If
        Next w
        If ws Is Nothing Then Err.Raise vbObjectError + 10, , "Blatt für " & Strang(st.Quelle, st.Gruppe) & " " & Format(st.Stichtag, "dd.mm.yyyy") & " nicht gefunden"
        st.Blatt = ws.Name                                    ' gefundenes Blatt merken (Ladeprotokoll)
    End If
    letzteSpalte = ws.UsedRange.Column + ws.UsedRange.Columns.Count - 1
    LogSchreiben "  Blatt " & ws.Name & ", Spalten bis " & letzteSpalte
    kopfdaten = ws.Range(ws.Cells(1, 1), ws.Cells(MAX_KOPFZEILEN, letzteSpalte)).Value2
    For r = 1 To MAX_KOPFZEILEN
        For c = 1 To letzteSpalte
            If Trim$(CStr(Nz(kopfdaten(r, c)))) = "Themenpostkorb" Then kopf = r
        Next c
        If kopf > 0 Then Exit For
    Next r
    If kopf = 0 Then Err.Raise vbObjectError + 1, , "Kopfzeile mit 'Themenpostkorb' fehlt"
    For c = 1 To letzteSpalte
        Select Case UCase$(Trim$(CStr(Nz(kopfdaten(kopf, c)))))
            Case "VERWALTUNGSSYSTEMSCHLÜSSEL": sp(1) = c
            Case "ORDNUNGSBEGRIFF": sp(2) = c
            Case "VORG_VERBU_LNR": sp(3) = c
            Case "THEMENPOSTKORB": sp(4) = c
            Case "RÜCKSTANDSALTER_TAGE": sp(5) = c
            Case "GEVO_SL": sp(6) = c
            Case "OPS_AUFTR_ID": sp(7) = c
            Case "OPS_ARBGUT_LNR": sp(8) = c
            Case "OE_NR": sp(9) = c
            Case Else
                If InStr(1, CStr(Nz(kopfdaten(kopf, c))), "verkett", vbTextCompare) > 0 Then sp(10) = c   ' Verkettungskennzeichen
        End Select
    Next c
    If Not IstMakler() Then sp(9) = 0                     ' Einheit je Zeile nur im Bereich MAKLER
    LogSchreiben "  Spalten: VSS " & sp(1) & ", Ordnungsbegriff " & sp(2) & ", LNR " & sp(3) & ", Postkorb " & sp(4) & ", Alter " & sp(5) & _
                 ", GeVo " & sp(6) & ", Auftrag " & sp(7) & ", Arbeitsgut " & sp(8) & ", OE " & sp(9) & ", Verkettung " & sp(10)
    If sp(1) = 0 Or sp(2) = 0 Or sp(3) = 0 Or sp(4) = 0 Or sp(5) = 0 Or sp(6) = 0 Then
        Err.Raise vbObjectError + 1, , "Spaltenköpfe unvollständig, es fehlt: " & Mid$( _
            IIf(sp(1) = 0, ", Verwaltungssystemschlüssel", "") & IIf(sp(2) = 0, ", Ordnungsbegriff", "") & IIf(sp(3) = 0, ", VORG_VERBU_LNR", "") & _
            IIf(sp(4) = 0, ", Themenpostkorb", "") & IIf(sp(5) = 0, ", Rückstandsalter_Tage", "") & IIf(sp(6) = 0, ", GEVO_SL", ""), 3)
    End If
    ' letzte belegte Zeile auch bei ausgeblendeten/gefilterten Zeilen
    Set letzte = ws.Columns(sp(1)).Find(What:="*", LookIn:=xlValues, SearchOrder:=xlByRows, SearchDirection:=xlPrevious)
    If letzte Is Nothing Then letzteZeile = kopf Else letzteZeile = letzte.Row
    If letzteZeile > kopf Then
        LogSchreiben "  lese Zeilen " & (kopf + 1) & " bis " & letzteZeile
        daten = ws.Range(ws.Cells(kopf + 1, 1), ws.Cells(letzteZeile, letzteSpalte)).Value2
        StandDatenLesen = letzteZeile - kopf
    End If
    wbQ.Close SaveChanges:=False
    Set wbQ = Nothing
    LogSchreiben "  Quelle geschlossen"
    lesenSchluessel = schl
    lesenDaten = daten
    lesenSp = sp
    lesenZeilen = StandDatenLesen
    Exit Function
Fehler:
    fehlerNr = Err.Number: fehlerText = Err.Description
    On Error Resume Next
    If Not wbQ Is Nothing Then wbQ.Close SaveChanges:=False
    On Error GoTo 0
    Err.Raise fehlerNr, "StandDatenLesen", fehlerText & " (" & st.Datei & " / " & st.Blatt & ")"
End Function

Private Sub LesenVergessen()
    lesenSchluessel = ""
    lesenDaten = Empty
    lesenZeilen = 0
End Sub

' Schluessel eines Datensatzes (Verbund: VSS + Ordnungsbegriff + LNR; OPAG zusaetzlich Auftrag und Arbeitsgut)
Private Function DatensatzSchluessel(daten As Variant, r As Long, sp() As Long, quelle As String) As String
    Dim key As String
    ' Fehlt eine OPAG-Spalte im Abzug (Spalte 0), bleibt ihr Teil leer statt Laufzeitfehler 9
    key = Sauber(daten(r, sp(1))) & TRENNER & Sauber(daten(r, sp(2))) & TRENNER & Sauber(daten(r, sp(3)))
    If quelle = "OPAG" Then key = key & TRENNER & Feld(daten, r, sp(7)) & TRENNER & Feld(daten, r, sp(8))
    DatensatzSchluessel = key
End Function

Private Function Feld(daten As Variant, r As Long, c As Long) As String
    If c > 0 Then Feld = Sauber(daten(r, c))
End Function

Private Sub StandVerarbeiten(ordner As String, st As Stand)
    Dim b(0 To 0) As Stand
    b(0) = st
    StaendeVerarbeiten ordner, b, 1
End Sub

' Staende einer Quelle und eines Stichtags gemeinsam verarbeiten: b(0..m-1), je Einheit (Strang) einer, aus einer oder mehreren
' Dateien. Jede Einheit wird mit ihrem eigenen Vortag (Snapshot) verglichen. Wechselt ein Vorgang zwischen zwei Einheiten dieses
' Stichtags, ist das eine Umbuchung (Blatt Umbuchungen), kein Abgang und Eingang. Zeilen einer Datei, deren Einheit nicht in b
' steht (anderer Strang, z. B. schon geladen), bleiben hier aussen vor.
Private Sub StaendeVerarbeiten(ordner As String, b() As Stand, m As Long)
    Dim daten As Variant, sp() As Long, r As Long, x As Long, y As Long
    Dim cVss As Long, cPk As Long, cAlt As Long, cGevo As Long
    Dim sparten As Object, alt As Object, altIdx As Object, neuE As Object, neuAlle As Object, agg As Object, umb As Object
    Dim erster As Object, zz As Object, gelesen As Object, dieseDatei As Object, snap As Object, vorher As Variant
    Dim key As String, vss As String, sparte As String, pk As String, gevo As String, typ As String, nr As Long, einheit As String
    Dim aggKey As String, umbKey As String, werte As Variant, k As Variant, sg As String, haupt As String, dk As String, z As Variant
    Dim quelle As String, stichtag As Date, nZeilen As Long, verk As Boolean, hinweis As String, hsBl As Long, ks As Variant

    quelle = b(0).Quelle: stichtag = b(0).Stichtag
    Set sparten = SpartenZuordnung()
    Set alt = CreateObject("Scripting.Dictionary")        ' Strang -> Schluessel des Vortags (leer beim ersten Stand)
    Set erster = CreateObject("Scripting.Dictionary")     ' Strang -> True beim ersten Stand dieser Einheit
    Set altIdx = CreateObject("Scripting.Dictionary")     ' Schluessel -> Strang am Vortag (ueber alle Straenge dieses Stichtags)
    Set neuE = CreateObject("Scripting.Dictionary")       ' Strang -> heutige Schluessel (neuer Snapshot)
    Set neuAlle = CreateObject("Scripting.Dictionary")    ' Schluessel -> Strang heute
    Set agg = CreateObject("Scripting.Dictionary")
    Set umb = CreateObject("Scripting.Dictionary")
    Set zz = CreateObject("Scripting.Dictionary")         ' Strang -> Array(Saetze, Rueckstand, Eingang, Abgang, nicht fuehrend, Spalte Verkettung, Blatt leer, HS-Zeilen)
    Set gelesen = CreateObject("Scripting.Dictionary")
    For x = 0 To m - 1
        sg = b(x).Gruppe
        Set snap = SnapshotLesen(quelle, sg)               ' Nothing beim ersten Stand dieser Quelle und Einheit
        If snap Is Nothing Then
            erster.Add sg, True
            Set snap = CreateObject("Scripting.Dictionary")
        End If
        alt.Add sg, snap
        For Each k In snap.Keys
            If Not altIdx.Exists(k) Then altIdx.Add k, sg
        Next k
        neuE.Add sg, CreateObject("Scripting.Dictionary")
        zz.Add sg, Array(0, 0, 0, 0, 0, False, True, 0)
    Next x

    ' Rueckstand, Altersklassen, Eingaenge (Schluessel der Fakten: Sparte|VSS|Postkorb|GeVo|Einheit|Strang)
    ' Verkettete, nicht fuehrende Vorgaenge zaehlen nicht (wie im MIS-O-Bericht: Verkettungskennzeichen = verkettet, fuehrend /
    ' nicht verkettet) – nur wenn der Abzug die Spalte Verkettungskennzeichen enthaelt
    For x = 0 To m - 1
        dk = LCase$(b(x).Datei) & "|" & b(x).Blatt
        If Not gelesen.Exists(dk) Then
            gelesen.Add dk, True
            Set dieseDatei = CreateObject("Scripting.Dictionary")     ' Straenge dieses Blatts in b
            For y = x To m - 1
                If LCase$(b(y).Datei) & "|" & b(y).Blatt = dk Then dieseDatei(b(y).Gruppe) = True
            Next y
            nZeilen = StandDatenLesen(ordner, b(x), daten, sp)
            If nZeilen > 0 Then
                cVss = sp(1): cPk = sp(4): cAlt = sp(5): cGevo = sp(6)
                haupt = HauptStrang(daten, sp)
                LogSchreiben "  zaehle " & Join(dieseDatei.Keys, ", ")
                For Each k In dieseDatei.Keys
                    z = zz(k): z(5) = (sp(10) > 0): z(6) = False: zz(k) = z
                Next k
                hsBl = 0
                For r = 1 To UBound(daten, 1)
                    vss = Sauber(daten(r, cVss))
                    If Len(vss) > 0 Then
                        If sp(9) = 0 Then
                            sg = b(x).Gruppe
                        ElseIf IstHsEinheit(ZeilenEinheit(daten, r, sp)) Then
                            sg = vbNullChar                            ' Zeile der HS-Einheit (OE HSB4 K, 12.91): gehoert ins HS-Reporting
                            hsBl = hsBl + 1
                        Else
                            sg = ZeileStrang(daten, r, sp, haupt)
                        End If
                        If Not dieseDatei.Exists(sg) Then
                            vss = ""
                        ElseIf NichtFuehrend(daten, r, sp) Then
                            vss = ""
                            z = zz(sg): z(4) = z(4) + 1: zz(sg) = z
                        End If
                    End If
                    If Len(vss) > 0 Then
                        key = DatensatzSchluessel(daten, r, sp, quelle)
                        If Not neuAlle.Exists(key) Then                ' derselbe Vorgang zweimal (zwei Dateien): einmal zaehlen
                            z = zz(sg): z(0) = z(0) + 1: zz(sg) = z
                            If sparten.Exists(vss) Then sparte = sparten(vss) Else sparte = "Sonstige"
                            pk = PostkorbNorm(CStr(Nz(daten(r, cPk))))
                            gevo = Verdichten(CStr(Nz(daten(r, cGevo))))
                            einheit = ZeilenEinheit(daten, r, sp)
                            aggKey = sparte & TRENNER & vss & TRENNER & pk & TRENNER & gevo & TRENNER & einheit & TRENNER & sg
                            If Not agg.Exists(aggKey) Then agg.Add aggKey, Array(0, 0, 0, 0, 0, 0, 0, 0, "", 0)
                            werte = agg(aggKey)
                            werte(0) = werte(0) + 1
                            werte(3 + AlterKlasse(daten(r, cAlt))) = werte(3 + AlterKlasse(daten(r, cAlt))) + 1
                            If IsNumeric(daten(r, cAlt)) And Not IsEmpty(daten(r, cAlt)) Then
                                If CDbl(daten(r, cAlt)) > werte(7) Or CStr(werte(8)) = "" Then werte(7) = CDbl(daten(r, cAlt)): werte(8) = key   ' aeltester Datensatz
                                werte(9) = werte(9) + CDbl(daten(r, cAlt))           ' Summe fuer das Ø Alter (ohne Alter zaehlt der Satz mit 0 Tagen)
                            End If
                            vorher = Empty
                            If erster.Exists(sg) Then
                                ' erster Stand dieser Einheit: keine Eingaenge
                            ElseIf alt.Item(sg).Exists(key) Then
                                Set snap = alt.Item(sg)
                                vorher = snap.Item(key)
                            ElseIf altIdx.Exists(key) Then
                                Set snap = alt.Item(CStr(altIdx(key)))
                                vorher = snap.Item(key)                         ' gestern in einer anderen Einheit dieses Stichtags
                            Else
                                werte(1) = werte(1) + 1
                            End If
                            ' Umbuchung: gestern in einem anderen Themenpostkorb, GeVo oder einer anderen Einheit (Blatt Umbuchungen, beruehrt Fakten nicht)
                            If IsArray(vorher) Then
                                If CStr(vorher(2)) <> pk Or CStr(vorher(3)) <> gevo Or CStr(vorher(4)) <> einheit Then
                                    umbKey = sparte & TRENNER & CStr(vorher(2)) & TRENNER & CStr(vorher(3)) & TRENNER & pk & TRENNER & gevo & _
                                             TRENNER & CStr(vorher(4)) & TRENNER & einheit & TRENNER & sg
                                    If umb.Exists(umbKey) Then umb(umbKey) = umb(umbKey) + 1 Else umb.Add umbKey, 1
                                End If
                            End If
                            agg(aggKey) = werte
                            neuAlle.Add key, sg
                            Set snap = neuE.Item(sg)
                            snap.Add key, Array(sparte, vss, pk, gevo, einheit)
                        End If
                    End If
                Next r
                If hsBl > 0 Then                                       ' im Ladeprotokoll beim Hauptstrang des Blatts vermerken
                    hsZeilen = hsZeilen + hsBl
                    If dieseDatei.Exists(haupt) Then
                        sg = haupt
                    Else
                        ks = dieseDatei.Keys
                        sg = CStr(ks(0))
                    End If
                    z = zz(sg): z(7) = z(7) + hsBl: zz(sg) = z
                    LogSchreiben "  " & hsBl & " Zeilen der HS-Einheit (OE HSB4 K) ignoriert"
                End If
            End If
            Erase sp
            daten = Empty
        End If
    Next x

    ' Abgaenge: Schluessel des Vortags, die heute in keiner Einheit dieses Stichtags mehr stehen – zugeordnet nach den
    ' Vortagsmerkmalen; nur fuer Einheiten mit Datensaetzen (ein leeres Blatt ist kein Abbau auf null)
    For x = 0 To m - 1
        sg = b(x).Gruppe
        z = zz(sg)
        If Not erster.Exists(sg) And z(0) > 0 Then
            Set snap = alt.Item(sg)
            For Each k In snap.Keys
                If Not neuAlle.Exists(k) Then
                    werte = snap.Item(k)
                    aggKey = werte(0) & TRENNER & werte(1) & TRENNER & werte(2) & TRENNER & werte(3) & TRENNER & werte(4) & TRENNER & sg
                    If Not agg.Exists(aggKey) Then agg.Add aggKey, Array(0, 0, 0, 0, 0, 0, 0, 0, "", 0)
                    werte = agg(aggKey)
                    werte(2) = werte(2) + 1
                    agg(aggKey) = werte
                End If
            Next k
        End If
    Next x

    ' Fakten schreiben (ein Block), Formelspalten P/Q aus Zeile 2 fortschreiben, R Einheit, S Strang
    Dim wsF As Worksheet, start As Long, aus() As Variant, ausE() As Variant, i As Long, teile() As String, neuePostkoerbe As Object
    Set wsF = ThisWorkbook.Worksheets("Fakten")
    Set neuePostkoerbe = CreateObject("Scripting.Dictionary")
    start = wsF.Cells(wsF.Rows.Count, 1).End(xlUp).Row + 1
    If agg.Count > 0 Then
        If start + agg.Count - 1 > FAKTEN_MAX Then Err.Raise vbObjectError + 2, , "Das Blatt Fakten ist voll (mehr als " & FAKTEN_MAX & " Zeilen). Bitte im Cockpit „Zurücksetzen …“ und die Abzüge neu laden."
        ReDim aus(1 To agg.Count, 1 To 15)
        ReDim ausE(1 To agg.Count, 1 To 5)
    End If
    i = 0
    For Each k In agg.Keys
        i = i + 1
        teile = Split(k, TRENNER)
        werte = agg(k)
        GevoTyp teile(3), typ, nr
        aus(i, 1) = stichtag: aus(i, 2) = quelle: aus(i, 3) = teile(0): aus(i, 4) = teile(1)
        aus(i, 5) = teile(2): aus(i, 6) = teile(3): aus(i, 7) = typ: aus(i, 8) = nr
        aus(i, 9) = werte(0): aus(i, 10) = werte(1): aus(i, 11) = werte(2)
        aus(i, 12) = werte(3): aus(i, 13) = werte(4): aus(i, 14) = werte(5): aus(i, 15) = werte(6)
        ausE(i, 1) = teile(4): ausE(i, 2) = teile(5): ausE(i, 3) = werte(7): ausE(i, 4) = werte(8): ausE(i, 5) = werte(9)
        z = zz(teile(5))
        z(1) = z(1) + werte(0): z(2) = z(2) + werte(1): z(3) = z(3) + werte(2)
        zz(teile(5)) = z
        If Not neuePostkoerbe.Exists(teile(2)) Then neuePostkoerbe.Add teile(2), True
    Next k
    LogSchreiben "  gezaehlt: " & agg.Count & " Faktenzeilen; schreibe ab Fakten-Zeile " & start
    ' Protokoll zuerst (je Einheit eine Zeile): ein Abbruch danach hinterlaesst keinen unprotokollierten Halbstand
    For x = 0 To m - 1
        sg = b(x).Gruppe
        z = zz(sg)
        verk = z(5)
        If z(6) Then
            Protokoll b(x), 0, 0, 0, 0, "keine Datensätze unter der Kopfzeile"
        ElseIf z(0) = 0 Then
            Protokoll b(x), 0, 0, 0, 0, "keine Datensätze mit Verwaltungssystemschlüssel" & VerkettungText(verk, CLng(z(4)), True) & HsText(CLng(z(7)))
        ElseIf erster.Exists(sg) Then
            If Len(sg) > 0 Then hinweis = "erster Stand dieser Einheit (" & sg & ")" Else hinweis = "erster Stand dieser Quelle"
            Protokoll b(x), CLng(z(0)), CLng(z(1)), 0, 0, hinweis & " – Eingänge und Abgänge ab dem nächsten Stichtag" & VerkettungText(verk, CLng(z(4)), True) & HsText(CLng(z(7)))
        Else
            Protokoll b(x), CLng(z(0)), CLng(z(1)), CLng(z(2)), CLng(z(3)), VerkettungText(verk, CLng(z(4)), False) & HsText(CLng(z(7)))
        End If
        LogSchreiben "  " & Strang(quelle, sg) & ": " & z(0) & " Saetze, Rueckstand " & z(1) & ", Ein " & z(2) & ", Abg " & z(3)
    Next x
    If agg.Count = 0 Then Exit Sub
    wsF.Range(wsF.Cells(start, 1), wsF.Cells(start + agg.Count - 1, 15)).Value = aus
    wsF.Range(wsF.Cells(start, 1), wsF.Cells(start + agg.Count - 1, 1)).NumberFormat = "dd.mm.yyyy"
    wsF.Range(wsF.Cells(start, SP_VORGANG_F), wsF.Cells(start + agg.Count - 1, SP_VORGANG_F)).NumberFormat = "@"
    wsF.Range(wsF.Cells(start, SP_EINHEIT_F), wsF.Cells(start + agg.Count - 1, SP_ALTSUM_F)).Value = ausE
    LogSchreiben "  Fakten geschrieben, Formelspalte"
    wsF.Range(wsF.Cells(start, FAKTEN_SPALTEN), wsF.Cells(start + agg.Count - 1, FAKTEN_SPALTEN)).FormulaR1C1 = wsF.Cells(2, FAKTEN_SPALTEN).FormulaR1C1   ' relative Bezuege je Zeile
    wsF.Range(wsF.Cells(start, FAKTEN_SPALTEN + 1), wsF.Cells(start + agg.Count - 1, FAKTEN_SPALTEN + 1)).FormulaR1C1 = wsF.Cells(2, FAKTEN_SPALTEN + 1).FormulaR1C1   ' Standard
    UmbuchungenSchreiben b(0), umb
    LogSchreiben "  Postkoerbe"
    PostkoerbeRegistrieren neuePostkoerbe
    LogSchreiben "  Snapshot"
    Set snap = CreateObject("Scripting.Dictionary")
    For x = 0 To m - 1
        z = zz(b(x).Gruppe)
        If z(0) > 0 Then snap.Add b(x).Gruppe, neuE.Item(b(x).Gruppe)
    Next x
    If snap.Count > 0 Then SnapshotErsetzen quelle, stichtag, snap
    LogSchreiben "  Verlauf"
    VerlaufErgaenzen stichtag, start - 1, start + agg.Count - 2
End Sub

' Einheiten eines Stapels fuer Statuszeile und Log ("MSUE+ODPB"), leer im Bereich HS
Private Function StapelText(b() As Stand, m As Long) As String
    Dim x As Long
    For x = 0 To m - 1
        If Len(b(x).Gruppe) > 0 Then StapelText = StapelText & IIf(Len(StapelText) > 0, "+", "") & b(x).Gruppe
    Next x
End Function

' Umbuchungen eines Stands an das Blatt Umbuchungen anhaengen: je Paar (vorher, heute) eine Zeile mit Anzahl; die Formelspalten
' K..P (Filterkennzeichen vorher/heute) werden aus Zeile 2 fortgeschrieben – Spalte fuer Spalte wie in Fakten; Q Einheit heute,
' R Gruppe, S Einheit vorher.
Private Sub UmbuchungenSchreiben(st As Stand, umb As Object)
    Dim ws As Worksheet, start As Long, n As Long, aus() As Variant, k As Variant, teile() As String, i As Long, c As Long
    Dim typ As String, nr As Long, summe As Long, ausE() As Variant
    n = umb.Count
    If n = 0 Then
        LogSchreiben "  Umbuchungen: 0"
        Exit Sub
    End If
    Set ws = ThisWorkbook.Worksheets("Umbuchungen")
    start = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If start + n - 1 > UMB_MAX Then Err.Raise vbObjectError + 4, , "Das Blatt Umbuchungen ist voll (mehr als " & UMB_MAX & " Zeilen)."
    ReDim aus(1 To n, 1 To 10)
    ReDim ausE(1 To n, 1 To 3)
    For Each k In umb.Keys
        i = i + 1
        teile = Split(k, TRENNER)
        ausE(i, 1) = teile(6): ausE(i, 2) = teile(7): ausE(i, 3) = teile(5)      ' Einheit heute, Strang, Einheit vorher
        aus(i, 1) = st.Stichtag: aus(i, 2) = st.Quelle: aus(i, 3) = teile(0)
        GevoTyp teile(2), typ, nr
        aus(i, 4) = teile(1): aus(i, 5) = typ: aus(i, 6) = nr
        GevoTyp teile(4), typ, nr
        aus(i, 7) = teile(3): aus(i, 8) = typ: aus(i, 9) = nr
        aus(i, 10) = umb(k)
        summe = summe + umb(k)
    Next k
    ws.Range(ws.Cells(start, 1), ws.Cells(start + n - 1, 10)).Value = aus
    ws.Range(ws.Cells(start, 1), ws.Cells(start + n - 1, 1)).NumberFormat = "dd.mm.yyyy"
    ws.Range(ws.Cells(start, SP_EINHEIT_U), ws.Cells(start + n - 1, SP_EINHEIT_VOR_U)).Value = ausE
    For c = 11 To 16
        ws.Range(ws.Cells(start, c), ws.Cells(start + n - 1, c)).FormulaR1C1 = ws.Cells(2, c).FormulaR1C1
    Next c
    LogSchreiben "  Umbuchungen: " & summe & " Faelle in " & n & " Zeilen"
End Sub

' Umbuchungen einer Quelle (und Gruppe, Spalte R) ab einem Stichtag entfernen (beim Ersetzen eines Stands), Rest rueckt auf
Private Sub UmbuchungenEntfernen(quelle As String, einheit As String, abTag As Date)
    Dim ws As Worksheet, letzte As Long, blk As Variant, ein As Variant, aus() As Variant, ausE() As Variant, i As Long, m As Long, c As Long, ab As Double
    Set ws = ThisWorkbook.Worksheets("Umbuchungen")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 2 Then Exit Sub
    ab = CDbl(CLng(abTag))
    blk = ws.Range(ws.Cells(2, 1), ws.Cells(letzte + 1, 10)).Value2          ' +1: immer zweidimensional
    ein = ws.Range(ws.Cells(2, SP_EINHEIT_U), ws.Cells(letzte + 1, SP_EINHEIT_VOR_U)).Value2       ' Q..S
    ReDim aus(1 To UBound(blk, 1), 1 To 10)
    ReDim ausE(1 To UBound(blk, 1), 1 To 3)
    For i = 1 To UBound(blk, 1) - 1
        If Not (Val(blk(i, 1)) >= ab And CStr(Nz(blk(i, 2))) = quelle And CStr(Nz(ein(i, 2))) = einheit) Then
            m = m + 1
            For c = 1 To 10
                aus(m, c) = blk(i, c)
            Next c
            For c = 1 To 3
                ausE(m, c) = ein(i, c)
            Next c
        End If
    Next i
    ws.Range(ws.Cells(2, 1), ws.Cells(letzte, 10)).ClearContents
    ws.Range(ws.Cells(2, SP_EINHEIT_U), ws.Cells(letzte, SP_EINHEIT_VOR_U)).ClearContents
    If m > 0 Then
        ws.Range(ws.Cells(2, 1), ws.Cells(m + 1, 10)).Value2 = aus
        ws.Range(ws.Cells(2, SP_EINHEIT_U), ws.Cells(m + 1, SP_EINHEIT_VOR_U)).Value2 = ausE
    End If
End Sub

' Kachel „Eingänge und Abgänge“: Standard ist Verbund. Liegt der letzte Verbund-Stand mehr als 2 Tage hinter dem letzten
' OPAG-Stand (Verbund liefert laenger nichts), zeigt die Kachel nach dem Laden OPAG. Die Chips oben in der Kachel schalten
' danach wie gewohnt um.
Private Sub QuelleBewegungenWaehlen()
    Dim tagOpag As Date, tagVerbund As Date, q As String
    tagOpag = LetzterStandQuelle("OPAG"): tagVerbund = LetzterStandQuelle("Verbund")
    If tagOpag > 0 And (tagVerbund = 0 Or CLng(tagOpag) - CLng(tagVerbund) > 2) Then q = "OPAG" Else q = "Verbund"
    ThisWorkbook.Worksheets("Filter").Range("L13").Value = q
    LogSchreiben "Eingänge/Abgänge zeigen " & q & " (letzter Stand OPAG " & Format(tagOpag, "dd.mm.yyyy") & ", Verbund " & Format(tagVerbund, "dd.mm.yyyy") & ")"
End Sub

' ---------------------------------------------------------------- Stand ersetzen
' Ersetzt einen geladenen Stand durch die neue Datei st. Vorab (ohne etwas zu aendern) wird geprueft und gelesen: der Stand
' davor (Vergleichsbasis fuer Eingaenge/Abgaenge, aus seiner Datei) und die Dateien aller spaeteren Staende dieser Quelle.
' Dann: Fakten der Quelle ab dem Stichtag entfernen, alte Protokollzeilen als "ersetzt" markieren, Snapshot auf den Stand
' davor setzen, den neuen Stand und danach die spaeteren Staende in zeitlicher Reihenfolge neu verarbeiten.
' Ergebnis: Anzahl der danach neu gerechneten spaeteren Staende.
' einfuegen (12.88, Nachzuegler im Bereich MAKLER): es gibt noch keinen Stand zu diesem Stichtag; derselbe Weg fuegt ihn ein und
' rechnet die spaeteren Staende der Einheit nach. Fehlt dabei eine Rohdatei, Ergebnis -1 (nichts geaendert, Aufrufer ueberspringt).
' Alles je Strang (Einheit): Zeilen anderer Einheiten derselben Dateien bleiben unberuehrt.
Private Function StandErsetzen(ordner As String, st As Stand, geladenInfo As Object, einfuegen As Boolean) As Long
    Dim alle() As Stand, n As Long, i As Long, vorher As Long, spaeter As Long
    Dim basis As Object, daten As Variant, sp() As Long, sparten As Object, r As Long, key As String, vss As String, sparte As String
    Dim alteDatei As String, info As Variant, zeit As String, haupt As String, sg As String

    ' geladene Staende dieser Quelle (gueltige Protokollzeilen), zeitlich sortiert
    n = GeladeneStaende(st.Quelle, st.Gruppe, alle)
    vorher = -1
    For i = 0 To n - 1
        If CLng(alle(i).Stichtag) < CLng(st.Stichtag) Then vorher = i
    Next i
    ' Dateien pruefen, bevor etwas geaendert wird
    For i = 0 To n - 1
        If CLng(alle(i).Stichtag) > CLng(st.Stichtag) Or i = vorher Then
            alle(i).Datei = StandDatei(ordner, alle(i))
            If Len(alle(i).Datei) = 0 And einfuegen Then
                LogSchreiben "  nicht nachtragbar: Rohdatei von " & Strang(alle(i).Quelle, alle(i).Gruppe) & " " & Format(alle(i).Stichtag, "dd.mm.yyyy") & " fehlt"
                StandErsetzen = -1
                Exit Function
            End If
            If Len(alle(i).Datei) = 0 Then Err.Raise vbObjectError + 11, , "Ersetzen nicht möglich: die Rohdatei des Stands " & _
                Strang(alle(i).Quelle, alle(i).Gruppe) & " " & Format(alle(i).Stichtag, "dd.mm.yyyy") & " liegt nicht mehr im Ordner Rohdaten (oder der Ablage). Der alte Stand bleibt."
        End If
    Next i
    LogSchreiben "  pruefe neue Datei"
    If StandDatenLesen(ordner, st, daten, sp) = 0 Then Err.Raise vbObjectError + 12, , "Ersetzen nicht möglich: die neue Datei " & st.Datei & " enthält keine Datensätze. Der alte Stand bleibt."
    Erase daten
    ' Vergleichsbasis: Schluessel des Stands davor
    If vorher >= 0 Then
        LogSchreiben "  lese Vergleichsbasis " & Format(alle(vorher).Stichtag, "dd.mm.yyyy") & " aus " & alle(vorher).Datei
        Set sparten = SpartenZuordnung()
        Set basis = CreateObject("Scripting.Dictionary")
        If StandDatenLesen(ordner, alle(vorher), daten, sp) > 0 Then
            haupt = HauptStrang(daten, sp)
            For r = 1 To UBound(daten, 1)
                vss = Sauber(daten(r, sp(1)))
                If Len(vss) > 0 And sp(9) > 0 Then                ' nur die Zeilen dieser Einheit
                    sg = ZeileStrang(daten, r, sp, haupt)
                    If sg <> st.Gruppe Then vss = ""
                End If
                If Len(vss) > 0 Then
                    If NichtFuehrend(daten, r, sp) Then vss = ""
                End If
                If Len(vss) > 0 Then
                    key = DatensatzSchluessel(daten, r, sp, st.Quelle)
                    If sparten.Exists(vss) Then sparte = sparten(vss) Else sparte = "Sonstige"
                    If Not basis.Exists(key) Then basis.Add key, Array(sparte, vss, PostkorbNorm(CStr(Nz(daten(r, sp(4))))), Verdichten(CStr(Nz(daten(r, sp(6))))), _
                                                                     ZeilenEinheit(daten, r, sp))
                End If
            Next r
        End If
        Erase daten
    End If
    If geladenInfo.Exists(StandSchluessel(st.Quelle, st.Gruppe, st.Stichtag)) And Not einfuegen Then
        info = geladenInfo(StandSchluessel(st.Quelle, st.Gruppe, st.Stichtag))
        alteDatei = CStr(info(1))
    End If

    ' ab hier wird geaendert
    zeit = Format(Now, "dd.mm.yyyy hh:nn")
    FaktenEntfernen st.Quelle, st.Gruppe, st.Stichtag
    UmbuchungenEntfernen st.Quelle, st.Gruppe, st.Stichtag
    If einfuegen Then
        ProtokollErsetztMarkieren st.Quelle, st.Gruppe, st.Stichtag, "neu gerechnet am " & zeit & " (Stand " & Format(st.Stichtag, "dd.mm.yyyy") & " nachgereicht)"
    Else
        ProtokollErsetztMarkieren st.Quelle, st.Gruppe, st.Stichtag, "ersetzt am " & zeit & " (neue Datei " & st.Datei & ")"
    End If
    If vorher >= 0 Then
        SnapshotSchreiben st.Quelle, st.Gruppe, alle(vorher).Stichtag, basis
    Else
        SnapshotSchreiben st.Quelle, st.Gruppe, 0, CreateObject("Scripting.Dictionary")
    End If
    StandVerarbeiten ordner, st
    For i = 0 To n - 1
        If CLng(alle(i).Stichtag) > CLng(st.Stichtag) Then
            modFortschritt.FortschrittSetzen ladeAnteil, "Danach neu rechnen: " & Format$(alle(i).Stichtag, "dd.mm.yyyy") & " · " & Strang(alle(i).Quelle, alle(i).Gruppe), DateiName(alle(i).Datei)
            LogSchreiben "  rechne nach: " & Strang(alle(i).Quelle, alle(i).Gruppe) & " " & Format(alle(i).Stichtag, "dd.mm.yyyy") & " aus " & alle(i).Datei
            StandVerarbeiten ordner, alle(i)
            spaeter = spaeter + 1
        End If
    Next i
    VerlaufGrenzenNeu
    ' alte Rohdatei als ersetzt kennzeichnen (nur Einzeldateien; Sammeldateien enthalten weitere Staende)
    AlteDateiAusmustern ordner, alteDatei, st.Datei
    StandErsetzen = spaeter
End Function

' Gueltig geladene Staende einer Quelle (und Einheit) aus dem Ladeprotokoll (Hinweis leer oder "erster Stand …"), nach Stichtag sortiert
Private Function GeladeneStaende(quelle As String, einheit As String, alle() As Stand) As Long
    Dim ws As Worksheet, letzte As Long, daten As Variant, r As Long, n As Long, hinweis As String, i As Long, j As Long, t As Stand
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Function
    daten = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, SP_GRUPPE_L)).Value2       ' +1: immer zweidimensional
    For r = 1 To UBound(daten, 1)
        If IsNumeric(daten(r, 5)) And Not IsEmpty(daten(r, 5)) And CStr(Nz(daten(r, 4))) = quelle And CStr(Nz(daten(r, SP_GRUPPE_L))) = einheit Then
            hinweis = CStr(Nz(daten(r, 10)))
            If StandGueltig(hinweis) Then
                ReDim Preserve alle(0 To n)
                alle(n).Datei = CStr(Nz(daten(r, 2)))
                alle(n).Blatt = CStr(Nz(daten(r, 3)))
                alle(n).Quelle = quelle
                alle(n).Gruppe = einheit
                alle(n).Stichtag = CDate(daten(r, 5))
                n = n + 1
            End If
        End If
    Next r
    For i = 0 To n - 2
        For j = i + 1 To n - 1
            If alle(j).Stichtag < alle(i).Stichtag Then t = alle(i): alle(i) = alle(j): alle(j) = t
        Next j
    Next i
    GeladeneStaende = n
End Function

' Geladene Staende (Quelle|Stichtag) mit Zeitpunkt, Datei, Datensaetzen und Rueckstand des Ladens – fuer Ersatz-Frage und Ersetzen
Private Function GeladenLesen() As Object
    Dim ws As Worksheet, letzte As Long, daten As Variant, r As Long, d As Object, hinweis As String, k As String, kk As Variant
    Set d = CreateObject("Scripting.Dictionary")
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 5 Then
        daten = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, SP_GRUPPE_L)).Value2
        For r = 1 To UBound(daten, 1)
            If IsNumeric(daten(r, 5)) And Not IsEmpty(daten(r, 5)) And Len(CStr(Nz(daten(r, 4)))) > 0 Then
                hinweis = CStr(Nz(daten(r, 10)))
                If StandGueltig(hinweis) Then
                    ' Schluessel des Stands und Namensschluessel (Dateiname JJJJMMTT_BUe_Quelle[_Einheit]) fuer abgelegte Doppel
                    For Each kk In Array(StandSchluessel(CStr(daten(r, 4)), CStr(Nz(daten(r, SP_GRUPPE_L))), CDate(daten(r, 5))), _
                                         NamensSchluessel(CStr(daten(r, 4)), EinheitDateiteil(CStr(Nz(daten(r, SP_GRUPPE_L)))), CDate(daten(r, 5))), _
                                         NamensSchluesselDatei(CStr(Nz(daten(r, 2))), CStr(daten(r, 4)), CDate(daten(r, 5))))
                        k = CStr(kk)
                        If Len(k) = 0 Then GoTo NaechsterSchluessel
                        If d.Exists(k) Then d.Remove k
                        d.Add k, Array(daten(r, 1), CStr(Nz(daten(r, 2))), Val(daten(r, 6)), Val(daten(r, 7)))
NaechsterSchluessel:
                    Next kk
                End If
            End If
        Next r
    End If
    Set GeladenLesen = d
End Function

' Rohdatei eines geladenen Stands finden: Eintrag im Protokoll, sonst der Standardname in der Monatsablage oder im Ordner selbst
Private Function StandDatei(ordner As String, st As Stand) As String
    Dim sep As String, basis As String, kand As Variant, endung As Variant, nm As String, nm2 As Variant
    sep = Application.PathSeparator
    If Len(st.Datei) > 0 Then
        If DateiVorhanden(ordner & st.Datei) Then StandDatei = st.Datei: Exit Function
        nm = Mid$(st.Datei, InStrRev(st.Datei, sep) + 1)
        If DateiVorhanden(ordner & MonatsOrdner(st.Stichtag) & sep & nm) Then StandDatei = MonatsOrdner(st.Stichtag) & sep & nm: Exit Function
        If DateiVorhanden(ordner & nm) Then StandDatei = nm: Exit Function
    End If
    basis = MonatsOrdner(st.Stichtag) & sep & Format$(st.Stichtag, "yyyymmdd") & "_BUe_"
    If Len(st.Gruppe) > 0 Then
        kand = Array(st.Quelle & "_" & EinheitDateiteil(st.Gruppe), "OPAG_Verbund_" & EinheitDateiteil(st.Gruppe))
    Else
        kand = Array(st.Quelle, "OPAG_Verbund")
    End If
    For Each nm2 In kand
        For Each endung In Array(".xlsx", ".xlsm", ".xlsb", ".xls")
            If DateiVorhanden(ordner & basis & nm2 & endung) Then StandDatei = basis & nm2 & endung: Exit Function
        Next endung
    Next nm2
End Function

' Fakten-Zeilen einer Quelle (und Gruppe, Spalte S) ab einem Stichtag entfernen: der Rest rueckt auf, die frei gewordenen Zeilen
' am Ende werden geleert (Werte und Formelspalten). Keine Zeilen loeschen – die Namen F_* bleiben so unveraendert.
Private Sub FaktenEntfernen(quelle As String, einheit As String, abTag As Date)
    Dim ws As Worksheet, letzte As Long, kopf As Variant, ein As Variant, i As Long, i0 As Long, blk As Variant, aus() As Variant, ausE() As Variant
    Dim m As Long, c As Long, ab As Double
    Set ws = ThisWorkbook.Worksheets("Fakten")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 2 Then Exit Sub
    ab = CDbl(CLng(abTag))
    kopf = ws.Range(ws.Cells(2, 1), ws.Cells(letzte + 1, 2)).Value2               ' +1: immer zweidimensional
    ein = ws.Range(ws.Cells(2, SP_EINHEIT_F), ws.Cells(letzte + 1, SP_ALTSUM_F)).Value2          ' R Einheit, S Gruppe, T Alter max, U Vorgang, V Alter Summe
    For i = 1 To UBound(kopf, 1) - 1
        If Val(kopf(i, 1)) >= ab And CStr(Nz(kopf(i, 2))) = quelle And CStr(Nz(ein(i, 2))) = einheit Then i0 = i: Exit For
    Next i
    If i0 = 0 Then Exit Sub
    blk = ws.Range(ws.Cells(i0 + 1, 1), ws.Cells(letzte + 1, 15)).Value2
    ReDim aus(1 To UBound(blk, 1), 1 To 15)
    ReDim ausE(1 To UBound(blk, 1), 1 To 5)
    For i = 1 To UBound(blk, 1) - 1
        If Not (Val(blk(i, 1)) >= ab And CStr(Nz(blk(i, 2))) = quelle And CStr(Nz(ein(i0 - 1 + i, 2))) = einheit) Then
            m = m + 1
            For c = 1 To 15
                aus(m, c) = blk(i, c)
            Next c
            ausE(m, 1) = ein(i0 - 1 + i, 1): ausE(m, 2) = ein(i0 - 1 + i, 2): ausE(m, 3) = ein(i0 - 1 + i, 3): ausE(m, 4) = ein(i0 - 1 + i, 4)
            ausE(m, 5) = ein(i0 - 1 + i, 5)
        End If
    Next i
    If m > 0 Then
        ws.Range(ws.Cells(i0 + 1, 1), ws.Cells(i0 + m, 15)).Value2 = aus
        ws.Range(ws.Cells(i0 + 1, SP_EINHEIT_F), ws.Cells(i0 + m, SP_ALTSUM_F)).Value2 = ausE
    End If
    If i0 + m + 1 <= letzte Then ws.Range(ws.Cells(i0 + m + 1, 1), ws.Cells(letzte, SP_ALTSUM_F)).ClearContents
    LogSchreiben "  Fakten entfernt: " & (letzte - 1 - (i0 - 1) - m) & " Zeilen " & Strang(quelle, einheit) & " ab " & Format(abTag, "dd.mm.yyyy")
End Sub

' Gueltige Protokollzeilen einer Quelle ab einem Stichtag als ersetzt markieren (zaehlen danach nicht mehr als geladen)
Private Sub ProtokollErsetztMarkieren(quelle As String, einheit As String, abTag As Date, text As String)
    Dim ws As Worksheet, letzte As Long, r As Long, h As String, v As Variant
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For r = 5 To letzte
        v = ws.Cells(r, 5).Value2
        If IsNumeric(v) And Not IsEmpty(v) And CStr(ws.Cells(r, 4).Value) = quelle And CStr(ws.Cells(r, SP_GRUPPE_L).Value) = einheit Then
            If CLng(v) >= CLng(abTag) Then
                h = CStr(ws.Cells(r, 10).Value)
                If StandGueltig(h) Then ws.Cells(r, 10).Value = text
            End If
        End If
    Next r
End Sub

' Alte Rohdatei nach dem Ersetzen umbenennen (…_ersetzt), damit sie nach einem Zuruecksetzen nicht wieder geladen wird
Private Sub AlteDateiAusmustern(ordner As String, alteDatei As String, neueDatei As String)
    Dim nm As String, ziel As String
    If Len(alteDatei) = 0 Or StrComp(alteDatei, neueDatei, vbTextCompare) = 0 Then Exit Sub
    nm = Mid$(alteDatei, InStrRev(alteDatei, Application.PathSeparator) + 1)
    Dim fehler As String, ausblenden As Boolean
    If IstUrl(ordner) Then
        ' SharePoint ohne Ablage (oder Datei noch unter ihrem MIS-O-Namen): im Tool ausblenden (Blatt SP_Liste, Spalte J).
        ' Kollegen mit synchronisiertem Ordner benennen ausgeblendete Dateien beim naechsten Laden in …_verworfen um.
        ausblenden = (spAblage <> 1)
        If Not nm Like "########_BUe_*" Then ausblenden = True
        If ausblenden Then
            If Not DateiTraegtGueltigenStand(alteDatei) Then
                SpAusblenden alteDatei, ordner
                LogSchreiben "  alte Datei ausgeblendet (SharePoint): " & alteDatei
            End If
            Exit Sub
        End If
    End If
    If Not nm Like "########_BUe_*" Then Exit Sub
    If Not DateiVorhanden(ordner & alteDatei) Then Exit Sub
    If DateiTraegtGueltigenStand(alteDatei) Then Exit Sub     ' traegt noch Staende anderer Einheiten oder Stichtage
    ziel = FreierDateiname(ordner, Left$(alteDatei, InStrRev(alteDatei, ".") - 1) & "_ersetzt" & Mid$(alteDatei, InStrRev(alteDatei, ".")))
    fehler = DateiUmbenennen(ordner, alteDatei, ziel)
    If Len(fehler) = 0 Then
        LogSchreiben "  alte Datei ausgemustert: " & alteDatei & " -> " & ziel
    Else
        LogSchreiben "  alte Datei nicht umbenannt (" & fehler & "): " & alteDatei
        If IstUrl(ordner) Then
            If Not DateiTraegtGueltigenStand(alteDatei) Then SpAusblenden alteDatei, ordner   ' wie ohne Ablage
        End If
    End If
End Sub

' Steht die Datei im Ladeprotokoll noch bei einem gueltigen Stand (Sammeldatei mit weiteren Stichtagen)?
Private Function DateiTraegtGueltigenStand(rel As String) As Boolean
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, h As String
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Function
    a = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, 10)).Value2
    For r = 1 To UBound(a, 1) - 1
        If StrComp(CStr(Nz(a(r, 2))), rel, vbTextCompare) = 0 Then
            h = CStr(Nz(a(r, 10)))
            If StandGueltig(h) Then DateiTraegtGueltigenStand = True: Exit Function
        End If
    Next r
End Function

' Datei ist ein anderer Abzug zu einem geladenen Stand: liegt direkt im Ordner Rohdaten oder ist ein Doppel (…_2) in der Ablage,
' und das Ladeprotokoll nennt fuer diesen Stand eine andere Datei
Private Function NeuerAbzugZuGeladen(datei As String, schluessel As String, geladenInfo As Object) As Boolean
    Dim info As Variant
    If Not geladenInfo.Exists(schluessel) Then Exit Function
    info = geladenInfo(schluessel)
    If StrComp(DateiName(CStr(info(1))), DateiName(datei), vbTextCompare) = 0 Then Exit Function
    NeuerAbzugZuGeladen = (InStr(datei, Application.PathSeparator) = 0 Or IstDoppel(datei))
End Function

' Doppel in der Ablage (JJJJMMTT_BUe_<Quelle>_n) zu einem Stand, der aus einer anderen Datei geladen ist – muss geoeffnet werden
Private Function DoppelZuGeladen(rel As String, geladenInfo As Object) As Boolean
    Dim tag As Date, quellen As Variant, teil As String, q As Variant
    If Not IstDoppel(rel) Then Exit Function
    If Not NameZerlegen(rel, tag, quellen, teil) Then Exit Function
    For Each q In quellen
        If NeuerAbzugZuGeladen(rel, NamensSchluessel(CStr(q), teil, tag), geladenInfo) Then DoppelZuGeladen = True
    Next q
    Exit Function
Nein:
    DoppelZuGeladen = False
End Function

Private Function IstDoppel(rel As String) As Boolean
    Dim nm As String
    nm = DateiName(rel)
    nm = Left$(nm, InStrRev(nm, ".") - 1)
    IstDoppel = (nm Like "########_BUe_*_#" Or nm Like "########_BUe_*_##")
End Function

Private Function DateiName(pfad As String) As String
    DateiName = Mid$(pfad, InStrRev(Replace(pfad, "/", Application.PathSeparator), Application.PathSeparator) + 1)
End Function

' ersetzte oder nicht uebernommene Rohdateien und im Bereich MAKLER ignorierte HS-Abzuege (12.91) werden beim Laden nicht mehr gelesen
Private Function AusgemustertName(datei As String) As Boolean
    Dim nm As String
    nm = LCase$(Left$(datei, InStrRev(datei, ".") - 1))
    AusgemustertName = (nm Like "*_ersetzt" Or nm Like "*_ersetzt_#*" Or nm Like "*_verworfen" Or nm Like "*_verworfen_#*" Or _
                        nm Like "*" & LCase$(HS_ENDUNG) Or nm Like "*" & LCase$(HS_ENDUNG) & "_#*")
End Function

' Angaben fuer die Ersatz-Frage: 0 Quelle, 1 Stichtag, 2 geladen am (leer, wenn unbekannt), 3 Datensaetze geladen,
' 4 Rueckstand geladen, 5 Name der neuen Datei, 6 Zeilen der neuen Datei (rund: Blattende minus Kopfzeile), 7 Einheit (MAKLER)
Private Function ErsatzDaten(st As Stand, info As Variant) As Variant
    Dim am As Variant
    If IsNumeric(info(0)) And Not IsEmpty(info(0)) Then am = CDate(info(0))
    ErsatzDaten = Array(st.Quelle, st.Stichtag, am, CDbl(info(2)), CDbl(info(3)), DateiName(st.Datei), CDbl(st.Zeilen), st.Gruppe)
End Function

' ganze Zahl mit Punkt als Tausendertrenner, unabhaengig von der Spracheinstellung von Windows
Public Function ZahlDE(n As Double) As String
    Dim s As String, i As Long, t As String, minus As Boolean
    minus = (n < 0)
    s = CStr(Abs(Round(n, 0)))
    For i = Len(s) To 1 Step -1
        t = Mid$(s, i, 1) & t
        If (Len(s) - i) Mod 3 = 2 And i > 1 Then t = "." & t
    Next i
    ZahlDE = IIf(minus, "-", "") & t
End Function

' ---------------------------------------------------------------- Celonis (Process Mining): Kopie jeder Datei, aus der geladen wird
' Ziel: Konfiguration!B6 (z. B. H:\Process-Mining-Sync\Upload), leer = aus. Dateiname wie in der Ablage, ohne Doppel-Endung _2,
' damit ein ersetzter Stand die alte Kopie ueberschreibt. Fehler halten das Laden nicht auf, sie stehen in Ladelog.txt und
' in der Abschlussmeldung.
Private Sub CelonisEinmal(ordner As String, datei As String, gesendet As Object, ueberschreiben As Boolean, stichtag As Date)
    Dim ab As Date, zn As String, al As String
    If gesendet.Exists(LCase$(datei)) Then Exit Sub        ' Sammeldatei mit mehreren Staenden: nur einmal
    ' Konfiguration!F8 „Celonis ab Stichtag“: aeltere Staende gingen schon frueher an Celonis (Neuaufbau, neue Master-Datei)
    ab = CelonisAb()
    If stichtag > 0 And ab > 0 And CLng(stichtag) < CLng(ab) Then
        If Len(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B6").Value))) > 0 Then celonisAlt = celonisAlt + 1
        Exit Sub
    End If
    gesendet.Add LCase$(datei), True
    zn = ""
    If Not celonisNamen Is Nothing Then
        If celonisNamen.Exists(LCase$(datei)) Then zn = CStr(celonisNamen(LCase$(datei)))
    End If
    al = ""
    If Not celonisAlias Is Nothing Then
        If celonisAlias.Exists(LCase$(datei)) Then al = CStr(celonisAlias(LCase$(datei)))
    End If
    If CelonisSenden(PfadVon(ordner, datei), ueberschreiben, zn, al) Then
        CelonisOffenErledigt datei
    Else
        CelonisOffenMerken datei, zn, ueberschreiben          ' Ordner nicht erreichbar oder Kopie gescheitert: naechstes Laden versucht es erneut
    End If
End Sub

' Gescheiterte Uebergaben (Celonis-Ordner nicht erreichbar, Kopie fehlgeschlagen) im Blatt Celonis_Log, Spalten F:I (Rohdatei relativ,
' einheitlicher Name, seit, „ja“ = Ersatz: ueberschreibt die alte Kopie). Jedes Laden versucht sie vor der Verarbeitung erneut
' (CelonisOffenNachholen) – die Rohdatei wird ja nicht noch einmal geladen, sonst ginge sie nie an Celonis.
Private Sub CelonisOffenMerken(rel As String, zielName As String, ueberschreiben As Boolean)
    Dim ws As Worksheet, r As Long
    On Error Resume Next
    Set ws = CelonisBlatt()
    If ws Is Nothing Then Exit Sub
    If Len(CStr(ws.Range("I1").Value)) = 0 Then ws.Range("I1").Value = "Ersatz"     ' Blatt aus 12.65 ohne Spalte I
    r = CelonisOffenZeile(ws, rel)
    If r > 0 Then
        If ueberschreiben Then ws.Cells(r, 9).Value = "ja"
        Exit Sub
    End If
    r = ws.Cells(ws.Rows.Count, 6).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Cells(r, 6).Value = "'" & rel
    ws.Cells(r, 7).Value = "'" & zielName
    ws.Cells(r, 8).Value = Now
    ws.Cells(r, 9).Value = IIf(ueberschreiben, "ja", "")
    LogSchreiben "  Celonis: offen vermerkt: " & rel & IIf(ueberschreiben, " (Ersatz)", "")
End Sub

Private Sub CelonisOffenErledigt(rel As String)
    Dim ws As Worksheet, r As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Celonis_Log")
    If ws Is Nothing Then Exit Sub
    r = CelonisOffenZeile(ws, rel)
    If r > 0 Then ws.Range(ws.Cells(r, 6), ws.Cells(r, 9)).Delete Shift:=xlUp
End Sub

' Rohdatei umbenannt und abgelegt (NeueDatenLaden, Schritt 1): eine offene Uebergabe – etwa eines Kollegen im SharePoint-Modus, der
' die Datei unter ihrem MIS-O-Namen vermerkt hat – auf den neuen Pfad umschreiben, damit CelonisOffenNachholen sie wiederfindet
Private Sub CelonisOffenUmbenennen(alt As String, neu As String)
    Dim ws As Worksheet, r As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Celonis_Log")
    If ws Is Nothing Then Exit Sub
    r = CelonisOffenZeile(ws, alt)
    If r > 0 Then
        ws.Cells(r, 6).Value = "'" & neu
        LogSchreiben "  Celonis: offene Übergabe umgeschrieben: " & alt & " -> " & neu
    End If
End Sub

' Rohdatei einer offenen Uebergabe, die nicht mehr unter ihrem Pfad liegt (ein Kollege hat sie umbenannt und abgelegt): unter dem
' einheitlichen Namen im Monatsordner suchen (JJJJ\MM_Monat aus dem Datum am Namensanfang, wie ZielDateiname), auch die Doppel _2 … _9;
' gibt es mehrere, das zuletzt abgelegte (hoechstes _n). Ergebnis: relativer Pfad, leer = nicht gefunden.
Private Function CelonisOffenSuchen(ordner As String, rel As String, zielName As String) As String
    Dim nm As String, basis As String, endung As String, monat As String, kand As String, i As Long
    nm = zielName
    If Len(nm) = 0 Then nm = DateiName(rel)
    If InStrRev(nm, ".") = 0 Then Exit Function
    If Not (nm Like "20######*_BUe_*") Then Exit Function
    If Not (Mid$(nm, 5, 2) Like "[01]#") Then Exit Function
    If Not (Mid$(nm, 7, 2) Like "[0-3]#") Then Exit Function
    On Error GoTo Ende
    monat = MonatsOrdner(DateSerial(CInt(Left$(nm, 4)), CInt(Mid$(nm, 5, 2)), CInt(Mid$(nm, 7, 2))))
    basis = Left$(nm, InStrRev(nm, ".") - 1)
    endung = Mid$(nm, InStrRev(nm, "."))
    If IstDoppel(nm) Then basis = Left$(basis, InStrRev(basis, "_") - 1)
    For i = 1 To 9
        kand = monat & Application.PathSeparator & basis & IIf(i = 1, "", "_" & i) & endung
        If DateiVorhanden(PfadVon(ordner, kand)) Then CelonisOffenSuchen = kand
    Next i
Ende:
End Function

' Beim Ablegen (lokaler Lauf): Wurde die Datei unter ihrem bisherigen Namen schon an Celonis uebergeben (SharePoint-Modus bis 12.64),
' den einheitlichen Namen sofort dauerhaft als Alias ins Protokoll schreiben. Sonst kennt nur dieser Lauf die Zuordnung, und nach einem
' Neuaufbau oder mit einer neuen Master-Datei ginge die Datei erneut an Celonis. Nur bei gleicher Groesse (derselbe Abzug).
Private Sub CelonisAliasAblegen(ordner As String, altName As String, neuRel As String)
    Dim nm As String, basis As String, endung As String, g As Double
    On Error GoTo Ende
    If Len(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B6").Value))) = 0 Then Exit Sub   ' Celonis aus
    If celonisLog Is Nothing Then Set celonisLog = CelonisLogLesen()
    If Not celonisLog.Exists(LCase$(altName)) Then Exit Sub
    nm = DateiName(neuRel)
    basis = Left$(nm, InStrRev(nm, ".") - 1)
    endung = Mid$(nm, InStrRev(nm, "."))
    If IstDoppel(nm) Then basis = Left$(basis, InStrRev(basis, "_") - 1)
    If StrComp(altName, basis & endung, vbTextCompare) = 0 Then Exit Sub
    If celonisLog.Exists(LCase$(basis & endung)) Then Exit Sub
    g = DateiGroesse(PfadVon(ordner, neuRel))
    If g <> celonisLog(LCase$(altName)) Then Exit Sub
    CelonisLogSchreiben basis & endung, g, "Alias von " & altName
Ende:
End Sub

Private Function CelonisOffenZeile(ws As Worksheet, rel As String) As Long
    Dim letzte As Long, a As Variant, r As Long
    letzte = ws.Cells(ws.Rows.Count, 6).End(xlUp).Row
    If letzte < 2 Then Exit Function
    a = ws.Range(ws.Cells(2, 6), ws.Cells(letzte + 1, 6)).Value2
    For r = 1 To UBound(a, 1) - 1
        If StrComp(CStr(Nz(a(r, 1))), rel, vbTextCompare) = 0 Then CelonisOffenZeile = r + 1: Exit Function
    Next r
End Function

' Offene Uebergaben erneut versuchen; Ergebnis: Anzahl nachgeholter Dateien (nur wirklich kopierte). Liegt die Rohdatei nicht mehr
' unter dem vermerkten Pfad, wird sie unter dem einheitlichen Namen gesucht (CelonisOffenSuchen); ist sie auch dort nicht, steht das
' in der Abschlussmeldung und die Zeile entfaellt (sonst bliebe sie still fuer immer stehen).
Private Function CelonisOffenNachholen(ordner As String) As Long
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, rel As String, gefunden As String, vorher As Long, ersatz As Boolean
    If Len(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B6").Value))) = 0 Then Exit Function
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Celonis_Log")
    On Error GoTo 0
    If ws Is Nothing Then Exit Function
    letzte = ws.Cells(ws.Rows.Count, 6).End(xlUp).Row
    If letzte < 2 Then Exit Function
    a = ws.Range(ws.Cells(2, 6), ws.Cells(letzte + 1, 9)).Value2
    For r = UBound(a, 1) - 1 To 1 Step -1
        rel = CStr(Nz(a(r, 1)))
        If Len(rel) > 0 Then
            If Not DateiVorhanden(PfadVon(ordner, rel)) Then
                gefunden = CelonisOffenSuchen(ordner, rel, CStr(Nz(a(r, 2))))
                If Len(gefunden) > 0 Then
                    LogSchreiben "Celonis: offene Übergabe " & rel & " liegt jetzt unter " & gefunden
                    ws.Cells(r + 1, 6).Value = "'" & gefunden
                Else
                    LogSchreiben "Celonis: offene Übergabe nicht mehr auffindbar, aus der Liste genommen: " & rel
                    CelonisFehlerMerken "offene Übergabe " & DateiName(rel) & " nicht mehr auffindbar (umbenannt oder gelöscht) und nicht übergeben – bitte prüfen"
                    ws.Range(ws.Cells(r + 1, 6), ws.Cells(r + 1, 9)).Delete Shift:=xlUp
                End If
                rel = gefunden
            End If
            If Len(rel) > 0 Then
                LogSchreiben "Celonis: offene Übergabe erneut: " & rel
                ersatz = (Len(CStr(Nz(a(r, 4)))) > 0)             ' Ersatz: ueberschreibt die alte Kopie trotz bekannten Namens
                vorher = celonisAnzahl
                If CelonisSenden(PfadVon(ordner, rel), ersatz, CStr(Nz(a(r, 2)))) Then
                    ws.Range(ws.Cells(r + 1, 6), ws.Cells(r + 1, 9)).Delete Shift:=xlUp
                    If celonisAnzahl > vorher Then CelonisOffenNachholen = CelonisOffenNachholen + 1
                End If
            End If
        End If
    Next r
End Function

' Blatt Celonis_Log (ausgeblendet): A:D Protokoll der Uebergaben, F:I offene Uebergaben; wird bei Bedarf angelegt
Private Function CelonisBlatt() As Worksheet
    Dim ws As Worksheet, akt As Object
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Celonis_Log")
    On Error GoTo 0
    If ws Is Nothing Then
        Set akt = ActiveSheet
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = "Celonis_Log"
        ws.Range("A1:D1").Value = Array("Zeitpunkt", "Datei", "Bytes", "Herkunft")
        ws.Range("F1:I1").Value = Array("Offen: Rohdatei", "Name für Celonis", "seit", "Ersatz")
        ws.Visible = xlSheetVeryHidden
        If Not akt Is Nothing Then akt.Activate
    End If
    Set CelonisBlatt = ws
End Function

Private Sub CelonisFehlerMerken(t As String)
    If InStr(1, celonisFehler, t, vbTextCompare) > 0 Then Exit Sub
    celonisFehler = celonisFehler & IIf(Len(celonisFehler) > 0, "; ", "") & t
End Sub

Private Function CelonisSenden(quelle As String, ueberschreiben As Boolean, Optional zielName As String = "", Optional aliasName As String = "") As Boolean
    Dim ziel As String, nm As String, basis As String, endung As String, fehler As String, groesse As Double, bekannt As Double
    ziel = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B6").Value))
    CelonisSenden = True
    If Len(ziel) = 0 Then Exit Function                     ' Celonis aus: nichts zu tun, kein Fehler
    If Right$(ziel, 1) <> Application.PathSeparator Then ziel = ziel & Application.PathSeparator
    If Not OrdnerVorhanden(ziel) Then
        CelonisFehlerMerken "Ordner " & ziel & " nicht erreichbar, Übergabe beim nächsten Laden"
        LogSchreiben "  Celonis: Ordner nicht erreichbar: " & ziel
        CelonisSenden = False
        Exit Function
    End If
    nm = DateiName(quelle)
    basis = Left$(nm, InStrRev(nm, ".") - 1)
    endung = Mid$(nm, InStrRev(nm, "."))
    If IstDoppel(nm) Then basis = Left$(basis, InStrRev(basis, "_") - 1)
    If Len(zielName) > 0 Then                                ' SharePoint: einheitlicher Name, obwohl die Rohdatei nicht umbenannt ist
        basis = Left$(zielName, InStrRev(zielName, ".") - 1)
        endung = Mid$(zielName, InStrRev(zielName, "."))
    End If
    ' Schon uebergeben? Der Server holt die Dateien alle zwei Stunden ab und leert den Ordner – deshalb fuehrt das Tool ein
    ' eigenes Protokoll (Celonis_Upload_Log.txt neben der Master-Datei). Steht die Datei darin oder liegt sie noch im Ordner,
    ' wird sie nicht erneut kopiert. Ausnahme: ein aktuellerer Abzug (Ersatz oder Doppel …_2) mit anderer Groesse.
    groesse = DateiGroesse(quelle)
    If celonisLog Is Nothing Then Set celonisLog = CelonisLogLesen()
    If celonisLog.Exists(LCase$(basis & endung)) Then
        bekannt = celonisLog(LCase$(basis & endung))
    ElseIf Len(aliasName) > 0 And StrComp(aliasName, basis & endung, vbTextCompare) <> 0 And celonisLog.Exists(LCase$(aliasName)) Then
        ' unter dem frueheren Namen uebergeben (MIS-O-Name aus dem SharePoint-Modus bis 12.64, Originalname vor dem Umbenennen):
        ' nur derselbe Abzug (gleiche Groesse) gilt als uebergeben und bekommt den Namen nachgetragen. Die Groessenpruefung steht im
        ' Rumpf, nicht in der Bedingung: VBA wertet And nicht verkuerzt aus.
        bekannt = celonisLog(LCase$(aliasName))
        If bekannt = groesse Then
            CelonisLogSchreiben basis & endung, bekannt, "Alias von " & aliasName
        Else
            bekannt = -1                                      ' anderer Abzug unter demselben Rohnamen: normal uebergeben
        End If
    ElseIf DateiVorhanden(ziel & basis & endung) Then
        bekannt = DateiGroesse(ziel & basis & endung)
        CelonisLogSchreiben basis & endung, bekannt, "lag schon im Ordner"
    Else
        bekannt = -1
    End If
    If bekannt >= 0 Then
        If bekannt = groesse Or Not (ueberschreiben Or IstDoppel(nm)) Then
            celonisVorhanden = celonisVorhanden + 1
            Exit Function
        End If
    End If
    modFortschritt.FortschrittSetzen ladeAnteil, CStr(IIf(Len(ladeStatus) > 0, ladeStatus, "Übergabe an Celonis")), "Übergabe an Celonis: " & basis & endung   ' nur, wenn wirklich kopiert wird
    If IstUrl(quelle) And Len(CacheVon(quelle)) > 0 Then
        On Error Resume Next                                      ' SharePoint: lokale Kopie aus diesem Laden
        FileCopy CacheVon(quelle), ziel & basis & endung
        If Err.Number <> 0 Then fehler = Err.Description
        On Error GoTo 0
    ElseIf IstUrl(quelle) Then
        fehler = UrlKopieren(quelle, ziel & basis & endung)         ' SharePoint: oeffnen und als Kopie speichern
    Else
        On Error Resume Next
        FileCopy quelle, ziel & basis & endung
        If Err.Number <> 0 Then fehler = Err.Description
        On Error GoTo 0
    End If
    If Len(fehler) = 0 Then
        celonisAnzahl = celonisAnzahl + 1
        CelonisLogSchreiben basis & endung, groesse, quelle
        LogSchreiben "  Celonis: " & nm & " -> " & ziel & basis & endung
    Else
        CelonisFehlerMerken basis & endung & " nicht kopiert (" & fehler & "), Übergabe beim nächsten Laden"
        LogSchreiben "  Celonis FEHLER (" & fehler & "): " & nm
        CelonisSenden = False
    End If
End Function

Private Function DateiGroesse(pfad As String) As Double
    Dim e As Variant
    On Error Resume Next
    DateiGroesse = -2
    If IstUrl(pfad) Then                                     ' SharePoint: Groesse aus der Auflistung
        e = SpEintrag(pfad)
        If IsArray(e) Then
            If IsNumeric(e(2)) And Not IsEmpty(e(2)) Then DateiGroesse = CDbl(e(2))
        End If
    Else
        DateiGroesse = FileLen(pfad)
    End If
    On Error GoTo 0
End Function

' Datei von SharePoint als Kopie in einen lokalen Ordner sichern (FileCopy geht mit https nicht); Ergebnis leer = ok
Private Function UrlKopieren(url As String, ziel As String) As String
    Dim wb As Workbook
    On Error GoTo Fehler
    Set wb = QuelleOeffnen(url)
    Application.DisplayAlerts = False
    wb.SaveCopyAs ziel
    Application.DisplayAlerts = True
    wb.Close SaveChanges:=False
    Exit Function
Fehler:
    UrlKopieren = Err.Description
    On Error Resume Next
    Application.DisplayAlerts = True
    If Not wb Is Nothing Then wb.Close SaveChanges:=False
End Function

' Celonis-Protokoll an drei Stellen, damit es einen Wechsel der Master-Datei (neue Version, Neuaufbau, SharePoint) uebersteht:
' Celonis_Upload_Log.txt im Ordner der Master-Datei (lokal) bzw. in %LOCALAPPDATA%\BUE_Reporting, dort immer zusaetzlich, und das
' ausgeblendete Blatt Celonis_Log in der Master-Datei. Gelesen wird die Vereinigung aller drei.
Private Function CelonisLogPfade() As Collection
    ' neben einer lokal erreichbaren Master-Datei (auch synchronisierter SharePoint-Ordner) und in %LOCALAPPDATA%\BUE_Reporting –
    ' dort je Bereich getrennt, damit HS- und Makler-Master auf demselben Rechner sich nicht gegenseitig Dateien als uebergeben melden
    Dim c As New Collection, b As String
    On Error Resume Next
    b = BasisOrdner()
    If Len(b) > 0 And Not IstUrl(b) Then c.Add ProtokollPfad(b, CELONIS_LOG)
    c.Add AppDatenOrdner() & Application.PathSeparator & IIf(IstMakler(), "Celonis_Upload_Log_Makler.txt", CELONIS_LOG)
    Set CelonisLogPfade = c
End Function

' Konfiguration!F8: Staende vor diesem Stichtag gehen nicht an Celonis (0 = keine Grenze)
Private Function CelonisAb() As Date
    Dim v As Variant
    On Error Resume Next
    v = ThisWorkbook.Worksheets("Konfiguration").Range("F8").Value
    If IsDate(v) Then CelonisAb = CDate(v)
End Function

' Protokoll lesen: Dateiname (klein) -> Groesse der zuletzt uebergebenen Fassung. Zeilen: Zeitpunkt TAB Datei TAB Bytes TAB Herkunft
Private Function CelonisLogLesen() As Object
    Dim d As Object, f As Integer, zeile As String, t() As String, p As Variant, ws As Worksheet, a As Variant, r As Long, letzte As Long
    Set d = CreateObject("Scripting.Dictionary")
    On Error Resume Next
    For Each p In CelonisLogPfade()
        If Len(Dir(CStr(p))) > 0 Then
            f = FreeFile
            Open CStr(p) For Input As #f
            Do While Not EOF(f)
                Line Input #f, zeile
                If Len(LogSchluessel(zeile)) > 0 Then d(LogSchluessel(zeile)) = LogGroesse(zeile)
            Loop
            Close #f
        End If
    Next p
    ' SharePoint ohne Dateipfad: das Protokoll neben der Master-Datei ueber Power Query lesen (dort schreiben auch Kollegen mit
    ' synchronisiertem Ordner hinein); nach dem Laden werden die neuen Zeilen dort angehaengt (CelonisSpZurueckschreiben)
    If IstUrl(BasisOrdner()) Then
        CelonisSpLesen
        If Not celonisSp Is Nothing Then
            For Each p In celonisSp
                If Len(LogSchluessel(CStr(p))) > 0 Then d(LogSchluessel(CStr(p))) = LogGroesse(CStr(p))
            Next p
        End If
    End If
    Set ws = Nothing
    Set ws = ThisWorkbook.Worksheets("Celonis_Log")
    If Not ws Is Nothing Then
        letzte = ws.Cells(ws.Rows.Count, 2).End(xlUp).Row
        If letzte >= 2 Then
            a = ws.Range(ws.Cells(2, 1), ws.Cells(letzte + 1, 3)).Value2
            For r = 1 To UBound(a, 1) - 1
                If Len(CStr(a(r, 2))) > 0 Then d(LCase$(Trim$(CStr(a(r, 2))))) = Val(a(r, 3))
            Next r
        End If
    End If
    Set CelonisLogLesen = d
End Function

' Feld des Protokolls: Tabulatoren und Anfuehrungszeichen ersetzen (Speichern als Text wuerde das Feld sonst in "…" setzen)
Private Function LogText(t As String) As String
    LogText = Replace(Replace(Replace(t, vbTab, " "), """", "'"), vbLf, " ")
End Function

' Dateiname aus einer Protokollzeile (Feld 2), klein, ohne umschliessende Anfuehrungszeichen; leer, wenn die Zeile keins hat
Private Function LogSchluessel(zeile As String) As String
    Dim t() As String
    t = Split(zeile, vbTab)
    If UBound(t) < 2 Then Exit Function
    LogSchluessel = LCase$(TextFeld(t(1)))
End Function

' Feld einer als Text gespeicherten Zeile: ohne umschliessende Anfuehrungszeichen, "" -> " (so speichert Excel Felder mit Komma)
Private Function TextFeld(t As String) As String
    Dim k As String
    k = Trim$(t)
    If Len(k) >= 2 And Left$(k, 1) = """" And Right$(k, 1) = """" Then k = Replace(Mid$(k, 2, Len(k) - 2), """""", """")
    TextFeld = k
End Function

' Groesse aus einer Protokollzeile (Feld 3)
Private Function LogGroesse(zeile As String) As Double
    Dim t() As String
    t = Split(zeile, vbTab)
    If UBound(t) >= 2 Then LogGroesse = Val(Replace(t(2), """", ""))
End Function

' Celonis_Upload_Log.txt neben der Master-Datei auf SharePoint lesen (celonisSp bleibt Nothing, wenn das nicht gelingt – dann wird
' dort auch nichts zurueckgeschrieben, damit fremde Zeilen nicht verloren gehen)
Private Sub CelonisSpLesen()
    Dim a As Variant, r As Long, m As String
    If Not celonisSp Is Nothing Then Exit Sub
    On Error GoTo Fehler
    m = SpTextFormel(BasisOrdner(), CELONIS_LOG, PROTOKOLL_ORDNER)
    If Len(m) = 0 Then Exit Sub
    a = SpTabelle(SP_TEXT_ABFRAGE, m, "L1", "Textdatei aus dem SharePoint-Ordner der Master-Datei (Celonis-Protokoll, wird vom Tool geschrieben)")
    Set celonisSp = New Collection
    If IsArray(a) Then
        For r = 1 To UBound(a, 1)
            If Len(CStr(Nz(a(r, 1)))) > 0 Then celonisSp.Add CStr(a(r, 1))
        Next r
    End If
    celonisSpFehler = ""
    LogSchreiben "  Celonis-Protokoll auf SharePoint gelesen: " & celonisSp.Count & " Zeilen"
    Exit Sub
Fehler:
    Set celonisSp = Nothing
    celonisSpFehler = Err.Description
    LogSchreiben "  Celonis-Protokoll auf SharePoint nicht lesbar: " & Err.Description
End Sub

' Neue Zeilen an Celonis_Upload_Log.txt auf SharePoint anhaengen: Datei aus gelesenen und neuen Zeilen neu aufbauen und ueber
' Excel als Text (Tabulator, Windows-1252 – wie Print #) unter derselben Adresse speichern. Ergebnis leer = ok, sonst Fehlertext.
Private Function CelonisSpZurueckschreiben() As String
    Dim wb As Workbook, a() As Variant, n As Long, r As Long, c As Long, t() As String, z As Variant, ziel As String
    Dim bekannt As Object, p As Variant, f As Integer, zeile As String, k As String, neu As Collection
    If celonisSpNeu Is Nothing Then Exit Function
    If Not IstUrl(BasisOrdner()) Then Exit Function          ' lokaler/synchronisierter Ordner: Print # schreibt die Datei direkt
    If Len(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B6").Value))) = 0 Then Exit Function   ' Celonis aus
    On Error GoTo Fehler
    ' unmittelbar vorher neu lesen: Zeilen, die Kollegen waehrend des Ladens angehaengt haben, bleiben erhalten
    Set celonisSp = Nothing
    CelonisSpLesen
    If celonisSp Is Nothing Then
        CelonisSpZurueckschreiben = "Protokoll " & CELONIS_LOG & " auf SharePoint nicht lesbar (" & celonisSpFehler & "), deshalb nicht fortgeschrieben"
        Exit Function
    End If
    Set bekannt = CreateObject("Scripting.Dictionary")
    For Each z In celonisSp
        k = LogSchluessel(CStr(z))
        If Len(k) > 0 Then bekannt(k) = True
    Next z
    ' neue Zeilen dieses Ladens und Uebergaben, die nur lokal vermerkt sind (12.62/12.63, frueher gescheitertes Schreiben)
    Set neu = New Collection
    For Each z In celonisSpNeu
        k = LogSchluessel(CStr(z))
        If Len(k) > 0 And Not bekannt.Exists(k) Then neu.Add CStr(z): bekannt(k) = True
    Next z
    For Each p In CelonisLogPfade()
        If Len(Dir(CStr(p))) > 0 Then
            f = FreeFile
            Open CStr(p) For Input As #f
            Do While Not EOF(f)
                Line Input #f, zeile
                k = LogSchluessel(zeile)
                If Len(k) > 0 And Not bekannt.Exists(k) Then neu.Add zeile: bekannt(k) = True
            Loop
            Close #f
            f = 0
        End If
    Next p
    If neu.Count = 0 Then Set celonisSpNeu = New Collection: Exit Function
    n = celonisSp.Count + neu.Count
    ReDim a(1 To n, 1 To 4)
    For Each z In celonisSp                                          ' vorhandene Zeilen normalisiert (sonst wuerden Anfuehrungszeichen,
        r = r + 1                                                    ' die Excel beim Speichern um Felder mit Komma setzt, jedes Mal mehr)
        t = Split(CStr(z), vbTab)
        For c = 0 To UBound(t)
            If c <= 3 Then a(r, c + 1) = LogText(TextFeld(t(c))) Else a(r, 4) = a(r, 4) & " " & LogText(TextFeld(t(c)))
        Next c
    Next z
    For Each z In neu
        r = r + 1
        t = Split(CStr(z), vbTab)
        For c = 0 To UBound(t)
            If c <= 3 Then a(r, c + 1) = LogText(t(c)) Else a(r, 4) = a(r, 4) & " " & LogText(t(c))
        Next c
    Next z
    Set wb = Workbooks.Add(xlWBATWorksheet)
    wb.Worksheets(1).Range("A1:D" & n).NumberFormat = "@"          ' alles als Text, nichts umformatieren
    wb.Worksheets(1).Range("A1:D" & n).Value = a
    ziel = SpTextSpeichern(wb, BasisOrdner(), CELONIS_LOG)          ' xlTextWindows, in Protokolle (sonst neben der Master-Datei)
    wb.Close SaveChanges:=False
    ThisWorkbook.Activate
    LogSchreiben "  Celonis-Protokoll auf SharePoint fortgeschrieben: " & neu.Count & " neue Zeilen"
    For Each z In neu
        celonisSp.Add z
    Next z
    Set celonisSpNeu = New Collection
    Exit Function
Fehler:
    CelonisSpZurueckschreiben = Err.Description
    On Error Resume Next
    If f > 0 Then Close #f
    Application.DisplayAlerts = True
    If Not wb Is Nothing Then wb.Close SaveChanges:=False
    ThisWorkbook.Activate
    LogSchreiben "  Celonis-Protokoll auf SharePoint NICHT fortgeschrieben: " & CelonisSpZurueckschreiben
End Function

Private Sub CelonisLogSchreiben(datei As String, groesse As Double, herkunft As String)
    Dim f As Integer, p As Variant, ws As Worksheet, r As Long, akt As Object, zeile As String
    On Error Resume Next
    If celonisLog Is Nothing Then Set celonisLog = CelonisLogLesen()
    celonisLog(LCase$(datei)) = groesse
    zeile = Format(Now, "yyyy-mm-dd hh:nn:ss") & vbTab & LogText(datei) & vbTab & CStr(groesse) & vbTab & LogText(herkunft)
    For Each p In CelonisLogPfade()
        f = FreeFile
        Open CStr(p) For Append As #f
        Print #f, zeile
        Close #f
    Next p
    If Not celonisSpNeu Is Nothing Then celonisSpNeu.Add zeile    ' fuer SharePoint vormerken (geschrieben am Ende des Ladens)
    Set ws = CelonisBlatt()
    r = ws.Cells(ws.Rows.Count, 2).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Range(ws.Cells(r, 1), ws.Cells(r, 4)).Value = Array(Now, datei, groesse, herkunft)
End Sub

' ---------------------------------------------------------------- Neue Themenpostkoerbe ausserhalb HS (Karte modStandard nach dem Laden)
Public Function NeuePostkoerbeAnzahl() As Long
    If Not neuePK Is Nothing Then NeuePostkoerbeAnzahl = neuePK.Count
End Function

Public Function IstNeuerPostkorb(nm As String) As Boolean
    If Not neuePK Is Nothing Then IstNeuerPostkorb = neuePK.Exists(nm)
End Function

Public Function NeuePostkoerbeText() As String
    Dim k As Variant, t As String
    If neuePK Is Nothing Then Exit Function
    For Each k In neuePK.Keys
        If Len(t) > 0 Then t = t & ", "
        t = t & k
    Next k
    NeuePostkoerbeText = t
End Function

Public Sub NeuePostkoerbeErledigt()
    If Not neuePK Is Nothing Then neuePK.RemoveAll
End Sub

' ---------------------------------------------------------------- Ersatz-Frage (Karte in modTagesablauf)
Public Function ErsatzFrageOffen() As Boolean
    If ersatzOffen Is Nothing Then Exit Function
    ErsatzFrageOffen = (ersatzOffen.Count > 0)
End Function

Public Function ErsatzAnzahl() As Long
    If Not ersatzOffen Is Nothing Then ErsatzAnzahl = ersatzOffen.Count
End Function

' Angabe k (siehe ErsatzDaten) des i-ten offenen Stands (1 = erster)
Public Function ErsatzWert(i As Long, k As Long) As Variant
    Dim w As Variant
    If ersatzOffen Is Nothing Then Exit Function
    If i < 1 Or i > ersatzOffen.Count Then Exit Function
    w = ersatzOffen.Items()(i - 1)
    ErsatzWert = w(k)
End Function

' Klartext fuer das Ersatzfenster ohne Formen (MsgBox)
Public Function ErsatzFrageText() As String
    Dim i As Long, t As String
    For i = 1 To ErsatzAnzahl()
        If Len(t) > 0 Then t = t & vbLf
        t = t & Strang(CStr(ErsatzWert(i, 0)), CStr(ErsatzWert(i, 7))) & " " & Format$(ErsatzWert(i, 1), "dd.mm.yyyy") & ": geladen " & ZahlDE(CDbl(ErsatzWert(i, 3))) & _
            " Datensätze, neue Datei " & ErsatzWert(i, 5) & " rund " & ZahlDE(CDbl(ErsatzWert(i, 6))) & " Zeilen"
    Next i
    ErsatzFrageText = t
End Function

Public Function ErsatzAusAblauf() As Boolean
    ErsatzAusAblauf = ersatzImAblauf
End Function

' Antwort auf die Frage: True = neue Datei ersetzt den Stand, False = alter Stand bleibt; danach laedt der Aufrufer erneut
Public Sub ErsatzEntscheiden(ersetzen As Boolean)
    Dim k As Variant
    If ersatzWahl Is Nothing Then Set ersatzWahl = CreateObject("Scripting.Dictionary")
    If ersatzOffen Is Nothing Then Exit Sub
    For Each k In ersatzOffen.Keys
        ersatzWahl(k) = ersetzen
    Next k
    ersatzOffen.RemoveAll
End Sub

Public Sub ErsatzAbbrechen()
    If Not ersatzOffen Is Nothing Then ersatzOffen.RemoveAll
    If Not ersatzWahl Is Nothing Then ersatzWahl.RemoveAll
End Sub

' ---------------------------------------------------------------- Hilfsfunktionen Verarbeitung
Private Function Nz(v As Variant) As Variant
    If IsError(v) Or IsEmpty(v) Or IsNull(v) Then Nz = "" Else Nz = v
End Function

Private Function Sauber(v As Variant) As String
    ' Text ohne Rand und ohne das Trennzeichen der Schluessel
    Sauber = Replace(Trim$(CStr(Nz(v))), TRENNER, "/")
End Function

Public Function Verdichten(t As String) As String
    Dim s As String
    s = Trim$(Replace(Replace(Replace(t, vbTab, " "), vbLf, " "), TRENNER, "/"))
    Do While InStr(s, "  ") > 0: s = Replace(s, "  ", " "): Loop
    Verdichten = s
End Function

Public Function PostkorbNorm(t As String) As String
    Dim s As String
    s = Verdichten(t)
    If Len(s) = 0 Then s = "(ohne Postkorb)"
    PostkorbNorm = s
End Function

Public Sub GevoTyp(gevo As String, ByRef typ As String, ByRef nr As Long)
    ' "SV 108 Bestandsübertragung" -> "108 Bestandsübertragung", 108 ; ". Ohne Zuordnung" -> "Ohne Zuordnung", 0
    Dim s As String, p As Long, erstes As String, zahl As String, i As Long
    s = Verdichten(gevo)
    nr = 0
    zahl = ""
    If Len(s) = 0 Then typ = "(ohne GeVo)": Exit Sub
    p = InStr(s, " ")
    If p = 3 Then
        erstes = Left$(s, 2)
        If erstes Like "[A-Z][A-Z]" Then s = Mid$(s, 4)
    End If
    Do While Len(s) > 0 And (Left$(s, 1) = "." Or Left$(s, 1) = " ")
        s = Mid$(s, 2)
    Loop
    typ = s
    For i = 1 To Len(s)
        If Mid$(s, i, 1) Like "#" Then zahl = zahl & Mid$(s, i, 1) Else Exit For
    Next i
    If Len(zahl) > 0 Then nr = CLng(zahl)
End Sub

Private Function AlterKlasse(v As Variant) As Long
    Dim t As Double
    If IsNumeric(v) Then t = CDbl(v) Else t = 0
    If t <= 7 Then
        AlterKlasse = 0
    ElseIf t <= 30 Then
        AlterKlasse = 1
    ElseIf t <= 90 Then
        AlterKlasse = 2
    Else
        AlterKlasse = 3
    End If
End Function

Private Function SpartenZuordnung() As Object
    Dim d As Object, ws As Worksheet, r As Long, daten As Variant
    Set d = CreateObject("Scripting.Dictionary")
    Set ws = ThisWorkbook.Worksheets("Konfiguration")
    daten = ws.Range("A11:B40").Value2
    For r = 1 To UBound(daten, 1)
        If Len(Trim$(CStr(Nz(daten(r, 1))))) > 0 Then
            If Not d.Exists(Trim$(CStr(daten(r, 1)))) Then d.Add Trim$(CStr(daten(r, 1))), Trim$(CStr(Nz(daten(r, 2))))
        End If
    Next r
    Set SpartenZuordnung = d
End Function

' ---------------------------------------------------------------- Ordner
Public Function RohdatenPfad() As String
    ' fuer den Tagesablauf: aufgeloester Rohdaten-Ordner (leer, wenn der Pfad nicht aufgeloest werden kann)
    On Error Resume Next
    RohdatenPfad = RohdatenOrdner()
    On Error GoTo 0
End Function

' Rohdaten-Ordner. Ist er nur als SharePoint-Adresse erreichbar (Master-Datei aus dem Browser in der App geoeffnet), wird zuerst
' ein lokaler Ordner dazu gesucht (OneDrive-Verknuepfung oder Synchronisierung, auch wenn die Verknuepfung nur auf „Rohdaten“
' oder auf die ganze Bibliothek „Dokumente“ gesetzt ist) – dann kann das Makro umbenennen und ablegen wie mit Dateipfad.
Private Function RohdatenOrdner() As String
    Dim p As String, l As String
    p = OrdnerAufloesen(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B3").Value), "Rohdaten")
    If IstUrl(p) Then
        If rohLokalUrl = p And Len(rohLokal) > 0 Then
            If OrdnerVorhanden(rohLokal) Then RohdatenOrdner = rohLokal: Exit Function
        End If
        l = LokalFuerOrdner(p)
        If Len(l) > 0 Then
            rohLokalUrl = p
            rohLokal = l & Application.PathSeparator
            LogSchreiben "  Rohdaten lokal gefunden (OneDrive-Verknuepfung/Sync): " & l
            RohdatenOrdner = rohLokal
            Exit Function
        End If
        LogSchreiben "  Rohdaten: kein lokaler Ordner zu " & p & " gefunden (OneDrive-Verknuepfung fehlt, OneDrive-Client aus oder noch nicht synchronisiert)"
    End If
    RohdatenOrdner = p
End Function

' Lokaler Ordner zu einer SharePoint-Ordneradresse: Zuordnung des OneDrive-Clients (Registry), sonst Suche unter den OneDrive-
' Ordnern und ihren Unterordnern (eine Verknuepfung heisst wie der Ordner, auf den sie zeigt: „Rohdaten“, „BÜ - HS“,
' „Dokumente“ …) und unter den Bibliotheksordnern im Benutzerprofil. Jedes Ende der Adresse wird probiert. Ein Treffer zaehlt nur,
' wenn dort dieselben Dateien liegen wie in der SharePoint-Auflistung (Power Query) – ein fremder Ordner „Rohdaten“ wird so nicht genommen.
Private Function LokalFuerOrdner(url As String) As String
    Dim ud As String, teile() As String, sep As String, kand As String, w As Variant, j As Long, m As Long
    On Error GoTo Ende
    sep = Application.PathSeparator
    ud = Replace(UrlDekodieren(url), "\", "/")
    Do While Right$(ud, 1) = "/": ud = Left$(ud, Len(ud) - 1): Loop
    kand = SyncPfad(ud)
    If Len(kand) > 0 Then
        If OrdnerVorhanden(kand & sep) Then
            If PasstZurListe(kand, url) Then LokalFuerOrdner = kand: Exit Function
        End If
    End If
    teile = Split(ud, "/")
    For Each w In SuchWurzeln()
        For j = 3 To UBound(teile)
            kand = CStr(w)
            For m = j To UBound(teile)
                kand = kand & sep & teile(m)
            Next m
            If OrdnerVorhanden(kand & sep) Then
                If PasstZurListe(kand, url) Then LokalFuerOrdner = kand: Exit Function
            End If
        Next j
    Next w
Ende:
End Function

' Registry des OneDrive-Clients: laengste passende Bibliotheksadresse -> lokaler Ordner (ohne Pruefung)
Private Function SyncPfad(ud As String) As String
    Const HKCU As Long = &H80000001
    Dim reg As Object, schluessel As Variant, k As Variant, ns As Variant, mp As Variant, basis As String, n As String, u As String, best As Long
    On Error GoTo Ende
    Set reg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")
    basis = "Software\SyncEngines\Providers\OneDrive"
    reg.EnumKey HKCU, basis, schluessel
    If Not IsArray(schluessel) Then Exit Function
    u = LCase$(ud) & "/"
    For Each k In schluessel
        ns = Empty: mp = Empty
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "UrlNamespace", ns
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "MountPoint", mp
        If Not IsNull(ns) And Not IsEmpty(ns) And Not IsNull(mp) And Not IsEmpty(mp) Then
            n = LCase$(Replace(UrlDekodieren(CStr(ns)), "\", "/"))
            If Right$(n, 1) <> "/" Then n = n & "/"
            If Len(n) > best And Left$(u, Len(n)) = n Then
                SyncPfad = CStr(mp) & Application.PathSeparator & Replace(Mid$(ud & "/", Len(n) + 1), "/", Application.PathSeparator)
                Do While Right$(SyncPfad, 1) = Application.PathSeparator: SyncPfad = Left$(SyncPfad, Len(SyncPfad) - 1): Loop
                best = Len(n)
            End If
        End If
    Next k
Ende:
End Function

' Orte, unter denen eine OneDrive-Verknuepfung oder synchronisierte Bibliothek liegen kann
Private Function SuchWurzeln() As Collection
    Dim c As New Collection, v As Variant, w As Variant, u As Variant
    On Error Resume Next
    For Each v In Array(Environ$("OneDriveCommercial"), Environ$("OneDrive"), Environ$("OneDriveConsumer"))
        If Len(CStr(v)) > 0 Then
            c.Add CStr(v)
            For Each w In UnterOrdner(CStr(v))
                c.Add CStr(w)                                  ' Verknuepfung auf eine ganze Bibliothek („Dokumente“) oder einen Oberordner
            Next w
        End If
    Next v
    If Len(Environ$("USERPROFILE")) > 0 Then                 ' Bibliotheksordner (z. B. C:\Users\x\ERGO\PV Dashboard - Dokumente)
        For Each w In UnterOrdner(Environ$("USERPROFILE"))
            For Each u In UnterOrdner(CStr(w))
                If InStr(1, CStr(u), " - ", vbTextCompare) > 0 Then c.Add CStr(u)
            Next u
        Next w
    End If
    Set SuchWurzeln = c
End Function

' Liegen im lokalen Ordner dieselben Dateien wie laut SharePoint-Auflistung? (mindestens drei bzw. alle, wenn es weniger sind)
Private Function PasstZurListe(lokal As String, url As String) As Boolean
    Dim d As Object, k As Variant, n As Long, treffer As Long
    On Error GoTo Ende
    Set d = SpListe(url)
    If d Is Nothing Then Exit Function
    If d.Count = 0 Then Exit Function
    For Each k In d.Keys
        n = n + 1
        If DateiVorhanden(lokal & Application.PathSeparator & CStr(k)) Then treffer = treffer + 1
        If treffer >= 3 Then PasstZurListe = True: Exit Function
        If n >= 60 Then Exit For
    Next k
    PasstZurListe = (treffer > 0 And treffer = d.Count)
Ende:
End Function

Private Function OrdnerAufloesen(eintrag As String, standard As String) As String
    ' Relativer Eintrag (Konfiguration) -> Ordner neben der Master-Datei; absoluter Pfad bleibt. Ergebnis endet mit Trenner.
    ' Liegt die Master-Datei auf SharePoint und ist kein Dateipfad erreichbar, ist das Ergebnis eine https-Adresse (endet mit /).
    ' Ein Eintrag als SharePoint-Adresse (Adresszeile des Browsers) wird als Ordneradresse uebernommen.
    Dim p As String, b As String
    p = Trim$(eintrag)
    If Len(p) = 0 Then p = standard
    If IstUrl(p) Then
        p = SharePointOrdnerUrl(p)
    ElseIf InStr(p, ":") = 0 And Left$(p, 2) <> "\\" Then
        b = BasisOrdner()
        If IstUrl(b) Then
            p = b & "/" & Replace(p, "\", "/")
        Else
            p = b & Application.PathSeparator & p
        End If
    End If
    If IstUrl(p) Then
        If Right$(p, 1) <> "/" Then p = p & "/"
    ElseIf Right$(p, 1) <> Application.PathSeparator Then
        p = p & Application.PathSeparator
    End If
    OrdnerAufloesen = p
End Function

Public Function IstUrl(p As String) As Boolean
    IstUrl = (LCase$(Left$(p, 7)) = "http://" Or LCase$(Left$(p, 8)) = "https://")
End Function

' Ordner + relativer Pfad (Trenner \); bei einer https-Adresse mit /
Private Function PfadVon(ordner As String, rel As String) As String
    If IstUrl(ordner) Then
        PfadVon = ordner & Replace(rel, Application.PathSeparator, "/")
    Else
        PfadVon = ordner & rel
    End If
End Function

' Liegen die Rohdaten auf SharePoint ohne Dateipfad (Laden ueber https)? Fuer Karten und Knoepfe.
Public Function RohdatenAufSharePoint() As Boolean
    RohdatenAufSharePoint = IstUrl(RohdatenPfad())
End Function

' Textdatei des Tools im Ordner Protokolle neben der Master-Datei (lokal bzw. synchronisiert): Ordner anlegen, eine Datei vom
' bisherigen Ort (neben der Master-Datei) beim ersten Zugriff dorthin umziehen. Geht das Anlegen nicht: bisheriger Ort.
Private Function ProtokollPfad(b As String, datei As String) As String
    Dim o As String, alt As String, sep As String
    sep = Application.PathSeparator
    o = b & sep & PROTOKOLL_ORDNER
    alt = b & sep & datei
    On Error Resume Next
    If Len(Dir(o, vbDirectory)) = 0 Then MkDir o
    If Len(Dir(o, vbDirectory)) = 0 Then ProtokollPfad = alt: Exit Function
    ProtokollPfad = o & sep & datei
    If Len(Dir(alt)) > 0 Then
        If Len(Dir(ProtokollPfad)) = 0 Then Name alt As ProtokollPfad
    End If
End Function

' Ladelog.txt: Protokolle neben der lokal erreichbaren Master-Datei, sonst %LOCALAPPDATA%\BUE_Reporting
Private Function LokalerProtokollPfad(datei As String) As String
    Dim b As String
    On Error Resume Next
    b = BasisOrdner()
    If Len(b) > 0 And Not IstUrl(b) Then LokalerProtokollPfad = ProtokollPfad(b, datei): Exit Function
    LokalerProtokollPfad = AppDatenOrdner() & Application.PathSeparator & datei
End Function

' SharePoint ohne Dateipfad: Mappe als Text (xlTextWindows) in <Master-Ordner>/Protokolle speichern; fehlt der Ordner (Excel
' kann ueber https keinen anlegen), neben die Master-Datei wie bisher. Ergebnis: Adresse; ein Fehler am bisherigen Ort geht weiter.
Private Function SpTextSpeichern(wb As Workbook, b As String, datei As String) As String
    Dim ziel As String, nr As Long, txt As String
    Application.DisplayAlerts = False
    ziel = b & "/" & PROTOKOLL_ORDNER & "/" & datei
    On Error Resume Next
    wb.SaveAs FileName:=ziel, FileFormat:=20
    nr = Err.Number
    On Error GoTo 0
    If nr <> 0 Then
        LogSchreiben "  Ordner " & PROTOKOLL_ORDNER & " auf SharePoint nicht beschreibbar (fehlt?) - " & datei & " neben der Master-Datei"
        ziel = b & "/" & datei
        On Error Resume Next
        wb.SaveAs FileName:=ziel, FileFormat:=20
        nr = Err.Number: txt = Err.Description
        On Error GoTo 0
    End If
    Application.DisplayAlerts = True
    If nr <> 0 Then Err.Raise nr, , txt
    SpTextSpeichern = ziel
End Function

' Ordner fuer Logs, wenn die Master-Datei nur ueber https erreichbar ist: %LOCALAPPDATA%\BUE_Reporting (sonst %TEMP%)
Private Function LokalerOrdner() As String
    Dim b As String
    On Error Resume Next
    b = BasisOrdner()
    If Len(b) > 0 And Not IstUrl(b) Then LokalerOrdner = b: Exit Function
    LokalerOrdner = AppDatenOrdner()
End Function

' %LOCALAPPDATA%\BUE_Reporting (sonst %TEMP%\BUE_Reporting) – bleibt bei einem Wechsel der Master-Datei erhalten
Private Function AppDatenOrdner() As String
    Dim b As String
    On Error Resume Next
    b = Environ$("LOCALAPPDATA")
    If Len(b) = 0 Then b = Environ$("TEMP")
    b = b & Application.PathSeparator & "BUE_Reporting"
    If Len(Dir(b, vbDirectory)) = 0 Then MkDir b
    AppDatenOrdner = b
End Function

Public Function BasisOrdner() As String
    ' Ordner der Master-Datei. Liegt die Datei auf SharePoint/OneDrive, liefert ThisWorkbook.Path eine https-Adresse, mit der Dir(),
    ' Name und MkDir nicht arbeiten (Laufzeitfehler 52). Dann wird ein Dateipfad gesucht – ohne Warten, ohne Dialog:
    '   1. Konfiguration!B7 als Dateipfad (wenn die Master-Datei dort liegt)
    '   2. lokaler Pfad (Datei liegt auf C:, H:, \\server …)
    '   3. synchronisierte Bibliothek laut Windows-Registry (OneDrive-Client: UrlNamespace -> MountPoint)
    '   4. WebDAV-Pfad \\host@SSL\DavWWWRoot\… – nur wenn der Windows-Dienst WebClient bereits laeuft (ein Versuch)
    '   5. OneDrive-Ordner und Bibliotheksordner unter dem Benutzerprofil (Verknuepfung „Zu OneDrive hinzufuegen“, Sync)
    '   6. Rohdaten-Ordner absolut eingetragen (Konfiguration!B3, z. B. H:\…\Rohdaten): dessen uebergeordneter Ordner
    '   7. sonst die https-Adresse selbst: Laden ueber SharePoint (Power Query listet, Workbooks.Open oeffnet ueber https)
    ' Das Ergebnis wird je Sitzung gemerkt (auch die https-Adresse), damit die Suche nur einmal laeuft.
    Dim p As String, k As String, kand As String, roh As String
    k = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B7").Value))
    If Len(k) > 0 And Not IstUrl(k) Then
        If Right$(k, 1) = Application.PathSeparator Then k = Left$(k, Len(k) - 1)
        If DateiVorhanden(k & Application.PathSeparator & ThisWorkbook.Name) Then
            BasisOrdner = k
            Exit Function
        End If
    End If
    p = ThisWorkbook.Path
    If Not IstUrl(p) Then
        BasisOrdner = p
        Exit Function
    End If
    If Len(basisCache) > 0 Then
        If basisCacheUrl = p Then BasisOrdner = basisCache: Exit Function
    End If
    kand = SyncZuordnung(p)
    If Len(kand) = 0 Then kand = WebDavPfad(p)
    If Len(kand) = 0 Then kand = ProfilSuche(p)
    If Len(kand) = 0 Then
        roh = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B3").Value))
        If InStr(roh, ":") > 0 And Not IstUrl(roh) Or Left$(roh, 2) = "\\" Then
            If Right$(roh, 1) = Application.PathSeparator Then roh = Left$(roh, Len(roh) - 1)
            If OrdnerVorhanden(roh & Application.PathSeparator) And InStrRev(roh, Application.PathSeparator) > 3 Then
                kand = Left$(roh, InStrRev(roh, Application.PathSeparator) - 1)      ' Logs, Präsentationen neben dem Rohdaten-Ordner
            End If
        End If
    End If
    If Len(kand) = 0 Then
        kand = p                                                                    ' SharePoint direkt ueber https
        Do While Right$(kand, 1) = "/": kand = Left$(kand, Len(kand) - 1): Loop
    End If
    basisCache = kand: basisCacheUrl = p
    BasisOrdner = kand
End Function

' Synchronisierte SharePoint-/OneDrive-Bibliothek: HKCU\Software\SyncEngines\Providers\OneDrive\<id> mit UrlNamespace (Adresse der
' Bibliothek) und MountPoint (lokaler Ordner). Die laengste passende Adresse gewinnt.
Private Function SyncZuordnung(url As String) As String
    Const HKCU As Long = &H80000001
    Dim reg As Object, schluessel As Variant, k As Variant, ns As Variant, mp As Variant, basis As String
    Dim u As String, ud As String, n As String, best As Long, kand As String
    On Error GoTo Ende
    Set reg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")
    basis = "Software\SyncEngines\Providers\OneDrive"
    reg.EnumKey HKCU, basis, schluessel
    If Not IsArray(schluessel) Then Exit Function
    ud = Replace(UrlDekodieren(url), "\", "/")
    If Right$(ud, 1) <> "/" Then ud = ud & "/"
    u = LCase$(ud)
    For Each k In schluessel
        ns = Empty: mp = Empty
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "UrlNamespace", ns
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "MountPoint", mp
        If Not IsNull(ns) And Not IsEmpty(ns) And Not IsNull(mp) And Not IsEmpty(mp) Then
            n = LCase$(Replace(UrlDekodieren(CStr(ns)), "\", "/"))
            If Right$(n, 1) <> "/" Then n = n & "/"
            If Len(n) > best And Left$(u, Len(n)) = n Then
                kand = CStr(mp) & Application.PathSeparator & Replace(Mid$(ud, Len(n) + 1), "/", Application.PathSeparator)
                Do While Right$(kand, 1) = Application.PathSeparator: kand = Left$(kand, Len(kand) - 1): Loop
                If DateiVorhanden(kand & Application.PathSeparator & ThisWorkbook.Name) Then SyncZuordnung = kand: best = Len(n)
            End If
        End If
    Next k
Ende:
End Function

' SharePoint als WebDAV-Pfad: https://host/sites/… -> \\host@SSL\DavWWWRoot\sites\… Nur wenn der Windows-Dienst WebClient laeuft –
' sonst blockiert schon die Pruefung des Pfads (Windows sucht ihn erst als Netzwerkfreigabe). Microsoft hat WebClient im
' November 2023 abgekuendigt, er startet nicht mehr von selbst; deshalb kein Startversuch und kein Warten.
Private Function WebDavPfad(url As String) As String
    Dim kand As Variant
    On Error GoTo Ende
    If Len(WebDavVorschlag(url)) = 0 Then Exit Function
    If Not WebClientLaeuft() Then Exit Function
    For Each kand In Array(WebDavVorschlag(url), Replace(WebDavVorschlag(url), "@SSL\DavWWWRoot\", "@SSL\"))
        If DateiVorhanden(CStr(kand) & Application.PathSeparator & ThisWorkbook.Name) Then WebDavPfad = CStr(kand): Exit Function
    Next kand
Ende:
End Function

Private Function WebClientLaeuft() As Boolean
    Dim wmi As Object, dienste As Object, d As Object
    On Error GoTo Ende
    Set wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
    Set dienste = wmi.ExecQuery("SELECT State FROM Win32_Service WHERE Name='WebClient'")
    For Each d In dienste
        If LCase$(CStr(d.State)) = "running" Then WebClientLaeuft = True
    Next d
Ende:
End Function

' Eintrag in der Konfiguration als SharePoint-Adresse (Adresszeile des Browsers) -> Ordneradresse https://host/sites/…/Ordner
' Erkennt …/Forms/AllItems.aspx?id=/sites/…&viewid=…, Freigabe-Adressen /:f:/r/… und die direkte Ordneradresse.
Private Function SharePointOrdnerUrl(eintrag As String) As String
    Dim u As String, host As String, rel As String, p As Long, q As Long
    u = Trim$(eintrag)
    p = InStr(9, u, "/")
    If p = 0 Then SharePointOrdnerUrl = u: Exit Function
    host = Left$(u, p - 1)
    p = InStr(1, u, "?id=", vbTextCompare)
    If p = 0 Then p = InStr(1, u, "&id=", vbTextCompare)
    If p > 0 Then
        rel = Mid$(u, p + 4)
        q = InStr(rel, "&")
        If q > 0 Then rel = Left$(rel, q - 1)
        u = host & UrlDekodieren(rel)
    Else
        q = InStr(u, "?")
        If q > 0 Then u = Left$(u, q - 1)
        u = Replace(Replace(u, "/:f:/r/", "/"), "/:x:/r/", "/")
        If InStr(1, u, "/Forms/", vbTextCompare) > 0 Then u = Left$(u, InStr(1, u, "/Forms/", vbTextCompare) - 1)
        u = UrlDekodieren(u)
    End If
    Do While Right$(u, 1) = "/": u = Left$(u, Len(u) - 1): Loop
    SharePointOrdnerUrl = u
End Function

Public Function WebDavVorschlag(url As String) As String
    Dim u As String, p As Long
    u = UrlDekodieren(url)
    If LCase$(Left$(u, 8)) <> "https://" Then Exit Function
    u = Mid$(u, 9)
    p = InStr(u, "/")
    If p = 0 Then Exit Function
    WebDavVorschlag = "\\" & Left$(u, p - 1) & "@SSL\DavWWWRoot\" & Replace(Mid$(u, p + 1), "/", "\")
    Do While Right$(WebDavVorschlag, 1) = "\": WebDavVorschlag = Left$(WebDavVorschlag, Len(WebDavVorschlag) - 1): Loop
End Function

' OneDrive-Ordner (Umgebungsvariablen) und Bibliotheksordner unter dem Benutzerprofil (z. B. C:\Users\x\ERGO\PV Dashboard - Dokumente):
' das Ende der Adresse (ab beliebigem Teil) darunter suchen, auch eine und zwei Ebenen tiefer
Private Function ProfilSuche(url As String) As String
    Dim teile() As String, wurzeln As Collection, w As Variant, unter As Collection, u2 As Collection, e As String, j As Long, m As Long, kand As String
    Dim sep As String, v As Variant
    On Error GoTo Ende
    sep = Application.PathSeparator
    teile = Split(Replace(UrlDekodieren(url), "\", "/"), "/")
    Set wurzeln = New Collection
    For Each v In Array(Environ$("OneDriveCommercial"), Environ$("OneDriveConsumer"), Environ$("OneDrive"), Environ$("USERPROFILE"))
        If Len(CStr(v)) > 0 Then wurzeln.Add CStr(v)
    Next v
    If Len(Environ$("USERPROFILE")) > 0 Then                 ' Bibliotheksordner: zwei Ebenen unter dem Profil
        Set unter = UnterOrdner(Environ$("USERPROFILE"))
        For Each w In unter
            wurzeln.Add CStr(w)
            Set u2 = UnterOrdner(CStr(w))
            For Each v In u2
                If InStr(1, CStr(v), " - ", vbTextCompare) > 0 Then wurzeln.Add CStr(v)
            Next v
        Next w
    End If
    For Each w In wurzeln
        For j = 3 To UBound(teile)
            kand = CStr(w)
            For m = j To UBound(teile)
                kand = kand & sep & teile(m)
            Next m
            If DateiVorhanden(kand & sep & ThisWorkbook.Name) Then ProfilSuche = kand: Exit Function
        Next j
    Next w
Ende:
End Function

Private Function UnterOrdner(ordner As String) As Collection
    Dim c As New Collection, e As String, sep As String
    sep = Application.PathSeparator
    On Error Resume Next
    e = Dir(ordner & sep & "*", vbDirectory)
    Do While Len(e) > 0
        If e <> "." And e <> ".." And Left$(e, 1) <> "." Then
            If (GetAttr(ordner & sep & e) And vbDirectory) = vbDirectory Then c.Add ordner & sep & e
        End If
        e = Dir()
    Loop
    Set UnterOrdner = c
End Function

Private Function UrlDekodieren(u As String) As String
    ' %XX-Folgen (UTF-8) in Text zurueckwandeln, z. B. %C3%BC -> ü
    Dim i As Long, bytes() As Byte, n As Long, s As String, stream As Object
    On Error GoTo Roh
    ReDim bytes(0 To Len(u) * 3)
    n = 0
    i = 1
    Do While i <= Len(u)
        If Mid$(u, i, 1) = "%" And i + 2 <= Len(u) Then
            bytes(n) = CByte("&H" & Mid$(u, i + 1, 2))
            n = n + 1
            i = i + 3
        Else
            s = Mid$(u, i, 1)
            If AscW(s) < 128 Then
                bytes(n) = AscW(s): n = n + 1
            Else
                ' Zeichen ausserhalb ASCII unveraendert als UTF-8 uebernehmen
                Dim t As Object
                Set t = CreateObject("ADODB.Stream")
                t.Type = 2: t.Charset = "utf-8": t.Open: t.WriteText s: t.Position = 0: t.Type = 1
                Dim b() As Byte, q As Long
                b = t.Read
                t.Close
                For q = 3 To UBound(b)          ' ohne BOM
                    bytes(n) = b(q): n = n + 1
                Next q
            End If
            i = i + 1
        End If
    Loop
    If n = 0 Then UrlDekodieren = "": Exit Function
    ReDim Preserve bytes(0 To n - 1)
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 1: stream.Open: stream.Write bytes: stream.Position = 0
    stream.Type = 2: stream.Charset = "utf-8"
    UrlDekodieren = stream.ReadText
    stream.Close
    Exit Function
Roh:
    UrlDekodieren = Replace(u, "%20", " ")
End Function

Private Function OrdnerVorhanden(pfad As String) As Boolean
    If IstUrl(pfad) Then OrdnerVorhanden = Not (SpListe(pfad) Is Nothing): Exit Function
    On Error Resume Next
    OrdnerVorhanden = (Len(Dir(pfad, vbDirectory)) > 0)
    On Error GoTo 0
End Function

Private Function DateiVorhanden(pfad As String) As Boolean
    If IstUrl(pfad) Then DateiVorhanden = IsArray(SpEintrag(pfad)): Exit Function
    On Error Resume Next
    DateiVorhanden = (Len(Dir(pfad)) > 0)
    On Error GoTo 0
End Function

' ---------------------------------------------------------------- SharePoint ohne Dateipfad (https)
' Excel kann einen SharePoint-Ordner nicht mit Dir() lesen, Power Query aber schon – mit der Anmeldung des Office-Kontos, ohne
' OneDrive und ohne WebDAV. SpListe schreibt die Abfrage BUE_SharePoint_Liste fuer den Ordner (SharePoint.Contents, Ordner fuer
' Ordner; findet sie den Ordner so nicht, SharePoint.Files ueber die ganze Seite), laedt sie in das ausgeblendete Blatt SP_Liste
' und merkt das Ergebnis je Ordner fuer diese Sitzung: Dateiname relativ zum Ordner (mit Ablage JJJJ\MM_Monat), Aenderungsdatum,
' Groesse. Beim ersten Mal fragt Excel nach der Anmeldung (Organisationskonto/Microsoft-Konto, „Anmelden“, „Verbinden“).
Private Function SpListe(ordnerUrl As String) As Object
    Dim key As String, m As String, d As Object, a As Variant, r As Long, rel As String
    key = SpSchluessel(ordnerUrl)
    If spListen Is Nothing Then Set spListen = CreateObject("Scripting.Dictionary")
    If spListen.Exists(key) Then Set SpListe = spListen(key): Exit Function
    spFehler = ""
    m = SpFormel(ordnerUrl)
    If Len(m) = 0 Then spFehler = "Die Adresse ist keine SharePoint-Ordneradresse.": Exit Function
    On Error GoTo Fehler
    a = SpTabelle(SP_ABFRAGE, m, "A1", "Dateien eines SharePoint-Ordners für das BÜ-Reporting (wird vom Tool geschrieben)")
    Set d = CreateObject("Scripting.Dictionary")
    d.CompareMode = vbTextCompare
    If IsArray(a) Then
        For r = 1 To UBound(a, 1)
            rel = Replace(CStr(Nz(a(r, 1))), "/", Application.PathSeparator)
            If Len(rel) > 0 Then d(rel) = Array(rel, a(r, 2), a(r, 3))
        Next r
    End If
    spListen.Add key, d
    Set SpListe = d
    Exit Function
Fehler:
    spFehler = Err.Description
    Set SpListe = Nothing
End Function

' Power-Query-Abfrage schreiben, in das Blatt SP_Liste ab zelle laden und als Werte (1-basiert, 2D) liefern; Empty = keine Zeilen.
' Fehler (Anmeldung abgebrochen, Adresse falsch) werden an den Aufrufer weitergegeben.
Private Function SpTabelle(abfrage As String, formel As String, zelle As String, beschreibung As String) As Variant
    Dim ws As Worksheet, lo As ListObject, q As Object, a As Variant, e(1 To 1, 1 To 1) As Variant
    Set ws = SpBlatt()
    Set q = Nothing
    On Error Resume Next
    Set q = ThisWorkbook.Queries(abfrage)
    Set lo = ws.Range(zelle).ListObject
    On Error GoTo 0
    If q Is Nothing Then
        ThisWorkbook.Queries.Add abfrage, formel, beschreibung
    ElseIf q.Formula <> formel Then
        q.Formula = formel
    End If
    If lo Is Nothing Then
        Set lo = ws.ListObjects.Add(SourceType:=0, Source:="OLEDB;Provider=Microsoft.Mashup.OleDb.1;Data Source=$Workbook$;Location=" & _
                                    abfrage & ";Extended Properties=""""", Destination:=ws.Range(zelle))
        With lo.QueryTable
            .CommandType = xlCmdSql
            .CommandText = Array("SELECT * FROM [" & abfrage & "]")
            .RefreshStyle = xlInsertDeleteCells
            .AdjustColumnWidth = False
        End With
    End If
    lo.QueryTable.BackgroundQuery = False
    Application.DisplayAlerts = True                          ' Anmeldefenster von Power Query muss erscheinen duerfen
    lo.QueryTable.Refresh BackgroundQuery:=False
    If lo.ListRows.Count = 0 Then Exit Function
    a = lo.DataBodyRange.Value2
    If Not IsArray(a) Then e(1, 1) = a: a = e                 ' eine Zelle: trotzdem 2D
    SpTabelle = a
End Function

Private Function SpSchluessel(ordnerUrl As String) As String
    Dim u As String
    u = LCase$(UrlDekodieren(ordnerUrl))
    If Right$(u, 1) <> "/" Then u = u & "/"
    SpSchluessel = u
End Function

' Eintrag einer Datei (https-Adresse) aus der Auflistung ihres Ordners: Array(rel, geaendert, groesse), sonst Empty
Private Function SpEintrag(pfad As String) As Variant
    Dim u As String, k As Variant, rel As String
    If spListen Is Nothing Then Exit Function
    u = LCase$(UrlDekodieren(pfad))
    For Each k In spListen.Keys
        If Left$(u, Len(CStr(k))) = CStr(k) Then
            rel = Replace(Mid$(UrlDekodieren(pfad), Len(CStr(k)) + 1), "/", Application.PathSeparator)
            If spListen(k).Exists(rel) Then SpEintrag = spListen(k)(rel): Exit Function
        End If
    Next k
End Function

Private Function SpBlatt() As Worksheet
    Dim ws As Worksheet, akt As Object
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(SP_BLATT)
    On Error GoTo 0
    If ws Is Nothing Then
        Set akt = ActiveSheet
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = SP_BLATT
        ws.Range("J1").Value = "Im Tool ausgeblendete Rohdateien (SharePoint: gelöscht oder nicht übernommen)"
        ws.Visible = xlSheetVeryHidden
        If Not akt Is Nothing Then akt.Activate
    End If
    Set SpBlatt = ws
End Function

' Power-Query-Formel fuer einen Ordner https://host/sites/<Seite>/<Bibliothek>/<Ordner>…: Dateien des Ordners und der Ablage
' JJJJ\MM_Monat (Spalten Rel, Geaendert, Groesse)
Private Function SpFormel(ordnerUrl As String) As String
    Dim kopf As String, f As String
    kopf = SpKopf(ordnerUrl)
    If Len(kopf) = 0 Then Exit Function
    f = "let" & vbLf & kopf & _
        "    Groesse = (a) => try a[Size] otherwise null," & vbLf & _
        "    IstOrdner = (x) => Value.Is(x, type table)," & vbLf
    f = f & _
        "    Ebene = (t as table, rel as text, tiefe as number) as table =>" & vbLf & _
        "        let" & vbLf & _
        "            Dateien = Table.SelectRows(t, each not IstOrdner([Content]))," & vbLf & _
        "            Eigene = Table.FromColumns({List.Transform(Dateien[Name], each rel & _), Dateien[Date modified], List.Transform(Dateien[Attributes], Groesse)}, {""Rel"", ""Geaendert"", ""Groesse""})," & vbLf & _
        "            Unter = Table.SelectRows(t, each IstOrdner([Content]) and (if tiefe = 2 then Text.Length([Name]) = 4 and Text.Length(Text.Select([Name], {""0"".." & """9""})) = 4" & _
        " else Text.Length([Name]) > 3 and Text.Length(Text.Select(Text.Start([Name], 2), {""0"".." & """9""})) = 2 and Text.Middle([Name], 2, 1) = ""_""))," & vbLf & _
        "            Tiefer = if tiefe <= 0 then {} else List.Transform(Table.ToRecords(Unter), each @Ebene([Content], rel & [Name] & ""\"", tiefe - 1))" & vbLf & _
        "        in" & vbLf & _
        "            Table.Combine({Eigene} & Tiefer)," & vbLf
    f = f & _
        "    Navigiert = try List.Accumulate(Teile, SharePoint.Contents(Seite, [ApiVersion = 15]), (s, n) => s{[Name = n]}[Content]) otherwise null," & vbLf & _
        "    Ersatz = () =>" & vbLf & _
        "        let" & vbLf & _
        "            Alle = SharePoint.Files(Seite, [ApiVersion = 15])," & vbLf & _
        "            Treffer = Table.SelectRows(Alle, each Text.StartsWith(Text.Lower([Folder Path]), Ordner))," & vbLf & _
        "            Rel = List.Transform(Table.ToRecords(Treffer), each Text.Replace(Text.Middle([Folder Path], Text.Length(Ordner)), ""/"", ""\"") & [Name])" & vbLf & _
        "        in" & vbLf & _
        "            Table.FromColumns({Rel, Treffer[Date modified], List.Transform(Treffer[Attributes], Groesse)}, {""Rel"", ""Geaendert"", ""Groesse""})," & vbLf & _
        "    Ergebnis = if Navigiert = null then Ersatz() else Ebene(Navigiert, """", 2)" & vbLf & _
        "in" & vbLf & _
        "    Ergebnis"
    SpFormel = f
End Function

' Gemeinsamer Anfang der Abfragen: Seite (https://host/sites/<Seite>), Teile (Bibliothek und Ordner) und Ordner (Adresse klein, mit /)
Private Function SpKopf(ordnerUrl As String) As String
    Dim u As String, host As String, teile() As String, i As Long, ab As Long, seite As String, liste As String, p As Long
    u = UrlDekodieren(ordnerUrl)
    Do While Right$(u, 1) = "/": u = Left$(u, Len(u) - 1): Loop
    If Not IstUrl(u) Then Exit Function
    p = InStr(9, u, "/")
    If p = 0 Then Exit Function
    host = Left$(u, p - 1)
    teile = Split(Mid$(u, p + 1), "/")
    ab = 0
    seite = host
    If UBound(teile) >= 1 Then
        If LCase$(teile(0)) = "sites" Or LCase$(teile(0)) = "teams" Then seite = host & "/" & teile(0) & "/" & teile(1): ab = 2
    End If
    For i = ab To UBound(teile)
        liste = liste & IIf(Len(liste) > 0, ", ", "") & MText(teile(i))
    Next i
    SpKopf = "    Seite = " & MText(seite) & "," & vbLf & _
             "    Teile = {" & liste & "}," & vbLf & _
             "    Ordner = " & MText(LCase$(u) & "/") & "," & vbLf
End Function

' Abfrage: Zeilen einer Textdatei im SharePoint-Ordner (Windows-1252 wie Print #), keine Datei = keine Zeilen. Ein Abruffehler
' (Netz, Drosselung, Anmeldung) wird NICHT als „Datei fehlt“ verschluckt, sondern laesst die Abfrage scheitern – sonst wuerde das
' Protokoll beim Zurueckschreiben nur mit den neuen Zeilen ueberschrieben.
' unter (12.90): zuerst im Unterordner (Protokolle) suchen, sonst im Ordner der Master-Datei (bisheriger Ort)
Private Function SpTextFormel(ordnerUrl As String, datei As String, Optional unter As String = "") As String
    Dim kopf As String
    kopf = SpKopf(ordnerUrl)
    If Len(kopf) = 0 Then Exit Function
    ' Pruefen: Im gelesenen Ordner muss die Master-Datei selbst liegen – nur dann bedeutet „Protokoll nicht gefunden“ wirklich,
    ' dass es fehlt (sonst Fehler, und es wird nichts ueberschrieben)
    SpTextFormel = "let" & vbLf & kopf & _
        "    Name = " & MText(datei) & "," & vbLf & _
        "    Unter = " & MText(unter) & "," & vbLf & _
        "    Master = " & MText(ThisWorkbook.Name) & "," & vbLf & _
        "    Pruefen = (t as table) as table => if Table.IsEmpty(Table.SelectRows(t, each Text.Lower([Name]) = Text.Lower(Master))) then error ""Ordner der Master-Datei nicht erkannt"" else t," & vbLf & _
        "    Navigiert = try List.Accumulate(Teile, SharePoint.Contents(Seite, [ApiVersion = 15]), (s, n) => s{[Name = n]}[Content]) otherwise null," & vbLf & _
        "    Geprueft = if Navigiert = null then null else Pruefen(Navigiert)," & vbLf & _
        "    UnterZeile = if Geprueft = null or Unter = """" then null else Table.SelectRows(Geprueft, each Text.Lower([Name]) = Text.Lower(Unter))," & vbLf & _
        "    ImUnter = if UnterZeile = null or Table.IsEmpty(UnterZeile) then null else Table.SelectRows(UnterZeile{0}[Content], each Text.Lower([Name]) = Text.Lower(Name))," & vbLf & _
        "    Gefunden = if Geprueft = null then null else Table.SelectRows(Geprueft, each Text.Lower([Name]) = Text.Lower(Name))," & vbLf & _
        "    Direkt = if ImUnter <> null and not Table.IsEmpty(ImUnter) then ImUnter{0}[Content] else if Gefunden = null or Table.IsEmpty(Gefunden) then null else Gefunden{0}[Content]," & vbLf & _
        "    Ersatz = () =>" & vbLf & _
        "        let" & vbLf & _
        "            Alle = SharePoint.Files(Seite, [ApiVersion = 15])," & vbLf & _
        "            ImOrdner = Pruefen(Table.SelectRows(Alle, each Text.Lower([Folder Path]) = Ordner))," & vbLf & _
        "            Treffer = Table.SelectRows(ImOrdner, each Text.Lower([Name]) = Text.Lower(Name))," & vbLf & _
        "            TrefferU = if Unter = """" then Treffer else Table.SelectRows(Alle, each Text.Lower([Folder Path]) = Ordner & Text.Lower(Unter) & ""/"" and Text.Lower([Name]) = Text.Lower(Name))" & vbLf & _
        "        in" & vbLf & _
        "            if Table.RowCount(TrefferU) > 0 then TrefferU{0}[Content] else if Table.RowCount(Treffer) = 0 then null else Treffer{0}[Content]," & vbLf & _
        "    Inhalt = if Direkt <> null then Direkt else if Navigiert <> null then null else Ersatz()," & vbLf & _
        "    Zeilen = if Inhalt = null then {} else List.Select(Lines.FromBinary(Inhalt, null, null, 1252), each Text.Length(_) > 0)," & vbLf & _
        "    Ergebnis = Table.FromColumns({Zeilen}, {""Zeile""})" & vbLf & _
        "in" & vbLf & _
        "    Ergebnis"
End Function

Private Function MText(t As String) As String
    MText = """" & Replace(t, """", """""") & """"
End Function

' Meldung, wenn der SharePoint-Ordner nicht aufgelistet werden konnte
Private Function SpHinweis(ordner As String) As String
    SpHinweis = "Der SharePoint-Ordner konnte nicht aufgelistet werden:" & vbCrLf & ordner & vbCrLf & vbCrLf & _
        IIf(Len(spFehler) > 0, "Meldung: " & spFehler & vbCrLf & vbCrLf, "") & _
        "Excel liest SharePoint-Ordner über Power Query mit deiner Office-Anmeldung. Beim ersten Mal erscheint ein Anmeldefenster: " & _
        "links „Organisationskonto“ (oder „Microsoft-Konto“) wählen, „Anmelden“, dann „Verbinden“. Wurde es abgebrochen: " & _
        "Daten > Daten abrufen > Datenquelleneinstellungen, die SharePoint-Adresse wählen, „Berechtigungen löschen“ und erneut laden. " & _
        "Liegt der Ordner woanders: in Konfiguration B3 die Adresse des Ordners aus der Adresszeile des Browsers einfügen."
End Function

' SharePoint: Datei im Tool ausblenden (geloescht oder nicht uebernommen) – wird beim Laden und in der Liste uebergangen
' Ausgeblendet wird eine bestimmte Datei: SP_Liste!J Name, K Groesse (seit 12.89). MIS-O vergibt jeden Tag dieselben Namen
' („Rueckstand_Verbund.xlsx“) – nur der Name traf sonst auch den neuen Abzug des naechsten Tages (wurde ungeladen zu …_verworfen).
Private Sub SpAusblenden(rel As String, Optional ordner As String = "")
    Dim ws As Worksheet, r As Long, groesse As Double
    If Len(ordner) = 0 Then ordner = RohdatenOrdner()
    groesse = DateiGroesse(PfadVon(ordner, rel))
    If SpAusgeblendet(rel, groesse) Then Exit Sub
    Set ws = SpBlatt()
    r = ws.Cells(ws.Rows.Count, 10).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Cells(r, 10).Value = "'" & rel
    If groesse >= 0 Then ws.Cells(r, 11).Value = groesse
End Sub

' groesse < 0: unbekannt. Ein Eintrag mit Groesse gilt nur fuer eine Datei derselben Groesse; ein Eintrag ohne Groesse (vor 12.89)
' nur fuer Namen, die das Tool vergeben hat (JJJJMMTT_BUe_…, je Stichtag eindeutig), nicht fuer MIS-O-Namen.
Private Function SpAusgeblendet(rel As String, Optional groesse As Double = -1) As Boolean
    Dim ws As Worksheet, a As Variant, r As Long, letzte As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(SP_BLATT)
    On Error GoTo 0
    If ws Is Nothing Then Exit Function
    letzte = ws.Cells(ws.Rows.Count, 10).End(xlUp).Row
    If letzte < 2 Then Exit Function
    a = ws.Range(ws.Cells(2, 10), ws.Cells(letzte + 1, 11)).Value2
    For r = 1 To UBound(a, 1)
        If StrComp(CStr(Nz(a(r, 1))), rel, vbTextCompare) = 0 Then
            If IsNumeric(a(r, 2)) And Not IsEmpty(a(r, 2)) Then
                If groesse < 0 Or CDbl(a(r, 2)) = groesse Then SpAusgeblendet = True: Exit Function
            ElseIf DateiName(rel) Like "########_BUe_*" Or DateiName(rel) Like "########-########_BUe_*" Then
                SpAusgeblendet = True: Exit Function
            End If
        End If
    Next r
End Function

' ---------------------------------------------------------------- SharePoint: Ablage ueber die SharePoint-Schnittstelle (12.80)
' Excel kann auf SharePoint ohne Dateipfad nichts umbenennen oder verschieben (Name, MkDir und Kill brauchen einen Pfad). Power
' Query kann es: Web.Contents mit Inhalt schickt einen POST an die SharePoint-Schnittstelle (_api), mit dem Office-Konto
' (Organisationskonto) wie die Auflistung. SpAblagePruefen probiert das einmal je Laden harmlos aus (den Ordner Rohdaten
' „anlegen“, den es schon gibt); nur wenn das gelingt, legt das Tool auch auf SharePoint ab wie mit Dateipfad (JJJJ\MM_Monat,
' einheitlicher Name, …_verworfen, …_ersetzt). Ob eine Verschiebung gelungen ist, entscheidet danach eine frische Auflistung:
' Power Query kann eine Abfrage beim Aktualisieren mehr als einmal auswerten, ein zweiter Versuch meldet dann „nicht gefunden“,
' obwohl die Datei schon am Ziel liegt.

' Seite (https://host/sites/X) und server-relativer Pfad (/sites/X/Bibliothek/…) einer https-Adresse, ohne / am Ende
Private Function SpZerlegen(url As String, ByRef seite As String, ByRef pfad As String) As Boolean
    Dim u As String, p As Long, teile() As String, host As String
    u = UrlDekodieren(url)
    Do While Right$(u, 1) = "/": u = Left$(u, Len(u) - 1): Loop
    If Not IstUrl(u) Then Exit Function
    p = InStr(9, u, "/")
    If p = 0 Then Exit Function
    host = Left$(u, p - 1)
    pfad = Mid$(u, p)
    teile = Split(Mid$(u, p + 1), "/")
    seite = host
    If UBound(teile) >= 1 Then
        If LCase$(teile(0)) = "sites" Or LCase$(teile(0)) = "teams" Then seite = host & "/" & teile(0) & "/" & teile(1)
    End If
    SpZerlegen = True
End Function

' Abfrage fuer Schritte auf SharePoint, je Schritt Array(Art, A, B) mit server-relativen Pfaden: „ordner“ legt A an (gibt es
' ihn schon, antwortet SharePoint trotzdem mit 200), „verschieben“ verschiebt die Datei A nach B (ohne Ueberschreiben; erst
' MoveToUsingPath, sonst das aeltere moveto). Jeder Schritt wartet auf das Ergebnis des vorigen. Ergebnis je Schritt: Status, Text.
Private Function SpAblageFormel(seite As String, schritte As Collection) As String
    Dim f As String, s As Variant, liste As String
    For Each s In schritte
        liste = liste & IIf(Len(liste) > 0, ", ", "") & "[Art = " & MText(CStr(s(0))) & ", A = " & MText(CStr(s(1))) & ", B = " & MText(CStr(s(2))) & "]"
    Next s
    Randomize
    f = "let" & vbLf & _
        "    Seite = " & MText(seite) & "," & vbLf & _
        "    Schritte = {" & liste & "}," & vbLf & _
        "    Lauf = " & MText(Format$(Now, "yyyymmddhhnnss") & "-" & CStr(Int(Rnd() * 1000000))) & "," & vbLf & _
        "    Ausdruck = (t as text) as text => ""'"" & Text.Replace(t, ""'"", ""''"") & ""'""," & vbLf & _
        "    Senden = (rel as text, q as record) as record =>" & vbLf & _
        "        let" & vbLf & _
        "            Antwort = Web.Contents(Seite, [RelativePath = rel, Query = q, Headers = [Accept = ""application/json;odata=nometadata"", #""X-BUE-Lauf"" = Lauf], Content = Text.ToBinary(""""), ManualStatusHandling = {400, 401, 403, 404, 405, 409, 412, 423, 429, 500, 503}])," & vbLf & _
        "            Inhalt = Binary.Buffer(Antwort)," & vbLf & _
        "            Status = try Value.Metadata(Antwort)[Response.Status] otherwise 0" & vbLf & _
        "        in" & vbLf & _
        "            [Status = Status, Text = Text.Start(Text.Clean(try Text.FromBinary(Inhalt) otherwise """"), 240)]," & vbLf & _
        "    Gut = (e as record) as logical => e[Status] >= 200 and e[Status] < 300," & vbLf
    f = f & _
        "    Ausfuehren = (s as record) as record =>" & vbLf & _
        "        if s[Art] = ""ordner"" then" & vbLf & _
        "            let" & vbLf & _
        "                Neu = Senden(""_api/web/folders/add(@a)"", [#""@a"" = Ausdruck(s[A])])" & vbLf & _
        "            in" & vbLf & _
        "                if Gut(Neu) then Neu else Senden(""_api/web/folders/AddUsingPath(DecodedUrl=@a)"", [#""@a"" = Ausdruck(s[A])])" & vbLf & _
        "        else" & vbLf & _
        "            let" & vbLf & _
        "                Neu = Senden(""_api/web/GetFileByServerRelativePath(DecodedUrl=@a)/MoveToUsingPath(DecodedUrl=@b,moveOperations=0)"", [#""@a"" = Ausdruck(s[A]), #""@b"" = Ausdruck(s[B])])" & vbLf & _
        "            in" & vbLf & _
        "                if Gut(Neu) then Neu else Senden(""_api/web/GetFileByServerRelativeUrl(@a)/moveto(newurl=@b,flags=0)"", [#""@a"" = Ausdruck(s[A]), #""@b"" = Ausdruck(s[B])])," & vbLf & _
        "    Schritt = (bisher as list, s as record) as list =>" & vbLf & _
        "        let" & vbLf & _
        "            Vorher = if List.IsEmpty(bisher) then 0 else List.Last(bisher)[Status]," & vbLf & _
        "            Versuch = if Vorher >= 0 then try Ausfuehren(s) else try Ausfuehren(s)," & vbLf & _
        "            Erg = if Versuch[HasError] then [Status = -1, Text = Text.Start(Versuch[Error][Message], 240)] else Versuch[Value]" & vbLf & _
        "        in" & vbLf & _
        "            bisher & {[Art = s[Art], A = s[A], B = s[B], Status = Erg[Status], Text = Erg[Text]]}," & vbLf & _
        "    Ergebnis = List.Accumulate(Schritte, {}, Schritt)," & vbLf & _
        "    Tabelle = Table.FromRecords(Ergebnis, type table [Art = text, A = text, B = text, Status = number, Text = text])" & vbLf & _
        "in" & vbLf & _
        "    Tabelle"
    SpAblageFormel = f
End Function

' Schritte ausfuehren (Blatt SP_Liste ab T1); Ergebnis leer = alle Schritte mit Status 2xx, sonst der erste Fehler
Private Function SpAblageAusfuehren(ordner As String, schritte As Collection) As String
    Dim seite As String, pfad As String, a As Variant, i As Long, st As Double
    If Not SpZerlegen(ordner, seite, pfad) Then SpAblageAusfuehren = "keine SharePoint-Adresse": Exit Function
    On Error GoTo Fehler
    a = SpTabelle(SP_ABLAGE_ABFRAGE, SpAblageFormel(seite, schritte), "T1", _
                  "Rohdateien auf SharePoint ablegen: Ordner anlegen, Datei verschieben (wird vom Tool geschrieben)")
    On Error GoTo 0
    If Not IsArray(a) Then SpAblageAusfuehren = "keine Antwort der Abfrage": Exit Function
    For i = 1 To UBound(a, 1)
        st = Val(CStr(Nz(a(i, 4))))
        If st < 200 Or st >= 300 Then
            SpAblageAusfuehren = CStr(Nz(a(i, 1))) & " " & CStr(Nz(a(i, 2))) & ": Status " & CStr(Nz(a(i, 4))) & " " & Left$(CStr(Nz(a(i, 5))), 160)
            Exit Function
        End If
    Next i
    Exit Function
Fehler:
    SpAblageAusfuehren = "Power Query: " & Err.Description
End Function

' Einmal je Laden: geht die Ablage auf SharePoint? (Ordner Rohdaten „anlegen“ – gibt es ihn, aendert sich nichts)
Private Sub SpAblagePruefen(ordner As String)
    Dim seite As String, pfad As String, schritte As Collection
    spAblage = -1
    spAblageFehler = ""
    If Not SpZerlegen(ordner, seite, pfad) Then spAblageFehler = "keine SharePoint-Adresse": Exit Sub
    Set schritte = New Collection
    schritte.Add Array("ordner", pfad, "")
    Application.StatusBar = "SharePoint: Ablage der Rohdateien wird geprüft …"
    spAblageFehler = SpAblageAusfuehren(ordner, schritte)
    If Len(spAblageFehler) = 0 Then spAblage = 1
    LogSchreiben "  SharePoint-Ablage: " & IIf(spAblage = 1, "moeglich (Schnittstelle antwortet)", "nicht moeglich - " & spAblageFehler)
End Sub

' Datei rel (relativ zum Ordner, Trenner \) nach neu verschieben, Ordner davor anlegen. Ergebnis leer = verschoben (laut frischer
' Auflistung: neu da, rel weg)
Private Function SpVerschieben(ordner As String, rel As String, neu As String) As String
    Dim seite As String, basis As String, schritte As Collection, teile() As String, i As Long, zwischen As String
    Dim fehler As String, liste As Object, sep As String
    sep = Application.PathSeparator
    If Not SpZerlegen(ordner, seite, basis) Then SpVerschieben = "keine SharePoint-Adresse": Exit Function
    Set schritte = New Collection
    teile = Split(neu, sep)
    For i = 0 To UBound(teile) - 1
        zwischen = zwischen & "/" & teile(i)
        schritte.Add Array("ordner", basis & zwischen, "")
    Next i
    schritte.Add Array("verschieben", basis & "/" & Replace(rel, sep, "/"), basis & "/" & Replace(neu, sep, "/"))
    fehler = SpAblageAusfuehren(ordner, schritte)
    Dim alt As Object
    If Not spListen Is Nothing Then
        If spListen.Exists(SpSchluessel(ordner)) Then
            Set alt = spListen(SpSchluessel(ordner))
            spListen.Remove SpSchluessel(ordner)
        End If
    End If
    Set liste = SpListe(ordner)
    If liste Is Nothing Then
        If Not alt Is Nothing Then spListen.Add SpSchluessel(ordner), alt     ' alte Auflistung behalten (Celonis, freie Namen)
        SpVerschieben = IIf(Len(fehler) > 0, fehler, "Auflistung danach nicht moeglich: " & spFehler)
    ElseIf liste.Exists(neu) And Not liste.Exists(rel) Then
        SpVerschieben = ""
        CacheUmziehen PfadVon(ordner, rel), PfadVon(ordner, neu)
    ElseIf Len(fehler) > 0 Then
        SpVerschieben = fehler
    Else
        SpVerschieben = "nach dem Verschieben nicht am Ziel"
    End If
End Function

' Ladeprotokoll Spalte B: alle Zeilen mit der Datei alt auf neu umschreiben (nach dem Ablegen einer schon geladenen Datei, damit
' Nachrechnen, „Rohdatei öffnen“ und die Ersatz-Logik die Datei am neuen Ort finden). Liefert die Zahl der Zeilen.
Private Function ProtokollDateiUmschreiben(alt As String, neu As String) As Long
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long
    InhaltUmbenennen alt, neu
    On Error GoTo Ende
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Function
    a = ws.Range(ws.Cells(5, 2), ws.Cells(letzte + 1, 2)).Value2
    For r = 1 To UBound(a, 1) - 1
        If StrComp(CStr(Nz(a(r, 1))), alt, vbTextCompare) = 0 Then
            ws.Cells(r + 4, 2).Value = "'" & neu
            ProtokollDateiUmschreiben = ProtokollDateiUmschreiben + 1
        End If
    Next r
    If ProtokollDateiUmschreiben > 0 Then LogSchreiben "  Ladeprotokoll: " & ProtokollDateiUmschreiben & " Zeile(n) " & alt & " -> " & neu
Ende:
End Function

' Lokale Kopie (Cache) einer verschobenen Datei auch unter der neuen Adresse finden
Private Sub CacheUmziehen(alt As String, neu As String)
    On Error Resume Next
    If cacheDateien Is Nothing Then Exit Sub
    If cacheDateien.Exists(LCase$(alt)) Then cacheDateien(LCase$(neu)) = cacheDateien(LCase$(alt))
End Sub

' Rohdatei umbenennen bzw. in die Ablage verschieben (rel und neu relativ zum Ordner); Ergebnis leer = gelungen
Private Function DateiUmbenennen(ordner As String, rel As String, neu As String) As String
    If IstUrl(ordner) Then
        DateiUmbenennen = SpVerschieben(ordner, rel, neu)
        Exit Function
    End If
    On Error Resume Next
    Name ordner & rel As ordner & neu
    If Err.Number <> 0 Then DateiUmbenennen = Err.Description
    Err.Clear
End Function

' Rohdateien, die noch direkt im Ordner Rohdaten liegen (nicht in JJJJ\MM_Monat, nicht ausgeblendet)
Private Function SpUnsortiert(ordner As String) As Long
    Dim liste As Object, k As Variant, nm As String
    On Error Resume Next
    Set liste = SpListe(ordner)
    If liste Is Nothing Then Exit Function
    For Each k In liste.Keys
        nm = CStr(k)
        If InStr(nm, Application.PathSeparator) = 0 And Left$(nm, 2) <> "~$" And InStr(nm, ".") > 0 Then
            If IstExcelDatei(nm) Then
                If Not AusgemustertName(nm) And Not SpAusgeblendet(nm, ZahlOder(liste(k)(2), -1)) Then SpUnsortiert = SpUnsortiert + 1
            End If
        End If
    Next k
End Function

' Einmal je Sitzung anbieten, den Ordner mit OneDrive zu synchronisieren (nicht im geführten Tagesablauf: dort steht es in der Meldung)
Private Sub SyncAnbieten(k As Long)
    If spSyncGefragt Then Exit Sub
    If modTagesablauf.WartetAufLaden() Then Exit Sub          ' im Tagesablauf steht die Abhilfe in der Meldung
    spSyncGefragt = True
    If MsgBox(IIf(k = 1, "1 Rohdatei liegt", k & " Rohdateien liegen") & " unsortiert im SharePoint-Ordner Rohdaten, weil SharePoint das " & _
              "Ablegen über Excel nicht zugelassen hat (Grund im Ladelog unter %LOCALAPPDATA%\BUE_Reporting)." & vbCrLf & vbCrLf & "Ordner der " & _
              "Master-Datei jetzt im Browser öffnen? Dort oben einmal „Verknüpfung zu OneDrive hinzufügen“ klicken – danach legt das Tool " & _
              "die Dateien beim nächsten Laden selbst ab.", vbQuestion + vbYesNo, "Rohdateien ablegen") = vbYes Then OrdnerSynchronisieren
End Sub

' ---------------------------------------------------------------- Ordner einbinden (SharePoint-Modus)
' Power Query darf auf SharePoint nur lesen (POST mit Anmeldung lehnt es ab, Test am 09.10.2026). Verlaesslich ist die Verknuepfung
' „Verknüpfung zu OneDrive hinzufügen“ beim Ordner der Master-Datei: BasisOrdner findet den Ordner danach unter dem OneDrive-Ordner
' (ProfilSuche), auch wenn die Datei ueber „In App öffnen“ geoeffnet wird, und das Tool arbeitet mit Dateipfad (Name, MkDir).
' Diese Prozedur oeffnet den Ordner im Browser und sagt, wo geklickt wird.
Public Sub OrdnerSynchronisieren()
    Dim ordner As String
    On Error Resume Next
    ordner = ThisWorkbook.Path
    If Not IstUrl(ordner) Then
        MsgBox "Die Master-Datei liegt schon in einem Ordner mit Dateipfad – das Tool legt die Rohdateien dort selbst ab:" & vbCrLf & ordner, _
               vbInformation, "Ordner einbinden"
        Exit Sub
    End If
    LogSchreiben "Ordner der Master-Datei im Browser geoeffnet (Verknuepfung zu OneDrive): " & ordner
    ThisWorkbook.FollowHyperlink ordner
    MsgBox "Der Ordner der Master-Datei öffnet sich im Browser. Dort oben einmal „Verknüpfung zu OneDrive hinzufügen“ klicken." & vbCrLf & vbCrLf & _
           "Danach Excel schließen und die Master-Datei wie gewohnt öffnen (auch über „In App öffnen“). Beim nächsten Laden benennt das " & _
           "Tool die Rohdateien wieder selbst um und legt sie in JJJJ\MM_Monat ab.", vbInformation, "Ordner einbinden"
End Sub


' SharePoint: Wurde aus dieser Datei schon ein Stand geladen, ersetzt oder uebersprungen? (jede Zeile im Ladeprotokoll)
' Seit 12.89 bei MIS-O-Namen (nicht JJJJMMTT_BUe_…) nur, wenn auch die Groesse stimmt (Blatt Dateiinhalt): MIS-O vergibt jeden Tag
' dieselben Namen, ein neuer Abzug unter altem Namen (auf SharePoint ersetzt) wurde sonst nie geladen. Unbekannt -> oeffnen
' (ein schon geladener Stand wird dann in Schritt 4 uebersprungen, die Datei steht danach im Blatt Dateiinhalt).
Private Function DateiSchonGeladen(rel As String, ordner As String) As Boolean
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, gefunden As Boolean, nm As String
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Function
    a = ws.Range(ws.Cells(5, 2), ws.Cells(letzte + 1, 2)).Value2
    For r = 1 To UBound(a, 1) - 1
        If StrComp(CStr(Nz(a(r, 1))), rel, vbTextCompare) = 0 Then gefunden = True: Exit For
    Next r
    If Not gefunden Then Exit Function
    nm = DateiName(rel)
    If nm Like "########_BUe_*" Or nm Like "########-########_BUe_*" Then DateiSchonGeladen = True: Exit Function
    If inhaltIndex Is Nothing Then InhaltLaden
    DateiSchonGeladen = inhaltIndex.Exists(LCase$(rel) & "|" & DateiKennung(ordner, rel))
End Function

Private Function ZahlOder(v As Variant, ersatz As Double) As Double
    ZahlOder = ersatz
    On Error Resume Next
    If IsNumeric(v) And Not IsEmpty(v) Then
        If Len(CStr(v)) > 0 Then ZahlOder = CDbl(v)
    End If
End Function

' Zeitwert aus der Auflistung (Datum als Zahl oder Text) fuer den Vergleich
Private Function ZeitWert(v As Variant) As Double
    On Error Resume Next
    If IsNumeric(v) And Not IsEmpty(v) Then
        ZeitWert = CDbl(v)
    ElseIf Len(CStr(v)) > 0 Then
        ZeitWert = CDbl(CDate(Left$(CStr(v), 19)))
    End If
End Function

' ---------------------------------------------------------------- Snapshot (Schluessel des letzten Stands je Quelle und Einheit)
' Blatt Snapshot_<Quelle>: A..E Schluessel und Merkmale, F "Gruppe|Einheit" (HS: "|"). Stichtag und Anzahl: H2/H3 fuer die
' leere Gruppe, J2:L41 (Gruppe, Stichtag, Schluessel) fuer jede Gruppe im Bereich MAKLER. Parameter einheit = Gruppe.
Private Function SnapshotBlatt(quelle As String) As Worksheet
    Set SnapshotBlatt = ThisWorkbook.Worksheets("Snapshot_" & quelle)
End Function

Private Function SnapshotLesen(quelle As String, einheit As String) As Object
    Dim ws As Worksheet, letzte As Long, daten As Variant, r As Long, d As Object
    Set ws = SnapshotBlatt(quelle)
    Set SnapshotLesen = Nothing
    If LetzterStand(quelle, einheit) = 0 Then Exit Function
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    Set d = CreateObject("Scripting.Dictionary")
    If letzte >= 2 Then
        daten = ws.Range(ws.Cells(2, 1), ws.Cells(letzte + 1, 6)).Value2      ' +1: immer zweidimensional
        For r = 1 To UBound(daten, 1) - 1
            If SnapGruppe(daten(r, 6)) = einheit Then
                If Not d.Exists(CStr(daten(r, 1))) Then d.Add CStr(daten(r, 1)), Array(CStr(daten(r, 2)), CStr(daten(r, 3)), CStr(daten(r, 4)), CStr(daten(r, 5)), _
                                                                                    SnapEinheit(daten(r, 6)))
            End If
        Next r
    End If
    Set SnapshotLesen = d
End Function

' Schluessel einer Einheit ersetzen (die anderen Einheiten bleiben stehen); stichtag 0 = Einheit ohne Stand (leeren)
Private Sub SnapshotSchreiben(quelle As String, einheit As String, stichtag As Date, neu As Object)
    Dim je As Object
    Set je = CreateObject("Scripting.Dictionary")
    je.Add einheit, neu
    SnapshotErsetzen quelle, stichtag, je
End Sub

' Schluessel mehrerer Einheiten in einem Schreibvorgang ersetzen: je = Einheit -> Dictionary der heutigen Schluessel
Private Sub SnapshotErsetzen(quelle As String, stichtag As Date, je As Object)
    Dim ws As Worksheet, aus() As Variant, k As Variant, e As Variant, i As Long, w As Variant, letzte As Long, alt As Variant, r As Long, c As Long, n As Long
    Dim neu As Object
    Set ws = SnapshotBlatt(quelle)
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For Each e In je.Keys
        n = n + je.Item(e).Count
    Next e
    If letzte >= 2 Then
        alt = ws.Range(ws.Cells(2, 1), ws.Cells(letzte + 1, 6)).Value2
        For r = 1 To UBound(alt, 1) - 1
            If Not je.Exists(SnapGruppe(alt(r, 6))) And Len(CStr(Nz(alt(r, 1)))) > 0 Then n = n + 1
        Next r
    End If
    ws.Range(ws.Cells(2, 1), ws.Cells(ws.Rows.Count, 6)).ClearContents
    If n > 0 Then
        ReDim aus(1 To n, 1 To 6)
        If letzte >= 2 Then
            For r = 1 To UBound(alt, 1) - 1
                If Not je.Exists(SnapGruppe(alt(r, 6))) And Len(CStr(Nz(alt(r, 1)))) > 0 Then
                    i = i + 1
                    For c = 1 To 6
                        aus(i, c) = alt(r, c)
                    Next c
                End If
            Next r
        End If
        For Each e In je.Keys
            Set neu = je.Item(e)
            For Each k In neu.Keys
                i = i + 1
                w = neu(k)
                aus(i, 1) = CStr(k): aus(i, 2) = w(0): aus(i, 3) = w(1): aus(i, 4) = w(2): aus(i, 5) = w(3)
                aus(i, 6) = CStr(e) & TRENNER & CStr(w(4))
            Next k
        Next e
        ws.Range(ws.Cells(2, 1), ws.Cells(n + 1, 6)).Value = aus
    End If
    For Each e In je.Keys
        StandVermerken ws, CStr(e), stichtag, je.Item(e).Count
    Next e
End Sub

' Spalte F des Snapshots: "Gruppe|Einheit" (aeltere Zeilen ohne "|": nur Gruppe)
Private Function SnapGruppe(v As Variant) As String
    Dim t As String
    t = CStr(Nz(v))
    If InStr(t, TRENNER) > 0 Then SnapGruppe = Left$(t, InStr(t, TRENNER) - 1) Else SnapGruppe = t
End Function

Private Function SnapEinheit(v As Variant) As String
    Dim t As String
    t = CStr(Nz(v))
    If InStr(t, TRENNER) > 0 Then SnapEinheit = Mid$(t, InStr(t, TRENNER) + 1)
End Function

Private Sub StandVermerken(ws As Worksheet, einheit As String, stichtag As Date, anzahl As Long)
    Dim r As Long, frei As Long
    If Len(einheit) = 0 Then
        If stichtag = 0 Then
            ws.Range("H2:H3").ClearContents
        Else
            ws.Range("H2").Value = stichtag
            ws.Range("H2").NumberFormat = "dd.mm.yyyy"
            ws.Range("H3").Value = anzahl
        End If
        Exit Sub
    End If
    For r = 2 To SNAP_EINHEITEN + 1
        If CStr(ws.Cells(r, 10).Value) = einheit Then frei = r: Exit For
        If frei = 0 And Len(CStr(ws.Cells(r, 10).Value)) = 0 Then frei = -r
    Next r
    If frei < 0 Then frei = -frei
    If frei = 0 Then Err.Raise vbObjectError + 13, , "Zu viele Einheiten (mehr als " & SNAP_EINHEITEN & ") im Blatt " & ws.Name & "."
    ws.Cells(frei, 10).Value = einheit
    If stichtag = 0 Then
        ws.Cells(frei, 11).ClearContents
        ws.Cells(frei, 12).ClearContents
    Else
        ws.Cells(frei, 11).Value = stichtag
        ws.Cells(frei, 11).NumberFormat = "dd.mm.yyyy"
        ws.Cells(frei, 12).Value = anzahl
    End If
End Sub

' Verlauf!AL/AM (erste/letzte Position der Fakten-Zeilen je Stichtag) aus den Fakten neu bestimmen – nach dem Ersetzen,
' wenn Zeilen aufgerueckt sind und ein Stichtag nicht mehr am Stueck steht
Public Sub VerlaufGrenzenNeu()
    Dim wsF As Worksheet, wsV As Worksheet, letzte As Long, lv As Long, a As Variant, i As Long, d As Object, k As Long, w As Variant, r As Long
    Set wsF = ThisWorkbook.Worksheets("Fakten")
    Set wsV = ThisWorkbook.Worksheets("Verlauf")
    Set d = CreateObject("Scripting.Dictionary")
    letzte = wsF.Cells(wsF.Rows.Count, 1).End(xlUp).Row
    If letzte >= 2 Then
        a = wsF.Range(wsF.Cells(2, 1), wsF.Cells(letzte + 1, 1)).Value2       ' +1: immer zweidimensional
        For i = 1 To UBound(a, 1) - 1
            If IsNumeric(a(i, 1)) And Not IsEmpty(a(i, 1)) Then
                k = CLng(a(i, 1))
                If d.Exists(k) Then
                    w = d(k)
                    w(1) = i
                    d(k) = w
                Else
                    d.Add k, Array(i, i)
                End If
            End If
        Next i
    End If
    lv = wsV.Cells(wsV.Rows.Count, 1).End(xlUp).Row
    For r = 6 To lv
        w = wsV.Cells(r, 1).Value2
        If IsNumeric(w) And Not IsEmpty(w) Then
            If d.Exists(CLng(w)) Then
                w = d(CLng(w))
                wsV.Cells(r, 38).Value = w(0)
                wsV.Cells(r, 39).Value = w(1)
            Else
                wsV.Cells(r, 38).Value = 1
                wsV.Cells(r, 39).Value = 1
            End If
        End If
    Next r
End Sub

' Stichtag des zuletzt geladenen Stands einer Quelle und Einheit (0 = noch keiner)
Private Function LetzterStand(quelle As String, einheit As String) As Date
    Dim v As Variant, ws As Worksheet, r As Long
    Set ws = SnapshotBlatt(quelle)
    If Len(einheit) = 0 Then
        v = ws.Range("H2").Value
    Else
        For r = 2 To SNAP_EINHEITEN + 1
            If CStr(ws.Cells(r, 10).Value) = einheit Then v = ws.Cells(r, 11).Value: Exit For
        Next r
    End If
    If IsDate(v) Then LetzterStand = CDate(v) Else LetzterStand = 0
End Function

' juengster Stand einer Quelle ueber alle Einheiten
Private Function LetzterStandQuelle(quelle As String) As Date
    Dim ws As Worksheet, r As Long, v As Variant
    Set ws = SnapshotBlatt(quelle)
    LetzterStandQuelle = LetzterStand(quelle, "")
    For r = 2 To SNAP_EINHEITEN + 1
        v = ws.Cells(r, 11).Value
        If IsDate(v) Then
            If CDate(v) > LetzterStandQuelle Then LetzterStandQuelle = CDate(v)
        End If
    Next r
End Function

' ---------------------------------------------------------------- Verlauf, Filterliste, Protokoll
Private Sub VerlaufErgaenzen(stichtag As Date, pos1 As Long, pos2 As Long)
    ' Zeile je Stichtag anlegen (Formeln der Vorzeile kopieren) und die Blockgrenzen der Fakten-Zeilen dieses Stichtags
    ' in AL/AM als Werte fuehren (Position im Bereich Fakten!X2:X300000): erste = kleinste, letzte = groesste Position
    ' Ein nachgereichter Stichtag (12.88) wird an seiner Stelle eingefuegt: letzte Zeile kopieren, dann die Werte A, AL, AM ab der
    ' Einfuegestelle eine Zeile nach unten (die uebrigen Spalten sind Formeln der eigenen Zeile)
    Dim ws As Worksheet, letzte As Long, r As Long, zeile As Long, c As Variant, v As Variant
    Set ws = ThisWorkbook.Worksheets("Verlauf")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    zeile = 0
    For r = 6 To letzte
        If ws.Cells(r, 1).Value = stichtag Then zeile = r: Exit For
    Next r
    If zeile = 0 Then
        If letzte < 6 Then letzte = 6
        If IsEmpty(ws.Cells(6, 1).Value) Then
            zeile = 6
        Else
            If letzte + 1 > VERLAUF_MAX Then Err.Raise vbObjectError + 3, , "Das Blatt Verlauf ist voll (mehr als " & VERLAUF_MAX & " Stichtage)."
            ws.Rows(letzte).Copy ws.Rows(letzte + 1)
            Application.CutCopyMode = False
            zeile = letzte + 1
            For r = 6 To letzte
                v = ws.Cells(r, 1).Value2
                If IsNumeric(v) And Not IsEmpty(v) Then
                    If CLng(v) > CLng(stichtag) Then zeile = r: Exit For
                End If
            Next r
            If zeile <= letzte Then
                For Each c In Array(1, 38, 39)
                    ws.Range(ws.Cells(zeile + 1, c), ws.Cells(letzte + 1, c)).Value = ws.Range(ws.Cells(zeile, c), ws.Cells(letzte, c)).Value
                Next c
                LogSchreiben "  Verlauf: Stichtag " & Format(stichtag, "dd.mm.yyyy") & " in Zeile " & zeile & " eingefuegt"
            End If
        End If
        ws.Cells(zeile, 1).Value = stichtag
        ws.Cells(zeile, 38).Value = pos1
        ws.Cells(zeile, 39).Value = pos2
    Else
        If Val(ws.Cells(zeile, 38).Value) = 0 Or pos1 < Val(ws.Cells(zeile, 38).Value) Then ws.Cells(zeile, 38).Value = pos1
        If pos2 > Val(ws.Cells(zeile, 39).Value) Then ws.Cells(zeile, 39).Value = pos2
    End If
End Sub

Private Sub PostkoerbeRegistrieren(neue As Object)
    ' Unbekannte Themenpostkoerbe kommen mit Kennzeichen WAHR in die Filterliste (Filter!B, ohne Chip)
    Dim ws As Worksheet, r As Long, k As Variant, vorhanden As Object, frei As Long, liste As Variant
    Set ws = ThisWorkbook.Worksheets("Filter")
    Set vorhanden = CreateObject("Scripting.Dictionary")
    liste = ws.Range(ws.Cells(PK_VON, 2), ws.Cells(PK_BIS, 2)).Value2
    frei = 0
    For r = 1 To UBound(liste, 1)
        If Len(Trim$(CStr(Nz(liste(r, 1))))) > 0 Then
            If Not vorhanden.Exists(CStr(liste(r, 1))) Then vorhanden.Add CStr(liste(r, 1)), True
        ElseIf frei = 0 Then
            frei = PK_VON + r - 1
        End If
    Next r
    For Each k In neue.Keys
        If Not vorhanden.Exists(CStr(k)) Then
            If frei = 0 Or frei > PK_BIS Then Err.Raise vbObjectError + 4, , "Die Filterliste der Themenpostkörbe ist voll (Filter!B" & PK_VON & ":B" & PK_BIS & "); Postkorb '" & k & "' kann nicht aufgenommen werden."
            ws.Cells(frei, 2).Value = CStr(k)
            ws.Cells(frei, 3).Value = True
            ' Standard-Auswahl (Konfiguration!I, zeilengleich): HS-Postkoerbe (… 23724) nach Vorschlag (KO/MV "ja", sonst "nein",
            ' z. B. GR, AZ, 72, BÜ); der Chip im Cockpit (Filter!C) folgt dem Vorschlag, ein neuer HS-Postkorb startet also ausgeblendet;
            ' Postkoerbe anderer Bereiche (z. B. ODPB) erst einmal alle "ja" – die Karte nach dem Laden fragt, welche heraus sollen.
            ' Bereich MAKLER: alle Postkoerbe der Abzuege gehoeren dazu ("ja"), keine Frage.
            If IstMakler() Then
                ThisWorkbook.Worksheets("Konfiguration").Cells(frei + 6, 9).Value = "ja"
            ElseIf CStr(k) Like "* 23724" Or CStr(k) = "(ohne Postkorb)" Then
                ThisWorkbook.Worksheets("Konfiguration").Cells(frei + 6, 9).Value = IIf(InStr(STANDARD_VORSCHLAG, "|" & CStr(k) & "|") > 0, "ja", "nein")
                ws.Cells(frei, 3).Value = (InStr(STANDARD_VORSCHLAG, "|" & CStr(k) & "|") > 0)
            Else
                ThisWorkbook.Worksheets("Konfiguration").Cells(frei + 6, 9).Value = "ja"
                If neuePK Is Nothing Then Set neuePK = CreateObject("Scripting.Dictionary")
                If Not neuePK.Exists(CStr(k)) Then neuePK.Add CStr(k), True
            End If
            vorhanden.Add CStr(k), True
            frei = frei + 1
        End If
    Next k
End Sub

' Hinweis einer Ladeprotokoll-Zeile: gilt der Stand als geladen? Ja bei leerem Hinweis (bis 12.68), „erster Stand …“ und der
' Verkettungs-Angabe, die seit 12.69 jeder normal geladene Stand traegt („Verkettungskennzeichen: …“, „ohne Spalte
' Verkettungskennzeichen: …“, ggf. mit „· … Zeilen der HS-Einheit … ignoriert“). Nein bei „übersprungen …“, „ersetzt …“,
' „neu gerechnet …“, „doppelt im Ladeprotokoll …“ und „keine Datensätze …“. Bis 12.91 zaehlten nur leer und „erster“ – siehe
' DoppelteStaendeBereinigen.
Public Function StandGueltig(h As String) As Boolean
    StandGueltig = (Len(h) = 0 Or h Like "erster*" Or h Like "Verkettungskennzeichen*" Or h Like "ohne Spalte Verkettungskennzeichen*")
End Function

' ---------------------------------------------------------------- Doppelt geladene Staende (12.92)
' Bis 12.91 galt ein Stand nur mit leerem Hinweis oder „erster Stand …“ als geladen, seit 12.69 traegt aber jeder normal geladene
' Stand die Verkettungs-Angabe. Mit Dateipfad (OneDrive-Verknuepfung, Dateien in der Ablage) las „Neue Daten laden“ deshalb den
' zuletzt geladenen Stand jeder Quelle beim naechsten Laden noch einmal ein: gegen den eigenen Snapshot, also Rueckstand doppelt,
' Eingaenge und Abgaenge 0. Bereinigt wird einmal, wenn das Ladeprotokoll einen Stand mehrfach gueltig fuehrt:
' - Ladeprotokoll: alle Zeilen mit derselben Datei -> die erste bleibt, die weiteren heissen „doppelt im Ladeprotokoll …“ (auch
'   im Bereich MAKLER, wo jedes Laden die aelteren Staende als Nachzuegler neu rechnete und je Stand eine Zeile anhaengte); verschiedene
'   Dateien (Ersetzen, dessen alte Zeile bis 12.91 nicht markiert wurde) -> die letzte bleibt, die frueheren heissen „ersetzt …“.
' - Fakten: je Stichtag, Quelle, Sparte, VSS, Postkorb, GeVo, Einheit und Strang bleibt die erste Zeile (ein Durchlauf schreibt
'   jeden dieser Schluessel genau einmal, der zweite Durchlauf steht dahinter). Danach Verlauf!AL:AM neu.
' Ergebnis: die doppelt geladenen Staende als Text („OPAG 18.10., 19.10. · Verbund 22.10.“), leer = nichts doppelt.
Private Function DoppelteStaendeBereinigen() As String
    Dim wsL As Worksheet, wsF As Worksheet, letzte As Long, p As Variant, r As Long, i As Long, c As Long, k As String
    Dim gruppen As Object, g As Variant, zeilen As Collection, gleich As Boolean, behalten As Long, zeit As String, markiert As Long
    Dim doppelt As Object, sn As String, blk As Variant, ein As Variant, aus() As Variant, ausE() As Variant, m As Long, weg As Long
    Dim schl As Object, fk As String, tage As Variant, t As Long, j As Long, txt As String, teil As String
    On Error GoTo Fehler                                 ' Bereinigung darf das Laden nie blockieren
    Set wsL = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = wsL.Cells(wsL.Rows.Count, 1).End(xlUp).Row
    If letzte < 6 Then Exit Function
    p = wsL.Range(wsL.Cells(5, 1), wsL.Cells(letzte + 1, SP_GRUPPE_L)).Value2          ' +1: immer zweidimensional
    Set gruppen = CreateObject("Scripting.Dictionary")
    For r = 1 To UBound(p, 1) - 1
        If IsNumeric(p(r, 5)) And Not IsEmpty(p(r, 5)) And Len(CStr(Nz(p(r, 4)))) > 0 Then
            If StandGueltig(CStr(Nz(p(r, 10)))) Then
                k = StandSchluessel(CStr(p(r, 4)), CStr(Nz(p(r, SP_GRUPPE_L))), CDate(p(r, 5)))
                If Not gruppen.Exists(k) Then gruppen.Add k, New Collection
                gruppen.Item(k).Add r
            End If
        End If
    Next r
    zeit = Format(Now, "dd.mm.yyyy hh:nn")
    For Each g In gruppen.Keys
        Set zeilen = gruppen.Item(g)
        If zeilen.Count > 1 Then
            gleich = True
            For i = 2 To zeilen.Count
                If StrComp(DateiName(CStr(Nz(p(zeilen(i), 2)))), DateiName(CStr(Nz(p(zeilen(1), 2)))), vbTextCompare) <> 0 Then gleich = False
            Next i
            If gleich Then behalten = 1 Else behalten = zeilen.Count
            For i = 1 To zeilen.Count
                If i <> behalten Then
                    r = zeilen(i)
                    If gleich Then
                        wsL.Cells(r + 4, 10).Value = "doppelt im Ladeprotokoll – am " & zeit & " bereinigt (12.92)"
                    Else
                        wsL.Cells(r + 4, 10).Value = "ersetzt (Ladeprotokoll am " & zeit & " bereinigt, 12.92)"
                    End If
                    markiert = markiert + 1
                End If
            Next i
        End If
    Next g
    If markiert = 0 Then Exit Function
    LogSchreiben "Ladeprotokoll: " & markiert & " mehrfach gueltige Zeile(n) markiert"

    ' Fakten: gleiche Schluessel je Stichtag und Quelle nur einmal (die erste Zeile bleibt), der Rest rueckt auf
    Set wsF = ThisWorkbook.Worksheets("Fakten")
    letzte = wsF.Cells(wsF.Rows.Count, 1).End(xlUp).Row
    If letzte >= 3 Then
        blk = wsF.Range(wsF.Cells(2, 1), wsF.Cells(letzte + 1, 15)).Value2
        ein = wsF.Range(wsF.Cells(2, SP_EINHEIT_F), wsF.Cells(letzte + 1, SP_ALTSUM_F)).Value2   ' R Einheit, S Strang, T, U, V
        ReDim aus(1 To UBound(blk, 1), 1 To 15)
        ReDim ausE(1 To UBound(blk, 1), 1 To 5)
        Set schl = CreateObject("Scripting.Dictionary")
        Set doppelt = CreateObject("Scripting.Dictionary")  ' Strang -> Dictionary der Stichtage mit entfernten Zeilen
        For r = 1 To UBound(blk, 1) - 1
            fk = CStr(CLng(Val(blk(r, 1)))) & TRENNER & CStr(Nz(blk(r, 2))) & TRENNER & CStr(Nz(blk(r, 3))) & TRENNER & CStr(Nz(blk(r, 4))) & _
                 TRENNER & CStr(Nz(blk(r, 5))) & TRENNER & CStr(Nz(blk(r, 6))) & TRENNER & CStr(Nz(ein(r, 1))) & TRENNER & CStr(Nz(ein(r, 2)))
            If schl.Exists(fk) Then
                weg = weg + 1
                sn = Strang(CStr(Nz(blk(r, 2))), CStr(Nz(ein(r, 2))))
                If Not doppelt.Exists(sn) Then doppelt.Add sn, CreateObject("Scripting.Dictionary")
                doppelt.Item(sn).Item(CLng(Val(blk(r, 1)))) = True
            Else
                schl.Add fk, True
                m = m + 1
                For c = 1 To 15
                    aus(m, c) = blk(r, c)
                Next c
                For c = 1 To 5
                    ausE(m, c) = ein(r, c)
                Next c
            End If
        Next r
        If weg > 0 Then
            wsF.Range(wsF.Cells(2, 1), wsF.Cells(m + 1, 15)).Value2 = aus
            wsF.Range(wsF.Cells(2, SP_EINHEIT_F), wsF.Cells(m + 1, SP_ALTSUM_F)).Value2 = ausE
            wsF.Range(wsF.Cells(m + 2, 1), wsF.Cells(letzte, SP_ALTSUM_F)).ClearContents
        End If
        Erase aus
        Erase ausE
    End If
    LogSchreiben "Fakten: " & weg & " doppelte Zeile(n) entfernt"
    VerlaufGrenzenNeu

    ' Meldungstext: je Strang die Stichtage aufsteigend
    If weg = 0 Then Exit Function
    For Each g In doppelt.Keys
        tage = doppelt.Item(g).Keys
        For i = 0 To UBound(tage) - 1
            For j = i + 1 To UBound(tage)
                If CLng(tage(j)) < CLng(tage(i)) Then t = tage(i): tage(i) = tage(j): tage(j) = t
            Next j
        Next i
        teil = ""
        For i = 0 To UBound(tage)
            teil = teil & IIf(i > 0, ", ", "") & Format$(CDate(CLng(tage(i))), "dd.mm.")
        Next i
        txt = txt & IIf(Len(txt) > 0, " · ", "") & CStr(g) & " " & teil
    Next g
    LogSchreiben "Doppelt geladene Staende bereinigt: " & txt
    DoppelteStaendeBereinigen = txt
    Exit Function
Fehler:
    LogSchreiben "Bereinigung doppelter Staende abgebrochen (Fehler " & Err.Number & ": " & Err.Description & ") – Laden laeuft weiter"
    Err.Clear
End Function

' Zusatz fuer die Abschlussmeldung (einmal, danach geleert)
Private Function DoppeltMeldung() As String
    If Len(doppeltText) = 0 Then Exit Function
    DoppeltMeldung = "." & vbCrLf & "Bereinigt: Diese Stände waren bis 12.91 doppelt geladen, ihr Rückstand zählte zweifach – " & doppeltText & _
                     ". Fakten und Ladeprotokoll sind korrigiert"
    doppeltText = ""
End Function

Private Function ProtokollLesen() As Object
    ' Alle protokollierten Staende (Quelle|Stichtag) – geladene und uebersprungene – als Dictionary
    Dim ws As Worksheet, letzte As Long, daten As Variant, r As Long, d As Object, hinweis As String, k As String
    Set d = CreateObject("Scripting.Dictionary")
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 5 Then
        daten = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, SP_GRUPPE_L)).Value2     ' +1: immer zweidimensional
        For r = 1 To UBound(daten, 1) - 1
            If IsNumeric(daten(r, 5)) And Not IsEmpty(daten(r, 5)) And Len(CStr(Nz(daten(r, 4)))) > 0 Then
                hinweis = CStr(Nz(daten(r, 10)))
                If StandGueltig(hinweis) Or Left$(hinweis, 12) = "übersprungen" Then
                    ' Stand und Namensschluessel des abgelegten Dateinamens (fuer AbgelegtUndGeladen)
                    k = StandSchluessel(CStr(daten(r, 4)), CStr(Nz(daten(r, SP_GRUPPE_L))), CDate(daten(r, 5)))
                    If Not d.Exists(k) Then d.Add k, True
                    k = NamensSchluessel(CStr(daten(r, 4)), EinheitDateiteil(CStr(Nz(daten(r, SP_GRUPPE_L)))), CDate(daten(r, 5)))
                    If Not d.Exists(k) Then d.Add k, True
                    k = NamensSchluesselDatei(CStr(Nz(daten(r, 2))), CStr(daten(r, 4)), CDate(daten(r, 5)))
                    If Len(k) > 0 Then
                        If Not d.Exists(k) Then d.Add k, True
                    End If
                End If
            End If
        Next r
    End If
    Set ProtokollLesen = d
End Function

Private Sub Protokoll(st As Stand, zeilen As Long, rueckstand As Long, eingang As Long, abgang As Long, hinweis As String)
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < 5 Then r = 5
    ws.Range(ws.Cells(r, 1), ws.Cells(r, SP_GRUPPE_L)).Value = Array(Now, st.Datei, st.Blatt, st.Quelle, st.Stichtag, zeilen, rueckstand, eingang, abgang, hinweis, st.Gruppe)
    ws.Cells(r, 1).NumberFormat = "dd.mm.yyyy hh:mm"
    ws.Cells(r, 5).NumberFormat = "dd.mm.yyyy"
End Sub

' ---------------------------------------------------------------- Dateiinhalt (12.88)
' Blatt Dateiinhalt: je geprueftem Blatt einer Rohdatei und je Einheit eine Zeile – A Datei, B Kennung (Groesse in Byte, seit 12.89; SharePoint und OneDrive liefern dieselbe),
' C Blatt, D Quelle, E Stichtag, F Einheit (Strang), G Zeilen, H Einheiten der Datei, I geprueft am. Zum Nachschauen, was in welcher
' Datei stand, und damit eine schon gepruefte Datei in Schritt 1 nicht erneut geoeffnet wird. J2 haelt die Einheiten-Zuordnung
' (Konfiguration F7, Q11:R40), mit der geprueft wurde; aendert sie sich, wird das Blatt geleert und neu aufgebaut.
Private Function InhaltBlatt() As Worksheet
    On Error Resume Next
    Set InhaltBlatt = ThisWorkbook.Worksheets("Dateiinhalt")
End Function

Private Function InhaltFingerabdruck() As String
    Dim a As Variant, r As Long, t As String
    On Error Resume Next
    t = UCase$(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("F7").Value)))
    If t = "MAKLER" Then t = t & ";HS" & HS_EINHEITEN        ' seit 12.91 ohne HS-Zeilen geprueft: aeltere Eintraege neu pruefen
    a = ThisWorkbook.Worksheets("Konfiguration").Range("Q11:R40").Value2
    If IsArray(a) Then
        For r = 1 To UBound(a, 1)
            If Len(CStr(Nz(a(r, 1)))) + Len(CStr(Nz(a(r, 2)))) > 0 Then t = t & ";" & UCase$(Trim$(CStr(Nz(a(r, 1))))) & "=" & UCase$(Trim$(CStr(Nz(a(r, 2)))))
        Next r
    End If
    InhaltFingerabdruck = t
End Function

Private Function DateiKennung(ordner As String, rel As String) As String
    Dim e As Variant
    On Error GoTo Ende
    If IstUrl(ordner) Then
        e = SpEintrag(PfadVon(ordner, rel))
        If IsArray(e) Then
            If IsNumeric(e(2)) And Not IsEmpty(e(2)) Then
                If Len(CStr(e(2))) > 0 Then DateiKennung = CStr(CDbl(e(2)))
            End If
        End If
    Else
        DateiKennung = CStr(CDbl(FileLen(ordner & rel)))
    End If
Ende:
End Function

' Index aus dem Blatt: "datei|kennung" (klein) -> Collection von Array(Blatt, Quelle, Stichtag, Einheit, Zeilen, Einheiten der Datei)
Private Sub InhaltLaden()
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, k As String
    Set inhaltIndex = CreateObject("Scripting.Dictionary")
    Set ws = InhaltBlatt()
    If ws Is Nothing Then Exit Sub
    If CStr(ws.Range("J2").Value) <> InhaltFingerabdruck() Then
        letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
        If letzte >= 5 Then ws.Range(ws.Cells(5, 1), ws.Cells(letzte, 9)).ClearContents
        ws.Range("J2").Value = "'" & InhaltFingerabdruck()
        If letzte >= 5 Then LogSchreiben "Dateiinhalt geleert (Einheiten-Zuordnung geaendert)"
        Exit Sub
    End If
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Sub
    a = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, 9)).Value2
    For r = 1 To UBound(a, 1) - 1
        If Len(CStr(Nz(a(r, 1)))) > 0 And IsNumeric(a(r, 5)) And Not IsEmpty(a(r, 5)) Then
            k = LCase$(CStr(a(r, 1))) & "|" & CStr(Nz(a(r, 2)))
            If Not inhaltIndex.Exists(k) Then inhaltIndex.Add k, New Collection
            inhaltIndex.Item(k).Add Array(CStr(Nz(a(r, 3))), CStr(Nz(a(r, 4))), CDate(a(r, 5)), CStr(Nz(a(r, 6))), Val(a(r, 7)), CStr(Nz(a(r, 8))))
        End If
    Next r
End Sub

' Blaetter und Einheiten einer schon geprueften Datei (gleiche Kennung) aus dem Index; False = unbekannt, Datei oeffnen
Private Function InhaltBekannt(ordner As String, datei As String, bl() As Stand, blS() As Object, nBl As Long) As Boolean
    Dim kenn As String, k As String, z As Variant, b As Long, gef As Long, st As Stand
    If inhaltIndex Is Nothing Then InhaltLaden
    kenn = DateiKennung(ordner, datei)
    If Len(kenn) = 0 Then Exit Function
    k = LCase$(datei) & "|" & kenn
    If Not inhaltIndex.Exists(k) Then Exit Function
    nBl = 0
    For Each z In inhaltIndex.Item(k)
        gef = -1
        For b = 0 To nBl - 1
            If bl(b).Blatt = z(0) And bl(b).Quelle = z(1) And CLng(bl(b).Stichtag) = CLng(z(2)) Then gef = b: Exit For
        Next b
        If gef < 0 Then
            st.Datei = datei: st.Blatt = z(0): st.Quelle = z(1): st.Stichtag = z(2): st.DateiGruppe = z(5): st.Gruppe = z(5)
            st.Zeilen = 0: st.Ersetzen = False
            ReDim Preserve bl(0 To nBl)
            ReDim Preserve blS(0 To nBl)
            bl(nBl) = st
            Set blS(nBl) = CreateObject("Scripting.Dictionary")
            gef = nBl
            nBl = nBl + 1
        End If
        blS(gef).Item(CStr(z(3))) = CLng(z(4))
        bl(gef).Zeilen = bl(gef).Zeilen + CLng(z(4))
    Next z
    InhaltBekannt = (nBl > 0)
End Function

' Ergebnis der Pruefung einer geoeffneten Datei vermerken (je Blatt und Einheit eine Zeile)
Private Sub InhaltMerken(ordner As String, datei As String, bl() As Stand, blS() As Object, nBl As Long)
    Dim ws As Worksheet, kenn As String, b As Long, u As Variant, r As Long, k As String, n As Long, aus() As Variant
    If nBl = 0 Then Exit Sub
    Set ws = InhaltBlatt()
    If ws Is Nothing Then Exit Sub
    If inhaltIndex Is Nothing Then InhaltLaden
    kenn = DateiKennung(ordner, datei)
    If Len(kenn) = 0 Then Exit Sub
    k = LCase$(datei) & "|" & kenn
    If inhaltIndex.Exists(k) Then Exit Sub
    inhaltIndex.Add k, New Collection
    For b = 0 To nBl - 1
        n = n + blS(b).Count
    Next b
    ReDim aus(1 To n, 1 To 9)
    n = 0
    For b = 0 To nBl - 1
        For Each u In blS(b).Keys
            n = n + 1
            aus(n, 1) = "'" & datei: aus(n, 2) = "'" & kenn: aus(n, 3) = "'" & bl(b).Blatt: aus(n, 4) = bl(b).Quelle
            aus(n, 5) = bl(b).Stichtag: aus(n, 6) = "'" & CStr(u): aus(n, 7) = CLng(blS(b).Item(u)): aus(n, 8) = "'" & bl(b).DateiGruppe: aus(n, 9) = Now
            inhaltIndex.Item(k).Add Array(bl(b).Blatt, bl(b).Quelle, bl(b).Stichtag, CStr(u), CLng(blS(b).Item(u)), bl(b).DateiGruppe)
        Next u
    Next b
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < 5 Then r = 5
    ws.Range(ws.Cells(r, 1), ws.Cells(r + n - 1, 9)).Value = aus
    ws.Range(ws.Cells(r, 5), ws.Cells(r + n - 1, 5)).NumberFormat = "dd.mm.yyyy"
    ws.Range(ws.Cells(r, 9), ws.Cells(r + n - 1, 9)).NumberFormat = "dd.mm.yyyy hh:mm"
End Sub

' Datei wurde umbenannt bzw. abgelegt: Eintraege folgen ihr (die Kennung bleibt, die Groesse aendert sich nicht)
Private Sub InhaltUmbenennen(alt As String, neu As String)
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, n As Long
    On Error GoTo Ende
    Set ws = InhaltBlatt()
    If ws Is Nothing Then Exit Sub
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Sub
    a = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, 1)).Value2
    For r = 1 To UBound(a, 1) - 1
        If StrComp(CStr(Nz(a(r, 1))), alt, vbTextCompare) = 0 Then ws.Cells(r + 4, 1).Value = "'" & neu: n = n + 1
    Next r
    If n > 0 Then Set inhaltIndex = Nothing                  ' beim naechsten Zugriff neu lesen
Ende:
End Sub

' Bereich MAKLER: stammen die geladenen Staende noch aus der Zeit vor 12.88 (Strang = Gruppe mehrerer Einheiten, „MSUE+ODPB“)?
Private Function AlteGruppenStraenge() As Boolean
    Dim q As Variant, a As Variant, r As Long
    If Not IstMakler() Then Exit Function
    On Error Resume Next
    For Each q In Array("OPAG", "Verbund")
        a = Empty
        a = SnapshotBlatt(CStr(q)).Range(SnapshotBlatt(CStr(q)).Cells(2, 10), SnapshotBlatt(CStr(q)).Cells(SNAP_EINHEITEN + 1, 10)).Value2
        If IsArray(a) Then
            For r = 1 To UBound(a, 1)
                If InStr(CStr(Nz(a(r, 1))), "+") > 0 Then AlteGruppenStraenge = True: Exit Function
            Next r
        End If
    Next q
End Function

' ---------------------------------------------------------------- Bereich und Einheiten
' Konfiguration!F7: HS (ein Strang je Quelle) oder MAKLER (je Quelle ein Strang je Einheit, siehe Kopf des Moduls)
Public Function IstMakler() As Boolean
    On Error Resume Next
    IstMakler = (UCase$(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("F7").Value))) = "MAKLER")
    On Error GoTo 0
End Function

' Bereich MAKLER (12.91): gehoert eine Einheit (EinheitAusOE) zum HS-Reporting (OE HSB4 K -> HSB)? Deren Zeilen ignoriert der
' Makler-Master. Nur in Wegen des Bereichs MAKLER gefragt (je Datenzeile, deshalb ohne IstMakler).
Public Function IstHsEinheit(e As String) As Boolean
    If Len(e) = 0 Then Exit Function
    IstHsEinheit = (InStr(1, HS_EINHEITEN, "|" & UCase$(Trim$(e)) & "|", vbBinaryCompare) > 0)
End Function

' Bereich MAKLER: HS-Einheit, deren Zeilen schon in den Fakten stehen (vor 12.91 mitgeladene HS-Abzuege), sonst leer
Private Function HsDatenGeladen() As String
    Dim liste As Variant, i As Long
    If Not IstMakler() Then Exit Function
    On Error GoTo Ende
    liste = EinheitenListe()
    For i = LBound(liste) To UBound(liste)
        If IstHsEinheit(CStr(liste(i))) Then HsDatenGeladen = CStr(liste(i)): Exit Function
    Next i
Ende:
End Function

' Bereich MAKLER: reiner HS-Abzug im Ordner Rohdaten oder in der Ablage – nicht laden, nicht an Celonis; die Datei bleibt, wo sie
' liegt, und heisst danach …_HS-ignoriert (wird nicht mehr gelesen). SharePoint ohne Dateipfad: im Tool ausgeblendet.
Private Sub HsAbzugAusmustern(ordner As String, datei As String)
    Dim neuName As String, fehler As String, p As Long
    hsDateien.Add DateiName(datei)
    If IstUrl(ordner) And spAblage <> 1 Then
        SpAusblenden datei, ordner
        hsAusgeblendet = hsAusgeblendet + 1
        LogSchreiben "  HS-Abzug (OE HSB4 K) im Makler-Reporting ignoriert, ausgeblendet: " & datei
        Exit Sub
    End If
    p = InStrRev(datei, ".")
    On Error Resume Next
    neuName = FreierDateiname(ordner, Left$(datei, p - 1) & HS_ENDUNG & Mid$(datei, p))
    Err.Clear
    On Error GoTo 0
    fehler = DateiUmbenennen(ordner, datei, neuName)
    If Len(fehler) = 0 Then
        LogSchreiben "  HS-Abzug (OE HSB4 K) im Makler-Reporting ignoriert: " & datei & " -> " & neuName
    Else
        LogSchreiben "  HS-Abzug (OE HSB4 K) im Makler-Reporting ignoriert, nicht umbenannt (" & fehler & "): " & datei
    End If
End Sub

' Hinweis fuer die Abschlussmeldung: ignorierte HS-Abzuege und HS-Zeilen dieses Ladens (leer, wenn keine)
Private Function HsMeldung() As String
    Dim t As String, d As Variant, n As Long
    If Not hsDateien Is Nothing Then
        If hsDateien.Count > 0 Then
            For Each d In hsDateien
                n = n + 1
                If n <= 3 Then t = t & IIf(n > 1, ", ", "") & CStr(d)
            Next d
            If hsDateien.Count > 3 Then t = t & " …"
            t = IIf(hsDateien.Count = 1, "1 HS-Abzug", hsDateien.Count & " HS-Abzüge") & " ignoriert (OE HSB4 K, gehört ins HS-Reporting): " & t
            If hsAusgeblendet = hsDateien.Count Then
                t = t & " – im Tool ausgeblendet"
            Else
                t = t & " – umbenannt in …" & HS_ENDUNG
            End If
        End If
    End If
    If hsZeilen > 0 Then t = t & IIf(Len(t) > 0, "; ", "") & ZahlDE(CDbl(hsZeilen)) & IIf(hsZeilen = 1, " Zeile", " Zeilen") & _
        " der HS-Einheit (OE HSB4 K) in Makler-Abzügen ignoriert"
    HsMeldung = t
End Function

' Zusatz fuer das Ladeprotokoll eines Strangs
Private Function HsText(n As Long) As String
    If n > 0 Then HsText = " · " & ZahlDE(CDbl(n)) & IIf(n = 1, " Zeile", " Zeilen") & " der HS-Einheit (OE HSB4 K) ignoriert"
End Function

' Anzeige- und Sortiername eines Strangs: "Verbund" bzw. "Verbund · ODPB D"
Public Function Strang(quelle As String, einheit As String) As String
    If Len(einheit) > 0 Then Strang = quelle & " · " & einheit Else Strang = quelle
End Function

' Schluessel eines Stands: Quelle[|Einheit]|Stichtag (ohne Einheit wie bisher Quelle|Stichtag)
Private Function StandSchluessel(quelle As String, einheit As String, tag As Date) As String
    If Len(einheit) > 0 Then
        StandSchluessel = quelle & TRENNER & einheit & TRENNER & CLng(tag)
    Else
        StandSchluessel = quelle & TRENNER & CLng(tag)
    End If
End Function

' Schluessel aus dem abgelegten Dateinamen: "@Quelle[_Einheitteil]|Stichtag"
Private Function NamensSchluessel(quelle As String, teil As String, tag As Date) As String
    NamensSchluessel = "@" & quelle & IIf(Len(teil) > 0, "_" & teil, "") & TRENNER & CLng(tag)
End Function

' Namensschluessel aus dem Dateinamen einer Protokollzeile (seit 12.88 traegt der Name die Einheiten der Datei, die Zeile nur
' ihre Einheit): passt der Stichtag im Namen zur Zeile, gilt die abgelegte Datei damit als geladen. Sonst leer.
Private Function NamensSchluesselDatei(rel As String, quelle As String, tag As Date) As String
    Dim t As Date, quellen As Variant, teil As String
    If Len(rel) = 0 Then Exit Function
    If Not NameZerlegen(rel, t, quellen, teil) Then Exit Function
    If CLng(t) = CLng(tag) Then NamensSchluesselDatei = NamensSchluessel(quelle, teil, tag)
End Function

' Einheit als Teil eines Dateinamens: Leerzeichen und Unterstriche werden zu "-", unzulaessige Zeichen fallen weg
Private Function EinheitDateiteil(einheit As String) As String
    Dim i As Long, ch As String, t As String
    For i = 1 To Len(einheit)
        ch = Mid$(einheit, i, 1)
        Select Case ch
            Case " ", "_": If Right$(t, 1) <> "-" Then t = t & "-"
            Case "\", "/", ":", "*", "?", """", "<", ">", "|", "'", ".", ","
            Case Else: t = t & ch
        End Select
    Next i
    EinheitDateiteil = t
End Function

' Abgelegter Name JJJJMMTT_BUe_<OPAG|Verbund|OPAG_Verbund>[_Einheit][_n]: Stichtag, Quellen und Einheit-Teil.
' Sammeldateien (JJJJMMTT-JJJJMMTT_…) nennen nicht jeden Stichtag: False (werden geoeffnet).
Private Function NameZerlegen(rel As String, ByRef tag As Date, ByRef quellen As Variant, ByRef teil As String) As Boolean
    Dim nm As String, t() As String, i As Long
    nm = DateiName(rel)
    nm = Left$(nm, InStrRev(nm, ".") - 1)
    If Not nm Like "########_BUe_*" Then Exit Function
    On Error GoTo Nein
    tag = DateSerial(CInt(Left$(nm, 4)), CInt(Mid$(nm, 5, 2)), CInt(Mid$(nm, 7, 2)))
    t = Split(Mid$(nm, 14), "_")
    i = 0
    If t(0) = "OPAG" And UBound(t) >= 1 Then
        If t(1) = "Verbund" Then quellen = Array("OPAG", "Verbund"): i = 2 Else quellen = Array("OPAG"): i = 1
    ElseIf t(0) = "OPAG" Then
        quellen = Array("OPAG"): i = 1
    ElseIf t(0) = "Verbund" Then
        quellen = Array("Verbund"): i = 1
    Else
        Exit Function
    End If
    teil = ""
    If UBound(t) >= i Then
        If Not t(i) Like String(Len(t(i)), "#") Then teil = t(i)          ' _2, _3 … ist das Doppel, keine Einheit
    End If
    NameZerlegen = True
    Exit Function
Nein:
    NameZerlegen = False
End Function

' Gruppe eines Abzugs (Bereich MAKLER): die Einheiten aller Zeilen (Spalte OE_NR, siehe EinheitAusOE), sortiert und mit "+"
' verbunden, z. B. "MSUE+ODPB+ODPP". Ohne Spalte OE_NR: die Kopfzeile "oe_nr = '…'" bzw. "oe_nr in (…)", sonst leer.
' zaehl: Zeilen je Einheit der Gruppe, rest: Zeilen anderer OEs, mitOE: Spalte OE_NR vorhanden (12.88)
Private Function GruppeErkennen(ws As Worksheet, kopfdaten As Variant, kopf As Long, letzteSpalte As Long, zaehl As Object, _
                                ByRef rest As Long, ByRef mitOE As Boolean, ByRef hs As Long) As String
    Dim r As Long, c As Long, t As String, p As Long, werte As Object, liste As Variant, teile() As String, i As Long, e As String
    Set werte = CreateObject("Scripting.Dictionary")
    rest = 0: mitOE = False: hs = 0
    For c = 1 To letzteSpalte
        If UCase$(Trim$(CStr(Nz(kopfdaten(kopf, c))))) = "OE_NR" Then
            mitOE = True
            liste = ws.Range(ws.Cells(kopf + 1, c), ws.Cells(ws.UsedRange.Row + ws.UsedRange.Rows.Count, c)).Value2
            For r = 1 To UBound(liste, 1)
                t = Trim$(CStr(Nz(liste(r, 1))))
                If Len(t) > 0 And Not t Like "Anzahl*" Then
                    t = EinheitAusOE(t)
                    If IstHsEinheit(t) Then
                        hs = hs + 1                                   ' Zeile des HS-Reportings (12.91): zaehlt nirgends
                    ElseIf GruppenEinheit(t) Then
                        If Not werte.Exists(t) Then werte.Add t, True
                        zaehl(t) = zaehl(t) + 1
                    Else
                        rest = rest + 1
                    End If
                End If
            Next r
            GruppeErkennen = SortiertVerbunden(werte)
            Exit Function
        End If
    Next c
    For r = 1 To kopf - 1
        For c = 1 To letzteSpalte
            t = Trim$(CStr(Nz(kopfdaten(r, c))))
            If LCase$(Left$(t, 5)) = "oe_nr" Then
                p = InStr(t, "=")
                If p = 0 Then p = InStr(1, t, " in ", vbTextCompare) + 3
                If p > 3 Then
                    teile = Split(EinheitNorm(Mid$(t, p + 1)), "+")
                    For i = 0 To UBound(teile)
                        e = EinheitAusOE(teile(i))
                        If IstHsEinheit(e) Then
                            hs = hs + 1
                        ElseIf GruppenEinheit(e) Then
                            If Not werte.Exists(e) Then werte.Add e, True
                        Else
                            rest = rest + 1
                        End If
                    Next i
                    GruppeErkennen = SortiertVerbunden(werte)
                    Exit Function
                End If
            End If
        Next c
    Next r
End Function

' Zaehlt eine Einheit fuer die Gruppe? Nur die in Konfiguration!R11:R40 genannten Einheiten (ODPB, ODPP, MSUE, KBI …), damit
' einzelne Zeilen anderer OEs (z. B. „ODP D“ selbst) die Gruppe nicht von Tag zu Tag aendern. Leere Tabelle: jede Einheit.
' Die Liste wird je Laden einmal gelesen (gruppenListe; wird fuer jede Datenzeile gefragt).
Private Function GruppenEinheit(e As String) As Boolean
    Dim liste As Variant, r As Long
    If gruppenListe Is Nothing Then
        Set gruppenListe = CreateObject("Scripting.Dictionary")
        gruppenListe.CompareMode = vbTextCompare
        On Error Resume Next
        liste = ThisWorkbook.Worksheets("Konfiguration").Range("R11:R40").Value2
        On Error GoTo 0
        If IsArray(liste) Then
            For r = 1 To UBound(liste, 1)
                If Len(Trim$(CStr(Nz(liste(r, 1))))) > 0 Then gruppenListe(Trim$(CStr(liste(r, 1)))) = True
            Next r
        End If
    End If
    If IstHsEinheit(e) Then Exit Function                   ' HS-Einheit (12.91) ist nie ein Makler-Strang
    GruppenEinheit = (gruppenListe.Count = 0 Or gruppenListe.Exists(e))
End Function

' Haupteinheit eines Blatts: die Einheit mit den meisten Zeilen (gleich viele: alphabetisch die erste); leer, wenn keine
Private Function HauptAusZaehlung(zaehl As Object) As String
    Dim k As Variant, best As Long
    For Each k In zaehl.Keys
        If CLng(zaehl(k)) > best Or (CLng(zaehl(k)) = best And CStr(k) < HauptAusZaehlung) Then
            best = CLng(zaehl(k)): HauptAusZaehlung = CStr(k)
        End If
    Next k
End Function

' dieselbe Regel auf den gelesenen Datenzeilen (Spalte OE_NR, ohne Fusszeilen „Anzahl …“)
Private Function HauptStrang(daten As Variant, sp() As Long) As String
    Dim r As Long, t As String, zaehl As Object
    If sp(9) = 0 Then Exit Function
    Set zaehl = CreateObject("Scripting.Dictionary")
    For r = 1 To UBound(daten, 1)
        t = Trim$(CStr(Nz(daten(r, sp(9)))))
        If Len(t) > 0 And Not t Like "Anzahl*" Then
            t = EinheitAusOE(t)
            If GruppenEinheit(t) Then zaehl(t) = zaehl(t) + 1
        End If
    Next r
    HauptStrang = HauptAusZaehlung(zaehl)
End Function

' Strang einer Datenzeile (Bereich MAKLER, Spalte OE_NR): ihre Einheit, wenn sie in Konfiguration!R11:R40 steht, sonst die
' Haupteinheit des Blatts. Ohne Spalte OE_NR entscheidet der Aufrufer (ein Strang je Blatt).
Private Function ZeileStrang(daten As Variant, r As Long, sp() As Long, haupt As String) As String
    Dim e As String
    e = ZeilenEinheit(daten, r, sp)
    If e <> "(ohne OE)" And Len(e) > 0 Then
        If GruppenEinheit(e) Then ZeileStrang = e: Exit Function
    End If
    ZeileStrang = haupt
End Function

' Verkettungskennzeichen „verkettet, nicht führend“ -> Zeile zaehlt nicht (wie im MIS-O-Bericht). Tolerant geschrieben:
' Gross/Klein, Bindestrich/Unterstrich, ohne Umlaut („nicht fuehrend“, „nicht-führend“, „Verkettet_nicht_fuehrend“)
Private Function NichtFuehrend(daten As Variant, r As Long, sp() As Long) As Boolean
    Dim t As String
    If sp(10) = 0 Then Exit Function
    t = LCase$(CStr(Nz(daten(r, sp(10)))))
    t = Replace(Replace(Replace(t, "-", " "), "_", " "), "ue", "ü")
    Do While InStr(t, "  ") > 0
        t = Replace(t, "  ", " ")
    Loop
    NichtFuehrend = (InStr(t, "nicht führ") > 0 Or InStr(t, "nichtführ") > 0)
End Function

' Hinweis fuer das Ladeprotokoll: ob der Abzug die Spalte Verkettungskennzeichen hat und wie viele verkettete, nicht fuehrende
' Vorgaenge ausgelassen wurden. Ohne Spalte zaehlen sie mit – MIS-O-Berichte mit Verkettungsfilter zeigen dann weniger.
Private Function VerkettungHinweis(sp() As Long, n As Long, mitTrenner As Boolean) As String
    VerkettungHinweis = VerkettungText(sp(10) > 0, n, mitTrenner)
End Function

Private Function VerkettungText(mitSpalte As Boolean, n As Long, mitTrenner As Boolean) As String
    Dim t As String
    If Not mitSpalte Then
        t = "ohne Spalte Verkettungskennzeichen: verkettete, nicht führende Vorgänge zählen mit (MIS-O-Bericht mit Verkettungsfilter zeigt weniger)"
    Else
        t = "Verkettungskennzeichen: " & Format(n, "#,##0") & IIf(n = 1, " nicht führender Vorgang", " nicht führende Vorgänge") & " ausgelassen"
    End If
    VerkettungText = IIf(mitTrenner, " · ", "") & t
End Function

Private Function SortiertVerbunden(d As Object) As String
    Dim w As Variant, i As Long, j As Long, tmp As Variant
    If d.Count = 0 Then Exit Function
    w = d.Keys
    For i = 0 To UBound(w) - 1
        For j = i + 1 To UBound(w)
            If w(j) < w(i) Then tmp = w(i): w(i) = w(j): w(j) = tmp
        Next j
    Next i
    SortiertVerbunden = Join(w, "+")
End Function

' Einheit einer Datenzeile (Bereich MAKLER, Spalte OE_NR), sonst leer
Private Function ZeilenEinheit(daten As Variant, r As Long, sp() As Long) As String
    If sp(9) = 0 Then Exit Function                       ' StandDatenLesen setzt sp(9) nur im Bereich MAKLER
    ZeilenEinheit = EinheitAusOE(Trim$(CStr(Nz(daten(r, sp(9))))))
End Function

' OE_NR -> Einheit (OE-Ebene 4): laengster passender Anfang aus Konfiguration!Q11:Q40 -> R; sonst die fuehrenden Buchstaben
' ohne angehaengtes "HH" (ODPB1 D -> ODPB, ODPBHH -> ODPB, MSUE2 M -> MSUE). Ergebnisse werden je Laden zwischengespeichert.
Public Function EinheitAusOE(oe As String) As String
    Dim t As String, i As Long, ch As String, zuordnung As Variant, r As Long, best As Long, anf As String
    t = UCase$(Trim$(oe))
    If Len(t) = 0 Then EinheitAusOE = "(ohne OE)": Exit Function
    If oeEinheit Is Nothing Then Set oeEinheit = CreateObject("Scripting.Dictionary")
    If oeEinheit.Exists(t) Then EinheitAusOE = oeEinheit(t): Exit Function
    On Error Resume Next
    zuordnung = ThisWorkbook.Worksheets("Konfiguration").Range("Q11:R40").Value2
    On Error GoTo 0
    If IsArray(zuordnung) Then
        For r = 1 To UBound(zuordnung, 1)
            anf = UCase$(Trim$(CStr(Nz(zuordnung(r, 1)))))
            If Len(anf) > best And Len(Trim$(CStr(Nz(zuordnung(r, 2))))) > 0 Then
                If Left$(t, Len(anf)) = anf Then best = Len(anf): EinheitAusOE = Trim$(CStr(zuordnung(r, 2)))
            End If
        Next r
    End If
    If best = 0 Then
        For i = 1 To Len(t)
            ch = Mid$(t, i, 1)
            If ch Like "[A-Z]" Then EinheitAusOE = EinheitAusOE & ch Else Exit For
        Next i
        If Len(EinheitAusOE) > 4 And Right$(EinheitAusOE, 2) = "HH" Then EinheitAusOE = Left$(EinheitAusOE, Len(EinheitAusOE) - 2)
        If Len(EinheitAusOE) = 0 Then EinheitAusOE = t
    End If
    oeEinheit.Add t, EinheitAusOE
End Function

' Namen der Einheiten fuer die Sicht "Einheit" der Rueckstandsdiagramme (Filter!L22:L25): bis zu vier Einheiten alphabetisch,
' bei mehr als vier die ersten drei und "Übrige"
Public Sub EinheitenNamenSetzen()
    Dim liste As Variant, n As Long, i As Long, aus(1 To 4, 1 To 1) As Variant
    liste = EinheitenListe()
    n = UBound(liste) - LBound(liste) + 1
    If n < 0 Then n = 0
    For i = 1 To 4
        If i <= n Then aus(i, 1) = liste(LBound(liste) + i - 1)
    Next i
    If n > 4 Then aus(4, 1) = "Übrige"
    ThisWorkbook.Worksheets("Filter").Range("L22:L25").Value = aus
    EinheitChipsSetzen liste
End Sub

' Einheiten-Chips im Cockpit (Bereich Makler, 12.86): Filter!X5:X10 die ersten sechs Einheiten der Fakten (sortiert), Y = im Filter.
' Bekannte Einheiten behalten ihren Zustand, neue kommen mit WAHR; leere Zeilen stehen auf WAHR (ohne Chip, ohne Wirkung).
' Ab der siebten Einheit gibt es keinen Chip – solche Einheiten zaehlen immer (nicht in EH_Liste).
Private Sub EinheitChipsSetzen(liste As Variant)
    Dim ws As Worksheet, alt As Object, i As Long, n As Long, namen(1 To 6, 1 To 1) As Variant, zust(1 To 6, 1 To 1) As Variant, e As String
    Set ws = ThisWorkbook.Worksheets("Filter")
    Set alt = CreateObject("Scripting.Dictionary")
    For i = 5 To 10
        e = CStr(Nz(ws.Cells(i, 24).Value))
        If Len(e) > 0 And Not alt.Exists(e) Then alt.Add e, (ws.Cells(i, 25).Value <> False)
    Next i
    n = UBound(liste) - LBound(liste) + 1
    If n < 0 Then n = 0
    For i = 1 To 6
        zust(i, 1) = True
        If i <= n Then
            e = CStr(liste(LBound(liste) + i - 1))
            namen(i, 1) = e
            If alt.Exists(e) Then zust(i, 1) = alt(e)
        Else
            namen(i, 1) = Empty
        End If
    Next i
    ws.Range("X5:X10").Value = namen
    ws.Range("Y5:Y10").Value = zust
    If n > 6 Then LogSchreiben "Einheiten-Chips: " & n & " Einheiten, Chips nur für die ersten sechs"
End Sub

' "'ODPB D'" / "('ODPB D', 'ODPP D')" -> "ODPB D" / "ODPB D+ODPP D"
Private Function EinheitNorm(t As String) As String
    Dim s As String, teile() As String, i As Long, e As String
    s = Replace(Replace(Replace(Replace(t, "'", ""), Chr(34), ""), "(", ""), ")", "")
    teile = Split(s, ",")
    For i = 0 To UBound(teile)
        e = Trim$(teile(i))
        Do While InStr(e, "  ") > 0: e = Replace(e, "  ", " "): Loop
        If Len(e) > 0 Then EinheitNorm = EinheitNorm & IIf(Len(EinheitNorm) > 0, "+", "") & e
    Next i
End Function

' Einheiten in den geladenen Fakten (Spalte R), sortiert – fuer die Einheiten-Auswahl (modWerkzeuge.EinheitZeigen, Dateien vor 12.70)
Public Function EinheitenListe() As Variant
    Dim ws As Worksheet, letzte As Long, a As Variant, d As Object, i As Long, j As Long, w As Variant, tmp As Variant, t As String
    Set ws = ThisWorkbook.Worksheets("Fakten")
    Set d = CreateObject("Scripting.Dictionary")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 2 Then
        a = ws.Range(ws.Cells(2, SP_EINHEIT_F), ws.Cells(letzte + 1, SP_EINHEIT_F)).Value2
        For i = 1 To UBound(a, 1) - 1
            t = CStr(Nz(a(i, 1)))
            If Len(t) > 0 Then
                If Not d.Exists(t) Then d.Add t, True
            End If
        Next i
    End If
    If d.Count = 0 Then EinheitenListe = Array(): Exit Function
    w = d.Keys
    For i = 0 To UBound(w) - 1
        For j = i + 1 To UBound(w)
            If w(j) < w(i) Then tmp = w(i): w(i) = w(j): w(j) = tmp
        Next j
    Next i
    EinheitenListe = w
End Function

' ---------------------------------------------------------------- Tool leeren (Knopf "Zurücksetzen" im Cockpit)
' Leert alle geladenen Staende: Fakten, Umbuchungen, Verlauf (bis auf die erste Formelzeile), Ladeprotokoll, Snapshots, die
' Postkorb-Liste im Filter und die Standard-Auswahl der Postkoerbe. Mit anwesenheit zusaetzlich Mitarbeiter und Kalender.
' Die Rohdateien bleiben im Ordner; "Neue Daten laden" liest sie danach wieder ein (auch aus der Monatsablage).
Public Sub ToolLeeren(anwesenheit As Boolean)
    Dim ws As Worksheet, letzte As Long, q As Variant, calc As XlCalculation
    If lademodusAktiv Then Exit Sub
    calc = Application.Calculation
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    On Error GoTo Ende
    LogSchreiben "---- Tool leeren" & IIf(anwesenheit, " (mit Anwesenheit)", "")
    Set ws = ThisWorkbook.Worksheets("Fakten")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 2 Then ws.Range(ws.Cells(2, 1), ws.Cells(letzte, 15)).ClearContents
    If letzte >= 2 Then ws.Range(ws.Cells(2, SP_EINHEIT_F), ws.Cells(letzte, SP_ALTSUM_F)).ClearContents
    If letzte >= 3 Then ws.Range(ws.Cells(3, FAKTEN_SPALTEN), ws.Cells(letzte, FAKTEN_SPALTEN + 1)).ClearContents   ' Formeln ab Zeile 3 (Zeile 2 bleibt Vorlage)
    Set ws = ThisWorkbook.Worksheets("Umbuchungen")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 2 Then ws.Range(ws.Cells(2, 1), ws.Cells(letzte, 10)).ClearContents
    If letzte >= 2 Then ws.Range(ws.Cells(2, SP_EINHEIT_U), ws.Cells(letzte, SP_EINHEIT_VOR_U)).ClearContents
    Set ws = ThisWorkbook.Worksheets("Verlauf")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 7 Then ws.Rows("7:" & letzte).ClearContents
    ws.Range("A6").ClearContents
    ws.Range("AL6").Value = 1: ws.Range("AM6").Value = 1
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte >= 5 Then ws.Range(ws.Cells(5, 1), ws.Cells(letzte, SP_GRUPPE_L)).ClearContents
    For Each q In Array("OPAG", "Verbund")
        Set ws = SnapshotBlatt(CStr(q))
        ws.Range(ws.Cells(2, 1), ws.Cells(ws.Rows.Count, 6)).ClearContents
        ws.Range("H2:H3").ClearContents
        ws.Range(ws.Cells(2, 10), ws.Cells(SNAP_EINHEITEN + 1, 12)).ClearContents
    Next q
    ' Postkoerbe: Liste und Kennzeichen im Filter, Standard-Auswahl in der Konfiguration (zeilengleich I11:I50)
    ThisWorkbook.Worksheets("Filter").Range(ThisWorkbook.Worksheets("Filter").Cells(PK_VON, 2), ThisWorkbook.Worksheets("Filter").Cells(PK_BIS, 3)).ClearContents
    ThisWorkbook.Worksheets("Konfiguration").Range("I11:I50").ClearContents
    ThisWorkbook.Worksheets("Filter").Range("L16").Value = "Gesamt"
    EinheitenNamenSetzen
    If anwesenheit Then AnwesenheitLeeren
    modCockpit.BezugFormelSetzen
Ende:
    Dim fehlertext As String
    If Err.Number <> 0 Then fehlertext = Err.Description
    On Error Resume Next
    Application.Calculation = xlCalculationAutomatic
    Application.Calculate
    modCockpit.DiagrammeAnpassen True
    Application.Calculation = calc
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    If Len(fehlertext) > 0 Then
        LogSchreiben "FEHLER beim Leeren: " & fehlertext
        modFortschritt.HinweisZeigen "Fehler", "Beim Zurücksetzen ist ein Fehler aufgetreten: " & fehlertext, True
    End If
End Sub

' Mitarbeiter (Stammdaten A:N ab MA_START) und Kalender (Eintraege ab Zeile 7) leeren, Formeln bleiben
Private Sub AnwesenheitLeeren()
    Dim ws As Worksheet, rg As Range
    Set ws = ThisWorkbook.Worksheets("Mitarbeiter")
    On Error Resume Next
    Set rg = ws.Range(ws.Cells(MA_START, 1), ws.Cells(MA_START + MA_ZEILEN - 1, 14)).SpecialCells(xlCellTypeConstants)
    If Not rg Is Nothing Then rg.ClearContents
    ws.Range("W5:W7").ClearContents                        ' letzte Datei, Zeitpunkt, Format
    Set rg = Nothing
    Set ws = ThisWorkbook.Worksheets("Kalender")
    Set rg = ws.Range(ws.Cells(MA_START + PL_VERSATZ, 4), ws.Cells(MA_START + PL_VERSATZ + MA_ZEILEN - 1, ws.Columns.Count)).SpecialCells(xlCellTypeConstants)
    If Not rg Is Nothing Then rg.ClearContents
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Beladung läuft (orange Box oben rechts im Cockpit)
' Filter!L28 = Name, L29 = Beginn. Gesetzt beim Start von „Neue Daten laden“, geleert am Ende (auch nach Fehler, Ersatz-Frage,
' leerem Ordner). Die Datei wird jeweils gespeichert, damit Kollegen auf SharePoint die Box sehen bzw. danach die neuen Werte.
' Wer die Datei schon vorher offen hatte, sieht L28/L29 aber nicht (seine Kopie wird nicht nachgefuehrt). Deshalb zusaetzlich eine
' Sperrdatei neben der Master-Datei (<Master>_Beladung.txt, erste Zeile „Name<TAB>JJJJ-MM-TT hh:mm:ss“, nach dem Ende
' „frei<TAB>Name<TAB>Ende“), die jeder Klick frisch liest: lokal bzw. im synchronisierten Ordner direkt, im SharePoint-Modus ueber
' Power Query (Abfrage BUE_SharePoint_Sperre, Blatt SP_Liste ab N1) – geschrieben wie das Celonis-Protokoll.
Public Function NutzerName() As String
    Dim t As String
    t = Trim$(Application.UserName)
    If InStr(t, "(") > 1 Then t = Trim$(Left$(t, InStr(t, "(") - 1))   ' "Brenneisen, Eike (HSB4K-EXTERN)" -> "Brenneisen, Eike"
    If Len(t) = 0 Then t = Environ$("USERNAME")
    NutzerName = t
End Function

' Laeuft gerade die Beladung eines anderen? Ergebnis: Hinweistext, sonst leer. Quellen: L28/L29 der eigenen Kopie und die Sperrdatei
' (siehe oben). Meldet die Sperrdatei „frei“ mit einem Ende nach dem Beginn in L28/L29, ist jene Beladung vorbei (die Datei wurde
' danach nicht mehr gespeichert, etwa nach einem Abbruch beim Ersetzen).
Public Function BeladungAndererText() As String
    Dim ws As Worksheet, wer As String, seit As Variant, beginn As Double, ende As Double, z As String, t() As String
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Filter")
    wer = Trim$(CStr(ws.Range("L28").Value))
    seit = ws.Range("L29").Value2                            ' Zahl (Datum als Seriennummer), unabhaengig vom Zellformat
    If IsNumeric(seit) And Not IsEmpty(seit) Then beginn = CDbl(seit)
    z = BeladungDateiLesen()
    t = Split(z, vbTab)
    If UBound(t) >= 1 Then
        If StrComp(TextFeld(t(0)), "frei", vbTextCompare) = 0 Then
            If UBound(t) >= 2 Then ende = ZeitAusText(TextFeld(t(2)))
            If ende > 0 And ende >= beginn Then wer = ""
        Else
            BeladungAndererText = BeladungHinweis(TextFeld(t(0)), ZeitAusText(TextFeld(t(1))))
            If Len(BeladungAndererText) > 0 Then Exit Function
        End If
    End If
    BeladungAndererText = BeladungHinweis(wer, beginn)
End Function

' Hinweistext zu einer Beladung (Name, Beginn als Zahl); leer, wenn keine, die eigene (etwa nach einem Absturz von Excel) oder
' aelter als 3 Stunden (gilt dann als abgebrochen)
Private Function BeladungHinweis(wer As String, seit As Double) As String
    If Len(wer) = 0 Or seit <= 0 Then Exit Function
    If CDbl(Now) - seit > 0.125 Then Exit Function
    If StrComp(wer, NutzerName(), vbTextCompare) = 0 Then Exit Function
    BeladungHinweis = wer & " lädt gerade neue Daten (seit " & Format$(CDate(seit), "hh:nn") & " Uhr). Bitte warten, bis die Beladung " & _
        "fertig ist. Danach die Datei schließen, ohne zu speichern, und neu öffnen, damit die neuen Werte erscheinen."
End Function

' Name der Sperrdatei: je Master-Datei (HS und Makler koennen im selben Ordner liegen)
Private Function BeladungDatei() As String
    Dim nm As String
    nm = ThisWorkbook.Name
    If InStrRev(nm, ".") > 1 Then nm = Left$(nm, InStrRev(nm, ".") - 1)
    BeladungDatei = nm & "_Beladung.txt"
End Function

' erste Zeile der Sperrdatei; leer = keine Datei, leer oder nicht lesbar (dann gilt nur L28/L29)
Private Function BeladungDateiLesen() As String
    Dim b As String, m As String, a As Variant, f As Integer, z As String
    On Error GoTo Fehler
    b = BasisOrdner()
    If Len(b) = 0 Then Exit Function
    If IstUrl(b) Then
        m = SpTextFormel(b, BeladungDatei(), PROTOKOLL_ORDNER)
        If Len(m) = 0 Then Exit Function
        a = SpTabelle(SP_SPERRE_ABFRAGE, m, "N1", "Sperrdatei „Beladung läuft“ aus dem SharePoint-Ordner der Master-Datei (wird vom Tool geschrieben)")
        If IsArray(a) Then BeladungDateiLesen = CStr(Nz(a(1, 1)))
    Else
        If Len(Dir(ProtokollPfad(b, BeladungDatei()))) = 0 Then Exit Function
        f = FreeFile
        Open ProtokollPfad(b, BeladungDatei()) For Input As #f
        If Not EOF(f) Then Line Input #f, z
        Close #f
        f = 0
        BeladungDateiLesen = z
    End If
    Exit Function
Fehler:
    z = Err.Description
    On Error Resume Next
    If f > 0 Then Close #f
    LogSchreiben "  Sperrdatei " & BeladungDatei() & " nicht lesbar: " & z
End Function

' Sperrdatei schreiben (an: Beginn, aus: „frei“ mit Ende). Fehler halten das Laden nicht auf, sie stehen im Ladelog.
Private Sub BeladungDateiSchreiben(an As Boolean)
    Dim b As String, zeile As Variant, f As Integer, wb As Workbook, bild As Boolean, fehler As String
    bild = Application.ScreenUpdating
    On Error GoTo Fehler
    b = BasisOrdner()
    If Len(b) = 0 Then Exit Sub
    If an Then
        zeile = Array(NutzerName(), Format$(Now, "yyyy-mm-dd hh:nn:ss"))
    Else
        zeile = Array("frei", NutzerName(), Format$(Now, "yyyy-mm-dd hh:nn:ss"))
    End If
    If IstUrl(b) Then                                        ' SharePoint ohne Dateipfad: ueber Excel als Text speichern
        Application.ScreenUpdating = False
        Set wb = Workbooks.Add(xlWBATWorksheet)
        wb.Worksheets(1).Range("A1").Resize(1, UBound(zeile) + 1).NumberFormat = "@"
        wb.Worksheets(1).Range("A1").Resize(1, UBound(zeile) + 1).Value = zeile
        SpTextSpeichern wb, b, BeladungDatei()                  ' xlTextWindows, in Protokolle (sonst neben der Master-Datei)
        wb.Close SaveChanges:=False
        Set wb = Nothing
        ThisWorkbook.Activate
        Application.ScreenUpdating = bild
    Else
        f = FreeFile
        Open ProtokollPfad(b, BeladungDatei()) For Output As #f
        Print #f, Join(zeile, vbTab)
        Close #f
        f = 0
    End If
    Exit Sub
Fehler:
    fehler = Err.Description
    On Error Resume Next
    If f > 0 Then Close #f
    Application.DisplayAlerts = True
    If Not wb Is Nothing Then wb.Close SaveChanges:=False: ThisWorkbook.Activate
    Application.ScreenUpdating = bild
    LogSchreiben "  Sperrdatei " & BeladungDatei() & " nicht geschrieben: " & fehler
End Sub

' "2026-10-08 09:15:00" -> Zeitpunkt als Zahl (unabhaengig von der Spracheinstellung), sonst 0
Private Function ZeitAusText(t As String) As Double
    Dim s As String
    s = Trim$(t)
    If Not (s Like "####-##-## ##:##:##") Then Exit Function
    On Error Resume Next
    ZeitAusText = CDbl(DateSerial(CInt(Left$(s, 4)), CInt(Mid$(s, 6, 2)), CInt(Mid$(s, 9, 2)))) + _
                  CDbl(TimeSerial(CInt(Mid$(s, 12, 2)), CInt(Mid$(s, 15, 2)), CInt(Mid$(s, 18, 2))))
End Function

' Sperre setzen/aufheben: L28/L29, Sperrdatei, dann die Master-Datei speichern (speichern = False: nur Sperre aufheben, etwa nach
' einem Abbruch beim Ersetzen). Vor dem Speichern wird das Ladefenster (LADE_*) entfernt, sonst laege es in der gespeicherten Datei
' ueber dem Cockpit und fienge die Klicks ab.
Private Sub BeladungMarkieren(an As Boolean, Optional speichern As Boolean = True)
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Filter")
    If an Then
        ws.Range("L28").Value = NutzerName()
        ws.Range("L29").Value = Now
    Else
        ws.Range("L28:L29").ClearContents
        modFortschritt.FortschrittSchliessen
    End If
    BeladungDateiSchreiben an
    If ThisWorkbook.ReadOnly Or Not speichern Then Exit Sub
    Application.DisplayAlerts = False
    ThisWorkbook.Save
    Application.DisplayAlerts = True
    If Err.Number <> 0 Then LogSchreiben "  Speichern fuer die Beladungs-Box nicht moeglich: " & Err.Description
    Err.Clear
End Sub

' ---------------------------------------------------------------- Ältester Vorgang (Knopf an der Kachel im Cockpit)
' Faktenzeile mit dem hoechsten Rueckstandsalter am letzten Stichtag der Quelle nach aktivem Filter – dieselbe Rechnung wie die
' Kachel (Filter!O31/O32 Stichtag, O47/O48 Alter). Ergebnis Array: 0 Quelle, 1 Stichtag, 2 Alter, 3 Sparte, 4 VSS, 5 Postkorb,
' 6 GeVo, 7 Einheit, 8 Gruppe, 9 Schluessel (leer bei Staenden, die vor 12.64 geladen wurden), 10 Datei, 11 Blatt; Empty = keiner.
Public Function AeltesterVorgang(quelle As String) As Variant
    Dim wsF As Worksheet, wsI As Worksheet, tag As Variant, alter As Variant, letzte As Long, a As Variant, e As Variant, r As Long
    Dim w As Variant, datei As String, blatt As String, wsL As Worksheet, p As Variant
    Set wsI = ThisWorkbook.Worksheets("Filter")
    tag = wsI.Range(IIf(quelle = "OPAG", "O31", "O32")).Value2
    alter = wsI.Range(IIf(quelle = "OPAG", "O48", "O47")).Value2
    If Not IsNumeric(tag) Or IsEmpty(tag) Then Exit Function
    If Not IsNumeric(alter) Or IsEmpty(alter) Then Exit Function
    If CDbl(tag) <= 0 Then Exit Function
    Set wsF = ThisWorkbook.Worksheets("Fakten")
    letzte = wsF.Cells(wsF.Rows.Count, 1).End(xlUp).Row
    If letzte < 2 Then Exit Function
    a = wsF.Range(wsF.Cells(2, 1), wsF.Cells(letzte + 1, FAKTEN_SPALTEN)).Value2
    e = wsF.Range(wsF.Cells(2, SP_EINHEIT_F), wsF.Cells(letzte + 1, SP_VORGANG_F)).Value2
    For r = 1 To UBound(a, 1) - 1
        If Val(a(r, 1)) = CLng(tag) And CStr(Nz(a(r, 2))) = quelle And Val(a(r, FAKTEN_SPALTEN)) = 1 Then
            If Val(e(r, 3)) = CDbl(alter) Then
                w = Array(quelle, CDate(tag), CDbl(alter), CStr(Nz(a(r, 3))), CStr(Nz(a(r, 4))), CStr(Nz(a(r, 5))), CStr(Nz(a(r, 6))), _
                          CStr(Nz(e(r, 1))), CStr(Nz(e(r, 2))), CStr(Nz(e(r, 4))), "", "")
                Exit For
            End If
        End If
    Next r
    If Not IsArray(w) Then Exit Function
    ' Rohdatei des Stands aus dem Ladeprotokoll (gueltige Zeile zu Quelle, Stichtag, Gruppe)
    Set wsL = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = wsL.Cells(wsL.Rows.Count, 1).End(xlUp).Row
    If letzte >= 5 Then
        p = wsL.Range(wsL.Cells(5, 1), wsL.Cells(letzte + 1, SP_GRUPPE_L)).Value2
        For r = 1 To UBound(p, 1) - 1
            If CStr(Nz(p(r, 4))) = quelle And Val(p(r, 5)) = CLng(tag) And CStr(Nz(p(r, SP_GRUPPE_L))) = CStr(w(8)) Then
                If StandGueltig(CStr(Nz(p(r, 10)))) Then datei = CStr(Nz(p(r, 2))): blatt = CStr(Nz(p(r, 3)))
            End If
        Next r
    End If
    w(10) = datei: w(11) = blatt
    AeltesterVorgang = w
End Function

' Rohdatei des aeltesten Vorgangs sichtbar oeffnen (schreibgeschuetzt) und die Zeile gelb markieren. Gesucht wird ueber den
' Schluessel (VSS, Ordnungsbegriff, LNR …); fehlt er: die Zeile mit VSS, Postkorb und GeVo und dem hoechsten Alter.
' Ergebnis leer = markiert, sonst Hinweistext.
Public Function VorgangMarkieren(quelle As String) As String
    Dim v As Variant, ordner As String, pfad As String, wb As Workbook, ws As Worksheet, w As Worksheet, pruef As Stand
    Dim kopfdaten As Variant, kopf As Long, letzteSpalte As Long, r As Long, c As Long, sp() As Long, daten As Variant
    Dim letzte As Range, letzteZeile As Long, ziel As Long, best As Double, alt As Double, nm As String, st As Stand, mitSchluessel As Boolean
    v = AeltesterVorgang(quelle)
    If Not IsArray(v) Then VorgangMarkieren = "Kein Rückstand " & quelle & " am letzten Stichtag.": Exit Function
    If Len(v(10)) = 0 Then VorgangMarkieren = "Die Rohdatei dieses Stands steht nicht im Ladeprotokoll.": Exit Function
    On Error GoTo Fehler
    ReDim sp(1 To 10)
    Set spListen = Nothing
    ordner = RohdatenOrdner()
    st.Datei = CStr(v(10)): st.Quelle = quelle: st.Stichtag = v(1): st.Gruppe = CStr(v(8))
    If Not IstUrl(ordner) Then
        If Not DateiVorhanden(ordner & st.Datei) Then st.Datei = StandDatei(ordner, st)
    End If
    If Len(st.Datei) = 0 Then VorgangMarkieren = "Die Rohdatei " & v(10) & " liegt nicht mehr im Ordner Rohdaten.": Exit Function
    pfad = PfadVon(ordner, st.Datei)
    nm = DateiName(pfad)
    On Error Resume Next
    Set wb = Workbooks(nm)
    On Error GoTo Fehler
    If wb Is Nothing Then
        Application.StatusBar = "Öffne " & nm & " …"
        Set wb = Workbooks.Open(FileName:=pfad, UpdateLinks:=0, ReadOnly:=True, IgnoreReadOnlyRecommended:=True)
        Application.StatusBar = False
    End If
    On Error Resume Next
    Set ws = wb.Worksheets(CStr(v(11)))
    On Error GoTo Fehler
    If ws Is Nothing Then
        For Each w In wb.Worksheets
            If BlattErkennen(w, pruef) Then
                If pruef.Quelle = quelle And CLng(pruef.Stichtag) = CLng(v(1)) Then Set ws = w: Exit For
            End If
        Next w
    End If
    If ws Is Nothing Then VorgangMarkieren = "Blatt des Stands in " & nm & " nicht gefunden.": Exit Function
    letzteSpalte = ws.UsedRange.Column + ws.UsedRange.Columns.Count - 1
    kopfdaten = ws.Range(ws.Cells(1, 1), ws.Cells(MAX_KOPFZEILEN, letzteSpalte)).Value2
    For r = 1 To MAX_KOPFZEILEN
        For c = 1 To letzteSpalte
            If Trim$(CStr(Nz(kopfdaten(r, c)))) = "Themenpostkorb" Then kopf = r
        Next c
        If kopf > 0 Then Exit For
    Next r
    If kopf = 0 Then VorgangMarkieren = "Kopfzeile in " & nm & " nicht gefunden.": Exit Function
    For c = 1 To letzteSpalte
        Select Case UCase$(Trim$(CStr(Nz(kopfdaten(kopf, c)))))
            Case "VERWALTUNGSSYSTEMSCHLÜSSEL": sp(1) = c
            Case "ORDNUNGSBEGRIFF": sp(2) = c
            Case "VORG_VERBU_LNR": sp(3) = c
            Case "THEMENPOSTKORB": sp(4) = c
            Case "RÜCKSTANDSALTER_TAGE": sp(5) = c
            Case "GEVO_SL": sp(6) = c
            Case "OPS_AUFTR_ID": sp(7) = c
            Case "OPS_ARBGUT_LNR": sp(8) = c
        End Select
    Next c
    If sp(1) = 0 Or sp(2) = 0 Or sp(3) = 0 Or sp(4) = 0 Or sp(5) = 0 Or sp(6) = 0 Then VorgangMarkieren = "Spalten in " & nm & " nicht erkannt.": Exit Function
    Set letzte = ws.Columns(sp(1)).Find(What:="*", LookIn:=xlValues, SearchOrder:=xlByRows, SearchDirection:=xlPrevious)
    If letzte Is Nothing Then letzteZeile = kopf Else letzteZeile = letzte.Row
    If letzteZeile <= kopf Then VorgangMarkieren = "Keine Datensätze in " & nm & ".": Exit Function
    daten = ws.Range(ws.Cells(kopf + 1, 1), ws.Cells(letzteZeile + 1, letzteSpalte)).Value2      ' +1: immer zweidimensional
    mitSchluessel = (Len(CStr(v(9))) > 0)
    best = -1
    For r = 1 To UBound(daten, 1) - 1
        If mitSchluessel Then
            If DatensatzSchluessel(daten, r, sp, quelle) = CStr(v(9)) Then ziel = r: Exit For
        ElseIf Sauber(daten(r, sp(1))) = CStr(v(4)) Then
            If PostkorbNorm(CStr(Nz(daten(r, sp(4))))) = CStr(v(5)) And Verdichten(CStr(Nz(daten(r, sp(6))))) = CStr(v(6)) Then
                If IsNumeric(daten(r, sp(5))) And Not IsEmpty(daten(r, sp(5))) Then
                    alt = CDbl(daten(r, sp(5)))
                    If alt > best Then best = alt: ziel = r
                End If
            End If
        End If
    Next r
    If ziel = 0 Then VorgangMarkieren = "Der Vorgang wurde in " & nm & " nicht gefunden.": Exit Function
    wb.Activate
    ws.Activate
    ws.Range(ws.Cells(kopf + ziel, 1), ws.Cells(kopf + ziel, letzteSpalte)).Interior.Color = RGB(255, 230, 120)
    Application.Goto ws.Cells(kopf + ziel, 1), True
    ws.Range(ws.Cells(kopf + ziel, 1), ws.Cells(kopf + ziel, letzteSpalte)).Select
    Exit Function
Fehler:
    Application.StatusBar = False
    VorgangMarkieren = "Rohdatei konnte nicht geöffnet werden: " & Err.Description
End Function

' ---------------------------------------------------------------- Rohdateien (Knopf "Rohdaten löschen" im Cockpit)
' Alle Excel-Dateien im Rohdaten-Ordner und in der Ablage (relative Pfade, neueste zuerst nach Dateiname/Datum)
Public Function RohdateienListe() As Variant
    Dim ordner As String, dateien() As String, n As Long, i As Long, j As Long, t As String, aus() As String
    On Error GoTo Leer
    Set spListen = Nothing
    ordner = RohdatenOrdner()
    If Not OrdnerVorhanden(ordner) Then GoTo Leer
    n = DateienSammeln(ordner, dateien)
    If n = 0 Then GoTo Leer
    For i = 0 To n - 2
        For j = i + 1 To n - 1
            If StrComp(DateiName(dateien(j)), DateiName(dateien(i)), vbTextCompare) > 0 Then t = dateien(i): dateien(i) = dateien(j): dateien(j) = t
        Next j
    Next i
    ReDim aus(0 To n - 1)
    For i = 0 To n - 1
        aus(i) = dateien(i)
    Next i
    RohdateienListe = aus
    Exit Function
Leer:
    RohdateienListe = Array()
End Function

' Wurde aus dieser Datei (relativer Pfad) ein Stand geladen? (Ladeprotokoll, gueltige Zeilen)
Public Function RohdateiGeladen(rel As String) As Boolean
    Dim ws As Worksheet, letzte As Long, a As Variant, r As Long, h As String
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    letzte = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If letzte < 5 Then Exit Function
    a = ws.Range(ws.Cells(5, 1), ws.Cells(letzte + 1, 10)).Value2
    For r = 1 To UBound(a, 1) - 1
        h = CStr(Nz(a(r, 10)))
        If StandGueltig(h) Then
            If StrComp(DateiName(CStr(Nz(a(r, 2)))), DateiName(rel), vbTextCompare) = 0 Then RohdateiGeladen = True: Exit Function
        End If
    Next r
End Function

Public Function RohdateiGroesse(rel As String) As Double
    RohdateiGroesse = DateiGroesse(PfadVon(RohdatenOrdner(), rel))
End Function

' Datei endgueltig loeschen; Ergebnis leer = geloescht, sonst Fehlertext. Auf SharePoint kann Excel nicht loeschen: die Datei wird
' im Tool ausgeblendet (beim Laden und in dieser Liste uebergangen), endgueltig loescht man sie im Browser.
Public Function RohdateiLoeschen(rel As String) As String
    If RohdatenAufSharePoint() Then
        SpAusblenden rel
        LogSchreiben "Rohdatei ausgeblendet (SharePoint): " & rel
        Exit Function
    End If
    On Error Resume Next
    Kill RohdatenOrdner() & rel
    If Err.Number <> 0 Then RohdateiLoeschen = Err.Description Else LogSchreiben "Rohdatei gelöscht: " & rel
    On Error GoTo 0
End Function

' ============================================================================
' Anwesenheitsliste (MAK je Mitarbeiter und Kalenderwoche) importieren
' Zwei Formate: Enthaelt die Datei ein Blatt "Verwaltung" (Telefonie- und Abwesenheitsplan, eine Zeile je Tag, eine Spalte je
' Person), uebernimmt PlanUebernehmen die Tage direkt (siehe dort). Sonst gilt die MAK-Liste je KW:
' Erwartet im Ordner "Anwesenheit" (Konfiguration!B4) die neueste Excel-Datei mit einer Kopfzeile "Mitarbeiter",
' den Spalten "Makler BÜ Gesundheit" / "Makler BÜ Komposit" (Sparte) und Wochenspalten "NN KW" / "NN. KW".
' Ergebnis: Stammdaten im Blatt "Mitarbeiter" (BUe-Kapazitaet = groesster Wochenwert), Abweichungen je Tag im Blatt "Kalender"
' (Urlaub = "U", sonstiger Text = "A", abweichende Zahl = Zahl, Kapazitaet oder leer = Zelle leer).
' Faellt die KW-Nummer gegenueber der Vorspalte, beginnt ein neues Jahr (Liste ueber den Jahreswechsel).
' Mitarbeiter!W5:W7 = Datei, Zeitpunkt und Format ("Plan" / "MAK-Liste") des letzten Imports.
' imLaden = True: Aufruf aus NeueDatenLaden (AnwesenheitImLaden) – laeuft in dessen Lademodus und Fortschritt, ohne eigene
' Neuberechnung (die folgt dort); ein Fehler steht dann nur in der Meldung (importMeldung), nie als Karte.
' ============================================================================
Public Sub AnwesenheitLaden(Optional stumm As Boolean = False, Optional imLaden As Boolean = False)
    AnwesenheitStatusLeeren
    Dim ordner As String, datei As String, neueste As String, neuesteZeit As Date, pfad As String
    Dim wbQ As Workbook, ws As Worksheet, daten As Variant
    Dim r As Long, c As Long, kopf As Long, cMa As Long, cEinheit As Long, cGes As Long, cKom As Long
    Dim kwSpalten() As Long, kwNummern() As Long, kwJahre() As Long, nKw As Long, t As String, jahr As Long
    Dim wsM As Worksheet, wsP As Worksheet, wsW As Worksheet, ma As String, sparte As String, w As Variant
    Dim zeile As Long, kap As Double, spalte As Variant, anzahl As Long
    Dim kwSpalteZiel() As Long, cMin As Long, cMax As Long, zeilenWerte As Variant, zi As Long, schluesselZeile As Variant, tg As Long, eintrag As Variant
    Dim eigenerLademodus As Boolean, offenVorher As Boolean

    If lademodusAktiv And Not imLaden Then Exit Sub
    If imLaden Then stumm = True
    anwImLaden = imLaden
    If Not imLaden Then Set spListen = Nothing             ' im Laden ist die Auflistung schon frisch
    On Error Resume Next
    ordner = OrdnerAufloesen(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B4").Value), "Anwesenheit")
    If Err.Number <> 0 Then
        t = Err.Description
        On Error GoTo 0
        AnwNichtUebernommen t
        If Not stumm Then modFortschritt.HinweisZeigen "Fehler", t, True
        Exit Sub
    End If
    ' ab hier jeder Fehler (auch beim Auflisten auf SharePoint) in die eigene Behandlung – im Laden darf er das Laden nicht abbrechen
    On Error GoTo Fehler
    jahr = CLng(Val(ThisWorkbook.Worksheets("Konfiguration").Range("B5").Value))
    If jahr = 0 Then jahr = Year(Date)

    If Not OrdnerVorhanden(ordner) Then
        AnwNichtUebernommen "Ordner nicht gefunden (" & ordner & ")"
        If Not stumm Then
            If IstUrl(ordner) Then
                modFortschritt.HinweisZeigen "Fehler", SpHinweis(ordner), True
            Else
                modFortschritt.HinweisZeigen "Fehler", "Der Ordner für die Anwesenheitsliste wurde nicht gefunden:" & vbCrLf & ordner, True
            End If
        End If
        Exit Sub
    End If
    If IstUrl(ordner) Then                                   ' SharePoint: neueste Datei laut Auflistung (nur der Ordner selbst)
        Dim spL As Object, spK As Variant, spZeit As Double, spBest As Double
        Set spL = SpListe(ordner)
        If spL Is Nothing Then Err.Raise vbObjectError + 10, , "Der SharePoint-Ordner der Anwesenheit ist nicht lesbar (" & spFehler & ")."
        spBest = -1
        For Each spK In spL.Keys
            datei = CStr(spL(spK)(0))
            If InStr(datei, Application.PathSeparator) = 0 And Left$(datei, 2) <> "~$" And InStr(datei, ".") > 0 Then
                If IstExcelDatei(datei) Then
                    spZeit = ZeitWert(spL(spK)(1))
                    If spZeit > spBest Then spBest = spZeit: neueste = datei
                End If
            End If
        Next spK
    Else
        datei = Dir(ordner & "*.xls*")
        Do While Len(datei) > 0
            If Left$(datei, 2) <> "~$" And IstExcelDatei(datei) Then
                If FileDateTime(ordner & datei) > neuesteZeit Then
                    neuesteZeit = FileDateTime(ordner & datei)
                    neueste = datei
                End If
            End If
            datei = Dir()
        Loop
    End If
    If Len(neueste) = 0 Then
        AnwNichtUebernommen "keine Excel-Datei in " & ordner
        If Not stumm Then modFortschritt.HinweisZeigen "Hinweis", "Im Ordner " & ordner & " liegt keine Excel-Datei.", False
        Exit Sub
    End If
    pfad = PfadVon(ordner, neueste)

    LogSchreiben "---- AnwesenheitLaden " & neueste & IIf(imLaden, " (beim Laden)", "")
    If Not imLaden Then
        LadeModusEin "Anwesenheitsliste wird importiert"
        eigenerLademodus = True
    End If
    AnwSetzen 0.1, "Anwesenheitsliste lesen", neueste
    ' Der Plan wird laufend gepflegt und ist oft gerade offen: dann die offene Mappe lesen (auch noch nicht Gespeichertes)
    ' und sie offen lassen – QuelleOeffnen lehnt offene Dateien ab (richtig fuer Rohdaten)
    On Error Resume Next
    Set wbQ = Workbooks(DateiName(neueste))
    On Error GoTo Fehler
    If wbQ Is Nothing Then
        Set wbQ = QuelleOeffnen(pfad)
    Else
        offenVorher = True
        LogSchreiben "  Datei ist in Excel geöffnet, gelesen wird die offene Mappe"
    End If
    Set ws = Nothing
    On Error Resume Next
    Set ws = wbQ.Worksheets("Verwaltung")
    On Error GoTo Fehler
    If Not ws Is Nothing Then                             ' Telefonie- und Abwesenheitsplan (eine Zeile je Tag)
        daten = ws.Range("A1:CZ900").Value2
        If Not offenVorher Then wbQ.Close SaveChanges:=False
        Set wbQ = Nothing
        Dim planInfo As String
        AnwSetzen 0.3, "Anwesenheitsplan je Tag übernehmen"
        anzahl = PlanUebernehmen(daten, planInfo)
        wsM_Stand neueste, "Plan"
        modCockpit.AlphabetischSortieren
        modCockpit.KalenderVorbelegen
        LogSchreiben "  Anwesenheitsplan: " & anzahl & " Mitarbeitende, " & planInfo & "; " & anwHeute
        If Not imLaden Then
            AnwSetzen 0.95, "MAK und Produktivität werden neu berechnet"
            Application.Calculation = xlCalculationAutomatic
            Application.Calculate
            modCockpit.DiagrammeAnpassen True
            AnwSetzen 1, "Fertig"
            LadeModusAus
        End If
        anwPlan = True
        importMeldung = "Anwesenheitsplan übernommen: " & neueste & ", " & anzahl & " Mitarbeitende, " & planInfo
        If Not stumm Then modFortschritt.HinweisZeigen "Hinweis", importMeldung & "." & vbCrLf & anwHeute & "." & vbCrLf & vbCrLf & _
            "„x“ im Plan = abwesend. Neue Personen zählen voll (BÜ-Kapazität 1,0); eine im Blatt 'Mitarbeiter' geänderte Kapazität und die Sparte bleiben. " & _
            "„Neue Daten laden“ übernimmt den Plan jedes Mal neu.", False
        Exit Sub
    End If
    Set ws = wbQ.Worksheets(1)
    daten = ws.UsedRange.Value2
    If Not offenVorher Then wbQ.Close SaveChanges:=False
    Set wbQ = Nothing
    If Not IsArray(daten) Then Err.Raise vbObjectError + 2, , "Die Datei enthält keine Tabelle."
    AnwSetzen 0.3, "Kopfzeile und Wochenspalten erkennen"

    For r = 1 To UBound(daten, 1)
        For c = 1 To UBound(daten, 2)
            If InStr(1, CStr(Nz(daten(r, c))), "Mitarbeiter", vbTextCompare) > 0 Then kopf = r: cMa = c
        Next c
        If kopf > 0 Then Exit For
    Next r
    If kopf = 0 Then Err.Raise vbObjectError + 2, , "Keine Kopfzeile mit 'Mitarbeiter' gefunden."
    nKw = 0
    For c = 1 To UBound(daten, 2)
        t = Replace(Replace(CStr(Nz(daten(kopf, c))), vbLf, " "), ".", "")
        t = Trim$(t)
        If InStr(1, t, "Gesundheit", vbTextCompare) > 0 Then cGes = c
        If InStr(1, t, "Komposit", vbTextCompare) > 0 Then cKom = c
        If InStr(1, t, "Einheit", vbTextCompare) > 0 Then cEinheit = c
        If Len(t) > 2 Then                                   ' And wertet nicht verkuerzt aus: Left$(t, -2) waere Fehler 5
            If UCase$(Right$(t, 2)) = "KW" Then
                If IsNumeric(Trim$(Left$(t, Len(t) - 2))) Then
                    ReDim Preserve kwSpalten(0 To nKw): ReDim Preserve kwNummern(0 To nKw): ReDim Preserve kwJahre(0 To nKw)
                    kwSpalten(nKw) = c: kwNummern(nKw) = CLng(Trim$(Left$(t, Len(t) - 2)))
                    If nKw > 0 Then
                        If kwNummern(nKw) < kwNummern(nKw - 1) Then jahr = jahr + 1     ' Jahreswechsel in der Liste
                    End If
                    kwJahre(nKw) = jahr
                    nKw = nKw + 1
                End If
            End If
        End If
    Next c
    If nKw = 0 Then Err.Raise vbObjectError + 3, , "Keine Wochenspalten ('NN KW') gefunden."
    If UBound(daten, 1) <= kopf Then Err.Raise vbObjectError + 4, , "Keine Mitarbeiterzeilen unter der Kopfzeile."

    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    Set wsP = ThisWorkbook.Worksheets("Kalender")
    Set wsW = ThisWorkbook.Worksheets("Wirksam")
    ' Erste Kalenderspalte je KW einmal bestimmen (Wirksam!6 = KW-Schluessel je Tag; eine KW hat bis zu 5 Tagesspalten)
    ReDim kwSpalteZiel(0 To nKw - 1)
    cMin = 0: cMax = 0
    For c = 0 To nKw - 1
        spalte = Application.Match(kwJahre(c) * 100 + kwNummern(c), wsW.Rows(6), 0)
        If IsError(spalte) Then
            kwSpalteZiel(c) = 0
        Else
            kwSpalteZiel(c) = CLng(spalte)
            If cMin = 0 Or kwSpalteZiel(c) < cMin Then cMin = kwSpalteZiel(c)
            If kwSpalteZiel(c) > cMax Then cMax = kwSpalteZiel(c)
        End If
    Next c
    If cMin = 0 Then Err.Raise vbObjectError + 5, , "Keine der Wochenspalten passt zum Jahr " & kwJahre(0) & " (Konfiguration!B5) im Kalender."
    schluesselZeile = wsW.Range(wsW.Cells(6, cMin), wsW.Cells(6, cMax + 5)).Value2

    For r = kopf + 1 To UBound(daten, 1)
        ma = Trim$(CStr(Nz(daten(r, cMa))))
        AnwSetzen 0.3 + 0.6 * (r - kopf) / (UBound(daten, 1) - kopf), "Übernehme " & ma
        If Len(ma) > 0 And UCase$(ma) <> "MAK" Then
            sparte = "Komposit"
            If cGes > 0 Then
                ' IsNumeric(Empty) ist True, CDbl("") aber Fehler 13 – deshalb Leerzelle zuerst ausschliessen
                If Not IsEmpty(daten(r, cGes)) Then
                    If IsNumeric(daten(r, cGes)) Then
                        If CDbl(daten(r, cGes)) > 0 Then sparte = "Gesundheit"
                    End If
                End If
            End If
            kap = 0
            For c = 0 To nKw - 1
                w = daten(r, kwSpalten(c))
                If IsNumeric(w) And Not IsEmpty(w) Then
                    If CDbl(w) > kap Then kap = CDbl(w)
                End If
            Next c
            zeile = MitarbeiterZeile(wsM, ma)
            If zeile = 0 Then Err.Raise vbObjectError + 6, , "Kein Platz mehr im Blatt Mitarbeiter (maximal " & MA_ZEILEN & " Zeilen)."
            wsM.Cells(zeile, 1).Value = ma
            If cEinheit > 0 Then wsM.Cells(zeile, 2).Value = Trim$(CStr(Nz(daten(r, cEinheit))))
            wsM.Cells(zeile, 3).Value = sparte
            wsM.Cells(zeile, 4).Value = kap
            If IsEmpty(wsM.Cells(zeile, 7).Value) Then wsM.Cells(zeile, 7).Value = True
            anzahl = anzahl + 1
            ' Kalenderzeile als ein Block: vorhandene Werte lesen, Wochenwerte der Liste auf die Tage der KW, einmal schreiben.
            ' Nur Abweichungen werden eingetragen ("Urlaub" = U, andere Abwesenheit = A, abweichende Zahl = anwesender Anteil
            ' Zahl / BUe-Kapazitaet); leere Wochen und volle Kapazitaet lassen vorhandene Tageseintraege stehen.
            zeilenWerte = wsP.Range(wsP.Cells(zeile + PL_VERSATZ, cMin), wsP.Cells(zeile + PL_VERSATZ, cMax + 5)).Value2
            For c = 0 To nKw - 1
                If kwSpalteZiel(c) > 0 Then
                    w = daten(r, kwSpalten(c))
                    eintrag = Empty
                    If IsEmpty(w) Or Len(Trim$(CStr(Nz(w)))) = 0 Then
                        eintrag = Empty
                    ElseIf IsNumeric(w) Then
                        If Abs(CDbl(w) - kap) >= 0.0001 Then
                            If kap > 0 Then eintrag = Round(Application.Max(0, Application.Min(1, CDbl(w) / kap)), 2) Else eintrag = 0
                        End If
                    ElseIf InStr(1, CStr(w), "urlaub", vbTextCompare) > 0 Then
                        eintrag = "U"
                    Else
                        eintrag = "A"
                    End If
                    If Not IsEmpty(eintrag) Then
                        For tg = 0 To 4
                            zi = kwSpalteZiel(c) - cMin + 1 + tg
                            If zi <= UBound(zeilenWerte, 2) Then
                                If schluesselZeile(1, zi) = kwJahre(c) * 100 + kwNummern(c) Then zeilenWerte(1, zi) = eintrag
                            End If
                        Next tg
                    End If
                End If
            Next c
            wsP.Range(wsP.Cells(zeile + PL_VERSATZ, cMin), wsP.Cells(zeile + PL_VERSATZ, cMax + 5)).Value2 = zeilenWerte
        End If
    Next r
    wsM_Stand neueste, "MAK-Liste"
    modCockpit.AlphabetischSortieren                   ' neue Mitarbeitende einsortieren, Plan wandert zeilengleich mit
    modCockpit.KalenderVorbelegen                      ' frei laut Arbeitszeitmodell und Feiertage eintragen
    LogSchreiben "  " & anzahl & " Mitarbeitende"
    If Not imLaden Then
        AnwSetzen 0.95, "MAK und Produktivität werden neu berechnet"
        Application.Calculation = xlCalculationAutomatic
        Application.Calculate
        LogSchreiben "  Diagramme anpassen"
        modCockpit.DiagrammeAnpassen True
        AnwSetzen 1, "Fertig"
        LadeModusAus
    End If
    LogSchreiben "  Fertig"
    importMeldung = "MAK-Liste importiert: " & neueste & ", " & anzahl & " Mitarbeitende, KW " & kwNummern(0) & "/" & kwJahre(0) & " bis KW " & kwNummern(nKw - 1) & "/" & kwJahre(nKw - 1)
    If Not stumm Then modFortschritt.HinweisZeigen "Hinweis", importMeldung & "." & vbCrLf & vbCrLf & "Arbeitszeitmodell und neue Mitarbeitende pflegst du im Blatt 'Mitarbeiter', Abwesenheiten je Tag im 'Kalender'.", False
    Exit Sub

Fehler:
    Dim fehlertext As String, nummer As Long
    nummer = Err.Number
    fehlertext = Err.Description                       ' eigene Meldungen (Err.Raise vbObjectError + n) ohne Nummer
    If nummer < vbObjectError Or nummer >= vbObjectError + 100 Then fehlertext = "Fehler " & nummer & ": " & fehlertext
    On Error Resume Next
    If Not wbQ Is Nothing And Not offenVorher Then wbQ.Close SaveChanges:=False
    If eigenerLademodus Then LadeModusAus
    LogSchreiben "  Anwesenheit FEHLER " & nummer & ": " & Err.Description & " – " & fehlertext
    AnwNichtUebernommen fehlertext
    If Not stumm Then modFortschritt.HinweisZeigen "Fehler", "Fehler beim Import der Anwesenheitsliste: " & fehlertext, True
End Sub

' Import versucht, aber nicht gelungen: Meldung fuer Laden und Tagesablauf (der Kalender bleibt, wie er ist)
Private Sub AnwNichtUebernommen(grund As String)
    anwPlan = False
    anwFehlschlag = True
    importMeldung = "Anwesenheit nicht übernommen: " & grund & " – MAK und Produktivität rechnen mit dem bisherigen Stand im Kalender"
End Sub

' Anwesenheit innerhalb von „Neue Daten laden“ (vor Neuberechnung und Speichern, siehe AnwesenheitAutomatisch).
' Rueckgabe: Meldung fuer die Abschlusskarte (leer = nicht versucht).
Private Function AnwesenheitImLaden() As String
    Dim vorText As String
    AnwesenheitStatusLeeren
    If IstMakler() Then
        ladeOrt = "Bearbeiter MSUED ergänzen"
        If ZusatzMitarbeiterSetzen() > 0 Then vorText = vorText & IIf(Len(vorText) > 0, "." & vbCrLf, "") & "Bearbeiter der Einheit " & ZUSATZ_EINHEIT & " im Blatt Mitarbeiter ergänzt"
    End If
    If Not AnwesenheitAutomatisch() Then AnwesenheitImLaden = vorText: Exit Function
    ladeOrt = "Anwesenheit übernehmen"
    LogSchreiben "Anwesenheit übernehmen"
    AnwesenheitLaden True, True
    AnwesenheitImLaden = vorText
    If Len(importMeldung) > 0 Then AnwesenheitImLaden = vorText & IIf(Len(vorText) > 0, "." & vbCrLf, "") & importMeldung
End Function

' Uebernimmt „Neue Daten laden“ die Anwesenheit mit? Ja, solange noch niemand im Blatt Mitarbeiter steht (erster Import, beide
' Formate), und immer, wenn sie aus dem Telefonie- und Abwesenheitsplan kommt (Mitarbeiter!W7 = "Plan"; im Bereich Makler auch
' bei leerem W7 – Dateien vor 12.70): der Plan wird laufend gepflegt, Abwesenheiten sollen ohne eigenen Klick in MAK und
' Produktivitaet. Die MAK-Liste je KW (W7 = "MAK-Liste") bleibt ein einmaliger Import (danach „Anwesenheit laden“), damit
' gepflegte Sparte, Kapazitaet und Eintraege im Kalender stehen bleiben.
Public Function AnwesenheitAutomatisch() As Boolean
    Dim wsM As Worksheet
    On Error Resume Next
    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    If Len(Trim$(CStr(Nz(wsM.Range("A" & MA_START).Value)))) = 0 Then
        AnwesenheitAutomatisch = True
    ElseIf StrComp(Trim$(CStr(Nz(wsM.Range("W7").Value))), "Plan", vbTextCompare) = 0 Then
        AnwesenheitAutomatisch = True
    Else
        AnwesenheitAutomatisch = IstMakler() And StrComp(Trim$(CStr(Nz(wsM.Range("W7").Value))), "MAK-Liste", vbTextCompare) <> 0
    End If
    On Error GoTo 0
End Function

' Ergebnis des letzten Imports fuer den Tagesablauf: aus dem Plan? heutige Anwesenheit laut Plan, Fehlertext (leer = kein Fehler)
Public Function AnwesenheitAusPlan() As Boolean
    AnwesenheitAusPlan = anwPlan
End Function

Public Function AnwesenheitHeute() As String
    AnwesenheitHeute = anwHeute
End Function

Public Function AnwesenheitFehltHeute() As Long
    AnwesenheitFehltHeute = anwFehltHeute
End Function

Public Function AnwesenheitMeldung() As String
    AnwesenheitMeldung = importMeldung
End Function

Public Function AnwesenheitFehler() As String
    If anwFehlschlag Then AnwesenheitFehler = importMeldung
End Function

Public Function AnwesenheitDatei() As String
    On Error Resume Next
    AnwesenheitDatei = CStr(Nz(ThisWorkbook.Worksheets("Mitarbeiter").Range("W5").Value))
End Function

' Beginn des Tagesablaufs: Ergebnis eines frueheren Imports dieser Sitzung vergessen
Public Sub AnwesenheitStatusLeeren()
    importMeldung = ""
    anwPlan = False: anwFehlschlag = False: anwHeute = "": anwFehltHeute = -1
End Sub

' Fortschritt des Anwesenheits-Imports; innerhalb von „Neue Daten laden“ auf dem Stueck zwischen Laden (0,9) und Neuberechnung (0,92)
Private Sub AnwSetzen(ByVal anteil As Double, ByVal status As String, Optional ByVal detail As String = "")
    If anwImLaden Then anteil = 0.9 + 0.02 * anteil
    modFortschritt.FortschrittSetzen anteil, status, detail
End Sub

Private Sub wsM_Stand(datei As String, art As String)
    With ThisWorkbook.Worksheets("Mitarbeiter")
        .Range("W5").Value = datei
        .Range("W6").Value = Now
        .Range("W6").NumberFormat = "dd.mm.yyyy hh:mm"
        .Range("W7").Value = art
    End With
End Sub

' Telefonie- und Abwesenheitsplan (Blatt "Verwaltung", z. B. ODPB3D + KBIG2D) uebernehmen:
' - Kopf: Zeile mit "Datum" (Spalte der Tage), Zeile mit "Mitarbeiter" (1 = zaehlt mit), Zeile mit "Team ..." (Beginn je Team),
'   Namen ueber diesen Zeilen; Spalte "Arbeitsfrei" (1 = Feiertag).
' - Personen: jede Spalte mit 1 in der Mitarbeiter-Zeile innerhalb eines Teamblocks (Block endet an der ersten Spalte ohne
'   Namen und ohne 1). Personen ausserhalb der Teams (z. B. Leitung) bleiben aussen vor.
' - Keine Schaetzung des BUe-Anteils: neue Personen zaehlen voll (BUe-Kapazitaet 1,0); eine im Blatt Mitarbeiter gepflegte
'   Kapazitaet und die Sparte bleiben (neu: Komposit).
' - Je Arbeitstag Mo-Fr: "x" (gross oder klein) = abwesend -> Kalender "A" (vorhandenes U/K bleibt); jeder andere Eintrag oder leer
'   = anwesend -> ein vorhandenes A wird geloescht (es stammt aus dem Plan). Von Hand eingetragene U/K, Anteile und Feiertage
'   bleiben unberuehrt – auch an vergangenen Tagen, damit fruehere Wochen beim erneuten Uebernehmen nicht kippen.
' - Heute laut Plan (anwHeute, anwFehltHeute) fuer den Tagesablauf; aktive Personen im Blatt Mitarbeiter, die im Plan fehlen,
'   nennt die Meldung (sie zaehlen weiter, bis dort ein Austritt steht).
Private Function PlanUebernehmen(daten As Variant, ByRef info As String) As Long
    Dim zDatum As Long, cDatum As Long, zMa As Long, zTeam As Long, cFrei As Long, r As Long, c As Long, t As String
    Dim namen() As String, teams() As String, spalten() As Long, n As Long, team As String, k As Long, nm As String
    Dim wsM As Worksheet, wsP As Worksheet, wsW As Worksheet, spalteVon As Object, letzte As Long, datum As Double
    Dim zeile As Long, werte As Variant, cMin As Long, cMax As Long, v As String, alt As String, abw As Long, tage As Long
    Dim erster As Double, letzter As Double, i As Long
    Dim rHeute As Long, heuteFrei As Boolean, nFehlt As Long, fehlt As String, imPlan As Object, ohne As String, nmZ As Variant

    For r = 1 To 20
        For c = 1 To UBound(daten, 2)
            t = Trim$(CStr(Nz(daten(r, c))))
            If zDatum = 0 And StrComp(t, "Datum", vbTextCompare) = 0 Then zDatum = r: cDatum = c
            If zMa = 0 And StrComp(t, "Mitarbeiter", vbTextCompare) = 0 Then zMa = r
            If zTeam = 0 And LCase$(Left$(t, 5)) = "team " Then zTeam = r
            If cFrei = 0 And InStr(1, t, "Arbeitsfrei", vbTextCompare) > 0 Then cFrei = c
        Next c
    Next r
    If zDatum = 0 Or zMa = 0 Or zTeam = 0 Then Err.Raise vbObjectError + 7, , "Im Blatt Verwaltung fehlen die Zeilen Datum, Mitarbeiter oder Team."

    ' Personen je Teamblock
    ReDim namen(1 To UBound(daten, 2)): ReDim teams(1 To UBound(daten, 2)): ReDim spalten(1 To UBound(daten, 2))
    For c = 1 To UBound(daten, 2)
        t = Trim$(CStr(Nz(daten(zTeam, c))))
        If LCase$(Left$(t, 5)) = "team " Then team = t
        nm = ""
        For k = zMa - 1 To 1 Step -1                          ' Name: erster Text ueber der Mitarbeiter-Zeile, der kein Teamkopf ist
            t = Trim$(Replace(CStr(Nz(daten(k, c))), vbLf, " "))
            If Len(t) > 0 And LCase$(Left$(t, 5)) <> "team " Then nm = t: Exit For
        Next k
        If Len(nm) = 0 And CStr(Nz(daten(zMa, c))) <> "1" Then team = ""     ' Luecke: Teamblock zu Ende
        If Len(team) > 0 And Len(nm) > 0 And CStr(Nz(daten(zMa, c))) = "1" Then
            n = n + 1: namen(n) = nm: teams(n) = team: spalten(n) = c
        End If
    Next c
    If n = 0 Then Err.Raise vbObjectError + 8, , "Im Anwesenheitsplan wurden keine Personen in einem Team gefunden."

    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    Set wsP = ThisWorkbook.Worksheets("Kalender")
    Set wsW = ThisWorkbook.Worksheets("Wirksam")
    Set spalteVon = CreateObject("Scripting.Dictionary")         ' Datum -> Spalte im Kalender (Wirksam!5)
    letzte = wsW.Cells(5, wsW.Columns.Count).End(xlToLeft).Column
    werte = wsW.Range(wsW.Cells(5, 1), wsW.Cells(5, letzte)).Value2
    For c = 1 To letzte
        If IsNumeric(werte(1, c)) And Not IsEmpty(werte(1, c)) Then
            If CDbl(werte(1, c)) > 40000 Then spalteVon(CLng(werte(1, c))) = c
        End If
    Next c
    For r = zDatum + 1 To UBound(daten, 1)
        If IsNumeric(daten(r, cDatum)) And Not IsEmpty(daten(r, cDatum)) Then
            If spalteVon.Exists(CLng(daten(r, cDatum))) Then
                c = spalteVon(CLng(daten(r, cDatum)))
                If cMin = 0 Or c < cMin Then cMin = c
                If c > cMax Then cMax = c
            End If
            ' Zeile von heute (nur Arbeitstag ohne "Arbeitsfrei" = 1) fuer die heutige Anwesenheit
            If CLng(daten(r, cDatum)) = CLng(Date) Then
                t = ""
                If cFrei > 0 Then t = CStr(Nz(daten(r, cFrei)))
                If Weekday(Date, vbMonday) > 5 Or t = "1" Then heuteFrei = True Else rHeute = r
            End If
        End If
    Next r
    If cMin = 0 Then Err.Raise vbObjectError + 9, , "Kein Tag des Anwesenheitsplans liegt im Zeitraum des Kalenders."

    For i = 1 To n
        AnwSetzen 0.3 + 0.6 * i / n, "Übernehme " & namen(i)
        zeile = MitarbeiterZeile(wsM, namen(i))
        If zeile = 0 Then Err.Raise vbObjectError + 6, , "Kein Platz mehr im Blatt Mitarbeiter (maximal " & MA_ZEILEN & " Zeilen)."
        wsM.Cells(zeile, 1).Value = namen(i)
        wsM.Cells(zeile, 2).Value = teams(i)
        If Len(Trim$(CStr(Nz(wsM.Cells(zeile, 3).Value)))) = 0 Then wsM.Cells(zeile, 3).Value = "Komposit"
        ' neue Person: voll (keine Schaetzung des BUe-Anteils); eine gepflegte Kapazitaet bleibt beim erneuten Uebernehmen
        If Len(Trim$(CStr(Nz(wsM.Cells(zeile, 4).Value)))) = 0 Then wsM.Cells(zeile, 4).Value = 1
        If IsEmpty(wsM.Cells(zeile, 7).Value) Then wsM.Cells(zeile, 7).Value = True
        werte = wsP.Range(wsP.Cells(zeile + PL_VERSATZ, cMin), wsP.Cells(zeile + PL_VERSATZ, cMax)).Value2
        For r = zDatum + 1 To UBound(daten, 1)
            If IsNumeric(daten(r, cDatum)) And Not IsEmpty(daten(r, cDatum)) Then
                datum = CDbl(daten(r, cDatum))
                If spalteVon.Exists(CLng(datum)) And Weekday(datum, vbMonday) <= 5 Then
                    If cFrei = 0 Then
                        t = ""
                    Else
                        t = CStr(Nz(daten(r, cFrei)))
                    End If
                    If t <> "1" Then
                        c = spalteVon(CLng(datum)) - cMin + 1
                        v = LCase$(Trim$(CStr(Nz(daten(r, spalten(i))))))
                        alt = UCase$(Trim$(CStr(Nz(werte(1, c)))))
                        If v = "x" Then
                            If alt <> "U" And alt <> "K" Then werte(1, c) = "A"
                            abw = abw + 1
                        ElseIf alt = "A" Then
                            werte(1, c) = Empty
                        End If
                        If i = 1 Then
                            tage = tage + 1
                            If erster = 0 Or datum < erster Then erster = datum
                            If datum > letzter Then letzter = datum
                        End If
                    End If
                End If
            End If
        Next r
        wsP.Range(wsP.Cells(zeile + PL_VERSATZ, cMin), wsP.Cells(zeile + PL_VERSATZ, cMax)).Value2 = werte
        If rHeute > 0 Then
            If LCase$(Trim$(CStr(Nz(daten(rHeute, spalten(i)))))) = "x" Then
                nFehlt = nFehlt + 1
                fehlt = fehlt & IIf(Len(fehlt) > 0, ", ", "") & namen(i)
            End If
        End If
    Next i
    info = tage & " Arbeitstage vom " & Format(erster, "dd.mm.yyyy") & " bis " & Format(letzter, "dd.mm.yyyy") & ", " & abw & " Abwesenheitstage"

    ' heute laut Plan
    If rHeute > 0 Then
        anwFehltHeute = nFehlt
        If nFehlt = 0 Then
            anwHeute = "Laut Plan sind heute alle " & n & " da"
        Else
            anwHeute = "Laut Plan sind heute " & (n - nFehlt) & " von " & n & " da, " & IIf(nFehlt = 1, "es fehlt ", "es fehlen ") & fehlt
        End If
    ElseIf heuteFrei Or Weekday(Date, vbMonday) > 5 Then
        anwFehltHeute = -1
        anwHeute = "Laut Plan ist heute arbeitsfrei"
    Else
        anwFehltHeute = -2
        anwHeute = "Der heutige Tag steht nicht im Plan" & IIf(letzter > 0, " (er reicht vom " & Format(erster, "dd.mm.yyyy") & " bis " & _
                   Format(letzter, "dd.mm.yyyy") & ")", "") & " – heute zählen alle als da"
    End If

    ' aktive Personen im Blatt Mitarbeiter, die der Plan nicht (mehr) fuehrt
    Set imPlan = CreateObject("Scripting.Dictionary")
    imPlan.CompareMode = vbTextCompare
    For i = 1 To n
        imPlan(namen(i)) = True
    Next i
    If IstMakler() Then                                       ' Bearbeiter MSUED stehen nicht im Plan und zaehlen immer mit
        ZusatzMitarbeiterSetzen
        For Each nmZ In Split(ZUSATZ_MA, "|")
            imPlan(CStr(nmZ)) = True
        Next nmZ
    End If
    For r = MA_START To MA_START + MA_ZEILEN - 1
        nm = Trim$(CStr(Nz(wsM.Cells(r, 1).Value)))
        If Len(nm) > 0 Then
            If Not imPlan.Exists(nm) Then
                If MitarbeiterAktiv(wsM, r) Then ohne = ohne & IIf(Len(ohne) > 0, ", ", "") & nm
            End If
        End If
    Next r
    If Len(ohne) > 0 Then info = info & "; nicht im Plan, zählen weiter (Austritt im Blatt Mitarbeiter setzen): " & ohne
    PlanUebernehmen = n
End Function

' Bereich MAKLER: die Bearbeiter aus ZUSATZ_MA ins Blatt Mitarbeiter, falls sie fehlen (Einheit = ZUSATZ_EINHEIT, damit die
' Einheiten-Chips sie zuordnen; Sparte Komposit, Kapazitaet 1, aktiv). Vorhandene Zeilen bleiben, wie sie gepflegt sind; ein
' Austritt im Blatt Mitarbeiter nimmt eine Person heraus. Kalender: ohne Eintrag = anwesend. Ergebnis: Anzahl neu angelegt.
Private Function ZusatzMitarbeiterSetzen() As Long
    Dim wsM As Worksheet, nm As Variant, zeile As Long
    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    For Each nm In Split(ZUSATZ_MA, "|")
        zeile = MitarbeiterZeile(wsM, CStr(nm))
        If zeile = 0 Then Exit For
        If Len(Trim$(CStr(Nz(wsM.Cells(zeile, 1).Value)))) = 0 Then
            wsM.Cells(zeile, 1).Value = CStr(nm)
            wsM.Cells(zeile, 2).Value = ZUSATZ_EINHEIT
            wsM.Cells(zeile, 3).Value = "Komposit"
            wsM.Cells(zeile, 4).Value = 1
            wsM.Cells(zeile, 7).Value = True
            ZusatzMitarbeiterSetzen = ZusatzMitarbeiterSetzen + 1
            LogSchreiben "  Mitarbeiter ergänzt: " & nm & " (" & ZUSATZ_EINHEIT & ")"
        End If
    Next nm
End Function

' Zaehlt die Person heute mit? Aktiv (G) nicht FALSCH und kein Austritt (F) vor heute
Private Function MitarbeiterAktiv(wsM As Worksheet, r As Long) As Boolean
    Dim a As Variant, aus As Variant
    MitarbeiterAktiv = True
    a = wsM.Cells(r, 7).Value
    aus = wsM.Cells(r, 6).Value
    If VarType(a) = vbBoolean Then
        If a = False Then MitarbeiterAktiv = False
    End If
    If Not IsError(aus) Then
        If IsDate(aus) Then
            If CDate(aus) < Date Then MitarbeiterAktiv = False
        End If
    End If
End Function

Private Function MitarbeiterZeile(wsM As Worksheet, ma As String) As Long
    ' Zeile des Mitarbeiters im Blatt Mitarbeiter (Name in Spalte A ab Zeile MA_START), sonst erste freie Zeile; 0 = kein Platz
    Dim r As Long
    For r = MA_START To MA_START + MA_ZEILEN - 1
        If StrComp(Trim$(CStr(wsM.Cells(r, 1).Value)), ma, vbTextCompare) = 0 Then MitarbeiterZeile = r: Exit Function
    Next r
    For r = MA_START To MA_START + MA_ZEILEN - 1
        If Len(Trim$(CStr(wsM.Cells(r, 1).Value))) = 0 Then MitarbeiterZeile = r: Exit Function
    Next r
    MitarbeiterZeile = 0
End Function
