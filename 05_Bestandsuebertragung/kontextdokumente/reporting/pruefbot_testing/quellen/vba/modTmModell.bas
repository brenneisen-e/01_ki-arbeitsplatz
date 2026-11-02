Option Explicit
' ============================================================================
' modTmModell - baut fuer einen Mail-Auftrag das vollstaendige Modell der Testmail:
' Absender, Empfaenger, Betreff, Text (mit Signatur, bei M-13 mit Weiterleitungskopf), Dokumente mit allen Feldern,
' fehlende Werte (mit Zielzelle fuer "Zum Feld") und Hinweise.
'
' Quellen (nur Eingabezellen, keine Formelergebnisse - so rechnet der Generator auch dort, wo Excel noch nicht neu
' berechnet hat): tblMailAuftraege (Auftrag), tblMatrix (aufnehmende Agentur je Testfall), tblAgenturen, tblVertraege,
' tblMailanforderungen (Betreff- und Textvorlage mit Platzhaltern), tblGeneratorEingaben, Einstellungen cfg_*.
' Platzhalter werden wie in den Formeln von tblMailAuftraege ersetzt; Ausnahme M-10/M-11: dort steht die andere bzw.
' fiktive Person statt des Versicherungsnehmers (sonst wuerden BE-07 bis BE-09 nicht ausgeloest).
' Fehlt ein Wert, bleibt sein [PLATZHALTER] sichtbar und der Wert wird als fehlend gemeldet.
' ============================================================================

' --- Ergebnis des letzten ModellBauen
Public M_ID As String
Public M_Testfall As String
Public M_Testfallname As String
Public M_MailID As String
Public M_Variante As String
Public M_Datensatz As String
Public M_AgenturID As String
Public M_AgenturName As String
Public M_VNR As String
Public M_Postfach As String
Public M_Erzeugbar As Boolean
Public M_KeineMail As String
Public M_AbsName As String
Public M_AbsAdr As String
Public M_EmpfName As String
Public M_EmpfAdr As String
Public M_Betreff As String
Public M_Text As String
Public M_Basis As String
Public M_EmlName As String
Public M_Versendet As Boolean
Public M_DokAnz As Long
Public M_DokTyp(1 To 3) As String
Public M_DokDatei(1 To 3) As String
Public M_FehlAnz As Long
Public M_FehlFeld() As String
Public M_FehlOrt() As String
Public M_FehlZiel() As String
Public M_HinwAnz As Long
Public M_Hinw() As String
Public M_Datum As String

Private dfK(1 To 3, 1 To 45) As String
Private dfV(1 To 3, 1 To 45) As String
Private dfN(1 To 3) As Long

Public Const PH_TESTFALL As String = "[TESTFALL-ID]"
Public Const PH_SPARTE As String = "[SPARTE]"
Public Const PH_VNR As String = "[IMSI-VNR]"
Public Const PH_AGNAME As String = "[AGENTURNAME]"
Public Const PH_AGNR As String = "[AGENTURNUMMER]"
Public Const PH_PNR As String = "[VERMITTLERNUMMER]"
Public Const PH_VN As String = "[VN-ODER-FIRMENNAME]"

' Andere vorhandene Person fuer TF-KU-04 ohne Eingabe: Versicherungsnehmer der V-03-Hilfskonstellation (Herleitung
' Vertragskonstellationen)
Private Const HILFS_TESTFALL As String = "TF-KU-04"
Private Const HILFS_DATENSATZ As String = "V03-K01"

' ------------------------------------------------------------------ Hilfen fuer Felder und Listen
Private Sub ModellLeeren()
    Dim d As Long, i As Long
    M_ID = "": M_Testfall = "": M_Testfallname = "": M_MailID = "": M_Variante = "": M_Datensatz = ""
    M_AgenturID = "": M_AgenturName = "": M_VNR = "": M_Postfach = "": M_Erzeugbar = False: M_KeineMail = ""
    M_AbsName = "": M_AbsAdr = "": M_EmpfName = "": M_EmpfAdr = "": M_Betreff = "": M_Text = ""
    M_Basis = "": M_EmlName = "": M_Versendet = False: M_DokAnz = 0: M_Datum = ""
    For d = 1 To 3
        M_DokTyp(d) = "": M_DokDatei(d) = "": dfN(d) = 0
        For i = 1 To 45
            dfK(d, i) = "": dfV(d, i) = ""
        Next i
    Next d
    M_FehlAnz = 0
    ReDim M_FehlFeld(1 To 40): ReDim M_FehlOrt(1 To 40): ReDim M_FehlZiel(1 To 40)
    M_HinwAnz = 0
    ReDim M_Hinw(1 To 40)
End Sub

Private Sub Fehlt(feld As String, ort As String, ziel As String)
    Dim i As Long
    For i = 1 To M_FehlAnz
        If M_FehlFeld(i) = feld Then Exit Sub
    Next i
    If M_FehlAnz >= UBound(M_FehlFeld) Then Exit Sub
    M_FehlAnz = M_FehlAnz + 1
    M_FehlFeld(M_FehlAnz) = feld
    M_FehlOrt(M_FehlAnz) = ort
    M_FehlZiel(M_FehlAnz) = ziel
End Sub

Private Sub Hinweis(text As String)
    Dim i As Long
    For i = 1 To M_HinwAnz
        If M_Hinw(i) = text Then Exit Sub
    Next i
    If M_HinwAnz >= UBound(M_Hinw) Then Exit Sub
    M_HinwAnz = M_HinwAnz + 1
    M_Hinw(M_HinwAnz) = text
End Sub

Private Sub DokNeu(typ As String, datei As String)
    If M_DokAnz >= 3 Then Exit Sub
    M_DokAnz = M_DokAnz + 1
    M_DokTyp(M_DokAnz) = typ
    M_DokDatei(M_DokAnz) = datei
End Sub

Private Sub Setze(feld As String, wert As String)
    Dim d As Long, i As Long
    d = M_DokAnz
    If d < 1 Then Exit Sub
    For i = 1 To dfN(d)
        If dfK(d, i) = feld Then dfV(d, i) = wert: Exit Sub
    Next i
    If dfN(d) >= 45 Then Exit Sub
    dfN(d) = dfN(d) + 1
    dfK(d, dfN(d)) = feld
    dfV(d, dfN(d)) = wert
End Sub

Public Function DokFeld(d As Long, feld As String) As String
    Dim i As Long
    If d < 1 Or d > 3 Then Exit Function
    For i = 1 To dfN(d)
        If dfK(d, i) = feld Then DokFeld = dfV(d, i): Exit Function
    Next i
End Function

' Wert oder Platzhalter; leerer Wert wird als fehlend gemeldet
Private Function Pflicht(wert As String, platzhalter As String, feld As String, ort As String, ziel As String) As String
    If IstLeer(wert) Then
        Fehlt feld, ort, ziel
        Pflicht = platzhalter
    Else
        Pflicht = wert
    End If
End Function

' ------------------------------------------------------------------ Modell
Public Function ModellBauen(auftragsId As String) As Boolean
    Dim ra As Long, rm As Long, rg As Long, rv As Long, re As Long, rt As Long, r01 As Long
    Dim agRoh As String, ohneAgentur As Boolean, agName As String, agNr As String, agPnr As String, agMail As String
    Dim vnr As String, sparte As String, vnName As String, vnVorname As String, gebRoh As Variant, vertragId As String
    Dim firma As Boolean, natuerlich As Boolean
    Dim betreffV As String, textV As String, postfachText As String
    Dim pAnschrift As String, pName As String, pVorname As String, pGeb As Variant, pIS011 As String, pAbwGeb As Variant
    Dim pAbwVerm As String, umName As String, umReg As String, umMail As String, unterlagen As String, luecke As String
    Dim regNr As String, agAnschrift As String
    Dim empfAdr As String, absAdr As String, absStd As String, p01Adr As String, p03Name As String, p04Name As String, p04Adr As String
    Dim phTF As String, phSp As String, phVNR As String, phAgName As String, phAgNr As String, phPnr As String, phVN As String
    Dim vgName As String, gebText As String, ort As String, datum As String, fuss As String, signatur As String
    Dim zSp As String, zAg As String, zEin As String, zVt As String, ok As Boolean, d As Date
    Dim betreuerName As String, betreuerNr As String, betreuerPnr As String, rb As Long, unterschrift As String
    Dim weiter As String, mv As String, testvermerk As String, abwOk As Boolean
    Dim vertreter As String, rh As Long, zName As String, zVor As String, zGeb As String, ortP As String

    ModellLeeren
    TabellenLaden
    M_ID = Trim$(auftragsId)
    ra = TabZeile("tblMailAuftraege", "Mail-Auftrags-ID", M_ID)
    If ra = 0 Then
        M_KeineMail = "Mail-Auftrag " & M_ID & " nicht gefunden (Tabelle tblMailAuftraege)."
        Exit Function
    End If
    M_Testfall = TabText("tblMailAuftraege", ra, "Testfall-ID")
    M_Testfallname = TabText("tblMailAuftraege", ra, "Testfallname")
    M_MailID = TabText("tblMailAuftraege", ra, "Mail-ID / Zustand")
    M_Datensatz = TabText("tblMailAuftraege", ra, "Datensatz-ID")
    M_Versendet = (LCase$(TabText("tblMailAuftraege", ra, "Mail versendet")) = "ja")
    M_Basis = DateinameAscii(M_ID & "_" & M_Testfall)
    rt = TabZeile("tblMailanforderungen", "Mail-ID / Zustand", M_MailID)
    M_Variante = TabText("tblMailanforderungen", rt, "Mailvariante")
    ModellBauen = True

    ' --- keine Mail: technischer Datensatz / Weg B
    If LCase$(TabText("tblMailAuftraege", ra, "Auftragsart")) <> "testmail" Or Left$(M_MailID, 2) <> "M-" Or rt = 0 Then
        M_KeineMail = "Keine Testmail: " & TabText("tblMailAuftraege", ra, "Auftragsart") & " (" & M_MailID & "). " & _
                      Replace(TabText("tblMailAuftraege", ra, "Zu beachtende Besonderheit"), vbLf, " ")
        Exit Function
    End If
    betreffV = TabText("tblMailanforderungen", rt, "Betreff-Vorlage")
    textV = Replace(TabText("tblMailanforderungen", rt, "Mailtext-Vorgabe"), vbCrLf, vbLf)
    postfachText = TabText("tblMailanforderungen", rt, "Absenderpostfach / Zustand")
    If IstLeer(betreffV) Or LCase$(betreffV) = "nicht erforderlich" Then
        M_KeineMail = "Keine Testmail: Für " & M_MailID & " gibt es keine Betreff-Vorlage."
        Exit Function
    End If
    M_Erzeugbar = True
    M_Postfach = PostfachAus(postfachText, M_MailID)

    ' --- Daten
    rm = TabZeile("tblMatrix", "Testfall-ID", M_Testfall)
    agRoh = TabText("tblMatrix", rm, "Aufnehmende Agentur-ID")
    ohneAgentur = (LCase$(agRoh) = "keine" Or LCase$(agRoh) = "ohne agentur" Or IstLeer(agRoh))
    If Not ohneAgentur Then
        M_AgenturID = Left$(agRoh, 4)
        rg = TabZeile("tblAgenturen", "Aufnehmende Agentur-ID", M_AgenturID)
        agName = TabText("tblAgenturen", rg, "Aufnehmender Agenturname")
        agNr = TabText("tblAgenturen", rg, "Aufnehmende Agenturnummer / OE")
        agPnr = TabText("tblAgenturen", rg, "Aufnehmende Vermittlernummer / PNR")
        agMail = TabText("tblAgenturen", rg, "Aufnehmende Makler-E-Mail")
        zAg = "Stammdaten › Aufnehmende Agenturen › " & M_AgenturID
    End If
    rv = TabZeile("tblVertraege", "Datensatz-ID", M_Datensatz)
    zVt = "Stammdaten › Verträge › " & M_Datensatz
    If rv = 0 Then
        Fehlt "Vertragsdatensatz " & IIf(IstLeer(M_Datensatz), "(keine Datensatz-ID im Auftrag)", M_Datensatz), _
              "Stammdaten › Verträge (Datensatz-ID fehlt)", TabZelle("tblVertraege", TabAnzahl("tblVertraege"), "Datensatz-ID")
    End If
    vnr = TabText("tblVertraege", rv, "IMSI-VNR")
    sparte = TabText("tblVertraege", rv, "Sparte")
    If LCase$(sparte) = "offen" Or LCase$(sparte) = "nicht erforderlich" Then sparte = ""
    vnName = TabText("tblVertraege", rv, "Anonymisierter VN-/Firmenname")
    vnVorname = TabText("tblVertraege", rv, "Vorname, sofern relevant")
    gebRoh = TabWert("tblVertraege", rv, "Geburtsdatum, sofern relevant")
    vertragId = TabText("tblVertraege", rv, "Vertrag-ID")
    firma = IstFirma(vertragId, vnVorname, vnName)
    natuerlich = Not firma
    M_VNR = vnr

    re = TabZeile("tblGeneratorEingaben", "Mail-Auftrags-ID", M_ID)
    zEin = "Testmail-Generator › Ergänzende Testdaten › " & M_ID
    If re = 0 Then Hinweis "Für " & M_ID & " gibt es noch keine Zeile unter „Ergänzende Testdaten“ (Testmail-Generator) – bei Bedarf dort eine Zeile mit dieser Auftrags-ID anlegen."
    pAnschrift = EineZeile(TabText("tblGeneratorEingaben", re, "Anschrift Versicherungsnehmer"))
    vertreter = TabText("tblGeneratorEingaben", re, "Vertretungsberechtigte Person (Firmenkunde)")
    pName = TabText("tblGeneratorEingaben", re, "Person: Name / Firma")
    pVorname = TabText("tblGeneratorEingaben", re, "Person: Vorname")
    pGeb = TabWert("tblGeneratorEingaben", re, "Person: Geburtsdatum")
    pIS011 = LCase$(TabText("tblGeneratorEingaben", re, "IS011 ohne Treffer geprüft"))
    pAbwGeb = TabWert("tblGeneratorEingaben", re, "Abweichendes Geburtsdatum")
    pAbwVerm = TabText("tblGeneratorEingaben", re, "Abweichender Vermittler (Agentur-ID)")
    umName = TabText("tblGeneratorEingaben", re, "Untermakler: Name / Firma")
    umReg = TabText("tblGeneratorEingaben", re, "Untermakler: Registernummer")
    umMail = TabText("tblGeneratorEingaben", re, "Untermakler: E-Mail")
    unterlagen = TabText("tblGeneratorEingaben", re, "Unterlagenanforderung / Folgearbeiten")
    luecke = TabText("tblGeneratorEingaben", re, "Unterlagenlücke für PN-01")
    regNr = TabText("tblGeneratorEingaben", re, "Registernummer Bevollmächtigter")
    agAnschrift = EineZeile(TabText("tblGeneratorEingaben", re, "Anschrift Bevollmächtigter"))

    ' --- Einstellungen und Postfaecher
    ' Empfaenger optional: leer = in Outlook beim Senden eintragen. Der Postkorb, in dem die ABN den Vorgang eroeffnet,
    ' steht nicht in der Mail.
    empfAdr = Einst("EmpfaengerAdresse")
    M_EmpfName = ""
    M_EmpfAdr = empfAdr
    ' alle Testmails kommen aus dem einen Absender-Postfach (seit 1.3 keine eigenen Postfaecher P-01 bis P-04 mehr)
    absStd = Einst("AbsenderAdresse")
    absAdr = absStd
    If IstLeer(absAdr) Then
        Fehlt "Absender-Postfach: Adresse", "Testmail-Generator › Einstellungen", EinstZelle("AbsenderAdresse")
    End If
    testvermerk = LCase$(Einst("Testvermerk"))
    datum = Einst("Datum")
    If IstLeer(datum) Then datum = DatumText(Date)
    M_Datum = datum
    ort = OrtAus(pAnschrift)
    If IstLeer(ort) Then ort = Einst("Ort")

    ' --- Platzhalter wie in den Formeln von tblMailAuftraege
    phTF = M_Testfall
    If IstLeer(phTF) Then phTF = PH_TESTFALL
    phSp = Pflicht(sparte, PH_SPARTE, "Sparte (" & M_Datensatz & ")", zVt, TabZelle("tblVertraege", rv, "Sparte"))
    phVNR = Pflicht(vnr, PH_VNR, "IMSI-VNR (" & M_Datensatz & ")", zVt, TabZelle("tblVertraege", rv, "IMSI-VNR"))
    If M_MailID = "M-12" Then
        ' unbekannter Absender: bewusst ohne Agentur
        phAgName = PH_AGNAME: phAgNr = PH_AGNR: phPnr = PH_PNR
    ElseIf ohneAgentur Then
        ' jede andere Variante braucht eine aufnehmende Agentur (sonst blieben [AGENTURNAME] usw. in der Mail stehen)
        If IstLeer(agRoh) Then
            Fehlt "Aufnehmende Agentur-ID (Testfall-Matrix, " & M_Testfall & ")", "Testfall-Matrix › " & M_Testfall, _
                  TabZelle("tblMatrix", rm, "Aufnehmende Agentur-ID")
        Else
            Fehlt "Aufnehmende Agentur (die Testfall-Matrix nennt „" & agRoh & "“, " & M_MailID & " braucht eine)", _
                  "Testfall-Matrix › " & M_Testfall, TabZelle("tblMatrix", rm, "Aufnehmende Agentur-ID")
            Hinweis "Die Variante " & M_MailID & " braucht eine aufnehmende Agentur; nur M-12 kommt ohne aus."
        End If
        phAgName = PH_AGNAME: phAgNr = PH_AGNR: phPnr = PH_PNR
    Else
        phAgName = Pflicht(agName, PH_AGNAME, "Agenturname (" & M_AgenturID & ")", zAg, TabZelle("tblAgenturen", rg, "Aufnehmender Agenturname"))
        phAgNr = Pflicht(agNr, PH_AGNR, "Agenturnummer / OE (" & M_AgenturID & ")", zAg, TabZelle("tblAgenturen", rg, "Aufnehmende Agenturnummer / OE"))
        phPnr = agPnr
        If IstLeer(agPnr) Then phPnr = PH_PNR: Hinweis "Vermittlernummer / PNR von " & M_AgenturID & " ist leer (optional; Feld bleibt leer)."
        If IstLeer(agMail) Then Hinweis "Makler-E-Mail von " & M_AgenturID & " ist leer (optional; Kontaktfeld der Vollmacht und E-Mail-Zeile der Signatur bleiben leer)."
    End If
    M_AgenturName = agName
    If M_MailID = "M-10" Or M_MailID = "M-11" Then
        ortP = zEin
        zName = TabZelle("tblGeneratorEingaben", re, "Person: Name / Firma")
        zVor = TabZelle("tblGeneratorEingaben", re, "Person: Vorname")
        zGeb = TabZelle("tblGeneratorEingaben", re, "Person: Geburtsdatum")
        ' TF-KU-04: ohne Eingabe gilt laut Herleitung der Versicherungsnehmer der V-03-Hilfskonstellation (V03-K01)
        If M_MailID = "M-10" And M_Testfall = HILFS_TESTFALL And IstLeer(pName) And IstLeer(pVorname) And IstLeer(Txt(pGeb)) Then
            rh = TabZeile("tblVertraege", "Datensatz-ID", HILFS_DATENSATZ)
            If rh > 0 Then
                If IstLeer(TabText("tblVertraege", rh, "Anonymisierter VN-/Firmenname")) Then
                    Hinweis HILFS_TESTFALL & ": Ohne Eingabe wird der Versicherungsnehmer aus " & HILFS_DATENSATZ & _
                            " (Stammdaten) übernommen, sobald er dort gepflegt ist."
                Else
                    pName = TabText("tblVertraege", rh, "Anonymisierter VN-/Firmenname")
                    pVorname = TabText("tblVertraege", rh, "Vorname, sofern relevant")
                    pGeb = TabWert("tblVertraege", rh, "Geburtsdatum, sofern relevant")
                    ortP = "Stammdaten › Verträge › " & HILFS_DATENSATZ
                    zName = TabZelle("tblVertraege", rh, "Anonymisierter VN-/Firmenname")
                    zVor = TabZelle("tblVertraege", rh, "Vorname, sofern relevant")
                    zGeb = TabZelle("tblVertraege", rh, "Geburtsdatum, sofern relevant")
                    Hinweis "Andere vorhandene Person: Versicherungsnehmer aus " & HILFS_DATENSATZ & " (Stammdaten) übernommen."
                End If
            End If
        End If
        phVN = Pflicht(pName, IIf(M_MailID = "M-10", "[ANDERE PERSON]", "[FIKTIVE PERSON]"), _
                       IIf(M_MailID = "M-10", "Andere vorhandene Person: Name", "Fiktive Person: Name"), ortP, zName)
        Call Pflicht(pVorname, "", IIf(M_MailID = "M-10", "Andere vorhandene Person: Vorname", "Fiktive Person: Vorname"), ortP, zVor)
        If IstLeer(Txt(pGeb)) Then
            Fehlt IIf(M_MailID = "M-10", "Andere vorhandene Person: Geburtsdatum", "Fiktive Person: Geburtsdatum"), ortP, zGeb
        Else
            Call DatumAus(pGeb, ok)
            If Not ok Then
                Fehlt IIf(M_MailID = "M-10", "Andere vorhandene Person", "Fiktive Person") & ": Geburtsdatum nicht lesbar („" & _
                      Txt(pGeb) & "“, Format TT.MM.JJJJ)", ortP, zGeb
            End If
        End If
        If M_MailID = "M-11" And pIS011 <> "ja" Then Hinweis "Fiktive Person: „IS011 ohne Treffer geprüft“ ist nicht „ja“ – vorher in IS011 prüfen."
    Else
        phVN = Pflicht(vnName, PH_VN, "VN-/Firmenname (" & M_Datensatz & ")", zVt, TabZelle("tblVertraege", rv, "Anonymisierter VN-/Firmenname"))
    End If

    M_Betreff = Ersetzen(betreffV, phTF, phSp, phVNR, phAgName, phAgNr, phPnr, phVN)
    M_Text = Ersetzen(textV, phTF, phSp, phVNR, phAgName, phAgNr, phPnr, phVN)

    ' --- Absender und Signatur
    ' Absender ist immer das eine Postfach ohne eigenen Anzeigenamen; die Variante zeigt sich nur in der Signatur
    M_AbsName = ""
    Select Case M_Postfach
        Case "P-03", "P-04"
            ' interne Weiterleitung (M-13) bzw. unbekannter Absender (M-12): keine Agentur-Signatur
            signatur = ""
        Case Else
            signatur = vbLf & vbLf & phAgName & vbLf & "Agenturnummer " & phAgNr
            If Not IstLeer(agPnr) Then signatur = signatur & vbLf & "Vermittlernummer " & agPnr
            ' Signatur mit der E-Mail der Agentur aus den Stammdaten (nicht dem Absender-Postfach); leer = keine E-Mail-Zeile
            If Not IstLeer(agMail) Then signatur = signatur & vbLf & "E-Mail " & agMail
    End Select
    M_AbsAdr = absAdr
    M_Text = M_Text & signatur

    ' --- M-13: interne Weiterleitung mit Kopf der urspruenglichen Maklermail (Basisvorlage M-01)
    If M_MailID = "M-13" Then
        r01 = TabZeile("tblMailanforderungen", "Mail-ID / Zustand", "M-01")
        p01Adr = absStd                                           ' urspruenglicher Absender im Weiterleitungskopf
        weiter = vbLf & vbLf & "________________________________" & vbLf & _
                 "Von: " & phAgName & " <" & IIf(IstLeer(p01Adr), "[ABSENDER-ADRESSE]", p01Adr) & ">" & vbLf & _
                 "Gesendet: " & DatumText(Now - 1 / 24) & " " & ZeitText(Now - 1 / 24) & vbLf & _
                 "An: " & IIf(IstLeer(absAdr), "[ABSENDER-ADRESSE]", absAdr) & vbLf & _
                 "Betreff: " & Ersetzen(TabText("tblMailanforderungen", r01, "Betreff-Vorlage"), phTF, phSp, phVNR, phAgName, phAgNr, phPnr, phVN) & vbLf & vbLf & _
                 Ersetzen(Replace(TabText("tblMailanforderungen", r01, "Mailtext-Vorgabe"), vbCrLf, vbLf), phTF, phSp, phVNR, phAgName, phAgNr, phPnr, phVN) & _
                 vbLf & vbLf & phAgName & vbLf & "Agenturnummer " & phAgNr
        If Not IstLeer(agPnr) Then weiter = weiter & vbLf & "Vermittlernummer " & agPnr
        M_Text = M_Text & weiter
        Hinweis "M-13: Die weitergeleitete Originalmail folgt der Basisvorlage M-01 (die Datei beschreibt ihren Inhalt nicht)."
    End If

    ' --- Vollmachtgeber / Kunde
    If M_MailID = "M-10" Or M_MailID = "M-11" Then
        vgName = Trim$(pVorname & " " & pName)
        If IstLeer(pName) Then vgName = IIf(M_MailID = "M-10", "[ANDERE PERSON]", "[FIKTIVE PERSON]")
        natuerlich = True
        firma = False
    ElseIf IstLeer(vnName) Then
        vgName = PH_VN
    Else
        vgName = Trim$(vnVorname & " " & vnName)
    End If
    If natuerlich And IstLeer(vnVorname) And Not IstLeer(vnName) And M_MailID <> "M-10" And M_MailID <> "M-11" Then
        Hinweis "Vorname zu " & M_Datensatz & " ist leer – im Dokument steht nur der Name."
    End If

    ' --- Geburtsdatum
    gebText = ""
    If firma Then
        gebText = ""
    ElseIf M_MailID = "M-10" Or M_MailID = "M-11" Then
        d = DatumAus(pGeb, ok)
        If ok Then
            gebText = DatumText(d)
        Else
            gebText = "[GEBURTSDATUM]"
        End If
    ElseIf M_MailID = "M-09" Or M_MailID = "M-13" Then
        d = DatumAus(pAbwGeb, abwOk)
        If abwOk Then
            gebText = DatumText(d)
        ElseIf Not IstLeer(Txt(pAbwGeb)) Then
            Fehlt "Abweichendes Geburtsdatum nicht lesbar („" & Txt(pAbwGeb) & "“, Format TT.MM.JJJJ)", zEin, _
                  TabZelle("tblGeneratorEingaben", re, "Abweichendes Geburtsdatum")
            gebText = "[ABWEICHENDES GEBURTSDATUM]"
        Else
            d = DatumAus(gebRoh, ok)
            If Not ok Then
                Fehlt "IMSI-Geburtsdatum (" & M_Datensatz & ", Basis der Abweichung)", zVt, TabZelle("tblVertraege", rv, "Geburtsdatum, sofern relevant")
                gebText = "[GEBURTSDATUM]"
            ElseIf Day(d) = Month(d) Or Day(d) > 12 Then
                Fehlt "Abweichendes Geburtsdatum (Tag und Monat vertauschen wirkt bei " & DatumText(d) & " nicht)", zEin, _
                      TabZelle("tblGeneratorEingaben", re, "Abweichendes Geburtsdatum")
                gebText = "[ABWEICHENDES GEBURTSDATUM]"
            Else
                gebText = Right$("0" & Month(d), 2) & "." & Right$("0" & Day(d), 2) & "." & Year(d)
            End If
        End If
    Else
        d = DatumAus(gebRoh, ok)
        If ok Then
            gebText = DatumText(d)
        Else
            gebText = Txt(gebRoh)
            If Not IstLeer(gebText) Then Hinweis "Geburtsdatum zu " & M_Datensatz & " ist kein Datum TT.MM.JJJJ – es steht unverändert im Dokument."
        End If
        If IstLeer(gebText) And rv > 0 Then Hinweis "Geburtsdatum zu " & M_Datensatz & " ist leer (empfohlen; Feld bleibt leer)."
    End If

    If IstLeer(pAnschrift) Then Hinweis "Anschrift des Versicherungsnehmers ist leer (optional; Feld bleibt leer)."
    If M_Versendet Then Hinweis "Diese Mail ist laut Tabelle bereits versendet – erneut erzeugen?"
    If Left$(TabText("tblMailAuftraege", ra, "Kommentar / Blocker"), 9) = "BLOCKIERT" Then
        Hinweis "Abgeberzuordnung unvollständig – betrifft die Testdurchführung, nicht den Inhalt der Mail."
    End If

    ' --- Datei- und Dokumentnamen (EML mit Mailvariante, z. B. MAIL-001_TF-GL-01_M-01_VNR317063119.eml)
    If IstLeer(vnr) Then
        M_EmlName = M_Basis & "_" & DateinameAscii(M_MailID) & "_VNR-fehlt.eml"
    Else
        M_EmlName = M_Basis & "_" & DateinameAscii(M_MailID) & "_VNR" & DateinameAscii(vnr) & ".eml"
    End If
    If testvermerk <> "nein" Then fuss = "Testdokument Prüfbot | " & M_ID & " | " & M_Testfall & " | erstellt " & DatumText(Date)
    unterschrift = vgName
    If Left$(vgName, 1) = "[" Then unterschrift = "[UNTERSCHRIFT]"
    ' Firmenkunde: Unterschrift der vertretungsberechtigten Person (Eingabe), sonst aus dem Firmennamen
    If firma Then
        If IstLeer(vertreter) Then
            Hinweis "Firmenkunde: keine vertretungsberechtigte Person eingetragen (Ergänzende Testdaten) – die " & _
                    "Unterschrift wird aus dem Firmennamen erzeugt."
        ElseIf Left$(vgName, 1) <> "[" Then
            unterschrift = vertreter
        End If
    Else
        vertreter = ""
    End If
    If Left$(TabText("tblMailAuftraege", ra, "Betreff konkret"), 9) = "BLOCKIERT" Or _
       Left$(TabText("tblMailAuftraege", ra, "Mailtext / konkrete Inhaltsvorgabe"), 9) = "BLOCKIERT" Then
        Hinweis "Die Formel in To-do Mailerstellung meldet „BLOCKIERT: Stammdaten fehlen“; die Ursachen stehen hier " & _
                "einzeln, der Präfix steht nicht in der Mail."
    End If

    Select Case M_MailID
        Case "M-02", "M-06", "M-07"
            ' Betreuungswunsch (Mehrfachagent): Adressat = MFA, bei M-07 der abweichende Vermittler
            betreuerName = phAgName: betreuerNr = phAgNr: betreuerPnr = agPnr
            If M_MailID = "M-07" Then
                If IstLeer(pAbwVerm) Then
                    Fehlt "Abweichender Vermittler (Adressat des Betreuungswunsches)", zEin, _
                          TabZelle("tblGeneratorEingaben", re, "Abweichender Vermittler (Agentur-ID)")
                    betreuerName = "[ABWEICHENDER VERMITTLER]": betreuerNr = "": betreuerPnr = ""
                Else
                    rb = TabZeile("tblAgenturen", "Aufnehmende Agentur-ID", pAbwVerm)
                    If rb = 0 Then
                        betreuerName = pAbwVerm: betreuerNr = "": betreuerPnr = ""
                        Hinweis "Abweichender Vermittler ist keine Agentur-ID aus den Stammdaten – er steht als Freitext im Dokument."
                    Else
                        If StrComp(pAbwVerm, M_AgenturID, vbTextCompare) = 0 Then Hinweis "Der abweichende Vermittler muss sich von der MFA " & M_AgenturID & " unterscheiden."
                        betreuerName = Pflicht(TabText("tblAgenturen", rb, "Aufnehmender Agenturname"), PH_AGNAME, "Agenturname (" & pAbwVerm & ", abweichender Vermittler)", _
                                               "Stammdaten › Aufnehmende Agenturen › " & pAbwVerm, TabZelle("tblAgenturen", rb, "Aufnehmender Agenturname"))
                        betreuerNr = Pflicht(TabText("tblAgenturen", rb, "Aufnehmende Agenturnummer / OE"), PH_AGNR, "Agenturnummer / OE (" & pAbwVerm & ", abweichender Vermittler)", _
                                             "Stammdaten › Aufnehmende Agenturen › " & pAbwVerm, TabZelle("tblAgenturen", rb, "Aufnehmende Agenturnummer / OE"))
                        betreuerPnr = TabText("tblAgenturen", rb, "Aufnehmende Vermittlernummer / PNR")
                    End If
                End If
            End If
            DokNeu "Betreuungswunsch", M_Basis & "_Betreuungswunsch.pdf"
            Setze "titel", "Betreuungswunsch"
            Setze "kunde_name", vgName
            Setze "kunde_anschrift", pAnschrift
            Setze "ist_firma", IIf(firma, "ja", "")
            Setze "geburtsdatum", gebText
            Setze "vertragsnummer", phVNR
            Setze "sparte", phSp
            Setze "betreuer_name", betreuerName
            Setze "betreuer_agenturnummer", betreuerNr
            Setze "betreuer_pnr", betreuerPnr
            Setze "bue_wunsch", IIf(M_MailID = "M-06", "nein", "ja")
            Setze "schweigepflicht", IIf(MitGesundheitsdaten(sparte), "ja", "nein")
            Setze "ort", ort
            Setze "datum", datum
            Setze "unterschrift", unterschrift
            Setze "vertreter", vertreter
            Setze "fusszeile", fuss
        Case Else
            ' Maklervollmacht (M-03 als Pool-Vollmacht, M-12 ohne Agenturnummer)
            mv = "Maklervollmacht"
            If M_MailID = "M-03" Then mv = "Pool-Vollmacht"
            DokNeu mv, M_Basis & "_" & mv & ".pdf"
            Setze "titel", IIf(M_MailID = "M-03", "Maklervollmacht (Pool-Vollmacht)", "Maklervollmacht")
            Setze "vollmachtgeber_name", vgName
            Setze "vollmachtgeber_anschrift", IIf(M_MailID = "M-13" And luecke = "Anschrift fehlt", "", pAnschrift)
            Setze "ist_firma", IIf(firma, "ja", "")
            Setze "geburtsdatum", gebText
            If M_MailID = "M-12" Then
                Setze "makler_name", M_AbsName
                Setze "agenturnummer", ""
                Setze "vermittlernummer_pnr", ""
                Setze "kontakt", absAdr
                Setze "makler_anschrift", agAnschrift
            Else
                Setze "makler_name", phAgName
                Setze "agenturnummer", phAgNr
                Setze "vermittlernummer_pnr", agPnr
                Setze "kontakt", agMail
                Setze "makler_anschrift", agAnschrift
            End If
            Setze "registernummer", regNr
            Setze "vertragsnummer", phVNR
            Setze "sparte", phSp
            Setze "gesamtumfang", IIf(M_MailID = "M-03", "ja", "nein")
            Setze "untervollmacht", IIf(M_MailID = "M-03", "ja", "nein")
            Setze "schweigepflicht", IIf(MitGesundheitsdaten(sparte), "ja", "nein")
            Setze "umfang_text", IIf(M_MailID = "M-13" And luecke = "Vollmachtsumfang fehlt", "nein", "ja")
            Setze "ort", ort
            Setze "datum", IIf(M_MailID = "M-13" And luecke = "Datum fehlt", "", datum)
            Setze "unterschrift", IIf(M_MailID = "M-05", "", unterschrift)
            Setze "vertreter", vertreter
            Setze "fusszeile", fuss
            If M_MailID = "M-03" Then
                If IstLeer(unterlagen) Then
                    Fehlt "Unterlagenanforderung / Folgearbeiten", zEin, TabZelle("tblGeneratorEingaben", re, "Unterlagenanforderung / Folgearbeiten")
                    unterlagen = "[UNTERLAGENANFORDERUNG]"
                End If
                Setze "unterlagenanforderung", unterlagen
            End If
            If M_MailID = "M-13" Then
                If IstLeer(luecke) Then
                    Fehlt "Unterlagenlücke für PN-01", zEin, TabZelle("tblGeneratorEingaben", re, "Unterlagenlücke für PN-01")
                End If
            End If
            ' Untervollmacht des Pools an den Untermakler (nur M-03)
            If M_MailID = "M-03" Then
                DokNeu "Untervollmacht", M_Basis & "_Untervollmacht.pdf"
                Setze "titel", "Untervollmacht"
                Setze "pool_name", phAgName
                Setze "pool_agenturnummer", phAgNr
                Setze "bezug", "Maklervollmacht (Pool-Vollmacht) von " & vgName & " vom " & IIf(IstLeer(datum), "[DATUM]", datum)
                Setze "vertragsnummer", phVNR
                Setze "sparte", phSp
                Setze "umfang", "Gesamt, im Umfang der Hauptvollmacht"
                Setze "untermakler_name", Pflicht(umName, "[UNTERMAKLER]", "Untermakler: Name / Firma", zEin, TabZelle("tblGeneratorEingaben", re, "Untermakler: Name / Firma"))
                Setze "untermakler_registernummer", umReg
                Setze "untermakler_kontakt", umMail
                Setze "unterlagenanforderung", unterlagen
                Setze "ort", IIf(IstLeer(OrtAus(agAnschrift)), Einst("Ort"), OrtAus(agAnschrift))
                Setze "datum", datum
                Setze "unterschrift", IIf(Left$(phAgName, 1) = "[", "[UNTERSCHRIFT]", phAgName)
                Setze "fusszeile", fuss
            End If
    End Select
    ZeichenPruefen
End Function

' Felder mit Zeichen, die die Standardschrift der PDFs nicht fuehrt (z. B. polnisches L mit Strich, tuerkisches s mit
' Cedille): die Vollmacht zeigt sie umgeschrieben (L, s), die Mail unveraendert (UTF-8) - ein Hinweis macht den Unterschied sichtbar.
Private Sub ZeichenPruefen()
    Dim d As Long, i As Long, w As String
    For d = 1 To M_DokAnz
        For i = 1 To dfN(d)
            w = dfV(d, i)
            If Len(w) > 0 Then
                If Not modTmPdf.PdfDarstellbar(w) Then
                    Hinweis "„" & w & "“ enthält Zeichen, die die Vollmacht nicht darstellen kann; dort steht „" & _
                            modTmPdf.PdfUmschrift(w) & "“, in der Mail bleibt der Name unverändert."
                End If
            End If
        Next i
    Next d
End Sub

' Zeilenumbrueche einer mehrzeiligen Anschrift -> ", "
Private Function EineZeile(s As String) As String
    Dim t As String
    t = Replace(Replace(Replace(s, vbCrLf, vbLf), vbCr, vbLf), vbLf, ", ")
    Do While InStr(t, " ,") > 0
        t = Replace(t, " ,", ",")
    Loop
    Do While InStr(t, ",,") > 0
        t = Replace(t, ",,", ",")
    Loop
    Do While InStr(t, ",  ") > 0
        t = Replace(t, ",  ", ", ")
    Loop
    t = Trim$(t)
    If Left$(t, 1) = "," Then t = Trim$(Mid$(t, 2))
    If Right$(t, 1) = "," Then t = Trim$(Left$(t, Len(t) - 1))
    EineZeile = t
End Function

' Platzhalter ersetzen wie SUBSTITUTE in den Formeln von tblMailAuftraege
Private Function Ersetzen(s As String, tf As String, sp As String, vnr As String, agName As String, agNr As String, _
                          pnr As String, vn As String) As String
    Dim t As String
    t = s
    t = Replace(t, PH_TESTFALL, tf)
    t = Replace(t, PH_SPARTE, sp)
    t = Replace(t, PH_VNR, vnr)
    t = Replace(t, PH_AGNAME, agName)
    t = Replace(t, PH_AGNR, agNr)
    t = Replace(t, PH_PNR, pnr)
    t = Replace(t, PH_VN, vn)
    Ersetzen = t
End Function

' "P-01 – Externes Makler-Testpostfach ..." -> "P-01"; sonst nach Variante
Private Function PostfachAus(text As String, mailId As String) As String
    Dim p As Long
    p = InStr(1, text, "P-0", vbTextCompare)
    If p > 0 Then
        PostfachAus = UCase$(Mid$(text, p, 4))
        Exit Function
    End If
    Select Case mailId
        Case "M-03", "M-04": PostfachAus = "P-02"
        Case "M-12": PostfachAus = "P-04"
        Case "M-13": PostfachAus = "P-03"
        Case Else: PostfachAus = "P-01"
    End Select
End Function

' Firmenkunde: Vertragskonstellation nennt Firmenkunde/FK, oder kein Vorname und Rechtsform im Namen
Private Function IstFirma(vertragId As String, vorname As String, name As String) As Boolean
    Dim r As Long, k As String, n As String
    r = TabZeile("tblVertragskonstellationen", "Vertrag-ID", vertragId)
    k = LCase$(TabText("tblVertragskonstellationen", r, "Vertragskonstellation"))
    If InStr(k, "firmenkunde") > 0 Or Right$(k, 3) = " fk" Then IstFirma = True: Exit Function
    n = " " & LCase$(Replace(name, ",", " ")) & " "
    If IstLeer(vorname) Then
        If InStr(n, " gmbh ") > 0 Or InStr(n, " ag ") > 0 Or InStr(n, " kg ") > 0 Or InStr(n, " ohg ") > 0 Or _
           InStr(n, " ug ") > 0 Or InStr(n, " e.k. ") > 0 Or InStr(n, " gbr ") > 0 Or InStr(n, " se ") > 0 Then IstFirma = True
    End If
End Function

Private Function MitGesundheitsdaten(sparte As String) As Boolean
    Dim s As String
    s = LCase$(sparte)
    MitGesundheitsdaten = (s = "kv" Or InStr(s, "kranken") > 0 Or InStr(s, "leben") > 0 Or Left$(s, 3) = "kv ")
End Function

' Ort aus "Strasse 1, 40210 Duesseldorf" (Text nach der fuenfstelligen PLZ), sonst ""
Public Function OrtAus(anschrift As String) As String
    Dim i As Long, s As String
    s = Replace(anschrift, vbLf, ", ")
    For i = 1 To Len(s) - 5
        If Mid$(s, i, 5) Like "#####" Then
            If i = 1 Or Not (Mid$(s, i - 1, 1) Like "#") Then
                If Mid$(s, i + 5, 1) = " " Then
                    OrtAus = Trim$(Mid$(s, i + 6))
                    If InStr(OrtAus, ",") > 0 Then OrtAus = Trim$(Left$(OrtAus, InStr(OrtAus, ",") - 1))
                    Exit Function
                End If
            End If
        End If
    Next i
End Function

Private Function EnthaeltZiffer(s As String) As Boolean
    EnthaeltZiffer = (s Like "*#*")
End Function

Private Function AgenturNameVorhanden(s As String) As Boolean
    Dim r As Long
    If IstLeer(s) Then Exit Function
    For r = 1 To TabAnzahl("tblAgenturen")
        If StrComp(TabText("tblAgenturen", r, "Aufnehmender Agenturname"), Trim$(s), vbTextCompare) = 0 Then
            AgenturNameVorhanden = True
            Exit Function
        End If
    Next r
End Function

' ------------------------------------------------------------------ Pruefung ohne Dialog
' Liefert die fehlenden Werte als Zeilen "Feld – wo eintragen" (leer = vollstaendig). Ist fuer den Auftrag keine Mail
' vorgesehen (technischer Datensatz / Weg B), beginnt das Ergebnis mit "KEINE MAIL:".
Public Function FehlendText(auftragsId As String) As String
    Dim i As Long, s As String
    ModellBauen auftragsId
    If Not M_Erzeugbar Then
        FehlendText = "KEINE MAIL: " & M_KeineMail
        Exit Function
    End If
    For i = 1 To M_FehlAnz
        If Len(s) > 0 Then s = s & vbLf
        s = s & M_FehlFeld(i) & " – " & M_FehlOrt(i)
    Next i
    FehlendText = s
End Function
