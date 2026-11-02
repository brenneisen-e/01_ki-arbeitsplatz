Option Explicit
' ============================================================================
' modKarte – Karten (Modal-Fenster) als Formen, ohne UserForm (wie im BUE-Reporting)
'
' Alle Formen einer Karte tragen das Praefix KARTE_ und werden mit KartenEntfernen aufgeraeumt.
' Klicks auf Karten loeschen Formen nie im eigenen Klick, sondern per OnTime gleich danach (Planen):
' das Loeschen der geklickten Form im eigenen Makro kann Excel abstuerzen lassen.
' Eingabefelder sind Textfelder ohne Makro: ein Klick hinein oeffnet die Texteingabe.
' ============================================================================

Public Const PRAEFIX As String = "KARTE_"
Private plan As Collection                       ' Warteschlange der Klicks (Planen / PlanAusfuehren)
Private planLaeuft As Boolean
Private planEingeplant As Boolean                ' OnTime fuer PlanAusfuehren steht aus
Private Const SCHRIFT As String = "Liberation Sans"

Public Const C_TEAL As Long = 8220427              ' RGB(11, 111, 125)
Public Const C_TEAL_HELL As Long = 10982415        ' RGB(15, 148, 167)
Public Const C_ROT As Long = 2627007               ' RGB(191, 21, 40)
Public Const C_ROT_HELL As Long = 15460859         ' RGB(251, 233, 235)
Public Const C_SW As Long = 1710618                ' RGB(26, 26, 26)
Public Const C_GRAU As Long = 7039851              ' RGB(107, 107, 107)
Public Const C_GRAUL As Long = 14341584            ' RGB(208, 213, 218)
Public Const C_GRAUXL As Long = 16184563           ' RGB(243, 244, 246)
Public Const C_GRUEN As Long = 5209886             ' RGB(30, 127, 79)
Public Const C_GRUENH As Long = 15004637           ' RGB(221, 243, 228)

Public Sub Nichts()
End Sub

' Flaeche ausdruecklich sichtbar, einfarbig und deckend setzen (nicht vom Standard-Formstil der Datei abhaengen)
Public Sub Fuellen(shp As Shape, farbe As Long, Optional transparenz As Single = 0)
    With shp.Fill
        .Visible = msoTrue
        .Solid
        .ForeColor.RGB = farbe
        .Transparency = transparenz
    End With
End Sub

Public Sub Rand(shp As Shape, farbe As Long, Optional staerke As Single = 1)
    With shp.Line
        .Visible = msoTrue
        .ForeColor.RGB = farbe
        .Weight = staerke
    End With
End Sub

' Klicks laufen ueber eine Warteschlange: Planen merkt die Prozedur, PlanAusfuehren (per OnTime gleich danach) ruft sie auf
' und setzt danach den Fokus zurueck auf das Blatt. Ohne das blieb Excel nach einem Klick, dessen Makro Formen loescht und neu
' zeichnet, oft am alten Klick haengen: der naechste Knopf reagierte erst, nachdem man in eine Zelle geklickt hatte.

Public Sub Planen(prozedur As String)
    On Error Resume Next
    If plan Is Nothing Then Set plan = New Collection
    plan.Add prozedur
    If Not planLaeuft And Not planEingeplant Then
        Err.Clear
        Application.OnTime Now, "'" & Replace(ThisWorkbook.Name, "'", "''") & "'!modKarte.PlanAusfuehren"
        planEingeplant = (Err.Number = 0)
        If Not planEingeplant Then Set plan = Nothing          ' nicht eingeplant: nichts haengen lassen
    End If
    On Error GoTo 0
End Sub

Public Sub PlanAusfuehren()
    Dim p As String, fehler As String
    planEingeplant = False
    If planLaeuft Then Exit Sub
    planLaeuft = True
    On Error GoTo Fehler
    Do While Not plan Is Nothing
        If plan.Count = 0 Then Exit Do
        p = CStr(plan(1))
        plan.Remove 1
        Application.Run "'" & Replace(ThisWorkbook.Name, "'", "''") & "'!" & p
    Loop
Ende:
    Set plan = Nothing
    planLaeuft = False
    Application.EnableEvents = True
    FokusZurueck
    If Len(fehler) > 0 Then Hinweis "Fehler", fehler, True
    Exit Sub
Fehler:
    fehler = "Beim Ausführen von " & p & " ist ein Fehler aufgetreten: " & Err.Description
    Resume Ende
End Sub

' Fokus zurueck auf die Zellen des aktiven Blatts (die Auswahl bleibt, wo sie war)
Public Sub FokusZurueck()
    On Error Resume Next
    DoEvents
    If TypeName(Selection) = "Range" Then
        ActiveCell.Select
    Else
        ActiveWindow.RangeSelection.Cells(1, 1).Select
    End If
    On Error GoTo 0
End Sub

Public Sub KartenEntfernen()
    Dim i As Long, ws As Worksheet
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

' abgedunkelter Hintergrund ueber dem sichtbaren Bereich und Karte in der Mitte
Public Sub KarteModal(ws As Worksheet, kb As Single, kh As Single, ByRef kx As Single, ByRef ky As Single)
    Dim sichtbar As Range
    Set sichtbar = ActiveWindow.VisibleRange
    With ws.Shapes.AddShape(1, sichtbar.Left, sichtbar.Top, sichtbar.Width, sichtbar.Height)
        .Name = PRAEFIX & "Schleier"
        Fuellen ws.Shapes(PRAEFIX & "Schleier"), C_SW, 0.5
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
    End With
    kx = sichtbar.Left + (sichtbar.Width - kb) / 2
    ky = sichtbar.Top + (sichtbar.Height - kh) / 2 - 20
    If kx < sichtbar.Left + 10 Then kx = sichtbar.Left + 10
    If ky < sichtbar.Top + 10 Then ky = sichtbar.Top + 10
    Karte ws, kx, ky, kb, kh
End Sub

Public Sub Karte(ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single)
    With ws.Shapes.AddShape(5, kx, ky, kb, kh)
        .Name = PRAEFIX & "Karte"
        .Adjustments(1) = 0.03
        Fuellen ws.Shapes(PRAEFIX & "Karte"), RGB(255, 255, 255)
        Rand ws.Shapes(PRAEFIX & "Karte"), C_GRAUL, 0.75
        .Shadow.Visible = msoTrue
        .Shadow.Blur = 22
        .Shadow.OffsetX = 0
        .Shadow.OffsetY = 8
        .Shadow.Transparency = 0.7
        .Shadow.ForeColor.RGB = RGB(0, 0, 0)
        .OnAction = "modKarte.Nichts"
    End With
End Sub

Public Sub Beschriftung(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                 groesse As Single, fett As Boolean, farbe As Long, Optional umbruch As Boolean = False)
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = PRAEFIX & nm
        .Fill.Visible = msoFalse
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
        .TextFrame2.MarginLeft = 0: .TextFrame2.MarginRight = 0: .TextFrame2.MarginTop = 0: .TextFrame2.MarginBottom = 0
        .TextFrame2.WordWrap = IIf(umbruch, msoTrue, msoFalse)
        .TextFrame2.VerticalAnchor = IIf(umbruch, msoAnchorTop, msoAnchorMiddle)
        With .TextFrame2.TextRange
            .Text = inhalt
            .Font.Name = SCHRIFT
            .Font.Size = groesse
            .Font.Bold = fett
            .Font.Fill.ForeColor.RGB = farbe
            .ParagraphFormat.SpaceAfter = 0
        End With
    End With
End Sub

' hinterlegter Hinweisblock
Public Sub Pille(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, fuellung As Long, schrift As Long)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.12
        Fuellen ws.Shapes(PRAEFIX & nm), fuellung
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
        With .TextFrame2
            .MarginLeft = 12: .MarginRight = 12: .MarginTop = 6: .MarginBottom = 6
            .WordWrap = msoTrue
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 9
            .TextRange.Font.Fill.ForeColor.RGB = schrift
            .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        End With
    End With
End Sub

' art: 1 = primaer (petrol), 2 = sekundaer (weiss mit Rand), 3 = Textknopf (grau), 4 = PowerPoint (rot)
Public Sub Knopf(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, art As Long, makro As String)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & "K_" & nm
        .Adjustments(1) = 0.25
        Select Case art
            Case 1, 4
                Fuellen ws.Shapes(PRAEFIX & "K_" & nm), IIf(art = 1, C_TEAL, C_ROT)
                .Line.Visible = msoFalse
            Case 2
                Fuellen ws.Shapes(PRAEFIX & "K_" & nm), RGB(255, 255, 255)
                Rand ws.Shapes(PRAEFIX & "K_" & nm), C_GRAUL, 1
            Case Else
                .Fill.Visible = msoFalse
                .Line.Visible = msoFalse
        End Select
        .OnAction = makro
        With .TextFrame2
            .MarginLeft = 4: .MarginRight = 4: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 9.5
            .TextRange.Font.Bold = IIf(art = 3, msoFalse, msoTrue)
            .TextRange.Font.Fill.ForeColor.RGB = IIf(art = 1 Or art = 4, RGB(255, 255, 255), IIf(art = 2, C_SW, C_GRAU))
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
End Sub

' Auswahl-Chip: gefuellt (petrol, weisse Schrift) = gewaehlt, weiss mit Rand = nicht gewaehlt; zusatz rechts in kleiner Schrift
Public Sub Chip(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, an As Boolean, _
                makro As String, Optional zusatz As String = "", Optional zusatzFarbe As Long = -1, Optional links As Boolean = False)
    Dim t As String, n As Long
    t = inhalt
    If Len(zusatz) > 0 Then t = t & vbCr & zusatz
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.2
        If an Then
            Fuellen ws.Shapes(PRAEFIX & nm), C_TEAL
            .Line.Visible = msoFalse
        Else
            Fuellen ws.Shapes(PRAEFIX & nm), RGB(255, 255, 255)
            Rand ws.Shapes(PRAEFIX & nm), C_GRAUL, 1
        End If
        .OnAction = makro
        With .TextFrame2
            .MarginLeft = 10: .MarginRight = 8: .MarginTop = 2: .MarginBottom = 2
            .WordWrap = msoTrue
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = t
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 9.5
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = IIf(an, RGB(255, 255, 255), C_SW)
            .TextRange.ParagraphFormat.Alignment = IIf(links, msoAlignLeft, msoAlignCenter)
            .TextRange.ParagraphFormat.SpaceAfter = 0
            If Len(zusatz) > 0 Then
                n = .TextRange.Paragraphs.Count
                With .TextRange.Paragraphs(n).Font
                    .Size = 8
                    .Bold = msoFalse
                    If zusatzFarbe >= 0 And Not an Then .Fill.ForeColor.RGB = zusatzFarbe
                End With
            End If
        End With
    End With
End Sub

' Eingabefeld: Textfeld ohne Makro (Klick hinein = Texteingabe), weiss mit Rand
Public Sub Eingabefeld(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, groesse As Single)
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = PRAEFIX & nm
        Fuellen ws.Shapes(PRAEFIX & nm), RGB(255, 255, 255)
        Rand ws.Shapes(PRAEFIX & nm), C_GRAUL, 1
        .Placement = xlFreeFloating
        With .TextFrame2
            .MarginLeft = 6: .MarginRight = 6: .MarginTop = 4: .MarginBottom = 4
            .WordWrap = msoTrue
            .AutoSize = msoAutoSizeNone
            .VerticalAnchor = msoAnchorTop
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = groesse
            .TextRange.Font.Fill.ForeColor.RGB = C_SW
            .TextRange.ParagraphFormat.Alignment = msoAlignLeft
            .TextRange.ParagraphFormat.SpaceAfter = 0
        End With
    End With
End Sub

' Text eines Eingabefelds mit Zeilenumbruechen als vbLf
Public Function FeldText(ws As Worksheet, nm As String) As String
    Dim t As String
    On Error Resume Next
    t = ws.Shapes(PRAEFIX & nm).TextFrame2.TextRange.Text
    On Error GoTo 0
    t = Replace(t, vbCrLf, vbLf)
    t = Replace(t, vbCr, vbLf)
    t = Replace(t, Chr(11), vbLf)
    FeldText = t
End Function

' gruener Kreis mit weissem Haken (Linienzug, keine Schriftzeichen)
Public Sub Haken(ws As Worksheet, x As Single, y As Single)
    Dim ff As Object
    With ws.Shapes.AddShape(9, x, y, 40, 40)
        .Name = PRAEFIX & "HakenKreis"
        Fuellen ws.Shapes(PRAEFIX & "HakenKreis"), C_GRUEN
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
    End With
    On Error Resume Next
    Set ff = ws.Shapes.BuildFreeform(msoEditingAuto, x + 11, y + 21)
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 17.5, y + 27.5
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 29.5, y + 14
    With ff.ConvertToShape
        .Name = PRAEFIX & "Haken"
        .Fill.Visible = msoFalse
        .Line.ForeColor.RGB = RGB(255, 255, 255)
        .Line.Weight = 3
        .OnAction = "modKarte.Nichts"
    End With
    On Error GoTo 0
End Sub

' einfache Meldung als Karte mit "OK"
Public Sub Hinweis(titel As String, text As String, Optional fehler As Boolean = False)
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    On Error GoTo Ersatz
    KartenEntfernen
    Set ws = ActiveSheet
    kb = 460
    kh = 140 + 14 * (1 + Len(text) \ 70)
    KarteModal ws, kb, kh, kx, ky
    Beschriftung ws, "HTitel", kx + 28, ky + 22, kb - 56, 22, titel, 14, True, IIf(fehler, C_ROT, C_SW)
    Beschriftung ws, "HText", kx + 28, ky + 52, kb - 56, kh - 110, text, 9.5, False, C_GRAU, True
    Knopf ws, "OK", kx + kb - 28 - 100, ky + kh - 46, 100, 30, "OK", 1, "modKarte.KlickSchliessen"
    Exit Sub
Ersatz:
    MsgBox text, IIf(fehler, vbExclamation, vbInformation), titel
End Sub

' Nummer aus dem Namen der geklickten Form (letzte zwei Ziffern)
Public Function KlickNummer() As Long
    Dim nm As String
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    If Len(nm) >= 2 Then KlickNummer = CLng(Val(Right$(nm, 2)))
End Function

Public Function DatumLang(d As Date) As String
    DatumLang = Choose(Weekday(d, vbMonday), "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag") & _
                ", " & Format(d, "dd.mm.yyyy")
End Function
