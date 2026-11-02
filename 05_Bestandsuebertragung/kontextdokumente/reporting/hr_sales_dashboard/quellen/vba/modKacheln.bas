Option Explicit
' ============================================================================
' modKacheln – Kacheln einer Folie aus- und wieder einblenden (Knopf "Kacheln ein-/ausblenden" auf PPT_2 und PPT_3)
'
'   Zeigen      Karte mit allen Kacheln des Blatts; ein Klick blendet die Kachel aus bzw. wieder ein.
'   Anordnen    verteilt die sichtbaren Kacheln neu auf die Inhaltsflaeche: bis drei Kacheln in einer Reihe, sonst zwei
'               Reihen, oben die kleinere Haelfte (7 -> 3 + 4, 6 -> 3 + 3, 5 -> 2 + 3, 4 -> 2 + 2). Die Breite richtet sich
'               nach der Zahl der Kacheln in der Reihe: Kopf, Grund, Ueberschriften und Diagramme werden breiter oder
'               schmaler, Legende und Nummer behalten ihren Abstand zum linken Rand, SLA-Angabe und Stand den zum rechten.
' Die Kacheln behalten ihre Nummer (die Kommentare verweisen darauf). Ausgeblendete Kacheln gehen nicht in die PowerPoint.
' Alle Formen einer Kachel tragen das Praefix K<Nummer>_ (vom Build gesetzt); der Zustand wird mit der Datei gespeichert.
' Formen mit "_Trenn" im Namen (Trennlinie zwischen aktuellen Monaten und Planmonaten, Mitarbeiter-Kapazitaeten) bleiben
' anteilig an derselben Stelle der Kachel (Mitte des Diagramms), auch wenn die Kachel breiter oder schmaler wird.
' ============================================================================

Private Const INHALT_X As Single = 40          ' Inhaltsflaeche der Folie (Punkte ab Folienecke, wie im Build)
Private Const INHALT_B As Single = 630
Private Const KACHEL_Y As Single = 104
Private Const KACHEL_H As Single = 186
Private Const LUECKE As Single = 8
Private Const MAX_KACHELN As Long = 20

Private ziel As Long                           ' Nummer der angeklickten Kachel

Public Function KachelnVersion() As String
    KachelnVersion = "2"
End Function

Private Function IstFolie(nm As String) As Boolean
    IstFolie = (nm = "PPT_2" Or nm = "PPT_3")
End Function

' Nummern der Kacheln des Blatts aufsteigend in nr(1..n); Rueckgabe n
Private Function Nummern(ws As Worksheet, ByRef nr() As Long) As Long
    Dim s As Shape, n As Long, i As Long, j As Long, t As Long, nm As String
    ReDim nr(1 To MAX_KACHELN)
    For Each s In ws.Shapes
        nm = s.Name
        If nm Like "K#_Kopf" Or nm Like "K##_Kopf" Then
            If n < MAX_KACHELN Then
                n = n + 1
                nr(n) = CLng(Mid$(nm, 2, InStr(nm, "_") - 2))
            End If
        End If
    Next s
    For i = 1 To n - 1
        For j = i + 1 To n
            If nr(j) < nr(i) Then t = nr(i): nr(i) = nr(j): nr(j) = t
        Next j
    Next i
    Nummern = n
End Function

Private Function Sichtbar(ws As Worksheet, nr As Long) As Boolean
    On Error Resume Next
    Sichtbar = (ws.Shapes("K" & nr & "_Kopf").Visible = msoTrue)
    On Error GoTo 0
End Function

Private Function Titel(ws As Worksheet, nr As Long) As String
    On Error Resume Next
    Titel = Trim$(ws.Shapes("K" & nr & "_Titel").TextFrame2.TextRange.Text)
    On Error GoTo 0
    If Len(Titel) = 0 Then Titel = "Kachel " & nr
End Function

' ---------------------------------------------------------------- Karte
Public Sub Zeigen()
    Dim ws As Worksheet, nr() As Long, n As Long, i As Long, kx As Single, ky As Single, kb As Single, kh As Single
    Dim an As Boolean, zusatz As String
    Set ws = ActiveSheet
    If Not IstFolie(ws.Name) Then
        modKarte.Hinweis "Kacheln ein-/ausblenden", "Bitte zuerst eine Folie öffnen (PPT_2 und PPT_3).", False
        Exit Sub
    End If
    modKarte.KartenEntfernen
    n = Nummern(ws, nr)
    If n = 0 Then
        modKarte.Hinweis "Kacheln ein-/ausblenden", "Auf diesem Blatt gibt es keine Kacheln.", False
        Exit Sub
    End If
    kb = 560: kh = 170 + n * 40
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "KACHELN EIN-/AUSBLENDEN  ·  " & UCase$(ws.Name), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Welche Kacheln stehen auf der Folie?", 16, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 30, _
        "Ein Klick blendet eine Kachel aus oder wieder ein. Die übrigen ordnen sich neu an und nutzen die freie Breite.", _
        9.5, False, modKarte.C_GRAU, True
    For i = 1 To n
        an = Sichtbar(ws, nr(i))
        If an Then
            zusatz = "auf der Folie – Klick blendet sie aus"
        Else
            zusatz = "ausgeblendet – Klick zeigt sie wieder"
        End If
        modKarte.Chip ws, "T_" & Format(nr(i), "00"), kx + 28, ky + 106 + (i - 1) * 40, kb - 56, 32, nr(i) & "  " & Titel(ws, nr(i)), an, _
            "modKacheln.KlickKachel", zusatz, modKarte.C_GRAU, True
    Next i
    modKarte.Knopf ws, "Fertig", kx + kb - 28 - 110, ky + kh - 46, 110, 30, "Fertig", 1, "modKarte.KlickSchliessen"
    modKarte.Knopf ws, "Alle", kx + 20, ky + kh - 46, 150, 30, "Alle einblenden", 3, "modKacheln.KlickAlle"
End Sub

Public Sub KlickKachel()
    ziel = modKarte.KlickNummer()
    If ziel > 0 Then modKarte.Planen "modKacheln.Umschalten"
End Sub

Public Sub KlickAlle()
    modKarte.Planen "modKacheln.AlleEinblenden"
End Sub

Public Sub Umschalten()
    Dim ws As Worksheet, nr() As Long, n As Long, i As Long, m As Long
    Set ws = ActiveSheet
    If ziel = 0 Then Exit Sub
    n = Nummern(ws, nr)
    For i = 1 To n
        If Sichtbar(ws, nr(i)) Then m = m + 1
    Next i
    If Sichtbar(ws, ziel) And m <= 1 Then
        modKarte.KartenEntfernen
        modKarte.Hinweis "Kacheln ein-/ausblenden", "Mindestens eine Kachel muss auf der Folie bleiben.", False
        Exit Sub
    End If
    Application.ScreenUpdating = False
    modKarte.KartenEntfernen
    KachelZeigen ws, ziel, Not Sichtbar(ws, ziel)
    Anordnen ws
    Application.ScreenUpdating = True
    Zeigen
End Sub

Public Sub AlleEinblenden()
    Dim ws As Worksheet, nr() As Long, n As Long, i As Long
    Set ws = ActiveSheet
    Application.ScreenUpdating = False
    modKarte.KartenEntfernen
    n = Nummern(ws, nr)
    For i = 1 To n
        KachelZeigen ws, nr(i), True
    Next i
    Anordnen ws
    Application.ScreenUpdating = True
    Zeigen
End Sub

' ---------------------------------------------------------------- Ein-/Ausblenden und Anordnen
Private Sub KachelZeigen(ws As Worksheet, nr As Long, an As Boolean)
    Dim s As Shape, p As String
    p = "K" & nr & "_"
    For Each s In ws.Shapes
        If Left$(s.Name, Len(p)) = p Then s.Visible = IIf(an, msoTrue, msoFalse)
    Next s
End Sub

Public Sub Anordnen(ws As Worksheet)
    Dim nr() As Long, n As Long, i As Long, sicht() As Long, m As Long, oben As Long, reihe As Long, idx As Long, anz As Long
    Dim ox As Single, oy As Single, sx As Single, b As Single, x As Single, y As Single
    n = Nummern(ws, nr)
    If n = 0 Then Exit Sub
    ReDim sicht(1 To n)
    For i = 1 To n
        If Sichtbar(ws, nr(i)) Then
            m = m + 1
            sicht(m) = nr(i)
        End If
    Next i
    If m = 0 Then Exit Sub
    ox = ws.Shapes("DEKO_Folie").Left
    oy = ws.Shapes("DEKO_Folie").Top
    ' Excel zeichnet die fest verankerte Folie je nach Rechner etwas schmaler oder breiter als 960 pt (wie in modKommentar)
    sx = ws.Shapes("DEKO_Folie").Width / 960
    If sx < 0.7 Or sx > 1.3 Then sx = 1
    If m <= 3 Then
        oben = m
    Else
        oben = m \ 2
    End If
    For i = 1 To m
        If i <= oben Then
            reihe = 0: idx = i - 1: anz = oben
        Else
            reihe = 1: idx = i - oben - 1: anz = m - oben
        End If
        b = (INHALT_B - (anz - 1) * LUECKE) / anz
        x = INHALT_X + idx * (b + LUECKE)
        y = KACHEL_Y + reihe * (KACHEL_H + LUECKE)
        KachelSetzen ws, sicht(i), ox + x * sx, oy + y, b * sx
    Next i
End Sub

' verschiebt alle Formen der Kachel nr an (tx, ty) mit der Breite tb. Breite Formen (Kopf, Grund, Ueberschriften, Diagramme)
' behalten ihren Rand links und rechts, schmale Formen ihren Abstand zum linken Rand, SLA-Angabe und Stand den zum rechten Rand.
Private Sub KachelSetzen(ws As Worksheet, nr As Long, tx As Single, ty As Single, tb As Single)
    Dim s As Shape, p As String, cx As Single, cy As Single, cb As Single, d As Single
    p = "K" & nr & "_"
    On Error GoTo Ende
    cx = ws.Shapes(p & "Kopf").Left
    cy = ws.Shapes(p & "Kopf").Top
    cb = ws.Shapes(p & "Kopf").Width
    If cb <= 0 Then Exit Sub
    If Abs(cx - tx) < 0.2 And Abs(cy - ty) < 0.2 And Abs(cb - tb) < 0.2 Then Exit Sub
    d = tb - cb
    For Each s In ws.Shapes
        If Left$(s.Name, Len(p)) = p Then
            If InStr(s.Name, "_Trenn") > 0 Then
                s.Left = tx + (s.Left + s.Width / 2 - cx) * tb / cb - s.Width / 2
            ElseIf s.Width >= 0.5 * cb Then
                s.Left = tx + (s.Left - cx)
                s.Width = s.Width + d
            ElseIf InStr(s.Name, "_SLA_") > 0 Or Right$(s.Name, 6) = "_Stand" Then
                s.Left = tx + (s.Left - cx) + d
            Else
                s.Left = tx + (s.Left - cx)
            End If
            s.Top = ty + (s.Top - cy)
        End If
    Next s
Ende:
End Sub
