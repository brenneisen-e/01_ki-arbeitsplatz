Option Explicit
' ============================================================================
' modOlSchreiben - die einzige Stelle mit schreibendem Zugriff auf Outlook.
'
' Ablauf je Zielpostfach (gesteuert von modUmbau.AusfuehrenLauf):
'   1. SchrittAusfuehren je Planzeile: Aenderungen nur am Rules-Objekt im Speicher (Name, Ordner, Umleiten,
'      Woerter, Ausnahmen, Reihenfolge, neue Regel). Ordner, die noch fehlen, werden nur vorgemerkt. Jede
'      Aenderung wird im Speicher nachgelesen; eine neue Regel muss dieselben Bedingungen und Ausnahmen wie die
'      Quelle haben, sonst Fehler. Eine neue Regel entsteht ausgeschaltet; fehlt ihr Zielordner noch, bleiben die
'      Verschieben-/Kopieren-Aktion und die Regel selbst bis Schritt 3 aus (Outlook prueft eine Regel beim
'      Einschalten und wirft "Mindestens eine Regel kann aufgrund von ungueltigen Aktionen oder Bedingungen nicht
'      gespeichert werden", wenn eine eingeschaltete Ordner-Aktion keinen Ordner hat - Befund Plan 2.2, Zeile 3).
'   2. ReihenfolgeAngleichen: Reihenfolge im Speicher gegen das Abbild pruefen und notfalls herstellen.
'   3. OrdnerAnlegenUndZuweisen: erst jetzt - nachdem alle Schritte im Speicher fehlerfrei waren - fehlende Ordner
'      anlegen (nicht rueckgaengig zu machen), den vorgemerkten Aktionen zuweisen, die Aktionen einschalten und
'      danach die zurueckgestellten Regeln wie ihre Quelle einschalten. Fehler hier gehoeren zur Planzeile, die
'      die Zuweisung vorgemerkt hat (gFehlerZeile).
'   4. RegelnSpeichern: Rules.Save. Erst danach wirken die Aenderungen.
' Jeder Fehler bricht ab; der Aufrufer speichert dann nicht. Regeln werden nie geloescht.
'
' Ordner-Umstellung (Blatt Ordner, modOrdner): OrdnerNeuAnlegen, OrdnerVerschiebenNach, OrdnerNameSetzen - je genau ein
' Outlook-Zugriff ohne eigene Fehlerbehandlung (Fehler gehen an modOrdner, das sofort stoppt). Geloescht wird nie.
' ============================================================================

Private gPendAnz As Long
Private gPendRegel() As Object
Private gPendArt() As String
Private gPendPfad() As String
' Planzeile (Index k), die die Zuweisung vorgemerkt hat, und ob die Aktion danach einzuschalten ist
Private gPendZeile() As Long
Private gPendEin() As Boolean
' Regeln, die erst nach dem Zuweisen ihres Zielordners eingeschaltet werden (neue Regel, Quelle aktiv)
Private gEinAnz As Long
Private gEinRegel() As Object
Private gEinZeile() As Long
Private gOrdnerListe As String
Public gOrdnerAngelegt As String
' Planzeile (Index k) eines Fehlers in OrdnerAnlegenUndZuweisen; 0 = keiner Zeile zuzuordnen
Public gFehlerZeile As Long
Private Const CBN_LET As Long = 4
' vbObjectError + 513 als Zahl (LibreOffice kennt vbObjectError nicht; in Excel derselbe Wert)
Private Const FEHLER_NR As Long = -2147220991

Public Function SchreibenVersion() As String
    SchreibenVersion = "Schreiben 3.0"
End Function

Public Sub VormerkungenLeeren()
    gPendAnz = 0
    ReDim gPendRegel(0 To 0): ReDim gPendArt(0 To 0): ReDim gPendPfad(0 To 0)
    ReDim gPendZeile(0 To 0): ReDim gPendEin(0 To 0)
    gEinAnz = 0
    ReDim gEinRegel(0 To 0): ReDim gEinZeile(0 To 0)
    gFehlerZeile = 0
    gOrdnerListe = ""
    gOrdnerAngelegt = ""
End Sub

Private Sub OrdnerVormerken(ByVal liste As String)
    Dim teile As Variant, i As Long
    If liste = "" Then Exit Sub
    teile = Split(liste, "|")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            If InStr("|" & gOrdnerListe & "|", "|" & PfadNorm(CStr(teile(i))) & "|") = 0 Then
                gOrdnerListe = Anhaengen(gOrdnerListe, CStr(teile(i)), "|")
            End If
        End If
    Next i
End Sub

' ein = True: die Aktion ist noch aus und wird erst nach dem Zuweisen eingeschaltet (neue Regel)
Private Sub ZuweisungVormerken(ByVal rl As Object, ByVal art As String, ByVal pfad As String, ByVal k As Long, _
                               ByVal ein As Boolean)
    gPendAnz = gPendAnz + 1
    ReDim Preserve gPendRegel(0 To gPendAnz): ReDim Preserve gPendArt(0 To gPendAnz): ReDim Preserve gPendPfad(0 To gPendAnz)
    ReDim Preserve gPendZeile(0 To gPendAnz): ReDim Preserve gPendEin(0 To gPendAnz)
    Set gPendRegel(gPendAnz) = rl
    gPendArt(gPendAnz) = art
    gPendPfad(gPendAnz) = pfad
    gPendZeile(gPendAnz) = k
    gPendEin(gPendAnz) = ein
    OrdnerVormerken pfad
End Sub

Private Sub EinschaltenVormerken(ByVal rl As Object, ByVal k As Long)
    gEinAnz = gEinAnz + 1
    ReDim Preserve gEinRegel(0 To gEinAnz): ReDim Preserve gEinZeile(0 To gEinAnz)
    Set gEinRegel(gEinAnz) = rl
    gEinZeile(gEinAnz) = k
End Sub

Private Sub Fehler(ByVal text As String)
    Err.Raise FEHLER_NR, "Umbau", text
End Sub

' Zielordner einer Verschieben-/Kopieren-Aktion zuweisen. Microsofts Beispiel (Rules.Create, frueh gebunden) setzt
' .Folder ohne Set, also als Wert (PROPERTYPUT). Spaet gebunden erst Set (PROPERTYPUTREF), sonst CallByName mit
' VbLet. Danach Kontrolle, dass der Pfad wirklich uebernommen wurde.
Private Sub OrdnerZuweisen(ByVal act As Object, ByVal f As Object)
    Dim nr As Long, d As String
    On Error Resume Next
    Set act.Folder = f
    If Err.Number <> 0 Then
        Err.Clear
        CallByName act, "Folder", CBN_LET, f
    End If
    nr = Err.Number
    d = Err.Description
    On Error GoTo 0
    If nr <> 0 Then Fehler "Zielordner nicht zuweisbar (" & f.FolderPath & "): " & d
    If PfadNorm(AktOrdnerPfad(act)) <> PfadNorm(f.FolderPath) Then Fehler "Zielordner wurde nicht übernommen: " & f.FolderPath
End Sub

' Verschieben- (art "V") bzw. Kopieren-Aktion ("K") einer Regel
Private Function OrdnerAktion(ByVal rl As Object, ByVal art As String) As Object
    If art = "V" Then
        Set OrdnerAktion = rl.Actions.MoveToFolder
    Else
        Set OrdnerAktion = rl.Actions.CopyToFolder
    End If
End Function

' Zielordner einer Verschieben- (art "V") oder Kopieren-Aktion ("K") setzen bzw. vormerken (k = Planzeile).
' ein = True (neue Regel): die Aktion wird eingeschaltet - sofort, wenn der Ordner schon da ist, sonst erst nach dem
' Zuweisen in OrdnerAnlegenUndZuweisen (eine eingeschaltete Ordner-Aktion ohne Ordner ist fuer Outlook ungueltig).
' Rueckgabe True = Zuweisung vorgemerkt (Ordner fehlt noch).
Private Function OrdnerSetzen(ByVal ziel As Object, ByVal rl As Object, ByVal art As String, ByVal pfad As String, _
                              ByVal k As Long, ByVal ein As Boolean) As Boolean
    Dim f As Object, fehlt As String, problem As String, act As Object
    Set f = OrdnerFinden(ziel, pfad, fehlt, problem)
    If problem <> "" Then Fehler problem & ": " & pfad
    If f Is Nothing Then
        ZuweisungVormerken rl, art, pfad, k, ein
        ProtokollZeile "Ordner fehlt noch, Zuweisung vorgemerkt: " & pfad & _
                       IIf(ein, " (Aktion bleibt bis dahin aus)", "")
        OrdnerSetzen = True
    Else
        Set act = OrdnerAktion(rl, art)
        If ein Then act.Enabled = True
        OrdnerZuweisen act, f
        ProtokollZeile IIf(art = "V", "Verschieben nach ", "Kopieren nach ") & pfad
    End If
End Function

' Empfaenger von q nach z uebertragen und aufloesen. Vorhandene Empfaenger in z bleiben; verglichen wird ueber den
' Schluessel (modOlLesen.EmpfaengerAdresse, fuer Quelle und Ziel gleich), eingetragen wird der erste aufloesbare
' Kandidat (EmpfEingabe: SMTP, PR_SMTP_ADDRESS, Exchange-DN, Name). ohne: W_SEP-Liste von Schluesseln, die nicht
' uebernommen werden (nur AUSNAHMEN_UEBERNEHMEN, Spalte "Nicht auflösbare überspringen", in der Vorschau als nicht
' aufloesbar festgestellt). Fehler: Quell-Empfaenger ohne Adresse, nicht aufloesbar, danach nicht vollstaendig in z.
Private Sub EmpfaengerUebertragen(ByVal q As Object, ByVal z As Object, ByVal ohne As String)
    Dim i As Long, adr As String, vorhanden As String, soll As String, ist As String, fehlt As Long, ein As String
    Dim info As String, rq As Object, ref As String
    vorhanden = EmpfaengerAdressen(z)
    ref = W_SEP & LCase(ohne) & W_SEP
    For i = 1 To q.Count
        Set rq = q.Item(i)
        adr = EmpfaengerAdresse(rq)
        If adr = "" Then Fehler "Empfänger " & i & " der Quelle ohne lesbare Adresse"
        If ohne <> "" And InStr(ref, W_SEP & LCase(adr) & W_SEP) > 0 Then
            ' uebersprungen (Protokoll in AusnahmenUebernehmen)
        Else
            soll = ListeVereinen(soll, adr)
            If Not ListeEnthaelt(vorhanden, adr) Then
                ein = EmpfEingabe(rq, info)
                If ein = "" Then Fehler "Empfänger nicht auflösbar: " & EmpfAnzeige(rq)
                z.Add ein
                WegProtokollieren ein, rq
                vorhanden = Anhaengen(vorhanden, adr)
            End If
        End If
    Next i
    If soll = "" Then Fehler "Quelle ohne übernehmbare Empfänger"
    If Not z.ResolveAll() Then Fehler "Empfänger nicht auflösbar: " & UnaufgeloesteNamen(z)
    ist = EmpfaengerAdressenF(z, fehlt)
    If fehlt > 0 Then Fehler fehlt & " Empfänger nach dem Übernehmen ohne lesbare Adresse"
    If Not ListeEnthaelt(ist, soll) Then Fehler "Empfänger nicht vollständig übernommen: " & ListeFehlend(ist, soll)
End Sub

' Nicht ueber eine SMTP-Adresse eingetragen (Exchange-DN oder Name): Weg im Protokoll festhalten.
Private Sub WegProtokollieren(ByVal ein As String, ByVal rcp As Object)
    If Left(ein, 1) = "/" Then
        ProtokollZeile "Empfänger " & Zitat(KurzName(ein, 80)) & " (Exchange-DN) eingetragen für " & EmpfAnzeige(rcp)
    ElseIf InStr(ein, "@") = 0 Then
        ProtokollZeile "Empfänger " & Zitat(KurzName(ein, 80)) & " (Name) eingetragen für " & EmpfAnzeige(rcp)
    End If
End Sub

Private Function UnaufgeloesteNamen(ByVal z As Object) As String
    Dim i As Long, s As String, ok As Boolean
    On Error Resume Next
    For i = 1 To z.Count
        ok = True
        ok = z.Item(i).Resolved
        If Not ok Then s = Anhaengen(s, z.Item(i).Name)
    Next i
    On Error GoTo 0
    UnaufgeloesteNamen = s
End Function

' Liste der aktiven Bedingungstypen ("|1|20|"), Index-Durchlauf und benannte Eigenschaften.
Private Function AktiveTypen(ByVal conds As Object) As String
    Dim i As Long, n As Long, c As Object, t As Long, s As String, liste As Variant, k As Long, aktiv As Boolean
    s = "|"
    On Error Resume Next
    n = conds.Count
    For i = 1 To n
        Set c = Nothing
        Set c = conds.Item(i)
        aktiv = False
        If Not c Is Nothing Then aktiv = c.Enabled
        If aktiv Then
            t = c.ConditionType
            If InStr(s, "|" & t & "|") = 0 Then s = s & t & "|"
        End If
    Next i
    liste = BedBenannteTypen()
    For k = LBound(liste) To UBound(liste)
        Set c = BedNachTyp(conds, CLng(liste(k)))
        aktiv = False
        If Not c Is Nothing Then aktiv = c.Enabled
        If aktiv Then
            If InStr(s, "|" & liste(k) & "|") = 0 Then s = s & liste(k) & "|"
        End If
    Next k
    On Error GoTo 0
    AktiveTypen = s
End Function

' Werteliste einer Bedingung um die Werte aus soll (W_SEP) ergaenzen, die ihr fehlen. Vorhandene Werte bleiben genau
' so, wie Outlook sie liefert (auch Leerzeichen am Rand, Reihenfolge); neue Werte werden unveraendert angehaengt.
' Verglichen wird ohne Gross-/Kleinschreibung und ohne Leerzeichen am Rand. Danach Kontrolle: vorhandene Werte
' unveraendert an ihrer Stelle, alle neuen Werte da.
Private Sub ListeErgaenzen(ByVal c As Object, ByVal t As Long, ByVal soll As String)
    Dim vorhanden As String, p As String, nm As String, fehl As String, ist As String, alt As Variant, nachher As Variant
    Dim neu() As String, n As Long, n2 As Long, i As Long, teile As Variant, k As Long
    vorhanden = BedWerte(c, t, p, nm)
    If p <> "" Then Fehler BedTypName(t) & ": " & p
    fehl = WFehlendRoh(vorhanden, soll)
    If fehl = "" Then Exit Sub
    alt = RohWerte(BedRoh(c, t), n)
    teile = Split(fehl, W_SEP)
    ReDim neu(0 To n + UBound(teile) - LBound(teile))
    For i = 0 To n - 1
        neu(i) = alt(i)
    Next i
    k = n
    For i = LBound(teile) To UBound(teile)
        neu(k) = teile(i)
        k = k + 1
    Next i
    Select Case t
        Case BED_RECIPADDR, BED_SENDERADDR
            c.Address = neu
        Case BED_CATEGORY
            c.Categories = neu
        Case Else
            c.Text = neu
    End Select
    nachher = RohWerte(BedRoh(c, t), n2)
    If n2 < n Then Fehler BedTypName(t) & ": vorhandene Werte nicht erhalten"
    For i = 0 To n - 1
        If nachher(i) <> alt(i) Then Fehler BedTypName(t) & ": vorhandener Wert verändert (" & Zitat(alt(i)) & ")"
    Next i
    ist = BedWerte(c, t, p, nm)
    If WFehlend(ist, fehl) <> "" Then Fehler BedTypName(t) & ": Werte nicht übernommen (" & WAnzeigen(WFehlend(ist, fehl), 3) & ")"
End Sub

Private Sub BedingungenKopieren(ByVal qc As Object, ByVal zc As Object)
    Dim typen As Variant, i As Long, t As Long, q As Object, z As Object, p As String, nm As String
    typen = Split(AktiveTypen(qc), "|")
    For i = LBound(typen) To UBound(typen)
        If typen(i) <> "" Then
            t = CLng(typen(i))
            If Not BedKopierbar(t) Then Fehler "Bedingung " & BedTypName(t) & " kann das Makro nicht kopieren"
            Set q = BedNachTyp(qc, t)
            Set z = BedNachTyp(zc, t)
            If q Is Nothing Then Fehler "Bedingung " & BedTypName(t) & " der Quellregel nicht lesbar"
            If z Is Nothing Then Fehler "Bedingung " & BedTypName(t) & " der neuen Regel nicht erreichbar"
            Select Case t
                Case BED_FROM, BED_SENTTO
                    EmpfaengerUebertragen q.Recipients, z.Recipients, ""
                Case BED_SUBJECT, BED_BODY, BED_BODYORSUBJECT, BED_HEADER, BED_RECIPADDR, BED_SENDERADDR, BED_CATEGORY
                    ' Werte der Quelle unveraendert (nicht getrimmt) uebernehmen
                    ListeErgaenzen z, t, RohText(BedRoh(q, t))
                Case BED_IMPORTANCE
                    z.Importance = q.Importance
            End Select
            z.Enabled = True
        End If
    Next i
End Sub

' Neue Regel gegen die Quelle pruefen: gleiche aktive Bedingungs- und Ausnahmetypen, gleiche Werte, mindestens
' eine Bedingung. Abweichung = Fehler (kein Speichern).
Private Sub KopieVergleichen(ByVal q As Object, ByVal neu As Object)
    Dim txt As String, typenQ As String, typenZ As String, n As Long, p As String, fremd As String, wq As String, wz As String
    Dim art As Variant, k As Long, cq As Object, cz As Object
    art = Array("Bedingungen", "Ausnahmen")
    For k = 0 To 1
        If k = 0 Then
            Set cq = q.Conditions: Set cz = neu.Conditions
        Else
            Set cq = q.Exceptions: Set cz = neu.Exceptions
        End If
        BedingungenLesen cq, txt, typenQ, n, p, fremd, wq
        If p <> "" Then Fehler art(k) & " der Quellregel nicht lesbar: " & p
        BedingungenLesen cz, txt, typenZ, n, p, fremd, wz
        If p <> "" Then Fehler art(k) & " der neuen Regel nicht lesbar: " & p
        If k = 0 And Trim(typenZ) = "" Then Fehler "Die neue Regel hätte keine Bedingung – nicht gespeichert"
        If TypenSortiert(typenQ) <> TypenSortiert(typenZ) Then
            Fehler art(k) & " der neuen Regel weichen von der Quelle ab (Typen Quelle: " & TypenSortiert(typenQ) & _
                   "; neu: " & TypenSortiert(typenZ) & ")"
        End If
        If WNorm(wq) <> WNorm(wz) Then
            Fehler art(k) & " der neuen Regel weichen von der Quelle ab (Werte)"
        End If
    Next k
End Sub

' Aktionen der Quelle auf die neue Regel uebertragen. Rueckgabe True = mindestens ein Zielordner fehlt noch (die
' Aktion ist dann noch aus, die Regel muss bis nach OrdnerAnlegenUndZuweisen ausgeschaltet bleiben). zeile = Planzeile.
Private Function AktionenKopieren(ByVal ziel As Object, ByVal qa As Object, ByVal neu As Object, ByVal zeile As Long) As Boolean
    Dim schl As Variant, k As Long, q As Object, z As Object, aktiv As Boolean, za As Object
    Set za = neu.Actions
    schl = AktSchluessel()
    For k = LBound(schl) To UBound(schl)
        Set q = AktNachName(qa, CStr(schl(k)))
        aktiv = False
        If Not q Is Nothing Then aktiv = q.Enabled
        If aktiv Then
            Set z = AktNachName(za, CStr(schl(k)))
            If z Is Nothing Then Fehler "Aktion " & AktName(CStr(schl(k))) & " der neuen Regel nicht erreichbar"
            Select Case schl(k)
                Case "MOVE"
                    If OrdnerSetzen(ziel, neu, "V", eVer, zeile, True) Then AktionenKopieren = True
                Case "COPY"
                    If OrdnerSetzen(ziel, neu, "K", eKop, zeile, True) Then AktionenKopieren = True
                Case "FWD", "FWDATT", "REDIR"
                    EmpfaengerUebertragen q.Recipients, z.Recipients, ""
                    z.Enabled = True
                Case "CAT"
                    z.Categories = q.Categories
                    z.Enabled = True
                Case Else
                    z.Enabled = True
            End Select
        End If
    Next k
End Function

' Woerter einer aktiven Bedingung ergaenzen (BEDINGUNG_WORT_ERGAENZEN). Vorhandene Woerter bleiben.
Private Sub WorteErgaenzen(ByVal rl As Object)
    Dim c As Object, aktiv As Boolean
    Set c = BedNachTyp(rl.Conditions, eTyp)
    If c Is Nothing Then Fehler "Bedingung " & BedTypName(eTyp) & " nicht erreichbar"
    aktiv = c.Enabled
    If Not aktiv Then Fehler "Bedingung " & BedTypName(eTyp) & " ist nicht aktiv"
    ListeErgaenzen c, eTyp, eWerte
    ProtokollZeile BedTypName(eTyp) & " ergänzt um " & WAnzeigen(eWerte, 10)
End Sub

' Ausnahmen der Quellregel uebernehmen (AUSNAHMEN_UEBERNEHMEN): fehlende Eintraege ergaenzen, Typen einschalten,
' vorhandene Ausnahmen bleiben. Danach Kontrolle: jede Quell-Ausnahme ist aktiv und enthaelt alle Quellwerte.
Private Sub AusnahmenUebernehmen(ByVal rl As Object)
    Dim qex As Object, zex As Object, txt As String, typenQ As String, typenZ As String, n As Long, p As String
    Dim fremd As String, wq As String, wz As String, typen As Variant, i As Long, t As Long, q As Object, z As Object
    Dim aq As Boolean, az As Boolean, vq As String, vz As String, nm As String
    Set qex = eQuelle.Exceptions
    Set zex = rl.Exceptions
    BedingungenLesen qex, txt, typenQ, n, p, fremd, wq
    If p <> "" Then Fehler "Ausnahmen der Quellregel nicht lesbar: " & p
    If fremd <> "" Then Fehler "Ausnahme nicht übernehmbar: " & fremd
    If Trim(typenQ) = "" Then Fehler "Quellregel hat keine Ausnahmen"
    typen = Split(TypenSortiert(typenQ), ", ")
    For i = LBound(typen) To UBound(typen)
        t = CLng(typen(i))
        ' Typ faellt weg (alle neuen Absender nicht aufloesbar und uebersprungen, im Ziel bisher keine): nicht anfassen
        If InStr(eOhneTypen, "|" & t & "|") = 0 Then
            Set q = BedNachTyp(qex, t)
            Set z = BedNachTyp(zex, t)
            If q Is Nothing Or z Is Nothing Then Fehler "Ausnahme " & BedTypName(t) & " nicht erreichbar"
            Select Case t
                Case BED_FROM, BED_SENTTO
                    EmpfaengerUebertragen q.Recipients, z.Recipients, eOhneSchl
                Case BED_SUBJECT, BED_BODY, BED_BODYORSUBJECT, BED_HEADER, BED_RECIPADDR, BED_SENDERADDR, BED_CATEGORY
                    ' Werte der Quelle unveraendert (nicht getrimmt) ergaenzen, vorhandene bleiben
                    ListeErgaenzen z, t, RohText(BedRoh(q, t))
                Case BED_IMPORTANCE
                    If Not z.Enabled Then z.Importance = q.Importance
            End Select
            If Not z.Enabled Then z.Enabled = True
        End If
    Next i
    BedingungenLesen zex, txt, typenZ, n, p, fremd, wz
    If p <> "" Then Fehler "Ausnahmen der Regel nach dem Ändern nicht lesbar: " & p
    For i = LBound(typen) To UBound(typen)
        t = CLng(typen(i))
        If InStr(eOhneTypen, "|" & t & "|") = 0 Then
            If Not TypenEnthalten(typenZ, t) Then Fehler "Ausnahme " & BedTypName(t) & " nicht eingeschaltet"
            WRec wq, t, aq, vq
            WRec wz, t, az, vz
            ' uebersprungene (nicht aufloesbare) Absender fehlen erwartungsgemaess
            If t = BED_FROM Or t = BED_SENTTO Then vq = WFehlend(eOhneSchl, vq)
            If WFehlend(vz, vq) <> "" Then Fehler "Ausnahme " & BedTypName(t) & ": Einträge fehlen (" & WAnzeigen(WFehlend(vz, vq), 3) & ")"
        ElseIf TypenEnthalten(typenZ, t) Then
            Fehler "Ausnahme " & BedTypName(t) & " sollte ausgeschaltet bleiben"
        End If
    Next i
    If eOhneNamen <> "" Then
        ProtokollZeile "Nicht übernommen (nicht auflösbar, Spalte " & SpalteUeberspringen() & "): " & eOhneNamen & _
                       IIf(eOhneTypen <> "", " – Ausnahme ohne übernehmbare Absender bleibt aus (wie bisher)", "")
    End If
    ProtokollZeile "Ausnahmen übernommen aus " & Zitat(eQuelle.Name) & ": " & typenQ
End Sub

' Regel auf die Position der Entscheidung setzen (auf Grundlage der aktuellen Werte im Speicher).
Private Sub PositionSetzen(ByVal id As Long)
    Dim x As Long, a As Long, p As Long
    x = mObj(id).ExecutionOrder
    If eAnker > 0 Then
        a = mObj(eAnker).ExecutionOrder
        If eNach Then
            If x > a Then p = a + 1 Else p = a
        Else
            If x < a Then p = a - 1 Else p = a
        End If
    Else
        p = ePlatzNr
    End If
    If p < 1 Then p = 1
    mObj(id).ExecutionOrder = p
    ProtokollZeile "Reihenfolge: Platz " & p
End Sub

' Fuehrt die Entscheidung des eben bewerteten Schritts (modPlan.SchrittPruefen) in Outlook aus - nur im Speicher.
' Rueckgabe: "" oder Fehlertext.
Public Function SchrittAusfuehren(ByVal k As Long, ByVal regeln As Object, ByVal ziel As Object) As String
    Dim rl As Object, neu As Object, n As Long, offen As Boolean, soll As Boolean
    On Error GoTo Fehlerfall
    Select Case eFall
        Case "ORDNER"
            OrdnerVormerken eNeueOrdner
            ProtokollZeile "Ordner vorgemerkt (wird vor dem Speichern angelegt): " & eNeueOrdner
        Case "ZIEL"
            Set rl = mObj(eId)
            If eVerSetzen Then OrdnerSetzen ziel, rl, "V", eVer, k, False
            If eKopSetzen Then OrdnerSetzen ziel, rl, "K", eKop, k, False
        Case "NAME"
            mObj(eId).Name = eName
            If mObj(eId).Name <> eName Then Fehler "Name wurde nicht übernommen"
            ProtokollZeile "Umbenannt in " & Zitat(eName)
        Case "UMLEIT"
            Set rl = mObj(eId)
            EmpfaengerUmleiten rl
            ProtokollZeile "Umleiten an " & mWeiNamen(eId) & " eingeschaltet, Weiterleiten ausgeschaltet"
        Case "POS"
            PositionSetzen eId
        Case "WORT"
            WorteErgaenzen mObj(eId)
        Case "AUSN"
            AusnahmenUebernehmen mObj(eId)
        Case "KOP_A", "KOP_B"
            Set rl = mObj(eId)
            If eFall = "KOP_B" Then
                rl.Name = eName
                ProtokollZeile "Kopie aus Outlook umbenannt in " & Zitat(eName)
            End If
            If eVerSetzen Then OrdnerSetzen ziel, rl, "V", eVer, k, False
            If eKopSetzen Then OrdnerSetzen ziel, rl, "K", eKop, k, False
            If ePos Then PositionSetzen eId
        Case "KOP_C"
            Set neu = regeln.Create(eName, 0)
            Set mObj(eId) = neu
            ' Outlook legt die Regel eingeschaltet an; bis alles uebertragen ist, bleibt sie aus (Ausschalten prueft nichts)
            neu.Enabled = False
            ProtokollZeile "Regel " & Zitat(eName) & " angelegt (vorerst ausgeschaltet)"
            BedingungenKopieren eQuelle.Conditions, neu.Conditions
            BedingungenKopieren eQuelle.Exceptions, neu.Exceptions
            KopieVergleichen eQuelle, neu
            ProtokollZeile "Bedingungen und Ausnahmen gleich der Quelle (geprüft)"
            offen = AktionenKopieren(ziel, eQuelle.Actions, neu, k)
            soll = eQuelle.Enabled
            If soll And offen Then
                ' Einschalten erst nach dem Anlegen und Zuweisen des Zielordners (OrdnerAnlegenUndZuweisen)
                EinschaltenVormerken neu, k
                ProtokollZeile "Regel bleibt ausgeschaltet, bis der Zielordner angelegt und zugewiesen ist; danach " & _
                               "wird sie eingeschaltet (wie die Quelle)"
            ElseIf soll Then
                neu.Enabled = True
                If Not neu.Enabled Then Fehler "Regel ließ sich nicht einschalten"
            End If
            n = regeln.Count
            neu.ExecutionOrder = n
            If ePos Then PositionSetzen eId
        Case "AUS"
            mObj(eId).Enabled = False
            ProtokollZeile "Deaktiviert"
        Case Else
            Fehler "Unbekannte Entscheidung " & eFall
    End Select
    Exit Function
Fehlerfall:
    SchrittAusfuehren = "Fehler: " & Err.Description
End Function

' Umleiten einschalten (mit den Empfaengern der Weiterleitung), Weiterleiten aus. Eingetragen wird je Empfaenger der
' erste aufloesbare Kandidat (EmpfEingabe), verglichen ueber den Schluessel. Danach Kontrolle, dass die Umleitung
' genau an die Weiterleitungsempfaenger geht.
Private Sub EmpfaengerUmleiten(ByVal rl As Object)
    Dim rd As Object, fw As Object, i As Long, vorhanden As String, ist As String, fehlt As Long, soll As String
    Dim adr As String, ein As String, info As String
    Set rd = rl.Actions.Redirect
    Set fw = rl.Actions.Forward.Recipients
    vorhanden = EmpfaengerAdressen(rd.Recipients)
    soll = EmpfaengerAdressenF(fw, fehlt)
    If fehlt > 0 Or soll = "" Then Fehler "Empfänger der Weiterleitung nicht lesbar"
    If Not ListeEnthaelt(soll, vorhanden) Then Fehler "„Umleiten an“ enthält andere Empfänger: " & ListeFehlend(soll, vorhanden)
    For i = 1 To fw.Count
        adr = EmpfaengerAdresse(fw.Item(i))
        If Not ListeEnthaelt(vorhanden, adr) Then
            ein = EmpfEingabe(fw.Item(i), info)
            If ein = "" Then Fehler "Empfänger nicht auflösbar: " & EmpfAnzeige(fw.Item(i))
            rd.Recipients.Add ein
            WegProtokollieren ein, fw.Item(i)
            vorhanden = Anhaengen(vorhanden, adr)
        End If
    Next i
    If Not rd.Recipients.ResolveAll() Then Fehler "Empfänger nicht auflösbar: " & UnaufgeloesteNamen(rd.Recipients)
    ist = EmpfaengerAdressenF(rd.Recipients, fehlt)
    If fehlt > 0 Or Not GleicheListe(ist, soll) Then Fehler "Umleiten-Empfänger weichen ab (soll: " & soll & "; ist: " & ist & ")"
    rd.Enabled = True
    rl.Actions.Forward.Enabled = False
End Sub

' Reihenfolge der Regeln im Speicher (nach ExecutionOrder) als ID-Liste "|3|1|2|"; gleiche Werte = "".
Private Function IstReihenfolge() As String
    Dim i As Long, j As Long, wert() As Long, ids() As Long, t As Long, s As String
    ReDim wert(1 To mAnz): ReDim ids(1 To mAnz)
    For i = 1 To mAnz
        wert(i) = mObj(i).ExecutionOrder
        ids(i) = i
    Next i
    For i = 2 To mAnz
        t = ids(i)
        j = i - 1
        Do While j >= 1
            If wert(ids(j)) <= wert(t) Then Exit Do
            ids(j + 1) = ids(j)
            j = j - 1
        Loop
        ids(j + 1) = t
    Next i
    s = "|"
    For i = 1 To mAnz
        If i > 1 Then
            If wert(ids(i)) = wert(ids(i - 1)) Then
                IstReihenfolge = ""
                Exit Function
            End If
        End If
        s = s & ids(i) & "|"
    Next i
    IstReihenfolge = s
End Function

Private Function SollReihenfolge() As String
    Dim i As Long, s As String
    s = "|"
    For i = 1 To mAnz
        s = s & mOrd(i) & "|"
    Next i
    SollReihenfolge = s
End Function

' Reihenfolge im Speicher = Abbild? Sonst Platz fuer Platz herstellen (wirkt bei jeder Art, wie Outlook
' ExecutionOrder umnummeriert) und erneut pruefen. Rueckgabe "" oder Fehlertext.
Public Function ReihenfolgeAngleichen() As String
    Dim i As Long, id As Long, n As Long
    On Error GoTo Fehlerfall
    If IstReihenfolge() = SollReihenfolge() Then Exit Function
    For i = 1 To mAnz
        id = mOrd(i)
        If mObj(id).ExecutionOrder <> i Then
            mObj(id).ExecutionOrder = i
            n = n + 1
        End If
    Next i
    ProtokollZeile "Reihenfolge im Speicher angeglichen (" & n & " Werte gesetzt)"
    If IstReihenfolge() <> SollReihenfolge() Then
        ReihenfolgeAngleichen = "Reihenfolge lässt sich im Speicher nicht herstellen"
    End If
    Exit Function
Fehlerfall:
    ReihenfolgeAngleichen = "Fehler beim Ordnen: " & Err.Description
End Function

' Fehlende Ordner anlegen (je Pfadteil Folders.Add), vorgemerkte Zuweisungen ausfuehren, die vorgemerkten Aktionen
' einschalten und danach die zurueckgestellten Regeln einschalten - alles vor Rules.Save. Ein Fehler beim Zuweisen
' oder Einschalten gehoert zur Planzeile, die es vorgemerkt hat (gFehlerZeile, Protokoll mit dieser Zeile).
Public Function OrdnerAnlegenUndZuweisen(ByVal ziel As Object) As String
    Dim teile As Variant, i As Long, f As Object, fehlt As String, problem As String, act As Object, was As String
    Dim pk As Long
    On Error GoTo Fehlerfall
    gFehlerZeile = 0
    pk = gProtK
    was = "Fehler beim Anlegen/Zuweisen der Ordner: "
    If gOrdnerListe <> "" Then
        teile = Split(gOrdnerListe, "|")
        For i = LBound(teile) To UBound(teile)
            If teile(i) <> "" Then OrdnerErzeugen ziel, CStr(teile(i))
        Next i
    End If
    For i = 1 To gPendAnz
        gFehlerZeile = gPendZeile(i)
        gProtK = gPendZeile(i)
        was = "Fehler beim Zuweisen des Zielordners " & gPendPfad(i) & ": "
        Set f = OrdnerFinden(ziel, gPendPfad(i), fehlt, problem)
        If f Is Nothing Then Fehler "Ordner nach dem Anlegen nicht gefunden: " & gPendPfad(i)
        Set act = OrdnerAktion(gPendRegel(i), gPendArt(i))
        OrdnerZuweisen act, f
        If gPendEin(i) Then
            was = "Fehler beim Einschalten der Aktion „" & IIf(gPendArt(i) = "V", "In Ordner verschieben", _
                  "In Ordner kopieren") & "“ (" & gPendPfad(i) & "): "
            act.Enabled = True
            If Not act.Enabled Then Fehler "Aktion ließ sich nicht einschalten"
            ProtokollZeile "Zielordner zugewiesen und Aktion eingeschaltet: " & gPendPfad(i)
        Else
            ProtokollZeile "Zielordner zugewiesen: " & gPendPfad(i)
        End If
    Next i
    For i = 1 To gEinAnz
        gFehlerZeile = gEinZeile(i)
        gProtK = gEinZeile(i)
        was = "Fehler beim Einschalten der Regel " & Zitat(gEinRegel(i).Name) & " nach dem Zuweisen des Zielordners: "
        gEinRegel(i).Enabled = True
        If Not gEinRegel(i).Enabled Then Fehler "Regel ließ sich nicht einschalten"
        ProtokollZeile "Regel " & Zitat(gEinRegel(i).Name) & " eingeschaltet (wie die Quelle)"
    Next i
    gFehlerZeile = 0
    gProtK = pk
    Exit Function
Fehlerfall:
    gProtK = pk
    OrdnerAnlegenUndZuweisen = was & Err.Description
End Function

Private Sub OrdnerErzeugen(ByVal ziel As Object, ByVal pfad As String)
    Dim rest As String, teile As Variant, k As Long, f As Object, kind As Object, bisher As String, gefunden As Boolean
    Dim fehlt As String, problem As String
    ' Pfad vorher pruefen (Postfach, leere Teile) - ohne gueltigen Pfad wird nichts angelegt
    OrdnerFinden ziel, pfad, fehlt, problem
    If problem <> "" Then Fehler problem & ": " & pfad
    rest = Mid(Trim(pfad), 3)
    Do While Right(rest, 1) = "\"
        rest = Left(rest, Len(rest) - 1)
    Loop
    teile = Split(rest, "\")
    Set f = ziel.GetRootFolder()
    bisher = "\\" & teile(0)
    For k = 1 To UBound(teile)
        bisher = bisher & "\" & teile(k)
        Set kind = Nothing
        gefunden = False
        On Error Resume Next
        Set kind = f.Folders.Item(OrdnerTeil(CStr(teile(k))))
        gefunden = (Err.Number = 0)
        On Error GoTo 0
        If gefunden Then gefunden = Not (kind Is Nothing)
        If Not gefunden Then
            Set kind = f.Folders.Add(OrdnerTeil(CStr(teile(k))))
            gOrdnerAngelegt = Anhaengen(gOrdnerAngelegt, bisher)
            ProtokollZeile "Ordner angelegt: " & bisher
        End If
        Set f = kind
    Next k
End Sub

Public Function RegelnSpeichern(ByVal regeln As Object) As String
    On Error GoTo Fehlerfall
    regeln.Save False
    ProtokollZeile "Regeln gespeichert (Rules.Save)"
    Exit Function
Fehlerfall:
    RegelnSpeichern = "Speichern fehlgeschlagen: " & Err.Description
End Function

' Nach einer Abweichung: Regeln (IDs "|3|7|" im frisch gelesenen Abbild) deaktivieren und speichern.
Public Function RegelnDeaktivierenUndSpeichern(ByVal regeln As Object, ByVal ids As String) As String
    Dim teile As Variant, i As Long
    On Error GoTo Fehlerfall
    teile = Split(ids, "|")
    For i = LBound(teile) To UBound(teile)
        If teile(i) <> "" Then
            mObj(CLng(teile(i))).Enabled = False
            ProtokollZeile "Deaktiviert wegen Abweichung nach dem Speichern: " & Zitat(mName(CLng(teile(i))))
        End If
    Next i
    regeln.Save False
    ProtokollZeile "Regeln gespeichert (Rules.Save, Deaktivierung)"
    Exit Function
Fehlerfall:
    RegelnDeaktivierenUndSpeichern = "Deaktivieren fehlgeschlagen: " & Err.Description
End Function

' ---------------------------------------------------------------- Ordner-Umstellung (modOrdner)

' Unterordner anlegen (Folders.Add). Fehler gehen an den Aufrufer.
Public Function OrdnerNeuAnlegen(ByVal eltern As Object, ByVal ordnerName As String) As Object
    Set OrdnerNeuAnlegen = eltern.Folders.Add(ordnerName)
End Function

' Ordner samt Unterordnern und Inhalt in einen anderen Ordner desselben Postfachs verschieben (Folder.MoveTo).
Public Sub OrdnerVerschiebenNach(ByVal f As Object, ByVal ziel As Object)
    f.MoveTo ziel
End Sub

' Ordner umbenennen (Folder.Name).
Public Sub OrdnerNameSetzen(ByVal f As Object, ByVal neuerName As String)
    f.Name = neuerName
End Sub
