Option Explicit
' ============================================================================
' modPPT – PowerPoint auf der ERGO-Vorlage (wie im BUE-Reporting)
'
'   Zeigen     Karte "Welche Folien?": Titelfolie, Serviceparameter, ext. Faktoren, interne Parameter (Vorauswahl aus
'              Konfiguration, Spalte F); "PowerPoint erzeugen".
'   Erzeugen   oeffnet Vorlage\ERGO_Vorlage.pptx neben dieser Datei als unbenannte Kopie (fehlt sie: leere Praesentation),
'              legt je Folie eine Seite an und sichert die Kopie im Ordner "Praesentationen".
'     Titelfolie       Deckblatt wie im bisherigen Dashboard: alle Formen des Blatts Deckblatt (Titelbild ueber die ganze Folie,
'                      halbtransparente Flaechen, Titel, Untertitel und Stand in Magenta, Logo, Kreis "Vertraulich") 1:1 auf
'                      eine leere Folie der Vorlage (Platzhalter entfernt).
'     Dashboard-Folien Layout "3/4": Zeile ueber dem Titel und Titel aus der Konfiguration; alle sichtbaren Kacheln
'                      (Formen K…, ausgeblendete bleiben weg) und das Kommentarfeld (Formen KOM_…) des Blatts an dieselbe
'                      Stelle der Folie (Blatt = Folie 1:1).
'                      Rahmen, grauer Bereich, Logo und "Vertraulich" kommen aus der Vorlage.
' ============================================================================

Private an(1 To 3) As Boolean
Private Const VORLAGE_STANDARD As String = "H:\MaklerBUe\Reporting MISO\Vorlage\ERGO_Vorlage.pptx"
Private Const VORLAGE_UNC As String = "\\CORP.ERGO\public\MaklerBUe\Reporting MISO\Vorlage\ERGO_Vorlage.pptx"

Public Function PPTVersion() As String
    PPTVersion = "1"
End Function

' ---------------------------------------------------------------- Auswahl
Public Sub Zeigen()
    Dim i As Long
    modKarte.KartenEntfernen
    For i = 1 To 3
        an(i) = (LCase$(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Cells(20 + i, 6).Value))) = "ja")
    Next i
    AuswahlZeichnen
End Sub

Private Sub AuswahlZeichnen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, titel As String, vorlage As String
    Set ws = ActiveSheet
    kb = 600: kh = 360
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "POWERPOINT  ·  STAND " & Format(modBasis.Berichtstag(), "dd.mm.yyyy"), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Welche Folien sollen in die Präsentation?", 16, True, modKarte.C_SW
    For i = 1 To 3
        titel = CStr(ThisWorkbook.Worksheets("Konfiguration").Cells(20 + i, 3).Value)
        modKarte.Chip ws, "S_" & Format(i, "00"), kx + 28, ky + 80 + (i - 1) * 42, kb - 56, 34, i & "  " & titel, an(i), "modPPT.KlickFolie", _
            IIf(an(i), "kommt in die Präsentation", "nicht dabei"), modKarte.C_GRAU, True
    Next i
    vorlage = VorlagePfad()
    modKarte.Knopf ws, "VorlageWahl", kx + kb - 28 - 130, ky + 252, 130, 24, "Vorlage wählen …", 2, "modPPT.KlickVorlage"
    modKarte.Beschriftung ws, "Vorlage", kx + 28, ky + 256, kb - 56 - 140, 28, IIf(modBasis.DateiErreichbar(vorlage), "Vorlage: " & vorlage, _
        "Vorlage nicht gefunden (" & vorlage & ") – es wird eine leere Präsentation verwendet."), 8, False, IIf(modBasis.DateiErreichbar(vorlage), modKarte.C_GRAU, modKarte.C_ROT), True
    modKarte.Knopf ws, "Los", kx + kb - 28 - 200, ky + kh - 48, 200, 30, "PowerPoint erzeugen", 4, "modPPT.KlickErzeugen"
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 48, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

Public Sub KlickFolie()
    Dim n As Long
    n = modKarte.KlickNummer()
    If n < 1 Or n > 4 Then Exit Sub
    an(n) = Not an(n)
    modKarte.Planen "modPPT.NeuZeichnen"
End Sub

Public Sub NeuZeichnen()
    modKarte.KartenEntfernen
    AuswahlZeichnen
End Sub

Public Sub KlickErzeugen()
    modKarte.Planen "modPPT.Erzeugen"
End Sub

' Vorlage: Konfiguration!C13 (Knopf „Vorlage wählen …“), sonst die Standardvorlage im Teamlaufwerk (H: oder derselbe Ordner
' als UNC-Pfad), sonst Vorlage\ERGO_Vorlage.pptx neben dieser Datei

' C13 darf auch eine SharePoint-Adresse sein (Browser-Adresszeile, Datei oder Ordner „Vorlage“) – PowerPoint oeffnet sie direkt.
' Liegt diese Datei selbst auf SharePoint, wird zuletzt Vorlage/ERGO_Vorlage.pptx im selben SharePoint-Ordner versucht.
Private Function VorlagePfad() As String
    Dim k As String, neben As String, b As String
    k = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("C13").Value))
    If Len(k) > 0 Then
        k = modBasis.DateiPfad(k, "ERGO_Vorlage.pptx")
        If modBasis.DateiErreichbar(k) Then VorlagePfad = k: Exit Function
    End If
    If modBasis.DateiDa(VORLAGE_STANDARD) Then VorlagePfad = VORLAGE_STANDARD: Exit Function
    If modBasis.DateiDa(VORLAGE_UNC) Then VorlagePfad = VORLAGE_UNC: Exit Function
    b = modBasis.BasisOrdner(True)
    If Len(b) > 0 Then
        neben = b & Application.PathSeparator & "Vorlage" & Application.PathSeparator & "ERGO_Vorlage.pptx"
        If modBasis.DateiDa(neben) Then VorlagePfad = neben: Exit Function
    End If
    If LCase$(Left$(ThisWorkbook.Path, 4)) = "http" Then VorlagePfad = modBasis.UrlDekodieren(ThisWorkbook.Path) & "/Vorlage/ERGO_Vorlage.pptx": Exit Function
    VorlagePfad = VORLAGE_STANDARD                      ' fuer die Meldung „Vorlage nicht gefunden“
End Function

' Dateiauswahl, bei Abbruch Eingabe einer SharePoint-Adresse (Browser-Adresszeile der Vorlage oder ihres Ordners)
Private Function VorlageAbfragen() As String
    Dim datei As Variant, t As String
    datei = Application.GetOpenFilename("PowerPoint-Vorlage (*.pptx;*.potx),*.pptx;*.potx", , "PowerPoint-Vorlage wählen")
    If VarType(datei) = vbString Then VorlageAbfragen = CStr(datei): Exit Function
    t = InputBox("Liegt die Vorlage auf SharePoint? Dann die Adresse der Vorlage oder ihres Ordners aus der Adresszeile des Browsers einfügen " & _
                 "(leer lassen = abbrechen):", "PowerPoint-Vorlage auf SharePoint", CStr(ThisWorkbook.Worksheets("Konfiguration").Range("C13").Value))
    If Len(Trim$(t)) > 0 Then VorlageAbfragen = modBasis.DateiPfad(t, "ERGO_Vorlage.pptx")
End Function

Public Sub KlickVorlage()
    modKarte.Planen "modPPT.VorlageWaehlen"
End Sub

' Dateiauswahl fuer die PowerPoint-Vorlage; der Pfad steht danach in Konfiguration!C13. Danach wieder die Folienauswahl.
Public Sub VorlageWaehlen()
    Dim datei As Variant
    modKarte.KartenEntfernen
    datei = VorlageAbfragen()
    If Len(datei) > 0 Then ThisWorkbook.Worksheets("Konfiguration").Range("C13").Value = CStr(datei)
    AuswahlZeichnen
End Sub

' Knopf „PPT-Vorlage verknüpfen“ auf der Startseite: Vorlage waehlen, Pfad in Konfiguration!C13 speichern (der Export nimmt sie)
Public Sub VorlageVonStart()
    Dim datei As Variant
    modKarte.KartenEntfernen
    datei = VorlageAbfragen()
    If Len(datei) = 0 Then Exit Sub
    ThisWorkbook.Worksheets("Konfiguration").Range("C13").Value = CStr(datei)
    modKarte.Hinweis "PowerPoint-Vorlage", "Gespeichert. Der Export verwendet ab jetzt diese Vorlage:" & vbCr & CStr(datei), False
End Sub

' BUE-Kacheln (PPT_2, K1_/K2_Rueckstand): die Sparte mit dem groessten Bestand (Summe der gezeigten KW) unten, darueber
' absteigend – dieselbe Reihenfolge wie die Werte neben der Saeule (Dashboard_Daten, Lage der Werte).
' Aufruf beim Oeffnen und vor dem PowerPoint-Export.
Public Sub SpartenStapeln()
    Dim nm As Variant, ch As Object, i As Long, j As Long, n As Long, v As Variant, k As Long, t As Long
    Dim namen() As String, letzter() As Double, folge() As Long
    On Error Resume Next
    For Each nm In Array("K1_Rueckstand", "K2_Rueckstand")
        Set ch = Nothing
        Set ch = ThisWorkbook.Worksheets("PPT_2").ChartObjects(CStr(nm)).Chart
        If Not ch Is Nothing Then
            n = ch.ChartGroups(1).SeriesCollection.Count             ' gestapelte Saeulen (die Summenlinie ist eine eigene Gruppe)
            If n > 1 Then
                ReDim namen(1 To n): ReDim letzter(1 To n): ReDim folge(1 To n)
                For i = 1 To n
                    folge(i) = i
                    namen(i) = ch.ChartGroups(1).SeriesCollection(i).Name
                    v = ch.ChartGroups(1).SeriesCollection(i).Values
                    For k = LBound(v) To UBound(v)                        ' Summe der Werte mit Zahl
                        If Not IsError(v(k)) And Not IsEmpty(v(k)) Then
                            If IsNumeric(v(k)) Then letzter(i) = letzter(i) + CDbl(v(k))
                        End If
                    Next k
                Next i
                For i = 1 To n - 1                                    ' absteigend nach Summe
                    For j = i + 1 To n
                        If letzter(folge(j)) > letzter(folge(i)) Then t = folge(i): folge(i) = folge(j): folge(j) = t
                    Next j
                Next i
                For i = 1 To n                                        ' ueber den Namen: PlotOrder verschiebt die Nummern
                    ch.SeriesCollection(namen(folge(i))).PlotOrder = i
                Next i
            End If
        End If
    Next nm
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Erzeugen
Public Sub Erzeugen()
    Dim app As Object, prs As Object, i As Long, anz As Long, schritt As String, ziel As String, basis As String, vorlage As String, nm As String
    Dim zurueck As Worksheet
    modKarte.KartenEntfernen
    Set zurueck = ActiveSheet
    For i = 1 To 3
        If an(i) Then anz = anz + 1
    Next i
    If anz = 0 Then
        modKarte.Hinweis "PowerPoint", "Keine Folie ausgewählt.", True
        Exit Sub
    End If
    On Error GoTo Fehler
    schritt = "Vorbereitung"
    Application.Calculate
    SpartenStapeln
    modKW.TextBeschriftungen
    modKommentar.AlleZeichnen
    basis = modBasis.BasisOrdner(True)                 ' leer (SharePoint ohne Dateipfad): keine Kopie, Folie bleibt offen
    schritt = "PowerPoint starten"
    On Error Resume Next
    Set app = GetObject(, "PowerPoint.Application")
    If app Is Nothing Then Set app = CreateObject("PowerPoint.Application")
    On Error GoTo Fehler
    If app Is Nothing Then Err.Raise vbObjectError + 6, , "PowerPoint konnte nicht gestartet werden."
    app.Visible = True
    schritt = "Vorlage öffnen"
    vorlage = VorlagePfad()
    If modBasis.DateiErreichbar(vorlage) Then
        On Error Resume Next
        Set prs = app.Presentations.Open(vorlage, False, True, True)     ' auch https-Adressen (SharePoint)
        On Error GoTo Fehler
    End If
    If prs Is Nothing Then Set prs = app.Presentations.Add
    Application.StatusBar = "PowerPoint wird erzeugt …"
    For i = 1 To 3
        If an(i) Then
            schritt = "Folie " & i
            If i = 1 Then
                TitelFolie prs, ThisWorkbook.Worksheets("Deckblatt")
            Else
                DashboardFolie prs, ThisWorkbook.Worksheets("PPT_" & i), 20 + i
            End If
        End If
    Next i
    Application.CutCopyMode = False
    schritt = "Kopie sichern"
    nm = "HR_Sales_Dashboard_" & Format(Date, "yyyymmdd") & "_" & Format(Time, "hhnn") & ".pptx"
    If Len(basis) > 0 Then
        ziel = basis & Application.PathSeparator & "Praesentationen"
        If Len(Dir(ziel, vbDirectory)) = 0 Then MkDir ziel
        ziel = ziel & Application.PathSeparator & nm
        prs.SaveCopyAs ziel
    Else
        ' nur SharePoint: Kopie in den Ordner Praesentationen dort (muss bestehen), sonst in „Dokumente“
        ziel = ""
        If LCase$(Left$(ThisWorkbook.Path, 4)) = "http" Then
            On Error Resume Next
            prs.SaveCopyAs modBasis.UrlDekodieren(ThisWorkbook.Path) & "/Praesentationen/" & nm
            If Err.Number = 0 Then ziel = modBasis.UrlDekodieren(ThisWorkbook.Path) & "/Praesentationen/" & nm
            Err.Clear
            On Error GoTo Fehler
        End If
        If Len(ziel) = 0 Then
            On Error Resume Next
            ziel = CreateObject("WScript.Shell").SpecialFolders("MyDocuments")
            On Error GoTo Fehler
            If Len(ziel) = 0 Then ziel = Environ$("USERPROFILE")
            ziel = ziel & Application.PathSeparator & nm
            prs.SaveCopyAs ziel
        End If
    End If
    Application.StatusBar = False
    zurueck.Activate
    app.Activate
    modKarte.Hinweis "PowerPoint erzeugt", anz & IIf(anz = 1, " Folie", " Folien") & " auf der ERGO-Vorlage, gesichert unter" & vbCr & ziel, False
    Exit Sub
Fehler:
    Dim t As String
    t = "Fehler " & Err.Number & ": " & Err.Description
    Application.StatusBar = False
    Application.CutCopyMode = False
    On Error Resume Next
    zurueck.Activate
    modKarte.Hinweis "PowerPoint", "Der Export ist bei Schritt „" & schritt & "“ abgebrochen. " & t, True
End Sub

Private Function LayoutSuchen(prs As Object, namen As Variant) As Object
    Dim i As Long, j As Long, nm As String
    For j = 0 To UBound(namen)
        For i = 1 To prs.SlideMaster.CustomLayouts.Count
            nm = LCase$(Trim$(prs.SlideMaster.CustomLayouts(i).Name))
            If nm = LCase$(CStr(namen(j))) Then
                Set LayoutSuchen = prs.SlideMaster.CustomLayouts(i)
                Exit Function
            End If
        Next i
    Next j
    Set LayoutSuchen = prs.SlideMaster.CustomLayouts(1)
End Function

Private Sub TitelFolie(prs As Object, ws As Worksheet)
    Dim sld As Object, i As Long, n As Long, namen() As String, grp As Object, s As Shape, nm As String
    Dim ox As Single, oy As Single, fx As Single, fy As Single, minL As Single, minT As Single, maxR As Single, maxB As Single
    Set sld = prs.Slides.AddSlide(prs.Slides.Count + 1, LayoutSuchen(prs, Array("leer", "blank", "leere folie", "nur titel", "title only")))
    For i = sld.Shapes.Count To 1 Step -1
        If sld.Shapes(i).Type = 14 Then sld.Shapes(i).Delete             ' Platzhalter
    Next i
    ' Formen des Deckblatts (Titelbild, Flaechen, Texte, Logo, Vertraulich); der Folienrahmen bleibt weg
    ox = ws.Shapes("DEKO_Folie").Left
    oy = ws.Shapes("DEKO_Folie").Top
    fx = prs.PageSetup.SlideWidth / ws.Shapes("DEKO_Folie").Width
    fy = prs.PageSetup.SlideHeight / ws.Shapes("DEKO_Folie").Height
    ReDim namen(1 To ws.Shapes.Count)
    minL = 100000: minT = 100000: maxR = -1: maxB = -1
    For Each s In ws.Shapes
        nm = s.Name
        If (Left$(nm, 6) = "TITEL_" Or Left$(nm, 5) = "DEKO_") And nm <> "DEKO_Folie" Then
            n = n + 1
            namen(n) = nm
            If s.Left < minL Then minL = s.Left
            If s.Top < minT Then minT = s.Top
            If s.Left + s.Width > maxR Then maxR = s.Left + s.Width
            If s.Top + s.Height > maxB Then maxB = s.Top + s.Height
        End If
    Next s
    If n = 0 Then Exit Sub
    ReDim Preserve namen(1 To n)
    On Error Resume Next
    Err.Clear
    ws.Shapes.Range(namen).Copy
    If Err.Number <> 0 Then
        Err.Clear
        ws.Activate
        ws.Shapes.Range(namen).Select
        Selection.Copy
    End If
    DoEvents
    Set grp = Nothing
    Set grp = sld.Shapes.Paste
    If grp Is Nothing Then Set grp = sld.Shapes.PasteSpecial(0)
    On Error GoTo 0
    If grp Is Nothing Then Err.Raise vbObjectError + 9, , "PowerPoint hat das Deckblatt nicht angenommen."
    If grp.Count > 1 Then Set grp = grp.Group
    With grp
        .LockAspectRatio = msoFalse
        .Width = (maxR - minL) * fx
        .Height = (maxB - minT) * fy
        .Left = (minL - ox) * fx
        .Top = (minT - oy) * fy
    End With
    On Error Resume Next
    If grp.Type = 6 Then grp.Ungroup
    On Error GoTo 0
End Sub

Private Sub DashboardFolie(prs As Object, ws As Worksheet, kZeile As Long)
    Dim sld As Object, shp As Object, wk As Worksheet, i As Long, n As Long, namen() As String, grp As Object
    Dim ox As Single, oy As Single, fx As Single, fy As Single, minL As Single, minT As Single, maxR As Single, maxB As Single, s As Shape, nm As String
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    Set sld = prs.Slides.AddSlide(prs.Slides.Count + 1, LayoutSuchen(prs, Array("3/4", "nur überschrift", "only title", "title only")))
    For i = sld.Shapes.Count To 1 Step -1
        Set shp = sld.Shapes(i)
        If shp.Type = 14 Then
            Select Case shp.PlaceholderFormat.Type
                Case 1, 3
                    shp.TextFrame.TextRange.Text = CStr(wk.Cells(kZeile, 3).Value)
                Case 2
                    If shp.Top < 35 Then
                        shp.TextFrame.TextRange.Text = CStr(wk.Cells(kZeile, 7).Value)
                    ElseIf shp.Top > 440 Then
                        shp.TextFrame.TextRange.Text = CStr(wk.Range("C25").Value)      ' Fussnote: Zeitraum der Wochen- und Monatswerte
                    Else
                        shp.Delete
                    End If
                Case Else
                    If Not shp.HasTextFrame Then
                        ' z. B. Bild- oder Diagrammplatzhalter: entfernen
                        shp.Delete
                    ElseIf Not shp.TextFrame.HasText Then
                        shp.Delete
                    End If
            End Select
        End If
    Next i
    ' Kacheln und Kommentarfeld kopieren
    ox = ws.Shapes("DEKO_Folie").Left
    oy = ws.Shapes("DEKO_Folie").Top
    ' Excel rundet Spaltenbreiten auf ganze Pixel: der Folienrahmen im Blatt ist nicht genau 960 x 540 pt. Positionen und
    ' Groessen deshalb auf die echte Foliengroesse umrechnen (sonst ragen die Kacheln in den grauen Bereich der Vorlage).
    fx = prs.PageSetup.SlideWidth / ws.Shapes("DEKO_Folie").Width
    fy = prs.PageSetup.SlideHeight / ws.Shapes("DEKO_Folie").Height
    ReDim namen(1 To ws.Shapes.Count)
    minL = 100000: minT = 100000: maxR = -1: maxB = -1
    For Each s In ws.Shapes
        nm = s.Name
        If ((Left$(nm, 1) = "K" And Mid$(nm, 2, 1) Like "#") Or Left$(nm, 4) = "KOM_") And s.Visible = msoTrue Then
            n = n + 1
            namen(n) = nm
            If s.Left < minL Then minL = s.Left
            If s.Top < minT Then minT = s.Top
            If s.Left + s.Width > maxR Then maxR = s.Left + s.Width
            If s.Top + s.Height > maxB Then maxB = s.Top + s.Height
        End If
    Next s
    If n = 0 Then Exit Sub
    ReDim Preserve namen(1 To n)
    On Error Resume Next
    Err.Clear
    ws.Shapes.Range(namen).Copy
    If Err.Number <> 0 Then
        Err.Clear
        ws.Activate
        ws.Shapes.Range(namen).Select
        Selection.Copy
    End If
    DoEvents
    Set grp = Nothing
    Set grp = sld.Shapes.Paste
    If grp Is Nothing Then Set grp = sld.Shapes.PasteSpecial(0)
    On Error GoTo 0
    If grp Is Nothing Then Err.Raise vbObjectError + 8, , "PowerPoint hat die kopierten Kacheln nicht angenommen."
    If grp.Count > 1 Then Set grp = grp.Group
    With grp
        .LockAspectRatio = msoFalse
        .Width = (maxR - minL) * fx
        .Height = (maxB - minT) * fy
        .Left = (minL - ox) * fx
        .Top = (minT - oy) * fy
    End With
    ' Diagramme: keine #NV-Beschriftungen, keine Verknuepfung zur Excel-Datei
    On Error Resume Next
    If grp.Type = 6 Then
        For Each shp In grp.GroupItems
            If shp.HasChart Then
                EtikettenLeererPunkte shp.Chart
                shp.Chart.ChartData.BreakLink
            End If
        Next shp
        grp.Ungroup
    End If
    On Error GoTo 0
End Sub

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
