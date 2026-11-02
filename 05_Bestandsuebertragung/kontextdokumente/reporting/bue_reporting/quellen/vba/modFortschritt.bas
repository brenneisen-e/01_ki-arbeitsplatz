Option Explicit
' ============================================================================
' modFortschritt – Lade-Overlay mit Fortschrittsbalken (ohne UserForm: Formen auf dem aktiven Blatt)
' FortschrittZeigen "Titel"  -> abgedunkelte Flaeche, weisse Karte, Titel, Statuszeile, Balken, Prozent
' FortschrittSetzen 0.42, "Text"[, "Detail"] -> Balken, Statuszeile und kleine Zeile darunter (z. B. Dateiname) nachziehen
'                               (zeichnet auch bei ScreenUpdating = False); zu lange Texte werden auf die Breite gekuerzt
' FortschrittSchritt "Schritt 1 von 2 · …" -> Zeile ueber dem Status (Abschnitt des Ablaufs), leer = keine
' FortschrittSchliessen        -> alle Formen entfernen
' ============================================================================

Private Const PRAEFIX As String = "LADE_"
Private Const HINWEIS As String = "HINW_"
Private Const KARTE_B As Single = 420
Private Const KARTE_H As Single = 154
Private letztesUpdate As Double
Private aktiv As Boolean
Private blatt As Worksheet
Private hinwTitel As String
Private hinwText As String
Private hinwFehler As Boolean

Public Sub FortschrittZeigen(titel As String)
    Dim sichtbar As Range, links As Single, oben As Single, breite As Single, hoehe As Single
    Dim kx As Single, ky As Single
    On Error Resume Next
    FortschrittSchliessen
    Set blatt = ActiveSheet
    If blatt Is Nothing Then Exit Sub
    Set sichtbar = ActiveWindow.VisibleRange
    links = sichtbar.Left: oben = sichtbar.Top: breite = sichtbar.Width: hoehe = sichtbar.Height
    kx = links + (breite - KARTE_B) / 2
    ky = oben + (hoehe - KARTE_H) / 2 - 20
    ' Abdunkelung
    With blatt.Shapes.AddShape(1, links, oben, breite, hoehe)
        .Name = PRAEFIX & "Schleier"
        .Fill.ForeColor.RGB = RGB(26, 26, 26)
        .Fill.Transparency = 0.55
        .Line.Visible = msoFalse
    End With
    ' Karte
    With blatt.Shapes.AddShape(5, kx, ky, KARTE_B, KARTE_H)
        .Name = PRAEFIX & "Karte"
        .Adjustments(1) = 0.08
        .Fill.ForeColor.RGB = RGB(255, 255, 255)
        .Line.Visible = msoFalse
        .Shadow.Visible = msoTrue
        .Shadow.Blur = 18
        .Shadow.OffsetX = 0
        .Shadow.OffsetY = 6
        .Shadow.Transparency = 0.7
        .Shadow.ForeColor.RGB = RGB(0, 0, 0)
    End With
    ' Farbbalken links als Akzent
    With blatt.Shapes.AddShape(1, kx, ky + 22, 4, KARTE_H - 44)
        .Name = PRAEFIX & "Akzent"
        .Fill.ForeColor.RGB = RGB(191, 21, 40)
        .Line.Visible = msoFalse
    End With
    Textfeld PRAEFIX & "Titel", kx + 24, ky + 18, KARTE_B - 48, 24, titel, 13, True, RGB(26, 26, 26)
    Textfeld PRAEFIX & "Schritt", kx + 24, ky + 46, KARTE_B - 48, 16, " ", 8, True, RGB(11, 111, 125)
    Textfeld PRAEFIX & "Status", kx + 24, ky + 64, KARTE_B - 110, 20, "Vorbereitung …", 9, False, RGB(107, 107, 107)
    Textfeld PRAEFIX & "Prozent", kx + KARTE_B - 90, ky + 64, 66, 20, "0 %", 9, True, RGB(26, 26, 26)
    Textfeld PRAEFIX & "Detail", kx + 24, ky + 84, KARTE_B - 48, 14, " ", 8, False, RGB(154, 163, 173)
    With blatt.Shapes(PRAEFIX & "Prozent").TextFrame2.TextRange.ParagraphFormat
        .Alignment = msoAlignRight
    End With
    ' Balken: Spur und Fuellung
    With blatt.Shapes.AddShape(5, kx + 24, ky + 106, KARTE_B - 48, 10)
        .Name = PRAEFIX & "Spur"
        .Adjustments(1) = 0.5
        .Fill.ForeColor.RGB = RGB(232, 234, 237)
        .Line.Visible = msoFalse
    End With
    With blatt.Shapes.AddShape(5, kx + 24, ky + 106, 6, 10)
        .Name = PRAEFIX & "Balken"
        .Adjustments(1) = 0.5
        .Fill.ForeColor.RGB = RGB(191, 21, 40)
        .Line.Visible = msoFalse
    End With
    Textfeld PRAEFIX & "Hinweis", kx + 24, ky + 122, KARTE_B - 48, 18, "Bitte warten, bis der Balken durch ist. Klicks werden währenddessen nicht ausgeführt.", 8, False, RGB(154, 163, 173)
    aktiv = True
    letztesUpdate = 0
    Zeichnen
    On Error GoTo 0
End Sub

Public Sub FortschrittSetzen(anteil As Double, status As String, Optional detail As String = "")
    Dim spur As Shape
    If Not aktiv Then Exit Sub
    On Error Resume Next
    If anteil < 0 Then anteil = 0
    If anteil > 1 Then anteil = 1
    Set spur = blatt.Shapes(PRAEFIX & "Spur")
    blatt.Shapes(PRAEFIX & "Balken").Width = IIf(anteil * spur.Width < 6, 6, anteil * spur.Width)
    blatt.Shapes(PRAEFIX & "Prozent").TextFrame2.TextRange.Text = Format(anteil * 100, "0") & " %"
    If Len(status) > 0 Then TextPassend blatt.Shapes(PRAEFIX & "Status"), status, False
    TextPassend blatt.Shapes(PRAEFIX & "Detail"), detail, True
    ' hoechstens alle 0,15 s neu zeichnen, damit das Laden nicht ausgebremst wird
    If Timer - letztesUpdate > 0.15 Or Timer < letztesUpdate Or anteil >= 1 Then
        Zeichnen
        letztesUpdate = Timer
    End If
    On Error GoTo 0
End Sub

' Abschnitt des Ablaufs ueber der Statuszeile, z. B. "SCHRITT 1 VON 2 · DATEIEN PRÜFEN"
Public Sub FortschrittSchritt(text As String)
    If Not aktiv Then Exit Sub
    On Error Resume Next
    TextPassend blatt.Shapes(PRAEFIX & "Schritt"), UCase$(text), False
    Zeichnen
    letztesUpdate = Timer
    On Error GoTo 0
End Sub

' Text in ein Feld ohne Umbruch setzen und so weit kuerzen, dass er in die Breite des Felds passt (gemessen an der echten
' Textbreite). mitte = True kuerzt in der Mitte (Dateinamen: Anfang und Endung bleiben sichtbar), sonst am Ende.
Private Sub TextPassend(shp As Shape, text As String, mitte As Boolean)
    Dim t As String, b As Single, n As Long, versuch As Long
    On Error Resume Next
    If Len(text) = 0 Then shp.TextFrame2.TextRange.Text = " ": Exit Sub
    shp.TextFrame2.TextRange.Text = text
    b = shp.TextFrame2.TextRange.BoundWidth
    If Err.Number <> 0 Or b <= 0 Then                         ' ohne Messung: grobe Schaetzung ueber die Schriftgroesse
        Err.Clear
        n = Int(shp.Width / (shp.TextFrame2.TextRange.Font.Size * 0.55))
        If Len(text) > n And n > 8 Then shp.TextFrame2.TextRange.Text = Gekuerzt(text, n, mitte)
        Exit Sub
    End If
    If b <= shp.Width Then Exit Sub
    n = Int(Len(text) * shp.Width / b)                        ' erste Schaetzung, dann schrittweise nachziehen
    Do
        t = Gekuerzt(text, n, mitte)
        shp.TextFrame2.TextRange.Text = t
        If shp.TextFrame2.TextRange.BoundWidth <= shp.Width Or n <= 8 Then Exit Do
        n = n - 2
        versuch = versuch + 1
    Loop While versuch < 40
End Sub

Private Function Gekuerzt(text As String, n As Long, mitte As Boolean) As String
    Dim vorne As Long
    If Len(text) <= n Then Gekuerzt = text: Exit Function
    If mitte Then
        vorne = Int((n - 1) * 0.6)
        Gekuerzt = Left$(text, vorne) & "…" & Right$(text, n - 1 - vorne)
    Else
        Gekuerzt = Left$(text, n - 1) & "…"
    End If
End Function

Public Sub FortschrittSchliessen()
    Dim i As Long, ws As Worksheet
    On Error Resume Next
    aktiv = False
    If blatt Is Nothing Then
        For Each ws In ThisWorkbook.Worksheets            ' Reste nach einem Abbruch auf jedem Blatt entfernen
            For i = ws.Shapes.Count To 1 Step -1
                If Left$(ws.Shapes(i).Name, Len(PRAEFIX)) = PRAEFIX Then ws.Shapes(i).Delete
            Next i
        Next ws
    Else
        For i = blatt.Shapes.Count To 1 Step -1
            If Left$(blatt.Shapes(i).Name, Len(PRAEFIX)) = PRAEFIX Then blatt.Shapes(i).Delete
        Next i
    End If
    Set blatt = Nothing
    On Error GoTo 0
End Sub

Private Sub Zeichnen()
    Dim war As Boolean
    war = Application.ScreenUpdating
    Application.ScreenUpdating = True
    DoEvents
    Application.ScreenUpdating = war
End Sub

Private Sub Textfeld(nm As String, x As Single, y As Single, b As Single, h As Single, text As String, groesse As Single, fett As Boolean, farbe As Long)
    With blatt.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = nm
        .Fill.Visible = msoFalse
        .Line.Visible = msoFalse
        .TextFrame2.MarginLeft = 0: .TextFrame2.MarginRight = 0: .TextFrame2.MarginTop = 0: .TextFrame2.MarginBottom = 0
        .TextFrame2.WordWrap = msoFalse
        .TextFrame2.VerticalAnchor = msoAnchorMiddle
        With .TextFrame2.TextRange
            .Text = text
            .Font.Name = "Liberation Sans"
            .Font.Size = groesse
            .Font.Bold = fett
            .Font.Fill.ForeColor.RGB = farbe
        End With
    End With
End Sub

' ---------------------------------------------------------------- Hinweis-Karte (Ersatz fuer MsgBox): Titel, Text, OK-Knopf
Public Sub HinweisZeigen(titel As String, text As String, Optional fehler As Boolean = False)
    ' Die Karte wird nicht sofort gezeichnet, sondern per OnTime, nachdem die aufrufende Prozedur beendet ist und
    ' Excel Neuberechnung und Bildaufbau abgeschlossen hat. Konfiguration!B9 = NEIN schaltet auf das klassische Fenster.
    Dim karte As String
    ' Laden aus dem Tagesablauf: Meldung geht an modTagesablauf, das mit Schritt 2 weitermacht
    If modTagesablauf.WartetAufLaden() Then
        modTagesablauf.LadeErgebnis titel, text, fehler
        Exit Sub
    End If
    On Error Resume Next
    karte = UCase$(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B9").Value)))
    On Error GoTo 0
    If karte = "NEIN" Then
        MsgBox text, IIf(fehler, vbCritical, vbInformation), titel
        Exit Sub
    End If
    hinwTitel = titel: hinwText = text: hinwFehler = fehler
    On Error GoTo Ersatz
    modLaden.LogSchreiben "Hinweis geplant: " & titel
    Application.OnTime Now + TimeSerial(0, 0, 1), "'" & ThisWorkbook.Name & "'!modFortschritt.HinweisZeichnen"
    Exit Sub
Ersatz:
    MsgBox text, IIf(fehler, vbCritical, vbInformation), titel
End Sub

Public Sub HinweisZeichnen()
    Dim ws As Worksheet, sichtbar As Range, links As Single, oben As Single, breite As Single, hoehe As Single
    Dim kx As Single, ky As Single, kb As Single, kh As Single, zeilen As Long, i As Long, teile() As String, akzent As Long
    Dim titel As String, text As String, fehler As Boolean
    titel = hinwTitel: text = hinwText: fehler = hinwFehler
    On Error GoTo Ersatz
    modLaden.LogSchreiben "Hinweis zeichnen"
    HinweisEntfernen
    Set ws = ActiveSheet
    If ws Is Nothing Then GoTo Ersatz
    Set sichtbar = ActiveWindow.VisibleRange
    links = sichtbar.Left: oben = sichtbar.Top: breite = sichtbar.Width: hoehe = sichtbar.Height
    ' Hoehe nach Textmenge: je Zeile ca. 16 pt, umbrochene Zeilen mitzaehlen
    teile = Split(text, vbCrLf)
    zeilen = 0
    For i = 0 To UBound(teile)
        zeilen = zeilen + 1 + Int(Len(teile(i)) / 78)
    Next i
    kb = 520
    kh = 96 + zeilen * 16
    If kh > hoehe - 40 Then kh = hoehe - 40
    kx = links + (breite - kb) / 2
    ky = oben + (hoehe - kh) / 2 - 20
    akzent = IIf(fehler, RGB(191, 21, 40), RGB(15, 148, 167))
    Set blatt = ws
    Application.ScreenUpdating = False
    With ws.Shapes.AddShape(1, links, oben, breite, hoehe)
        .Name = HINWEIS & "Schleier"
        .Fill.ForeColor.RGB = RGB(26, 26, 26)
        .Fill.Transparency = 0.55
        .Line.Visible = msoFalse
        .OnAction = "modFortschritt.HinweisSchliessen"
    End With
    With ws.Shapes.AddShape(5, kx, ky, kb, kh)
        .Name = HINWEIS & "Karte"
        .Adjustments(1) = 0.06
        .Fill.ForeColor.RGB = RGB(255, 255, 255)
        .Line.Visible = msoFalse
        .Shadow.Visible = msoTrue
        .Shadow.Blur = 18
        .Shadow.OffsetX = 0
        .Shadow.OffsetY = 6
        .Shadow.Transparency = 0.7
        .Shadow.ForeColor.RGB = RGB(0, 0, 0)
    End With
    With ws.Shapes.AddShape(1, kx, ky + 22, 4, kh - 44)
        .Name = HINWEIS & "Akzent"
        .Fill.ForeColor.RGB = akzent
        .Line.Visible = msoFalse
    End With
    Textfeld HINWEIS & "Titel", kx + 24, ky + 18, kb - 48, 24, titel, 13, True, RGB(26, 26, 26)
    Textfeld HINWEIS & "Text", kx + 24, ky + 48, kb - 48, kh - 100, text, 9.5, False, RGB(74, 74, 74)
    With ws.Shapes(HINWEIS & "Text").TextFrame2
        .WordWrap = msoTrue
        .VerticalAnchor = msoAnchorTop
    End With
    With ws.Shapes.AddShape(5, kx + kb - 24 - 96, ky + kh - 40, 96, 26)
        .Name = HINWEIS & "OK"
        .Adjustments(1) = 0.3
        .Fill.ForeColor.RGB = akzent
        .Line.Visible = msoFalse
        .OnAction = "modFortschritt.HinweisSchliessen"
        With .TextFrame2
            .TextRange.Text = "OK"
            .TextRange.Font.Name = "Liberation Sans"
            .TextRange.Font.Size = 10
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
            .VerticalAnchor = msoAnchorMiddle
            .MarginTop = 0: .MarginBottom = 0
        End With
    End With
    Application.ScreenUpdating = True
    modLaden.LogSchreiben "Hinweis gezeichnet"
    Exit Sub
Ersatz:
    On Error Resume Next
    Application.ScreenUpdating = True
    HinweisEntfernen
    MsgBox text, IIf(fehler, vbCritical, vbInformation), titel
End Sub

' OK-Knopf und Schleier: nicht im eigenen Klick loeschen, sondern gleich danach per OnTime
Public Sub HinweisSchliessen()
    On Error Resume Next
    modLaden.LogSchreiben "Hinweis schliessen"
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modFortschritt.HinweisEntfernen"
    On Error GoTo 0
End Sub

Public Sub HinweisEntfernen()
    Dim i As Long, ws As Worksheet
    On Error Resume Next
    For Each ws In ThisWorkbook.Worksheets
        For i = ws.Shapes.Count To 1 Step -1
            If Left$(ws.Shapes(i).Name, Len(HINWEIS)) = HINWEIS Then ws.Shapes(i).Delete
        Next i
    Next ws
    On Error GoTo 0
End Sub
