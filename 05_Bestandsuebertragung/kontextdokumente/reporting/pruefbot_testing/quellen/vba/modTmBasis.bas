Option Explicit
' ============================================================================
' modTmBasis - Hilfen fuer den Testmail-Generator
'
' - Tabellen lesen: in Excel ueber ListObjects, sonst (LibreOffice) ueber die Kopfzeile, die auf dem Blatt gesucht wird.
'   Alle Werte werden einmal je Aufruf in Arrays geladen (TabellenLaden); Suchen laufen auf den Arrays.
' - Einstellungen ueber die Namen cfg_<Schluessel> (Blatt Testmail-Generator).
' - Text-, Zahl- und Datumsformate (TT.MM.JJJJ, Nummern ohne Exponent).
' Keine Excel-Oberflaeche in diesem Modul: es laeuft auch in LibreOffice (Pruefung ohne Dialoge).
' ============================================================================

Private Const T_ANZ As Long = 8
Private tName(1 To T_ANZ) As String
Private tBlatt(1 To T_ANZ) As String
Private tKopf1(1 To T_ANZ) As String
Private tKopf2(1 To T_ANZ) As String
Private tKopfZeile(1 To T_ANZ) As Long
Private tSpalte0(1 To T_ANZ) As Long
Private tSpalten(1 To T_ANZ) As Long
Private tZeilen(1 To T_ANZ) As Long
' Kopf und Daten je Tabelle in eigenen Variablen (nicht als Array in einem Array: LibreOffice verliert sonst nach dem
' Lesen leerer Elemente den Zustand des aeusseren Arrays)
Private k1 As Variant, k2 As Variant, k3 As Variant, k4 As Variant, k5 As Variant, k6 As Variant, k7 As Variant, k8 As Variant
Private d1 As Variant, d2 As Variant, d3 As Variant, d4 As Variant, d5 As Variant, d6 As Variant, d7 As Variant, d8 As Variant
Private tOk(1 To T_ANZ) As Boolean
Private tDefiniert As Boolean

Public Const BLATT_GEN As String = "Testmail-Generator"
Public Const BLATT_MAIL As String = "To-do Mailerstellung"

Private Sub Definieren()
    If tDefiniert Then Exit Sub
    Def 1, "tblMailAuftraege", BLATT_MAIL, "Mail-Auftrags-ID", "Testfall-ID"
    Def 2, "tblMatrix", "Testfall-Matrix", "Testfall-ID", "Testausprägungen"
    Def 3, "tblAgenturen", "Stammdaten", "Aufnehmende Agentur-ID", "Aufnehmende Agenturkonstellation"
    Def 4, "tblVertraege", "Stammdaten", "Datensatz-ID", "Vertrag-ID"
    Def 5, "tblMailanforderungen", "Mailanforderungen", "Mail-ID / Zustand", "Mailvariante"
    Def 6, "tblGeneratorEingaben", BLATT_GEN, "Mail-Auftrags-ID", "Testfall-ID"
    Def 7, "tblVertragskonstellationen", "Vertragskonstellationen", "Vertrag-ID", "Fachliche Gruppe"
    Def 8, "tblTestmailProtokoll", BLATT_GEN, "Zeitpunkt", "Mail-Auftrags-ID"
    tDefiniert = True
End Sub

Private Sub Def(i As Long, n As String, b As String, erster As String, zweiter As String)
    tName(i) = n: tBlatt(i) = b: tKopf1(i) = erster: tKopf2(i) = zweiter
End Sub

Private Sub KopfSetzen(i As Long, v As Variant)
    Select Case i
        Case 1: k1 = v
        Case 2: k2 = v
        Case 3: k3 = v
        Case 4: k4 = v
        Case 5: k5 = v
        Case 6: k6 = v
        Case 7: k7 = v
        Case 8: k8 = v
    End Select
End Sub

Private Sub DatenSetzen(i As Long, v As Variant)
    Select Case i
        Case 1: d1 = v
        Case 2: d2 = v
        Case 3: d3 = v
        Case 4: d4 = v
        Case 5: d5 = v
        Case 6: d6 = v
        Case 7: d7 = v
        Case 8: d8 = v
    End Select
End Sub

Private Function KopfWert(i As Long, c As Long) As String
    Select Case i
        Case 1: KopfWert = CStr(k1(1, c))
        Case 2: KopfWert = CStr(k2(1, c))
        Case 3: KopfWert = CStr(k3(1, c))
        Case 4: KopfWert = CStr(k4(1, c))
        Case 5: KopfWert = CStr(k5(1, c))
        Case 6: KopfWert = CStr(k6(1, c))
        Case 7: KopfWert = CStr(k7(1, c))
        Case 8: KopfWert = CStr(k8(1, c))
    End Select
End Function

Private Function DatenWert(i As Long, r As Long, c As Long) As Variant
    Select Case i
        Case 1: DatenWert = d1(r, c)
        Case 2: DatenWert = d2(r, c)
        Case 3: DatenWert = d3(r, c)
        Case 4: DatenWert = d4(r, c)
        Case 5: DatenWert = d5(r, c)
        Case 6: DatenWert = d6(r, c)
        Case 7: DatenWert = d7(r, c)
        Case 8: DatenWert = d8(r, c)
    End Select
End Function

Private Function Nr(tabelle As String) As Long
    Dim i As Long
    Definieren
    For i = 1 To T_ANZ
        If StrComp(tName(i), tabelle, vbTextCompare) = 0 Then Nr = i: Exit Function
    Next i
End Function

' Alle Tabellen neu einlesen (am Anfang jedes oeffentlichen Aufrufs)
Public Sub TabellenLaden()
    Dim i As Long
    Definieren
    For i = 1 To T_ANZ
        TabelleLaden i
    Next i
End Sub

Private Sub TabelleLaden(i As Long)
    Dim ws As Object, lo As Object, ok As Boolean
    tOk(i) = False
    tZeilen(i) = 0
    tSpalten(i) = 0
    KopfSetzen i, Empty
    DatenSetzen i, Empty
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(tBlatt(i))
    If ws Is Nothing Then Exit Sub
    Set lo = Nothing
    Set lo = ws.ListObjects(tName(i))
    On Error GoTo 0
    If Not lo Is Nothing Then
        On Error Resume Next
        tKopfZeile(i) = lo.HeaderRowRange.Row
        tSpalte0(i) = lo.HeaderRowRange.Column
        tSpalten(i) = lo.ListColumns.Count
        tZeilen(i) = lo.ListRows.Count
        KopfSetzen i, lo.HeaderRowRange.Value
        If tZeilen(i) > 0 Then DatenSetzen i, lo.DataBodyRange.Value
        ok = (Err.Number = 0)
        On Error GoTo 0
        If ok Then tOk(i) = True: Exit Sub
    End If
    ' Rueckfall ohne ListObjects (LibreOffice): Kopfzeile ueber die ersten beiden Spaltennamen suchen
    KopfSuchen i, ws
End Sub

Private Sub KopfSuchen(i As Long, ws As Object)
    Dim v As Variant, r As Long, c As Long, r0 As Long, c0 As Long, n As Long, k As Long
    Dim ur As Object
    On Error GoTo Ende
    Set ur = ws.UsedRange
    v = ur.Value
    r0 = ur.Row: c0 = ur.Column
    For r = 1 To UBound(v, 1)
        For c = 1 To UBound(v, 2) - 1
            If CStr(v(r, c)) = tKopf1(i) Then
                If CStr(v(r, c + 1)) = tKopf2(i) Then
                    tKopfZeile(i) = r0 + r - 1
                    tSpalte0(i) = c0 + c - 1
                    k = 0
                    Do While c + k <= UBound(v, 2)
                        If Len(CStr(v(r, c + k))) = 0 Then Exit Do
                        k = k + 1
                    Loop
                    tSpalten(i) = k
                    n = 0
                    Do While r + n + 1 <= UBound(v, 1)
                        If Len(Trim$(CStr(v(r + n + 1, c)))) = 0 Then Exit Do
                        n = n + 1
                    Loop
                    tZeilen(i) = n
                    KopfSetzen i, ws.Range(ws.Cells(tKopfZeile(i), tSpalte0(i)), ws.Cells(tKopfZeile(i), tSpalte0(i) + k - 1)).Value
                    If n > 0 Then
                        DatenSetzen i, ws.Range(ws.Cells(tKopfZeile(i) + 1, tSpalte0(i)), _
                                                ws.Cells(tKopfZeile(i) + n, tSpalte0(i) + k - 1)).Value
                    End If
                    tOk(i) = True
                    Exit Sub
                End If
            End If
        Next c
    Next r
Ende:
End Sub

Public Function TabDa(tabelle As String) As Boolean
    Dim i As Long
    i = Nr(tabelle)
    If i > 0 Then TabDa = tOk(i)
End Function

Public Function TabAnzahl(tabelle As String) As Long
    Dim i As Long
    i = Nr(tabelle)
    If i > 0 Then TabAnzahl = tZeilen(i)
End Function

Public Function TabSpalte(tabelle As String, spalte As String) As Long
    Dim i As Long, c As Long
    i = Nr(tabelle)
    If i = 0 Then Exit Function
    If Not tOk(i) Then Exit Function
    For c = 1 To tSpalten(i)
        If StrComp(KopfWert(i, c), spalte, vbTextCompare) = 0 Then TabSpalte = c: Exit Function
    Next c
End Function

' Datenzeile (1 = erste Datenzeile), in der die Spalte den Wert hat (ohne Gross/Klein, Leerzeichen am Rand egal)
Public Function TabZeile(tabelle As String, spalte As String, wert As String) As Long
    Dim i As Long, c As Long, r As Long
    i = Nr(tabelle)
    If i = 0 Then Exit Function
    c = TabSpalte(tabelle, spalte)
    If c = 0 Or Len(Trim$(wert)) = 0 Then Exit Function
    For r = 1 To tZeilen(i)
        If StrComp(Txt(DatenWert(i, r, c)), Trim$(wert), vbTextCompare) = 0 Then TabZeile = r: Exit Function
    Next r
End Function

Public Function TabWert(tabelle As String, zeile As Long, spalte As String) As Variant
    Dim i As Long, c As Long
    TabWert = Empty
    i = Nr(tabelle)
    If i = 0 Then Exit Function
    If zeile < 1 Or zeile > tZeilen(i) Then Exit Function
    c = TabSpalte(tabelle, spalte)
    If c = 0 Then Exit Function
    TabWert = DatenWert(i, zeile, c)
End Function

Public Function TabText(tabelle As String, zeile As Long, spalte As String) As String
    TabText = Txt(TabWert(tabelle, zeile, spalte))
End Function

' Zieladresse fuer "Zum Feld": Blatt!$X$n (leer, wenn Zeile oder Spalte fehlt)
Public Function TabZelle(tabelle As String, zeile As Long, spalte As String) As String
    Dim i As Long, c As Long
    i = Nr(tabelle)
    If i = 0 Then Exit Function
    c = TabSpalte(tabelle, spalte)
    If c = 0 Or zeile < 1 Then Exit Function
    TabZelle = tBlatt(i) & "!" & ZellAdresse(tKopfZeile(i) + zeile, tSpalte0(i) + c - 1)
End Function

Public Function TabBlattZeile(tabelle As String, zeile As Long) As Long
    Dim i As Long
    i = Nr(tabelle)
    If i > 0 Then TabBlattZeile = tKopfZeile(i) + zeile
End Function

Public Function TabBlattSpalte(tabelle As String, spalte As String) As Long
    Dim i As Long, c As Long
    i = Nr(tabelle)
    If i = 0 Then Exit Function
    c = TabSpalte(tabelle, spalte)
    If c > 0 Then TabBlattSpalte = tSpalte0(i) + c - 1
End Function

Public Function TabBlatt(tabelle As String) As String
    Dim i As Long
    i = Nr(tabelle)
    If i > 0 Then TabBlatt = tBlatt(i)
End Function

Public Function ZellAdresse(zeile As Long, spalte As Long) As String
    Dim s As String, n As Long
    n = spalte
    Do While n > 0
        s = Chr(65 + ((n - 1) Mod 26)) & s
        n = (n - 1) \ 26
    Loop
    ZellAdresse = "$" & s & "$" & zeile
End Function

' ------------------------------------------------------------------ Einstellungen
Public Function Einst(schluessel As String) As String
    Dim v As Variant
    On Error GoTo Ende
    v = ThisWorkbook.Names("cfg_" & schluessel).RefersToRange.Value
    Einst = Txt(v)
Ende:
End Function

Public Function EinstZelle(schluessel As String) As String
    Dim rng As Object
    On Error GoTo Ende
    Set rng = ThisWorkbook.Names("cfg_" & schluessel).RefersToRange
    EinstZelle = rng.Worksheet.Name & "!" & ZellAdresse(rng.Row, rng.Column)
Ende:
End Function

' ------------------------------------------------------------------ Texte, Zahlen, Datum
Public Function Txt(v As Variant) As String
    If IsArray(v) Then Exit Function
    If IsError(v) Then Exit Function
    If IsEmpty(v) Or IsNull(v) Then Exit Function
    Select Case VarType(v)
        Case vbBoolean
            Txt = IIf(v, "WAHR", "FALSCH")
        Case vbDate
            Txt = DatumText(CDate(v))
        Case vbString
            Txt = Trim$(Replace(CStr(v), ChrW(160), " "))
        Case vbDouble, vbSingle, vbLong, vbInteger, vbCurrency, vbDecimal, vbByte
            If CDbl(v) = Int(CDbl(v)) And Abs(CDbl(v)) < 1E+15 Then
                Txt = Format(CDbl(v), "0")
            Else
                Txt = Trim$(CStr(v))
            End If
        Case Else
            Txt = Trim$(CStr(v))
    End Select
End Function

Public Function DatumText(d As Date) As String
    DatumText = Right$("0" & Day(d), 2) & "." & Right$("0" & Month(d), 2) & "." & Year(d)
End Function

Public Function ZeitText(d As Date) As String
    ZeitText = Right$("0" & Hour(d), 2) & ":" & Right$("0" & Minute(d), 2)
End Function

' Wert (Datum, Seriennummer oder Text TT.MM.JJJJ) -> Datum; ok = False, wenn nicht lesbar (auch bei Tippfehlern wie
' "12.03.198500": Jahr ausserhalb 1900 bis 2100). Loest nie einen Laufzeitfehler aus.
Public Function DatumAus(v As Variant, ByRef ok As Boolean) As Date
    Dim s As String, t As Variant, j As Double
    ok = False
    On Error GoTo Ende
    If IsError(v) Or IsEmpty(v) Then Exit Function
    If VarType(v) = vbDate Then
        DatumAus = CDate(v)
        ok = True
        Exit Function
    End If
    If VarType(v) = vbDouble Or VarType(v) = vbLong Or VarType(v) = vbInteger Then
        If CDbl(v) > 0 And CDbl(v) < 73051 Then
            DatumAus = CDate(CDbl(v))
            ok = True
        End If
        Exit Function
    End If
    s = Trim$(CStr(v))
    t = Split(s, ".")
    If UBound(t) <> 2 Then Exit Function
    If Not (IsNumeric(t(0)) And IsNumeric(t(1)) And IsNumeric(t(2))) Then Exit Function
    If Val(t(1)) < 1 Or Val(t(1)) > 12 Or Val(t(0)) < 1 Or Val(t(0)) > 31 Then Exit Function
    If Len(Trim$(t(2))) = 2 Then t(2) = "19" & Trim$(t(2))
    j = Val(t(2))
    If j < 1900 Or j > 2100 Or j <> Int(j) Then Exit Function
    DatumAus = DateSerial(CInt(j), CInt(Val(t(1))), CInt(Val(t(0))))
    If Day(DatumAus) <> Val(t(0)) Then Exit Function
    ok = True
Ende:
End Function

Public Function IstLeer(s As String) As Boolean
    IstLeer = (Len(Trim$(s)) = 0)
End Function

' Dateiname nur aus ASCII: Umlaute umschreiben, alles andere ausser A-Z a-z 0-9 - _ . zu "-"
Public Function DateinameAscii(s As String) As String
    Dim i As Long, ch As String, c As Long, aus As String
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        c = AscW(ch)
        If c < 0 Then c = c + 65536
        Select Case c
            Case 48 To 57, 65 To 90, 97 To 122, 45, 95, 46
                aus = aus & ch
            Case 228: aus = aus & "ae"
            Case 246: aus = aus & "oe"
            Case 252: aus = aus & "ue"
            Case 196: aus = aus & "Ae"
            Case 214: aus = aus & "Oe"
            Case 220: aus = aus & "Ue"
            Case 223: aus = aus & "ss"
            Case Else
                If Right$(aus, 1) <> "-" Then aus = aus & "-"
        End Select
    Next i
    DateinameAscii = aus
End Function
