Option Explicit
' ============================================================================
' modVerknuepfung – Knopf "BÜ-Reporting verknüpfen" (Startseite)
'
' Datei waehlen (BUE_Reporting_Master.xlsm), dann setzt das Makro in Rohdaten die Zeilen 7VA bis 7OL auf Formeln, die den
' Wert aus dem Blatt "Rohdatenblatt" der BUE-Datei holen: Zeile ueber den Code in Spalte A (heute 1:1 dieselbe Zeile; nach
' „KPI löschen“ in Rohdaten rutschen die BUE-Zeilen hier nach oben, in der BUE-Datei nicht), Spalte ueber das Datum in Zeile 1 – genauer den Freitag der KW: Rohdaten-Spalten heissen ab KW 42 wie ihr Meldetag (Montag
' 19.10.2026 = KW 42), im BUE-Reporting steht je KW der Freitag (16.10.2026). Nur Datumsspalten ab der ersten Woche des BUE-Reportings.
' Das BUE-Reporting gilt: ein fester Wert (frueher von Hand oder aus der Vorlage, z. B. ein Freitagsstand) wird ersetzt, sobald
' die BUE-Datei fuer Code und Woche eine Zahl hat (dort der Stand des letzten Stichtags der KW, i. d. R. Sonntag); nur wo sie
' keine hat, bleibt der feste Wert stehen.
' Leere BUE-Werte erscheinen als leere Zelle (""), damit Summen, Diagramme und der Assistent sie als "fehlt" erkennen.
' Fuer dieselben Zellen setzt das Makro im ausgeblendeten Blatt "Wertstand" (gleicher Aufbau wie Rohdaten) Formeln auf den
' Stand der Werte im BUE-Reporting: 7VA bis 7VL aus Zeile 160 (7VS, Stand Verbund), 7OA bis 7OL aus Zeile 161 (7OS, Stand OPAG),
' ebenfalls ueber das Datum in Zeile 1, Format TT.MM.JJJJ. Leer ("") bei leerem Stand oder aelterer BUE-Datei ohne diese Zeilen.
' Bleibt ein von Hand eingetragener Wert stehen, bleibt auch sein Stand in Wertstand stehen. Fehlt das Blatt Wertstand (aeltere
' Datei), werden nur die Werte verknuepft.
' Die gewaehlte Datei steht danach in Konfiguration!C10.
' Vorher sucht das Makro die BUE-Datei selbst (BueSuchen): Liegt das Dashboard auf SharePoint, eine Ebene hoeher im Ordner
' „BÜ - HS“ (auch „BÜ\BÜ - HS“ und dasselbe eine weitere Ebene hoeher), danach Konfiguration!C10. Die erste Datei, die sich
' oeffnen laesst, wird zur Bestaetigung angeboten; sonst wie bisher Dateiauswahl bzw. Adresse aus dem Browser.
' ============================================================================

Private Const BLATT_BUE As String = "Rohdatenblatt"
Private Const BUE_DATEI As String = "BUE_Reporting_Master.xlsm"
Private Const BUE_ORDNER As String = "BÜ - HS"
Private Const ZEILE_STAND_V As Long = 160               ' Rohdatenblatt der BUE-Datei: 7VS, Stand der Werte Verbund
Private Const ZEILE_STAND_O As Long = 161               ' 7OS, Stand der Werte OPAG

Public Function VerknuepfungVersion() As String
    VerknuepfungVersion = "2"
End Function

Public Sub Verknuepfen()
    Dim datei As Variant, wbB As Workbook, wb As Workbook, wsB As Worksheet, wsR As Worksheet, warOffen As Boolean
    Dim zeilen() As Long, n As Long, r As Long, c As Long, erste As Double, v As Variant, gesetzt As Long, behalten As Long
    Dim ref As String, sp As String, idx As String, f As String, code As String, abweichung As String, i As Long
    Dim calc As Long, gefunden As Boolean
    Dim wsS As Worksheet, standZ() As Long, idxS As String, gesetztS As Long, standFehlt As Boolean, bZ() As Long, k As Long, spA As Variant
    Dim kopfB As Variant, cB As Long, ersetzt As Long, hatZahl As Boolean, wertB As Variant
    modKarte.KartenEntfernen
    ' zuerst selbst suchen (SharePoint: ../BÜ - HS), Vorschlag bestaetigen lassen
    Set wbB = BueSuchen(datei, warOffen)
    If Not wbB Is Nothing Then
        If MsgBox("BÜ-Reporting gefunden:" & vbCrLf & CStr(datei) & vbCrLf & vbCrLf & "Damit verknüpfen?" & vbCrLf & _
                  "(Nein = andere Datei wählen)", vbQuestion + vbYesNo, "BÜ-Reporting verknüpfen") = vbYes Then
            gefunden = True
        Else
            If Not warOffen Then wbB.Close False
            Set wbB = Nothing
            warOffen = False
        End If
    End If
    If Not gefunden Then datei = Application.GetOpenFilename("Excel-Dateien (*.xlsm;*.xlsx),*.xlsm;*.xlsx", , "BÜ-Reporting auswählen (BUE_Reporting_Master.xlsm)")
    If VarType(datei) = vbBoolean Then
        ' Datei liegt auf SharePoint (im Dialog nicht erreichbar): Adresse aus der Adresszeile des Browsers einfügen (Ordner oder Datei);
        ' die Verknüpfung läuft dann über die SharePoint-Adresse (Excel aktualisiert sie mit der Office-Anmeldung)
        datei = InputBox("Liegt das BÜ-Reporting auf SharePoint? Dann die Adresse des Ordners (oder der Datei) aus der Adresszeile des Browsers einfügen " & _
                         "(leer lassen = abbrechen):", "BÜ-Reporting auf SharePoint", CStr(ThisWorkbook.Worksheets("Konfiguration").Range("C10").Value))
        If Len(Trim$(CStr(datei))) = 0 Then Exit Sub
        datei = modBasis.DateiPfad(CStr(datei), "BUE_Reporting_Master.xlsm")
    End If
    On Error GoTo Fehler
    calc = Application.Calculation
    If gefunden Then GoTo Offen                              ' von BueSuchen geoeffnet (am Ende geschlossen, wenn sie vorher zu war)
    For Each wb In Application.Workbooks
        If LCase$(modBasis.UrlDekodieren(wb.FullName)) = LCase$(modBasis.UrlDekodieren(CStr(datei))) Then
            Set wbB = wb
            warOffen = True
        End If
    Next wb
    Application.ScreenUpdating = False
    If wbB Is Nothing Then Set wbB = Application.Workbooks.Open(CStr(datei), 0, True)
Offen:
    Application.ScreenUpdating = False
    ThisWorkbook.Activate
    On Error Resume Next
    Set wsB = wbB.Worksheets(BLATT_BUE)
    On Error GoTo Fehler
    If wsB Is Nothing Then
        If Not warOffen Then wbB.Close False
        Application.ScreenUpdating = True
        modKarte.Hinweis "BÜ-Reporting verknüpfen", "Die gewählte Datei hat kein Blatt „" & BLATT_BUE & "“. Bitte die Master-Datei des BÜ-Reportings wählen.", True
        Exit Sub
    End If
    ' Zeilen 7VA bis 7OL in Rohdaten (nach Code in Spalte A) und dieselben Codes in der BUE-Datei (Spalte A; fehlt einer dort,
    ' gilt dieselbe Zeile wie hier und der Code wird gemeldet)
    Set wsR = ThisWorkbook.Worksheets("Rohdaten")
    ReDim zeilen(1 To 40)
    ReDim standZ(1 To 40)
    ReDim bZ(1 To 40)
    spA = wsB.Range("A1:A400").Value
    For r = 3 To 400
        code = UCase$(Trim$(CStr(wsR.Cells(r, 1).Value)))
        If Len(code) = 3 And (Left$(code, 2) = "7V" Or Left$(code, 2) = "7O") And n < 40 Then
            n = n + 1
            zeilen(n) = r
            standZ(n) = IIf(Left$(code, 2) = "7O", ZEILE_STAND_O, ZEILE_STAND_V)      ' Zeile mit dem Stand in der BUE-Datei
            bZ(n) = 0
            For k = 1 To 400
                If Not IsError(spA(k, 1)) Then
                    If UCase$(Trim$(CStr(spA(k, 1)))) = code Then bZ(n) = k: Exit For
                End If
            Next k
            If bZ(n) = 0 Then
                bZ(n) = r
                abweichung = abweichung & " " & code
            End If
        End If
    Next r
    If n = 0 Then Err.Raise vbObjectError + 1, , "In Rohdaten wurden die Zeilen 7VA bis 7OL nicht gefunden."
    ' Blatt Wertstand (Stand der Werte); fehlt es (aeltere Datei), werden nur die Werte verknuepft
    On Error Resume Next
    Set wsS = ThisWorkbook.Worksheets("Wertstand")
    On Error GoTo Fehler
    If Not wsS Is Nothing Then
        ' aeltere BUE-Datei ohne die Stand-Zeilen: Formeln trotzdem setzen (liefern "" bis die Zeilen da sind), Hinweis zeigen
        If UCase$(Trim$(CStr(wsB.Cells(ZEILE_STAND_V, 1).Value))) <> "7VS" Then standFehlt = True
        If UCase$(Trim$(CStr(wsB.Cells(ZEILE_STAND_O, 1).Value))) <> "7OS" Then standFehlt = True
    End If
    ' erste Woche im BUE-Reporting
    erste = 0
    For c = 9 To 800
        v = wsB.Cells(1, c).Value2
        If IsNumeric(v) And Not IsEmpty(v) Then
            If CDbl(v) > 40000 Then
                erste = CDbl(v)
                Exit For
            End If
        End If
    Next c
    kopfB = wsB.Range("A1:ZZ1").Value2                       ' Datumszeile der BUE-Datei (fuer „hat sie hier eine Zahl?“)
    Application.Calculation = xlCalculationManual
    ref = "'[" & wbB.Name & "]" & BLATT_BUE & "'!"
    For c = 9 To modBasis.RD_LETZTE_SPALTE
        v = wsR.Cells(1, c).Value2
        If IsNumeric(v) And Not IsEmpty(v) Then
            If CDbl(v) >= erste And erste > 0 Then
                sp = Split(wsR.Cells(1, c).Address(True, False), "$")(0)
                cB = 0
                For k = 1 To UBound(kopfB, 2)
                    If Not IsError(kopfB(1, k)) Then
                        If IsNumeric(kopfB(1, k)) And Not IsEmpty(kopfB(1, k)) Then
                            If CLng(kopfB(1, k)) = CLng(v) - ((Weekday(CDate(v), vbMonday) + 2) Mod 7) Then cB = k: Exit For
                        End If
                    End If
                Next k
                For i = 1 To n
                    r = zeilen(i)
                    hatZahl = False
                    If cB > 0 Then
                        wertB = wsB.Cells(bZ(i), cB).Value2
                        If Not IsError(wertB) Then
                            If Not IsEmpty(wertB) Then
                                If IsNumeric(wertB) And VarType(wertB) <> vbString Then hatZahl = True
                            End If
                        End If
                    End If
                    If Not wsR.Cells(r, c).HasFormula And Not IsEmpty(wsR.Cells(r, c).Value) And hatZahl Then ersetzt = ersetzt + 1
                    If wsR.Cells(r, c).HasFormula Or IsEmpty(wsR.Cells(r, c).Value) Or hatZahl Then
                        idx = "INDEX(" & ref & "$A$" & bZ(i) & ":$ZZ$" & bZ(i) & ",MATCH(" & sp & "$1-MOD(WEEKDAY(" & sp & "$1,2)+2,7)," & ref & "$A$1:$ZZ$1,0))"
                        f = "=IFERROR(IF(ISNUMBER(" & idx & ")," & idx & ",""""),"""")"
                        wsR.Cells(r, c).Formula = f
                        gesetzt = gesetzt + 1
                        If Not wsS Is Nothing Then
                            ' Stand der Werte in dieselbe Zelle von Wertstand: Stand-Zeile der BUE-Datei, Spalte ueber dasselbe Datum
                            idxS = "INDEX(" & ref & "$A$" & standZ(i) & ":$ZZ$" & standZ(i) & ",MATCH(Rohdaten!" & sp & "$1-MOD(WEEKDAY(Rohdaten!" & sp & "$1,2)+2,7)," & ref & "$A$1:$ZZ$1,0))"
                            wsS.Cells(r, c).Formula = "=IFERROR(IF(ISNUMBER(" & idxS & ")," & idxS & ",""""),"""")"
                            wsS.Cells(r, c).NumberFormat = "dd.mm.yyyy"
                            gesetztS = gesetztS + 1
                        End If
                    Else                                    ' fester Wert, BUE-Datei hat hier keine Zahl: Wert und Stand bleiben
                        behalten = behalten + 1
                    End If
                Next i
            End If
        End If
    Next c
    ThisWorkbook.Worksheets("Konfiguration").Range("C10").Value = CStr(datei)
    If Not warOffen Then wbB.Close False
    Application.Calculation = calc
    Application.Calculate
    Application.ScreenUpdating = True
    ThisWorkbook.Worksheets("Start").Activate
    modKarte.Hinweis "BÜ-Reporting verknüpft", gesetzt & " Zellen in Rohdaten (Zeilen 7VA bis 7OL) holen ihre Werte jetzt aus" & vbCr & CStr(datei) & vbCr & _
        IIf(gesetztS > 0, "Den Stand der Werte (Blatt Wertstand) holen sie ebenfalls von dort." & vbCr, "") & _
        IIf(standFehlt, "Die BÜ-Datei hat noch keine Zeilen für den Stand der Werte (7VS, 7OS) – der Stand bleibt leer, bis sie da sind." & vbCr, "") & _
        IIf(ersetzt > 0, ersetzt & " fest eingetragene Werte (z. B. Freitagsstände aus der Vorlage) sind durch die Werte des BÜ-Reportings ersetzt." & vbCr, "") & _
        IIf(behalten > 0, behalten & " fest eingetragene Werte sind stehen geblieben (dort hat das BÜ-Reporting keine Zahl)." & vbCr, "") & _
        IIf(Len(abweichung) > 0, "Achtung, diese Codes fehlen in der BÜ-Datei (Spalte A), verknüpft ist dieselbe Zeile wie hier:" & abweichung & vbCr, "") & _
        "Beim nächsten Öffnen fragt Excel nach dem Aktualisieren der Verknüpfung – „Inhalte aktivieren“ bzw. „Aktualisieren“ wählen.", Len(abweichung) > 0
    Exit Sub
Fehler:
    Dim t As String
    t = Err.Description
    On Error Resume Next
    If Not wbB Is Nothing And Not warOffen Then wbB.Close False
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True
    modKarte.Hinweis "BÜ-Reporting verknüpfen", "Die Verknüpfung konnte nicht gesetzt werden: " & t, True
End Sub

' BUE-Datei selbst suchen und die erste, die sich oeffnen laesst, geoeffnet zurueckgeben (pfad = ihre Adresse); Nothing = keine.
' Reihenfolge: Dashboard auf SharePoint -> erst die Ordner neben dem Dashboard, dann C10; lokal -> erst C10, dann die Ordner.
Private Function BueSuchen(ByRef pfad As Variant, ByRef warSchonOffen As Boolean) As Workbook
    Dim kand As Collection, k As Variant, wb As Workbook, sicherheit As Long, alt As Boolean
    Set kand = BueKandidaten()
    For Each k In kand
        ' schon offen?
        For Each wb In Application.Workbooks
            If LCase$(modBasis.UrlDekodieren(wb.FullName)) = LCase$(modBasis.UrlDekodieren(CStr(k))) Then pfad = CStr(k): warSchonOffen = True: Set BueSuchen = wb: Exit Function
        Next wb
        If LCase$(Left$(CStr(k), 4)) <> "http" Then
            If Not modBasis.DateiDa(CStr(k)) Then GoTo Naechster
        End If
        Application.StatusBar = "Suche BÜ-Reporting: " & CStr(k)
        sicherheit = Application.AutomationSecurity
        alt = Application.DisplayAlerts
        Application.AutomationSecurity = 3                    ' msoAutomationSecurityForceDisable: keine Makros der BUE-Datei
        Application.DisplayAlerts = False
        Set wb = Nothing
        On Error Resume Next
        Set wb = Application.Workbooks.Open(CStr(k), 0, True)
        On Error GoTo 0
        Application.DisplayAlerts = alt
        Application.AutomationSecurity = sicherheit
        Application.StatusBar = False
        If Not wb Is Nothing Then
            ThisWorkbook.Activate
            pfad = CStr(k)
            Set BueSuchen = wb
            Exit Function
        End If
Naechster:
    Next k
End Function

Private Function BueKandidaten() As Collection
    Dim c As New Collection, basis As String, sep As String, eltern As String, gross As String, c10 As String, sp As Boolean
    basis = ThisWorkbook.Path
    sp = (LCase$(Left$(basis, 4)) = "http")
    If sp Then basis = modBasis.UrlDekodieren(basis): sep = "/" Else sep = Application.PathSeparator
    Do While Right$(basis, 1) = sep: basis = Left$(basis, Len(basis) - 1): Loop
    If InStrRev(basis, sep) > 0 Then eltern = Left$(basis, InStrRev(basis, sep) - 1)
    If InStrRev(eltern, sep) > 0 Then gross = Left$(eltern, InStrRev(eltern, sep) - 1)
    c10 = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("C10").Value))
    If Len(c10) > 0 Then c10 = modBasis.DateiPfad(c10, BUE_DATEI)
    On Error Resume Next                                      ' doppelte Eintraege (Schluessel) werden uebergangen
    If Not sp And Len(c10) > 0 Then c.Add c10, LCase$(c10)
    If Len(eltern) > 0 Then
        c.Add eltern & sep & BUE_ORDNER & sep & BUE_DATEI, LCase$(eltern & sep & BUE_ORDNER & sep & BUE_DATEI)
        c.Add eltern & sep & "BÜ" & sep & BUE_ORDNER & sep & BUE_DATEI, LCase$(eltern & sep & "BÜ" & sep & BUE_ORDNER & sep & BUE_DATEI)
    End If
    If Len(gross) > 0 And InStr(gross, "/sites/") + InStr(gross, "/teams/") + IIf(sp, 0, 1) > 0 Then   ' nicht ueber die SharePoint-Seite hinaus
        c.Add gross & sep & BUE_ORDNER & sep & BUE_DATEI, LCase$(gross & sep & BUE_ORDNER & sep & BUE_DATEI)
        c.Add gross & sep & "BÜ" & sep & BUE_ORDNER & sep & BUE_DATEI, LCase$(gross & sep & "BÜ" & sep & BUE_ORDNER & sep & BUE_DATEI)
    End If
    c.Add basis & sep & BUE_DATEI, LCase$(basis & sep & BUE_DATEI)
    If sp And Len(c10) > 0 Then c.Add c10, LCase$(c10)
    On Error GoTo 0
    Set BueKandidaten = c
End Function
