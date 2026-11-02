Option Explicit
' ============================================================================
' modKW – „Diagramm anpassen“ auf den Folienblaettern (PPT_2 und PPT_3)
'
'   Zeigen          Karte mit den Kacheln des Blatts; ein Klick oeffnet die Kachel
'   Detail          Zahl der Kalenderwochen (bzw. Monate) mit - / +, darunter je Wert: Alle · Letzte 2 · Aus
'
' Grundlage ist das Verzeichnis in Dashboard_Daten (vom Build geschrieben, Kopf „Verzeichnis: Blatt“):
'   je Kachel Blatt, Nummer, Titel, Diagramme (Name:Art; W = Wochen, M = Monate, B = BUE-Plaetze, F = feste Monate), KW-Zelle (BUE)
'   und die schaltbaren Werte „Anzeige|Diagramm>Reihe>Zeile,…|Schalterzelle“. Zeile = Zeile der Beschriftungstexte
'   (0 = Zahlenwert der Reihe). Die Zeile darueber traegt die Masse (Spaltennummern) der Wochen, Monate und Plaetze.
' Wochen: Die Diagramme zeigen die letzten n Wochen (Bereich endet immer beim Berichtstag); BUE-Kacheln rechnen ihre Plaetze
' aus der KW-Zelle (je KW ein Platz ab der ersten Platzspalte). Beschriftungen aus Zellen werden je Punkt neu verknuepft, weil
' sich die Spalten verschieben. "Letzte 2" heisst in den BUE-Kacheln "Aktuelle KW" (nur die letzte KW).
' Feste Monate (F, Mitarbeiter-Kapazitaeten): Vormonat und laufender Monat des Berichtstags, Januar Folgejahr und Januar
' uebernaechstes Jahr (Plan). Die Zahl der Monate ist fest (kein - / +); "Letzte 2" heisst dort "Nur Planmonate".
' ============================================================================

Private Const BLATT_D As String = "Dashboard_Daten"
Private Const KOPF As String = "Verzeichnis: Blatt"

Private regSpalte As Long          ' Spalte „Verzeichnis: Blatt“
Private wErste As Long, wLetzte As Long, mLetzte As Long, sErste As Long, kwMin As Long, kwMax As Long, mMax As Long
Private fErste As Long             ' erste Spalte der festen Monate (Mitarbeiter-Kapazitaeten)
Private gewaehlt As Long           ' Zeile der gewaehlten Kachel im Verzeichnis (0 = Liste)
Private schritt As Long            ' -1 / +1
Private schrittArt As String       ' "W" oder "M"
Private wertNr As Long, neuModus As Long

' ---------------------------------------------------------------- Einstieg
Public Sub Zeigen()
    If Not Bereit() Then Exit Sub
    gewaehlt = 0
    modKarte.KartenEntfernen
    ListeZeichnen
End Sub

Private Function Bereit() As Boolean
    Dim ws As Worksheet, c As Long
    On Error GoTo Fehler
    Set ws = ThisWorkbook.Worksheets(BLATT_D)
    regSpalte = 0
    For c = 1 To 400
        If CStr(ws.Cells(6, c).Value) = KOPF Then regSpalte = c: Exit For
    Next c
    If regSpalte = 0 Then GoTo Fehler
    wErste = CLng(ws.Cells(3, regSpalte).Value)
    wLetzte = CLng(ws.Cells(3, regSpalte + 1).Value)
    mLetzte = CLng(ws.Cells(3, regSpalte + 2).Value)
    sErste = CLng(ws.Cells(3, regSpalte + 3).Value)
    kwMin = CLng(ws.Cells(3, regSpalte + 4).Value)
    kwMax = CLng(ws.Cells(3, regSpalte + 5).Value)
    mMax = CLng(ws.Cells(3, regSpalte + 6).Value)
    fErste = CLng(Val(ws.Cells(3, regSpalte + 7).Value))
    Bereit = True
    Exit Function
Fehler:
    modKarte.Hinweis "Diagramm anpassen", "Das Verzeichnis der Diagramme fehlt in Dashboard_Daten.", True
End Function

' ---------------------------------------------------------------- Liste der Kacheln
Private Sub ListeZeichnen()
    Dim ws As Worksheet, wsD As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, r As Long, n As Long
    Dim zusatz As String
    Set ws = ActiveSheet
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    For r = 7 To 200
        If CStr(wsD.Cells(r, regSpalte).Value) = ws.Name Then n = n + 1
    Next r
    If n = 0 Then
        modKarte.Hinweis "Diagramm anpassen", "Auf diesem Blatt gibt es keine anpassbaren Diagramme.", False
        Exit Sub
    End If
    kb = 560: kh = 130 + n * 40
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "DIAGRAMM ANPASSEN  ·  " & UCase$(ws.Name), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Welches Diagramm?", 16, True, modKarte.C_SW
    n = 0
    For r = 7 To 200
        If CStr(wsD.Cells(r, regSpalte).Value) = ws.Name Then
            n = n + 1
            zusatz = Zusammenfassung(r)
            modKarte.Chip ws, "D_" & Format(r Mod 100, "00"), kx + 28, ky + 76 + (n - 1) * 40, kb - 56, 32, _
                CStr(wsD.Cells(r, regSpalte + 1).Value) & "  " & CStr(wsD.Cells(r, regSpalte + 2).Value), False, "modKW.KlickKachel", _
                zusatz, modKarte.C_GRAU, True
        End If
    Next r
    modKarte.Knopf ws, "Fertig", kx + kb - 28 - 110, ky + kh - 46, 110, 30, "Fertig", 1, "modKarte.KlickSchliessen"
End Sub

' Kurzbeschreibung rechts im Chip: „10 KW · 6 Monate“
Private Function Zusammenfassung(r As Long) As String
    Dim t As String, n As Long
    n = Anzahl(r, "W")
    If n > 0 Then t = n & " KW"
    n = Anzahl(r, "M")
    If n > 0 Then t = t & IIf(Len(t) > 0, "  ·  ", "") & n & " Monate"
    n = Anzahl(r, "F")
    If n > 0 Then t = t & IIf(Len(t) > 0, "  ·  ", "") & "2 Monate + 2 Plan"
    Zusammenfassung = t
End Function

Public Sub KlickKachel()
    Dim n As Long, r As Long, wsD As Worksheet
    n = modKarte.KlickNummer()
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    For r = 7 To 200                                  ' Zeile aus den letzten zwei Ziffern (Verzeichnis hat weniger als 100 Zeilen)
        If r Mod 100 = n And CStr(wsD.Cells(r, regSpalte).Value) = ActiveSheet.Name Then gewaehlt = r: Exit For
    Next r
    If gewaehlt > 0 Then modKarte.Planen "modKW.DetailNeu"
End Sub

Public Sub ZurListe()
    gewaehlt = 0
    modKarte.Planen "modKW.ListeNeu"
End Sub

Public Sub ListeNeu()
    If Not Bereit() Then Exit Sub
    modKarte.KartenEntfernen
    ListeZeichnen
End Sub

' ---------------------------------------------------------------- Kachel: Wochen und Werte
Public Sub DetailNeu()
    If gewaehlt = 0 Then Exit Sub
    If Not Bereit() Then Exit Sub
    modKarte.KartenEntfernen
    DetailZeichnen
End Sub

Private Sub DetailZeichnen()
    Dim ws As Worksheet, wsD As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    Dim y As Single, j As Long, w As String, teile() As String, m As Long, k As Long, nW As Long, nM As Long
    Dim namen As Variant, letzte As String
    Set ws = ActiveSheet
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    nW = Anzahl(gewaehlt, "W"): nM = Anzahl(gewaehlt, "M")
    k = 0
    For j = 0 To 9
        If Len(CStr(wsD.Cells(gewaehlt, regSpalte + 5 + j).Value)) > 0 Then k = k + 1
    Next j
    kb = 600: kh = 150 + IIf(nW > 0, 44, 0) + IIf(nM > 0, 44, 0) + 30 + k * 38
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "DIAGRAMM ANPASSEN  ·  " & UCase$(ws.Name), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, CStr(wsD.Cells(gewaehlt, regSpalte + 1).Value) & "  " & _
        CStr(wsD.Cells(gewaehlt, regSpalte + 2).Value), 16, True, modKarte.C_SW
    y = ky + 82
    If nW > 0 Then ZeitZeile ws, kx, y, kb, "Kalenderwochen", nW & " KW", "01": y = y + 44
    If nM > 0 Then ZeitZeile ws, kx, y, kb, "Monate", nM & " Monate", "02": y = y + 44
    modKarte.Beschriftung ws, "WerteKopf", kx + 28, y + 4, kb - 56, 16, "Werte im Diagramm", 10, True, modKarte.C_SW
    y = y + 28
    namen = Array("Alle", "Letzte 2", "Aus")
    k = 0
    For j = 0 To 9
        w = CStr(wsD.Cells(gewaehlt, regSpalte + 5 + j).Value)
        If Len(w) > 0 Then
            k = k + 1
            teile = Split(w, "|")
            If InStr(CStr(wsD.Cells(gewaehlt, regSpalte + 3).Value), ":F") > 0 Then
                letzte = "Nur Planmonate"
            ElseIf nW = 0 Then
                letzte = "Letzte 2 Monate"
            ElseIf InStr(CStr(wsD.Cells(gewaehlt, regSpalte + 3).Value), ":B") > 0 Then
                letzte = "Aktuelle KW"
            Else
                letzte = "Letzte 2 KW"
            End If
            modKarte.Beschriftung ws, "WN" & Format(j, "00"), kx + 28, y + 6, 230, 16, teile(0), 9.5, False, modKarte.C_SW
            m = WertModus(gewaehlt, j)
            modKarte.Chip ws, "W_" & Format((j + 1) * 10 + 1, "00"), kx + 270, y, 70, 28, "Alle", m = 1, "modKW.KlickWert"
            modKarte.Chip ws, "W_" & Format((j + 1) * 10 + 2, "00"), kx + 346, y, 130, 28, letzte, m = 2, "modKW.KlickWert"
            modKarte.Chip ws, "W_" & Format((j + 1) * 10 + 3, "00"), kx + 482, y, 90, 28, "Aus", m = 0, "modKW.KlickWert"
            y = y + 38
        End If
    Next j
    modKarte.Knopf ws, "Zurueck", kx + 20, ky + kh - 46, 150, 30, "Anderes Diagramm", 3, "modKW.ZurListe"
    modKarte.Knopf ws, "Fertig", kx + kb - 28 - 110, ky + kh - 46, 110, 30, "Fertig", 1, "modKarte.KlickSchliessen"
End Sub

Private Sub ZeitZeile(ws As Worksheet, kx As Single, y As Single, kb As Single, titel As String, wert As String, nr As String)
    modKarte.Beschriftung ws, "ZT" & nr, kx + 28, y + 8, 200, 18, titel, 10, True, modKarte.C_SW
    modKarte.Knopf ws, "Minus" & nr, kx + 270, y, 40, 30, ChrW(8722), 2, "modKW.KlickWeniger"
    modKarte.Beschriftung ws, "ZW" & nr, kx + 316, y + 7, 110, 18, wert, 11, True, modKarte.C_TEAL
    modKarte.Knopf ws, "Plus" & nr, kx + 432, y, 40, 30, "+", 2, "modKW.KlickMehr"
End Sub

Public Sub KlickWeniger()
    schritt = -1
    schrittArt = IIf(modKarte.KlickNummer() = 2, "M", "W")
    modKarte.Planen "modKW.ZeitAnwenden"
End Sub

Public Sub KlickMehr()
    schritt = 1
    schrittArt = IIf(modKarte.KlickNummer() = 2, "M", "W")
    modKarte.Planen "modKW.ZeitAnwenden"
End Sub

Public Sub KlickWert()
    Dim n As Long
    n = modKarte.KlickNummer()
    wertNr = n \ 10 - 1
    neuModus = Choose(n Mod 10, 1, 2, 0)
    modKarte.Planen "modKW.WertAnwenden"
End Sub

' ---------------------------------------------------------------- Anwenden
Public Sub ZeitAnwenden()
    Dim n As Long, neu As Long, modi() As Long, j As Long, wsD As Worksheet, zelle As String, d As Variant, arten As String
    If gewaehlt = 0 Then Exit Sub
    If Not Bereit() Then Exit Sub
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    n = Anzahl(gewaehlt, schrittArt)
    If n = 0 Then Exit Sub
    neu = n + schritt
    If schrittArt = "M" Then
        If neu < 2 Then neu = 2
        If neu > mMax Then neu = mMax
    Else
        If neu < kwMin Then neu = kwMin
        If neu > kwMax Then neu = kwMax
    End If
    If neu = n Then Exit Sub
    Application.ScreenUpdating = False
    ReDim modi(0 To 9)
    For j = 0 To 9
        modi(j) = WertModus(gewaehlt, j)                ' Einstellung der Werte merken, danach auf die neuen Punkte uebertragen
    Next j
    zelle = CStr(wsD.Cells(gewaehlt, regSpalte + 4).Value)
    If schrittArt = "W" And Len(zelle) > 0 Then
        ThisWorkbook.Worksheets(BLATT_D).Range(Mid$(zelle, InStr(zelle, "!") + 1)).Value = neu
        Application.Calculate
    End If
    For Each d In Split(CStr(wsD.Cells(gewaehlt, regSpalte + 3).Value), ";")
        arten = CStr(Split(d, ":")(1))
        If (schrittArt = "M" And arten = "M") Or (schrittArt = "W" And (arten = "W" Or arten = "B")) Then
            BereichSetzen Diagramm(CStr(Split(d, ":")(0))), arten, neu
        End If
    Next d
    For j = 0 To 9
        If Len(CStr(wsD.Cells(gewaehlt, regSpalte + 5 + j).Value)) > 0 Then WertSetzen gewaehlt, j, modi(j)
    Next j
    If schrittArt = "W" And Len(zelle) > 0 Then modPPT.SpartenStapeln
    FussnoteKW
    Application.ScreenUpdating = True
    modKarte.KartenEntfernen
    DetailZeichnen
End Sub

Public Sub WertAnwenden()
    If gewaehlt = 0 Then Exit Sub
    If Not Bereit() Then Exit Sub
    Application.ScreenUpdating = False
    WertSetzen gewaehlt, wertNr, neuModus
    Application.ScreenUpdating = True
    modKarte.KartenEntfernen
    DetailZeichnen
End Sub

' Datenbereich aller Reihen eines Diagramms auf n Wochen/Monate (Ende fest) bzw. n BUE-Plaetze
Private Sub BereichSetzen(ch As Object, art As String, n As Long)
    Dim s As Object, c1 As Long, c2 As Long, rk As Long, rv As Long, wsD As Worksheet
    If ch Is Nothing Then Exit Sub
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    Spalten art, n, c1, c2
    On Error Resume Next
    For Each s In ch.SeriesCollection
        rk = ZeileAus(s.Formula, 1)
        rv = ZeileAus(s.Formula, 2)
        If rv > 0 Then s.Values = "='" & BLATT_D & "'!" & wsD.Range(wsD.Cells(rv, c1), wsD.Cells(rv, c2)).Address
        If rk > 0 Then s.XValues = "='" & BLATT_D & "'!" & wsD.Range(wsD.Cells(rk, c1), wsD.Cells(rk, c2)).Address
    Next s
    On Error GoTo 0
End Sub

Private Sub Spalten(art As String, n As Long, ByRef c1 As Long, ByRef c2 As Long)
    Select Case art
        Case "M": c2 = mLetzte: c1 = c2 - n + 1
        Case "F": c1 = fErste: c2 = fErste + n - 1
        Case "B": c1 = sErste: c2 = sErste + n - 1
        Case Else: c2 = wLetzte: c1 = c2 - n + 1
    End Select
End Sub

' Zeile des k-ten Bezugs auf Dashboard_Daten in der Reihenformel (1 = Kategorien, 2 = Werte)
Private Function ZeileAus(f As String, k As Long) As Long
    Dim p As Long, i As Long, t As String, j As Long, z As String
    p = 0
    For i = 1 To k
        p = InStr(p + 1, f, BLATT_D & "!")
        If p = 0 Then Exit Function
    Next i
    t = Mid$(f, p + Len(BLATT_D) + 1, 24)
    j = 1
    If Mid$(t, j, 1) = "$" Then j = j + 1
    Do While j <= Len(t) And Mid$(t, j, 1) Like "[A-Za-z]"
        j = j + 1
    Loop
    If Mid$(t, j, 1) = "$" Then j = j + 1
    Do While j <= Len(t) And Mid$(t, j, 1) Like "#"
        z = z & Mid$(t, j, 1)
        j = j + 1
    Loop
    If Len(z) > 0 Then ZeileAus = CLng(z)
End Function

Private Function Diagramm(nm As String) As Object
    On Error Resume Next
    Set Diagramm = ActiveSheet.ChartObjects(nm).Chart
    On Error GoTo 0
End Function

Private Function ArtVon(r As Long, dname As String) As String
    Dim d As Variant
    For Each d In Split(CStr(ThisWorkbook.Worksheets(BLATT_D).Cells(r, regSpalte + 3).Value), ";")
        If CStr(Split(d, ":")(0)) = dname Then ArtVon = Split(d, ":")(1): Exit Function
    Next d
End Function

' Zahl der gezeigten Wochen (W, auch BUE) bzw. Monate (M; F = feste Monate) einer Kachel
Private Function Anzahl(r As Long, art As String) As Long
    Dim d As Variant, a As String, ch As Object, zelle As String, wsD As Worksheet
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    zelle = CStr(wsD.Cells(r, regSpalte + 4).Value)
    If art = "W" And Len(zelle) > 0 Then
        Anzahl = CLng(Val(wsD.Range(Mid$(zelle, InStr(zelle, "!") + 1)).Value))
        Exit Function
    End If
    For Each d In Split(CStr(wsD.Cells(r, regSpalte + 3).Value), ";")
        a = Split(d, ":")(1)
        If a = art Then
            Set ch = Nothing
            On Error Resume Next
            Set ch = ThisWorkbook.Worksheets(CStr(wsD.Cells(r, regSpalte).Value)).ChartObjects(CStr(Split(d, ":")(0))).Chart
            If Not ch Is Nothing Then Anzahl = ch.SeriesCollection(1).Points.Count
            On Error GoTo 0
            If Anzahl > 0 Then Exit Function
        End If
    Next d
End Function

' Einstellung eines Werts: 1 = alle, 2 = letzte 2 KW (BUE: aktuelle KW), 0 = aus (gelesen an der ersten Reihe des Eintrags)
Private Function WertModus(r As Long, j As Long) As Long
    Dim w As String, teile() As String, erste() As String, s As Object, n As Long, ch As Object, schalter As String
    w = CStr(ThisWorkbook.Worksheets(BLATT_D).Cells(r, regSpalte + 5 + j).Value)
    If Len(w) = 0 Then Exit Function
    teile = Split(w, "|")
    If UBound(teile) >= 2 Then schalter = teile(2)
    If Len(schalter) > 0 Then
        If Val(ThisWorkbook.Worksheets(BLATT_D).Range(Mid$(schalter, InStr(schalter, "!") + 1)).Value) = 0 Then Exit Function
    End If
    erste = Split(Split(teile(1), ",")(0), ">")
    On Error Resume Next
    Set ch = ThisWorkbook.Worksheets(CStr(ThisWorkbook.Worksheets(BLATT_D).Cells(r, regSpalte).Value)).ChartObjects(erste(0)).Chart
    Set s = ch.SeriesCollection(erste(1))
    If s Is Nothing Then Exit Function
    If Not s.HasDataLabels Then Exit Function
    n = s.Points.Count
    If n = 0 Then Exit Function
    On Error GoTo 0
    Dim i As Long, an As Long, erstesAn As Boolean
    On Error GoTo Ende
    erstesAn = s.Points(1).HasDataLabel
    For i = n To 1 Step -1
        If s.Points(i).HasDataLabel Then an = an + 1
    Next i
    If erstesAn Then
        WertModus = 1
    ElseIf an > 0 Then
        WertModus = 2
    End If
Ende:
End Function

Private Sub WertSetzen(r As Long, j As Long, modus As Long)
    Dim w As String, teile() As String, eintrag As Variant, x() As String, ch As Object, s As Object, wsD As Worksheet
    Dim i As Long, n As Long, grenze As Long, c1 As Long, c2 As Long, art As String, zeile As Long, schalter As String
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    w = CStr(wsD.Cells(r, regSpalte + 5 + j).Value)
    If Len(w) = 0 Then Exit Sub
    teile = Split(w, "|")
    If UBound(teile) >= 2 Then schalter = teile(2)
    If Len(schalter) > 0 Then                           ' Delta-Zeile: Werte erst berechnen lassen (ohne Schalter #NV)
        wsD.Range(Mid$(schalter, InStr(schalter, "!") + 1)).Value = IIf(modus = 0, 0, 1)
        Application.Calculate
    End If
    On Error Resume Next
    For Each eintrag In Split(teile(1), ",")
        x = Split(eintrag, ">")
        Set ch = Nothing: Set s = Nothing
        Set ch = ThisWorkbook.Worksheets(CStr(wsD.Cells(r, regSpalte).Value)).ChartObjects(x(0)).Chart
        If Not ch Is Nothing Then Set s = ch.SeriesCollection(x(1))
        If Not s Is Nothing Then
            art = ArtVon(r, CStr(x(0)))
            zeile = CLng(Val(x(2)))
            n = s.Points.Count
            Spalten art, n, c1, c2
            grenze = IIf(art = "B", n - 1, n - 2)      ' BUE: nur die aktuelle KW
            If modus > 0 And Not s.HasDataLabels Then s.HasDataLabels = True
            For i = 1 To n
                If modus = 1 Or (modus = 2 And i > grenze) Then
                    s.Points(i).HasDataLabel = True
                    If zeile > 0 Then TextSetzen s.Points(i).DataLabel, wsD.Cells(zeile, c1 + i - 1)
                Else
                    s.Points(i).HasDataLabel = False
                End If
            Next i
        End If
    Next eintrag
    On Error GoTo 0
End Sub

' Beschriftung aus einer Zelle als fester Text (leer = ein Leerzeichen, sonst zeigt Excel wieder den Zahlenwert)
Private Function TextAus(z As Range) As String
    TextAus = CStr(z.Text)
    If Len(Trim$(TextAus)) = 0 Or Left$(TextAus, 1) = "#" Then TextAus = " "
End Function

' Text einer Beschriftung setzen. Excel gibt einer Beschriftung mit festem Text dabei oft einen Rahmen (Kasten um die Zahl, im
' PowerPoint-Export deutlich sichtbar) - der Rahmen wird deshalb jedes Mal wieder ausgeschaltet. Die Fuellung bleibt, wie sie ist.
Private Sub TextSetzen(dl As Object, z As Range)
    On Error Resume Next
    dl.Text = TextAus(z)
    dl.Format.Line.Visible = msoFalse
End Sub

' Beschriftungen aus Zellen (z. B. Erledigungsquote ueber den Neueinstellungen) neu schreiben: als fester Text je Punkt. Eine
' Verknuepfung je Punkt verwirft Excel, sobald sich der Datenbereich der Reihe aendert (- / + bei den Monaten) – dann stand dort
' die Zahl der Saeule statt der Quote. Laeuft beim Oeffnen, beim Wechsel auf ein Folienblatt und vor dem PowerPoint-Export.
Public Sub TextBeschriftungen()
    Dim wsD As Worksheet, r As Long, j As Long, w As String, teile() As String, eintrag As Variant, x() As String
    Dim ch As Object, s As Object, i As Long, n As Long, c1 As Long, c2 As Long, zeile As Long, art As String
    On Error GoTo Ende
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    regSpalte = 0
    For i = 1 To 400
        If CStr(wsD.Cells(6, i).Value) = KOPF Then regSpalte = i: Exit For
    Next i
    If regSpalte = 0 Then Exit Sub
    wLetzte = CLng(wsD.Cells(3, regSpalte + 1).Value)
    mLetzte = CLng(wsD.Cells(3, regSpalte + 2).Value)
    sErste = CLng(wsD.Cells(3, regSpalte + 3).Value)
    fErste = CLng(Val(wsD.Cells(3, regSpalte + 7).Value))
    On Error Resume Next
    For r = 7 To 200
        If Len(CStr(wsD.Cells(r, regSpalte).Value)) = 0 Then Exit For
        For j = 0 To 9
            w = CStr(wsD.Cells(r, regSpalte + 5 + j).Value)
            If Len(w) > 0 Then
                teile = Split(w, "|")
                For Each eintrag In Split(teile(1), ",")
                    x = Split(eintrag, ">")
                    zeile = CLng(Val(x(2)))
                    If zeile > 0 Then
                        Set ch = Nothing: Set s = Nothing
                        Set ch = ThisWorkbook.Worksheets(CStr(wsD.Cells(r, regSpalte).Value)).ChartObjects(x(0)).Chart
                        If Not ch Is Nothing Then Set s = ch.SeriesCollection(x(1))
                        If Not s Is Nothing Then
                            art = ArtVon(r, CStr(x(0)))
                            n = s.Points.Count
                            Spalten art, n, c1, c2
                            For i = 1 To n
                                If s.Points(i).HasDataLabel Then TextSetzen s.Points(i).DataLabel, wsD.Cells(zeile, c1 + i - 1)
                            Next i
                        End If
                    End If
                Next eintrag
            End If
        Next j
    Next r
Ende:
End Sub

' Fussnote der Folien: groesste Zahl gezeigter KW ueber alle Kacheln (Dashboard_Daten!B3)
Private Sub FussnoteKW()
    Dim r As Long, m As Long, n As Long, wsD As Worksheet
    Set wsD = ThisWorkbook.Worksheets(BLATT_D)
    For r = 7 To 200
        If Len(CStr(wsD.Cells(r, regSpalte).Value)) = 0 Then Exit For
        n = Anzahl(r, "W")
        If n > m Then m = n
    Next r
    If m > 0 Then wsD.Range("B3").Value = m
End Sub
