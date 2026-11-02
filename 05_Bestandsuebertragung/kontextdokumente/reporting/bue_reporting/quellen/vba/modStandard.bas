Option Explicit
' ============================================================================
' modStandard – Karte "Was gehört zum Standard?" (Knopf "Standard festlegen …" im Cockpit)
'
' Zeigt alle bekannten Themenpostkoerbe (Filter!B5:B44) und GeVo-Typen (Filter!G5:G18) als Chips; ein Klick schaltet
' "im Standard" an oder ab. Gespeichert wird als ja/nein in der Konfiguration (I11:I50 zeilengleich mit Filter!B5:B44,
' L11:L24 zeilengleich mit Filter!G5:G18). Der Standard gilt fuer den Wochenreport (Rohdatenblatt, Fakten!Q) und fuer
' "Auf Standard zurücksetzen". "Speichern und anwenden" stellt zusaetzlich die Chips im Cockpit auf den Standard.
' Zeichnet mit den Bausteinen aus modTagesablauf (Praefix TAGW_ zum Aufraeumen).
' ============================================================================

Private Const PRAEFIX As String = "TAGW_"
Private Const C_TEAL As Long = 8220427              ' RGB(11, 111, 125)
Private Const C_SW As Long = 1710618                ' RGB(26, 26, 26)
Private Const C_GRAU As Long = 7039851              ' RGB(107, 107, 107)
Private Const C_GRAUL As Long = 14341584            ' RGB(208, 213, 218)

Private pkName() As String, pkZeile() As Long, pkAn() As Boolean, nPk As Long
Private gvName() As String, gvAn() As Boolean, nGv As Long
Private kx As Single, ky As Single, kb As Single, kh As Single
Private yPk As Single, yGv As Single
Private klickArt As String, klickNr As Long
Private nurNeue As Boolean                          ' Karte nach dem Laden: nur die neuen Postkoerbe ausserhalb HS

Public Function StandardVersion() As String
    StandardVersion = "1"
End Function

' ---------------------------------------------------------------- Einstieg
Public Sub Zeigen(Optional neueNachLaden As Boolean = False)
    Dim ws As Worksheet, wsF As Worksheet, wsK As Worksheet, r As Long, zP As Long, zG As Long
    If modLaden.LadenLaeuft() Then Exit Sub
    nurNeue = neueNachLaden
    On Error GoTo Ersatz
    modTagesablauf.KartenEntfernen
    Set wsF = ThisWorkbook.Worksheets("Filter")
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    ' Listen und aktuellen Standard lesen
    nPk = 0: ReDim pkName(1 To 40): ReDim pkZeile(1 To 40): ReDim pkAn(1 To 40)
    For r = 0 To 39
        If Len(Trim$(CStr(wsF.Cells(5 + r, 2).Value))) > 0 And (Not nurNeue Or modLaden.IstNeuerPostkorb(CStr(wsF.Cells(5 + r, 2).Value))) Then
            nPk = nPk + 1
            pkName(nPk) = CStr(wsF.Cells(5 + r, 2).Value)
            pkZeile(nPk) = r
            pkAn(nPk) = (LCase$(Trim$(CStr(wsK.Cells(11 + r, 9).Value))) = "ja")
        End If
    Next r
    nGv = 0: ReDim gvName(1 To 14): ReDim gvAn(1 To 14)
    For r = 0 To IIf(nurNeue, -1, 13)
        nGv = nGv + 1
        gvName(nGv) = IIf(r = 13, "Alle übrigen GeVo-Typen", CStr(wsF.Cells(5 + r, 7).Value))
        If Len(gvName(nGv)) = 0 Then gvName(nGv) = "(frei)"
        gvAn(nGv) = (LCase$(Trim$(CStr(wsK.Cells(11 + r, 12).Value))) <> "nein")
    Next r

    ThisWorkbook.Worksheets("Cockpit").Activate
    Set ws = ActiveSheet
    zP = (nPk + 3) \ 4: If zP = 0 Then zP = 1
    zG = (nGv + 2) \ 3
    kb = 660
    kh = 126 + zP * 30 + 30 + zG * 30 + 76
    If nurNeue Then kh = 126 + zP * 30 + 70
    modTagesablauf.KarteModal ws, kb, kh, kx, ky
    yPk = ky + 126
    yGv = yPk + zP * 30 + 30
    modTagesablauf.Beschriftung ws, "Schritt", kx + 28, ky + 20, kb - 56, 14, "STANDARD-AUSWAHL", 8, True, C_TEAL
    If nurNeue Then
        modTagesablauf.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Neue Themenpostkörbe in den Rohdaten", 15, True, C_SW
        modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 68, kb - 56, 32, _
            "Diese Postkörbe gehören nicht zu HS und zählen erst einmal alle zum Standard. Welche sollen nicht betrachtet werden? " & _
            "Anklicken nimmt sie heraus (weiß = nicht im Standard).", 9.5, False, C_GRAU, True
    Else
        modTagesablauf.Beschriftung ws, "Frage", kx + 28, ky + 40, kb - 56, 26, "Was gehört zum Standard?", 15, True, C_SW
        modTagesablauf.Beschriftung ws, "Text", kx + 28, ky + 68, kb - 56, 32, _
            "Der Standard gilt für den Wochenreport (Blatt Rohdatenblatt) und für „Auf Standard zurücksetzen“ im Cockpit. " & _
            "Anklicken schaltet an oder ab; gefüllt = gehört zum Standard.", 9.5, False, C_GRAU, True
    End If
    modTagesablauf.Beschriftung ws, "LabelPK", kx + 28, yPk - 18, kb - 56, 14, "THEMENPOSTKÖRBE", 8, True, C_GRAU
    If Not nurNeue Then modTagesablauf.Beschriftung ws, "LabelGV", kx + 28, yGv - 18, kb - 56, 14, "GEVO-TYPEN", 8, True, C_GRAU
    For r = 1 To nPk
        ChipZeichnen ws, "P", r
    Next r
    For r = 1 To nGv
        ChipZeichnen ws, "G", r
    Next r
    If nPk = 0 Then
        modTagesablauf.Beschriftung ws, "KeinePK", kx + 28, yPk, kb - 56, 24, "Noch keine Themenpostkörbe bekannt – sie erscheinen nach dem ersten Laden.", 9, False, C_GRAU
    End If
    If nurNeue Then
        modTagesablauf.Knopf ws, "Anwenden", kx + kb - 28 - 190, ky + kh - 50, 190, 30, "Speichern und weiter", 1, "modStandard.KlickAnwenden"
        modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 150, 30, "Alle behalten", 3, "modStandard.KlickAbbrechen"
    Else
        modTagesablauf.Knopf ws, "Anwenden", kx + kb - 28 - 190, ky + kh - 50, 190, 30, "Speichern und anwenden", 1, "modStandard.KlickAnwenden"
        modTagesablauf.Knopf ws, "Speichern", kx + kb - 28 - 190 - 12 - 120, ky + kh - 50, 120, 30, "Nur speichern", 2, "modStandard.KlickSpeichern"
        modTagesablauf.Knopf ws, "Abbrechen", kx + 20, ky + kh - 50, 90, 30, "Abbrechen", 3, "modStandard.KlickAbbrechen"
        modTagesablauf.Knopf ws, "AlleGV", kx + 114, ky + kh - 50, 110, 30, "Alle GeVo an", 3, "modStandard.KlickAlleGeVo"
    End If
    Exit Sub
Ersatz:
    On Error Resume Next
    modTagesablauf.KartenEntfernen
    ThisWorkbook.Worksheets("Konfiguration").Activate
    ThisWorkbook.Worksheets("Konfiguration").Range("I11").Select
    MsgBox "Die Standard-Auswahl steht in der Konfiguration, Spalten H bis L: je Themenpostkorb und GeVo-Typ ja oder nein.", vbInformation, "Standard festlegen"
End Sub

' Chip: gefuellt (petrol, weisse Schrift) = im Standard, weiss mit Rand = nicht im Standard
Private Sub ChipZeichnen(ws As Worksheet, art As String, i As Long)
    Dim x As Single, y As Single, b As Single, h As Single, an As Boolean, t As String, nm As String
    h = 24
    If art = "P" Then
        b = (kb - 56 - 3 * 8) / 4
        x = kx + 28 + ((i - 1) Mod 4) * (b + 8)
        y = yPk + ((i - 1) \ 4) * 30
        an = pkAn(i): t = pkName(i)
    Else
        b = (kb - 56 - 2 * 8) / 3
        x = kx + 28 + ((i - 1) Mod 3) * (b + 8)
        y = yGv + ((i - 1) \ 3) * 30
        an = gvAn(i): t = gvName(i)
    End If
    nm = PRAEFIX & "S_" & art & Format(i, "00")
    On Error Resume Next
    ws.Shapes(nm).Delete
    On Error GoTo 0
    With ws.Shapes.AddShape(5, x, y, b, h)
        .Name = nm
        .Adjustments(1) = 0.5
        If an Then
            .Fill.ForeColor.RGB = C_TEAL
            .Line.Visible = msoFalse
        Else
            .Fill.ForeColor.RGB = RGB(255, 255, 255)
            .Line.ForeColor.RGB = C_GRAUL
            .Line.Weight = 1
        End If
        .OnAction = "modStandard.KlickChip"
        With .TextFrame2
            .MarginLeft = 8: .MarginRight = 8: .MarginTop = 0: .MarginBottom = 0
            .WordWrap = msoFalse
            .VerticalAnchor = msoAnchorMiddle
            .TextRange.Text = t
            .TextRange.Font.Name = "Liberation Sans"
            .TextRange.Font.Size = 8.5
            .TextRange.Font.Bold = IIf(an, msoTrue, msoFalse)
            .TextRange.Font.Fill.ForeColor.RGB = IIf(an, RGB(255, 255, 255), C_GRAU)
            .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        End With
    End With
End Sub

' ---------------------------------------------------------------- Klicks
Public Sub KlickChip()
    Dim nm As String, p As Long
    On Error Resume Next
    nm = CStr(Application.Caller)
    On Error GoTo 0
    p = InStr(nm, PRAEFIX & "S_")
    If p = 0 Then Exit Sub
    klickArt = Mid$(nm, p + Len(PRAEFIX) + 2, 1)
    klickNr = CLng(Val(Mid$(nm, p + Len(PRAEFIX) + 3, 2)))
    ' die geklickte Form nicht im eigenen Makro loeschen: Neuzeichnen gleich danach
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modStandard.Umschalten"
End Sub

Public Sub Umschalten()
    If klickArt = "P" And klickNr >= 1 And klickNr <= nPk Then
        pkAn(klickNr) = Not pkAn(klickNr)
    ElseIf klickArt = "G" And klickNr >= 1 And klickNr <= nGv Then
        gvAn(klickNr) = Not gvAn(klickNr)
    Else
        Exit Sub
    End If
    Application.ScreenUpdating = False
    ChipZeichnen ActiveSheet, klickArt, klickNr
    Application.ScreenUpdating = True
End Sub

Public Sub KlickAlleGeVo()
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modStandard.AlleGeVo"
End Sub

Public Sub AlleGeVo()
    Dim i As Long
    Application.ScreenUpdating = False
    For i = 1 To nGv
        gvAn(i) = True
        ChipZeichnen ActiveSheet, "G", i
    Next i
    Application.ScreenUpdating = True
End Sub

Public Sub KlickAbbrechen()
    If nurNeue Then                                   ' "Alle behalten": Standard bleibt "ja", im Tagesablauf weiter
        Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modStandard.NeueFertig"
    Else
        Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modTagesablauf.KartenEntfernen"
    End If
End Sub

Public Sub NeueFertig()
    nurNeue = False
    modLaden.NeuePostkoerbeErledigt
    modTagesablauf.KartenEntfernen
    modTagesablauf.NachStandardWeiter
End Sub

Public Sub KlickSpeichern()
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modStandard.Speichern"
End Sub

Public Sub KlickAnwenden()
    Application.OnTime Now, "'" & ThisWorkbook.Name & "'!modStandard.SpeichernUndAnwenden"
End Sub

Public Sub Speichern()
    StandardSchreiben
    modTagesablauf.KartenEntfernen
    modFortschritt.HinweisZeigen "Standard gespeichert", "Der Wochenreport (Blatt Rohdatenblatt) rechnet ab jetzt mit dieser Auswahl. " & _
        "Die Chips im Cockpit bleiben, wie sie sind – „Auf Standard zurücksetzen“ übernimmt den Standard in die Ansicht.", False
End Sub

Public Sub SpeichernUndAnwenden()
    StandardSchreiben
    modTagesablauf.KartenEntfernen
    modCockpit.StandardAnwenden
    If nurNeue Then NeueFertig
End Sub

Private Sub StandardSchreiben()
    Dim wsK As Worksheet, i As Long
    Set wsK = ThisWorkbook.Worksheets("Konfiguration")
    For i = 1 To nPk
        wsK.Cells(11 + pkZeile(i), 9).Value = IIf(pkAn(i), "ja", "nein")
    Next i
    For i = 1 To nGv
        wsK.Cells(10 + i, 12).Value = IIf(gvAn(i), "ja", "nein")
    Next i
    modLaden.LogSchreiben "Standard-Auswahl gespeichert"
End Sub
