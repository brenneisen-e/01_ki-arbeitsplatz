Option Explicit
' ============================================================================
' modTmSign - Unterschrift als Bezier-Pfad, deterministisch aus dem Namen (gleicher Name = gleiche Unterschrift).
'
' Ablauf: Woerter aus dem Namen ("Nachname, Vorname" wird umgestellt, Titel und Rechtsformen entfallen), Stil aus
' einem Park-Miller-Zufallsgenerator mit dem Namen als Saat (Initiale + Nachname, Vorname + Nachname oder nur
' Nachname), Buchstaben aus Punktlisten (x-Hoehe = 1), Zitter, auslaufender Nachname, Abschluss-Schwung, Neigung und
' Drehung, Catmull-Rom -> Bezier, Strichstaerke nach Richtung (Abstriche kraeftiger). Ein leerer Name ergibt nichts.
' Rechnet nur mit Double (Park-Miller bleibt unter 2^53 exakt) - kein Mod/\ auf grossen Zahlen.
' ============================================================================

Private Const RNG_M As Double = 2147483647#
Private Const MAX_S As Long = 60
Private Const MAX_P As Long = 400
Private rs As Double
' Buchstaben mit Akzent (U+00C0 bis U+00FF) -> Grundbuchstabe der Glyphenlisten; Umlautpunkte setzt Striche getrennt
Private Const FALTEN_L1 As String = "AAAAAAACEEEEIIIIDNOOOOO?OUUUUYTsaaaaaaaceeeeiiiidnooooo?ouuuuyty"
Private sX(1 To MAX_S, 1 To MAX_P) As Double
Private sY(1 To MAX_S, 1 To MAX_P) As Double
Private sN(1 To MAX_S) As Long
Private sAnz As Long
Private parSlant As Double
Private parAngle As Double
Private parWidth As Double

Private Sub RngInit(text As String)
    Dim i As Long, c As Long
    rs = 7#
    For i = 1 To Len(text)
        c = AscW(Mid$(text, i, 1))
        If c < 0 Then c = c + 65536
        rs = rs * 31# + c
        rs = rs - Int(rs / RNG_M) * RNG_M
    Next i
    If rs = 0 Then rs = 1#
    For i = 1 To 3
        RngNext
    Next i
End Sub

Private Function RngNext() As Double
    rs = rs * 16807#
    rs = rs - Int(rs / RNG_M) * RNG_M
    RngNext = rs / RNG_M
End Function

Private Function Zw(a As Double, b As Double) As Double
    Zw = a + (b - a) * RngNext()
End Function

Private Function IstTitelOderForm(w As String, mitForm As Boolean) As Boolean
    Dim l As String
    l = "|" & LCase$(w) & "|"
    If InStr("|dr.|dr|prof.|prof|dipl.-ing.|dipl.-kfm.|dipl.-kffr.|mag.|med.|rer.|nat.|pol.|jur.|herr|frau|", l) > 0 Then
        IstTitelOderForm = True
    ElseIf mitForm Then
        IstTitelOderForm = (InStr("|gmbh|mbh|ag|kg|ohg|ug|e.k.|ek|gbr|co.|co|&|se|kgaa|e.v.|", l) > 0)
    End If
End Function

' Vorname und Nachname fuer die Unterschrift
Private Sub Woerter(name As String, ByRef vorname As String, ByRef nachname As String)
    Dim n As String, p As Long, links As Variant, rechts As Variant, i As Long, w As String, liste() As String, k As Long
    vorname = "": nachname = ""
    n = Trim$(name)
    p = InStr(n, ",")
    If p > 0 Then
        links = Split(Left$(n, p - 1), " ")
        rechts = Split(Mid$(n, p + 1), " ")
        For i = 0 To UBound(links)
            w = CStr(links(i))
            If Len(w) > 0 Then
                If Not IstTitelOderForm(w, True) Then nachname = w
            End If
        Next i
        For i = 0 To UBound(rechts)
            w = CStr(rechts(i))
            If Len(w) > 0 Then
                If Not IstTitelOderForm(w, False) Then vorname = w: Exit For
            End If
        Next i
    Else
        links = Split(n, " ")
        ReDim liste(0 To 0)
        k = 0
        For i = 0 To UBound(links)
            w = CStr(links(i))
            If Len(w) > 0 Then
                If Not IstTitelOderForm(w, True) Then
                    ReDim Preserve liste(0 To k)
                    liste(k) = w
                    k = k + 1
                End If
            End If
        Next i
        If k >= 2 Then
            vorname = liste(0): nachname = liste(k - 1)
        ElseIf k = 1 Then
            nachname = liste(0)
        End If
    End If
End Sub

' Name fuer die Unterschrift: ß -> ss, Buchstaben ausserhalb cp1252 wie in der Vollmacht umgeschrieben (L mit Strich -> L),
' damit kein Buchstabe wegfaellt
Private Function SignaturName(name As String) As String
    Dim i As Long, ch As String, aus As String
    For i = 1 To Len(name)
        ch = Mid$(name, i, 1)
        If ch = ChrW(223) Then
            aus = aus & "ss"
        ElseIf modTmPdf.WinAnsiDirekt(ch) >= 0 Then
            aus = aus & ch
        Else
            aus = aus & ChrW(modTmPdf.WinAnsi(ch))
        End If
    Next i
    SignaturName = aus
End Function

Private Function Falten(c As Long) As Long
    Dim u As String
    Falten = c
    If c >= 192 And c <= 255 Then
        u = Mid$(FALTEN_L1, c - 191, 1)
        If u <> "?" Then Falten = AscW(u)
    End If
End Function

Private Function NeuerStrich() As Long
    If sAnz < MAX_S Then sAnz = sAnz + 1
    sN(sAnz) = 0
    NeuerStrich = sAnz
End Function

Private Sub Punkt(s As Long, x As Double, y As Double)
    If s < 1 Then Exit Sub
    If sN(s) >= MAX_P Then Exit Sub
    sN(s) = sN(s) + 1
    sX(s, sN(s)) = x
    sY(s, sN(s)) = y
End Sub

' Striche in Glyphen-Einheiten (noch ohne Neigung/Skalierung) und Stilparameter
Private Sub Striche(name As String)
    Dim vorname As String, nachname As String, stil As Long, messy As Double, wl As Long
    Dim wortArt(1 To 2) As String, wortText(1 To 2) As String, wi As Long, w As String
    Dim pen As Double, startX As Double, hatStart As Boolean, exX As Double, exY As Double
    Dim cur As Long, k As Long, i As Long, c As Long, c0 As Long, dots As Long, gdef As String, teile As Variant
    Dim adv As Double, verbinden As Boolean, strichListe As Variant, pts As Variant, j As Long, q As Variant, s As Long
    Dim amp As Double, stretch As Double, hx As Double, hy As Double, cx As Double, dx As Double, d As Long
    Dim extras As Variant, flo As Long, tail As Long, x As Double, y As Double, n As String

    sAnz = 0
    n = SignaturName(name)
    RngInit Trim$(n)
    Woerter n, vorname, nachname
    stil = Int(RngNext() * 3)
    If stil = 1 And Len(vorname) > 6 Then stil = 0
    If Len(vorname) = 0 Then stil = 2
    messy = Zw(0.025, 0.055)
    wl = 0
    If stil = 0 Then
        wl = wl + 1: wortArt(wl) = "init": wortText(wl) = Left$(vorname, 1)
    ElseIf stil = 1 Then
        wl = wl + 1: wortArt(wl) = "word": wortText(wl) = vorname
    End If
    wl = wl + 1: wortArt(wl) = "word": wortText(wl) = nachname

    pen = 0
    hatStart = False
    exX = 0: exY = 0
    For wi = 1 To wl
        w = wortText(wi)
        cur = 0
        k = 0
        If BuchstabenAnzahl(w) > 0 Then
            i = 0
            For j = 1 To Len(w)
                c0 = AscW(Mid$(w, j, 1))
                If c0 < 0 Then c0 = c0 + 65536
                c = Falten(c0)
                dots = 0
                If c0 = 228 Or c0 = 246 Or c0 = 252 Or c0 = 196 Or c0 = 214 Or c0 = 220 Then dots = 2
                If c0 = 105 Or c0 = 106 Then dots = 1
                If c >= 65 And c <= 90 Then
                    ' Grossbuchstabe
                    gdef = GlyphGross(c)
                    teile = Split(gdef, "#")
                    adv = Val(teile(0))
                    verbinden = (teile(1) = "1")
                    strichListe = Split(CStr(teile(2)), "/")
                    For s = 0 To UBound(strichListe)
                        cur = NeuerStrich()
                        pts = Split(CStr(strichListe(s)), ",")
                        For d = 0 To UBound(pts)
                            q = Split(CStr(pts(d)), " ")
                            x = pen + Val(q(0)) + Zw(-messy, messy)
                            y = Val(q(1)) + Zw(-messy, messy)
                            Punkt cur, x, y
                        Next d
                    Next s
                    If Not hatStart Then startX = sX(sAnz, 1): hatStart = True
                    exX = sX(sAnz, sN(sAnz)): exY = sY(sAnz, sN(sAnz))
                    If verbinden Then cur = sAnz Else cur = 0
                    pen = pen + adv * Zw(0.95, 1.05)
                    k = 1
                    i = i + 1
                ElseIf (c >= 97 And c <= 122) Then
                    gdef = GlyphKlein(c)
                    teile = Split(gdef, "#")
                    adv = Val(teile(0))
                    If k < 2 Then amp = 1# Else amp = 1# - 0.11 * (k - 2)
                    If amp < 0.42 Then amp = 0.42
                    If k < 2 Then stretch = 1# Else stretch = 1# + 0.06 * IIf(k - 2 > 5, 5, k - 2)
                    hx = Zw(0.92, 1.08) * stretch
                    hy = Zw(0.93, 1.07) * amp
                    If cur = 0 Then
                        cur = NeuerStrich()
                        Punkt cur, pen, 0.1 * hy
                        If Not hatStart Then startX = pen: hatStart = True
                    End If
                    pts = Split(CStr(teile(1)), ",")
                    For d = 0 To UBound(pts)
                        q = Split(CStr(pts(d)), " ")
                        x = pen + Val(q(0)) * hx + Zw(-messy, messy)
                        y = Val(q(1)) * hy + Zw(-messy, messy)
                        Punkt cur, x, y
                    Next d
                    exX = sX(cur, sN(cur)): exY = sY(cur, sN(cur))
                    If Len(CStr(teile(2))) > 0 Then
                        extras = Split(CStr(teile(2)), "/")
                        For s = 0 To UBound(extras)
                            tail = NeuerStrich()
                            pts = Split(CStr(extras(s)), ",")
                            For d = 0 To UBound(pts)
                                q = Split(CStr(pts(d)), " ")
                                x = pen + Val(q(0)) * hx + Zw(-messy, messy)
                                y = Val(q(1)) * hy + Zw(-messy, messy)
                                Punkt tail, x, y
                            Next d
                        Next s
                    End If
                    If dots > 0 And amp >= 0.7 Then
                        cx = pen + adv * hx * 0.45 + 0.25
                        For d = 0 To dots - 1
                            dx = cx + (d - (dots - 1) / 2#) * 0.3
                            tail = NeuerStrich()
                            Punkt tail, dx, 1.45 * hy
                            Punkt tail, dx + 0.07, 1.5 * hy
                        Next d
                    End If
                    pen = pen + adv * hx
                    k = k + 1
                    i = i + 1
                End If
            Next j
            If wortArt(wi) = "init" Then
                tail = NeuerStrich()
                Punkt tail, pen + 0.15, 0.05
                Punkt tail, pen + 0.2, 0.02
                pen = pen + 0.55
            Else
                pen = pen + 0.6
            End If
        End If
    Next wi

    ' Abschluss-Schwung am letzten zusammenhaengenden Strich
    flo = Int(RngNext() * 3)
    tail = 0
    If sAnz > 0 Then
        If sX(sAnz, sN(sAnz)) = exX And sY(sAnz, sN(sAnz)) = exY Then tail = sAnz
    End If
    If tail = 0 Then
        tail = NeuerStrich()
        Punkt tail, exX, exY
    End If
    If Not hatStart Then startX = 0
    If flo = 0 Then
        Punkt tail, exX + 0.6, exY + 0.25
        Punkt tail, exX + 1.5, exY + 0.55
    ElseIf flo = 1 Then
        Punkt tail, exX + 0.45, exY - 0.15
        Punkt tail, exX + 0.35, -0.55
        Punkt tail, exX - 0.6, -0.72
        Punkt tail, (exX + startX) / 2#, -0.66
        Punkt tail, startX + 0.4, -0.5
        Punkt tail, startX - 0.1, -0.38
    Else
        Punkt tail, exX + 0.35, exY - 0.3
        Punkt tail, exX + 0.2, -0.45
        Punkt tail, exX + 0.9, -0.3
        Punkt tail, exX + 2#, -0.12
    End If
    parSlant = Zw(12#, 22#)
    parAngle = Zw(-1.5, 4#)
    parWidth = Zw(0.85, 1.15)
End Sub

Private Function BuchstabenAnzahl(w As String) As Long
    Dim j As Long, c As Long
    For j = 1 To Len(w)
        c = AscW(Mid$(w, j, 1))
        If c < 0 Then c = c + 65536
        c = Falten(c)
        If (c >= 65 And c <= 90) Or (c >= 97 And c <= 122) Then BuchstabenAnzahl = BuchstabenAnzahl + 1
    Next j
End Function

' PDF-Operatoren fuer die Unterschrift im Kasten (PDF-Koordinaten; by = Unterkante = Unterschriftslinie)
Public Function UnterschriftOps(name As String, bx As Double, by As Double, bw As Double, bh As Double) As String
    Dim t As Double, ca As Double, sa As Double, s As Long, i As Long, x As Double, y As Double
    Dim minX As Double, maxX As Double, minY As Double, maxY As Double, skala As Double, ox As Double, oy As Double
    Dim px() As Double, py() As Double, n As Long, aus As String, kreis As Double
    Dim p0x As Double, p0y As Double, p1x As Double, p1y As Double, p2x As Double, p2y As Double, p3x As Double, p3y As Double
    Dim c1x As Double, c1y As Double, c2x As Double, c2y As Double, dx As Double, dy As Double, ln As Double
    Dim runter As Double, w As Double, segAnz As Long, seg As Long, erster As Boolean
    If Len(Trim$(name)) = 0 Then Exit Function
    Striche name
    kreis = 3.14159265358979
    t = Tan(parSlant * kreis / 180#)
    ca = Cos(parAngle * kreis / 180#)
    sa = Sin(parAngle * kreis / 180#)
    erster = True
    For s = 1 To sAnz
        For i = 1 To sN(s)
            x = sX(s, i) + sY(s, i) * t
            y = sY(s, i)
            sX(s, i) = x * ca - y * sa
            sY(s, i) = x * sa + y * ca
            If erster Then
                minX = sX(s, i): maxX = minX: minY = sY(s, i): maxY = minY: erster = False
            Else
                If sX(s, i) < minX Then minX = sX(s, i)
                If sX(s, i) > maxX Then maxX = sX(s, i)
                If sY(s, i) < minY Then minY = sY(s, i)
                If sY(s, i) > maxY Then maxY = sY(s, i)
            End If
        Next i
    Next s
    If erster Then Exit Function
    skala = bh * 0.21
    If maxX - minX > 0 Then
        If (bw * 0.92) / (maxX - minX) < skala Then skala = (bw * 0.92) / (maxX - minX)
    End If
    If maxY - minY > 0 Then
        If (bh * 1.05) / (maxY - minY) < skala Then skala = (bh * 1.05) / (maxY - minY)
    End If
    ox = bx + bw * 0.06 - minX * skala
    oy = by + bh * 0.16
    If oy + minY * skala < by - bh * 0.25 Then oy = by - bh * 0.25 - minY * skala

    aus = "q" & vbLf & "0.11 0.20 0.55 RG" & vbLf & "1 J 1 j"
    For s = 1 To sAnz
        n = sN(s)
        If n >= 2 Then
            ReDim px(1 To n): ReDim py(1 To n)
            For i = 1 To n
                px(i) = ox + sX(s, i) * skala
                py(i) = oy + sY(s, i) * skala
            Next i
            ' Anzahl gueltiger Segmente (Laenge > 0) fuer duennere Enden
            segAnz = 0
            For i = 1 To n - 1
                If Abs(px(i) - px(i + 1)) >= 0.000000001 Or Abs(py(i) - py(i + 1)) >= 0.000000001 Then segAnz = segAnz + 1
            Next i
            seg = 0
            For i = 1 To n - 1
                p1x = px(i): p1y = py(i): p2x = px(i + 1): p2y = py(i + 1)
                If Abs(p1x - p2x) >= 0.000000001 Or Abs(p1y - p2y) >= 0.000000001 Then
                    If i > 1 Then p0x = px(i - 1): p0y = py(i - 1) Else p0x = p1x: p0y = p1y
                    If i + 2 <= n Then p3x = px(i + 2): p3y = py(i + 2) Else p3x = p2x: p3y = p2y
                    c1x = p1x + (p2x - p0x) / 6#: c1y = p1y + (p2y - p0y) / 6#
                    c2x = p2x - (p3x - p1x) / 6#: c2y = p2y - (p3y - p1y) / 6#
                    dx = p2x - p1x: dy = p2y - p1y
                    ln = Sqr(dx * dx + dy * dy)
                    If ln = 0 Then ln = 1
                    runter = -dy / ln
                    If runter < 0 Then runter = 0
                    w = parWidth * (0.62 + 0.55 * runter)
                    If seg = 0 Or seg = segAnz - 1 Then w = w * 0.7
                    aus = aus & vbLf & Num(w) & " w " & Num(p1x) & " " & Num(p1y) & " m " & Num(c1x) & " " & Num(c1y) & " " & _
                          Num(c2x) & " " & Num(c2y) & " " & Num(p2x) & " " & Num(p2y) & " c S"
                    seg = seg + 1
                End If
            Next i
        End If
    Next s
    UnterschriftOps = aus & vbLf & "Q"
End Function

Private Function GlyphKlein(c As Long) As String
    Select Case c
        Case 97: GlyphKlein = "1#0.62 0.92,0.4 1,0.12 0.78,0.08 0.3,0.28 0.02,0.55 0.3,0.66 0.98,0.66 0.98,0.62 0.3,0.74 0.02,1 0.12#"
        Case 98: GlyphKlein = "0.85#0.35 1.1,0.45 1.9,0.35 2.25,0.18 2,0.12 1,0.14 0.15,0.35 0,0.6 0.35,0.62 0.85,0.5 0.92,0.85 0.85#"
        Case 99: GlyphKlein = "0.8#0.6 0.85,0.45 1,0.15 0.8,0.08 0.35,0.3 0.02,0.8 0.15#"
        Case 100: GlyphKlein = "1#0.62 0.92,0.4 1,0.12 0.78,0.08 0.3,0.28 0.02,0.55 0.35,0.7 2.2,0.7 2.2,0.64 0.4,0.76 0.02,1 0.12#"
        Case 101: GlyphKlein = "0.75#0.45 0.5,0.55 0.82,0.4 0.98,0.18 0.75,0.12 0.35,0.32 0.02,0.75 0.15#"
        Case 102: GlyphKlein = "0.7#0.35 1,0.5 1.9,0.42 2.25,0.25 2,0.2 1,0.18 -0.2,0.12 -1,0.05 -1.15,0 -0.9,0.2 -0.2,0.7 0.12#"
        Case 103: GlyphKlein = "0.95#0.62 0.92,0.4 1,0.12 0.78,0.08 0.32,0.28 0.05,0.55 0.35,0.66 0.98,0.66 0.98,0.6 -0.6,0.45 -1.15,0.2 -1.05,0.3 -0.55,0.95 0.12#"
        Case 104: GlyphKlein = "1#0.35 1.1,0.45 1.9,0.35 2.25,0.18 2,0.14 1,0.12 0,0.12 0,0.25 0.65,0.5 0.95,0.65 0.75,0.66 0.2,0.75 0.02,1 0.12#"
        Case 105: GlyphKlein = "0.5#0.25 0.95,0.25 0.95,0.2 0.25,0.28 0.02,0.5 0.12#"
        Case 106: GlyphKlein = "0.6#0.3 0.95,0.3 0.95,0.25 -0.6,0.12 -1.15,-0.05 -1,0.1 -0.5,0.6 0.12#"
        Case 107: GlyphKlein = "0.95#0.35 1.1,0.45 1.9,0.35 2.25,0.18 2,0.14 1,0.12 0,0.12 0,0.25 0.6,0.6 0.95,0.62 0.7,0.25 0.45,0.25 0.45,0.55 0.2,0.7 0.02,0.95 0.12#"
        Case 108: GlyphKlein = "0.6#0.35 1.1,0.45 1.9,0.35 2.25,0.18 2,0.14 1,0.16 0.2,0.3 0.02,0.6 0.12#"
        Case 109: GlyphKlein = "1.4#0.15 0.95,0.15 0.95,0.12 0,0.12 0,0.25 0.7,0.45 0.98,0.6 0.75,0.6 0,0.6 0,0.72 0.7,0.92 0.98,1.07 0.75,1.08 0.2,1.18 0.02,1.4 0.12#"
        Case 110: GlyphKlein = "1#0.15 0.95,0.15 0.95,0.12 0,0.12 0,0.25 0.7,0.45 0.98,0.6 0.75,0.62 0.2,0.72 0.02,1 0.12#"
        Case 111: GlyphKlein = "0.85#0.55 0.9,0.35 1,0.12 0.75,0.1 0.3,0.3 0.02,0.55 0.25,0.6 0.75,0.5 0.98,0.45 0.9,0.85 0.88#"
        Case 112: GlyphKlein = "1#0.2 0.95,0.2 0.95,0.15 -1.1,0.15 -1.1,0.17 0.4,0.35 0.9,0.6 0.95,0.72 0.55,0.55 0.1,0.25 0.05,0.4 0.06,1 0.12#"
        Case 113: GlyphKlein = "0.95#0.62 0.92,0.4 1,0.12 0.78,0.08 0.32,0.28 0.05,0.55 0.35,0.66 0.98,0.66 0.98,0.62 -1.1,0.62 -1.1,0.68 -0.6,0.95 0.12#"
        Case 114: GlyphKlein = "0.75#0.15 0.9,0.15 0.9,0.12 0,0.12 0,0.25 0.7,0.45 0.95,0.6 0.85,0.75 0.75#"
        Case 115: GlyphKlein = "0.75#0.38 0.98,0.38 0.98,0.62 0.5,0.58 0.12,0.32 0,0.12 0.15,0.35 0.1,0.75 0.12#"
        Case 116: GlyphKlein = "0.75#0.3 1,0.38 1.7,0.38 1.7,0.28 0.25,0.4 0.02,0.75 0.12#0.05 1,0.4 1.05,0.7 1.02"
        Case 117: GlyphKlein = "1#0.15 0.95,0.15 0.95,0.12 0.25,0.3 0.02,0.55 0.2,0.65 0.95,0.65 0.95,0.62 0.25,0.74 0.02,1 0.12#"
        Case 118: GlyphKlein = "0.85#0.15 0.95,0.15 0.95,0.18 0.4,0.35 0.02,0.55 0.4,0.62 0.95,0.52 0.9,0.85 0.88#"
        Case 119: GlyphKlein = "1.25#0.15 0.95,0.15 0.95,0.15 0.3,0.3 0.02,0.5 0.3,0.6 0.85,0.6 0.85,0.7 0.2,0.85 0.02,1 0.4,1.02 0.95,0.92 0.9,1.25 0.88#"
        Case 120: GlyphKlein = "0.85#0.3 0.9,0.45 0.5,0.6 0.05,0.85 0.12#0.65 0.95,0.25 0.05"
        Case 121: GlyphKlein = "0.95#0.15 0.95,0.15 0.95,0.12 0.3,0.3 0.02,0.55 0.2,0.65 0.95,0.65 0.95,0.6 -0.6,0.45 -1.15,0.2 -1.05,0.3 -0.55,0.95 0.12#"
        Case 122: GlyphKlein = "0.8#0.15 0.9,0.6 0.95,0.6 0.95,0.15 0.05,0.15 0.05,0.5 0.1,0.8 0.1#"
    End Select
End Function

Private Function GlyphGross(c As Long) As String
    Select Case c
        Case 65: GlyphGross = "1.35#1#0 0.05,0.45 1.3,0.85 2.4,0.85 2.4,1.05 1.2,1.2 0.15,1.35 0.1"
        Case 66: GlyphGross = "1.4#1#0 2,0.4 2.4,0.4 2.4,0.35 1.2,0.3 0/0.1 2.2,0.8 2.4,1.1 2.05,0.85 1.45,0.4 1.3,0.4 1.3,1.05 1.15,1.15 0.55,0.8 0.05,0.3 0.1,0.6 0.2,1.4 0.15"
        Case 67: GlyphGross = "1.2#1#1.1 2,1 2.35,0.6 2.35,0.15 1.8,0.05 0.8,0.35 0.05,0.9 0.1,1.2 0.15"
        Case 68: GlyphGross = "1.4#0#0 2,0.45 2.35,0.45 2.35,0.35 1,0.3 0.05,0 0.15,0.25 0.05,0.9 0.2,1.3 1,1.25 1.9,0.8 2.4,0.2 2.3,0.05 2.05"
        Case 69: GlyphGross = "1.2#1#1 2.1,0.75 2.4,0.35 2.25,0.4 1.75,0.75 1.35,0.75 1.35,0.25 1.2,0.05 0.6,0.3 0.05,0.85 0.05,1.2 0.2"
        Case 70: GlyphGross = "1.3#0#0 2.15,0.6 2.4,1.3 2.35/0.35 1.25,1 1.3/0.75 2.35,0.65 1.2,0.5 0,0.2 -0.05"
        Case 71: GlyphGross = "1.4#1#1.1 2,1 2.35,0.6 2.35,0.15 1.8,0.05 0.8,0.35 0.05,0.85 0.2,1.05 1.1,1.05 1.1,1 -0.6,0.8 -1.1,0.55 -0.9,0.75 -0.4,1.4 0.12"
        Case 72: GlyphGross = "1.35#1#0.2 2.4,0.15 1.2,0.1 0/0 1.1,0.5 1.25,1.2 1.25/1 2.4,0.95 1,0.9 0.1,1.05 0.02,1.35 0.12"
        Case 73: GlyphGross = "0.9#1#0.2 2,0.6 2.4,0.6 2.4,0.5 1.2,0.35 0.05,0.05 0.1,0.4 0.15,0.9 0.12"
        Case 74: GlyphGross = "0.95#1#0.3 2,0.7 2.4,0.7 2.4,0.6 0.5,0.45 -0.9,0.15 -1.15,0 -0.8,0.3 -0.3,0.95 0.12"
        Case 75: GlyphGross = "1.35#1#0.25 2.4,0.2 1.2,0.12 0/1.2 2.4,0.6 1.5,0.25 1.15,0.25 1.15,0.7 0.9,0.95 0.2,1.1 0.02,1.35 0.12"
        Case 76: GlyphGross = "1.2#1#0.6 2,0.9 2.35,0.75 2.45,0.5 2.1,0.4 1,0.25 0.15,0 0.1,0.25 -0.05,0.8 0.1,1.2 0.15"
        Case 77: GlyphGross = "1.6#1#0 0,0.15 1.2,0.3 2.3,0.3 2.3,0.5 1.2,0.6 0.3,0.6 0.3,0.85 1.4,1.05 2.3,1.05 2.3,1.15 1.1,1.2 0.15,1.35 0.02,1.6 0.12"
        Case 78: GlyphGross = "1.35#0#0 0,0.15 1.2,0.3 2.3,0.3 2.3,0.7 1,0.95 0.1,0.95 0.1,1.05 1.3,1.2 2.4,1.35 2.3"
        Case 79: GlyphGross = "1.3#0#0.7 2.3,0.3 2.1,0.05 1.2,0.25 0.1,0.75 0.05,1.05 0.9,1 2,0.7 2.4,0.45 2.2,1.3 2"
        Case 80: GlyphGross = "1.2#0#0.35 2.35,0.35 2.35,0.3 1.2,0.2 0/0.05 2.1,0.7 2.45,1.15 2.1,1 1.45,0.35 1.2"
        Case 81: GlyphGross = "1.3#0#0.7 2.3,0.3 2.1,0.05 1.2,0.25 0.1,0.75 0.05,1.05 0.9,1 2,0.7 2.4,0.45 2.2/0.6 0.4,1.3 -0.2"
        Case 82: GlyphGross = "1.4#1#0.35 2.35,0.35 2.35,0.3 1.2,0.2 0/0.05 2.1,0.7 2.45,1.15 2.1,1 1.45,0.35 1.2,0.35 1.2,0.75 0.9,1 0.2,1.15 0.02,1.4 0.12"
        Case 83: GlyphGross = "1.2#1#1.1 2.1,0.9 2.4,0.45 2.3,0.3 1.85,0.65 1.35,0.95 0.8,0.8 0.15,0.35 0,0.05 0.3,0.35 0.15,0.8 0.12,1.2 0.15"
        Case 84: GlyphGross = "1.35#0#-0.3 2.15,0.5 2.42,1.2 2.4,1.75 2.28/0.8 2.4,0.7 1.2,0.58 0.12,0.48 -0.05"
        Case 85: GlyphGross = "1.4#1#0.1 2,0.3 2.35,0.3 2.35,0.2 0.8,0.35 0.05,0.75 0.2,1.05 1.2,1.15 2.35,1.15 2.35,1.05 0.6,1.15 0.05,1.4 0.12"
        Case 86: GlyphGross = "1.5#0#0 2.1,0.25 2.4,0.35 1.6,0.6 0.05,0.6 0.05,0.95 1.4,1.3 2.4,1.1 2.3,1.5 2.1"
        Case 87: GlyphGross = "1.6#0#0 2.3,0.15 1.2,0.35 0.05,0.35 0.05,0.6 1.3,0.75 1.9,0.75 1.9,0.9 0.9,1.05 0.05,1.05 0.05,1.3 1.3,1.5 2.4"
        Case 88: GlyphGross = "1.4#1#1.2 2.3,0.1 0/0 2.3,0.6 1.2,1.2 0.05,1.4 0.12"
        Case 89: GlyphGross = "1.4#1#0.1 2,0.3 2.35,0.3 2.35,0.2 1,0.45 0.6,0.9 0.9,1.1 2.35,1.1 2.35,1 0,0.85 -1,0.55 -1.15,0.5 -0.7,1.4 0.12"
        Case 90: GlyphGross = "1.3#1#0.1 2.2,0.6 2.4,1.15 2.3,1.15 2.3,0.2 0.1,0.2 0.1,0.7 0.05,1.3 0.15"
    End Select
End Function
