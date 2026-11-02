Option Explicit
' ============================================================================
' modTestmail - Knopf "Testmail erstellen"
'
' Ablauf: Auswahlkarte (alle Mail-Auftraege mit Ampel, Filter, Blaettern; technische Datensaetze / Weg B ausgegraut)
'   -> Pruefung (modTmModell) -> fehlen Werte: Karte mit Liste, je Wert "Zum Feld", dazu "Trotzdem erstellen"
'   -> Erzeugen: EML + PDF-Anhaenge in den Ausgabeordner, Protokollzeile
'      Liegt die Datei nur auf SharePoint (https, nicht synchronisiert): EML + PDFs als Arbeitskopie lokal, die EML
'      zusaetzlich ueber Excel als Text in <Ordner der Datei>/Pruefbot_Testmails (PDFs nur als Anhang in der EML)
'   -> Ergebniskarte: Mail oeffnen, Ordner oeffnen, Als vorbereitet markieren, weitere Testmail.
'
' Ohne Dialog pruefbar (auch in LibreOffice): TestmailFehlend, TestmailHinweise, TestmailErzeugen, GeneratorVersion,
' GeneratorAblage, EmlSelbsttest; Pfadwahl: modTmEml.AusgabeZiel.
' ============================================================================

Public Const GEN_VERSION As String = "1.3 (14.10.2026)"

Private aAnz As Long
Private aID() As String
Private aTitel() As String
Private aUnter() As String
Private aStatus() As Long
Private aFehl() As Long
Private aFilter As Long
Private aSeite As Long
Private aGewaehlt As String
Private fIdx() As Long
Private fAnz As Long
Private klickIdx As Long
Private letzterFehler As String
Private letzterPfad As String
Private letzterAuftrag As String
Private letzteFehlAnz As Long
Private letzterSp As String          ' https-Adresse der EML auf SharePoint (leer = nur lokal)
Private letzterSpFehler As String    ' Grund, wenn die EML nicht auf SharePoint gespeichert werden konnte
Private letzterSpNeben As Boolean    ' Ordner Pruefbot_Testmails fehlte: EML direkt neben der Arbeitsmappe auf SharePoint

' ------------------------------------------------------------------ ohne Dialog
Public Function GeneratorVersion() As String
    GeneratorVersion = "Testmail-Generator " & GEN_VERSION
End Function

' Fehlende Werte als Zeilen "Feld – wo eintragen"; leer = vollstaendig; "KEINE MAIL: ..." bei Weg B / technischem Datensatz
Public Function TestmailFehlend(auftragsId As String) As String
    TestmailFehlend = modTmModell.FehlendText(auftragsId)
End Function

' Hinweise zum Auftrag (optionale Felder, Vorbelegungen, Zeichen ausserhalb der PDF-Schrift ...) als Zeilen
Public Function TestmailHinweise(auftragsId As String) As String
    Dim i As Long, s As String
    modTmModell.ModellBauen auftragsId
    For i = 1 To M_HinwAnz
        If Len(s) > 0 Then s = s & vbLf
        s = s & M_Hinw(i)
    Next i
    TestmailHinweise = s
End Function

Public Function GeneratorLetzterFehler() As String
    GeneratorLetzterFehler = letzterFehler
End Function

' Ablage der letzten Testmail: "Art|Quelle|Ziel|SharePoint-Datei|Hinweis" (Art/Quelle/Ziel wie modTmEml.AusgabeZiel;
' SharePoint-Datei leer = nicht auf SharePoint; Hinweis = Grund, wenn das Speichern auf SharePoint scheiterte)
Public Function GeneratorAblage() As String
    GeneratorAblage = ZielArt & "|" & ZielQuelle & "|" & ZielOrt & "|" & letzterSp & "|" & letzterSpFehler
End Function

' Selbsttest des EML-Formats ohne Dialog: Anzeigenamen und Betreff mit Komma, Anfuehrungszeichen, Semikolon, Umlauten und
' Zeichen ausserhalb Windows-1252, ein langer Anzeigename (Wort ueber 45 Byte mit Komma, dazu & und Punkt) - er muss
' ohne aneinanderstossende kodierte Woerter auskommen -, Text mit Tabulator, ein Anhangsname mit Umlaut, Komma und
' Leerzeichen (RFC 2231) und
' einer mit reinem Token-Namen (Inhalt: Vollmacht zu MAIL-001). Schreibt EML und PDFs in ordner, Rueckgabe Pfad der EML
' (leer bei Fehler, Grund in GeneratorLetzterFehler). mitExcel: zusaetzlich ueber den Excel-Textexport speichern (mit
' Probe) und byte-gleich vergleichen - in Excel im Direktfenster: ?modTestmail.EmlSelbsttest("C:\Temp", True)
Public Function EmlSelbsttest(ordner As String, mitExcel As Boolean) As String
    Dim namen(1 To 2) As String, daten(1 To 2) As String, eml As String, t As String, o As String, d As Long
    Dim pfad As String, grund As String
    letzterFehler = ""
    On Error GoTo Fehler
    o = Trim$(ordner)
    If Len(o) = 0 Then letzterFehler = "Kein Ordner angegeben.": Exit Function
    t = Trenner(o)
    modTmModell.ModellBauen "MAIL-001"
    If M_DokAnz < 1 Then letzterFehler = "MAIL-001 hat kein Dokument.": Exit Function
    namen(1) = "Vollmacht Müller, Größe.pdf"
    namen(2) = "SELBSTTEST_Anlage.pdf"
    daten(1) = DokumentPdf(1)
    daten(2) = daten(1)
    For d = 1 To 2
        If Not DateiSchreiben(o & t & namen(d), daten(d)) Then
            letzterFehler = "PDF konnte nicht geschrieben werden: " & o & t & namen(d)
            Exit Function
        End If
    Next d
    eml = EmlBauen("Müller, Jürgen " & ChrW(321) & "ukasz", "juergen.mueller@example.org", _
                   "Allfinanz-Versicherungsvermittlungsgesellschaft, Mustermann GmbH & Co. KG", _
                   "allfinanz@example.org", "Selbsttest ""BÜ"", Größe; a=b =?x?= " & ChrW(8364) & " Ende", _
                   "Zeile 1 mit ""Anführungszeichen"", Komma und Tab" & vbTab & "Ende" & vbLf & _
                   "Zeile 2: Grüße – " & ChrW(321) & ChrW(337) & ChrW(378) & vbLf, namen, daten, 2, "SELBSTTEST")
    pfad = o & t & "SELBSTTEST_Pruefbot.eml"
    If Not DateiSchreiben(pfad, eml) Then
        letzterFehler = "EML konnte nicht geschrieben werden: " & pfad
        Exit Function
    End If
    If mitExcel Then
        grund = EmlUeberExcel(o & t & "SELBSTTEST_Excel.eml", eml, ProbeDatei(o))
        If Len(grund) > 0 Then letzterFehler = "Excel-Textexport: " & grund: Exit Function
        If Not ExcelGleich(DateiLesen(o & t & "SELBSTTEST_Excel.eml"), eml) Then
            letzterFehler = "Excel-Textexport: SELBSTTEST_Excel.eml weicht von der EML ab."
            Exit Function
        End If
    End If
    EmlSelbsttest = pfad
    Exit Function
Fehler:
    letzterFehler = "Fehler " & Err.Number & ": " & Err.Description
End Function

' Erzeugt EML und PDF-Anhaenge; Rueckgabe: Pfad der EML im lokalen Ausgabe- bzw. Arbeitsordner (leer bei Fehler,
' Grund in GeneratorLetzterFehler). ordner leer = Einstellung bzw. neben der Datei (auch https). trotzdem = auch mit
' fehlenden Werten (bleiben als [PLATZHALTER]). Ablage auf SharePoint und Hinweise: GeneratorAblage.
Public Function TestmailErzeugen(auftragsId As String, ordner As String, trotzdem As Boolean) As String
    Dim o As String, t As String, d As Long, namen(1 To 3) As String, daten(1 To 3) As String, eml As String, pfad As String
    Dim grund As String, neben As String
    letzterFehler = ""
    letzterSp = ""
    letzterSpFehler = ""
    letzterSpNeben = False
    On Error GoTo Fehler
    modTmModell.ModellBauen auftragsId
    If Not M_Erzeugbar Then
        letzterFehler = M_KeineMail
        Exit Function
    End If
    If M_FehlAnz > 0 And Not trotzdem Then
        letzterFehler = "Es fehlen " & M_FehlAnz & " Werte."
        Exit Function
    End If
    o = AusgabeOrdner(ordner)
    If Len(o) = 0 Then
        letzterFehler = "Der Ausgabeordner „" & OrdnerVersuch & "“ konnte nicht angelegt werden. Bitte unter " & _
                        "Testmail-Generator › Einstellungen › Ausgabeordner einen beschreibbaren Ordner eintragen."
        Exit Function
    End If
    t = Trenner(o)
    For d = 1 To M_DokAnz
        namen(d) = M_DokDatei(d)
        daten(d) = DokumentPdf(d)
        If Not DateiSchreiben(o & t & namen(d), daten(d)) Then
            letzterFehler = "PDF konnte nicht geschrieben werden (Datei geöffnet?): " & o & t & namen(d)
            Exit Function
        End If
    Next d
    eml = EmlBauen(M_AbsName, M_AbsAdr, M_EmpfName, M_EmpfAdr, M_Betreff, M_Text, namen, daten, M_DokAnz, M_ID)
    pfad = o & t & M_EmlName
    If Not DateiSchreiben(pfad, eml) Then
        letzterFehler = "EML konnte nicht geschrieben werden (Datei geöffnet?): " & pfad
        Exit Function
    End If
    ' nur SharePoint (https, nicht synchronisiert): die EML zusaetzlich dorthin; die PDFs stecken als Anhang darin
    If ZielArt = "SHAREPOINT" Then
        grund = EmlUeberExcel(ZielOrt & "/" & M_EmlName, eml, ProbeDatei(o))
        If Len(grund) = 0 Then
            letzterSp = ZielOrt & "/" & M_EmlName
        ElseIf ExcelFehlerArt = "SPEICHERN" And ZielQuelle = "Datei" Then
            ' meist fehlt der Ordner Pruefbot_Testmails (Excel legt ueber https keinen an): dann direkt neben die Arbeitsmappe -
            ' neue Dateien kann Excel auf SharePoint anlegen, nur keine Ordner
            neben = SharePointDirekt(ThisWorkbook.Path) & "/" & M_EmlName
            If Len(EmlUeberExcel(neben, eml, "")) = 0 Then
                letzterSp = neben
                letzterSpNeben = True
            Else
                letzterSpFehler = SpFehlerText(grund, o)
            End If
        Else
            letzterSpFehler = SpFehlerText(grund, o)
        End If
    End If
    letzterPfad = pfad
    letzterAuftrag = M_ID
    letzteFehlAnz = M_FehlAnz
    ProtokollSchreiben pfad, namen, M_DokAnz
    TestmailErzeugen = pfad
    Exit Function
Fehler:
    letzterFehler = "Fehler " & Err.Number & ": " & Err.Description
End Function

' Meldung, wenn die EML nicht auf SharePoint gespeichert werden konnte (die lokale Arbeitskopie ist dann das Ergebnis).
' SPEICHERN heisst nur: Excel hat das SaveAs am Ziel abgelehnt. Der fehlende Ordner ist der haeufigste Grund, aber nicht
' der einzige (Schreibrechte, gleichnamige EML dort ausgecheckt oder geoeffnet) - darum wird er nicht als sicher genannt.
Private Function SpFehlerText(grund As String, o As String) As String
    Dim g As String, sonst As String
    g = Kuerzen(EinZeilig(grund), 240)
    sonst = "Besteht er schon, fehlen dort Schreibrechte, oder die Datei „" & M_EmlName & "“ ist dort ausgecheckt oder " & _
            "geöffnet. Die Mail liegt lokal in " & o & ". (Excel: " & g & ")"
    If ExcelFehlerArt = "SPEICHERN" Then
        If ZielQuelle = "Datei" Then
            SpFehlerText = "Auf SharePoint nicht gespeichert. Häufigster Grund: Der Ordner „" & ORDNER_NAME & "“ neben der " & _
                           "Arbeitsmappe fehlt – bitte im Browser anlegen (Neu › Ordner) und die Testmail erneut " & _
                           "erstellen. " & sonst
        Else
            SpFehlerText = "Auf SharePoint nicht gespeichert. Häufigster Grund: Der Ordner " & ZielOrt & " (Einstellung " & _
                           "„Ausgabeordner“) fehlt – bitte anlegen oder die Einstellung ändern. " & sonst
        End If
    Else
        SpFehlerText = "Auf SharePoint nicht gespeichert: " & g & ". Die Mail liegt lokal in " & o & ". Ausweg: die " & _
                       "SharePoint-Bibliothek mit OneDrive synchronisieren oder einen lokalen Ausgabeordner eintragen."
    End If
End Function

' geschaetzte Zeilenzahl eines umbrochenen Textes bei zeichen Zeichen je Zeile; jeder Absatz beginnt eine neue Zeile
Private Function TextZeilen(s As String, zeichen As Long) As Long
    Dim teile() As String, i As Long, n As Long
    teile = Split(Replace(Replace(s, vbCrLf, vbLf), vbCr, vbLf), vbLf)
    For i = 0 To UBound(teile)
        n = n + 1 + (Len(teile(i)) \ zeichen)
    Next i
    If n < 1 Then n = 1
    TextZeilen = n
End Function

Private Function Benutzer() As String
    Benutzer = Environ$("USERNAME")
    If Len(Benutzer) = 0 Then
        On Error Resume Next
        Benutzer = Application.UserName
        On Error GoTo 0
    End If
    If Len(Benutzer) = 0 Then Benutzer = Environ$("USER")
End Function

' Datei = SharePoint-Adresse der EML, wenn sie dort liegt, sonst der lokale Pfad
Private Sub ProtokollSchreiben(pfad As String, namen() As String, anz As Long)
    Dim ws As Object, lo As Object, r As Long, c0 As Long, anh As String, d As Long, zeile As Object, ort As String
    On Error GoTo Ende
    Set ws = ThisWorkbook.Worksheets(BLATT_GEN)
    For d = 1 To anz
        If d > 1 Then anh = anh & ", "
        anh = anh & namen(d)
    Next d
    ort = pfad
    If Len(letzterSp) > 0 Then
        ort = letzterSp
        If anz > 0 Then anh = anh & " (auf SharePoint nur als Anhang in der EML)"
    End If
    Set lo = Nothing
    On Error Resume Next
    Set lo = ws.ListObjects("tblTestmailProtokoll")
    On Error GoTo Ende
    If Not lo Is Nothing Then
        If lo.ListRows.Count = 1 Then
            If Len(CStr(lo.DataBodyRange.Cells(1, 1).Value)) = 0 And Len(CStr(lo.DataBodyRange.Cells(1, 2).Value)) = 0 Then
                Set zeile = lo.DataBodyRange.Rows(1)
            End If
        End If
        If zeile Is Nothing Then Set zeile = lo.ListRows.Add.Range
        r = zeile.Row
        c0 = zeile.Column
    Else
        TabellenLaden
        r = TabBlattZeile("tblTestmailProtokoll", TabAnzahl("tblTestmailProtokoll") + 1)
        c0 = TabBlattSpalte("tblTestmailProtokoll", "Zeitpunkt")
        If r = 0 Or c0 = 0 Then Exit Sub
    End If
    ws.Cells(r, c0).Value = Now
    On Error Resume Next
    ws.Cells(r, c0).NumberFormat = "DD.MM.YYYY hh:mm"
    On Error GoTo Ende
    ws.Cells(r, c0 + 1).Value = M_ID
    ws.Cells(r, c0 + 2).Value = M_MailID
    ws.Cells(r, c0 + 3).Value = ort
    ws.Cells(r, c0 + 4).Value = anh
    ws.Cells(r, c0 + 5).Value = M_FehlAnz
    ws.Cells(r, c0 + 6).Value = IIf(M_FehlAnz > 0, "ja", "nein")
    ws.Cells(r, c0 + 7).Value = Benutzer()
    On Error Resume Next
    If Len(letzterSp) > 0 Then
        ws.Hyperlinks.Add ws.Cells(r, c0 + 3), UrlKodieren(letzterSp), "", "Testmail auf SharePoint", ort
    Else
        ws.Hyperlinks.Add ws.Cells(r, c0 + 3), pfad, "", "Testmail öffnen", pfad
    End If
Ende:
End Sub

' Setzt in To-do Mailerstellung „Mail vorbereitet“ auf „ja“. Rueckgabe: leer = gesetzt, sonst der Grund.
Public Function VorbereitetSetzen(auftragsId As String) As String
    Dim r As Long, ziel As String
    On Error GoTo Fehler
    TabellenLaden
    r = TabZeile("tblMailAuftraege", "Mail-Auftrags-ID", auftragsId)
    If r = 0 Then
        VorbereitetSetzen = "Mail-Auftrag " & auftragsId & " nicht gefunden (To-do Mailerstellung)."
        Exit Function
    End If
    ziel = TabZelle("tblMailAuftraege", r, "Mail vorbereitet")
    If Len(ziel) = 0 Then
        VorbereitetSetzen = "Spalte „Mail vorbereitet“ nicht gefunden (To-do Mailerstellung)."
        Exit Function
    End If
    ThisWorkbook.Worksheets(Left$(ziel, InStr(ziel, "!") - 1)).Range(Mid$(ziel, InStr(ziel, "!") + 1)).Value = "ja"
    Exit Function
Fehler:
    VorbereitetSetzen = "„Mail vorbereitet“ konnte nicht gesetzt werden (" & Err.Description & ")."
End Function

' Karten bleiben nach einem Zuruecksetzen von VBA stehen, ihr Zustand (Auswahl, letzte Mail) ist dann leer.
' Nur aus geplanten Prozeduren aufrufen (entfernt die Karten).
Private Sub Abgelaufen()
    KartenEntfernen
    Hinweis "Testmail erstellen", "Die Auswahl ist abgelaufen (zum Beispiel nach einer Unterbrechung der Makros). " & _
            "Bitte erneut „Testmail erstellen“ klicken."
End Sub

' ------------------------------------------------------------------ Auswahl
Public Sub TestmailStarten()
    On Error GoTo Fehler
    KartenEntfernen
    Application.ScreenUpdating = False
    ListeAufbauen
    aGewaehlt = VorauswahlAusZelle()
    aFilter = 0
    aSeite = SeiteVon(aGewaehlt)
    Application.ScreenUpdating = True
    AuswahlZeigen
    Exit Sub
Fehler:
    Application.ScreenUpdating = True
    Hinweis "Testmail erstellen", "Die Auswahl konnte nicht aufgebaut werden: " & Err.Description, True
End Sub

Private Sub ListeAufbauen()
    Dim n As Long, i As Long, id As String, ag As String, vnr As String
    TabellenLaden
    n = TabAnzahl("tblMailAuftraege")
    aAnz = 0
    If n = 0 Then Exit Sub
    ReDim aID(1 To n): ReDim aTitel(1 To n): ReDim aUnter(1 To n): ReDim aStatus(1 To n): ReDim aFehl(1 To n)
    For i = 1 To n
        id = TabText("tblMailAuftraege", i, "Mail-Auftrags-ID")
        If Len(id) > 0 Then
            aAnz = aAnz + 1
            aID(aAnz) = id
            If Not ModellSicher(id) Then
                aTitel(aAnz) = id
                aStatus(aAnz) = 1
                aFehl(aAnz) = 1
                aUnter(aAnz) = "Prüfung fehlgeschlagen: " & Kuerzen(letzterFehler, 90)
            ElseIf Not M_Erzeugbar Then
                aTitel(aAnz) = id & "     " & M_Testfall & "  ·  " & Kuerzen(M_Testfallname, 52)
                aStatus(aAnz) = 2
                aUnter(aAnz) = "keine Mail – technischer Datensatz (" & M_MailID & ")"
            Else
                aTitel(aAnz) = id & "     " & M_Testfall & "  ·  " & Kuerzen(M_Testfallname, 52)
                If Len(M_AgenturID) > 0 Then
                    ag = M_AgenturID & IIf(Len(M_AgenturName) > 0, " " & Kuerzen(M_AgenturName, 26), "")
                Else
                    ag = "ohne Agentur"
                End If
                If Len(M_VNR) > 0 Then
                    vnr = "VNR " & M_VNR
                Else
                    vnr = "VNR fehlt"
                End If
                aUnter(aAnz) = M_MailID & " " & Kuerzen(M_Variante, 34) & "  ·  " & ag & "  ·  " & vnr
                aFehl(aAnz) = M_FehlAnz
                If M_FehlAnz = 0 Then
                    aStatus(aAnz) = 0
                Else
                    aStatus(aAnz) = 1
                End If
            End If
        End If
    Next i
End Sub

' ModellBauen mit Fehlerbehandlung: ein fehlerhafter Auftrag macht nicht die ganze Auswahl unbrauchbar
Private Function ModellSicher(id As String) As Boolean
    On Error GoTo Fehler
    modTmModell.ModellBauen id
    ModellSicher = True
    Exit Function
Fehler:
    letzterFehler = "Fehler " & Err.Number & ": " & Err.Description
End Function

' Auftraege je Seite der Auswahlkarte: so viele, wie in die Fensterhoehe passen (4 bis 8)
Private Function ProSeite() As Long
    Dim n As Long
    n = CLng(Int((SichtHoehe() - 20 - 224) / 40))
    If n > 8 Then n = 8
    If n < 4 Then n = 4
    ProSeite = n
End Function

Private Function VorauswahlAusZelle() As String
    Dim r As Long, n As Long
    On Error GoTo Ende
    If ActiveSheet.Name = BLATT_MAIL Then
        r = ActiveCell.Row - TabBlattZeile("tblMailAuftraege", 0)
        n = TabAnzahl("tblMailAuftraege")
        If r >= 1 And r <= n Then VorauswahlAusZelle = TabText("tblMailAuftraege", r, "Mail-Auftrags-ID")
    ElseIf ActiveSheet.Name = BLATT_GEN Then
        r = ActiveCell.Row - TabBlattZeile("tblGeneratorEingaben", 0)
        n = TabAnzahl("tblGeneratorEingaben")
        If r >= 1 And r <= n Then VorauswahlAusZelle = TabText("tblGeneratorEingaben", r, "Mail-Auftrags-ID")
    End If
Ende:
End Function

Private Sub FilterAnwenden()
    Dim i As Long
    fAnz = 0
    If aAnz = 0 Then Exit Sub
    ReDim fIdx(1 To aAnz)
    For i = 1 To aAnz
        If aFilter = 0 Or (aFilter = 1 And aStatus(i) = 0) Or (aFilter = 2 And aStatus(i) = 1) Or (aFilter = 3 And aStatus(i) = 2) Then
            fAnz = fAnz + 1
            fIdx(fAnz) = i
        End If
    Next i
End Sub

Private Function SeiteVon(id As String) As Long
    Dim i As Long
    SeiteVon = 1
    FilterAnwenden
    For i = 1 To fAnz
        If aID(fIdx(i)) = id Then SeiteVon = (i - 1) \ ProSeite() + 1: Exit Function
    Next i
End Function

Private Function AnzahlStatus(s As Long) As Long
    Dim i As Long
    For i = 1 To aAnz
        If aStatus(i) = s Then AnzahlStatus = AnzahlStatus + 1
    Next i
End Function

Private Sub AuswahlZeigen()
    Dim ws As Object, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, k As Long, idx As Long
    Dim y As Single, x As Single, seiten As Long, f As Long, txt As String, w As Single, shp As Object
    Dim fill As Long, fc As Long, pt As String, pro As Long
    KartenEntfernen
    Set ws = ActiveSheet
    FilterAnwenden
    pro = ProSeite()
    seiten = (fAnz + pro - 1) \ pro
    If seiten < 1 Then seiten = 1
    If aSeite > seiten Then aSeite = seiten
    If aSeite < 1 Then aSeite = 1
    kb = 720
    kh = 168 + pro * 40 + 56
    KarteModal ws, kb, kh, kx, ky
    Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 24, "Testmail erstellen", 16, True, C_SW
    Beschriftung ws, "Sub", kx + 28, ky + 48, kb - 56, 16, "Welche Mail soll entstehen? Grün = vollständig, " & _
                 "Orange = es fehlen noch Werte (zeigt die nächste Karte), Grau = keine Mail (technischer Datensatz).", _
                 9, False, C_GRAU
    x = kx + 28
    For f = 0 To 3
        Select Case f
            Case 0: txt = "Alle  " & aAnz
            Case 1: txt = "Vollständig  " & AnzahlStatus(0)
            Case 2: txt = "Mit Lücken  " & AnzahlStatus(1)
            Case 3: txt = "Keine Mail  " & AnzahlStatus(2)
        End Select
        w = 26 + Len(txt) * 6.2
        Chip ws, "F_" & f, x, ky + 76, w, 24, txt, (aFilter = f), "modTestmail.KlickFilter"
        x = x + w + 8
    Next f
    y = ky + 114
    If fAnz = 0 Then
        Beschriftung ws, "Leer", kx + 28, y + 10, kb - 56, 20, "Keine Aufträge in dieser Auswahl.", 10, False, C_GRAU2
    End If
    For i = 1 To pro
        idx = (aSeite - 1) * pro + i
        If idx <= fAnz Then
            k = fIdx(idx)
            Zeile ws, "Z_" & Format(k, "00"), kx + 28, y, kb - 56, 36, aTitel(k), aUnter(k), "modTestmail.KlickAuftrag", _
                  (aStatus(k) <> 2), (aID(k) = aGewaehlt)
            Select Case aStatus(k)
                Case 0: pt = "vollständig": fill = C_GRUEN_H: fc = C_GRUEN
                Case 1: pt = aFehl(k) & IIf(aFehl(k) = 1, " Wert fehlt", " Werte fehlen"): fill = C_AMBER_H: fc = C_AMBER
                Case Else: pt = "keine Mail": fill = C_FLAECHE: fc = C_GRAU2
            End Select
            Pille ws, "P_" & Format(k, "00"), kx + kb - 28 - 112, y + 9, 100, 18, pt, fill, fc
            Set shp = ws.Shapes(PRAEFIX & "P_" & Format(k, "00"))
            shp.OnAction = "modTestmail.KlickAuftrag"
            y = y + 40
        End If
    Next i
    y = ky + kh - 48
    Beschriftung ws, "Seite", kx + 28, y + 6, 160, 18, "Seite " & aSeite & " von " & seiten, 9, False, C_GRAU
    Knopf ws, "Zurueck", kx + 190, y, 96, 30, ChrW(8249) & " Zurück", IIf(aSeite > 1, 2, 5), _
          IIf(aSeite > 1, "modTestmail.KlickSeiteZurueck", "modKarte.Nichts")
    Knopf ws, "Weiter", kx + 294, y, 96, 30, "Weiter " & ChrW(8250), IIf(aSeite < seiten, 2, 5), _
          IIf(aSeite < seiten, "modTestmail.KlickSeiteWeiter", "modKarte.Nichts")
    Knopf ws, "Abbrechen", kx + kb - 28 - 110, y, 110, 30, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

Public Sub KlickFilter()
    aFilter = KlickNummer()
    aSeite = 1
    Planen "modTestmail.AuswahlNeu"
End Sub

Public Sub KlickSeiteZurueck()
    aSeite = aSeite - 1
    Planen "modTestmail.AuswahlNeu"
End Sub

Public Sub KlickSeiteWeiter()
    aSeite = aSeite + 1
    Planen "modTestmail.AuswahlNeu"
End Sub

Public Sub AuswahlNeu()
    On Error GoTo Fehler
    Application.ScreenUpdating = False
    If aAnz = 0 Then ListeAufbauen
    AuswahlZeigen
    Application.ScreenUpdating = True
    Exit Sub
Fehler:
    Application.ScreenUpdating = True
    Hinweis "Testmail erstellen", "Die Auswahl konnte nicht aufgebaut werden: " & Err.Description, True
End Sub

Public Sub KlickZurAuswahl()
    Planen "modTestmail.AuswahlNeuAufbauen"
End Sub

Public Sub AuswahlNeuAufbauen()
    On Error GoTo Fehler
    Application.ScreenUpdating = False
    ListeAufbauen
    aSeite = SeiteVon(aGewaehlt)
    AuswahlZeigen
    Application.ScreenUpdating = True
    Exit Sub
Fehler:
    Application.ScreenUpdating = True
    Hinweis "Testmail erstellen", "Die Auswahl konnte nicht aufgebaut werden: " & Err.Description, True
End Sub

Public Sub KlickAuftrag()
    klickIdx = KlickNummer()
    Planen "modTestmail.AuftragGewaehlt"
End Sub

Public Sub AuftragGewaehlt()
    If aAnz = 0 Or klickIdx < 1 Or klickIdx > aAnz Then
        Abgelaufen
        Exit Sub
    End If
    aGewaehlt = aID(klickIdx)
    Pruefen
End Sub

' Modell des gewaehlten Auftrags bauen und die passende Karte zeigen
Private Sub Pruefen()
    On Error GoTo Fehler
    modTmModell.ModellBauen aGewaehlt
    If Not M_Erzeugbar Then
        KeineMailKarte
    Else
        FehlendKarte
    End If
    Exit Sub
Fehler:
    Hinweis "Testmail erstellen", "Prüfung fehlgeschlagen: " & Err.Description, True
End Sub

Private Sub KeineMailKarte()
    Dim ws As Object, kx As Single, ky As Single, kb As Single, kh As Single
    KartenEntfernen
    Set ws = ActiveSheet
    kb = 560: kh = 230
    KarteModal ws, kb, kh, kx, ky
    Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 24, "Für " & aGewaehlt & " entsteht keine Mail", 15, True, C_SW
    Block ws, "Text", kx + 28, ky + 60, kb - 56, 100, M_KeineMail, C_FLAECHE, C_GRAU, 9
    Knopf ws, "Auswahl", kx + 28, ky + kh - 48, 130, 30, ChrW(8249) & " Zur Auswahl", 2, "modTestmail.KlickZurAuswahl"
    Knopf ws, "Schliessen", kx + kb - 28 - 110, ky + kh - 48, 110, 30, "Schließen", 3, "modKarte.KlickSchliessen"
End Sub

' ------------------------------------------------------------------ Fehlende Werte
Private Sub FehlendKarte()
    Dim ws As Object, kx As Single, ky As Single, kb As Single, kh As Single, i As Long, n As Long, h As Long
    Dim y As Single, titel As String, info As String, hinw As String, zeilen As Long, maxZ As Long
    KartenEntfernen
    Set ws = ActiveSheet
    n = M_FehlAnz
    h = M_HinwAnz
    If h > 4 Then h = 4
    ' so viele Zeilen, wie in die Fensterhoehe passen (3 bis 9); die Knopfleiste bleibt sichtbar
    maxZ = CLng(Int((SichtHoehe() - 20 - 254 - IIf(h > 0, 28 + h * 15, 0) - 18) / 32))
    If maxZ > 9 Then maxZ = 9
    If maxZ < 3 Then maxZ = 3
    zeilen = n
    If zeilen > maxZ Then zeilen = maxZ
    kb = 740
    kh = 190 + zeilen * 32 + IIf(h > 0, 28 + h * 15, 0) + IIf(n > zeilen, 18, 0) + 64
    KarteModal ws, kb, kh, kx, ky
    If n = 0 Then
        titel = "Alle Werte für " & aGewaehlt & " sind vorhanden"
    ElseIf n = 1 Then
        titel = "Für " & aGewaehlt & " fehlt noch 1 Wert"
    Else
        titel = "Für " & aGewaehlt & " fehlen noch " & n & " Werte"
    End If
    Beschriftung ws, "Titel", kx + 28, ky + 22, kb - 56, 24, titel, 16, True, C_SW
    Beschriftung ws, "Sub", kx + 28, ky + 48, kb - 56, 16, M_Testfall & "  ·  " & Kuerzen(M_Testfallname, 50) & "  ·  " & _
                 M_MailID & " " & M_Variante, 9, False, C_GRAU
    info = "Von:  " & IIf(Len(M_AbsName) > 0, M_AbsName, "–") & "  <" & IIf(Len(M_AbsAdr) > 0, M_AbsAdr, "Adresse fehlt") & ">" & vbCr & _
           "An:  " & IIf(Len(M_EmpfAdr) > 0, M_EmpfAdr, "beim Senden in Outlook eintragen") & vbCr & _
           "Betreff:  " & Kuerzen(M_Betreff, 100) & vbCr & "Anhang:  " & AnhangText()
    Block ws, "Info", kx + 28, ky + 72, kb - 56, 70, info, C_FLAECHE, C_GRAU, 8.5
    y = ky + 154
    For i = 1 To zeilen
        Beschriftung ws, "FF_" & Format(i, "00"), kx + 40, y, kb - 220, 14, M_FehlFeld(i), 9.5, True, C_SW
        Beschriftung ws, "FO_" & Format(i, "00"), kx + 40, y + 14, kb - 220, 13, M_FehlOrt(i), 8, False, C_GRAU2
        If Len(M_FehlZiel(i)) > 0 Then
            Knopf ws, "ZF_" & Format(i, "00"), kx + kb - 28 - 110, y + 1, 110, 26, "Zum Feld " & ChrW(8250), 2, "modTestmail.KlickZumFeld"
        End If
        y = y + 32
    Next i
    If n > zeilen Then
        Beschriftung ws, "Mehr", kx + 40, y - 4, kb - 80, 16, "… und " & (n - zeilen) & " weitere", 9, False, C_GRAU
        y = y + 18
    End If
    If h > 0 Then
        hinw = ""
        For i = 1 To h
            If i > 1 Then hinw = hinw & vbCr
            hinw = hinw & ChrW(8226) & "  " & Kuerzen(M_Hinw(i), 130)
        Next i
        Beschriftung ws, "HinwT", kx + 28, y + 4, 200, 14, "Hinweise", 9, True, C_GRAU
        Beschriftung ws, "Hinw", kx + 28, y + 20, kb - 56, h * 15, hinw, 8.5, False, C_GRAU, True
    End If
    y = ky + kh - 50
    If n > 0 Then
        Knopf ws, "Trotzdem", kx + 28, y, 170, 32, "Trotzdem erstellen", 4, "modTestmail.KlickTrotzdem"
        Beschriftung ws, "TrotzdemT", kx + 206, y + 2, 300, 28, "Fehlende Werte bleiben als [PLATZHALTER]" & vbCr & _
                     "in Mail und Vollmacht sichtbar.", 8, False, C_GRAU2, True
    Else
        Knopf ws, "Erstellen", kx + 28, y, 170, 32, "Testmail erstellen", 1, "modTestmail.KlickErstellen"
    End If
    Knopf ws, "Auswahl", kx + kb - 28 - 110 - 140, y, 130, 32, ChrW(8249) & " Zur Auswahl", 2, "modTestmail.KlickZurAuswahl"
    Knopf ws, "Abbrechen", kx + kb - 28 - 110, y, 110, 32, "Abbrechen", 3, "modKarte.KlickSchliessen"
End Sub

Private Function AnhangText() As String
    Dim d As Long
    For d = 1 To M_DokAnz
        If d > 1 Then AnhangText = AnhangText & ", "
        AnhangText = AnhangText & M_DokTyp(d)
    Next d
    If Len(AnhangText) = 0 Then AnhangText = "–"
End Function

Public Sub KlickZumFeld()
    klickIdx = KlickNummer()
    Planen "modTestmail.ZumFeld"
End Sub

' Springt in die Zelle des fehlenden Werts und zeigt dort einen Hinweis mit "Erneut pruefen"
Public Sub ZumFeld()
    Dim ziel As String, blatt As String, zelle As String, ws As Object, rng As Object, x As Single, y As Single, feld As String
    If Len(aGewaehlt) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    On Error GoTo Fehler
    modTmModell.ModellBauen aGewaehlt
    If klickIdx < 1 Or klickIdx > M_FehlAnz Then Exit Sub
    ziel = M_FehlZiel(klickIdx)
    feld = M_FehlFeld(klickIdx)
    KartenEntfernen
    blatt = Left$(ziel, InStr(ziel, "!") - 1)
    zelle = Mid$(ziel, InStr(ziel, "!") + 1)
    Set ws = ThisWorkbook.Worksheets(blatt)
    ws.Activate
    Set rng = ws.Range(zelle)
    Application.Goto rng, False
    rng.Select
    x = rng.Left
    y = rng.Top + rng.Height + 6
    Block ws, "Banner", x, y, 380, 58, "Hier eintragen: " & feld & vbCr & "Danach „Erneut prüfen“ klicken.", C_TEAL_XL, C_TEAL_D, 9
    Knopf ws, "Erneut", x + 390, y + 2, 120, 26, "Erneut prüfen", 1, "modTestmail.KlickErneut"
    Knopf ws, "BannerZu", x + 390, y + 30, 120, 24, "Schließen", 3, "modKarte.KlickSchliessen"
    Exit Sub
Fehler:
    Hinweis "Zum Feld", "Das Feld konnte nicht angesprungen werden (" & ziel & "): " & Err.Description, True
End Sub

Public Sub KlickErneut()
    Planen "modTestmail.ErneutPruefen"
End Sub

Public Sub ErneutPruefen()
    KartenEntfernen
    If Len(aGewaehlt) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    Pruefen
End Sub

Public Sub KlickTrotzdem()
    Planen "modTestmail.ErstellenTrotzdem"
End Sub

Public Sub KlickErstellen()
    Planen "modTestmail.ErstellenVollstaendig"
End Sub

Public Sub ErstellenTrotzdem()
    Erstellen True
End Sub

Public Sub ErstellenVollstaendig()
    Erstellen False
End Sub

Private Sub Erstellen(trotzdem As Boolean)
    Dim pfad As String
    KartenEntfernen
    If Len(aGewaehlt) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    Application.ScreenUpdating = False
    pfad = TestmailErzeugen(aGewaehlt, "", trotzdem)
    Application.ScreenUpdating = True
    If Len(pfad) = 0 Then
        Hinweis "Testmail nicht erstellt", letzterFehler, True
    Else
        ErgebnisKarte
    End If
End Sub

' ------------------------------------------------------------------ Ergebnis
Private Sub ErgebnisKarte()
    Dim ws As Object, kx As Single, ky As Single, kb As Single, kh As Single, o As String, datei As String
    Dim info As String, d As Long, y As Single, schon As Boolean, r As Long, anh As String, sp As Boolean
    Dim hInfo As Single, hSp As Single, warn As Boolean
    KartenEntfernen
    If Len(letzterPfad) = 0 Or Len(letzterAuftrag) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    Set ws = ActiveSheet
    modTmModell.ModellBauen letzterAuftrag
    o = Left$(letzterPfad, InStrRev(letzterPfad, Trenner(letzterPfad)) - 1)
    datei = Mid$(letzterPfad, InStrRev(letzterPfad, Trenner(letzterPfad)) + 1)
    sp = (Len(letzterSp) > 0)
    warn = (letzteFehlAnz > 0 Or Len(letzterSpFehler) > 0)
    TabellenLaden
    r = TabZeile("tblMailAuftraege", "Mail-Auftrags-ID", letzterAuftrag)
    schon = (LCase$(TabText("tblMailAuftraege", r, "Mail vorbereitet")) = "ja")
    For d = 1 To M_DokAnz
        If d > 1 Then anh = anh & ", "
        anh = anh & M_DokDatei(d)
    Next d
    If sp Then
        ' SharePoint direkt: dort nur die EML (PDFs als Anhang darin), lokal die Arbeitskopie fuer Outlook
        info = "Datei:  " & datei & vbCr & _
               "SharePoint:  " & Kuerzen(Left$(letzterSp, InStrRev(letzterSp, "/") - 1), 92) & vbCr & _
               "Arbeitskopie:  " & Kuerzen(o, 90) & vbCr & "Anhänge:  " & anh
        hInfo = 80
        hSp = IIf(letzterSpNeben, 48, 34)
    Else
        info = "Datei:  " & datei & vbCr & "Ordner:  " & Kuerzen(o, 90) & vbCr & "Anhänge:  " & anh
        hInfo = 64
        ' Kastenhoehe aus der Zeilenzahl (rund 105 Zeichen je Zeile bei 8,5 pt; 12 pt je Zeile plus Innenrand)
        If Len(letzterSpFehler) > 0 Then hSp = 24 + 12 * TextZeilen(letzterSpFehler, 105)
    End If
    kb = 640
    kh = 300 + (hInfo - 64) + hSp + IIf(letzteFehlAnz > 0, 44, 0)
    KarteModal ws, kb, kh, kx, ky
    If warn Then
        Haken ws, kx + 28, ky + 24, C_AMBER_R
    Else
        Haken ws, kx + 28, ky + 24
    End If
    Beschriftung ws, "Titel", kx + 76, ky + 24, kb - 110, 22, IIf(Len(letzterSpFehler) > 0, "Testmail erstellt – nur lokal", _
                 "Testmail erstellt"), 16, True, C_SW
    Beschriftung ws, "Sub", kx + 76, ky + 46, kb - 110, 16, letzterAuftrag & "  ·  " & M_Testfall & "  ·  " & M_MailID & " " & _
                 Kuerzen(M_Variante, 40), 9, False, C_GRAU
    Block ws, "Info", kx + 28, ky + 76, kb - 56, hInfo, info, C_FLAECHE, C_GRAU, 8.5
    y = ky + 86 + hInfo
    If sp Then
        Beschriftung ws, "SpHinw", kx + 28, y, kb - 56, hSp - 6, IIf(letzterSpNeben, "Der Ordner „" & ORDNER_NAME & "“ fehlt auf " & _
                     "SharePoint – die EML liegt deshalb direkt neben der Arbeitsmappe (wer den Ordner anlegt, sammelt sie dort). ", "") & _
                     "Auf SharePoint liegt nur die EML – die Vollmacht-PDFs stecken " & _
                     "als Anhang darin (Binärdateien kann der Excel-Textexport nicht ablegen). „Mail öffnen“ und MSG " & _
                     "nutzen die Arbeitskopie.", 8.5, False, C_GRAU, True
        y = y + hSp
    ElseIf Len(letzterSpFehler) > 0 Then
        Block ws, "SpWarn", kx + 28, y, kb - 56, hSp - 8, letzterSpFehler, C_AMBER_H, C_AMBER, 8.5
        y = y + hSp
    End If
    If letzteFehlAnz > 0 Then
        Block ws, "Warn", kx + 28, y, kb - 56, 36, "Die Mail enthält " & letzteFehlAnz & IIf(letzteFehlAnz = 1, " fehlenden Wert", " fehlende Werte") & _
              " als [PLATZHALTER]. Vor dem Versand ergänzen oder nach dem Pflegen neu erstellen.", C_AMBER_H, C_AMBER, 9
        y = y + 44
    End If
    Beschriftung ws, "Outlook", kx + 28, y, kb - 56, 30, "In Outlook öffnet die Datei als Entwurf. Absender dort auf das Postfach " & _
                 IIf(Len(M_AbsAdr) > 0, M_AbsAdr, M_Postfach) & " stellen (Outlook nimmt sonst das eigene Konto)" & IIf(Len(M_EmpfAdr) > 0, " und senden.", ", Empfänger eintragen und senden."), 8.5, False, C_GRAU, True
    y = y + 42
    Knopf ws, "Oeffnen", kx + 28, y, 130, 32, "Mail öffnen", 1, "modTestmail.KlickMailOeffnen"
    Knopf ws, "Ordner", kx + 166, y, 130, 32, IIf(sp, "SharePoint-Ordner", "Ordner öffnen"), 2, "modTestmail.KlickOrdner"
    If schon Then
        Knopf ws, "Vorbereitet", kx + 304, y, 200, 32, "Als vorbereitet markiert", 5, "modKarte.Nichts"
    Else
        Knopf ws, "Vorbereitet", kx + 304, y, 200, 32, "Als vorbereitet markieren", 2, "modTestmail.KlickVorbereitet"
    End If
    y = y + 42
    Knopf ws, "NochEine", kx + 28, y, 150, 28, "Weitere Testmail", 3, "modTestmail.KlickNochEine"
    Knopf ws, "Msg", kx + 186, y, 190, 28, "Zusätzlich als MSG (Outlook)", 3, "modTestmail.KlickMsg"
    Knopf ws, "Schliessen", kx + kb - 28 - 110, y, 110, 28, "Schließen", 3, "modKarte.KlickSchliessen"
End Sub

' Klicks auf Karten nur vormerken; ausgefuehrt wird gleich danach per OnTime (ein Hinweis im Fehlerfall entfernt die
' Karten, das darf nicht im Klick der Form selbst geschehen).
Public Sub KlickMailOeffnen()
    Planen "modTestmail.MailOeffnenJetzt"
End Sub

Public Sub KlickOrdner()
    Planen "modTestmail.OrdnerOeffnenJetzt"
End Sub

Public Sub MailOeffnenJetzt()
    If Len(letzterPfad) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    DateiOeffnen letzterPfad
End Sub

' SharePoint direkt: den Ordner dort im Browser oeffnen, sonst den lokalen Ordner mit markierter EML
Public Sub OrdnerOeffnenJetzt()
    If Len(letzterPfad) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    If Len(letzterSp) > 0 Then
        DateiOeffnen UrlKodieren(Left$(letzterSp, InStrRev(letzterSp, "/") - 1))
        Exit Sub
    End If
    On Error GoTo Ersatz
    Shell "explorer.exe /select,""" & letzterPfad & """", vbNormalFocus
    Exit Sub
Ersatz:
    DateiOeffnen Left$(letzterPfad, InStrRev(letzterPfad, Trenner(letzterPfad)) - 1)
End Sub

Private Sub DateiOeffnen(pfad As String)
    On Error GoTo Ersatz
    CreateObject("Shell.Application").ShellExecute pfad
    Exit Sub
Ersatz:
    On Error GoTo Fehler
    ThisWorkbook.FollowHyperlink pfad
    Exit Sub
Fehler:
    Hinweis "Öffnen nicht möglich", "Die Datei konnte nicht geöffnet werden: " & pfad, True
End Sub

Public Sub KlickVorbereitet()
    Planen "modTestmail.VorbereitetJetzt"
End Sub

Public Sub VorbereitetJetzt()
    Dim grund As String
    If Len(letzterAuftrag) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    grund = VorbereitetSetzen(letzterAuftrag)
    If Len(grund) > 0 Then
        Hinweis "Als vorbereitet markieren", grund, True
    Else
        ErgebnisKarte
    End If
End Sub

Public Sub ErgebnisNeu()
    ErgebnisKarte
End Sub

Public Sub KlickNochEine()
    Planen "modTestmail.TestmailStarten"
End Sub

Public Sub KlickMsg()
    Planen "modTestmail.AlsMsgSpeichern"
End Sub

' Optional: dieselbe Mail ueber Outlook als .msg neben die EML speichern (nur wenn Outlook installiert ist). Liegt die
' EML auf SharePoint, kommt die MSG in die lokale Arbeitskopie: sie ist binaer und geht nicht ueber den Excel-Textexport.
Public Sub AlsMsgSpeichern()
    Dim ol As Object, mi As Object, d As Long, o As String, t As String, ziel As String
    KartenEntfernen
    If Len(letzterPfad) = 0 Then
        Abgelaufen
        Exit Sub
    End If
    On Error GoTo Fehler
    modTmModell.ModellBauen letzterAuftrag
    t = Trenner(letzterPfad)
    o = Left$(letzterPfad, InStrRev(letzterPfad, t) - 1)
    Set ol = CreateObject("Outlook.Application")
    Set mi = ol.CreateItem(0)
    If Len(M_EmpfAdr) > 0 Then mi.To = M_EmpfAdr
    mi.Subject = M_Betreff
    mi.Body = Replace(M_Text, vbLf, vbCrLf)
    If Len(M_AbsAdr) > 0 Then mi.SentOnBehalfOfName = M_AbsAdr
    For d = 1 To M_DokAnz
        mi.Attachments.Add o & t & M_DokDatei(d)
    Next d
    ziel = Left$(letzterPfad, Len(letzterPfad) - 4) & ".msg"
    mi.SaveAs ziel, 9
    mi.Close 1
    If Len(letzterSp) > 0 Then
        Hinweis "MSG gespeichert", "Zusätzlich gespeichert in der lokalen Arbeitskopie: " & ziel & _
                " (auf SharePoint liegt nur die EML; eine MSG ist binär und geht nicht über den Excel-Textexport)."
    Else
        Hinweis "MSG gespeichert", "Zusätzlich gespeichert: " & ziel
    End If
    Exit Sub
Fehler:
    Hinweis "MSG nicht möglich", "Outlook ist nicht verfügbar oder hat das Speichern abgelehnt (" & Err.Description & _
            "). Die EML-Datei reicht: Outlook öffnet sie als Entwurf.", True
End Sub
