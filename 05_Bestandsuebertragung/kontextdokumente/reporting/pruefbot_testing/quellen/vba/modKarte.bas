Option Explicit
' ============================================================================
' modKarte - Karten (modale Fenster) als Formen, ohne UserForm (Muster aus dem HR-Sales-Dashboard, Farben des
' Pruefbot-Testings: Schiefer, Teal, wenig Rot).
'
' Alle Formen einer Karte tragen das Praefix KARTE_ und werden mit KartenEntfernen aufgeraeumt.
' Klicks auf Karten loeschen Formen nie im eigenen Klick, sondern per OnTime gleich danach (Planen): das Loeschen
' der geklickten Form im eigenen Makro kann Excel abstuerzen lassen.
' ============================================================================

Public Const PRAEFIX As String = "KARTE_"
Private Const SCHRIFT As String = "Liberation Sans"

Public Const C_TEAL As Long = 7239183           ' RGB(15, 118, 110)
Public Const C_TEAL_D As Long = 5725451         ' RGB(11, 93, 87)
Public Const C_TEAL_XL As Long = 15922406       ' RGB(230, 244, 242)
Public Const C_BAND As Long = 3352347           ' RGB(27, 39, 51)
Public Const C_SW As Long = 3352863             ' RGB(31, 41, 51)
Public Const C_GRAU As Long = 6969930           ' RGB(74, 90, 106)
Public Const C_GRAU2 As Long = 9734011          ' RGB(123, 135, 148)
Public Const C_LINIE As Long = 14406603         ' RGB(203, 211, 219)
Public Const C_LINIE_L As Long = 15591651       ' RGB(227, 232, 237)
Public Const C_FLAECHE As Long = 16315890       ' RGB(242, 245, 248)
Public Const C_ROT As Long = 1582004            ' RGB(180, 35, 24)
Public Const C_ROT_H As Long = 15198205         ' RGB(253, 231, 231)
Public Const C_GRUEN As Long = 3827223          ' RGB(23, 102, 58)
Public Const C_GRUEN_H As Long = 15398370       ' RGB(226, 245, 234)
Public Const C_AMBER As Long = 21386            ' RGB(138, 83, 0)
Public Const C_AMBER_H As Long = 14086655       ' RGB(255, 241, 214)
Public Const C_AMBER_R As Long = 7193842        ' RGB(242, 196, 109)
Public Const C_WEISS As Long = 16777215         ' RGB(255, 255, 255)
Public Const C_SCHLEIER As Long = 2758415       ' RGB(15, 23, 42)

Public Sub Nichts()
End Sub

Public Sub Fuellen(shp As Object, farbe As Long, Optional transparenz As Single = 0)
    With shp.Fill
        .Visible = msoTrue
        .Solid
        .ForeColor.RGB = farbe
        .Transparency = transparenz
    End With
End Sub

Public Sub Rand(shp As Object, farbe As Long, Optional staerke As Single = 1)
    With shp.Line
        .Visible = msoTrue
        .ForeColor.RGB = farbe
        .Weight = staerke
    End With
End Sub

Public Sub Planen(prozedur As String)
    On Error Resume Next
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!" & prozedur
    On Error GoTo 0
End Sub

Public Sub KartenEntfernen()
    Dim i As Long, ws As Object
    On Error Resume Next
    For Each ws In ThisWorkbook.Worksheets
        For i = ws.Shapes.Count To 1 Step -1
            If Left$(ws.Shapes(i).Name, Len(PRAEFIX)) = PRAEFIX Then ws.Shapes(i).Delete
        Next i
    Next ws
    On Error GoTo 0
End Sub

Public Sub KlickSchliessen()
    Planen "modKarte.KartenEntfernen"
End Sub

' Sichtbarer Bereich des Scrollbereichs: bei fixierten Zeilen/Spalten ist das der letzte Bereich (unten rechts);
' ActiveWindow.VisibleRange beschreibt dann nicht zuverlaessig die gescrollte Lage.
Public Function SichtBereich() As Object
    On Error Resume Next
    Set SichtBereich = ActiveWindow.Panes(ActiveWindow.Panes.Count).VisibleRange
    If SichtBereich Is Nothing Then Set SichtBereich = ActiveWindow.VisibleRange
    On Error GoTo 0
End Function

' Hoehe bzw. Breite, die fuer eine Karte im Scrollbereich zur Verfuegung steht (Punkte): Fensterflaeche ohne die
' fixierten Zeilen bzw. Spalten, hoechstens der sichtbare Bereich.
Public Function SichtHoehe() As Single
    Dim s As Object, h As Single, fix0 As Single
    Set s = SichtBereich()
    On Error Resume Next
    h = ActiveWindow.UsableHeight
    If ActiveWindow.SplitRow > 0 Then fix0 = ActiveSheet.Rows(ActiveWindow.SplitRow + 1).Top
    On Error GoTo 0
    If h > fix0 Then h = h - fix0
    If Not s Is Nothing Then
        If s.Height < h Or h <= 0 Then h = s.Height
    End If
    If h <= 0 Then h = 600
    SichtHoehe = h
End Function

Public Function SichtBreite() As Single
    Dim s As Object, b As Single, fix0 As Single
    Set s = SichtBereich()
    On Error Resume Next
    b = ActiveWindow.UsableWidth
    If ActiveWindow.SplitColumn > 0 Then fix0 = ActiveSheet.Columns(ActiveWindow.SplitColumn + 1).Left
    On Error GoTo 0
    If b > fix0 Then b = b - fix0
    If Not s Is Nothing Then
        If s.Width < b Or b <= 0 Then b = s.Width
    End If
    If b <= 0 Then b = 800
    SichtBreite = b
End Function

' abgedunkelter Hintergrund ueber dem ganzen sichtbaren Fenster (auch ueber dem fixierten Kopfband) und Karte in der
' Mitte des Scrollbereichs; passt die Karte nicht in die Hoehe, steht sie oben buendig.
Public Sub KarteModal(ws As Object, kb As Single, kh As Single, ByRef kx As Single, ByRef ky As Single)
    Dim sichtbar As Object, shp As Object, breite As Single, hoehe As Single
    Set sichtbar = SichtBereich()
    Set shp = ws.Shapes.AddShape(1, 0, 0, sichtbar.Left + sichtbar.Width + 400, sichtbar.Top + sichtbar.Height + 400)
    shp.Name = PRAEFIX & "Schleier"
    Fuellen shp, C_SCHLEIER, 0.45
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
    breite = SichtBreite()
    hoehe = SichtHoehe()
    kx = sichtbar.Left + (breite - kb) / 2
    ky = sichtbar.Top + (hoehe - kh) / 2 - 10
    If kx < sichtbar.Left + 10 Then kx = sichtbar.Left + 10
    If ky < sichtbar.Top + 10 Then ky = sichtbar.Top + 10
    Karte ws, kx, ky, kb, kh
End Sub

Public Sub Karte(ws As Object, kx As Single, ky As Single, kb As Single, kh As Single)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, kx, ky, kb, kh)
    shp.Name = PRAEFIX & "Karte"
    shp.Adjustments(1) = 0.025
    Fuellen shp, C_WEISS
    Rand shp, C_LINIE_L, 0.75
    shp.Shadow.Visible = msoTrue
    shp.Shadow.Blur = 24
    shp.Shadow.OffsetX = 0
    shp.Shadow.OffsetY = 10
    shp.Shadow.Transparency = 0.72
    shp.Shadow.ForeColor.RGB = RGB(0, 0, 0)
    shp.OnAction = "modKarte.Nichts"
    ' Akzentlinie oben
    Set shp = ws.Shapes.AddShape(1, kx + 18, ky, 56, 3)
    shp.Name = PRAEFIX & "Akzent"
    Fuellen shp, C_TEAL
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
End Sub

Public Sub Beschriftung(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                        groesse As Single, fett As Boolean, farbe As Long, Optional umbruch As Boolean = False, _
                        Optional rechts As Boolean = False)
    Dim shp As Object
    Set shp = ws.Shapes.AddTextbox(1, x, y, b, h)
    shp.Name = PRAEFIX & nm
    shp.Fill.Visible = msoFalse
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
    With shp.TextFrame2
        .MarginLeft = 0: .MarginRight = 0: .MarginTop = 0: .MarginBottom = 0
        .WordWrap = IIf(umbruch, msoTrue, msoFalse)
        .VerticalAnchor = IIf(umbruch, msoAnchorTop, msoAnchorMiddle)
        .TextRange.Text = inhalt
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = groesse
        .TextRange.Font.Bold = IIf(fett, msoTrue, msoFalse)
        .TextRange.Font.Fill.ForeColor.RGB = farbe
        .TextRange.ParagraphFormat.SpaceAfter = 0
        .TextRange.ParagraphFormat.Alignment = IIf(rechts, msoAlignRight, msoAlignLeft)
    End With
End Sub

' Pille (Status) mit Text, zentriert
Public Sub Pille(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                 fuellung As Long, schriftFarbe As Long, Optional groesse As Single = 8.5)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, x, y, b, h)
    shp.Name = PRAEFIX & nm
    shp.Adjustments(1) = 0.5
    Fuellen shp, fuellung
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
    With shp.TextFrame2
        .MarginLeft = 4: .MarginRight = 4: .MarginTop = 0: .MarginBottom = 0
        .WordWrap = msoFalse
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.Text = inhalt
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = groesse
        .TextRange.Font.Bold = msoTrue
        .TextRange.Font.Fill.ForeColor.RGB = schriftFarbe
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
    End With
End Sub

' hinterlegter Hinweisblock (links buendig, Umbruch)
Public Sub Block(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                 fuellung As Long, schriftFarbe As Long, Optional groesse As Single = 9)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, x, y, b, h)
    shp.Name = PRAEFIX & nm
    shp.Adjustments(1) = 0.08
    Fuellen shp, fuellung
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
    With shp.TextFrame2
        .MarginLeft = 12: .MarginRight = 12: .MarginTop = 6: .MarginBottom = 6
        .WordWrap = msoTrue
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.Text = inhalt
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = groesse
        .TextRange.Font.Fill.ForeColor.RGB = schriftFarbe
        .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        .TextRange.ParagraphFormat.SpaceAfter = 0
    End With
End Sub

' art: 1 = primaer (teal), 2 = sekundaer (weiss mit Rand), 3 = Textknopf, 4 = Warnung (amber), 5 = ausgegraut
Public Sub Knopf(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                 art As Long, makro As String)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, x, y, b, h)
    shp.Name = PRAEFIX & "K_" & nm
    shp.Adjustments(1) = 0.3
    Select Case art
        Case 1
            Fuellen shp, C_TEAL
            shp.Line.Visible = msoFalse
        Case 2
            Fuellen shp, C_WEISS
            Rand shp, C_LINIE, 1
        Case 4
            Fuellen shp, C_AMBER_H
            Rand shp, C_AMBER_R, 1
        Case 5
            Fuellen shp, C_FLAECHE
            shp.Line.Visible = msoFalse
        Case Else
            shp.Fill.Visible = msoFalse
            shp.Line.Visible = msoFalse
    End Select
    shp.OnAction = makro
    With shp.TextFrame2
        .MarginLeft = 4: .MarginRight = 4: .MarginTop = 0: .MarginBottom = 0
        .WordWrap = msoFalse
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.Text = inhalt
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = 9.5
        .TextRange.Font.Bold = IIf(art = 3, msoFalse, msoTrue)
        Select Case art
            Case 1: .TextRange.Font.Fill.ForeColor.RGB = C_WEISS
            Case 4: .TextRange.Font.Fill.ForeColor.RGB = C_AMBER
            Case 5: .TextRange.Font.Fill.ForeColor.RGB = C_GRAU2
            Case 3: .TextRange.Font.Fill.ForeColor.RGB = C_GRAU
            Case Else: .TextRange.Font.Fill.ForeColor.RGB = C_SW
        End Select
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
    End With
End Sub

' Auswahl-Chip: gefuellt (teal) = gewaehlt, weiss mit Rand = nicht gewaehlt
Public Sub Chip(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                an As Boolean, makro As String)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, x, y, b, h)
    shp.Name = PRAEFIX & nm
    shp.Adjustments(1) = 0.5
    If an Then
        Fuellen shp, C_TEAL
        shp.Line.Visible = msoFalse
    Else
        Fuellen shp, C_WEISS
        Rand shp, C_LINIE, 1
    End If
    shp.OnAction = makro
    With shp.TextFrame2
        .MarginLeft = 8: .MarginRight = 8: .MarginTop = 0: .MarginBottom = 0
        .WordWrap = msoFalse
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.Text = inhalt
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = 9
        .TextRange.Font.Bold = msoTrue
        .TextRange.Font.Fill.ForeColor.RGB = IIf(an, C_WEISS, C_SW)
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
    End With
End Sub

' Listenzeile: zweizeilig (Titel fett, darunter grau), klickbar
Public Sub Zeile(ws As Object, nm As String, x As Single, y As Single, b As Single, h As Single, titel As String, _
                 unter As String, makro As String, Optional aktiv As Boolean = True, Optional markiert As Boolean = False)
    Dim shp As Object
    Set shp = ws.Shapes.AddShape(5, x, y, b, h)
    shp.Name = PRAEFIX & nm
    shp.Adjustments(1) = 0.12
    If markiert Then
        Fuellen shp, C_TEAL_XL
        Rand shp, C_TEAL, 1.25
    ElseIf aktiv Then
        Fuellen shp, C_WEISS
        Rand shp, C_LINIE_L, 1
    Else
        Fuellen shp, C_FLAECHE
        shp.Line.Visible = msoFalse
    End If
    shp.OnAction = makro
    With shp.TextFrame2
        .MarginLeft = 12: .MarginRight = 120: .MarginTop = 2: .MarginBottom = 2
        .WordWrap = msoTrue
        .VerticalAnchor = msoAnchorMiddle
        .TextRange.Text = titel & vbCr & unter
        .TextRange.Font.Name = SCHRIFT
        .TextRange.Font.Size = 9.5
        .TextRange.Font.Fill.ForeColor.RGB = IIf(aktiv, C_SW, C_GRAU2)
        .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        .TextRange.ParagraphFormat.SpaceAfter = 0
        .TextRange.Paragraphs(1).Font.Bold = msoTrue
        With .TextRange.Paragraphs(2).Font
            .Size = 8.5
            .Bold = msoFalse
            .Fill.ForeColor.RGB = IIf(aktiv, C_GRAU, C_GRAU2)
        End With
    End With
End Sub

' gruener Kreis mit weissem Haken (Linienzug, keine Schriftzeichen)
Public Sub Haken(ws As Object, x As Single, y As Single, Optional farbe As Long = -1)
    Dim ff As Object, shp As Object
    If farbe = -1 Then farbe = C_GRUEN
    Set shp = ws.Shapes.AddShape(9, x, y, 36, 36)
    shp.Name = PRAEFIX & "HakenKreis"
    Fuellen shp, farbe
    shp.Line.Visible = msoFalse
    shp.OnAction = "modKarte.Nichts"
    On Error Resume Next
    Set ff = ws.Shapes.BuildFreeform(msoEditingAuto, x + 10, y + 19)
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 15.8, y + 24.8
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 26.5, y + 12.6
    Set shp = ff.ConvertToShape
    shp.Name = PRAEFIX & "Haken"
    shp.Fill.Visible = msoFalse
    shp.Line.ForeColor.RGB = C_WEISS
    shp.Line.Weight = 3
    shp.OnAction = "modKarte.Nichts"
    On Error GoTo 0
End Sub

' einfache Meldung als Karte mit "OK"
Public Sub Hinweis(titel As String, text As String, Optional fehler As Boolean = False)
    Dim ws As Object, kx As Single, ky As Single, kb As Single, kh As Single
    On Error GoTo Ersatz
    KartenEntfernen
    Set ws = ActiveSheet
    kb = 480
    kh = 130 + 14 * (1 + Len(text) \ 72)
    KarteModal ws, kb, kh, kx, ky
    Beschriftung ws, "HTitel", kx + 28, ky + 24, kb - 56, 22, titel, 14, True, IIf(fehler, C_ROT, C_SW)
    Beschriftung ws, "HText", kx + 28, ky + 56, kb - 56, kh - 110, text, 9.5, False, C_GRAU, True
    Knopf ws, "OK", kx + kb - 28 - 100, ky + kh - 46, 100, 30, "OK", 1, "modKarte.KlickSchliessen"
    Exit Sub
Ersatz:
    MsgBox text, IIf(fehler, vbExclamation, vbInformation), titel
End Sub

' Nummer aus dem Namen der geklickten Form (Ziffern am Ende)
Public Function KlickNummer() As Long
    Dim nm As String, i As Long
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    i = Len(nm)
    Do While i > 0
        If Not (Mid$(nm, i, 1) Like "#") Then Exit Do
        i = i - 1
    Loop
    If i < Len(nm) Then KlickNummer = CLng(Val(Mid$(nm, i + 1)))
End Function

Public Function Kuerzen(s As String, n As Long) As String
    If Len(s) <= n Then Kuerzen = s Else Kuerzen = Left$(s, n - 1) & ChrW(8230)
End Function
