Option Explicit
' ============================================================================
' modWerkzeuge – Karten (Formen, ohne UserForm) fuer die Werkzeug-Knoepfe im Cockpit
'   SLA anpassen …      Konfiguration!F3 (SLA Verbund, 0 = keine Linie) und F4 (SLA OPAG, leer = Vorschlag) eingeben
'   Einheit …           nur Bereich MAKLER, nur Dateien vor 12.70 (Knopf BTN_Einheit, seither entfernt): Gesamt (Standard) oder
'                       eine Einheit (Filter!L16); Fakten!P und Umbuchungen!K/L zaehlen dann nur Zeilen dieser Einheit
'   Rohdaten löschen …  Dateien im Ordner Rohdaten (und der Monatsablage) auswaehlen und endgueltig loeschen; auf Wunsch
'                       danach das Tool aus den uebrigen Dateien neu aufbauen
'   Zurücksetzen …      alle geladenen Staende leeren (modLaden.ToolLeeren), optional auch die Anwesenheit
'   Sparte | Einheit    nur Bereich MAKLER: Chips in der Kopfleiste „Rückstand OPAG“; Filter!L19 schaltet die Stapel beider
'                       Rueckstandsdiagramme (Cockpit und Folie) zwischen Sparten und Einheiten (Namen Filter!L22:L25) um
' Bausteine (Karte, Beschriftung, Knopf, Pille) kommen aus modTagesablauf; alle Formen tragen den Praefix TAGW_ und
' verschwinden mit modTagesablauf.KartenEntfernen. Klicks loeschen die geklickte Form nie im eigenen Makro (OnTime).
' ============================================================================

Private Const PRAEFIX As String = "TAGW_"
Private Const SCHRIFT As String = "Liberation Sans"
Private Const SEITE As Long = 10                    ' Rohdateien je Seite

Private Const C_TEAL As Long = 8220427              ' RGB(11, 111, 125)
Private Const C_ROT As Long = 2627007               ' RGB(191, 21, 40)
Private Const C_SW As Long = 1710618                ' RGB(26, 26, 26)
Private Const C_GRAU As Long = 7039851              ' RGB(107, 107, 107)
Private Const C_GRAUL As Long = 14341584            ' RGB(208, 213, 218)
Private Const C_GRAUXL As Long = 16184563           ' RGB(243, 244, 246)
Private Const C_GELBD As Long = 23178               ' RGB(138, 90, 0)
Private Const C_GELBH As Long = 13103099            ' RGB(251, 239, 199)
Private Const C_ROTH As Long = 15460859             ' RGB(251, 233, 235)

Private kx As Single, ky As Single, kb As Single, kh As Single
Private einheiten As Variant                        ' Auswahl der Einheiten-Karte (0 = Gesamt)
Private klickNr As Long
Private dateien As Variant                          ' Rohdateien (relative Pfade)
Private gewaehlt() As Boolean
Private geladen() As Boolean
Private seiteNr As Long
Private mitAnwesenheit As Boolean
Private updateName As String                        ' Aeltere Datei aktualisieren: Name der geoeffneten alten Master-Datei

Public Function WerkzeugeVersion() As String
    WerkzeugeVersion = "1"
End Function

Private Sub Planen(prozedur As String)
    On Error Resume Next
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modWerkzeuge." & prozedur
    On Error GoTo 0
End Sub

Private Function Bereit() As Boolean
    If modLaden.LadenLaeuft() Then Exit Function
    On Error Resume Next
    modTagesablauf.KartenEntfernen
    modFortschritt.HinweisEntfernen
    ThisWorkbook.Worksheets("Cockpit").Activate
    On Error GoTo 0
    Bereit = True
End Function

Public Sub Schliessen()
    modTagesablauf.KartenEntfernen
End Sub

Public Sub KlickSchliessen()
    Planen "Schliessen"
End Sub

Private Sub Ueberschrift(ws As Worksheet, marke As String, frage As String)
    modTagesablauf.Beschriftung ws, "Schritt", kx + 28, ky + 22, kb - 56, 14, marke, 8, True, C_TEAL
    modTagesablauf.Beschriftung ws, "Frage", kx + 28, ky + 42, kb - 56, 24, frage, 15, True, C_SW
End Sub

' Rechteck mit Text und Makro (Zeilen der Dateiliste, Umschalter)
Private Sub Zeile(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, an As Boolean, makro As String, _
                  Optional groesse As Single = 9)
    On Error Resume Next
    ws.Shapes(PRAEFIX & nm).Delete
    On Error GoTo 0
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.2
        If an Then
            .Fill.ForeColor.RGB = C_TEAL
            .Line.Visible = msoFalse
        Else
            .Fill.ForeColor.RGB = RGB(255, 255, 255)
            .Line.ForeColor.RGB = C_GRAUL
            .Line.Weight = 1
        End If
        .OnAction = makro
        With .TextFrame2
            .MarginLeft = 10: .MarginRight = 10: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = groesse
            .TextRange.Font.Bold = IIf(an, msoTrue, msoFalse)
            .TextRange.Font.Fill.ForeColor.RGB = IIf(an, RGB(255, 255, 255), C_SW)
            .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        End With
    End With
End Sub

' Eingabefeld: Textfeld ohne Makro (Klick hinein, tippen)
Private Sub Eingabe(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String)
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = PRAEFIX & nm
        .Fill.ForeColor.RGB = RGB(255, 255, 255)
        .Line.ForeColor.RGB = C_TEAL
        .Line.Weight = 1.25
        With .TextFrame2
            .MarginLeft = 10: .MarginRight = 10: .MarginTop = 2: .MarginBottom = 2
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 12
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = C_SW
            .TextRange.ParagraphFormat.Alignment = msoAlignRight
        End With
    End With
End Sub

Private Function FeldText(ws As Worksheet, nm As String) As String
    On Error Resume Next
    FeldText = Trim$(ws.Shapes(PRAEFIX & nm).TextFrame2.TextRange.Text)
    On Error GoTo 0
End Function

Private Function Wert(v As Variant) As Double
    If IsNumeric(v) And Not IsEmpty(v) Then Wert = CDbl(v)
End Function

' "5.500" / "5500" / "5 500" -> 5500; leer -> -1; keine Zahl -> -2
Private Function ZahlLesen(t As String) As Double
    Dim s As String, i As Long
    s = Replace(Replace(Replace(Trim$(t), ".", ""), " ", ""), Chr(160), "")
    s = Replace(s, ",", ".")
    If Len(s) = 0 Then ZahlLesen = -1: Exit Function
    For i = 1 To Len(s)
        If InStr("0123456789.", Mid$(s, i, 1)) = 0 Then ZahlLesen = -2: Exit Function
    Next i
    ZahlLesen = Round(Val(s), 0)
End Function

' ============================================================================ SLA anpassen
Public Sub SlaZeigen()
    Dim ws As Worksheet, wsK As Worksheet, v As Variant, vorschlag As String
    If Not Bereit() Then Exit Sub
    Set ws = ActiveSheet
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    kb = 520: kh = 330
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "VORGABEN  ·  SLA", "SLA anpassen"
    modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 72, kb - 56, 30, _
        "Die SLA erscheint als gestrichelte Linie in den Rückstandsdiagrammen. 0 oder leer = keine Linie.", 9.5, False, C_GRAU, True
    modTagesablauf.Beschriftung ws, "L1", kx + 28, ky + 118, 260, 16, "Rückstand Verbund (Vorgänge)", 10.5, True, C_SW
    modTagesablauf.Beschriftung ws, "L1u", kx + 28, ky + 136, 260, 14, "Konfiguration F3", 8, False, C_GRAU
    v = wsK.Range("F3").Value
    Eingabe ws, "E_Verbund", kx + kb - 28 - 150, ky + 116, 150, 30, CStr(IIf(Wert(v) > 0, modLaden.ZahlDE(Wert(v)), ""))
    modTagesablauf.Beschriftung ws, "L2", kx + 28, ky + 170, 260, 16, "Rückstand OPAG (Arbeitsgüter)", 10.5, True, C_SW
    vorschlag = CStr(wsK.Range("D5").Value)
    modTagesablauf.Beschriftung ws, "L2u", kx + 28, ky + 188, kb - 56 - 170, 26, "Konfiguration F4 · " & vorschlag, 8, False, C_GRAU, True
    v = wsK.Range("F4").Value
    Eingabe ws, "E_OPAG", kx + kb - 28 - 150, ky + 168, 150, 30, CStr(IIf(Wert(v) > 0, modLaden.ZahlDE(Wert(v)), ""))
    modTagesablauf.Beschriftung ws, "Fehler", kx + 28, ky + 226, kb - 56, 16, "", 9, True, C_ROT
    modTagesablauf.Beschriftung ws, "Tipp", kx + 28, ky + 244, kb - 56, 16, "In ein Feld klicken, Zahl eingeben, dann „Speichern“.", 8.5, False, C_GRAU
    modTagesablauf.Knopf ws, "Speichern", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Speichern", 1, "modWerkzeuge.KlickSlaSpeichern"
    modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modWerkzeuge.KlickSchliessen"
End Sub

Public Sub KlickSlaSpeichern()
    Planen "SlaSpeichern"
End Sub

Public Sub SlaSpeichern()
    Dim ws As Worksheet, wsK As Worksheet, vb As Double, vo As Double
    Set ws = ActiveSheet
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    vb = ZahlLesen(FeldText(ws, "E_Verbund"))
    vo = ZahlLesen(FeldText(ws, "E_OPAG"))
    If vb = -2 Or vo = -2 Then
        On Error Resume Next
        ws.Shapes(PRAEFIX & "Fehler").TextFrame2.TextRange.Text = "Bitte nur ganze Zahlen eingeben (z. B. 5.500)."
        On Error GoTo 0
        Exit Sub
    End If
    If vb < 0 Then vb = 0
    wsK.Range("F3").Value = vb
    If vo <= 0 Then wsK.Range("F4").ClearContents Else wsK.Range("F4").Value = vo
    modTagesablauf.KartenEntfernen
    Application.Calculate
    modCockpit.DiagrammeAnpassen True
    modFortschritt.HinweisZeigen "SLA gespeichert", "SLA Verbund: " & IIf(vb > 0, modLaden.ZahlDE(vb), "keine Linie") & _
        " · SLA OPAG: " & IIf(vo > 0, modLaden.ZahlDE(vo), "Vorschlag aus Verbund") & ".", False
End Sub

' ============================================================================ Einheit (Bereich MAKLER)
Public Sub EinheitZeigen()
    Dim ws As Worksheet, liste As Variant, i As Long, n As Long, aktuell As String, b As Single, x As Single, y As Single, t As String
    If Not Bereit() Then Exit Sub
    Set ws = ActiveSheet
    liste = modLaden.EinheitenListe()
    n = UBound(liste) - LBound(liste) + 1
    If n < 0 Then n = 0
    ReDim einheiten(0 To n)
    einheiten(0) = "Gesamt"
    For i = 1 To n
        einheiten(i) = liste(LBound(liste) + i - 1)
    Next i
    aktuell = CStr(ThisWorkbook.Worksheets("Filter").Range("L16").Value)
    If Len(aktuell) = 0 Then aktuell = "Gesamt"
    kb = 520: kh = 190 + 38 * Int((n + 2) / 2)
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "ANSICHT  ·  EINHEIT", "Welche Einheit anzeigen?"
    modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 72, kb - 56, 30, _
        "Gesamt zeigt alle Einheiten zusammen (Standard). Eine Einheit filtert Rückstand, Eingänge und Abgänge; MAK und Produktivität bleiben Gesamtwerte.", _
        9, False, C_GRAU, True
    b = (kb - 56 - 10) / 2
    For i = 0 To n
        x = kx + 28 + (i Mod 2) * (b + 10)
        y = ky + 112 + (i \ 2) * 38
        t = CStr(IIf(i = 0, "Gesamt (alle Einheiten)", einheiten(i)))
        Zeile ws, "E" & Format(i, "00"), x, y, b, 30, t, (CStr(einheiten(i)) = aktuell), "modWerkzeuge.KlickEinheit", 10
    Next i
    If n = 0 Then modTagesablauf.Beschriftung ws, "Leer", kx + 28, ky + 152, kb - 56, 16, "Noch keine Einheiten geladen – erst „Neue Daten laden“.", 9, False, C_GRAU
    modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Schließen", 3, "modWerkzeuge.KlickSchliessen"
End Sub

Public Sub KlickEinheit()
    Dim nm As String
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    If InStr(nm, PRAEFIX & "E") <> 1 Then Exit Sub
    klickNr = CLng(Val(Mid$(nm, Len(PRAEFIX) + 2, 2)))
    Planen "EinheitSetzen"
End Sub

Public Sub EinheitSetzen()
    Dim wert As String
    If IsEmpty(einheiten) Then Exit Sub
    If klickNr < 0 Or klickNr > UBound(einheiten) Then Exit Sub
    wert = CStr(einheiten(klickNr))
    modTagesablauf.KartenEntfernen
    ThisWorkbook.Worksheets("Filter").Range("L16").Value = wert
    EinheitKnopfBeschriften
    Application.Calculate
    modCockpit.DiagrammeAnpassen True
End Sub

' Text des Cockpit-Knopfs "Einheit: …" nach Filter!L16 (nur Dateien vor 12.70; fehlt der Knopf, nur SichtFaerben)
Public Sub EinheitKnopfBeschriften()
    Dim wert As String
    wert = CStr(ThisWorkbook.Worksheets("Filter").Range("L16").Value)
    If Len(wert) = 0 Then wert = "Gesamt"
    On Error Resume Next
    ThisWorkbook.Worksheets("Cockpit").Shapes("BTN_Einheit").TextFrame2.TextRange.Text = "Einheit: " & wert
    On Error GoTo 0
    SichtFaerben
End Sub

' ============================================================================ Sicht Sparte | Einheit (Bereich MAKLER)
Public Sub SichtSparte()
    SichtSetzen "Sparte"
End Sub

Public Sub SichtEinheit()
    SichtSetzen "Einheit"
End Sub

Private Sub SichtSetzen(wert As String)
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L19").Value = wert
    SichtFaerben
    Application.Calculate
    modCockpit.DiagrammeAnpassen True
End Sub

' Chips wie die Bookmark-Chips: aktiv = weiss mit Schrift in der Kopffarbe (OPAG rot), inaktiv = Kopffarbe mit weisser Schrift
Public Sub SichtFaerben()
    Dim einheit As Boolean, nm As Variant, aktiv As Boolean, shp As Shape
    einheit = (CStr(ThisWorkbook.Worksheets("Filter").Range("L19").Value) = "Einheit")
    On Error Resume Next
    For Each nm In Array("BWS_Sparte", "BWS_Einheit")
        Set shp = Nothing
        Set shp = ThisWorkbook.Worksheets("Cockpit").Shapes(CStr(nm))
        If Not shp Is Nothing Then
            aktiv = (einheit = (nm = "BWS_Einheit"))
            shp.Fill.Visible = msoTrue
            shp.Fill.Solid
            shp.Line.Visible = msoTrue
            shp.Line.ForeColor.RGB = RGB(255, 255, 255)
            shp.Fill.ForeColor.RGB = IIf(aktiv, RGB(255, 255, 255), RGB(142, 15, 30))
            shp.TextFrame2.TextRange.Font.Fill.ForeColor.RGB = IIf(aktiv, RGB(142, 15, 30), RGB(255, 255, 255))
            shp.TextFrame2.TextRange.Font.Bold = IIf(aktiv, msoTrue, msoFalse)
        End If
    Next nm
    On Error GoTo 0
End Sub

' ============================================================================ Rohdaten löschen
Public Sub RohdatenZeigen()
    Dim i As Long, n As Long
    If Not Bereit() Then Exit Sub
    dateien = modLaden.RohdateienListe()
    n = UBound(dateien) - LBound(dateien) + 1
    If n < 0 Then n = 0
    If n > 0 Then
        ReDim gewaehlt(0 To n - 1)
        ReDim geladen(0 To n - 1)
        For i = 0 To n - 1
            geladen(i) = modLaden.RohdateiGeladen(CStr(dateien(i)))
        Next i
    End If
    seiteNr = 0
    RohdatenZeichnen
End Sub

Private Function DateiAnzahl() As Long
    If IsEmpty(dateien) Then Exit Function
    DateiAnzahl = UBound(dateien) - LBound(dateien) + 1
    If DateiAnzahl < 0 Then DateiAnzahl = 0
End Function

Private Function AnzahlGewaehlt() As Long
    Dim i As Long
    For i = 0 To DateiAnzahl() - 1
        If gewaehlt(i) Then AnzahlGewaehlt = AnzahlGewaehlt + 1
    Next i
End Function

Private Sub RohdatenZeichnen()
    Dim ws As Worksheet, n As Long, seiten As Long, i As Long, y As Single
    modTagesablauf.KartenEntfernen
    Set ws = ActiveSheet
    n = DateiAnzahl()
    seiten = Int((n + SEITE - 1) / SEITE)
    If seiten < 1 Then seiten = 1
    If seiteNr > seiten - 1 Then seiteNr = seiten - 1
    kb = 640: kh = 196 + SEITE * 32
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "DATEN  ·  ROHDATEN", "Rohdateien löschen"
    modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 28, _
        "Dateien im Ordner Rohdaten und in der Monatsablage, neueste oben. Klick wählt eine Datei aus oder ab. „geladen“ = aus der Datei ist ein Stand im Tool.", _
        9, False, C_GRAU, True
    If n = 0 Then
        modTagesablauf.Beschriftung ws, "Leer", kx + 28, ky + 112, kb - 56, 16, "Keine Excel-Dateien im Ordner Rohdaten.", 10, False, C_GRAU
    End If
    For i = seiteNr * SEITE To seiteNr * SEITE + SEITE - 1
        If i > n - 1 Then Exit For
        y = ky + 106 + (i - seiteNr * SEITE) * 32
        DateiZeile ws, i, y
    Next i
    If seiten > 1 Then
        modTagesablauf.Knopf ws, "Zurueck", kx + 28, ky + kh - 88, 70, 26, "‹ zurück", 2, "modWerkzeuge.KlickSeiteZurueck"
        modTagesablauf.Beschriftung ws, "Seite", kx + 106, ky + kh - 82, 120, 14, "Seite " & (seiteNr + 1) & " von " & seiten & " · " & n & " Dateien", 8.5, False, C_GRAU
        modTagesablauf.Knopf ws, "Vor", kx + 234, ky + kh - 88, 70, 26, "vor ›", 2, "modWerkzeuge.KlickSeiteVor"
    End If
    modTagesablauf.Beschriftung ws, "Zahl", kx + kb - 28 - 220, ky + kh - 82, 220, 14, AnzahlGewaehlt() & " ausgewählt", 9, True, IIf(AnzahlGewaehlt() > 0, C_ROT, C_GRAU)
    ws.Shapes(PRAEFIX & "Zahl").TextFrame2.TextRange.ParagraphFormat.Alignment = msoAlignRight
    modTagesablauf.Knopf ws, "Loeschen", kx + kb - 28 - 190, ky + kh - 50, 190, 30, "Ausgewählte löschen …", 4, "modWerkzeuge.KlickLoeschenFragen"
    modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modWerkzeuge.KlickSchliessen"
End Sub

Private Sub DateiZeile(ws As Worksheet, i As Long, y As Single)
    Dim rel As String, nm As String, ordner As String, gr As Double, info As String
    rel = CStr(dateien(i))
    nm = Mid$(rel, InStrRev(rel, Application.PathSeparator) + 1)
    If InStr(rel, Application.PathSeparator) > 0 Then ordner = Left$(rel, InStrRev(rel, Application.PathSeparator) - 1) Else ordner = "Rohdaten (neu)"
    If Len(nm) > 52 Then nm = Left$(nm, 50) & "…"
    Zeile ws, "D" & Format(i, "0000"), kx + 28, y, kb - 56, 28, CStr(IIf(gewaehlt(i), "[x]  ", "[  ]  ")) & nm, gewaehlt(i), "modWerkzeuge.KlickDatei"
    gr = modLaden.RohdateiGroesse(rel)
    info = ordner & IIf(gr >= 0, " · " & modLaden.ZahlDE(gr / 1024) & " KB", "")
    modTagesablauf.Beschriftung ws, "I" & Format(i, "0000"), kx + kb - 28 - 250, y + 7, 160, 14, info, 8, False, IIf(gewaehlt(i), RGB(255, 255, 255), C_GRAU)
    ws.Shapes(PRAEFIX & "I" & Format(i, "0000")).TextFrame2.TextRange.ParagraphFormat.Alignment = msoAlignRight
    ws.Shapes(PRAEFIX & "I" & Format(i, "0000")).OnAction = "modWerkzeuge.KlickDatei"
    If geladen(i) Then
        modTagesablauf.Pille ws, "G" & Format(i, "0000"), kx + kb - 28 - 78, y + 5, 70, 18, "geladen", C_GELBH, C_GELBD
        With ws.Shapes(PRAEFIX & "G" & Format(i, "0000")).TextFrame2
            .MarginLeft = 2: .MarginRight = 2: .MarginTop = 0: .MarginBottom = 0
            .TextRange.Font.Size = 8
            .TextRange.Font.Bold = msoTrue
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
        ws.Shapes(PRAEFIX & "G" & Format(i, "0000")).OnAction = "modWerkzeuge.KlickDatei"
    End If
End Sub

Public Sub KlickDatei()
    Dim nm As String
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    If Len(nm) < Len(PRAEFIX) + 5 Then Exit Sub
    klickNr = CLng(Val(Right$(nm, 4)))
    Planen "DateiUmschalten"
End Sub

Public Sub DateiUmschalten()
    If klickNr < 0 Or klickNr > DateiAnzahl() - 1 Then Exit Sub
    gewaehlt(klickNr) = Not gewaehlt(klickNr)
    Application.ScreenUpdating = False
    RohdatenZeichnen
    Application.ScreenUpdating = True
End Sub

Public Sub KlickSeiteZurueck()
    If seiteNr > 0 Then seiteNr = seiteNr - 1
    Planen "RohdatenNeu"
End Sub

Public Sub KlickSeiteVor()
    seiteNr = seiteNr + 1
    Planen "RohdatenNeu"
End Sub

Public Sub RohdatenNeu()
    Application.ScreenUpdating = False
    RohdatenZeichnen
    Application.ScreenUpdating = True
End Sub

Public Sub KlickLoeschenFragen()
    If AnzahlGewaehlt() = 0 Then Exit Sub                   ' nichts gewaehlt: der Zaehler zeigt es
    Planen "LoeschenFragen"
End Sub

Public Sub LoeschenFragen()
    Dim ws As Worksheet, i As Long, n As Long, g As Long, liste As String, k As Long
    modTagesablauf.KartenEntfernen
    Set ws = ActiveSheet
    For i = 0 To DateiAnzahl() - 1
        If gewaehlt(i) Then
            n = n + 1
            If geladen(i) Then g = g + 1
            If k < 6 Then
                liste = liste & IIf(Len(liste) > 0, vbLf, "") & Mid$(CStr(dateien(i)), InStrRev(CStr(dateien(i)), Application.PathSeparator) + 1)
                k = k + 1
            End If
        End If
    Next i
    If n > k Then liste = liste & vbLf & "… und " & (n - k) & " weitere"
    kb = 560: kh = 300 + 14 * k
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "DATEN  ·  ROHDATEN", CStr(IIf(n = 1, "1 Datei endgültig löschen?", n & " Dateien endgültig löschen?"))
    modTagesablauf.Pille ws, "Liste", kx + 28, ky + 76, kb - 56, 20 + 14 * (k + IIf(n > k, 1, 0)), liste, C_GRAUXL, C_SW
    If g > 0 Then
        modTagesablauf.Pille ws, "Warnung", kx + 28, ky + kh - 150, kb - 56, 70, _
            IIf(g = 1, "Aus 1 Datei", "Aus " & g & " Dateien") & " ist ein Stand geladen. Nur löschen: die Stände bleiben im Tool. " & _
            "Löschen und neu aufbauen: das Tool wird geleert und aus den übrigen Rohdateien neu geladen (Anwesenheit bleibt).", C_ROTH, C_ROT
        modTagesablauf.Knopf ws, "Neu", kx + kb - 28 - 220, ky + kh - 50, 220, 30, "Löschen und neu aufbauen", 4, "modWerkzeuge.KlickLoeschenNeu"
        modTagesablauf.Knopf ws, "Nur", kx + kb - 28 - 220 - 10 - 120, ky + kh - 50, 120, 30, "Nur löschen", 2, "modWerkzeuge.KlickLoeschenNur"
    Else
        modTagesablauf.Beschriftung ws, "Hinweis", kx + 28, ky + kh - 120, kb - 56, 30, _
            "Aus keiner dieser Dateien ist ein Stand geladen. Gelöschte Dateien lassen sich nicht wiederherstellen.", 9, False, C_GRAU, True
        modTagesablauf.Knopf ws, "Nur", kx + kb - 28 - 160, ky + kh - 50, 160, 30, "Endgültig löschen", 4, "modWerkzeuge.KlickLoeschenNur"
    End If
    modTagesablauf.Knopf ws, "Zurueck", kx + 20, ky + kh - 50, 90, 30, "Zurück", 3, "modWerkzeuge.KlickZurAuswahl"
End Sub

Public Sub KlickZurAuswahl()
    Planen "RohdatenNeu"
End Sub

Public Sub KlickLoeschenNur()
    Planen "LoeschenNur"
End Sub

Public Sub KlickLoeschenNeu()
    Planen "LoeschenNeu"
End Sub

Public Sub LoeschenNur()
    Dim t As String
    If BeladungAnderer() Then Exit Sub
    t = Loeschen()
    modTagesablauf.KartenEntfernen
    modFortschritt.HinweisZeigen "Rohdaten gelöscht", t, (InStr(t, "nicht gelöscht") > 0)
End Sub

Public Sub LoeschenNeu()
    Dim t As String
    If BeladungAnderer() Then Exit Sub                 ' vor dem Loeschen und Leeren pruefen, nicht erst im Laden
    t = Loeschen()
    modTagesablauf.KartenEntfernen
    modLaden.ToolLeeren False
    modLaden.LogSchreiben "Neu aufbauen nach dem Löschen: " & t
    modLaden.NeueDatenLaden                            ' Abschlussmeldung kommt vom Laden
End Sub

' Laeuft gerade die Beladung eines Kollegen? Dann Hinweis statt Loeschen oder Leeren – sonst waere das Tool leer und wuerde nicht
' neu aufgebaut, und gespeichert ueberschriebe der leere Stand die Datei, in die dort gerade geladen wird.
Private Function BeladungAnderer() As Boolean
    Dim t As String
    t = modLaden.BeladungAndererText()
    If Len(t) = 0 Then Exit Function
    modTagesablauf.KartenEntfernen
    modFortschritt.HinweisZeigen "Beladung läuft", t, False
    BeladungAnderer = True
End Function

' ausgewaehlte Dateien loeschen; Ergebnis als Meldungstext
Private Function Loeschen() As String
    Dim i As Long, ok As Long, fehler As String, f As String
    For i = 0 To DateiAnzahl() - 1
        If gewaehlt(i) Then
            f = modLaden.RohdateiLoeschen(CStr(dateien(i)))
            If Len(f) = 0 Then
                ok = ok + 1
            Else
                fehler = fehler & vbLf & CStr(dateien(i)) & ": " & f
            End If
        End If
    Next i
    If modLaden.RohdatenAufSharePoint() Then
        ' SharePoint: Excel kann dort nicht loeschen – die Dateien sind im Tool ausgeblendet, der Ordner oeffnet sich im Browser
        Loeschen = IIf(ok = 1, "1 Datei", ok & " Dateien") & " im Tool ausgeblendet: sie werden nicht mehr geladen und nicht mehr angezeigt." & vbLf & _
                   "Die Rohdaten liegen auf SharePoint, dort kann Excel keine Dateien löschen. Endgültig löschen bitte im Browser – der Ordner ist geöffnet."
        On Error Resume Next
        ThisWorkbook.FollowHyperlink modLaden.RohdatenPfad()
        On Error GoTo 0
        Exit Function
    End If
    Loeschen = IIf(ok = 1, "1 Datei gelöscht.", ok & " Dateien gelöscht.")
    If Len(fehler) > 0 Then Loeschen = Loeschen & vbLf & "Diese Dateien wurden nicht gelöscht (geöffnet oder schreibgeschützt?):" & fehler
End Function

' ============================================================================ Zurücksetzen
Public Sub ZuruecksetzenZeigen()
    If Not Bereit() Then Exit Sub
    mitAnwesenheit = False
    ZuruecksetzenZeichnen
End Sub

Private Sub ZuruecksetzenZeichnen()
    Dim ws As Worksheet
    modTagesablauf.KartenEntfernen
    Set ws = ActiveSheet
    kb = 560: kh = 320
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "DATEN  ·  ZURÜCKSETZEN", "Tool zurücksetzen?"
    modTagesablauf.Pille ws, "Text", kx + 28, ky + 76, kb - 56, 92, _
        "Alle geladenen Stände werden aus dem Tool entfernt: Fakten, Verlauf, Ladeprotokoll, Umbuchungen, Snapshots und die Liste der Themenpostkörbe. " & _
        "Konfiguration, SLA und GeVo-Auswahl bleiben. Die Rohdateien bleiben im Ordner – „Neue Daten laden“ liest sie danach wieder ein.", C_GRAUXL, C_SW
    Zeile ws, "Anw", kx + 28, ky + 184, kb - 56, 30, CStr(IIf(mitAnwesenheit, "[x]  ", "[  ]  ")) & "Auch die Anwesenheit leeren (Mitarbeiter und Kalender)", _
          mitAnwesenheit, "modWerkzeuge.KlickAnwesenheit"
    modTagesablauf.Knopf ws, "Leeren", kx + kb - 28 - 180, ky + kh - 50, 180, 30, "Tool zurücksetzen", 4, "modWerkzeuge.KlickLeeren"
    modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modWerkzeuge.KlickSchliessen"
End Sub

Public Sub KlickAnwesenheit()
    mitAnwesenheit = Not mitAnwesenheit
    Planen "ZuruecksetzenNeu"
End Sub

Public Sub ZuruecksetzenNeu()
    Application.ScreenUpdating = False
    ZuruecksetzenZeichnen
    Application.ScreenUpdating = True
End Sub

Public Sub KlickLeeren()
    Planen "Leeren"
End Sub

Public Sub Leeren()
    If BeladungAnderer() Then Exit Sub
    modTagesablauf.KartenEntfernen
    modLaden.ToolLeeren mitAnwesenheit
    EinheitKnopfBeschriften
    modFortschritt.HinweisZeigen "Zurückgesetzt", "Das Tool ist leer" & IIf(mitAnwesenheit, ", auch die Anwesenheit", "") & _
        ". „Neue Daten laden“ liest die Rohdateien wieder ein.", False
End Sub

' ============================================================================ Ältester Vorgang (Knopf „Details“ an der Kachel)
' Je Quelle der Vorgang mit dem hoechsten Rueckstandsalter am letzten Stichtag nach aktivem Filter (wie die Kachel): Ordnungsbegriff,
' LNR, VSS und Sparte, GeVo, Themenpostkorb, Einheit und Rohdatei. „In Rohdatei markieren“ oeffnet die Rohdatei und markiert die
' Zeile gelb (modLaden.VorgangMarkieren). Staende, die vor 12.64 geladen wurden, kennen den Ordnungsbegriff noch nicht – die
' Markierung sucht dann die aelteste Zeile mit VSS, Postkorb und GeVo.
Public Sub AeltesterZeigen()
    Dim ws As Worksheet, q As Variant, v As Variant, y As Single, t() As String, vorgang As String, i As Long
    If Not Bereit() Then Exit Sub
    Set ws = ActiveSheet
    kb = 640: kh = 470
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "KENNZAHL  ·  ÄLTESTER VORGANG", "Ältester Vorgang im Rückstand"
    modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 28, _
        "Je Quelle der Vorgang mit dem höchsten Rückstandsalter am letzten Stichtag – nach den aktiven Filtern, wie die Kachel.", 9, False, C_GRAU, True
    y = ky + 104
    For Each q In Array("Verbund", "OPAG")
        i = i + 1
        v = modLaden.AeltesterVorgang(CStr(q))
        modTagesablauf.Pille ws, "B" & i, kx + 28, y, kb - 56, 150, "", C_GRAUXL, C_SW
        If Not IsArray(v) Then
            modTagesablauf.Beschriftung ws, "Q" & i, kx + 44, y + 12, kb - 88, 18, UCase$(CStr(q)), 9, True, C_TEAL
            modTagesablauf.Beschriftung ws, "W" & i, kx + 44, y + 36, kb - 88, 18, "Kein Rückstand am letzten Stichtag (nach Filter).", 10, False, C_GRAU
        Else
            modTagesablauf.Beschriftung ws, "Q" & i, kx + 44, y + 12, kb - 88, 16, CStr(UCase$(CStr(q)) & "  ·  Stichtag " & Format$(v(1), "dd.mm.yyyy")), 9, True, C_TEAL
            modTagesablauf.Beschriftung ws, "W" & i, kx + 44, y + 30, kb - 88, 22, CStr(ZahlTage(CDbl(v(2))) & " alt  ·  im Rückstand seit " & _
                Format$(CDate(v(1)) - CDbl(v(2)), "dd.mm.yyyy")), 13, True, C_SW
            If Len(CStr(v(9))) > 0 Then
                t = Split(CStr(v(9)), "|")
                vorgang = "Ordnungsbegriff " & t(1)
                If UBound(t) >= 2 Then vorgang = vorgang & "  ·  LNR " & t(2)
                If UBound(t) >= 4 Then vorgang = vorgang & "  ·  Auftrag " & t(3) & "  ·  Arbeitsgut " & t(4)
            Else
                vorgang = "Ordnungsbegriff erst nach dem nächsten Laden bekannt – „In Rohdatei markieren“ findet ihn schon jetzt"
            End If
            Zeilentext ws, "V" & i, y + 58, "Vorgang", vorgang
            Zeilentext ws, "G" & i, y + 76, "GeVo", CStr(v(6))
            Zeilentext ws, "P" & i, y + 94, "Postkorb", CStr(CStr(v(5)) & IIf(Len(CStr(v(7))) > 0, "  ·  Einheit " & CStr(v(7)), ""))
            Zeilentext ws, "S" & i, y + 112, "VSS", CStr(CStr(v(4)) & "  ·  " & CStr(v(3)) & IIf(Len(CStr(v(10))) > 0, "  ·  Rohdatei " & DateiKurz(CStr(v(10))), ""))
            modTagesablauf.Knopf ws, "M" & i, kx + kb - 44 - 170, y + 10, 170, 24, "In Rohdatei markieren", 2, CStr(IIf(CStr(q) = "OPAG", "modWerkzeuge.KlickMarkierenOPAG", "modWerkzeuge.KlickMarkierenVerbund"))
        End If
        y = y + 162
    Next q
    modTagesablauf.Knopf ws, "Abbrechen", kx + kb - 28 - 120, ky + kh - 50, 120, 30, "Schließen", 1, "modWerkzeuge.KlickSchliessen"
End Sub

Private Sub Zeilentext(ws As Worksheet, nm As String, y As Single, marke As String, inhalt As String)
    modTagesablauf.Beschriftung ws, nm & "a", kx + 44, y, 80, 16, marke, 8.5, True, C_GRAU
    modTagesablauf.Beschriftung ws, nm & "b", kx + 124, y, kb - 168, 16, inhalt, 9, False, C_SW
End Sub

Private Function ZahlTage(n As Double) As String
    If n = 1 Then ZahlTage = "1 Tag" Else ZahlTage = modLaden.ZahlDE(n) & " Tage"
End Function

Private Function DateiKurz(rel As String) As String
    DateiKurz = Mid$(rel, InStrRev(Replace(rel, "/", "\"), "\") + 1)
    If Len(DateiKurz) > 40 Then DateiKurz = Left$(DateiKurz, 38) & "…"
End Function

Public Sub KlickMarkierenVerbund()
    Planen "MarkierenVerbund"
End Sub

Public Sub KlickMarkierenOPAG()
    Planen "MarkierenOPAG"
End Sub

Public Sub MarkierenVerbund()
    Markieren "Verbund"
End Sub

Public Sub MarkierenOPAG()
    Markieren "OPAG"
End Sub

Private Sub Markieren(quelle As String)
    Dim t As String
    modTagesablauf.KartenEntfernen
    t = modLaden.VorgangMarkieren(quelle)
    If Len(t) > 0 Then modFortschritt.HinweisZeigen "Ältester Vorgang", t, True
End Sub

' ============================================================================ Ältere Datei aktualisieren (12.93)
' Karte zu modUpdate: findet die zusaetzlich geoeffnete aeltere Master-Datei, zeigt Datei, Version und Stand und was passiert;
' „Aktualisieren und ersetzen“ uebernimmt die Daten und speichert diese Datei unter dem Namen und am Ort der alten.

Public Sub UpdateZeigen()
    Dim ws As Worksheet, info As String, problem As String
    If Not Bereit() Then Exit Sub
    updateName = ""
    problem = modUpdate.AlteDateiPruefen(updateName, info)
    If Len(problem) > 0 Then
        modFortschritt.HinweisZeigen "Ältere Datei aktualisieren", problem, True
        Exit Sub
    End If
    Set ws = ActiveSheet
    kb = 600: kh = 380
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    Ueberschrift ws, "WERKZEUG  ·  AKTUALISIEREN", "Ältere Datei auf Version " & modUpdate.VersionVon(ThisWorkbook) & " bringen?"
    modTagesablauf.Pille ws, "Datei", kx + 28, ky + 76, kb - 56, 48, info, C_GRAUXL, C_SW
    modTagesablauf.Pille ws, "Text", kx + 28, ky + 134, kb - 56, 168, _
        "Diese Datei übernimmt alle Daten der älteren Datei – Stände, Ladeprotokoll, Anwesenheit, Standard, SLA und Einstellungen – " & _
        "und speichert sich danach unter deren Namen an deren Ort. Die ältere Datei wird dabei ersetzt; Verknüpfungen anderer Dateien " & _
        "(z. B. HR Sales Dashboard) gelten weiter, nichts muss neu geladen werden." & vbLf & vbLf & _
        "Vorher wird die ältere Datei gesichert (mit Dateipfad im Ordner Protokolle\Sicherung daneben, auf SharePoint im Versionsverlauf). " & _
        "Niemand sonst darf sie gerade geöffnet haben.", C_GRAUXL, C_SW
    modTagesablauf.Knopf ws, "Update", kx + kb - 28 - 210, ky + kh - 50, 210, 30, "Aktualisieren und ersetzen", 1, "modWerkzeuge.KlickUpdate"
    modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modWerkzeuge.KlickSchliessen"
End Sub

Public Sub KlickUpdate()
    Planen "UpdateAusfuehren"
End Sub

Public Sub UpdateAusfuehren()
    Dim text As String, fehler As Boolean
    If Len(updateName) = 0 Then Exit Sub
    modTagesablauf.KartenEntfernen
    Application.StatusBar = "Daten der älteren Datei werden übernommen …"
    text = modUpdate.Ausfuehren(updateName, fehler)
    Application.StatusBar = False
    updateName = ""
    modFortschritt.HinweisZeigen IIf(fehler, "Aktualisieren nicht abgeschlossen", "Aktualisiert"), text, fehler
End Sub
