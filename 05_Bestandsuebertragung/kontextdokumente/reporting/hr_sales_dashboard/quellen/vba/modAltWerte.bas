Option Explicit
' ============================================================================
' modAltWerte – Knopf „Werte aus HS-Dashboard 2025“ (Startseite)
'
' Holt einmalig die Zahlen der übrigen Kennzahlen (nicht BÜ) aus dem bisherigen Dashboard „2025_Dashboard HS.xlsm“, das der
' Fachbereich bis zur Umstellung weitergeführt hat. Das ganze Thema Bestandsübertragung bleibt unberührt (Verbund/OPAG 7VA bis
' 7OL und die alte Aufteilung 7a bis 7f mit HSB 4 K und Maklervertrieb): BÜ-Werte kommen automatisch aus dem BÜ-Reporting
' („BÜ-Datei verknüpfen“), niemand trägt sie mehr von Hand ein.
'
'   Zeigen        Datei suchen: eine schon geöffnete Datei (gemerkte Datei oder einer der Namen unten) wird genommen und bleibt
'                 offen. Sonst der Reihe nach: die gemerkte Datei (Konfiguration!C62), im Ordner dieser Datei
'                 „2025_Dashboard HS.xlsm“ und „2025_Dashboard_HS.xlsm“ (lokal bzw. synchronisiert, dann auf SharePoint über
'                 https), danach lokal alles nach dem Muster 2025*Dashboard*HS*.xls* (ohne die OPAG-Fassung; Kopien, „alt“
'                 und Namen mit Klammer zuletzt), zuletzt eine schon geöffnete Mappe nach dem Muster. Diese Datei selbst wird
'                 nie geöffnet. Sonst Dateiauswahl,
'                 nach Abbruch die Adresse aus der Adresszeile des Browsers (SharePoint). Die Datei wird schreibgeschützt,
'                 ohne Makros und ohne Aktualisieren der Verknüpfungen geöffnet, ausgewertet (Trockenlauf, nichts wird
'                 geschrieben) und gleich wieder ohne Speichern geschlossen. Danach eine Karte mit der Zusammenfassung:
'                 „Leere Felder füllen“, „Auch abweichende überschreiben“, „Abbrechen“, „Andere Datei …“.
'   Zuordnung     Blätter Rohdaten, Rohdaten_2 und Rohdaten_3 der Datei (Code in Spalte A, Kategorie in C, Abteilung in D,
'                 Datum in Zeile 1, Werte ab Zeile 3). Hier gibt es nur Rohdaten: Wochenwerte oben, darunter je früheres
'                 Blatt ein Monatsblock mit eigener Kopfzeile („Monat“ in Spalte A, das frühere Blatt in Spalte F). Die Zeilennummern beider Dateien
'                 stimmen nicht überein (das neue Dashboard hat die BÜ-Zeilen 7VA bis 7OL zusätzlich), deshalb über Schlüssel:
'                 - Zeile mit Code: derselbe Code in der Datei (getrimmt, Kleinschreibung).
'                 - Zeile ohne Code (z. B. „Zugänge · HSB 4 K (Gesundheit)“ unter 7e): letzter Code darüber im selben Thema
'                   (Spalte B), sonst der erste darunter im selben Thema („Provisionsreklamation EASY/Online“ vor 8a), und
'                   der Abstand zu ihm; dazu muss die Beschriftung (Kategorie und Abteilung) gleich sein – verglichen ohne
'                   Groß-/Kleinschreibung, Satz- und Sonderzeichen (# - / ( ) …), geschützte und mehrfache Leerzeichen. Passt
'                   der Abstand nicht (Zeile eingefügt oder entfernt), wird im selben Code-Block nach der Beschriftung gesucht;
'                   nur ein eindeutiger Treffer zählt. Zeilen ohne Code und ohne Beschriftung (Leerzeilen) zählen nicht. Ein
'                   Code aus einem anderen Thema zählt nie (nach „KPI löschen“ stünden Zeilen sonst unter einem fremden Code).
'                 - Thema Bestandsübertragung (Spalte B, gilt bis zum nächsten Thema) und Zeilen mit Code 7V*/7O*: ausgelassen.
'                   Ausgeschlossen wird über das Thema bzw. den eigenen Code, nicht über den Code-Block.
'                 - Spalten über das Datum in Zeile 1 (Datumswert, kein Text).
'                 - Übernommen werden nur Zahlen (auch berechnete Werte einer Formel der Datei; kein Text, kein Fehlerwert,
'                   kein Wahrheitswert). Zellen mit Formel werden hier nie angefasst. Texte der Datei an hier leeren Feldern
'                   (z. B. „miso fehlt“) werden nur gezählt und auf der Karte genannt.
'                 Je Zelle: neu (hier leer, auch leerer Text), abweichend (hier eine andere Zahl oder ein Text), gleich.
'   Schreiben     setzt die geplanten Zellen; je geschriebene Rohdaten-Zelle wird dieselbe Zelle im ausgeblendeten Blatt
'                 Wertstand geleert, der Stand der Zahl fällt damit auf den Berichtstag der KW zurück (ältere Dateien ohne
'                 Wertstand: still übergangen). Ein Blatt mit Schutz ohne Kennwort wird kurz freigegeben und mit denselben
'                 Optionen wieder geschützt (Schutz mit UserInterfaceOnly: Makros dürfen ohnehin schreiben).
'                 Ergebnis in Konfiguration!C63 (Anzeige auf der Startseite), nur wenn etwas geschrieben wurde.
'   Prüfen ohne Dialoge:  AltWertePlanen(pfad)            -> "neu=..;abweichend=..;gleich=..;formel=..;nicht_zugeordnet=..;..."
'                         AltWerteSuchen()                -> wie AltWertePlanen mit der gefundenen Datei (";pfad=.."), sonst
'                                                            "nicht_gefunden" bzw. "fehler=.."
'                         AltWerteAnwenden(ueberschreiben) -> Zahl der geschriebenen Zellen
' ============================================================================

Private Const DATEI_1 As String = "2025_Dashboard HS.xlsm"       ' Name auf SharePoint
Private Const DATEI_2 As String = "2025_Dashboard_HS.xlsm"       ' Name der lokalen Kopie
Private Const MUSTER As String = "2025*Dashboard*HS*.xls*"
Private Const KONF_PFAD As String = "C62"                       ' Konfiguration: gemerkte Datei
Private Const KONF_STAND As String = "C63"                      ' Konfiguration: zuletzt übernommen
Private Const ERSTE As Long = 3                                 ' erste Wertzeile in allen Datenblättern
Private Const TITEL As String = "Werte aus HS-Dashboard 2025"
Private Const MAX_BEISPIELE As Long = 3

' geplante Änderungen (Trockenlauf): Blatt, Zeile, Spalte, Wert, Art (1 = neu, 2 = abweichend)
Private pBlatt() As String, pZeile() As Long, pSpalte() As Long, pWert() As Double, pArt() As Long
Private pN As Long, geplant As Boolean
Private nNeu As Long, nAbw As Long, nGleich As Long, nFormel As Long, nNichtZ As Long, nQuelleOffen As Long, nOhneSpalte As Long
Private nichtZText As String, quelleOffenText As String, abwBeispiele As String, nBeispiele As Long
Private nText As Long, textBeispiel As String                    ' Texte der Datei an hier leeren Feldern (nicht uebernommen)
Private neuVon As Double, neuBis As Double, abwVon As Double, abwBis As Double
Private quellName As String, quellPfad As String, letzterFehler As String
Private nNeuGeschrieben As Long, nUeberschrieben As Long, nGesperrt As Long
Private altEvents As Boolean, altScreen As Boolean, altAlerts As Boolean, ruhigAktiv As Boolean

Public Function AltWerteVersion() As String
    AltWerteVersion = "3"
End Function

' ---------------------------------------------------------------- Knopf und Karte
Public Sub Zeigen()
    Dim pfad As String, t As String
    On Error GoTo Fehler
    modKarte.KartenEntfernen
    SuchenUndAuswerten
    If Len(quellName) = 0 And Len(letzterFehler) = 0 Then
        ' nicht gefunden: Dateiauswahl, nach Abbruch die Adresse aus dem Browser
        pfad = Abfragen()
        If Len(pfad) = 0 Then Exit Sub
        t = AltWertePlanen(pfad)
    End If
    PlanAnzeigen
    Exit Sub
Fehler:
    t = Err.Description
    On Error Resume Next
    Zurueck
    ThisWorkbook.Activate
    ThisWorkbook.Worksheets("Start").Activate
    FehlerKarte "Das hat nicht geklappt: " & t
End Sub

' Datei suchen und auswerten (Trockenlauf, ohne Dialoge). Danach: Plan, letzterFehler, oder beides leer = keine Datei gefunden.
Private Sub SuchenUndAuswerten()
    Dim wbQ As Workbook, warOffen As Boolean, pfad As String, t As String
    On Error GoTo Fehler
    PlanLeeren
    Ruhig
    Application.StatusBar = "Suche das HS-Dashboard 2025 ..."
    Set wbQ = Suchen(pfad, warOffen)
    If Not wbQ Is Nothing Then AuswertenUndSchliessen wbQ, warOffen, pfad
    Set wbQ = Nothing
    Zurueck
    Exit Sub
Fehler:
    t = Err.Description
    On Error Resume Next
    Schliessen wbQ, warOffen
    Zurueck
    geplant = False
    letzterFehler = "Das hat nicht geklappt: " & t
End Sub

Public Sub KlickAndere()
    modKarte.Planen "modAltWerte.AndereDatei"
End Sub

' Karte „Andere Datei …“: Dateiauswahl bzw. Adresse aus dem Browser, dann neu auswerten
Public Sub AndereDatei()
    Dim pfad As String, t As String
    On Error GoTo Fehler
    modKarte.KartenEntfernen
    pfad = Abfragen()
    If Len(pfad) = 0 Then Exit Sub
    t = AltWertePlanen(pfad)
    PlanAnzeigen
    Exit Sub
Fehler:
    t = Err.Description
    On Error Resume Next
    Zurueck
    ThisWorkbook.Activate
    ThisWorkbook.Worksheets("Start").Activate
    FehlerKarte "Das hat nicht geklappt: " & t
End Sub

Public Sub KlickFuellen()
    modKarte.Planen "modAltWerte.Fuellen"
End Sub

Public Sub KlickUeberschreiben()
    modKarte.Planen "modAltWerte.Ueberschreiben"
End Sub

Public Sub Fuellen()
    Schreiben False
End Sub

Public Sub Ueberschreiben()
    Schreiben True
End Sub

Private Sub PlanAnzeigen()
    On Error Resume Next
    ThisWorkbook.Activate
    ThisWorkbook.Worksheets("Start").Activate
    On Error GoTo 0
    If Len(letzterFehler) > 0 Then
        FehlerKarte letzterFehler
        Exit Sub
    End If
    ThisWorkbook.Worksheets("Konfiguration").Range(KONF_PFAD).Value = quellPfad
    KarteZeichnen
End Sub

' Meldung mit „Andere Datei …“ (die gefundene oder gemerkte Datei passt nicht oder laesst sich nicht oeffnen)
Private Sub FehlerKarte(t As String)
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    On Error GoTo Ersatz
    modKarte.KartenEntfernen
    Set ws = ThisWorkbook.Worksheets("Start")
    kb = 480
    kh = 150 + 14 * (1 + Len(t) \ 70)
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "HTitel", kx + 28, ky + 22, kb - 56, 22, TITEL, 14, True, modKarte.C_ROT
    modKarte.Beschriftung ws, "HText", kx + 28, ky + 52, kb - 56, kh - 110, t, 9.5, False, modKarte.C_GRAU, True
    modKarte.Knopf ws, "OK", kx + kb - 28 - 100, ky + kh - 46, 100, 30, "Schließen", 1, "modKarte.KlickSchliessen"
    modKarte.Knopf ws, "Andere", kx + 20, ky + kh - 46, 130, 30, "Andere Datei …", 3, "modAltWerte.KlickAndere"
    Exit Sub
Ersatz:
    MsgBox t, vbExclamation, TITEL
End Sub

Private Sub KarteZeichnen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, y As Single, x As Single
    Dim zahlen(1 To 7) As String, texte(1 To 7) As String, hoehen(1 To 7) As Single, farben(1 To 7) As Long
    Dim n As Long, i As Long, aktuell As Boolean, ort As String
    aktuell = (nNeu = 0 And nAbw = 0)
    n = 1
    zahlen(n) = Zahl(nNeu)
    texte(n) = "neue Werte – das Feld ist hier noch leer" & Zeitraum(neuVon, neuBis)
    farben(n) = IIf(nNeu > 0, modKarte.C_TEAL, modKarte.C_GRAU)
    hoehen(n) = 24
    n = 2
    zahlen(n) = Zahl(nAbw)
    texte(n) = "abweichende Werte – hier steht schon eine andere Zahl" & Zeitraum(abwVon, abwBis)
    farben(n) = IIf(nAbw > 0, modKarte.C_ROT, modKarte.C_GRAU)
    hoehen(n) = 24
    If nBeispiele > 0 Then
        texte(n) = texte(n) & vbCr & "z. B. " & abwBeispiele
        hoehen(n) = 26 + 12 * nBeispiele
    End If
    n = 3
    zahlen(n) = Zahl(nGleich)
    texte(n) = "gleich" & IIf(nFormel > 0, "  ·  " & Zahl(nFormel) & " Felder haben hier eine Formel und bleiben unberührt", "")
    farben(n) = modKarte.C_GRAU
    hoehen(n) = 24
    If nNichtZ > 0 Then
        n = n + 1
        zahlen(n) = Zahl(nNichtZ)
        texte(n) = IIf(nNichtZ = 1, "Zeile", "Zeilen") & " hier ohne passende Zeile in der Datei: " & nichtZText & IIf(nNichtZ > MAX_BEISPIELE, " …", "")
        farben(n) = modKarte.C_ROT
        hoehen(n) = 50
    End If
    If nQuelleOffen > 0 Then
        n = n + 1
        zahlen(n) = Zahl(nQuelleOffen)
        texte(n) = IIf(nQuelleOffen = 1, "Zeile", "Zeilen") & " der Datei mit Zahlen, die sich hier nicht zuordnen lassen (bleiben weg): " & _
                   quelleOffenText & IIf(nQuelleOffen > MAX_BEISPIELE, " …", "")
        farben(n) = modKarte.C_ROT
        hoehen(n) = 50
    End If
    If nOhneSpalte > 0 Then
        n = n + 1
        zahlen(n) = Zahl(nOhneSpalte)
        texte(n) = "Zahlen der Datei an einem Datum, für das es hier keine Spalte gibt (bleiben weg)"
        farben(n) = modKarte.C_ROT
        hoehen(n) = 24
    End If
    If nText > 0 Then
        n = n + 1
        zahlen(n) = Zahl(nText)
        texte(n) = IIf(nText = 1, "Text der Datei an einem hier leeren Feld: ", "Texte der Datei an hier leeren Feldern, z. B. ") & _
                   textBeispiel & " – übernommen werden nur Zahlen, " & IIf(nText = 1, "das Feld bleibt", "die Felder bleiben") & " leer"
        farben(n) = modKarte.C_GRAU
        hoehen(n) = 38
    End If
    kb = 640
    kh = 116
    For i = 1 To n
        kh = kh + hoehen(i)
    Next i
    kh = kh + 8 + 38 + 14 + 48                                   ' Abstand, Hinweis BUE, Abstand, Knoepfe
    Set ws = ThisWorkbook.Worksheets("Start")
    modKarte.KartenEntfernen
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "WERTE AUS HS-DASHBOARD 2025  ·  EINMALIG ÜBERNEHMEN", 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, IIf(aktuell, "Schon alles aktuell", "Werte übernehmen?"), 16, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Datei", kx + 28, ky + 72, kb - 56, 14, "Datei: " & quellName, 9.5, True, modKarte.C_SW
    ort = quellPfad
    If InStrRev(ort, "/") > InStrRev(ort, "\") Then
        ort = Left$(ort, InStrRev(ort, "/") - 1)
    ElseIf InStrRev(ort, "\") > 0 Then
        ort = Left$(ort, InStrRev(ort, "\") - 1)
    End If
    If LCase$(Left$(ort, 4)) = "http" Then ort = modBasis.UrlDekodieren(ort)
    If Len(ort) > 100 Then ort = "…" & Right$(ort, 99)
    modKarte.Beschriftung ws, "Ort", kx + 28, ky + 88, kb - 56, 12, ort, 8, False, modKarte.C_GRAU
    y = ky + 116
    For i = 1 To n
        modKarte.Beschriftung ws, "Z_" & Format(i, "00"), kx + 28, y, 64, 16, zahlen(i), 13, True, farben(i)
        modKarte.Beschriftung ws, "T_" & Format(i, "00"), kx + 100, y + 2, kb - 128, hoehen(i) - 4, texte(i), 9.5, False, modKarte.C_GRAU, True
        y = y + hoehen(i)
    Next i
    y = y + 8
    modKarte.Pille ws, "Bue", kx + 28, y, kb - 56, 38, "Bestandsübertragung bleibt unberührt (Verbund/OPAG und die alten Zeilen 7a–7f): " & _
        "BÜ-Werte kommen automatisch aus dem BÜ-Reporting („BÜ-Datei verknüpfen“)." & _
        IIf(aktuell, " Aus dieser Datei gibt es nichts mehr zu übernehmen.", ""), modKarte.C_GRAUXL, modKarte.C_GRAU
    y = ky + kh - 48
    If aktuell Then
        modKarte.Knopf ws, "OK", kx + kb - 28 - 100, y, 100, 30, "OK", 1, "modKarte.KlickSchliessen"
        modKarte.Knopf ws, "Andere", kx + 20, y, 110, 30, "Andere Datei …", 3, "modAltWerte.KlickAndere"
    Else
        x = kx + kb - 28
        If nNeu > 0 Then
            x = x - 160
            modKarte.Knopf ws, "Fuellen", x, y, 160, 30, "Leere Felder füllen", 1, "modAltWerte.KlickFuellen"
            x = x - 10
        End If
        If nAbw > 0 Then
            x = x - 210
            modKarte.Knopf ws, "Ueber", x, y, 210, 30, "Auch abweichende überschreiben", 2, "modAltWerte.KlickUeberschreiben"
        End If
        modKarte.Knopf ws, "Abbrechen", kx + 20, y, 90, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
        modKarte.Knopf ws, "Andere", kx + 112, y, 110, 30, "Andere Datei …", 3, "modAltWerte.KlickAndere"
    End If
End Sub

Private Sub Schreiben(ueber As Boolean)
    Dim n As Long, t As String
    modKarte.KartenEntfernen
    On Error Resume Next
    ThisWorkbook.Worksheets("Start").Activate
    On Error GoTo 0
    If Not geplant Then
        modKarte.Hinweis TITEL, "Die Auswertung liegt nicht mehr vor (z. B. nach einem Makro-Fehler). Bitte den Knopf „" & TITEL & _
            "“ noch einmal klicken.", True
        Exit Sub
    End If
    n = AltWerteAnwenden(ueber)
    If Len(letzterFehler) > 0 Then
        modKarte.Hinweis TITEL, "Beim Schreiben ist ein Fehler aufgetreten: " & letzterFehler & vbCr & Zahl(n) & " Werte wurden bis dahin übernommen.", True
        Exit Sub
    End If
    t = Zahl(n) & IIf(n = 1, " Wert", " Werte") & " aus " & quellName & " übernommen"
    If nUeberschrieben > 0 Then t = t & " (" & Zahl(nNeuGeschrieben) & " in leere Felder, " & Zahl(nUeberschrieben) & " überschrieben)"
    t = t & "." & vbCr & "Für diese Werte gilt als Stand wieder der Berichtstag der jeweiligen KW. Startseite, Übersicht und Kacheln " & _
        "rechnen mit den neuen Zahlen."
    If Not ueber And nAbw > 0 Then t = t & vbCr & Zahl(nAbw) & " abweichende Werte sind unverändert geblieben."
    If nGesperrt > 0 Then t = t & vbCr & Zahl(nGesperrt) & " Werte nicht geschrieben: das Blatt ist mit Kennwort geschützt."
    modKarte.Hinweis "Werte übernommen", t, nGesperrt > 0
End Sub

' ---------------------------------------------------------------- ohne Dialoge (auch fuer die Pruefung)
' Datei oeffnen (oder die schon offene nehmen), auswerten, schliessen. Nichts wird geschrieben.
Public Function AltWertePlanen(pfad As String) As String
    Dim wbQ As Workbook, warOffen As Boolean
    On Error GoTo Fehler
    PlanLeeren
    Ruhig
    Set wbQ = Oeffnen(pfad, warOffen)
    If wbQ Is Nothing Then
        If Len(letzterFehler) = 0 Then letzterFehler = "Die Datei ließ sich nicht öffnen:" & vbCr & pfad
    Else
        AuswertenUndSchliessen wbQ, warOffen, pfad
    End If
    Set wbQ = Nothing
    Zurueck
    On Error Resume Next
    ThisWorkbook.Activate
    AltWertePlanen = Ergebnis()
    Exit Function
Fehler:
    letzterFehler = Err.Description
    geplant = False
    On Error Resume Next
    Schliessen wbQ, warOffen
    Zurueck
    AltWertePlanen = Ergebnis()
End Function

' Wie der Knopf, aber ohne Dialoge und Karte: Datei suchen und auswerten. "nicht_gefunden" = keine Datei (der Knopf fragt dann).
Public Function AltWerteSuchen() As String
    SuchenUndAuswerten
    On Error Resume Next
    ThisWorkbook.Activate
    If Len(quellName) = 0 And Len(letzterFehler) = 0 Then
        AltWerteSuchen = "nicht_gefunden"
    ElseIf Len(letzterFehler) > 0 Then
        AltWerteSuchen = Ergebnis()
    Else
        AltWerteSuchen = Ergebnis() & ";pfad=" & quellPfad
    End If
End Function

' Geplante Zellen schreiben: immer die neuen, mit ueberschreiben auch die abweichenden. Liefert die Zahl der geschriebenen Zellen.
Public Function AltWerteAnwenden(ueberschreiben As Boolean) As Long
    Dim i As Long, n As Long, b As Long, calc As Long, wsS As Worksheet, zelle As Range
    Dim namen(1 To 3) As String, zustand(1 To 3) As Long, schutz(1 To 3) As Variant
    letzterFehler = ""
    nNeuGeschrieben = 0: nUeberschrieben = 0: nGesperrt = 0
    If Not geplant Then
        letzterFehler = "Es liegt keine Auswertung vor (zuerst AltWertePlanen bzw. den Knopf verwenden)."
        Exit Function
    End If
    namen(1) = "Rohdaten": namen(2) = "Rohdaten_2": namen(3) = "Rohdaten_3"
    On Error GoTo Fehler
    Ruhig
    calc = Application.Calculation
    Application.Calculation = xlCalculationManual
    On Error Resume Next
    Set wsS = ThisWorkbook.Worksheets("Wertstand")               ' aeltere Dateien ohne das Blatt: still uebergehen
    On Error GoTo Fehler
    For i = 1 To pN
        If pArt(i) = 1 Or ueberschreiben Then
            b = BlattNr(namen, pBlatt(i))
            If b > 0 Then
                If zustand(b) = 0 Then zustand(b) = Freigeben(ThisWorkbook.Worksheets(namen(b)), schutz(b))
                If zustand(b) < 0 Then
                    nGesperrt = nGesperrt + 1
                Else
                    Set zelle = ThisWorkbook.Worksheets(namen(b)).Cells(pZeile(i), pSpalte(i))
                    If Not zelle.HasFormula Then
                        If pArt(i) = 2 Or IstLeer(zelle.Value) Then    ' neu: nur, wenn das Feld noch leer ist (wie beim Planen)
                            zelle.Value = pWert(i)
                            Zahlformat zelle, pWert(i)
                            If b = 1 Then
                                If Not wsS Is Nothing Then wsS.Cells(pZeile(i), pSpalte(i)).ClearContents
                            End If
                            n = n + 1
                            If pArt(i) = 1 Then nNeuGeschrieben = nNeuGeschrieben + 1 Else nUeberschrieben = nUeberschrieben + 1
                        End If
                    End If
                End If
            End If
        End If
    Next i
    For b = 1 To 3
        If zustand(b) = 2 Then Schuetzen ThisWorkbook.Worksheets(namen(b)), schutz(b)
    Next b
    If n > 0 Then                                                ' ein Lauf ohne Aenderung laesst den letzten Stand stehen
        With ThisWorkbook.Worksheets("Konfiguration").Range(KONF_STAND)
            .NumberFormat = "@"
            .Value = Zahl(n) & IIf(n = 1, " Wert", " Werte") & " übernommen am " & Format(Now, "dd.mm.yyyy hh:mm")
        End With
    End If
    geplant = False                                              ' nicht zweimal anwenden
    Application.Calculation = calc
    Zurueck
    AltWerteAnwenden = n
    Exit Function
Fehler:
    letzterFehler = Err.Description
    On Error Resume Next
    For b = 1 To 3
        If zustand(b) = 2 Then Schuetzen ThisWorkbook.Worksheets(namen(b)), schutz(b)
    Next b
    If calc <> 0 Then Application.Calculation = calc
    Zurueck
    AltWerteAnwenden = n
End Function

Private Function Ergebnis() As String
    If Len(letzterFehler) > 0 Then
        Ergebnis = "fehler=" & Replace(letzterFehler, vbCr, " ")
    Else
        Ergebnis = "neu=" & nNeu & ";abweichend=" & nAbw & ";gleich=" & nGleich & ";formel=" & nFormel & ";nicht_zugeordnet=" & nNichtZ & _
                   ";quelle_ohne_ziel=" & nQuelleOffen & ";ohne_spalte=" & nOhneSpalte & ";texte=" & nText & ";datei=" & quellName
    End If
End Function

' ---------------------------------------------------------------- Datei finden und oeffnen
' Erste Datei, die schon offen ist oder sich oeffnen laesst (pfad = ihre Adresse); Nothing = keine gefunden
Private Function Suchen(ByRef pfad As String, ByRef warOffen As Boolean) As Workbook
    Dim kand As Collection, k As Variant, wb As Workbook
    Set kand = Kandidaten()
    For Each k In kand                                           ' schon offen?
        Set wb = OffeneMappe(CStr(k))
        If Not wb Is Nothing Then
            pfad = wb.FullName: warOffen = True
            Set Suchen = wb
            Exit Function
        End If
    Next k
    For Each k In kand                                           ' der Reihe nach oeffnen (nie diese Datei selbst)
        If Not IstDieseDatei(CStr(k)) Then
            Set wb = Oeffnen(CStr(k), warOffen)
            If Not wb Is Nothing Then
                pfad = CStr(k)
                Set Suchen = wb
                Exit Function
            End If
        End If
    Next k
    For Each wb In Application.Workbooks                         ' zuletzt: eine geoeffnete Mappe nach dem Muster (z. B. Download)
        If Passt(wb.Name) Then
            pfad = wb.FullName: warOffen = True
            Set Suchen = wb
            Exit Function
        End If
    Next wb
End Function

' gemerkte Datei, dann im Ordner dieser Datei die beiden Namen (lokal bzw. synchronisiert, dann auf SharePoint ueber https), danach
' lokal alles nach dem Muster (Kopien, „alt“ und Namen mit Klammer zuletzt)
Private Function Kandidaten() As Collection
    Dim c As New Collection, basis As String, sep As String, sp As Boolean, k As String, e As String, lokal As String
    Dim spaeter As New Collection, ps As String, e2 As Variant
    k = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range(KONF_PFAD).Value))
    basis = ThisWorkbook.Path
    sp = (LCase$(Left$(basis, 4)) = "http")
    If sp Then
        basis = modBasis.UrlDekodieren(basis)
        sep = "/"
        lokal = modBasis.BasisOrdner(True)                       ' synchronisierte Bibliothek, falls vorhanden (ohne Dialog)
    Else
        sep = Application.PathSeparator
        lokal = basis
    End If
    Do While Len(basis) > 0 And Right$(basis, 1) = sep
        basis = Left$(basis, Len(basis) - 1)
    Loop
    ps = Application.PathSeparator
    On Error Resume Next                                         ' doppelte Eintraege (Schluessel) werden uebergangen
    If Len(k) > 0 Then
        k = modBasis.DateiPfad(k, DATEI_1)
        c.Add k, LCase$(k)
    End If
    If Len(lokal) > 0 Then
        c.Add lokal & ps & DATEI_1, LCase$(lokal & ps & DATEI_1)
        c.Add lokal & ps & DATEI_2, LCase$(lokal & ps & DATEI_2)
    End If
    If Len(basis) > 0 Then
        c.Add basis & sep & DATEI_1, LCase$(basis & sep & DATEI_1)
        c.Add basis & sep & DATEI_2, LCase$(basis & sep & DATEI_2)
    End If
    If Len(lokal) > 0 Then
        e = Dir(lokal & ps & MUSTER)
        Do While Len(e) > 0
            If Passt(e) Then
                If Nachrangig(e) Then
                    spaeter.Add lokal & ps & e
                Else
                    c.Add lokal & ps & e, LCase$(lokal & ps & e)
                End If
            End If
            e = Dir()
        Loop
        For Each e2 In spaeter
            c.Add CStr(e2), LCase$(CStr(e2))
        Next e2
    End If
    On Error GoTo 0
    Set Kandidaten = c
End Function

' Name einer Kopie oder alten Fassung (wird nach den uebrigen Treffern des Musters versucht)
Private Function Nachrangig(nm As String) As Boolean
    Dim n As String
    n = LCase$(nm)
    Nachrangig = (InStr(n, "kopie") > 0 Or InStr(n, "copy") > 0 Or InStr(n, "(") > 0 Or InStr(n, "alt") > 0)
End Function

' Pfad oder Adresse dieser Datei selbst? (Excel oeffnet keine zwei Mappen gleichen Namens: gleicher Dateiname genuegt)
Private Function IstDieseDatei(pfad As String) As Boolean
    Dim p As String
    p = LCase$(Replace(modBasis.UrlDekodieren(pfad), "\", "/"))
    IstDieseDatei = (Mid$(p, InStrRev(p, "/") + 1) = LCase$(ThisWorkbook.Name))
End Function

' selbst geoeffnete Quelle ohne Speichern schliessen – nie eine schon offene und nie diese Datei selbst
Private Sub Schliessen(wbQ As Workbook, warOffen As Boolean)
    If wbQ Is Nothing Then Exit Sub
    If warOffen Then Exit Sub
    If wbQ Is ThisWorkbook Then Exit Sub
    If wbQ.Name = ThisWorkbook.Name Then Exit Sub
    wbQ.Close False
End Sub

' Name eines HS-Dashboards 2025 (nicht die OPAG-Fassung, nicht diese Datei)
Private Function Passt(nm As String) As Boolean
    Dim n As String
    n = LCase$(nm)
    If n = LCase$(ThisWorkbook.Name) Then Exit Function
    If InStr(n, "opag") > 0 Then Exit Function
    Passt = (n Like LCase$(MUSTER))
End Function

' schon geoeffnete Mappe zu einem Pfad (gleiche Adresse oder gleicher Dateiname; Excel oeffnet keine zwei Mappen gleichen Namens)
Private Function OffeneMappe(pfad As String) As Workbook
    Dim wb As Workbook, p As String, nm As String
    p = LCase$(modBasis.UrlDekodieren(pfad))
    nm = Mid$(p, InStrRev(Replace(p, "\", "/"), "/") + 1)
    For Each wb In Application.Workbooks
        If wb.Name <> ThisWorkbook.Name Then
            If LCase$(modBasis.UrlDekodieren(wb.FullName)) = p Or LCase$(wb.Name) = nm Then
                Set OffeneMappe = wb
                Exit Function
            End If
        End If
    Next wb
End Function

' Mappe oeffnen: schreibgeschuetzt, Verknuepfungen nicht aktualisieren, ohne Makros. warOffen = schon offen (dann nicht schliessen).
Private Function Oeffnen(pfad As String, ByRef warOffen As Boolean) As Workbook
    Dim wb As Workbook, sicherheit As Long, alt As Boolean
    warOffen = False
    If IstDieseDatei(pfad) Then                                  ' Open lieferte diese Mappe, das Schliessen danach schloesse sie
        letzterFehler = "Das ist diese Datei selbst. Bitte das bisherige HS-Dashboard 2025 wählen (" & DATEI_1 & ")."
        Exit Function
    End If
    Set wb = OffeneMappe(pfad)
    If Not wb Is Nothing Then
        warOffen = True
        Set Oeffnen = wb
        Exit Function
    End If
    If LCase$(Left$(pfad, 4)) <> "http" Then
        If Not modBasis.DateiDa(pfad) Then Exit Function
    End If
    On Error Resume Next
    Application.StatusBar = "Öffne " & pfad & " ..."
    sicherheit = Application.AutomationSecurity
    Application.AutomationSecurity = 3                           ' msoAutomationSecurityForceDisable: keine Makros der Datei
    alt = Application.DisplayAlerts
    Application.DisplayAlerts = False
    Set wb = Nothing
    Set wb = Application.Workbooks.Open(pfad, 0, True)
    Application.DisplayAlerts = alt
    If sicherheit <> 0 Then Application.AutomationSecurity = sicherheit
    Application.StatusBar = False
    ThisWorkbook.Activate
    On Error GoTo 0
    Set Oeffnen = wb
End Function

' Dateiauswahl, nach Abbruch die Adresse aus der Adresszeile des Browsers (Datei oder Ordner auf SharePoint)
Private Function Abfragen() As String
    Dim datei As Variant, t As String
    datei = Application.GetOpenFilename("Excel-Dateien (*.xlsm;*.xlsx;*.xls),*.xlsm;*.xlsx;*.xls", , "HS-Dashboard 2025 auswählen (" & DATEI_1 & ")")
    If VarType(datei) = vbString Then
        Abfragen = CStr(datei)
        Exit Function
    End If
    t = InputBox("Liegt das HS-Dashboard 2025 auf SharePoint? Dann die Adresse der Datei (oder ihres Ordners) aus der Adresszeile des " & _
                 "Browsers einfügen (leer lassen = abbrechen):", "HS-Dashboard 2025 auf SharePoint", _
                 CStr(ThisWorkbook.Worksheets("Konfiguration").Range(KONF_PFAD).Value))
    If Len(Trim$(t)) > 0 Then Abfragen = modBasis.DateiPfad(t, DATEI_1)
End Function

' ---------------------------------------------------------------- Auswerten (Trockenlauf)
Private Sub AuswertenUndSchliessen(wbQ As Workbook, warOffen As Boolean, pfad As String)
    On Error GoTo Fehler
    quellName = wbQ.Name
    quellPfad = wbQ.FullName
    If InStr(quellPfad, "\") = 0 And InStr(quellPfad, "/") = 0 Then quellPfad = pfad       ' (LibreOffice liefert hier nur den Namen)
    Auswerten wbQ
Ende:
    On Error Resume Next
    Schliessen wbQ, warOffen                                     ' selbst geoeffnet: immer ohne Speichern schliessen
    On Error GoTo 0
    Exit Sub
Fehler:
    letzterFehler = "Die Datei ließ sich nicht auswerten: " & Err.Description
    geplant = False
    Resume Ende
End Sub

Private Sub Auswerten(wbQ As Workbook)
    Dim blaetter As Variant, i As Long, wsQ As Worksheet, wsZ As Worksheet, codes As Long
    If wbQ.Name = ThisWorkbook.Name Then
        letzterFehler = "Das ist diese Datei selbst. Bitte das bisherige HS-Dashboard 2025 wählen (" & DATEI_1 & ")."
        Exit Sub
    End If
    ' Ziel ist immer Rohdaten: Wochenwerte (Datum in Zeile 1) bis zwei Zeilen ueber dem ersten Monatsblock; Rohdaten_2 und
    ' Rohdaten_3 der Datei in die Monatsbloecke, die aus diesen Blaettern entstanden sind (Kopfzeile mit „Monat“, Spalte F)
    Dim mk As Long, kopf As Long, von As Long, bis As Long
    mk = modBasis.ErsterMonatsKopf()
    blaetter = Array("Rohdaten", "Rohdaten_2", "Rohdaten_3")
    For i = 0 To 2
        Set wsQ = Nothing
        Set wsZ = Nothing
        On Error Resume Next
        Set wsQ = wbQ.Worksheets(CStr(blaetter(i)))
        Set wsZ = ThisWorkbook.Worksheets("Rohdaten")
        On Error GoTo 0
        If i = 0 Then
            kopf = 1: von = ERSTE: bis = IIf(mk > 0, mk - 1, LetzteZeile(wsZ))
            Do While bis > ERSTE And mk > 0                     ' Leerzeile(n) vor dem ersten Monatsblock (fehlt nach „KPI löschen“ evtl.)
                If Application.WorksheetFunction.CountA(wsZ.Range(wsZ.Cells(bis, 1), wsZ.Cells(bis, 5))) > 0 Then Exit Do
                bis = bis - 1
            Loop
        Else
            kopf = modBasis.MonatsKopf(CStr(blaetter(i)))
            von = kopf + 2: bis = IIf(kopf > 0, modBasis.BlockEnde(kopf), 0)
            If kopf = 0 Then Set wsZ = Nothing
        End If
        If wsQ Is Nothing Or wsZ Is Nothing Then
            If i = 0 Then
                letzterFehler = wbQ.Name & " hat kein Blatt „Rohdaten“. Bitte das bisherige HS-Dashboard 2025 wählen (" & DATEI_1 & ")."
                Exit Sub
            End If
            NichtZugeordnet "Blatt " & CStr(blaetter(i)) & " fehlt"
        Else
            codes = codes + BlattPlanen(wsQ, wsZ, kopf, von, bis)
        End If
    Next i
    If codes < 5 Then
        letzterFehler = "In " & wbQ.Name & " stehen kaum dieselben Codes in Spalte A wie hier. Ist das das HS-Dashboard 2025 (" & DATEI_1 & ")?"
        Exit Sub
    End If
    geplant = True
End Sub

' Ein Datenblatt planen; liefert die Zahl der zugeordneten Zeilen mit Code (Plausibilitaet)
Private Function BlattPlanen(wsQ As Worksheet, wsZ As Worksheet, zKopf As Long, zVon As Long, zBis As Long) As Long
    Dim q As Variant, z As Variant, zf As Variant, kopf As Variant, v As Variant, w As Variant
    Dim qN As Long, qS As Long, zN As Long, zS As Long, qBis As Long
    Dim qBlk() As String, qAbs() As Long, qLab() As String, qBenutzt() As Boolean, qSpGenutzt() As Boolean, qBue() As Boolean
    Dim zBlk() As String, zAbs() As Long, zLab() As String, spQ() As Long, zBue() As Boolean
    Dim r As Long, c As Long, k As Long, qr As Long, art As Long, nCodes As Long, hatZahl As Boolean, blatt As String
    blatt = wsZ.Name
    ' Ziel als Ausschnitt von Rohdaten: Zeile 1 = Kopfzeile (Datum bzw. Monat), Zeile 2 leer, ab Zeile 3 die Zeilen zVon bis zBis
    zS = LetzteSpalte(wsZ)
    zN = ERSTE + zBis - zVon
    qN = LetzteZeile(wsQ): qS = LetzteSpalte(wsQ)
    If zN < ERSTE Or qN < ERSTE Or zS < 4 Or qS < 4 Then Exit Function
    ' Datei nur bis zur letzten Datumsspalte lesen (das bisherige Dashboard ist weit nach rechts „benutzt“)
    kopf = wsQ.Range(wsQ.Cells(1, 1), wsQ.Cells(1, qS)).Value2
    qBis = 4
    For c = 1 To qS
        If IstDatum(kopf(1, c)) Then qBis = c
    Next c
    q = wsQ.Range(wsQ.Cells(1, 1), wsQ.Cells(qN, qBis)).Value2
    Dim kv As Variant, bv As Variant, bf As Variant
    ReDim z(1 To zN, 1 To zS)
    ReDim zf(1 To zN, 1 To zS)
    kv = wsZ.Range(wsZ.Cells(zKopf, 1), wsZ.Cells(zKopf, zS)).Value2
    bv = wsZ.Range(wsZ.Cells(zVon, 1), wsZ.Cells(zBis, zS)).Value2
    bf = wsZ.Range(wsZ.Cells(zVon, 1), wsZ.Cells(zBis, zS)).Formula
    For c = 1 To zS
        z(1, c) = kv(1, c): zf(1, c) = ""
        z(2, c) = Empty: zf(2, c) = ""
        For r = ERSTE To zN
            z(r, c) = bv(r - ERSTE + 1, c)
            zf(r, c) = bf(r - ERSTE + 1, c)
        Next r
    Next c
    Gliedern q, qN, qBlk, qAbs, qLab, qBue
    Gliedern z, zN, zBlk, zAbs, zLab, zBue
    ' Spalten: je Spalte hier die Spalte der Datei mit demselben Datum in Zeile 1
    ReDim spQ(1 To zS)
    ReDim qSpGenutzt(1 To qBis)
    ReDim qBenutzt(1 To qN)
    For c = 1 To zS
        If IstDatum(z(1, c)) Then
            For k = 1 To qBis
                If IstDatum(q(1, k)) Then
                    If Int(CDbl(q(1, k))) = Int(CDbl(z(1, c))) Then
                        spQ(c) = k
                        qSpGenutzt(k) = True
                        Exit For
                    End If
                End If
            Next k
        End If
    Next c
    For r = ERSTE To zN
        If zBue(r) Then GoTo Weiter                              ' BUE kommt automatisch aus dem BUE-Reporting
        If zAbs(r) <> 0 And zLab(r) = "|" Then GoTo Weiter      ' Leerzeile ohne Code und Beschriftung
        qr = Zuordnen(r, zBlk, zAbs, zLab, qBlk, qAbs, qLab, qN)
        If qr = 0 Then
            NichtZugeordnet blatt & " " & (zVon + r - ERSTE) & ": " & Anzeige(z, r)
            GoTo Weiter
        End If
        If zAbs(r) = 0 Then nCodes = nCodes + 1
        qBenutzt(qr) = True
        For c = 1 To zS
            k = spQ(c)
            If k > 0 Then
                v = q(qr, k)
                If IstText(v) Then                               ' Text der Datei (z. B. „miso fehlt“): nur zaehlen, wenn hier leer
                    If Not IstFormel(zf(r, c)) Then
                        If IstLeer(z(r, c)) Then
                            nText = nText + 1
                            If nText = 1 Then textBeispiel = Kurz(Anzeige(z, r), 48) & ", " & Format(CDate(z(1, c)), "dd.mm.yyyy") & _
                                                             ": " & WertText(v)
                        End If
                    End If
                ElseIf IstZahl(v) Then
                    If IstFormel(zf(r, c)) Then
                        nFormel = nFormel + 1
                    Else
                        w = z(r, c)
                        art = 2
                        If IstLeer(w) Then
                            art = 1
                        ElseIf IstZahl(w) Then
                            If Gleich(CDbl(w), CDbl(v)) Then art = 0
                        End If
                        If art = 0 Then
                            nGleich = nGleich + 1
                        Else
                            Merken blatt, zVon + r - ERSTE, c, CDbl(v), art, CDbl(z(1, c))
                            If art = 2 And nBeispiele < MAX_BEISPIELE Then
                                nBeispiele = nBeispiele + 1
                                If nBeispiele > 1 Then abwBeispiele = abwBeispiele & vbCr
                                abwBeispiele = abwBeispiele & Kurz(Anzeige(z, r), 48) & ", " & Format(CDate(z(1, c)), "dd.mm.yyyy") & _
                                               ": hier " & WertText(w) & ", Datei " & WertText(v)
                            End If
                        End If
                    End If
                End If
            End If
        Next c
Weiter:
    Next r
    ' Zeilen der Datei mit Zahlen, die keiner Zeile hier zugeordnet sind; Zahlen an einem Datum ohne Spalte hier
    For r = ERSTE To qN
        If Not qBue(r) Then
            If qBenutzt(r) Then
                For k = 1 To qBis
                    If Not qSpGenutzt(k) Then
                        If IstDatum(q(1, k)) Then
                            If IstZahl(q(r, k)) Then nOhneSpalte = nOhneSpalte + 1
                        End If
                    End If
                Next k
            Else
                hatZahl = False
                For k = 1 To qBis
                    If qSpGenutzt(k) Then
                        If IstZahl(q(r, k)) Then
                            hatZahl = True
                            Exit For
                        End If
                    End If
                Next k
                If hatZahl Then QuelleOffen wsQ.Name & " " & r & ": " & Anzeige(q, r)
            End If
        End If
    Next r
    BlattPlanen = nCodes
End Function

' Code-Block und Abstand je Zeile: Zeile mit Code -> Block = Code, Abstand 0; ohne Code -> Block des letzten Codes darueber im
' selben Thema (Spalte B gilt bis zum naechsten Eintrag), sonst des ersten Codes darunter im selben Thema (Abstand negativ, z. B.
' „Provisionsreklamation EASY/Online“ vor 8a); ein Thema ganz ohne Code: Block "" und Abstand zur Kopfzeile. Nie ein Code aus einem
' anderen Thema – sonst gerieten Zeilen nach „KPI löschen“ in einen fremden Block (z. B. unter 7OL). Beschriftung = Kategorie |
' Abteilung, normalisiert. BUE: Thema Bestandsuebertragung oder eigener Code 7V*/7O*.
Private Sub Gliedern(a As Variant, n As Long, blk() As String, abst() As Long, lab() As String, bue() As Boolean)
    Dim r As Long, x As Long, cd As String, thema As String, tNr() As Long, nT As Long, kopf As Long, b As String
    ReDim blk(1 To n)
    ReDim abst(1 To n)
    ReDim lab(1 To n)
    ReDim bue(1 To n)
    ReDim tNr(1 To n)
    For r = ERSTE To n
        b = Norm(a(r, 2))
        If Len(b) > 0 Then                                       ' Thema in Spalte B gilt bis zum naechsten
            If b <> thema Or nT = 0 Then nT = nT + 1
            thema = b
        End If
        tNr(r) = nT
        lab(r) = Norm(a(r, 3)) & "|" & Norm(a(r, 4))
        bue(r) = (thema = "bestandsübertragung" Or thema = "bestandsuebertragung")
    Next r
    For r = ERSTE To n
        cd = CodeText(a(r, 1))
        If Len(cd) > 0 Then
            blk(r) = cd
            abst(r) = 0
            If IstBue(cd) Then bue(r) = True
        Else
            kopf = 0
            For x = r - 1 To ERSTE Step -1                       ' letzter Code darueber im selben Thema
                If tNr(x) <> tNr(r) Then Exit For
                If Len(CodeText(a(x, 1))) > 0 Then
                    kopf = x
                    Exit For
                End If
            Next x
            If kopf = 0 Then
                For x = r + 1 To n                               ' sonst erster Code darunter im selben Thema
                    If tNr(x) <> tNr(r) Then Exit For
                    If Len(CodeText(a(x, 1))) > 0 Then
                        kopf = x
                        Exit For
                    End If
                Next x
            End If
            If kopf > 0 Then
                blk(r) = CodeText(a(kopf, 1))
                abst(r) = r - kopf
            Else
                blk(r) = ""
                abst(r) = r - (ERSTE - 1)
            End If
        End If
    Next r
End Sub

' Zeile der Datei zur Zeile t hier (0 = keine)
Private Function Zuordnen(t As Long, zBlk() As String, zAbs() As Long, zLab() As String, qBlk() As String, qAbs() As Long, _
                          qLab() As String, qN As Long) As Long
    Dim r As Long, k As Long, kand As Long, treffer As Long
    If zAbs(t) = 0 Then                                          ' Zeile mit Code: derselbe Code
        For r = ERSTE To qN
            If qAbs(r) = 0 Then
                If qBlk(r) = zBlk(t) Then
                    Zuordnen = r
                    Exit Function
                End If
            End If
        Next r
        Exit Function
    End If
    If Len(zBlk(t)) = 0 Then
        k = ERSTE - 1                                            ' vor dem ersten Code: Abstand zur Kopfzeile
    Else
        For r = ERSTE To qN
            If qAbs(r) = 0 Then
                If qBlk(r) = zBlk(t) Then
                    k = r
                    Exit For
                End If
            End If
        Next r
        If k = 0 Then Exit Function                              ' den Block gibt es in der Datei nicht
    End If
    kand = k + zAbs(t)                                           ' gleicher Abstand zum Code und gleiche Beschriftung
    If kand >= ERSTE And kand <= qN Then
        If qAbs(kand) = zAbs(t) And qBlk(kand) = zBlk(t) And qLab(kand) = zLab(t) Then
            Zuordnen = kand
            Exit Function
        End If
    End If
    For r = ERSTE To qN                                          ' sonst im selben Block nach der Beschriftung (eindeutig)
        If qAbs(r) <> 0 Then
            If qBlk(r) = zBlk(t) And qLab(r) = zLab(t) Then
                treffer = treffer + 1
                kand = r
            End If
        End If
    Next r
    If treffer = 1 Then Zuordnen = kand
End Function

Private Sub Merken(blatt As String, r As Long, c As Long, wert As Double, art As Long, datum As Double)
    If pN = 0 Then
        ReDim pBlatt(1 To 512)
        ReDim pZeile(1 To 512)
        ReDim pSpalte(1 To 512)
        ReDim pWert(1 To 512)
        ReDim pArt(1 To 512)
    ElseIf pN >= UBound(pBlatt) Then
        ReDim Preserve pBlatt(1 To 2 * pN)
        ReDim Preserve pZeile(1 To 2 * pN)
        ReDim Preserve pSpalte(1 To 2 * pN)
        ReDim Preserve pWert(1 To 2 * pN)
        ReDim Preserve pArt(1 To 2 * pN)
    End If
    pN = pN + 1
    pBlatt(pN) = blatt
    pZeile(pN) = r
    pSpalte(pN) = c
    pWert(pN) = wert
    pArt(pN) = art
    If art = 1 Then
        nNeu = nNeu + 1
        If neuVon = 0 Then neuVon = datum
        If datum < neuVon Then neuVon = datum
        If datum > neuBis Then neuBis = datum
    Else
        nAbw = nAbw + 1
        If abwVon = 0 Then abwVon = datum
        If datum < abwVon Then abwVon = datum
        If datum > abwBis Then abwBis = datum
    End If
End Sub

Private Sub NichtZugeordnet(t As String)
    nNichtZ = nNichtZ + 1
    If nNichtZ <= MAX_BEISPIELE Then nichtZText = nichtZText & IIf(Len(nichtZText) > 0, "; ", "") & t
End Sub

Private Sub QuelleOffen(t As String)
    nQuelleOffen = nQuelleOffen + 1
    If nQuelleOffen <= MAX_BEISPIELE Then quelleOffenText = quelleOffenText & IIf(Len(quelleOffenText) > 0, "; ", "") & t
End Sub

Private Sub PlanLeeren()
    pN = 0
    geplant = False
    nNeu = 0: nAbw = 0: nGleich = 0: nFormel = 0: nNichtZ = 0: nQuelleOffen = 0: nOhneSpalte = 0
    nichtZText = "": quelleOffenText = "": abwBeispiele = "": nBeispiele = 0
    nText = 0: textBeispiel = ""
    neuVon = 0: neuBis = 0: abwVon = 0: abwBis = 0
    quellName = "": quellPfad = "": letzterFehler = ""
End Sub

' ---------------------------------------------------------------- Hilfen
Private Sub Ruhig()
    If ruhigAktiv Then Exit Sub
    On Error Resume Next
    altEvents = Application.EnableEvents
    altScreen = Application.ScreenUpdating
    altAlerts = Application.DisplayAlerts
    Application.EnableEvents = False
    Application.ScreenUpdating = False
    ruhigAktiv = True
End Sub

Private Sub Zurueck()
    If Not ruhigAktiv Then Exit Sub
    On Error Resume Next
    Application.EnableEvents = altEvents
    Application.ScreenUpdating = altScreen
    Application.DisplayAlerts = altAlerts
    Application.StatusBar = False
    ruhigAktiv = False
End Sub

' Blatt beschreibbar? 1 = ja (ungeschuetzt oder Schutz mit UserInterfaceOnly: Makros duerfen schreiben), 2 = Schutz ohne Kennwort
' aufgehoben (Optionen in schutz gemerkt, danach mit Schuetzen genauso wieder setzen), -1 = mit Kennwort geschuetzt
Private Function Freigeben(ws As Worksheet, ByRef schutz As Variant) As Long
    If Not ws.ProtectContents Then
        Freigeben = 1
        Exit Function
    End If
    If ws.ProtectionMode Then
        Freigeben = 1
        Exit Function
    End If
    With ws.Protection
        schutz = Array(ws.ProtectDrawingObjects, ws.ProtectScenarios, .AllowFormattingCells, .AllowFormattingColumns, .AllowFormattingRows, _
                       .AllowInsertingColumns, .AllowInsertingRows, .AllowInsertingHyperlinks, .AllowDeletingColumns, .AllowDeletingRows, _
                       .AllowSorting, .AllowFiltering, .AllowUsingPivotTables, ws.EnableSelection, ws.EnableOutlining)
    End With
    On Error Resume Next
    ws.Unprotect ""
    On Error GoTo 0
    If ws.ProtectContents Then Freigeben = -1 Else Freigeben = 2
End Function

' Schutz ohne Kennwort mit den gemerkten Optionen wieder setzen, dazu Auswahl und Gliederung wie vorher
Private Sub Schuetzen(ws As Worksheet, s As Variant)
    ws.Protect Password:="", DrawingObjects:=s(0), Contents:=True, Scenarios:=s(1), AllowFormattingCells:=s(2), _
        AllowFormattingColumns:=s(3), AllowFormattingRows:=s(4), AllowInsertingColumns:=s(5), AllowInsertingRows:=s(6), _
        AllowInsertingHyperlinks:=s(7), AllowDeletingColumns:=s(8), AllowDeletingRows:=s(9), AllowSorting:=s(10), _
        AllowFiltering:=s(11), AllowUsingPivotTables:=s(12)
    ws.EnableSelection = s(13)
    ws.EnableOutlining = s(14)
End Sub

Private Function BlattNr(namen() As String, nm As String) As Long
    Dim i As Long
    For i = LBound(namen) To UBound(namen)
        If namen(i) = nm Then
            BlattNr = i
            Exit Function
        End If
    Next i
End Function

' Bruchzahl in einer Zelle ohne Nachkommastellen im Format: eine bis zwei Stellen zeigen
Private Sub Zahlformat(zelle As Range, wert As Double)
    Dim nf As String
    If wert = Int(wert) Then Exit Sub
    nf = CStr(zelle.NumberFormat)
    If nf = "General" Or InStr(nf, "%") > 0 Or InStr(nf, "0.") > 0 Or InStr(nf, "#.") > 0 Then Exit Sub
    zelle.NumberFormat = "#,##0.0#"
End Sub

Private Function LetzteZeile(ws As Worksheet) As Long
    LetzteZeile = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
End Function

Private Function LetzteSpalte(ws As Worksheet) As Long
    LetzteSpalte = ws.UsedRange.Column + ws.UsedRange.Columns.Count - 1
End Function

' Zahl im Sinne der Uebernahme: Integer, Long, Single, Double, Currency, Decimal, Byte (kein Text, Fehlerwert, Wahrheitswert, Leer)
Private Function IstZahl(v As Variant) As Boolean
    Select Case VarType(v)
        Case 2, 3, 4, 5, 6, 14, 17
            IstZahl = True
    End Select
End Function

' Feld leer im Sinne der Uebernahme: leer oder leerer Text (z. B. Werte eingefuegt aus einer Formel mit Ergebnis "")
Private Function IstLeer(v As Variant) As Boolean
    If IsEmpty(v) Then
        IstLeer = True
    ElseIf VarType(v) = vbString Then
        IstLeer = (Len(v) = 0)
    End If
End Function

' Text mit Inhalt (nicht nur Leerzeichen)
Private Function IstText(v As Variant) As Boolean
    If VarType(v) = vbString Then IstText = (Len(Trim$(Replace(v, Chr(160), " "))) > 0)
End Function

Private Function IstDatum(v As Variant) As Boolean
    If IstZahl(v) Then IstDatum = (v > 30000 And v < 80000)          ' 1982 bis 2119, Datumswert (kein Text)
End Function

Private Function IstFormel(f As Variant) As Boolean
    If VarType(f) = vbString Then IstFormel = (Left$(f, 1) = "=")
End Function

Private Function IstBue(blk As String) As Boolean
    If Len(blk) = 3 Then IstBue = (Left$(blk, 2) = "7v" Or Left$(blk, 2) = "7o")
End Function

Private Function Gleich(a As Double, b As Double) As Boolean
    Dim m As Double
    m = Abs(b)
    If m < 1 Then m = 1
    Gleich = (Abs(a - b) <= 0.000000001 * m)
End Function

Private Function CodeText(v As Variant) As String
    If IsError(v) Or IsEmpty(v) Then Exit Function
    CodeText = LCase$(Trim$(Replace(CStr(v), Chr(160), " ")))
End Function

' Beschriftung zum Vergleich: klein, nur Buchstaben und Ziffern, alles andere (Leerzeichen, NBSP, # - / ( ) . , + …) trennt
Private Function Norm(v As Variant) As String
    Dim t As String, s As String, ch As String, i As Long, luecke As Boolean
    If IsError(v) Or IsEmpty(v) Then Exit Function
    t = LCase$(CStr(v))
    For i = 1 To Len(t)
        ch = Mid$(t, i, 1)
        If (ch Like "[0-9]") Or (UCase$(ch) <> ch) Or ch = "ß" Then
            If luecke And Len(s) > 0 Then s = s & " "
            s = s & ch
            luecke = False
        Else
            luecke = True
        End If
    Next i
    Norm = s
End Function

Private Function Zelltext(v As Variant) As String
    If IsError(v) Or IsEmpty(v) Then Exit Function
    Zelltext = Trim$(Replace(Replace(Replace(CStr(v), Chr(160), " "), vbLf, " "), vbCr, " "))
End Function

' Anzeige einer Zeile: Code, Kategorie · Abteilung
Private Function Anzeige(a As Variant, r As Long) As String
    Dim t As String, d As String
    t = Zelltext(a(r, 1))
    If Len(t) > 0 Then t = t & " "
    t = t & Zelltext(a(r, 3))
    d = Zelltext(a(r, 4))
    If Len(d) > 0 Then t = t & " · " & d
    Anzeige = Kurz(Trim$(t), 60)
End Function

Private Function Kurz(t As String, n As Long) As String
    If Len(t) > n Then Kurz = Left$(t, n - 1) & "…" Else Kurz = t
End Function

Private Function WertText(v As Variant) As String
    If IstZahl(v) Then
        If CDbl(v) = Int(CDbl(v)) Then WertText = Format(v, "#,##0") Else WertText = Format(v, "#,##0.0#")
    ElseIf IsError(v) Then
        WertText = "Fehlerwert"
    Else
        WertText = "„" & Kurz(CStr(v), 20) & "“"
    End If
End Function

Private Function Zahl(n As Long) As String
    Zahl = Format(n, "#,##0")
End Function

Private Function Zeitraum(von As Double, bis As Double) As String
    If von = 0 Then Exit Function
    If von = bis Then
        Zeitraum = "  ·  " & Format(CDate(von), "dd.mm.yyyy")
    Else
        Zeitraum = "  ·  " & Format(CDate(von), "dd.mm.yyyy") & " bis " & Format(CDate(bis), "dd.mm.yyyy")
    End If
End Function
