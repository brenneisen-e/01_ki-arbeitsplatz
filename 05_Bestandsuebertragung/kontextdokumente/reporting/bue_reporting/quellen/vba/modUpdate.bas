Option Explicit
' ============================================================================
' modUpdate – „Ältere Datei aktualisieren …“ (seit 12.93; Knopf im Cockpit unter WERKZEUGE, Karte in modWerkzeuge)
' Die neue Version (diese Datei, frisch heruntergeladen) uebernimmt alle Daten einer in Excel geoeffneten aelteren Master-Datei
' und speichert sich danach unter deren Namen und an deren Ort (die alte Datei wird ersetzt). So bleibt die Datei, die alle
' benutzen und auf die andere Dateien verweisen (z. B. das HR Sales Dashboard), dieselbe – nur in neuer Version. Nichts muss
' neu geladen werden. Die heruntergeladene Datei selbst bleibt unveraendert.
' Uebernommen: Fakten, Verlauf (Stichtage und Blockgrenzen; Formeln der neuen Version), Ladeprotokoll, Umbuchungen, Snapshots,
' Dateiinhalt, Mitarbeiter, Kalender (Spalten ueber das Datum in Zeile 6), Konfiguration (Eingabebereiche), Filter (alle Werte
' ausser Formeln: Chips, Postkorbliste, Ansicht), SP_Liste (im Tool ausgeblendete Rohdateien) und Celonis_Log.
' Voraussetzungen: genau eine andere Master-Datei offen, gleicher Bereich (HS/MAKLER), Version ab 12.80 und aelter als diese,
' nicht schreibgeschuetzt geoeffnet, keine Beladung. Vorher wird die alte Datei gesichert (Dateipfad: Protokolle\Sicherung neben
' ihr; SharePoint ohne Dateipfad: dort haelt der Versionsverlauf die alte Fassung).
' ============================================================================

Private Const MIN_VERSION As Long = 12080           ' 12.80 (Version als Haupt * 1000 + Neben)
Private Const KAL_ERSTE As Long = 7                 ' Kalender: erste Mitarbeiterzeile (modLaden.MA_START + PL_VERSATZ)
Private Const KAL_SPALTE0 As Long = 4                ' Kalender: erste Tagesspalte (D)
Private Const SNAP_ZEILEN As Long = 41              ' Snapshot_*!J2:L41
Private Const XL_XLSM As Long = 52                  ' xlOpenXMLWorkbookMacroEnabled

Public Function UpdateVersion() As String
    UpdateVersion = "1"
End Function

' Versionstext aus dem Kopf des Cockpits („Version 12.90 vom 14.10.2026“) -> "12.90", sonst leer
Public Function VersionVon(wb As Workbook) As String
    Dim t As String, p As Long, teile() As String
    On Error Resume Next
    t = CStr(wb.Worksheets("Cockpit").Range("O2").Value)
    On Error GoTo 0
    p = InStr(1, t, "Version ", vbTextCompare)
    If p = 0 Then Exit Function
    teile = Split(Trim$(Mid$(t, p + 8)), " ")
    If UBound(teile) >= 0 Then VersionVon = teile(0)
End Function

Private Function VersionZahl(v As String) As Long
    Dim t() As String
    t = Split(v, ".")
    If UBound(t) <> 1 Then Exit Function
    If Not IsNumeric(t(0)) Or Not IsNumeric(t(1)) Then Exit Function
    VersionZahl = CLng(t(0)) * 1000 + CLng(t(1))
End Function

Private Function IstMaster(wb As Workbook) As Boolean
    Dim nm As Variant, ws As Worksheet
    For Each nm In Array("Cockpit", "Fakten", "Verlauf", "Ladeprotokoll", "Konfiguration", "Filter", "Snapshot_OPAG", "Snapshot_Verbund", "Umbuchungen")
        Set ws = Nothing
        On Error Resume Next
        Set ws = wb.Worksheets(CStr(nm))
        On Error GoTo 0
        If ws Is Nothing Then Exit Function
    Next nm
    IstMaster = True
End Function

Private Function Bereich(wb As Workbook) As String
    On Error Resume Next
    Bereich = UCase$(Trim$(CStr(wb.Worksheets("Konfiguration").Range("F7").Value)))
    If Len(Bereich) = 0 Then Bereich = "HS"
End Function

' Stichtage im Verlauf (ab Zeile 6, Spalte A) und der letzte davon
Private Function Stichtage(wb As Workbook, ByRef letzter As Date) As Long
    Dim ws As Worksheet, a As Variant, r As Long, n As Long
    Set ws = wb.Worksheets("Verlauf")
    n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If n < 6 Then Exit Function
    a = ws.Range(ws.Cells(6, 1), ws.Cells(n + 1, 1)).Value2
    For r = 1 To UBound(a, 1) - 1
        If Not IsNumeric(a(r, 1)) Or IsEmpty(a(r, 1)) Then Exit For
        If CDbl(a(r, 1)) > CDbl(letzter) Then letzter = CDate(a(r, 1))
        Stichtage = Stichtage + 1
    Next r
End Function

' Die zu aktualisierende Datei suchen und pruefen. Ergebnis leer = in Ordnung (nm = Name in Workbooks, info = Beschreibung
' fuer die Karte), sonst der Grund, warum es nicht geht.
Public Function AlteDateiPruefen(ByRef nm As String, ByRef info As String) As String
    Dim wb As Workbook, gefunden As Collection, namen As String, alt As Workbook, vA As String, vN As String, n As Long, bis As Date
    Set gefunden = New Collection
    For Each wb In Application.Workbooks
        If Not wb Is ThisWorkbook Then
            If IstMaster(wb) Then gefunden.Add wb
        End If
    Next wb
    If gefunden.Count = 0 Then
        AlteDateiPruefen = "Es ist keine andere BÜ-Reporting-Datei geöffnet." & vbLf & vbLf & _
            "Bitte die Datei, die weiter benutzt wird (die ältere Version am gewohnten Ort), zusätzlich in Excel öffnen – " & _
            "„Bearbeitung aktivieren“ klicken, Makros müssen dort nicht laufen – und dann hier erneut „Ältere Datei aktualisieren …“ wählen."
        Exit Function
    End If
    If gefunden.Count > 1 Then
        For Each wb In gefunden
            namen = namen & IIf(Len(namen) > 0, ", ", "") & wb.Name
        Next wb
        AlteDateiPruefen = "Es sind mehrere BÜ-Reporting-Dateien geöffnet (" & namen & "). Bitte nur die Datei offen lassen, die aktualisiert werden soll."
        Exit Function
    End If
    Set alt = gefunden(1)
    vA = VersionVon(alt): vN = VersionVon(ThisWorkbook)
    If Bereich(alt) <> Bereich(ThisWorkbook) Then
        AlteDateiPruefen = alt.Name & " gehört zum Bereich " & Bereich(alt) & ", diese Datei zum Bereich " & Bereich(ThisWorkbook) & _
            ". Bitte die passende neue Fassung herunterladen (HS bzw. Makler)."
        Exit Function
    End If
    If VersionZahl(vA) = 0 Or VersionZahl(vA) < MIN_VERSION Then
        AlteDateiPruefen = alt.Name & " hat Version " & IIf(Len(vA) > 0, vA, "(unbekannt)") & ". Aktualisieren geht ab Version 12.80. " & _
            "Für ältere Dateien: diese neue Datei an den Ort der alten legen, „Neue Daten laden“ und danach die Anwesenheit prüfen."
        Exit Function
    End If
    If VersionZahl(vA) >= VersionZahl(vN) Then
        AlteDateiPruefen = alt.Name & " hat schon Version " & vA & " (diese Datei: " & vN & "). Es gibt nichts zu aktualisieren."
        Exit Function
    End If
    If Len(alt.Path) = 0 Then
        AlteDateiPruefen = alt.Name & " ist noch nie gespeichert worden und hat keinen Ort, an den die neue Version gespeichert werden könnte."
        Exit Function
    End If
    If alt.ReadOnly Then
        AlteDateiPruefen = alt.Name & " ist schreibgeschützt geöffnet – vermutlich hat sie gerade jemand anderes offen, oder sie wurde als " & _
            "Kopie bzw. ohne „Bearbeitung aktivieren“ geöffnet. Ersetzen geht nur, wenn niemand sonst die Datei geöffnet hat."
        Exit Function
    End If
    If Len(Trim$(CStr(alt.Worksheets("Filter").Range("L28").Value))) > 0 Then
        AlteDateiPruefen = "In " & alt.Name & " ist eine Beladung vermerkt (" & CStr(alt.Worksheets("Filter").Range("L28").Value) & "). " & _
            "Bitte warten, bis sie fertig ist. Ist sie abgebrochen: in der alten Datei einmal „Neue Daten laden“ durchlaufen lassen und speichern."
        Exit Function
    End If
    n = Stichtage(alt, bis)
    nm = alt.Name
    info = alt.Name & " · Version " & vA & " · " & n & IIf(n = 1, " Stichtag", " Stichtage") & _
           IIf(n > 0, " bis " & Format$(bis, "dd.mm.yyyy"), "") & vbLf & alt.Path
End Function

' Uebernehmen und unter dem alten Namen speichern. Ergebnis: Meldungstext; fehler = True, wenn etwas schiefging.
Public Function Ausfuehren(nm As String, ByRef fehler As Boolean) As String
    Dim wbA As Workbook, ziel As String, sicherung As String, schritt As String, calc As XlCalculation
    Dim vA As String, vN As String, n As Long, bis As Date, geschlossen As Boolean, neuName As String
    fehler = False
    calc = Application.Calculation
    On Error GoTo Fehler
    schritt = "Datei " & nm & " finden"
    Set wbA = Application.Workbooks(nm)
    ziel = wbA.FullName
    neuName = ThisWorkbook.Name
    vA = VersionVon(wbA): vN = VersionVon(ThisWorkbook)
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual
    schritt = "Sicherung der alten Datei anlegen"
    sicherung = SicherungAnlegen(wbA, vN)
    schritt = "Daten dieser Datei leeren"
    ZielLeeren
    schritt = "Fakten übernehmen": FaktenUebernehmen wbA
    schritt = "Umbuchungen übernehmen": UmbuchungenUebernehmen wbA
    schritt = "Verlauf übernehmen": VerlaufUebernehmen wbA
    schritt = "Ladeprotokoll übernehmen": LadeprotokollUebernehmen wbA
    schritt = "Snapshots übernehmen": SnapshotsUebernehmen wbA
    schritt = "Dateiinhalt übernehmen": DateiinhaltUebernehmen wbA
    schritt = "Mitarbeiter übernehmen"
    KonstantenKopieren wbA.Worksheets("Mitarbeiter"), ThisWorkbook.Worksheets("Mitarbeiter"), "A" & MA_START & ":N" & (MA_START + MA_ZEILEN - 1), True
    KonstantenKopieren wbA.Worksheets("Mitarbeiter"), ThisWorkbook.Worksheets("Mitarbeiter"), "W5:W7", True
    schritt = "Kalender übernehmen": KalenderUebernehmen wbA
    schritt = "Konfiguration übernehmen": KonfigurationUebernehmen wbA
    schritt = "Filter übernehmen"
    KonstantenKopieren wbA.Worksheets("Filter"), ThisWorkbook.Worksheets("Filter"), wbA.Worksheets("Filter").UsedRange.Address, False
    KonstantenKopieren wbA.Worksheets("Filter"), ThisWorkbook.Worksheets("Filter"), "B5:C44", True     ' Postkorbliste genau wie alt
    ThisWorkbook.Worksheets("Filter").Range("L28:L29").ClearContents        ' Beladungsvermerk
    schritt = "ausgeblendete Rohdateien übernehmen": SpListeUebernehmen wbA
    schritt = "Celonis-Liste übernehmen": CelonisUebernehmen wbA
    n = Stichtage(ThisWorkbook, bis)

    schritt = "Kennzahlen und Diagramme neu berechnen"
    Application.Calculation = xlCalculationAutomatic
    modLaden.EinheitenNamenSetzen
    modCockpit.BezugFormelSetzen
    Application.Calculate
    modCockpit.FilterAnzeigen
    modCockpit.DiagrammeAnpassen True
    modWerkzeuge.EinheitKnopfBeschriften
    ThisWorkbook.Worksheets("Cockpit").Activate

    schritt = "alte Datei schließen"
    wbA.Close SaveChanges:=False
    Set wbA = Nothing
    geschlossen = True
    schritt = "unter dem alten Namen speichern"
    Application.DisplayAlerts = False
    ThisWorkbook.SaveAs Filename:=ziel, FileFormat:=XL_XLSM
    Application.DisplayAlerts = True
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Application.Calculation = calc

    Ausfuehren = ThisWorkbook.Name & " ist jetzt Version " & vN & " (vorher " & vA & ") – mit allen Daten: " & n & _
        IIf(n = 1, " Stichtag", " Stichtage") & IIf(n > 0, " bis " & Format$(bis, "dd.mm.yyyy"), "") & _
        ", Anwesenheit, Standard, SLA und Einstellungen. Name und Ort sind gleich geblieben, Verknüpfungen anderer Dateien gelten weiter." & vbLf & vbLf & _
        "Die heruntergeladene Datei " & neuName & " ist unverändert und kann gelöscht werden." & vbLf & _
        IIf(Len(sicherung) > 0, "Sicherung der alten Fassung: " & sicherung, "Die alte Fassung steht im Versionsverlauf von SharePoint.")
    Exit Function

Fehler:
    Dim text As String
    text = "Fehler " & Err.Number & ": " & Err.Description & vbLf & "Schritt: " & schritt
    On Error Resume Next
    Application.DisplayAlerts = True
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    Application.Calculation = calc
    fehler = True
    If geschlossen Then
        Ausfuehren = "Die Daten sind übernommen, aber das Speichern unter dem alten Namen ging nicht." & vbLf & text & vbLf & vbLf & _
            "Die alte Datei ist geschlossen und unverändert. Entweder hat sie inzwischen jemand anderes geöffnet (dann später erneut " & _
            "versuchen: alte Datei öffnen, hier wieder „Ältere Datei aktualisieren …“), oder diese Datei jetzt mit „Speichern unter“ " & _
            "genau als " & ziel & " speichern und die alte Datei ersetzen."
    Else
        Ausfuehren = "Aktualisieren abgebrochen – die alte Datei ist unverändert." & vbLf & text & vbLf & vbLf & _
            "Diese Datei bitte schließen, ohne zu speichern."
    End If
End Function

' ---------------------------------------------------------------- Sicherung
Private Function SicherungAnlegen(wbA As Workbook, vN As String) As String
    Dim ordner As String, basis As String, sep As String, ziel As String
    If modLaden.IstUrl(wbA.FullName) Then Exit Function          ' SharePoint ohne Dateipfad: Versionsverlauf
    sep = Application.PathSeparator
    ordner = wbA.Path & sep & "Protokolle"
    If Len(Dir(ordner, vbDirectory)) = 0 Then MkDir ordner
    ordner = ordner & sep & "Sicherung"
    If Len(Dir(ordner, vbDirectory)) = 0 Then MkDir ordner
    basis = Left$(wbA.Name, InStrRev(wbA.Name, ".") - 1)
    ziel = ordner & sep & basis & "_vor_" & vN & "_" & Format$(Now, "yyyymmdd_hhnn") & Mid$(wbA.Name, InStrRev(wbA.Name, "."))
    wbA.SaveCopyAs ziel
    SicherungAnlegen = ziel
End Function

' ---------------------------------------------------------------- Ziel leeren (falls diese Datei schon geladen wurde)
Private Sub ZielLeeren()
    Dim ws As Worksheet, n As Long, q As Variant
    Set ws = ThisWorkbook.Worksheets("Fakten")
    n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If n >= 2 Then
        ws.Range(ws.Cells(2, 1), ws.Cells(n, 15)).ClearContents
        ws.Range(ws.Cells(2, 18), ws.Cells(n, 22)).ClearContents
    End If
    If n >= 3 Then ws.Range(ws.Cells(3, 16), ws.Cells(n, 17)).ClearContents          ' Zeile 2 bleibt Formelvorlage
    Set ws = ThisWorkbook.Worksheets("Umbuchungen")
    n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If n >= 2 Then
        ws.Range(ws.Cells(2, 1), ws.Cells(n, 10)).ClearContents
        ws.Range(ws.Cells(2, 17), ws.Cells(n, 19)).ClearContents
    End If
    If n >= 3 Then ws.Range(ws.Cells(3, 11), ws.Cells(n, 16)).ClearContents
    Set ws = ThisWorkbook.Worksheets("Verlauf")
    n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If n >= 7 Then ws.Rows("7:" & n).ClearContents
    ws.Range("A6").ClearContents
    ws.Range("AL6").Value = 1: ws.Range("AM6").Value = 1
    Set ws = ThisWorkbook.Worksheets("Ladeprotokoll")
    n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If n >= 5 Then ws.Range(ws.Cells(5, 1), ws.Cells(n, 11)).ClearContents
    For Each q In Array("Snapshot_OPAG", "Snapshot_Verbund")
        Set ws = ThisWorkbook.Worksheets(CStr(q))
        ws.Range(ws.Cells(2, 1), ws.Cells(ws.Rows.Count, 6)).ClearContents
        ws.Range("H2:H3").ClearContents
        ws.Range(ws.Cells(2, 10), ws.Cells(SNAP_ZEILEN, 12)).ClearContents
    Next q
    Set ws = Blatt(ThisWorkbook, "Dateiinhalt")
    If Not ws Is Nothing Then
        n = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
        If n >= 5 Then ws.Range(ws.Cells(5, 1), ws.Cells(n, 9)).ClearContents
    End If
End Sub

Private Function Blatt(wb As Workbook, nm As String) As Worksheet
    On Error Resume Next
    Set Blatt = wb.Worksheets(nm)
End Function

Private Function Letzte(ws As Worksheet, spalte As Long) As Long
    Letzte = ws.Cells(ws.Rows.Count, spalte).End(xlUp).Row
End Function

' Werte eines Blocks 1:1 (Zeilen r0..r1, Spalten c1..c2)
Private Sub Block(wsA As Worksheet, wsN As Worksheet, r0 As Long, r1 As Long, c1 As Long, c2 As Long)
    If r1 < r0 Then Exit Sub
    wsN.Range(wsN.Cells(r0, c1), wsN.Cells(r1, c2)).Value2 = wsA.Range(wsA.Cells(r0, c1), wsA.Cells(r1, c2)).Value2
End Sub

' Formel der Vorlagezeile (Zeile 2) in die Zeilen 3..r1 einer Spalte
Private Sub FormelFortschreiben(ws As Worksheet, spalte As Long, r1 As Long)
    If r1 < 3 Then Exit Sub
    ws.Range(ws.Cells(3, spalte), ws.Cells(r1, spalte)).FormulaR1C1 = ws.Cells(2, spalte).FormulaR1C1
End Sub

' ---------------------------------------------------------------- Bloecke
Private Sub FaktenUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long
    Set wsA = wbA.Worksheets("Fakten"): Set wsN = ThisWorkbook.Worksheets("Fakten")
    n = Letzte(wsA, 1)
    If n < 2 Then Exit Sub
    wsN.Range(wsN.Cells(2, 1), wsN.Cells(n, 1)).NumberFormat = "dd.mm.yyyy"
    wsN.Range(wsN.Cells(2, 21), wsN.Cells(n, 21)).NumberFormat = "@"                 ' U: Schluessel des aeltesten Datensatzes
    Block wsA, wsN, 2, n, 1, 15                                                       ' A..O
    Block wsA, wsN, 2, n, 18, 22                                                      ' R..V Einheit, Strang, Alter, Vorgang, Alterssumme
    FormelFortschreiben wsN, 16, n                                                    ' P Aktiv
    FormelFortschreiben wsN, 17, n                                                    ' Q Standard
End Sub

Private Sub UmbuchungenUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long, c As Long
    Set wsA = wbA.Worksheets("Umbuchungen"): Set wsN = ThisWorkbook.Worksheets("Umbuchungen")
    n = Letzte(wsA, 1)
    If n < 2 Then Exit Sub
    wsN.Range(wsN.Cells(2, 1), wsN.Cells(n, 1)).NumberFormat = "dd.mm.yyyy"
    Block wsA, wsN, 2, n, 1, 10
    Block wsA, wsN, 2, n, 17, 19
    For c = 11 To 16
        FormelFortschreiben wsN, c, n
    Next c
End Sub

' Verlauf: Zeile 6 der neuen Version (Formeln) fuer jeden Stichtag fortschreiben, dann A (Stichtag), AL/AM (Blockgrenzen) setzen
Private Sub VerlaufUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long, a As Variant, r As Long, k As Long
    Set wsA = wbA.Worksheets("Verlauf"): Set wsN = ThisWorkbook.Worksheets("Verlauf")
    n = Letzte(wsA, 1)
    If n < 6 Then Exit Sub
    a = wsA.Range(wsA.Cells(6, 1), wsA.Cells(n + 1, 1)).Value2
    For r = 1 To UBound(a, 1) - 1
        If Not IsNumeric(a(r, 1)) Or IsEmpty(a(r, 1)) Then Exit For
        k = k + 1
    Next r
    If k = 0 Then Exit Sub
    If k > 1 Then wsN.Rows(6).Copy wsN.Rows("7:" & (5 + k))
    Application.CutCopyMode = False
    Block wsA, wsN, 6, 5 + k, 1, 1
    Block wsA, wsN, 6, 5 + k, 38, 39
End Sub

Private Sub LadeprotokollUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long
    Set wsA = wbA.Worksheets("Ladeprotokoll"): Set wsN = ThisWorkbook.Worksheets("Ladeprotokoll")
    n = Letzte(wsA, 1)
    If n < 5 Then Exit Sub
    Block wsA, wsN, 5, n, 1, 11
    wsN.Range(wsN.Cells(5, 1), wsN.Cells(n, 1)).NumberFormat = "dd.mm.yyyy hh:mm"
    wsN.Range(wsN.Cells(5, 5), wsN.Cells(n, 5)).NumberFormat = "dd.mm.yyyy"
End Sub

Private Sub SnapshotsUebernehmen(wbA As Workbook)
    Dim q As Variant, wsA As Worksheet, wsN As Worksheet, n As Long
    For Each q In Array("Snapshot_OPAG", "Snapshot_Verbund")
        Set wsA = wbA.Worksheets(CStr(q)): Set wsN = ThisWorkbook.Worksheets(CStr(q))
        n = Letzte(wsA, 1)
        Block wsA, wsN, 2, n, 1, 6
        Block wsA, wsN, 2, 3, 8, 8                                                    ' H2 Stichtag, H3 Anzahl (Bereich HS)
        Block wsA, wsN, 2, SNAP_ZEILEN, 10, 12                                        ' J..L je Einheit (Bereich MAKLER)
        wsN.Range("H2").NumberFormat = "dd.mm.yyyy"
        wsN.Range(wsN.Cells(2, 11), wsN.Cells(SNAP_ZEILEN, 11)).NumberFormat = "dd.mm.yyyy"
    Next q
End Sub

Private Sub DateiinhaltUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long, c As Variant
    Set wsA = Blatt(wbA, "Dateiinhalt"): Set wsN = Blatt(ThisWorkbook, "Dateiinhalt")
    If wsA Is Nothing Or wsN Is Nothing Then Exit Sub                                 ' vor 12.88: neu pruefen beim naechsten Laden
    n = Letzte(wsA, 1)
    If n >= 5 Then
        For Each c In Array(1, 2, 3, 6, 8)                                            ' Datei, Kennung, Blatt, Einheit, Einheiten: Text
            wsN.Range(wsN.Cells(5, c), wsN.Cells(n, c)).NumberFormat = "@"
        Next c
        Block wsA, wsN, 5, n, 1, 9
        wsN.Range(wsN.Cells(5, 5), wsN.Cells(n, 5)).NumberFormat = "dd.mm.yyyy"
        wsN.Range(wsN.Cells(5, 9), wsN.Cells(n, 9)).NumberFormat = "dd.mm.yyyy hh:mm"
    End If
    wsN.Range("J2").Value = "'" & CStr(wsA.Range("J2").Value)                         ' Fingerabdruck der Einheiten-Zuordnung
End Sub

' Kalender: Eintraege je Mitarbeiterzeile, Spalten ueber das Datum in Zeile 6 zugeordnet (der Planungshorizont kann wachsen)
Private Sub KalenderUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, cA As Long, cN As Long, dA As Variant, dN As Variant, spalte As Object, c As Long, r As Long
    Dim fA As Variant, vA As Variant, fN As Variant, vN As Variant, rEnde As Long, ziel As Long
    Set wsA = wbA.Worksheets("Kalender"): Set wsN = ThisWorkbook.Worksheets("Kalender")
    cA = wsA.Cells(6, wsA.Columns.Count).End(xlToLeft).Column
    cN = wsN.Cells(6, wsN.Columns.Count).End(xlToLeft).Column
    If cA < KAL_SPALTE0 Or cN < KAL_SPALTE0 Then Exit Sub
    dN = wsN.Range(wsN.Cells(6, 1), wsN.Cells(6, cN)).Value2
    Set spalte = CreateObject("Scripting.Dictionary")
    For c = KAL_SPALTE0 To cN
        If IsNumeric(dN(1, c)) And Not IsEmpty(dN(1, c)) Then spalte(CLng(dN(1, c))) = c
    Next c
    dA = wsA.Range(wsA.Cells(6, 1), wsA.Cells(6, cA)).Value2
    rEnde = KAL_ERSTE + MA_ZEILEN - 1
    fA = wsA.Range(wsA.Cells(KAL_ERSTE, 1), wsA.Cells(rEnde, cA)).Formula
    vA = wsA.Range(wsA.Cells(KAL_ERSTE, 1), wsA.Cells(rEnde, cA)).Value2
    fN = wsN.Range(wsN.Cells(KAL_ERSTE, 1), wsN.Cells(rEnde, cN)).Formula
    vN = wsN.Range(wsN.Cells(KAL_ERSTE, 1), wsN.Cells(rEnde, cN)).Value2
    For c = KAL_SPALTE0 To cA
        If IsNumeric(dA(1, c)) And Not IsEmpty(dA(1, c)) Then
            If spalte.Exists(CLng(dA(1, c))) Then
                ziel = spalte(CLng(dA(1, c)))
                For r = 1 To MA_ZEILEN
                    If CStr(vN(r, ziel)) <> "FT" Then ZelleSetzen wsN.Cells(KAL_ERSTE + r - 1, ziel), fA(r, c), vA(r, c), fN(r, ziel), vN(r, ziel), True
                Next r
            End If
        End If
    Next c
End Sub

Private Sub KonfigurationUebernehmen(wbA As Workbook)
    Dim adr As Variant
    ' Einstellungen B3:B9, SLA F3:F4, Bereich und Celonis ab F7:F8, Sparten A11:B40, BUe-Schluessel D11:D40, Standard I11:I50 und
    ' L11:L24, Einheiten Q11:R40 (nur Eingabezellen; Formeln und Beschriftungen kommen aus der neuen Version). Die Feiertage
    ' (N11:O60) pflegt der Build – sie kommen aus der neuen Version.
    For Each adr In Array("B3:B9", "F3:F4", "F7:F8", "A11:B40", "D11:D40", "I11:I50", "L11:L24", "Q11:R40")
        KonstantenKopieren wbA.Worksheets("Konfiguration"), ThisWorkbook.Worksheets("Konfiguration"), CStr(adr), True
    Next adr
End Sub

' Werte (keine Formeln) eines Bereichs in dieselben Zellen der neuen Datei: geschrieben wird nur, wenn die Zelle in beiden Dateien
' keine Formel ist und sich der Wert unterscheidet. leer = True: eine leere Zelle der alten Datei leert auch die neue (Eingabe-
' bereiche); False: leere Zellen der alten Datei lassen die neue stehen (Filter – dort kann die neue Version Vorgaben mitbringen).
Private Sub KonstantenKopieren(wsA As Worksheet, wsN As Worksheet, adresse As String, leer As Boolean)
    Dim fA As Variant, vA As Variant, fN As Variant, vN As Variant, r As Long, c As Long, rgA As Range, rgN As Range
    Set rgA = wsA.Range(adresse)
    Set rgN = wsN.Range(adresse)
    If rgA.Cells.Count = 1 Then
        ZelleSetzen rgN, rgA.Formula, rgA.Value2, rgN.Formula, rgN.Value2, leer
        Exit Sub
    End If
    fA = rgA.Formula: vA = rgA.Value2
    fN = rgN.Formula: vN = rgN.Value2
    For r = 1 To UBound(fA, 1)
        For c = 1 To UBound(fA, 2)
            ZelleSetzen rgN.Cells(r, c), fA(r, c), vA(r, c), fN(r, c), vN(r, c), leer
        Next c
    Next r
End Sub

Private Sub ZelleSetzen(ziel As Range, formelA As Variant, wertA As Variant, formelN As Variant, wertN As Variant, leer As Boolean)
    If Left$(CStr(formelN), 1) = "=" Then Exit Sub                                   ' Formel der neuen Version bleibt
    If Left$(CStr(formelA), 1) = "=" Then Exit Sub                                   ' alt berechnet: nichts zu uebernehmen
    If IsError(wertA) Or IsError(wertN) Then Exit Sub
    If IsEmpty(wertA) Then
        If leer And Not IsEmpty(wertN) Then ziel.ClearContents
        Exit Sub
    End If
    If Not IsEmpty(wertN) Then
        If VarType(wertA) = VarType(wertN) Then
            If wertA = wertN Then Exit Sub
        End If
    End If
    If VarType(wertA) = vbString Then
        If IsNumeric(wertA) Or Left$(CStr(wertA), 1) = "=" Then ziel.Value = "'" & wertA Else ziel.Value = wertA
    Else
        ziel.Value2 = wertA
    End If
End Sub

' SP_Liste!J:K – Rohdateien, die im SharePoint-Modus im Tool ausgeblendet sind
Private Sub SpListeUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long
    Set wsA = Blatt(wbA, "SP_Liste")
    If wsA Is Nothing Then Exit Sub
    n = Letzte(wsA, 10)
    If n < 2 Then Exit Sub
    Set wsN = LaufzeitBlatt("SP_Liste")
    wsN.Range("J1").Value = "Im Tool ausgeblendete Rohdateien (SharePoint: gelöscht oder nicht übernommen)"
    wsN.Range(wsN.Cells(2, 10), wsN.Cells(wsN.Rows.Count, 11)).ClearContents
    wsN.Range(wsN.Cells(2, 10), wsN.Cells(n, 10)).NumberFormat = "@"
    Block wsA, wsN, 2, n, 10, 11
End Sub

' Celonis_Log: offene Uebergaben (F:I) und Eintraege (A:D)
Private Sub CelonisUebernehmen(wbA As Workbook)
    Dim wsA As Worksheet, wsN As Worksheet, n As Long
    Set wsA = Blatt(wbA, "Celonis_Log")
    If wsA Is Nothing Then Exit Sub
    n = Letzte(wsA, 1)
    If Letzte(wsA, 6) > n Then n = Letzte(wsA, 6)
    If n < 1 Then Exit Sub
    Set wsN = LaufzeitBlatt("Celonis_Log")
    wsN.Range(wsN.Cells(1, 1), wsN.Cells(wsN.Rows.Count, 9)).ClearContents
    wsN.Range(wsN.Cells(1, 2), wsN.Cells(n, 2)).NumberFormat = "@"
    wsN.Range(wsN.Cells(1, 6), wsN.Cells(n, 7)).NumberFormat = "@"
    Block wsA, wsN, 1, n, 1, 9
End Sub

' verstecktes Blatt, das das Tool sonst erst bei Bedarf anlegt (SP_Liste, Celonis_Log)
Private Function LaufzeitBlatt(nm As String) As Worksheet
    Dim ws As Worksheet, akt As Object
    Set ws = Blatt(ThisWorkbook, nm)
    If ws Is Nothing Then
        Set akt = ActiveSheet
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = nm
        ws.Visible = xlSheetVeryHidden
        If Not akt Is Nothing Then akt.Activate
    End If
    Set LaufzeitBlatt = ws
End Function
