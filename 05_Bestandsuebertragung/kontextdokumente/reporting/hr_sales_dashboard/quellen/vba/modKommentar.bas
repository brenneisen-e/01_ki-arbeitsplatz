Option Explicit
' ============================================================================
' modKommentar – Kommentare je Kachel pflegen und das Kommentarfeld der Folie zeichnen
'
'   Zeigen          (Knopf "Kommentare bearbeiten" im PPT-Blatt) Fenster mit allen Kacheln der Folie links;
'                   rechts Nummer, Ueberschrift und Text der gewaehlten Kachel als Eingabefelder. Das Textfeld zeigt die
'                   Aufzaehlung schon so wie das Kommentarfeld: jeder Absatz ein Punkt (Enter = neuer Punkt), Zeilen mit
'                   "-" am Anfang eingerueckt als Unterpunkt. Die Punkte sind Absatzformat, nicht Text; gespeichert wird
'                   wie bisher eine Zeile je Punkt.
'   Speichern       schreibt in das Blatt Kommentare (A Blatt, B Kachel, C Nr., D Ueberschrift, E Text) und
'                   zeichnet das Kommentarfeld neu.
'   PanelZeichnen   setzt das Kommentarfeld im grauen Bereich der Folie: Nummernkreis, Ueberschrift, Text mit
'                   Aufzaehlungspunkten; jede Zeile ist ein Punkt, Zeilen mit "-" am Anfang sind Unterpunkte.
'                   Die Hoehen ergeben sich aus dem Text (automatische Groesse), nichts muss verschoben werden.
'                   Passt alles nicht hinein, wird die Schrift schrittweise kleiner.
' Formen des Kommentarfelds tragen das Praefix KOM_ und gehen mit in die PowerPoint.
' ============================================================================

Private Const KOM As String = "KOM_"
Private Const PANEL_X As Single = 700           ' Lage im Folienraster (Punkte ab Folienecke, wie im Build)
Private Const PANEL_B As Single = 244
Private Const PANEL_Y As Single = 94
Private Const PANEL_UNTEN As Single = 505        ' Unterkante fuer den Text (Folie 540 hoch, Fusszeile ab 530; PowerPoint setzt
                                                 ' den Text etwas hoeher als Excel – deshalb mit Luft)
Private Const K_START As Long = 5                ' erste Zeile im Blatt Kommentare
Private Const TEXT_X As Single = 26              ' Ueberschrift und Text aller Eintraege beginnen auf derselben Linie

Private blattAkt As String
Private kachelAkt As Long, kachelZiel As Long
Private kZeile() As Long, kTitel() As String, nKacheln As Long

Public Function KommentarVersion() As String
    KommentarVersion = "3"
End Function

Private Function IstFolie(nm As String) As Boolean
    IstFolie = (nm = "PPT_2" Or nm = "PPT_3")
End Function

Private Function Farbe(blatt As String) As Long
    Select Case blatt
        Case "PPT_3": Farbe = RGB(0, 146, 132)
        Case Else: Farbe = RGB(179, 23, 103)
    End Select
End Function

Private Function FolienTitel(blatt As String) As String
    Dim r As Long
    r = 20 + CLng(Val(Right$(blatt, 1)))
    FolienTitel = CStr(ThisWorkbook.Worksheets("Konfiguration").Cells(r, 3).Value)
End Function

' ---------------------------------------------------------------- Auswahl der Folie (von der Startseite)
Public Sub ZeigenAuswahl()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, b As Single
    modKarte.KartenEntfernen
    If IstFolie(ActiveSheet.Name) Then
        Zeigen
        Exit Sub
    End If
    Set ws = ActiveSheet
    kb = 560: kh = 250
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "KOMMENTARE", 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Für welche Folie?", 16, True, modKarte.C_SW
    b = kb - 56
    For i = 2 To 3
        modKarte.Chip ws, "F_" & Format(i, "00"), kx + 28, ky + 76 + (i - 2) * 40, b, 32, FolienTitel("PPT_" & i), False, "modKommentar.KlickFolie", , , True
    Next i
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 46, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

Public Sub KlickFolie()
    blattAkt = "PPT_" & modKarte.KlickNummer()
    modKarte.Planen "modKommentar.FolieOeffnen"
End Sub

Public Sub FolieOeffnen()
    modKarte.KartenEntfernen
    ThisWorkbook.Worksheets(blattAkt).Activate
    ActiveWindow.ScrollRow = 1
    ActiveWindow.ScrollColumn = 1
    kachelAkt = 1
    EditorZeichnen
End Sub

' ---------------------------------------------------------------- Editor
Public Sub Zeigen()
    If Not IstFolie(ActiveSheet.Name) Then
        ZeigenAuswahl
        Exit Sub
    End If
    blattAkt = ActiveSheet.Name
    kachelAkt = 1
    modKarte.KartenEntfernen
    EditorZeichnen
End Sub

Private Sub KachelnLesen()
    Dim wk As Worksheet, r As Long
    Set wk = ThisWorkbook.Worksheets("Kommentare")
    nKacheln = 0
    ReDim kZeile(1 To 12): ReDim kTitel(1 To 12)
    r = K_START
    Do While Len(CStr(wk.Cells(r, 1).Value)) > 0
        If CStr(wk.Cells(r, 1).Value) = blattAkt And nKacheln < 12 Then
            nKacheln = nKacheln + 1
            kZeile(nKacheln) = r
            kTitel(nKacheln) = CStr(wk.Cells(r, 6).Value)
        End If
        r = r + 1
    Loop
End Sub

Private Sub EditorZeichnen()
    Dim ws As Worksheet, wk As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, r As Long
    Dim lx As Single, rx As Single, rb As Single, zusatz As String
    Set ws = ActiveSheet
    Set wk = ThisWorkbook.Worksheets("Kommentare")
    KachelnLesen
    If nKacheln = 0 Then Exit Sub
    If kachelAkt < 1 Or kachelAkt > nKacheln Then kachelAkt = 1
    r = kZeile(kachelAkt)
    kb = 820: kh = 470
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "KOMMENTARE  ·  " & UCase$(FolienTitel(blattAkt)), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Was steht im Kommentarfeld?", 16, True, modKarte.C_SW
    ' links: Kacheln
    lx = kx + 28
    For i = 1 To nKacheln
        If Len(Trim$(CStr(wk.Cells(kZeile(i), 5).Value))) > 0 Then
            zusatz = "mit Kommentar"
        Else
            zusatz = "leer – erscheint nicht"
        End If
        modKarte.Chip ws, "C_" & Format(i, "00"), lx, ky + 80 + (i - 1) * 42, 230, 36, i & "  " & kTitel(i), (i = kachelAkt), _
            "modKommentar.KlickKachel", zusatz, modKarte.C_GRAU, True
    Next i
    ' rechts: Felder der gewaehlten Kachel
    rx = lx + 230 + 24
    rb = kx + kb - 28 - rx
    modKarte.Beschriftung ws, "LNr", rx, ky + 80, 60, 12, "NR.", 7.5, True, modKarte.C_GRAU
    modKarte.Beschriftung ws, "LUeb", rx + 72, ky + 80, rb - 72, 12, "ÜBERSCHRIFT", 7.5, True, modKarte.C_GRAU
    modKarte.Eingabefeld ws, "ed_nr", rx, ky + 94, 60, 24, CStr(wk.Cells(r, 3).Value), 10
    modKarte.Eingabefeld ws, "ed_ueb", rx + 72, ky + 94, rb - 72, 24, CStr(wk.Cells(r, 4).Value), 10
    modKarte.Beschriftung ws, "LText", rx, ky + 130, rb, 12, "TEXT  ·  Enter im Feld = neuer Punkt  ·  „-“ am Anfang = Unterpunkt  ·  „*“ am Anfang = wieder Hauptpunkt", _
        7.5, True, modKarte.C_GRAU
    modKarte.Eingabefeld ws, "ed_text", rx, ky + 144, rb, kh - 144 - 64, EditorText(CStr(wk.Cells(r, 5).Value)), 9.5
    TextfeldGliedern ws.Shapes(modKarte.PRAEFIX & "ed_text")
    modKarte.Beschriftung ws, "Hinweis", rx, ky + kh - 58, rb, 12, "In ein Feld klicken und tippen. Leerer Text = Kachel erscheint nicht im Kommentarfeld.", 8, False, modKarte.C_GRAU
    modKarte.Knopf ws, "Fertig", kx + kb - 28 - 200, ky + kh - 44, 200, 30, "Speichern und schließen", 1, "modKommentar.KlickFertig"
    modKarte.Knopf ws, "Speichern", kx + kb - 28 - 200 - 12 - 110, ky + kh - 44, 110, 30, "Speichern", 2, "modKommentar.KlickSpeichern"
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 44, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

Private Sub Uebernehmen()
    Dim ws As Worksheet, wk As Worksheet, r As Long, t As String
    Set ws = ActiveSheet
    Set wk = ThisWorkbook.Worksheets("Kommentare")
    If kachelAkt < 1 Or kachelAkt > nKacheln Then Exit Sub
    r = kZeile(kachelAkt)
    t = TextAusEditor(ws)
    Do While Right$(t, 1) = vbLf
        t = Left$(t, Len(t) - 1)
    Loop
    wk.Cells(r, 3).NumberFormat = "@"
    wk.Cells(r, 3).Value = Trim$(Replace(modKarte.FeldText(ws, "ed_nr"), vbLf, ""))
    wk.Cells(r, 4).Value = Trim$(Replace(modKarte.FeldText(ws, "ed_ueb"), vbLf, " "))
    wk.Cells(r, 5).Value = t
End Sub

' gespeicherter Text -> Textfeld: Absaetze statt Zeilen, ein vorangestelltes "•" oder "*" entfaellt (der Punkt kommt aus
' dem Absatzformat)
Private Function EditorText(t As String) As String
    Dim z() As String, i As Long, e As String, x As String
    z = Split(Replace(t, vbCr, ""), vbLf)
    For i = 0 To UBound(z)
        x = z(i)
        If Left$(LTrim$(x), 1) = ChrW(8226) Or Left$(LTrim$(x), 1) = "*" Then x = LTrim$(Mid$(LTrim$(x), 2))
        e = e & IIf(i > 0, vbCr, "") & x
    Next i
    EditorText = e
End Function

' Aufzaehlung im Textfeld wie im Kommentarfeld: Punkt mit "•", Zeilen mit "-"/"–" am Anfang eingerueckt ohne zweites Zeichen
Private Sub TextfeldGliedern(shp As Shape)
    Dim p As Long, x As String
    On Error Resume Next
    With shp.TextFrame2.TextRange
        For p = 1 To .Paragraphs.Count
            x = LTrim$(Replace(Replace(.Paragraphs(p).Text, vbCr, ""), vbLf, ""))
            With .Paragraphs(p).ParagraphFormat
                If Left$(x, 1) = "-" Or Left$(x, 1) = ChrW(8211) Then
                    .Bullet.Visible = msoFalse
                    .LeftIndent = 24
                    .FirstLineIndent = -9
                Else
                    .Bullet.Visible = msoTrue
                    .Bullet.Character = 8226
                    .LeftIndent = 12
                    .FirstLineIndent = -10
                End If
            End With
        Next p
    End With
    On Error GoTo 0
End Sub

' Textfeld -> gespeicherter Text: eine Zeile je Absatz; ein eingerueckter Absatz ohne Zeichen (Enter nach einem Unterpunkt)
' bleibt Unterpunkt, wie er im Feld aussieht; "*" am Anfang macht ihn wieder zum Hauptpunkt
Private Function TextAusEditor(ws As Worksheet) As String
    Dim shp As Shape, p As Long, x As String, e As String, n As Long
    On Error Resume Next
    Set shp = ws.Shapes(modKarte.PRAEFIX & "ed_text")
    On Error GoTo 0
    If shp Is Nothing Then Exit Function
    With shp.TextFrame2.TextRange
        n = .Paragraphs.Count
        For p = 1 To n
            x = Replace(Replace(.Paragraphs(p).Text, vbCr, ""), vbLf, "")
            x = Replace(x, Chr(11), vbLf)
            If Len(Trim$(x)) > 0 Then
                If Not (Left$(LTrim$(x), 1) = "-" Or Left$(LTrim$(x), 1) = ChrW(8211) Or Left$(LTrim$(x), 1) = ChrW(8226) Or Left$(LTrim$(x), 1) = "*") Then
                    If .Paragraphs(p).ParagraphFormat.LeftIndent > 18 Then x = ChrW(8211) & " " & LTrim$(x)
                End If
            End If
            e = e & IIf(p > 1, vbLf, "") & x
        Next p
    End With
    TextAusEditor = e
End Function

Public Sub KlickKachel()
    kachelZiel = modKarte.KlickNummer()
    modKarte.Planen "modKommentar.Wechseln"
End Sub

Public Sub Wechseln()
    Uebernehmen
    modKarte.KartenEntfernen
    kachelAkt = kachelZiel
    EditorZeichnen
End Sub

Public Sub KlickSpeichern()
    modKarte.Planen "modKommentar.Speichern"
End Sub

Public Sub Speichern()
    Uebernehmen
    modKarte.KartenEntfernen
    PanelZeichnen ActiveSheet
    EditorZeichnen
End Sub

Public Sub KlickFertig()
    modKarte.Planen "modKommentar.SpeichernUndSchliessen"
End Sub

Public Sub SpeichernUndSchliessen()
    Uebernehmen
    modKarte.KartenEntfernen
    PanelZeichnen ActiveSheet
End Sub

' ---------------------------------------------------------------- Kommentarfeld der Folie
Public Sub AlleZeichnen()
    Dim n As Variant
    On Error Resume Next
    For Each n In Array("PPT_2", "PPT_3")
        PanelZeichnen ThisWorkbook.Worksheets(CStr(n))
    Next n
    On Error GoTo 0
End Sub

Public Sub PanelZeichnen(ws As Worksheet)
    Dim groesse As Single, unten As Single
    If Not IstFolie(ws.Name) Then Exit Sub
    Dim grenze As Single
    groesse = 7
    ' Grenze: Unterkante des grauen Felds im Blatt (abzueglich Luft fuer die Fusszeile), hoechstens PANEL_UNTEN
    grenze = PANEL_UNTEN
    On Error Resume Next
    grenze = ws.Shapes("DEKO_Panel").Top + ws.Shapes("DEKO_Panel").Height - ws.Shapes("DEKO_Folie").Top - 35
    If grenze > PANEL_UNTEN Or grenze < 300 Then grenze = PANEL_UNTEN
    On Error GoTo 0
    Do
        unten = PanelSetzen(ws, groesse)
        If unten <= grenze Or groesse <= 4.5 Then Exit Do
        groesse = groesse - 0.25                     ' so lange kleiner, bis alles ins Feld passt
    Loop
End Sub

' zeichnet das Kommentarfeld mit Schriftgroesse groesse; liefert die Unterkante (Folienpunkte)
Private Function PanelSetzen(ws As Worksheet, groesse As Single) As Single
    Dim wk As Worksheet, i As Long, r As Long, ox As Single, oy As Single, x0 As Single, y As Single
    Dim nr As String, ueb As String, text As String, breit As Single, n As Long, farbeK As Long, tx As Single
    Dim zeilen() As String, p As Long, t As String, ebene() As Long, k As Long, z As String, hoehe As Single
    Dim sx As Single, tb As Single
    Set wk = ThisWorkbook.Worksheets("Kommentare")
    For i = ws.Shapes.Count To 1 Step -1
        If Left$(ws.Shapes(i).Name, Len(KOM)) = KOM Then ws.Shapes(i).Delete
    Next i
    ox = ws.Shapes("DEKO_Folie").Left
    oy = ws.Shapes("DEKO_Folie").Top
    ' Excel zeichnet die fest verankerte Folie je nach Rechner waagerecht etwas schmaler oder breiter als 960 pt (Umrechnung
    ' ueber die Spaltenbreite der Standardschrift). Das Kommentarfeld richtet sich deshalb nach der tatsaechlichen Folienbreite,
    ' sonst ragt der Text rechts aus dem grauen Feld; modPPT rechnet beim Export mit demselben Faktor zurueck.
    sx = ws.Shapes("DEKO_Folie").Width / 960
    If sx < 0.7 Or sx > 1.3 Then sx = 1
    x0 = ox + PANEL_X * sx
    tb = (PANEL_B - TEXT_X) * sx
    farbeK = Farbe(ws.Name)
    TextSetzen ws, KOM & "Titel", x0 + 40 * sx, oy + PANEL_Y, 160 * sx, 16, "Kommentare", 11, True, RGB(26, 26, 26), msoAlignCenter
    With ws.Shapes.AddShape(1, x0 + 10 * sx, oy + PANEL_Y + 18, (PANEL_B - 20) * sx, 0.75)
        .Name = KOM & "Linie"
        modKarte.Fuellen ws.Shapes(KOM & "Linie"), RGB(191, 21, 40)
        .Line.Visible = msoFalse
    End With
    y = oy + PANEL_Y + 26
    r = K_START
    Do While Len(CStr(wk.Cells(r, 1).Value)) > 0
        If CStr(wk.Cells(r, 1).Value) = ws.Name And Len(Trim$(CStr(wk.Cells(r, 5).Value))) > 0 Then
            n = n + 1
            nr = Trim$(CStr(wk.Cells(r, 3).Value))
            If Len(nr) = 0 Then nr = CStr(wk.Cells(r, 2).Value)
            ueb = Trim$(CStr(wk.Cells(r, 4).Value))
            text = CStr(wk.Cells(r, 5).Value)
            breit = 22                                   ' immer dieselbe Pille, ob "3" oder "4/5"
            With ws.Shapes.AddShape(5, x0, y, breit, 13)
                .Name = KOM & n & "_Nr"
                .Adjustments(1) = 0.5
                modKarte.Fuellen ws.Shapes(KOM & n & "_Nr"), farbeK
                .Line.Visible = msoFalse
                With .TextFrame2
                    .MarginLeft = 0: .MarginRight = 0: .MarginTop = 0: .MarginBottom = 0
                    .WordWrap = msoFalse
                    .VerticalAnchor = msoAnchorMiddle
                    .TextRange.Text = nr
                    .TextRange.Font.Name = "Liberation Sans"
                    .TextRange.Font.Size = 7
                    .TextRange.Font.Bold = msoTrue
                    .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
                    .TextRange.ParagraphFormat.Alignment = msoAlignCenter
                End With
            End With
            tx = x0 + TEXT_X * sx
            TextSetzen ws, KOM & n & "_Ueb", tx, y, tb, 13, ueb, groesse + 1.5, True, RGB(26, 26, 26), msoAlignLeft
            y = y + 13
            ' Text: Zeilen als Absaetze mit Aufzaehlungszeichen
            zeilen = Split(Replace(text, vbCr, ""), vbLf)
            t = ""
            k = 0
            ReDim ebene(0 To UBound(zeilen) + 1)
            For p = 0 To UBound(zeilen)
                z = Trim$(zeilen(p))
                If Len(z) > 0 Then
                    k = k + 1
                    ' Zeichen am Zeilenanfang: "–" oder "-" = Unterpunkt, "•" oder "*" = Punkt; ohne Zeichen = Punkt
                    If Left$(z, 1) = "-" Or Left$(z, 1) = ChrW(8211) Then
                        ebene(k) = 2
                        z = Trim$(Mid$(z, 2))
                    ElseIf Left$(z, 1) = ChrW(8226) Or Left$(z, 1) = "*" Then
                        ebene(k) = 1
                        z = Trim$(Mid$(z, 2))
                    Else
                        ebene(k) = 1
                    End If
                    t = t & IIf(k > 1, vbCr, "") & z
                End If
            Next p
            If k > 0 Then
                With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, tx, y, tb, 12)
                    .Name = KOM & n & "_Text"
                    .Fill.Visible = msoFalse
                    .Line.Visible = msoFalse
                    With .TextFrame2
                        .MarginLeft = 0: .MarginRight = 0: .MarginTop = 0: .MarginBottom = 0
                        .WordWrap = msoTrue
                        .VerticalAnchor = msoAnchorTop
                        .TextRange.Text = t
                        .TextRange.Font.Name = "Liberation Sans"
                        .TextRange.Font.Size = groesse
                        .TextRange.Font.Fill.ForeColor.RGB = RGB(74, 74, 74)
                        .TextRange.ParagraphFormat.SpaceAfter = 1
                        ' fester Zeilenabstand in Punkt: Excel und PowerPoint setzen den Text dann gleich hoch
                        .TextRange.ParagraphFormat.LineRuleWithin = msoFalse
                        .TextRange.ParagraphFormat.SpaceWithin = groesse * 1.2
                        For p = 1 To .TextRange.Paragraphs.Count
                            With .TextRange.Paragraphs(p).ParagraphFormat
                                .Bullet.Visible = msoTrue
                                If ebene(p) = 2 Then
                                    .Bullet.Character = 8211
                                    .LeftIndent = 18
                                    .FirstLineIndent = -8
                                Else
                                    .Bullet.Character = 8226
                                    .LeftIndent = 8
                                    .FirstLineIndent = -8
                                End If
                            End With
                        Next p
                        .AutoSize = msoAutoSizeShapeToFitText
                    End With
                    ' Hoehe: gemessen (Height, BoundHeight) und geschaetzt (Zeichen je Zeile) – der groessere Wert zaehlt.
                    ' Excel zieht die automatische Groesse nicht immer sofort nach und meldet dann zu wenig; die Schaetzung
                    ' rechnet eher etwas reichlich, damit der Text sicher im grauen Feld bleibt.
                    hoehe = .Height
                    On Error Resume Next
                    If .TextFrame2.TextRange.BoundHeight > hoehe Then hoehe = .TextFrame2.TextRange.BoundHeight
                    On Error GoTo 0
                    If HoeheSchaetzen(t, ebene, groesse, tb) > hoehe Then hoehe = HoeheSchaetzen(t, ebene, groesse, tb)
                    .Height = hoehe
                    y = y + hoehe + IIf(groesse < 6, 3, 5)
                End With
            Else
                y = y + 4
            End If
        End If
        r = r + 1
    Loop
    PanelSetzen = y - oy
End Function

' Texthoehe ohne Messung: je Absatz Zeichen x mittlere Zeichenbreite (Arial gut 0,5 der Schriftgroesse) durch die
' Zeilenbreite, aufgerundet; Zeilenabstand fest groesse x 1,2 (wie im Textfeld gesetzt), 1 pt nach jedem Absatz
Private Function HoeheSchaetzen(t As String, ebene() As Long, groesse As Single, breite As Single) As Single
    Dim teile() As String, i As Long, b As Single, zeilen As Long, n As Single
    teile = Split(t, vbCr)
    For i = 0 To UBound(teile)
        b = breite - IIf(ebene(i + 1) = 2, 18, 8)
        n = Len(teile(i)) * groesse * 0.52 / b
        zeilen = zeilen + IIf(n <= 1, 1, -Int(-n))
    Next i
    HoeheSchaetzen = zeilen * groesse * 1.2 + (UBound(teile) + 1) * 1
End Function

Private Sub TextSetzen(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                       groesse As Single, fett As Boolean, farbe As Long, ausrichtung As Long)
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = nm
        .Fill.Visible = msoFalse
        .Line.Visible = msoFalse
        With .TextFrame2
            .MarginLeft = 0: .MarginRight = 0: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = "Liberation Sans"
            .TextRange.Font.Size = groesse
            .TextRange.Font.Bold = IIf(fett, msoTrue, msoFalse)
            .TextRange.Font.Fill.ForeColor.RGB = farbe
            .TextRange.ParagraphFormat.Alignment = ausrichtung
        End With
    End With
End Sub
