Option Explicit
' ============================================================================
' modCockpit – Schaltflaechen des Cockpits: Filter setzen, Ansicht aktualisieren
' Die Chips im Cockpit sind Zellen mit HYPERLINK auf ChipHover (Rollover: Filter!Q1 = Chip unter der Maus);
' der Klick landet ueber Worksheet_SelectionChange (Blattmodul Cockpit) in ChipSchalten und schaltet
' Filter!C (Themenpostkoerbe, Zeilen PK_VON..PK_BIS), Filter!H (GeVo-Typen, Zeilen 5..18) bzw. Filter!T (Sparten, Zeilen 5..8) um.
' Alle Kennzahlen und Diagramme rechnen ueber Formeln; DiagrammeAnpassen setzt nur veraenderte Bereiche.
' Diagramme: 1/2 Rueckstand OPAG/Verbund, 5 MAK, 6 Altersstruktur, 7/8 Produktivitaet Verbund/OPAG (feste Zeilen
' Diagrammdaten!50:56, Achse J bzw. I, Tag/KW/Woche nach Ansicht),
' 9 Rueckstand je Themenpostkorb; Kachel Eingaenge/Abgaenge: BW_Gesamt, BW_Komposit, BW_Leben, BW_KV
' (Quelle Verbund/OPAG nach Filter!L13, umgeschaltet ueber die Bookmark-Chips BWQ_Verbund/BWQ_OPAG).
' PPT: 10/11 Rueckstand, 12 MAK, 13/14 Bewegungen, 15 Altersstruktur.
' Ansicht Filter!L9: "Tag" (letzte 7 Stichtage), "KW" (Montag bis Sonntag der KW des Bezugstags, Knopf "Aktuelle KW"),
' "Woche" (letzte 7 KW). Achse je Quelle (Diagrammdaten!BR OPAG, BS Verbund): in der Wochensicht steht unter der KW das
' Datum des verwendeten Stands (Sonntag der KW, sonst letzter Stand; * = abgeschlossene KW ohne Sonntagsstand);
' Bewegungen nutzen dieselbe Achse ohne Stern (BT OPAG, BU Verbund).
' ============================================================================

Private aktualisierungGeplant As Boolean   ' Aktualisierung per OnTime bereits geplant
Private reihenFest As Boolean              ' Diagrammdaten-Reihen (feste Zeilen) sind gesetzt
Private letztesK1 As Long                  ' zuletzt gesetztes KW-Fenster
Private letztesP As Long                   ' zuletzt gesetzte letzte Postkorbzeile
' Bezugstag Cockpit!L12: Formel = neuester Stand, Datum als Wert = frueherer Stichtag
Public Const BEZUG_FORMEL As String = "=IF(COUNT(Verlauf!$A$6:$A$1000)=0,"""",MAX(Verlauf!$A$6:$A$1000))"

Public Sub FilterAllePostkoerbe()
    If modLaden.LadenLaeuft() Then Exit Sub
    SetzePostkoerbe True
End Sub

Public Sub FilterAktiveBearbeitung()
    ' Knopf "Standard-Postkörbe": nur die Themenpostkoerbe der Standard-Auswahl (Konfiguration!I11:I50 = "ja")
    If modLaden.LadenLaeuft() Then Exit Sub
    StandardPostkoerbeSetzen
    Aktualisieren
End Sub

Private Sub StandardPostkoerbeSetzen()
    Dim wsF As Worksheet, wsK As Worksheet, r As Long, namen As Variant, std As Variant, aus() As Variant
    Set wsF = ThisWorkbook.Worksheets("Filter")
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    namen = wsF.Range(wsF.Cells(modLaden.PK_VON, 2), wsF.Cells(modLaden.PK_BIS, 2)).Value2
    std = wsK.Range("I11:I50").Value2                                  ' zeilengleich mit Filter!B5:B44
    ReDim aus(1 To UBound(namen, 1), 1 To 1)
    For r = 1 To UBound(namen, 1)
        If Len(CStr(namen(r, 1))) > 0 Then aus(r, 1) = (LCase$(Trim$(CStr(std(r, 1)))) = "ja") Else aus(r, 1) = Empty
    Next r
    wsF.Range(wsF.Cells(modLaden.PK_VON, 3), wsF.Cells(modLaden.PK_BIS, 3)).Value = aus
End Sub

' Knopf "Auf Standard zurücksetzen": Themenpostkoerbe und GeVo-Typen wie in der Standard-Auswahl (Konfiguration H:L),
' alle Sparten. Sind alle GeVo-Typen "ja", gilt der Modus "Alle GeVo", sonst "Manuelle Auswahl" mit den Kaestchen.
Public Sub StandardAnwenden()
    Dim wsF As Worksheet, wsK As Worksheet, r As Long, alle As Boolean, ja As Boolean
    If modLaden.LadenLaeuft() Then Exit Sub
    Set wsF = ThisWorkbook.Worksheets("Filter")
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    StandardPostkoerbeSetzen
    alle = True
    For r = 0 To 13
        ja = (LCase$(Trim$(CStr(wsK.Cells(11 + r, 12).Value))) <> "nein")
        wsF.Cells(5 + r, 8).Value = ja
        If Not ja And (r = 13 Or Len(CStr(wsF.Cells(5 + r, 7).Value)) > 0) Then alle = False
    Next r
    wsF.Range("L5").Value = IIf(alle, "Alle GeVo", "Manuelle Auswahl")
    wsF.Range("T5:T8").Value = True
    wsF.Range("Y5:Y10").Value = True                    ' Einheiten-Chips (Bereich Makler): alle
    Aktualisieren
End Sub

Public Sub FilterAlleGeVo()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L5").Value = "Alle GeVo"
    Aktualisieren
End Sub

Public Sub FilterNurBUE()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L5").Value = "Nur BÜ-Schlüssel"
    Aktualisieren
End Sub

Public Sub FilterZuruecksetzen()
    ' frueher: alles an; jetzt: zurueck auf die Standard-Auswahl
    StandardAnwenden
End Sub

Public Sub FilterAlleSparten()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("T5:T8").Value = True
    Aktualisieren
End Sub

Public Sub FilterAlleEinheiten()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("Y5:Y10").Value = True
    Aktualisieren
End Sub

' Knopf „nur“ neben einem Einheiten-Chip: nur diese Einheit im Filter, alle anderen aus (kein Umschalten)
Private Sub EinheitNur(i As Long)
    Dim wsF As Worksheet, r As Long
    If modLaden.LadenLaeuft() Then Exit Sub
    Set wsF = ThisWorkbook.Worksheets("Filter")
    If Len(CStr(wsF.Cells(4 + i, 24).Value)) = 0 Then Exit Sub
    For r = 5 To 10
        wsF.Cells(r, 25).Value = (r = 4 + i Or Len(CStr(wsF.Cells(r, 24).Value)) = 0)
    Next r
    Aktualisieren
End Sub

Public Sub EinheitNur1()
    EinheitNur 1
End Sub

Public Sub EinheitNur2()
    EinheitNur 2
End Sub

Public Sub EinheitNur3()
    EinheitNur 3
End Sub

Public Sub EinheitNur4()
    EinheitNur 4
End Sub

Public Sub EinheitNur5()
    EinheitNur 5
End Sub

Public Sub EinheitNur6()
    EinheitNur 6
End Sub

Public Sub Aktualisieren(Optional mitPPT As Boolean = False)
    ' mitPPT: auch die Diagramme des Blatts PPT nachziehen (vor dem PowerPoint-Export)
    aktualisierungGeplant = False
    Application.Calculate
    FilterAnzeigen
    DiagrammeAnpassen False, mitPPT
End Sub

Public Sub Hilfe()
    If modLaden.LadenLaeuft() Then Exit Sub
    Dim titel As String
    titel = CStr(IIf(modLaden.IstMakler(), "BÜ-Reporting Makler", "BÜ-Reporting HSB4 K"))
    modFortschritt.HinweisZeigen titel, titel & vbCrLf & vbCrLf & _
           "Neue Daten laden: liest alle Rückstandsabzüge (OPAG und Verbund) aus dem Ordner 'Rohdaten' neben dieser Datei, " & _
           "erkennt Stichtag und Quelle selbst und lädt nur, was noch fehlt. Ein neuer Abzug zu einem schon geladenen Tag ersetzt den alten nach Rückfrage." & vbCrLf & vbCrLf & _
           "Anwesenheit laden: importiert die MAK-Liste oder den Telefonie- und Abwesenheitsplan in die Blätter Mitarbeiter und Kalender; den Plan übernimmt auch jedes 'Neue Daten laden'. Arbeitszeit und Verteilung auf Mo–Fr stehen im Blatt Mitarbeiter; im Kalender (Kalender öffnen) je Tag: leer = da, U Urlaub, K Krankheit, A abwesend, Zahl = anwesender Anteil (0,5 = halber Tag; Samstag 1 = kommt). Feste freie Tage (kursives A) und Feiertage (FT) trägt das Tool selbst ein." & vbCrLf & vbCrLf & _
           "PowerPoint-Folie erzeugen: kopiert die Kacheln des Blatts PPT auf eine Folie der ERGO-Vorlage." & vbCrLf & vbCrLf & _
           "Filter: Die Chips für Sparten, Themenpostkörbe und GeVo-Typen schalten per Klick um (gefüllt = im Filter) und wirken sofort auf alle Kennzahlen und Diagramme; über den Rückstandssäulen zeigt ein Badge die Veränderung zum vorherigen Stand (grün = weniger, gelb = mehr). " & _
           "'Standard-Postkörbe' wählt die Postkörbe der Standard-Auswahl, 'Auf Standard zurücksetzen' stellt Postkörbe und GeVo-Typen auf den Standard. " & _
           "Was zum Standard gehört, legt 'Standard festlegen' fest (oder Konfiguration, Spalten H bis L)." & vbCrLf & vbCrLf & _
           "Werkzeuge: 'SLA anpassen' setzt die SLA-Linien (0 = keine Linie), 'Rohdaten löschen' entfernt einzelne Rohdateien (auf Wunsch mit Neuaufbau), 'Zurücksetzen' leert das Tool (die Rohdateien bleiben). " & _
           "Bereich Makler: Mehrere Einheiten (z. B. ODPB, ODPP, KBI) liefern je Tag eigene Abzüge; das Tool zeigt sie zusammen; die Chips 'Sparte | Einheit' über dem Rückstand stapeln nach Einheit." & vbCrLf & vbCrLf & _
           "Eingänge = Schlüssel, die im neuen Stand erstmals vorkommen; Abgänge = Schlüssel des Vortags, die fehlen " & _
           "(abgearbeitet oder weitergeleitet). Produktivität = Abgänge je MAK (neueste KW hochger.): Wochensicht je KW, " & _
           "Tagessicht und Aktuelle KW Ø je Arbeitstag; Basis in der Kachel." & vbCrLf & vbCrLf & _
           "Diagramme zeigen immer 7 Plätze: Tagessicht = letzte 7 Stichtage und Wochensicht = letzte 7 KW, neueste Periode jeweils rechts; 'Aktuelle KW' = Montag (links) bis Sonntag der Kalenderwoche des Bezugstags (Tage ohne Stand und nach dem Bezugstag bleiben leer). " & _
           "In der Wochensicht steht unter jeder KW das Datum des Stands (Sonntag, sonst letzter Stand; * = ohne Sonntag). Werte, die nicht in ihr Segment passen, stehen mit Führungslinie neben der Säule." & vbCrLf & vbCrLf & _
           "Eingänge und Abgänge: je Sparte eine Zeile, darüber Gesamt; Eingänge oben, Abgänge unten, Delta in der Box (grün = Abbau, gelb = Aufbau). Die Chips Verbund/OPAG in der Kopfleiste schalten die Quelle um; rechts die Summen (Tag: letzte 7 Stichtage, Aktuelle KW: die Tage der KW, Woche: letzte KW).", False
End Sub

Private Sub SetzePostkoerbe(wert As Boolean)
    Dim ws As Worksheet, r As Long, namen As Variant, aus() As Variant
    Set ws = ThisWorkbook.Worksheets("Filter")
    namen = ws.Range(ws.Cells(modLaden.PK_VON, 2), ws.Cells(modLaden.PK_BIS, 2)).Value2
    ReDim aus(1 To UBound(namen, 1), 1 To 1)
    For r = 1 To UBound(namen, 1)
        If Len(CStr(namen(r, 1))) > 0 Then aus(r, 1) = wert Else aus(r, 1) = Empty
    Next r
    ws.Range(ws.Cells(modLaden.PK_VON, 3), ws.Cells(modLaden.PK_BIS, 3)).Value = aus
End Sub

' ---------------------------------------------------------------- Chips (Filterschaltflaechen)
Public Function ChipHover(nr As Long) As String
    ' Wird von HYPERLINK() in den Chipzellen beim Ueberfahren mit der Maus ausgewertet (Rollover): merkt den Chip in Filter!Q1,
    ' die bedingten Formate heben ihn hervor. Der Link zeigt auf die Zelle selbst; der Klick loest Worksheet_SelectionChange aus.
    ' Geschrieben wird NUR beim Ueberfahren (CalculationState = xlDone), nie waehrend einer Neuberechnung oder des Ladens:
    ' Zellschreiben aus einer UDF mitten in der Berechnung bringt neuere Excel-Versionen zum Absturz.
    ' Konfiguration!B8 = NEIN schaltet den Hover ganz ab (Klick bleibt).
    ' Der Link zeigt auf Spalte A der Chipzeile (dort steht die Chip-Nummer); ist diese Zelle schon markiert, auf Spalte H
    ' derselben Zeile – so aendert jeder Klick die Auswahl und Worksheet_SelectionChange feuert auch beim zweiten Klick.
    Dim z As Range, ziel As Range
    On Error Resume Next
    Set z = Application.Caller
    Set ziel = z.Parent.Cells(z.Row, 1)
    If Not ActiveCell Is Nothing Then
        If ActiveCell.Parent.Name = z.Parent.Name And ActiveCell.Address = ziel.Address Then Set ziel = z.Parent.Cells(z.Row, 8)
    End If
    ChipHover = "#'" & z.Parent.Name & "'!" & ziel.Address
    If modLaden.LadenLaeuft() Then Exit Function
    If Application.CalculationState <> xlDone Then Exit Function
    If UCase$(Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("B8").Value))) = "NEIN" Then Exit Function
    If ThisWorkbook.Worksheets("Filter").Range("Q1").Value <> nr Then ThisWorkbook.Worksheets("Filter").Range("Q1").Value = nr
    On Error GoTo 0
End Function

' Themenpostkoerbe (Filter!B5:B44) nach Rueckstand am letzten Stand absteigend sortieren (Verbund + OPAG, Filter!D:E; bei
' Gleichstand nach Saetzen in Fakten, Filter!U). Die zehn Chips im Cockpit zeigen damit die groessten Postkoerbe der geladenen
' Daten (Postkoerbe ohne Daten erscheinen nicht). Filterkennzeichen (C) und Standard (Konfiguration!I) wandern zeilengleich mit;
' alle Formeln suchen den Postkorb ueber den Namen. Aufruf nach jedem Laden.
Public Sub PostkoerbeSortieren()
    Dim wsF As Worksheet, wsK As Worksheet, n As Long, i As Long, j As Long, t As Long
    Dim namen As Variant, aktiv As Variant, std As Variant, d As Variant, e As Variant, u As Variant
    Dim wert() As Double, folge() As Long, neuN() As Variant, neuA() As Variant, neuS() As Variant, geaendert As Boolean
    Set wsF = ThisWorkbook.Worksheets("Filter")
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    n = modLaden.PK_BIS - modLaden.PK_VON + 1
    namen = wsF.Range(wsF.Cells(modLaden.PK_VON, 2), wsF.Cells(modLaden.PK_BIS, 2)).Value2
    aktiv = wsF.Range(wsF.Cells(modLaden.PK_VON, 3), wsF.Cells(modLaden.PK_BIS, 3)).Value2
    d = wsF.Range(wsF.Cells(modLaden.PK_VON, 4), wsF.Cells(modLaden.PK_BIS, 4)).Value2
    e = wsF.Range(wsF.Cells(modLaden.PK_VON, 5), wsF.Cells(modLaden.PK_BIS, 5)).Value2
    u = wsF.Range(wsF.Cells(modLaden.PK_VON, 21), wsF.Cells(modLaden.PK_BIS, 21)).Value2
    std = wsK.Range(wsK.Cells(modLaden.PK_VON + 6, 9), wsK.Cells(modLaden.PK_BIS + 6, 9)).Value2
    ReDim wert(1 To n): ReDim folge(1 To n)
    For i = 1 To n
        folge(i) = i
        If Len(Trim$(CStr(namen(i, 1)))) = 0 Then
            wert(i) = -2
        Else
            wert(i) = Zahl(d(i, 1)) + Zahl(e(i, 1)) + Zahl(u(i, 1)) / 1000000#      ' Rueckstand, bei Gleichstand Saetze
            If Zahl(u(i, 1)) = 0 Then wert(i) = -1                                 ' ohne Daten ans Ende (vor die leeren Plaetze)
        End If
    Next i
    For i = 2 To n                                                  ' stabile Einfuegesortierung, absteigend
        t = folge(i)
        j = i - 1
        Do While j >= 1
            If wert(folge(j)) >= wert(t) Then Exit Do
            folge(j + 1) = folge(j)
            j = j - 1
        Loop
        folge(j + 1) = t
    Next i
    ReDim neuN(1 To n, 1 To 1): ReDim neuA(1 To n, 1 To 1): ReDim neuS(1 To n, 1 To 1)
    For i = 1 To n
        neuN(i, 1) = namen(folge(i), 1): neuA(i, 1) = aktiv(folge(i), 1): neuS(i, 1) = std(folge(i), 1)
        If folge(i) <> i Then geaendert = True
    Next i
    If Not geaendert Then Exit Sub
    wsF.Range(wsF.Cells(modLaden.PK_VON, 2), wsF.Cells(modLaden.PK_BIS, 2)).Value2 = neuN
    wsF.Range(wsF.Cells(modLaden.PK_VON, 3), wsF.Cells(modLaden.PK_BIS, 3)).Value2 = neuA
    wsK.Range(wsK.Cells(modLaden.PK_VON + 6, 9), wsK.Cells(modLaden.PK_BIS + 6, 9)).Value2 = neuS
    modLaden.LogSchreiben "Themenpostkörbe nach Rückstand sortiert"
End Sub

Private Function Zahl(v As Variant) As Double
    If IsError(v) Or IsEmpty(v) Then Exit Function
    If IsNumeric(v) Then Zahl = CDbl(v)
End Function

Public Sub ChipSchalten(nr As Long)
    If modLaden.LadenLaeuft() Then Exit Sub
    ' Schaltet den Chip nr um: 1..99 Themenpostkorb (Filter!C), 101..114 GeVo-Typ (Filter!H, wechselt in die manuelle Auswahl),
    ' 201..204 Sparte (Filter!T), 301..306 Einheit (Filter!Y, Bereich Makler)
    Dim wsF As Worksheet, r As Long, i As Long
    Set wsF = ThisWorkbook.Worksheets("Filter")
    If nr >= 300 Then
        r = 4 + (nr - 300)
        If Len(CStr(wsF.Cells(r, 24).Value)) = 0 Then Exit Sub            ' kein Chip (keine Einheit in dieser Zeile)
        wsF.Cells(r, 25).Value = Not CBool(wsF.Cells(r, 25).Value)
    ElseIf nr < 100 Then
        r = 4 + nr
        If Val(wsF.Cells(r, 21).Value) = 0 Then Exit Sub        ' ausgeblendeter Chip (Postkorb ohne Daten)
        wsF.Cells(r, 3).Value = Not CBool(wsF.Cells(r, 3).Value)
    ElseIf nr >= 200 Then
        r = 4 + (nr - 200)
        If Val(wsF.Cells(r, 22).Value) = 0 And Application.WorksheetFunction.Count(ThisWorkbook.Worksheets("Fakten").Range("A2:A3")) > 0 Then Exit Sub
        wsF.Cells(r, 20).Value = Not CBool(wsF.Cells(r, 20).Value)
    Else
        r = 4 + (nr - 100)
        If wsF.Range("L5").Value <> "Manuelle Auswahl" Then
            For i = 5 To 18
                wsF.Cells(i, 8).Value = CBool(wsF.Cells(i, 9).Value)
            Next i
            wsF.Range("L5").Value = "Manuelle Auswahl"
        End If
        wsF.Cells(r, 8).Value = Not CBool(wsF.Cells(r, 8).Value)
    End If
    ' Kennzahlen rechnen sofort ueber Formeln; Diagramme und Etiketten gleich danach nachziehen, damit der Klick
    ' nicht blockiert und der naechste Klick auf denselben Chip sofort wirkt
    AktualisierungPlanen
End Sub

Public Sub AuswahlWegPlanen()
    ' Nach dem Chip-Klick die Auswahl auf die neutrale Zelle H1 setzen – per OnTime, also nachdem Excel den Hyperlink
    ' fertig verfolgt hat (ein Select im Ereignis selbst wird von der Hyperlink-Navigation wieder ueberschrieben)
    On Error Resume Next
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modCockpit.AuswahlWeg"
    On Error GoTo 0
End Sub

Public Sub AuswahlWeg()
    On Error Resume Next
    If ActiveSheet.Name = "Cockpit" Then
        Application.EnableEvents = False
        ActiveSheet.Range("H1").Select
        Application.EnableEvents = True
    End If
    On Error GoTo 0
End Sub

Public Sub AktualisierungPlanen()
    If aktualisierungGeplant Then Exit Sub
    On Error GoTo Direkt
    aktualisierungGeplant = True
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modCockpit.Aktualisieren"
    Exit Sub
Direkt:
    aktualisierungGeplant = False
    Aktualisieren
End Sub

Public Sub FilterAnzeigen()
    ' Faerbt die Ansichts-Chips (Formen ANS_Tag/ANS_KW/ANS_Woche) nach Filter!L9 = "Tag", "KW" oder "Woche" (alles andere rechnet
    ' wie "Tag"); die Filter-Chips sind Zellen mit bedingtem Format
    Dim ws As Worksheet, wsF As Worksheet, ansicht As String
    Set ws = ThisWorkbook.Worksheets("Cockpit")
    Set wsF = ThisWorkbook.Worksheets("Filter")
    On Error Resume Next                                      ' direkt per Name statt Schleife ueber alle Formen
    ansicht = CStr(wsF.Range("L9").Value)
    ChipFaerben ws.Shapes("ANS_Tag"), (ansicht <> "Woche" And ansicht <> "KW")
    ChipFaerben ws.Shapes("ANS_KW"), (ansicht = "KW")
    ChipFaerben ws.Shapes("ANS_Woche"), (ansicht = "Woche")
    BookmarkFaerben ws.Shapes("BWQ_Verbund"), (wsF.Range("L13").Value <> "OPAG"), (wsF.Range("L13").Value = "OPAG")
    BookmarkFaerben ws.Shapes("BWQ_OPAG"), (wsF.Range("L13").Value = "OPAG"), (wsF.Range("L13").Value = "OPAG")
    Dim i As Long                                             ' „nur“-Knoepfe der Einheiten-Chips (Makler) nur mit Einheit zeigen
    For i = 1 To 6
        ws.Shapes("BTN_EHNur" & i).Visible = (Len(CStr(wsF.Cells(4 + i, 24).Value)) > 0)
    Next i
    On Error GoTo 0
End Sub

Public Sub AnsichtTag()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L9").Value = "Tag"
    Aktualisieren
End Sub

Public Sub AnsichtWoche()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L9").Value = "Woche"
    Aktualisieren
End Sub

' Knopf "Aktuelle KW" unter der Tagessicht: Tagessicht von Montag bis Sonntag der KW des Bezugstags (Filter!O40, ohne frueheren
' Bezugstag der neueste Stand, also die laufende Woche). Tage ohne Stand und nach dem Bezugstag bleiben leer, ihre Beschriftung
' steht trotzdem an der Achse; zurueck/vor/Neuester Stand verschieben den Bezugstag und damit die KW (alles ueber Formeln).
Public Sub AnsichtKW()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L9").Value = "KW"
    Aktualisieren
End Sub

' Beim Oeffnen (Workbook_Open) immer Wochensicht – nur schreiben, wenn noetig (sonst fragt Excel beim Schliessen ohne Grund)
Public Sub WochensichtBeimOeffnen()
    On Error Resume Next
    With ThisWorkbook.Worksheets("Filter").Range("L9")
        If CStr(.Value) <> "Woche" Then .Value = "Woche"
    End With
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Bezugstag (Cockpit!L12, Konstante BEZUG_FORMEL oben im Modul)

Public Sub BezugFormelSetzen()
    Dim war As Boolean
    war = Application.EnableEvents
    Application.EnableEvents = False
    ThisWorkbook.Worksheets("Cockpit").Range("L12").Formula = BEZUG_FORMEL
    Application.EnableEvents = war
End Sub
Public Sub BezugZurueck()
    BezugSetzen -1
End Sub

Public Sub BezugVor()
    BezugSetzen 1
End Sub

Public Sub BezugNeuester()
    If modLaden.LadenLaeuft() Then Exit Sub
    BezugFormelSetzen
    Aktualisieren
End Sub

Private Sub BezugSetzen(richtung As Long)
    ' Blaettert vom wirksamen Bezugstag (Filter!O40) zum vorherigen bzw. naechsten geladenen Stichtag; der neueste Stichtag
    ' wird als Formel gespeichert, damit neue Staende nach dem Laden automatisch erscheinen.
    Dim wsV As Worksheet, akt As Double, r As Long, letzte As Long, d As Double, ziel As Double, maxD As Double
    If modLaden.LadenLaeuft() Then Exit Sub
    Set wsV = ThisWorkbook.Worksheets("Verlauf")
    akt = Val(ThisWorkbook.Worksheets("Filter").Range("O40").Value2)
    If akt = 0 Then Exit Sub
    letzte = wsV.Cells(wsV.Rows.Count, 1).End(xlUp).Row
    ziel = 0: maxD = 0
    For r = 6 To letzte
        d = Val(wsV.Cells(r, 1).Value2)
        If d > maxD Then maxD = d
        If richtung < 0 Then
            If d < akt And d > ziel Then ziel = d
        Else
            If d > akt And (ziel = 0 Or d < ziel) Then ziel = d
        End If
    Next r
    If ziel = 0 Then Exit Sub                                   ' schon am Anfang bzw. Ende
    If ziel >= maxD Then
        BezugFormelSetzen
    Else
        Application.EnableEvents = False
        ThisWorkbook.Worksheets("Cockpit").Range("L12").Value = CDate(ziel)
        Application.EnableEvents = True
    End If
    Aktualisieren
End Sub

Public Sub QuelleVerbund()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L13").Value = "Verbund"
    Aktualisieren
End Sub

Public Sub QuelleOPAG()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Filter").Range("L13").Value = "OPAG"
    Aktualisieren
End Sub

Private Sub BookmarkFaerben(shp As Shape, aktiv As Boolean, opag As Boolean)
    ' Bookmark-Chips in der Kopfleiste der Kachel Eingaenge/Abgaenge: aktiv = weiss mit Schrift in der Kopffarbe,
    ' inaktiv = Kopffarbe mit weisser Schrift und weisser Kontur (Kopf OPAG rot, Verbund petrol)
    Dim kopf As Long
    If opag Then kopf = RGB(142, 15, 30) Else kopf = RGB(11, 111, 125)
    With shp
        .Fill.Visible = msoTrue
        .Fill.Solid
        .Line.Visible = msoTrue
        If aktiv Then
            .Fill.ForeColor.RGB = RGB(255, 255, 255)
            .Line.ForeColor.RGB = RGB(255, 255, 255)
            .TextFrame2.TextRange.Font.Fill.ForeColor.RGB = kopf
            .TextFrame2.TextRange.Font.Bold = msoTrue
        Else
            .Fill.ForeColor.RGB = kopf
            .Line.ForeColor.RGB = RGB(255, 255, 255)
            .Line.Weight = 1
            .TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .TextFrame2.TextRange.Font.Bold = msoFalse
        End If
    End With
End Sub

Private Sub DeltaBoxenRunden(ch As Chart)
    ' Delta-Etiketten der Kachel Eingaenge/Abgaenge als abgerundetes Rechteck, ohne Umbruch und mit der Form an den Text angepasst
    ' (die Datei traegt beides bereits; Excel-Versionen, die es beim Oeffnen verwerfen, bekommen es hier)
    Dim s As Series
    On Error Resume Next
    For Each s In ch.SeriesCollection
        If Left$(s.Name, 5) = "Delta" Then
            If s.HasDataLabels Then
                With s.DataLabels.Format
                    .AutoShapeType = msoShapeRoundedRectangle
                    .TextFrame2.WordWrap = msoFalse
                    .TextFrame2.AutoSize = msoAutoSizeShapeToFitText
                End With
            End If
        End If
    Next s
    On Error GoTo 0
End Sub

Private Sub ChipFaerben(shp As Shape, aktiv As Boolean)
    With shp
        If aktiv Then
            .Fill.Visible = msoTrue
            .Fill.Solid
            .Fill.ForeColor.RGB = RGB(15, 148, 167)
            .Line.Visible = msoFalse
            .TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .TextFrame2.TextRange.Font.Bold = msoTrue
        Else
            .Fill.Visible = msoTrue
            .Fill.Solid
            .Fill.ForeColor.RGB = RGB(255, 255, 255)
            .Line.Visible = msoTrue
            .Line.ForeColor.RGB = RGB(208, 213, 218)
            .Line.Weight = 0.75
            .TextFrame2.TextRange.Font.Fill.ForeColor.RGB = RGB(107, 107, 107)
            .TextFrame2.TextRange.Font.Bold = msoFalse
        End If
    End With
End Sub

' ---------------------------------------------------------------- Diagrammbereiche nachziehen
Public Sub DiagrammeAnpassen(Optional erzwingen As Boolean = False, Optional mitPPT As Boolean = False)
    ' Setzt die Datenbereiche der Diagramme nur, wenn sie sich geaendert haben: Diagrammdaten (immer 7 Perioden) einmal,
    ' das KW-Fenster (7 Kalenderwochen bis zur KW des letzten Stichtags) bei neuem k1, die Postkorbliste bei neuem p.
    ' Danach Etiketten pruefen (Werte neben schmalen Segmenten). erzwingen = True nach dem Laden.
    Dim ws As Worksheet, wsK As Worksheet, wsF As Worksheet, wsP As Worksheet
    Dim k1 As Long, k2 As Long, p As Long, nm As Variant
    Set ws = ThisWorkbook.Worksheets("Cockpit")
    Set wsK = ThisWorkbook.Worksheets("KW")
    Set wsF = ThisWorkbook.Worksheets("Filter")
    Set wsP = ThisWorkbook.Worksheets("PPT")
    k2 = 5 + CLng(Val(wsK.Range("AQ6").Value))
    k1 = k2 - 6
    If k1 < 6 Then k1 = 6
    k2 = k1 + 6
    p = wsF.Cells(wsF.Rows.Count, 2).End(xlUp).Row
    If p < modLaden.PK_VON Then p = modLaden.PK_VON
    If p > modLaden.PK_BIS Then p = modLaden.PK_BIS
    On Error Resume Next
    If erzwingen Then reihenFest = False: letztesK1 = 0: letztesP = 0
    If Not reihenFest Then
        Err.Clear
        ' Bereich MAKLER: vierte Stapelreihe (Sonstige bzw. vierte Einheit, Diagrammdaten!BI/BJ) vor der Summenreihe
        ' Achse je Quelle: BR (OPAG), BS (Verbund) – in der Wochensicht mit dem Datum des Stands (Sonntag, sonst letzter) unter der KW
        If modLaden.IstMakler() Then
            SetzeReihen ws.ChartObjects("Chart 1").Chart, "Diagrammdaten", "BR", 4, 10, Array("C", "D", "E", "BI", "F", "Q", "R", "S", "T")
            SetzeReihen ws.ChartObjects("Chart 2").Chart, "Diagrammdaten", "BS", 4, 10, Array("G", "H", "I", "BJ", "J", "V", "W", "X", "Y")
            SetzeReihen wsP.ChartObjects("Chart 10").Chart, "Diagrammdaten", "BR", 4, 10, Array("C", "D", "E", "BI", "F")
            SetzeReihen wsP.ChartObjects("Chart 11").Chart, "Diagrammdaten", "BS", 4, 10, Array("G", "H", "I", "BJ", "J")
        Else
            SetzeReihen ws.ChartObjects("Chart 1").Chart, "Diagrammdaten", "BR", 4, 10, Array("C", "D", "E", "F", "Q", "R", "S", "T")
            SetzeReihen ws.ChartObjects("Chart 2").Chart, "Diagrammdaten", "BS", 4, 10, Array("G", "H", "I", "J", "V", "W", "X", "Y")
            ' PPT-Folie (Blatt PPT): 10/11 Rueckstand OPAG/Verbund, 12 MAK, 13/14 Bewegungen OPAG/Verbund (Summen), 15 Altersstruktur
            SetzeReihen wsP.ChartObjects("Chart 10").Chart, "Diagrammdaten", "BR", 4, 10, Array("C", "D", "E", "F")
            SetzeReihen wsP.ChartObjects("Chart 11").Chart, "Diagrammdaten", "BS", 4, 10, Array("G", "H", "I", "J")
        End If
        ' 13/14: Eingaenge, Abgaenge, Delta-Box Abbau, Delta-Box Aufbau (Text der Boxen haengt fest an Diagrammdaten!AX/BA);
        ' Achse BT/BU ohne Stern (der Stern zum fehlenden Sonntagsstand gehoert nur zum Rueckstand)
        SetzeReihen wsP.ChartObjects("Chart 13").Chart, "Diagrammdaten", "BT", 4, 10, Array("K", "L", "AV", "AW")
        SetzeReihen wsP.ChartObjects("Chart 14").Chart, "Diagrammdaten", "BU", 4, 10, Array("N", "O", "AY", "AZ")
        ' Beim Bau sind die Wertachsen fest gesetzt (fuer die Etikettengeometrie); in Excel rechnet die Automatik
        For Each nm In Array("Chart 1", "Chart 2")
            With ws.ChartObjects(nm).Chart.Axes(xlValue)
                .MinimumScaleIsAuto = True
                .MaximumScaleIsAuto = True
            End With
        Next nm
        For Each nm In Array("Chart 10", "Chart 11")
            With wsP.ChartObjects(nm).Chart.Axes(xlValue)
                .MinimumScaleIsAuto = True
                .MaximumScaleIsAuto = True
            End With
        Next nm
        reihenFest = (Err.Number = 0)
        Err.Clear
    End If
    If k1 <> letztesK1 Then
        SetzeReihen ws.ChartObjects("Chart 5").Chart, "KW", "C", k1, k2, Array("M", "L", "N")      ' Komposit/Leben unten, KV darueber
        SetzeReihen wsP.ChartObjects("Chart 12").Chart, "KW", "C", k1, k2, Array("M", "L", "N")
        letztesK1 = k1
    End If
    If p <> letztesP Then
        SetzeReihen ws.ChartObjects("Chart 9").Chart, "Filter", "B", modLaden.PK_VON, p, Array("D", "E")
        letztesP = p
    End If
    For Each nm In Array("Chart 1", "Chart 2")
        EtikettenAuslagern ws.ChartObjects(nm).Chart, 0
    Next nm
    ' Produktivitaet (Chart 7 Verbund, Chart 8 OPAG): Wert einer zu niedrigen Saeule ueber die Saeule statt weiss hinein (12.89)
    For Each nm In Array("Chart 7", "Chart 8")
        EtikettenUeberSaeule ws.ChartObjects(nm).Chart
    Next nm
    If erzwingen Then                                         ' Delta-Boxen behalten ihre Form; nur nach dem Laden neu runden
        For Each nm In Array("BW_Gesamt", "BW_Komposit", "BW_Leben", "BW_KV")
            DeltaBoxenRunden ws.ChartObjects(nm).Chart
        Next nm
    End If
    ' Altersstruktur: zu schmale Segmente ohne Etikett (die Werte ueber 90 Tage stehen im Untertitel). PPT-Rueckstand: wie im
    ' Cockpit – passt ein Wert nicht ins Segment (meist Leben), steht er mit Fuehrungslinie neben der Saeule (Schrift 7 pt)
    EtikettenAuslagern ws.ChartObjects("Chart 6").Chart, 2, True
    ' Blatt PPT: nur nach dem Laden und vor dem Export (sieht sonst niemand – spart bei jedem Chip-Klick die Haelfte)
    If erzwingen Or mitPPT Then
        For Each nm In Array("Chart 10", "Chart 11")
            EtikettenAuslagern wsP.ChartObjects(nm).Chart, 0, False, 7
        Next nm
        EtikettenAuslagern wsP.ChartObjects("Chart 15").Chart, 2, True
    End If
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Navigation
Public Sub PlanungOeffnen()
    ' Knopf "Kalender öffnen"
    If modLaden.LadenLaeuft() Then Exit Sub
    AlphabetischSortieren
    ZurAktuellenKW
End Sub

' Mitarbeiter und ihre Kalenderzeilen alphabetisch sortieren. Mitarbeiter!A5:N64 (Eingaben inkl. Arbeitszeitmodell) und
' Kalender!D7:... gehoeren zeilengleich zusammen (Kalender-Zeile = Mitarbeiter-Zeile + 2) und werden mit derselben
' Reihenfolge umgestellt; Kalender!A:C, Mitarbeiter!O:T und Wirksam folgen ueber Formeln. Leere Zeilen ans Ende.
Public Sub AlphabetischSortieren()
    Const MA_START As Long = 5, MA_ZEILEN As Long = 60, PL_START As Long = 7, PL_SPALTE0 As Long = 4, MA_SPALTEN As Long = 14
    Dim wsM As Worksheet, wsP As Worksheet, stamm As Variant, plan As Variant, neuS As Variant, neuP As Variant
    Dim folge() As Long, i As Long, j As Long, t As Long, c As Long, letzte As Long, geaendert As Boolean, warE As Boolean
    On Error GoTo Ende
    warE = Application.EnableEvents
    Application.EnableEvents = False
    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    Set wsP = ThisWorkbook.Worksheets("Kalender")
    letzte = wsP.Cells(6, wsP.Columns.Count).End(xlToLeft).Column
    stamm = wsM.Range(wsM.Cells(MA_START, 1), wsM.Cells(MA_START + MA_ZEILEN - 1, MA_SPALTEN)).Value2
    plan = wsP.Range(wsP.Cells(PL_START, PL_SPALTE0), wsP.Cells(PL_START + MA_ZEILEN - 1, letzte)).Value2
    ReDim folge(1 To MA_ZEILEN)
    For i = 1 To MA_ZEILEN
        folge(i) = i
    Next i
    ' Einfuegesortierung (hoechstens 60 Zeilen), Vergleich ohne Gross/Klein, Umlaute nach Systemsprache
    For i = 2 To MA_ZEILEN
        t = folge(i)
        j = i - 1
        Do While j >= 1
            If Not Vorher(CStr(stamm(t, 1)), CStr(stamm(folge(j), 1))) Then Exit Do
            folge(j + 1) = folge(j)
            j = j - 1
        Loop
        folge(j + 1) = t
    Next i
    For i = 1 To MA_ZEILEN
        If folge(i) <> i Then geaendert = True
    Next i
    If geaendert Then
        neuS = stamm: neuP = plan
        For i = 1 To MA_ZEILEN
            For c = 1 To UBound(stamm, 2)
                neuS(i, c) = stamm(folge(i), c)
            Next c
            For c = 1 To UBound(plan, 2)
                neuP(i, c) = plan(folge(i), c)
            Next c
        Next i
        wsM.Range(wsM.Cells(MA_START, 1), wsM.Cells(MA_START + MA_ZEILEN - 1, MA_SPALTEN)).Value2 = neuS
        wsP.Range(wsP.Cells(PL_START, PL_SPALTE0), wsP.Cells(PL_START + MA_ZEILEN - 1, letzte)).Value2 = neuP
        modLaden.LogSchreiben "Mitarbeiter und Kalender alphabetisch sortiert"
    End If
Ende:
    Application.EnableEvents = warE
End Sub

' a vor b? Leere Namen immer ans Ende
Private Function Vorher(a As String, b As String) As Boolean
    a = Trim$(a): b = Trim$(b)
    If Len(a) = 0 Then Vorher = False: Exit Function
    If Len(b) = 0 Then Vorher = True: Exit Function
    Vorher = (StrComp(a, b, vbTextCompare) < 0)
End Function

Public Sub CockpitOeffnen()
    If modLaden.LadenLaeuft() Then Exit Sub
    ThisWorkbook.Worksheets("Cockpit").Activate
    ThisWorkbook.Worksheets("Cockpit").Range("A1").Select
End Sub

Public Sub ZurAktuellenKW()
    ' Knopf "Zu heute" bzw. "Kalender öffnen": Kalender aktivieren und den heutigen Tag neben die fixierten Spalten holen
    ThisWorkbook.Worksheets("Kalender").Activate
    KalenderZuHeute
End Sub

' Spalte des heutigen Tags im Kalender (am Wochenende der naechste Montag); 0 = ausserhalb des Kalenders
Public Function KalenderSpalteHeute() As Long
    Dim ws As Worksheet, c As Long, letzte As Long
    On Error GoTo Ende
    Set ws = ThisWorkbook.Worksheets("Kalender")
    letzte = ws.Cells(6, ws.Columns.Count).End(xlToLeft).Column
    For c = 4 To letzte
        If IsDate(ws.Cells(6, c).Value) Then
            If CDate(ws.Cells(6, c).Value) >= Date Then KalenderSpalteHeute = c: Exit Function
        End If
    Next c
Ende:
End Function

' Kalender (muss aktiv sein): "frei"/"FT" nachtragen, vergangene Wochen einklappen und so blaettern, dass heute sichtbar ist
Public Sub KalenderZuHeute()
    Dim c As Long, cm As Long
    On Error Resume Next
    If ActiveSheet.Name <> "Kalender" Then Exit Sub
    KalenderVorbelegen
    cm = KalenderEinklappen()
    c = KalenderSpalteHeute()
    If c = 0 Then Exit Sub
    ActiveWindow.ScrollColumn = IIf(c - 2 < cm, cm, c - 2)
    ActiveSheet.Cells(7, c).Select
End Sub

' Traegt im Kalender ein, was ohnehin feststeht: "FT" an Feiertagen (Konfiguration!N11:N60) und ein kursives "A" (abwesend)
' an Wochentagen, an denen die Person laut Arbeitszeitmodell nicht arbeitet (Mitarbeiter!J:N = 0). Angepasst werden nur leere
' Zellen, "FT" und die kursiven "A" des Tools – eigene Eintraege (U, K, A, Anteil) bleiben stehen. Aendert sich das Modell,
' verschwinden alte automatische "A" wieder.
Public Sub KalenderVorbelegen()
    Const PL_START As Long = 7, PL_SPALTE0 As Long = 4, MA_ZEILEN As Long = 60, MA_START As Long = 5
    Dim wsP As Worksheet, wsM As Worksheet, wsK As Worksheet, ft As Object, letzte As Long
    Dim plan As Variant, namen As Variant, modell As Variant, daten As Variant, liste As Variant
    Dim r As Long, c As Long, wt As Long, v As Variant, ziel As Variant, alt As String, auto As Boolean, warE As Boolean, n As Long
    Dim zelle As Range, warS As Boolean
    On Error GoTo Ende
    warE = Application.EnableEvents
    warS = Application.ScreenUpdating                ' im Laden aus: nicht mitten im Ladefenster einschalten
    Application.EnableEvents = False
    Set wsP = ThisWorkbook.Worksheets("Kalender")
    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    letzte = wsP.Cells(6, wsP.Columns.Count).End(xlToLeft).Column
    If letzte < PL_SPALTE0 Then GoTo Ende
    Set ft = CreateObject("Scripting.Dictionary")
    liste = wsK.Range("N11:N60").Value2
    For r = 1 To UBound(liste, 1)
        If IsNumeric(liste(r, 1)) And Not IsEmpty(liste(r, 1)) Then ft(CLng(liste(r, 1))) = True
    Next r
    daten = wsP.Range(wsP.Cells(6, PL_SPALTE0), wsP.Cells(6, letzte)).Value2
    namen = wsP.Range(wsP.Cells(PL_START, 1), wsP.Cells(PL_START + MA_ZEILEN - 1, 1)).Value2
    modell = wsM.Range(wsM.Cells(MA_START, 10), wsM.Cells(MA_START + MA_ZEILEN - 1, 14)).Value2   ' J:N = Mo..Fr
    plan = wsP.Range(wsP.Cells(PL_START, PL_SPALTE0), wsP.Cells(PL_START + MA_ZEILEN - 1, letzte)).Value2
    Application.ScreenUpdating = False
    For r = 1 To MA_ZEILEN
        For c = 1 To UBound(plan, 2)
            v = plan(r, c)
            alt = UCase$(Trim$(CStr(v)))
            auto = False
            If alt = "A" Then auto = wsP.Cells(PL_START + r - 1, PL_SPALTE0 + c - 1).Font.Italic    ' "A" des Tools ist kursiv
            If IsEmpty(v) Or alt = "" Or alt = "FT" Or auto Then
                ziel = Empty
                If Len(Trim$(CStr(namen(r, 1)))) > 0 And IsNumeric(daten(1, c)) Then
                    If ft.Exists(CLng(daten(1, c))) Then
                        ziel = "FT"
                    Else
                        wt = Weekday(CDate(daten(1, c)), vbMonday)
                        If wt <= 5 Then
                            If Not IsEmpty(modell(r, wt)) And IsNumeric(modell(r, wt)) Then
                                If CDbl(modell(r, wt)) = 0 Then ziel = "A"
                            End If
                        End If
                    End If
                End If
                If CStr(ziel) <> CStr(v) Or (ziel = "A" And Not auto) Then
                    Set zelle = wsP.Cells(PL_START + r - 1, PL_SPALTE0 + c - 1)
                    zelle.Value = ziel
                    zelle.Font.Italic = (CStr(ziel) = "A")
                    n = n + 1
                End If
            End If
        Next c
    Next r
    If n > 0 Then modLaden.LogSchreiben "Kalender: " & n & " Einträge (A laut Arbeitszeitmodell, FT) angepasst"
Ende:
    Application.ScreenUpdating = warS
    Application.EnableEvents = warE
End Sub

' Alle Tage vor dem Montag der aktuellen Woche als eine Gliederungsgruppe zusammenfassen und zuklappen ("+" oben klappt auf).
' Rueckgabe: Spalte des Montags der aktuellen Woche (erste sichtbare Tagesspalte).
Public Function KalenderEinklappen() As Long
    Dim ws As Worksheet, c As Long, letzte As Long, cm As Long, montag As Date
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Kalender")
    letzte = ws.Cells(6, ws.Columns.Count).End(xlToLeft).Column
    montag = Date - Weekday(Date, vbMonday) + 1
    cm = 4
    For c = 4 To letzte
        If IsDate(ws.Cells(6, c).Value) Then
            If CDate(ws.Cells(6, c).Value) >= montag Then cm = c: Exit For
        End If
    Next c
    KalenderEinklappen = cm
    ws.Range(ws.Columns(4), ws.Columns(letzte)).Ungroup
    ws.Range(ws.Columns(4), ws.Columns(letzte)).Ungroup
    ws.Range(ws.Columns(4), ws.Columns(letzte)).EntireColumn.Hidden = False
    If cm > 4 Then
        ws.Outline.SummaryColumn = xlRight
        ws.Range(ws.Columns(4), ws.Columns(cm - 1)).Group
        ws.Range(ws.Columns(4), ws.Columns(cm - 1)).EntireColumn.Hidden = True
    End If
End Function

Private Sub SetzeReihen(ch As Chart, blatt As String, katSpalte As String, z1 As Long, z2 As Long, spalten As Variant)
    Dim i As Long
    For i = 1 To ch.SeriesCollection.Count
        If i - 1 <= UBound(spalten) Then
            ch.SeriesCollection(i).XValues = "=" & blatt & "!$" & katSpalte & "$" & z1 & ":$" & katSpalte & "$" & z2
            ch.SeriesCollection(i).Values = "=" & blatt & "!$" & spalten(i - 1) & "$" & z1 & ":$" & spalten(i - 1) & "$" & z2
        End If
    Next i
End Sub

' ---------------------------------------------------------------- Gruppierte Saeulen: passt der Wert nicht in die Saeule (Saeule
' niedriger als das Etikett), steht er dunkel ueber der Saeule, sonst weiss innen am Ende
Public Sub EtikettenUeberSaeule(ch As Chart)
    Dim s As Series, p As Point, lbl As DataLabel, j As Long, i As Long, w As Variant, v As Double
    On Error Resume Next
    For j = 1 To ch.SeriesCollection.Count
        Set s = ch.SeriesCollection(j)
        If s.ChartType = xlColumnClustered Then
            w = s.Values
            For i = 1 To s.Points.Count
                v = 0
                If IsNumeric(w(i)) Then v = CDbl(w(i))
                Set p = s.Points(i)
                If v <> 0 And p.HasDataLabel Then
                    Set lbl = p.DataLabel
                    If p.Height < lbl.Height + 2 Then
                        lbl.Position = xlLabelPositionOutsideEnd
                        lbl.Font.Color = RGB(74, 74, 74)
                    Else
                        lbl.Position = xlLabelPositionInsideEnd
                        lbl.Font.Color = RGB(255, 255, 255)
                    End If
                End If
            Next i
        End If
    Next j
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Etiketten wie in think-cell: passt der Wert nicht ins Segment,
' steht er mit Fuehrungslinie neben der Saeule (abwechselnd links und rechts, ohne Ueberlappung) bzw. ueber dem Balken.
Public Sub EtikettenAuslagern(ch As Chart, dunkleReihen As Long, Optional ausblenden As Boolean = False, Optional groesse As Single = 8)
    Dim s As Series, p As Point, lbl As DataLabel, werte() As Variant, reihenTyp() As Long, leader() As Boolean
    Dim i As Long, j As Long, n As Long, nReihen As Long, y As Single, x As Single, v As Double
    Dim links As Boolean, letzteL As Single, letzteR As Single, balken As Boolean
    Dim lb As Single, lh As Single, luecke As Single, kat As Single, letzteBalken As Long
    Dim ausL() As Object, ausY() As Single, ausH() As Single, nAus As Long, k As Long, m As Long, tmpO As Object, tmpS As Single
    Dim oben As Single, unten As Single
    On Error Resume Next
    n = ch.SeriesCollection(1).Points.Count
    nReihen = ch.SeriesCollection.Count
    If n = 0 Or nReihen = 0 Then Exit Sub
    ' Reihenwerte und Typen einmal lesen (Values je Punkt zu lesen ist teuer)
    ReDim werte(1 To nReihen): ReDim reihenTyp(1 To nReihen): ReDim leader(1 To nReihen)
    For j = 1 To nReihen
        Set s = ch.SeriesCollection(j)
        reihenTyp(j) = 0
        If s.ChartType = xlColumnStacked Then reihenTyp(j) = 1
        If s.ChartType = xlBarStacked Or s.ChartType = xlBarStacked100 Then reihenTyp(j) = 2
        If Left$(s.Name, 5) = "Delta" Or s.Name = "Achsenluft" Then reihenTyp(j) = 0   ' unsichtbare Badge-Segmente: Etiketten bleiben, wie sie sind
        If reihenTyp(j) > 0 Then werte(j) = s.Values
        If reihenTyp(j) = 2 Then letzteBalken = j
    Next j
    kat = ch.PlotArea.InsideWidth / n
    ReDim ausL(1 To nReihen): ReDim ausY(1 To nReihen): ReDim ausH(1 To nReihen)
    oben = 0: unten = ch.ChartArea.Height
    For i = 1 To n
        links = False: letzteL = -1E+9: letzteR = -1E+9      ' immer rechts neben der Saeule: links schneidet die Vorgaenger-Saeule ab
        nAus = 0                                              ' ausgelagerte Saeulen-Etiketten dieses Punkts (werden unten verteilt)
        For j = 1 To nReihen
            If reihenTyp(j) > 0 Then
                Set s = ch.SeriesCollection(j)
                balken = (reihenTyp(j) = 2)
                v = 0
                If IsNumeric(werte(j)(i)) Then v = CDbl(werte(j)(i))
                Set p = s.Points(i)
                ' im Modus ausblenden wurde das Etikett vielleicht beim letzten Mal entfernt: fuer die Messung wieder anlegen
                If ausblenden And v <> 0 And Not p.HasDataLabel Then p.HasDataLabel = True
                If v <> 0 And p.HasDataLabel Then
                    Set lbl = p.DataLabel
                    lb = lbl.Width: lh = lbl.Height
                    If ausblenden Then
                        ' Altersstruktur: das letzte Segment (über 90 Tage) bekommt seinen Wert rechts neben das Balkenende, dort mit
                        ' „> 90 Tage:“ davor – eine nackte Zahl neben dem Balken war nicht zuzuordnen
                        If balken And j = letzteBalken Then
                            lbl.NumberFormat = "#,##0": lb = lbl.Width
                        End If
                        If balken And j = letzteBalken And p.Width < lb + 2 Then
                            lbl.NumberFormat = """> 90 Tage: ""#,##0"
                            lbl.Position = xlLabelPositionCenter
                            lbl.Left = p.Left + p.Width + 4
                            lbl.Top = p.Top + p.Height / 2 - lh / 2
                            lbl.Font.Color = RGB(26, 26, 26)
                            GoTo NaechsterPunkt
                        End If
                        If (balken And p.Width < lb + 2) Or (Not balken And (p.Height < lh + 1 Or p.Width < lb + 2)) Then
                            p.HasDataLabel = False
                            GoTo NaechsterPunkt
                        End If
                    End If
                    If balken Then
                        If p.Width < lb + 2 Then
                            lbl.Position = xlLabelPositionCenter
                            x = p.Left + p.Width / 2 - lb / 2
                            If x < letzteR Then x = letzteR
                            lbl.Left = x
                            lbl.Top = p.Top - lh - 3
                            letzteR = x + lb + 2
                            lbl.Font.Color = RGB(74, 74, 74)
                            If Not leader(j) Then s.HasLeaderLines = True: leader(j) = True
                        Else
                            lbl.Position = xlLabelPositionCenter
                            If j <= dunkleReihen Then lbl.Font.Color = RGB(26, 26, 26) Else lbl.Font.Color = RGB(255, 255, 255)
                        End If
                    Else
                        If p.Height < lh + 1 Or p.Width < lb + 2 Then
                            lbl.Position = xlLabelPositionCenter
                            y = p.Top + p.Height / 2 - lh / 2
                            lbl.Left = p.Left + p.Width + IIf(groesse <= 7, 2, 5)      ' PPT (7 pt): dicht an der Saeule
                            ' Hoehe erst nach allen Reihen festlegen: mehrere kleine Segmente uebereinander wuerden sich sonst
                            ' ueberlagern (bisher nur gegen das zuletzt gesetzte Etikett geprueft)
                            nAus = nAus + 1: Set ausL(nAus) = lbl: ausY(nAus) = y: ausH(nAus) = lh
                            lbl.Font.Color = RGB(74, 74, 74)
                            If Not leader(j) Then s.HasLeaderLines = True: leader(j) = True
                            ' Passt das Etikett nicht in die Luecke zwischen den Saeulen, Schrift verkleinern
                            luecke = kat - p.Width
                            If luecke < 0 Then luecke = 0
                            If lb + 6 > luecke And i > 1 And i < n Then lbl.Font.Size = groesse - 1 Else lbl.Font.Size = groesse
                            ' PPT (7 pt): weisser Grund, damit der Wert auch ueber dem Rand der Nachbarsaeule lesbar bleibt
                            If groesse <= 7 Then lbl.Format.Fill.Visible = True: lbl.Format.Fill.ForeColor.RGB = RGB(255, 255, 255): lbl.Format.Fill.Solid
                        Else
                            lbl.Position = xlLabelPositionCenter
                            lbl.Font.Color = RGB(255, 255, 255)
                            If groesse <= 7 Then lbl.Format.Fill.Visible = False
                        End If
                    End If
                End If
            End If
NaechsterPunkt:
        Next j
        If nAus > 0 Then
            ' nach Wunschhoehe sortieren (oben zuerst), dann von oben nach unten ohne Ueberlappung stapeln; ragt der Stapel
            ' unten heraus, von unten wieder nach oben schieben
            For k = 2 To nAus
                For m = k To 2 Step -1
                    If ausY(m) < ausY(m - 1) Then
                        Set tmpO = ausL(m): Set ausL(m) = ausL(m - 1): Set ausL(m - 1) = tmpO
                        tmpS = ausY(m): ausY(m) = ausY(m - 1): ausY(m - 1) = tmpS
                        tmpS = ausH(m): ausH(m) = ausH(m - 1): ausH(m - 1) = tmpS
                    End If
                Next m
            Next k
            If ausY(1) < oben Then ausY(1) = oben
            For k = 2 To nAus
                If ausY(k) < ausY(k - 1) + ausH(k - 1) + 1 Then ausY(k) = ausY(k - 1) + ausH(k - 1) + 1
            Next k
            If ausY(nAus) + ausH(nAus) > unten Then
                ausY(nAus) = unten - ausH(nAus)
                For k = nAus - 1 To 1 Step -1
                    If ausY(k) + ausH(k) + 1 > ausY(k + 1) Then ausY(k) = ausY(k + 1) - ausH(k) - 1
                Next k
            End If
            For k = 1 To nAus
                ausL(k).Top = ausY(k)
                Set ausL(k) = Nothing
            Next k
        End If
    Next i
    On Error GoTo 0
End Sub

' Beim Oeffnen: steht Excel auf manuell, auf automatisch stellen und alles neu berechnen
Public Sub RechnenPruefen()
    If Application.Calculation <> xlCalculationAutomatic Then
        Application.Calculation = xlCalculationAutomatic
        Application.CalculateFull
    End If
End Sub
