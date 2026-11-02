Option Explicit
' ============================================================================
' modBasis – Berichtstag, Spalte in Rohdaten, Ordner der Datei, Zahl und Datum aus Eingaben
' ============================================================================

Public Const RD_LETZTE_SPALTE As Long = 322         ' Rohdaten bis Spalte LJ (Kommentar)
Public Const ZU_START As Long = 5                   ' erste Datenzeile im Blatt Zuständigkeiten
Public Const ZU_VOLL As Long = 39                   ' Zuständigkeiten!AM (ausgeblendet): Kennzahl mit Thema und Kategorie
Public Const ZU_CODE As Long = 40                   ' Zuständigkeiten!AN (ausgeblendet): Code der Zeile oder ihrer Kategorie
Public Const ZU_ART As Long = 41                    ' Zuständigkeiten!AO (ausgeblendet): Art der Zeile – T Themenband, K Kategorieband, W Wertzeile
Public Const ZU_ZYKLUS As Long = 7                  ' Zuständigkeiten!G: Reportingzyklus (wöchentlich, monatlich, quartalsweise)
Public Const ZU_STATUS As Long = 8                  ' Zuständigkeiten!H: Status am Berichtstag (offen, erledigt, …)
Public Const MONAT_MARKE As String = "Monat"        ' Rohdaten Spalte A: Kopfzeile eines Monatsblocks (Monate statt KW)
Private basisCache As String                        ' aufgeloester Ordner bei SharePoint-Adresse (je Sitzung)
Private basisCacheUrl As String

Public Function Berichtstag() As Date
    Dim v As Variant
    v = ThisWorkbook.Worksheets("Konfiguration").Range("C6").Value
    If IsDate(v) Then
        Berichtstag = CDate(v)
    Else
        Berichtstag = Date + ((1 - Weekday(Date, vbMonday) + 7) Mod 7)      ' Rueckfall: naechster Montag
    End If
End Function

' Stichtag der Wochenwerte: Wochenspalte der gemeldeten KW (Konfiguration F6 = Name Stichtag; bis KW 41 Freitage, ab KW 42 der Meldetag Montag).
' Montag 19.10.2026 meldet KW 42 (Freitag 16.10.), ein Dienstag nach einem Feiertag ebenso. Rueckfall: letzter Freitag am oder
' vor dem Berichtstag.
Public Function Stichtag() As Date
    Dim b As Date, v As Variant
    v = ThisWorkbook.Worksheets("Konfiguration").Range("F6").Value
    If IsDate(v) Then
        Stichtag = CDate(v)
    Else
        b = Berichtstag()
        Stichtag = b - ((Weekday(b, vbMonday) + 2) Mod 7)
    End If
End Function

' Freitag der gemeldeten KW (die Wochenspalte heisst ab KW 42 wie ihr Meldetag, der Montag danach)
Public Function KwFreitag() As Date
    Dim s As Date
    s = Stichtag()
    KwFreitag = s - ((Weekday(s, vbMonday) + 2) Mod 7)
End Function

' Spalte des Stichtags (Wochenwerte) in Rohdaten (0 = keine Spalte fuer dieses Datum)
Public Function BerichtsSpalte() As Long
    Dim ws As Worksheet, c As Long, v As Variant, ziel As Long
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    ziel = CLng(Stichtag())
    For c = 9 To RD_LETZTE_SPALTE
        v = ws.Cells(1, c).Value2
        If IsNumeric(v) And Not IsEmpty(v) Then
            If CLng(v) = ziel Then
                BerichtsSpalte = c
                Exit Function
            End If
        End If
    Next c
End Function

' letzte belegte Zeile im Blatt Zuständigkeiten (UsedRange: Kennzahlen und Baender)
Public Function ZuLetzteZeile() As Long
    Dim ws As Worksheet
    Set ws = ThisWorkbook.Worksheets("Zuständigkeiten")
    ZuLetzteZeile = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
End Function

' ---------------------------------------------------------------- Monatsbloecke und Reportingzyklus
' Kopfzeile des Blocks, zu dem Rohdaten-Zeile r gehoert: 1 = Wochenwerte (Datum in Zeile 1), sonst die Zeile mit „Monat“ in
' Spalte A ueber r (Monatsbloecke unter den Wochenwerten, bisher Rohdaten_2 und Rohdaten_3)
Public Function KopfZeile(r As Long) As Long
    Dim ws As Worksheet, k As Long
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    For k = r To 2 Step -1
        If CStr(ws.Cells(k, 1).Value) = MONAT_MARKE Then KopfZeile = k: Exit Function
    Next k
    KopfZeile = 1
End Function

' Kopfzeile des Monatsblocks, der aus dem frueheren Blatt quelle stammt (Spalte F der Kopfzeile, z. B. "Rohdaten_3"); 0 = keiner
Public Function MonatsKopf(quelle As String) As Long
    Dim ws As Worksheet, k As Long, bis As Long
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    bis = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
    For k = 3 To bis
        If CStr(ws.Cells(k, 1).Value) = MONAT_MARKE And CStr(ws.Cells(k, 6).Value) = quelle Then MonatsKopf = k: Exit Function
    Next k
End Function

' Erste Kopfzeile eines Monatsblocks (0 = keiner): die Wochenwerte enden zwei Zeilen darueber
Public Function ErsterMonatsKopf() As Long
    Dim ws As Worksheet, k As Long, bis As Long
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    bis = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
    For k = 3 To bis
        If CStr(ws.Cells(k, 1).Value) = MONAT_MARKE Then ErsterMonatsKopf = k: Exit Function
    Next k
End Function

' Letzte Zeile des Monatsblocks mit Kopfzeile kopf (vor der Leerzeile bzw. dem naechsten Block)
Public Function BlockEnde(kopf As Long) As Long
    Dim ws As Worksheet, k As Long, bis As Long, c As Long, leer As Boolean
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    bis = ws.UsedRange.Row + ws.UsedRange.Rows.Count - 1
    BlockEnde = kopf + 1
    For k = kopf + 2 To bis
        If CStr(ws.Cells(k, 1).Value) = MONAT_MARKE Then Exit For
        leer = True
        For c = 1 To 5
            If Len(CStr(ws.Cells(k, c).Value)) > 0 Then leer = False: Exit For
        Next c
        If leer Then Exit For
        BlockEnde = k
    Next k
End Function

' Monat, fuer den eine Monatszeile am Berichtstag faellig ist: Vormonat (monatlich) bzw. letzter Monat des Vorquartals
Public Function ZielMonat(zyklus As String) As Date
    Dim b As Date
    b = Berichtstag()
    If LCase$(Trim$(zyklus)) = "quartalsweise" Then
        ZielMonat = DateSerial(Year(b), Int((Month(b) - 1) / 3) * 3, 1)
    Else
        ZielMonat = DateSerial(Year(b), Month(b) - 1, 1)
    End If
End Function

' Spalte in Rohdaten, in die der faellige Wert der Zeile r gehoert: Wochenwerte = Spalte des Berichtstags (auch bei Zyklus
' monatlich/quartalsweise: dort zaehlt ein Wert irgendwo im laufenden Monat/Quartal), Monatsbloecke = Spalte des faelligen
' Monats in der Kopfzeile des Blocks. 0 = keine Spalte.
Public Function ZielSpalte(r As Long, zyklus As String) As Long
    Dim kopf As Long, ws As Worksheet, c As Long, v As Variant, ziel As Long
    kopf = KopfZeile(r)
    If kopf = 1 Then ZielSpalte = BerichtsSpalte(): Exit Function
    Set ws = ThisWorkbook.Worksheets("Rohdaten")
    ziel = CLng(ZielMonat(zyklus))
    For c = 9 To RD_LETZTE_SPALTE
        v = ws.Cells(kopf, c).Value2
        If IsNumeric(v) And Not IsEmpty(v) Then
            If CLng(v) = ziel Then ZielSpalte = c: Exit Function
        End If
    Next c
End Function

' Anzeige des faelligen Termins: „09.10.2026“ bzw. „September 2026“
Public Function ZielText(r As Long, zyklus As String) As String
    If KopfZeile(r) = 1 Then
        ZielText = "KW " & DatePart("ww", KwFreitag(), vbMonday, vbFirstFourDays) & " (Stand " & Format(Stichtag(), "dd.mm.yyyy") & ")"
    Else
        ZielText = MonatName(ZielMonat(zyklus))
    End If
End Function

Public Function MonatName(d As Date) As String
    MonatName = Choose(Month(d), "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", _
                       "November", "Dezember") & " " & Year(d)
End Function

' Status einer Wertzeile in Zuständigkeiten (Spalte H, rechnet mit dem Zyklus): erledigt?
Public Function ZuErledigt(r As Long) As Boolean
    ZuErledigt = (LCase$(Trim$(CStr(ThisWorkbook.Worksheets("Zuständigkeiten").Cells(r, ZU_STATUS).Value))) = "erledigt")
End Function

Public Function ZuZyklus(r As Long) As String
    ZuZyklus = LCase$(Trim$(CStr(ThisWorkbook.Worksheets("Zuständigkeiten").Cells(r, ZU_ZYKLUS).Value)))
    If Len(ZuZyklus) = 0 Then ZuZyklus = "wöchentlich"
End Function

' Wertzeile (nicht Themen- oder Kategorieband): Spalte A traegt die Zeile in Rohdaten (Formel =ROW(Rohdaten!$A$n), stimmt
' auch nach „KPI löschen“; #BEZUG! oder leer = keine Wertzeile)
Public Function ZuWertzeile(r As Long) As Boolean
    Dim v As Variant
    v = ThisWorkbook.Worksheets("Zuständigkeiten").Cells(r, 1).Value2
    If IsEmpty(v) Or IsError(v) Then Exit Function
    ZuWertzeile = IsNumeric(v) And VarType(v) <> vbString
End Function

Public Function WertDa(v As Variant) As Boolean
    If IsError(v) Or IsEmpty(v) Then Exit Function
    WertDa = IsNumeric(v) And Not (VarType(v) = vbString)
End Function

' Personen einer Zustaendigkeitszeile (Spalte E, mit "/" getrennt) enthaelt den Namen?
Public Function PersonPasst(personen As String, nm As String) As Boolean
    Dim teile() As String, i As Long
    teile = Split(personen, "/")
    For i = 0 To UBound(teile)
        If StrComp(LCase$(Trim$(teile(i))), LCase$(Trim$(nm)), vbBinaryCompare) = 0 Then     ' exakt: "Greß" ist nicht "Gress"
            PersonPasst = True
            Exit Function
        End If
    Next i
End Function

' Ordner dieser Datei als Dateipfad. Bei SharePoint/OneDrive liefert ThisWorkbook.Path eine https-Adresse, mit der Dir() und MkDir
' nicht arbeiten. Reihenfolge: Konfiguration!C12 (Dateipfad) · lokaler Pfad · synchronisierte Bibliothek (Registry) ·
' WebDAV-Pfad \\host@SSL\DavWWWRoot\… nur wenn der Dienst WebClient laeuft (ein Versuch, kein Warten) · OneDrive-/Bibliotheksordner
' im Profil · leer (kein Dialog, wenn stumm = True). Leer heisst: die Datei liegt nur auf SharePoint – Vorlage und BUE-Master werden
' dann direkt ueber https geoeffnet. Ergebnis je Sitzung zwischengespeichert, auch das leere.
Public Function BasisOrdner(Optional stumm As Boolean = False) As String
    Dim p As String, k As String, kand As String
    k = Trim$(CStr(ThisWorkbook.Worksheets("Konfiguration").Range("C12").Value))
    If LCase$(Left$(k, 4)) = "http" Then k = ""                       ' Browser-Adresse: kein Dateipfad, https wird direkt genutzt
    If Len(k) > 0 Then
        If Right$(k, 1) = Application.PathSeparator Then k = Left$(k, Len(k) - 1)
        If DateiDa(k & Application.PathSeparator & ThisWorkbook.Name) Then
            BasisOrdner = k
            Exit Function
        End If
    End If
    p = ThisWorkbook.Path
    If LCase$(Left$(p, 4)) <> "http" Then
        BasisOrdner = p
        Exit Function
    End If
    If basisCacheUrl = p Then
        BasisOrdner = basisCache
        If Len(basisCache) > 0 Or stumm Then Exit Function
    Else
        kand = SyncZuordnung(p)
        If Len(kand) = 0 Then kand = WebDavOrdner(p)
        If Len(kand) = 0 Then kand = ProfilSuche(p)
        basisCache = kand: basisCacheUrl = p
        If Len(kand) > 0 Then
            BasisOrdner = kand
            Exit Function
        End If
    End If
    If stumm Then Exit Function
    With Application.FileDialog(4)
        .Title = "Ordner dieser Datei wählen (SharePoint-Adresse konnte nicht zugeordnet werden)"
        .AllowMultiSelect = False
        If .Show = -1 Then
            BasisOrdner = .SelectedItems(1)
            ThisWorkbook.Worksheets("Konfiguration").Range("C12").Value = BasisOrdner
            basisCache = BasisOrdner: basisCacheUrl = p
        End If
    End With
End Function

' Pfad oder SharePoint-Adresse einer Datei nutzbar machen. Lokaler/UNC-Pfad bleibt. Browser-Adresse (…AllItems.aspx?id=/sites/…)
' oder direkte Adresse -> direkte https-Adresse; zeigt sie auf einen Ordner, wird standardDatei angehaengt. Immer die https-Adresse
' (Excel und PowerPoint oeffnen sie direkt); url bleibt nur fuer bestehende Aufrufe.
Public Function DateiPfad(eintrag As String, standardDatei As String, Optional url As Boolean = True) As String
    Dim d As String, w As String, endung As String
    d = Trim$(eintrag)
    If LCase$(Left$(d, 4)) <> "http" Then DateiPfad = d: Exit Function
    d = SharePointDirekt(d)
    endung = LCase$(Mid$(d, InStrRev(d, ".") + 1))
    If InStrRev(d, ".") < InStrRev(d, "/") Or Len(endung) > 4 Then d = d & "/" & standardDatei
    DateiPfad = d                                      ' https direkt (Excel und PowerPoint oeffnen es mit der Office-Anmeldung)
End Function

' Ist die Datei erreichbar? https-Adressen gelten als erreichbar, wenn der WebDAV-Pfad existiert oder nicht pruefbar ist (dann
' entscheidet erst das Oeffnen)
Public Function DateiErreichbar(pfad As String) As Boolean
    If LCase$(Left$(pfad, 4)) = "http" Then
        DateiErreichbar = True
    Else
        DateiErreichbar = DateiDa(pfad)
    End If
End Function

' Browser-Adresse -> direkte Adresse: https://host/sites/…/Shared Documents/Ordner (dekodiert); id-Parameter aus AllItems.aspx
Public Function SharePointDirekt(eintrag As String) As String
    Dim u As String, host As String, rel As String, p As Long, q As Long
    u = Trim$(eintrag)
    host = Mid$(u, InStr(u, "//") + 2)
    If InStr(host, "/") > 0 Then host = Left$(host, InStr(host, "/") - 1)
    p = InStr(1, u, "?id=", vbTextCompare)
    If p = 0 Then p = InStr(1, u, "&id=", vbTextCompare)
    If p > 0 Then
        rel = Mid$(u, p + 4)
        q = InStr(rel, "&")
        If q > 0 Then rel = Left$(rel, q - 1)
        SharePointDirekt = "https://" & host & UrlDekodieren(rel)
    Else
        If InStr(u, "?") > 0 Then u = Left$(u, InStr(u, "?") - 1)
        SharePointDirekt = UrlDekodieren(u)
    End If
    Do While Right$(SharePointDirekt, 1) = "/": SharePointDirekt = Left$(SharePointDirekt, Len(SharePointDirekt) - 1): Loop
End Function

' https://host/pfad -> \\host@SSL\DavWWWRoot\pfad (Windows-WebDAV, Dienst „WebClient“)
Public Function WebDavVorschlag(url As String) As String
    Dim u As String, p As Long
    u = UrlDekodieren(url)
    If LCase$(Left$(u, 8)) <> "https://" Then Exit Function
    u = Mid$(u, 9)
    p = InStr(u, "/")
    If p = 0 Then Exit Function
    WebDavVorschlag = "\\" & Left$(u, p - 1) & "@SSL\DavWWWRoot\" & Replace(Mid$(u, p + 1), "/", "\")
    Do While Right$(WebDavVorschlag, 1) = "\": WebDavVorschlag = Left$(WebDavVorschlag, Len(WebDavVorschlag) - 1): Loop
End Function

' Ordner der Datei per WebDAV – nur wenn der Windows-Dienst WebClient bereits laeuft. Sonst blockiert schon die Pruefung des Pfads
' (Windows sucht ihn als Netzwerkfreigabe). Microsoft hat WebClient im November 2023 abgekuendigt; er startet nicht mehr von selbst.
Private Function WebDavOrdner(url As String) As String
    Dim w As String, wmi As Object, d As Object, laeuft As Boolean
    On Error GoTo Ende
    w = WebDavVorschlag(url)
    If Len(w) = 0 Then Exit Function
    Set wmi = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
    For Each d In wmi.ExecQuery("SELECT State FROM Win32_Service WHERE Name='WebClient'")
        If LCase$(CStr(d.State)) = "running" Then laeuft = True
    Next d
    If Not laeuft Then Exit Function
    If DateiDa(w & "\" & ThisWorkbook.Name) Then WebDavOrdner = w
Ende:
End Function

' synchronisierte Bibliothek: HKCU\Software\SyncEngines\Providers\OneDrive\<id> (UrlNamespace -> MountPoint)
Private Function SyncZuordnung(url As String) As String
    Const HKCU As Long = &H80000001
    Dim reg As Object, schluessel As Variant, k As Variant, ns As Variant, mp As Variant, basis As String
    Dim u As String, ud As String, n As String, best As Long, kand As String
    On Error GoTo Ende
    Set reg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")
    basis = "Software\SyncEngines\Providers\OneDrive"
    reg.EnumKey HKCU, basis, schluessel
    If Not IsArray(schluessel) Then Exit Function
    ud = Replace(UrlDekodieren(url), "\", "/")
    If Right$(ud, 1) <> "/" Then ud = ud & "/"
    u = LCase$(ud)
    For Each k In schluessel
        ns = Empty: mp = Empty
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "UrlNamespace", ns
        reg.GetStringValue HKCU, basis & "\" & CStr(k), "MountPoint", mp
        If Not IsNull(ns) And Not IsEmpty(ns) And Not IsNull(mp) And Not IsEmpty(mp) Then
            n = LCase$(Replace(UrlDekodieren(CStr(ns)), "\", "/"))
            If Right$(n, 1) <> "/" Then n = n & "/"
            If Len(n) > best And Left$(u, Len(n)) = n Then
                kand = CStr(mp) & "\" & Replace(Mid$(ud, Len(n) + 1), "/", "\")
                Do While Right$(kand, 1) = "\": kand = Left$(kand, Len(kand) - 1): Loop
                If DateiDa(kand & "\" & ThisWorkbook.Name) Then SyncZuordnung = kand: best = Len(n)
            End If
        End If
    Next k
Ende:
End Function

' OneDrive-Ordner und Bibliotheksordner unter dem Benutzerprofil: das Ende der Adresse darunter suchen
Private Function ProfilSuche(url As String) As String
    Dim teile() As String, wurzeln As Collection, w As Variant, v As Variant, j As Long, m As Long, kand As String
    On Error GoTo Ende
    teile = Split(Replace(UrlDekodieren(url), "\", "/"), "/")
    Set wurzeln = New Collection
    For Each v In Array(Environ$("OneDriveCommercial"), Environ$("OneDriveConsumer"), Environ$("OneDrive"))
        If Len(CStr(v)) > 0 Then wurzeln.Add CStr(v)
    Next v
    If Len(Environ$("USERPROFILE")) > 0 Then
        For Each w In UnterOrdner(Environ$("USERPROFILE"))
            For Each v In UnterOrdner(CStr(w))
                If InStr(1, CStr(v), " - ", vbTextCompare) > 0 Then wurzeln.Add CStr(v)
            Next v
        Next w
    End If
    For Each w In wurzeln
        For j = 3 To UBound(teile)
            kand = CStr(w)
            For m = j To UBound(teile)
                kand = kand & "\" & teile(m)
            Next m
            If DateiDa(kand & "\" & ThisWorkbook.Name) Then ProfilSuche = kand: Exit Function
        Next j
    Next w
Ende:
End Function

Private Function UnterOrdner(ordner As String) As Collection
    Dim c As New Collection, e As String
    On Error Resume Next
    e = Dir(ordner & "\*", vbDirectory)
    Do While Len(e) > 0
        If e <> "." And e <> ".." And Left$(e, 1) <> "." Then
            If (GetAttr(ordner & "\" & e) And vbDirectory) = vbDirectory Then c.Add ordner & "\" & e
        End If
        e = Dir()
    Loop
    Set UnterOrdner = c
End Function

' %XX-Folgen (UTF-8) in Text zurueckwandeln, z. B. %C3%9C -> Ü
Public Function UrlDekodieren(u As String) As String
    Dim i As Long, bytes() As Byte, n As Long, stream As Object, s As String, t As Object, b() As Byte, q As Long
    On Error GoTo Roh
    If InStr(u, "%") = 0 Then UrlDekodieren = u: Exit Function
    ReDim bytes(0 To Len(u) * 3)
    i = 1
    Do While i <= Len(u)
        If Mid$(u, i, 1) = "%" And i + 2 <= Len(u) Then
            bytes(n) = CByte("&H" & Mid$(u, i + 1, 2)): n = n + 1: i = i + 3
        Else
            s = Mid$(u, i, 1)
            If AscW(s) < 128 And AscW(s) >= 0 Then
                bytes(n) = AscW(s): n = n + 1
            Else
                Set t = CreateObject("ADODB.Stream")
                t.Type = 2: t.Charset = "utf-8": t.Open: t.WriteText s: t.Position = 0: t.Type = 1
                b = t.Read
                t.Close
                For q = 3 To UBound(b)
                    bytes(n) = b(q): n = n + 1
                Next q
            End If
            i = i + 1
        End If
    Loop
    ReDim Preserve bytes(0 To n - 1)
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 1: stream.Open: stream.Write bytes: stream.Position = 0
    stream.Type = 2: stream.Charset = "utf-8"
    UrlDekodieren = stream.ReadText
    stream.Close
    Exit Function
Roh:
    UrlDekodieren = Replace(u, "%20", " ")
End Function

Public Function DateiDa(pfad As String) As Boolean
    On Error Resume Next
    DateiDa = (Len(Dir(pfad)) > 0)
    On Error GoTo 0
End Function

' Zahl aus einer Eingabe im deutschen Format: "1.234", "1234", "12,5", "-3" (Punkt = Tausender, Komma = Dezimal)
Public Function ZahlLesen(ByVal t As String, ByRef ok As Boolean) As Double
    Dim i As Long, ch As String, s As String
    ok = False
    t = Replace(Replace(Trim$(t), " ", ""), Chr(160), "")
    If Len(t) = 0 Then Exit Function
    If InStr(t, ",") > 0 Then
        t = Replace(t, ".", "")
        t = Replace(t, ",", ".")
    ElseIf InStr(t, ".") > 0 Then
        If (Len(t) - InStr(t, ".")) = 3 Or Len(t) - Len(Replace(t, ".", "")) > 1 Then t = Replace(t, ".", "")   ' 1.234 = Tausender
    End If
    For i = 1 To Len(t)
        ch = Mid$(t, i, 1)
        If Not (ch Like "#" Or ch = "." Or (ch = "-" And i = 1)) Then Exit Function
    Next i
    If Len(t) - Len(Replace(t, ".", "")) > 1 Or t = "-" Or t = "." Then Exit Function
    ZahlLesen = Val(t)
    ok = True
End Function

' Datum aus einer Eingabe im deutschen Format: "08.10.2026", "8.10.2026", "08.10.26", "08.10." bzw. "08.10" (laufendes Jahr;
' laege der Tag damit mehr als einen Tag in der Zukunft, gilt das Vorjahr: Eingabe im Januar fuer den Dezember).
' ok = False bei ungueltigem Datum (z. B. 31.02.) und bei einem Datum mehr als einen Tag in der Zukunft; im zweiten Fall
' liefert die Funktion trotzdem das Datum (fuer die Meldung), sonst 0.
Public Function DatumLesen(ByVal t As String, ByRef ok As Boolean) As Date
    Dim teile() As String, i As Long, tg As Long, mo As Long, jr As Long, d As Date, ohneJahr As Boolean
    ok = False
    t = Replace(Replace(Trim$(t), " ", ""), Chr(160), "")
    If Right$(t, 1) = "." Then t = Left$(t, Len(t) - 1)          ' "08.10." wie "08.10"
    If Len(t) = 0 Then Exit Function
    teile = Split(t, ".")
    If UBound(teile) < 1 Or UBound(teile) > 2 Then Exit Function
    For i = 0 To UBound(teile)
        If Len(teile(i)) = 0 Or Len(teile(i)) > 4 Then Exit Function
        If Not (teile(i) Like String$(Len(teile(i)), "#")) Then Exit Function      ' nur Ziffern
    Next i
    If Len(teile(0)) > 2 Or Len(teile(1)) > 2 Then Exit Function
    tg = CLng(teile(0))
    mo = CLng(teile(1))
    If UBound(teile) = 1 Then
        jr = Year(Date)
        ohneJahr = True
    ElseIf Len(teile(2)) = 2 Then
        jr = 2000 + CLng(teile(2))
    ElseIf Len(teile(2)) = 4 Then
        jr = CLng(teile(2))
    Else
        Exit Function
    End If
    If tg < 1 Or tg > 31 Or mo < 1 Or mo > 12 Or jr < 2000 Or jr > 2099 Then Exit Function
    d = DateSerial(jr, mo, tg)
    If ohneJahr And d > Date + 1 Then
        jr = jr - 1
        d = DateSerial(jr, mo, tg)
    End If
    If Day(d) <> tg Then Exit Function                            ' 31.02. rechnet DateSerial in den Maerz um: ungueltig
    DatumLesen = d
    If d > Date + 1 Then Exit Function                            ' Zukunft: ok bleibt False
    ok = True
End Function

Public Function BasisVersion() As String
    BasisVersion = "1"
End Function
