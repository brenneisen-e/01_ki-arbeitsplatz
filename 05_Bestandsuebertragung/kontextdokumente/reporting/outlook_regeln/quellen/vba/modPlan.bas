Option Explicit
' ============================================================================
' modPlan - Plan aus dem Blatt "Umsetzung" lesen und Schritt fuer Schritt auf dem Abbild (modModell) durchspielen.
'
' Zellen werden ueber Namen gelesen (UM_ZIEL, UM_PLAN, ...). Vor jedem Lauf prueft LayoutPruefen die
' Beschriftungen und die Kopfzeile des Plans; passt etwas nicht (Zeile/Spalte geloescht), laeuft nichts.
'
' SchrittPruefen bewertet eine Planzeile gegen das Abbild: "schon erledigt", "bereit ..." oder "blockiert: ...".
' Mit anwenden = True wird der Schritt im Abbild nachgezogen, damit spaetere Zeilen (z. B. Position nach einer
' kopierten Regel) den Stand nach den frueheren Zeilen sehen. Was genau zu tun ist, steht danach in den
' e-Variablen (Entscheidung); modOlSchreiben fuehrt genau diese Entscheidung in Outlook aus.
' Dieselbe Bewertung dient nach dem Speichern als Nachpruefung: erledigt heisst, die Zeile wuerde jetzt
' "schon erledigt" melden (zusaetzlich vergleicht modUmbau jede Regel mit dem erwarteten Abbild).
' Kein Zugriff auf Outlook ausser ueber die lesenden Funktionen aus modOlLesen.
'
' Ordner-Umstellung (Blatt Ordner, Plan 3.0): Nennt eine Zeile in Spalte I/J einen Ordner, den das Blatt Ordner
' verschoben bzw. umbenannt hat (alter Pfad weg, neuer da), gilt der neue Pfad (modOrdner.UmzugPfad); die Vorschauzeile
' sagt das ("· Ordner laut Blatt Ordner umgezogen: ..."). Sonst legte die Vorschau den alten Ordner neu an.
' ============================================================================

Public pAnz As Long
Public pZeile() As Long
Public pNr() As String
Public pAusf() As Boolean
Public pAktion() As String
Public pRegel() As String
Public pNeu() As String
Public pVer() As String
Public pKop() As String
Public pQuelle() As String
' Spalte "Überspringen: nicht auflösbare Absender" (nur AUSNAHMEN_UEBERNEHMEN) und die dabei uebersprungenen Namen
Public pUeber() As String
Public pOhneNamen() As String
Public pStatus() As String
Public pErgebnis() As String
Public pSpeichern() As Boolean
Public pKurz() As String
Public pFall() As String
' Schritt aendert eine Regel ohne sichtbare Bedingung (Vorschauzeile endet auf HINWEIS_OHNE)
Public pOhne() As Boolean
' Anzahl der Regeln, die eine LOESCHEN-Zeile loescht (fuer die Rueckfrage)
Public pWegAnz() As Long
Public Const HINWEIS_OHNE As String = " · Regel ohne sichtbare Bedingung"

Public gZielAdr As String
Public gQuellAdr As String
Public gTrotz As Boolean
Public gQuellRegeln As Object
Public gQuellFehler As String
Public gNichtLesbar As Long
Public gNamenNichtLesbar As String
Public gOhneBed As Long
Public gNamenOhneBed As String
' Regeln ohne sichtbare Bedingung, die vor aktiven Regeln stehen (modModell.AbfangDahinter): Stand nach dem Plan
' (Vorschau) bzw. Stand in Outlook (Lesen, Nachpruefung); ...Vorher: Stand in Outlook vor dem Plan
Public gAbfang As Long
Public gNamenAbfang As String
Public gAbfangVorher As Long
Public gNamenAbfangVorher As String
Public gAnzGelesen As Long
Public gRegelId As Long

' Entscheidung des zuletzt bewerteten Schritts
Public eFall As String
Public eId As Long
Public eName As String
Public eVer As String
Public eKop As String
Public eVerSetzen As Boolean
Public eKopSetzen As Boolean
Public eEmpf As String
Public ePos As Boolean
Public eAnker As Long
Public eNach As Boolean
Public ePlatzNr As Long
Public eQuelle As Object
Public eNeueOrdner As String
Public eKurz As String
Public eTyp As Long
Public eWerte As String
' AUSNAHMEN_UEBERNEHMEN: nicht aufloesbare Absender, die laut Spalte "Überspringen" nicht uebernommen werden
' (Schluessel als W_SEP-Liste, Namen als Anzeige)
Public eOhneSchl As String
Public eOhneNamen As String
' Ausnahmetypen ("|1|"), die ganz wegfallen: alle neuen Absender uebersprungen, im Ziel bisher keine (bleibt aus)
Public eOhneTypen As String
' LOESCHEN: Anzahl der Regeln, die die Zeile loescht; bei "Duplikate" ihre IDs ("|7|8|", sonst "" - dann gilt eId)
Public eWegAnz As Long
Public eWegIds As String
' Hinweis der Ordner-Umstellung zum zuletzt bewerteten Schritt (Pfad in Spalte I/J laut Blatt Ordner umgezogen)
Public gUmzugHinweis As String

' Bezuege "Name #n/m" (gleichnamige Regeln) eines Laufs: Text -> ID im Abbild und erwarteter Platz nach dem Plan
' (0 = laut Plan geloescht). Die Nachpruefung liest Outlook neu; dort gibt es womoeglich nicht mehr m Regeln dieses
' Namens (eine wurde geloescht oder umbenannt), "#n/m" liesse sich dann nicht mehr zuordnen. Sie loest die Bezuege
' des Laufs deshalb ueber den erwarteten Platz auf (gBzNach = True, gesetzt und zurueckgesetzt in modUmbau.Nachpruefen).
Public gBzAnz As Long
Public gBzText() As String
Public gBzId() As Long
Public gBzPlatz() As Long
Public gBzNach As Boolean

Private gPosText As String
Private gAktK As Long

Public Function PlanVersion() As String
    PlanVersion = "Plan 3.1"
End Function

Public Function ZellText(ByVal ws As Object, ByVal r As Long, ByVal c As Long) As String
    Dim v As Variant, s As String
    On Error Resume Next
    v = ws.Cells(r, c).Value
    s = CStr(v)
    If Err.Number <> 0 Then s = ""
    On Error GoTo 0
    ZellText = Trim(s)
End Function

' ---------------------------------------------------------------- Namen und Layout

' Bereich eines Namens (Nothing, wenn der Name fehlt oder ungueltig ist).
Public Function NamensBereich(ByVal nm As String) As Object
    Dim r As Object
    On Error Resume Next
    Set r = ThisWorkbook.Names(nm).RefersToRange
    If Err.Number <> 0 Then Set r = Nothing
    On Error GoTo 0
    Set NamensBereich = r
End Function

Public Function NamensText(ByVal nm As String) As String
    Dim r As Object, s As String
    Set r = NamensBereich(nm)
    If r Is Nothing Then Exit Function
    On Error Resume Next
    s = CStr(r.Cells(1, 1).Value)
    On Error GoTo 0
    NamensText = Trim(s)
End Function

Public Sub NamensWert(ByVal nm As String, ByVal wert As String)
    Dim r As Object
    Set r = NamensBereich(nm)
    If r Is Nothing Then Exit Sub
    On Error Resume Next
    r.Cells(1, 1).Value = wert
    On Error GoTo 0
End Sub

Public Function PlanErste() As Long
    Dim r As Object
    Set r = NamensBereich(N_PLAN)
    If Not r Is Nothing Then PlanErste = r.Row
End Function

Public Function PlanLetzte() As Long
    Dim r As Object
    Set r = NamensBereich(N_PLAN)
    If Not r Is Nothing Then PlanLetzte = r.Row + r.Rows.Count - 1
End Function

Private Function SpaltenBuchstabe(ByVal c As Long) As String
    SpaltenBuchstabe = Mid("ABCDEFGHIJKLMNOPQRSTUVWXYZ", c, 1)
End Function

' Buchstabe der Spalte "Überspringen: nicht auflösbare Absender" (fuer Meldungen)
Public Function SpalteUeberspringen() As String
    SpalteUeberspringen = SpaltenBuchstabe(SP_UEBERSPR)
End Function

' Prueft, dass die Namen da sind und Beschriftungen bzw. Kopfzeile noch dort stehen, wo das Makro sie erwartet.
' Rueckgabe "" oder Beschreibung, was nicht passt.
Public Function LayoutPruefen() As String
    Dim ws As Object, r As Object, s As String, kopf As Object, plan As Object, k As Long, nm As Variant, lb As Variant
    Dim spalten As Variant, texte As Variant, ist As String
    Set ws = ThisWorkbook.Worksheets(BLATT_UMSETZUNG)
    nm = Array(N_ZIEL, N_QUELLE, N_TROTZ)
    lb = Array(LABEL_ZIEL, LABEL_QUELLE, LABEL_TROTZ)
    For k = LBound(nm) To UBound(nm)
        Set r = NamensBereich(CStr(nm(k)))
        If r Is Nothing Then
            s = Anhaengen(s, "Name " & nm(k) & " fehlt")
        Else
            ist = ZellText(ws, r.Row, SP_NR)
            If ist <> lb(k) Then s = Anhaengen(s, "Zeile " & r.Row & ": erwartet " & Zitat(CStr(lb(k))) & ", steht " & Zitat(ist))
        End If
    Next k
    nm = Array(N_STATUS, N_VORSCHAU_ZEIT, N_PRUEFWERT, N_AUSF_ZEIT, N_LIVE_ZEIT)
    For k = LBound(nm) To UBound(nm)
        If NamensBereich(CStr(nm(k))) Is Nothing Then s = Anhaengen(s, "Name " & nm(k) & " fehlt")
    Next k
    Set kopf = NamensBereich(N_PLANKOPF)
    Set plan = NamensBereich(N_PLAN)
    If kopf Is Nothing Or plan Is Nothing Then
        s = Anhaengen(s, "Plan-Bereich (Namen " & N_PLANKOPF & "/" & N_PLAN & ") fehlt")
    Else
        If plan.Row <> kopf.Row + 1 Then s = Anhaengen(s, "Plan beginnt nicht direkt unter seiner Kopfzeile")
        If plan.Column <> SP_NR Or kopf.Column <> SP_NR Then s = Anhaengen(s, "Plan beginnt nicht in Spalte " & SpaltenBuchstabe(SP_NR))
        spalten = Array(SP_NR, SP_AUSF, SP_AKTION, SP_REGEL, SP_NEU, SP_VORSCHAU, SP_ERGEBNIS, SP_VER, SP_KOP, SP_QUELLE, _
                        SP_UEBERSPR, SP_WARUM)
        texte = Array(KOPF_NR, KOPF_AUSF, KOPF_AKTION, KOPF_REGEL, KOPF_NEU, KOPF_VORSCHAU, KOPF_ERGEBNIS, KOPF_VER, _
                      KOPF_KOP, KOPF_QUELLE, KOPF_UEBERSPR, KOPF_WARUM)
        For k = LBound(spalten) To UBound(spalten)
            ist = ZellText(ws, kopf.Row, CLng(spalten(k)))
            If ist <> texte(k) Then
                s = Anhaengen(s, "Spalte " & SpaltenBuchstabe(CLng(spalten(k))) & " der Kopfzeile: erwartet " & _
                                 Zitat(CStr(texte(k))) & ", steht " & Zitat(ist))
            End If
        Next k
    End If
    If s <> "" Then
        s = "Das Blatt Umsetzung wurde umgebaut (" & s & "). Bitte die Änderung rückgängig machen oder die Mappe " & _
            "neu erzeugen – das Makro liest sonst womöglich falsche Zellen."
    End If
    LayoutPruefen = s
End Function

' Plan und Einstellungen lesen. Rueckgabe "" oder Fehler (Layout passt nicht).
Public Function PlanLesen() As String
    Dim ws As Object, r As Long, n As Long, akt As String, f As String, erste As Long, letzte As Long
    pAnz = 0
    f = LayoutPruefen()
    If f <> "" Then
        PlanLesen = f
        Exit Function
    End If
    Set ws = ThisWorkbook.Worksheets(BLATT_UMSETZUNG)
    gZielAdr = NamensText(N_ZIEL)
    gQuellAdr = NamensText(N_QUELLE)
    gTrotz = (LCase(NamensText(N_TROTZ)) = "ja")
    erste = PlanErste()
    letzte = PlanLetzte()
    n = letzte - erste + 1
    ReDim pZeile(0 To n): ReDim pNr(0 To n): ReDim pAusf(0 To n): ReDim pAktion(0 To n): ReDim pRegel(0 To n)
    ReDim pNeu(0 To n): ReDim pVer(0 To n): ReDim pKop(0 To n): ReDim pQuelle(0 To n): ReDim pStatus(0 To n)
    ReDim pUeber(0 To n): ReDim pOhneNamen(0 To n)
    ReDim pErgebnis(0 To n): ReDim pSpeichern(0 To n): ReDim pKurz(0 To n): ReDim pFall(0 To n): ReDim pOhne(0 To n)
    ReDim pWegAnz(0 To n)
    For r = erste To letzte
        akt = UCase(ZellText(ws, r, SP_AKTION))
        If akt <> "" Then
            pAnz = pAnz + 1
            pZeile(pAnz) = r
            pNr(pAnz) = ZellText(ws, r, SP_NR)
            If pNr(pAnz) = "" Then pNr(pAnz) = CStr(r - erste + 1)
            pAusf(pAnz) = (LCase(ZellText(ws, r, SP_AUSF)) = "ja")
            pAktion(pAnz) = akt
            pRegel(pAnz) = ZellText(ws, r, SP_REGEL)
            pNeu(pAnz) = ZellText(ws, r, SP_NEU)
            pVer(pAnz) = ZellText(ws, r, SP_VER)
            pKop(pAnz) = ZellText(ws, r, SP_KOP)
            pQuelle(pAnz) = ZellText(ws, r, SP_QUELLE)
            pUeber(pAnz) = ZellText(ws, r, SP_UEBERSPR)
        End If
    Next r
End Function

Private Sub EntscheidungLeeren()
    eFall = "": eId = 0: eName = "": eVer = "": eKop = "": eVerSetzen = False: eKopSetzen = False
    eEmpf = "": ePos = False: eAnker = 0: eNach = False: ePlatzNr = 0: eNeueOrdner = "": eKurz = ""
    eTyp = 0: eWerte = "": eOhneSchl = "": eOhneNamen = "": eOhneTypen = ""
    eWegAnz = 0: eWegIds = ""
    Set eQuelle = Nothing
    gPosText = ""
    gRegelId = 0
End Sub

' Pfad ohne \\postfach\ (fuer kurze Meldungen)
Public Function RelPfad(ByVal pfad As String) As String
    Dim p As Long
    If Left(pfad, 2) = "\\" Then
        p = InStr(3, pfad, "\")
        If p > 0 Then
            RelPfad = Mid(pfad, p + 1)
            Exit Function
        End If
    End If
    RelPfad = pfad
End Function

Private Function OrdnerHinweis(ByVal liste As String) As String
    Dim teile As Variant, i As Long, s As String
    If liste = "" Then Exit Function
    teile = Split(liste, "|")
    For i = LBound(teile) To UBound(teile)
        If teile(i) <> "" Then s = Anhaengen(s, RelPfad(CStr(teile(i))), ", ")
    Next i
    If s <> "" Then OrdnerHinweis = " · Ordner wird angelegt: " & s
End Function

' Zielordner pruefen: Pfad im Zielpostfach? Fehlt er (und wird im Lauf nicht schon angelegt), steht er in neu.
Private Function ZielOrdnerPruefen(ByVal ziel As Object, ByVal pfad As String, ByRef neu As String) As String
    Dim f As Object, fehlt As String, problem As String
    neu = ""
    Set f = OrdnerFinden(ziel, pfad, fehlt, problem)
    If problem <> "" Then
        ZielOrdnerPruefen = problem & ": " & pfad
        Exit Function
    End If
    If f Is Nothing Then
        If Not OrdnerGemerkt(pfad) Then neu = Trim(pfad)
    End If
End Function

Public Sub BezuegeLeeren()
    gBzAnz = 0
    gBzNach = False
    ReDim gBzText(0 To 0): ReDim gBzId(0 To 0): ReDim gBzPlatz(0 To 0)
End Sub

Private Function BezugIndex(ByVal bezug As String) As Long
    Dim i As Long
    For i = 1 To gBzAnz
        If gBzText(i) = LCase(Trim(bezug)) Then
            BezugIndex = i
            Exit Function
        End If
    Next i
End Function

Private Sub BezugMerken(ByVal bezug As String, ByVal id As Long)
    If BezugIndex(bezug) > 0 Then Exit Sub
    gBzAnz = gBzAnz + 1
    ReDim Preserve gBzText(0 To gBzAnz): ReDim Preserve gBzId(0 To gBzAnz): ReDim Preserve gBzPlatz(0 To gBzAnz)
    gBzText(gBzAnz) = LCase(Trim(bezug))
    gBzId(gBzAnz) = id
End Sub

' Erwartete Plaetze der gemerkten Bezuege nach allen Schritten (0 = laut Plan geloescht); fuer die Nachpruefung.
Public Sub BezuegePlaetze()
    Dim i As Long
    For i = 1 To gBzAnz
        gBzPlatz(i) = Platz(gBzId(i))
    Next i
End Sub

' Regel zu einem Bezug aus dem Plan: der Name, bei gleichnamigen Regeln "Name #n/m" (die n-te von m, Reihenfolge wie
' beim Lesen; modModell.SucheVorkommen). Der ganze Text zaehlt zuerst als Regelname.
' Rueckgabe: ID, 0 = keine, -1 = Name mehrfach vergeben, -2 = laut Plan geloescht.
Public Function RegelBezug(ByVal bezug As String) As Long
    Dim id As Long, id2 As Long, i As Long, k As Long
    If gBzNach Then
        i = BezugIndex(bezug)
        If i > 0 Then
            If gBzPlatz(i) >= 1 And gBzPlatz(i) <= mPl Then RegelBezug = mOrd(gBzPlatz(i))
            Exit Function
        End If
    End If
    id = SucheName(bezug)
    If id > 0 Then
        RegelBezug = id
        Exit Function
    End If
    id2 = SucheVorkommen(bezug)
    If id2 > 0 Then
        If Not gBzNach Then BezugMerken bezug, id2
        If mWeg(id2) Then
            RegelBezug = -2
        Else
            RegelBezug = id2
        End If
        Exit Function
    End If
    If id = -1 Then
        RegelBezug = -1
        Exit Function
    End If
    ' laut Plan geloeschte Regel, angesprochen ueber ihren Namen
    For k = 1 To mAnz
        If mWeg(k) Then
            If LCase(Trim(mName(k))) = LCase(Trim(bezug)) Then
                RegelBezug = -2
                Exit Function
            End If
        End If
    Next k
End Function

' Regel im Abbild; findet auch eine Regel, die laut Plan (UMBENENNEN) schon umbenannt wurde, und gleichnamige Regeln
' ueber "Name #n/m". Rueckgabe wie RegelBezug.
Public Function RegelFinden(ByVal regelName As String) As Long
    Dim id As Long, k As Long, id2 As Long
    id = RegelBezug(regelName)
    If id <> 0 Then
        RegelFinden = id
        Exit Function
    End If
    For k = 1 To pAnz
        If pAktion(k) = "UMBENENNEN" Then
            If LCase(Trim(pRegel(k))) = LCase(Trim(regelName)) Then
                If Trim(pNeu(k)) <> "" Then
                    id2 = SucheName(pNeu(k))
                    If id2 <> 0 Then
                        RegelFinden = id2
                        Exit Function
                    End If
                End If
            End If
        End If
    Next k
End Function

Private Function NichtGefunden(ByVal k As Long, ByVal regelName As String, ByVal id As Long) As String
    Dim basis As String, nr As Long, gesamt As Long, n As Long, exakt As Boolean, j As Long
    If id = -1 Then
        NichtGefunden = "blockiert: Regelname " & Zitat(regelName) & " ist im Zielpostfach mehrfach vergeben – bitte als " & _
                        Zitat(Trim(regelName) & " #n/m") & " ansprechen (die n-te von m, Reihenfolge wie im Blatt Live)"
    ElseIf id = -2 Then
        NichtGefunden = "blockiert: Regel " & Zitat(regelName) & " wird laut Plan gelöscht"
        For j = 1 To pAnz
            If j <> k And pAktion(j) = "LOESCHEN" And LCase(Trim(pRegel(j))) = LCase(Trim(regelName)) Then
                NichtGefunden = NichtGefunden & " (Zeile " & pNr(j) & ")"
                Exit For
            End If
        Next j
    ElseIf VorkommenTeile(regelName, basis, nr, gesamt) Then
        n = NameAnzahlAlt(basis, exakt)
        If n <> gesamt And nr <= gesamt Then
            NichtGefunden = "blockiert: Regel " & Zitat(regelName) & " nicht gefunden – es gibt " & _
                            IIf(n = 0, "keine Regel ", IIf(n = 1, "1 Regel ", n & " Regeln ")) & Zitat(basis) & _
                            " statt " & gesamt & "; der Plan passt nicht mehr zum Stand in Outlook (Regeln neu lesen)"
        Else
            NichtGefunden = "blockiert: Regel " & Zitat(regelName) & " nicht gefunden" & EntstehtDurch(k, regelName)
        End If
    Else
        NichtGefunden = "blockiert: Regel " & Zitat(regelName) & " nicht gefunden" & EntstehtDurch(k, regelName)
    End If
End Function

' Bedingungstypen ohne Wert (der Typ allein sagt alles) bzw. mit Werten, die das Makro liest (BedWerte) - nur solche
' Regeln lassen sich als Duplikat belegen.
Private Function BedVergleichbar(ByVal t As Long) As Boolean
    Select Case t
        Case 4, 5, 9, 10, 19, 20, 26, 27, 28, 29, 31
            BedVergleichbar = True
        Case 1, 2, 6, 12, 13, 14, 15, 16, 17, 18, 23
            BedVergleichbar = True
    End Select
End Function

' Aktionstypen ohne Wert, die das Makro nur ueber den Typ kennt (Loeschen, Endgueltig loeschen, Kennzeichnung
' entfernen, Drucken, Als gelesen markieren, Lese-/Uebermittlungsbestaetigung).
Private Function AktVergleichbar(ByVal t As Long) As Boolean
    Select Case t
        Case 3, 4, 13, 16, 19, 25, 26
            AktVergleichbar = True
    End Select
End Function

' Erster Typ aus einer Typenliste ("13, 1"), den der Vergleich nicht abdeckt (0 = keiner).
Private Function NichtVergleichbar(ByVal liste As String, ByVal aktionen As Boolean) As Long
    Dim teile As Variant, i As Long, t As Long, ok As Boolean
    If Trim(liste) = "" Then Exit Function
    teile = Split(liste, ",")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            t = CLng(Trim(teile(i)))
            If aktionen Then
                ok = AktVergleichbar(t)
            Else
                ok = BedVergleichbar(t)
            End If
            If Not ok Then
                NichtVergleichbar = t
                Exit Function
            End If
        End If
    Next i
End Function

' Laesst sich der Inhalt von Regel id vollstaendig vergleichen? "" = ja, sonst Grund.
Private Function VergleichbarGrund(ByVal id As Long) As String
    Dim t As Long
    If Not mLesbar(id) Then
        VergleichbarGrund = Zitat(mName(id)) & " ist nicht lesbar"
        Exit Function
    End If
    If mOhneBed(id) Then
        VergleichbarGrund = Zitat(mName(id)) & " hat keine sichtbare Bedingung (sie ist womöglich nur in Outlook im Web " & _
                            "zu sehen)"
        Exit Function
    End If
    t = NichtVergleichbar(mTypen(id), False)
    If t > 0 Then
        VergleichbarGrund = Zitat(mName(id)) & " hat die Bedingung " & Zitat(BedTypName(t)) & ", deren Wert das Makro nicht liest"
        Exit Function
    End If
    t = NichtVergleichbar(mAusTypen(id), False)
    If t > 0 Then
        VergleichbarGrund = Zitat(mName(id)) & " hat die Ausnahme " & Zitat(BedTypName(t)) & ", deren Wert das Makro nicht liest"
        Exit Function
    End If
    t = NichtVergleichbar(mAktFremd(id), True)
    If t > 0 Then VergleichbarGrund = Zitat(mName(id)) & " hat eine Aktion (Typ " & t & "), deren Wert das Makro nicht liest"
End Function

' LOESCHEN "gleich: ...": Ist Regel id ein Duplikat von Regel b, dessen Loeschen nichts aendert? "" = ja, sonst Grund.
' Gleich heisst gleicher Inhalt (modModell.InhaltSignatur: Regeltyp, Nur lokal, Bedingungen und Ausnahmen mit Werten,
' Ziele, Empfaenger, Stopp, Aktionen) - und beide Regeln muessen sich vollstaendig vergleichen lassen. Ist die zu
' loeschende Regel eingeschaltet, muss die bleibende eingeschaltet sein und vor ihr stehen: Dann hat sie jede Mail,
' die die geloeschte traefe, schon genauso behandelt. Stuende sie dahinter, koennte eine Regel dazwischen diese Mails
' vorher abfangen. Eine ausgeschaltete Regel greift nie - bei ihr spielen Platz und Zustand der bleibenden keine Rolle.
Private Function DuplikatPruefen(ByVal id As Long, ByVal b As Long) As String
    Dim g As String, t As String
    g = VergleichbarGrund(id)
    If g = "" Then g = VergleichbarGrund(b)
    If g <> "" Then
        DuplikatPruefen = "Gleichheit nicht belegbar – " & g & ". Soll die Regel trotzdem weg: in Spalte " & _
                          SpaltenBuchstabe(SP_NEU) & " „ohne Ersatz“"
        Exit Function
    End If
    t = SignaturTeile(InhaltSignatur(id), InhaltSignatur(b))
    If t <> "" Then
        DuplikatPruefen = "kein Duplikat – " & Zitat(mName(id)) & " (Platz " & Platz(id) & ") und " & Zitat(mName(b)) & _
                          " (Platz " & Platz(b) & ") unterscheiden sich in: " & t
    ElseIf mAktiv(id) And Not mAktiv(b) Then
        DuplikatPruefen = "die Regel, die bleibt (Platz " & Platz(b) & "), ist ausgeschaltet, die zu löschende " & _
                          "eingeschaltet – danach griffe keine von beiden"
    ElseIf mAktiv(id) And Platz(b) > Platz(id) Then
        DuplikatPruefen = "die Regel, die bleibt, steht hinter der zu löschenden (Platz " & Platz(b) & " nach Platz " & _
                          Platz(id) & ") – eine Regel dazwischen könnte die Mails vorher abfangen. Bitte die hintere " & _
                          "löschen und die vordere bei Bedarf umbenennen"
    End If
End Function

' IDs aller Regeln mit diesem Namen im Abbild (ohne die laut Plan geloeschten), nach Platz geordnet, als "|3|7|9|";
' erst exakt, sonst ohne Gross-/Kleinschreibung. anzahl: wie viele.
Private Function NamensGruppe(ByVal regelName As String, ByRef anzahl As Long) As String
    Dim p As Long, id As Long, s As String, durchgang As Long, passt As Boolean
    regelName = Trim(regelName)
    For durchgang = 1 To 2
        s = "|"
        anzahl = 0
        For p = 1 To mPl
            id = mOrd(p)
            If durchgang = 1 Then
                passt = (Trim(mName(id)) = regelName)
            Else
                passt = (LCase(Trim(mName(id))) = LCase(regelName))
            End If
            If passt Then
                anzahl = anzahl + 1
                s = s & id & "|"
            End If
        Next p
        If anzahl > 0 Then Exit For
    Next durchgang
    NamensGruppe = s
End Function

' Plaetze einer ID-Liste ("|7|8|9|") als Text: "Platz 7 bis 9" bzw. "Plätze 7, 9, 12" (ab der sechsten "und n weitere").
Private Function PlatzText(ByVal ids As String) As String
    Dim teile As Variant, i As Long, n As Long, p As Long, erster As Long, letzter As Long, luecke As Boolean, s As String
    teile = Split(ids, "|")
    For i = LBound(teile) To UBound(teile)
        If teile(i) <> "" Then
            p = Platz(CLng(teile(i)))
            n = n + 1
            If n = 1 Then
                erster = p
            ElseIf p <> letzter + 1 Then
                luecke = True
            End If
            letzter = p
            If n <= 5 Then s = Anhaengen(s, CStr(p), ", ")
        End If
    Next i
    If n = 1 Then
        PlatzText = "Platz " & erster
    ElseIf Not luecke Then
        PlatzText = "Platz " & erster & " bis " & letzter
    Else
        PlatzText = "Plätze " & s & IIf(n > 5, " und " & (n - 5) & " weitere", "")
    End If
End Function

' LOESCHEN: Die Regel ist nicht (mehr) da. "" = gilt als erledigt (hinweis nennt den Stand), sonst Grund fuer "blockiert".
Private Function WegPruefen(ByVal bezug As String, ByRef hinweis As String) As String
    Dim basis As String, nr As Long, gesamt As Long, n As Long, exakt As Boolean
    hinweis = "Regel " & Zitat(Trim(bezug)) & " gibt es nicht (mehr)"
    If Not VorkommenTeile(bezug, basis, nr, gesamt) Then Exit Function
    ' Nachpruefung: im selben Lauf geloescht
    If gBzNach Then
        If BezugIndex(bezug) > 0 Then Exit Function
    End If
    n = NameAnzahlAlt(basis, exakt)
    If nr > gesamt Then
        WegPruefen = "Bezug " & Zitat(Trim(bezug)) & " ist nicht möglich (n größer als m)"
    ElseIf n > gesamt Then
        WegPruefen = "es gibt " & n & " Regeln " & Zitat(basis) & " statt " & gesamt & " – der Plan passt nicht mehr zum " & _
                     "Stand in Outlook (Regeln neu lesen)"
    ElseIf n < gesamt Then
        hinweis = "es gibt " & IIf(n = 0, "keine Regel ", IIf(n = 1, "nur noch 1 Regel ", "nur noch " & n & " Regeln ")) & _
                  Zitat(basis) & IIf(n = 0, " mehr", "") & " (statt " & gesamt & ")"
    End If
End Function

' Hinweis, welche andere Planzeile die Regel erst anlegt bzw. umbenennt (leer, wenn keine).
Private Function EntstehtDurch(ByVal k As Long, ByVal regelName As String) As String
    Dim j As Long, passt As Boolean, s As String
    For j = 1 To pAnz
        If j <> k Then
            passt = False
            If pAktion(j) = "KOPIEREN" Then passt = (LCase(Trim(pRegel(j))) = LCase(Trim(regelName)))
            If pAktion(j) = "UMBENENNEN" Then passt = (LCase(Trim(pNeu(j))) = LCase(Trim(regelName)))
            If passt Then
                s = " – entsteht erst durch Zeile " & pNr(j)
                If Not pAusf(j) Then
                    s = s & " (nicht ausgewählt)"
                ElseIf Left(pStatus(j), 9) = "blockiert" Then
                    s = s & " (dort blockiert)"
                ElseIf j > k Then
                    s = s & " (steht weiter unten im Plan)"
                End If
                EntstehtDurch = s
                Exit Function
            End If
        End If
    Next j
End Function

Public Function AnleitungKopieren() As String
    AnleitungKopieren = "Diese Regel bitte einmal in Outlook kopieren: Regeln und Benachrichtigungen ›" & _
        " Posteingang [" & LCase(gQuellAdr) & "] › Regel markieren › Kopieren" & _
        "… › Posteingang [" & LCase(gZielAdr) & "]. Danach Vorschau erneut starten " & _
        "– den Rest erledigt das Makro."
End Function

' Bezugsregel einer Position: erst der ganze Text als Regelname, sonst Ausweich-Bezuege "A || B" (die erste
' vorhandene zaehlt). Ein einzelnes "|" gehoert zum Namen und wird nie zerlegt.
' Rueckgabe: ID (0 = keine, -1 = mehrdeutig); ausweich: Bezug war nicht der erste; grund bei Fehlern.
Private Function BezugFinden(ByVal rest As String, ByRef ausweich As Boolean, ByRef ersterBezug As String, _
                             ByRef grund As String) As Long
    Dim teile As Variant, i As Long, kandidat As Long, t As String, erster As Boolean
    ausweich = False: grund = ""
    ersterBezug = Trim(rest)
    kandidat = RegelFinden(rest)
    If kandidat <> 0 Then
        If kandidat = -1 Then grund = "Bezugsregel " & Zitat(Trim(rest)) & " ist mehrfach vergeben (als „Name #n/m“ ansprechen)"
        If kandidat = -2 Then grund = "Bezugsregel " & Zitat(Trim(rest)) & " wird laut Plan gelöscht"
        If kandidat < 0 Then kandidat = -1
        BezugFinden = kandidat
        Exit Function
    End If
    If InStr(rest, "||") = 0 Then Exit Function
    teile = Split(rest, "||")
    erster = True
    For i = LBound(teile) To UBound(teile)
        t = Trim(teile(i))
        If t = "" Then
            grund = "leerer Bezug zwischen „||“"
            BezugFinden = -1
            Exit Function
        End If
        If erster Then ersterBezug = t
        kandidat = RegelFinden(t)
        If kandidat < 0 Then
            If kandidat = -2 Then
                grund = "Bezugsregel " & Zitat(t) & " wird laut Plan gelöscht"
            Else
                grund = "Bezugsregel " & Zitat(t) & " ist mehrfach vergeben (als „Name #n/m“ ansprechen)"
            End If
            BezugFinden = -1
            Exit Function
        End If
        If kandidat > 0 Then
            ausweich = Not erster
            BezugFinden = kandidat
            Exit Function
        End If
        erster = False
    Next i
End Function

' Position "nach: Regel", "vor: Regel" (Ausweich mit "||") oder "Platz n". Rueckgabe: "" (ok) oder Grund.
' erledigt: schon erfuellt.
Private Function PositionPruefen(ByVal id As Long, ByVal spec As String, ByVal anwenden As Boolean, ByRef erledigt As Boolean) As String
    Dim s As String, art As String, rest As String, a As Long, n As Long, ziel As Long, ausweich As Boolean
    Dim erster As String, grund As String
    erledigt = False
    s = Trim(spec)
    If LCase(Left(s, 4)) = "nach" Then
        art = "nach": rest = Mid(s, 5)
    ElseIf LCase(Left(s, 3)) = "vor" Then
        art = "vor": rest = Mid(s, 4)
    ElseIf LCase(Left(s, 5)) = "platz" Then
        art = "platz": rest = Mid(s, 6)
    Else
        PositionPruefen = "Position unklar (erlaubt: nach: Regel | vor: Regel | Platz n): " & s
        Exit Function
    End If
    rest = Trim(rest)
    If Left(rest, 1) = ":" Then rest = Trim(Mid(rest, 2))
    If art = "platz" Then
        n = Val(rest)
        If n < 1 Or n > mPl Then
            PositionPruefen = "Platz " & rest & " liegt außerhalb 1 bis " & mPl
            Exit Function
        End If
        erledigt = (Platz(id) = n)
        ePos = Not erledigt: eAnker = 0: ePlatzNr = n
        gPosText = "auf Platz " & n
        If anwenden And Not erledigt Then Umsetzen id, n
        Exit Function
    End If
    If rest = "" Then
        PositionPruefen = "Bezugsregel fehlt in der Position"
        Exit Function
    End If
    a = BezugFinden(rest, ausweich, erster, grund)
    If a = -1 Then
        PositionPruefen = grund
        Exit Function
    End If
    If a = 0 Then
        PositionPruefen = "Bezugsregel nicht gefunden: " & rest & EntstehtDurch(gAktK, erster)
        Exit Function
    End If
    If a = id Then
        PositionPruefen = "Regel kann nicht " & art & " sich selbst stehen"
        Exit Function
    End If
    If art = "nach" Then
        erledigt = (Platz(id) = Platz(a) + 1)
        gPosText = "direkt nach " & Zitat(mName(a))
        If Platz(id) > Platz(a) Then ziel = Platz(a) + 1 Else ziel = Platz(a)
    Else
        erledigt = (Platz(id) = Platz(a) - 1)
        gPosText = "direkt vor " & Zitat(mName(a))
        If Platz(id) < Platz(a) Then ziel = Platz(a) - 1 Else ziel = Platz(a)
    End If
    If ausweich Then gPosText = gPosText & " (Ausweich-Bezug, " & Zitat(erster) & " fehlt)"
    ePos = Not erledigt: eAnker = a: eNach = (art = "nach"): ePlatzNr = 0
    If anwenden And Not erledigt Then Umsetzen id, ziel
End Function

' Ordner einer vorhandenen Regel angleichen (KOPIEREN Fall a/b, ZIELORDNER). Rueckgabe "" oder Grund.
Private Function OrdnerAngleichen(ByVal k As Long, ByVal id As Long, ByVal ziel As Object, ByRef neuV As String, ByRef neuK As String) As String
    Dim b As String
    neuV = "": neuK = ""
    If pVer(k) <> "" Then
        If Not mVerAn(id) Then
            OrdnerAngleichen = "Regel " & Zitat(mName(id)) & " verschiebt nicht (Aktion „In Ordner verschieben" & _
                               "“ aus) – Spalte " & SpaltenBuchstabe(SP_VER) & " leer lassen"
            Exit Function
        End If
        b = ZielOrdnerPruefen(ziel, pVer(k), neuV)
        If b <> "" Then
            OrdnerAngleichen = b
            Exit Function
        End If
        If PfadNorm(mVerPfad(id)) <> PfadNorm(pVer(k)) Then
            eVerSetzen = True
            eVer = pVer(k)
            eKurz = Anhaengen(eKurz, "verschieben nach " & RelPfad(pVer(k)), ", ")
        Else
            neuV = ""
        End If
    End If
    If pKop(k) <> "" Then
        If Not mKopAn(id) Then
            OrdnerAngleichen = "Regel " & Zitat(mName(id)) & " kopiert nicht (Aktion „In Ordner kopieren" & _
                               "“ aus) – Spalte " & SpaltenBuchstabe(SP_KOP) & " leer lassen"
            Exit Function
        End If
        b = ZielOrdnerPruefen(ziel, pKop(k), neuK)
        If b <> "" Then
            OrdnerAngleichen = b
            Exit Function
        End If
        If PfadNorm(mKopPfad(id)) <> PfadNorm(pKop(k)) Then
            eKopSetzen = True
            eKop = pKop(k)
            eKurz = Anhaengen(eKurz, "kopieren nach " & RelPfad(pKop(k)), ", ")
        Else
            neuK = ""
        End If
    End If
    ' Bleibt ein Ziel in einem fremden Postfach stehen (z. B. Kopie aus Outlook zeigt noch ins Quellpostfach)?
    If mVerAn(id) And pVer(k) = "" Then
        If Not ImZielpostfach(ziel, mVerPfad(id)) Then
            OrdnerAngleichen = "Verschieben-Ziel liegt außerhalb des Zielpostfachs (" & mVerPfad(id) & _
                               ") – Ziel in Spalte " & SpaltenBuchstabe(SP_VER) & " angeben"
            Exit Function
        End If
    End If
    If mKopAn(id) And pKop(k) = "" Then
        If Not ImZielpostfach(ziel, mKopPfad(id)) Then
            OrdnerAngleichen = "Kopieren-Ziel liegt außerhalb des Zielpostfachs (" & mKopPfad(id) & _
                               ") – Ziel in Spalte " & SpaltenBuchstabe(SP_KOP) & " angeben"
            Exit Function
        End If
    End If
    eNeueOrdner = ""
    If neuV <> "" Then eNeueOrdner = neuV
    If neuK <> "" Then
        If PfadNorm(neuK) <> PfadNorm(neuV) Then eNeueOrdner = Anhaengen(eNeueOrdner, neuK, "|")
    End If
End Function

Private Function ImZielpostfach(ByVal ziel As Object, ByVal pfad As String) As Boolean
    Dim pf As String
    pf = "\\" & LCase(PostfachName(ziel))
    ImZielpostfach = (PfadNorm(pfad) = pf Or Left(PfadNorm(pfad), Len(pf) + 1) = pf & "\")
End Function

Private Sub OrdnerAnwenden(ByVal id As Long)
    Dim teile As Variant, i As Long
    If eVerSetzen Then mVerPfad(id) = eVer
    If eKopSetzen Then mKopPfad(id) = eKop
    If eNeueOrdner <> "" Then
        teile = Split(eNeueOrdner, "|")
        For i = LBound(teile) To UBound(teile)
            If teile(i) <> "" Then OrdnerMerken CStr(teile(i))
        Next i
    End If
End Sub

' Empfaenger, die sich beim Anlegen einer Kopie nicht aufloesen lassen (Absender, Gesendet an - in Bedingungen und
' Ausnahmen -, Weiterleiten, Als Anlage weiterleiten, Umleiten). Rueckgabe "" = alle aufloesbar, sonst Anzeige
' "Name (Typ Adresse)". Hier wird nie etwas uebersprungen: Die Kopie muss gleich der Quelle sein.
Private Function QuellNichtAufloesbar(ByVal src As Object) As String
    Dim s As String, c As Object, conds As Object, ex As Object, acts As Object, schl As Variant, k As Long, a As Object
    Dim aktiv As Boolean, sch As String, nm As String, rc As Object, j As Long
    On Error Resume Next
    Set conds = src.Conditions
    Set ex = src.Exceptions
    Set acts = src.Actions
    On Error GoTo 0
    For k = 1 To 4
        Set c = Nothing
        Select Case k
            Case 1: Set c = BedNachTyp(conds, BED_FROM)
            Case 2: Set c = BedNachTyp(ex, BED_FROM)
            Case 3: Set c = BedNachTyp(conds, BED_SENTTO)
            Case 4: Set c = BedNachTyp(ex, BED_SENTTO)
        End Select
        aktiv = False
        Set rc = Nothing
        On Error Resume Next
        If Not c Is Nothing Then aktiv = c.Enabled
        If aktiv Then Set rc = c.Recipients
        On Error GoTo 0
        If aktiv Then s = ListeVereinen(s, Replace(EmpfOffen(rc, "", sch, nm), W_SEP, "; "))
    Next k
    schl = Array("FWD", "FWDATT", "REDIR")
    For j = LBound(schl) To UBound(schl)
        Set a = AktNachName(acts, CStr(schl(j)))
        aktiv = False
        Set rc = Nothing
        On Error Resume Next
        If Not a Is Nothing Then aktiv = a.Enabled
        If aktiv Then Set rc = a.Recipients
        On Error GoTo 0
        If aktiv Then s = ListeVereinen(s, Replace(EmpfOffen(rc, "", sch, nm), W_SEP, "; "))
    Next j
    QuellNichtAufloesbar = s
End Function

' Empfaenger der Weiterleitung einer Regel im Zielpostfach (Nothing, wenn nicht lesbar).
Private Function WeiterleitungEmpf(ByVal id As Long) As Object
    Dim rc As Object
    On Error Resume Next
    Set rc = mObj(id).Actions.Forward.Recipients
    If Err.Number <> 0 Then Set rc = Nothing
    On Error GoTo 0
    Set WeiterleitungEmpf = rc
End Function

' Eintraege der Spalte "Überspringen" ("Name; Name" oder je Zeile einer) als "|name|name|" (klein, getrimmt).
Private Function UeberListe(ByVal s As String) As String
    Dim teile As Variant, i As Long, aus As String
    aus = "|"
    s = Replace(Replace(Replace(s, vbCr, ";"), vbLf, ";"), "|", ";")
    teile = Split(s, ";")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then aus = aus & LCase(Trim(teile(i))) & "|"
    Next i
    UeberListe = aus
End Function

' Darf das Makro die Quellregel neu anlegen? Mindestens eine aktive, lesbare Bedingung; alle aktiven Bedingungen,
' Ausnahmen und Aktionen vom Makro kopierbar (Index-Durchlauf und benannte Eigenschaften). Quelle landet in Platz 0.
Private Function QuelleKopierbar(ByVal src As Object, ByRef grund As String) As Boolean
    Dim rt As Long, p As String
    grund = ""
    On Error Resume Next
    rt = -1
    rt = src.RuleType
    On Error GoTo 0
    If rt <> 0 Then
        grund = "Quellregel ist keine Empfangen-Regel"
        Exit Function
    End If
    p = QuelleLesen(src)
    If p <> "" Then
        grund = "Quellregel nicht vollständig lesbar (" & p & ")"
        Exit Function
    End If
    If mNSicht(0) = 0 Then
        grund = "Quellregel hat keine lesbare Bedingung – ohne Bedingung legt das Makro keine Regel an"
        Exit Function
    End If
    If mFremd(0) <> "" Then
        grund = "nicht kopierbar: " & mFremd(0)
        Exit Function
    End If
    If mAkt(0) = "" Then
        grund = "Quellregel hat keine Aktion"
        Exit Function
    End If
    QuelleKopierbar = True
End Function

' Bedingungen/Ausnahmen der Regel id mit der Quelle in Platz 0 vergleichen ("" = gleich).
Private Function QuellVergleich(ByVal id As Long) As String
    Dim s As String
    If TypenSortiert(mTypen(id)) & "#" & WNorm(mBedW(id)) <> TypenSortiert(mTypen(0)) & "#" & WNorm(mBedW(0)) Then
        s = "Bedingungen"
    End If
    If TypenSortiert(mAusTypen(id)) & "#" & WNorm(mAusW(id)) <> TypenSortiert(mAusTypen(0)) & "#" & WNorm(mAusW(0)) Then
        s = Anhaengen(s, "Ausnahmen", " und ")
    End If
    QuellVergleich = s
End Function

' Wertangabe fuer BEDINGUNG_WORT_ERGAENZEN: "Betreff enthält: "Wort", "Wort"". Rueckgabe "" oder Fehler.
Private Function WertSpecLesen(ByVal spec As String, ByRef t As Long, ByRef werte As String) As String
    Dim p As Long, bez As String
    t = 0: werte = ""
    p = InStr(spec, ":")
    If p = 0 Then
        WertSpecLesen = "Angabe in Spalte " & SpaltenBuchstabe(SP_NEU) & " fehlt oder ohne Doppelpunkt (Beispiel: " & _
                        "Betreff enthält: ""Eskalation"")"
        Exit Function
    End If
    bez = Trim(Left(spec, p - 1))
    t = BedTypAusText(bez)
    If t = 0 Then
        WertSpecLesen = "Bedingung " & Zitat(bez) & " unbekannt (erlaubt: Betreff enthält, Mailtext enthält, Betreff " & _
                        "oder Mailtext enthält, Nachrichtenkopf enthält, Absenderadresse enthält, Empfängeradresse enthält)"
        Exit Function
    End If
    werte = WoerterLesen(Mid(spec, p + 1))
    If werte = "" Then WertSpecLesen = "keine Wörter angegeben"
End Function

' Woerter aus "a", "b" bzw. „a“, „b“; ohne Anfuehrungszeichen durch ; getrennt. Rueckgabe: W_SEP-Liste.
Public Function WoerterLesen(ByVal s As String) As String
    Dim i As Long, ch As String, drin As Boolean, w As String, aus As String, teile As Variant
    If InStr(s, """") = 0 And InStr(s, "„") = 0 And InStr(s, "“") = 0 Then
        teile = Split(s, ";")
        For i = LBound(teile) To UBound(teile)
            If Trim(teile(i)) <> "" Then aus = Anhaengen(aus, Trim(teile(i)), W_SEP)
        Next i
        WoerterLesen = aus
        Exit Function
    End If
    For i = 1 To Len(s)
        ch = Mid(s, i, 1)
        If Not drin Then
            If ch = """" Or ch = "„" Or ch = "“" Then
                drin = True
                w = ""
            End If
        ElseIf ch = """" Or ch = "“" Or ch = "”" Then
            drin = False
            If w <> "" Then aus = Anhaengen(aus, w, W_SEP)
        Else
            w = w & ch
        End If
    Next i
    WoerterLesen = aus
End Function

' Bewertet Planzeile k gegen das Abbild (siehe Modulkopf).
Public Function SchrittPruefen(ByVal k As Long, ByVal anwenden As Boolean, ByVal ol As Object, ByVal ziel As Object) As String
    Dim id As Long, idNeu As Long, b As String, neuV As String, neuK As String, erledigt As Boolean, posErl As Boolean
    Dim nm As String, qn As String, src As Object, f As String, fall As String, offen As String, st As String
    Dim t As Long, werte As String, wz As String, az As Boolean, fehl As String, typen As Variant, i As Long
    Dim wq As String, aq As Boolean, zielAktiv As Boolean, aend As String, hinweis As String
    Dim fremdZiel As String, nmListe As String, exQ As Object, pq As String, offSchl As String, offNamen As String
    Dim offAnz As Variant, offS As Variant, offN As Variant, j As Long, ueber As String, treffer As String
    Dim ohneHinweis As String, rcQ As Object, offenBlock As String, uTeile As Variant, unbenutzt As String
    Dim hV As String, hK As String
    EntscheidungLeeren
    gAktK = k
    pSpeichern(k) = False
    pVer(k) = Trim(pVer(k)): pKop(k) = Trim(pKop(k))
    ' Vom Blatt Ordner umgezogene Ordner: alter Pfad -> neuer Pfad (nur wenn der alte fehlt und der neue da ist)
    gUmzugHinweis = ""
    If pVer(k) <> "" Then pVer(k) = UmzugPfad(ziel, pVer(k), hV)
    If pKop(k) <> "" Then pKop(k) = UmzugPfad(ziel, pKop(k), hK)
    If hK = hV Then hK = ""
    gUmzugHinweis = hV & hK
    ' Spalte "Überspringen" gilt nur fuer AUSNAHMEN_UEBERNEHMEN (bei Bedingungen, Kopien und Umleitungen wuerde ein
    ' fehlender Empfaenger die Regel veraendern statt nur den alten Stand fuer ihn zu lassen)
    If pUeber(k) <> "" And pAktion(k) <> "AUSNAHMEN_UEBERNEHMEN" Then
        SchrittPruefen = "blockiert: Spalte " & SpaltenBuchstabe(SP_UEBERSPR) & " (nicht auflösbare Absender " & _
                         "überspringen) gilt nur für AUSNAHMEN_UEBERNEHMEN – bitte leeren"
        Exit Function
    End If
    Select Case pAktion(k)

    Case "ORDNER_ANLEGEN"
        If pVer(k) = "" Then
            SchrittPruefen = "blockiert: Ordner fehlt (Spalte " & SpaltenBuchstabe(SP_VER) & ")"
            Exit Function
        End If
        b = ZielOrdnerPruefen(ziel, pVer(k), neuV)
        If b <> "" Then
            SchrittPruefen = "blockiert: " & b
        ElseIf neuV = "" Then
            SchrittPruefen = "schon erledigt"
        Else
            eFall = "ORDNER": eNeueOrdner = neuV
            eKurz = "Ordner anlegen: " & RelPfad(neuV)
            If anwenden Then OrdnerMerken neuV
            SchrittPruefen = "bereit" & OrdnerHinweis(neuV)
        End If

    Case "ZIELORDNER"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        gRegelId = id
        If pVer(k) = "" And pKop(k) = "" Then
            SchrittPruefen = "blockiert: Zielordner fehlt (Spalte " & SpaltenBuchstabe(SP_VER) & " verschieben, Spalte " & _
                             SpaltenBuchstabe(SP_KOP) & " kopieren)"
            Exit Function
        End If
        b = OrdnerAngleichen(k, id, ziel, neuV, neuK)
        If b <> "" Then
            SchrittPruefen = "blockiert: " & b
        ElseIf Not eVerSetzen And Not eKopSetzen Then
            SchrittPruefen = "schon erledigt"
        Else
            eFall = "ZIEL": eId = id
            If anwenden Then
                OrdnerAnwenden id
                mBeruehrt(id) = True
            End If
            pSpeichern(k) = True
            SchrittPruefen = "bereit · " & eKurz & OrdnerHinweis(eNeueOrdner)
        End If

    Case "UMBENENNEN"
        nm = Trim(pNeu(k))
        If nm = "" Then
            SchrittPruefen = "blockiert: neuer Name fehlt (Spalte " & SpaltenBuchstabe(SP_NEU) & ")"
            Exit Function
        End If
        id = RegelBezug(pRegel(k))
        idNeu = SucheName(nm)
        eKurz = "neuer Name " & Zitat(nm)
        If id < 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
        ElseIf idNeu = -1 Then
            SchrittPruefen = "blockiert: Regelname " & Zitat(nm) & " ist im Zielpostfach mehrfach vergeben"
        ElseIf id > 0 And idNeu = id Then
            gRegelId = id
            If mName(id) = nm Then
                SchrittPruefen = "schon erledigt"
            Else
                eFall = "NAME": eId = id: eName = nm
                If anwenden Then mName(id) = nm: mBeruehrt(id) = True
                pSpeichern(k) = True
                SchrittPruefen = "bereit · " & eKurz
            End If
        ElseIf id > 0 And idNeu > 0 Then
            SchrittPruefen = "blockiert: Regel " & Zitat(nm) & " gibt es schon"
        ElseIf id > 0 Then
            gRegelId = id
            eFall = "NAME": eId = id: eName = nm
            If anwenden Then mName(id) = nm: mBeruehrt(id) = True
            pSpeichern(k) = True
            SchrittPruefen = "bereit · " & eKurz
        ElseIf idNeu > 0 Then
            gRegelId = idNeu
            SchrittPruefen = "schon erledigt"
        Else
            SchrittPruefen = NichtGefunden(k, pRegel(k), 0)
        End If

    Case "UMLEITEN_STATT_WEITERLEITEN"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        gRegelId = id
        If mUmlFehlt(id) > 0 Then
            SchrittPruefen = "blockiert: " & mUmlFehlt(id) & " Empfänger von „Umleiten an“ ohne lesbare Adresse"
        ElseIf Not mWeiAn(id) And mUmlAn(id) Then
            ' erledigt nur, wenn die Umleitung genau an die (ausgeschalteten) Weiterleitungsempfaenger geht
            If mWeiEmpf(id) = "" Or GleicheListe(mUmlEmpf(id), mWeiEmpf(id)) Then
                SchrittPruefen = "schon erledigt"
            Else
                SchrittPruefen = "blockiert: Umleiten ist schon aktiv an " & mUmlNamen(id) & ", die ausgeschaltete " & _
                                 "Weiterleitung geht an " & mWeiNamen(id) & " – bitte in Outlook prüfen"
            End If
        ElseIf Not mWeiAn(id) Then
            SchrittPruefen = "blockiert: Regel leitet weder weiter noch um"
        ElseIf mWeiEmpf(id) = "" Then
            SchrittPruefen = "blockiert: Empfänger der Weiterleitung nicht lesbar"
        ElseIf mWeiFehlt(id) > 0 Then
            SchrittPruefen = "blockiert: " & mWeiFehlt(id) & " Empfänger der Weiterleitung ohne lesbare Adresse"
        ElseIf Not ListeEnthaelt(mWeiEmpf(id), mUmlEmpf(id)) Then
            SchrittPruefen = "blockiert: „Umleiten an“ " & IIf(mUmlAn(id), "", "(ausgeschaltet) ") & "enthält schon " & _
                             "andere Empfänger (" & ListeFehlend(mWeiEmpf(id), mUmlEmpf(id)) & ") – sie würden mit " & _
                             "eingeschaltet. Bitte in Outlook entfernen."
        ElseIf WeiterleitungEmpf(id) Is Nothing Then
            SchrittPruefen = "blockiert: Empfänger der Weiterleitung nicht lesbar"
        Else
            offen = EmpfOffen(WeiterleitungEmpf(id), "", offSchl, offNamen)
            If offen <> "" Then
                SchrittPruefen = "blockiert: Empfänger nicht auflösbar: " & Replace(offen, W_SEP, "; ")
            Else
                eFall = "UMLEIT": eId = id: eEmpf = ListeFehlend(mUmlEmpf(id), mWeiEmpf(id))
                eKurz = "umleiten an " & mWeiNamen(id) & " (Weiterleiten aus)"
                If anwenden Then
                    mUmlAn(id) = True
                    mUmlEmpf(id) = ListeVereinen(mUmlEmpf(id), mWeiEmpf(id))
                    mUmlNamen(id) = mWeiNamen(id)
                    mWeiAn(id) = False
                    mBeruehrt(id) = True
                End If
                pSpeichern(k) = True
                SchrittPruefen = "bereit · " & eKurz
            End If
        End If

    Case "POSITION"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        gRegelId = id
        If Trim(pNeu(k)) = "" Then
            SchrittPruefen = "blockiert: Position fehlt (Spalte " & SpaltenBuchstabe(SP_NEU) & ")"
            Exit Function
        End If
        b = PositionPruefen(id, pNeu(k), anwenden, erledigt)
        If b <> "" Then
            SchrittPruefen = "blockiert: " & b
        ElseIf erledigt Then
            SchrittPruefen = "schon erledigt"
        Else
            eFall = "POS": eId = id
            eKurz = gPosText
            If anwenden Then mBeruehrt(id) = True
            pSpeichern(k) = True
            SchrittPruefen = "bereit · " & gPosText
        End If

    Case "BEDINGUNG_WORT_ERGAENZEN"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        gRegelId = id
        b = WertSpecLesen(pNeu(k), t, werte)
        If b <> "" Then
            SchrittPruefen = "blockiert: " & b
            Exit Function
        End If
        If Not mLesbar(id) Then
            SchrittPruefen = "blockiert: Bedingungen der Regel nicht lesbar (" & mGrund(id) & ")"
            Exit Function
        End If
        If Not TypenEnthalten(mTypen(id), t) Then
            SchrittPruefen = "blockiert: Bedingung " & Zitat(BedTypName(t)) & " ist in der Regel nicht aktiv – das " & _
                             "Makro ergänzt nur aktive Bedingungen"
            Exit Function
        End If
        WRec mBedW(id), t, az, wz
        fehl = WFehlend(wz, werte)
        If fehl = "" Then
            SchrittPruefen = "schon erledigt"
            Exit Function
        End If
        ' Neue Woerter aus dem Plan werden getrimmt geschrieben (ohne Leerzeichen am Rand, auch wenn sie in den
        ' Anfuehrungszeichen stehen); vorhandene Werte der Regel bleiben roh (ListeErgaenzen in modOlSchreiben)
        eFall = "WORT": eId = id: eTyp = t: eWerte = fehl
        eKurz = BedTypName(t) & " + " & WAnzeigen(eWerte, 4)
        If anwenden Then
            mBedW(id) = WSetzen(mBedW(id), t, True, Anhaengen(wz, fehl, W_SEP))
            mBeruehrt(id) = True
        End If
        pSpeichern(k) = True
        SchrittPruefen = "bereit · " & eKurz

    Case "AUSNAHMEN_UEBERNEHMEN"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        gRegelId = id
        If Not mLesbar(id) Then
            SchrittPruefen = "blockiert: Regel nicht lesbar (" & mGrund(id) & ")"
            Exit Function
        End If
        qn = Trim(pQuelle(k))
        If qn = "" Then qn = Trim(pRegel(k))
        If gQuellRegeln Is Nothing Then
            SchrittPruefen = "blockiert: Quellpostfach nicht lesbar (" & gQuellFehler & ")"
            Exit Function
        End If
        Set src = QuellRegelFinden(gQuellRegeln, qn, f)
        If src Is Nothing Then
            SchrittPruefen = "blockiert: " & f
            Exit Function
        End If
        b = QuelleLesen(src)
        If b <> "" Then
            SchrittPruefen = "blockiert: Quellregel nicht vollständig lesbar (" & b & ")"
            Exit Function
        End If
        If Trim(mAusTypen(0)) = "" Then
            SchrittPruefen = "blockiert: Quellregel " & Zitat(qn) & " hat keine Ausnahmen"
            Exit Function
        End If
        typen = Split(TypenSortiert(mAusTypen(0)), ", ")
        For i = LBound(typen) To UBound(typen)
            If Not BedKopierbar(CLng(typen(i))) Then
                SchrittPruefen = "blockiert: Ausnahme " & Zitat(BedTypName(CLng(typen(i)))) & " kann das Makro nicht übernehmen"
                Exit Function
            End If
        Next i
        Set exQ = Nothing
        On Error Resume Next
        Set exQ = src.Exceptions
        On Error GoTo 0
        ueber = UeberListe(pUeber(k))
        For i = LBound(typen) To UBound(typen)
            t = CLng(typen(i))
            WRec mAusW(0), t, aq, wq
            WRec mAusW(id), t, az, wz
            zielAktiv = TypenEnthalten(mAusTypen(id), t)
            If BedHatListe(t) Then
                If Not zielAktiv And wz <> "" Then
                    fremdZiel = WFehlend(wq, wz)
                    If fremdZiel <> "" Then
                        SchrittPruefen = "blockiert: Ausnahme " & Zitat(BedTypName(t)) & " ist ausgeschaltet, enthält " & _
                                         "aber andere Einträge (" & WAnzeigen(fremdZiel, 3) & ") – sie würden mit " & _
                                         "eingeschaltet. Bitte in Outlook bereinigen."
                        Exit Function
                    End If
                End If
                fehl = WFehlend(wz, wq)
                If fehl <> "" And (t = BED_FROM Or t = BED_SENTTO) Then
                    ' neue Empfaenger, die sich ueber keinen Kandidaten aufloesen lassen: blockieren, ausser Spalte
                    ' "Überspringen" nennt sie (Name oder Adresse) - dann bleibt fuer sie der alte Stand
                    Set rcQ = Nothing
                    On Error Resume Next
                    Set rcQ = BedNachTyp(exQ, t).Recipients
                    On Error GoTo 0
                    If rcQ Is Nothing Then
                        SchrittPruefen = "blockiert: Empfänger der Quell-Ausnahme " & Zitat(BedTypName(t)) & " nicht lesbar"
                        Exit Function
                    End If
                    offen = EmpfOffen(rcQ, fehl, offSchl, offNamen)
                    If offen <> "" Then
                        offAnz = Split(offen, W_SEP)
                        offS = Split(offSchl, W_SEP)
                        offN = Split(offNamen, W_SEP)
                        For j = LBound(offS) To UBound(offS)
                            If InStr(ueber, "|" & LCase(Trim(offN(j))) & "|") > 0 Or _
                               InStr(ueber, "|" & LCase(Trim(offS(j))) & "|") > 0 Then
                                eOhneSchl = Anhaengen(eOhneSchl, CStr(offS(j)), W_SEP)
                                eOhneNamen = Anhaengen(eOhneNamen, Zitat(CStr(offN(j))), ", ")
                                treffer = treffer & "|" & LCase(Trim(offN(j))) & "|" & LCase(Trim(offS(j))) & "|"
                            Else
                                offenBlock = Anhaengen(offenBlock, CStr(offAnz(j)))
                            End If
                        Next j
                    End If
                    fehl = WFehlend(eOhneSchl, fehl)
                    ' alle neuen Absender uebersprungen und im Ziel bisher keine: die Ausnahme bleibt aus (alter Stand)
                    If fehl = "" And Not zielAktiv And wz = "" Then eOhneTypen = eOhneTypen & "|" & t & "|"
                End If
                If InStr(eOhneTypen, "|" & t & "|") > 0 Then
                    ' nichts zu tun fuer diesen Typ
                ElseIf fehl = "" And Not zielAktiv Then
                    aend = Anhaengen(aend, BedTypName(t) & " einschalten")
                ElseIf fehl <> "" Then
                    If t = BED_FROM Or t = BED_SENTTO Then
                        ' neue Empfaenger mit Namen: die ersten drei, Rest "und n weitere"
                        nmListe = EmpfNamenFuer(BedNachTyp(exQ, t), fehl)
                        If WAnzahl(nmListe) < WAnzahl(fehl) Then nmListe = fehl
                        aend = Anhaengen(aend, BedTypName(t) & " + " & WAnzeigen(nmListe, 3))
                    Else
                        aend = Anhaengen(aend, BedTypName(t) & " + " & WAnzeigen(fehl, 3))
                    End If
                End If
            ElseIf t = BED_IMPORTANCE Then
                If zielAktiv And wz <> wq Then
                    SchrittPruefen = "blockiert: Ausnahme Wichtigkeit ist schon mit anderem Wert aktiv"
                    Exit Function
                End If
                If Not zielAktiv Then aend = Anhaengen(aend, BedTypName(t))
            ElseIf Not zielAktiv Then
                aend = Anhaengen(aend, BedTypName(t))
            End If
        Next i
        If offenBlock <> "" Then
            SchrittPruefen = "blockiert: Empfänger nicht auflösbar: " & offenBlock & " – einzelne Absender lassen sich über " & _
                             "Spalte " & SpaltenBuchstabe(SP_UEBERSPR) & " überspringen (es bleibt für sie der alte Stand)"
            Exit Function
        End If
        ' Eintraege der Spalte "Überspringen", die keinen nicht aufloesbaren neuen Absender treffen
        If ueber <> "|" Then
            uTeile = Split(Replace(Replace(Replace(pUeber(k), vbCr, ";"), vbLf, ";"), "|", ";"), ";")
            For j = LBound(uTeile) To UBound(uTeile)
                If Trim(uTeile(j)) <> "" Then
                    If InStr(treffer, "|" & LCase(Trim(uTeile(j))) & "|") = 0 Then
                        unbenutzt = Anhaengen(unbenutzt, Zitat(Trim(uTeile(j))), ", ")
                    End If
                End If
            Next j
        End If
        If eOhneNamen <> "" Then
            ohneHinweis = " · übersprungen (nicht auflösbar, Spalte " & SpaltenBuchstabe(SP_UEBERSPR) & "): " & eOhneNamen
        End If
        If unbenutzt <> "" Then
            ohneHinweis = ohneHinweis & " · Hinweis: Spalte " & SpaltenBuchstabe(SP_UEBERSPR) & " nennt " & unbenutzt & _
                          " – kein nicht auflösbarer neuer Absender, nichts übersprungen"
        End If
        If aend = "" Then
            SchrittPruefen = "schon erledigt" & ohneHinweis
            Exit Function
        End If
        eFall = "AUSN": eId = id
        Set eQuelle = src
        eKurz = "Ausnahmen + " & aend
        If eOhneNamen <> "" Then eKurz = eKurz & " (ohne " & eOhneNamen & ": nicht auflösbar)"
        If anwenden Then
            For i = LBound(typen) To UBound(typen)
                t = CLng(typen(i))
                If InStr(eOhneTypen, "|" & t & "|") = 0 Then
                    WRec mAusW(0), t, aq, wq
                    WRec mAusW(id), t, az, wz
                    fehl = WFehlend(wz, wq)
                    If t = BED_FROM Or t = BED_SENTTO Then fehl = WFehlend(eOhneSchl, fehl)
                    mAusW(id) = WSetzen(mAusW(id), t, True, Anhaengen(wz, fehl, W_SEP))
                    If Not TypenEnthalten(mAusTypen(id), t) Then mAusTypen(id) = Anhaengen(mAusTypen(id), CStr(t), ", ")
                End If
            Next i
            mBeruehrt(id) = True
        End If
        pSpeichern(k) = True
        SchrittPruefen = "bereit · Ausnahmen + " & aend & ohneHinweis

    Case "KOPIEREN"
        nm = Trim(pRegel(k))
        qn = Trim(pQuelle(k))
        If qn = "" Then qn = nm
        If nm = "" Then
            SchrittPruefen = "blockiert: Name der Regel fehlt (Spalte " & SpaltenBuchstabe(SP_REGEL) & ")"
            Exit Function
        End If
        id = SucheName(nm)
        fall = "KOP_A"
        If id = 0 Then
            id = SucheName("Kopie von " & qn)
            fall = "KOP_B"
        End If
        If id = -1 Then
            SchrittPruefen = "blockiert: Regelname im Zielpostfach mehrfach vergeben"
            Exit Function
        End If
        If id > 0 Then
            ' a) Regel mit dem neuen Namen vorhanden bzw. b) "Kopie von <Quelle>" aus Outlook
            gRegelId = id
            If Not mLesbar(id) Then
                SchrittPruefen = "blockiert: Regel " & Zitat(mName(id)) & " im Zielpostfach nicht lesbar (" & mGrund(id) & ")"
                Exit Function
            End If
            If mNSicht(id) = 0 Then
                SchrittPruefen = "blockiert: Regel " & Zitat(mName(id)) & " hat keine sichtbare Bedingung – würde bei " & _
                                 "jeder Mail greifen. Bitte in Outlook prüfen."
                Exit Function
            End If
            ' Vergleich mit der Quellregel: Outlook-Kopie (b) muss gleich sein, sonst blockiert; bei a nur Hinweis.
            ' Laesst sich die Quelle nicht lesen, sagt die Vorschauzeile, dass nicht verglichen wurde.
            If gQuellRegeln Is Nothing Then
                hinweis = " · Hinweis: Quellpostfach nicht lesbar (" & gQuellFehler & ") – nicht mit der Quellregel verglichen"
            Else
                Set src = QuellRegelFinden(gQuellRegeln, qn, f)
                If src Is Nothing Then
                    hinweis = " · Hinweis: " & f & " – nicht mit der Quellregel verglichen"
                Else
                    pq = QuelleLesen(src)
                    If pq = "" Then
                        b = QuellVergleich(id)
                        If b <> "" And fall = "KOP_B" Then
                            SchrittPruefen = "blockiert: " & b & " der Outlook-Kopie weichen von der Quellregel ab – " & _
                                             "bitte in Outlook prüfen"
                            Exit Function
                        End If
                        If b <> "" Then hinweis = " · Hinweis: " & b & " weichen von der Quellregel ab"
                    Else
                        hinweis = " · Hinweis: Quellregel nicht lesbar (" & pq & ") – Bedingungen nicht mit der " & _
                                  "Quellregel verglichen"
                    End If
                End If
            End If
            b = OrdnerAngleichen(k, id, ziel, neuV, neuK)
            If b <> "" Then
                SchrittPruefen = "blockiert: " & b
                Exit Function
            End If
            posErl = True
            If Trim(pNeu(k)) <> "" Then
                b = PositionPruefen(id, pNeu(k), False, posErl)
                If b <> "" Then
                    SchrittPruefen = "blockiert: " & b
                    Exit Function
                End If
            End If
            If fall = "KOP_A" And Not eVerSetzen And Not eKopSetzen And posErl Then
                SchrittPruefen = "schon erledigt (Regel vorhanden)" & hinweis
                Exit Function
            End If
            eFall = fall: eId = id: eName = nm
            If anwenden Then
                If fall = "KOP_B" Then mName(id) = nm
                OrdnerAnwenden id
                mBeruehrt(id) = True
            End If
            If Not posErl Then b = PositionPruefen(id, pNeu(k), anwenden, posErl)
            pSpeichern(k) = True
            If fall = "KOP_A" Then
                st = "bereit · Regel vorhanden, wird angeglichen"
            Else
                st = "bereit · Kopie aus Outlook (" & Zitat("Kopie von " & qn) & ") wird umbenannt"
                eKurz = Anhaengen("Outlook-Kopie umbenennen", eKurz, ", ")
            End If
            If gPosText <> "" Then
                st = st & ", " & gPosText
                eKurz = Anhaengen(eKurz, gPosText, ", ")
            End If
            SchrittPruefen = st & OrdnerHinweis(eNeueOrdner) & hinweis
            Exit Function
        End If
        ' c) neu anlegen oder d) blockieren
        If gQuellRegeln Is Nothing Then
            SchrittPruefen = "blockiert: Quellpostfach nicht lesbar (" & gQuellFehler & ")"
            Exit Function
        End If
        Set src = QuellRegelFinden(gQuellRegeln, qn, f)
        If src Is Nothing Then
            SchrittPruefen = "blockiert: " & f
            Exit Function
        End If
        If Not QuelleKopierbar(src, b) Then
            SchrittPruefen = "blockiert: " & b & ". " & AnleitungKopieren()
            Exit Function
        End If
        If mVerAn(0) And pVer(k) = "" Then
            SchrittPruefen = "blockiert: Quellregel verschiebt nach " & RelPfad(mVerPfad(0)) & " – Ziel in Spalte " & _
                             SpaltenBuchstabe(SP_VER) & " angeben"
            Exit Function
        End If
        If Not mVerAn(0) And pVer(k) <> "" Then
            SchrittPruefen = "blockiert: Quellregel verschiebt nicht – Spalte " & SpaltenBuchstabe(SP_VER) & " leer lassen"
            Exit Function
        End If
        If mKopAn(0) And pKop(k) = "" Then
            SchrittPruefen = "blockiert: Quellregel kopiert nach " & RelPfad(mKopPfad(0)) & " – Ziel in Spalte " & _
                             SpaltenBuchstabe(SP_KOP) & " angeben"
            Exit Function
        End If
        If Not mKopAn(0) And pKop(k) <> "" Then
            SchrittPruefen = "blockiert: Quellregel kopiert nicht – Spalte " & SpaltenBuchstabe(SP_KOP) & " leer lassen"
            Exit Function
        End If
        If pVer(k) <> "" Then
            b = ZielOrdnerPruefen(ziel, pVer(k), neuV)
            If b <> "" Then
                SchrittPruefen = "blockiert: " & b
                Exit Function
            End If
            eVerSetzen = True: eVer = pVer(k)
        End If
        If pKop(k) <> "" Then
            b = ZielOrdnerPruefen(ziel, pKop(k), neuK)
            If b <> "" Then
                SchrittPruefen = "blockiert: " & b
                Exit Function
            End If
            eKopSetzen = True: eKop = pKop(k)
        End If
        offen = QuellNichtAufloesbar(src)
        If offen <> "" Then
            SchrittPruefen = "blockiert: Empfänger nicht auflösbar: " & offen
            Exit Function
        End If
        eNeueOrdner = neuV
        If neuK <> "" Then
            If PfadNorm(neuK) <> PfadNorm(neuV) Then eNeueOrdner = Anhaengen(eNeueOrdner, neuK, "|")
        End If
        eFall = "KOP_C": eName = nm
        Set eQuelle = src
        st = "bereit · wird neu angelegt (" & mBed(0) & ")"
        eKurz = "neu angelegt"
        If eVerSetzen Then eKurz = eKurz & ", verschieben nach " & RelPfad(eVer)
        If anwenden Then
            id = RegelAnhaengen(nm)
            gRegelId = id
            mAktiv(id) = mAktiv(0): mBed(id) = mBed(0): mAus(id) = mAus(0): mTypen(id) = mTypen(0)
            mAusTypen(id) = mAusTypen(0): mNSicht(id) = mNSicht(0)
            mBedW(id) = WNurAktiv(mBedW(0)): mAusW(id) = WNurAktiv(mAusW(0))
            mVerAn(id) = mVerAn(0): mKopAn(id) = mKopAn(0): mWeiAn(id) = mWeiAn(0): mUmlAn(id) = mUmlAn(0)
            If mWeiAn(0) Then mWeiEmpf(id) = mWeiEmpf(0): mWeiNamen(id) = mWeiNamen(0)
            If mUmlAn(0) Then mUmlEmpf(id) = mUmlEmpf(0): mUmlNamen(id) = mUmlNamen(0)
            mHalt(id) = mHalt(0)
            mAkt(id) = mAkt(0)
            If eVerSetzen Then mAkt(id) = Replace(mAkt(id), mVerPfad(0), eVer)
            If eKopSetzen Then mAkt(id) = Replace(mAkt(id), mKopPfad(0), eKop)
            OrdnerAnwenden id
            eId = id
            If Trim(pNeu(k)) <> "" Then
                b = PositionPruefen(id, pNeu(k), True, posErl)
                If b <> "" Then
                    SchrittPruefen = "blockiert: " & b
                    Exit Function
                End If
                st = st & ", " & gPosText
                eKurz = eKurz & ", " & gPosText
            Else
                st = st & ", ans Ende"
            End If
        End If
        pSpeichern(k) = True
        SchrittPruefen = st & OrdnerHinweis(eNeueOrdner)

    Case "DEAKTIVIEREN"
        id = RegelFinden(pRegel(k))
        If id <= 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
        ElseIf Not mAktiv(id) Then
            gRegelId = id
            SchrittPruefen = "schon erledigt"
        Else
            gRegelId = id
            eFall = "AUS": eId = id
            eKurz = "deaktivieren"
            If anwenden Then mAktiv(id) = False: mBeruehrt(id) = True
            pSpeichern(k) = True
            SchrittPruefen = "bereit · deaktivieren"
        End If

    Case "LOESCHEN"
        ' Spalte "Neuer Name / Position / Wert": "gleich: <Regel, die bleibt>" (Duplikat) oder "ohne Ersatz"
        nm = Trim(pNeu(k))
        qn = ""
        If LCase(nm) = "duplikate" Then
            ' Alle Regeln dieses Namens bis auf die erste: jede muss ein belegbares Duplikat der ersten sein
            nmListe = NamensGruppe(pRegel(k), j)
            If j = 0 Then
                id = RegelFinden(pRegel(k))
                If id = -2 Then
                    SchrittPruefen = NichtGefunden(k, pRegel(k), id)
                Else
                    SchrittPruefen = "blockiert: Regel " & Zitat(pRegel(k)) & " nicht gefunden – bei „Duplikate“ steht in Spalte " & _
                                     SpaltenBuchstabe(SP_REGEL) & " der Name, den alle Duplikate tragen"
                End If
                Exit Function
            End If
            typen = Split(nmListe, "|")
            id = CLng(typen(1))
            gRegelId = id
            If j = 1 Then
                SchrittPruefen = "schon erledigt · es gibt nur 1 Regel " & Zitat(mName(id)) & " (kein Duplikat)"
                Exit Function
            End If
            For i = 2 To j
                idNeu = CLng(typen(i))
                b = DuplikatPruefen(idNeu, id)
                If b <> "" Then
                    SchrittPruefen = "blockiert: Regel auf Platz " & Platz(idNeu) & ": " & b & ". Einzelne Regeln lassen sich als " & _
                                     Zitat("Name #n/m") & " ansprechen"
                    Exit Function
                End If
                eWegIds = eWegIds & "|" & idNeu
            Next i
            eWegIds = eWegIds & "|"
            eWegAnz = j - 1
            eFall = "WEG": eId = 0: eAnker = id
            eKurz = "löschen: " & eWegAnz & IIf(eWegAnz = 1, " Duplikat (", " Duplikate (") & PlatzText(eWegIds) & _
                    "), es bleibt die Regel auf Platz " & Platz(id)
            If anwenden Then
                For i = 2 To j
                    RegelEntfernen CLng(typen(i))
                Next i
            End If
            pSpeichern(k) = True
            SchrittPruefen = "bereit · " & eKurz
            Exit Function
        End If
        If LCase(nm) <> "ohne ersatz" Then
            If LCase(Left(nm, 6)) = "gleich" Then
                qn = Trim(Mid(nm, 7))
                If Left(qn, 1) = ":" Then qn = Trim(Mid(qn, 2))
            End If
            If qn = "" Then
                SchrittPruefen = "blockiert: Begründung fehlt (Spalte " & SpaltenBuchstabe(SP_NEU) & "): „Duplikate“ (alle " & _
                                 "gleichnamigen bis auf die erste), „gleich: <Regel, die bleibt>“ oder „ohne Ersatz“"
                Exit Function
            End If
        End If
        id = RegelFinden(pRegel(k))
        If id < 0 Then
            SchrittPruefen = NichtGefunden(k, pRegel(k), id)
            Exit Function
        End If
        If id = 0 Then
            b = WegPruefen(pRegel(k), hinweis)
            If b <> "" Then
                SchrittPruefen = "blockiert: " & b
            Else
                SchrittPruefen = "schon erledigt · " & hinweis
            End If
            Exit Function
        End If
        gRegelId = id
        hinweis = ""
        If qn = "" Then
            eFall = "WEG": eId = id: eAnker = 0: eWegAnz = 1
            eKurz = "löschen ohne Ersatz (Regel ist " & IIf(mAktiv(id), "eingeschaltet", "ausgeschaltet") & ")"
            If Not mLesbar(id) Then hinweis = " · Regel nicht lesbar"
        Else
            idNeu = RegelFinden(qn)
            If idNeu < 0 Then
                SchrittPruefen = NichtGefunden(k, qn, idNeu)
                Exit Function
            End If
            If idNeu = 0 Then
                SchrittPruefen = "blockiert: Regel, die bleiben soll, nicht gefunden: " & Zitat(qn)
                Exit Function
            End If
            If idNeu = id Then
                SchrittPruefen = "blockiert: " & Zitat(qn) & " ist dieselbe Regel – eine Regel ist nicht ihr eigenes Duplikat"
                Exit Function
            End If
            b = DuplikatPruefen(id, idNeu)
            If b <> "" Then
                SchrittPruefen = "blockiert: " & b
                Exit Function
            End If
            eFall = "WEG": eId = id: eAnker = idNeu: eWegAnz = 1
            eKurz = "löschen – Duplikat von " & Zitat(mName(idNeu)) & " (Platz " & Platz(idNeu) & ", bleibt)"
        End If
        If anwenden Then RegelEntfernen id
        pSpeichern(k) = True
        SchrittPruefen = "bereit · " & eKurz & hinweis

    Case Else
        SchrittPruefen = "blockiert: Aktion " & Zitat(pAktion(k)) & " unbekannt"
    End Select
End Function

' Ohne sichtbare Bedingung vor aktiven Regeln: "1 Regel ohne ..." bzw. "2 Regeln ohne ..."
Private Function AbfangKurz() As String
    AbfangKurz = IIf(gAbfang = 1, "1 Regel", gAbfang & " Regeln") & " ohne sichtbare Bedingung vor aktiven Regeln"
End Function

Public Function SperrText() As String
    Dim s As String
    If gNichtLesbar > 0 Then s = gNichtLesbar & " Regel(n) im Zielpostfach nicht lesbar"
    If gAbfang > 0 Then s = Anhaengen(s, AbfangKurz())
    SperrText = "blockiert: Speichern gesperrt – " & s & " (siehe Stand Zielpostfach" & _
                IIf(gNichtLesbar > 0, " und Blatt Live)", ")")
End Function

' Spielt alle ausgewaehlten Zeilen auf dem Abbild durch (Abbild vorher mit StandLesen fuellen).
' Gesperrt wird nach dem Stand, den Outlook speichern wuerde: nicht lesbare Regeln (Stand in Outlook) und Regeln
' ohne sichtbare Bedingung, die verschieben oder stoppen und vor aktiven Regeln stehen - letztere nach allen
' ausgewaehlten Zeilen (eine neue Regel hinter der Sammelregel sperrt, ein Plan, der sie ans Ende setzt oder
' deaktiviert, hebt die Sperre auf). Freigabe beider Sperren nur ueber die Einstellung "Trotz ..." = Ja.
' Rueckgabe: Anzahl blockierter Zeilen.
Public Function Simulieren(ByVal ol As Object, ByVal ziel As Object) As Long
    Dim k As Long, n As Long
    BezuegeLeeren
    ' Namen vor dem Durchspielen festhalten (der Plan benennt Regeln im Abbild um)
    gNichtLesbar = AnzahlNichtLesbar()
    gNamenNichtLesbar = NamenNichtLesbar(3)
    gOhneBed = AnzahlOhneBed()
    gNamenOhneBed = NamenOhneBed(4)
    gAnzGelesen = mAnz
    NamenFesthalten
    gAbfangVorher = AbfangAnzahl()
    gNamenAbfangVorher = AbfangNamen(2)
    For k = 1 To pAnz
        pStatus(k) = "": pKurz(k) = "": pFall(k) = "": pOhne(k) = False: pOhneNamen(k) = "": pWegAnz(k) = 0
    Next k
    For k = 1 To pAnz
        If pAusf(k) Then
            pStatus(k) = SchrittPruefen(k, True, ol, ziel)
            If gUmzugHinweis <> "" Then pStatus(k) = pStatus(k) & gUmzugHinweis
            pKurz(k) = eKurz
            pFall(k) = eFall
            pWegAnz(k) = eWegAnz
            If Left(pStatus(k), 6) = "bereit" Then pOhneNamen(k) = eOhneNamen
            ' Aendert der Schritt eine Regel ohne sichtbare Bedingung, steht das in seiner Zeile (und in der Liste
            ' der Aenderungen vor dem Ausfuehren)
            If Left(pStatus(k), 6) = "bereit" And pSpeichern(k) And gRegelId > 0 Then
                If mOhneBed(gRegelId) Then
                    pStatus(k) = pStatus(k) & HINWEIS_OHNE
                    pOhne(k) = True
                End If
            End If
        Else
            pStatus(k) = "nicht ausgewählt"
            pSpeichern(k) = False
        End If
    Next k
    gAbfang = AbfangAnzahl()
    gNamenAbfang = AbfangNamen(2)
    If (gNichtLesbar > 0 Or gAbfang > 0) And Not gTrotz Then
        For k = 1 To pAnz
            If pAusf(k) And pSpeichern(k) And Left(pStatus(k), 6) = "bereit" Then pStatus(k) = SperrText()
        Next k
    End If
    For k = 1 To pAnz
        If Left(pStatus(k), 9) = "blockiert" Then n = n + 1
    Next k
    Simulieren = n
End Function

' Stand des Zielpostfachs: nicht lesbare Regeln und Regeln ohne sichtbare Bedingung wie in Outlook (vor dem
' Durchspielen festgehalten), Regeln ohne sichtbare Bedingung vor aktiven Regeln nach dem Plan (Vorschau).
Public Function PostfachStatusText() As String
    Dim ohne As String, nl As String, ab As String, s As String, behoben As String
    If gOhneBed > 0 Then ohne = gOhneBed & " ohne sichtbare Bedingung: " & gNamenOhneBed
    If gNichtLesbar > 0 Then nl = gNichtLesbar & " von " & gAnzGelesen & " Regeln nicht lesbar"
    If gAbfang > 0 Then ab = AbfangKurz()
    If gAbfang = 0 And gAbfangVorher > 0 Then
        behoben = " · in Outlook steht noch " & gNamenAbfangVorher & " – nach dem Plan nicht mehr"
    End If
    If gAnzGelesen = 0 Then
        PostfachStatusText = "Speichern möglich – keine Regeln im Postfach"
    ElseIf (nl <> "" Or ab <> "") And Not gTrotz Then
        If nl <> "" Then s = nl & ": " & gNamenNichtLesbar & " (Blatt Live)"
        If ab <> "" Then
            s = Anhaengen(s, ab & ": " & gNamenAbfang & " – würde alle folgenden Mails abfangen; unplausibel, die " & _
                             "Bedingung ist vermutlich nur nicht sichtbar (Outlook im Web). In Outlook prüfen oder " & _
                             "per Plan ans Ende setzen bzw. deaktivieren", " · ")
        End If
        PostfachStatusText = "Speichern gesperrt – " & s
    ElseIf nl <> "" Or ab <> "" Then
        s = "Speichern freigegeben trotz " & nl & IIf(nl <> "" And ab <> "", " und ", "") & ab & " (Einstellung „Ja“): "
        If nl <> "" Then s = s & gNamenNichtLesbar
        If ab <> "" Then s = s & IIf(nl <> "", " · ", "") & gNamenAbfang
        PostfachStatusText = s & IIf(ohne = "", "", " · " & ohne)
    ElseIf gOhneBed > 0 Then
        PostfachStatusText = "Speichern möglich mit Bestätigung – alle " & gAnzGelesen & " Regeln lesbar, " & ohne & _
                             " (vor dem Ausführen bestätigen)" & behoben
    Else
        PostfachStatusText = "Speichern möglich – alle " & gAnzGelesen & " Regeln lesbar" & behoben
    End If
End Function

' Stand aus dem gerade gelesenen Abbild (fuer "Regeln aus Outlook lesen", Ausfuehren und Nachpruefung).
Public Sub PostfachStandMerken()
    gNichtLesbar = AnzahlNichtLesbar()
    gNamenNichtLesbar = NamenNichtLesbar(3)
    gOhneBed = AnzahlOhneBed()
    gNamenOhneBed = NamenOhneBed(4)
    gAnzGelesen = mAnz
    NamenFesthalten
    gAbfang = AbfangAnzahl()
    gNamenAbfang = AbfangNamen(2)
    gAbfangVorher = gAbfang
    gNamenAbfangVorher = gNamenAbfang
End Sub
