Option Explicit
' ============================================================================
' modAttrappe - Outlook-Attrappe fuer die Testvariante (nur Regeln_Umbau_Test.xlsm).
'
' AtStart baut Postfaecher, Ordner, Verzeichnis und die 43 Regeln aus dem Export (modAttrappeDaten, vom Build
' erzeugt). Variante "export": genau der Export. Variante "faelle": zusaetzlich Faelle, die der Export nicht zeigt
' (unbekannter Bedingungstyp, Zugriffsfehler, Abwesenheitsnotiz). Variante "ordner": zusaetzlich der Ordnerbaum beider
' Postfaecher fuer die Ordner-Umstellung (AtOrdnerBaum, Plan 3.0). Danach zaehlt jeder schreibende Zugriff
' (gAtSchreib, gAtLog). Weitere Funktionen fuer test_umbau.py: Schalter, Outlook-Kopie nachstellen, Bedingungen
' setzen, Zustandsbericht.
' ============================================================================

Public gAtApp As Object
Public gAtScharf As Boolean
Public gAtSchreib As Long
Public gAtSaves As Long
Public gAtCreate As Long
Public gAtOrdnerAdd As Long
Public gAtGetRules As Long
Public gAtLog As String
Public gAtOrdnung As String
Public gAtFehlerOrdner As Boolean
Public gAtFehlerOrdnerZuweisen As Boolean
Public gAtFehlerName As String
Public gAtGesperrt As String
Public gAtNurLet As Boolean
Public gAtLetZuweisungen As Long
Public gAtVerlust As String
Public gAtAddVerlust As String
Public gAtAusVerlust As String
Public gAtOhneOutlook As Boolean
' Schalter "einschaltfehler": Rule.Enabled = True wirft fuer diese Regel Outlooks Meldung zu ungueltigen Aktionen
' oder Bedingungen (wie eine Regel, die Outlook aus einem anderen Grund ablehnt)
Public gAtFehlerEinschalten As String
' Schalter "beifrage": "n|aktion|regel|wert" - bei der n-ten Rueckfrage (gezaehlt ab dem Setzen) aendert die Attrappe
' den gespeicherten Stand des Bestandspostfachs, wie jemand, der waehrend der Rueckfragen in Outlook arbeitet
Public gAtBeiFrage As String
Private gAtFragenNr As Long
' Ordner-Umstellung: Zaehler (MoveTo, Name setzen), Schalter "verschiebefehler"/"umbenennfehler" (Ordnername, dessen
' MoveTo bzw. Umbenennen scheitert), "eidwechsel" (MoveTo vergibt neue EntryIDs, Regeln verlieren den Ordner)
Public gAtOrdnerMove As Long
Public gAtOrdnerName As Long
Public gAtFehlerVerschieben As String
Public gAtFehlerUmbenennen As String
Public gAtEidWechsel As Boolean
Private gAtEidNr As Long

Private gVzName() As String
Private gVzSmtp() As String
Private gVzListe() As Boolean
' Art des Eintrags (siehe clsAtAdr): "" Exchange-Benutzer/-Verteiler, "pa", "dn", "tot"
Private gVzArt() As String
Private gVzAnz As Long
Private gAktRegel As Object
Private gAktStore As Object

' Fehlernummer der Outlook-Meldung bei ungueltigen Aktionen (E_FAIL; die echte Nummer ist nicht belegt)
Public Const AT_OL_UNGUELTIG_NR As Long = -2147467259

Public Function AttrappeVersion() As String
    AttrappeVersion = "Attrappe 3.0"
End Function

' Outlooks Meldung (deutsch) beim Einschalten bzw. Speichern einer Regel mit ungueltiger Aktion
Public Function AtOlUngueltig() As String
    AtOlUngueltig = "Mindestens eine Regel kann aufgrund von ungültigen Aktionen oder Bedingungen nicht gespeichert werden."
End Function

Public Sub AtSchreib(ByVal was As String)
    If gAtScharf Then
        gAtSchreib = gAtSchreib + 1
        gAtLog = gAtLog & was & vbLf
    End If
End Sub

' ---------------------------------------------------------------- Verzeichnis (GAL)

Public Sub AtVz(ByVal anzeige As String, ByVal smtp As String, ByVal liste As Boolean)
    gVzAnz = gVzAnz + 1
    ReDim Preserve gVzName(0 To gVzAnz): ReDim Preserve gVzSmtp(0 To gVzAnz): ReDim Preserve gVzListe(0 To gVzAnz)
    ReDim Preserve gVzArt(0 To gVzAnz)
    gVzName(gVzAnz) = anzeige
    gVzSmtp(gVzAnz) = smtp
    gVzListe(gVzAnz) = liste
    gVzArt(gVzAnz) = ""
End Sub

Private Function VzDn(ByVal k As Long) As String
    VzDn = "/o=Attrappe/ou=Exchange Administrative Group/cn=Recipients/cn=" & Left(gVzSmtp(k), InStr(gVzSmtp(k) & "@", "@") - 1)
End Function

' Art eines Verzeichniseintrags setzen (fuer test_umbau.py): "" (Standard), "pa" (SMTP nur ueber PropertyAccessor,
' Name nicht aufloesbar), "dn" (nur Exchange-DN, nur per DN aufloesbar), "tot" (gar nicht aufloesbar)
Public Function AtVzArt(ByVal anzeige As String, ByVal art As String) As String
    Dim k As Long
    For k = 1 To gVzAnz
        If LCase(gVzName(k)) = LCase(anzeige) Then
            gVzArt(k) = art
            AtVzArt = anzeige & ": " & IIf(art = "", "Standard", art) & " (" & VzDn(k) & ")"
            Exit Function
        End If
    Next k
    AtVzArt = "nicht im Verzeichnis: " & anzeige
End Function

Public Function AtVzArtVon(ByVal anzeige As String) As String
    Dim k As Long
    For k = 1 To gVzAnz
        If LCase(gVzName(k)) = LCase(anzeige) Then
            AtVzArtVon = gVzArt(k)
            Exit Function
        End If
    Next k
End Function

' Aufloesen wie Outlook: nach Anzeigename, SMTP-Adresse oder Exchange-DN - je nach Art des Eintrags. Schalter
' "gesperrt" (Namen oder Eingaben mit "|") sperrt einen Eintrag fuer jede Eingabe.
Public Function AtVerzeichnis(ByVal eingabe As String, ByRef anzeige As String, ByRef smtp As String, _
                              ByRef dn As String, ByRef liste As Boolean) As Boolean
    Dim k As Long, e As String, art As String, treffer As Boolean
    e = LCase(Trim(eingabe))
    If InStr("|" & LCase(gAtGesperrt) & "|", "|" & e & "|") > 0 Then Exit Function
    For k = 1 To gVzAnz
        art = gVzArt(k)
        treffer = False
        If LCase(gVzName(k)) = e And art = "" Then treffer = True
        If LCase(gVzSmtp(k)) = e And (art = "" Or art = "pa") Then treffer = True
        If LCase(VzDn(k)) = e And art <> "tot" Then treffer = True
        If treffer Then
            If InStr("|" & LCase(gAtGesperrt) & "|", "|" & LCase(gVzName(k)) & "|") > 0 Then Exit Function
            anzeige = gVzName(k)
            smtp = gVzSmtp(k)
            dn = VzDn(k)
            liste = gVzListe(k)
            AtVerzeichnis = True
            Exit Function
        End If
    Next k
End Function

' Eintrag nach Anzeigename oder SMTP ohne Einschraenkung (Empfaenger, die beim Anlegen der Regel aufgeloest wurden)
Public Function AtVerzeichnisRoh(ByVal eingabe As String, ByRef anzeige As String, ByRef smtp As String, _
                                 ByRef dn As String, ByRef liste As Boolean) As Boolean
    Dim k As Long, e As String
    e = LCase(Trim(eingabe))
    For k = 1 To gVzAnz
        If LCase(gVzName(k)) = e Or LCase(gVzSmtp(k)) = e Then
            anzeige = gVzName(k)
            smtp = gVzSmtp(k)
            dn = VzDn(k)
            liste = gVzListe(k)
            AtVerzeichnisRoh = True
            Exit Function
        End If
    Next k
End Function

' ---------------------------------------------------------------- Aufbau

' Postfach der Attrappe nach Anzeigename oder Stammordner (\\adresse; der Anzeigename laesst sich umstellen)
Public Function AtStoreNach(ByVal adresse As String) As Object
    Dim i As Long, st As Object
    For i = 1 To gAtApp.Session.Stores.Count
        Set st = gAtApp.Session.Stores.Item(i)
        If LCase(st.DisplayName) = LCase(adresse) Or LCase(st.Wurzel.FolderPath) = "\\" & LCase(adresse) Then
            Set AtStoreNach = st
            Exit Function
        End If
    Next i
End Function

Public Sub AtPostfach(ByVal adresse As String, ByVal rootFehler As Boolean)
    Dim st As Object
    Set st = New clsAtStore
    st.Init adresse
    st.RootFehler = rootFehler
    gAtApp.Session.Stores.Hinzu st
End Sub

' Ordner samt fehlender Elternordner anlegen (ohne Zaehlung). Pfad wie im FolderPath (%2F fuer /).
Public Function AtOrdner(ByVal pfad As String) As Object
    Dim teile As Variant, k As Long, f As Object, kind As Object, st As Object, nm As String
    teile = Split(Mid(pfad, 3), "\")
    Set st = AtStoreNach(CStr(teile(0)))
    Set f = st.Wurzel
    For k = 1 To UBound(teile)
        nm = Replace(CStr(teile(k)), "%2F", "/")
        Set kind = Nothing
        On Error Resume Next
        Set kind = f.Folders.Item(nm)
        On Error GoTo 0
        If kind Is Nothing Then Set kind = f.Folders.Neu(nm)
        Set f = kind
    Next k
    Set AtOrdner = f
End Function

' Regel im gespeicherten Stand anlegen (Platz = ExecutionOrder); folgende AtBed/AtAkt beziehen sich darauf.
Public Sub AtRegel(ByVal adresse As String, ByVal platz As Long, ByVal regelName As String, ByVal aktiv As Boolean, _
                   ByVal lokal As Boolean)
    Dim r As Object, regeln As Object
    Set gAktStore = AtStoreNach(adresse)
    Set regeln = gAktStore.Gespeichert
    Set r = New clsAtRegel
    r.Init regeln, regelName, 0
    r.AktivIntern = aktiv
    r.LokalIntern = lokal
    regeln.AnhaengenKlon r
    r.OrderIntern = platz
    Set gAktRegel = r
End Sub

Private Sub EmpfaengerEintragen(ByVal liste As Object, ByVal wert As String)
    Dim teile As Variant, i As Long, r As Object
    teile = Split(wert, "; ")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            Set r = liste.Neu(Trim(teile(i)))
            r.Anlegen
        End If
    Next i
End Sub

' Bedingung (art "B") oder Ausnahme (art "A") der aktuellen Regel: Typ und Wert. Empfaenger mit "; ", Woerter,
' Adressen und Formulare mit "|" getrennt.
Public Sub AtBed(ByVal art As String, ByVal t As Long, ByVal wert As String)
    Dim liste As Object, c As Object
    If art = "A" Then Set liste = gAktRegel.AusIntern Else Set liste = gAktRegel.BedIntern
    Set c = liste.Typ(t)
    c.AktivIntern = True
    liste.Sichtbar t
    Select Case t
        Case 1, 12
            EmpfaengerEintragen c.Recipients, wert
        Case 2, 13, 14, 15
            c.TextIntern = Split(wert, "|")
        Case 16, 17
            c.AdresseIntern = Split(wert, "|")
        Case 23
            c.FormIntern = Split(wert, "|")
    End Select
End Sub

' Aktion der aktuellen Regel: MOVE/COPY (Pfad), FWD/FWDATT/REDIR (Empfaenger), HALT, SRVREPLY, MARKREAD, UNBEKANNT
Public Sub AtAkt(ByVal schluessel As String, ByVal wert As String)
    Dim a As Object, k As Long, namen As Variant
    namen = Array("", "MOVE", "COPY", "FWD", "FWDATT", "REDIR", "HALT", "CAT", "CLRCAT", "ALERT", "SRVREPLY", "MARKREAD", "UNBEKANNT")
    For k = 1 To 12
        If namen(k) = schluessel Then Set a = gAktRegel.Actions.Nr(k)
    Next k
    a.AktivIntern = True
    Select Case schluessel
        Case "MOVE", "COPY"
            If wert <> "" Then a.OrdnerIntern AtOrdner(wert)
        Case "FWD", "FWDATT", "REDIR"
            EmpfaengerEintragen a.Recipients, wert
    End Select
End Sub

Public Function AtRegelNach(ByVal adresse As String, ByVal regelName As String) As Object
    Set AtRegelNach = AtStoreNach(adresse).Gespeichert.NachName(regelName)
End Function

' Faelle, die der Export nicht zeigt (Bedingungen, die das Objektmodell so liefern koennte)
Private Sub AtFaelle()
    Dim r As Object, liste As Object, c As Object
    ' Makler "Automatische Antworten aussortieren": zusaetzlich Abwesenheitsnotiz (Typ 19, nur im Index-Durchlauf)
    Set r = AtRegelNach(AT_MAKLER, "Automatische Antworten aussortieren")
    Set liste = r.BedIntern
    Set c = liste.Typ(19)
    c.AktivIntern = True
    ' Bestand: unbekannter Bedingungstyp (0) bzw. Zugriffsfehler auf die Bedingungen
    Set r = AtRegelNach(AT_BESTAND, "Service Team Vermittlerverwaltung - Makler u Koop - Gruppenpostfach")
    Set liste = r.BedIntern
    Set c = liste.Typ(0)
    c.AktivIntern = True
    liste.Sichtbar 0
    Set r = AtRegelNach(AT_BESTAND, "PVB, Bot 1 (PVBHH-EXTERN)")
    r.BedFehler = True
End Sub

' Grundaufbau. variante: "export" (genau der Export) oder "faelle" (zusaetzlich AtFaelle).
Public Function AtStart(ByVal variante As String) As String
    Dim n As Long
    gAtScharf = False
    gAtSchreib = 0: gAtSaves = 0: gAtCreate = 0: gAtOrdnerAdd = 0: gAtGetRules = 0: gAtLog = ""
    gAtOrdnung = "einfuegen": gAtFehlerOrdner = False: gAtFehlerOrdnerZuweisen = False: gAtFehlerName = "": gAtGesperrt = ""
    gAtNurLet = False: gAtLetZuweisungen = 0: gAtVerlust = "": gAtAddVerlust = "": gAtOhneOutlook = False
    gAtAusVerlust = "": gAtFehlerEinschalten = "": gAtBeiFrage = "": gAtFragenNr = 0
    gAtOrdnerMove = 0: gAtOrdnerName = 0: gAtFehlerVerschieben = "": gAtFehlerUmbenennen = "": gAtEidWechsel = False
    gAtEidNr = 0
    gVzAnz = 0
    gDlgAntworten = "": gDlgLog = ""
    Set gAtApp = New clsAtApp
    AtPostfach "persoenlich@attrappe.invalid", False
    AtPostfach "Archiv (lokale Datei)", True
    AtPostfach AT_BESTAND, False
    AtPostfach AT_MAKLER, False
    AtDatenLaden
    If variante = "faelle" Then AtFaelle
    If variante = "ordner" Then AtOrdnerBaum
    n = AtStoreNach(AT_BESTAND).Gespeichert.Count + AtStoreNach(AT_MAKLER).Gespeichert.Count
    gAtScharf = True
    AtStart = "Attrappe " & variante & ": " & n & " Regeln, " & gVzAnz & " Verzeichniseintraege"
End Function

' ---------------------------------------------------------------- Eingriffe fuer die Tests

Public Function AtSchalter(ByVal schalter As String, ByVal wert As String) As String
    Select Case schalter
        Case "savefehler": AtStoreNach(AT_BESTAND).SaveFehler = (wert = "1")
        Case "ordnerfehler": gAtFehlerOrdner = (wert = "1")
        Case "zuweisfehler": gAtFehlerOrdnerZuweisen = (wert = "1")
        Case "namefehler": gAtFehlerName = wert
        Case "ordnung": gAtOrdnung = wert
        Case "gesperrt": gAtGesperrt = wert
        Case "antworten": gDlgAntworten = wert
        Case "nurlet": gAtNurLet = (wert = "1")
        Case "verlust": gAtVerlust = wert
        Case "addverlust": gAtAddVerlust = wert
        Case "ohneoutlook": gAtOhneOutlook = (wert = "1")
        Case "ausverlust": gAtAusVerlust = wert
        Case "einschaltfehler": gAtFehlerEinschalten = wert
        Case "anzeigename": AtStoreNach(AT_MAKLER).DisplayName = wert
        Case "verschiebefehler": gAtFehlerVerschieben = wert
        Case "umbenennfehler": gAtFehlerUmbenennen = wert
        Case "eidwechsel": gAtEidWechsel = (wert = "1")
        Case "beifrage"
            gAtBeiFrage = wert
            gAtFragenNr = 0
    End Select
    AtSchalter = schalter & "=" & wert
End Function

' Aus der Test-Rueckfrage (modDialog.Frage): bei der n-ten Rueckfrage den gespeicherten Stand aendern (Schalter
' "beifrage"). Aktionen: "platz" (Regel auf Platz wert) und "bedfehler" (Zugriffsfehler auf die Bedingungen).
' Die Regel steht zwischen dem zweiten und dem letzten Trennstrich (darf selbst "|" enthalten).
Public Sub AtBeiFrage()
    Dim p1 As Long, p2 As Long, p3 As Long, n As Long, aktion As String, regel As String, wert As String
    If gAtBeiFrage = "" Then Exit Sub
    gAtFragenNr = gAtFragenNr + 1
    p1 = InStr(gAtBeiFrage, "|")
    p2 = InStr(p1 + 1, gAtBeiFrage, "|")
    p3 = InStrRev(gAtBeiFrage, "|")
    If p1 = 0 Or p2 = 0 Or p3 <= p2 Then Exit Sub
    n = Val(Left(gAtBeiFrage, p1 - 1))
    If gAtFragenNr <> n Then Exit Sub
    aktion = Mid(gAtBeiFrage, p1 + 1, p2 - p1 - 1)
    regel = Mid(gAtBeiFrage, p2 + 1, p3 - p2 - 1)
    wert = Mid(gAtBeiFrage, p3 + 1)
    Select Case aktion
        Case "platz": gDlgLog = gDlgLog & "AENDERUNG " & AtPlatz(AT_BESTAND, regel, Val(wert)) & vbLf & "----" & vbLf
        Case "bedfehler": gDlgLog = gDlgLog & "AENDERUNG " & AtBedFehler(AT_BESTAND, regel) & vbLf & "----" & vbLf
    End Select
End Sub

' Wie "Kopieren..." im Outlook-Regeldialog: Quellregel mit allen Bedingungen ins Zielpostfach, Name "Kopie von ...",
' Ordner zeigen weiter ins Quellpostfach, Platz am Ende.
Public Function AtKopieVonOutlook(ByVal regelName As String) As String
    Dim q As Object, ziel As Object, n As Object
    Set q = AtRegelNach(AT_MAKLER, regelName)
    If q Is Nothing Then
        AtKopieVonOutlook = "Quellregel fehlt: " & regelName
        Exit Function
    End If
    Set ziel = AtStoreNach(AT_BESTAND).Gespeichert
    Set n = q.Klon(ziel)
    n.NameIntern = "Kopie von " & regelName
    ziel.AnhaengenKlon n
    n.OrderIntern = ziel.Count
    AtKopieVonOutlook = "kopiert: " & n.Name
End Function

Private Function OhneZaehlen(ByVal adresse As String, ByVal regelName As String) As Boolean
    gAtScharf = False
    Set gAktRegel = AtRegelNach(adresse, regelName)
    OhneZaehlen = Not (gAktRegel Is Nothing)
End Function

' Bedingung (Typ t) einer gespeicherten Regel setzen und einschalten
Public Function AtBedSetzen(ByVal adresse As String, ByVal regelName As String, ByVal t As Long, ByVal wert As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        AtBed "B", t, wert
        AtBedSetzen = "gesetzt: " & regelName & " Typ " & t
    Else
        AtBedSetzen = "Regel fehlt: " & regelName
    End If
    gAtScharf = scharf
End Function

' Ausnahme (Typ t) setzen; aktiv = False: Werte stehen drin, Ausnahme ist aber ausgeschaltet
Public Function AtAusSetzen(ByVal adresse As String, ByVal regelName As String, ByVal t As Long, ByVal wert As String, _
                            ByVal aktiv As Boolean) As String
    Dim scharf As Boolean, c As Object
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        AtBed "A", t, wert
        Set c = gAktRegel.AusIntern.Typ(t)
        c.AktivIntern = aktiv
        AtAusSetzen = "Ausnahme gesetzt: " & regelName & " Typ " & t & IIf(aktiv, "", " (aus)")
    Else
        AtAusSetzen = "Regel fehlt: " & regelName
    End If
    gAtScharf = scharf
End Function

' Alle Bedingungen einer gespeicherten Regel ausschalten (Regel ohne sichtbare Bedingung)
Public Function AtBedAlleAus(ByVal adresse As String, ByVal regelName As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        gAktRegel.BedingungenVerlieren
        AtBedAlleAus = "Bedingungen aus: " & regelName
    End If
    gAtScharf = scharf
End Function

' Bedingung nur ueber die benannte Eigenschaft sichtbar (nicht im Index-Durchlauf)
Public Function AtBedVerstecken(ByVal adresse As String, ByVal regelName As String, ByVal t As Long) As String
    Dim scharf As Boolean, c As Object
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        Set c = gAktRegel.BedIntern.Typ(t)
        c.AktivIntern = True
        gAktRegel.BedIntern.Verstecken t
        AtBedVerstecken = "Typ " & t & " nur benannt: " & regelName
    End If
    gAtScharf = scharf
End Function

' Zugriffsfehler auf die Bedingungen einer Regel
Public Function AtBedFehler(ByVal adresse As String, ByVal regelName As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        gAktRegel.BedFehler = True
        AtBedFehler = "Zugriffsfehler: " & regelName
    End If
    gAtScharf = scharf
End Function

' Aktive Aktion unbekannten Typs (0)
Public Function AtAktUnbekannt(ByVal adresse As String, ByVal regelName As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        AtAkt "UNBEKANNT", ""
        AtAktUnbekannt = "Aktion Typ 0: " & regelName
    End If
    gAtScharf = scharf
End Function

' Ausgeschaltete Umleitung mit einem (aufgeloesten) alten Empfaenger
Public Function AtRedirAlt(ByVal adresse As String, ByVal regelName As String, ByVal empf As String, ByVal smtp As String) As String
    Dim scharf As Boolean, a As Object, e As Object
    scharf = gAtScharf
    AtVz empf, smtp, False
    If OhneZaehlen(adresse, regelName) Then
        Set a = gAktRegel.Actions.Nr(5)
        Set e = a.Recipients.Neu(empf)
        e.Resolve
        AtRedirAlt = "REDIR aus, Empfaenger: " & a.Recipients.Count
    End If
    gAtScharf = scharf
End Function

' Absender in eine Ausnahme (Typ t) einer gespeicherten Regel eintragen, dessen Eintrag nur den Exchange-DN liefert
' (veralteter Eintrag ohne ExchangeUser); die Ausnahme wird eingeschaltet
Public Function AtAusEmpfDn(ByVal adresse As String, ByVal regelName As String, ByVal t As Long, ByVal empf As String) As String
    Dim scharf As Boolean, c As Object, e As Object
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        Set c = gAktRegel.AusIntern.Typ(t)
        c.AktivIntern = True
        gAktRegel.AusIntern.Sichtbar t
        Set e = c.Recipients.Neu(empf)
        e.Anlegen
        e.ArtSetzen "dn"
        AtAusEmpfDn = "Ausnahme Typ " & t & " + " & empf & " (nur DN): " & regelName & ", jetzt " & c.Recipients.Count
    Else
        AtAusEmpfDn = "Regel fehlt: " & regelName
    End If
    gAtScharf = scharf
End Function

' Weitere Regel am Ende (lesbare Absenderadresse, Verschieben)
Public Function AtRegelDazu(ByVal adresse As String, ByVal regelName As String, ByVal ordner As String) As String
    Dim scharf As Boolean, n As Long
    scharf = gAtScharf
    gAtScharf = False
    n = AtStoreNach(adresse).Gespeichert.Count + 1
    AtRegel adresse, n, regelName, True, False
    AtBed "B", 17, "irgendwer@test.invalid"
    AtAkt "MOVE", ordner
    gAtScharf = scharf
    AtRegelDazu = "Regel " & regelName & " auf Platz " & n
End Function

' Lesefehler bei Regel-Eigenschaften ("Enabled|RuleType", ...)
Public Function AtLeseFehler(ByVal adresse As String, ByVal regelName As String, ByVal eigenschaften As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        gAktRegel.LeseFehler = eigenschaften
        AtLeseFehler = "Lesefehler " & eigenschaften & ": " & regelName
    End If
    gAtScharf = scharf
End Function

' Gespeicherte Regel auf Platz p setzen (herausnehmen und einfuegen), ohne Zaehlung
Public Function AtPlatz(ByVal adresse As String, ByVal regelName As String, ByVal p As Long) As String
    Dim scharf As Boolean, ordnung As String
    scharf = gAtScharf
    If OhneZaehlen(adresse, regelName) Then
        ordnung = gAtOrdnung
        gAtOrdnung = "einfuegen"
        AtStoreNach(adresse).Gespeichert.Umordnen gAktRegel, p
        gAtOrdnung = ordnung
        AtPlatz = regelName & " auf Platz " & p
    Else
        AtPlatz = "Regel fehlt: " & regelName
    End If
    gAtScharf = scharf
End Function

Public Function AtZaehler() As String
    AtZaehler = "schreib=" & gAtSchreib & ";save=" & gAtSaves & ";create=" & gAtCreate & ";ordneradd=" & gAtOrdnerAdd & _
                ";getrules=" & gAtGetRules & ";let=" & gAtLetZuweisungen & ";move=" & gAtOrdnerMove & _
                ";umbenennen=" & gAtOrdnerName
End Function

Public Function AtSchreibLog() As String
    AtSchreibLog = gAtLog
End Function

Public Function AtDialoge() As String
    AtDialoge = gDlgLog
End Function

' Gespeicherter Stand eines Postfachs, je Regel eine Zeile in Ausfuehrungsreihenfolge:
' R|Platz|Name|Aktiv|Bedingungen|Aktionen|Ausnahmen
Public Function AtZustand(ByVal adresse As String) As String
    Dim rg As Object, i As Long, s As String, r As Object
    Set rg = AtStoreNach(adresse).Gespeichert
    For i = 1 To rg.Count
        Set r = rg.Item(i)
        s = s & "R" & Chr(9) & r.OrderIntern & Chr(9) & r.Name & Chr(9) & IIf(r.AktivWert, "Ja", "Nein") & Chr(9) & _
            r.BedIntern.Bericht() & Chr(9) & r.Actions.Bericht() & Chr(9) & r.AusIntern.Bericht() & vbLf
    Next i
    AtZustand = s
End Function

Public Function AtOrdnerListe(ByVal adresse As String) As String
    AtOrdnerListe = OrdnerBaum(AtStoreNach(adresse).Wurzel)
End Function

Private Function OrdnerBaum(ByVal f As Object) As String
    Dim i As Long, s As String
    s = f.FolderPath & vbLf
    For i = 1 To f.Folders.Count
        s = s & OrdnerBaum(f.Folders.Item(i))
    Next i
    OrdnerBaum = s
End Function

' Zellen und Spalten fuer test_umbau.py (ueber die Namen, wie das Makro)
Public Function AtLayout() As String
    AtLayout = "PLAN_ERSTE=" & PlanErste() & ";PLAN_LETZTE=" & PlanLetzte() & _
               ";ZELLE_ZIEL=" & NamensBereich(N_ZIEL).Address(False, False) & _
               ";ZELLE_QUELLE=" & NamensBereich(N_QUELLE).Address(False, False) & _
               ";ZELLE_TROTZ=" & NamensBereich(N_TROTZ).Address(False, False) & _
               ";ZELLE_PFSTATUS=" & NamensBereich(N_STATUS).Address(False, False) & _
               ";ZELLE_PRUEFWERT=" & NamensBereich(N_PRUEFWERT).Address(False, False) & _
               ";ZELLE_VORSCHAU_ZEIT=" & NamensBereich(N_VORSCHAU_ZEIT).Address(False, False) & _
               ";ZELLE_AUSF_ZEIT=" & NamensBereich(N_AUSF_ZEIT).Address(False, False) & _
               ";ZELLE_LIVE_ZEIT=" & NamensBereich(N_LIVE_ZEIT).Address(False, False) & _
               ";LIVE_ERSTE=" & LIVE_ERSTE & ";SICH_ERSTE=" & SICH_ERSTE & ";PROT_ERSTE=" & PROT_ERSTE & _
               ";SP_NR=" & SP_NR & ";SP_AUSF=" & SP_AUSF & ";SP_AKTION=" & SP_AKTION & ";SP_REGEL=" & SP_REGEL & _
               ";SP_NEU=" & SP_NEU & ";SP_VER=" & SP_VER & ";SP_KOP=" & SP_KOP & ";SP_QUELLE=" & SP_QUELLE & _
               ";SP_VORSCHAU=" & SP_VORSCHAU & ";SP_ERGEBNIS=" & SP_ERGEBNIS & ";SP_UEBERSPR=" & SP_UEBERSPR
End Function


' ---------------------------------------------------------------- Ordner-Umstellung (Plan 3.0)

' EntryID fuer einen neuen Ordner der Attrappe (fest ab dem Anlegen)
Public Function AtEidNeu() As String
    gAtEidNr = gAtEidNr + 1
    AtEidNeu = "00000000A77A" & Right("000000" & gAtEidNr, 6)
End Function

Private Function AtIstUnter(ByVal f As Object, ByVal oben As Object) As Boolean
    Dim n As Long
    Do While Not f Is Nothing And n < 200
        If f Is oben Then
            AtIstUnter = True
            Exit Function
        End If
        Set f = f.Eltern
        n = n + 1
    Loop
End Function

' Schalter "eidwechsel": neue EntryIDs fuer den verschobenen Ordner samt Unterordnern; Verschieben-/Kopieren-Aktionen
' aller gespeicherten Regeln, die dorthin zeigten, verlieren den Ordner
Public Sub AtEidWechselNach(ByVal f As Object)
    Dim i As Long, st As Object, rg As Object, k As Long, a As Object, j As Long
    f.EidErneuern
    For i = 1 To gAtApp.Session.Stores.Count
        Set st = gAtApp.Session.Stores.Item(i)
        Set rg = st.Gespeichert
        For k = 1 To rg.Count
            For j = 1 To 2
                Set a = rg.Item(k).Actions.Nr(j)
                If Not a.Folder Is Nothing Then
                    If AtIstUnter(a.Folder, f) Then a.OrdnerIntern Nothing
                End If
            Next j
        Next k
    Next i
End Sub

' Ordner ueber den Pfad (FolderPath oder mit "/"), ohne etwas anzulegen; Nothing, wenn er fehlt
Public Function AtOrdnerSuchen(ByVal pfad As String) As Object
    Dim teile As Variant, k As Long, f As Object, kind As Object, st As Object
    teile = Split(Mid(pfad, 3), "\")
    Set st = AtStoreNach(CStr(teile(0)))
    If st Is Nothing Then Exit Function
    Set f = st.Wurzel
    For k = 1 To UBound(teile)
        Set kind = Nothing
        On Error Resume Next
        Set kind = f.Folders.Item(Replace(CStr(teile(k)), "%2F", "/"))
        On Error GoTo 0
        If kind Is Nothing Then Exit Function
        Set f = kind
    Next k
    Set AtOrdnerSuchen = f
End Function

' Ordner samt Elternordnern anlegen, ohne Zaehlung (Testvorbereitung)
Public Function AtOrdnerDazu(ByVal pfad As String) As String
    Dim scharf As Boolean
    scharf = gAtScharf
    gAtScharf = False
    AtOrdnerDazu = AtOrdner(pfad).FolderPath
    gAtScharf = scharf
End Function

' Ordner umbenennen, ohne Zaehlung (wie jemand, der in Outlook einen anderen Namen vergeben hat)
Public Function AtOrdnerNameIntern(ByVal pfad As String, ByVal neu As String) As String
    Dim f As Object
    Set f = AtOrdnerSuchen(pfad)
    If f Is Nothing Then
        AtOrdnerNameIntern = "Ordner fehlt: " & pfad
        Exit Function
    End If
    f.NameIntern = neu
    AtOrdnerNameIntern = f.FolderPath
End Function

' Ordner in einen anderen Elternordner haengen, ohne Zaehlung
Public Function AtOrdnerUmhaengen(ByVal pfad As String, ByVal elternPfad As String) As String
    Dim f As Object, e As Object
    Set f = AtOrdnerSuchen(pfad)
    Set e = AtOrdnerSuchen(elternPfad)
    If f Is Nothing Or e Is Nothing Then
        AtOrdnerUmhaengen = "Ordner fehlt: " & pfad & " / " & elternPfad
        Exit Function
    End If
    f.Eltern.Folders.Entfernen f
    e.Folders.Hinzu f
    f.ElternSetzen e
    AtOrdnerUmhaengen = f.FolderPath
End Function

Public Function AtOrdnerEid(ByVal pfad As String) As String
    Dim f As Object
    Set f = AtOrdnerSuchen(pfad)
    If Not f Is Nothing Then AtOrdnerEid = f.EntryID
End Function

' Ordnerbaum beider Postfaecher wie in Outlook (Screenshots des Nutzers); die Ordner aus den Regeln des Exports sind
' schon da. Bestand: Stand nach Plan 2.3 (Archiv\Automatische Antworten angelegt).
Private Sub AtOrdnerBaum()
    Dim b As String, m As Variant, k As Long, namen As Variant
    b = "\\" & AT_BESTAND & "\"
    m = "\\" & AT_MAKLER & "\"
    namen = Array("Archiv\Automatische Antworten", "Archiv\No Reply Mails etc.", "Archiv\Erinnerung JungDMS", _
                  "Archiv\Erinnerungen Fonds Finanz", "Archiv\Erinnerungen Qualitypool", _
                  "Archiv\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden", "Archiv\Archiv: BeMaS an KWAD", _
                  "Archiv\Archiv: Dopplung der Neuzugänge", "Archiv\Archiv: Weitergeleiteten Mails zu FL an VSLV3", _
                  "Archiv\Archiv: Weiterleitung an KWAD\Meldung andere Vorgänge", _
                  "Archiv\Archiv: Weiterleitung an KWAD\Meldung DEMA Vorgänge", _
                  "Archiv\Archiv: Vorabinfo\Entwurf aus BOT Postf.", "BÜ-Archiv: Weitergeleiteten Mails an Celonis", _
                  "Umleitung - Technischer Fehler", "Rückläufer EPL und FL Verträge\Abbas", _
                  "Rückläufer EPL und FL Verträge\Gran", "Rückläufer EPL und FL Verträge\Haverkamp", _
                  "Rückläufer EPL und FL Verträge\Holz", "Rückläufer EPL und FL Verträge\Mathes", _
                  "Rückläufer EPL und FL Verträge\Nass-Kluske\Erledigt", "Rückläufer EPL und FL Verträge\Sprute", _
                  "Rückläufer EPL und FL Verträge\Strehl", "Rückläufer EPL und FL Verträge\Trappen", _
                  "Rückläufer EPL und FL Verträge\Witt", "UBR\Witt", "BÜ-Bot-Mails", "Posteingang\Bearbeitet", _
                  "Gesendete Elemente")
    For k = LBound(namen) To UBound(namen)
        AtOrdner b & namen(k)
    Next k
    namen = Array("Archiv\Auotmatische Antworten", "Nachricht nicht zustellbar (Archiv)", "Archiv\Erinnerung JungDMS", _
                  "Archiv\Erinnerungen Fonds Finanz", "Archiv\Erinnerungen Qualitypool", "Archiv\KV Qualitypool", _
                  "Archiv\BeMaS an KWAD", "Archiv\EBIS / BeMAs\Erledigt", "Archiv\EBIS / BeMAs\Rückfragen", _
                  "Archiv\Archiv zu den Neuzugängen im Postfach\Sonstiges", _
                  "Archiv\Archiv zu den weitergeleiteten Mails an Celonis", _
                  "Archiv\Teil/Gesamt-BÜ nicht an KWAD sondern an Verwaltung", "Archiv\Umleitung - Technische Fehler", _
                  "Archiv\Archiv zu den weitergeleiteten Mails an KWAD", "Posteingang\KI-Vorblatt", "Posteingang\Prio", _
                  "Posteingang\Vorlagen", "Postausgang\Livelink Retrieve", _
                  "Rückläufer FL Verträge (ODPB3D)\BÜ-Bot Mails", "Gesendete Elemente")
    For k = LBound(namen) To UBound(namen)
        AtOrdner m & namen(k)
    Next k
End Sub

' Zellen und Spalten des Blatts Ordner fuer test_umbau.py
Public Function AtLayoutOrdner() As String
    Dim r As Object
    Set r = NamensBereich(N_O_PLAN)
    AtLayoutOrdner = "O_PLAN_ERSTE=" & r.Row & ";O_PLAN_LETZTE=" & (r.Row + r.Rows.Count - 1) & _
                     ";O_STATUS=" & NamensBereich(N_O_STATUS).Address(False, False) & _
                     ";O_PRUEFWERT=" & NamensBereich(N_O_PRUEFWERT).Address(False, False) & _
                     ";O_VORSCHAU_ZEIT=" & NamensBereich(N_O_VORSCHAU_ZEIT).Address(False, False) & _
                     ";O_AUSF_ZEIT=" & NamensBereich(N_O_AUSF_ZEIT).Address(False, False) & _
                     ";OSICH_ERSTE=" & OSICH_ERSTE & ";OSP_NR=" & OSP_NR & ";OSP_AUSF=" & OSP_AUSF & ";OSP_PF=" & OSP_PF & _
                     ";OSP_AKTION=" & OSP_AKTION & ";OSP_HEUTE=" & OSP_HEUTE & ";OSP_NEU=" & OSP_NEU & _
                     ";OSP_VORSCHAU=" & OSP_VORSCHAU & ";OSP_ERGEBNIS=" & OSP_ERGEBNIS & ";OSP_REGELN=" & OSP_REGELN
End Function
