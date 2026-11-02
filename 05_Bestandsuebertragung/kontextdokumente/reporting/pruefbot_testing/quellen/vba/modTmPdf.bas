Option Explicit
' ============================================================================
' modTmPdf - PDF-Dokumente ohne Vorlage und ohne Druckertreiber (Maklervollmacht, Pool-Vollmacht, Betreuungswunsch,
' Untervollmacht). A4 einseitig, Standardschriften Helvetica / Helvetica-Bold / Helvetica-Oblique (WinAnsiEncoding).
'
' Die ganze PDF-Datei ist reines ASCII: Zeichen ueber 126 als Oktal-Escape \ooo, Inhalt unkomprimiert. Damit ist
' ein Zeichen genau ein Byte, die xref-Offsets sind Len()-Werte, und geschrieben wird mit Put (modTmEml).
' Die Unterschrift ist ein Bezier-Pfad aus dem Namen (modTmSign). Beschriftungen folgen der Vorlage des Fachbereichs
' (Vertragsnummer, Sparte, Versicherungsnehmer / Firma, Anschrift, Geburtsdatum, Makler / aufnehmende Agentur,
' Agenturnummer, Vermittlernummer / PNR, Kontakt, Vollmachtsumfang, Ort, Datum, Unterschrift Versicherungsnehmer).
' ============================================================================

Public Const PAGE_W As Double = 595.28
Public Const PAGE_H As Double = 841.89
Private Const ML As Double = 56.69
Private Const MT As Double = 51.02
Private Const MB As Double = 42.52
Private Const CW As Double = 481.9

Private Const C_INK As String = "0.11 0.15 0.20"
Private Const C_GRAY As String = "0.38 0.42 0.48"
Private Const C_LIGHT As String = "0.84 0.86 0.89"
Private Const C_ACCENT As String = "0.12 0.23 0.37"
Private Const C_FILL As String = "0.945 0.949 0.965"
Private Const C_BORDER As String = "0.62 0.65 0.71"
Private Const C_SIGFILL As String = "0.973 0.976 0.984"
Private Const C_PH As String = "0.70 0.36 0.00"

' Umschrift fuer U+0100 bis U+017F (Latin Extended-A) auf Buchstaben der Standardschrift (L mit Strich -> L,
' z mit Punkt -> z, i ohne Punkt -> i, s mit Cedille -> s, o mit Doppelakut -> ö ...); "?" = steht direkt in cp1252
' (S/Z mit Hacek, OE ...) und wird vorher abgebildet.
Private Const UMSCHRIFT_A As String = "AaAaAaCcCcCcCcDdDdEeEeEeEeEeGgGgGgGgHhHhIiIiIiIiIiIiJjKkkLlLlLlLlLlNnNnNnnNnOoOoÖö??RrRrRrSsSsSs??TtTtTtUuUuUuUuÜüUuWwYy?ZzZz??s"

Private wReg(0 To 223) As Long
Private wBold(0 To 223) As Long
Private wInit As Boolean

Private bufS As String
Private bufN As Long
Private pY As Double
Private pPitch As Double
Private pLead As Double
Private pDok As Long

' ------------------------------------------------------------------ Zahlen, Zeichen, Breiten
Public Function Num(x As Double) As String
    Dim s As String
    s = Replace(Format(x, "0.00"), ",", ".")
    If s = "-0.00" Then s = "0.00"
    Num = s
End Function

Private Sub BreitenLaden()
    Dim t As Variant, i As Long, s As String
    If wInit Then Exit Sub
    s = "278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,"
    s = s & "556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,"
    s = s & "722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,"
    s = s & "278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,"
    s = s & "556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,"
    s = s & "1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,"
    s = s & "500,333,944,0,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,"
    s = s & "333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,"
    s = s & "667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,"
    s = s & "584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,"
    s = s & "556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500"
    t = Split(s, ",")
    For i = 0 To 223
        wReg(i) = CLng(t(i))
    Next i
    s = "278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,"
    s = s & "556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,"
    s = s & "722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,"
    s = s & "278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,"
    s = s & "611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,"
    s = s & "1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,"
    s = s & "556,333,944,0,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,"
    s = s & "333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,"
    s = s & "722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,"
    s = s & "584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,"
    s = s & "556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556"
    t = Split(s, ",")
    For i = 0 To 223
        wBold(i) = CLng(t(i))
    Next i
    wInit = True
End Sub

' Unicode -> WinAnsi (cp1252); Buchstaben ausserhalb cp1252 umgeschrieben (UMSCHRIFT_A, S/T mit Komma), sonst "?"
Public Function WinAnsi(ch As String) As Long
    Dim c As Long, u As String
    WinAnsi = WinAnsiDirekt(ch)
    If WinAnsi >= 0 Then Exit Function
    c = AscW(ch)
    If c < 0 Then c = c + 65536
    WinAnsi = 63
    If c >= &H100 And c <= &H17F Then
        u = Mid$(UMSCHRIFT_A, c - &H100 + 1, 1)
        If u <> "?" Then WinAnsi = AscW(u)
    Else
        Select Case c
            Case &H218: WinAnsi = 83
            Case &H219: WinAnsi = 115
            Case &H21A: WinAnsi = 84
            Case &H21B: WinAnsi = 116
            Case &H2010, &H2011, &H2012, &H2212: WinAnsi = 45
        End Select
    End If
End Function

' Zeichen, das die Standardschrift ohne Umschrift fuehrt (cp1252), als Code; sonst -1
Public Function WinAnsiDirekt(ch As String) As Long
    Dim c As Long
    c = AscW(ch)
    If c < 0 Then c = c + 65536
    If (c >= 32 And c <= 126) Or (c >= 160 And c <= 255) Then WinAnsiDirekt = c: Exit Function
    Select Case c
        Case &H20AC: WinAnsiDirekt = &H80
        Case &H201A: WinAnsiDirekt = &H82
        Case &H192: WinAnsiDirekt = &H83
        Case &H201E: WinAnsiDirekt = &H84
        Case &H2026: WinAnsiDirekt = &H85
        Case &H2020: WinAnsiDirekt = &H86
        Case &H2021: WinAnsiDirekt = &H87
        Case &H2C6: WinAnsiDirekt = &H88
        Case &H2030: WinAnsiDirekt = &H89
        Case &H160: WinAnsiDirekt = &H8A
        Case &H2039: WinAnsiDirekt = &H8B
        Case &H152: WinAnsiDirekt = &H8C
        Case &H17D: WinAnsiDirekt = &H8E
        Case &H2018: WinAnsiDirekt = &H91
        Case &H2019: WinAnsiDirekt = &H92
        Case &H201C: WinAnsiDirekt = &H93
        Case &H201D: WinAnsiDirekt = &H94
        Case &H2022: WinAnsiDirekt = &H95
        Case &H2013: WinAnsiDirekt = &H96
        Case &H2014: WinAnsiDirekt = &H97
        Case &H2DC: WinAnsiDirekt = &H98
        Case &H2122: WinAnsiDirekt = &H99
        Case &H161: WinAnsiDirekt = &H9A
        Case &H203A: WinAnsiDirekt = &H9B
        Case &H153: WinAnsiDirekt = &H9C
        Case &H17E: WinAnsiDirekt = &H9E
        Case &H178: WinAnsiDirekt = &H9F
        Case 9, 10, 13: WinAnsiDirekt = 32
        Case &H2192: WinAnsiDirekt = 62
        Case Else: WinAnsiDirekt = -1
    End Select
End Function

' True, wenn jedes Zeichen ohne Umschrift in der Standardschrift steht
Public Function PdfDarstellbar(s As String) As Boolean
    Dim i As Long
    For i = 1 To Len(s)
        If WinAnsiDirekt(Mid$(s, i, 1)) < 0 Then Exit Function
    Next i
    PdfDarstellbar = True
End Function

' Text so, wie er im PDF steht (umgeschriebene Zeichen, unbekannte als "?")
Public Function PdfUmschrift(s As String) As String
    Dim i As Long, ch As String, aus As String
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        If WinAnsiDirekt(ch) >= 0 Then aus = aus & ch Else aus = aus & ChrW(WinAnsi(ch))
    Next i
    PdfUmschrift = aus
End Function

Public Function TextBreite(s As String, groesse As Double, fett As Boolean) As Double
    Dim i As Long, c As Long, summe As Double
    BreitenLaden
    For i = 1 To Len(s)
        c = WinAnsi(Mid$(s, i, 1))
        If c >= 32 Then
            If fett Then summe = summe + wBold(c - 32) Else summe = summe + wReg(c - 32)
        End If
    Next i
    TextBreite = summe * groesse / 1000#
End Function

Private Function PdfString(s As String) As String
    Dim i As Long, c As Long, aus As String
    For i = 1 To Len(s)
        c = WinAnsi(Mid$(s, i, 1))
        If c = 40 Or c = 41 Or c = 92 Then
            aus = aus & "\" & Chr(c)
        ElseIf c >= 32 And c <= 126 Then
            aus = aus & Chr(c)
        Else
            aus = aus & "\" & Right$("00" & Oct$(c), 3)
        End If
    Next i
    PdfString = "(" & aus & ")"
End Function

Private Function Utf16Hex(s As String) As String
    Dim i As Long, c As Long, h As String
    h = "FEFF"
    For i = 1 To Len(s)
        c = AscW(Mid$(s, i, 1))
        If c < 0 Then c = c + 65536
        h = h & Right$("000" & Hex$(c), 4)
    Next i
    Utf16Hex = "<" & h & ">"
End Function

' Greedy-Umbruch: Woerter anhaengen, solange die Zeile passt; zu lange Woerter zeichenweise brechen; vbLf = Absatz
Public Function Umbruch(text As String, groesse As Double, maxB As Double, fett As Boolean) As Variant
    Dim zeilen() As String, n As Long, absaetze As Variant, woerter As Variant
    Dim a As Long, w As Long, zeile As String, wort As String, kand As String, k As Long
    ReDim zeilen(0 To 0)
    n = 0
    absaetze = Split(Replace(text, vbCrLf, vbLf), vbLf)
    For a = 0 To UBound(absaetze)
        zeile = ""
        woerter = Split(CStr(absaetze(a)), " ")
        For w = 0 To UBound(woerter)
            wort = CStr(woerter(w))
            If Len(wort) > 0 Then
                If Len(zeile) = 0 Then kand = wort Else kand = zeile & " " & wort
                If TextBreite(kand, groesse, fett) <= maxB Then
                    zeile = kand
                Else
                    If Len(zeile) > 0 Then
                        ReDim Preserve zeilen(0 To n)
                        zeilen(n) = zeile: n = n + 1
                        zeile = ""
                    End If
                    Do While TextBreite(wort, groesse, fett) > maxB And Len(wort) > 1
                        k = Len(wort) - 1
                        Do While k > 1 And TextBreite(Left$(wort, k), groesse, fett) > maxB
                            k = k - 1
                        Loop
                        ReDim Preserve zeilen(0 To n)
                        zeilen(n) = Left$(wort, k): n = n + 1
                        wort = Mid$(wort, k + 1)
                    Loop
                    zeile = wort
                End If
            End If
        Next w
        ReDim Preserve zeilen(0 To n)
        zeilen(n) = zeile: n = n + 1
    Next a
    Umbruch = zeilen
End Function

' ------------------------------------------------------------------ Inhaltsstrom
Private Sub OpsNeu()
    bufS = Space$(32768)
    bufN = 0
End Sub

Public Sub OpsAdd(s As String)
    Dim n As Long
    n = Len(s) + 1
    If bufN + n > Len(bufS) Then bufS = bufS & Space$(32768 + n)
    Mid$(bufS, bufN + 1, n) = s & vbLf
    bufN = bufN + n
End Sub

Private Function OpsText() As String
    If bufN > 0 Then OpsText = Left$(bufS, bufN - 1)
End Function

Private Sub PText(x As Double, yTop As Double, s As String, groesse As Double, schrift As String, farbe As String)
    OpsAdd "BT /" & schrift & " " & Num(groesse) & " Tf " & farbe & " rg " & Num(x) & " " & Num(PAGE_H - yTop) & _
           " Td " & PdfString(s) & " Tj ET"
End Sub

Private Sub PTextRechts(xRechts As Double, yTop As Double, s As String, groesse As Double, schrift As String, farbe As String)
    PText xRechts - TextBreite(s, groesse, schrift = "F2"), yTop, s, groesse, schrift, farbe
End Sub

Private Sub PLinie(x1 As Double, y1 As Double, x2 As Double, y2 As Double, breite As Double, farbe As String)
    OpsAdd Num(breite) & " w " & farbe & " RG " & Num(x1) & " " & Num(PAGE_H - y1) & " m " & Num(x2) & " " & _
           Num(PAGE_H - y2) & " l S"
End Sub

Private Sub PRechteck(x As Double, yTop As Double, w As Double, h As Double, fuell As String, rand As String, _
                      lw As Double, r As Double)
    Dim y As Double, k As Double, s As String
    y = PAGE_H - yTop - h
    If Len(fuell) > 0 Then s = fuell & " rg "
    If Len(rand) > 0 Then s = s & rand & " RG " & Num(lw) & " w "
    If r <= 0 Then
        s = s & Num(x) & " " & Num(y) & " " & Num(w) & " " & Num(h) & " re "
    Else
        k = 0.5523 * r
        s = s & Num(x + r) & " " & Num(y) & " m " & Num(x + w - r) & " " & Num(y) & " l "
        s = s & Num(x + w - r + k) & " " & Num(y) & " " & Num(x + w) & " " & Num(y + r - k) & " " & Num(x + w) & " " & Num(y + r) & " c "
        s = s & Num(x + w) & " " & Num(y + h - r) & " l "
        s = s & Num(x + w) & " " & Num(y + h - r + k) & " " & Num(x + w - r + k) & " " & Num(y + h) & " " & Num(x + w - r) & " " & Num(y + h) & " c "
        s = s & Num(x + r) & " " & Num(y + h) & " l "
        s = s & Num(x + r - k) & " " & Num(y + h) & " " & Num(x) & " " & Num(y + h - r + k) & " " & Num(x) & " " & Num(y + h - r) & " c "
        s = s & Num(x) & " " & Num(y + r) & " l "
        s = s & Num(x) & " " & Num(y + r - k) & " " & Num(x + r - k) & " " & Num(y) & " " & Num(x + r) & " " & Num(y) & " c h "
    End If
    If Len(fuell) > 0 And Len(rand) > 0 Then
        s = s & "B"
    ElseIf Len(fuell) > 0 Then
        s = s & "f"
    Else
        s = s & "S"
    End If
    OpsAdd s
End Sub

' ------------------------------------------------------------------ Bausteine (rechnen pY fort)
Private Sub Kopf(titel As String, untertitel As String, rechts As String)
    PText ML, pY + 18, titel, 20, "F2", C_INK
    If Len(rechts) > 0 Then PTextRechts ML + CW, pY + 18, rechts, 8.5, "F1", C_GRAY
    PText ML, pY + 33, untertitel, 9, "F1", C_GRAY
    PLinie ML, pY + 43, ML + CW, pY + 43, 0.5, C_LIGHT
    PLinie ML, pY + 43, ML + 46, pY + 43, 2.2, C_ACCENT
    pY = pY + 56
End Sub

Private Sub Abschnitt(nr As String, titel As String)
    pY = pY + 6
    PRechteck ML, pY, 13, 13, C_ACCENT, "", 0, 2.5
    PText ML + 6.5 - TextBreite(nr, 7.5, True) / 2, pY + 9.4, nr, 7.5, "F2", "1 1 1"
    PText ML + 20, pY + 10, titel, 10.5, "F2", C_INK
    pY = pY + 19
End Sub

' Wertfeld 17 pt hoch; zu langer Wert wird bis 7 pt verkleinert, dann mit Auslassungszeichen gekuerzt.
' Platzhalter [..] erscheinen in Orange, damit sie vor dem Versand auffallen.
Private Sub Feldkasten(x As Double, w As Double, wert As String)
    Dim groesse As Double, v As String, farbe As String
    PRechteck x, pY, w, 17, C_FILL, C_BORDER, 0.6, 2.5
    v = wert
    If Len(v) = 0 Then Exit Sub
    groesse = 10
    Do While TextBreite(v, groesse, False) > w - 12 And groesse > 7
        groesse = groesse - 0.5
    Loop
    If TextBreite(v, groesse, False) > w - 12 Then
        Do While Len(v) > 1 And TextBreite(v & ChrW(8230), groesse, False) > w - 12
            v = Left$(v, Len(v) - 1)
        Loop
        v = RTrim$(v) & ChrW(8230)
    End If
    farbe = C_INK
    If InStr(v, "[") > 0 And InStr(v, "]") > 0 Then farbe = C_PH
    PText x + 6, pY + 11.9, v, groesse, "F1", farbe
End Sub

Private Sub Feld(beschriftung As String, wert As String)
    PText ML + 20, pY + 11.5, beschriftung, 8.5, "F1", C_GRAY
    Feldkasten ML + 150, CW - 150, wert
    pY = pY + pPitch
End Sub

Private Sub Feldpaar(l1 As String, v1 As String, l2 As String, v2 As String)
    Dim bereich As Double, l2b As Double, bw As Double, x1 As Double, x2 As Double
    bereich = CW - 150
    l2b = TextBreite(l2, 8.5, False) + 8
    If l2b < 84 Then l2b = 84
    bw = (bereich - 14 - l2b) / 2
    x1 = ML + 150
    x2 = x1 + bw + 14
    PText ML + 20, pY + 11.5, l1, 8.5, "F1", C_GRAY
    Feldkasten x1, bw, v1
    PText x2, pY + 11.5, l2, 8.5, "F1", C_GRAY
    Feldkasten x2 + l2b, bw, v2
    pY = pY + pPitch
End Sub

Private Sub Kaestchen(x As Double, yTop As Double, an As Boolean)
    PRechteck x, yTop, 9, 9, "1 1 1", C_INK, 0.7, 1.2
    If an Then
        PLinie x + 2, yTop + 2, x + 7, yTop + 7, 1.2, C_INK
        PLinie x + 2, yTop + 7, x + 7, yTop + 2, 1.2, C_INK
    End If
End Sub

Private Sub KaestchenZeile(an As Boolean, text As String)
    Dim z As Variant, i As Long
    z = Umbruch(text, 9, CW - 35, False)
    Kaestchen ML + 20, pY + 1.5, an
    For i = 0 To UBound(z)
        PText ML + 35, pY + 9 + i * 12.5, CStr(z(i)), 9, "F1", C_INK
    Next i
    pY = pY + 12.5 * (UBound(z) + 1) + 4
End Sub

Private Sub AuswahlZeile(marke As String, text As String, gewaehlt As String)
    Dim x As Double, ox As Double, opt As Variant, i As Long
    x = ML + 20
    If Len(marke) > 0 Then PText ML, pY + 9, marke, 8.5, "F2", C_ACCENT
    PText x, pY + 9, text, 9, "F1", C_INK
    ox = x + TextBreite(text, 9, False) + 12
    opt = Split("ja|nein", "|")
    For i = 0 To 1
        Kaestchen ox, pY + 1.5, (CStr(opt(i)) = gewaehlt)
        PText ox + 13, pY + 9, CStr(opt(i)), 9, "F1", C_INK
        ox = ox + 13 + TextBreite(CStr(opt(i)), 9, False) + 16
    Next i
    pY = pY + 16
End Sub

Private Sub Absatz(text As String, marke As String, fett As Boolean, Optional groesse As Double = 9, _
                   Optional farbe As String = "", Optional abstand As Double = 5)
    Dim z As Variant, i As Long, lead As Double, f As String
    If Len(farbe) = 0 Then farbe = C_INK
    lead = groesse * pLead
    z = Umbruch(text, groesse, CW - 20, fett)
    If Len(marke) > 0 Then PText ML, pY + groesse, marke, 8.5, "F2", C_ACCENT
    If fett Then f = "F2" Else f = "F1"
    For i = 0 To UBound(z)
        PText ML + 20, pY + groesse + i * lead, CStr(z(i)), groesse, f, farbe
    Next i
    pY = pY + lead * (UBound(z) + 1) + abstand
End Sub

Private Sub Notiz(text As String)
    Absatz text, "", False, 7.5, C_GRAY, 4
End Sub

Private Sub Unterschriftsblock(unterzeichner As String, rolle As String, notizText As String)
    Dim h As Double, x As Double, w As Double, sig As String
    pY = pY + 8
    h = 52
    x = ML + 150
    w = CW - 150
    PRechteck x, pY, w, h, C_SIGFILL, "", 0, 2.5
    PLinie x, pY + h, x + w, pY + h, 0.8, C_INK
    PText ML + 20, pY + h - 3, "Unterschrift", 8.5, "F1", C_GRAY
    If Left$(unterzeichner, 1) = "[" Then
        PText x + 10, pY + h - 14, unterzeichner, 10, "F1", C_PH
    ElseIf Len(Trim$(unterzeichner)) > 0 Then
        w = w - 16
        If w > 260 Then w = 260
        sig = UnterschriftOps(unterzeichner, x + 8, PAGE_H - (pY + h), w, h)
        If Len(sig) > 0 Then OpsAdd sig
    End If
    pY = pY + h
    PText x, pY + 10, rolle, 7.5, "F1", C_GRAY
    pY = pY + 12
    If Len(notizText) > 0 Then
        PText x, pY + 7.5, notizText, 7, "F3", C_GRAY
        pY = pY + 10
    End If
End Sub

Private Sub Fusszeile(links As String)
    Dim yb As Double
    yb = PAGE_H - MB + 14
    PLinie ML, yb - 10, ML + CW, yb - 10, 0.5, C_LIGHT
    If Len(links) > 0 Then PText ML, yb, links, 7, "F1", C_GRAY
    PTextRechts ML + CW, yb, "Seite 1 von 1", 7, "F1", C_GRAY
End Sub

Private Function Ueberlauf() As Boolean
    Ueberlauf = (pY > PAGE_H - MB - 18)
End Function

Private Function F(feldname As String) As String
    F = modTmModell.DokFeld(pDok, feldname)
End Function

' Zeile unter der Unterschrift bei Firmenkunden: Name der vertretungsberechtigten Person, sonst der Hinweis darauf
Private Function FirmenNotiz(firma As Boolean) As String
    If Not firma Then Exit Function
    If Len(F("vertreter")) > 0 Then
        FirmenNotiz = "Vertretungsberechtigte Person: " & F("vertreter")
    Else
        FirmenNotiz = "bei Firmen: Unterschrift und Name der vertretungsberechtigten Person"
    End If
End Function

Private Function Schweigepflicht(empfaenger As String) As String
    Schweigepflicht = "Ich willige ein, dass der Versicherer " & empfaenger & " die zur Betreuung der genannten Verträge " & _
        "erforderlichen personenbezogenen Daten einschließlich Gesundheitsdaten übermittelt. Insoweit entbinde ich die " & _
        "Mitarbeitenden des Versicherers von ihrer Schweigepflicht. Diese Einwilligung kann ich jederzeit mit Wirkung für " & _
        "die Zukunft widerrufen."
End Function

' ------------------------------------------------------------------ Dokumente
Private Sub Seite(kompakt As Boolean)
    OpsNeu
    pY = MT
    If kompakt Then pPitch = 19: pLead = 1.32 Else pPitch = 21: pLead = 1.42
End Sub

Private Sub DokMaklervollmacht(kompakt As Boolean)
    Dim n As Long, firma As Boolean
    Seite kompakt
    firma = (F("ist_firma") = "ja")
    Kopf F("titel"), "Vollmacht zur Betreuung und Bestandsübertragung von Versicherungsverträgen", "Versicherer: ERGO"
    Abschnitt "1", "Versicherungsnehmer (Vollmachtgeber)"
    Feld "Versicherungsnehmer / Firma", F("vollmachtgeber_name")
    Feld "Anschrift", F("vollmachtgeber_anschrift")
    If Not firma Then Feld "Geburtsdatum", F("geburtsdatum")
    Abschnitt "2", "Bevollmächtigter Makler"
    Feld "Makler / aufnehmende Agentur", F("makler_name")
    Feld "Anschrift Makler", F("makler_anschrift")
    Feldpaar "Agenturnummer", F("agenturnummer"), "Vermittlernummer / PNR", F("vermittlernummer_pnr")
    Feldpaar "Registrierungsnr. § 34d GewO", F("registernummer"), "Kontakt", F("kontakt")
    Abschnitt "3", "Betroffene Verträge"
    Feldpaar "Vertragsnummer", F("vertragsnummer"), "Sparte", F("sparte")
    Notiz "Versicherer: ERGO, jeweils die vertragsführende Gesellschaft"
    KaestchenZeile (F("gesamtumfang") = "ja"), "sowie alle weiteren beim Versicherer bestehenden Verträge des Vollmachtgebers (Gesamtumfang)"
    Abschnitt "4", "Vollmachtsumfang"
    If F("umfang_text") <> "nein" Then
        Absatz "Ich bevollmächtige den oben genannten Makler, mich hinsichtlich der bezeichneten Versicherungsverträge " & _
               "gegenüber dem Versicherer zu vertreten, die Bestandsübertragung auf die genannte Agentur zu beantragen, " & _
               "vertragsbezogene Auskünfte und Unterlagen anzufordern sowie Erklärungen zur Betreuung der Verträge " & _
               "abzugeben und entgegenzunehmen.", "4a", False
    End If
    Absatz "Ich wünsche ausdrücklich, dass die genannten Verträge künftig von dem bevollmächtigten Makler betreut " & _
           "und in dessen Bestand übertragen werden (Bestandsübertragung).", "4b", True
    AuswahlZeile "4c", "Der Makler ist berechtigt, Untervollmacht zu erteilen:", IIf(F("untervollmacht") = "ja", "ja", "nein")
    Absatz "Die Korrespondenz soll mir im Original und dem bevollmächtigten Makler in Kopie zur Verfügung gestellt werden.", "4d", False
    If Len(F("unterlagenanforderung")) > 0 Then
        Absatz "Angeforderte Unterlagen / Folgearbeiten: " & Replace(F("unterlagenanforderung"), vbLf, "; "), "4e", False
    End If
    n = 5
    If F("schweigepflicht") = "ja" Then
        Abschnitt CStr(n), "Einwilligung und Schweigepflichtentbindung"
        Absatz Schweigepflicht("dem bevollmächtigten Makler"), "", False
        n = n + 1
    End If
    Abschnitt CStr(n), "Geltung und Widerruf"
    Absatz "Die Vollmacht gilt bis auf Widerruf. Sie kann jederzeit in Textform gegenüber dem Makler oder dem " & _
           "Versicherer widerrufen werden. Etwaige früher erteilte Maklervollmachten zu den genannten Verträgen " & _
           "widerrufe ich hiermit.", "", False
    pY = pY + 2
    Feldpaar "Ort", F("ort"), "Datum", F("datum")
    Unterschriftsblock F("unterschrift"), "Unterschrift Versicherungsnehmer", _
        FirmenNotiz(firma)
    Fusszeile F("fusszeile")
End Sub

Private Sub DokBetreuungswunsch(kompakt As Boolean)
    Dim firma As Boolean
    Seite kompakt
    firma = (F("ist_firma") = "ja")
    Kopf "Betreuungswunsch", "Erklärung zur Betreuung von Versicherungsverträgen", "Versicherer: ERGO"
    Abschnitt "1", "Versicherungsnehmer"
    Feld "Versicherungsnehmer / Firma", F("kunde_name")
    Feld "Anschrift", F("kunde_anschrift")
    If Not firma Then Feld "Geburtsdatum", F("geburtsdatum")
    Abschnitt "2", "Verträge"
    Feldpaar "Vertragsnummer", F("vertragsnummer"), "Sparte", F("sparte")
    Notiz "Versicherer: ERGO, jeweils die vertragsführende Gesellschaft"
    Abschnitt "3", "Gewünschter Betreuer"
    Feld "Vermittler / Agentur", F("betreuer_name")
    Feldpaar "Agenturnummer", F("betreuer_agenturnummer"), "Vermittlernummer / PNR", F("betreuer_pnr")
    Abschnitt "4", "Erklärung"
    Absatz "Ich wünsche, dass die oben genannten Verträge künftig von dem unter 3 genannten Vermittler betreut " & _
           "werden. Er ist mein Ansprechpartner für alle Fragen zu diesen Verträgen.", "", False
    If F("bue_wunsch") <> "nein" Then
        Absatz "Ich wünsche ausdrücklich die Übertragung der genannten Verträge in den Bestand dieses Vermittlers " & _
               "(Bestandsübertragung).", "", True
    End If
    Absatz "Dieser Betreuungswunsch gilt bis auf Widerruf.", "", False
    If F("schweigepflicht") = "ja" Then
        Abschnitt "5", "Einwilligung und Schweigepflichtentbindung"
        Absatz Schweigepflicht("dem unter 3 genannten Vermittler"), "", False
    End If
    pY = pY + 2
    Feldpaar "Ort", F("ort"), "Datum", F("datum")
    Unterschriftsblock F("unterschrift"), "Unterschrift Versicherungsnehmer", _
        FirmenNotiz(firma)
    Fusszeile F("fusszeile")
End Sub

Private Sub DokUntervollmacht(kompakt As Boolean)
    Dim teile As Variant, i As Long, s As String
    Seite kompakt
    Kopf "Untervollmacht", "Untervollmacht auf Grundlage einer Maklervollmacht (Pool an Untermakler)", "Versicherer: ERGO"
    Abschnitt "1", "Hauptbevollmächtigter (Pool)"
    Feld "Makler / Pool", F("pool_name")
    Feld "Agenturnummer", F("pool_agenturnummer")
    Abschnitt "2", "Grundlage"
    Feld "Hauptvollmacht", F("bezug")
    Feldpaar "Vertragsnummer", F("vertragsnummer"), "Sparte", F("sparte")
    Feld "Umfang", F("umfang")
    Abschnitt "3", "Unterbevollmächtigter (Untermakler)"
    Feld "Name / Firma", F("untermakler_name")
    Feldpaar "Registrierungsnr. § 34d GewO", F("untermakler_registernummer"), "Kontakt", F("untermakler_kontakt")
    Abschnitt "4", "Umfang der Untervollmacht"
    Absatz "Auf Grundlage der unter 2 genannten Maklervollmacht erteilen wir dem Unterbevollmächtigten Untervollmacht " & _
           "im gleichen Umfang. Sie berechtigt insbesondere dazu, die Verträge zu betreuen, vertragsbezogene Erklärungen " & _
           "abzugeben und entgegenzunehmen, die Bestandsübertragung zu beantragen sowie Auskünfte und Unterlagen " & _
           "anzufordern. Die Untervollmacht erlischt mit der Hauptvollmacht und kann jederzeit widerrufen werden.", "", False
    Abschnitt "5", "Angeforderte Unterlagen / Folgearbeiten"
    s = Replace(F("unterlagenanforderung"), ";", vbLf)
    teile = Split(s, vbLf)
    If UBound(teile) < 0 Then
        Feld "Eintrag", ""
    Else
        For i = 0 To UBound(teile)
            If Len(Trim$(CStr(teile(i)))) > 0 Then Feld "Eintrag", Trim$(CStr(teile(i)))
        Next i
    End If
    pY = pY + 8
    Feldpaar "Ort", F("ort"), "Datum", F("datum")
    Unterschriftsblock F("unterschrift"), "Unterschrift Hauptbevollmächtigter (Pool)", ""
    Fusszeile F("fusszeile")
End Sub

Private Sub DokBauen(kompakt As Boolean)
    Select Case modTmModell.M_DokTyp(pDok)
        Case "Betreuungswunsch": DokBetreuungswunsch kompakt
        Case "Untervollmacht": DokUntervollmacht kompakt
        Case Else: DokMaklervollmacht kompakt
    End Select
End Sub

' PDF des Dokuments d aus dem Modell (modTmModell.ModellBauen) als ASCII-String
Public Function DokumentPdf(d As Long) As String
    pDok = d
    DokBauen False
    If Ueberlauf() Then DokBauen True
    DokumentPdf = PdfDatei(OpsText(), modTmModell.M_DokTyp(d) & " " & modTmModell.M_ID)
End Function

' Objekte: 1 Catalog, 2 Pages, 3 Page, 4 Inhalt, 5-7 Schriften, 8 Info; xref mit Byte-Offsets (alles ASCII)
Private Function PdfDatei(inhalt As String, titel As String) As String
    Dim obj(1 To 8) As String, aus As String, offs(1 To 8) As Long, i As Long, xref As Long
    obj(1) = "<< /Type /Catalog /Pages 2 0 R >>"
    obj(2) = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
    obj(3) = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] " & _
             "/Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 4 0 R >>"
    obj(4) = "<< /Length " & (Len(inhalt) + 1) & " >>" & vbLf & "stream" & vbLf & inhalt & vbLf & "endstream"
    obj(5) = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
    obj(6) = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
    obj(7) = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
    obj(8) = "<< /Title " & Utf16Hex(titel) & " /Producer " & Utf16Hex("Prüfbot Testmail-Generator") & _
             " /Creator " & Utf16Hex("Prüfbot-Testing") & " >>"
    aus = "%PDF-1.4" & vbLf
    For i = 1 To 8
        offs(i) = Len(aus)
        aus = aus & i & " 0 obj" & vbLf & obj(i) & vbLf & "endobj" & vbLf
    Next i
    xref = Len(aus)
    aus = aus & "xref" & vbLf & "0 9" & vbLf & "0000000000 65535 f" & vbCrLf
    For i = 1 To 8
        aus = aus & Format(offs(i), "0000000000") & " 00000 n" & vbCrLf
    Next i
    aus = aus & "trailer" & vbLf & "<< /Size 9 /Root 1 0 R /Info 8 0 R >>" & vbLf & "startxref" & vbLf & xref & vbLf & "%%EOF" & vbLf
    PdfDatei = aus
End Function
