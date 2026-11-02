Option Explicit
' ============================================================================
' modFolienauswahl – Karte "Welche Kacheln sollen auf die Folie?" vor dem PowerPoint-Export
'
' Die sechs Kacheln des Blatts PPT stehen als Kaestchen in derselben Anordnung wie auf dem Blatt (3 x 2); ein Klick
' schaltet eine Kachel an oder ab. Die Auswahl steht als "111111" in Filter!O46 und gilt beim naechsten Mal wieder.
' "Folie erzeugen" ruft modPPT.NachPowerPoint mit der Auswahl auf; dort werden nur diese Kacheln kopiert und auf der
' Folie neu angeordnet (1-3 in einer Reihe, 4 als 2 x 2, 5-6 in zwei Reihen).
' Zeichnet mit den Bausteinen aus modTagesablauf (gleicher Stil, gleiches Praefix TAGW_ zum Aufraeumen).
' ============================================================================

Private Const PRAEFIX As String = "TAGW_"
Private Const C_TEAL As Long = 8220427              ' RGB(11, 111, 125)
Private Const C_TEALT As Long = 16250606            ' RGB(238, 246, 247)
Private Const C_SW As Long = 1710618                ' RGB(26, 26, 26)
Private Const C_GRAU As Long = 7039851              ' RGB(107, 107, 107)
Private Const C_GRAUM As Long = 11379610            ' RGB(154, 163, 173)
Private Const C_GRAUL As Long = 14341584            ' RGB(208, 213, 218)
Private Const C_ROTD As Long = 1970062              ' RGB(142, 15, 30)
Private Const C_GRAUD As Long = 4868682             ' RGB(74, 74, 74)

Private auswahl As String                           ' "111111": je Kachel 1 = auf die Folie
Private kx As Single, ky As Single, kb As Single, kh As Single
Private umschaltNr As Long

Public Function FolienauswahlVersion() As String
    FolienauswahlVersion = "1"
End Function

Private Function Titel(i As Long) As String
    Titel = Choose(i + 1, "Rückstand OPAG", "Rückstand Verbund", "Kapazität (MAK) je KW", _
                   "Eingänge/Abgänge OPAG", "Eingänge/Abgänge Verbund", "Altersstruktur")
End Function

Private Function Farbe(i As Long) As Long
    Select Case i
        Case 0, 3: Farbe = C_ROTD
        Case 1, 4: Farbe = C_TEAL
        Case Else: Farbe = C_GRAUD
    End Select
End Function

Public Function GespeicherteAuswahl() As String
    Dim t As String
    On Error Resume Next
    t = Trim$(CStr(ThisWorkbook.Worksheets("Filter").Range("O46").Value))
    On Error GoTo 0
    If Len(t) <> 6 Or Len(Replace(Replace(t, "0", ""), "1", "")) > 0 Then t = "111111"
    GespeicherteAuswahl = t
End Function

' ---------------------------------------------------------------- Einstieg (Knopf "PowerPoint-Folie erzeugen")
Public Sub Zeigen()
    Dim ws As Worksheet
    If modLaden.LadenLaeuft() Then Exit Sub
    On Error GoTo Ersatz
    modTagesablauf.KartenEntfernen
    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    auswahl = GespeicherteAuswahl()
    kb = 580: kh = 360
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    modTagesablauf.Beschriftung ws, "Schritt", kx + 28, ky + 20, kb - 56, 14, "POWERPOINT-FOLIE", 8, True, C_TEAL
    modTagesablauf.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Welche Kacheln sollen auf die Folie?", 15, True, C_SW
    modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 68, kb - 56, 18, _
         "Anklicken schaltet eine Kachel an oder ab. Die Auswahl wird für das nächste Mal gemerkt.", 9.5, False, C_GRAU
    KachelnZeichnen ws
    modTagesablauf.Knopf ws, "Folie", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Folie erzeugen", 4, "modFolienauswahl.KlickErzeugen"
    modTagesablauf.Knopf ws, "Abbrechen", kx + kb - 28 - 150 - 12 - 110, ky + kh - 50, 110, 30, "Abbrechen", 2, "modFolienauswahl.KlickAbbrechen"
    modTagesablauf.Knopf ws, "Alle", kx + 20, ky + kh - 50, 100, 30, "Alle auswählen", 3, "modFolienauswahl.KlickAlle"
    Exit Sub
Ersatz:
    On Error Resume Next
    modTagesablauf.KartenEntfernen
    modPPT.NachPowerPoint GespeicherteAuswahl()
End Sub

' Kaestchen je Kachel (3 x 2 wie auf dem Blatt PPT) und Zaehler darunter
Private Sub KachelnZeichnen(ws As Worksheet)
    Dim i As Long, n As Long
    For i = 0 To 5
        KachelZeichnen ws, i
        If Mid$(auswahl, i + 1, 1) = "1" Then n = n + 1
    Next i
    On Error Resume Next
    ws.Shapes(PRAEFIX & "Zaehler").Delete
    On Error GoTo 0
    modTagesablauf.Beschriftung ws, "Zaehler", kx + 28, ky + 274, kb - 56, 16, _
        IIf(n = 0, "Keine Kachel ausgewählt", n & " von 6 Kacheln · " & Anordnung(n)), 8.5, False, IIf(n = 0, RGB(191, 21, 40), C_GRAU)
End Sub

Private Function Anordnung(n As Long) As String
    Select Case n
        Case 1: Anordnung = "eine Kachel, vergrößert"
        Case 2, 3: Anordnung = "nebeneinander in einer Reihe"
        Case 4: Anordnung = "zwei Reihen zu je zwei"
        Case Else: Anordnung = "zwei Reihen zu je drei"
    End Select
End Function

Private Sub KachelZeichnen(ws As Worksheet, i As Long)
    Dim x As Single, y As Single, b As Single, h As Single, an As Boolean, nm As String, k As Long
    Dim ff As Object
    b = (kb - 56 - 2 * 12) / 3: h = 78
    x = kx + 28 + (i Mod 3) * (b + 12)
    y = ky + 98 + (i \ 3) * (h + 12)
    an = (Mid$(auswahl, i + 1, 1) = "1")
    nm = PRAEFIX & "T" & i & "_"
    ' alte Formen dieser Kachel entfernen (beim Umschalten)
    On Error Resume Next
    For k = ws.Shapes.Count To 1 Step -1
        If Left$(ws.Shapes(k).Name, Len(nm)) = nm Then ws.Shapes(k).Delete
    Next k
    On Error GoTo 0
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = nm & "Feld"
        .Adjustments(1) = 0.1
        .Fill.ForeColor.RGB = IIf(an, C_TEALT, RGB(255, 255, 255))
        .Line.ForeColor.RGB = IIf(an, C_TEAL, C_GRAUL)
        .Line.Weight = IIf(an, 2, 1)
        .OnAction = "modFolienauswahl.KlickKachel"
    End With
    ' Kopfleiste in der Kachelfarbe (wie der Kachelkopf auf der Folie)
    With ws.Shapes.AddShape(5, x + 10, y + 10, 28, 5)
        .Name = nm & "Farbe"
        .Adjustments(1) = 0.5
        .Fill.ForeColor.RGB = Farbe(i)
        .Line.Visible = msoFalse
        If Not an Then .Fill.Transparency = 0.6
        .OnAction = "modFolienauswahl.KlickKachel"
    End With
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x + 10, y + 30, b - 20, 36)
        .Name = nm & "Titel"
        .Fill.Visible = msoFalse
        .Line.Visible = msoFalse
        .OnAction = "modFolienauswahl.KlickKachel"
        .TextFrame2.MarginLeft = 0: .TextFrame2.MarginRight = 0: .TextFrame2.MarginTop = 0: .TextFrame2.MarginBottom = 0
        .TextFrame2.WordWrap = msoTrue
        .TextFrame2.VerticalAnchor = msoAnchorTop
        With .TextFrame2.TextRange
            .Text = Titel(i) & vbLf & IIf(an, "auf der Folie", "nicht auf der Folie")
            .Font.Name = "Liberation Sans"
            .Font.Size = 8
            .Font.Fill.ForeColor.RGB = IIf(an, C_TEAL, C_GRAUM)
            .Paragraphs(1).Font.Size = 9
            .Paragraphs(1).Font.Bold = msoTrue
            .Paragraphs(1).Font.Fill.ForeColor.RGB = IIf(an, C_SW, C_GRAU)
        End With
    End With
    ' Auswahlkreis oben rechts: gefuellt mit Haken (an) bzw. leerer Ring (aus)
    With ws.Shapes.AddShape(9, x + b - 28, y + 8, 18, 18)
        .Name = nm & "Kreis"
        If an Then
            .Fill.ForeColor.RGB = C_TEAL
            .Line.Visible = msoFalse
        Else
            .Fill.ForeColor.RGB = RGB(255, 255, 255)
            .Line.ForeColor.RGB = C_GRAUL
            .Line.Weight = 1.25
        End If
        .OnAction = "modFolienauswahl.KlickKachel"
    End With
    If an Then
        On Error Resume Next
        Set ff = ws.Shapes.BuildFreeform(msoEditingAuto, x + b - 23.5, y + 17.5)
        ff.AddNodes msoSegmentLine, msoEditingAuto, x + b - 20.5, y + 20.5
        ff.AddNodes msoSegmentLine, msoEditingAuto, x + b - 14.5, y + 13.5
        With ff.ConvertToShape
            .Name = nm & "Haken"
            .Fill.Visible = msoFalse
            .Line.ForeColor.RGB = RGB(255, 255, 255)
            .Line.Weight = 1.75
            .OnAction = "modFolienauswahl.KlickKachel"
        End With
        On Error GoTo 0
    End If
End Sub

' ---------------------------------------------------------------- Klicks
Public Sub KlickKachel()
    Dim nm As String, p As Long
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    p = InStr(nm, PRAEFIX & "T")
    If p = 0 Then Exit Sub
    umschaltNr = CLng(Val(Mid$(nm, p + Len(PRAEFIX) + 1, 1)))
    ' die geklickte Form nicht im eigenen Makro loeschen: Neuzeichnen gleich danach
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modFolienauswahl.Umschalten"
End Sub

Public Sub Umschalten()
    Dim ws As Worksheet
    If umschaltNr < 0 Or umschaltNr > 5 Then Exit Sub
    If Len(auswahl) <> 6 Then auswahl = GespeicherteAuswahl()
    Mid$(auswahl, umschaltNr + 1, 1) = IIf(Mid$(auswahl, umschaltNr + 1, 1) = "1", "0", "1")
    Set ws = ActiveSheet
    Application.ScreenUpdating = False
    KachelnZeichnen ws
    Application.ScreenUpdating = True
End Sub

Public Sub KlickAlle()
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modFolienauswahl.AlleAn"
End Sub

Public Sub AlleAn()
    auswahl = "111111"
    Application.ScreenUpdating = False
    KachelnZeichnen ActiveSheet
    Application.ScreenUpdating = True
End Sub

Public Sub KlickAbbrechen()
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modTagesablauf.KartenEntfernen"
End Sub

Public Sub KlickErzeugen()
    If InStr(auswahl, "1") = 0 Then Exit Sub                 ' nichts gewaehlt: der Zaehler zeigt es rot
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modFolienauswahl.Erzeugen"
End Sub

Public Sub Erzeugen()
    On Error Resume Next
    ThisWorkbook.Worksheets("Filter").Range("O46").Value = "'" & auswahl
    modTagesablauf.KartenEntfernen
    On Error GoTo 0
    modPPT.NachPowerPoint auswahl
End Sub
