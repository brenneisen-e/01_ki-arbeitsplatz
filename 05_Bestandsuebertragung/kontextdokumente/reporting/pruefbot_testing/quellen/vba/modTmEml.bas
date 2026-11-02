Option Explicit
' ============================================================================
' modTmEml - EML (RFC 5322, MIME multipart/mixed) mit "X-Unsent: 1": Outlook oeffnet die Datei als Entwurf mit
' Senden-Knopf; Empfaenger, Betreff, Text und Anhaenge sind gesetzt. Kein Outlook-Objektmodell noetig.
'
' Die Datei ist reines ASCII mit CRLF und so gebaut, dass sie den Excel-Textexport (FileFormat 20, eine Zeile je
' Zelle) unveraendert uebersteht - so laesst sie sich auch direkt auf SharePoint ablegen:
'   - kein Anfuehrungszeichen, kein Tabulator, kein Komma (Excel setzt solche Zellen in "..." und verdoppelt innere ")
'   - keine Zeile beginnt oder endet mit einem Leerzeichen, keine beginnt mit ' (Excel nimmt es als Praefixzeichen)
'   - Kopfzeilen ungefaltet (je Feld eine Zeile, unter 998 Zeichen), Date ohne Wochentag (der braeuchte ein Komma)
'   - Anzeigenamen und Betreff nach RFC 2047, nie als "quoted-string": nur die Woerter mit Sonderzeichen werden kodiert
'     (=?UTF-8?B?...?= oder =?UTF-8?Q?...?=, das kuerzere), aufeinanderfolgende zusammen; der Rest bleibt lesbar (KopfWorte)
'   - boundary und Dateinamen als MIME-Token ohne Anfuehrungszeichen; ist der Dateiname kein Token (Umlaut, Leerzeichen,
'     Komma ...), steht er in Content-Disposition nach RFC 2231 (filename*=UTF-8''%C3%BC...) und in Content-Type als
'     umgeschriebener ASCII-Token (name=...) fuer Leser ohne RFC 2231 - so wie Exchange/Outlook es selbst schreiben
'   - Text als UTF-8 in Base64, Anhaenge in Base64 (76 Zeichen je Zeile)
' Geschrieben wird lokal mit Open ... For Binary / Put (kein ADODB, kein FileSystemObject); auf SharePoint ueber eine
' neue Arbeitsmappe, die Excel als Text speichert (Muster CelonisSpZurueckschreiben im BUE-Reporting). Vorher speichert
' Excel dieselbe Mappe einmal lokal als Probe; nur wenn die Probe byte-gleich ist, geht die Datei nach SharePoint.
'
' Ausgabeweg (AusgabeZiel, ohne Dialog pruefbar): Vorgabe > Einstellung „Ausgabeordner“ (lokaler Pfad oder https) >
' Ordner Pruefbot_Testmails neben der Datei. Liegt die Datei auf SharePoint/OneDrive (https): zuerst die synchronisierte
' Bibliothek laut Registry (MountPoint, wie lokal), sonst direkt per https in <Ordner der Datei>/Pruefbot_Testmails
' (Ordner muss bestehen) mit lokaler Arbeitskopie in Dokumente\Pruefbot_Testmails. Keine WebDAV-Pfade.
' ============================================================================

Private Const B64 As String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
Public Const ORDNER_NAME As String = "Pruefbot_Testmails"

' zuletzt versuchter Ausgabeordner (fuer die Meldung, wenn er nicht angelegt werden konnte)
Public OrdnerVersuch As String
' Ergebnis der letzten Pfadwahl (AusgabeOrdner): Art LOKAL | SYNC | SHAREPOINT | DOKUMENTE, Quelle Vorgabe |
' Einstellung | Datei, Ort = Zielordner (bei SHAREPOINT die https-Adresse)
Public ZielArt As String
Public ZielQuelle As String
Public ZielOrt As String
' Art des letzten Fehlers in EmlUeberExcel: PRUEFUNG (Inhalt nicht exportsicher), PROBE (Excel schreibt anders),
' SPEICHERN (Speichern am Ziel abgelehnt, z. B. Ordner fehlt)
Public ExcelFehlerArt As String

' nur fuer die Pruefung ohne Windows: eine Zuordnung anstelle der Registry (SyncTestSetzen)
Private syncTestNs As String
Private syncTestMp As String

' ------------------------------------------------------------------ UTF-8 und Base64
' Text -> UTF-8-Bytes in b(0..n-1); Rueckgabe n. Ersatzpaare (D800-DBFF, DC00-DFFF) werden zusammengesetzt.
Public Function Utf8(s As String, ByRef b() As Byte) As Long
    Dim i As Long, c As Long, c2 As Long, n As Long, L As Long
    L = Len(s)
    ReDim b(0 To 4 * L + 3)
    i = 1
    Do While i <= L
        c = AscW(Mid$(s, i, 1))
        If c < 0 Then c = c + 65536
        If c >= 55296 And c <= 56319 And i < L Then
            c2 = AscW(Mid$(s, i + 1, 1))
            If c2 < 0 Then c2 = c2 + 65536
            If c2 >= 56320 And c2 <= 57343 Then
                c = 65536 + (c - 55296) * 1024 + (c2 - 56320)
                i = i + 1
            End If
        End If
        If c < 128 Then
            b(n) = c: n = n + 1
        ElseIf c < 2048 Then
            b(n) = 192 + c \ 64: b(n + 1) = 128 + c Mod 64: n = n + 2
        ElseIf c < 65536 Then
            b(n) = 224 + c \ 4096: b(n + 1) = 128 + (c \ 64) Mod 64: b(n + 2) = 128 + c Mod 64: n = n + 3
        Else
            b(n) = 240 + c \ 262144: b(n + 1) = 128 + (c \ 4096) Mod 64
            b(n + 2) = 128 + (c \ 64) Mod 64: b(n + 3) = 128 + c Mod 64: n = n + 4
        End If
        i = i + 1
    Loop
    Utf8 = n
End Function

' UTF-8-Bytes b(0..n-1) -> Text; ungueltige Folgen werden Byte fuer Byte als Latin-1 uebernommen
Public Function Utf8Text(b() As Byte, n As Long) As String
    Dim i As Long, c As Long, k As Long, j As Long, ok As Boolean, aus As String
    i = 0
    Do While i < n
        c = b(i)
        If c < 128 Then
            k = 0
        ElseIf c >= 194 And c <= 223 Then
            k = 1: c = c - 192
        ElseIf c >= 224 And c <= 239 Then
            k = 2: c = c - 224
        ElseIf c >= 240 And c <= 244 Then
            k = 3: c = c - 240
        Else
            k = -1
        End If
        ok = (k >= 0)
        If k > 0 Then ok = (i + k < n)
        If ok And k > 0 Then
            For j = 1 To k
                If b(i + j) < 128 Or b(i + j) > 191 Then ok = False
            Next j
        End If
        If ok Then
            For j = 1 To k
                c = c * 64 + (b(i + j) - 128)
            Next j
            If c >= 65536 Then
                aus = aus & ChrW(55296 + (c - 65536) \ 1024) & ChrW(56320 + (c - 65536) Mod 1024)
            Else
                aus = aus & ChrW(c)
            End If
            i = i + k + 1
        Else
            aus = aus & ChrW(b(i))
            i = i + 1
        End If
    Loop
    Utf8Text = aus
End Function

' ASCII-Text (je Zeichen ein Byte, z. B. PDF) -> Bytes
Public Function AsciiBytes(s As String, ByRef b() As Byte) As Long
    Dim i As Long, L As Long
    L = Len(s)
    If L = 0 Then ReDim b(0 To 0): Exit Function
    ReDim b(0 To L - 1)
    For i = 1 To L
        b(i - 1) = AscW(Mid$(s, i, 1)) And 255
    Next i
    AsciiBytes = L
End Function

' Bytes -> Base64; zeile > 0: CRLF nach je zeile Zeichen (76 fuer den MIME-Rumpf)
Public Function Base64(b() As Byte, n As Long, zeile As Long) As String
    Dim aus As String, pos As Long, i As Long, v As Long, voll As Long, L As Long, z As String, k As Long, zn As Long
    If n <= 0 Then Exit Function
    L = ((n + 2) \ 3) * 4
    aus = String$(L, "=")
    voll = n - (n Mod 3)
    For i = 0 To voll - 1 Step 3
        v = CLng(b(i)) * 65536 + CLng(b(i + 1)) * 256 + CLng(b(i + 2))
        Mid$(aus, pos + 1, 4) = Mid$(B64, v \ 262144 + 1, 1) & Mid$(B64, (v \ 4096) Mod 64 + 1, 1) & _
                                Mid$(B64, (v \ 64) Mod 64 + 1, 1) & Mid$(B64, v Mod 64 + 1, 1)
        pos = pos + 4
    Next i
    If n - voll = 1 Then
        v = CLng(b(voll)) * 65536
        Mid$(aus, pos + 1, 2) = Mid$(B64, v \ 262144 + 1, 1) & Mid$(B64, (v \ 4096) Mod 64 + 1, 1)
    ElseIf n - voll = 2 Then
        v = CLng(b(voll)) * 65536 + CLng(b(voll + 1)) * 256
        Mid$(aus, pos + 1, 3) = Mid$(B64, v \ 262144 + 1, 1) & Mid$(B64, (v \ 4096) Mod 64 + 1, 1) & _
                                Mid$(B64, (v \ 64) Mod 64 + 1, 1)
    End If
    If zeile <= 0 Or L <= zeile Then
        Base64 = aus
        Exit Function
    End If
    zn = (L - 1) \ zeile
    z = String$(L + zn * 2, " ")
    pos = 1
    For k = 0 To zn
        If k > 0 Then Mid$(z, pos, 2) = vbCrLf: pos = pos + 2
        Mid$(z, pos, IIf(L - k * zeile < zeile, L - k * zeile, zeile)) = Mid$(aus, k * zeile + 1, zeile)
        pos = pos + IIf(L - k * zeile < zeile, L - k * zeile, zeile)
    Next k
    Base64 = z
End Function

Public Function TextBase64(s As String, zeile As Long) As String
    Dim b() As Byte, n As Long
    n = Utf8(s, b)
    TextBase64 = Base64(b, n, zeile)
End Function

' ------------------------------------------------------------------ Kopfzeilen
' Darf ein Wort (ohne Leerzeichen) unkodiert im Kopf stehen? Nie mit Anfuehrungszeichen, Komma (Excel-Textexport),
' Steuer- oder Nicht-ASCII-Zeichen oder "=?" (saehe aus wie ein kodiertes Wort). phrase (Anzeigename): nur Zeichen
' aus RFC 5322 atext ohne = und ? - also Buchstaben, Ziffern und ! # $ % & ' * + - / ^ _ ` { | } ~; sonst (Betreff,
' unstrukturierter Text) jedes druckbare ASCII-Zeichen.
Private Function WortSicher(w As String, phrase As Boolean) As Boolean
    Dim i As Long, c As Long
    If Len(w) = 0 Then Exit Function
    If InStr(w, "=?") > 0 Then Exit Function
    For i = 1 To Len(w)
        c = AscW(Mid$(w, i, 1))
        If c < 33 Or c > 126 Or c = 34 Or c = 44 Then Exit Function
        If phrase Then
            Select Case c
                Case 48 To 57, 65 To 90, 97 To 122, 33, 35 To 39, 42, 43, 45, 47, 94 To 96, 123 To 126
                Case Else
                    Exit Function
            End Select
        End If
    Next i
    WortSicher = True
End Function

' Byte b steht in Q-Kodierung als ein Zeichen (Buchstabe, Ziffer, ! * + - /, Leerzeichen als _), sonst als =XX
' (RFC 2047 5.(3): die strengste Regel, die auch im Anzeigenamen gilt; kein Anfuehrungszeichen, kein Komma)
Private Function QEinfach(b As Byte) As Boolean
    Select Case b
        Case 48 To 57, 65 To 90, 97 To 122, 32, 33, 42, 43, 45, 47
            QEinfach = True
    End Select
End Function

Private Function QLaenge(b() As Byte, n As Long) As Long
    Dim i As Long
    For i = 0 To n - 1
        If QEinfach(b(i)) Then QLaenge = QLaenge + 1 Else QLaenge = QLaenge + 3
    Next i
End Function

' Ein kodiertes Wort =?UTF-8?B?...?= oder =?UTF-8?Q?...?= - das kuerzere, das in 75 Zeichen passt (RFC 2047 2.)
Private Function EinKodiertesWort(s As String) As String
    Dim b() As Byte, n As Long, lb As Long, lq As Long, i As Long, aus As String
    n = Utf8(s, b)
    lb = 12 + 4 * ((n + 2) \ 3)
    lq = 12 + QLaenge(b, n)
    If lb <= 75 And (lq > 75 Or lb < lq) Then
        EinKodiertesWort = "=?UTF-8?B?" & Base64(b, n, 0) & "?="
        Exit Function
    End If
    For i = 0 To n - 1
        If b(i) = 32 Then
            aus = aus & "_"
        ElseIf QEinfach(b(i)) Then
            aus = aus & Chr$(b(i))
        Else
            aus = aus & "=" & Right$("0" & Hex$(b(i)), 2)
        End If
    Next i
    EinKodiertesWort = "=?UTF-8?Q?" & aus & "?="
End Function

' Text (mit Leerzeichen) als kodiertes Wort; nur wenn er in keines passt (ueber 45 Byte in B und ueber 63 Zeichen in Q),
' mehrere, moeglichst nach einem Leerzeichen getrennt (das Leerzeichen bleibt im vorderen Wort). Die Bytes eines
' Zeichens werden nie getrennt.
Private Function KodierteWorte(s As String) As String
    Dim rest As String, ch As String, cb() As Byte, c As Long, k As Long, i As Long, p As Long, pLeer As Long
    Dim bn As Long, qn As Long, qk As Long, stueck As String, aus As String
    rest = s
    Do While Len(rest) > 0
        bn = 0: qn = 0: p = 0: pLeer = 0
        i = 1
        Do While i <= Len(rest)
            ch = Mid$(rest, i, 1)
            c = AscW(ch)
            If c < 0 Then c = c + 65536
            If c >= 55296 And c <= 56319 And i < Len(rest) Then ch = Mid$(rest, i, 2)
            k = Utf8(ch, cb)
            qk = QLaenge(cb, k)
            If bn + k > 45 And qn + qk > 63 Then Exit Do
            bn = bn + k
            qn = qn + qk
            i = i + Len(ch)
            p = i - 1
            If ch = " " Then pLeer = p
        Loop
        If p >= Len(rest) Then
            stueck = rest
        ElseIf pLeer > 0 Then
            stueck = Left$(rest, pLeer)
        Else
            stueck = Left$(rest, p)
        End If
        If Len(aus) > 0 Then aus = aus & " "
        aus = aus & EinKodiertesWort(stueck)
        rest = Mid$(rest, Len(stueck) + 1)
    Loop
    KodierteWorte = aus
End Function

' Kopfwert nach RFC 2047, wortweise: Woerter, die so stehen duerfen (WortSicher), bleiben Klartext; aufeinanderfolgende
' andere Woerter werden mit den Leerzeichen dazwischen zu EINEM kodierten Wort. So stossen nie zwei kodierte Woerter
' aneinander - das Leerzeichen dazwischen lesen Programme verschieden (RFC 2047 6.2 laesst es weg, Python im
' Anzeigenamen nicht) -, und die Zeile bleibt kurz (RFC 2047 2.: Zeilen mit kodierten Woertern hoechstens 76 Zeichen;
' bei langen Namen mit Adresse wird das ueberschritten, weil eine gefaltete Folgezeile mit einem Leerzeichen begaenne).
' Leerzeichen am Rand fallen weg. phrase = Anzeigename, sonst Betreff (unstrukturierter Text).
Public Function KopfWorte(s As String, phrase As Boolean) As String
    Dim w() As String, k() As Long, n As Long, i As Long, j As Long, links As Long, rechts As Long
    Dim t As String, aus As String, teil As String, lauf As String, m As Long
    t = Trim$(s)
    If Len(t) = 0 Then Exit Function
    w = Split(t, " ")
    n = UBound(w)
    ReDim k(0 To n)
    ' 0 = leer (weiteres Leerzeichen), 1 = Klartext, 2 = kodieren
    For i = 0 To n
        If Len(w(i)) = 0 Then
            k(i) = 0
        ElseIf WortSicher(w(i), phrase) Then
            k(i) = 1
        Else
            k(i) = 2
        End If
    Next i
    ' mehrere Leerzeichen zwischen zwei kodierten Woertern gehoeren mit in das kodierte Wort
    For i = 0 To n
        If k(i) = 0 Then
            links = 0
            rechts = 0
            For j = i - 1 To 0 Step -1
                If k(j) <> 0 Then links = k(j): Exit For
            Next j
            For j = i + 1 To n
                If k(j) <> 0 Then rechts = k(j): Exit For
            Next j
            If links = 2 And rechts = 2 Then k(i) = 2
        End If
    Next i
    i = 0
    Do While i <= n
        If k(i) = 2 Then
            lauf = w(i)
            j = i + 1
            Do While j <= n
                If k(j) <> 2 Then Exit Do
                lauf = lauf & " " & w(j)
                j = j + 1
            Loop
            teil = KodierteWorte(lauf)
            i = j
        Else
            teil = w(i)
            i = i + 1
        End If
        If m > 0 Then aus = aus & " "
        aus = aus & teil
        m = m + 1
    Loop
    KopfWorte = aus
End Function

' Mehrzeiligen Text (z. B. eine Excel-Fehlermeldung mit Aufzaehlung) in eine Zeile bringen: Zeilenumbrueche, Tabulatoren
' und Aufzaehlungspunkte werden zu Leerzeichen, mehrere Leerzeichen zu einem
Public Function EinZeilig(s As String) As String
    Dim t As String
    t = Replace(Replace(Replace(Replace(s, vbCr, " "), vbLf, " "), vbTab, " "), ChrW(8226), " ")
    Do While InStr(t, "  ") > 0
        t = Replace(t, "  ", " ")
    Loop
    EinZeilig = Trim$(t)
End Function

' Adresse ohne Zeichen, die in einer Adresse nichts verloren haben und den Kopf zerlegen wuerden
Private Function AdresseSauber(s As String) As String
    Dim i As Long, ch As String, aus As String
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        Select Case ch
            Case " ", vbTab, vbCr, vbLf, """", ",", "<", ">", ChrW(160)
            Case Else
                aus = aus & ch
        End Select
    Next i
    AdresseSauber = aus
End Function

' Anzeigename <adresse>; Woerter mit Sonderzeichen (auch Komma oder Punkt) im Anzeigenamen als kodiertes Wort
' (KopfWorte); leere Adresse -> <> (die Datei kann vor dem Versand ergaenzt werden)
Public Function Postfach(anzeige As String, adresse As String) As String
    Dim a As String, d As String
    a = AdresseSauber(adresse)
    d = KopfWorte(anzeige, True)
    If Len(d) = 0 Then
        Postfach = "<" & a & ">"
    Else
        Postfach = d & " <" & a & ">"
    End If
End Function

' RFC 2231: UTF-8-Bytes, ausser A-Z a-z 0-9 - . _ als %XX
Private Function ProzentKodiert(s As String) As String
    Dim b() As Byte, n As Long, i As Long, aus As String
    n = Utf8(s, b)
    For i = 0 To n - 1
        Select Case b(i)
            Case 48 To 57, 65 To 90, 97 To 122, 45, 46, 95
                aus = aus & Chr(b(i))
            Case Else
                aus = aus & "%" & Right$("0" & Hex$(b(i)), 2)
        End Select
    Next i
    ProzentKodiert = aus
End Function

' Dateiname als MIME-Token (ohne Anfuehrungszeichen gueltig): A-Z a-z 0-9 - _ . , Umlaute umgeschrieben
Public Function TokenName(s As String) As String
    TokenName = DateinameAscii(s)
    Do While Left$(TokenName, 1) = "-" Or Left$(TokenName, 1) = "."
        TokenName = Mid$(TokenName, 2)
    Loop
    If Len(TokenName) = 0 Then TokenName = "Anhang.pdf"
End Function

' "08 Oct 2026 11:30:00 +0200" - ohne Wochentag (RFC 5322 3.3: optional; er braeuchte ein Komma),
' Zeitzone Mitteleuropa mit Sommerzeit nach EU-Regel
Public Function MailDatum(d As Date) As String
    Dim monate As Variant, off As Long, vz As String
    monate = Split("Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec", ",")
    off = VersatzMinuten(d)
    If off >= 0 Then vz = "+" Else vz = "-"
    MailDatum = Right$("0" & Day(d), 2) & " " & monate(Month(d) - 1) & " " & _
                Year(d) & " " & Right$("0" & Hour(d), 2) & ":" & Right$("0" & Minute(d), 2) & ":" & Right$("0" & Second(d), 2) & _
                " " & vz & Right$("0" & (Abs(off) \ 60), 2) & Right$("0" & (Abs(off) Mod 60), 2)
End Function

Private Function LetzterSonntag(jahr As Long, monat As Long) As Date
    Dim d As Date
    d = DateSerial(jahr, monat + 1, 0)
    LetzterSonntag = d - (Weekday(d, vbMonday) Mod 7)
End Function

Private Function VersatzMinuten(d As Date) As Long
    Dim j As Long
    j = Year(d)
    If d >= LetzterSonntag(j, 3) + 2 / 24 And d < LetzterSonntag(j, 10) + 3 / 24 Then
        VersatzMinuten = 120
    Else
        VersatzMinuten = 60
    End If
End Function

' Kopfzeile "Name: Wert" + CRLF; leerer Wert ohne Leerzeichen am Ende. Laenger als 997 Zeichen (praktisch nie):
' am letzten Leerzeichen davor gefaltet (RFC 5322 2.1.1: hoechstens 998 Zeichen je Zeile).
Private Function KopfZeile(feld As String, wert As String) As String
    Dim rest As String, aus As String, p As Long, ab As Long
    If Len(wert) = 0 Then KopfZeile = feld & ":" & vbCrLf: Exit Function
    rest = feld & ": " & wert
    ab = Len(feld) + 3
    Do While Len(rest) > 997
        p = InStrRev(rest, " ", 997)
        If p < ab Then Exit Do
        aus = aus & Left$(rest, p - 1) & vbCrLf
        rest = Mid$(rest, p)
        ab = 2
    Loop
    KopfZeile = aus & rest & vbCrLf
End Function

' ------------------------------------------------------------------ EML
' anhaenge: Dateinamen und PDF-Inhalte (ASCII-Strings) in parallelen Arrays 1..anz
Public Function EmlBauen(absName As String, absAdr As String, empfName As String, empfAdr As String, betreff As String, _
                         text As String, anhNamen() As String, anhDaten() As String, anz As Long, auftrag As String) As String
    Dim grenze As String, kopf As String, rumpf As String, i As Long, b() As Byte, n As Long, msgId As String
    Dim stempel As String, tok As String, ct As String, cd As String, t As String, jetzt As Date
    jetzt = Now
    stempel = Year(jetzt) & Right$("0" & Month(jetzt), 2) & Right$("0" & Day(jetzt), 2) & Right$("0" & Hour(jetzt), 2) & _
              Right$("0" & Minute(jetzt), 2) & Right$("0" & Second(jetzt), 2) & Right$("0000" & CStr(Int(Rnd() * 100000)), 5)
    msgId = "<" & stempel & "." & DateinameAscii(auftrag) & "@pruefbot.invalid>"
    ' MIME-Token ohne tspecials (kein "=", kein Anfuehrungszeichen noetig); "-" kommt in Base64 nicht vor
    grenze = "Pruefbot-Grenze-" & stempel
    kopf = "X-Unsent: 1" & vbCrLf & KopfZeile("From", Postfach(absName, absAdr))
    ' ohne Empfaenger keine To-Zeile: Outlook oeffnet den Entwurf mit leerem An-Feld
    If Len(Trim$(empfAdr)) > 0 Or Len(empfName) > 0 Then kopf = kopf & KopfZeile("To", Postfach(empfName, empfAdr))
    kopf = kopf & KopfZeile("Subject", KopfWorte(betreff, False)) & _
           "Date: " & MailDatum(jetzt) & vbCrLf & _
           "Message-ID: " & msgId & vbCrLf & _
           "MIME-Version: 1.0" & vbCrLf
    If Len(auftrag) > 0 Then kopf = kopf & "X-Pruefbot-Auftrag: " & DateinameAscii(auftrag) & vbCrLf
    kopf = kopf & "Content-Type: multipart/mixed; boundary=" & grenze & vbCrLf
    t = Replace(Replace(text, vbCrLf, vbLf), vbLf, vbCrLf)
    rumpf = "This is a multi-part message in MIME format." & vbCrLf & vbCrLf & _
            "--" & grenze & vbCrLf & _
            "Content-Type: text/plain; charset=utf-8" & vbCrLf & _
            "Content-Transfer-Encoding: base64" & vbCrLf & vbCrLf & _
            TextBase64(t, 76) & vbCrLf
    For i = 1 To anz
        tok = TokenName(anhNamen(i))
        ' nur ein filename-Parameter: stuende der Token daneben, naehmen manche Leser (auch Python) den Token
        ct = "application/pdf; name=" & tok
        If tok = anhNamen(i) Then
            cd = "attachment; filename=" & tok
        Else
            cd = "attachment; filename*=UTF-8''" & ProzentKodiert(anhNamen(i))
        End If
        n = AsciiBytes(anhDaten(i), b)
        rumpf = rumpf & "--" & grenze & vbCrLf & _
                KopfZeile("Content-Type", ct) & _
                "Content-Transfer-Encoding: base64" & vbCrLf & _
                KopfZeile("Content-Disposition", cd) & vbCrLf & _
                Base64(b, n, 76) & vbCrLf
    Next i
    rumpf = rumpf & "--" & grenze & "--" & vbCrLf
    EmlBauen = kopf & vbCrLf & rumpf
End Function

' ------------------------------------------------------------------ Excel-Textexport (SharePoint)
' Uebersteht der Inhalt den Excel-Textexport (FileFormat 20, eine Zeile je Zelle, Zellen als Text) unveraendert?
' Leer = ja, sonst der Grund. Regeln siehe Modulkopf und README (Abschnitt „Ablage auf SharePoint“).
Public Function ExcelTextSicher(inhalt As String) As String
    Dim z() As String, i As Long, j As Long, s As String, n As Long, c As Long
    If Len(inhalt) < 3 Then ExcelTextSicher = "leer": Exit Function
    If Right$(inhalt, 2) <> vbCrLf Then ExcelTextSicher = "endet nicht mit einem Zeilenende": Exit Function
    z = Split(Left$(inhalt, Len(inhalt) - 2), vbCrLf)
    n = UBound(z) + 1
    If n > 1048576 Then ExcelTextSicher = "mehr Zeilen als ein Tabellenblatt hat": Exit Function
    If Len(z(0)) = 0 Then ExcelTextSicher = "erste Zeile leer": Exit Function
    If Len(z(n - 1)) = 0 Then ExcelTextSicher = "letzte Zeile leer": Exit Function
    For i = 0 To n - 1
        s = z(i)
        If Len(s) > 997 Then ExcelTextSicher = "Zeile " & (i + 1) & " länger als 997 Zeichen": Exit Function
        If InStr(s, """") > 0 Then ExcelTextSicher = "Zeile " & (i + 1) & " enthält ein Anführungszeichen": Exit Function
        If InStr(s, ",") > 0 Then ExcelTextSicher = "Zeile " & (i + 1) & " enthält ein Komma": Exit Function
        If Len(s) > 0 Then
            If Left$(s, 1) = " " Or Right$(s, 1) = " " Then
                ExcelTextSicher = "Zeile " & (i + 1) & " beginnt oder endet mit einem Leerzeichen"
                Exit Function
            End If
            If Left$(s, 1) = "'" Then ExcelTextSicher = "Zeile " & (i + 1) & " beginnt mit '": Exit Function
        End If
        For j = 1 To Len(s)
            c = AscW(Mid$(s, j, 1))
            If c < 32 Or c > 126 Then
                ExcelTextSicher = "Zeile " & (i + 1) & " enthält ein Steuer- oder Nicht-ASCII-Zeichen (" & c & ")"
                Exit Function
            End If
        Next j
    Next i
End Function

' EML ueber Excel als Textdatei speichern (Ziel auch https). probe: lokale Datei fuer den Probe-Export (leer = ohne
' Probe). Rueckgabe leer = gespeichert, sonst der Grund; die Art steht in ExcelFehlerArt.
Public Function EmlUeberExcel(ziel As String, inhalt As String, probe As String) As String
    Dim zeilen() As String, n As Long, grund As String, s As String
    ExcelFehlerArt = ""
    grund = ExcelTextSicher(inhalt)
    If Len(grund) > 0 Then
        ExcelFehlerArt = "PRUEFUNG"
        EmlUeberExcel = "Die Mail ist nicht für den Excel-Textexport geeignet: " & grund
        Exit Function
    End If
    zeilen = Split(Left$(inhalt, Len(inhalt) - 2), vbCrLf)
    n = UBound(zeilen) + 1
    If Len(probe) > 0 Then
        grund = TextMappeSpeichern(probe, zeilen, n)
        If Len(grund) > 0 Then
            ExcelFehlerArt = "PROBE"
            EmlUeberExcel = "Probe-Export nicht möglich: " & grund
            DateiLoeschen probe
            Exit Function
        End If
        s = DateiLesen(probe)
        DateiLoeschen probe
        If Not ExcelGleich(s, inhalt) Then
            ExcelFehlerArt = "PROBE"
            EmlUeberExcel = "Excel schreibt die Textdatei nicht zeichengenau (erste Abweichung in Zeile " & _
                            ErsteAbweichung(s, inhalt) & ")"
            Exit Function
        End If
    End If
    grund = TextMappeSpeichern(ziel, zeilen, n)
    If Len(grund) > 0 Then
        ExcelFehlerArt = "SPEICHERN"
        EmlUeberExcel = grund
    End If
End Function

' Zeilen in eine neue Mappe (Spalte A, Zellformat Text "@" vor dem Eintragen) und als Text speichern (FileFormat 20 =
' xlTextWindows: Tabulator, Windows-1252, CRLF). Rueckgabe leer = ok, sonst Fehlertext.
Private Function TextMappeSpeichern(pfad As String, zeilen() As String, n As Long) As String
    Dim wb As Object, a() As Variant, i As Long, versuch As Long, fNr As Long, fText As String
    On Error GoTo Fehler
    ReDim a(1 To n, 1 To 1)
    For i = 1 To n
        a(i, 1) = zeilen(i - 1)
    Next i
    Set wb = Workbooks.Add(-4167)
    With wb.Worksheets(1).Range("A1:A" & n)
        .NumberFormat = "@"
        .Value = a
    End With
    Application.DisplayAlerts = False
    ' SharePoint antwortet gelegentlich kurz nicht (Fehler 1004): bis zu zwei weitere Versuche mit Pause (wie im BUE-Reporting)
    For versuch = 1 To IIf(IstUrl(pfad), 3, 1)
        If versuch > 1 Then Application.Wait Now + TimeSerial(0, 0, 2 * (versuch - 1))
        On Error Resume Next
        Err.Clear
        wb.SaveAs pfad, 20
        fNr = Err.Number: fText = Err.Description
        On Error GoTo Fehler
        If fNr = 0 Then Exit For
    Next versuch
    If fNr <> 0 Then Err.Raise fNr, , fText
    Application.DisplayAlerts = True
    wb.Close False
    Set wb = Nothing
    ThisWorkbook.Activate
    Exit Function
Fehler:
    ' Excel meldet z. B. bei fehlendem Ordner mehrzeilig mit Aufzaehlung - fuer die Karte in eine Zeile
    TextMappeSpeichern = "Fehler " & Err.Number & ": " & EinZeilig(Err.Description)
    On Error Resume Next
    Application.DisplayAlerts = True
    If Not wb Is Nothing Then wb.Close False
    ThisWorkbook.Activate
End Function

' Hat Excel den Inhalt unveraendert geschrieben? Erlaubt ist nur ein fehlendes CRLF nach der letzten Zeile (die EML
' endet mit der Schlussgrenze; das CRLF danach ist nach RFC 2046 optional).
Public Function ExcelGleich(geschrieben As String, inhalt As String) As Boolean
    If geschrieben = inhalt Then
        ExcelGleich = True
    ElseIf Len(geschrieben) > 0 Then
        ExcelGleich = (geschrieben & vbCrLf = inhalt)
    End If
End Function

' Zeile (ab 1), in der sich zwei Texte zuerst unterscheiden
Private Function ErsteAbweichung(a As String, b As String) As Long
    Dim i As Long, n As Long
    n = Len(a)
    If Len(b) < n Then n = Len(b)
    ErsteAbweichung = 1
    For i = 1 To n
        If Mid$(a, i, 1) <> Mid$(b, i, 1) Then Exit Function
        If Mid$(a, i, 1) = vbLf Then ErsteAbweichung = ErsteAbweichung + 1
    Next i
End Function

' ------------------------------------------------------------------ Dateien
' ASCII-Inhalt binaer schreiben (ein Zeichen = ein Byte); vorhandene Datei wird ersetzt. Laesst sich eine vorhandene
' Datei nicht loeschen (geoeffnet, schreibgeschuetzt), wird nicht geschrieben: sonst blieben bei kuerzerem neuem
' Inhalt Restbytes der alten Datei stehen. Nach dem Schreiben muss die Laenge stimmen.
Public Function DateiSchreiben(pfad As String, inhalt As String) As Boolean
    Dim f As Integer, attr As Long, offen As Boolean
    attr = vbHidden Or vbSystem Or vbReadOnly
    On Error Resume Next
    If Len(Dir$(pfad, attr)) > 0 Then Kill pfad
    Err.Clear
    If Len(Dir$(pfad, attr)) > 0 Then Exit Function
    On Error GoTo Fehler
    f = FreeFile
    Open pfad For Binary Access Write As #f
    offen = True
    Put #f, 1, inhalt
    If LOF(f) <> Len(inhalt) Then
        Close #f
        Exit Function
    End If
    Close #f
    DateiSchreiben = True
    Exit Function
Fehler:
    On Error Resume Next
    If offen Then Close #f
End Function

' Datei binaer lesen (ein Byte = ein Zeichen); leer, wenn sie fehlt oder nicht lesbar ist
Public Function DateiLesen(pfad As String) As String
    Dim f As Integer, s As String, offen As Boolean, n As Long
    On Error GoTo Fehler
    If Len(Dir$(pfad)) = 0 Then Exit Function
    f = FreeFile
    Open pfad For Binary Access Read As #f
    offen = True
    n = LOF(f)
    If n > 0 Then
        s = String$(n, " ")
        Get #f, 1, s
    End If
    Close #f
    DateiLesen = s
    Exit Function
Fehler:
    On Error Resume Next
    If offen Then Close #f
End Function

Private Sub DateiLoeschen(pfad As String)
    On Error Resume Next
    If Len(Dir$(pfad)) > 0 Then Kill pfad
End Sub

Public Function DateiDa(pfad As String) As Boolean
    On Error Resume Next
    DateiDa = (Len(Dir$(pfad)) > 0)
End Function

Public Function Trenner(ordner As String) As String
    If InStr(ordner, "\") = 0 And InStr(ordner, "/") > 0 Then Trenner = "/" Else Trenner = "\"
End Function

Private Function OhneTrenner(o As String) As String
    OhneTrenner = o
    Do While Len(OhneTrenner) > 3 And (Right$(OhneTrenner, 1) = "\" Or Right$(OhneTrenner, 1) = "/")
        OhneTrenner = Left$(OhneTrenner, Len(OhneTrenner) - 1)
    Loop
End Function

' ------------------------------------------------------------------ Ausgabeweg
' Pfadwahl ohne Dialog und ohne Schreiben (auch in LibreOffice pruefbar). Rueckgabe "Art|Quelle|Ziel|Arbeitsordner":
'   Art LOKAL       Ordner auf der Platte oder im Netz (Ziel = Arbeitsordner)
'       SYNC        https-Adresse einer synchronisierten Bibliothek, lokal zugeordnet ueber die Registry (wie LOKAL)
'       SHAREPOINT  direkt per https: Ziel = https-Ordner (nur die EML), Arbeitsordner = Dokumente\Pruefbot_Testmails
'       DOKUMENTE   Datei noch nie gespeichert: Dokumente\Pruefbot_Testmails
'   Quelle Vorgabe (Aufruf), Einstellung („Ausgabeordner“) oder Datei (Pruefbot_Testmails neben der Datei)
' dateiOrdner/dateiName: Ordner (ThisWorkbook.Path, lokal oder https) und Name der Arbeitsmappe.
Public Function AusgabeZiel(vorgabe As String, einstellung As String, dateiOrdner As String, dateiName As String) As String
    Dim o As String, quelle As String, art As String, ziel As String, arbeit As String, k As String, sp As String
    o = Trim$(vorgabe)
    quelle = "Vorgabe"
    If Len(o) = 0 Then
        o = Trim$(einstellung)
        quelle = "Einstellung"
    End If
    If Len(o) = 0 Then
        quelle = "Datei"
        o = Trim$(dateiOrdner)
        If Len(o) = 0 Then
            art = "DOKUMENTE"
            ziel = DokumenteTestmails()
        ElseIf IstUrl(o) Then
            sp = SharePointDirekt(o)
            k = SyncOrdner(sp, dateiName)
            If Len(k) = 0 Then k = OneDriveSuche(sp, dateiName)
            If Len(k) > 0 Then
                art = "SYNC"
                ziel = k & Trenner(k) & ORDNER_NAME
            Else
                art = "SHAREPOINT"
                ziel = sp & "/" & ORDNER_NAME
            End If
        Else
            art = "LOKAL"
            ziel = OhneTrenner(o)
            ziel = ziel & Trenner(ziel) & ORDNER_NAME
        End If
    ElseIf IstUrl(o) Then
        sp = SharePointDirekt(o)
        k = SyncOrdner(sp, "")
        If Len(k) = 0 Then k = OneDriveSuche(sp, "")
        If Len(k) > 0 Then
            art = "SYNC"
            ziel = k
        Else
            art = "SHAREPOINT"
            ziel = sp
        End If
    Else
        art = "LOKAL"
        ziel = OhneTrenner(o)
    End If
    If art = "SHAREPOINT" Then arbeit = DokumenteTestmails() Else arbeit = ziel
    AusgabeZiel = art & "|" & quelle & "|" & ziel & "|" & arbeit
End Function

' Ausgabeordner fuer EML und PDFs (lokal, wird angelegt); leer, wenn er nicht angelegt werden konnte.
' Setzt ZielArt, ZielQuelle und ZielOrt (bei SHAREPOINT die https-Adresse, in die zusaetzlich die EML geht).
Public Function AusgabeOrdner(vorgabe As String) As String
    Dim z As Variant
    z = Split(AusgabeZiel(vorgabe, Einst("Ordner"), ThisWorkbook.Path, ThisWorkbook.Name), "|")
    ZielArt = CStr(z(0))
    ZielQuelle = CStr(z(1))
    ZielOrt = CStr(z(2))
    OrdnerVersuch = CStr(z(3))
    OrdnerAnlegen OrdnerVersuch
    If OrdnerDa(OrdnerVersuch) Then AusgabeOrdner = OrdnerVersuch
End Function

Private Function DokumenteTestmails() As String
    Dim d As String
    d = OhneTrenner(DokumenteOrdner())
    DokumenteTestmails = d & Trenner(d) & ORDNER_NAME
End Function

Private Function DokumenteOrdner() As String
    Dim s As String
    On Error Resume Next
    s = CreateObject("WScript.Shell").SpecialFolders("MyDocuments")
    On Error GoTo 0
    If Len(s) = 0 Then s = Environ$("USERPROFILE")
    If Len(s) > 0 And Len(Environ$("USERPROFILE")) > 0 And s = Environ$("USERPROFILE") Then s = s & "\Documents"
    If Len(s) = 0 Then s = Environ$("HOME")
    DokumenteOrdner = s
End Function

' lokale Datei fuer den Probe-Export vor dem Speichern auf SharePoint (%TEMP%, sonst der Arbeitsordner)
Public Function ProbeDatei(arbeitsordner As String) As String
    Dim t As String
    t = Environ$("TEMP")
    If Len(t) = 0 Then t = arbeitsordner
    t = OhneTrenner(t)
    ProbeDatei = t & Trenner(t) & "Pruefbot_Excelprobe.txt"
End Function

Public Function OrdnerDa(o As String) As Boolean
    On Error Resume Next
    OrdnerDa = (Len(Dir$(o, vbDirectory)) > 0)
End Function

Private Sub OrdnerAnlegen(o As String)
    Dim t As String, teile As Variant, i As Long, aktuell As String, start As Long
    If OrdnerDa(o) Then Exit Sub
    t = Trenner(o)
    teile = Split(o, t)
    If Left$(o, 2) = "\\" Then
        aktuell = "\\" & teile(2) & "\" & teile(3)
        start = 4
    ElseIf Left$(o, 1) = "/" Then
        aktuell = ""
        start = 1
    Else
        aktuell = teile(0)
        start = 1
    End If
    For i = start To UBound(teile)
        If Len(teile(i)) > 0 Then
            aktuell = aktuell & t & teile(i)
            If Not OrdnerDa(aktuell) Then
                On Error Resume Next
                MkDir aktuell
                On Error GoTo 0
            End If
        End If
    Next i
End Sub

' ------------------------------------------------------------------ SharePoint-Adressen
Public Function IstUrl(s As String) As Boolean
    Dim t As String
    t = LCase$(Trim$(s))
    IstUrl = (Left$(t, 8) = "https://" Or Left$(t, 7) = "http://")
End Function

' Browser- oder Freigabeadresse -> direkte Adresse https://host/sites/…/Shared Documents/Ordner (dekodiert, ohne "/" am
' Ende): id-Parameter aus …/AllItems.aspx?id=…, Pfadpraefix /:f:/r/ und Abfrageteil fallen weg (wie im HS-Dashboard).
' Freigabelinks mit Kennung (/:f:/s/…) enthalten keinen Pfad und bleiben unveraendert (Speichern scheitert dann sichtbar).
Public Function SharePointDirekt(eintrag As String) As String
    Dim u As String, kopf As String, host As String, rel As String, pfad As String, p As Long, q As Long
    u = Trim$(eintrag)
    p = InStr(u, "//")
    If p = 0 Then SharePointDirekt = u: Exit Function
    kopf = Left$(u, p + 1)
    host = Mid$(u, p + 2)
    If InStr(host, "/") > 0 Then host = Left$(host, InStr(host, "/") - 1)
    p = InStr(1, u, "?id=", vbTextCompare)
    If p = 0 Then p = InStr(1, u, "&id=", vbTextCompare)
    If p > 0 Then
        rel = Mid$(u, p + 4)
        q = InStr(rel, "&")
        If q > 0 Then rel = Left$(rel, q - 1)
        u = kopf & host & UrlDekodieren(rel)
    Else
        If InStr(u, "?") > 0 Then u = Left$(u, InStr(u, "?") - 1)
        If InStr(u, "#") > 0 Then u = Left$(u, InStr(u, "#") - 1)
        u = UrlDekodieren(u)
        pfad = Mid$(u, Len(kopf & host) + 1)
        If pfad Like "/:?:/r/*" Then u = kopf & host & Mid$(pfad, 7)
    End If
    Do While Right$(u, 1) = "/"
        u = Left$(u, Len(u) - 1)
    Loop
    SharePointDirekt = u
End Function

' %XX-Folgen (UTF-8) in Text zurueckwandeln, z. B. %C3%9C -> Ü; ohne ADODB
Public Function UrlDekodieren(u As String) As String
    Dim b() As Byte, cb() As Byte, n As Long, i As Long, L As Long, k As Long, j As Long, ch As String, istHex As Boolean
    If InStr(u, "%") = 0 Then UrlDekodieren = u: Exit Function
    L = Len(u)
    ReDim b(0 To 4 * L + 3)
    i = 1
    Do While i <= L
        ch = Mid$(u, i, 1)
        istHex = False
        If ch = "%" And i + 2 <= L Then istHex = (Mid$(u, i + 1, 2) Like "[0-9A-Fa-f][0-9A-Fa-f]")
        If istHex Then
            b(n) = CByte(Val("&H" & Mid$(u, i + 1, 2)))
            n = n + 1
            i = i + 3
        Else
            k = Utf8(ch, cb)
            For j = 0 To k - 1
                b(n) = cb(j): n = n + 1
            Next j
            i = i + 1
        End If
    Loop
    UrlDekodieren = Utf8Text(b, n)
End Function

' Adresse fuer Browser und Link: Leerzeichen, Umlaute und Sonderzeichen als %XX (UTF-8); Trenner bleiben
Public Function UrlKodieren(u As String) As String
    Dim b() As Byte, n As Long, i As Long, aus As String
    n = Utf8(u, b)
    For i = 0 To n - 1
        Select Case b(i)
            Case 48 To 57, 65 To 90, 97 To 122, 45, 46, 95, 126, 47, 58, 64, 33, 36, 38, 39, 40, 41, 42, 43, 44, 59, 61
                aus = aus & Chr(b(i))
            Case Else
                aus = aus & "%" & Right$("0" & Hex$(b(i)), 2)
        End Select
    Next i
    UrlKodieren = aus
End Function

' OneDrive-Verknuepfung („Verknuepfung zu OneDrive hinzufuegen“) oder Bibliotheksordner, den die Registry nicht zuordnet
' (wie BUE-Reporting ProfilSuche/SuchWurzeln): unter den OneDrive-Ordnern, ihren Unterordnern und den Bibliotheksordnern im
' Profil (…\<Firma>\<Seite> - Dokumente) jedes Ende der Adresse probieren. dateiName gesetzt: die Arbeitsmappe muss dort
' liegen (sicherer Treffer); sonst muss der Ordner bestehen und das Ende mindestens zwei Ebenen haben.
Private Function OneDriveSuche(url As String, dateiName As String) As String
    Dim teile() As String, wurzeln As Collection, w As Variant, v As Variant, u As Variant, j As Long, m As Long, kand As String
    On Error GoTo Ende
    teile = Split(Replace(UrlDekodieren(url), "\", "/"), "/")
    Set wurzeln = New Collection
    For Each v In Array(Environ$("OneDriveCommercial"), Environ$("OneDrive"), Environ$("OneDriveConsumer"))
        If Len(CStr(v)) > 0 Then
            wurzeln.Add CStr(v)
            For Each w In UnterOrdner(CStr(v))
                wurzeln.Add CStr(w)
            Next w
        End If
    Next v
    If Len(Environ$("USERPROFILE")) > 0 Then
        For Each w In UnterOrdner(Environ$("USERPROFILE"))
            For Each u In UnterOrdner(CStr(w))
                If InStr(1, CStr(u), " - ", vbTextCompare) > 0 Then wurzeln.Add CStr(u)
            Next u
        Next w
    End If
    For Each w In wurzeln
        For j = 3 To UBound(teile)
            If Len(dateiName) > 0 Or UBound(teile) - j >= 1 Then
                kand = OhneTrenner(CStr(w))
                For m = j To UBound(teile)
                    If Len(teile(m)) > 0 Then kand = kand & "\" & teile(m)
                Next m
                If Len(dateiName) > 0 Then
                    If DateiDa(kand & "\" & dateiName) Then OneDriveSuche = kand: Exit Function
                ElseIf OrdnerDa(kand) Then
                    OneDriveSuche = kand: Exit Function
                End If
            End If
        Next j
    Next w
Ende:
End Function

Private Function UnterOrdner(ordner As String) As Collection
    Dim c As New Collection, e As String
    On Error Resume Next
    e = Dir$(ordner & "\*", vbDirectory)
    Do While Len(e) > 0
        If e <> "." And e <> ".." And Left$(e, 1) <> "." Then
            If (GetAttr(ordner & "\" & e) And vbDirectory) = vbDirectory Then c.Add ordner & "\" & e
        End If
        e = Dir$()
    Loop
    Set UnterOrdner = c
End Function

' Synchronisierte Bibliothek: HKCU\Software\SyncEngines\Providers\OneDrive\<id> mit UrlNamespace (Adresse) und
' MountPoint (lokaler Ordner); die laengste passende Adresse gewinnt. dateiName gesetzt: die Datei muss dort liegen,
' sonst muss der Ordner bestehen. Leer, wenn nichts passt (oder ohne Windows). Nur Registry und lokale Pfade.
Private Function SyncOrdner(url As String, dateiName As String) As String
    Dim ns() As String, mp() As String, anz As Long, i As Long, ud As String, u As String, n As String
    Dim best As Long, kand As String, t As String, treffer As Boolean
    anz = SyncListe(ns, mp)
    If anz = 0 Then Exit Function
    ud = Replace(UrlDekodieren(url), "\", "/")
    If Right$(ud, 1) <> "/" Then ud = ud & "/"
    u = LCase$(ud)
    For i = 1 To anz
        n = LCase$(Replace(UrlDekodieren(ns(i)), "\", "/"))
        If Right$(n, 1) <> "/" Then n = n & "/"
        If Len(n) > best And Left$(u, Len(n)) = n Then
            t = Trenner(mp(i))
            kand = OhneTrenner(mp(i))
            If Len(ud) > Len(n) Then kand = kand & t & Replace(Mid$(ud, Len(n) + 1), "/", t)
            kand = OhneTrenner(kand)
            If Len(dateiName) > 0 Then
                treffer = DateiDa(kand & t & dateiName)
            Else
                treffer = OrdnerDa(kand)
            End If
            If treffer Then
                SyncOrdner = kand
                best = Len(n)
            End If
        End If
    Next i
End Function

Private Function SyncListe(ByRef ns() As String, ByRef mp() As String) As Long
    Const HKCU As Long = &H80000001
    Dim reg As Object, schluessel As Variant, k As Variant, a As Variant, b As Variant, basis As String, n As Long
    If Len(syncTestNs) > 0 Then
        ReDim ns(1 To 1)
        ReDim mp(1 To 1)
        ns(1) = syncTestNs
        mp(1) = syncTestMp
        SyncListe = 1
        Exit Function
    End If
    On Error GoTo Ende
    Set reg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")
    basis = "Software\SyncEngines\Providers\OneDrive"
    reg.EnumKey HKCU, basis, schluessel
    If Not IsArray(schluessel) Then Exit Function
    ReDim ns(1 To UBound(schluessel) - LBound(schluessel) + 1)
    ReDim mp(1 To UBound(schluessel) - LBound(schluessel) + 1)
    For Each k In schluessel
        a = Empty
        b = Empty
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "UrlNamespace", a
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "MountPoint", b
        If Not IsNull(a) And Not IsEmpty(a) And Not IsNull(b) And Not IsEmpty(b) Then
            n = n + 1
            ns(n) = CStr(a)
            mp(n) = CStr(b)
        End If
    Next k
Ende:
    SyncListe = n
End Function

' Nur fuer die Pruefung (LibreOffice, ohne Registry): eine Zuordnung Adresse -> lokaler Ordner vorgeben; leer = Registry
Public Sub SyncTestSetzen(urlNamespace As String, mountPoint As String)
    syncTestNs = urlNamespace
    syncTestMp = mountPoint
End Sub
