Option Explicit
' ============================================================================
' modOrdner - Blatt "Ordner" (Plan 3.0): Ordner beider Postfaecher umstellen (anlegen, verschieben, umbenennen),
' danach alle Regeln beider Postfaecher pruefen; "Ordner zurueck" nimmt die protokollierten Umzuege zurueck.
'
'   Vorschau        -> OrdnerVorschau       nur lesen: Ordnerbaum und Regelziele beider Postfaecher, Plan im Abbild
'   Ausfuehren      -> OrdnerAusfuehren     nur nach Vorschau ohne Blocker und mit unveraendertem Plan (Pruefwert) und
'                                           unveraendertem Stand in Outlook; Rueckfrage (Vorgabe Nein), Ordner-Sicherung,
'                                           Schritte in Planreihenfolge, bei Fehler sofort Stopp, danach Regelpruefung
'   Regeln pruefen  -> OrdnerRegelnPruefen  nur lesen: zeigt jede Verschieben-/Kopieren-Aktion auf einen Ordner?
'   Ordner zurueck  -> OrdnerZurueck        Umzuege/Umbenennungen laut Blatt Ordner-Sicherung rueckwaerts
'
' Regeln werden hier nie geaendert und nie gespeichert (kein Rules.Save, auch nicht im Quellpostfach): Outlook merkt
' sich in einer Regel den Zielordner selbst (EntryID), nicht seinen Pfad - nach dem Verschieben zeigt die Regel auf den
' neuen Pfad. Genau das prueft die Nachpruefung. Geloescht wird nichts. Schreibende Zugriffe nur ueber modOlSchreiben
' (OrdnerNeuAnlegen, OrdnerVerschiebenNach, OrdnerNameSetzen); der Build prueft das statisch.
'
' Abbild: Ordnerbaum je Postfach (Name, Elternknoten, EntryID) und die Regelziele (Regel, Art, Knoten, Pfad). Die
' Vorschau spielt den Plan darauf durch (wie modPlan fuer Regeln): "schon erledigt", wenn der Endzustand da ist (Quelle
' weg, Ziel da; angelegter Ordner da), "blockiert", wenn Quelle oder Zielordner fehlen, der Name schon vergeben ist oder
' die Pfade nicht passen - ein abweichender Name wird nie geraten, die Meldung nennt aehnliche Namen.
' Ein Verschieben mit neuem Namen sind zwei Outlook-Schritte (erst MoveTo, dann Name); jeder steht sofort nach dem
' Gelingen im Blatt Ordner-Sicherung (Art "verschoben" bzw. "umbenannt", Stand "ausgefuehrt"), damit "Ordner zurueck"
' auch nach einem Abbruch genau weiss, was geschehen ist.
' ============================================================================

Private Const O_MAX As Long = 20000
Private Const O_TIEFE As Long = 40
Private Const O_FEHLER_NR As Long = -2147220990
Private Const O_REGELN_ZEILE As Long = 6

' Postfaecher (aus der Spalte Postfach bzw. aus dem Blatt Ordner-Sicherung)
Private opfAnz As Long
Private opfAdr() As String
Private opfName() As String
Private opfStore() As Object
Private opfWurzel() As Long

' Ordnerbaum; ...0 = Stand vor dem Durchspielen (fuer die Sicherung)
Private obAnz As Long
Private obPf() As Long
Private obName() As String
Private obEltern() As Long
Private obEid() As String
Private obNeu() As Boolean
Private obName0() As String
Private obEltern0() As Long

' Plan
Private opAnz As Long
Private opZeile() As Long
Private opNr() As String
Private opAusf() As Boolean
Private opPfText() As String
Private opPf() As Long
Private opAktion() As String
Private opHeute() As String
Private opNeu() As String
Private opRelH() As String
Private opRelN() As String
Private opFehler() As String
Private opStatus() As String
Private opErgebnis() As String
Private opRegeln() As String
Private opRz() As String
Private opKnoten() As Long
Private opEltern() As Long
Private opAltName() As String
Private opNeuName() As String
Private opEid() As String
' volle Pfade (aus dem Abbild): vorher, nach dem Verschieben (alter Name), nachher
Private opVorVoll() As String
Private opZwVoll() As String
Private opNachVoll() As String

' Regelziele (aktive Aktionen "In Ordner verschieben/kopieren" aller Regeln der gelesenen Postfaecher)
Private rzAnz As Long
Private rzPf() As Long
Private rzRegel() As String
Private rzArt() As String
Private rzAktiv() As Boolean
Private rzKnoten() As Long
Private rzPfad() As String
Private rzSoll() As String
Private rzEid() As String
Private rzFehler() As String

' Ausgefuehrte Schritte dieses Laufs (voller Pfad vorher -> nachher), fuer den erwarteten Stand der Regeln
Private ozAnz As Long
Private ozVor() As String
Private ozNach() As String

Private oLauf As String
Private oSichZeile As Long
Private oFolge As Long
' Zeile des zuletzt geschriebenen Schritts im Blatt Ordner-Sicherung
Private oJzZeile As Long

Public Function OrdnerVersion() As String
    OrdnerVersion = "Ordner 3.0"
End Function

Private Function OBlatt(ByVal blattName As String) As Object
    Set OBlatt = ThisWorkbook.Worksheets(blattName)
End Function

Private Sub OBild(ByVal an As Boolean)
    On Error Resume Next
    Application.ScreenUpdating = an
    On Error GoTo 0
End Sub

Private Function OSpalte(ByVal c As Long) As String
    OSpalte = Mid("ABCDEFGHIJKLMNOPQRSTUVWXYZ", c, 1)
End Function

Private Sub OFehler(ByVal text As String)
    Err.Raise O_FEHLER_NR, "Ordner", text
End Sub

' ---------------------------------------------------------------- Layout und Plan

' Namen da, Kopfzeile des Plans an ihrem Platz? Rueckgabe "" oder Beschreibung.
Public Function OLayoutPruefen() As String
    Dim ws As Object, s As String, kopf As Object, plan As Object, k As Long, nm As Variant, spalten As Variant
    Dim texte As Variant, ist As String
    Set ws = Nothing
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(BLATT_ORDNER)
    On Error GoTo 0
    If ws Is Nothing Then
        OLayoutPruefen = "Blatt " & BLATT_ORDNER & " fehlt"
        Exit Function
    End If
    nm = Array(N_O_STATUS, N_O_VORSCHAU_ZEIT, N_O_PRUEFWERT, N_O_AUSF_ZEIT)
    For k = LBound(nm) To UBound(nm)
        If NamensBereich(CStr(nm(k))) Is Nothing Then s = Anhaengen(s, "Name " & nm(k) & " fehlt")
    Next k
    Set kopf = NamensBereich(N_O_PLANKOPF)
    Set plan = NamensBereich(N_O_PLAN)
    If kopf Is Nothing Or plan Is Nothing Then
        s = Anhaengen(s, "Plan-Bereich (Namen " & N_O_PLANKOPF & "/" & N_O_PLAN & ") fehlt")
    Else
        If plan.Row <> kopf.Row + 1 Then s = Anhaengen(s, "Plan beginnt nicht direkt unter seiner Kopfzeile")
        If plan.Column <> OSP_NR Or kopf.Column <> OSP_NR Then s = Anhaengen(s, "Plan beginnt nicht in Spalte " & OSpalte(OSP_NR))
        spalten = Array(OSP_NR, OSP_AUSF, OSP_PF, OSP_AKTION, OSP_HEUTE, OSP_NEU, OSP_VORSCHAU, OSP_ERGEBNIS, OSP_REGELN, _
                        OSP_WARUM)
        texte = Array(OKOPF_NR, OKOPF_AUSF, OKOPF_PF, OKOPF_AKTION, OKOPF_HEUTE, OKOPF_NEU, OKOPF_VORSCHAU, _
                      OKOPF_ERGEBNIS, OKOPF_REGELN, OKOPF_WARUM)
        For k = LBound(spalten) To UBound(spalten)
            ist = ZellText(ws, kopf.Row, CLng(spalten(k)))
            If ist <> texte(k) Then
                s = Anhaengen(s, "Spalte " & OSpalte(CLng(spalten(k))) & " der Kopfzeile: erwartet " & _
                                 Zitat(CStr(texte(k))) & ", steht " & Zitat(ist))
            End If
        Next k
    End If
    If s <> "" Then
        s = "Das Blatt Ordner wurde umgebaut (" & s & "). Bitte die Änderung rückgängig machen oder die Mappe neu " & _
            "erzeugen – das Makro liest sonst womöglich falsche Zellen."
    End If
    OLayoutPruefen = s
End Function

Private Function OPlanLesen() As String
    Dim ws As Object, r As Long, n As Long, akt As String, f As String, plan As Object, erste As Long
    opAnz = 0
    f = OLayoutPruefen()
    If f <> "" Then
        OPlanLesen = f
        Exit Function
    End If
    Set ws = OBlatt(BLATT_ORDNER)
    Set plan = NamensBereich(N_O_PLAN)
    erste = plan.Row
    n = plan.Rows.Count
    ReDim opZeile(0 To n): ReDim opNr(0 To n): ReDim opAusf(0 To n): ReDim opPfText(0 To n): ReDim opPf(0 To n)
    ReDim opAktion(0 To n): ReDim opHeute(0 To n): ReDim opNeu(0 To n): ReDim opRelH(0 To n): ReDim opRelN(0 To n)
    ReDim opFehler(0 To n): ReDim opStatus(0 To n): ReDim opErgebnis(0 To n): ReDim opRegeln(0 To n): ReDim opRz(0 To n)
    ReDim opKnoten(0 To n): ReDim opEltern(0 To n): ReDim opAltName(0 To n): ReDim opNeuName(0 To n): ReDim opEid(0 To n)
    ReDim opVorVoll(0 To n): ReDim opZwVoll(0 To n): ReDim opNachVoll(0 To n)
    For r = erste To erste + n - 1
        akt = UCase(ZellText(ws, r, OSP_AKTION))
        If akt <> "" Then
            opAnz = opAnz + 1
            opZeile(opAnz) = r
            opNr(opAnz) = ZellText(ws, r, OSP_NR)
            If opNr(opAnz) = "" Then opNr(opAnz) = CStr(r - erste + 1)
            opAusf(opAnz) = (LCase(ZellText(ws, r, OSP_AUSF)) = "ja")
            opPfText(opAnz) = ZellText(ws, r, OSP_PF)
            opAktion(opAnz) = akt
            opHeute(opAnz) = ZellText(ws, r, OSP_HEUTE)
            opNeu(opAnz) = ZellText(ws, r, OSP_NEU)
        End If
    Next r
End Function

' Pruefwert ueber die Eingabespalten des Ordner-Plans.
Public Function OPlanPruefwert() As String
    Dim ws As Object, r As Long, c As Long, s As String, h As Double, i As Long, z As Long, spalten As Variant
    Dim plan As Object
    Set ws = OBlatt(BLATT_ORDNER)
    Set plan = NamensBereich(N_O_PLAN)
    spalten = Array(OSP_NR, OSP_AUSF, OSP_PF, OSP_AKTION, OSP_HEUTE, OSP_NEU)
    For r = plan.Row To plan.Row + plan.Rows.Count - 1
        For c = LBound(spalten) To UBound(spalten)
            s = s & "|" & ZellText(ws, r, CLng(spalten(c)))
        Next c
        s = s & "#"
    Next r
    For i = 1 To Len(s)
        z = AscW(Mid(s, i, 1))
        If z < 0 Then z = z + 65536
        h = h * 31 + z
        h = h - Int(h / 2147483629#) * 2147483629#
    Next i
    OPlanPruefwert = Right("00000000" & Hex(CLng(h)), 8)
End Function

' ---------------------------------------------------------------- Postfaecher

Private Sub PfLeeren()
    opfAnz = 0
    ReDim opfAdr(0 To 8): ReDim opfName(0 To 8): ReDim opfStore(0 To 8): ReDim opfWurzel(0 To 8)
End Sub

' Postfach nach Adresse (aus Spalte Postfach) im Profil suchen und aufnehmen; Rueckgabe Index (0 = Fehler in fehler).
Private Function PfAufnehmen(ByVal ol As Object, ByVal adresse As String, ByRef fehler As String) As Long
    Dim i As Long, st As Object, nm As String
    fehler = ""
    For i = 1 To opfAnz
        If LCase(opfAdr(i)) = LCase(Trim(adresse)) Then
            PfAufnehmen = i
            Exit Function
        End If
    Next i
    Set st = PostfachFinden(ol, adresse, fehler)
    If st Is Nothing Then Exit Function
    nm = PostfachName(st)
    For i = 1 To opfAnz
        If LCase(opfName(i)) = LCase(nm) Then
            PfAufnehmen = i
            Exit Function
        End If
    Next i
    opfAnz = opfAnz + 1
    If opfAnz > UBound(opfAdr) Then
        ReDim Preserve opfAdr(0 To opfAnz + 8): ReDim Preserve opfName(0 To opfAnz + 8)
        ReDim Preserve opfStore(0 To opfAnz + 8): ReDim Preserve opfWurzel(0 To opfAnz + 8)
    End If
    opfAdr(opfAnz) = Trim(adresse)
    opfName(opfAnz) = nm
    Set opfStore(opfAnz) = st
    PfAufnehmen = opfAnz
End Function

' Kurzname fuer Meldungen ("Bestandsuebertragungen")
Private Function PfKurz(ByVal pf As Long) As String
    Dim p As Long
    p = InStr(opfAdr(pf), "@")
    If p > 1 Then
        PfKurz = Left(opfAdr(pf), p - 1)
    Else
        PfKurz = opfAdr(pf)
    End If
End Function

' ---------------------------------------------------------------- Ordnerbaum

Private Sub BaumLeeren()
    obAnz = 0
    ReDim obPf(0 To 64): ReDim obName(0 To 64): ReDim obEltern(0 To 64): ReDim obEid(0 To 64): ReDim obNeu(0 To 64)
    ReDim obName0(0 To 0): ReDim obEltern0(0 To 0)
End Sub

Private Function KnotenNeu(ByVal pf As Long, ByVal nm As String, ByVal eltern As Long, ByVal eid As String) As Long
    Dim n As Long
    obAnz = obAnz + 1
    If obAnz > UBound(obName) Then
        n = 2 * UBound(obName) + 16
        ReDim Preserve obPf(0 To n): ReDim Preserve obName(0 To n): ReDim Preserve obEltern(0 To n)
        ReDim Preserve obEid(0 To n): ReDim Preserve obNeu(0 To n)
    End If
    obPf(obAnz) = pf
    obName(obAnz) = nm
    obEltern(obAnz) = eltern
    obEid(obAnz) = eid
    obNeu(obAnz) = False
    KnotenNeu = obAnz
End Function

Private Function OEid(ByVal f As Object) As String
    Dim s As String
    On Error Resume Next
    s = ""
    s = CStr(f.EntryID)
    On Error GoTo 0
    OEid = s
End Function

Private Function BaumLesen(ByVal pf As Long, ByRef fehler As String) As Boolean
    Dim wurzel As Object, w As Long, nr As Long, d As String
    fehler = ""
    Set wurzel = Nothing
    On Error Resume Next
    Set wurzel = opfStore(pf).GetRootFolder()
    nr = Err.Number: d = Err.Description
    On Error GoTo 0
    If nr <> 0 Or wurzel Is Nothing Then
        fehler = opfAdr(pf) & ": Stammordner nicht lesbar" & IIf(d <> "", " (" & d & ")", "")
        Exit Function
    End If
    w = KnotenNeu(pf, opfName(pf), 0, OEid(wurzel))
    opfWurzel(pf) = w
    KinderLesen wurzel, pf, w, 1, fehler
    BaumLesen = (fehler = "")
End Function

Private Sub KinderLesen(ByVal f As Object, ByVal pf As Long, ByVal idx As Long, ByVal tiefe As Long, ByRef fehler As String)
    Dim fs As Object, n As Long, i As Long, c As Object, nm As String, k As Long, nr As Long, d As String
    If fehler <> "" Then Exit Sub
    If tiefe > O_TIEFE Then
        fehler = "Ordnerbaum tiefer als " & O_TIEFE & " Ebenen: " & KnotenPfad(idx)
        Exit Sub
    End If
    Set fs = Nothing
    On Error Resume Next
    Set fs = f.Folders
    n = 0
    n = fs.Count
    nr = Err.Number: d = Err.Description
    On Error GoTo 0
    If nr <> 0 Then
        fehler = "Unterordner nicht lesbar: " & KnotenPfad(idx) & " (" & d & ")"
        Exit Sub
    End If
    For i = 1 To n
        Set c = Nothing
        nm = ""
        On Error Resume Next
        Set c = fs.Item(i)
        nm = c.Name
        nr = Err.Number
        On Error GoTo 0
        If nr <> 0 Or c Is Nothing Then
            fehler = "Ordner " & i & " in " & KnotenPfad(idx) & " nicht lesbar"
            Exit Sub
        End If
        If obAnz >= O_MAX Then
            fehler = "mehr als " & O_MAX & " Ordner – Abbruch beim Lesen"
            Exit Sub
        End If
        k = KnotenNeu(pf, nm, idx, OEid(c))
        KinderLesen c, pf, k, tiefe + 1, fehler
        If fehler <> "" Then Exit Sub
    Next i
End Sub

' Stand vor dem Durchspielen merken (Sicherung, Pfade vorher)
Private Sub BaumMerken()
    Dim i As Long
    ReDim obName0(0 To obAnz): ReDim obEltern0(0 To obAnz)
    For i = 1 To obAnz
        obName0(i) = obName(i)
        obEltern0(i) = obEltern(i)
    Next i
End Sub

' Pfad eines Knotens ohne \\postfach\ ("" fuer die Wurzel). vorher: Stand vor dem Durchspielen.
Private Function KnotenRelArt(ByVal i As Long, ByVal vorher As Boolean) As String
    Dim s As String, n As Long, nm As String, e As Long
    Do While i > 0 And n < 200
        ' kein "vorher And i <= UBound(...)": VBA wertet And nicht verkuerzt aus
        nm = obName(i): e = obEltern(i)
        If vorher Then
            If i <= UBound(obName0) Then
                nm = obName0(i): e = obEltern0(i)
            End If
        End If
        If e = 0 Then Exit Do
        If s = "" Then
            s = nm
        Else
            s = nm & "\" & s
        End If
        i = e
        n = n + 1
    Loop
    KnotenRelArt = s
End Function

Private Function KnotenRel(ByVal i As Long) As String
    KnotenRel = KnotenRelArt(i, False)
End Function

Private Function OVoll(ByVal pf As Long, ByVal rel As String) As String
    If rel = "" Then
        OVoll = "\\" & opfName(pf)
    Else
        OVoll = "\\" & opfName(pf) & "\" & rel
    End If
End Function

Private Function KnotenPfad(ByVal i As Long) As String
    If i <= 0 Then Exit Function
    KnotenPfad = OVoll(obPf(i), KnotenRel(i))
End Function

Private Function KnotenPfadVorher(ByVal i As Long) As String
    If i <= 0 Then Exit Function
    KnotenPfadVorher = OVoll(obPf(i), KnotenRelArt(i, True))
End Function

' Ort fuer Meldungen: „Archiv\X“ bzw. "der obersten Ebene"
Private Function OrtText(ByVal i As Long) As String
    If i <= 0 Then
        OrtText = "?"
    ElseIf obEltern(i) = 0 Then
        OrtText = "der obersten Ebene"
    Else
        OrtText = Zitat(KnotenRel(i))
    End If
End Function

Private Function NameGleich(ByVal a As String, ByVal b As String) As Boolean
    NameGleich = (LCase(Trim(a)) = LCase(Trim(b)))
End Function

Private Function Kind(ByVal eltern As Long, ByVal nm As String) As Long
    Dim i As Long
    For i = 1 To obAnz
        If obEltern(i) = eltern Then
            If NameGleich(obName(i), nm) Then
                Kind = i
                Exit Function
            End If
        End If
    Next i
End Function

' Knoten zu einem relativen Pfad (0 = fehlt). bis: tiefster vorhandener Knoten; fehltName: erster fehlender Name.
Private Function Suchen(ByVal pf As Long, ByVal rel As String, ByRef bis As Long, ByRef fehltName As String) As Long
    Dim teile As Variant, k As Long, i As Long, c As Long
    i = opfWurzel(pf)
    bis = i
    fehltName = ""
    If rel = "" Then
        Suchen = i
        Exit Function
    End If
    teile = Split(rel, "\")
    For k = LBound(teile) To UBound(teile)
        c = Kind(i, CStr(teile(k)))
        If c = 0 Then
            fehltName = CStr(teile(k))
            bis = i
            Exit Function
        End If
        i = c
    Next k
    bis = i
    Suchen = i
End Function

Private Function Finden(ByVal pf As Long, ByVal rel As String) As Long
    Dim b As Long, f As String
    Finden = Suchen(pf, rel, b, f)
End Function

Private Function IstUnter(ByVal i As Long, ByVal oben As Long) As Boolean
    Dim n As Long
    Do While i > 0 And n < 200
        If i = oben Then
            IstUnter = True
            Exit Function
        End If
        i = obEltern(i)
        n = n + 1
    Loop
End Function

Private Function Nachfahren(ByVal q As Long) As Long
    Dim i As Long
    For i = 1 To obAnz
        If i <> q And Not obNeu(i) Then
            If IstUnter(i, q) Then Nachfahren = Nachfahren + 1
        End If
    Next i
End Function

' Standardordner von Outlook (oberste Ebene) werden nie verschoben oder umbenannt.
Private Function IstStandardOrdner(ByVal i As Long) As Boolean
    If i <= 0 Then Exit Function
    If obEltern(i) <> opfWurzel(obPf(i)) Then Exit Function
    Select Case LCase(Trim(obName(i)))
        Case "posteingang", "inbox", "postausgang", "outbox", "gesendete elemente", "sent items", "entwürfe", "drafts", _
             "gelöschte elemente", "deleted items", "junk-e-mail", "junk email", "archiv", "archive", "kalender", _
             "calendar", "kontakte", "contacts", "aufgaben", "tasks", "notizen", "notes", "journal", _
             "synchronisierungsprobleme", "sync issues", "unterhaltungsverlauf", "conversation history"
            IstStandardOrdner = True
    End Select
End Function

' Ordner in Outlook ueber den relativen Pfad suchen (Namen ohne Gross-/Kleinschreibung und ohne Leerzeichen am Rand,
' wie im Abbild). Nothing, wenn er fehlt.
Private Function OLive(ByVal pf As Long, ByVal rel As String) As Object
    Dim f As Object, teile As Variant, k As Long, c As Object, fs As Object, n As Long, i As Long, nm As String
    Dim gef As Object
    Set f = Nothing
    On Error Resume Next
    Set f = opfStore(pf).GetRootFolder()
    If Err.Number <> 0 Then Set f = Nothing
    If rel <> "" And Not f Is Nothing Then
        teile = Split(rel, "\")
        For k = LBound(teile) To UBound(teile)
            Set gef = Nothing
            Set fs = Nothing
            Set fs = f.Folders
            n = 0
            n = fs.Count
            For i = 1 To n
                Set c = Nothing
                Set c = fs.Item(i)
                nm = ""
                nm = c.Name
                If NameGleich(nm, CStr(teile(k))) Then
                    Set gef = c
                    Exit For
                End If
            Next i
            Set f = gef
            If f Is Nothing Then Exit For
        Next k
    End If
    Err.Clear
    On Error GoTo 0
    Set OLive = f
End Function

' ---------------------------------------------------------------- Namen und Pfade aus dem Plan

' Pfad aus einer Planzeile: relativ ("Archiv\X") oder mit Postfach ("\\postfach\Archiv\X"); %2F wie "/".
' Rueckgabe "" oder Grund; rel: Teile getrimmt, mit "\" verbunden.
Private Function RelLesen(ByVal pf As Long, ByVal s As String, ByRef rel As String) As String
    Dim p As Long, teil As String, teile As Variant, k As Long
    rel = ""
    s = Trim(Replace(Replace(s, "%2F", "/"), "%2f", "/"))
    If Left(s, 2) = "\\" Then
        p = InStr(3, s, "\")
        If p = 0 Then
            teil = Mid(s, 3)
            s = ""
        Else
            teil = Mid(s, 3, p - 3)
            s = Mid(s, p + 1)
        End If
        If LCase(Trim(teil)) <> LCase(opfName(pf)) And LCase(Trim(teil)) <> LCase(opfAdr(pf)) Then
            RelLesen = "Pfad liegt im Postfach " & Trim(teil) & ", die Zeile nennt " & opfAdr(pf) & " – Ordner werden " & _
                       "nur innerhalb eines Postfachs verschoben"
            Exit Function
        End If
    End If
    Do While Left(s, 1) = "\"
        s = Mid(s, 2)
    Loop
    Do While Right(s, 1) = "\"
        s = Left(s, Len(s) - 1)
    Loop
    If Trim(s) = "" Then
        RelLesen = "Pfad ohne Ordnernamen"
        Exit Function
    End If
    teile = Split(s, "\")
    For k = LBound(teile) To UBound(teile)
        If Trim(teile(k)) = "" Then
            RelLesen = "Pfad mit leerem Ordnernamen: " & s
            rel = ""
            Exit Function
        End If
        If k = LBound(teile) Then
            rel = Trim(teile(k))
        Else
            rel = rel & "\" & Trim(teile(k))
        End If
    Next k
End Function

Private Function ElternRel(ByVal rel As String) As String
    Dim p As Long
    p = InStrRev(rel, "\")
    If p > 0 Then ElternRel = Left(rel, p - 1)
End Function

Private Function OLeaf(ByVal rel As String) As String
    OLeaf = Mid(rel, InStrRev(rel, "\") + 1)
End Function

' Aus einem vollen Pfad "\\postfach\a\b" den relativen ("a\b"); "" wenn nicht in diesem Postfach.
Private Function RelAusVoll(ByVal pf As Long, ByVal voll As String) As String
    Dim w As String
    voll = Replace(Replace(voll, "%2F", "/"), "%2f", "/")
    w = "\\" & opfName(pf)
    If LCase(voll) = LCase(w) Then Exit Function
    If LCase(Left(voll, Len(w) + 1)) = LCase(w) & "\" Then RelAusVoll = Mid(voll, Len(w) + 2)
End Function

Private Function ONorm(ByVal s As String) As String
    Dim i As Long, ch As String, t As String
    s = LCase(s)
    s = Replace(s, "ä", "ae")
    s = Replace(s, "ö", "oe")
    s = Replace(s, "ü", "ue")
    s = Replace(s, "ß", "ss")
    For i = 1 To Len(s)
        ch = Mid(s, i, 1)
        If (ch >= "a" And ch <= "z") Or (ch >= "0" And ch <= "9") Then t = t & ch
    Next i
    ONorm = t
End Function

' Editierabstand (Levenshtein) zweier normierter Namen
Private Function Abstand(ByVal a As String, ByVal b As String) As Long
    Dim la As Long, lb As Long, i As Long, j As Long, d() As Long, c As Long, x As Long
    la = Len(a): lb = Len(b)
    If la = 0 Or lb = 0 Then
        Abstand = la + lb
        Exit Function
    End If
    ReDim d(0 To la, 0 To lb)
    For i = 0 To la
        d(i, 0) = i
    Next i
    For j = 0 To lb
        d(0, j) = j
    Next j
    For i = 1 To la
        For j = 1 To lb
            c = 1
            If Mid(a, i, 1) = Mid(b, j, 1) Then c = 0
            x = d(i - 1, j) + 1
            If d(i, j - 1) + 1 < x Then x = d(i, j - 1) + 1
            If d(i - 1, j - 1) + c < x Then x = d(i - 1, j - 1) + c
            d(i, j) = x
        Next j
    Next i
    Abstand = d(la, lb)
End Function

Private Function Aehnlich(ByVal a As String, ByVal b As String) As Boolean
    Dim na As String, nb As String, m As Long
    na = ONorm(a): nb = ONorm(b)
    If na = "" Or nb = "" Then Exit Function
    If na = nb Then
        Aehnlich = True
        Exit Function
    End If
    If Len(na) >= 5 And Len(nb) >= 5 Then
        If InStr(na, nb) > 0 Or InStr(nb, na) > 0 Then
            Aehnlich = True
            Exit Function
        End If
    End If
    m = Len(na)
    If Len(nb) > m Then m = Len(nb)
    Aehnlich = (Abstand(na, nb) <= m \ 6 + 1)
End Function

' Fuer "nicht gefunden": aehnliche Namen unter dem Elternknoten und gleichnamige Ordner anderswo im Postfach.
Private Function AehnlichText(ByVal pf As Long, ByVal eltern As Long, ByVal nm As String) As String
    Dim i As Long, s As String, n As Long, g As String, ng As Long, t As String
    For i = 1 To obAnz
        If obPf(i) = pf And Not obNeu(i) And i <> opfWurzel(pf) Then
            If obEltern(i) = eltern Then
                If Aehnlich(obName(i), nm) Then
                    n = n + 1
                    If n <= 3 Then s = Anhaengen(s, Zitat(obName(i)), ", ")
                End If
            ElseIf NameGleich(obName(i), nm) Then
                ng = ng + 1
                If ng <= 2 Then g = Anhaengen(g, KnotenRel(i), "; ")
            End If
        End If
    Next i
    If n > 3 Then s = s & " und " & (n - 3) & " weitere"
    If s <> "" Then
        t = " · ähnlicher Name in " & OrtText(eltern) & ": " & s
    Else
        t = " · kein ähnlicher Name in " & OrtText(eltern)
    End If
    If g <> "" Then t = t & " · gleichnamiger Ordner an anderer Stelle: " & g
    AehnlichText = t & " – bitte die Zeile prüfen (das Makro rät nicht)"
End Function

' Welche andere Planzeile legt den Pfad erst an bzw. verschiebt einen Ordner dorthin? "" wenn keine.
Private Function OEntsteht(ByVal k As Long, ByVal pf As Long, ByVal rel As String) As String
    Dim j As Long, s As String
    For j = 1 To opAnz
        If j <> k And opPf(j) = pf And opRelN(j) <> "" Then
            If NameGleich(opRelN(j), rel) Then
                s = " – entsteht erst durch Zeile " & opNr(j)
                If Not opAusf(j) Then
                    s = s & " (nicht ausgewählt)"
                ElseIf Left(opStatus(j), 9) = "blockiert" Then
                    s = s & " (dort blockiert)"
                ElseIf j > k Then
                    s = s & " (steht weiter unten im Plan)"
                End If
                OEntsteht = s
                Exit Function
            End If
        End If
    Next j
End Function

' Pfade einer Planzeile pruefen und in opRelH/opRelN ablegen. Rueckgabe "" oder Grund.
Private Function OZeileLesen(ByVal k As Long) As String
    Dim f As String, pf As Long
    pf = opPf(k)
    Select Case opAktion(k)
        Case "ORDNER_ANLEGEN"
            If opHeute(k) <> "" Then
                OZeileLesen = "Spalte " & OSpalte(OSP_HEUTE) & " (Pfad heute) bei ORDNER_ANLEGEN leer lassen"
                Exit Function
            End If
            If opNeu(k) = "" Then
                OZeileLesen = "Pfad neu fehlt (Spalte " & OSpalte(OSP_NEU) & ")"
                Exit Function
            End If
            OZeileLesen = RelLesen(pf, opNeu(k), opRelN(k))
        Case "ORDNER_VERSCHIEBEN", "ORDNER_UMBENENNEN"
            If opHeute(k) = "" Or opNeu(k) = "" Then
                OZeileLesen = "Pfad heute und Pfad neu angeben (Spalten " & OSpalte(OSP_HEUTE) & ", " & OSpalte(OSP_NEU) & ")"
                Exit Function
            End If
            f = RelLesen(pf, opHeute(k), opRelH(k))
            If f = "" Then f = RelLesen(pf, opNeu(k), opRelN(k))
            OZeileLesen = f
    End Select
End Function

' ---------------------------------------------------------------- Schritt bewerten (wie modPlan.SchrittPruefen)

Private Function OSchritt(ByVal k As Long, ByVal anwenden As Boolean) As String
    Dim pf As Long, q As Long, z As Long, e As Long, b As Long, fn As String, nm As String, eltH As String
    Dim eltN As String, st As String, nU As Long
    opKnoten(k) = 0: opEltern(k) = 0: opAltName(k) = "": opNeuName(k) = "": opEid(k) = ""
    opVorVoll(k) = "": opZwVoll(k) = "": opNachVoll(k) = ""
    pf = opPf(k)
    If pf = 0 Then
        OSchritt = "blockiert: Postfach fehlt (Spalte " & OSpalte(OSP_PF) & ")"
        Exit Function
    End If
    If opFehler(k) <> "" Then
        OSchritt = "blockiert: " & opFehler(k)
        Exit Function
    End If
    Select Case opAktion(k)
    Case "ORDNER_ANLEGEN"
        If Finden(pf, opRelN(k)) > 0 Then
            OSchritt = "schon erledigt"
            Exit Function
        End If
        eltN = ElternRel(opRelN(k))
        e = Suchen(pf, eltN, b, fn)
        If e = 0 Then
            st = OEntsteht(k, pf, eltN)
            If st = "" Then st = AehnlichText(pf, b, fn)
            OSchritt = "blockiert: Elternordner fehlt: " & eltN & st
            Exit Function
        End If
        opEltern(k) = e
        opNeuName(k) = OLeaf(opRelN(k))
        opNachVoll(k) = OVoll(pf, opRelN(k))
        st = "bereit · wird angelegt in " & OrtText(e)
        If anwenden Then
            z = KnotenNeu(pf, opNeuName(k), e, "")
            obNeu(z) = True
        End If
        OSchritt = st

    Case "ORDNER_VERSCHIEBEN", "ORDNER_UMBENENNEN"
        eltH = ElternRel(opRelH(k))
        eltN = ElternRel(opRelN(k))
        nm = OLeaf(opRelN(k))
        If NameGleich(opRelH(k), opRelN(k)) Then
            OSchritt = "blockiert: Pfad heute und Pfad neu sind gleich"
            Exit Function
        End If
        If opAktion(k) = "ORDNER_VERSCHIEBEN" And NameGleich(eltH, eltN) Then
            OSchritt = "blockiert: Elternordner bleibt gleich, nur der Name ändert sich – Aktion ORDNER_UMBENENNEN verwenden"
            Exit Function
        End If
        If opAktion(k) = "ORDNER_UMBENENNEN" And Not NameGleich(eltH, eltN) Then
            OSchritt = "blockiert: Pfad neu liegt in einem anderen Ordner – zum Verschieben Aktion ORDNER_VERSCHIEBEN verwenden"
            Exit Function
        End If
        If LCase(Left(opRelN(k), Len(opRelH(k)) + 1)) = LCase(opRelH(k)) & "\" Then
            OSchritt = "blockiert: Pfad neu liegt im Ordner selbst"
            Exit Function
        End If
        q = Suchen(pf, opRelH(k), b, fn)
        z = Finden(pf, opRelN(k))
        If q = 0 Then
            If z > 0 Then
                OSchritt = "schon erledigt"
            Else
                st = OEntsteht(k, pf, opRelH(k))
                If st = "" Then st = AehnlichText(pf, b, fn)
                OSchritt = "blockiert: Ordner nicht gefunden: " & opRelH(k) & st
            End If
            Exit Function
        End If
        If z > 0 Then
            OSchritt = "blockiert: Namenskonflikt – " & opRelN(k) & " gibt es schon (und " & opRelH(k) & " auch). " & _
                       "Bitte in Outlook prüfen; das Makro führt keine Ordner zusammen"
            Exit Function
        End If
        If IstStandardOrdner(q) Then
            OSchritt = "blockiert: " & Zitat(obName(q)) & " ist ein Standardordner von Outlook – wird nie verschoben " & _
                       "oder umbenannt"
            Exit Function
        End If
        e = Suchen(pf, eltN, b, fn)
        If e = 0 Then
            st = OEntsteht(k, pf, eltN)
            If st = "" Then st = AehnlichText(pf, b, fn)
            OSchritt = "blockiert: Zielordner fehlt: " & eltN & st
            Exit Function
        End If
        If opAktion(k) = "ORDNER_VERSCHIEBEN" And Not NameGleich(obName(q), nm) Then
            ' erst verschieben (alter Name), dann umbenennen: der alte Name darf im Zielordner nicht vergeben sein
            If Kind(e, obName(q)) > 0 Then
                OSchritt = "blockiert: Zwischenschritt nicht möglich – in " & OrtText(e) & " gibt es schon einen " & _
                           "Ordner " & Zitat(obName(q)) & " (das Makro verschiebt erst und benennt dann um)"
                Exit Function
            End If
        End If
        opKnoten(k) = q
        opEltern(k) = e
        opAltName(k) = obName(q)
        opNeuName(k) = nm
        opEid(k) = obEid(q)
        opVorVoll(k) = KnotenPfad(q)
        If eltN = "" Then
            opZwVoll(k) = OVoll(pf, obName(q))
            opNachVoll(k) = OVoll(pf, nm)
        Else
            opZwVoll(k) = OVoll(pf, KnotenRel(e) & "\" & obName(q))
            opNachVoll(k) = OVoll(pf, KnotenRel(e) & "\" & nm)
        End If
        nU = Nachfahren(q)
        If opAktion(k) = "ORDNER_VERSCHIEBEN" Then
            st = "bereit · verschieben nach " & OrtText(e)
            If opAltName(k) <> nm Then st = st & ", neuer Name " & Zitat(nm)
        Else
            st = "bereit · umbenennen in " & Zitat(nm)
        End If
        If nU = 1 Then
            st = st & " · mit 1 Unterordner"
        ElseIf nU > 1 Then
            st = st & " · mit " & nU & " Unterordnern"
        End If
        If anwenden Then
            obEltern(q) = e
            obName(q) = nm
        End If
        OSchritt = st

    Case Else
        OSchritt = "blockiert: Aktion " & Zitat(opAktion(k)) & " unbekannt (erlaubt: ORDNER_ANLEGEN, ORDNER_VERSCHIEBEN, " & _
                   "ORDNER_UMBENENNEN)"
    End Select
End Function

' ---------------------------------------------------------------- Regelziele

Private Sub RzLeeren()
    rzAnz = 0
    ReDim rzPf(0 To 16): ReDim rzRegel(0 To 16): ReDim rzArt(0 To 16): ReDim rzAktiv(0 To 16): ReDim rzKnoten(0 To 16)
    ReDim rzPfad(0 To 16): ReDim rzSoll(0 To 16): ReDim rzEid(0 To 16): ReDim rzFehler(0 To 16)
End Sub

Private Sub RzHinzu(ByVal pf As Long, ByVal regelName As String, ByVal art As String, ByVal aktiv As Boolean, _
                    ByVal pfad As String, ByVal eid As String, ByVal fehl As String)
    Dim n As Long
    rzAnz = rzAnz + 1
    If rzAnz > UBound(rzPf) Then
        n = 2 * UBound(rzPf) + 16
        ReDim Preserve rzPf(0 To n): ReDim Preserve rzRegel(0 To n): ReDim Preserve rzArt(0 To n)
        ReDim Preserve rzAktiv(0 To n): ReDim Preserve rzKnoten(0 To n): ReDim Preserve rzPfad(0 To n)
        ReDim Preserve rzSoll(0 To n): ReDim Preserve rzEid(0 To n): ReDim Preserve rzFehler(0 To n)
    End If
    rzPf(rzAnz) = pf
    rzRegel(rzAnz) = regelName
    rzArt(rzAnz) = art
    rzAktiv(rzAnz) = aktiv
    rzPfad(rzAnz) = Replace(Replace(pfad, "%2F", "/"), "%2f", "/")
    rzSoll(rzAnz) = rzPfad(rzAnz)
    rzEid(rzAnz) = eid
    rzFehler(rzAnz) = fehl
    rzKnoten(rzAnz) = KnotenZu(eid, rzPfad(rzAnz))
End Sub

' Knoten zu einem Regelziel: ueber die EntryID, sonst ueber den Pfad (0 = in keinem gelesenen Postfach).
Private Function KnotenZu(ByVal eid As String, ByVal pfad As String) As Long
    Dim i As Long, rel As String
    If eid <> "" Then
        For i = 1 To obAnz
            If Not obNeu(i) Then
                If obEid(i) = eid Then
                    KnotenZu = i
                    Exit Function
                End If
            End If
        Next i
    End If
    If pfad = "" Then Exit Function
    For i = 1 To opfAnz
        rel = RelAusVoll(i, pfad)
        If rel <> "" Then
            KnotenZu = Finden(i, rel)
            Exit Function
        End If
    Next i
End Function

' Eine Aktion ("MOVE"/"COPY") einer Regel: nur wenn eingeschaltet.
Private Sub RzAktion(ByVal pf As Long, ByVal rl As Object, ByVal regelName As String, ByVal aktiv As Boolean, _
                     ByVal schl As String)
    Dim acts As Object, a As Object, an As Boolean, f As Object, pfad As String, eid As String, fehl As String
    Dim nr As Long, d As String
    Set acts = Nothing
    Set a = Nothing
    On Error Resume Next
    Set acts = rl.Actions
    Set a = AktNachName(acts, schl)
    an = False
    If Not a Is Nothing Then an = a.Enabled
    Err.Clear
    On Error GoTo 0
    If Not an Then Exit Sub
    Set f = Nothing
    On Error Resume Next
    Set f = a.Folder
    nr = Err.Number: d = Err.Description
    Err.Clear
    If nr = 0 And Not f Is Nothing Then
        pfad = f.FolderPath
        nr = Err.Number: d = Err.Description
        Err.Clear
    End If
    On Error GoTo 0
    If nr <> 0 Then
        fehl = "Zielordner nicht lesbar (" & d & ")"
    ElseIf f Is Nothing Then
        fehl = "kein Zielordner"
    ElseIf pfad = "" Then
        fehl = "Zielordner ohne Pfad"
    Else
        eid = OEid(f)
    End If
    RzHinzu pf, regelName, IIf(schl = "MOVE", "verschieben", "kopieren"), aktiv, pfad, eid, fehl
End Sub

Private Function RegelzieleLesen(ByRef fehler As String) As Boolean
    Dim pf As Long, regeln As Object, n As Long, i As Long, rl As Object, nm As String, aktiv As Boolean, nr As Long
    Dim d As String
    RzLeeren
    fehler = ""
    For pf = 1 To opfAnz
        Set regeln = Nothing
        On Error Resume Next
        Set regeln = opfStore(pf).GetRules()
        nr = Err.Number: d = Err.Description
        n = 0
        If nr = 0 And Not regeln Is Nothing Then
            n = regeln.Count
            nr = Err.Number: d = Err.Description
        End If
        On Error GoTo 0
        If nr <> 0 Or regeln Is Nothing Then
            fehler = opfAdr(pf) & ": Regeln nicht lesbar (" & d & ")"
            Exit Function
        End If
        For i = 1 To n
            Set rl = Nothing
            nm = "": aktiv = False
            On Error Resume Next
            Set rl = regeln.Item(i)
            nm = rl.Name
            aktiv = rl.Enabled
            On Error GoTo 0
            If Not rl Is Nothing Then
                RzAktion pf, rl, nm, aktiv, "MOVE"
                RzAktion pf, rl, nm, aktiv, "COPY"
            End If
        Next i
    Next pf
    RegelzieleLesen = True
End Function

' Pfad fuer Meldungen: ohne \\postfach\, wenn das Ziel im Postfach der Regel liegt
Private Function ZielKurz(ByVal pf As Long, ByVal pfad As String) As String
    Dim rel As String
    rel = RelAusVoll(pf, pfad)
    If rel <> "" Then
        ZielKurz = rel
    Else
        ZielKurz = pfad
    End If
End Function

Private Function RzText(ByVal i As Long, ByVal mitSoll As Boolean) As String
    Dim s As String
    s = PfKurz(rzPf(i)) & ": " & Zitat(rzRegel(i)) & " " & IIf(rzArt(i) = "verschieben", "verschiebt", "kopiert")
    If Not rzAktiv(i) Then s = s & " (Regel aus)"
    If mitSoll Then
        s = s & " – danach " & ZielKurz(rzPf(i), rzSoll(i))
    ElseIf rzFehler(i) <> "" Then
        s = s & " – " & rzFehler(i)
    Else
        s = s & " nach " & ZielKurz(rzPf(i), rzPfad(i))
    End If
    RzText = s
End Function

Private Function RegelnText(ByVal k As Long) As String
    Dim i As Long, n As Long, s As String
    For i = 1 To rzAnz
        If InStr(opRz(k), "|" & i & "|") > 0 Then
            n = n + 1
            If n <= O_REGELN_ZEILE Then s = Anhaengen(s, RzText(i, True), vbLf)
        End If
    Next i
    If n > O_REGELN_ZEILE Then s = s & vbLf & "… und " & (n - O_REGELN_ZEILE) & " weitere (Protokoll)"
    RegelnText = s
End Function

Private Function RzAnzahl(ByVal k As Long) As Long
    Dim i As Long
    For i = 1 To rzAnz
        If InStr(opRz(k), "|" & i & "|") > 0 Then RzAnzahl = RzAnzahl + 1
    Next i
End Function

' Regelziele ohne erreichbaren Zielordner ("" = keine); n = Anzahl. aktive: True = nur eingeschaltete Regeln, False =
' nur ausgeschaltete (eine ausgeschaltete Regel ohne Zielordner zeigt Outlook als "(Fehler)" - Hinweis, kein Alarm).
Private Function KaputteZiele(ByRef n As Long, ByVal hoechstens As Long, ByVal aktive As Boolean) As String
    Dim i As Long, s As String
    n = 0
    For i = 1 To rzAnz
        If rzFehler(i) <> "" And rzAktiv(i) = aktive Then
            n = n + 1
            If n <= hoechstens Then s = Anhaengen(s, RzText(i, False))
        End If
    Next i
    If n > hoechstens Then s = s & " und " & (n - hoechstens) & " weitere"
    KaputteZiele = s
End Function

' ---------------------------------------------------------------- Vorschau

' Plan auf dem Abbild durchspielen; Rueckgabe: Anzahl blockierter Zeilen.
Private Function OSimulieren() As Long
    Dim k As Long, n As Long, i As Long, vorher() As String, jetzt As String
    For k = 1 To opAnz
        opFehler(k) = "": opRelH(k) = "": opRelN(k) = "": opRz(k) = "|": opRegeln(k) = "": opStatus(k) = ""
        If opPf(k) > 0 Then opFehler(k) = OZeileLesen(k)
    Next k
    BaumMerken
    ReDim vorher(0 To rzAnz)
    For i = 1 To rzAnz
        If rzKnoten(i) > 0 Then vorher(i) = KnotenPfad(rzKnoten(i))
    Next i
    For k = 1 To opAnz
        If opAusf(k) Then
            opStatus(k) = OSchritt(k, True)
            If Left(opStatus(k), 6) = "bereit" And opKnoten(k) > 0 Then
                For i = 1 To rzAnz
                    If rzKnoten(i) > 0 Then
                        If IstUnter(rzKnoten(i), opKnoten(k)) Then
                            jetzt = KnotenPfad(rzKnoten(i))
                            If jetzt <> vorher(i) Then
                                opRz(k) = opRz(k) & i & "|"
                                vorher(i) = jetzt
                            End If
                        End If
                    End If
                Next i
            End If
        Else
            opStatus(k) = "nicht ausgewählt"
        End If
    Next k
    For i = 1 To rzAnz
        If rzKnoten(i) > 0 Then rzSoll(i) = KnotenPfad(rzKnoten(i))
    Next i
    For k = 1 To opAnz
        opRegeln(k) = RegelnText(k)
        If Left(opStatus(k), 6) = "bereit" Then
            n = RzAnzahl(k)
            If n = 1 Then
                opStatus(k) = opStatus(k) & " · 1 Regel zeigt danach dorthin"
            ElseIf n > 1 Then
                opStatus(k) = opStatus(k) & " · " & n & " Regeln zeigen danach dorthin"
            End If
        End If
    Next k
    n = 0
    For k = 1 To opAnz
        If Left(opStatus(k), 9) = "blockiert" Then n = n + 1
    Next k
    OSimulieren = n
End Function

' Outlook, Postfaecher des Plans, Ordnerbaeume und Regelziele lesen (nur lesen). Rueckgabe "" oder Fehler.
Private Function OStandLesen(ByRef ol As Object) As String
    Dim k As Long, f As String, i As Long
    Set ol = OutlookHolen()
    If ol Is Nothing Then
        OStandLesen = "Outlook ist nicht erreichbar"
        Exit Function
    End If
    PfLeeren
    For k = 1 To opAnz
        opPf(k) = 0
        If opPfText(k) <> "" Then
            opPf(k) = PfAufnehmen(ol, opPfText(k), f)
            ' nur ausgewaehlte Zeilen brauchen ihr Postfach; eine nicht ausgewaehlte mit unbekanntem Postfach bleibt aussen vor
            If opPf(k) = 0 And opAusf(k) Then
                OStandLesen = "Zeile " & opNr(k) & ": " & f
                Exit Function
            End If
        End If
    Next k
    If opfAnz = 0 Then
        OStandLesen = "Der Plan nennt kein Postfach"
        Exit Function
    End If
    BaumLeeren
    For i = 1 To opfAnz
        If Not BaumLesen(i, f) Then
            OStandLesen = f
            Exit Function
        End If
    Next i
    If Not RegelzieleLesen(f) Then OStandLesen = f
End Function

' Liest alles und spielt den Plan durch. Schreibt nichts nach Outlook und nichts ins Blatt.
Private Function OVorschauBerechnen(ByRef ol As Object, ByRef blocker As Long, ByRef fehler As String) As Boolean
    fehler = OPlanLesen()
    If fehler <> "" Then Exit Function
    If opAnz = 0 Then
        fehler = "Der Plan ist leer"
        Exit Function
    End If
    fehler = OStandLesen(ol)
    If fehler <> "" Then Exit Function
    blocker = OSimulieren()
    OVorschauBerechnen = True
End Function

Private Function OOrdnerZahlen() As String
    Dim i As Long, j As Long, n As Long, s As String
    For i = 1 To opfAnz
        n = 0
        For j = 1 To obAnz
            If obPf(j) = i And Not obNeu(j) And j <> opfWurzel(i) Then n = n + 1
        Next j
        s = Anhaengen(s, PfKurz(i) & " " & n, ", ")
    Next i
    OOrdnerZahlen = s
End Function

Private Sub OZeilenAnpassen(ByVal ws As Object)
    Dim k As Long, i As Long, n As Long, h As Double, breite As Double, spalten As Variant, t As String, z As Variant
    Dim j As Long
    spalten = Array(OSP_VORSCHAU, OSP_ERGEBNIS, OSP_REGELN, OSP_WARUM)
    On Error Resume Next
    For k = 1 To opAnz
        ws.Rows(opZeile(k)).AutoFit
        h = 30
        For i = LBound(spalten) To UBound(spalten)
            breite = ws.Columns(spalten(i)).ColumnWidth
            If breite < 5 Then breite = 30
            t = ZellText(ws, opZeile(k), CLng(spalten(i)))
            z = Split(t, vbLf)
            n = 0
            For j = LBound(z) To UBound(z)
                n = n + Int(Len(z(j)) / (breite * 1.05)) + 1
            Next j
            If n * 12.5 + 8 > h Then h = n * 12.5 + 8
        Next i
        If ws.Rows(opZeile(k)).RowHeight < h Then ws.Rows(opZeile(k)).RowHeight = h
    Next k
    On Error GoTo 0
End Sub

Public Sub OrdnerVorschau()
    Hinweis MeldungKurz(OrdnerVorschauLauf(), ""), "Ordner – Vorschau", False
End Sub

Public Function OrdnerVorschauLauf() As String
    Dim ws As Object, ol As Object, blocker As Long, f As String, k As Long, r As Long, zeit As String, plan As Object
    Dim nBereit As Long, nErl As Long, nAus As Long, msg As String, nRz As Long, nNeu As Long, kap As String
    Dim nKap As Long, i As Long, stand As String, aus As String, nAus2 As Long
    f = OLayoutPruefen()
    If f <> "" Then
        OrdnerVorschauLauf = "Vorschau nicht möglich: " & f
        Exit Function
    End If
    OBild False
    Set ws = OBlatt(BLATT_ORDNER)
    Set plan = NamensBereich(N_O_PLAN)
    NamensWert N_O_PRUEFWERT, ""
    NamensWert N_O_VORSCHAU_ZEIT, ""
    For r = plan.Row To plan.Row + plan.Rows.Count - 1
        ws.Cells(r, OSP_VORSCHAU).Value = ""
        ws.Cells(r, OSP_ERGEBNIS).Value = ""
        ws.Cells(r, OSP_REGELN).Value = ""
    Next r
    zeit = Zeitstempel()
    oLauf = "Ordner-Vorschau " & zeit
    If Not OVorschauBerechnen(ol, blocker, f) Then
        NamensWert N_O_STATUS, "Vorschau nicht möglich: " & f
        ProtokollSchreiben oLauf, "", "", "ORDNER_VORSCHAU", "", "nicht möglich: " & f
        OBild True
        OrdnerVorschauLauf = "Vorschau nicht möglich: " & f
        Exit Function
    End If
    For k = 1 To opAnz
        ws.Cells(opZeile(k), OSP_VORSCHAU).Value = opStatus(k)
        ws.Cells(opZeile(k), OSP_REGELN).Value = opRegeln(k)
        If Left(opStatus(k), 6) = "bereit" Then nBereit = nBereit + 1
        If Left(opStatus(k), 14) = "schon erledigt" Then nErl = nErl + 1
        If Not opAusf(k) Then nAus = nAus + 1
        If RzAnzahl(k) > O_REGELN_ZEILE Then
            For i = 1 To rzAnz
                If InStr(opRz(k), "|" & i & "|") > 0 Then
                    ProtokollSchreiben oLauf, opfAdr(opPf(k)), opNr(k), opAktion(k), opRelH(k), "Regel: " & RzText(i, True)
                End If
            Next i
        End If
    Next k
    OZeilenAnpassen ws
    For i = 1 To rzAnz
        If rzSoll(i) <> rzPfad(i) Then nNeu = nNeu + 1
    Next i
    nRz = rzAnz
    kap = KaputteZiele(nKap, 3, True)
    aus = KaputteZiele(nAus2, 3, False)
    msg = nBereit & " bereit, " & nErl & " schon erledigt, " & blocker & " blockiert, " & nAus & " nicht ausgewählt"
    stand = "Vorschau " & zeit & ": " & msg & " · Ordner gelesen: " & OOrdnerZahlen() & " · Regelziele (Verschieben/" & _
            "Kopieren, alle Regeln): " & nRz & ", davon nach dem Plan auf neuem Pfad: " & nNeu
    If nAus2 > 0 Then stand = stand & " · Hinweis, ausgeschaltete Regel ohne Zielordner: " & aus
    If nKap > 0 Then stand = "Achtung, schon jetzt ohne erreichbaren Zielordner: " & kap & " · " & stand
    NamensWert N_O_STATUS, stand
    NamensWert N_O_VORSCHAU_ZEIT, zeit
    NamensWert N_O_PRUEFWERT, OPlanPruefwert()
    If blocker > 0 Then
        msg = msg & vbLf & vbLf & "Ausführen ist erst möglich, wenn keine ausgewählte Zeile blockiert ist (Grund in " & _
              "Spalte Vorschau)."
    ElseIf nBereit = 0 Then
        msg = msg & vbLf & vbLf & "Nichts zu tun."
    Else
        msg = msg & vbLf & vbLf & nNeu & " von " & nRz & " Regelzielen zeigen danach auf einen neuen Pfad (Spalte " & _
              OSpalte(OSP_REGELN) & "). Als Nächstes: „Ausführen“."
    End If
    If nKap > 0 Then msg = msg & vbLf & vbLf & "Achtung, schon jetzt ohne erreichbaren Zielordner: " & kap
    If nAus2 > 0 Then msg = msg & vbLf & vbLf & "Hinweis, ausgeschaltete Regel ohne Zielordner (in Outlook „(Fehler)“): " & aus
    msg = "Ordner-Vorschau (" & OOrdnerZahlen() & " Ordner gelesen): " & msg & vbLf & vbLf & _
          "In Outlook wurde nichts geändert."
    ProtokollSchreiben oLauf, PfListe(), "", "ORDNER_VORSCHAU", "", Replace(msg, vbLf, " | ")
    OBild True
    OrdnerVorschauLauf = msg
End Function

Private Function PfListe() As String
    Dim i As Long, s As String
    For i = 1 To opfAnz
        s = Anhaengen(s, opfAdr(i), " / ")
    Next i
    PfListe = s
End Function

' ---------------------------------------------------------------- Ordner-Sicherung (Blatt)

Private Function OFreieZeile(ByVal ws As Object) As Long
    Dim r As Long
    If oSichZeile < OSICH_ERSTE Then
        r = OSICH_ERSTE
        Do While ZellText(ws, r, OS_ZEIT) <> ""
            r = r + 1
        Loop
        oSichZeile = r
    End If
    OFreieZeile = oSichZeile
End Function

' Naechste Folgenummer (groesste im Blatt + 1)
Private Function OFolgeNeu(ByVal ws As Object) As Long
    Dim r As Long, v As Double, t As String
    If oFolge = 0 Then
        For r = OSICH_ERSTE To OFreieZeile(ws) - 1
            t = ZellText(ws, r, OS_FOLGE)
            If t <> "" Then
                v = Val(t)
                If v > oFolge Then oFolge = v
            End If
        Next r
    End If
    oFolge = oFolge + 1
    OFolgeNeu = oFolge
End Function

' Ein ausgefuehrter Schritt - sofort nach dem Gelingen in Outlook.
Private Sub OJournal(ByVal k As Long, ByVal art As String, ByVal vor As String, ByVal nach As String, ByVal eid As String)
    Dim ws As Object, r As Long
    Set ws = OBlatt(BLATT_ORDNER_SICH)
    r = OFreieZeile(ws)
    ws.Cells(r, OS_ZEIT).Value = Zeitstempel()
    ws.Cells(r, OS_LAUF).Value = oLauf
    ws.Cells(r, OS_FOLGE).Value = CStr(OFolgeNeu(ws))
    ws.Cells(r, OS_ART).Value = art
    ws.Cells(r, OS_PF).Value = opfAdr(opPf(k))
    ws.Cells(r, OS_NR).Value = opNr(k)
    ws.Cells(r, OS_VOR).Value = vor
    ws.Cells(r, OS_NACH).Value = nach
    ws.Cells(r, OS_EID).Value = eid
    ws.Cells(r, OS_STAND).Value = "ausgeführt"
    oSichZeile = r + 1
    oJzZeile = r
End Sub

' Neue EntryID im zuletzt geschriebenen Schritt nachtragen (damit "Ordner zurueck" den Ordner wiedererkennt)
Private Sub OJournalEid(ByVal eid As String)
    If oJzZeile >= OSICH_ERSTE Then OBlatt(BLATT_ORDNER_SICH).Cells(oJzZeile, OS_EID).Value = eid
End Sub

' Ordnerliste (Stand vor dem Durchspielen) und Regelziele aller gelesenen Postfaecher; nach: Pfad nach dem Plan.
Private Sub OSicherungSchreiben()
    Dim ws As Object, r As Long, i As Long, zeit As String
    Set ws = OBlatt(BLATT_ORDNER_SICH)
    r = OFreieZeile(ws)
    zeit = Zeitstempel()
    For i = 1 To obAnz
        If Not obNeu(i) Then
            ws.Cells(r, OS_ZEIT).Value = zeit
            ws.Cells(r, OS_LAUF).Value = oLauf
            ws.Cells(r, OS_ART).Value = "Ordner"
            ws.Cells(r, OS_PF).Value = opfAdr(obPf(i))
            ws.Cells(r, OS_VOR).Value = KnotenPfadVorher(i)
            ws.Cells(r, OS_EID).Value = obEid(i)
            r = r + 1
        End If
    Next i
    For i = 1 To rzAnz
        ws.Cells(r, OS_ZEIT).Value = zeit
        ws.Cells(r, OS_LAUF).Value = oLauf
        ws.Cells(r, OS_ART).Value = "Regel " & rzArt(i)
        ws.Cells(r, OS_PF).Value = opfAdr(rzPf(i))
        ws.Cells(r, OS_VOR).Value = IIf(rzFehler(i) <> "", rzFehler(i), rzPfad(i))
        ws.Cells(r, OS_NACH).Value = rzSoll(i)
        ws.Cells(r, OS_REGEL).Value = rzRegel(i)
        ws.Cells(r, OS_EID).Value = rzEid(i)
        ws.Cells(r, OS_STAND).Value = IIf(rzAktiv(i), "Regel aktiv", "Regel aus")
        r = r + 1
    Next i
    oSichZeile = r
End Sub

' ---------------------------------------------------------------- Ausfuehren

Private Sub OUmzugMerken(ByVal vor As String, ByVal nach As String)
    ozAnz = ozAnz + 1
    ReDim Preserve ozVor(0 To ozAnz): ReDim Preserve ozNach(0 To ozAnz)
    ozVor(ozAnz) = vor
    ozNach(ozAnz) = nach
End Sub

Private Sub OUmzugLeeren()
    ozAnz = 0
    ReDim ozVor(0 To 0): ReDim ozNach(0 To 0)
End Sub

' Pfad nach den ausgefuehrten Schritten (Praefix ersetzen, ohne Gross-/Kleinschreibung)
Private Function OAbbilden(ByVal p As String) As String
    Dim i As Long, a As String
    p = Replace(Replace(p, "%2F", "/"), "%2f", "/")
    For i = 1 To ozAnz
        a = LCase(ozVor(i))
        If LCase(p) = a Then
            p = ozNach(i)
        ElseIf LCase(Left(p, Len(a) + 1)) = a & "\" Then
            p = ozNach(i) & Mid(p, Len(a) + 1)
        End If
    Next i
    OAbbilden = p
End Function

' Fuehrt Zeile k in Outlook aus. Rueckgabe "" oder Fehlertext. Jeder gelungene Outlook-Schritt steht sofort im Blatt
' Ordner-Sicherung (Art angelegt, verschoben, umbenannt).
Private Function OSchrittAusfuehren(ByVal k As Long) As String
    Dim pf As Long, e As Object, q As Object, m As Object, eid As String, schritt As String, eltN As String
    Dim zwRel As String, istVor As String
    pf = opPf(k)
    schritt = "Suchen"
    istVor = opVorVoll(k)
    On Error GoTo Fehlerfall
    Select Case opAktion(k)
    Case "ORDNER_ANLEGEN"
        eltN = ElternRel(opRelN(k))
        Set e = OLive(pf, eltN)
        If e Is Nothing Then OFehler "Elternordner nicht gefunden: " & eltN
        schritt = "Anlegen"
        Set m = OrdnerNeuAnlegen(e, opNeuName(k))
        OJournal k, "angelegt", "", opNachVoll(k), OEid(m)
        ProtokollSchreiben oLauf, opfAdr(pf), opNr(k), opAktion(k), opRelN(k), "Ordner angelegt: " & opRelN(k)
        schritt = "Prüfen"
        Set m = OLive(pf, opRelN(k))
        If m Is Nothing Then OFehler "nach dem Anlegen nicht gefunden: " & opRelN(k)
    Case "ORDNER_VERSCHIEBEN", "ORDNER_UMBENENNEN"
        Set q = OLive(pf, opRelH(k))
        If q Is Nothing Then OFehler "Ordner nicht gefunden: " & opRelH(k)
        eid = OEid(q)
        If opEid(k) <> "" And eid <> opEid(k) Then OFehler "unter " & opRelH(k) & " steht seit der Vorschau ein anderer Ordner"
        If opAktion(k) = "ORDNER_VERSCHIEBEN" Then
            eltN = ElternRel(opRelN(k))
            Set e = OLive(pf, eltN)
            If e Is Nothing Then OFehler "Zielordner nicht gefunden: " & eltN
            schritt = "Verschieben"
            OrdnerVerschiebenNach q, e
            OJournal k, "verschoben", opVorVoll(k), opZwVoll(k), eid
            OUmzugMerken opVorVoll(k), opZwVoll(k)
            istVor = opZwVoll(k)
            ProtokollSchreiben oLauf, opfAdr(pf), opNr(k), opAktion(k), opRelH(k), "Verschoben nach " & _
                               RelAusVoll(pf, opZwVoll(k))
            schritt = "Prüfen nach dem Verschieben"
            zwRel = RelAusVoll(pf, opZwVoll(k))
            Set m = OLive(pf, zwRel)
            If m Is Nothing Then OFehler "nach dem Verschieben nicht unter " & zwRel & " gefunden"
            If Not OLive(pf, opRelH(k)) Is Nothing Then OFehler "der Ordner steht nach dem Verschieben noch unter " & opRelH(k)
            If eid <> "" And OEid(m) <> eid Then
                ' alter Platz leer, neuer belegt: derselbe Ordner, aber mit neuer EntryID - Regeln zeigen per EntryID
                ' auf ihren Ordner und finden ihn womoeglich nicht mehr: sofort stoppen, die Regelpruefung zeigt es
                OJournalEid OEid(m)
                OFehler "der Ordner hat beim Verschieben eine neue EntryID bekommen (jetzt " & zwRel & ") – Regeln, " & _
                        "die dorthin zeigen, finden ihn womöglich nicht mehr; Lauf gestoppt"
            End If
            Set q = m
        End If
        If opAltName(k) <> opNeuName(k) Then
            schritt = "Umbenennen"
            OrdnerNameSetzen q, opNeuName(k)
            OJournal k, "umbenannt", istVor, opNachVoll(k), eid
            OUmzugMerken istVor, opNachVoll(k)
            ProtokollSchreiben oLauf, opfAdr(pf), opNr(k), opAktion(k), opRelH(k), "Umbenannt: " & Zitat(opAltName(k)) & _
                               " in " & Zitat(opNeuName(k))
            istVor = opNachVoll(k)
            schritt = "Prüfen nach dem Umbenennen"
            Set m = OLive(pf, opRelN(k))
            If m Is Nothing Then OFehler "nach dem Umbenennen nicht gefunden: " & opRelN(k)
            If eid <> "" And OEid(m) <> eid Then OFehler "nach dem Umbenennen steht unter " & opRelN(k) & " ein anderer Ordner"
        End If
    End Select
    Exit Function
Fehlerfall:
    OSchrittAusfuehren = "Fehler (" & schritt & "): " & Err.Description
    If opAktion(k) = "ORDNER_VERSCHIEBEN" And istVor <> opVorVoll(k) Then
        OSchrittAusfuehren = OSchrittAusfuehren & " – verschoben ist der Ordner schon (jetzt " & RelAusVoll(pf, istVor) & ")"
    End If
End Function

Private Function OAktKurz(ByVal akt As String) As String
    Select Case akt
        Case "ORDNER_ANLEGEN": OAktKurz = "anlegen"
        Case "ORDNER_VERSCHIEBEN": OAktKurz = "verschieben"
        Case "ORDNER_UMBENENNEN": OAktKurz = "umbenennen"
        Case Else: OAktKurz = akt
    End Select
End Function

' Liste der Aenderungen fuer die Rueckfrage (hoechstens budget Zeichen, Rest "… und n weitere")
Private Function OListe(ByVal budget As Long) As String
    Dim k As Long, zeile() As String, n As Long, m As Long, i As Long, s As String, was As String
    ReDim zeile(0 To opAnz)
    For k = 1 To opAnz
        If opAusf(k) And Left(opStatus(k), 6) = "bereit" Then
            n = n + 1
            was = Mid(opStatus(k), 10)
            If opAktion(k) = "ORDNER_ANLEGEN" Then
                zeile(n) = "• " & opNr(k) & " " & PfKurz(opPf(k)) & ": anlegen " & Zitat(KurzName(opRelN(k), 50))
            Else
                zeile(n) = "• " & opNr(k) & " " & PfKurz(opPf(k)) & ": " & Zitat(KurzName(opRelH(k), 44)) & " " & _
                           Abschneiden(was, 70)
            End If
        End If
    Next k
    For m = n To 0 Step -1
        s = ""
        For i = 1 To m
            s = s & zeile(i) & vbLf
        Next i
        If m < n Then s = s & "… und " & (n - m) & " weitere (Spalte Vorschau)" & vbLf
        If Len(s) <= budget Then Exit For
    Next m
    OListe = s
End Function

Public Sub OrdnerAusfuehren()
    Hinweis MeldungKurz(OrdnerAusfuehrenLauf(), ""), "Ordner – Ausführen", False
End Sub

Public Function OrdnerAusfuehrenLauf() As String
    Dim ws As Object, ol As Object, k As Long, f As String, blocker As Long, nBlock As Long, nBereit As Long, s As String
    Dim abw As String, zeit As String, msg As String, kopf As String, fuss As String, schluss As String, budget As Long
    Dim fehlerK As Long, nRz As Long, i As Long, pruef As String, nAbw As Long, st As String
    Dim nOk As Long, nErg As Long
    Set ws = OBlatt(BLATT_ORDNER)
    f = OPlanLesen()
    If f <> "" Then
        OrdnerAusfuehrenLauf = "Ausführen nicht möglich: " & f
        Exit Function
    End If
    If NamensText(N_O_PRUEFWERT) = "" Then
        OrdnerAusfuehrenLauf = "Bitte zuerst „Vorschau“ starten. Ausführen ist nur nach einer Vorschau ohne Blocker möglich."
        Exit Function
    End If
    If NamensText(N_O_PRUEFWERT) <> OPlanPruefwert() Then
        OrdnerAusfuehrenLauf = "Der Plan wurde nach der Vorschau geändert. Bitte „Vorschau“ erneut starten."
        Exit Function
    End If
    For k = 1 To opAnz
        If opAusf(k) Then
            s = ZellText(ws, opZeile(k), OSP_VORSCHAU)
            If Left(s, 9) = "blockiert" Or s = "" Then nBlock = nBlock + 1
            If Left(s, 6) = "bereit" Then nBereit = nBereit + 1
        End If
    Next k
    If nBlock > 0 Then
        OrdnerAusfuehrenLauf = "Die Vorschau zeigt " & nBlock & " blockierte Zeile(n). Ausführen ist erst möglich, wenn " & _
            "alle ausgewählten Zeilen bereit oder schon erledigt sind – Ursache beheben oder die Zeile auf Ausführen = " & _
            "Nein setzen, dann Vorschau erneut starten."
        Exit Function
    End If
    If nBereit = 0 Then
        OrdnerAusfuehrenLauf = "Nichts zu tun – alle ausgewählten Zeilen sind schon erledigt."
        Exit Function
    End If
    ' Stand in Outlook seit der Vorschau unveraendert? (gleiche Berechnung, gleiche Ergebnisse)
    zeit = Zeitstempel()
    oLauf = "Ordner ausführen " & zeit
    oSichZeile = 0: oFolge = 0
    OBild False
    If Not OVorschauBerechnen(ol, blocker, f) Then
        OBild True
        OrdnerAusfuehrenLauf = "Ausführen nicht möglich: " & f
        Exit Function
    End If
    For k = 1 To opAnz
        If opStatus(k) <> ZellText(ws, opZeile(k), OSP_VORSCHAU) Then
            abw = "Zeile " & opNr(k) & ": jetzt " & Zitat(opStatus(k))
            Exit For
        End If
    Next k
    OBild True
    If abw <> "" Or blocker > 0 Then
        OrdnerAusfuehrenLauf = "Der Stand in Outlook hat sich seit der Vorschau geändert (" & abw & "). Bitte „Vorschau“ " & _
                               "erneut starten."
        Exit Function
    End If
    ' Rueckfrage (Vorgabe Nein)
    For i = 1 To rzAnz
        If rzSoll(i) <> rzPfad(i) Then nRz = nRz + 1
    Next i
    kopf = nBereit & " " & IIf(nBereit = 1, "Ordner-Änderung", "Ordner-Änderungen") & " in " & PfListe() & ":" & vbLf & vbLf
    fuss = vbLf & "Gelöscht wird nichts. " & nRz & " Regelziel(e) liegen in betroffenen Ordnern; die Regeln zeigen danach " & _
           "auf den neuen Pfad (Outlook merkt sich den Ordner, nicht den Pfad) – Regeln werden nicht gespeichert." & vbLf & _
           "Vorher kommen Ordnerliste und Regelziele ins Blatt Ordner-Sicherung; „Ordner zurück“ nimmt die Umzüge " & _
           "zurück. Bitte währenddessen in Outlook keine Ordner verschieben."
    schluss = vbLf & vbLf & "Jetzt ausführen?"
    budget = MSGBOX_MAX - Len(kopf) - Len(fuss) - Len(schluss)
    If budget < 200 Then budget = 200
    msg = MeldungKurz(kopf & OListe(budget) & fuss, schluss)
    ProtokollSchreiben oLauf, PfListe(), "", "RÜCKFRAGE", "", Replace(kopf & OListe(1000000) & fuss & schluss, vbLf, " | ")
    If Not Frage(msg, "Ordner umstellen") Then
        OrdnerAusfuehrenLauf = "Abgebrochen – nichts geändert."
        Exit Function
    End If
    ' Sicherung, dann die Schritte in Planreihenfolge
    OBild False
    OSicherungSchreiben
    ProtokollSchreiben oLauf, PfListe(), "", "SICHERUNG", "", "Ordnerliste (" & OOrdnerZahlen() & ") und " & rzAnz & _
                       " Regelziele ins Blatt Ordner-Sicherung geschrieben"
    OUmzugLeeren
    For k = 1 To opAnz
        If opAusf(k) Then
            opErgebnis(k) = ""
        Else
            opErgebnis(k) = "nicht ausgewählt"
        End If
    Next k
    For k = 1 To opAnz
        If opAusf(k) Then
            If Left(opStatus(k), 6) = "bereit" Then
                f = OSchrittAusfuehren(k)
                If f <> "" Then
                    fehlerK = k
                    Exit For
                End If
                opErgebnis(k) = "ausgeführt"
            Else
                opErgebnis(k) = "schon erledigt"
            End If
        End If
    Next k
    If fehlerK > 0 Then
        ProtokollSchreiben oLauf, opfAdr(opPf(fehlerK)), opNr(fehlerK), opAktion(fehlerK), opRelH(fehlerK), "ABBRUCH: " & f
        opErgebnis(fehlerK) = "nicht ausgeführt: " & f
        For k = fehlerK + 1 To opAnz
            If opAusf(k) Then
                If Left(opStatus(k), 14) = "schon erledigt" Then
                    opErgebnis(k) = "schon erledigt"
                Else
                    opErgebnis(k) = "nicht ausgeführt: abgebrochen wegen Fehler in Zeile " & opNr(fehlerK)
                End If
            End If
        Next k
    End If
    ' Nachpruefung: Ordner und alle Regeln beider Postfaecher neu lesen
    pruef = ORegelnNachpruefen(nAbw)
    For k = 1 To opAnz
        If opErgebnis(k) = "ausgeführt" Then
            st = OSchritt(k, False)
            If Left(st, 14) = "schon erledigt" Then
                opErgebnis(k) = "erledigt (geprüft)"
                nOk = nOk + 1
            Else
                opErgebnis(k) = "ausgeführt, Prüfung weicht ab: " & st
            End If
            opErgebnis(k) = opErgebnis(k) & OZeileRegelHinweis(k)
            nErg = nErg + 1
        End If
    Next k
    If fehlerK > 0 Then
        If Left(opRegeln(fehlerK), 4) = "ABW|" Then opErgebnis(fehlerK) = opErgebnis(fehlerK) & OZeileRegelHinweis(fehlerK)
    End If
    For k = 1 To opAnz
        ws.Cells(opZeile(k), OSP_ERGEBNIS).Value = opErgebnis(k)
    Next k
    OZeilenAnpassen ws
    NamensWert N_O_AUSF_ZEIT, zeit
    NamensWert N_O_PRUEFWERT, ""
    ' Meldung
    If fehlerK > 0 Then
        msg = "Abgebrochen in Zeile " & opNr(fehlerK) & ": " & f & vbLf & vbLf
        If ozAnz > 0 Or OAngelegtAnz() > 0 Then
            msg = msg & "Schon ausgeführt (bleibt so; „Ordner zurück“ nimmt Umzüge und Umbenennungen zurück): " & _
                  OAusgefuehrtText() & vbLf & vbLf
        Else
            msg = msg & "In Outlook wurde nichts geändert." & vbLf & vbLf
        End If
    Else
        msg = "Ausgeführt: " & nErg & " Zeile(n), davon " & nOk & " geprüft erledigt." & vbLf & vbLf
    End If
    msg = msg & pruef
    NamensWert N_O_STATUS, IIf(fehlerK > 0, "Abgebrochen in Zeile " & opNr(fehlerK) & " (" & zeit & ") · ", "") & _
                          Replace(pruef, vbLf, " · ")
    ProtokollSchreiben oLauf, PfListe(), "", "ERGEBNIS", "", Replace(msg, vbLf, " | ")
    OBild True
    OrdnerAusfuehrenLauf = msg
End Function

Private Function OAngelegtAnz() As Long
    Dim k As Long
    For k = 1 To opAnz
        If opAktion(k) = "ORDNER_ANLEGEN" And opErgebnis(k) = "ausgeführt" Then OAngelegtAnz = OAngelegtAnz + 1
    Next k
End Function

' Was schon in Outlook passiert ist (nach einem Abbruch): angelegte Ordner, Umzuege, Umbenennungen
Private Function OAusgefuehrtText() As String
    Dim k As Long, s As String, i As Long
    For k = 1 To opAnz
        If opAktion(k) = "ORDNER_ANLEGEN" And (opErgebnis(k) = "ausgeführt" Or Left(opErgebnis(k), 18) = "erledigt (geprüft)") Then
            s = Anhaengen(s, "angelegt " & opRelN(k), "; ")
        End If
    Next k
    For i = 1 To ozAnz
        s = Anhaengen(s, RelAusVollAlle(ozVor(i)) & " jetzt " & RelAusVollAlle(ozNach(i)), "; ")
    Next i
    OAusgefuehrtText = s
End Function

Private Function RelAusVollAlle(ByVal voll As String) As String
    Dim i As Long, r As String
    For i = 1 To opfAnz
        r = RelAusVoll(i, voll)
        If r <> "" Then
            RelAusVollAlle = PfKurz(i) & ": " & r
            Exit Function
        End If
    Next i
    RelAusVollAlle = voll
End Function

' Hinweis an der Ergebniszeile, wenn eine Regel mit Ziel in diesem Ordner nach dem Lauf abweicht (gesetzt von
' ORegelnNachpruefen in opRegeln - dort nicht mehr gebraucht).
Private Function OZeileRegelHinweis(ByVal k As Long) As String
    Dim n As Long
    n = RzAnzahlZeile(k)
    If Left(opRegeln(k), 4) = "ABW|" Then
        OZeileRegelHinweis = " · Achtung: " & Mid(opRegeln(k), 5)
    ElseIf n = 1 Then
        OZeileRegelHinweis = " · 1 Regel zeigt auf den neuen Pfad"
    ElseIf n > 1 Then
        OZeileRegelHinweis = " · " & n & " Regeln zeigen auf den neuen Pfad"
    End If
End Function

Private Function RzAnzahlZeile(ByVal k As Long) As Long
    Dim t As Variant, i As Long
    If opRz(k) = "|" Or opRz(k) = "" Then Exit Function
    t = Split(Mid(opRz(k), 2), "|")
    For i = LBound(t) To UBound(t)
        If t(i) <> "" Then RzAnzahlZeile = RzAnzahlZeile + 1
    Next i
End Function

' ---------------------------------------------------------------- Nachpruefung der Regeln

' Erwartung aus dem aktuellen Abbild (Regelziele vor dem Lauf, Pfad nach den ausgefuehrten Schritten), dann Ordner und
' Regeln neu lesen und vergleichen: Jedes aktive Ziel muss auf einen vorhandenen Ordner zeigen, jedes erwartete auf den
' erwarteten Pfad. Abweichungen ins Protokoll; an den Planzeilen (opRegeln = "ABW|...") fuer die Ergebnisspalte.
Private Function ORegelnNachpruefen(ByRef nAbw As Long) As String
    Dim nS As Long, sPf() As String, sRegel() As String, sArt() As String, sSoll() As String, sVor() As String
    Dim sFehl() As String, sZeile() As String, i As Long, j As Long, k As Long, f As String, gef As Long
    Dim benutzt() As Boolean, abw As String, nNeu As Long, nKap As Long, kap As String, s As String, t As String
    Dim zl As Variant, z As Long, vorher As String, nVorher As Long
    nS = rzAnz
    ReDim sPf(0 To nS): ReDim sRegel(0 To nS): ReDim sArt(0 To nS): ReDim sSoll(0 To nS): ReDim sVor(0 To nS)
    ReDim sFehl(0 To nS): ReDim sZeile(0 To nS)
    For i = 1 To nS
        sPf(i) = opfAdr(rzPf(i))
        sRegel(i) = rzRegel(i)
        sArt(i) = rzArt(i)
        sVor(i) = rzPfad(i)
        sFehl(i) = rzFehler(i)
        sSoll(i) = OAbbilden(rzPfad(i))
        For k = 1 To opAnz
            If InStr(opRz(k), "|" & i & "|") > 0 Then sZeile(i) = sZeile(i) & k & "|"
        Next k
    Next i
    For k = 1 To opAnz
        If Left(opRegeln(k), 4) = "ABW|" Then opRegeln(k) = ""
    Next k
    ' neu lesen (Ordner und Regeln)
    BaumLeeren
    For i = 1 To opfAnz
        If Not BaumLesen(i, f) Then
            ORegelnNachpruefen = "Prüfung nicht möglich: " & f & vbLf & "Bitte „Regeln prüfen“."
            nAbw = -1
            Exit Function
        End If
    Next i
    If Not RegelzieleLesen(f) Then
        ORegelnNachpruefen = "Prüfung nicht möglich: " & f & vbLf & "Bitte „Regeln prüfen“."
        nAbw = -1
        Exit Function
    End If
    ReDim benutzt(0 To rzAnz)
    For j = 1 To nS
        gef = 0
        For i = 1 To rzAnz
            If Not benutzt(i) Then
                If LCase(opfAdr(rzPf(i))) = LCase(sPf(j)) And rzRegel(i) = sRegel(j) And rzArt(i) = sArt(j) Then
                    gef = i
                    Exit For
                End If
            End If
        Next i
        t = ""
        If gef = 0 Then
            t = PfKurz(PfIndexAdr(sPf(j))) & ": " & Zitat(sRegel(j)) & " (" & sArt(j) & ") nicht mehr gefunden"
        Else
            benutzt(gef) = True
            If sFehl(j) = "" And rzFehler(gef) <> "" Then
                t = RzText(gef, False) & " – zeigt auf keinen vorhandenen Ordner mehr (erwartet " & _
                    ZielKurz(rzPf(gef), sSoll(j)) & ")"
            ElseIf sFehl(j) = "" And PfadNorm(rzPfad(gef)) <> PfadNorm(sSoll(j)) Then
                t = RzText(gef, False) & " – erwartet " & ZielKurz(rzPf(gef), sSoll(j))
            ElseIf sFehl(j) = "" And PfadNorm(sSoll(j)) <> PfadNorm(sVor(j)) Then
                nNeu = nNeu + 1
            ElseIf sFehl(j) <> "" Then
                ' schon vor dem Lauf ohne Zielordner: unveraendert, kein Fehler dieses Laufs
                nVorher = nVorher + 1
                If nVorher <= 3 Then vorher = Anhaengen(vorher, RzText(gef, False))
            End If
        End If
        If t <> "" Then
            nAbw = nAbw + 1
            abw = Anhaengen(abw, t, vbLf)
            ProtokollSchreiben oLauf, sPf(j), "", "REGELPRÜFUNG", sRegel(j), "Abweichung: " & t
            If sZeile(j) <> "" Then
                zl = Split(sZeile(j), "|")
                For z = LBound(zl) To UBound(zl)
                    If zl(z) <> "" Then
                        k = CLng(zl(z))
                        If opRegeln(k) = "" Or Left(opRegeln(k), 4) <> "ABW|" Then
                            opRegeln(k) = "ABW|Regel " & Zitat(sRegel(j)) & " weicht ab (Protokoll)"
                        End If
                    End If
                Next z
            End If
        End If
    Next j
    ' Regelziele ohne Ordner, die nicht schon oben stehen
    For i = 1 To rzAnz
        If rzFehler(i) <> "" Then
            nKap = nKap + 1
            If Not benutzt(i) Then
                nAbw = nAbw + 1
                t = RzText(i, False) & " – zeigt auf keinen vorhandenen Ordner"
                abw = Anhaengen(abw, t, vbLf)
                ProtokollSchreiben oLauf, opfAdr(rzPf(i)), "", "REGELPRÜFUNG", rzRegel(i), "Abweichung: " & t
            End If
        End If
    Next i
    s = "Regeln geprüft (" & PfListe() & ", nur gelesen, nichts gespeichert): " & rzAnz & " Ziele von Aktionen " & _
        "„In Ordner verschieben/kopieren“"
    If nAbw = 0 And nVorher = 0 Then
        s = s & ", alle auf vorhandenen Ordnern; " & nNeu & " zeigen wie erwartet auf den neuen Pfad."
    ElseIf nAbw = 0 Then
        s = s & ": " & nNeu & " zeigen wie erwartet auf den neuen Pfad, alle übrigen auf vorhandenen Ordnern bis auf " & _
            nVorher & ", die schon vor dem Lauf keinen Zielordner hatten (unverändert): " & vorher & _
            IIf(nVorher > 3, " und " & (nVorher - 3) & " weitere", "") & "."
    Else
        s = "Achtung, Regeln weichen ab (" & nAbw & "):" & vbLf & KurzName(abw, 600) & vbLf & s & "; " & nNeu & _
            " zeigen wie erwartet auf den neuen Pfad. Bitte die genannten Regeln in Outlook prüfen (Regeln und " & _
            "Benachrichtigungen › Regel › In Ordner verschieben)."
    End If
    ProtokollSchreiben oLauf, PfListe(), "", "REGELPRÜFUNG", "", Replace(s, vbLf, " | ")
    ORegelnNachpruefen = s
End Function

Private Function PfIndexAdr(ByVal adr As String) As Long
    Dim i As Long
    For i = 1 To opfAnz
        If LCase(opfAdr(i)) = LCase(adr) Then
            PfIndexAdr = i
            Exit Function
        End If
    Next i
    PfIndexAdr = 1
End Function

' ---------------------------------------------------------------- Regeln pruefen (Knopf, nur lesen)

Public Sub OrdnerRegelnPruefen()
    Hinweis MeldungKurz(OrdnerRegelnPruefenLauf(), ""), "Ordner – Regeln prüfen", False
End Sub

Public Function OrdnerRegelnPruefenLauf() As String
    Dim ol As Object, f As String, nKap As Long, kap As String, s As String, i As Long, k As Long, nNeu As Long
    Dim nAlt As Long, h As String, n As String, p As String, zeit As String, alt As String, aus As String, nAus As Long
    f = OPlanLesen()
    If f <> "" Then
        OrdnerRegelnPruefenLauf = "Prüfung nicht möglich: " & f
        Exit Function
    End If
    zeit = Zeitstempel()
    oLauf = "Regeln prüfen " & zeit
    OBild False
    f = OStandLesen(ol)
    If f <> "" Then
        NamensWert N_O_STATUS, "Prüfung nicht möglich: " & f
        ProtokollSchreiben oLauf, "", "", "REGELPRÜFUNG", "", "nicht möglich: " & f
        OBild True
        OrdnerRegelnPruefenLauf = "Prüfung nicht möglich: " & f
        Exit Function
    End If
    kap = KaputteZiele(nKap, 1000, True)
    aus = KaputteZiele(nAus, 1000, False)
    For i = 1 To rzAnz
        If rzFehler(i) <> "" Then
            ProtokollSchreiben oLauf, opfAdr(rzPf(i)), "", "REGELPRÜFUNG", rzRegel(i), IIf(rzAktiv(i), "Abweichung: ", _
                               "Hinweis (Regel aus): ") & RzText(i, False) & " – zeigt auf keinen vorhandenen Ordner"
        End If
    Next i
    ' Ziele unter den Pfaden des Plans: schon unter "Pfad neu" bzw. noch unter "Pfad heute" (Plan noch offen)
    For i = 1 To rzAnz
        For k = 1 To opAnz
            If opAktion(k) <> "ORDNER_ANLEGEN" And opPf(k) > 0 Then
                h = "": n = ""
                If RelLesen(opPf(k), opHeute(k), h) = "" And RelLesen(opPf(k), opNeu(k), n) = "" Then
                    p = LCase(rzPfad(i))
                    If PfadUnter(p, LCase(OVoll(opPf(k), n))) Then
                        nNeu = nNeu + 1
                        Exit For
                    ElseIf PfadUnter(p, LCase(OVoll(opPf(k), h))) Then
                        nAlt = nAlt + 1
                        alt = Anhaengen(alt, RzText(i, False))
                        Exit For
                    End If
                End If
            End If
        Next k
    Next i
    s = "Regeln geprüft (" & PfListe() & ", nur gelesen): " & rzAnz & " Ziele von Aktionen „In Ordner verschieben/" & _
        "kopieren“"
    If nKap = 0 And nAus = 0 Then
        s = s & ", alle auf vorhandenen Ordnern"
    ElseIf nKap = 0 Then
        s = s & ", alle Ziele eingeschalteter Regeln auf vorhandenen Ordnern (Hinweis, ausgeschaltete Regel ohne " & _
            "Zielordner: " & KurzName(aus, 200) & ")"
    Else
        s = "Achtung, " & nKap & " Regelziel(e) ohne vorhandenen Ordner: " & KurzName(kap, 500) & vbLf & s
    End If
    s = s & "; " & nNeu & " unter den neuen Pfaden des Plans, " & nAlt & " noch unter den alten."
    If nAlt > 0 Then s = s & vbLf & "Noch unter den alten Pfaden (Plan noch nicht ausgeführt?): " & KurzName(alt, 300)
    NamensWert N_O_STATUS, Replace(s, vbLf, " · ") & " (" & zeit & ")"
    ProtokollSchreiben oLauf, PfListe(), "", "REGELPRÜFUNG", "", Replace(s, vbLf, " | ")
    OBild True
    OrdnerRegelnPruefenLauf = s & vbLf & vbLf & "Nur gelesen – in Outlook wurde nichts geändert."
End Function

' Liegt Pfad p (klein) im Ordner o (klein) oder ist er o?
Private Function PfadUnter(ByVal p As String, ByVal o As String) As Boolean
    p = Replace(p, "%2f", "/")
    PfadUnter = (p = o Or Left(p, Len(o) + 1) = o & "\")
End Function

' ---------------------------------------------------------------- Ordner zurueck

Public Sub OrdnerZurueck()
    Hinweis MeldungKurz(OrdnerZurueckLauf(), ""), "Ordner zurück", False
End Sub

Public Function OrdnerZurueckLauf() As String
    Dim ws As Object, ol As Object, f As String, r As Long, n As Long, j As Long, i As Long, t As String, zeit As String
    Dim jzR() As Long, jzFolge() As Double, jzArt() As String, jzPf() As String, jzVor() As String, jzNach() As String
    Dim jzEid() As String, jzNr() As String, jzPfI() As Long, nU As Long, nA As Long, x As Long, ok As Boolean
    Dim q As Long, e As Long, relV As String, relN As String, grund As String, liste As String, msg As String
    Dim fo As Object, fe As Object, m As Object, schritt As String, fertig As Long, angelegt As String, pruef As String
    Dim nAbw As Long, kopf As String, fuss As String, schluss As String, budget As Long, zeilen As String, eid As String
    Dim letzte As Long
    f = OLayoutPruefen()
    If f <> "" Then
        OrdnerZurueckLauf = "Ordner zurück nicht möglich: " & f
        Exit Function
    End If
    ' Schritte mit Stand "ausgefuehrt" aus dem Blatt Ordner-Sicherung, neueste zuerst (Spalte Folge)
    Set ws = OBlatt(BLATT_ORDNER_SICH)
    oSichZeile = 0: oFolge = 0
    letzte = OFreieZeile(ws) - 1
    ReDim jzR(0 To letzte): ReDim jzFolge(0 To letzte): ReDim jzArt(0 To letzte): ReDim jzPf(0 To letzte)
    ReDim jzVor(0 To letzte): ReDim jzNach(0 To letzte): ReDim jzEid(0 To letzte): ReDim jzNr(0 To letzte)
    ReDim jzPfI(0 To letzte)
    For r = OSICH_ERSTE To letzte
        t = ZellText(ws, r, OS_ART)
        If (t = "verschoben" Or t = "umbenannt" Or t = "angelegt") And ZellText(ws, r, OS_STAND) = "ausgeführt" Then
            n = n + 1
            jzR(n) = r
            jzFolge(n) = Val(ZellText(ws, r, OS_FOLGE))
            jzArt(n) = t
            jzPf(n) = ZellText(ws, r, OS_PF)
            jzVor(n) = ZellText(ws, r, OS_VOR)
            jzNach(n) = ZellText(ws, r, OS_NACH)
            jzEid(n) = ZellText(ws, r, OS_EID)
            jzNr(n) = ZellText(ws, r, OS_NR)
            If t = "angelegt" Then nA = nA + 1 Else nU = nU + 1
        End If
    Next r
    If nU = 0 Then
        OrdnerZurueckLauf = "Nichts zurückzunehmen – im Blatt Ordner-Sicherung steht kein Umzug und keine Umbenennung " & _
                            "mit Stand „ausgeführt“." & IIf(nA > 0, " Angelegte Ordner bleiben stehen (" & nA & ").", "")
        Exit Function
    End If
    ' absteigend nach Folge sortieren (Einfuegesortierung)
    For i = 2 To n
        x = i
        Do While x > 1
            If jzFolge(x - 1) >= jzFolge(x) Then Exit Do
            OTausch jzR, jzFolge, jzArt, jzPf, jzVor, jzNach, jzEid, jzNr, x - 1, x
            x = x - 1
        Loop
    Next i
    zeit = Zeitstempel()
    oLauf = "Ordner zurück " & zeit
    OBild False
    Set ol = OutlookHolen()
    If ol Is Nothing Then
        OBild True
        OrdnerZurueckLauf = "Ordner zurück nicht möglich: Outlook ist nicht erreichbar"
        Exit Function
    End If
    PfLeeren
    ' Postfaecher des Plans mitlesen (Regeln zeigen auch in das andere Postfach); unbekannte bleiben aussen vor
    If OPlanLesen() = "" Then
        For i = 1 To opAnz
            If opPfText(i) <> "" Then x = PfAufnehmen(ol, opPfText(i), f)
        Next i
    End If
    For j = 1 To n
        jzPfI(j) = PfAufnehmen(ol, jzPf(j), f)
        If jzPfI(j) = 0 Then
            OBild True
            OrdnerZurueckLauf = "Ordner zurück nicht möglich: " & f
            Exit Function
        End If
    Next j
    BaumLeeren
    For i = 1 To opfAnz
        If Not BaumLesen(i, f) Then
            OBild True
            OrdnerZurueckLauf = "Ordner zurück nicht möglich: " & f
            Exit Function
        End If
    Next i
    If Not RegelzieleLesen(f) Then
        OBild True
        OrdnerZurueckLauf = "Ordner zurück nicht möglich: " & f
        Exit Function
    End If
    ' Vorab im Abbild rueckwaerts durchspielen: jeder Schritt muss gehen, sonst nichts aendern
    BaumMerken
    For j = 1 To n
        If jzArt(j) <> "angelegt" Then
            relV = RelAusVoll(jzPfI(j), jzVor(j))
            relN = RelAusVoll(jzPfI(j), jzNach(j))
            grund = ""
            q = Finden(jzPfI(j), relN)
            If relV = "" Or relN = "" Then
                grund = "Pfade im Blatt Ordner-Sicherung passen nicht zum Postfach"
            ElseIf q = 0 Then
                grund = "Ordner " & relN & " nicht gefunden (seit dem Umzug verändert?)"
            ElseIf jzEid(j) <> "" And obEid(q) <> "" And obEid(q) <> jzEid(j) Then
                grund = "unter " & relN & " steht ein anderer Ordner als beim Umzug"
            ElseIf Finden(jzPfI(j), relV) > 0 And Finden(jzPfI(j), relV) <> q Then
                grund = relV & " gibt es schon wieder"
            ElseIf jzArt(j) = "verschoben" Then
                e = Finden(jzPfI(j), ElternRel(relV))
                If e = 0 Then
                    grund = "der frühere Elternordner " & ElternRel(relV) & " fehlt"
                Else
                    obEltern(q) = e
                End If
            Else
                If Not NameGleich(ElternRel(relV), ElternRel(relN)) Then
                    grund = "Umbenennung mit anderem Elternordner im Blatt Ordner-Sicherung"
                Else
                    obName(q) = OLeaf(relV)
                End If
            End If
            If grund <> "" Then
                OBild True
                msg = "Ordner zurück nicht möglich – nichts geändert. Schritt aus Zeile " & jzNr(j) & " (" & jzArt(j) & ", " & _
                      PfKurz(jzPfI(j)) & "): " & grund & ". Bitte in Outlook prüfen; die Schritte stehen im Blatt " & _
                      "Ordner-Sicherung."
                ProtokollSchreiben oLauf, jzPf(j), jzNr(j), "ORDNER_ZURÜCK", relN, msg
                OrdnerZurueckLauf = msg
                Exit Function
            End If
            zeilen = zeilen & "• " & jzNr(j) & " " & PfKurz(jzPfI(j)) & ": " & Zitat(KurzName(relN, 50)) & IIf(jzArt(j) = _
                     "verschoben", " zurück nach " & Zitat(KurzName(IIf(ElternRel(relV) = "", "oberste Ebene", _
                     ElternRel(relV)), 40)), " zurück in " & Zitat(OLeaf(relV))) & vbLf
        End If
    Next j
    For i = 1 To rzAnz
        If rzKnoten(i) > 0 Then rzSoll(i) = KnotenPfad(rzKnoten(i))
    Next i
    OBild True
    kopf = nU & " " & IIf(nU = 1, "Schritt", "Schritte") & " zurücknehmen (neueste zuerst):" & vbLf & vbLf
    fuss = vbLf & "Angelegte Ordner (" & nA & ") bleiben stehen. Regeln werden nicht gespeichert; sie folgen ihren " & _
           "Ordnern zurück. Vorher kommen Ordnerliste und Regelziele ins Blatt Ordner-Sicherung."
    schluss = vbLf & vbLf & "Jetzt zurücknehmen?"
    budget = MSGBOX_MAX - Len(kopf) - Len(fuss) - Len(schluss)
    If budget < 200 Then budget = 200
    liste = zeilen
    If Len(liste) > budget Then liste = Left(liste, budget - 40) & "… (Rest im Protokoll)" & vbLf
    ProtokollSchreiben oLauf, PfListe(), "", "RÜCKFRAGE", "", Replace(kopf & zeilen & fuss & schluss, vbLf, " | ")
    If Not Frage(MeldungKurz(kopf & liste & fuss, schluss), "Ordner zurück") Then
        OrdnerZurueckLauf = "Abgebrochen – nichts geändert."
        Exit Function
    End If
    OBild False
    OSicherungSchreiben
    OUmzugLeeren
    f = ""
    ' rueckwaerts ausfuehren; bei Fehler sofort Stopp
    For j = 1 To n
        If jzArt(j) <> "angelegt" Then
            relV = RelAusVoll(jzPfI(j), jzVor(j))
            relN = RelAusVoll(jzPfI(j), jzNach(j))
            f = OZurueckSchritt(jzPfI(j), jzArt(j), relV, relN, jzEid(j), schritt)
            If f <> "" Then Exit For
            ws.Cells(jzR(j), OS_STAND).Value = "zurückgenommen " & zeit
            OUmzugMerken jzNach(j), jzVor(j)
            ProtokollSchreiben oLauf, jzPf(j), jzNr(j), "ORDNER_ZURÜCK", relN, IIf(jzArt(j) = "verschoben", "Zurück nach " & _
                               IIf(ElternRel(relV) = "", "oberste Ebene", ElternRel(relV)), "Zurück umbenannt in " & _
                               Zitat(OLeaf(relV)))
            fertig = fertig + 1
        End If
    Next j
    If f <> "" Then
        ProtokollSchreiben oLauf, jzPf(j), jzNr(j), "ORDNER_ZURÜCK", relN, "ABBRUCH: " & f
        msg = "Ordner zurück abgebrochen bei Schritt aus Zeile " & jzNr(j) & " (" & PfKurz(jzPfI(j)) & ", " & relN & "): " & _
              f & vbLf & "Schon zurückgenommen: " & fertig & " von " & nU & " (Stand im Blatt Ordner-Sicherung)." & vbLf & vbLf
    Else
        For j = 1 To n
            If jzArt(j) = "angelegt" Then
                relN = RelAusVoll(jzPfI(j), jzNach(j))
                Set m = OLive(jzPfI(j), relN)
                If m Is Nothing Then
                    angelegt = Anhaengen(angelegt, relN & " (nicht mehr da)")
                Else
                    x = 0
                    On Error Resume Next
                    x = m.Folders.Count
                    On Error GoTo 0
                    angelegt = Anhaengen(angelegt, PfKurz(jzPfI(j)) & ": " & relN & IIf(x = 0, " (ohne Unterordner)", _
                                                   " (" & x & " Unterordner)"))
                End If
                ws.Cells(jzR(j), OS_STAND).Value = "bleibt stehen (Ordner zurück " & zeit & ")"
            End If
        Next j
        msg = "Zurückgenommen: " & fertig & " " & IIf(fertig = 1, "Schritt", "Schritte") & "." & vbLf
        If angelegt <> "" Then msg = msg & "Angelegte Ordner bleiben stehen: " & KurzName(angelegt, 300) & vbLf
        msg = msg & vbLf
    End If
    pruef = ORegelnNachpruefenZurueck(nAbw)
    msg = msg & pruef
    NamensWert N_O_STATUS, IIf(f <> "", "Abgebrochen (Ordner zurück " & zeit & ") · ", "Ordner zurück " & zeit & " · ") & _
                          Replace(pruef, vbLf, " · ")
    ProtokollSchreiben oLauf, PfListe(), "", "ERGEBNIS", "", Replace(msg, vbLf, " | ")
    OBild True
    OrdnerZurueckLauf = msg
End Function

' Nachpruefung nach "Ordner zurueck": Planzeilen gibt es dabei nicht (opAnz = 0 fuer die Zuordnung).
Private Function ORegelnNachpruefenZurueck(ByRef nAbw As Long) As String
    opAnz = 0
    ReDim opRz(0 To 0): ReDim opRegeln(0 To 0)
    ORegelnNachpruefenZurueck = ORegelnNachpruefen(nAbw)
End Function

Private Sub OTausch(jzR() As Long, jzFolge() As Double, jzArt() As String, jzPf() As String, jzVor() As String, _
                   jzNach() As String, jzEid() As String, jzNr() As String, ByVal a As Long, ByVal b As Long)
    Dim l As Long, d As Double, s As String
    l = jzR(a): jzR(a) = jzR(b): jzR(b) = l
    d = jzFolge(a): jzFolge(a) = jzFolge(b): jzFolge(b) = d
    s = jzArt(a): jzArt(a) = jzArt(b): jzArt(b) = s
    s = jzPf(a): jzPf(a) = jzPf(b): jzPf(b) = s
    s = jzVor(a): jzVor(a) = jzVor(b): jzVor(b) = s
    s = jzNach(a): jzNach(a) = jzNach(b): jzNach(b) = s
    s = jzEid(a): jzEid(a) = jzEid(b): jzEid(b) = s
    s = jzNr(a): jzNr(a) = jzNr(b): jzNr(b) = s
End Sub

' Einen Schritt zuruecknehmen. Rueckgabe "" oder Fehlertext.
Private Function OZurueckSchritt(ByVal pf As Long, ByVal art As String, ByVal relV As String, ByVal relN As String, _
                                 ByVal eid As String, ByRef schritt As String) As String
    Dim q As Object, e As Object, m As Object
    schritt = "Suchen"
    On Error GoTo Fehlerfall
    Set q = OLive(pf, relN)
    If q Is Nothing Then OFehler "Ordner nicht gefunden: " & relN
    If eid <> "" And OEid(q) <> "" And OEid(q) <> eid Then OFehler "unter " & relN & " steht ein anderer Ordner"
    If art = "verschoben" Then
        Set e = OLive(pf, ElternRel(relV))
        If e Is Nothing Then OFehler "früherer Elternordner nicht gefunden: " & ElternRel(relV)
        schritt = "Zurückverschieben"
        OrdnerVerschiebenNach q, e
    Else
        schritt = "Zurückbenennen"
        OrdnerNameSetzen q, OLeaf(relV)
    End If
    schritt = "Prüfen"
    Set m = OLive(pf, relV)
    If m Is Nothing Then OFehler "danach nicht unter " & relV & " gefunden"
    If eid <> "" And OEid(m) <> eid Then
        If Not OLive(pf, relN) Is Nothing Then OFehler "danach steht unter " & relV & " ein anderer Ordner"
        ProtokollSchreiben oLauf, opfAdr(pf), "", "ORDNER_ZURÜCK", relV, "Hinweis: EntryID hat sich beim Zurückverschieben " & _
                           "geändert (Ordner steht wieder unter " & relV & ")"
    End If
    Exit Function
Fehlerfall:
    OZurueckSchritt = "Fehler (" & schritt & "): " & Err.Description
End Function

' ---------------------------------------------------------------- Fuer modPlan (Blatt Umsetzung)

' Ein Ordnerpfad des Regelplans, den es nicht mehr gibt, weil das Blatt Ordner ihn verschoben bzw. umbenannt hat (alter
' Pfad fehlt, neuer da), wird auf den neuen Pfad abgebildet. Sonst unveraendert. hinweis: Text fuer die Vorschauzeile.
Public Function UmzugPfad(ByVal ziel As Object, ByVal pfad As String, ByRef hinweis As String) As String
    Dim f As Object, fehlt As String, problem As String, ws As Object, plan As Object, r As Long, akt As String
    Dim pfz As String, h As String, n As String, p As String, a As String, wurzel As String, anz As String
    hinweis = ""
    UmzugPfad = pfad
    If Trim(pfad) = "" Or ziel Is Nothing Then Exit Function
    Set f = OrdnerFinden(ziel, pfad, fehlt, problem)
    If Not f Is Nothing Or problem <> "" Then Exit Function
    If OLayoutPruefen() <> "" Then Exit Function
    wurzel = PostfachName(ziel)
    anz = PostfachAnzeige(ziel)
    Set ws = OBlatt(BLATT_ORDNER)
    Set plan = NamensBereich(N_O_PLAN)
    p = Replace(Replace(Trim(pfad), "%2F", "/"), "%2f", "/")
    For r = plan.Row To plan.Row + plan.Rows.Count - 1
        akt = UCase(ZellText(ws, r, OSP_AKTION))
        If akt = "ORDNER_VERSCHIEBEN" Or akt = "ORDNER_UMBENENNEN" Then
            pfz = LCase(ZellText(ws, r, OSP_PF))
            If pfz = LCase(wurzel) Or (pfz = LCase(anz) And anz <> "") Then
                h = VollAusPlan(wurzel, ZellText(ws, r, OSP_HEUTE))
                n = VollAusPlan(wurzel, ZellText(ws, r, OSP_NEU))
                If h <> "" And n <> "" Then
                    a = LCase(h)
                    If LCase(p) = a Then
                        p = n
                    ElseIf LCase(Left(p, Len(a) + 1)) = a & "\" Then
                        p = n & Mid(p, Len(a) + 1)
                    End If
                End If
            End If
        End If
    Next r
    If LCase(p) = LCase(Replace(Replace(Trim(pfad), "%2F", "/"), "%2f", "/")) Then Exit Function
    Set f = OrdnerFinden(ziel, p, fehlt, problem)
    If f Is Nothing Then Exit Function
    hinweis = " · Ordner laut Blatt Ordner umgezogen: " & RelPfad(pfad) & " jetzt " & RelPfad(p)
    UmzugPfad = p
End Function

' Voller Pfad aus einer Zelle des Ordner-Plans ("" wenn leer)
Private Function VollAusPlan(ByVal wurzel As String, ByVal s As String) As String
    s = Trim(Replace(Replace(s, "%2F", "/"), "%2f", "/"))
    If s = "" Then Exit Function
    If Left(s, 2) <> "\\" Then
        Do While Left(s, 1) = "\"
            s = Mid(s, 2)
        Loop
        s = "\\" & wurzel & "\" & s
    End If
    Do While Right(s, 1) = "\"
        s = Left(s, Len(s) - 1)
    Loop
    VollAusPlan = s
End Function
