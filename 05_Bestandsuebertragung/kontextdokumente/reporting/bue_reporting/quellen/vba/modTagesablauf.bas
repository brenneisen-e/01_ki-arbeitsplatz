Option Explicit
' ============================================================================
' modTagesablauf – gefuehrter Tagesablauf in drei Schritten (Karten als Formen, ohne UserForm)
'
'   Start (Knopf "Neue Daten laden" im Cockpit)
'   1. Rohdaten: "Liegen die neuen Abzuege im Ordner Rohdaten?"  Ja -> modLaden.NeueDatenLaden
'      (dessen Abschlussmeldung faengt modFortschritt.HinweisZeigen ab und reicht sie hierher weiter)
'   2. Anwesenheit: "Ist heute jemand nicht da?"  Ja -> Blatt Kalender beim heutigen Tag, die Spalte von heute blinkt
'      kurz auf; eine Karte am rechten Rand bleibt offen, waehrend eingetragen wird (U, K, A oder Anteil),
'      "Fertig" schliesst den Schritt ab.  Nein -> direkt zu 3.
'      Kommt die Anwesenheit aus dem Telefonie- und Abwesenheitsplan (das Laden hat ihn eben uebernommen), fragt der Schritt
'      nicht, sondern zeigt, wer heute laut Plan fehlt (PlanZeigen); "Im Kalender ansehen" oeffnet den Kalender wie oben.
'   3. Erfolg: "Alles fuer heute erledigt" – optional "PowerPoint-Folie erzeugen".
'   Filter!O42 haelt den Zeitpunkt des letzten abgeschlossenen Tagesablaufs (Anzeige im Cockpit-Kopf).
'
' Klicks auf eine Karte loeschen die Karte nie im eigenen Klick, sondern per OnTime gleich danach
' (wie modFortschritt.HinweisSchliessen) – das Loeschen der geklickten Form im eigenen Makro kann Excel abstuerzen lassen.
' ============================================================================

Private Const PRAEFIX As String = "TAGW_"
Private Const KAL_START As Long = 7             ' erste Mitarbeiterzeile im Kalender (Kopf: 4 Monat, 5 KW, 6 Tag)
Private Const KAL_ZEILEN As Long = 60
Private Const SCHRIFT As String = "Liberation Sans"

Private phase As String                         ' "", "frage", "laden", "anwesenheit", "fertig"
Private ladeText As String
Private ladeFehler As Boolean
Private nachLadenGeplant As Boolean
Private abwZeile As Long                        ' Spalte von heute im Kalender (0 = nicht gefunden)
Private abwVorbelegt As Boolean                 ' (nicht mehr genutzt)
Private eingetragen As Long                     ' Abwesenheiten heute (fuer die Erfolgsmeldung)
Private geladenText As String
Private planText As String                      ' Anwesenheit kam aus dem Plan: Zeile fuer die Erfolgsmeldung (sonst leer)

' ---------------------------------------------------------------- Farben
Private Const C_TEAL As Long = 8220427            ' RGB(11, 111, 125)
Private Const C_TEAL_HELL As Long = 10982415            ' RGB(15, 148, 167)
Private Const C_ROT As Long = 2627007            ' RGB(191, 21, 40)
Private Const C_SW As Long = 1710618            ' RGB(26, 26, 26)
Private Const C_GRAU As Long = 7039851            ' RGB(107, 107, 107)
Private Const C_GRAUL As Long = 14341584            ' RGB(208, 213, 218)
Private Const C_GRAUXL As Long = 16184563            ' RGB(243, 244, 246)
Private Const C_GRUEN As Long = 5209886            ' RGB(30, 127, 79)
Private Const C_GRUENH As Long = 15004637            ' RGB(221, 243, 228)
Private Const C_GELBD As Long = 23178            ' RGB(138, 90, 0)
Private Const C_GELBH As Long = 13103099            ' RGB(251, 239, 199)

Public Function TagesablaufVersion() As String
    TagesablaufVersion = "1"
End Function

' Wird von modFortschritt.HinweisZeigen gefragt: laeuft gerade das Laden aus dem Tagesablauf?
Public Function WartetAufLaden() As Boolean
    WartetAufLaden = (phase = "laden")
End Function

' Abschlussmeldung von NeueDatenLaden (oder eines Fehlers darin) uebernehmen und Schritt 2 planen
Public Sub LadeErgebnis(titel As String, text As String, fehler As Boolean)
    If Len(ladeText) > 0 Then ladeText = ladeText & vbCrLf
    ladeText = ladeText & text
    If fehler Then ladeFehler = True
    If Not nachLadenGeplant Then
        nachLadenGeplant = True
        On Error Resume Next
        Application.OnTime Now + TimeSerial(0, 0, 1), "'" & ThisWorkbook.Name & "'!modTagesablauf.NachDemLaden"
        On Error GoTo 0
    End If
End Sub

' ---------------------------------------------------------------- Einstieg
Public Sub Start()
    Dim sperre As String
    If modLaden.LadenLaeuft() Then Exit Sub
    sperre = modLaden.BeladungAndererText()                  ' einmal lesen (im SharePoint-Modus ein Abruf der Sperrdatei)
    If Len(sperre) > 0 Then                                  ' jemand anderes laedt gerade: Hinweis statt zweiter Beladung
        modFortschritt.HinweisZeigen "Beladung läuft", sperre, False
        Exit Sub
    End If
    On Error Resume Next
    KartenEntfernen
    modFortschritt.HinweisEntfernen
    phase = "frage"
    ladeText = "": ladeFehler = False: nachLadenGeplant = False
    abwZeile = 0: abwVorbelegt = False: eingetragen = 0: geladenText = "": planText = ""
    modLaden.AnwesenheitStatusLeeren
    ThisWorkbook.Worksheets("Cockpit").Activate
    On Error GoTo 0
    Schritt1Zeigen
End Sub

Private Sub Schritt1Zeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, ordner As String
    On Error GoTo Ersatz
    Set ws = ActiveSheet
    ordner = modLaden.RohdatenPfad()
    kb = 580: kh = 250
    KarteModal ws, kb, kh, kx, ky
    Kopf ws, kx, ky, kb, 1, "Rohdaten ablegen"
    Beschriftung ws, "Frage", kx + 28, ky + 76, kb - 56, 26, "Liegen die neuen Abzüge im Ordner Rohdaten?", 15, True, C_SW
    Beschriftung ws, "Text", kx + 28, ky + 108, kb - 56, 34, _
         "Die heutigen MIS-O-Abzüge für OPAG und Verbund gehören in diesen Ordner. Beim Laden werden sie erkannt, " & _
         CStr(IIf(Left$(LCase$(ordner), 4) = "http", "direkt von SharePoint gelesen und bleiben dort liegen.", "umbenannt und in die Monatsablage verschoben.")), 9.5, False, C_GRAU, True
    Feld ws, "Pfad", kx + 28, ky + 148, kb - 56, 26, ordner
    Knopf ws, "Ja", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Ja, jetzt laden", 1, "modTagesablauf.KlickLaden"
    Knopf ws, "Ordner", kx + kb - 28 - 150 - 12 - 130, ky + kh - 50, 130, 30, "Ordner öffnen", 2, "modTagesablauf.KlickOrdner"
    Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 80, 30, "Abbrechen", 3, "modTagesablauf.KlickAbbrechen"
    Knopf ws, "Weiter", kx + 104, ky + kh - 50, 120, 30, "Ohne Laden weiter", 3, "modTagesablauf.KlickOhneLaden"
    Exit Sub
Ersatz:
    ErsatzFrage1
End Sub

' ---------------------------------------------------------------- Klicks Schritt 1
Public Sub KlickLaden()
    Planen "LadenStarten"
End Sub

Public Sub KlickOhneLaden()
    geladenText = "Rohdaten: heute ohne neues Laden."
    Planen "OhneLadenWeiter"
End Sub

' ohne neue Rohdaten: einen laufend gepflegten Anwesenheitsplan trotzdem frisch uebernehmen (MAK des Tages), dann Schritt 2
Public Sub OhneLadenWeiter()
    KartenEntfernen
    modLaden.AnwesenheitStatusLeeren
    If modLaden.AnwesenheitAutomatisch() And Not modLaden.LadenLaeuft() Then modLaden.AnwesenheitLaden True
    Schritt2Zeigen
End Sub

Public Sub KlickOrdner()
    Dim ordner As String
    On Error Resume Next
    ordner = modLaden.RohdatenPfad()
    If Len(ordner) = 0 Then Exit Sub
    Shell "explorer.exe """ & ordner & """", vbNormalFocus
    If Err.Number <> 0 Then
        Err.Clear
        ThisWorkbook.FollowHyperlink ordner
    End If
    On Error GoTo 0
End Sub

Public Sub KlickAbbrechen()
    phase = ""
    If abwVorbelegt Then VorbelegungZuruecknehmen
    Planen "KartenEntfernenUndZurueck"
End Sub

Public Sub Nichts()
    ' Klick auf den abgedunkelten Hintergrund: nichts tun (die Karte ist modal)
End Sub

Public Sub LadenStarten()
    KartenEntfernen
    If modLaden.LadenLaeuft() Then Exit Sub
    phase = "laden"
    ladeText = "": ladeFehler = False: nachLadenGeplant = False
    modLaden.NeueDatenLaden
    ' Ein schon geladener Stand kam neu: NeueDatenLaden hat nichts verarbeitet und zeigt die Ersatz-Frage (ErsatzFrageZeigen)
    If modLaden.ErsatzFrageOffen() Then
        phase = "ersatz"
        Exit Sub
    End If
    ' NeueDatenLaden laeuft synchron; seine Meldungen sind ueber HinweisZeigen -> LadeErgebnis gesammelt.
    ' Ab hier nichts mehr abfangen, Schritt 2 (oder die Fehlerkarte) folgt per OnTime.
    phase = "nachladen"
    If Not nachLadenGeplant Then
        nachLadenGeplant = True
        Planen "NachDemLaden"
    End If
End Sub

Public Sub NachDemLaden()
    nachLadenGeplant = False
    If phase <> "nachladen" Then Exit Sub
    If ladeFehler Then
        FehlerNachLadenZeigen
    Else
        geladenText = KurzText(IIf(Len(ladeText) > 0, ladeText, "geladen."))
        If modLaden.NeuePostkoerbeAnzahl() > 0 Then
            phase = "standard"                         ' neue Themenpostkoerbe (nicht HS): erst fragen, welche heraus sollen
            modStandard.Zeigen True
        Else
            Schritt2Zeigen
        End If
    End If
End Sub

' nach der Karte „Neue Themenpostkörbe“ im Tagesablauf mit Schritt 2 weiter
Public Sub NachStandardWeiter()
    If phase = "standard" Then Schritt2Zeigen
End Sub

Private Sub FehlerNachLadenZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single
    On Error GoTo Ersatz
    phase = "frage"
    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    kb = 540
    kh = 184 + PilleHoehe(ladeText, kb - 56)
    KarteModal ws, kb, kh, kx, ky
    Kopf ws, kx, ky, kb, 1, "Rohdaten ablegen"
    Beschriftung ws, "Frage", kx + 28, ky + 76, kb - 56, 26, "Das Laden hat nicht geklappt", 15, True, C_SW
    Pille ws, "Ergebnis", kx + 28, ky + 110, kb - 56, PilleHoehe(ladeText, kb - 56), ladeText, C_GELBH, C_GELBD
    Knopf ws, "Ja", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Nochmal laden", 1, "modTagesablauf.KlickLaden"
    Knopf ws, "Weiter", kx + kb - 28 - 150 - 12 - 150, ky + kh - 50, 150, 30, "Ohne Laden weiter", 2, "modTagesablauf.KlickOhneLaden"
    Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 80, 30, "Abbrechen", 3, "modTagesablauf.KlickAbbrechen"
    Exit Sub
Ersatz:
    MsgBox ladeText, vbExclamation, "Tagesablauf"
    phase = ""
End Sub

' ---------------------------------------------------------------- Ersatz-Frage: neuer Abzug fuer einen schon geladenen Stand
Public Sub ErsatzFrageZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, n As Long, i As Long
    Dim py As Single, ph As Single, ry As Single, zh As Single, c1 As Single, c2 As Single, c3 As Single
    Dim q As String, tag As Date, am As Variant, alt As Double, neu As Double, unter As String
    If Not modLaden.ErsatzFrageOffen() Then Exit Sub
    On Error GoTo Ersatz
    KartenEntfernen
    modFortschritt.HinweisEntfernen
    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    n = modLaden.ErsatzAnzahl()
    kb = 640: zh = 50
    ph = 30 + n * zh
    kh = 116 + ph + 108
    KarteModal ws, kb, kh, kx, ky
    If modLaden.ErsatzAusAblauf() Then
        Kopf ws, kx, ky, kb, 1, "Rohdaten ablegen"
    Else
        Beschriftung ws, "Schritt", kx + 28, ky + 20, kb - 56, 14, "ROHDATEN LADEN", 8, True, C_TEAL
    End If
    Beschriftung ws, "Frage", kx + 28, ky + 74, kb - 56, 24, IIf(n = 1, "Diesen Stand gibt es schon", "Diese Stände gibt es schon"), 15, True, C_SW
    ' Tabelle: je Stand eine Zeile – Quelle und Stichtag | bisher geladen | neuer Abzug
    py = ky + 108
    c1 = kx + 44: c2 = kx + 260: c3 = kx + 430
    Flaeche ws, "Tab", kx + 28, py, kb - 56, ph, C_GRAUXL
    Beschriftung ws, "H1", c1, py + 9, 200, 12, "STAND", 7.5, True, C_GRAU
    Beschriftung ws, "H2", c2, py + 9, 160, 12, "BISHER GELADEN", 7.5, True, C_GRAU
    Beschriftung ws, "H3", c3, py + 9, 170, 12, "NEUER ABZUG", 7.5, True, C_TEAL
    For i = 1 To n
        q = CStr(modLaden.ErsatzWert(i, 0))
        tag = CDate(modLaden.ErsatzWert(i, 1))
        am = modLaden.ErsatzWert(i, 2)
        alt = CDbl(modLaden.ErsatzWert(i, 3))
        neu = CDbl(modLaden.ErsatzWert(i, 6))
        ry = py + 28 + (i - 1) * zh
        If i > 1 Then Linie ws, "L" & i, kx + 40, ry, kb - 80
        Marke ws, "Q" & i, c1, ry + 9, 62, 20, q, IIf(q = "OPAG", C_ROT, C_TEAL)
        Beschriftung ws, "D" & i, c1 + 72, ry + 7, 130, 16, Choose(Weekday(tag, vbMonday), "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So") & " " & _
                     Format$(tag, "dd.mm.yyyy"), 10.5, True, C_SW
        If Len(CStr(modLaden.ErsatzWert(i, 7))) > 0 Then Beschriftung ws, "DU" & i, c1 + 72, ry + 25, 130, 13, "Einheiten " & CStr(modLaden.ErsatzWert(i, 7)), 8, False, C_GRAU
        Beschriftung ws, "A" & i, c2, ry + 7, 160, 16, modLaden.ZahlDE(alt) & " Datensätze", 10.5, True, C_SW
        If IsDate(am) Then unter = "geladen " & Format$(am, "dd.mm.") & " um " & Format$(am, "hh:nn") & " Uhr" Else unter = "geladen"
        Beschriftung ws, "AU" & i, c2, ry + 25, 160, 13, unter, 8, False, C_GRAU
        Beschriftung ws, "N" & i, c3, ry + 7, 170, 16, "rund " & modLaden.ZahlDE(neu) & " Zeilen", 10.5, True, IIf(neu > alt * 1.05, C_GRUEN, C_SW)
        Beschriftung ws, "NU" & i, c3, ry + 25, 170, 13, KurzName(CStr(modLaden.ErsatzWert(i, 5))), 8, False, C_GRAU
    Next i
    Beschriftung ws, "Hinweis", kx + 28, py + ph + 12, kb - 56, 30, _
         "Übernehmen rechnet Eingänge und Abgänge dieses Tages gegen den Stand davor neu, danach alle späteren Stände dieser Quelle (und Einheiten). " & _
         "Die alte Datei bleibt als …_ersetzt in der Ablage.", 8.5, False, C_GRAU, True
    Knopf ws, "Ersetzen", kx + kb - 28 - 190, ky + kh - 50, 190, 30, "Neuen Abzug übernehmen", 1, "modTagesablauf.KlickErsetzen"
    Knopf ws, "Behalten", kx + kb - 28 - 190 - 12 - 160, ky + kh - 50, 160, 30, "Alten Stand behalten", 2, "modTagesablauf.KlickBehalten"
    Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modTagesablauf.KlickErsatzAbbrechen"
    Exit Sub
Ersatz:
    On Error Resume Next
    KartenEntfernen
    modLaden.ErsatzEntscheiden (MsgBox("Diesen Stand gibt es schon:" & vbCrLf & vbCrLf & modLaden.ErsatzFrageText() & vbCrLf & vbCrLf & _
                                "Soll der neue Abzug den alten Stand ersetzen?", vbYesNo + vbQuestion, "Rohdaten laden") = vbYes)
    ErsatzWeiter
End Sub

' Flaeche (abgerundet, ohne Rand) als Hintergrund einer Tabelle
Private Sub Flaeche(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, farbe As Long)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.06
        .Fill.ForeColor.RGB = farbe
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
    End With
End Sub

' duenne Trennlinie zwischen Tabellenzeilen
Private Sub Linie(ws As Worksheet, nm As String, x As Single, y As Single, b As Single)
    With ws.Shapes.AddLine(x, y, x + b, y)
        .Name = PRAEFIX & nm
        .Line.ForeColor.RGB = C_GRAUL
        .Line.Weight = 0.75
    End With
End Sub

' Marke der Quelle (OPAG rot, Verbund petrol) – Pille mit weisser, fetter Schrift
Private Sub Marke(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, farbe As Long)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.5
        .Fill.ForeColor.RGB = farbe
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
        With .TextFrame2
            .MarginLeft = 2: .MarginRight = 2: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 8.5
            .TextRange.Font.Bold = msoTrue
            .TextRange.Font.Fill.ForeColor.RGB = RGB(255, 255, 255)
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
End Sub

' Dateiname kurz (ohne Ordner, hoechstens 34 Zeichen)
Private Function KurzName(t As String) As String
    KurzName = t
    If Len(t) > 34 Then KurzName = Left$(t, 15) & "…" & Right$(t, 18)
End Function

Public Sub KlickErsetzen()
    modLaden.ErsatzEntscheiden True
    Planen "ErsatzWeiter"
End Sub

Public Sub KlickBehalten()
    modLaden.ErsatzEntscheiden False
    Planen "ErsatzWeiter"
End Sub

Public Sub KlickErsatzAbbrechen()
    modLaden.ErsatzAbbrechen
    If modLaden.ErsatzAusAblauf() Then
        KlickAbbrechen
    Else
        Planen "KartenEntfernenUndZurueck"
    End If
End Sub

' nach der Antwort erneut laden – im Tagesablauf mit dessen Fortsetzung (Schritt 2), sonst direkt
Public Sub ErsatzWeiter()
    KartenEntfernen
    If modLaden.ErsatzAusAblauf() Then
        LadenStarten
    Else
        modLaden.NeueDatenLaden
    End If
End Sub

' ---------------------------------------------------------------- Schritt 2: Anwesenheit heute
Public Sub Schritt2Zeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, y As Single, warn As String, info As String
    planText = ""
    If modLaden.AnwesenheitAusPlan() And modLaden.AnwesenheitFehltHeute() <> -2 Then
        PlanZeigen
        Exit Sub
    End If
    On Error GoTo Ersatz
    KartenEntfernen
    phase = "anwesenheit"
    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    ' Plan erwartet, aber nicht gelesen – oder gelesen, ohne den heutigen Tag: zeigen, dann wie bisher fragen.
    ' Eine gelungene Uebernahme (erste MAK-Liste) steht gruen darueber.
    warn = modLaden.AnwesenheitFehler()
    If modLaden.AnwesenheitAusPlan() Then warn = modLaden.AnwesenheitHeute() & "."
    If Len(warn) = 0 Then info = modLaden.AnwesenheitMeldung()
    If Len(info) > 0 Then info = info & "."
    kb = 540: kh = 250
    If Len(geladenText) > 0 Then kh = kh + PilleHoehe(geladenText, kb - 56) + 12
    If Len(info) > 0 Then kh = kh + PilleHoehe(info, kb - 56) + 12
    If Len(warn) > 0 Then kh = kh + PilleHoehe(warn, kb - 56) + 12
    KarteModal ws, kb, kh, kx, ky
    Kopf ws, kx, ky, kb, 2, "Anwesenheit heute"
    y = ky + 76
    If Len(geladenText) > 0 Then
        Pille ws, "Ergebnis", kx + 28, y, kb - 56, PilleHoehe(geladenText, kb - 56), geladenText, C_GRUENH, C_GRUEN
        y = y + PilleHoehe(geladenText, kb - 56) + 12
    End If
    If Len(info) > 0 Then
        Pille ws, "Anwesenheit", kx + 28, y, kb - 56, PilleHoehe(info, kb - 56), info, C_GRUENH, C_GRUEN
        y = y + PilleHoehe(info, kb - 56) + 12
    End If
    If Len(warn) > 0 Then
        Pille ws, "Warnung", kx + 28, y, kb - 56, PilleHoehe(warn, kb - 56), warn, C_GELBH, C_GELBD
        y = y + PilleHoehe(warn, kb - 56) + 12
    End If
    Beschriftung ws, "Frage", kx + 28, y, kb - 56, 26, "Ist heute jemand nicht da?", 15, True, C_SW
    Beschriftung ws, "Text", kx + 28, y + 32, kb - 56, 48, _
         "Urlaub, krank, Fortbildung oder ein halber Tag: Wer heute fehlt, zählt nicht in die MAK des Tages. " & _
         "Die Produktivität rechnet sonst mit zu vielen Köpfen. Heute ist " & WochentagLang(Date) & ", " & Format(Date, "dd.mm.yyyy") & ".", _
         9.5, False, C_GRAU, True
    Knopf ws, "Ja", kx + kb - 28 - 196, ky + kh - 50, 196, 30, "Ja, Abwesenheit eintragen", 1, "modTagesablauf.KlickAbwesend"
    Knopf ws, "Nein", kx + kb - 28 - 196 - 12 - 130, ky + kh - 50, 130, 30, "Nein, alle da", 2, "modTagesablauf.KlickAlleDa"
    Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 80, 30, "Abbrechen", 3, "modTagesablauf.KlickAbbrechen"
    Exit Sub
Ersatz:
    If MsgBox("Ist heute jemand nicht da (Urlaub, krank, halber Tag)?", vbQuestion + vbYesNo, "Tagesablauf – Anwesenheit") = vbYes Then
        AbwesenheitOeffnen
    Else
        Schritt3Zeigen
    End If
End Sub

' Schritt 2, wenn die Anwesenheit aus dem Telefonie- und Abwesenheitsplan kommt: nichts eintragen, nur zeigen, wer heute fehlt
Private Sub PlanZeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, y As Single, ph As Single
    Dim heute As String, fuellung As Long, schrift As Long
    heute = modLaden.AnwesenheitHeute() & "."
    planText = "Anwesenheit aus dem Plan übernommen. " & heute
    On Error GoTo Ersatz
    KartenEntfernen
    phase = "anwesenheit"
    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    kb = 540
    ph = PilleHoehe(heute, kb - 56)
    kh = 270 + ph
    If Len(geladenText) > 0 Then kh = kh + PilleHoehe(geladenText, kb - 56) + 12
    KarteModal ws, kb, kh, kx, ky
    Kopf ws, kx, ky, kb, 2, "Anwesenheit heute"
    y = ky + 76
    If Len(geladenText) > 0 Then
        Pille ws, "Ergebnis", kx + 28, y, kb - 56, PilleHoehe(geladenText, kb - 56), geladenText, C_GRUENH, C_GRUEN
        y = y + PilleHoehe(geladenText, kb - 56) + 12
    End If
    Beschriftung ws, "Frage", kx + 28, y, kb - 56, 26, "Die Anwesenheit kommt aus dem Plan", 15, True, C_SW
    Beschriftung ws, "Text", kx + 28, y + 32, kb - 56, 34, _
         "Eben übernommen aus " & modLaden.AnwesenheitDatei() & ". Heute ist " & WochentagLang(Date) & ", " & Format(Date, "dd.mm.yyyy") & ".", _
         9.5, False, C_GRAU, True
    If modLaden.AnwesenheitFehltHeute() > 0 Then
        fuellung = C_GELBH: schrift = C_GELBD
    ElseIf modLaden.AnwesenheitFehltHeute() = 0 Then
        fuellung = C_GRUENH: schrift = C_GRUEN
    Else
        fuellung = C_GRAUXL: schrift = C_SW
    End If
    Pille ws, "Heute", kx + 28, y + 72, kb - 56, ph, heute, fuellung, schrift
    Beschriftung ws, "Hinweis", kx + 28, y + 82 + ph, kb - 56, 30, _
         "Abwesenheiten trägst du im Plan ein; „Neue Daten laden“ übernimmt ihn jedes Mal neu. Ein A im Kalender ohne „x“ im Plan entfernt das nächste Laden; U, K und Anteile bleiben.", _
         8.5, False, C_GRAU, True
    Knopf ws, "Weiter", kx + kb - 28 - 150, ky + kh - 50, 150, 30, "Weiter", 1, "modTagesablauf.KlickAlleDa"
    Knopf ws, "Kalender", kx + kb - 28 - 150 - 12 - 170, ky + kh - 50, 170, 30, "Im Kalender ansehen", 2, "modTagesablauf.KlickAbwesend"
    Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 80, 30, "Abbrechen", 3, "modTagesablauf.KlickAbbrechen"
    Exit Sub
Ersatz:
    On Error Resume Next
    KartenEntfernen
    MsgBox heute, vbInformation, "Tagesablauf – Anwesenheit"
    Schritt3Zeigen
End Sub

Public Sub KlickAlleDa()
    Planen "Schritt3Zeigen"
End Sub

Public Sub KlickAbwesend()
    Planen "AbwesenheitOeffnen"
End Sub

Public Sub AbwesenheitOeffnen()
    ' Kalender beim heutigen Tag oeffnen; die Spalte von heute blinkt kurz, eine Karte am rechten Rand bleibt offen
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, frei As String, letzte As Long
    On Error GoTo Ersatz
    KartenEntfernen
    Set ws = ThisWorkbook.Worksheets("Kalender")
    ws.Activate
    modCockpit.KalenderZuHeute
    abwZeile = modCockpit.KalenderSpalteHeute()
    If abwZeile = 0 Then GoTo Ersatz
    ws.Cells(KAL_START, abwZeile).Select
    frei = HeuteFrei()
    kb = 300: kh = IIf(Len(frei) > 0, 412, 356)
    With ActiveWindow.VisibleRange
        kx = .Left + .Width - kb - 12
        ky = .Top + 6
    End With
    If kx < ws.Cells(1, abwZeile).Left + ws.Cells(1, abwZeile).Width + 12 Then kx = ws.Cells(1, abwZeile).Left + ws.Cells(1, abwZeile).Width + 12
    Karte ws, kx, ky, kb, kh
    Kopf ws, kx, ky, kb, 2, "Anwesenheit heute"
    If Len(planText) > 0 Then                          ' Anwesenheit aus dem Plan: ansehen, kurzfristig ergaenzen
        Beschriftung ws, "Frage", kx + 24, ky + 72, kb - 48, 24, "Heute laut Plan", 13, True, C_SW
        Beschriftung ws, "Text", kx + 24, ky + 104, kb - 48, 150, _
             "Spalte von heute (rot): A = „x“ im Plan, kursives A = fester freier Tag, FT = Feiertag, leer = da." & vbLf & vbLf & _
             "Ergänzen: U Urlaub, K Krankheit, 0,5 = halber Tag – das bleibt stehen. Ein A ohne „x“ im Plan entfernt das nächste Laden; " & _
             "Abwesenheiten deshalb im Plan eintragen.", 9.5, False, C_GRAU, True
    Else
        Beschriftung ws, "Frage", kx + 24, ky + 72, kb - 48, 24, "Wer fehlt heute?", 13, True, C_SW
        Beschriftung ws, "Text", kx + 24, ky + 104, kb - 48, 150, _
             "In der Spalte von heute (rot) je Person eintragen:" & vbLf & _
             "U  Urlaub" & vbLf & _
             "K  Krankheit" & vbLf & _
             "A  abwesend" & vbLf & _
             "0,5  nur halber Tag da (Zahl von 0 bis 1)" & vbLf & vbLf & _
             "Leer = da laut Arbeitszeitmodell; kursives A = fester freier Tag. Mehrere Tage: nach rechts weiter eintragen.", 9.5, False, C_GRAU, True
    End If
    If Len(frei) > 0 Then
        Pille ws, "Frei", kx + 24, ky + 278, kb - 48, 34, "Heute laut Modell frei: " & frei, C_GRAUXL, C_GRAU
    End If
    Knopf ws, "Zeigen", kx + 24, ky + kh - 88, kb - 48, 28, "Nochmal zeigen, wo", 2, "modTagesablauf.KlickZeigen"
    Knopf ws, "Fertig", kx + 24, ky + kh - 50, kb - 48 - 92, 30, "Fertig", 1, "modTagesablauf.KlickFertig"
    Knopf ws, "Abbrechen", kx + kb - 24 - 84, ky + kh - 50, 84, 30, "Abbrechen", 3, "modTagesablauf.KlickAbbrechen"
    Hervorheben
    Exit Sub
Ersatz:
    On Error Resume Next
    MsgBox "Bitte im Blatt 'Kalender' in der Spalte von heute je abwesender Person U, K, A oder einen Anteil eintragen " & _
           "und danach im Cockpit erneut 'Neue Daten laden' klicken.", vbInformation, "Anwesenheit heute"
    phase = ""
End Sub

' Namen, die heute laut Arbeitszeitmodell (Mitarbeiter!J:N = 0) nicht arbeiten
Private Function HeuteFrei() As String
    Dim wsM As Worksheet, r As Long, wt As Long, v As Variant, t As String
    On Error Resume Next
    wt = Weekday(Date, vbMonday)
    If wt > 5 Then Exit Function
    Set wsM = ThisWorkbook.Worksheets("Mitarbeiter")
    For r = 5 To 64
        If Len(Trim$(CStr(wsM.Cells(r, 1).Value))) > 0 Then
            v = wsM.Cells(r, 9 + wt).Value
            If Not IsEmpty(v) Then
                If IsNumeric(v) Then
                    If CDbl(v) = 0 Then t = t & IIf(Len(t) > 0, ", ", "") & CStr(wsM.Cells(r, 1).Value)
                End If
            End If
        End If
    Next r
    HeuteFrei = t
End Function

Public Sub KlickZeigen()
    Planen "Hervorheben"
End Sub

' Die Spalte von heute (alle Mitarbeiterzeilen) und ihr Kopf blinken dreimal auf und verschwinden wieder
Public Sub Hervorheben()
    Dim ws As Worksheet, zeile As Range, kopf As Range, i As Long, t As Double, sichtbar As Boolean, letzte As Long
    On Error Resume Next
    If abwZeile = 0 Then Exit Sub
    Set ws = ThisWorkbook.Worksheets("Kalender")
    If Not ActiveSheet Is ws Then Exit Sub
    letzte = KAL_START
    For i = KAL_START To KAL_START + KAL_ZEILEN - 1
        If Len(CStr(ws.Cells(i, 1).Value)) > 0 Then letzte = i
    Next i
    Set zeile = ws.Range(ws.Cells(KAL_START, abwZeile), ws.Cells(letzte, abwZeile))
    Set kopf = ws.Range(ws.Cells(4, abwZeile), ws.Cells(6, abwZeile))
    Rahmen ws, "HL_Zeile", zeile
    Rahmen ws, "HL_Kopf", kopf
    For i = 1 To 6
        sichtbar = (i Mod 2 = 1)
        ws.Shapes(PRAEFIX & "HL_Zeile").Visible = IIf(sichtbar, msoTrue, msoFalse)
        ws.Shapes(PRAEFIX & "HL_Kopf").Visible = IIf(sichtbar, msoTrue, msoFalse)
        t = Timer
        Do While Timer - t < 0.35 And Timer >= t
            DoEvents
        Loop
    Next i
    ws.Shapes(PRAEFIX & "HL_Zeile").Visible = msoTrue
    ws.Shapes(PRAEFIX & "HL_Kopf").Visible = msoTrue
    t = Timer
    Do While Timer - t < 1.2 And Timer >= t
        DoEvents
    Loop
    ws.Shapes(PRAEFIX & "HL_Zeile").Delete
    ws.Shapes(PRAEFIX & "HL_Kopf").Delete
    ws.Cells(KAL_START, abwZeile).Select
    On Error GoTo 0
End Sub

Private Sub Rahmen(ws As Worksheet, nm As String, rg As Range)
    On Error Resume Next
    ws.Shapes(PRAEFIX & nm).Delete
    On Error GoTo 0
    With ws.Shapes.AddShape(5, rg.Left - 3, rg.Top - 3, rg.Width + 6, rg.Height + 6)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.18
        .Fill.ForeColor.RGB = C_TEAL_HELL
        .Fill.Transparency = 0.8
        .Line.ForeColor.RGB = C_TEAL_HELL
        .Line.Weight = 2.5
        .OnAction = "modTagesablauf.Nichts"
    End With
End Sub

Public Sub KlickFertig()
    Planen "AbwesenheitFertig"
End Sub

Public Sub AbwesenheitFertig()
    ' Eintraege von heute zaehlen (jede nicht leere Zelle in der Spalte von heute)
    Dim ws As Worksheet, r As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Kalender")
    eingetragen = 0
    If abwZeile > 0 Then
        For r = KAL_START To KAL_START + KAL_ZEILEN - 1
            If Len(CStr(ws.Cells(r, 1).Value)) > 0 And Len(Trim$(CStr(ws.Cells(r, abwZeile).Value))) > 0 Then
                ' Feiertag und das kursive A des Arbeitszeitmodells sind keine Abwesenheitsmeldung
                If UCase$(Trim$(CStr(ws.Cells(r, abwZeile).Value))) <> "FT" And Not ws.Cells(r, abwZeile).Font.Italic Then eingetragen = eingetragen + 1
            End If
        Next r
    End If
    modCockpit.AlphabetischSortieren
    If Len(planText) > 0 And eingetragen <> modLaden.AnwesenheitFehltHeute() And modLaden.AnwesenheitFehltHeute() >= 0 Then
        planText = planText & " Im Kalender stehen heute " & eingetragen & IIf(eingetragen = 1, " Abwesenheit.", " Abwesenheiten.")
    End If
    On Error GoTo 0
    Schritt3Zeigen
End Sub

' (frueher: vorbelegtes Datum im Blatt Abwesenheit zuruecknehmen – im Kalender gibt es keine Vorbelegung)
Private Sub VorbelegungZuruecknehmen()
    abwVorbelegt = False
End Sub

' ---------------------------------------------------------------- Schritt 3: Erfolg
Public Sub Schritt3Zeigen()
    Dim ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single, anw As String, zeilen As String
    On Error Resume Next
    KartenEntfernen
    phase = "fertig"
    ThisWorkbook.Worksheets("Cockpit").Activate
    Application.Calculate
    modCockpit.DiagrammeAnpassen True
    ThisWorkbook.Worksheets("Filter").Range("O42").Value = Now
    modLaden.LogSchreiben "Tagesablauf abgeschlossen"
    On Error GoTo Ersatz
    Set ws = ActiveSheet
    If Len(planText) > 0 Then
        anw = planText
    ElseIf eingetragen = 0 Then
        anw = "Anwesenheit geprüft: heute alle da."
    ElseIf eingetragen = 1 Then
        anw = "Anwesenheit geprüft: 1 Abwesenheit für heute eingetragen."
    Else
        anw = "Anwesenheit geprüft: " & eingetragen & " Abwesenheiten für heute eingetragen."
    End If
    zeilen = IIf(Len(geladenText) > 0, geladenText & vbLf, "") & anw
    kb = 540: kh = 240 + PilleHoehe(zeilen, kb - 56)
    KarteModal ws, kb, kh, kx, ky
    Kopf ws, kx, ky, kb, 3, "Fertig"
    Haken ws, kx + 28, ky + 76
    Beschriftung ws, "Frage", kx + 80, ky + 78, kb - 108, 26, "Du hast alles für heute gemacht", 15, True, C_SW
    Beschriftung ws, "Sub", kx + 80, ky + 104, kb - 108, 18, "Kennzahlen und Diagramme sind auf dem neuesten Stand.", 9.5, False, C_GRAU
    Pille ws, "Ergebnis", kx + 28, ky + 138, kb - 56, PilleHoehe(zeilen, kb - 56), zeilen, C_GRAUXL, C_SW
    Beschriftung ws, "Text", kx + 28, ky + 146 + PilleHoehe(zeilen, kb - 56), kb - 56, 18, "Wenn du magst, kannst du jetzt die PowerPoint-Folie erstellen.", 9.5, False, C_GRAU
    Knopf ws, "PPT", kx + kb - 28 - 200, ky + kh - 50, 200, 30, "PowerPoint-Folie erzeugen", 4, "modTagesablauf.KlickPPT"
    Knopf ws, "Schliessen", kx + kb - 28 - 200 - 12 - 110, ky + kh - 50, 110, 30, "Schließen", 2, "modTagesablauf.KlickSchliessen"
    Exit Sub
Ersatz:
    On Error Resume Next
    If MsgBox("Du hast alles für heute gemacht." & vbCrLf & anw & vbCrLf & vbCrLf & "PowerPoint-Folie jetzt erstellen?", vbQuestion + vbYesNo, "Tagesablauf") = vbYes Then
        phase = ""
        modFolienauswahl.Zeigen
    End If
    phase = ""
End Sub

Public Sub KlickPPT()
    Planen "PPTStarten"
End Sub

Public Sub PPTStarten()
    KartenEntfernen
    phase = ""
    modFolienauswahl.Zeigen
End Sub

Public Sub KlickSchliessen()
    phase = ""
    Planen "KartenEntfernen"
End Sub

Public Sub KartenEntfernenUndZurueck()
    KartenEntfernen
    On Error Resume Next
    ThisWorkbook.Worksheets("Cockpit").Activate
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Bausteine
Private Sub Planen(prozedur As String)
    On Error Resume Next
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modTagesablauf." & prozedur
    On Error GoTo 0
End Sub

Public Sub KartenEntfernen()
    Dim i As Long, ws As Worksheet
    On Error Resume Next
    For Each ws In ThisWorkbook.Worksheets
        For i = ws.Shapes.Count To 1 Step -1
            If Left$(ws.Shapes(i).Name, Len(PRAEFIX)) = PRAEFIX Then ws.Shapes(i).Delete
        Next i
    Next ws
    On Error GoTo 0
End Sub

' abgedunkelter Hintergrund ueber dem sichtbaren Bereich und Karte in der Mitte
Public Sub KarteModal(ws As Worksheet, kb As Single, kh As Single, ByRef kx As Single, ByRef ky As Single)
    Dim sichtbar As Range
    Set sichtbar = ActiveWindow.VisibleRange
    With ws.Shapes.AddShape(1, sichtbar.Left, sichtbar.Top, sichtbar.Width, sichtbar.Height)
        .Name = PRAEFIX & "Schleier"
        .Fill.ForeColor.RGB = C_SW
        .Fill.Transparency = 0.5
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
    End With
    kx = sichtbar.Left + (sichtbar.Width - kb) / 2
    ky = sichtbar.Top + (sichtbar.Height - kh) / 2 - 30
    If ky < sichtbar.Top + 10 Then ky = sichtbar.Top + 10
    Karte ws, kx, ky, kb, kh
End Sub

Public Sub Karte(ws As Worksheet, kx As Single, ky As Single, kb As Single, kh As Single)
    With ws.Shapes.AddShape(5, kx, ky, kb, kh)
        .Name = PRAEFIX & "Karte"
        .Adjustments(1) = 0.04
        .Fill.ForeColor.RGB = RGB(255, 255, 255)
        .Line.ForeColor.RGB = C_GRAUL
        .Line.Weight = 0.75
        .Shadow.Visible = msoTrue
        .Shadow.Blur = 22
        .Shadow.OffsetX = 0
        .Shadow.OffsetY = 8
        .Shadow.Transparency = 0.7
        .Shadow.ForeColor.RGB = RGB(0, 0, 0)
        .OnAction = "modTagesablauf.Nichts"
    End With
End Sub

' Kopf der Karte: "TAGESABLAUF · SCHRITT n VON 3", Fortschritt in drei Segmenten mit Beschriftung
Private Sub Kopf(ws As Worksheet, kx As Single, ky As Single, kb As Single, schritt As Long, titel As String)
    Dim i As Long, sb As Single, sx As Single, namen As Variant, farbe As Long, rand As Single
    namen = Array("Rohdaten", "Anwesenheit", "Fertig")
    rand = IIf(kb < 400, 24, 28)
    If kb < 400 Then                            ' schmale Karte (neben der Tabelle): ohne Schrittnamen
        Beschriftung ws, "Schritt", kx + 24, ky + 20, kb - 48, 14, "TAGESABLAUF  ·  SCHRITT " & schritt & " VON 3", 8, True, C_TEAL
    Else
        Beschriftung ws, "Schritt", kx + 28, ky + 20, kb - 56, 14, "TAGESABLAUF  ·  SCHRITT " & schritt & " VON 3  ·  " & UCase$(titel), 8, True, C_TEAL
    End If
    sb = (kb - 2 * rand - 2 * 8) / 3
    For i = 0 To 2
        sx = kx + rand + i * (sb + 8)
        If i + 1 < schritt Then
            farbe = C_TEAL
        ElseIf i + 1 = schritt Then
            farbe = C_TEAL_HELL
        Else
            farbe = C_GRAUXL
        End If
        With ws.Shapes.AddShape(5, sx, ky + 40, sb, 5)
            .Name = PRAEFIX & "Seg" & i
            .Adjustments(1) = 0.5
            .Fill.ForeColor.RGB = farbe
            .Line.Visible = msoFalse
            .OnAction = "modTagesablauf.Nichts"
        End With
        Beschriftung ws, "SegT" & i, sx, ky + 49, sb, 12, CStr(namen(i)), 7.5, (i + 1 = schritt), IIf(i + 1 <= schritt, C_SW, C_GRAU)
    Next i
End Sub

Public Sub Beschriftung(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, _
                 groesse As Single, fett As Boolean, farbe As Long, Optional umbruch As Boolean = False)
    With ws.Shapes.AddTextbox(msoTextOrientationHorizontal, x, y, b, h)
        .Name = PRAEFIX & nm
        .Fill.Visible = msoFalse
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
        .TextFrame2.MarginLeft = 0: .TextFrame2.MarginRight = 0: .TextFrame2.MarginTop = 0: .TextFrame2.MarginBottom = 0
        .TextFrame2.WordWrap = IIf(umbruch, msoTrue, msoFalse)
        .TextFrame2.VerticalAnchor = IIf(umbruch, msoAnchorTop, msoAnchorMiddle)
        With .TextFrame2.TextRange
            .Text = inhalt
            .Font.Name = SCHRIFT
            .Font.Size = groesse
            .Font.Bold = fett
            .Font.Fill.ForeColor.RGB = farbe
            .ParagraphFormat.SpaceAfter = 0
        End With
    End With
End Sub

' Feld mit Pfad (grau hinterlegt, eine Zeile, links gekuerzt, wenn zu lang)
Private Sub Feld(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String)
    Dim t As String
    t = inhalt
    If Len(t) > 78 Then t = "…" & Right$(t, 77)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.2
        .Fill.ForeColor.RGB = C_GRAUXL
        .Line.ForeColor.RGB = C_GRAUL
        .Line.Weight = 0.75
        .OnAction = "modTagesablauf.KlickOrdner"
        With .TextFrame2
            .MarginLeft = 10: .MarginRight = 10: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = t
            .TextRange.Font.Name = "Consolas"
            .TextRange.Font.Size = 9
            .TextRange.Font.Fill.ForeColor.RGB = C_SW
            .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        End With
    End With
End Sub

' hinterlegter Hinweisblock (Ergebnis des Ladens, Zusammenfassung)
Public Sub Pille(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, fuellung As Long, schrift As Long)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & nm
        .Adjustments(1) = 0.12
        .Fill.ForeColor.RGB = fuellung
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
        With .TextFrame2
            .MarginLeft = 12: .MarginRight = 12: .MarginTop = 6: .MarginBottom = 6
            .WordWrap = msoTrue
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 9
            .TextRange.Font.Fill.ForeColor.RGB = schrift
            .TextRange.ParagraphFormat.Alignment = msoAlignLeft
        End With
    End With
End Sub

' art: 1 = primaer (petrol), 2 = sekundaer (weiss mit Rand), 3 = Textknopf (grau), 4 = PowerPoint (rot)
Public Sub Knopf(ws As Worksheet, nm As String, x As Single, y As Single, b As Single, h As Single, inhalt As String, art As Long, makro As String)
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = PRAEFIX & "K_" & nm
        .Adjustments(1) = 0.25
        Select Case art
            Case 1, 4
                .Fill.ForeColor.RGB = IIf(art = 1, C_TEAL, C_ROT)
                .Line.Visible = msoFalse
            Case 2
                .Fill.ForeColor.RGB = RGB(255, 255, 255)
                .Line.ForeColor.RGB = C_GRAUL
                .Line.Weight = 1
            Case Else
                .Fill.Visible = msoFalse
                .Line.Visible = msoFalse
        End Select
        .OnAction = makro
        With .TextFrame2
            .MarginLeft = 4: .MarginRight = 4: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = inhalt
            .TextRange.Font.Name = SCHRIFT
            .TextRange.Font.Size = 9.5
            .TextRange.Font.Bold = IIf(art = 3, msoFalse, msoTrue)
            .TextRange.Font.Fill.ForeColor.RGB = IIf(art = 1 Or art = 4, RGB(255, 255, 255), IIf(art = 2, C_SW, C_GRAU))
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
End Sub

' gruener Kreis mit weissem Haken (Linienzug, keine Schriftzeichen)
Private Sub Haken(ws As Worksheet, x As Single, y As Single)
    Dim ff As Object
    With ws.Shapes.AddShape(9, x, y, 40, 40)
        .Name = PRAEFIX & "HakenKreis"
        .Fill.ForeColor.RGB = C_GRUEN
        .Line.Visible = msoFalse
        .OnAction = "modTagesablauf.Nichts"
    End With
    On Error Resume Next
    Set ff = ws.Shapes.BuildFreeform(msoEditingAuto, x + 11, y + 21)
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 17.5, y + 27.5
    ff.AddNodes msoSegmentLine, msoEditingAuto, x + 29.5, y + 14
    With ff.ConvertToShape
        .Name = PRAEFIX & "Haken"
        .Fill.Visible = msoFalse
        .Line.ForeColor.RGB = RGB(255, 255, 255)
        .Line.Weight = 3
        .OnAction = "modTagesablauf.Nichts"
    End With
    On Error GoTo 0
End Sub

' Hoehe eines Hinweisblocks: je Absatz und je ca. 85 Zeichen (9 pt auf 480 pt Breite) eine Zeile zu 14 pt, plus Rand
Private Function PilleHoehe(t As String, breite As Single) As Single
    Dim teile() As String, i As Long, n As Long, jeZeile As Long
    jeZeile = Int(breite / 5.6)
    teile = Split(Replace(t, vbCrLf, vbLf), vbLf)
    For i = 0 To UBound(teile)
        n = n + 1 + Int(Len(teile(i)) / jeZeile)
    Next i
    If n < 1 Then n = 1
    PilleHoehe = 16 + 14 * n
End Function

' Lademeldung einzeilig mit "Rohdaten:" davor (mehrere Meldungen werden mit Leerzeichen verbunden)
Private Function KurzText(t As String) As String
    Dim s As String
    s = Replace(t, vbCrLf, " ")
    s = Replace(s, vbLf, " ")
    If Left$(s, 1) <> "R" Then s = "Rohdaten: " & s
    KurzText = s
End Function

Private Function WochentagLang(d As Date) As String
    WochentagLang = Choose(Weekday(d, vbMonday), "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag")
End Function

' Fallback ohne Formen (z. B. geschuetztes Blatt): klassische Abfrage
Private Sub ErsatzFrage1()
    On Error Resume Next
    KartenEntfernen
    If MsgBox("Liegen die neuen Abzüge im Ordner Rohdaten?" & vbCrLf & modLaden.RohdatenPfad(), vbQuestion + vbYesNo, "Tagesablauf – Rohdaten") = vbYes Then
        LadenStarten
    Else
        phase = ""
    End If
End Sub
