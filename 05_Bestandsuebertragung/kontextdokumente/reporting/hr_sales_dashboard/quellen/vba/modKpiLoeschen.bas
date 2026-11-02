Option Explicit
' ============================================================================
' modKpiLoeschen – Knopf „KPI löschen“ im Blatt Zuständigkeiten
'
'   Zeigen        Karte mit den Themen aus Rohdaten (Spalte B gilt bis zum naechsten Eintrag; gleiche Themen hintereinander
'                 zusammen, z. B. Watchlist). Klick auf ein Thema waehlt das ganze Cluster (alle KPIs darin, die sich loeschen
'                 lassen), der Pfeil klappt es auf: darunter die KPIs (Code-Block: Zeile mit Code samt den Zeilen ohne Code,
'                 die zu ihr gehoeren – auf die ihre Formel verweist, sonst die folgenden) und deren einzelne Wertzeilen zum
'                 Einzelwaehlen. Blaettern bei vielen Eintraegen.
'   Gesperrt      (grau mit Grund, nicht anklickbar): die BUE-Zeilen 7VA..7OL; Zeilen, auf die ein anderes Blatt verweist
'                 (Dashboard_Daten = Kacheln PPT_2 und PPT_3, BUE_Serviceparameter, Namen – ohne Filter-/Druckbereich und
'                 ausgeblendete Namen); Zeilen, auf die eine verbleibende Formel in Rohdaten verweist (z. B. die Summe der
'                 Kategorie) – sie werden waehlbar, sobald die Zeile mit der Formel mitgewaehlt ist (Thema oder ganze KPI); die
'                 Kopfzeile (Code) einer KPI mit Zeilen ohne Code nur zusammen mit diesen (sonst blieben Zeilen ohne Code
'                 stehen, die keiner KPI mehr gehoeren). Uebersicht, Zustaendigkeiten und Wertstand sperren nicht: ihre
'                 Zeilen zu den geloeschten Kennzahlen fallen mit weg.
'   Bestaetigen   Karte: Anzahl Zeilen, Beschriftungen, betroffene Blaetter, „nicht rückgängig – vorher speichern“,
'                 „Endgültig löschen“ / „Abbrechen“.
'   Loeschen      Erst pruefen, dass alle vier Blaetter beschreibbar sind (Schutz ohne Kennwort wird aufgehoben und danach
'                 genauso wieder gesetzt; mit Kennwort: Abbruch, nichts geloescht). Dann Uebersicht: Eintraege zu den Zeilen;
'                 Zustaendigkeiten: ihre Wertzeilen und leer gewordene Kategorie-/Themenbaender; Wertstand und Rohdaten:
'                 dieselben Zeilen (gleicher Aufbau), jeweils mit EntireRow.Delete von unten nach oben – zuerst die Blaetter,
'                 die auf Rohdaten verweisen, damit kein #BEZUG! entsteht. Danach Pruefung, dass Wertstand und Rohdaten
'                 zeilengleich sind. Bricht es nach dem ersten Loeschen ab: „teilweise;…“ mit den erledigten Schritten und dem
'                 Rat, ohne Speichern zu schliessen.
'                 In Rohdaten: verbundene Zellen (Thema B, Verantwortlich E) werden vorher getrennt und danach ueber die
'                 verbliebenen Zeilen neu verbunden; steht Thema (B) oder Kategorie (C) in einer geloeschten Zeile und bleiben
'                 Zeilen davon uebrig, wandert der Text in die neue erste Zeile (mit der Themenlinie oben); verliert eine
'                 eingeklappte Gruppe ihre Kopfzeile, wird die naechste verbliebene Zeile der neue Kopf (Excel).
'   Ohne Dialoge  KpiLoeschbar(rohZeile) -> "" oder Grund (Zeile allein); KpiLoeschenZeilen("12,13,14") -> "ok;rohdaten=…;
'                 wertstand=…;zustaendigkeiten=…;uebersicht=…;zeilen=…", "fehler;…" (nichts geloescht) oder "teilweise;…";
'                 KpiLoeschenVersion().
' ============================================================================

Private Const BLATT_RD As String = "Rohdaten"
Private Const BLATT_WS As String = "Wertstand"
Private Const BLATT_ZU As String = "Zuständigkeiten"
Private Const BLATT_UE As String = "Übersicht"
Private Const JE_SEITE As Long = 12
Private Const MAX_REF As Long = 4000

' Rohdaten (Zeilen 3..nRd): Code, Beschriftung, Thema (Index der Anzeige), KPI-Einheit, Sperrgrund von aussen
Private nRd As Long
Private zCode() As String, zKat() As String, zAbt() As String, zLeer() As Boolean, zThema() As Long, zEinheit() As Long, zExtern() As String
' Themen und KPI-Einheiten
Private nThemen As Long, tText() As String, tNr() As String, tVon() As Long, tBis() As Long, tOffen() As Boolean
Private nEinh As Long, eKopf() As Long, eThema() As Long, eText() As String, eZahl() As Long
' Formelbezuege in Rohdaten: Zeile mit der Formel, Bereich von/bis, Bereich (True) oder Einzelzelle
Private nRef As Long, refZ() As Long, refA() As Long, refB() As Long, refBer() As Boolean
' Auswahl und Anzeige
Private gew() As Boolean, seite As Long, meldung As String
Private nItem As Long, itArt() As Long, itId() As Long
Private seiteArt(1 To 12) As Long, seiteId(1 To 12) As Long
Private bereit As Boolean

Public Function KpiLoeschenVersion() As String
    KpiLoeschenVersion = "2"
End Function

' ---------------------------------------------------------------- Analyse von Rohdaten
Private Function Ist(ws As Worksheet, r As Long, c As Long) As String
    Dim v As Variant
    v = ws.Cells(r, c).Value
    If IsError(v) Or IsEmpty(v) Then Exit Function
    Ist = Trim$(Replace(Replace(CStr(v), vbLf, " "), vbCr, " "))
End Function

Private Function IstBuchstabe(ch As String) As Boolean
    If Len(ch) = 0 Then Exit Function
    IstBuchstabe = (ch Like "[A-Za-z]") Or AscW(ch) > 127
End Function

Private Function IstZiffer(ch As String) As Boolean
    If Len(ch) = 0 Then Exit Function
    IstZiffer = (ch Like "#")
End Function

Private Function NameZeichen(ch As String) As Boolean
    NameZeichen = IstBuchstabe(ch) Or IstZiffer(ch) Or ch = "_" Or ch = "."
End Function

' R1C1-Bezug ab Position j lesen (j steht danach hinter dem Bezug); zeile = Zeile der Formel; liefert die absolute Zeile in r
Private Function LeseRC(f As String, ByRef j As Long, zeile As Long, ByRef r As Long) As Boolean
    Dim k As Long, t As String, hatZeile As Boolean, hatSpalte As Boolean
    k = j
    If Mid$(f, k, 1) <> "R" Then Exit Function
    k = k + 1
    r = zeile
    If Mid$(f, k, 1) = "[" Then
        t = ""
        k = k + 1
        Do While k <= Len(f) And Mid$(f, k, 1) <> "]"
            t = t & Mid$(f, k, 1)
            k = k + 1
        Loop
        If Len(t) = 0 Or k > Len(f) Then Exit Function
        r = zeile + CLng(Val(t))
        k = k + 1
        hatZeile = True
    ElseIf IstZiffer(Mid$(f, k, 1)) Then
        t = ""
        Do While IstZiffer(Mid$(f, k, 1))
            t = t & Mid$(f, k, 1)
            k = k + 1
        Loop
        r = CLng(Val(t))
        hatZeile = True
    End If
    If Mid$(f, k, 1) = "C" Then
        k = k + 1
        hatSpalte = True
        If Mid$(f, k, 1) = "[" Then
            Do While k <= Len(f) And Mid$(f, k, 1) <> "]"
                k = k + 1
            Loop
            If k > Len(f) Then Exit Function
            k = k + 1
        Else
            Do While IstZiffer(Mid$(f, k, 1))
                k = k + 1
            Loop
        End If
    End If
    If Not hatSpalte And Not hatZeile Then Exit Function
    If k <= Len(f) Then
        If NameZeichen(Mid$(f, k, 1)) Or Mid$(f, k, 1) = "(" Or Mid$(f, k, 1) = "!" Then Exit Function
    End If
    j = k
    LeseRC = True
End Function

' Bezuege einer Formel (R1C1) auf das eigene Blatt merken: ohne Texte, ohne Bezuege mit Blattnamen (andere Blaetter, externe
' Mappen); nur Zeilen ab 3 (Kopfzeilen werden nie geloescht)
Private Sub FormelMerken(f As String, zeile As Long, ByVal ab As Long)
    Dim i As Long, L As Long, ch As String, fremd As Boolean, r1 As Long, r2 As Long, j As Long, k As Long, bereich As Boolean
    L = Len(f)
    i = 1
    Do While i <= L
        ch = Mid$(f, i, 1)
        If ch = """" Then                                    ' Text
            i = i + 1
            Do While i <= L
                If Mid$(f, i, 1) = """" Then
                    If Mid$(f, i + 1, 1) = """" Then
                        i = i + 1
                    Else
                        Exit Do
                    End If
                End If
                i = i + 1
            Loop
            i = i + 1
        ElseIf ch = "'" Then                                 ' Blattname in Hochkommas
            i = i + 1
            Do While i <= L
                If Mid$(f, i, 1) = "'" Then
                    If Mid$(f, i + 1, 1) = "'" Then
                        i = i + 1
                    Else
                        Exit Do
                    End If
                End If
                i = i + 1
            Loop
            i = i + 1
            fremd = (Mid$(f, i, 1) = "!")
            If fremd Then i = i + 1
        ElseIf ch = "[" Then                                 ' externe Mappe [Datei]Blatt!
            j = InStr(i, f, "]")
            If j = 0 Then Exit Do
            i = j + 1
        ElseIf IstBuchstabe(ch) Or ch = "_" Then
            j = i
            If LeseRC(f, j, zeile, r1) Then
                r2 = r1
                bereich = False
                If Mid$(f, j, 1) = ":" Then
                    k = j + 1
                    If LeseRC(f, k, zeile, r2) Then
                        j = k
                        bereich = True
                    End If
                End If
                If Not fremd Then RefNeu zeile, r1, r2, bereich, ab
                fremd = False
                i = j
            Else
                Do While i <= L                              ' Funktion, Name oder Blattname: ganz ueberspringen
                    If Not NameZeichen(Mid$(f, i, 1)) Then Exit Do
                    i = i + 1
                Loop
                fremd = (Mid$(f, i, 1) = "!")
                If fremd Then i = i + 1
            End If
        Else
            i = i + 1
        End If
    Loop
End Sub

Private Sub RefNeu(zeile As Long, ByVal a As Long, ByVal b As Long, bereich As Boolean, ab As Long)
    Dim i As Long, t As Long
    If a > b Then t = a: a = b: b = t
    If b < 3 Then Exit Sub
    If a < 3 Then a = 3
    For i = ab To nRef                                       ' schon gemerkt (gleiche Zeile)?
        If refA(i) = a And refB(i) = b And refBer(i) = bereich Then Exit Sub
    Next i
    If nRef >= MAX_REF Then Exit Sub
    nRef = nRef + 1
    refZ(nRef) = zeile: refA(nRef) = a: refB(nRef) = b: refBer(nRef) = bereich
End Sub

' Zeilen eines Blatts (Rohdaten oder Wertstand), auf die eine Formel (A1, mit Blattnamen) verweist: alle Vorkommen von
' Blatt!… bzw. 'Blatt'!… (Rohdaten_2 zaehlt nicht: dort folgt "_" statt "!")
Private Sub ZeilenAusFormel(f As String, blatt As String, ByRef von() As Long, ByRef bis() As Long, ByRef n As Long)
    Dim p As Long, q As Long, s As String, r1 As Long, r2 As Long, t As Long, muster As Variant, vor As String
    n = 0
    For Each muster In Array(blatt & "!", blatt & "'!")
        p = InStr(1, f, CStr(muster), vbTextCompare)
        Do While p > 0
            vor = ""
            If p > 1 Then vor = Mid$(f, p - 1, 1)
            If p = 1 Or Not (NameZeichen(vor)) Then
                q = p + Len(CStr(muster))
                s = ""
                Do While q <= Len(f)
                    If Not (NameZeichen(Mid$(f, q, 1)) Or Mid$(f, q, 1) = "$" Or Mid$(f, q, 1) = ":") Then Exit Do
                    s = s & Mid$(f, q, 1)
                    q = q + 1
                Loop
                If A1Zeilen(s, r1, r2) Then
                    If n < 50 Then
                        n = n + 1
                        If r1 > r2 Then t = r1: r1 = r2: r2 = t
                        von(n) = r1: bis(n) = r2
                    End If
                End If
            End If
            p = InStr(p + 1, f, CStr(muster), vbTextCompare)
        Loop
    Next muster
End Sub

' "$A$12:$LJ$12" / "A12" -> Zeilen 12..12
Private Function A1Zeilen(s As String, ByRef r1 As Long, ByRef r2 As Long) As Boolean
    Dim teile() As String
    If Len(s) = 0 Then Exit Function
    teile = Split(Replace(s, "$", ""), ":")
    r1 = ZeileAusA1(teile(0))
    If r1 = 0 Then Exit Function
    r2 = r1
    If UBound(teile) >= 1 Then r2 = ZeileAusA1(teile(1))
    If r2 = 0 Then r2 = r1
    A1Zeilen = True
End Function

Private Function ZeileAusA1(t As String) As Long
    Dim i As Long
    For i = 1 To Len(t)
        If IstZiffer(Mid$(t, i, 1)) Then
            ZeileAusA1 = CLng(Val(Mid$(t, i)))
            Exit Function
        End If
    Next i
End Function

Private Function IstBue(code As String) As Boolean
    Dim c As String
    c = UCase$(code)
    IstBue = (Len(c) = 3 And (Left$(c, 2) = "7V" Or Left$(c, 2) = "7O"))
End Function

' Rohdaten lesen: Themen, KPI-Einheiten, Formelbezuege, Sperren von aussen
Private Sub Analysieren()
    Dim ws As Worksheet, r As Long, c As Long, letzte As Long, fr As Variant, kopf As Variant, f As String, ab As Long
    Dim uq() As String, nU As Long, k As Long, gef As Boolean, t As Long, thema As String, katAkt As String, i As Long
    Dim w As Worksheet, fa As Variant, rr As Long, cc As Long, von(1 To 50) As Long, bis(1 To 50) As Long, n As Long, warum As String
    Dim nm As Object, u As Long, kand As Long, x As Long, delta As String
    Set ws = ThisWorkbook.Worksheets(BLATT_RD)
    letzte = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
    nRd = 2
    For r = letzte To 3 Step -1
        For c = 1 To 5
            If Len(Ist(ws, r, c)) > 0 Then nRd = r: Exit For
        Next c
        If nRd > 2 Then Exit For
    Next r
    ReDim zCode(1 To nRd): ReDim zKat(1 To nRd): ReDim zAbt(1 To nRd): ReDim zLeer(1 To nRd)
    ReDim zThema(1 To nRd): ReDim zEinheit(1 To nRd): ReDim zExtern(1 To nRd)
    ReDim tText(1 To nRd): ReDim tNr(1 To nRd): ReDim tVon(1 To nRd): ReDim tBis(1 To nRd)
    ReDim eKopf(1 To nRd): ReDim eThema(1 To nRd): ReDim eText(1 To nRd): ReDim eZahl(1 To nRd)
    ReDim refZ(1 To MAX_REF): ReDim refA(1 To MAX_REF): ReDim refB(1 To MAX_REF): ReDim refBer(1 To MAX_REF)
    nThemen = 0: nEinh = 0: nRef = 0
    ' Themen (B gilt bis zum naechsten Eintrag; gleiche Namen hintereinander = ein Thema), Kategorie (C gilt bis zur naechsten)
    For r = 3 To nRd
        zCode(r) = Ist(ws, r, 1)
        zAbt(r) = Ist(ws, r, 4)
        zLeer(r) = (Len(zCode(r)) = 0 And Len(Ist(ws, r, 2)) = 0 And Len(Ist(ws, r, 3)) = 0 And Len(zAbt(r)) = 0 And Len(Ist(ws, r, 5)) = 0)
        If Len(Ist(ws, r, 2)) > 0 Then
            katAkt = ""
            If LCase$(Ist(ws, r, 2)) <> LCase$(thema) Or nThemen = 0 Then
                nThemen = nThemen + 1
                tText(nThemen) = Ist(ws, r, 2)
                tVon(nThemen) = r
            End If
            thema = Ist(ws, r, 2)
        ElseIf nThemen = 0 Then
            nThemen = 1: tText(1) = "(ohne Thema)": tVon(1) = r
        End If
        If Len(Ist(ws, r, 3)) > 0 Then katAkt = Ist(ws, r, 3)
        zKat(r) = katAkt
        zThema(r) = nThemen
        tBis(nThemen) = r
        If Len(tNr(nThemen)) = 0 And Len(zCode(r)) > 0 Then
            For k = 1 To Len(zCode(r))
                If Not IstZiffer(Mid$(zCode(r), k, 1)) Then Exit For
            Next k
            tNr(nThemen) = Left$(zCode(r), k - 1)
        End If
    Next r
    ' Formelbezuege (R1C1: in einer Zeile meist dieselbe Formel in jeder Spalte -> je Zeile nur einmal lesen). Spalten mit
    ' Delta-Kopf rechnen nur in der eigenen Zeile und werden uebersprungen.
    fr = ws.Range(ws.Cells(1, 1), ws.Cells(nRd, modBasis.RD_LETZTE_SPALTE)).FormulaR1C1
    kopf = ws.Range(ws.Cells(1, 1), ws.Cells(1, modBasis.RD_LETZTE_SPALTE)).Value2
    delta = ChrW(916)
    ReDim uq(1 To 64)
    For r = 3 To nRd
        nU = 0
        ab = nRef + 1
        For c = 1 To modBasis.RD_LETZTE_SPALTE
            If IsError(kopf(1, c)) Then
                f = ""
            ElseIf CStr(kopf(1, c)) = delta Then
                f = ""
            Else
                f = CStr(fr(r, c))
            End If
            If Len(f) > 0 Then
                If Left$(f, 1) = "=" Then
                    gef = False
                    For k = 1 To nU
                        If uq(k) = f Then gef = True: Exit For
                    Next k
                    If Not gef Then
                        If nU < 64 Then nU = nU + 1: uq(nU) = f
                        FormelMerken f, r, ab
                    End If
                End If
            End If
        Next c
    Next r
    ' KPI-Einheiten: jede Zeile mit Code ist eine; Zeilen ohne Code gehoeren zur Code-Zeile desselben Themas, deren Formel auf
    ' sie verweist (z. B. 8a = EASY + Online davor), sonst zur Code-Zeile davor, sonst zur ersten danach
    For r = 3 To nRd
        If Len(zCode(r)) > 0 Then
            nEinh = nEinh + 1
            eKopf(nEinh) = r: eThema(nEinh) = zThema(r)
            eText(nEinh) = zCode(r) & IIf(Len(zKat(r)) > 0, " · " & zKat(r), "") & IIf(Len(zAbt(r)) > 0, " · " & zAbt(r), "")
            zEinheit(r) = nEinh
        End If
    Next r
    For r = 3 To nRd
        If zEinheit(r) = 0 Then
            kand = 0
            For i = 1 To nRef
                x = refZ(i)
                If x <> r And Len(zCode(x)) > 0 And zThema(x) = zThema(r) And refA(i) <= r And refB(i) >= r Then
                    If kand = 0 Then
                        kand = x
                    ElseIf Abs(x - r) < Abs(kand - r) Then
                        kand = x
                    End If
                End If
            Next i
            If kand = 0 Then
                For x = r - 1 To tVon(zThema(r)) Step -1
                    If Len(zCode(x)) > 0 Then kand = x: Exit For
                Next x
            End If
            If kand = 0 Then
                For x = r + 1 To tBis(zThema(r))
                    If Len(zCode(x)) > 0 Then kand = x: Exit For
                Next x
            End If
            If kand > 0 Then
                zEinheit(r) = zEinheit(kand)
            Else                                             ' Thema ganz ohne Code: eine Einheit fuer das Thema
                For u = 1 To nEinh
                    If eThema(u) = zThema(r) And Len(zCode(eKopf(u))) = 0 Then zEinheit(r) = u: Exit For
                Next u
                If zEinheit(r) = 0 Then
                    nEinh = nEinh + 1
                    eKopf(nEinh) = r: eThema(nEinh) = zThema(r): eText(nEinh) = tText(zThema(r))
                    zEinheit(r) = nEinh
                End If
            End If
        End If
    Next r
    For r = 3 To nRd
        eZahl(zEinheit(r)) = eZahl(zEinheit(r)) + 1
    Next r
    ' Sperren von aussen: BUE-Zeilen; Verweise aus anderen Blaettern (nicht Wertstand/Zustaendigkeiten/Uebersicht: deren Zeilen
    ' fallen mit weg) und aus Namen
    For r = 3 To nRd
        If IstBue(zCode(r)) Then zExtern(r) = "BÜ-Zeile – kommt automatisch aus dem BÜ-Reporting"
    Next r
    For Each w In ThisWorkbook.Worksheets
        If w.Name <> BLATT_RD And w.Name <> BLATT_WS And w.Name <> BLATT_ZU And w.Name <> BLATT_UE Then
            If w.Name = "Dashboard_Daten" Then
                warum = "in einer Kachel verwendet (Dashboard_Daten)"
            ElseIf w.Name = "BUE_Serviceparameter" Then
                warum = "BÜ-Serviceparameter verweist darauf"
            Else
                warum = "Blatt „" & w.Name & "“ verweist darauf"
            End If
            fa = w.UsedRange.Formula
            If IsArray(fa) Then
                For rr = LBound(fa, 1) To UBound(fa, 1)
                    For cc = LBound(fa, 2) To UBound(fa, 2)
                        f = CStr(fa(rr, cc))
                        If Left$(f, 1) = "=" Then ExternFormel f, von, bis, warum
                    Next cc
                Next rr
            Else
                f = CStr(fa)
                If Left$(f, 1) = "=" Then ExternFormel f, von, bis, warum
            End If
        End If
    Next w
    On Error Resume Next
    For Each nm In ThisWorkbook.Names
        If NameZaehlt(nm) Then
            f = CStr(nm.RefersTo)
            ExternFormel f, von, bis, "Name „" & nm.Name & "“ verweist darauf"
        End If
    Next nm
    On Error GoTo 0
    ReDim gew(1 To nRd)
    ReDim tOffen(1 To nThemen)
    bereit = True
End Sub

' Namen, die sperren: eigene, sichtbare Namen. Nicht: Filter- und Druckbereiche (Excel legt _FilterDatabase, Print_Area,
' Print_Titles beim Filtern/Drucken selbst an und passt sie beim Zeilenloeschen an), _xlfn./_xlnm.-Namen, ausgeblendete Namen.
Private Function NameZaehlt(nm As Object) As Boolean
    Dim n As String, sichtbar As Boolean
    n = LCase$(CStr(nm.Name))
    If InStr(n, "!") > 0 Then n = Mid$(n, InStrRev(n, "!") + 1)
    sichtbar = True
    On Error Resume Next
    sichtbar = nm.Visible
    On Error GoTo 0
    If Not sichtbar Then Exit Function
    If n = "_filterdatabase" Or n = "print_area" Or n = "print_titles" Or n = "druckbereich" Or n = "drucktitel" Then Exit Function
    If Left$(n, 6) = "_xlfn." Or Left$(n, 6) = "_xlnm." Then Exit Function
    NameZaehlt = True
End Function

' Verweis aus einem anderen Blatt auf Rohdaten oder Wertstand (gleicher Aufbau: Wertstand-Zeile r = Rohdaten-Zeile r) sperrt
Private Sub ExternFormel(f As String, von() As Long, bis() As Long, warum As String)
    Dim n As Long
    If InStr(1, f, BLATT_RD, vbTextCompare) > 0 Then
        ZeilenAusFormel f, BLATT_RD, von, bis, n
        ExternMerken von, bis, n, warum
    End If
    If InStr(1, f, BLATT_WS, vbTextCompare) > 0 Then
        ZeilenAusFormel f, BLATT_WS, von, bis, n
        ExternMerken von, bis, n, warum
    End If
End Sub

Private Sub ExternMerken(von() As Long, bis() As Long, n As Long, warum As String)
    Dim i As Long, r As Long
    For i = 1 To n
        For r = von(i) To bis(i)
            If r >= 3 And r <= nRd Then
                If Len(zExtern(r)) = 0 Then zExtern(r) = warum
            End If
        Next r
    Next i
End Sub

Private Function ZeileName(r As Long) As String
    ZeileName = "Zeile " & r & IIf(Len(zCode(r)) > 0, " (" & zCode(r) & ")", "")
End Function

' Grund, warum die Menge s nicht geloescht werden darf ("" = darf). nur: nur Gruende fuer diese Zeilen melden (Anzeige einer
' einzelnen KPI im Zusammenhang mit der Auswahl); ohne nur alle.
Private Function Grund(s() As Boolean, Optional nur As Variant) As String
    Dim r As Long, i As Long, q As Long, x As Long, drin As Long, gesamt As Long, gleichesThema As Boolean, erste As Long
    Dim mitNur As Boolean, u As Long, k As Long
    mitNur = Not IsMissing(nur)
    For r = 3 To nRd
        If s(r) And Len(zExtern(r)) > 0 Then
            If Not mitNur Then
                Grund = ZeileName(r) & ": " & zExtern(r)
                Exit Function
            ElseIf nur(r) Then
                Grund = zExtern(r)
                Exit Function
            End If
        End If
    Next r
    ' Kopfzeile (Code) einer KPI mit Zeilen ohne Code nur zusammen mit diesen: sonst blieben Zeilen ohne Code stehen, die keiner
    ' KPI mehr gehoeren („Werte aus HS-Dashboard 2025“ ordnete sie dem Code darueber zu, das Kategorieband bliebe stehen)
    For u = 1 To nEinh
        k = eKopf(u)
        If eZahl(u) > 1 And Len(zCode(k)) > 0 Then
            If s(k) Then
                For x = 3 To nRd
                    If zEinheit(x) = u And x <> k Then
                        If (Not s(x)) And (Not zLeer(x)) Then
                            If Not mitNur Then
                                Grund = ZeileName(k) & ": Kopfzeile der KPI – nur zusammen mit ihren Zeilen ohne Code löschbar (" & ZeileName(x) & ")"
                                Exit Function
                            ElseIf nur(k) Then
                                Grund = "Kopfzeile der KPI – nur mit der ganzen KPI löschbar"
                                Exit Function
                            End If
                        End If
                    End If
                Next x
            End If
        End If
    Next u
    For i = 1 To nRef
        q = refZ(i)
        If q >= 3 And q <= nRd Then
            If Not s(q) Then
                drin = 0: gleichesThema = False: erste = 0
                gesamt = refB(i) - refA(i) + 1
                For x = refA(i) To refB(i)
                    If x > nRd Then Exit For
                    If s(x) Then
                        If Not mitNur Then
                            drin = drin + 1
                            If erste = 0 Then erste = x
                            If zThema(x) = zThema(q) Then gleichesThema = True
                        ElseIf nur(x) Then
                            drin = drin + 1
                            If erste = 0 Then erste = x
                            If zThema(x) = zThema(q) Then gleichesThema = True
                        Else
                            drin = drin + 1
                        End If
                    End If
                Next x
                If erste > 0 Then
                    If (Not refBer(i)) Or drin >= gesamt Or gleichesThema Then
                        If mitNur Then
                            Grund = "Formel in " & ZeileName(q) & " verweist darauf"
                        Else
                            Grund = ZeileName(erste) & ": die Formel in " & ZeileName(q) & " verweist darauf – nur zusammen mit dieser Zeile löschbar"
                        End If
                        Exit Function
                    End If
                End If
            End If
        End If
    Next i
End Function

' Auswahl plus die Zeilen einer Einheit (u > 0) bzw. eine Zeile (r > 0); nur = eben diese Zeilen
Private Sub MitAuswahl(u As Long, r As Long, ByRef s() As Boolean, ByRef nur() As Boolean)
    Dim x As Long
    ReDim s(1 To nRd)
    ReDim nur(1 To nRd)
    For x = 3 To nRd
        s(x) = gew(x)
        If u > 0 Then
            If zEinheit(x) = u Then s(x) = True: nur(x) = True
        End If
    Next x
    If r > 0 Then s(r) = True: nur(r) = True
End Sub

Private Function GrundEinheit(u As Long) As String
    Dim s() As Boolean, nur() As Boolean
    MitAuswahl u, 0, s, nur
    GrundEinheit = Grund(s, nur)
End Function

Private Function GrundZeile(r As Long) As String
    Dim s() As Boolean, nur() As Boolean
    MitAuswahl 0, r, s, nur
    GrundZeile = Grund(s, nur)
End Function

' Groesste loeschbare Menge eines Themas (ganze KPIs): alle Einheiten ohne Sperre von aussen, dann so lange Einheiten
' herausnehmen, auf die eine verbleibende Formel verweist, bis sich nichts mehr aendert
Private Function ThemaMenge(t As Long) As Variant
    Dim s() As Boolean, nur() As Boolean, kand() As Boolean, u As Long, x As Long, geaendert As Boolean, g As String
    ReDim kand(1 To nEinh)
    For u = 1 To nEinh
        If eThema(u) = t Then kand(u) = True
    Next u
    For x = 3 To nRd
        If zThema(x) = t And Len(zExtern(x)) > 0 Then kand(zEinheit(x)) = False
    Next x
    Do
        geaendert = False
        ReDim s(1 To nRd)
        For x = 3 To nRd
            If zThema(x) = t Then
                s(x) = kand(zEinheit(x))
            Else
                s(x) = gew(x)
            End If
        Next x
        For u = 1 To nEinh
            If kand(u) Then
                ReDim nur(1 To nRd)
                For x = 3 To nRd
                    If zEinheit(x) = u Then nur(x) = True
                Next x
                g = Grund(s, nur)
                If Len(g) > 0 Then kand(u) = False: geaendert = True
            End If
        Next u
    Loop While geaendert
    ReDim s(1 To nRd)
    For x = 3 To nRd
        If zThema(x) = t Then s(x) = kand(zEinheit(x))
    Next x
    ThemaMenge = s
End Function

' ---------------------------------------------------------------- ohne Dialoge
' Darf die Zeile allein geloescht werden? "" oder Grund
Public Function KpiLoeschbar(rohZeile As Long) As String
    Dim s() As Boolean
    Analysieren
    If rohZeile < 3 Or rohZeile > nRd Then
        KpiLoeschbar = "Zeile " & rohZeile & " ist keine Datenzeile in Rohdaten (3 bis " & nRd & ")."
        Exit Function
    End If
    ReDim s(1 To nRd)
    s(rohZeile) = True
    KpiLoeschbar = Grund(s)
End Function

' Zeilen loeschen (Komma-Liste der Rohdaten-Zeilen, auch "3-10"); prueft die Menge und liefert das Ergebnis oder den Fehler
Public Function KpiLoeschenZeilen(zeilenText As String) As String
    Dim s() As Boolean, teile() As String, i As Long, a As Long, b As Long, r As Long, n As Long, g As String, p As Long
    Analysieren
    ReDim s(1 To nRd)
    teile = Split(Replace(zeilenText, ";", ","), ",")
    For i = 0 To UBound(teile)
        If Len(Trim$(teile(i))) > 0 Then
            p = InStr(teile(i), "-")
            If p > 0 Then
                a = CLng(Val(Left$(teile(i), p - 1))): b = CLng(Val(Mid$(teile(i), p + 1)))
            Else
                a = CLng(Val(teile(i))): b = a
            End If
            If a < 3 Or b > nRd Or b < a Then
                KpiLoeschenZeilen = "fehler;Zeile " & Trim$(teile(i)) & " liegt nicht zwischen 3 und " & nRd
                Exit Function
            End If
            For r = a To b
                If Not s(r) Then s(r) = True: n = n + 1
            Next r
        End If
    Next i
    If n = 0 Then
        KpiLoeschenZeilen = "fehler;keine Zeilen angegeben"
        Exit Function
    End If
    g = Grund(s)
    If Len(g) > 0 Then
        KpiLoeschenZeilen = "fehler;" & g
        Exit Function
    End If
    KpiLoeschenZeilen = Loeschen(s)
End Function

' Pruefen der Auswahl ohne Karte: "analyse" | "thema:N" | "kpi:N" | "zeile:N" (wie ein Klick) | "auswahl" | "grund" |
' "themen" (Nr. und Name je Thema) | "kpis:N" (KPIs des Themas N mit Sperrgrund) | "auf:N" (Thema auf-/zuklappen) |
' "seite:N". Liefert den Zustand als Text.
Public Function KpiLoeschenProbe(befehl As String) As String
    Dim teile() As String, id As Long, r As Long, t As String, u As Long
    teile = Split(befehl & ":", ":")
    id = CLng(Val(teile(1)))
    If Not bereit Or teile(0) = "analyse" Then Analysieren
    Select Case teile(0)
        Case "analyse"
            t = "zeilen=" & nRd & ";themen=" & nThemen & ";kpis=" & nEinh & ";bezuege=" & nRef
        Case "themen"
            For u = 1 To nThemen
                t = t & IIf(Len(t) > 0, " | ", "") & u & ":" & tNr(u) & " " & tText(u) & " (" & tVon(u) & "-" & tBis(u) & ")"
            Next u
        Case "kpis"
            For u = 1 To nEinh
                If eThema(u) = id Then t = t & IIf(Len(t) > 0, " | ", "") & u & ":" & eText(u) & " [" & eZahl(u) & "] " & GrundEinheit(u)
            Next u
        Case "thema", "kpi", "zeile"
            Waehlen IIf(teile(0) = "thema", 1, IIf(teile(0) = "kpi", 2, 3)), id
            t = "gewaehlt=" & AnzahlGewaehlt() & IIf(Len(meldung) > 0, ";" & meldung, "")
            meldung = ""
        Case "auf"
            tOffen(id) = Not tOffen(id)
            t = "auf=" & tOffen(id)
        Case "seite"
            seite = id
            t = "seite=" & seite
        Case "auswahl"
            For r = 3 To nRd
                If gew(r) Then t = t & IIf(Len(t) > 0, ",", "") & r
            Next r
        Case "grund"
            t = Grund(gew)
    End Select
    KpiLoeschenProbe = t
End Function

' ---------------------------------------------------------------- Plan: Zustaendigkeiten und Uebersicht
Private Function ZuArt(wz As Worksheet, r As Long) As String
    Dim t As String
    t = UCase$(Trim$(CStr(wz.Cells(r, modBasis.ZU_ART).Value)))
    If t = "T" Or t = "K" Or t = "W" Then ZuArt = t: Exit Function
    If modBasis.ZuWertzeile(r) Then                         ' aeltere Datei ohne Spalte AO: aus den verbundenen Zellen
        ZuArt = "W"
    ElseIf wz.Cells(r, 1).MergeCells Then
        If wz.Cells(r, 1).MergeArea.Columns.Count >= 7 Then ZuArt = "T"
    ElseIf wz.Cells(r, 3).MergeCells Then
        ZuArt = "K"
    End If
End Function

' Zeilen in Zustaendigkeiten, die mit den Rohdaten-Zeilen s wegfallen: ihre Wertzeilen und leer gewordene Baender
Private Function ZuPlan(s() As Boolean, ByRef nBand As Long) As Variant
    Dim wz As Worksheet, letzte As Long, r As Long, weg() As Boolean, art() As String, v As Variant, k As Long, bleibt As Boolean, hatW As Boolean
    Set wz = ThisWorkbook.Worksheets(BLATT_ZU)
    letzte = modBasis.ZuLetzteZeile()
    ReDim weg(1 To letzte + 1)
    ReDim art(1 To letzte + 1)
    nBand = 0
    For r = modBasis.ZU_START To letzte
        art(r) = ZuArt(wz, r)
        If art(r) = "W" Then
            v = wz.Cells(r, 1).Value
            If Not IsError(v) Then
                If IsNumeric(v) And Not IsEmpty(v) Then
                    If CLng(v) >= 3 And CLng(v) <= nRd Then weg(r) = s(CLng(v))
                End If
            End If
        End If
    Next r
    For r = modBasis.ZU_START To letzte
        If art(r) = "T" Or art(r) = "K" Then
            bleibt = False: hatW = False
            For k = r + 1 To letzte
                If art(k) = "T" Then Exit For
                If art(r) = "K" And art(k) = "K" Then Exit For
                If art(k) = "W" Then
                    hatW = True
                    If Not weg(k) Then bleibt = True: Exit For
                End If
            Next k
            If hatW And Not bleibt Then weg(r) = True: nBand = nBand + 1
        End If
    Next r
    ZuPlan = weg
End Function

' Zeilen der Uebersicht, deren Formeln auf eine der Rohdaten-Zeilen s verweisen
Private Function UePlan(s() As Boolean) As Variant
    Dim wu As Worksheet, letzte As Long, r As Long, c As Long, weg() As Boolean, f As String, von(1 To 50) As Long, bis(1 To 50) As Long
    Dim n As Long, i As Long, x As Long
    Set wu = ThisWorkbook.Worksheets(BLATT_UE)
    letzte = wu.UsedRange.Row + wu.UsedRange.Rows.Count - 1
    ReDim weg(1 To letzte + 1)
    For r = 5 To letzte
        For c = 1 To 10
            f = CStr(wu.Cells(r, c).Formula)
            If Left$(f, 1) = "=" And InStr(1, f, BLATT_RD, vbTextCompare) > 0 Then
                ZeilenAusFormel f, BLATT_RD, von, bis, n
                For i = 1 To n
                    For x = von(i) To bis(i)
                        If x >= 3 And x <= nRd Then
                            If s(x) Then weg(r) = True
                        End If
                    Next x
                Next i
            End If
        Next c
    Next r
    UePlan = weg
End Function

Private Function Zaehle(a As Variant) As Long
    Dim i As Long
    For i = LBound(a) To UBound(a)
        If a(i) Then Zaehle = Zaehle + 1
    Next i
End Function

' Zeilen eines Blatts loeschen, von unten nach oben in zusammenhaengenden Bloecken
Private Sub ZeilenWeg(ws As Worksheet, weg As Variant)
    Dim r As Long, e As Long
    r = UBound(weg)
    Do While r >= LBound(weg)
        If weg(r) Then
            e = r
            Do While r - 1 >= LBound(weg)
                If Not weg(r - 1) Then Exit Do
                r = r - 1
            Loop
            ws.Range(ws.Rows(r), ws.Rows(e)).EntireRow.Delete
        End If
        r = r - 1
    Loop
End Sub

' ---------------------------------------------------------------- Loeschen
Private Function Loeschen(s() As Boolean) As String
    Dim wr As Worksheet, wst As Worksheet, wz As Worksheet, wu As Worksheet, zuWeg As Variant, ueWeg As Variant, nBand As Long
    Dim r As Long, f As Long, e As Long, n As Long, nZu As Long, nUe As Long, nWs As Long, liste As String
    Dim mSp() As Long, mVon() As Long, mBis() As Long, mWert() As Variant, nM As Long, c As Long, i As Long
    Dim neu As Long, rest As Long, kopfAlt() As Long, kopfLvl() As Long, kopfAnz() As Long, nK As Long, lv As Long, lvN As Long, x As Long
    Dim calc As Long, calcGemerkt As Boolean, wegLang() As Boolean, erledigt As String, gesperrt As String
    Dim schutzRd As Variant, schutzWs As Variant, schutzUe As Variant, frRd As Long, frWs As Long, frUe As Long, frZu As Long
    On Error GoTo Fehler
    Set wr = ThisWorkbook.Worksheets(BLATT_RD)
    Set wz = ThisWorkbook.Worksheets(BLATT_ZU)
    Set wu = ThisWorkbook.Worksheets(BLATT_UE)
    On Error Resume Next
    Set wst = ThisWorkbook.Worksheets(BLATT_WS)
    On Error GoTo Fehler
    zuWeg = ZuPlan(s, nBand)
    ueWeg = UePlan(s)
    n = Zaehle(s): nZu = Zaehle(zuWeg): nUe = Zaehle(ueWeg)
    For r = 3 To nRd
        If s(r) Then liste = liste & IIf(Len(liste) > 0, ",", "") & r
    Next r
    ' 0. Vor dem ersten Loeschen: alle vier Blaetter beschreibbar? Schutz ohne Kennwort wird aufgehoben (Zustaendigkeiten setzt
    '    modZuordnung.Schuetzen danach wieder, die anderen bekommen ihre Optionen zurueck); mit Kennwort: Abbruch, nichts geloescht.
    frUe = Freigeben(wu, schutzUe)
    frZu = Freigeben(wz, Empty)
    frRd = Freigeben(wr, schutzRd)
    If Not wst Is Nothing Then frWs = Freigeben(wst, schutzWs)
    If frUe < 0 Then gesperrt = gesperrt & IIf(Len(gesperrt) > 0, ", ", "") & "„" & BLATT_UE & "“"
    If frZu < 0 Then gesperrt = gesperrt & IIf(Len(gesperrt) > 0, ", ", "") & "„" & BLATT_ZU & "“"
    If frRd < 0 Then gesperrt = gesperrt & IIf(Len(gesperrt) > 0, ", ", "") & "„" & BLATT_RD & "“"
    If frWs < 0 Then gesperrt = gesperrt & IIf(Len(gesperrt) > 0, ", ", "") & "„" & BLATT_WS & "“"
    If Len(gesperrt) > 0 Then
        SchutzZurueck wu, frUe, schutzUe
        SchutzZurueck wr, frRd, schutzRd
        If Not wst Is Nothing Then SchutzZurueck wst, frWs, schutzWs
        modZuordnung.Schuetzen
        bereit = False
        Loeschen = "fehler;Blatt " & gesperrt & " ist mit Kennwort geschützt – bitte erst den Blattschutz aufheben. Es wurde nichts gelöscht."
        Exit Function
    End If
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    calc = Application.Calculation
    calcGemerkt = True
    Application.Calculation = xlCalculationManual
    ' 1. Blaetter, die auf Rohdaten verweisen: Uebersicht, Zustaendigkeiten
    ZeilenWeg wu, ueWeg
    If nUe > 0 Then erledigt = "Übersicht"
    ZeilenWeg wz, zuWeg
    If nZu > 0 Then erledigt = erledigt & IIf(Len(erledigt) > 0, ", ", "") & "Zuständigkeiten"
    ' 2. Wertstand (gleicher Aufbau wie Rohdaten: dieselben Zeilen)
    ReDim wegLang(1 To nRd)
    For r = 3 To nRd
        wegLang(r) = s(r)
    Next r
    If Not wst Is Nothing Then
        ZeilenWeg wst, wegLang
        nWs = n
        erledigt = erledigt & IIf(Len(erledigt) > 0, ", ", "") & "Wertstand"
    End If
    ' 3. Rohdaten: verbundene Zellen in den Beschriftungsspalten trennen und merken
    ReDim mSp(1 To 200): ReDim mVon(1 To 200): ReDim mBis(1 To 200): ReDim mWert(1 To 200)
    For r = 3 To nRd
        If s(r) Then
            For c = 1 To 8
                If wr.Cells(r, c).MergeCells Then
                    If nM < 200 Then
                        nM = nM + 1
                        With wr.Cells(r, c).MergeArea
                            mSp(nM) = .Column: mVon(nM) = .Row: mBis(nM) = .Row + .Rows.Count - 1
                            mWert(nM) = .Cells(1, 1).Value
                            .UnMerge
                        End With
                    End If
                End If
            Next c
        End If
    Next r
    ' Kategorie (C, gilt bis zur naechsten) und Thema (B, gilt bis zum naechsten Eintrag): Text der geloeschten ersten Zeile in die
    ' erste verbleibende Zeile; beim Thema auch die Linie oben. Erst die Kategorie: ihr Block endet am naechsten Thema – stuende
    ' das Thema schon in der neuen ersten Zeile, waere der Block leer und die Kategorie ginge verloren.
    For r = 3 To nRd
        If s(r) And Len(Ist(wr, r, 3)) > 0 Then
            e = r
            Do While e + 1 <= nRd
                If Len(Ist(wr, e + 1, 3)) > 0 Or Len(Ist(wr, e + 1, 2)) > 0 Then Exit Do
                e = e + 1
            Loop
            f = ErsteBleibende(s, r + 1, e)
            If f > 0 Then
                If Len(Ist(wr, f, 3)) = 0 Then wr.Cells(f, 3).Value = wr.Cells(r, 3).Value
            End If
        End If
    Next r
    For r = 3 To nRd
        If s(r) And Len(Ist(wr, r, 2)) > 0 Then
            e = r
            Do While e + 1 <= nRd
                If Len(Ist(wr, e + 1, 2)) > 0 Then Exit Do
                e = e + 1
            Loop
            f = ErsteBleibende(s, r + 1, e)
            If f > 0 Then
                If Len(Ist(wr, f, 2)) = 0 Then wr.Cells(f, 2).Value = wr.Cells(r, 2).Value
                ThemenLinie wr, f
            End If
        End If
    Next r
    ' Gliederung: faellt die Kopfzeile einer Gruppe weg (eingeklappte Bloecke nicht berichteter Zeilen), wird die erste
    ' verbleibende Zeile der Gruppe der neue Kopf – sonst haengt die Gruppe an der Zeile darueber. Excel: ueber die Gliederungs-
    ' ebene (OutlineLevel); wo es die nicht gibt (LibreOffice): ausgeblendete Zeilen direkt hinter einer geloeschten sichtbaren
    ' werden eingeblendet (Gruppe aufgeklappt), damit nichts ohne Plus verborgen bleibt.
    ReDim kopfAlt(1 To nRd): ReDim kopfLvl(1 To nRd): ReDim kopfAnz(1 To nRd)
    r = 3
    Do While r <= nRd
        If s(r) Then
            e = r
            Do While e + 1 <= nRd
                If Not s(e + 1) Then Exit Do
                e = e + 1
            Loop
            f = e + 1
            If f <= nRd Then
                lvN = 0
                On Error Resume Next
                lvN = wr.Rows(f).OutlineLevel
                On Error GoTo Fehler
                lv = 0
                For x = r To e
                    If lvN > 0 Then
                        If wr.Rows(x).OutlineLevel < lvN Then lv = wr.Rows(x).OutlineLevel
                    ElseIf wr.Rows(f).Hidden And Not wr.Rows(x).Hidden Then
                        lv = -1
                    End If
                Next x
                If lv <> 0 Then
                    nK = nK + 1: kopfAlt(nK) = f: kopfLvl(nK) = lv: kopfAnz(nK) = 1
                    If lv < 0 Then                           ' ohne Gliederungsebene: alle ausgeblendeten Zeilen dahinter
                        kopfAnz(nK) = 0
                        x = f
                        Do While x <= nRd
                            If Not s(x) Then
                                If Not wr.Rows(x).Hidden Then Exit Do
                                kopfAnz(nK) = kopfAnz(nK) + 1
                            End If
                            x = x + 1
                        Loop
                    End If
                End If
            End If
            r = e + 1
        Else
            r = r + 1
        End If
    Loop
    ' loeschen
    ZeilenWeg wr, wegLang
    erledigt = erledigt & IIf(Len(erledigt) > 0, ", ", "") & "Rohdaten"
    ' verbundene Zellen ueber die verbliebenen Zeilen neu verbinden, Text in die neue erste Zeile
    For i = 1 To nM
        rest = 0: f = 0
        For x = mVon(i) To mBis(i)
            If Not s(x) Then
                rest = rest + 1
                If f = 0 Then f = x
            End If
        Next x
        If rest > 0 Then
            neu = f - VorherWeg(s, f)
            If Len(Trim$(CStr(wr.Cells(neu, mSp(i)).Value))) = 0 And Not IsEmpty(mWert(i)) Then wr.Cells(neu, mSp(i)).Value = mWert(i)
            If rest > 1 Then wr.Range(wr.Cells(neu, mSp(i)), wr.Cells(neu + rest - 1, mSp(i))).Merge
        End If
    Next i
    On Error Resume Next
    For i = 1 To nK
        neu = kopfAlt(i) - VorherWeg(s, kopfAlt(i))
        If kopfLvl(i) > 0 Then
            wr.Rows(neu).OutlineLevel = kopfLvl(i)
            wr.Rows(neu).Hidden = False
        ElseIf kopfAnz(i) > 0 Then
            wr.Range(wr.Rows(neu), wr.Rows(neu + kopfAnz(i) - 1)).EntireRow.Hidden = False
        End If
    Next i
    On Error GoTo Fehler
    ' 4. Pruefen: Wertstand zeigt Zeile fuer Zeile auf dieselbe Rohdaten-Zeile (sonst stimmt der „Stand“ der Kacheln nicht)
    If Not wst Is Nothing Then
        x = WertstandVersatz(wst, nRd - n)
        If x > 0 Then Err.Raise vbObjectError + 513, , "Wertstand und Rohdaten sind nicht mehr zeilengleich (ab Zeile " & x & ")"
    End If
    SchutzZurueck wu, frUe, schutzUe
    SchutzZurueck wr, frRd, schutzRd
    If Not wst Is Nothing Then SchutzZurueck wst, frWs, schutzWs
    Application.Calculation = calc
    Application.Calculate
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    modZuordnung.Schuetzen
    bereit = False
    Loeschen = "ok;rohdaten=" & n & ";wertstand=" & nWs & ";zustaendigkeiten=" & nZu & ";baender=" & nBand & ";uebersicht=" & nUe & ";zeilen=" & liste
    Exit Function
Fehler:
    If Len(erledigt) > 0 Then
        Loeschen = "teilweise;" & Err.Description & " – schon gelöscht: " & erledigt & ". Datei ohne Speichern schließen und neu öffnen."
    Else
        Loeschen = "fehler;" & Err.Description & " – es wurde nichts gelöscht."
    End If
    On Error Resume Next
    If calcGemerkt Then Application.Calculation = calc
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    If Len(erledigt) = 0 Then
        SchutzZurueck wu, frUe, schutzUe
        SchutzZurueck wr, frRd, schutzRd
        If Not wst Is Nothing Then SchutzZurueck wst, frWs, schutzWs
    End If
    modZuordnung.Schuetzen
    bereit = False
End Function

' Blatt vor dem Loeschen beschreibbar machen: 0 = ungeschuetzt, 1 = Schutz ohne Kennwort aufgehoben (Optionen in schutz, danach
' mit SchutzZurueck genauso wieder setzen), -1 = mit Kennwort geschuetzt (nicht beschreibbar)
Private Function Freigeben(ws As Worksheet, ByRef schutz As Variant) As Long
    Dim p As Boolean
    On Error Resume Next
    p = ws.ProtectContents
    If Err.Number <> 0 Then p = False
    Err.Clear
    If Not p Then Exit Function
    schutz = Empty
    With ws.Protection
        schutz = Array(ws.ProtectDrawingObjects, ws.ProtectScenarios, .AllowFormattingCells, .AllowFormattingColumns, .AllowFormattingRows, _
                       .AllowInsertingColumns, .AllowInsertingRows, .AllowInsertingHyperlinks, .AllowDeletingColumns, .AllowDeletingRows, _
                       .AllowSorting, .AllowFiltering, .AllowUsingPivotTables, ws.EnableSelection, ws.EnableOutlining)
    End With
    Err.Clear
    ws.Unprotect ""
    Err.Clear
    p = ws.ProtectContents
    On Error GoTo 0
    If p Then Freigeben = -1 Else Freigeben = 1
End Function

Private Sub SchutzZurueck(ws As Worksheet, art As Long, schutz As Variant)
    If art <> 1 Then Exit Sub
    On Error Resume Next
    If IsArray(schutz) Then
        ws.Protect Password:="", DrawingObjects:=schutz(0), Contents:=True, Scenarios:=schutz(1), AllowFormattingCells:=schutz(2), _
            AllowFormattingColumns:=schutz(3), AllowFormattingRows:=schutz(4), AllowInsertingColumns:=schutz(5), AllowInsertingRows:=schutz(6), _
            AllowInsertingHyperlinks:=schutz(7), AllowDeletingColumns:=schutz(8), AllowDeletingRows:=schutz(9), AllowSorting:=schutz(10), _
            AllowFiltering:=schutz(11), AllowUsingPivotTables:=schutz(12)
        ws.EnableSelection = schutz(13)
        ws.EnableOutlining = schutz(14)
    Else
        ws.Protect Password:=""
    End If
    On Error GoTo 0
End Sub

' Erste Zeile (ab 3), in der Wertstand Spalte A nicht auf dieselbe Rohdaten-Zeile verweist; 0 = alles zeilengleich. Zeilen ohne
' lesbaren Bezug (anderes Formelformat) werden uebergangen.
Private Function WertstandVersatz(wst As Worksheet, bis As Long) As Long
    Dim r As Long, f As String, von(1 To 50) As Long, bis2(1 To 50) As Long, n As Long
    On Error Resume Next
    For r = 3 To bis
        f = ""
        f = CStr(wst.Cells(r, 1).Formula)
        If Left$(f, 1) = "=" Then
            ZeilenAusFormel f, BLATT_RD, von, bis2, n
            If n > 0 Then
                If von(1) <> r Then
                    WertstandVersatz = r
                    Exit Function
                End If
            End If
        End If
    Next r
End Function

Private Function ErsteBleibende(s() As Boolean, von As Long, bis As Long) As Long
    Dim r As Long
    For r = von To bis
        If r > nRd Then Exit Function
        If Not s(r) Then ErsteBleibende = r: Exit Function
    Next r
End Function

Private Function VorherWeg(s() As Boolean, r As Long) As Long
    Dim x As Long
    For x = 3 To r - 1
        If s(x) Then VorherWeg = VorherWeg + 1
    Next x
End Function

Private Sub ThemenLinie(wr As Worksheet, r As Long)
    On Error Resume Next
    With wr.Range(wr.Cells(r, 1), wr.Cells(r, modBasis.RD_LETZTE_SPALTE)).Borders(xlEdgeTop)
        .LineStyle = xlContinuous
        .Weight = xlMedium
        .Color = RGB(154, 163, 173)
    End With
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Karte: Auswahl
Public Sub Zeigen()
    On Error GoTo Fehler
    modKarte.KartenEntfernen
    Analysieren
    seite = 1
    meldung = ""
    ListeZeigen
    Exit Sub
Fehler:
    modKarte.Hinweis "KPI löschen", "Die Kennzahlen konnten nicht gelesen werden: " & Err.Description, True
End Sub

Private Sub ItemNeu(art As Long, id As Long)
    nItem = nItem + 1
    If nItem > UBound(itArt) Then
        ReDim Preserve itArt(1 To nItem + 100)
        ReDim Preserve itId(1 To nItem + 100)
    End If
    itArt(nItem) = art: itId(nItem) = id
End Sub

' Eintraege der Liste: Themen; bei aufgeklappten Themen ihre KPIs und darunter deren Zeilen (ohne leere Zeilen)
Private Sub ItemsBauen()
    Dim t As Long, u As Long, r As Long
    nItem = 0
    ReDim itArt(1 To 200): ReDim itId(1 To 200)
    For t = 1 To nThemen
        ItemNeu 1, t
        If tOffen(t) Then
            For u = 1 To nEinh
                If eThema(u) = t Then
                    ItemNeu 2, u
                    If eZahl(u) > 1 Then
                        For r = tVon(t) To tBis(t)
                            If zEinheit(r) = u And Not zLeer(r) Then ItemNeu 3, r
                        Next r
                    End If
                End If
            Next u
        End If
    Next t
End Sub

Private Function Kurz(t As String, n As Long) As String
    If Len(t) > n Then
        Kurz = Left$(t, n - 1) & ChrW(8230)
    Else
        Kurz = t
    End If
End Function

Private Function AnzahlGewaehlt() As Long
    Dim r As Long
    For r = 3 To nRd
        If gew(r) Then AnzahlGewaehlt = AnzahlGewaehlt + 1
    Next r
End Function

' Zustand eines Eintrags: 0 nicht gewaehlt, 1 teilweise, 2 ganz
Private Function Zustand(art As Long, id As Long, Optional ByRef menge As Long) As Long
    Dim r As Long, n As Long, g As Long, s As Variant
    If art = 1 Then
        s = ThemaMenge(id)
        For r = tVon(id) To tBis(id)
            If s(r) Then
                n = n + 1
                If gew(r) Then g = g + 1
            ElseIf gew(r) Then
                g = g + 1: n = n + 1
            End If
        Next r
    ElseIf art = 2 Then
        For r = 3 To nRd
            If zEinheit(r) = id Then
                n = n + 1
                If gew(r) Then g = g + 1
            End If
        Next r
    Else
        n = 1
        If gew(id) Then g = 1
    End If
    menge = n
    If g = 0 Then
        Zustand = 0
    ElseIf g >= n Then
        Zustand = 2
    Else
        Zustand = 1
    End If
End Function

Public Sub ListeZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, seiten As Long, i As Long, k As Long, y As Single
    Dim n As Long, g As Long
    On Error GoTo Fehler
    If Not bereit Then Analysieren
    modKarte.KartenEntfernen
    Set ws = ActiveSheet
    ItemsBauen
    seiten = (nItem + JE_SEITE - 1) \ JE_SEITE
    If seiten < 1 Then seiten = 1
    If seite > seiten Then seite = seiten
    If seite < 1 Then seite = 1
    kb = 760
    kh = 126 + JE_SEITE * 24 + 92
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "KPI LÖSCHEN  ·  ROHDATEN, WERTSTAND, ZUSTÄNDIGKEITEN, ÜBERSICHT", 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 38, kb - 56, 26, "Welche Kennzahlen sollen weg?", 16, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 68, kb - 56, 30, _
        "Thema anklicken wählt das ganze Cluster, " & ChrW(9656) & " klappt es auf: darunter die KPIs und ihre Zeilen zum Einzelwählen. " & _
        "Grau = gesperrt, der Grund steht rechts.", 9, False, modKarte.C_GRAU, True
    For i = 1 To JE_SEITE
        seiteArt(i) = 0: seiteId(i) = 0
    Next i
    y = ky + 104
    For i = 1 To JE_SEITE
        k = (seite - 1) * JE_SEITE + i
        If k > nItem Then Exit For
        seiteArt(i) = itArt(k): seiteId(i) = itId(k)
        ZeileZeichnen ws, i, kx + 24, y + (i - 1) * 24, kb - 48, itArt(k), itId(k)
    Next i
    g = AnzahlGewaehlt()
    If Len(meldung) > 0 Then
        modKarte.Beschriftung ws, "Meldung", kx + 28, ky + kh - 84, kb - 56, 28, meldung, 8.5, True, modKarte.C_ROT, True
    Else
        modKarte.Beschriftung ws, "Auswahl", kx + 28, ky + kh - 78, kb - 56, 16, IIf(g = 0, "Noch nichts ausgewählt.", _
            "Ausgewählt: " & g & IIf(g = 1, " Zeile", " Zeilen") & " in Rohdaten"), 9.5, True, IIf(g = 0, modKarte.C_GRAU, modKarte.C_SW)
    End If
    If seiten > 1 Then
        modKarte.Beschriftung ws, "Seite", kx + kb / 2 - 50, ky + kh - 40, 100, 14, "Seite " & seite & " von " & seiten, 9, False, modKarte.C_GRAU
        If seite > 1 Then modKarte.Knopf ws, "SZurueck", kx + kb / 2 - 50 - 46, ky + kh - 48, 40, 30, ChrW(8249), 2, "modKpiLoeschen.KlickSeiteZurueck"
        If seite < seiten Then modKarte.Knopf ws, "SVor", kx + kb / 2 + 56, ky + kh - 48, 40, 30, ChrW(8250), 2, "modKpiLoeschen.KlickSeiteVor"
    End If
    If g > 0 Then
        modKarte.Knopf ws, "Weiter", kx + kb - 28 - 190, ky + kh - 48, 190, 30, "Auswahl löschen …", 4, "modKpiLoeschen.KlickWeiter"
    Else
        modKarte.Knopf ws, "Weiter", kx + kb - 28 - 190, ky + kh - 48, 190, 30, "Auswahl löschen …", 3, "modKarte.Nichts"
    End If
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 48, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
    meldung = ""
    Exit Sub
Fehler:
    modKarte.Hinweis "KPI löschen", "Fehler beim Zeichnen der Liste: " & Err.Description, True
End Sub

' Eine Zeile der Liste: Kaestchen (gewaehlt/teilweise/frei/gesperrt), bei Themen der Pfeil, Text, rechts Umfang oder Grund
Private Sub ZeileZeichnen(ws As Worksheet, i As Long, x As Single, y As Single, b As Single, art As Long, id As Long)
    Dim einzug As Single, txt As String, rechts As String, grundT As String, z As Long, menge As Long, nm As String, aktion As String
    Dim s As Variant, r As Long, nDel As Long, nKpi As Long, u As Long, groesse As Single, fett As Boolean, farbe As Long, textX As Single
    If art = 1 Then
        einzug = 0
        txt = IIf(Len(tNr(id)) > 0, tNr(id) & "   ", "") & tText(id)
        s = ThemaMenge(id)
        For r = tVon(id) To tBis(id)
            If s(r) Then nDel = nDel + 1
        Next r
        For u = 1 To nEinh
            If eThema(u) = id And s(eKopf(u)) Then nKpi = nKpi + 1
        Next u
        If nDel = 0 Then
            grundT = "gesperrt"
            For r = tVon(id) To tBis(id)
                If Len(zExtern(r)) > 0 Then grundT = "gesperrt: " & zExtern(r): Exit For
            Next r
        Else
            rechts = nKpi & IIf(nKpi = 1, " KPI", " KPIs") & " · " & nDel & IIf(nDel = 1, " Zeile", " Zeilen") & " löschbar"
        End If
        groesse = 10: fett = True: farbe = modKarte.C_SW
    ElseIf art = 2 Then
        einzug = 26
        txt = eText(id)
        grundT = GrundEinheit(id)
        If Len(grundT) = 0 Then rechts = eZahl(id) & IIf(eZahl(id) = 1, " Zeile", " Zeilen")
        groesse = 9.5: fett = True: farbe = modKarte.C_SW
    Else
        einzug = 52
        txt = zKat(id) & IIf(Len(zAbt(id)) > 0, " · " & zAbt(id), "")
        If Len(Trim$(txt)) = 0 Then txt = ZeileName(id)
        grundT = GrundZeile(id)
        If Len(grundT) = 0 Then rechts = "Zeile " & id
        groesse = 9: fett = False: farbe = modKarte.C_SW
    End If
    z = Zustand(art, id, menge)
    If Len(grundT) > 0 Then farbe = modKarte.C_GRAU
    aktion = IIf(Len(grundT) > 0 And art <> 1, "modKarte.Nichts", "modKpiLoeschen.KlickWahl")
    ' Kaestchen, Texte und Trennlinie; darueber eine durchsichtige Flaeche ueber die ganze Zeile (Klick = waehlen, wie in der
    ' Kennzahlen-Sicht des Assistenten); bei Themen ganz oben der Pfeil zum Aufklappen
    Kaestchen ws, i, x + einzug + 4, y + 6, z, (Len(grundT) > 0)
    If art = 1 Then textX = x + einzug + 44 Else textX = x + einzug + 24
    modKarte.Beschriftung ws, "T_" & Format(i, "00"), textX, y + 4, x + b - 250 - textX, 16, Kurz(txt, IIf(art = 1, 62, 70)), groesse, fett, farbe
    If Len(grundT) > 0 Then
        modKarte.Beschriftung ws, "G_" & Format(i, "00"), x + b - 250, y + 4, 246, 16, Kurz(grundT, 52), 8, False, modKarte.C_GRAU
        ws.Shapes(modKarte.PRAEFIX & "G_" & Format(i, "00")).TextFrame2.TextRange.Font.Italic = msoTrue
    Else
        modKarte.Beschriftung ws, "G_" & Format(i, "00"), x + b - 250, y + 4, 246, 16, rechts, 8.5, False, modKarte.C_GRAU
    End If
    ws.Shapes(modKarte.PRAEFIX & "G_" & Format(i, "00")).TextFrame2.TextRange.ParagraphFormat.Alignment = msoAlignRight
    nm = modKarte.PRAEFIX & "L_" & Format(i, "00")
    With ws.Shapes.AddShape(1, x, y + 23.5, b, 0.5)
        .Name = nm
        modKarte.Fuellen ws.Shapes(nm), IIf(art = 1, modKarte.C_GRAUL, modKarte.C_GRAUXL)
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
    End With
    nm = modKarte.PRAEFIX & "W_" & Format(i, "00")
    With ws.Shapes.AddShape(1, x, y + 1, b, 22)
        .Name = nm
        modKarte.Fuellen ws.Shapes(nm), RGB(255, 255, 255), 1
        .Line.Visible = msoFalse
        .OnAction = aktion
    End With
    If art = 1 Then
        nm = modKarte.PRAEFIX & "A_" & Format(i, "00")
        With ws.Shapes.AddShape(1, x + einzug + 20, y + 2, 20, 20)
            .Name = nm
            modKarte.Fuellen ws.Shapes(nm), RGB(255, 255, 255), 1
            .Line.Visible = msoFalse
            .OnAction = "modKpiLoeschen.KlickAuf"
            With .TextFrame2
                .MarginLeft = 0: .MarginRight = 0: .MarginTop = 0: .MarginBottom = 0
                .VerticalAnchor = msoAnchorMiddle
                .TextRange.Text = IIf(tOffen(id), ChrW(9662), ChrW(9656))
                .TextRange.Font.Name = "Liberation Sans"
                .TextRange.Font.Size = 11
                .TextRange.Font.Fill.ForeColor.RGB = modKarte.C_TEAL
                .TextRange.ParagraphFormat.Alignment = msoAlignCenter
            End With
        End With
    End If
End Sub

Private Sub Kaestchen(ws As Worksheet, i As Long, x As Single, y As Single, zustandW As Long, gesperrt As Boolean)
    Dim nm As String
    nm = modKarte.PRAEFIX & "B_" & Format(i, "00")
    With ws.Shapes.AddShape(5, x, y, 12, 12)
        .Name = nm
        .Adjustments(1) = 0.2
        If zustandW = 2 Then
            modKarte.Fuellen ws.Shapes(nm), modKarte.C_TEAL
            .Line.Visible = msoFalse
        ElseIf zustandW = 1 Then
            modKarte.Fuellen ws.Shapes(nm), RGB(158, 205, 211)
            modKarte.Rand ws.Shapes(nm), modKarte.C_TEAL, 1
        ElseIf gesperrt Then
            modKarte.Fuellen ws.Shapes(nm), modKarte.C_GRAUXL
            modKarte.Rand ws.Shapes(nm), modKarte.C_GRAUL, 0.75
        Else
            modKarte.Fuellen ws.Shapes(nm), RGB(255, 255, 255)
            modKarte.Rand ws.Shapes(nm), modKarte.C_GRAU, 1
        End If
        .OnAction = "modKarte.Nichts"
    End With
End Sub

Public Sub KlickAuf()
    Dim i As Long
    i = modKarte.KlickNummer()
    If i < 1 Or i > JE_SEITE Then Exit Sub
    If seiteArt(i) <> 1 Then Exit Sub
    tOffen(seiteId(i)) = Not tOffen(seiteId(i))
    modKarte.Planen "modKpiLoeschen.ListeZeigen"
End Sub

Public Sub KlickWahl()
    Dim i As Long
    i = modKarte.KlickNummer()
    If i < 1 Or i > JE_SEITE Then Exit Sub
    If seiteArt(i) = 0 Then Exit Sub
    Waehlen seiteArt(i), seiteId(i)
    modKarte.Planen "modKpiLoeschen.ListeZeigen"
End Sub

' Klick auf einen Eintrag: Thema = ganzes Cluster an/aus (groesste loeschbare Menge), KPI = alle ihre Zeilen, Zeile = einzeln;
' gesperrte KPIs/Zeilen (im Zusammenhang mit der Auswahl) bleiben aus
Private Sub Waehlen(art As Long, id As Long)
    Dim r As Long, s As Variant, z As Long
    z = Zustand(art, id)
    If art = 1 Then                                      ' Thema: ganzes Cluster an oder aus
        If z = 2 Then
            For r = tVon(id) To tBis(id)
                gew(r) = False
            Next r
        Else
            s = ThemaMenge(id)
            For r = tVon(id) To tBis(id)
                gew(r) = s(r)
            Next r
            If Zaehle(s) = 0 Then meldung = "In diesem Thema lässt sich nichts löschen – Gründe nach dem Aufklappen rechts."
        End If
    ElseIf art = 2 Then
        If z = 2 Then
            For r = 3 To nRd
                If zEinheit(r) = id Then gew(r) = False
            Next r
        ElseIf Len(GrundEinheit(id)) = 0 Then
            For r = 3 To nRd
                If zEinheit(r) = id Then gew(r) = True
            Next r
        End If
    Else
        If gew(id) Then
            gew(id) = False
        ElseIf Len(GrundZeile(id)) = 0 Then
            gew(id) = True
        End If
    End If
End Sub

Public Sub KlickSeiteVor()
    seite = seite + 1
    modKarte.Planen "modKpiLoeschen.ListeZeigen"
End Sub

Public Sub KlickSeiteZurueck()
    If seite > 1 Then seite = seite - 1
    modKarte.Planen "modKpiLoeschen.ListeZeigen"
End Sub

Public Sub KlickWeiter()
    Dim g As String
    If AnzahlGewaehlt() = 0 Then Exit Sub
    g = Grund(gew)
    If Len(g) > 0 Then
        meldung = "So nicht löschbar – " & g & "."
        modKarte.Planen "modKpiLoeschen.ListeZeigen"
        Exit Sub
    End If
    modKarte.Planen "modKpiLoeschen.Bestaetigen"
End Sub

Public Sub KlickZurueck()
    modKarte.Planen "modKpiLoeschen.ListeZeigen"
End Sub

' ---------------------------------------------------------------- Karte: Bestaetigen
Public Sub Bestaetigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, n As Long, u As Long, r As Long, ganz As Boolean
    Dim zeilenT As String, k As Long, mehr As Long, zuWeg As Variant, ueWeg As Variant, nBand As Long, nZu As Long, nUe As Long
    Dim betroffen As String
    On Error GoTo Fehler
    modKarte.KartenEntfernen
    Set ws = ActiveSheet
    n = AnzahlGewaehlt()
    ' Beschriftungen: ganze KPIs, sonst einzelne Zeilen
    For u = 1 To nEinh
        ganz = True: k = 0
        For r = 3 To nRd
            If zEinheit(r) = u Then
                If gew(r) Then k = k + 1 Else ganz = False
            End If
        Next r
        If k > 0 Then
            If ganz Then
                ZeileDazu zeilenT, mehr, tText(eThema(u)) & ": " & eText(u) & "  (" & k & IIf(k = 1, " Zeile)", " Zeilen)")
            Else
                For r = 3 To nRd
                    If zEinheit(r) = u And gew(r) Then ZeileDazu zeilenT, mehr, tText(eThema(u)) & ": " & eText(u) & " · Zeile " & r & _
                        IIf(Len(zAbt(r)) > 0, " (" & zAbt(r) & ")", "")
                Next r
            End If
        End If
    Next u
    If mehr > 0 Then zeilenT = zeilenT & vbCr & ChrW(8230) & " und " & mehr & " weitere"
    zuWeg = ZuPlan(gew, nBand)
    ueWeg = UePlan(gew)
    nZu = Zaehle(zuWeg): nUe = Zaehle(ueWeg)
    betroffen = "Rohdaten " & n & IIf(n = 1, " Zeile", " Zeilen") & "  ·  Wertstand " & n & IIf(n = 1, " Zeile", " Zeilen") & _
        "  ·  Zuständigkeiten " & nZu & IIf(nZu = 1, " Zeile", " Zeilen") & IIf(nBand > 0, " (davon " & nBand & IIf(nBand = 1, " Band)", " Bänder)"), "") & _
        "  ·  Übersicht " & nUe & IIf(nUe = 1, " Eintrag", " Einträge")
    kb = 640
    kh = 250 + (Len(zeilenT) - Len(Replace(zeilenT, vbCr, "")) + 1) * 15
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "KPI LÖSCHEN  ·  BESTÄTIGEN", 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 38, kb - 56, 26, n & IIf(n = 1, " Zeile", " Zeilen") & " endgültig löschen?", 16, True, modKarte.C_ROT
    modKarte.Beschriftung ws, "Was", kx + 28, ky + 70, kb - 56, (kh - 250) + 4, zeilenT, 9, False, modKarte.C_SW, True
    modKarte.Beschriftung ws, "Wo", kx + 28, ky + kh - 170, kb - 56, 30, "Betroffen: " & betroffen, 9, False, modKarte.C_GRAU, True
    modKarte.Pille ws, "Warnung", kx + 28, ky + kh - 132, kb - 56, 66, _
        "Nicht rückgängig zu machen – vorher speichern. Die Zeilen verschwinden aus Rohdaten samt allen Werten und Formeln, " & _
        "dazu ihre Einträge in Zuständigkeiten und Übersicht. Kacheln und BÜ-Zeilen sind gesperrt und bleiben unverändert.", _
        modKarte.C_ROT_HELL, modKarte.C_ROT
    modKarte.Knopf ws, "Loeschen", kx + kb - 28 - 170, ky + kh - 48, 170, 30, "Endgültig löschen", 4, "modKpiLoeschen.KlickLoeschen"
    modKarte.Knopf ws, "Zurueck", kx + kb - 28 - 170 - 12 - 100, ky + kh - 48, 100, 30, "Zurück", 2, "modKpiLoeschen.KlickZurueck"
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 48, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
    Exit Sub
Fehler:
    modKarte.Hinweis "KPI löschen", "Fehler: " & Err.Description, True
End Sub

Private Sub ZeileDazu(ByRef t As String, ByRef mehr As Long, neu As String)
    If Len(t) - Len(Replace(t, vbCr, "")) >= 7 And Len(t) > 0 Then
        mehr = mehr + 1
    Else
        t = t & IIf(Len(t) > 0, vbCr, "") & Kurz(neu, 96)
    End If
End Sub

Public Sub KlickLoeschen()
    modKarte.Planen "modKpiLoeschen.Ausfuehren"
End Sub

Public Sub Ausfuehren()
    Dim liste As String, r As Long, res As String, teile() As String, i As Long, w As String, nZu As String, nUe As String, nRo As String
    modKarte.KartenEntfernen
    If Not bereit Then                                   ' Modulvariablen zurueckgesetzt (Laufzeitfehler, VBA bearbeitet)
        modKarte.Hinweis "KPI löschen", "Die Auswahl ist verloren gegangen. Bitte „KPI löschen“ neu öffnen und die Kennzahlen " & _
            "noch einmal wählen. Es wurde nichts gelöscht.", True
        Exit Sub
    End If
    For r = 3 To nRd
        If gew(r) Then liste = liste & IIf(Len(liste) > 0, ",", "") & r
    Next r
    If Len(liste) = 0 Then Exit Sub
    res = KpiLoeschenZeilen(liste)
    If Left$(res, 2) = "ok" Then
        teile = Split(res, ";")
        For i = 1 To UBound(teile)
            w = Mid$(teile(i), InStr(teile(i), "=") + 1)
            Select Case Left$(teile(i), InStr(teile(i), "=") - 1)
                Case "rohdaten": nRo = w
                Case "zustaendigkeiten": nZu = w
                Case "uebersicht": nUe = w
            End Select
        Next i
        modKarte.Hinweis "KPI gelöscht", nRo & " Zeilen in Rohdaten und Wertstand gelöscht, " & nZu & " Zeilen in Zuständigkeiten, " & _
            nUe & " Einträge in der Übersicht. Kacheln, Startseite und Assistent rechnen mit dem neuen Stand. Speichern nicht vergessen.", False
    ElseIf Left$(res, 9) = "teilweise" Then
        modKarte.Hinweis "KPI löschen – teilweise gelöscht", "Abgebrochen: " & Mid$(res, 11) & _
            " Sonst stimmen Rohdaten, Wertstand und Zuständigkeiten nicht mehr überein.", True
    Else
        modKarte.Hinweis "KPI löschen", "Nicht gelöscht: " & Mid$(res, 8), True
    End If
End Sub
