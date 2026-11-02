Option Explicit
' ============================================================================
' modZuordnung – Blatt Zuständigkeiten als Cockpit: wer liefert welchen Wert?
'
' Kennzahlen nach Thema (Band, einklappbar) und Kategorie gegliedert; Wertzeilen tragen in Spalte A die Zeile in Rohdaten,
' Bandzeilen nicht. Eine Spalte je Person (I bis AL = Konfiguration B28:B57, Name im Kopf).
' Das Blatt ist gesperrt. „Zuständigkeiten bearbeiten“ (ZuordnungOffen = 1) schaltet frei: Klick in ein Personenfeld setzt oder
' entfernt den Punkt, Klick in Spalte F schaltet Pflicht ja/nein („automatisch“ = BÜ und MAK, bleibt so), Klick in Spalte G
' den Reportingzyklus (wöchentlich, monatlich, quartalsweise; Spalte H rechnet daraus offen/erledigt); „Person hinzufügen“ /
' „Person entfernen“ erscheinen.
' „Fertig · sperren“ sperrt wieder. Spalte E (Personen) entsteht per Formel aus den Punkten; Assistent und Statusliste lesen E und F.
' Personen stehen alphabetisch; Hinzufuegen und Entfernen sortieren Namen und Punktspalten gemeinsam neu.
' Pflicht = auf PPT_2 oder PPT_3 berichtet (der Build setzt ja/nein/automatisch, Status „nicht berichtet“ grau); Themen ohne
' Pflichtwert sind beim Oeffnen eingeklappt. Ausgeblendete Zeilen stoeren hier nichts: Sortieren und Entfernen schreiben
' ueber alle Zeilen (auch eingeklappte), Klicks erreichen nur sichtbare Zellen. „KPI löschen“ (immer sichtbar): modKpiLoeschen.
' ============================================================================

Private Const Z_START As Long = 5
Private Const P_ERSTE As Long = 9                 ' Spalte I
Private Const P_LETZTE As Long = 38               ' Spalte AL
Private Const K_ERSTE As Long = 28                ' Konfiguration!B28:B57
Private Const N_P As Long = 30
Private Const BLATT As String = "Zuständigkeiten"

Private wegName As String                         ' Person, die entfernt werden soll (zwischen Auswahl und Bestaetigung)

Public Function ZuordnungVersion() As String
    ZuordnungVersion = "2"
End Function

Private Function Offen() As Boolean
    Offen = (Val(ThisWorkbook.Worksheets("Konfiguration").Range("C59").Value) = 1)
End Function

' Schutz mit UserInterfaceOnly: Makros duerfen schreiben, von Hand nichts; Gliederung bleibt bedienbar. Formen bleiben frei
' (DrawingObjects:=False), sonst liesse sich in die Eingabefelder der Karten nichts tippen.
Public Sub Schuetzen()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(BLATT)
    ws.Protect Password:="", DrawingObjects:=False, Contents:=True, UserInterfaceOnly:=True, AllowFormattingColumns:=True, AllowFormattingRows:=True
    ws.EnableOutlining = True
    ws.EnableSelection = xlNoRestrictions
    On Error GoTo 0
End Sub

' Knoepfe je Modus ein- und ausblenden
Public Sub ModusAnzeigen()
    Dim ws As Worksheet, an As Boolean
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(BLATT)
    an = Offen()
    ws.Shapes("BTN_Bearbeiten").Visible = Not an
    ws.Shapes("BTN_Fertig").Visible = an
    ws.Shapes("BTN_PersonNeu").Visible = an
    ws.Shapes("BTN_PersonWeg").Visible = an
    On Error GoTo 0
End Sub

Public Sub Bearbeiten()
    ThisWorkbook.Worksheets("Konfiguration").Range("C59").Value = 1
    Schuetzen
    ModusAnzeigen
End Sub

Public Sub Sperren()
    ThisWorkbook.Worksheets("Konfiguration").Range("C59").Value = 0
    modKarte.KartenEntfernen
    Schuetzen
    ModusAnzeigen
End Sub

Public Sub Klick(ByVal ziel As Range)
    Dim ws As Worksheet, r As Long, c As Long, neu As String
    If ziel.CountLarge <> 1 Then Exit Sub
    r = ziel.Row: c = ziel.Column
    If r < Z_START Then Exit Sub
    If Not modBasis.ZuWertzeile(r) Then Exit Sub
    If Not (c = 6 Or c = modBasis.ZU_ZYKLUS Or (c >= P_ERSTE And c <= P_LETZTE)) Then Exit Sub
    If Not Offen() Then Exit Sub                   ' gesperrt: Klicks aendern nichts
    Set ws = ziel.Worksheet
    If c = 6 Then
        If LCase$(Trim$(CStr(ws.Cells(r, 6).Value))) = "automatisch" Then   ' BUE: Pflicht, kommt aber aus dem BUE-Reporting
            modKarte.Hinweis "Pflicht: automatisch", "Diese Werte sind Pflicht, kommen aber automatisch: BÜ aus dem BÜ-Reporting " & _
                "(„BÜ-Datei verknüpfen“), MAK aus der Mig-Max-Namensliste (Verknüpfung im Monatsblock von Rohdaten). Niemand trägt " & _
                "sie von Hand ein. BÜ Verbund und BÜ OPAG zählen auf der Startseite je einmal bei der Person mit den Punkten auf den " & _
                "BÜ-Zeilen: erledigt, sobald das BÜ-Reporting die KW des Berichtstags liefert.", False
            Exit Sub
        End If
        neu = IIf(LCase$(Trim$(CStr(ws.Cells(r, 6).Value))) = "ja", "nein", "ja")
    ElseIf c = modBasis.ZU_ZYKLUS Then
        neu = NaechsterZyklus(r)
    Else
        If Len(Trim$(CStr(ws.Cells(4, c).Value))) = 0 Then Exit Sub
        neu = IIf(CStr(ws.Cells(r, c).Value) = ChrW(9679), "", ChrW(9679))
    End If
    Schuetzen
    Application.EnableEvents = False
    ws.Cells(r, c).Value = neu
    ws.Cells(r, 3).Select
    Application.EnableEvents = True
End Sub

' Reportingzyklus weiterschalten: Wochenzeilen wöchentlich -> monatlich -> quartalsweise, Monatszeilen monatlich <-> quartalsweise
Private Function NaechsterZyklus(r As Long) As String
    Dim alt As String, monat As Boolean
    alt = modBasis.ZuZyklus(r)
    monat = (modBasis.KopfZeile(CLng(ThisWorkbook.Worksheets(BLATT).Cells(r, 1).Value)) > 1)
    Select Case alt
        Case "wöchentlich": NaechsterZyklus = "monatlich"
        Case "monatlich": NaechsterZyklus = "quartalsweise"
        Case Else: NaechsterZyklus = IIf(monat, "monatlich", "wöchentlich")
    End Select
End Function

' ---------------------------------------------------------------- Person hinzufuegen (Karte mit Eingabefeld)
Public Sub PersonNeu()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    If Not Offen() Then Exit Sub
    On Error GoTo Ersatz
    modKarte.KartenEntfernen
    Set ws = ActiveSheet
    kb = 440: kh = 210
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 22, "Person hinzufügen", 14, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 52, kb - 56, 30, "Nachname, so wie er im Assistenten erscheinen soll. " & _
        "Die Person bekommt eine eigene Spalte, alphabetisch einsortiert.", 9.5, False, modKarte.C_GRAU, True
    modKarte.Eingabefeld ws, "ed_name", kx + 28, ky + 96, kb - 56, 28, "", 12
    modKarte.Knopf ws, "OK", kx + kb - 28 - 130, ky + kh - 50, 130, 30, "Hinzufügen", 1, "modZuordnung.KlickNeuOK"
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
    ws.Shapes(modKarte.PRAEFIX & "ed_name").Select
    Exit Sub
Ersatz:
    PersonAnlegen Trim$(InputBox("Nachname der neuen Person:", "Person hinzufügen"))
End Sub

Public Sub KlickNeuOK()
    Dim nm As String
    nm = Trim$(Replace(Replace(modKarte.FeldText(ActiveSheet, "ed_name"), vbLf, ""), vbCr, ""))
    modKarte.KartenEntfernen
    If Len(nm) = 0 Then Exit Sub
    PersonAnlegen nm
End Sub

Private Sub PersonAnlegen(nm As String)
    Dim wk As Worksheet, i As Long, frei As Long
    If Len(nm) = 0 Then Exit Sub
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    For i = K_ERSTE To K_ERSTE + N_P - 1
        If StrComp(Trim$(CStr(wk.Cells(i, 2).Value)), nm, vbTextCompare) = 0 Then
            modKarte.Hinweis "Person hinzufügen", nm & " steht schon in der Liste.", False
            Exit Sub
        End If
        If frei = 0 And Len(Trim$(CStr(wk.Cells(i, 2).Value))) = 0 Then frei = i
    Next i
    If frei = 0 Then
        modKarte.Hinweis "Person hinzufügen", "Die Liste ist voll (30 Personen). Bitte erst jemanden entfernen.", True
        Exit Sub
    End If
    wk.Cells(frei, 2).Value = nm
    PersonenSortieren
    Application.Calculate
    ZurPersonSpringen nm
End Sub

' ---------------------------------------------------------------- Person entfernen (Auswahl, dann Bestaetigung)
Public Sub PersonEntfernen()
    Dim ws As Worksheet, wk As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    Dim i As Long, n As Long, sp As Long, zl As Long, x As Single, y As Single, nm As String
    If Not Offen() Then Exit Sub
    modKarte.KartenEntfernen
    Set ws = ActiveSheet
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    For i = 0 To N_P - 1
        If Len(Trim$(CStr(wk.Cells(K_ERSTE + i, 2).Value))) > 0 Then n = n + 1
    Next i
    sp = 4
    zl = (n + sp - 1) \ sp
    kb = 600: kh = 150 + zl * 36
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 22, "Person entfernen", 14, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 50, kb - 56, 18, "Wen? Die Spalte und alle Punkte dieser Person werden gelöscht.", 9.5, False, modKarte.C_GRAU
    n = 0
    For i = 0 To N_P - 1
        nm = Trim$(CStr(wk.Cells(K_ERSTE + i, 2).Value))
        If Len(nm) > 0 Then
            x = kx + 28 + (n Mod sp) * ((kb - 56) / sp)
            y = ky + 80 + (n \ sp) * 36
            modKarte.Chip ws, "P" & Format$(i + 1, "00"), x, y, (kb - 56) / sp - 8, 28, nm, False, "modZuordnung.KlickWeg", _
                          Punkte(i) & IIf(Punkte(i) = 1, " Wert", " Werte"), modKarte.C_GRAU
            n = n + 1
        End If
    Next i
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 48, 90, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

' Anzahl der Punkte in der Spalte einer Person (Index 0 = erste Personenspalte)
Private Function Punkte(i As Long) As Long
    Dim ws As Worksheet, r As Long
    Set ws = ThisWorkbook.Worksheets(BLATT)
    For r = Z_START To modBasis.ZuLetzteZeile()
        If CStr(ws.Cells(r, P_ERSTE + i).Value) = ChrW(9679) Then Punkte = Punkte + 1
    Next r
End Function

Public Sub KlickWeg()
    Dim i As Long
    i = modKarte.KlickNummer()
    If i < 1 Or i > N_P Then Exit Sub
    wegName = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Cells(K_ERSTE + i - 1, 2).Value))
    If Len(wegName) = 0 Then Exit Sub
    modKarte.Planen "modZuordnung.WegBestaetigen"
End Sub

Public Sub WegBestaetigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, n As Long
    modKarte.KartenEntfernen
    Set ws = ActiveSheet
    i = PersonIndex(wegName)
    If i < 0 Then Exit Sub
    n = Punkte(i)
    kb = 460: kh = 180
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 22, wegName & " entfernen?", 14, True, modKarte.C_ROT
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 54, kb - 56, 50, IIf(n = 0, "Keine Werte zugeordnet. ", _
        n & IIf(n = 1, " Wert ist", " Werte sind") & " dieser Person zugeordnet und verlieren die Zuordnung. ") & _
        "Die Spalte verschwindet, die übrigen rücken nach.", 9.5, False, modKarte.C_GRAU, True
    modKarte.Knopf ws, "OK", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Ja, entfernen", 4, "modZuordnung.KlickWegOK"
    modKarte.Knopf ws, "Zurueck", kx + kb - 28 - 150 - 12 - 110, ky + kh - 50, 110, 30, "Zurück", 2, "modZuordnung.KlickWegZurueck"
End Sub

Public Sub KlickWegZurueck()
    modKarte.Planen "modZuordnung.PersonEntfernen"
End Sub

Public Sub KlickWegOK()
    Dim ws As Worksheet, i As Long
    modKarte.Planen "modKarte.KartenEntfernen"
    i = PersonIndex(wegName)
    If i < 0 Then Exit Sub
    Set ws = ThisWorkbook.Worksheets(BLATT)
    Schuetzen
    Application.EnableEvents = False
    ws.Range(ws.Cells(Z_START, P_ERSTE + i), ws.Cells(modBasis.ZuLetzteZeile(), P_ERSTE + i)).ClearContents
    Application.EnableEvents = True
    ThisWorkbook.Worksheets("Konfiguration").Cells(K_ERSTE + i, 2).ClearContents
    PersonenSortieren
    Application.Calculate
    wegName = ""
End Sub

Private Function PersonIndex(nm As String) As Long
    Dim wk As Worksheet, i As Long
    PersonIndex = -1
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    For i = 0 To N_P - 1
        If StrComp(Trim$(CStr(wk.Cells(K_ERSTE + i, 2).Value)), nm, vbBinaryCompare) = 0 Then PersonIndex = i: Exit Function
    Next i
End Function

' Namen (Konfiguration B28:B57) alphabetisch, leere ans Ende; die Punktspalten wandern mit
Public Sub PersonenSortieren()
    Dim wk As Worksheet, ws As Worksheet, namen As Variant, altP As Variant, neuN() As Variant, neuP As Variant
    Dim folge(1 To 30) As Long, i As Long, j As Long, t As Long, r As Long, letzte As Long, zeilen As Long
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    Set ws = ThisWorkbook.Worksheets(BLATT)
    letzte = modBasis.ZuLetzteZeile()
    If letzte < Z_START Then Exit Sub
    zeilen = letzte - Z_START + 1
    namen = wk.Range(wk.Cells(K_ERSTE, 2), wk.Cells(K_ERSTE + N_P - 1, 2)).Value2
    altP = ws.Range(ws.Cells(Z_START, P_ERSTE), ws.Cells(letzte, P_LETZTE)).Value2
    For i = 1 To N_P
        folge(i) = i
    Next i
    For i = 2 To N_P                                ' Einfuegesortierung
        t = folge(i)
        j = i - 1
        Do While j >= 1
            If Not Vorher(CStr(namen(t, 1)), CStr(namen(folge(j), 1))) Then Exit Do
            folge(j + 1) = folge(j)
            j = j - 1
        Loop
        folge(j + 1) = t
    Next i
    ReDim neuN(1 To N_P, 1 To 1)
    neuP = altP
    For i = 1 To N_P
        neuN(i, 1) = namen(folge(i), 1)
        For r = 1 To zeilen
            neuP(r, i) = altP(r, folge(i))
        Next r
    Next i
    Schuetzen
    Application.EnableEvents = False
    wk.Range(wk.Cells(K_ERSTE, 2), wk.Cells(K_ERSTE + N_P - 1, 2)).Value2 = neuN
    ' nur Wertzeilen schreiben (Bandzeilen bleiben leer)
    For r = 1 To zeilen
        If modBasis.ZuWertzeile(Z_START + r - 1) Then
            For i = 1 To N_P
                If CStr(ws.Cells(Z_START + r - 1, P_ERSTE + i - 1).Value2) <> CStr(neuP(r, i)) Then ws.Cells(Z_START + r - 1, P_ERSTE + i - 1).Value2 = neuP(r, i)
            Next i
        End If
    Next r
    Application.EnableEvents = True
End Sub

' a vor b? Leere Namen ans Ende, Vergleich ohne Gross/Klein mit Umlauten wie Grundbuchstaben
Private Function Vorher(a As String, b As String) As Boolean
    If Len(Trim$(a)) = 0 Then Exit Function
    If Len(Trim$(b)) = 0 Then Vorher = True: Exit Function
    Vorher = (StrComp(Norm(a), Norm(b), vbBinaryCompare) < 0)
End Function

Private Function Norm(t As String) As String
    Dim s As String
    s = LCase$(Trim$(t))
    s = Replace(s, ChrW(228), "a"): s = Replace(s, ChrW(246), "o"): s = Replace(s, ChrW(252), "u"): s = Replace(s, ChrW(223), "ss")
    Norm = s
End Function

Private Sub ZurPersonSpringen(nm As String)
    Dim i As Long
    i = PersonIndex(nm)
    If i < 0 Then Exit Sub
    On Error Resume Next
    Application.Goto ThisWorkbook.Worksheets(BLATT).Cells(Z_START, P_ERSTE + i)
    On Error GoTo 0
End Sub
