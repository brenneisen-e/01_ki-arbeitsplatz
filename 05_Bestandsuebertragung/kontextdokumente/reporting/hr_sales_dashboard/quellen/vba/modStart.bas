Option Explicit
' ============================================================================
' modStart – Startseite und Assistent "Werte eintragen"
'
'   Start            Karte "Wer bist du?": Personen aus Konfiguration!B28:B57 mit Zahl der offenen Pflichtwerte,
'                    dazu "Reporting" (Ueberblick, Kommentare, PowerPoint).
'   PersonGewaehlt   Karte mit den offenen Werten dieser Person fuer den Berichtstag (Blatt Zustaendigkeiten:
'                    Spalte E = Personen, F = Pflicht, A = Zeile in Rohdaten).
'   Eintragen        springt in Rohdaten genau in die Zelle (Zeile der Kennzahl, Spalte des Berichtstags), rahmt sie
'                    rot ein; eine kleine Karte rechts zeigt "Wert i von n" mit "Weiter" und "Beenden".
'                    Die Karte fragt zur Zahl auch den "Stand der Zahl" (Datum TT.MM.JJJJ, Tag, zu dem die Zahl gilt):
'                    vorbelegt mit heute bzw. dem zuletzt in diesem Durchgang eingetragenen Stand (Start setzt ihn zurueck).
'                    "Uebernehmen" schreibt die Zahl nach Rohdaten und das Datum in dieselbe Zelle des ausgeblendeten
'                    Blatts Wertstand (fehlt das Blatt in aelteren Dateien, nur die Zahl). Ungueltige Eingaben -> Meldung
'                    in der Karte, beide Eingaben bleiben stehen.
'   Abschluss        zurueck zur Startseite mit Ergebnis: alles da oder noch n offen.
'   KennzahlenZeigen Umschalter "Nach Kennzahl" in der Karte "Wer bist du?": alle offenen Pflichtwerte des Berichtstags mit
'                    Code, Kennzahl und Zustaendigen (seitenweise). Klick auf eine Zeile springt in die Zelle und fuehrt von
'                    dort durch die weiteren offenen Werte; "Beenden" fuehrt zur Liste zurueck.
'   BUE              BUE Verbund und OPAG sind je ein Pflichtwert der Person mit den Punkten auf den BUE-Zeilen (Zuordnung).
'                    Sie kommen automatisch aus dem BUE-Reporting: erledigt, sobald die KW des Berichtstags da ist (Namen
'                    BUE_V_OK / BUE_O_OK). Offen -> eigene Karte mit Hinweis und "Jetzt aktualisieren" (Verknuepfung neu lesen)
'                    statt Eingabefeld; in den Listen stehen sie mit zeilen() = -1 (Verbund) bzw. -2 (OPAG).
' ============================================================================

Private personen() As String, nPers As Long
Private gewaehlt As String
Private zeilen() As Long, texte() As String, codes() As String, wers() As String, nOffen As Long, nErledigt As Long
Private spalten() As Long, zuZ() As Long          ' je offener Wert: Zielspalte in Rohdaten (Berichtstag bzw. faelliger Monat), Zeile in Zustaendigkeiten
Private nachKennzahl As Boolean                 ' Eintragen aus der Kennzahlen-Sicht: alle offenen Werte, nicht nur einer Person
Private seite As Long                           ' Seite der Kennzahlen-Sicht
Private Const JE_SEITE As Long = 12
Private meldung As String                       ' Hinweis in der Eingabekarte (z. B. ungueltige Zahl)
Private vorgabeWert As String, vorgabeStand As String   ' Eingaben nach einer Meldung wieder ins Feld (Zahl, Stand)
Private standLetzt As Date                      ' zuletzt uebernommener Stand der Zahl in diesem Durchgang (0 = heute vorschlagen)
Private pos As Long
Private aktiv As Boolean

Public Function AssistentAktiv() As Boolean
    AssistentAktiv = aktiv
End Function

Public Function StartVersion() As String
    StartVersion = "1"
End Function

' ---------------------------------------------------------------- Navigation
Public Sub ZurStartseite()
    modKarte.KartenEntfernen
    ThisWorkbook.Worksheets("Start").Activate
    ThisWorkbook.Worksheets("Start").Range("A1").Select
End Sub

Public Sub ZurUebersicht()
    modKarte.KartenEntfernen
    ThisWorkbook.Worksheets("Übersicht").Activate
End Sub

Public Sub ZuRohdaten()
    modKarte.KartenEntfernen
    ZurBerichtsspalte
End Sub

Public Sub ZurBerichtsspalte()
    Dim ws As Worksheet, c As Long
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    ws.Activate
    c = modBasis.BerichtsSpalte()
    On Error Resume Next
    If c > 0 Then
        ActiveWindow.ScrollColumn = IIf(c - 6 > 9, c - 6, 9)
        ws.Cells(3, c).Select
    End If
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Berichtstag
' Pfeile: eine KW zurueck/vor. Gesetzt wird der Meldetag dieser KW (wie die Automatik: Wochentag F4 nach dem Freitag, vor der
' Umstellung F7 der Freitag selbst, Feiertag am Standort -> naechster Werktag). Trifft das den automatischen Berichtstag (C4),
' wird C5 geleert, damit die Datei wieder von selbst weiterlaeuft.
Public Sub BerichtstagZurueck()
    KwSetzen modBasis.KwFreitag() - 7
End Sub

Public Sub BerichtstagVor()
    KwSetzen modBasis.KwFreitag() + 7
End Sub

Private Sub KwSetzen(freitag As Date)
    Dim wk As Worksheet, versatz As Long, umst As Double, tag As Date, auto As Variant
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    versatz = CLng(Val(wk.Range("H4").Value))
    umst = 0
    If IsDate(wk.Range("F7").Value) Then umst = CDbl(CDate(wk.Range("F7").Value))
    tag = freitag
    If CDbl(freitag) + versatz >= umst Then tag = freitag + versatz
    On Error Resume Next
    tag = Application.WorksheetFunction.WorkDay(tag - 1, 1, ThisWorkbook.Worksheets("Feiertage").Range("T3:T58"))
    On Error GoTo 0
    auto = wk.Range("C4").Value
    If IsDate(auto) Then
        If CLng(CDate(auto)) = CLng(tag) Then
            BerichtstagAuto
            Exit Sub
        End If
    End If
    BerichtstagSetzen tag
End Sub

' Beim Oeffnen: steht in C5 von Hand genau der automatische Berichtstag (z. B. Freitag per Pfeil den Montag vorbereitet, ab
' Samstag ist er automatisch), wird C5 geleert - sonst bliebe die Datei auf dieser KW stehen. Ein frueherer Tag von Hand bleibt.
Public Sub BerichtstagAufraeumen()
    Dim wk As Worksheet, h As Variant, a As Variant
    On Error Resume Next
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    Application.Calculate
    h = wk.Range("C5").Value
    a = wk.Range("C4").Value
    If IsDate(h) And IsDate(a) Then
        If CLng(CDate(h)) = CLng(CDate(a)) Then BerichtstagAuto
    End If
End Sub

Public Sub BerichtstagAuto()
    ThisWorkbook.Worksheets("Konfiguration").Range("C5").ClearContents
    Application.Calculate
End Sub

Private Sub BerichtstagSetzen(d As Date)
    ThisWorkbook.Worksheets("Konfiguration").Range("C5").Value = d
    Application.Calculate
End Sub

' ---------------------------------------------------------------- Schritt 1: Wer bist du?
Public Sub Start()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, r As Long
    Dim offen As Long, pflicht As Long, x As Single, y As Single, b As Single, zusatz As String, farbe As Long
    On Error GoTo Fehler
    aktiv = False
    nachKennzahl = False
    standLetzt = 0                                  ' neuer Durchgang: Stand der Zahl wieder mit heute vorschlagen
    modKarte.KartenEntfernen
    PersonenLesen
    ThisWorkbook.Worksheets("Start").Activate
    Set ws = ActiveSheet
    r = (nPers + 1 + 2) \ 3
    kb = 640
    kh = 150 + r * 50 + 60
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "WERTE EINTRAGEN  ·  BERICHTSTAG " & Format(modBasis.Berichtstag(), "dd.mm.yyyy"), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56 - 250, 26, "Wer bist du?", 16, True, modKarte.C_SW
    Umschalter ws, kx, ky, kb, False
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 30, _
        "Wähle deinen Namen. Danach siehst du, welche Werte für den Berichtstag noch fehlen, und der Assistent führt dich direkt in die richtigen Zellen.", _
        9.5, False, modKarte.C_GRAU, True
    b = (kb - 56 - 2 * 10) / 3
    For i = 1 To nPers + 1
        x = kx + 28 + ((i - 1) Mod 3) * (b + 10)
        y = ky + 112 + ((i - 1) \ 3) * 50
        If i <= nPers Then
            Zaehlen personen(i), offen, pflicht
            If pflicht = 0 Then
                zusatz = "keine Pflichtwerte": farbe = modKarte.C_GRAU
            ElseIf offen = 0 Then
                zusatz = "alles eingetragen": farbe = modKarte.C_GRUEN
            Else
                zusatz = offen & IIf(offen = 1, " Wert offen", " Werte offen"): farbe = modKarte.C_ROT
            End If
            modKarte.Chip ws, "P_" & Format(i, "00"), x, y, b, 40, personen(i), False, "modStart.KlickPerson", zusatz, farbe, True
        Else
            modKarte.Chip ws, "P_" & Format(i, "00"), x, y, b, 40, "Reporting", False, "modStart.KlickReporting", "Überblick, Kommentare, PowerPoint", modKarte.C_TEAL, True
        End If
    Next i
    modKarte.Knopf ws, "Abbrechen", kx + 20, ky + kh - 48, 100, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
    Exit Sub
Fehler:
    modKarte.Hinweis "Start", "Der Assistent konnte nicht starten: " & Err.Description, True
End Sub

Private Sub PersonenLesen()
    Dim wk As Worksheet, i As Long, t As String
    Set wk = ThisWorkbook.Worksheets("Konfiguration")
    nPers = 0
    ReDim personen(1 To 30)
    For i = 0 To 29
        t = Trim$(CStr(wk.Cells(28 + i, 2).Value))
        If Len(t) > 0 Then
            nPers = nPers + 1
            personen(nPers) = t
        End If
    Next i
End Sub

' offene und gesamte Pflichtwerte einer Person (leerer Name = alle)
Private Sub Zaehlen(nm As String, ByRef offen As Long, ByRef pflicht As Long)
    Dim wz As Worksheet, r As Long, c As Long, wr As Worksheet
    Set wz = ThisWorkbook.Worksheets("Zuständigkeiten")
    offen = 0: pflicht = 0
    Application.Calculate
    For r = modBasis.ZU_START To modBasis.ZuLetzteZeile()
        If modBasis.ZuWertzeile(r) And LCase$(Trim$(CStr(wz.Cells(r, 6).Value))) = "ja" Then
            If Len(nm) = 0 Or modBasis.PersonPasst(CStr(wz.Cells(r, 5).Value), nm) Then
                pflicht = pflicht + 1
                If Not modBasis.ZuErledigt(r) Then offen = offen + 1      ' Status mit Zyklus (Spalte H)
            End If
        End If
    Next r
    Dim teil As Variant
    For Each teil In Array("7V", "7O")
        If Len(nm) = 0 Or BueZustaendig(nm, CStr(teil)) Then
            pflicht = pflicht + 1
            If Not BueOk(CStr(teil)) Then offen = offen + 1
        End If
    Next teil
End Sub

' Pruefen ohne Dialog: offene und gesamte Pflichtwerte einer Person (leer = alle) wie im Assistenten -> "offen/pflicht"
Public Function PflichtZaehlen(nm As String) As String
    Dim offen As Long, pflicht As Long
    Zaehlen nm, offen, pflicht
    PflichtZaehlen = offen & "/" & pflicht
End Function

' ---------------------------------------------------------------- BUE: automatisch aus dem BUE-Reporting
' KW des Berichtstags fuer BUE Verbund ("7V") bzw. OPAG ("7O") da?
Private Function BueOk(teil As String) As Boolean
    On Error Resume Next
    BueOk = (Val(CStr(ThisWorkbook.Names("BUE_" & Mid$(teil, 2, 1) & "_OK").RefersToRange.Value)) = 1)
    On Error GoTo 0
End Function

Private Function BueText(teil As String) As String
    On Error Resume Next
    BueText = CStr(ThisWorkbook.Names("BUE_" & Mid$(teil, 2, 1) & "_TEXT").RefersToRange.Value)
    On Error GoTo 0
End Function

Private Function BueName(teil As String) As String
    BueName = IIf(teil = "7V", "BÜ Verbund", "BÜ OPAG")
End Function

' Hat die Person einen Punkt auf einer BUE-Zeile (Code 7VA..7VL bzw. 7OA..7OL) in Zustaendigkeiten?
Private Function BueZustaendig(nm As String, teil As String) As Boolean
    Dim wz As Worksheet, r As Long, cd As String
    Set wz = ThisWorkbook.Worksheets("Zuständigkeiten")
    For r = modBasis.ZU_START To modBasis.ZuLetzteZeile()
        cd = UCase$(Trim$(CStr(wz.Cells(r, 2).Value)))
        If Len(cd) = 3 Then
            If Left$(cd, 2) = teil Then
                If modBasis.PersonPasst(CStr(wz.Cells(r, 5).Value), nm) Then
                    BueZustaendig = True
                    Exit Function
                End If
            End If
        End If
    Next r
End Function

' Zustaendige fuer BUE (Text aus Spalte E der ersten BUE-Zeile mit Personen)
Private Function BueWer(teil As String) As String
    Dim wz As Worksheet, r As Long, cd As String, t As String
    Set wz = ThisWorkbook.Worksheets("Zuständigkeiten")
    For r = modBasis.ZU_START To modBasis.ZuLetzteZeile()
        cd = UCase$(Trim$(CStr(wz.Cells(r, 2).Value)))
        If Len(cd) = 3 Then
            If Left$(cd, 2) = teil Then
                t = Trim$(CStr(wz.Cells(r, 5).Value))
                If Len(t) > 0 Then
                    BueWer = t
                    Exit Function
                End If
            End If
        End If
    Next r
End Function

Public Sub KlickPerson()
    Dim n As Long
    n = modKarte.KlickNummer()
    If n < 1 Or n > nPers Then Exit Sub
    gewaehlt = personen(n)
    modKarte.Planen "modStart.PersonGewaehlt"
End Sub

Public Sub KlickZurueck()
    modKarte.Planen "modStart.Start"
End Sub

Public Sub KlickReporting()
    modKarte.Planen "modStart.ReportingZeigen"
End Sub

' ---------------------------------------------------------------- Schritt 2: offene Werte der Person
Private Sub ListeBauen()
    Dim wz As Worksheet, wr As Worksheet, r As Long, c As Long, zr As Long, passt As Boolean
    Set wz = ThisWorkbook.Worksheets("Zuständigkeiten")
    Set wr = ThisWorkbook.Worksheets("Rohdaten")
    c = modBasis.BerichtsSpalte()
    nOffen = 0: nErledigt = 0
    ReDim zeilen(1 To 400): ReDim texte(1 To 400): ReDim codes(1 To 400): ReDim wers(1 To 400)
    ReDim spalten(1 To 400): ReDim zuZ(1 To 400)
    Application.Calculate
    Dim teil As Variant
    For Each teil In Array("7V", "7O")                           ' BUE: automatisch, zaehlt bei der zustaendigen Person
        passt = nachKennzahl
        If Not passt Then passt = BueZustaendig(gewaehlt, CStr(teil))
        If passt Then
            If BueOk(CStr(teil)) Then
                nErledigt = nErledigt + 1
            Else
                nOffen = nOffen + 1
                zeilen(nOffen) = IIf(teil = "7V", -1, -2)
                codes(nOffen) = CStr(teil)
                texte(nOffen) = BueName(CStr(teil)) & " · automatisch aus dem BÜ-Reporting"
                wers(nOffen) = BueWer(CStr(teil))
            End If
        End If
    Next teil
    For r = modBasis.ZU_START To modBasis.ZuLetzteZeile()
        If Not modBasis.ZuWertzeile(r) Then GoTo Weiter
        passt = nachKennzahl
        If Not passt Then passt = modBasis.PersonPasst(CStr(wz.Cells(r, 5).Value), gewaehlt)
        If LCase$(Trim$(CStr(wz.Cells(r, 6).Value))) = "ja" And passt Then
            zr = CLng(wz.Cells(r, 1).Value)
            If modBasis.ZuErledigt(r) Then                       ' Status mit Zyklus (Spalte H): Woche, Vormonat, Vorquartal
                nErledigt = nErledigt + 1
            ElseIf nOffen < 400 Then
                nOffen = nOffen + 1
                zeilen(nOffen) = zr
                zuZ(nOffen) = r
                spalten(nOffen) = modBasis.ZielSpalte(zr, modBasis.ZuZyklus(r))
                codes(nOffen) = Trim$(CStr(wz.Cells(r, modBasis.ZU_CODE).Value))       ' eigener Code oder der der Kategorie
                texte(nOffen) = Trim$(CStr(wz.Cells(r, modBasis.ZU_VOLL).Value))       ' Thema · Kategorie · Abteilung
                wers(nOffen) = Trim$(CStr(wz.Cells(r, 5).Value))
            End If
        End If
Weiter:
    Next r
End Sub

Private Sub ZeileListe(ws As Worksheet, i As Long, x As Single, y As Single, b As Single, code As String, text As String)
    With ws.Shapes.AddShape(5, x, y + 4, 46, 18)
        .Name = modKarte.PRAEFIX & "LC" & Format(i, "00")
        .Adjustments(1) = 0.3
        modKarte.Fuellen ws.Shapes(modKarte.PRAEFIX & "LC" & Format(i, "00")), RGB(204, 235, 237)
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
        With .TextFrame2
            .MarginLeft = 2: .MarginRight = 2: .MarginTop = 0: .MarginBottom = 0
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = code
            .TextRange.Font.Name = "Liberation Sans"
            .TextRange.Font.Size = 9
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = modKarte.C_TEAL
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
    modKarte.Beschriftung ws, "LT" & Format(i, "00"), x + 58, y + 4, b - 58, 18, text, 9.5, False, modKarte.C_SW
    With ws.Shapes.AddShape(1, x, y + 25.5, b, 0.5)
        .Name = modKarte.PRAEFIX & "LL" & Format(i, "00")
        modKarte.Fuellen ws.Shapes(modKarte.PRAEFIX & "LL" & Format(i, "00")), modKarte.C_GRAUL
        .Line.Visible = msoFalse
        .OnAction = "modKarte.Nichts"
    End With
End Sub

Public Sub PersonGewaehlt()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, n As Long
    On Error GoTo Fehler
    nachKennzahl = False
    modKarte.KartenEntfernen
    ListeBauen
    Set ws = ThisWorkbook.Worksheets("Start")
    ws.Activate
    kb = 600
    If modBasis.BerichtsSpalte() = 0 Then
        modKarte.Hinweis "Keine Spalte für den Berichtstag", "In Rohdaten gibt es keine Spalte für den Stichtag " & Format(modBasis.Stichtag(), "dd.mm.yyyy") & " (Berichtstag " & Format(modBasis.Berichtstag(), "dd.mm.yyyy") & ")" & _
            ". Bitte den Berichtstag auf der Startseite prüfen (Pfeile oder „Automatisch“).", True
        Exit Sub
    End If
    If nOffen = 0 Then
        kh = 210
        modKarte.KarteModal ws, kb, kh, kx, ky
        modKarte.Haken ws, kx + 28, ky + 28
        modKarte.Beschriftung ws, "Frage", kx + 84, ky + 30, kb - 112, 24, "Alles da, " & gewaehlt & ".", 16, True, modKarte.C_SW
        modKarte.Beschriftung ws, "Text", kx + 84, ky + 60, kb - 112, 60, _
            "Für den Berichtstag " & modKarte.DatumLang(modBasis.Berichtstag()) & " sind alle " & nErledigt & " Pflichtwerte eingetragen. Danke!", 10, False, modKarte.C_GRAU, True
        modKarte.Knopf ws, "Schliessen", kx + kb - 28 - 120, ky + kh - 48, 120, 30, "Schließen", 1, "modKarte.KlickSchliessen"
        modKarte.Knopf ws, "Zurueck", kx + 20, ky + kh - 48, 90, 30, "Zurück", 3, "modStart.KlickZurueck"
        Exit Sub
    End If
    n = nOffen
    If n > 12 Then n = 12
    kh = 160 + (n + IIf(nOffen > 12, 1, 0)) * 26 + 60
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "WERTE EINTRAGEN  ·  " & UCase$(gewaehlt), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Hallo " & gewaehlt & ", es fehlen noch " & nOffen & _
        IIf(nOffen = 1, " Wert.", " Werte."), 16, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 18, "Berichtstag " & modKarte.DatumLang(modBasis.Berichtstag()) & _
        IIf(nErledigt > 0, "  ·  bereits eingetragen: " & nErledigt, ""), 9.5, False, modKarte.C_GRAU
    ' je offener Wert eine Zeile: Code-Feld, Kennzahl, feine Trennlinie
    For i = 1 To n
        ZeileListe ws, i, kx + 28, ky + 100 + (i - 1) * 26, kb - 56, codes(i), texte(i)
    Next i
    If nOffen > 12 Then modKarte.Beschriftung ws, "Mehr", kx + 28 + 60, ky + 100 + n * 26 + 4, kb - 116, 16, _
        "… und " & (nOffen - 12) & " weitere", 9, False, modKarte.C_GRAU
    modKarte.Knopf ws, "Los", kx + kb - 28 - 170, ky + kh - 48, 170, 30, "Eintragen starten", 1, "modStart.KlickEintragen"
    modKarte.Knopf ws, "Zurueck", kx + 20, ky + kh - 48, 90, 30, "Zurück", 3, "modStart.KlickZurueck"
    Exit Sub
Fehler:
    modKarte.Hinweis "Start", "Fehler beim Lesen der offenen Werte: " & Err.Description, True
End Sub

' ---------------------------------------------------------------- Schritt 3: durch die Zellen fuehren
Public Sub KlickEintragen()
    modKarte.Planen "modStart.EintragenStarten"
End Sub

Public Sub EintragenStarten()
    aktiv = True
    pos = 1
    Gehe
End Sub

Private Sub Gehe()
    Dim wr As Worksheet, c As Long, zelle As Range, kx As Single, ky As Single, kb As Single, kh As Single, sichtbar As Range
    Dim wertText As String, standText As String
    modKarte.KartenEntfernen
    wertText = vorgabeWert: standText = vorgabeStand          ' nur fuer diese Karte; danach wieder leer
    vorgabeWert = "": vorgabeStand = ""
    If Len(standText) = 0 Then
        If standLetzt > 0 Then standText = Format(standLetzt, "dd.mm.yyyy") Else standText = Format(Date, "dd.mm.yyyy")
    End If
    Set wr = ThisWorkbook.Worksheets("Rohdaten")
    Application.Calculate
    Do While pos <= nOffen
        If zeilen(pos) < 0 Then                                  ' BUE: offen, solange die KW des Berichtstags fehlt
            If Not BueOk(codes(pos)) Then Exit Do
        ElseIf spalten(pos) > 0 Then                             ' ohne Spalte (Berichtstag bzw. Monat fehlt): uebergehen
            If Not modBasis.ZuErledigt(zuZ(pos)) Then Exit Do
        End If
        pos = pos + 1
    Loop
    If pos > nOffen Then
        Abschluss
        Exit Sub
    End If
    If zeilen(pos) < 0 Then
        GeheBue
        Exit Sub
    End If
    wr.Activate
    c = spalten(pos)
    Set zelle = wr.Cells(zeilen(pos), c)
    If zelle.EntireRow.Hidden Then zelle.EntireRow.Hidden = False
    On Error Resume Next
    ActiveWindow.ScrollColumn = IIf(c - 3 > 9, c - 3, 9)
    ActiveWindow.ScrollRow = IIf(zeilen(pos) - 6 > 3, zeilen(pos) - 6, 3)
    On Error GoTo 0
    zelle.Select
    With wr.Shapes.AddShape(1, zelle.Left - 1.5, zelle.Top - 1.5, zelle.Width + 3, zelle.Height + 3)
        .Name = modKarte.PRAEFIX & "Markierung"
        .Fill.Visible = msoFalse
        modKarte.Rand wr.Shapes(modKarte.PRAEFIX & "Markierung"), modKarte.C_ROT, 2.25
    End With
    ' Karte rechts im sichtbaren Bereich: Kennzahl, Vorwoche, Eingabefelder Wert und Stand der Zahl; eingetippt wird hier,
    ' nicht in der Zelle
    Set sichtbar = ActiveWindow.VisibleRange
    kb = 330: kh = 320
    kx = sichtbar.Left + sichtbar.Width - kb - 24
    If kx < zelle.Left + zelle.Width + 20 Then kx = zelle.Left + zelle.Width + 20
    ky = sichtbar.Top + 12
    modKarte.Karte wr, kx, ky, kb, kh
    modKarte.Beschriftung wr, "Schritt", kx + 20, ky + 16, kb - 40, 12, "WERT " & pos & " VON " & nOffen & "  ·  " & _
        Kurz(UCase$(IIf(nachKennzahl, IIf(Len(wers(pos)) > 0, wers(pos), "ohne Zuständigkeit"), gewaehlt)), 34), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung wr, "Code", kx + 20, ky + 34, kb - 40, 14, codes(pos), 9, True, modKarte.C_GRAU
    modKarte.Beschriftung wr, "Was", kx + 20, ky + 50, kb - 40, 40, texte(pos), 11, True, modKarte.C_SW, True
    modKarte.Beschriftung wr, "Vorwoche", kx + 20, ky + 96, kb - 40, 14, Vorwoche(zeilen(pos), c), 9, False, modKarte.C_GRAU
    modKarte.Beschriftung wr, "LWert", kx + 20, ky + 118, kb - 40, 12, "WERT FÜR " & UCase$(modBasis.ZielText(zeilen(pos), modBasis.ZuZyklus(zuZ(pos)))), 7.5, True, modKarte.C_GRAU
    modKarte.Eingabefeld wr, "ed_wert", kx + 20, ky + 132, kb - 40, 30, wertText, 14
    ' Stand der Zahl: Tag, zu dem die Zahl gilt (landet im Blatt Wertstand, die Kacheln zeigen ihn als "Stand: ...")
    modKarte.Beschriftung wr, "LStand", kx + 20, ky + 172, kb - 40, 12, "STAND DER ZAHL (TT.MM.JJJJ)", 7.5, True, modKarte.C_GRAU
    modKarte.Eingabefeld wr, "ed_stand", kx + 20, ky + 186, 120, 30, standText, 12
    modKarte.Beschriftung wr, "StandHilfe", kx + 20 + 132, ky + 186, kb - 40 - 132, 30, "Tag, zu dem die Zahl gilt", 8.5, False, modKarte.C_GRAU
    If Len(meldung) > 0 Then modKarte.Beschriftung wr, "Meldung", kx + 20, ky + 222, kb - 40, 26, meldung, 8.5, True, modKarte.C_ROT, True
    modKarte.Beschriftung wr, "Wie", kx + 20, ky + 252, kb - 40, 14, "Zahl direkt tippen und Enter (z. B. 1.234 oder 12,5) – oder ins Feld und „Übernehmen“.", 8.5, False, modKarte.C_GRAU
    modKarte.Knopf wr, "Uebernehmen", kx + kb - 20 - 120, ky + kh - 44, 120, 28, "Übernehmen", 1, "modStart.KlickUebernehmen"
    modKarte.Knopf wr, "Ueberspringen", kx + kb - 20 - 120 - 10 - 100, ky + kh - 44, 100, 28, "Überspringen", 2, "modStart.KlickWeiter"
    modKarte.Knopf wr, "Beenden", kx + 10, ky + kh - 44, 70, 28, "Beenden", 3, "modStart.KlickBeenden"
    meldung = ""
    zelle.Select                                             ' sofort lostippen: in die Zelle, Enter uebernimmt (Rohdaten.Worksheet_Change)
End Sub

' Wert direkt in der markierten Zelle eingegeben (Rohdaten.Worksheet_Change): wie „Übernehmen“, Stand aus dem Feld der Karte
Public Sub ZellEingabe(ziel As Range)
    Dim wr As Worksheet, ts As String, ok As Boolean, stand As Date, v As Variant
    If Not aktiv Then Exit Sub
    If ziel.CountLarge <> 1 Then Exit Sub
    If pos < 1 Or pos > nOffen Then Exit Sub
    If zeilen(pos) < 0 Then Exit Sub
    If ziel.Row <> zeilen(pos) Or ziel.Column <> spalten(pos) Then Exit Sub
    Set wr = ziel.Worksheet
    If Not KarteOffen(wr) Then aktiv = False: Exit Sub        ' Assistent laengst geschlossen: Eingabe von Hand, nichts tun
    v = ziel.Value
    If IsEmpty(v) Then Exit Sub                              ' geleert: nichts zu tun
    If Not modBasis.WertDa(v) Or VarType(v) = vbDate Then
        On Error Resume Next
        Application.EnableEvents = False
        ziel.ClearContents
        If VarType(v) = vbDate Then ziel.NumberFormat = ziel.Offset(0, -2).NumberFormat   ' „12.5“ hatte Excel als Datum gelesen
        Application.EnableEvents = True
        On Error GoTo 0
        If VarType(v) = vbDate Then
            meldung = "Excel hat die Eingabe als Datum gelesen. Bitte Komma als Dezimalzeichen (z. B. 12,5), Punkt nur als Tausendertrenner."
        Else
            meldung = "„" & CStr(v) & "“ ist keine Zahl. Bitte nur Ziffern, Punkt als Tausendertrenner, Komma als Dezimalzeichen."
        End If
        modKarte.Planen "modStart.NeuZeigen"
        Exit Sub
    End If
    ts = Trim$(Replace(modKarte.FeldText(wr, "ed_stand"), vbLf, ""))
    stand = modBasis.DatumLesen(ts, ok)
    If Len(ts) = 0 Or Not ok Then
        vorgabeWert = CStr(v)
        Application.EnableEvents = False
        ziel.ClearContents
        Application.EnableEvents = True
        meldung = "Bitte den Stand der Zahl als TT.MM.JJJJ eintragen (z. B. " & Format(Date, "dd.mm.yyyy") & "), dann „Übernehmen“."
        modKarte.Planen "modStart.NeuZeigen"
        Exit Sub
    End If
    StandSchreiben zeilen(pos), spalten(pos), stand
    standLetzt = stand
    vorgabeWert = "": vorgabeStand = ""
    pos = pos + 1
    modKarte.Planen "modStart.NeuZeigen"                     ' Formen nicht im Ereignis neu zeichnen, sondern gleich danach
End Sub

Public Sub NeuZeigen()
    Gehe
End Sub

' Steht die Eingabekarte des Assistenten auf dem Blatt?
Private Function KarteOffen(ws As Worksheet) As Boolean
    Dim s As Object
    On Error Resume Next
    Set s = ws.Shapes(modKarte.PRAEFIX & "ed_stand")
    KarteOffen = Not s Is Nothing
End Function

' Karte fuer einen offenen BUE-Eintrag: nichts einzutippen, die Werte kommen aus dem BUE-Reporting
Private Sub GeheBue()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, teil As String
    teil = codes(pos)
    Set ws = ThisWorkbook.Worksheets("Start")
    ws.Activate
    kb = 520: kh = 268
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Schritt", kx + 28, ky + 20, kb - 56, 12, "WERT " & pos & " VON " & nOffen & "  ·  " & _
        Kurz(UCase$(IIf(nachKennzahl, IIf(Len(wers(pos)) > 0, wers(pos), "ohne Zuständigkeit"), gewaehlt)), 34), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Was", kx + 28, ky + 40, kb - 56, 24, BueName(teil) & " fehlt für den Berichtstag", 15, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Stand", kx + 28, ky + 70, kb - 56, 16, BueText(teil), 9.5, True, modKarte.C_ROT
    modKarte.Beschriftung ws, "Wie", kx + 28, ky + 96, kb - 56, 96, _
        "Die BÜ-Werte kommen automatisch aus dem BÜ-Reporting – hier ist nichts einzutippen. " & _
        "Fehlt die KW: im BÜ-Reporting „Neue Daten laden“ und speichern, danach hier „Jetzt aktualisieren“ " & _
        "(liest die Verknüpfung neu). Beim nächsten Öffnen dieser Datei geht das auch über „Aktualisieren“.", 9.5, False, modKarte.C_GRAU, True
    If Len(meldung) > 0 Then modKarte.Beschriftung ws, "Meldung", kx + 28, ky + 194, kb - 56, 26, meldung, 8.5, True, modKarte.C_ROT, True
    modKarte.Knopf ws, "Aktualisieren", kx + kb - 28 - 160, ky + kh - 48, 160, 30, "Jetzt aktualisieren", 1, "modStart.KlickBueAktualisieren"
    modKarte.Knopf ws, "Ueberspringen", kx + kb - 28 - 160 - 10 - 90, ky + kh - 48, 90, 30, "Weiter", 2, "modStart.KlickWeiter"
    modKarte.Knopf ws, "Beenden", kx + 20, ky + kh - 48, 80, 30, "Beenden", 3, "modStart.KlickBeenden"
    meldung = ""
End Sub

Public Sub KlickBueAktualisieren()
    modKarte.Planen "modStart.BueAktualisieren"
End Sub

' Verknuepfung(en) zum BUE-Reporting neu lesen und neu rechnen; danach weiter wie vorher (ist die KW jetzt da, geht es zum
' naechsten offenen Wert)
Public Sub BueAktualisieren()
    Dim quellen As Variant, i As Long, teil As String
    teil = codes(pos)
    On Error Resume Next
    quellen = ThisWorkbook.LinkSources(1)                        ' 1 = xlExcelLinks
    If IsArray(quellen) Then
        For i = LBound(quellen) To UBound(quellen)
            ThisWorkbook.UpdateLink Name:=quellen(i), Type:=1
        Next i
    End If
    Application.Calculate
    On Error GoTo 0
    If Not IsArray(quellen) Then
        meldung = "Keine Verknüpfung zum BÜ-Reporting gefunden – bitte auf der Startseite „BÜ-Datei verknüpfen“."
    ElseIf Not BueOk(teil) Then
        meldung = "Nach dem Aktualisieren fehlt die KW weiterhin – bitte zuerst das BÜ-Reporting neu laden und speichern."
    End If
    Gehe
End Sub

' Wert der Vorwoche bzw. des Vormonats (vorige Datumsspalte in der Kopfzeile des Blocks) als Orientierung
Private Function Vorwoche(zeile As Long, c As Long) As String
    Dim wr As Worksheet, k As Long, v As Variant, kopf As Long, was As String, wann As String
    Set wr = ThisWorkbook.Worksheets("Rohdaten")
    kopf = modBasis.KopfZeile(zeile)
    For k = c - 1 To 9 Step -1
        v = wr.Cells(kopf, k).Value2
        If IsNumeric(v) And Not IsEmpty(v) Then
            If kopf = 1 Then
                was = "Vorwoche": wann = Format(CDate(v), "dd.mm.")
            Else
                was = "Vormonat": wann = modBasis.MonatName(CDate(v))
            End If
            If modBasis.WertDa(wr.Cells(zeile, k).Value) Then
                Vorwoche = was & " (" & wann & "): " & Format(wr.Cells(zeile, k).Value, "#,##0.##")
            Else
                Vorwoche = was & " (" & wann & "): kein Wert"
            End If
            If Right$(Vorwoche, 1) = "," Or Right$(Vorwoche, 1) = "." Then Vorwoche = Left$(Vorwoche, Len(Vorwoche) - 1)
            Exit Function
        End If
    Next k
End Function

Public Sub KlickUebernehmen()
    modKarte.Planen "modStart.Uebernehmen"
End Sub

Public Sub Uebernehmen()
    Dim wr As Worksheet, c As Long, t As String, ok As Boolean, wert As Double, ts As String, stand As Date
    Set wr = ThisWorkbook.Worksheets("Rohdaten")
    c = spalten(pos)
    t = Trim$(Replace(modKarte.FeldText(wr, "ed_wert"), vbLf, ""))
    ts = Trim$(Replace(modKarte.FeldText(wr, "ed_stand"), vbLf, ""))
    vorgabeWert = t: vorgabeStand = ts                       ' bei einer Meldung bleiben beide Eingaben im Feld
    If Len(t) = 0 Then
        meldung = "Bitte einen Wert eintragen – oder „Überspringen“, wenn er noch fehlt."
        Gehe
        Exit Sub
    End If
    wert = modBasis.ZahlLesen(t, ok)
    If Not ok Then
        meldung = "„" & t & "“ ist keine Zahl. Bitte nur Ziffern, Punkt als Tausendertrenner, Komma als Dezimalzeichen."
        Gehe
        Exit Sub
    End If
    If Len(ts) = 0 Then
        meldung = "Bitte den Stand der Zahl eintragen (Datum TT.MM.JJJJ, z. B. " & Format(Date, "dd.mm.yyyy") & ")."
        Gehe
        Exit Sub
    End If
    stand = modBasis.DatumLesen(ts, ok)
    If Not ok Then
        If stand > Date + 1 Then
            meldung = "Der Stand " & Format(stand, "dd.mm.yyyy") & " liegt in der Zukunft. Bitte das Datum angeben, zu dem die Zahl gilt."
        Else
            meldung = "„" & ts & "“ ist kein gültiges Datum. Bitte als TT.MM.JJJJ eintragen, z. B. " & Format(Date, "dd.mm.yyyy") & "."
        End If
        Gehe
        Exit Sub
    End If
    vorgabeWert = "": vorgabeStand = ""
    Application.EnableEvents = False                         ' kein zweites Weiterschalten ueber ZellEingabe
    On Error Resume Next
    wr.Cells(zeilen(pos), c).Value = wert
    Application.EnableEvents = True
    On Error GoTo 0
    StandSchreiben zeilen(pos), c, stand
    standLetzt = stand
    pos = pos + 1
    Gehe
End Sub

' Stand der Zahl in das ausgeblendete Blatt Wertstand (gleiche Zeile und Spalte wie in Rohdaten). Aeltere Dateien ohne das
' Blatt: still uebergehen, die Zahl steht trotzdem in Rohdaten.
Private Sub StandSchreiben(r As Long, c As Long, d As Date)
    Dim wst As Worksheet
    On Error Resume Next
    Set wst = ThisWorkbook.Worksheets("Wertstand")
    If Not wst Is Nothing Then
        wst.Cells(r, c).NumberFormat = "dd.mm.yyyy"
        wst.Cells(r, c).Value = d
    End If
    On Error GoTo 0
End Sub

Public Sub ZurZuordnung()
    modKarte.KartenEntfernen
    ThisWorkbook.Worksheets("Zuständigkeiten").Activate
End Sub

Public Sub KlickWeiter()
    modKarte.Planen "modStart.Weiter"
End Sub

Public Sub Weiter()
    pos = pos + 1
    Gehe
End Sub

Public Sub KlickBeenden()
    modKarte.Planen "modStart.Abschluss"
End Sub

Public Sub Abschluss()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, offen As Long, pflicht As Long
    aktiv = False
    If nachKennzahl Then
        KennzahlenZeigen
        Exit Sub
    End If
    modKarte.KartenEntfernen
    Zaehlen gewaehlt, offen, pflicht
    Set ws = ThisWorkbook.Worksheets("Start")
    ws.Activate
    kb = 520: kh = 200
    modKarte.KarteModal ws, kb, kh, kx, ky
    If offen = 0 Then
        modKarte.Haken ws, kx + 28, ky + 28
        modKarte.Beschriftung ws, "Frage", kx + 84, ky + 30, kb - 112, 24, "Danke, " & gewaehlt & "!", 16, True, modKarte.C_SW
        modKarte.Beschriftung ws, "Text", kx + 84, ky + 60, kb - 112, 60, "Alle " & pflicht & " Werte für den Berichtstag " & _
            Format(modBasis.Berichtstag(), "dd.mm.yyyy") & " sind eingetragen.", 10, False, modKarte.C_GRAU, True
        modKarte.Knopf ws, "Schliessen", kx + kb - 28 - 120, ky + kh - 48, 120, 30, "Schließen", 1, "modKarte.KlickSchliessen"
    Else
        modKarte.Beschriftung ws, "Frage", kx + 28, ky + 30, kb - 56, 24, "Noch " & offen & IIf(offen = 1, " Wert offen", " Werte offen"), 16, True, modKarte.C_ROT
        modKarte.Beschriftung ws, "Text", kx + 28, ky + 60, kb - 56, 60, "Du kannst jederzeit weitermachen: Start klicken und deinen Namen wählen. " & _
            "Eingetragen sind " & (pflicht - offen) & " von " & pflicht & ".", 10, False, modKarte.C_GRAU, True
        modKarte.Knopf ws, "Weiter", kx + kb - 28 - 160, ky + kh - 48, 160, 30, "Weiter eintragen", 1, "modStart.PersonGewaehltGeplant"
        modKarte.Knopf ws, "Schliessen", kx + 20, ky + kh - 48, 90, 30, "Schließen", 3, "modKarte.KlickSchliessen"
    End If
End Sub

Public Sub PersonGewaehltGeplant()
    modKarte.Planen "modStart.PersonGewaehlt"
End Sub

' ---------------------------------------------------------------- Reporting: Ueberblick
Public Sub ReportingZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, offen As Long, pflicht As Long
    Dim zeilenText As String, n As Long, gesOffen As Long, gesPflicht As Long
    modKarte.KartenEntfernen
    PersonenLesen
    Set ws = ThisWorkbook.Worksheets("Start")
    ws.Activate
    For i = 1 To nPers
        Zaehlen personen(i), offen, pflicht
        If offen > 0 Then
            n = n + 1
            If n <= 12 Then zeilenText = zeilenText & IIf(n > 1, vbCr, "") & personen(i) & ":  " & offen & " offen (von " & pflicht & ")"
        End If
    Next i
    Zaehlen "", gesOffen, gesPflicht
    If n = 0 Then zeilenText = "Alle Pflichtwerte für den Berichtstag sind eingetragen."
    If n > 12 Then zeilenText = zeilenText & vbCr & "… und " & (n - 12) & " weitere"
    kb = 560
    kh = 190 + IIf(n = 0, 1, IIf(n > 12, 13, n)) * 15 + 30
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "REPORTING  ·  BERICHTSTAG " & Format(modBasis.Berichtstag(), "dd.mm.yyyy"), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, (gesPflicht - gesOffen) & " von " & gesPflicht & " Pflichtwerten eingetragen", 16, True, modKarte.C_SW
    modKarte.Beschriftung ws, "Text", kx + 28, ky + 70, kb - 56, 20, IIf(n = 0, "Alles da – jetzt Kommentare pflegen und die PowerPoint erzeugen.", "Es fehlen noch Werte von:"), 9.5, False, modKarte.C_GRAU
    modKarte.Pille ws, "Liste", kx + 28, ky + 96, kb - 56, IIf(n = 0, 1, IIf(n > 12, 13, n)) * 15 + 16, zeilenText, IIf(n = 0, modKarte.C_GRUENH, modKarte.C_GRAUXL), modKarte.C_SW
    modKarte.Knopf ws, "PPT", kx + kb - 28 - 180, ky + kh - 48, 180, 30, "PowerPoint erzeugen", 4, "modStart.KlickPPT"
    modKarte.Knopf ws, "Kommentare", kx + kb - 28 - 180 - 12 - 150, ky + kh - 48, 150, 30, "Kommentare", 2, "modStart.KlickKommentare"
    modKarte.Knopf ws, "Schliessen", kx + 20, ky + kh - 48, 90, 30, "Schließen", 3, "modKarte.KlickSchliessen"
End Sub

Public Sub KlickPPT()
    modKarte.Planen "modPPT.Zeigen"
End Sub

Public Sub KlickKommentare()
    modKarte.Planen "modKommentar.ZeigenAuswahl"
End Sub

' ---------------------------------------------------------------- Umschalter und Kennzahlen-Sicht
Private Sub Umschalter(ws As Worksheet, kx As Single, ky As Single, kb As Single, kennzahl As Boolean)
    modKarte.Chip ws, "S_01", kx + kb - 28 - 238, ky + 38, 114, 28, "Nach Person", Not kennzahl, IIf(kennzahl, "modStart.KlickPersonen", "modKarte.Nichts")
    modKarte.Chip ws, "S_02", kx + kb - 28 - 118, ky + 38, 118, 28, "Nach Kennzahl", kennzahl, IIf(kennzahl, "modKarte.Nichts", "modStart.KlickKennzahlen")
End Sub

Public Sub KlickKennzahlen()
    seite = 1
    modKarte.Planen "modStart.KennzahlenZeigen"
End Sub

Public Sub KlickPersonen()
    modKarte.Planen "modStart.Start"
End Sub

Public Sub KlickSeiteVor()
    seite = seite + 1
    modKarte.Planen "modStart.KennzahlenZeigen"
End Sub

Public Sub KlickSeiteZurueck()
    If seite > 1 Then seite = seite - 1
    modKarte.Planen "modStart.KennzahlenZeigen"
End Sub

Private Function Kurz(t As String, n As Long) As String
    If Len(t) > n Then
        Kurz = Left$(t, n - 1) & ChrW(8230)
    Else
        Kurz = t
    End If
End Function

Public Sub KennzahlenZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, n As Long, erste As Long, seiten As Long
    Dim y As Single, k As Long
    On Error GoTo Fehler
    aktiv = False
    nachKennzahl = True
    modKarte.KartenEntfernen
    Set ws = ThisWorkbook.Worksheets("Start")
    ws.Activate
    If modBasis.BerichtsSpalte() = 0 Then
        modKarte.Hinweis "Keine Spalte für den Berichtstag", "In Rohdaten gibt es keine Spalte für den Stichtag " & Format(modBasis.Stichtag(), "dd.mm.yyyy") & " (Berichtstag " & Format(modBasis.Berichtstag(), "dd.mm.yyyy") & ")" & _
            ". Bitte den Berichtstag auf der Startseite prüfen (Pfeile oder „Automatisch“).", True
        Exit Sub
    End If
    ListeBauen
    seiten = (nOffen + JE_SEITE - 1) \ JE_SEITE
    If seiten < 1 Then seiten = 1
    If seite > seiten Then seite = seiten
    If seite < 1 Then seite = 1
    erste = (seite - 1) * JE_SEITE + 1
    n = nOffen - erste + 1
    If n > JE_SEITE Then n = JE_SEITE
    If n < 0 Then n = 0
    kb = 760
    kh = 168 + IIf(nOffen = 0, 30, IIf(seiten > 1, JE_SEITE, n) * 28) + 64
    modKarte.KarteModal ws, kb, kh, kx, ky
    modKarte.Beschriftung ws, "Kopf", kx + 28, ky + 20, kb - 56, 14, "WERTE EINTRAGEN  ·  BERICHTSTAG " & Format(modBasis.Berichtstag(), "dd.mm.yyyy"), 8, True, modKarte.C_TEAL
    modKarte.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56 - 250, 26, IIf(nOffen = 0, "Alle Kennzahlen sind da.", "Welche Kennzahlen fehlen noch?"), _
        16, True, modKarte.C_SW
    Umschalter ws, kx, ky, kb, True
    If nOffen = 0 Then
        modKarte.Beschriftung ws, "Text", kx + 28, ky + 76, kb - 56, 18, "Für den Berichtstag sind alle " & nErledigt & " Pflichtwerte eingetragen.", _
            9.5, False, modKarte.C_GRUEN
    Else
        modKarte.Beschriftung ws, "Text", kx + 28, ky + 76, kb - 56, 18, nOffen & " von " & (nOffen + nErledigt) & _
            " Pflichtwerten fehlen  ·  Klick auf eine Zeile springt in die Zelle", 9.5, False, modKarte.C_GRAU
        y = ky + 104
        modKarte.Beschriftung ws, "HCode", kx + 28, y, 60, 12, "CODE", 7.5, True, modKarte.C_GRAU
        modKarte.Beschriftung ws, "HText", kx + 28 + 58, y, 300, 12, "KENNZAHL", 7.5, True, modKarte.C_GRAU
        modKarte.Beschriftung ws, "HWer", kx + kb - 28 - 200, y, 200, 12, "ZUSTÄNDIG", 7.5, True, modKarte.C_GRAU
        For i = 1 To n
            k = erste + i - 1
            ZeileKennzahl ws, i, kx + 28, y + 14 + (i - 1) * 28, kb - 56, codes(k), texte(k), wers(k)
        Next i
        If seiten > 1 Then
            y = ky + kh - 48
            modKarte.Beschriftung ws, "Seite", kx + kb / 2 - 60, y + 8, 120, 14, "Seite " & seite & " von " & seiten, 9, False, modKarte.C_GRAU
            If seite > 1 Then modKarte.Knopf ws, "SZurueck", kx + kb / 2 - 60 - 110, y, 100, 30, ChrW(8249) & " Zurück", 2, "modStart.KlickSeiteZurueck"
            If seite < seiten Then modKarte.Knopf ws, "SVor", kx + kb / 2 + 70, y, 100, 30, "Weiter " & ChrW(8250), 2, "modStart.KlickSeiteVor"
        End If
    End If
    modKarte.Knopf ws, "Schliessen", kx + 20, ky + kh - 48, 90, 30, "Schließen", 3, "modKarte.KlickSchliessen"
    Exit Sub
Fehler:
    modKarte.Hinweis "Start", "Fehler beim Lesen der offenen Kennzahlen: " & Err.Description, True
End Sub

' Zeile der Kennzahlen-Sicht: Code-Feld, Kennzahl, Zustaendige, feine Trennlinie; die ganze Zeile ist klickbar
Private Sub ZeileKennzahl(ws As Worksheet, i As Long, x As Single, y As Single, b As Single, code As String, text As String, wer As String)
    Dim nm As String
    ZeileListe ws, i, x, y, b, code, Kurz(text, 78)
    ws.Shapes(modKarte.PRAEFIX & "LT" & Format(i, "00")).Width = b - 58 - 210
    modKarte.Beschriftung ws, "LW" & Format(i, "00"), x + b - 200, y + 4, 200, 18, Kurz(IIf(Len(wer) > 0, wer, "ohne Zuständigkeit"), 36), 9, False, _
        IIf(Len(wer) > 0, modKarte.C_GRAU, modKarte.C_ROT)
    nm = modKarte.PRAEFIX & "Z_" & Format(i, "00")
    With ws.Shapes.AddShape(1, x, y + 1, b, 25)
        .Name = nm
        modKarte.Fuellen ws.Shapes(nm), RGB(255, 255, 255), 1
        .Line.Visible = msoFalse
        .OnAction = "modStart.KlickKennzahl"
    End With
End Sub

Public Sub KlickKennzahl()
    Dim i As Long
    i = modKarte.KlickNummer()
    If i < 1 Then Exit Sub
    pos = (seite - 1) * JE_SEITE + i
    modKarte.Planen "modStart.KennzahlEintragen"
End Sub

Public Sub KennzahlEintragen()
    nachKennzahl = True
    ListeBauen
    If pos < 1 Or pos > nOffen Then pos = 1
    aktiv = True
    Gehe
End Sub
