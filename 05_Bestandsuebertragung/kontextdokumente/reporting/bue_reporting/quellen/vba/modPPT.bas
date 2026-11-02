Option Explicit
' ============================================================================
' modPPT – Kacheln des Blatts "PPT" als Formen auf eine Folie der ERGO-Vorlage kopieren
' Ablauf: Diagramme aktualisieren, PowerPoint starten, Vorlage (Vorlage\ERGO_Vorlage.pptx neben der Master-Datei)
' als unbenannte Kopie oeffnen (sonst leere Praesentation), Folie mit Layout "Nur Überschrift" (oder "Only Title")
' anlegen, Titel und Untertitel aus PPT!BA1:BA2 (Untertitel in die Kopfzeile ueber dem Titel, falls das Layout eine
' hat), je gewaehlter Kachel (Auswahl aus modFolienauswahl, "111111") die Kachel unter dem Titel aufbauen: Textfelder
' in PowerPoint nachbauen, Diagramme einzeln einfuegen (sonst als Bild), Kopie im Ordner "Praesentationen" sichern.
' ============================================================================

Private Const RAND_SEITE As Single = 41        ' Seitenrand der ERGO-Vorlage (Punkte)
Private Const INHALT_OBEN As Single = 108      ' Oberkante der Inhaltsflaeche unter dem Titel
Private Const RAND_UNTEN As Single = 22
Private Const LUECKE As Single = 14            ' Abstand der Kacheln auf der Folie
Private Const KACHEL_B As Single = 283         ' Kachelraster im Blatt PPT (Punkte, wie im Build)
Private Const KACHEL_H As Single = 195
Private Const KACHEL_LUECKE As Single = 14
Private Const KACHEL_KOPF As Single = 30       ' Kopfleiste: Titel, darunter die Kennzahl; darunter das Diagramm
Private Const FUSS_H As Single = 13            ' Fussnote am unteren Rand der Kachel (liegt ueber dem Diagramm)

Public Sub NachPowerPoint(Optional auswahl As String = "111111")
    If modLaden.LadenLaeuft() Then Exit Sub
    Dim app As Object, prs As Object, sld As Object, lay As Object, grp As Object, shp As Object
    Dim ws As Worksheet, vorlage As String, namen As Variant, i As Long, n As Long, basis As String, ziel As String
    Dim schritt As String
    Dim links As Single, oben As Single, breite As Single, hoehe As Single, faktor As Single
    Dim gruppen() As Object, anz As Long, t As Long, k As Long, basisL As Single, basisT As Single
    Dim spalten As Long, reihen As Long, r As Long, c As Long, inReihe As Long, w0 As Single, h0 As Single
    Dim exB(1 To 6) As Single, exH(1 To 6) As Single, minL As Single, minT As Single, maxR As Single, maxB As Single, vorher As Long
    Dim alsBild As Long, kNr(1 To 6) As Long, exL(1 To 6) As Single, exT(1 To 6) As Single, s As Shape, durchgang As Long
    Dim wertText As String, wertGroesse As Single
    Dim zielL As Single, zielT As Single, fl As Single, ft As Single, fw As Single, fh As Single, nDia As Long, nText As Long

    Set ws = ThisWorkbook.Worksheets("PPT")
    schritt = "Vorbereitung"
    On Error Resume Next
    modCockpit.Aktualisieren True                  ' inkl. Diagramme des Blatts PPT
    On Error GoTo 0
    On Error GoTo Fehler
    basis = modLaden.BasisOrdner()                 ' lokaler Ordner der Master-Datei, auf SharePoint ohne OneDrive die https-Adresse
    If Len(basis) = 0 Then Err.Raise vbObjectError + 5, , "Der Ordner der Master-Datei ist nicht bekannt (Konfiguration!B7)."

    On Error Resume Next
    Set app = GetObject(, "PowerPoint.Application")
    If app Is Nothing Then Set app = CreateObject("PowerPoint.Application")
    On Error GoTo 0
    If app Is Nothing Then
        modFortschritt.HinweisZeigen "Fehler", "PowerPoint konnte nicht gestartet werden.", True
        Exit Sub
    End If
    app.Visible = True

    On Error GoTo Fehler
    schritt = "Vorlage öffnen"
    Set prs = Nothing
    If modLaden.IstUrl(basis) Then
        ' SharePoint: Vorlage direkt ueber https oeffnen (PowerPoint nutzt die Office-Anmeldung); fehlt sie, leere Praesentation
        vorlage = basis & "/Vorlage/ERGO_Vorlage.pptx"
        On Error Resume Next
        Set prs = app.Presentations.Open(vorlage, False, True, True)
        On Error GoTo Fehler
    Else
        vorlage = basis & Application.PathSeparator & "Vorlage" & Application.PathSeparator & "ERGO_Vorlage.pptx"
        If Len(Dir(vorlage)) > 0 Then Set prs = app.Presentations.Open(vorlage, False, True, True)     ' ReadOnly=False, Untitled=True (Kopie), WithWindow=True
    End If
    If prs Is Nothing Then Set prs = app.Presentations.Add
    Set lay = Nothing
    For i = 1 To prs.SlideMaster.CustomLayouts.Count
        If LCase$(prs.SlideMaster.CustomLayouts(i).Name) = "only title" Then Set lay = prs.SlideMaster.CustomLayouts(i)
    Next i
    If lay Is Nothing Then
        For i = 1 To prs.SlideMaster.CustomLayouts.Count
            If InStr(1, LCase$(prs.SlideMaster.CustomLayouts(i).Name), "title only") > 0 Or InStr(1, LCase$(prs.SlideMaster.CustomLayouts(i).Name), "berschrift") > 0 Then Set lay = prs.SlideMaster.CustomLayouts(i)
        Next i
    End If
    If lay Is Nothing Then Set lay = prs.SlideMaster.CustomLayouts(1)
    schritt = "Folie anlegen"
    Set sld = prs.Slides.AddSlide(prs.Slides.Count + 1, lay)
    schritt = "Titel setzen"

    ' Titel und Untertitel in die Platzhalter (Datum, Fusszeile, Foliennummer der Vorlage bleiben unberuehrt)
    For Each shp In sld.Shapes
        If shp.Type = 14 Then                                         ' msoPlaceholder
            Select Case shp.PlaceholderFormat.Type
                Case 1, 3                                             ' ppPlaceholderTitle / ppPlaceholderCenterTitle
                    shp.TextFrame.TextRange.Text = CStr(ws.Range("BA1").Value)
                Case 2, 4                                             ' ppPlaceholderBody / ppPlaceholderSubtitle
                    shp.TextFrame.TextRange.Text = CStr(ws.Range("BA2").Value)
            End Select
        End If
    Next shp

    ' Kacheln sammeln: je gewaehlter Kachel ihre Formen (Kopf, Kennzahl, Diagramm, Fussnote) und ihre Masse in Excel
    schritt = "Kacheln sammeln"
    If Len(auswahl) <> 6 Then auswahl = "111111"
    anz = 0
    For t = 0 To 5
        If Mid$(auswahl, t + 1, 1) = "1" Then
            k = 0
            maxB = -1
            For i = 1 To ws.Shapes.Count
                If KachelVon(ws.Shapes(i), ws) = t Then
                    k = k + 1
                    If Not ws.Shapes(i).HasChart Then                  ' unterstes Textfeld = Fussnote
                        If ws.Shapes(i).Top > maxB Then maxB = ws.Shapes(i).Top
                    End If
                End If
            Next i
            If k > 0 Then
                anz = anz + 1
                kNr(anz) = t: exT(anz) = maxB
            End If
        End If
    Next t
    If anz = 0 Then Err.Raise vbObjectError + 7, , "Keine Kachel ausgewählt oder im Blatt PPT keine Formen gefunden."

    ' Anordnen: 1-3 Kacheln in einer Reihe, 4 als 2 x 2, 5-6 in zwei Reihen zu drei; auf die Inhaltsflaeche skalieren
    ' (hoechstens 1,6-fach vergroessern), jede Reihe mittig
    schritt = "Kacheln anordnen"
    breite = prs.PageSetup.SlideWidth - 2 * RAND_SEITE
    hoehe = prs.PageSetup.SlideHeight - INHALT_OBEN - RAND_UNTEN
    If anz <= 3 Then
        spalten = anz
    ElseIf anz = 4 Then
        spalten = 2
    Else
        spalten = 3
    End If
    reihen = (anz + spalten - 1) \ spalten
    ' Masse aus dem Raster des Builds, nicht aus Excel: Excel misst Spaltenbreiten in Zeichen der Standardschrift, die
    ' Formen im Blatt sind dadurch je nach Rechner breiter oder flacher als geplant (Kacheln gestaucht, Etiketten im
    ' Diagramm ueberdeckt). Auf der Folie bekommt jedes Teil seinen festen Platz in der Kachel.
    w0 = KACHEL_B: h0 = KACHEL_H
    faktor = (breite - (spalten - 1) * LUECKE) / (spalten * w0)
    If (hoehe - (reihen - 1) * LUECKE) / (reihen * h0) < faktor Then faktor = (hoehe - (reihen - 1) * LUECKE) / (reihen * h0)
    If faktor > 1.6 Then faktor = 1.6

    ' Kacheln auf der Folie aufbauen. Nicht mehr als Formengruppe ueber die Zwischenablage: PowerPoint hat die Gruppe je
    ' nach Version als eingebettetes Excel-Objekt eingefuegt, das auf der Folie leer bleibt. Stattdessen:
    ' Textfelder werden in PowerPoint neu angelegt (Text, Schrift, Farbe, Fuellung wie in Excel), jedes Diagramm wird
    ' einzeln kopiert und als Diagramm eingefuegt; kommt dabei kein Diagramm an, wird es als Bild (PNG-Export) gesetzt.
    For t = 1 To anz
        r = (t - 1) \ spalten
        c = (t - 1) Mod spalten
        inReihe = spalten
        If r = reihen - 1 Then inReihe = anz - r * spalten
        zielL = (prs.PageSetup.SlideWidth - (inReihe * w0 * faktor + (inReihe - 1) * LUECKE)) / 2 + c * (w0 * faktor + LUECKE)
        zielT = INHALT_OBEN + r * (h0 * faktor + LUECKE)
        schritt = "Kachel " & (kNr(t) + 1) & " aufbauen"
        vorher = sld.Shapes.Count
        nDia = 0: nText = 0
        ' Kennzahl der Kopfleiste: kommt als zweite Zeile in das Titelfeld (zwei getrennte Felder lagen in PowerPoint
        ' versetzt, die Kennzahl klebte am unteren Rand der Kopfleiste)
        wertText = "": wertGroesse = 8
        On Error Resume Next
        For i = 1 To ws.Shapes.Count
            Set s = ws.Shapes(i)
            If KachelVon(s, ws) = kNr(t) Then
                If Not s.HasChart And Not s.Fill.Visible And s.Top < exT(t) Then
                    wertText = s.TextFrame2.TextRange.Text
                    wertGroesse = s.TextFrame2.TextRange.Font.Size
                End If
            End If
        Next i
        On Error GoTo Fehler
        ' zuerst die Diagramme (unten), dann die Textfelder (oben), wie im Blatt
        For durchgang = 1 To 2
            For i = 1 To ws.Shapes.Count
                Set s = ws.Shapes(i)
                If KachelVon(s, ws) = kNr(t) Then
                    fl = zielL: fw = KACHEL_B * faktor
                    If s.HasChart Then                                ' Diagramm unter der Kopfleiste
                        ft = zielT + KACHEL_KOPF * faktor: fh = (KACHEL_H - KACHEL_KOPF) * faktor
                    ElseIf s.Fill.Visible Then                        ' Kopfleiste mit Titel
                        ft = zielT: fh = KACHEL_KOPF * faktor
                    ElseIf s.Top >= exT(t) Then                       ' Fussnote
                        ft = zielT + (KACHEL_H - FUSS_H) * faktor: fh = FUSS_H * faktor
                    Else                                              ' Kennzahl: steht schon im Titelfeld
                        ft = -1
                    End If
                    If durchgang = 1 And s.HasChart Then
                        DiagrammSetzen sld, s, fl, ft, fw, fh, alsBild, basis
                        nDia = nDia + 1
                    ElseIf durchgang = 2 And Not s.HasChart And ft >= 0 Then
                        If s.Fill.Visible Then
                            TextfeldSetzen sld, s, fl, ft, fw, fh, wertText, wertGroesse
                        Else
                            TextfeldSetzen sld, s, fl, ft, fw, fh
                        End If
                        nText = nText + 1
                    End If
                End If
            Next i
        Next durchgang
        If sld.Shapes.Count <= vorher Then Err.Raise vbObjectError + 9, , "Kachel " & (kNr(t) + 1) & ": PowerPoint hat nichts eingefügt."
        modLaden.LogSchreiben "PPT Kachel " & (kNr(t) + 1) & ": " & nDia & " Diagramm(e), " & nText & " Textfelder, " & _
                              Format(w0 * faktor, "0") & " x " & Format(h0 * faktor, "0") & " pt"
    Next t
    Application.CutCopyMode = False
    ' Der Vertraulich-Vermerk kommt aus dem ERGO-Folienmaster, nichts zusaetzlich einfuegen

    ' Diagnose: was liegt auf der Folie? (Ladelog.txt und Abschlussmeldung) – sichtbar, auf der Folie, mit Groesse
    schritt = "Folie prüfen"
    Dim nForm As Long, nSichtbar As Long, info As String
    On Error Resume Next
    For Each shp In sld.Shapes
        If shp.Type <> 14 Then                                        ' ohne Platzhalter
            nForm = nForm + 1
            If shp.Visible And shp.Width > 5 And shp.Height > 5 And shp.Left < prs.PageSetup.SlideWidth And shp.Top < prs.PageSetup.SlideHeight _
               And shp.Left + shp.Width > 0 And shp.Top + shp.Height > 0 Then nSichtbar = nSichtbar + 1
            If shp.Type = 7 Or shp.Type = 10 Then nSichtbar = nSichtbar - 1             ' eingebettetes Excel-Objekt zeigt nichts
            modLaden.LogSchreiben "PPT Form " & shp.Name & ": Typ " & shp.Type & ", sichtbar " & shp.Visible & ", " & Format(shp.Left, "0") & "/" & _
                                  Format(shp.Top, "0") & " " & Format(shp.Width, "0") & " x " & Format(shp.Height, "0")
        End If
    Next shp
    On Error GoTo Fehler
    info = anz & IIf(anz = 1, " Kachel", " Kacheln") & " kopiert, " & nForm & " Formen auf der Folie, davon " & nSichtbar & " sichtbar im Folienbereich." & _
           IIf(alsBild > 0, " " & alsBild & IIf(alsBild = 1, " Diagramm", " Diagramme") & " als Bild eingefügt (PowerPoint nahm es nicht als Diagramm an).", "")
    modLaden.LogSchreiben "PPT Ergebnis: " & info
    If nSichtbar = 0 Then Err.Raise vbObjectError + 11, , "Auf der Folie ist keine Kachel sichtbar (" & info & "). Details in Ladelog.txt."

    ' Kopie sichern (PowerPoint bleibt mit der Praesentation offen)
    schritt = "Kopie sichern"
    ziel = KopieSichern(prs, basis, "BUE_Reporting_" & Format(Date, "yyyymmdd") & "_" & Format(Time, "hhnn") & ".pptx")
    app.Activate
    modFortschritt.HinweisZeigen "Hinweis", "Folie erzeugt und gesichert:" & vbCrLf & ziel & vbCrLf & info, False
    Exit Sub

Fehler:
    Dim fehlertext As String
    fehlertext = "Fehler " & Err.Number & ": " & Err.Description
    modFortschritt.HinweisZeigen "Fehler", "PowerPoint-Export fehlgeschlagen bei Schritt '" & schritt & "': " & fehlertext, True
End Sub

' Kopie der Praesentation sichern: Ordner Praesentationen neben der Master-Datei. Auf SharePoint (https) zuerst dort hinein
' (Ordner muss bestehen), sonst in „Dokumente“ des Benutzers. Ergebnis: Pfad der Kopie.
Private Function KopieSichern(prs As Object, basis As String, nm As String) As String
    Dim ziel As String, dok As String
    If modLaden.IstUrl(basis) Then
        ziel = basis & "/Praesentationen/" & nm
        On Error Resume Next
        prs.SaveCopyAs ziel
        If Err.Number = 0 Then KopieSichern = ziel: Exit Function
        Err.Clear
        dok = CreateObject("WScript.Shell").SpecialFolders("MyDocuments")
        If Len(dok) = 0 Then dok = Environ$("USERPROFILE")
        On Error GoTo 0
        ziel = dok & Application.PathSeparator & nm
    Else
        ziel = basis & Application.PathSeparator & "Praesentationen"
        If Len(Dir(ziel, vbDirectory)) = 0 Then MkDir ziel
        ziel = ziel & Application.PathSeparator & nm
    End If
    prs.SaveCopyAs ziel
    KopieSichern = ziel
End Function

' Kachel (0..5) einer Form im Blatt PPT, -1 = keine Kachel. Jede Kachel hat genau ein Diagramm ("Chart 10" bis "Chart 15",
' Kachel = Nummer - 10). Ein Textfeld gehoert zu dem Diagramm, ueber dem es liegt (Mitte waagerecht im Diagramm) und
' dessen Kopfbereich oder Flaeche es senkrecht trifft. Gemessen an den echten Diagrammen in Excel – nicht am geplanten
' Raster: Excel verzerrt das Blatt je nach Standardschrift, sonst rutschen Kopfleisten in die Kachel darueber.
Private Function KachelVon(shp As Shape, ws As Worksheet) As Long
    Dim cx As Single, cy As Single, nr As Long, co As ChartObject, kopf As Single
    KachelVon = -1
    On Error Resume Next
    If shp.HasChart Then
        If shp.Name Like "Chart 1#" Then
            nr = CLng(Mid$(shp.Name, 7)) - 10
            If nr >= 0 And nr <= 5 Then KachelVon = nr
        End If
        Exit Function
    End If
    cx = shp.Left + shp.Width / 2
    cy = shp.Top + shp.Height / 2
    For nr = 0 To 5
        Set co = Nothing
        Set co = ws.ChartObjects("Chart " & (10 + nr))
        If Not co Is Nothing Then
            kopf = co.Height * KACHEL_KOPF / (KACHEL_H - KACHEL_KOPF)              ' Kopfleiste im selben Massstab wie das Diagramm
            If cx >= co.Left And cx <= co.Left + co.Width And cy >= co.Top - kopf - 2 And cy <= co.Top + co.Height Then
                KachelVon = nr
                Exit Function
            End If
        End If
    Next nr
End Function

' Etiketten von Punkten ohne Wert (#NV) abschalten: Excel blendet sie aus, PowerPoint schreibt "#NV"
Private Sub EtikettenLeererPunkte(ch As Object)
    Dim s As Object, v As Variant, i As Long
    On Error Resume Next
    For Each s In ch.SeriesCollection
        If s.HasDataLabels Then
            v = s.Values
            For i = LBound(v) To UBound(v)
                If IsError(v(i)) Or IsEmpty(v(i)) Then s.Points(i).HasDataLabel = False
            Next i
        End If
    Next s
    On Error GoTo 0
End Sub

' Ein Diagramm des Blatts PPT einzeln kopieren und als PowerPoint-Diagramm einfuegen (#NV-Etiketten weg, Verknuepfung
' zur Master-Datei geloest). Kommt kein Diagramm an (Bild, eingebettetes Objekt), das Diagramm als PNG exportieren und
' als Bild setzen – dann ist es nicht bearbeitbar, aber sicher sichtbar.
Private Sub DiagrammSetzen(sld As Object, s As Shape, l As Single, t As Single, w As Single, h As Single, ByRef alsBild As Long, basis As String)
    Dim rng As Object, x As Object, datei As String, ok As Boolean
    On Error Resume Next
    Err.Clear
    s.Chart.ChartArea.Copy
    If Err.Number <> 0 Then Err.Clear: s.Copy
    DoEvents
    Set rng = Nothing
    Set rng = sld.Shapes.Paste
    If rng Is Nothing Then Set rng = sld.Shapes.PasteSpecial(0)
    If Not rng Is Nothing Then
        Set x = rng.Item(1)
        ok = (rng.Count = 1 And x.HasChart)
        If Not ok Then
            modLaden.LogSchreiben "PPT " & s.Name & ": kam als Typ " & x.Type & " an, nicht als Diagramm – als Bild gesetzt"
            rng.Delete
            Set x = Nothing
        End If
    Else
        modLaden.LogSchreiben "PPT " & s.Name & ": Einfügen fehlgeschlagen – als Bild gesetzt"
    End If
    If x Is Nothing Then
        datei = Environ$("TEMP")
        If Len(datei) = 0 Then datei = basis
        datei = datei & Application.PathSeparator & "BUE_PPT_" & Replace(s.Name, " ", "_") & ".png"
        Err.Clear
        s.Chart.Export datei, "PNG"
        If Err.Number = 0 And Len(Dir(datei)) > 0 Then
            Set x = sld.Shapes.AddPicture(datei, False, True, l, t, w, h)
            Kill datei
            alsBild = alsBild + 1
        End If
        On Error GoTo 0
        Exit Sub
    End If
    With x
        .LockAspectRatio = msoFalse
        .Left = l: .Top = t: .Width = w: .Height = h
    End With
    EtikettenLeererPunkte x.Chart
    x.Chart.ChartData.BreakLink
    On Error GoTo 0
End Sub

' Ein Textfeld des Blatts PPT in PowerPoint nachbauen: Text, Schrift (Name, Groesse, fett, kursiv, Farbe), Fuellung,
' Ausrichtung, Innenraender. zeile2: zweite Zeile (Kennzahl der Kopfleiste), normal statt fett, beide Zeilen mittig
Private Sub TextfeldSetzen(sld As Object, s As Shape, l As Single, t As Single, w As Single, h As Single, _
                          Optional zeile2 As String = "", Optional groesse2 As Single = 8)
    Dim x As Object, txt As String
    On Error Resume Next
    txt = s.TextFrame2.TextRange.Text
    Set x = sld.Shapes.AddTextbox(1, l, t, w, h)                      ' msoTextOrientationHorizontal
    With x
        .Name = s.Name
        If s.Fill.Visible Then
            .Fill.Visible = msoTrue
            .Fill.Solid
            .Fill.ForeColor.RGB = s.Fill.ForeColor.RGB
        Else
            .Fill.Visible = msoFalse
        End If
        .Line.Visible = msoFalse
        With .TextFrame2
            .AutoSize = 0                                             ' msoAutoSizeNone
            .WordWrap = msoTrue
            .MarginLeft = s.TextFrame2.MarginLeft
            .MarginRight = s.TextFrame2.MarginRight
            .MarginTop = s.TextFrame2.MarginTop
            .MarginBottom = s.TextFrame2.MarginBottom
            .VerticalAnchor = s.TextFrame2.VerticalAnchor
            .TextRange.Text = txt
            .TextRange.ParagraphFormat.Alignment = s.TextFrame2.TextRange.ParagraphFormat.Alignment
            With .TextRange.Font
                .Name = s.TextFrame2.TextRange.Font.Name
                .Size = s.TextFrame2.TextRange.Font.Size
                .Bold = s.TextFrame2.TextRange.Font.Bold
                .Italic = s.TextFrame2.TextRange.Font.Italic
                .Fill.ForeColor.RGB = s.TextFrame2.TextRange.Font.Fill.ForeColor.RGB
            End With
        End With
        If Len(zeile2) > 0 Then
            With .TextFrame2
                .TextRange.Text = txt & vbCr & zeile2
                .MarginLeft = 7: .MarginRight = 7: .MarginTop = 2: .MarginBottom = 2
                .VerticalAnchor = 3                                   ' msoAnchorMiddle
                .TextRange.ParagraphFormat.SpaceBefore = 0
                .TextRange.ParagraphFormat.SpaceAfter = 0
                .TextRange.Paragraphs(2).ParagraphFormat.SpaceBefore = 1
                With .TextRange.Paragraphs(2).Font
                    .Bold = msoFalse
                    .Size = groesse2
                End With
            End With
        End If
        .Left = l: .Top = t: .Width = w: .Height = h                 ' AddTextbox passt die Hoehe sonst an
    End With
    On Error GoTo 0
End Sub

Public Function PPTModulVersion() As String
    PPTModulVersion = "11"
End Function
