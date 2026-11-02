Option Explicit
' ============================================================================
' modOlLesen - liest Outlook, ohne etwas zu veraendern.
'
' In diesem Modul steht kein schreibender Zugriff: kein Save, kein Create, kein Folders.Add, keine Zuweisung an
' eine Outlook-Eigenschaft. "Vorschau" und "Regeln aus Outlook lesen" benutzen nur dieses Modul, modModell und
' modPlan; geschrieben wird ausschliesslich in modOlSchreiben.
'
' Bedingungen werden auf zwei Wegen gelesen: ueber den Index-Durchlauf (Conditions.Item(i) mit ConditionType,
' findet auch Typen ohne eigene Eigenschaft wie die Abwesenheitsnotiz) und ueber die benannten Eigenschaften
' (Conditions.From, .Subject, ...; Namen laut Microsoft Learn "RuleConditions object"). Ein aktiver Typ, den nur
' einer der beiden Wege sieht, zaehlt trotzdem. Die benannten Eigenschaften liefern auch die Werte (Empfaenger,
' Woerter, Adressen); ein Fehler beim Lesen eines Werts macht die Regel "nicht lesbar".
' Aktionstypen werden nicht als Zahlen vorausgesetzt: das Makro liest die ActionType-Werte zur Laufzeit von den
' benannten Aktionen (MoveToFolder, Forward, ...) und vergleicht den Index-Durchlauf damit. Eine aktive Aktion
' unbekannten Typs (0 = olRuleActionUnknown) macht die Regel "nicht lesbar".
' ============================================================================

' OlRuleConditionType (Microsoft Learn)
Public Const BED_UNBEKANNT As Long = 0
Public Const BED_FROM As Long = 1
Public Const BED_SUBJECT As Long = 2
Public Const BED_ACCOUNT As Long = 3
Public Const BED_ONLYTOME As Long = 4
Public Const BED_TO As Long = 5
Public Const BED_IMPORTANCE As Long = 6
Public Const BED_CC As Long = 9
Public Const BED_TOORCC As Long = 10
Public Const BED_NOTTO As Long = 11
Public Const BED_SENTTO As Long = 12
Public Const BED_BODY As Long = 13
Public Const BED_BODYORSUBJECT As Long = 14
Public Const BED_HEADER As Long = 15
Public Const BED_RECIPADDR As Long = 16
Public Const BED_SENDERADDR As Long = 17
Public Const BED_CATEGORY As Long = 18
Public Const BED_OOF As Long = 19
Public Const BED_ATTACHMENT As Long = 20
Public Const BED_FORMNAME As Long = 23
Public Const BED_INADDRLIST As Long = 25
Public Const BED_MEETING As Long = 26
Public Const BED_LOCALONLY As Long = 27
Public Const BED_OTHERMACHINE As Long = 28
Public Const BED_ANYCATEGORY As Long = 29
Public Const BED_RSS As Long = 30
Public Const BED_ANYRSS As Long = 31
' Groesster bekannter OlRuleActionType (olRuleActionMarkAsTask)
Public Const AKT_TYP_MAX As Long = 41
' PR_SMTP_ADDRESS (Unicode bzw. ANSI) fuer AddressEntry.PropertyAccessor
Private Const PR_SMTP_W As String = "http://schemas.microsoft.com/mapi/proptag/0x39FE001F"
Private Const PR_SMTP_A As String = "http://schemas.microsoft.com/mapi/proptag/0x39FE001E"
' Sitzung fuer das Aufloesen von Empfaengern (CreateRecipient ist fluechtig, schreibt nichts) und Merkliste der
' Ergebnisse je Lauf: vbLf & art & Chr(1) & Kandidaten & Chr(1) & ergebnis & vbLf
Private gEmpfNs As Object
Private gEmpfMerk As String

Public Function LesenVersion() As String
    LesenVersion = "Lesen 2.2"
End Function

Public Function BedTypName(ByVal t As Long) As String
    Select Case t
        Case 1: BedTypName = "Absender ist"
        Case 2: BedTypName = "Betreff enthält"
        Case 3: BedTypName = "über Konto"
        Case 4: BedTypName = "nur an mich"
        Case 5: BedTypName = "an mich"
        Case 6: BedTypName = "Wichtigkeit"
        Case 7: BedTypName = "Vertraulichkeit"
        Case 8: BedTypName = "zur Nachverfolgung gekennzeichnet"
        Case 9: BedTypName = "Cc an mich"
        Case 10: BedTypName = "an oder Cc an mich"
        Case 11: BedTypName = "nicht an mich"
        Case 12: BedTypName = "Gesendet an"
        Case 13: BedTypName = "Mailtext enthält"
        Case 14: BedTypName = "Betreff oder Mailtext enthält"
        Case 15: BedTypName = "Nachrichtenkopf enthält"
        Case 16: BedTypName = "Empfängeradresse enthält"
        Case 17: BedTypName = "Absenderadresse enthält"
        Case 18: BedTypName = "Kategorie"
        Case 19: BedTypName = "Abwesenheitsnotiz (automatische Antwort)"
        Case 20: BedTypName = "Hat Anhang"
        Case 21: BedTypName = "Größe"
        Case 22: BedTypName = "Datumsbereich"
        Case 23: BedTypName = "Formular / Nachrichtenklasse"
        Case 24: BedTypName = "Eigenschaft"
        Case 25: BedTypName = "Absender in Adressliste"
        Case 26: BedTypName = "Besprechungsanfrage oder -aktualisierung"
        Case 27: BedTypName = "nur auf diesem Computer"
        Case 28: BedTypName = "auf anderem Computer"
        Case 29: BedTypName = "beliebige Kategorie"
        Case 30: BedTypName = "aus RSS-Feed"
        Case 31: BedTypName = "aus beliebigem RSS-Feed"
        Case Else: BedTypName = "unbekannte Bedingung (Typ " & t & ")"
    End Select
End Function

' Bezeichnung (wie im Export) -> Typ; 0 wenn unbekannt. Nur Typen mit Wortlisten bzw. Adressen.
Public Function BedTypAusText(ByVal s As String) As Long
    Select Case LCase(Trim(s))
        Case "betreff enthält": BedTypAusText = 2
        Case "mailtext enthält", "text enthält": BedTypAusText = 13
        Case "betreff oder mailtext enthält", "betreff oder text enthält": BedTypAusText = 14
        Case "nachrichtenkopf enthält": BedTypAusText = 15
        Case "empfängeradresse enthält": BedTypAusText = 16
        Case "absenderadresse enthält": BedTypAusText = 17
    End Select
End Function

' Typen, deren Werte eine Liste sind (Empfaenger, Woerter, Adressen, Kategorien, Formulare).
Public Function BedHatListe(ByVal t As Long) As Boolean
    Select Case t
        Case 1, 2, 12, 13, 14, 15, 16, 17, 18, 23
            BedHatListe = True
    End Select
End Function

' Laut Objektmodell programmatisch anlegbar.
Public Function BedAnlegbar(ByVal t As Long) As Boolean
    Select Case t
        Case 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 23, 25, 26, 27, 29, 30, 31
            BedAnlegbar = True
    End Select
End Function

' Davon kopiert das Makro (die uebrigen anlegbaren Typen: Konto, Formular, Adressliste, Nur-lokal, RSS).
Public Function BedKopierbar(ByVal t As Long) As Boolean
    Select Case t
        Case 1, 2, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 26, 29
            BedKopierbar = True
    End Select
End Function

' Typen mit eigener benannter Eigenschaft (fuer die Gegenpruefung).
Public Function BedBenannteTypen() As Variant
    BedBenannteTypen = Array(1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 23, 25, 26, 27, 28, 29, 30, 31)
End Function

Public Function BedBenannt(ByVal t As Long) As Boolean
    Select Case t
        Case 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 23, 25, 26, 27, 28, 29, 30, 31
            BedBenannt = True
    End Select
End Function

' Benannte Eigenschaft zu einem Bedingungstyp (Namen laut Microsoft Learn, RuleConditions). fehlerNr/fehlerText:
' Fehler beim Zugriff (438 = Eigenschaft gibt es in dieser Outlook-Version nicht).
Public Function BedNachTypF(ByVal conds As Object, ByVal t As Long, ByRef fehlerNr As Long, ByRef fehlerText As String) As Object
    Dim c As Object
    fehlerNr = 0: fehlerText = ""
    If conds Is Nothing Then Exit Function
    On Error Resume Next
    Select Case t
        Case 1: Set c = conds.From
        Case 2: Set c = conds.Subject
        Case 3: Set c = conds.Account
        Case 4: Set c = conds.OnlyToMe
        Case 5: Set c = conds.ToMe
        Case 6: Set c = conds.Importance
        Case 9: Set c = conds.CC
        Case 10: Set c = conds.ToOrCc
        Case 11: Set c = conds.NotTo
        Case 12: Set c = conds.SentTo
        Case 13: Set c = conds.Body
        Case 14: Set c = conds.BodyOrSubject
        Case 15: Set c = conds.MessageHeader
        Case 16: Set c = conds.RecipientAddress
        Case 17: Set c = conds.SenderAddress
        Case 18: Set c = conds.Category
        Case 20: Set c = conds.HasAttachment
        Case 23: Set c = conds.FormName
        Case 25: Set c = conds.SenderInAddressList
        Case 26: Set c = conds.MeetingInviteOrUpdate
        Case 27: Set c = conds.OnLocalMachine
        Case 28: Set c = conds.OnOtherMachine
        Case 29: Set c = conds.AnyCategory
        Case 30: Set c = conds.FromRssFeed
        Case 31: Set c = conds.FromAnyRSSFeed
    End Select
    If Err.Number <> 0 Then
        fehlerNr = Err.Number
        fehlerText = Err.Description
        Set c = Nothing
    End If
    On Error GoTo 0
    Set BedNachTypF = c
End Function

' Benannte Eigenschaft; Nothing, wenn es keine gibt oder sie nicht lesbar ist.
Public Function BedNachTyp(ByVal conds As Object, ByVal t As Long) As Object
    Dim nr As Long, d As String
    Set BedNachTyp = BedNachTypF(conds, t, nr, d)
End Function

' Variant (Array oder Einzelwert) als W_SEP-Liste.
Public Function WAusVariant(ByVal v As Variant) As String
    Dim i As Long, s As String
    On Error Resume Next
    If IsArray(v) Then
        For i = LBound(v) To UBound(v)
            If Trim(CStr(v(i))) <> "" Then s = Anhaengen(s, Trim(CStr(v(i))), W_SEP)
        Next i
    ElseIf Not IsEmpty(v) And Not IsNull(v) Then
        If Trim(CStr(v)) <> "" Then s = Trim(CStr(v))
    End If
    WAusVariant = s
End Function

Public Function Verbinden(ByVal v As Variant) As String
    Verbinden = Replace(WAusVariant(v), W_SEP, "; ")
End Function

' Werte einer Bedingung als W_SEP-Liste. problem: warum nicht lesbar. namen: Anzeige (Empfaengernamen).
Public Function BedWerte(ByVal c As Object, ByVal t As Long, ByRef problem As String, ByRef namen As String) As String
    Dim w As String, rc As Object, n As Long, i As Long, a As String, nm As String, fehlt As Long, v As Variant
    problem = "": namen = ""
    On Error Resume Next
    Select Case t
        Case 1, 12
            Set rc = c.Recipients
            n = rc.Count
            For i = 1 To n
                a = EmpfaengerAdresse(rc.Item(i))
                nm = ""
                nm = rc.Item(i).Name
                If a = "" Then
                    fehlt = fehlt + 1
                Else
                    w = Anhaengen(w, a, W_SEP)
                End If
                namen = Anhaengen(namen, IIf(nm = "", a, nm))
            Next i
            If fehlt > 0 Then problem = fehlt & " Empfänger ohne lesbare Adresse"
        Case 2, 13, 14, 15
            v = c.Text
            w = WAusVariant(v)
        Case 16, 17
            v = c.Address
            w = WAusVariant(v)
        Case 18
            v = c.Categories
            w = WAusVariant(v)
        Case 23
            v = c.FormName
            w = WAusVariant(v)
        Case 6
            w = CStr(c.Importance)
    End Select
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Werte nicht lesbar: " & Err.Description)
    On Error GoTo 0
    If namen = "" Then namen = WAnzeigen(w, 6)
    BedWerte = w
End Function

' Werteliste einer Bedingung (Woerter, Adressen, Kategorien, Formulare) genau so, wie Outlook sie liefert
' (Variant, ungetrimmt). Fehler gehen an den Aufrufer.
Public Function BedRoh(ByVal c As Object, ByVal t As Long) As Variant
    Select Case t
        Case BED_RECIPADDR, BED_SENDERADDR
            BedRoh = c.Address
        Case BED_CATEGORY
            BedRoh = c.Categories
        Case BED_FORMNAME
            BedRoh = c.FormName
        Case Else
            BedRoh = c.Text
    End Select
End Function

' Rohwerte als 0-basiertes String-Array, Elemente unveraendert (auch leere und Leerzeichen am Rand); n = Anzahl.
Public Function RohWerte(ByVal v As Variant, ByRef n As Long) As Variant
    Dim a() As String, i As Long
    n = 0
    If IsArray(v) Then
        If UBound(v) >= LBound(v) Then
            ReDim a(0 To UBound(v) - LBound(v))
            For i = LBound(v) To UBound(v)
                If IsNull(v(i)) Then
                    a(n) = ""
                Else
                    a(n) = CStr(v(i))
                End If
                n = n + 1
            Next i
            RohWerte = a
        End If
    ElseIf Not IsEmpty(v) And Not IsNull(v) Then
        ReDim a(0 To 0)
        a(0) = CStr(v)
        n = 1
        RohWerte = a
    End If
End Function

' Rohwerte als W_SEP-Liste, Werte unveraendert (zum Uebernehmen in eine andere Regel).
Public Function RohText(ByVal v As Variant) As String
    Dim a As Variant, n As Long, i As Long, s As String
    a = RohWerte(v, n)
    For i = 0 To n - 1
        If i > 0 Then s = s & W_SEP
        s = s & a(i)
    Next i
    RohText = s
End Function

' Anzeigenamen der Empfaenger einer Bedingung, deren Adresse in adressen (W_SEP-Liste) steht - in der Reihenfolge
' der Bedingung, je Adresse einmal; ohne Namen die Adresse. Rueckgabe W_SEP-Liste.
Public Function EmpfNamenFuer(ByVal c As Object, ByVal adressen As String) As String
    Dim rc As Object, i As Long, n As Long, a As String, nm As String, s As String, ref As String, schon As String
    If c Is Nothing Or adressen = "" Then Exit Function
    ref = W_SEP & LCase(adressen) & W_SEP
    schon = W_SEP
    On Error Resume Next
    Set rc = c.Recipients
    n = rc.Count
    For i = 1 To n
        a = ""
        a = EmpfaengerAdresse(rc.Item(i))
        If a <> "" Then
            If InStr(ref, W_SEP & LCase(a) & W_SEP) > 0 And InStr(schon, W_SEP & LCase(a) & W_SEP) = 0 Then
                nm = ""
                nm = Trim(rc.Item(i).Name)
                If nm = "" Then nm = a
                s = Anhaengen(s, nm, W_SEP)
                schon = schon & LCase(a) & W_SEP
            End If
        End If
    Next i
    On Error GoTo 0
    EmpfNamenFuer = s
End Function

' Liest Bedingungen oder Ausnahmen. Rueckgabe: Anzahl sichtbarer (aktiver) Bedingungstypen.
' txt: Text; typen: aktive ConditionTypes ("1, 13"); anzahl: Conditions.Count; problem: warum nicht lesbar
' (Zugriffsfehler, unbekannter Typ, Wert nicht lesbar); fremd: aktive Typen, die das Makro nicht kopiert;
' werte: Datensaetze je Typ (siehe modModell), auch inaktive mit Werten.
Public Function BedingungenLesen(ByVal conds As Object, ByRef txt As String, ByRef typen As String, _
                                 ByRef anzahl As Long, ByRef problem As String, ByRef fremd As String, _
                                 ByRef werte As String) As Long
    Dim i As Long, n As Long, c As Object, t As Long, aktiv As Boolean, aktivTypen As String, ok As Boolean
    Dim k As Long, liste As Variant, sichtbar As Long, nr As Long, d As String, w As String, p As String, nm As String
    Dim teile As Variant
    txt = "": typen = "": anzahl = 0: problem = "": fremd = "": werte = ""
    aktivTypen = "|"
    If conds Is Nothing Then
        problem = "nicht lesbar (kein Zugriff)"
        Exit Function
    End If
    On Error Resume Next
    n = conds.Count
    If Err.Number <> 0 Then
        problem = "Zugriffsfehler: " & Err.Description
        On Error GoTo 0
        Exit Function
    End If
    anzahl = n
    ' 1) Index-Durchlauf: aktive Typen
    For i = 1 To n
        Err.Clear
        Set c = Nothing
        Set c = conds.Item(i)
        aktiv = False
        t = -1
        ok = Not (c Is Nothing)
        If ok Then
            aktiv = c.Enabled
            t = c.ConditionType
        End If
        If Err.Number <> 0 Then
            problem = Anhaengen(problem, "Eintrag " & i & " nicht lesbar: " & Err.Description)
        ElseIf Not ok Then
            problem = Anhaengen(problem, "Eintrag " & i & " fehlt")
        ElseIf aktiv Then
            If InStr(aktivTypen, "|" & t & "|") = 0 Then aktivTypen = aktivTypen & t & "|"
        End If
    Next i
    Err.Clear
    On Error GoTo 0
    ' 2) Benannte Eigenschaften: Werte und Gegenpruefung der aktiven Typen
    liste = BedBenannteTypen()
    For k = LBound(liste) To UBound(liste)
        t = CLng(liste(k))
        Set c = BedNachTypF(conds, t, nr, d)
        If nr <> 0 And nr <> 438 Then problem = Anhaengen(problem, BedTypName(t) & " nicht lesbar: " & d)
        If Not c Is Nothing Then
            aktiv = False
            On Error Resume Next
            aktiv = c.Enabled
            If Err.Number <> 0 Then problem = Anhaengen(problem, BedTypName(t) & ": Aktiv-Status nicht lesbar")
            On Error GoTo 0
            w = "": nm = ""
            If BedHatListe(t) Or t = BED_IMPORTANCE Then w = BedWerte(c, t, p, nm)
            If aktiv And p <> "" Then problem = Anhaengen(problem, BedTypName(t) & ": " & p)
            If aktiv And InStr(aktivTypen, "|" & t & "|") = 0 Then aktivTypen = aktivTypen & t & "|"
            If aktiv Or w <> "" Then werte = WSetzen(werte, t, aktiv, w)
            If aktiv Then txt = Anhaengen(txt, BedTypName(t) & IIf(nm = "", "", " " & nm))
            p = ""
        End If
    Next k
    ' 3) Aktive Typen auswerten
    teile = Split(Mid(aktivTypen, 2), "|")
    For i = LBound(teile) To UBound(teile)
        If teile(i) <> "" Then
            t = CLng(teile(i))
            sichtbar = sichtbar + 1
            typen = Anhaengen(typen, CStr(t), ", ")
            If t <= 0 Or t > 31 Then
                problem = Anhaengen(problem, "Bedingungstyp " & t & " unbekannt")
                txt = Anhaengen(txt, BedTypName(t))
            Else
                If Not BedBenannt(t) Then txt = Anhaengen(txt, BedTypName(t))
                If Not BedKopierbar(t) Then
                    fremd = Anhaengen(fremd, BedTypName(t) & IIf(BedAnlegbar(t), " (vom Makro nicht kopiert)", " (nicht anlegbar)"))
                End If
            End If
        End If
    Next i
    BedingungenLesen = sichtbar
End Function

' Benannte Aktion; Nothing, wenn nicht vorhanden oder nicht lesbar.
Public Function AktNachName(ByVal acts As Object, ByVal schluessel As String) As Object
    Dim a As Object
    On Error Resume Next
    Select Case schluessel
        Case "MOVE": Set a = acts.MoveToFolder
        Case "COPY": Set a = acts.CopyToFolder
        Case "FWD": Set a = acts.Forward
        Case "FWDATT": Set a = acts.ForwardAsAttachment
        Case "REDIR": Set a = acts.Redirect
        Case "HALT": Set a = AktionStop(acts)
        Case "CAT": Set a = acts.AssignToCategory
        Case "CLRCAT": Set a = acts.ClearCategories
        Case "ALERT": Set a = acts.DesktopAlert
    End Select
    If Err.Number <> 0 Then Set a = Nothing
    On Error GoTo 0
    Set AktNachName = a
End Function

Public Function AktSchluessel() As Variant
    AktSchluessel = Array("MOVE", "COPY", "FWD", "FWDATT", "REDIR", "CAT", "CLRCAT", "ALERT", "HALT")
End Function

Public Function AktName(ByVal schluessel As String) As String
    Select Case schluessel
        Case "MOVE": AktName = "In Ordner verschieben"
        Case "COPY": AktName = "In Ordner kopieren"
        Case "FWD": AktName = "Weiterleiten an"
        Case "FWDATT": AktName = "Als Anlage weiterleiten an"
        Case "REDIR": AktName = "Umleiten an"
        Case "CAT": AktName = "Kategorie zuweisen"
        Case "CLRCAT": AktName = "Kategorien löschen"
        Case "ALERT": AktName = "Desktopbenachrichtigung"
        Case "HALT": AktName = "Keine weiteren Regeln anwenden"
    End Select
End Function

' Ordnerpfad einer Verschieben-/Kopieren-Aktion ("" wenn keiner gesetzt).
Public Function AktOrdnerPfad(ByVal a As Object) As String
    Dim f As Object
    On Error Resume Next
    Set f = a.Folder
    If Not f Is Nothing Then AktOrdnerPfad = f.FolderPath
    If Err.Number <> 0 Then AktOrdnerPfad = "(Ordner nicht lesbar)"
    On Error GoTo 0
End Function

' Liest die Aktionen in das Modell (Regel id). Rueckgabe: Text. fremd: aktive Aktionen, die das Makro nicht
' kopiert (Typ aus dem Index-Durchlauf, der keiner benannten Aktion entspricht). problem: Zugriffsfehler oder
' aktive Aktion unbekannten Typs.
Public Function AktionenLesen(ByVal acts As Object, ByVal id As Long, ByRef fremd As String, ByRef problem As String) As String
    Dim schl As Variant, k As Long, a As Object, aktiv As Boolean, txt As String, bekannt As String, t As Long
    Dim i As Long, n As Long, d As String, fehlt As Long, ok As Boolean
    fremd = "": problem = ""
    If acts Is Nothing Then
        problem = "Aktionen nicht lesbar (kein Zugriff)"
        Exit Function
    End If
    bekannt = "|"
    schl = AktSchluessel()
    On Error Resume Next
    For k = LBound(schl) To UBound(schl)
        Err.Clear
        Set a = AktNachName(acts, CStr(schl(k)))
        If Not a Is Nothing Then
            t = -1
            t = a.ActionType
            If t >= 0 Then bekannt = bekannt & t & "|"
            aktiv = False
            aktiv = a.Enabled
            d = ""
            Select Case schl(k)
                Case "MOVE"
                    If aktiv Then
                        mVerAn(id) = True
                        mVerPfad(id) = AktOrdnerPfad(a)
                        d = mVerPfad(id)
                    End If
                Case "COPY"
                    If aktiv Then
                        mKopAn(id) = True
                        mKopPfad(id) = AktOrdnerPfad(a)
                        d = mKopPfad(id)
                    End If
                Case "FWD"
                    ' Empfaenger auch bei abgeschalteter Aktion merken (Umleiten statt Weiterleiten prueft sie)
                    mWeiAn(id) = aktiv
                    fehlt = 0
                    mWeiEmpf(id) = EmpfaengerAdressenF(a.Recipients, fehlt)
                    mWeiFehlt(id) = fehlt
                    mWeiNamen(id) = EmpfaengerNamen(a.Recipients)
                    d = mWeiNamen(id)
                Case "REDIR"
                    mUmlAn(id) = aktiv
                    fehlt = 0
                    mUmlEmpf(id) = EmpfaengerAdressenF(a.Recipients, fehlt)
                    mUmlFehlt(id) = fehlt
                    mUmlNamen(id) = EmpfaengerNamen(a.Recipients)
                    d = mUmlNamen(id)
                Case "FWDATT"
                    If aktiv Then d = EmpfaengerNamen(a.Recipients)
                Case "CAT"
                    If aktiv Then d = Verbinden(a.Categories)
                Case "HALT"
                    If aktiv Then mHalt(id) = True
            End Select
            If aktiv And schl(k) <> "HALT" Then txt = Anhaengen(txt, AktName(CStr(schl(k))) & IIf(d = "", "", " " & d), " + ")
        End If
    Next k
    ' Index-Durchlauf: aktive Aktionen, die keiner benannten Aktion entsprechen
    Err.Clear
    n = acts.Count
    If Err.Number <> 0 Then
        problem = "Zugriffsfehler Aktionen: " & Err.Description
        n = 0
    End If
    For i = 1 To n
        Err.Clear
        Set a = Nothing
        Set a = acts.Item(i)
        aktiv = False
        t = -1
        ok = Not (a Is Nothing)
        If ok Then
            aktiv = a.Enabled
            t = a.ActionType
        End If
        If Err.Number <> 0 Then
            problem = Anhaengen(problem, "Aktion " & i & " nicht lesbar")
        ElseIf aktiv Then
            If t <= 0 Or t > AKT_TYP_MAX Then
                problem = Anhaengen(problem, "aktive Aktion unbekannten Typs (" & t & ")")
                txt = Anhaengen(txt, "unbekannte Aktion (Typ " & t & ")", " + ")
            ElseIf InStr(bekannt, "|" & t & "|") = 0 Then
                fremd = Anhaengen(fremd, "Aktion Typ " & t)
                mAktFremd(id) = Anhaengen(mAktFremd(id), CStr(t), ", ")
                txt = Anhaengen(txt, "weitere Aktion (Typ " & t & ")", " + ")
            End If
        End If
    Next i
    On Error GoTo 0
    If mHalt(id) Then txt = Anhaengen(txt, AktName("HALT"), " + ")
    AktionenLesen = txt
End Function

' Eine Regel in das Modell lesen (Platz id). Bewertet, ob ihre Bedingungen lesbar sind.
Public Sub RegelLesen(ByVal rl As Object, ByVal id As Long)
    Dim conds As Object, ex As Object, acts As Object, problem As String, p As String, fremdB As String
    Dim typenA As String, nA As Long, fremdA As String, fremdAkt As String, pAkt As String, txt As String
    Dim nB As Long, sichtbar As Long, typenB As String, aktiv As Boolean, lokal As Boolean, sichtbarA As Long
    Dim wB As String, wA As String, typ As Long, reihe As Long
    Set mObj(id) = rl
    On Error Resume Next
    txt = "": txt = rl.Name
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Name nicht lesbar"): txt = "(Name nicht lesbar)"
    mName(id) = txt
    ' Aktiv, Nur lokal, Regeltyp und Reihenfolge: ein Lesefehler macht die Regel "nicht lesbar" (keine stillen
    ' Standardwerte - Save schreibt die Regel mit, ohne dass das Makro ihren Stand kennt)
    Err.Clear
    aktiv = False
    aktiv = rl.Enabled
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Aktiv-Status nicht lesbar: " & Err.Description): aktiv = False
    mAktiv(id) = aktiv
    Err.Clear
    lokal = False
    lokal = rl.IsLocalRule
    If Err.Number <> 0 Then problem = Anhaengen(problem, "„Nur lokal“ nicht lesbar: " & Err.Description): lokal = False
    mLokal(id) = lokal
    Err.Clear
    typ = -1
    typ = rl.RuleType
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Regeltyp nicht lesbar: " & Err.Description): typ = -1
    mTyp(id) = typ
    Err.Clear
    reihe = 999999
    reihe = rl.ExecutionOrder
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Reihenfolge nicht lesbar: " & Err.Description): reihe = 999999
    mReihe(id) = reihe
    Err.Clear
    Set conds = Nothing
    Set conds = rl.Conditions
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Zugriffsfehler Bedingungen: " & Err.Description): Set conds = Nothing
    Err.Clear
    Set ex = Nothing
    Set ex = rl.Exceptions
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Zugriffsfehler Ausnahmen: " & Err.Description): Set ex = Nothing
    Err.Clear
    Set acts = Nothing
    Set acts = rl.Actions
    If Err.Number <> 0 Then problem = Anhaengen(problem, "Zugriffsfehler Aktionen: " & Err.Description): Set acts = Nothing
    Err.Clear
    On Error GoTo 0
    sichtbar = BedingungenLesen(conds, txt, typenB, nB, p, fremdB, wB)
    mBed(id) = txt
    mTypen(id) = typenB
    mNBed(id) = nB
    mNSicht(id) = sichtbar
    mBedW(id) = wB
    If p <> "" Then problem = Anhaengen(problem, "Bedingungen: " & p)
    sichtbarA = BedingungenLesen(ex, txt, typenA, nA, p, fremdA, wA)
    mAus(id) = txt
    mAusTypen(id) = typenA
    mAusW(id) = wA
    If p <> "" Then problem = Anhaengen(problem, "Ausnahmen: " & p)
    mAkt(id) = AktionenLesen(acts, id, fremdAkt, pAkt)
    If pAkt <> "" Then problem = Anhaengen(problem, pAkt)
    mFremd(id) = Anhaengen(Anhaengen(fremdB, fremdA), fremdAkt)
    mGrund(id) = problem
    mLesbar(id) = (problem = "")
    ' Lesbar, aber keine aktive Bedingung: greift bei allen Mails (Sammelregel) oder in Outlook im Web angelegt.
    ' Sperrt das Speichern nicht, wird aber in der Vorschau gelistet und vor dem Ausfuehren bestaetigt.
    mOhneBed(id) = (problem = "" And sichtbar = 0)
End Sub

' Alle Regeln eines Postfachs in das Modell lesen. regeln: das Rules-Objekt (fuer Ausfuehren).
Public Function StandLesen(ByVal store As Object, ByRef regeln As Object, ByRef fehler As String) As Boolean
    Dim n As Long, i As Long, rl As Object
    ModellLeeren
    fehler = ""
    On Error Resume Next
    Set regeln = Nothing
    Set regeln = store.GetRules()
    If Err.Number <> 0 Or regeln Is Nothing Then
        fehler = "Regeln nicht lesbar: " & Err.Description
        On Error GoTo 0
        Exit Function
    End If
    n = regeln.Count
    If Err.Number <> 0 Then
        fehler = "Anzahl der Regeln nicht lesbar: " & Err.Description
        On Error GoTo 0
        Exit Function
    End If
    On Error GoTo 0
    mAnz = n
    ModellGroesse n, False
    For i = 1 To n
        On Error Resume Next
        Set rl = Nothing
        Set rl = regeln.Item(i)
        If Err.Number <> 0 Or rl Is Nothing Then
            fehler = "Regel " & i & " nicht lesbar: " & Err.Description
            On Error GoTo 0
            Exit Function
        End If
        On Error GoTo 0
        RegelLesen rl, i
    Next i
    ReihenfolgeAusWerten
    ' Namen wie in Outlook festhalten (Meldungen nennen Regeln so, auch wenn der Plan sie im Abbild umbenennt)
    NamenFesthalten
    StandLesen = True
End Function

' ---------------------------------------------------------------- Postfaecher und Ordner

Public Function PostfachName(ByVal store As Object) As String
    Dim s As String
    On Error Resume Next
    s = store.GetRootFolder().FolderPath
    If Left(s, 2) = "\\" Then s = Mid(s, 3)
    If s = "" Then s = store.DisplayName
    On Error GoTo 0
    PostfachName = s
End Function

' Anzeigename des Postfachs ("" wenn nicht lesbar).
Public Function PostfachAnzeige(ByVal store As Object) As String
    Dim s As String
    On Error Resume Next
    s = Trim(store.DisplayName)
    On Error GoTo 0
    PostfachAnzeige = s
End Function

' Postfach (Store) im Outlook-Profil per Adresse: Anzeigename oder Stammordner \\adresse, ohne Gross-/Kleinschreibung.
Public Function PostfachFinden(ByVal ol As Object, ByVal adresse As String, ByRef fehler As String) As Object
    Dim stores As Object, i As Long, st As Object, dn As String, wurzel As String, ziel As String, treffer As Object
    Dim n As Long
    fehler = ""
    ziel = LCase(Trim(adresse))
    If ziel = "" Then
        fehler = "Keine Postfachadresse angegeben"
        Exit Function
    End If
    On Error Resume Next
    Set stores = ol.Session.Stores
    n = stores.Count
    If Err.Number <> 0 Then
        fehler = "Postfächer im Outlook-Profil nicht lesbar: " & Err.Description
        On Error GoTo 0
        Exit Function
    End If
    For i = 1 To n
        Err.Clear
        Set st = Nothing
        Set st = stores.Item(i)
        If Not st Is Nothing Then
            dn = "": wurzel = ""
            dn = LCase(Trim(st.DisplayName))
            Err.Clear
            wurzel = LCase(st.GetRootFolder().FolderPath)
            If dn = ziel Or wurzel = "\\" & ziel Then
                If treffer Is Nothing Then
                    Set treffer = st
                ElseIf Not treffer Is st Then
                    fehler = "Postfach " & adresse & " ist mehrfach im Profil eingebunden"
                    Set treffer = Nothing
                    Exit For
                End If
            End If
        End If
    Next i
    On Error GoTo 0
    If treffer Is Nothing And fehler = "" Then
        fehler = "Postfach " & adresse & " nicht im Outlook-Profil gefunden (in Outlook als weiteres Postfach einbinden)"
    End If
    Set PostfachFinden = treffer
End Function

' Ordnername aus einem Pfadteil: %2F steht im FolderPath fuer "/".
Public Function OrdnerTeil(ByVal s As String) As String
    OrdnerTeil = Replace(Replace(s, "%2F", "/"), "%2f", "/")
End Function

' Ordner ueber den Pfad \\postfach\a\b suchen, ohne etwas anzulegen.
' fehlt: Pfad bis zum ersten fehlenden Ordner (leer, wenn alles da ist); problem: Pfad ungueltig/fremdes Postfach.
Public Function OrdnerFinden(ByVal store As Object, ByVal pfad As String, ByRef fehlt As String, ByRef problem As String) As Object
    Dim rest As String, teile As Variant, k As Long, f As Object, kind As Object, bisher As String, pf As String
    fehlt = "": problem = ""
    pfad = Trim(pfad)
    If Left(pfad, 2) <> "\\" Then
        problem = "Pfad muss mit \\postfach\ beginnen"
        Exit Function
    End If
    rest = Mid(pfad, 3)
    Do While Right(rest, 1) = "\"
        rest = Left(rest, Len(rest) - 1)
    Loop
    If rest = "" Or Left(rest, 1) = "\" Then
        problem = "Pfad ohne Postfachnamen"
        Exit Function
    End If
    teile = Split(rest, "\")
    pf = PostfachName(store)
    If LCase(CStr(teile(0))) <> LCase(pf) Then
        problem = "Ordner liegt nicht im Postfach " & pf
        Exit Function
    End If
    For k = 1 To UBound(teile)
        If Trim(teile(k)) = "" Then
            problem = "Pfad mit leerem Ordnernamen"
            Exit Function
        End If
    Next k
    On Error Resume Next
    Set f = store.GetRootFolder()
    If Err.Number <> 0 Or f Is Nothing Then
        problem = "Stammordner nicht lesbar"
        On Error GoTo 0
        Exit Function
    End If
    bisher = "\\" & teile(0)
    For k = 1 To UBound(teile)
        Err.Clear
        Set kind = Nothing
        Set kind = f.Folders.Item(OrdnerTeil(CStr(teile(k))))
        bisher = bisher & "\" & teile(k)
        If Err.Number <> 0 Or kind Is Nothing Then
            fehlt = bisher
            On Error GoTo 0
            Exit Function
        End If
        Set f = kind
    Next k
    On Error GoTo 0
    Set OrdnerFinden = f
End Function

' ---------------------------------------------------------------- Empfaenger

' Empfaenger werden ueber eine Kandidaten-Kaskade gelesen (EmpfKandidaten): SMTP des Exchange-Benutzers, SMTP der
' Verteilerliste, PR_SMTP_ADDRESS ueber den PropertyAccessor (auch dynamische Verteiler und Eintraege ohne
' ExchangeUser), Address mit "@", Exchange-DN ("/o=..."), zuletzt der Anzeigename.
'  - Schluessel (EmpfaengerAdresse, fuer jeden Vergleich, Quelle und Ziel gleich): der erste Kandidat. Ist er keine
'    SMTP-Adresse (nur DN oder Name), wird er ueber die Sitzung aufgeloest und der erste Kandidat des aufgeloesten
'    Empfaengers genommen - so hat ein Eintrag, der im Ziel als DN oder Name gelesen wird, denselben Schluessel wie
'    in der Quelle und wird nicht doppelt eingetragen. Laesst er sich nicht aufloesen, bleibt der erste Kandidat.
'  - Eingabe (EmpfEingabe, zum Eintragen): der erste Kandidat, den Session.CreateRecipient(...).Resolve aufloest.
'    Keiner aufloesbar = nicht uebernehmbar (blockiert); die Meldung nennt Typ und Adresse (EmpfAnzeige).
' Ohne Sitzung (EmpfaengerSitzung nicht aufgerufen) wird nichts aufgeloest: Schluessel = erster Kandidat, Eingabe leer.

' Sitzung fuer einen Lauf setzen und die Merkliste leeren (Lesen, Vorschau, Ausfuehren).
Public Sub EmpfaengerSitzung(ByVal ol As Object)
    Set gEmpfNs = Nothing
    gEmpfMerk = vbLf
    If ol Is Nothing Then Exit Sub
    On Error Resume Next
    Set gEmpfNs = ol.Session
    If Err.Number <> 0 Then Set gEmpfNs = Nothing
    On Error GoTo 0
End Sub

Private Function IstSmtp(ByVal s As String) As Boolean
    s = Trim(s)
    IstSmtp = (InStr(s, "@") > 1 And Left(s, 1) <> "/")
End Function

Private Function IstDn(ByVal s As String) As Boolean
    IstDn = (LCase(Left(Trim(s), 3)) = "/o=")
End Function

' Kandidat an die Liste (vbTab-getrennt) anhaengen, ohne Doppelte (ohne Gross-/Kleinschreibung).
Private Function KandHinzu(ByVal liste As String, ByVal s As String) As String
    s = Trim(s)
    KandHinzu = liste
    If s = "" Then Exit Function
    If InStr(vbTab & LCase(liste) & vbTab, vbTab & LCase(s) & vbTab) > 0 Then Exit Function
    KandHinzu = Anhaengen(liste, s, vbTab)
End Function

' Exchange-DN fuer Meldungen kuerzen: erster und letzter Teil ("/o=Org/…/cn=name"), hoechstens n Zeichen.
Private Function AdrKurz(ByVal s As String, ByVal n As Long) As String
    Dim p As Long
    s = Trim(s)
    If IstDn(s) Then
        p = InStrRev(s, "/")
        If p > InStr(2, s, "/") And InStr(2, s, "/") > 0 Then s = Left(s, InStr(2, s, "/")) & "…" & Mid(s, p)
    End If
    AdrKurz = KurzName(s, n)
End Function

' Kandidaten eines Empfaengers in der Reihenfolge der Kaskade (vbTab-getrennt). info: Adresstyp und Adresse fuer
' Meldungen (z. B. "EX /o=Org/…/cn=xyz, keine SMTP-Adresse").
Public Function EmpfKandidaten(ByVal rcp As Object, ByRef info As String) As String
    Dim ae As Object, eu As Object, dl As Object, pa As Object, s As String, liste As String, ut As Long
    Dim adrR As String, adrE As String, nm As String, smtp As String, teile As Variant, dn As String
    info = ""
    If rcp Is Nothing Then Exit Function
    On Error Resume Next
    Set ae = Nothing
    Set ae = rcp.AddressEntry
    Err.Clear
    If Not ae Is Nothing Then
        Set eu = Nothing
        Set eu = ae.GetExchangeUser()
        Err.Clear
        If Not eu Is Nothing Then
            s = ""
            s = eu.PrimarySmtpAddress
            liste = KandHinzu(liste, s)
            Err.Clear
        End If
        Set dl = Nothing
        Set dl = ae.GetExchangeDistributionList()
        Err.Clear
        If Not dl Is Nothing Then
            s = ""
            s = dl.PrimarySmtpAddress
            liste = KandHinzu(liste, s)
            Err.Clear
        End If
        Set pa = Nothing
        Set pa = ae.PropertyAccessor
        Err.Clear
        If Not pa Is Nothing Then
            s = ""
            s = CStr(pa.GetProperty(PR_SMTP_W))
            If Err.Number = 0 And IstSmtp(s) Then liste = KandHinzu(liste, s)
            Err.Clear
            s = ""
            s = CStr(pa.GetProperty(PR_SMTP_A))
            If Err.Number = 0 And IstSmtp(s) Then liste = KandHinzu(liste, s)
            Err.Clear
        End If
        ut = -1
        ut = ae.AddressEntryUserType
        adrE = ""
        adrE = ae.Address
        Err.Clear
    End If
    adrR = ""
    adrR = rcp.Address
    Err.Clear
    If IstSmtp(adrR) Then liste = KandHinzu(liste, adrR)
    If IstSmtp(adrE) Then liste = KandHinzu(liste, adrE)
    ' erste SMTP-Adresse merken (fuer die Meldung), bevor DN und Name dazukommen
    If liste <> "" Then
        teile = Split(liste, vbTab)
        smtp = CStr(teile(0))
    End If
    If IstDn(adrR) Then liste = KandHinzu(liste, adrR)
    If IstDn(adrE) Then liste = KandHinzu(liste, adrE)
    nm = ""
    nm = rcp.Name
    Err.Clear
    If Trim(nm) = "" And Not ae Is Nothing Then
        nm = ae.Name
        Err.Clear
    End If
    liste = KandHinzu(liste, nm)
    On Error GoTo 0
    ' Typ und Adresse fuer Meldungen: EX-DN, SMTP oder nur Name; AddressEntryUserType als Zahl
    If IstDn(adrR) Then
        dn = adrR
    ElseIf IstDn(adrE) Then
        dn = adrE
    End If
    If dn <> "" Then
        info = "EX " & AdrKurz(dn, 60)
    ElseIf IstSmtp(adrR) Then
        info = "SMTP " & AdrKurz(adrR, 60)
    ElseIf Trim(adrR) <> "" And LCase(Trim(adrR)) <> LCase(Trim(nm)) Then
        info = "Adresse " & AdrKurz(adrR, 60)
    ElseIf ae Is Nothing Then
        info = "ohne Adresseintrag"
    Else
        info = "ohne Adresse"
    End If
    If ut >= 0 Then info = info & ", Adresstyp " & ut
    If smtp = "" Then
        info = info & ", keine SMTP-Adresse"
    ElseIf InStr(LCase(info), LCase(smtp)) = 0 Then
        info = info & ", SMTP " & smtp
    End If
    EmpfKandidaten = liste
End Function

' Merkliste je Lauf (art "S" Schluessel, "E" Eingabe); gefunden = True, wenn schon ermittelt.
Private Function Gemerkt(ByVal art As String, ByVal schl As String, ByRef wert As String) As Boolean
    Dim p As Long, q As Long, such As String
    such = vbLf & art & Chr(1) & LCase(schl) & Chr(1)
    p = InStr(gEmpfMerk, such)
    If p = 0 Then Exit Function
    p = p + Len(such)
    q = InStr(p, gEmpfMerk, vbLf)
    wert = Mid(gEmpfMerk, p, q - p)
    Gemerkt = True
End Function

Private Sub Merken(ByVal art As String, ByVal schl As String, ByVal wert As String)
    If gEmpfMerk = "" Then gEmpfMerk = vbLf
    gEmpfMerk = gEmpfMerk & art & Chr(1) & LCase(schl) & Chr(1) & wert & vbLf
End Sub

' Eine Eingabe ueber die Sitzung aufloesen (fluechtiger Empfaenger, aendert nichts in Outlook). r: aufgeloester
' Empfaenger (Nothing, wenn nicht aufloesbar).
Private Function NsAufloesen(ByVal eingabe As String, ByRef r As Object) As Boolean
    Dim ok As Boolean
    Set r = Nothing
    If gEmpfNs Is Nothing Or Trim(eingabe) = "" Then Exit Function
    On Error Resume Next
    Set r = gEmpfNs.CreateRecipient(eingabe)
    If Not r Is Nothing Then ok = r.Resolve()
    If Err.Number <> 0 Then ok = False
    On Error GoTo 0
    If Not ok Then Set r = Nothing
    NsAufloesen = ok
End Function

' Erster Kandidat, der sich aufloesen laesst ("" = keiner). info: Typ und Adresse fuer Meldungen.
Public Function EmpfEingabe(ByVal rcp As Object, ByRef info As String) As String
    Dim kand As String, teile As Variant, i As Long, r As Object, w As String
    kand = EmpfKandidaten(rcp, info)
    If kand = "" Then Exit Function
    If Gemerkt("E", kand, w) Then
        EmpfEingabe = w
        Exit Function
    End If
    teile = Split(kand, vbTab)
    For i = LBound(teile) To UBound(teile)
        If NsAufloesen(CStr(teile(i)), r) Then
            w = CStr(teile(i))
            Exit For
        End If
    Next i
    If gEmpfNs Is Nothing Then Exit Function
    Merken "E", kand, w
    EmpfEingabe = w
End Function

' Schluessel eines Empfaengers fuer Vergleiche (siehe oben). Quelle und Ziel werden gleich behandelt.
Public Function EmpfaengerAdresse(ByVal rcp As Object) As String
    Dim kand As String, info As String, erst As String, teile As Variant, i As Long, r As Object, w As String
    Dim k2 As String, i2 As String
    kand = EmpfKandidaten(rcp, info)
    If kand = "" Then Exit Function
    teile = Split(kand, vbTab)
    erst = CStr(teile(0))
    If IstSmtp(erst) Or gEmpfNs Is Nothing Then
        EmpfaengerAdresse = erst
        Exit Function
    End If
    If Gemerkt("S", kand, w) Then
        EmpfaengerAdresse = w
        Exit Function
    End If
    w = erst
    For i = LBound(teile) To UBound(teile)
        If NsAufloesen(CStr(teile(i)), r) Then
            k2 = EmpfKandidaten(r, i2)
            If k2 <> "" Then
                teile = Split(k2, vbTab)
                w = CStr(teile(0))
            End If
            Exit For
        End If
    Next i
    Merken "S", kand, w
    EmpfaengerAdresse = w
End Function

' Anzeige fuer Meldungen: "Name (Typ Adresse)".
Public Function EmpfAnzeige(ByVal rcp As Object) As String
    Dim info As String, kand As String, nm As String, teile As Variant
    kand = EmpfKandidaten(rcp, info)
    On Error Resume Next
    nm = ""
    nm = Trim(rcp.Name)
    On Error GoTo 0
    If nm = "" And kand <> "" Then
        teile = Split(kand, vbTab)
        nm = CStr(teile(0))
    End If
    EmpfAnzeige = nm & " (" & info & ")"
End Function

' Empfaenger einer Liste, die sich ueber keinen Kandidaten aufloesen lassen. nur: W_SEP-Liste von Schluesseln (leer =
' alle). Rueckgabe: Anzeige je Empfaenger ("Name (Typ Adresse)"), schl/namen: Schluessel bzw. Namen - alle drei als
' W_SEP-Listen in derselben Reihenfolge.
Public Function EmpfOffen(ByVal rcps As Object, ByVal nur As String, ByRef schl As String, ByRef namen As String) As String
    Dim i As Long, n As Long, r As Object, a As String, info As String, s As String, nm As String, ref As String
    schl = "": namen = ""
    If rcps Is Nothing Then Exit Function
    ref = W_SEP & LCase(nur) & W_SEP
    On Error Resume Next
    n = rcps.Count
    On Error GoTo 0
    For i = 1 To n
        Set r = Nothing
        On Error Resume Next
        Set r = rcps.Item(i)
        On Error GoTo 0
        If Not r Is Nothing Then
            a = EmpfaengerAdresse(r)
            If nur = "" Or InStr(ref, W_SEP & LCase(a) & W_SEP) > 0 Then
                If EmpfEingabe(r, info) = "" Then
                    s = Anhaengen(s, EmpfAnzeige(r), W_SEP)
                    schl = Anhaengen(schl, a, W_SEP)
                    nm = ""
                    On Error Resume Next
                    nm = Trim(r.Name)
                    On Error GoTo 0
                    If nm = "" Then nm = a
                    namen = Anhaengen(namen, nm, W_SEP)
                End If
            End If
        End If
    Next i
    EmpfOffen = s
End Function

' Adressen ("a; b"); fehlt: Anzahl der Empfaenger ohne lesbare Adresse.
Public Function EmpfaengerAdressenF(ByVal rcps As Object, ByRef fehlt As Long) As String
    Dim i As Long, n As Long, s As String, a As String
    fehlt = 0
    On Error Resume Next
    n = rcps.Count
    For i = 1 To n
        a = ""
        a = EmpfaengerAdresse(rcps.Item(i))
        If a = "" Then
            fehlt = fehlt + 1
        Else
            s = Anhaengen(s, a)
        End If
    Next i
    On Error GoTo 0
    EmpfaengerAdressenF = s
End Function

Public Function EmpfaengerAdressen(ByVal rcps As Object) As String
    Dim f As Long
    EmpfaengerAdressen = EmpfaengerAdressenF(rcps, f)
End Function

Public Function EmpfaengerNamen(ByVal rcps As Object) As String
    Dim i As Long, n As Long, s As String, nm As String
    On Error Resume Next
    n = rcps.Count
    For i = 1 To n
        nm = ""
        nm = rcps.Item(i).Name
        s = Anhaengen(s, nm)
    Next i
    On Error GoTo 0
    EmpfaengerNamen = s
End Function

' Regel im Quellpostfach nach Namen (nur lesen). fehler bei 0 oder mehreren Treffern.
Public Function QuellRegelFinden(ByVal regeln As Object, ByVal regelName As String, ByRef fehler As String) As Object
    Dim i As Long, n As Long, rl As Object, nm As String, treffer As Object, anzahl As Long
    fehler = ""
    If regeln Is Nothing Then
        fehler = "Regeln des Quellpostfachs nicht gelesen"
        Exit Function
    End If
    On Error Resume Next
    n = regeln.Count
    For i = 1 To n
        Set rl = Nothing
        Set rl = regeln.Item(i)
        nm = ""
        nm = rl.Name
        If Trim(nm) = Trim(regelName) Then
            anzahl = anzahl + 1
            Set treffer = rl
        End If
    Next i
    On Error GoTo 0
    If anzahl = 0 Then
        fehler = "Quellregel " & Zitat(regelName) & " im Quellpostfach nicht gefunden"
        Set treffer = Nothing
    ElseIf anzahl > 1 Then
        fehler = "Quellregel " & Zitat(regelName) & " gibt es im Quellpostfach " & anzahl & "-mal"
        Set treffer = Nothing
    End If
    Set QuellRegelFinden = treffer
End Function

' Quellregel vollstaendig in Platz 0 des Modells lesen (nur lesen). Rueckgabe "" oder Grund, warum nicht lesbar.
Public Function QuelleLesen(ByVal src As Object) As String
    Dim conds As Object, ex As Object, acts As Object, txt As String, typen As String, n As Long, p As String
    Dim fremd As String, w As String, sichtbar As Long, problem As String, fremdAkt As String, pAkt As String
    QuellPlatzLeeren
    On Error Resume Next
    mName(0) = src.Name
    mAktiv(0) = src.Enabled
    Set conds = Nothing
    Set conds = src.Conditions
    Set ex = Nothing
    Set ex = src.Exceptions
    Set acts = Nothing
    Set acts = src.Actions
    Err.Clear
    On Error GoTo 0
    sichtbar = BedingungenLesen(conds, txt, typen, n, p, fremd, w)
    mBed(0) = txt: mTypen(0) = typen: mNSicht(0) = sichtbar: mBedW(0) = w
    If p <> "" Then problem = Anhaengen(problem, "Bedingungen: " & p)
    mFremd(0) = fremd
    sichtbar = BedingungenLesen(ex, txt, typen, n, p, fremd, w)
    mAus(0) = txt: mAusTypen(0) = typen: mAusW(0) = w
    If p <> "" Then problem = Anhaengen(problem, "Ausnahmen: " & p)
    If fremd <> "" Then mFremd(0) = Anhaengen(mFremd(0), "Ausnahme " & fremd)
    mAkt(0) = AktionenLesen(acts, 0, fremdAkt, pAkt)
    If pAkt <> "" Then problem = Anhaengen(problem, pAkt)
    If fremdAkt <> "" Then mFremd(0) = Anhaengen(mFremd(0), fremdAkt)
    QuelleLesen = problem
End Function
