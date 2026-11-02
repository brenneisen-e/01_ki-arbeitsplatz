Option Explicit
' ============================================================================
' modUmbau - Knoepfe im Blatt "Umsetzung" und Ablaufsteuerung.
'
'   Regeln aus Outlook lesen  -> RegelnLesen  (nur lesen; Blatt "Live")
'   Vorschau                  -> Vorschau     (nur lesen; Ergebnis je Planzeile, schreibt nichts nach Outlook)
'   Ausfuehren                -> Ausfuehren   (nur nach Vorschau ohne Blocker; Sicherung, Ausfuehren, Pruefen)
'
' Sicherheitsregeln (Stellen im Code):
'   - Blatt umgebaut (Zeile/Spalte geloescht): modPlan.LayoutPruefen, vor jedem Lauf; dann laeuft nichts.
'   - Vorschau schreibt nichts: VorschauBerechnen nutzt nur modOlLesen/modModell/modPlan.
'   - Sperre bei nicht lesbaren Regeln: modPlan.Simulieren (Zeilen) und PostfachAusfuehren (erneut vor jedem
'     Schritt und nach allen Schritten im Speicher); Freigabe nur ueber die Einstellung "Trotz nicht lesbarer
'     Bedingungen speichern". Aendert sich die Lage zwischen Vorschau und Speichern, setzt PostfachAusfuehren den
'     Stand Zielpostfach neu; mit "Trotz" = Ja fragt es vor dem Speichern eigens nach (Vorgabe Nein).
'   - Regeln ohne sichtbare Bedingung sperren nicht, muessen aber vor dem Ausfuehren bestaetigt werden.
'   - Ausfuehren nur nach Vorschau ohne Blocker, mit unveraendertem Plan (Pruefwert) und unveraendertem Stand in
'     Outlook (erneute Berechnung muss dieselben Ergebnisse liefern): AusfuehrenLauf.
'   - Rueckfragen (Export als .rwz, Regeln ohne Bedingung, Liste der Aenderungen - ueber MeldungKurz begrenzt, die
'     Frage bleibt immer sichtbar) und Sicherung ins Blatt "Sicherung" vor jeder Aenderung.
'   - Je Postfach: alle Schritte im Speicher, bei jedem Fehler kein Speichern; Ordner erst unmittelbar vor dem
'     Speichern: PostfachAusfuehren.
'   - Nach dem Speichern alles neu lesen und jede Regel mit dem erwarteten Abbild vergleichen (Name, Platz,
'     Bedingungen, Ausnahmen, Aktionen); Abweichung bei Bedingungen (bei neu angelegten Regeln auch bei
'     Ausnahmen): Angebot, die Regel sofort zu deaktivieren.
'   - Regeln des Quellpostfachs werden nur gelesen (gQuellRegeln); gespeichert wird nur das Rules-Objekt des
'     Zielpostfachs; das Quellpostfach dieser Mappe (QUELLE_STANDARD) wird als Ziel abgelehnt. Ordner beider Postfaecher
'     stellt das Blatt Ordner um (modOrdner) - ohne Regeln zu speichern.
' ============================================================================

Public Const UMBAU_VERSION As String = "3.0"
' Hoechstlaenge eines MsgBox-Texts (Excel zeigt etwa 1024 Zeichen)
Public Const MSGBOX_MAX As Long = 1000
Public gLauf As String
Public gProtK As Long
Public gOhneBestaetigt As Long

Public Function UmbauVersion() As String
    UmbauVersion = "Regeln-Umbau " & UMBAU_VERSION
End Function

Private Function Blatt(ByVal blattName As String) As Object
    Set Blatt = ThisWorkbook.Worksheets(blattName)
End Function

' Planzeilen nach dem Schreiben der Ergebnisse an den Text anpassen: AutoFit (Excel) und als Untergrenze eine
' Schaetzung aus Textlaenge und Spaltenbreite (LibreOffice kennt AutoFit fuer Zeilen nicht).
Private Sub ZeilenAnpassen(ByVal ws As Object)
    Dim k As Long, i As Long, n As Long, h As Double, breite As Double, spalten As Variant
    spalten = Array(SP_VORSCHAU, SP_ERGEBNIS, SP_WARUM)
    On Error Resume Next
    For k = 1 To pAnz
        ws.Rows(pZeile(k)).AutoFit
        h = 44
        For i = LBound(spalten) To UBound(spalten)
            breite = ws.Columns(spalten(i)).ColumnWidth
            If breite < 5 Then breite = 30
            n = Int(Len(ZellText(ws, pZeile(k), CLng(spalten(i)))) / (breite * 1.05)) + 1
            If n * 12.5 + 8 > h Then h = n * 12.5 + 8
        Next i
        If ws.Rows(pZeile(k)).RowHeight < h Then ws.Rows(pZeile(k)).RowHeight = h
    Next k
    On Error GoTo 0
End Sub

Private Sub Bildschirm(ByVal an As Boolean)
    On Error Resume Next
    Application.ScreenUpdating = an
    On Error GoTo 0
End Sub

' ---------------------------------------------------------------- Protokoll, Live, Sicherung

Private Function ErsteFreieZeile(ByVal ws As Object, ByVal ab As Long, ByVal spalte As Long) As Long
    Dim r As Long
    r = ab
    Do While ZellText(ws, r, spalte) <> ""
        r = r + 1
    Loop
    ErsteFreieZeile = r
End Function

Public Sub ProtokollSchreiben(ByVal lauf As String, ByVal postfach As String, ByVal zeile As String, _
                              ByVal aktion As String, ByVal regel As String, ByVal meldung As String)
    Dim ws As Object, r As Long
    On Error Resume Next
    Set ws = Blatt(BLATT_PROTOKOLL)
    r = ErsteFreieZeile(ws, PROT_ERSTE, 1)
    ws.Cells(r, 1).Value = Zeitstempel()
    ws.Cells(r, 2).Value = lauf
    ws.Cells(r, 3).Value = postfach
    ws.Cells(r, 4).Value = zeile
    ws.Cells(r, 5).Value = aktion
    ws.Cells(r, 6).Value = regel
    ws.Cells(r, 7).Value = meldung
    On Error GoTo 0
End Sub

' Protokollzeile zur gerade ausgefuehrten Planzeile (gProtK).
Public Sub ProtokollZeile(ByVal meldung As String)
    If gProtK > 0 Then
        ProtokollSchreiben gLauf, gZielAdr, pNr(gProtK), pAktion(gProtK), pRegel(gProtK), meldung
    Else
        ProtokollSchreiben gLauf, gZielAdr, "", "", "", meldung
    End If
End Sub

Private Function JaNein(ByVal b As Boolean) As String
    If b Then JaNein = "Ja" Else JaNein = "Nein"
End Function

Private Function Diagnose(ByVal id As Long) As String
    Dim n As Long, erste As Long
    If Not mLesbar(id) Then
        Diagnose = mGrund(id)
    ElseIf mOhneBed(id) Then
        n = AbfangDahinter(id, erste)
        If n > 0 Then
            Diagnose = "keine sichtbare Bedingung, verschiebt bzw. stoppt und steht vor " & n & " aktiven Regel(n) " & _
                       "(zuerst " & Zitat(mName(erste)) & ") – würde alle folgenden Mails abfangen: unplausibel, die " & _
                       "Bedingung ist vermutlich nur nicht sichtbar (Outlook im Web); sperrt das Speichern"
        Else
            Diagnose = "keine sichtbare Bedingung – greift bei allen Mails, die bis zu ihr kommen (Sammelregel), oder " & _
                       "in Outlook im Web angelegt"
        End If
    End If
End Function

' Text fuer eine MsgBox (zeigt nur etwa 1024 Zeichen): Passt text & schluss nicht hinein, wird text an einer Zeilen-
' bzw. Wortgrenze gekuerzt; schluss (z. B. die Frage) bleibt immer stehen. Der volle Text steht im Blatt Protokoll.
Public Function MeldungKurz(ByVal text As String, ByVal schluss As String) As String
    Dim hinweis As String, n As Long, i As Long, p As Long
    If Len(text) + Len(schluss) <= MSGBOX_MAX Then
        MeldungKurz = text & schluss
        Exit Function
    End If
    If Len(schluss) > MSGBOX_MAX \ 2 Then schluss = Left(schluss, MSGBOX_MAX \ 2 - 1) & "…"
    hinweis = " … (gekürzt – vollständig im Blatt Protokoll)"
    n = MSGBOX_MAX - Len(schluss) - Len(hinweis)
    ' letzte Zeilen- bzw. Wortgrenze im hinteren Drittel
    For i = n To (n * 2) \ 3 Step -1
        If Mid(text, i, 1) = vbLf Then
            p = i
            Exit For
        End If
    Next i
    If p = 0 Then
        For i = n To (n * 2) \ 3 Step -1
            If Mid(text, i, 1) = " " Then
                p = i
                Exit For
            End If
        Next i
    End If
    If p = 0 Then p = n + 1
    MeldungKurz = RTrim(Left(text, p - 1)) & hinweis & schluss
End Function

' Abbild ab Zeile r schreiben (Reihenfolge wie in Outlook). Live: mit Diagnose; Sicherung: mit Zeitpunkt.
Private Function StandSchreiben(ByVal ws As Object, ByVal r As Long, ByVal postfach As String, ByVal zeit As String, _
                                ByVal sicherung As Boolean) As Long
    Dim i As Long, id As Long, c As Long
    For i = 1 To mAnz
        id = mOrd(i)
        c = 1
        If sicherung Then
            ws.Cells(r, c).Value = zeit
            c = c + 1
        End If
        ws.Cells(r, c).Value = postfach
        ws.Cells(r, c + 1).Value = i
        ws.Cells(r, c + 2).Value = mName(id)
        ws.Cells(r, c + 3).Value = JaNein(mAktiv(id))
        ws.Cells(r, c + 4).Value = JaNein(mLokal(id))
        ws.Cells(r, c + 5).Value = mBed(id)
        ws.Cells(r, c + 6).Value = mAus(id)
        ws.Cells(r, c + 7).Value = mAkt(id)
        ws.Cells(r, c + 8).Value = mVerPfad(id)
        ws.Cells(r, c + 9).Value = mKopPfad(id)
        If sicherung Then
            ws.Cells(r, c + 10).Value = JaNein(mLesbar(id)) & IIf(mOhneBed(id), " (ohne Bedingung)", "")
        Else
            ws.Cells(r, c + 10).Value = mNBed(id)
            ws.Cells(r, c + 11).Value = mTypen(id)
            ws.Cells(r, c + 12).Value = JaNein(mLesbar(id))
            ws.Cells(r, c + 13).Value = Diagnose(id)
        End If
        r = r + 1
    Next i
    StandSchreiben = r
End Function

Private Sub SicherungSchreiben(ByVal postfach As String)
    Dim ws As Object, r As Long
    Set ws = Blatt(BLATT_SICHERUNG)
    r = ErsteFreieZeile(ws, SICH_ERSTE, 1)
    StandSchreiben ws, r, postfach, Zeitstempel(), True
End Sub

' ---------------------------------------------------------------- Pruefwert des Plans

' Pruefwert ueber die Eingabespalten des Plans (nicht Vorschau/Ergebnis) und die Einstellungen.
Public Function PlanPruefwert() As String
    Dim ws As Object, r As Long, c As Long, s As String, h As Double, i As Long, z As Long, spalten As Variant
    Set ws = Blatt(BLATT_UMSETZUNG)
    spalten = Array(SP_NR, SP_AUSF, SP_AKTION, SP_REGEL, SP_NEU, SP_VER, SP_KOP, SP_QUELLE, SP_UEBERSPR)
    For r = PlanErste() To PlanLetzte()
        For c = LBound(spalten) To UBound(spalten)
            s = s & "|" & ZellText(ws, r, CLng(spalten(c)))
        Next c
        s = s & "#"
    Next r
    s = s & NamensText(N_ZIEL) & "|" & NamensText(N_QUELLE) & "|" & LCase(NamensText(N_TROTZ))
    For i = 1 To Len(s)
        z = AscW(Mid(s, i, 1))
        If z < 0 Then z = z + 65536
        h = h * 31 + z
        h = h - Int(h / 2147483629#) * 2147483629#
    Next i
    PlanPruefwert = Right("00000000" & Hex(CLng(h)), 8)
End Function

' ---------------------------------------------------------------- Regeln aus Outlook lesen

Public Sub RegelnLesen()
    Dim msg As String
    msg = RegelnLesenLauf()
    Hinweis MeldungKurz(msg, ""), "Regeln aus Outlook lesen", False
End Sub

Public Function RegelnLesenLauf() As String
    Dim ol As Object, ws As Object, st As Object, regeln As Object, f As String, r As Long, adr As Variant
    Dim k As Long, msg As String, zeit As String
    f = PlanLesen()
    If f <> "" Then
        RegelnLesenLauf = f
        Exit Function
    End If
    zeit = Zeitstempel()
    gLauf = "Lesen " & zeit
    gProtK = 0
    Set ol = OutlookHolen()
    If ol Is Nothing Then
        ' Blatt Live bleibt, wie es ist; nur der Versuch wird vermerkt
        NamensWert N_LIVE_ZEIT, "Lesen nicht möglich am " & zeit & ": Outlook ist nicht erreichbar – die Liste " & _
                                "unten ist unverändert (letztes erfolgreiches Lesen)."
        ProtokollSchreiben gLauf, gZielAdr & " / " & gQuellAdr, "", "LESEN", "", "nicht möglich: Outlook ist nicht erreichbar"
        RegelnLesenLauf = "Outlook ist nicht erreichbar. Bitte Outlook starten und erneut versuchen."
        Exit Function
    End If
    EmpfaengerSitzung ol
    Bildschirm False
    Set ws = Blatt(BLATT_LIVE)
    ws.Range(ws.Cells(LIVE_ERSTE, 1), ws.Cells(LIVE_ERSTE + 2000, 14)).ClearContents
    NamensWert N_LIVE_ZEIT, "Gelesen am " & zeit & "  ·  nur lesend, in Outlook wurde nichts geändert"
    r = LIVE_ERSTE
    adr = Array(gZielAdr, gQuellAdr)
    For k = 0 To 1
        Set st = PostfachFinden(ol, CStr(adr(k)), f)
        If st Is Nothing Then
            ws.Cells(r, 1).Value = adr(k)
            ws.Cells(r, 3).Value = f
            r = r + 1
            msg = Anhaengen(msg, f, vbLf)
        ElseIf Not StandLesen(st, regeln, f) Then
            ws.Cells(r, 1).Value = adr(k)
            ws.Cells(r, 3).Value = f
            r = r + 1
            msg = Anhaengen(msg, adr(k) & ": " & f, vbLf)
        Else
            r = StandSchreiben(ws, r, CStr(adr(k)), zeit, False)
            msg = Anhaengen(msg, adr(k) & ": " & mAnz & " Regeln, davon " & AnzahlNichtLesbar() & " nicht lesbar, " & _
                                 AnzahlOhneBed() & " ohne sichtbare Bedingung", vbLf)
            If AbfangAnzahl() > 0 Then
                ' Zielpostfach: gesperrt bzw. mit "Trotz ..." = Ja freigegeben (wie im Stand Zielpostfach)
                msg = msg & ", davon vor aktiven Regeln: " & AbfangNamen(2) & " – unplausibel"
                If k = 0 Then
                    If gTrotz Then
                        msg = msg & ", freigegeben (Einstellung „Ja“)"
                    Else
                        msg = msg & ", Speichern gesperrt"
                    End If
                End If
            End If
            If k = 0 Then
                PostfachStandMerken
                NamensWert N_STATUS, PostfachStatusText()
            End If
        End If
    Next k
    ProtokollSchreiben gLauf, gZielAdr & " / " & gQuellAdr, "", "LESEN", "", Replace(msg, vbLf, " | ")
    Bildschirm True
    RegelnLesenLauf = msg & vbLf & vbLf & "Nur gelesen – in Outlook wurde nichts geändert. Einzelheiten im Blatt Live."
End Function

' ---------------------------------------------------------------- Vorschau

' Liest Outlook und spielt den Plan durch. Schreibt nichts nach Outlook und nichts ins Blatt.
Private Function VorschauBerechnen(ByRef ol As Object, ByRef ziel As Object, ByRef blocker As Long, ByRef fehler As String) As Boolean
    Dim quelle As Object, regeln As Object, f As String
    fehler = PlanLesen()
    If fehler <> "" Then Exit Function
    If gZielAdr = "" Then
        fehler = "Zielpostfach fehlt (Einstellungen)"
        Exit Function
    End If
    If LCase(gZielAdr) = LCase(gQuellAdr) Then
        fehler = "Ziel- und Quellpostfach sind gleich – das Quellpostfach wird nie geändert"
        Exit Function
    End If
    If LCase(gZielAdr) = LCase(QUELLE_STANDARD) Then
        fehler = "Als Zielpostfach steht " & gZielAdr & " – das ist das Quellpostfach dieser Mappe, es wird nie geändert"
        Exit Function
    End If
    Set ol = OutlookHolen()
    If ol Is Nothing Then
        fehler = "Outlook ist nicht erreichbar"
        Exit Function
    End If
    ' Empfaenger je Lauf frisch aufloesen (Schluessel und Eingabe, siehe modOlLesen)
    EmpfaengerSitzung ol
    Set ziel = PostfachFinden(ol, gZielAdr, f)
    If ziel Is Nothing Then
        fehler = f
        Exit Function
    End If
    ' Quellpostfach der Mappe auch unter anderem Anzeigenamen erkennen (aufgeloester Postfachname)
    If LCase(PostfachName(ziel)) = LCase(QUELLE_STANDARD) Or LCase(PostfachAnzeige(ziel)) = LCase(QUELLE_STANDARD) Then
        fehler = "Als Zielpostfach steht " & gZielAdr & " – das ist " & PostfachName(ziel) & ", das Quellpostfach " & _
                 "dieser Mappe, es wird nie geändert"
        Exit Function
    End If
    Set gQuellRegeln = Nothing
    gQuellFehler = ""
    Set quelle = PostfachFinden(ol, gQuellAdr, f)
    If quelle Is Nothing Then
        gQuellFehler = f
    Else
        If quelle Is ziel Or LCase(PostfachName(quelle)) = LCase(PostfachName(ziel)) Then
            fehler = "Ziel- und Quellpostfach sind dasselbe Postfach (" & PostfachName(ziel) & ")"
            Exit Function
        End If
        On Error Resume Next
        Set gQuellRegeln = quelle.GetRules()
        If Err.Number <> 0 Then gQuellFehler = "Regeln nicht lesbar: " & Err.Description: Set gQuellRegeln = Nothing
        On Error GoTo 0
    End If
    If Not StandLesen(ziel, regeln, f) Then
        fehler = gZielAdr & ": " & f
        Exit Function
    End If
    blocker = Simulieren(ol, ziel)
    VorschauBerechnen = True
End Function

Public Sub Vorschau()
    Dim msg As String
    msg = VorschauLauf()
    Hinweis MeldungKurz(msg, ""), "Vorschau", False
End Sub

Public Function VorschauLauf() As String
    Dim ol As Object, ziel As Object, blocker As Long, f As String, ws As Object, k As Long, r As Long
    Dim nBereit As Long, nErl As Long, nAus As Long, msg As String, zeit As String
    f = LayoutPruefen()
    If f <> "" Then
        VorschauLauf = "Vorschau nicht möglich: " & f
        Exit Function
    End If
    Bildschirm False
    Set ws = Blatt(BLATT_UMSETZUNG)
    NamensWert N_PRUEFWERT, ""
    NamensWert N_VORSCHAU_ZEIT, ""
    For r = PlanErste() To PlanLetzte()
        ws.Cells(r, SP_VORSCHAU).Value = ""
        ws.Cells(r, SP_ERGEBNIS).Value = ""
    Next r
    zeit = Zeitstempel()
    gLauf = "Vorschau " & zeit
    gProtK = 0
    If Not VorschauBerechnen(ol, ziel, blocker, f) Then
        NamensWert N_STATUS, "Vorschau nicht möglich: " & f
        ProtokollSchreiben gLauf, gZielAdr, "", "VORSCHAU", "", "nicht möglich: " & f
        Bildschirm True
        VorschauLauf = "Vorschau nicht möglich: " & f
        Exit Function
    End If
    For k = 1 To pAnz
        ws.Cells(pZeile(k), SP_VORSCHAU).Value = pStatus(k)
        If Left(pStatus(k), 6) = "bereit" Then nBereit = nBereit + 1
        If Left(pStatus(k), 14) = "schon erledigt" Then nErl = nErl + 1
        If Not pAusf(k) Then nAus = nAus + 1
    Next k
    ZeilenAnpassen ws
    NamensWert N_STATUS, PostfachStatusText()
    NamensWert N_VORSCHAU_ZEIT, zeit
    NamensWert N_PRUEFWERT, PlanPruefwert()
    msg = nBereit & " bereit, " & nErl & " schon erledigt, " & blocker & " blockiert, " & nAus & " nicht ausgewählt"
    Bildschirm True
    If blocker > 0 Then
        msg = msg & vbLf & vbLf & "Ausführen ist erst möglich, wenn keine ausgewählte Zeile " & _
              "blockiert ist (Grund in Spalte Vorschau)."
    ElseIf nBereit = 0 Then
        msg = msg & vbLf & vbLf & "Nichts zu tun."
    Else
        msg = msg & vbLf & vbLf & "Als Nächstes: Regeln in Outlook exportieren, dann „Ausführen“."
    End If
    If gAbfang > 0 Then
        msg = msg & vbLf & vbLf & "Ohne sichtbare Bedingung vor aktiven Regeln (Stand nach dem Plan): " & gNamenAbfang & _
              IIf(gTrotz, " – freigegeben (Einstellung „Ja“).", " – würde alle folgenden Mails abfangen, Speichern " & _
              "gesperrt (Stand Zielpostfach). In Outlook prüfen oder per Plan ans Ende setzen bzw. deaktivieren.")
    End If
    If gOhneBed > 0 Then msg = msg & vbLf & vbLf & "Ohne sichtbare Bedingung (vor dem Ausführen bestätigen): " & gNamenOhneBed
    msg = "Vorschau für " & gZielAdr & ": " & msg & vbLf & vbLf & "In Outlook wurde nichts geändert."
    ProtokollSchreiben gLauf, gZielAdr, "", "VORSCHAU", "", Replace(msg, vbLf, " | ") & " | " & PostfachStatusText()
    VorschauLauf = msg
End Function

' ---------------------------------------------------------------- Ausfuehren

Public Sub Ausfuehren()
    Dim msg As String
    msg = AusfuehrenLauf()
    Hinweis MeldungKurz(msg, ""), "Ausführen", False
End Sub

Private Function AktionKurz(ByVal akt As String) As String
    Select Case akt
        Case "ZIELORDNER": AktionKurz = "Ziel"
        Case "UMBENENNEN": AktionKurz = "Name"
        Case "KOPIEREN": AktionKurz = "Kopie"
        Case "POSITION": AktionKurz = "Position"
        Case "UMLEITEN_STATT_WEITERLEITEN": AktionKurz = "Umleiten"
        Case "BEDINGUNG_WORT_ERGAENZEN": AktionKurz = "Wörter"
        Case "AUSNAHMEN_UEBERNEHMEN": AktionKurz = "Ausnahmen"
        Case "ORDNER_ANLEGEN": AktionKurz = "Ordner"
        Case "DEAKTIVIEREN": AktionKurz = "Aus"
        Case Else: AktionKurz = akt
    End Select
End Function

' Liste der Aenderungen fuer die Rueckfrage: je Zeile Aktion, Regel und was sich aendert; eine Zeile, die eine Regel
' ohne sichtbare Bedingung aendert, endet auf HINWEIS_OHNE (wie in Spalte Vorschau). Hoechstens budget Zeichen (eine
' MsgBox zeigt nur etwa 1024 Zeichen); der Rest steht in Spalte Vorschau, die Schlusszeile nennt, wie viele davon
' Regeln ohne sichtbare Bedingung aendern.
Private Function AenderungsListe(ByVal budget As Long) As String
    Dim k As Long, s As String, zeile() As String, ohne() As Boolean, n As Long, m As Long, i As Long
    Dim vorher As String, restOhne As Long
    ReDim zeile(0 To pAnz): ReDim ohne(0 To pAnz)
    For k = 1 To pAnz
        If Left(pStatus(k), 6) = "bereit" Then
            ' Regelname nur, wenn er sich gegenueber der vorigen Zeile aendert
            n = n + 1
            zeile(n) = "• " & pNr(k) & " " & AktionKurz(pAktion(k))
            If LCase(pRegel(k)) <> vorher Then zeile(n) = zeile(n) & " " & Zitat(KurzName(pRegel(k), 34))
            vorher = LCase(pRegel(k))
            If pKurz(k) <> "" Then zeile(n) = zeile(n) & ": " & Abschneiden(pKurz(k), 52)
            If pOhne(k) Then zeile(n) = zeile(n) & HINWEIS_OHNE
            ohne(n) = pOhne(k)
        End If
    Next k
    ' so viele Zeilen wie moeglich, dazu die Schlusszeile fuer den Rest
    For m = n To 0 Step -1
        s = ""
        restOhne = 0
        For i = 1 To n
            If i <= m Then
                s = s & zeile(i) & vbLf
            ElseIf ohne(i) Then
                restOhne = restOhne + 1
            End If
        Next i
        If m < n Then
            s = s & "… und " & (n - m) & " weitere (Spalte Vorschau)"
            If restOhne > 0 Then
                s = s & ", davon " & IIf(restOhne = 1, "1 an einer Regel", restOhne & " an Regeln") & _
                    " ohne sichtbare Bedingung"
            End If
            s = s & vbLf
        End If
        If Len(s) <= budget Then Exit For
    Next m
    AenderungsListe = s
End Function

' Hinweise unter der Liste der Aenderungen (Rueckfrage 3): Anzahl der Regeln, nicht lesbare Regeln, Freigabe trotz
' Regel ohne sichtbare Bedingung vor aktiven Regeln, Sicherung. Namen werden uebergeben (gekuerzt fuer die MsgBox,
' vollstaendig fuer das Protokoll).
Private Function RueckfrageFuss(ByVal namenNl As String, ByVal namenAb As String) As String
    Dim s As String
    s = vbLf & "Outlook speichert dabei alle " & gAnzGelesen & " Regeln des Postfachs neu"
    If gNichtLesbar > 0 Then
        s = s & " – davon " & gNichtLesbar & " nicht lesbar (" & namenNl & "); ob deren Bedingungen erhalten bleiben, " & _
            "kann das Makro nicht prüfen."
    Else
        s = s & "."
    End If
    If gAbfang > 0 Then s = s & " Freigegeben trotz Regel ohne sichtbare Bedingung vor aktiven Regeln: " & namenAb & "."
    RueckfrageFuss = s & vbLf & "Vorher kommen alle Regeln ins Blatt Sicherung. Fragt Outlook beim Speichern nach, " & _
                     "dort bestätigen (Fenster ggf. in der Taskleiste)."
End Function

' Bereite Zeilen mit uebersprungenen (nicht aufloesbaren) Absendern: je Zeile "• Nr „Regel“: „Name“, ..." ("" = keine).
Private Function UeberspringenListe() As String
    Dim k As Long, s As String
    For k = 1 To pAnz
        If pAusf(k) And Left(pStatus(k), 6) = "bereit" And pOhneNamen(k) <> "" Then
            s = Anhaengen(s, "• " & pNr(k) & " " & Zitat(KurzName(pRegel(k), 34)) & ": " & pOhneNamen(k), vbLf)
        End If
    Next k
    UeberspringenListe = s
End Function

Public Function AusfuehrenLauf() As String
    Dim ws As Object, ol As Object, ziel As Object, regeln As Object, k As Long, f As String, blocker As Long
    Dim nBlock As Long, nBereit As Long, s As String, abw As String, zeit As String, msg As String
    Dim kopf As String, fuss As String, schluss As String, budget As Long, ueber As String, txt As String
    Set ws = Blatt(BLATT_UMSETZUNG)
    f = PlanLesen()
    If f <> "" Then
        AusfuehrenLauf = "Ausführen nicht möglich: " & f
        Exit Function
    End If
    ' 1) Vorschau vorhanden, Plan und Einstellungen seitdem unveraendert
    If NamensText(N_PRUEFWERT) = "" Then
        AusfuehrenLauf = "Bitte zuerst „Vorschau“ starten. Ausführen ist nur nach einer Vorschau ohne Blocker möglich."
        Exit Function
    End If
    If NamensText(N_PRUEFWERT) <> PlanPruefwert() Then
        AusfuehrenLauf = "Plan oder Einstellungen wurden nach der Vorschau geändert. Bitte „Vorschau“ erneut starten."
        Exit Function
    End If
    ' 2) Vorschau ohne Blocker
    For k = 1 To pAnz
        If pAusf(k) Then
            s = ZellText(ws, pZeile(k), SP_VORSCHAU)
            If Left(s, 9) = "blockiert" Or s = "" Then nBlock = nBlock + 1
            If Left(s, 6) = "bereit" Then nBereit = nBereit + 1
        End If
    Next k
    If nBlock > 0 Then
        AusfuehrenLauf = "Die Vorschau zeigt " & nBlock & " blockierte Zeile(n). Ausführen ist erst " & _
            "möglich, wenn alle ausgewählten Zeilen bereit oder schon erledigt sind – Ursache beheben " & _
            "oder die Zeile auf Ausführen = Nein setzen, dann Vorschau erneut starten."
        Exit Function
    End If
    If nBereit = 0 Then
        AusfuehrenLauf = "Nichts zu tun – alle ausgewählten Zeilen sind schon erledigt."
        Exit Function
    End If
    ' 3) Stand in Outlook seit der Vorschau unveraendert? (gleiche Berechnung, gleiche Ergebnisse)
    Bildschirm False
    zeit = Zeitstempel()
    gLauf = "Ausführen " & zeit
    gProtK = 0
    If Not VorschauBerechnen(ol, ziel, blocker, f) Then
        Bildschirm True
        AusfuehrenLauf = "Ausführen nicht möglich: " & f
        Exit Function
    End If
    For k = 1 To pAnz
        If pStatus(k) <> ZellText(ws, pZeile(k), SP_VORSCHAU) Then
            abw = "Zeile " & pNr(k) & ": jetzt " & Zitat(pStatus(k))
            Exit For
        End If
    Next k
    If abw <> "" Or blocker > 0 Then
        Bildschirm True
        AusfuehrenLauf = "Der Stand in Outlook hat sich seit der Vorschau geändert (" & abw & "). Bitte " & _
                         "„Vorschau“ erneut starten."
        Exit Function
    End If
    Bildschirm True
    ' 4) Rueckfragen (vorausgewaehlt ist jeweils "Nein")
    If Not Frage("Sicherung in Outlook:" & vbLf & vbLf & "Haben Sie die Regeln von " & gZielAdr & " exportiert?" & vbLf & _
                 "(Datei › Regeln und Benachrichtigungen verwalten › Optionen ›" & _
                 " Regeln exportieren, oben das Postfach wählen)" & vbLf & vbLf & _
                 "Danach den Dialog „Regeln und Benachrichtigungen“ schließen (OK oder Abbrechen) – erst dann Ja. " & _
                 "Solange er offen ist, kann Outlook das Speichern ablehnen." & vbLf & vbLf & _
                 "Nur mit dieser .rwz-Datei lässt sich der alte Stand vollständig wiederherstellen.", _
                 "Sicherung vorhanden?") Then
        AusfuehrenLauf = "Abgebrochen – nichts geändert. Bitte zuerst die Regeln in Outlook exportieren."
        Exit Function
    End If
    gOhneBestaetigt = 0
    If gOhneBed > 0 Then
        If Not Frage("Im Zielpostfach " & IIf(gOhneBed = 1, "gibt es 1 Regel", "gibt es " & gOhneBed & " Regeln") & _
                     " ohne sichtbare Bedingung:" & vbLf & gNamenOhneBed & vbLf & vbLf & _
                     "Outlook zeigt für sie keine Bedingung: Sie greifen bei allen Mails, die bis zu ihnen kommen " & _
                     "(Sammelregel), oder ihre Bedingung wurde in Outlook im Web angelegt. Outlook speichert sie beim " & _
                     "Ausführen mit; das Makro ändert an ihnen nur, was der Plan vorsieht." & vbLf & vbLf & _
                     "Sind diese Regeln geprüft (Outlook im Web › Einstellungen › E-Mail › Regeln) und soll trotzdem " & _
                     "gespeichert werden?", "Regeln ohne Bedingung") Then
            AusfuehrenLauf = "Abgebrochen – nichts geändert. Regeln ohne sichtbare Bedingung nicht bestätigt."
            Exit Function
        End If
        gOhneBestaetigt = gOhneBed
    End If
    ' Nicht aufloesbare Absender, die laut Spalte "Überspringen" nicht uebernommen werden: eigene Rueckfrage (Vorgabe Nein)
    ueber = UeberspringenListe()
    If ueber <> "" Then
        txt = "Diese Absender lassen sich in Outlook nicht auflösen und werden laut Spalte " & SpalteUeberspringen() & _
              " NICHT in die Ausnahmen übernommen:" & vbLf & ueber & vbLf & vbLf & "Für sie gilt die Ausnahme nicht – " & _
              "ihre Mails behandelt die Regel weiter wie bisher. Alle übrigen Einträge werden übernommen. Die Ausnahme " & _
              "für diese Absender bei Bedarf von Hand in Outlook ergänzen."
        ProtokollSchreiben gLauf, gZielAdr, "", "RÜCKFRAGE", "", Replace(txt, vbLf, " | ")
        If Not Frage(MeldungKurz(txt, vbLf & vbLf & "So übernehmen (ohne diese Absender)?"), "Absender überspringen") Then
            AusfuehrenLauf = "Abgebrochen – nichts geändert. Übersprungene Absender nicht bestätigt."
            Exit Function
        End If
    End If
    kopf = nBereit & " " & IIf(nBereit = 1, "Änderung", "Änderungen") & " in " & gZielAdr & ":" & vbLf & vbLf
    ' Hinweise mit gekuerzten Namenslisten, damit die Warnungen (nicht lesbar, Freigabe) sichtbar bleiben
    fuss = RueckfrageFuss(Abschneiden(gNamenNichtLesbar, 160), Abschneiden(gNamenAbfang, 160))
    schluss = vbLf & vbLf & "Jetzt ausführen?"
    ' Die Liste bekommt, was neben Kopf, Hinweisen und Frage in eine MsgBox passt (mindestens zwei, drei Zeilen).
    ' MeldungKurz begrenzt das Ganze auf die MsgBox-Grenze (kuerzt hinten); die Frage bleibt immer stehen. Der volle
    ' Text (alle Zeilen, alle Namen) steht im Blatt Protokoll - dort ist auch festgehalten, was bestaetigt wurde.
    budget = MSGBOX_MAX - Len(kopf) - Len(fuss) - Len(schluss)
    If budget < 200 Then budget = 200
    msg = MeldungKurz(kopf & AenderungsListe(budget) & fuss, schluss)
    ProtokollSchreiben gLauf, gZielAdr, "", "RÜCKFRAGE", "", Replace(kopf & AenderungsListe(100000) & _
                       RueckfrageFuss(gNamenNichtLesbar, gNamenAbfang) & schluss, vbLf, " | ")
    If Not Frage(msg, "Regeln ändern") Then
        AusfuehrenLauf = "Abgebrochen – nichts geändert."
        Exit Function
    End If
    ' 5) Sicherung (frisch gelesener Stand) und Ausfuehren auf demselben Rules-Objekt
    Bildschirm False
    If Not StandLesen(ziel, regeln, f) Then
        Bildschirm True
        AusfuehrenLauf = "Abgebrochen vor jeder Änderung: " & f
        Exit Function
    End If
    SicherungSchreiben gZielAdr
    ProtokollSchreiben gLauf, gZielAdr, "", "SICHERUNG", "", mAnz & " Regeln ins Blatt Sicherung geschrieben"
    msg = PostfachAusfuehren(ol, ziel, regeln)
    For k = 1 To pAnz
        ws.Cells(pZeile(k), SP_ERGEBNIS).Value = pErgebnis(k)
    Next k
    ZeilenAnpassen ws
    NamensWert N_AUSF_ZEIT, zeit
    NamensWert N_PRUEFWERT, ""
    ProtokollSchreiben gLauf, gZielAdr, "", "ERGEBNIS", "", Replace(msg, vbLf, " | ")
    Bildschirm True
    AusfuehrenLauf = msg
End Function

' Sperr-Lage als Text: nicht lesbare Regeln und Regeln ohne sichtbare Bedingung vor aktiven Regeln ("" = keine).
Private Function LageText(ByVal nl As Long, ByVal namenNl As String, ByVal ab As Long, ByVal namenAb As String, _
                          ByVal trenner As String) As String
    Dim s As String
    If nl > 0 Then s = IIf(nl = 1, "1 Regel", nl & " Regeln") & " nicht lesbar: " & namenNl
    If ab > 0 Then s = Anhaengen(s, IIf(ab = 1, "1 Regel", ab & " Regeln") & " ohne sichtbare Bedingung vor aktiven " & _
                                 "Regeln: " & namenAb, trenner)
    LageText = s
End Function

' Alle Schritte fuer das Zielpostfach im Speicher, dann Ordner, dann Speichern, dann Nachpruefung.
' Erwartet ein frisch gelesenes Abbild (StandLesen) mit dem zugehoerigen Rules-Objekt.
Private Function PostfachAusfuehren(ByVal ol As Object, ByVal ziel As Object, ByVal regeln As Object) As String
    Dim k As Long, st As String, f As String, fehlerK As Long, brauchtSave As Boolean, nLes As Long, i As Long
    Dim sollName() As String, sollSig() As String, sollBeruehrt() As Boolean, nSoll As Long, altAus() As String
    Dim sollAltAus() As String, nAlt As Long, sollNeu() As Boolean, gesperrt As Boolean, lageNeu As Boolean
    Dim vStatus As String, vNl As Long, vNamenNl As String, vAb As Long, vNamenAb As String, txt As String
    ' Lage der Vorschau (in AusfuehrenLauf eben neu berechnet, Stand nach dem Plan): Vergleich mit dem Stand, den
    ' Outlook jetzt speichern wuerde (in Outlook kann sich waehrend der Rueckfragen etwas geaendert haben)
    vStatus = PostfachStatusText()
    vNl = gNichtLesbar: vNamenNl = gNamenNichtLesbar: vAb = gAbfang: vNamenAb = gNamenAbfang
    PostfachStandMerken
    nLes = gNichtLesbar
    VormerkungenLeeren
    ' Ausnahmen vor dem Lauf (Nachpruefung: fehlen nach dem Speichern nur neue Ausnahmen oder auch fruehere?)
    nAlt = mAnz
    ReDim altAus(0 To nAlt)
    For i = 1 To nAlt
        altAus(i) = mAusW(i)
    Next i
    For k = 1 To pAnz
        pErgebnis(k) = ""
        If Not pAusf(k) Then pErgebnis(k) = "nicht ausgewählt"
    Next k
    If gOhneBed > gOhneBestaetigt Then
        f = "Seit der Bestätigung gibt es mehr Regeln ohne sichtbare Bedingung (" & gNamenOhneBed & ") – bitte Vorschau erneut starten"
    End If
    If f = "" Then
        For k = 1 To pAnz
            If pAusf(k) Then
                gProtK = k
                st = SchrittPruefen(k, True, ol, ziel)
                If Left(st, 6) = "bereit" Then
                    ' Erste Sperrpruefung: seit der Vorschau nicht lesbar geworden (sonst haette die Vorschau gesperrt).
                    ' Ab hier nichts mehr in Outlook ausfuehren, den Plan aber im Abbild zu Ende durchspielen, damit
                    ' die zweite Sperrpruefung und der Stand Zielpostfach den Stand nach dem Plan sehen.
                    If pSpeichern(k) And nLes > 0 And Not gTrotz Then gesperrt = True
                    If Not gesperrt Then
                        f = SchrittAusfuehren(k, regeln, ziel)
                        If f <> "" Then
                            fehlerK = k
                            Exit For
                        End If
                        pErgebnis(k) = "im Speicher ausgeführt"
                    End If
                    If pSpeichern(k) Then brauchtSave = True
                ElseIf Left(st, 14) = "schon erledigt" Then
                    pErgebnis(k) = "schon erledigt"
                Else
                    f = "Stand weicht von der Vorschau ab: " & st
                    fehlerK = k
                    Exit For
                End If
            End If
        Next k
    End If
    gProtK = 0
    ' Zweite Sperrpruefung nach dem Stand, den Outlook speichern wuerde (wie in der Vorschau, Stand nach allen
    ' Schritten): nicht lesbare Regeln und Regeln ohne sichtbare Bedingung, die verschieben oder stoppen, vor aktiven
    ' Regeln. Hat sich die Lage seit der Vorschau geaendert, wird der Stand Zielpostfach neu gesetzt; mit "Trotz ..."
    ' = Ja gilt die Freigabe nur fuer die Lage der Vorschau - fuer eine neue Lage eigene Rueckfrage (Vorgabe Nein).
    If f = "" Then
        gAbfang = AbfangAnzahl()
        gNamenAbfang = AbfangNamen(2)
        lageNeu = (gNichtLesbar <> vNl Or gNamenNichtLesbar <> vNamenNl Or gAbfang <> vAb Or gNamenAbfang <> vNamenAb)
        If PostfachStatusText() <> vStatus Then
            NamensWert N_STATUS, PostfachStatusText()
            ProtokollSchreiben gLauf, gZielAdr, "", "STAND", "", "Stand Zielpostfach seit der Vorschau geändert: " & _
                               PostfachStatusText()
        End If
        If brauchtSave And (gNichtLesbar > 0 Or gAbfang > 0) Then
            If Not gTrotz Then
                f = "Speichern gesperrt (Lage seit der Vorschau geändert) – " & _
                    LageText(gNichtLesbar, gNamenNichtLesbar, gAbfang, gNamenAbfang, "; ") & ". Bitte „Vorschau“ " & _
                    "erneut starten"
            ElseIf lageNeu Then
                txt = "Die Lage im Zielpostfach hat sich seit der Vorschau geändert. Nach dem Plan würde Outlook jetzt " & _
                      "speichern mit:" & vbLf & "• " & LageText(gNichtLesbar, gNamenNichtLesbar, gAbfang, gNamenAbfang, _
                      vbLf & "• ") & vbLf & vbLf & "In der Vorschau: " & _
                      IIf(vNl > 0 Or vAb > 0, LageText(vNl, vNamenNl, vAb, vNamenAb, "; "), "nichts davon") & vbLf & vbLf & _
                      "Die Einstellung „Trotz …“ = Ja hat das Speichern für die Lage der Vorschau freigegeben, nicht " & _
                      "für diese."
                If gNichtLesbar > 0 Then
                    txt = txt & " Nicht lesbare Regeln speichert Outlook mit, ohne dass das Makro ihre Bedingungen " & _
                          "prüfen kann."
                End If
                If gAbfang > 0 Then
                    txt = txt & " Eine Regel ohne sichtbare Bedingung vor aktiven Regeln würde alle folgenden Mails " & _
                          "abfangen."
                End If
                If Frage(MeldungKurz(txt, vbLf & vbLf & "Trotzdem jetzt speichern? (sonst „Vorschau“ erneut starten)"), _
                         "Lage seit der Vorschau geändert") Then
                    ProtokollSchreiben gLauf, gZielAdr, "", "RÜCKFRAGE", "", "Lage seit der Vorschau geändert, " & _
                                       "Speichern bestätigt: " & LageText(gNichtLesbar, gNamenNichtLesbar, gAbfang, _
                                       gNamenAbfang, "; ")
                Else
                    f = "Abgebrochen vor dem Speichern – die Lage hat sich seit der Vorschau geändert (" & _
                        LageText(gNichtLesbar, gNamenNichtLesbar, gAbfang, gNamenAbfang, "; ") & "). Bitte „Vorschau“ " & _
                        "erneut starten"
                End If
            End If
        End If
    End If
    ' Erwarteter Stand nach dem Speichern: das Abbild nach allen Schritten; neu angelegte Regeln sind markiert (fuer
    ' sie gibt es keinen alten Stand)
    nSoll = mAnz
    ReDim sollName(0 To nSoll): ReDim sollSig(0 To nSoll): ReDim sollBeruehrt(0 To nSoll): ReDim sollAltAus(0 To nSoll)
    ReDim sollNeu(0 To nSoll)
    For i = 1 To nSoll
        sollName(i) = mName(mOrd(i))
        sollSig(i) = Signatur(mOrd(i))
        sollBeruehrt(i) = mBeruehrt(mOrd(i)) Or mNeu(mOrd(i))
        sollNeu(i) = mNeu(mOrd(i)) Or mOrd(i) > nAlt
        If mOrd(i) <= nAlt Then sollAltAus(i) = altAus(mOrd(i))
    Next i
    If f = "" And brauchtSave Then f = ReihenfolgeAngleichen()
    If f = "" Then
        f = OrdnerAnlegenUndZuweisen(ziel)
        ' Fehler beim Zuweisen eines vorgemerkten Zielordners oder beim spaeten Einschalten einer neuen Regel: der
        ' Planzeile zuordnen, die es vorgemerkt hat
        If f <> "" And gFehlerZeile > 0 Then fehlerK = gFehlerZeile
    End If
    If f = "" And brauchtSave Then f = RegelnSpeichern(regeln)
    If f <> "" Then
        ProtokollSchreiben gLauf, gZielAdr, IIf(fehlerK > 0, pNr(fehlerK), ""), IIf(fehlerK > 0, pAktion(fehlerK), ""), _
                           IIf(fehlerK > 0, pRegel(fehlerK), ""), "ABBRUCH: " & f
        For k = 1 To pAnz
            If pAusf(k) And pErgebnis(k) <> "schon erledigt" Then
                If k = fehlerK Then
                    pErgebnis(k) = "nicht ausgeführt: " & f
                ElseIf fehlerK > 0 Then
                    pErgebnis(k) = "nicht ausgeführt: abgebrochen wegen Fehler in Zeile " & pNr(fehlerK) & _
                                   ", nichts gespeichert"
                Else
                    pErgebnis(k) = "nicht ausgeführt: " & f
                End If
            End If
        Next k
        If InStr(f, "Speichern fehlgeschlagen") > 0 Then
            PostfachAusfuehren = "Nicht ausgeführt: " & f & vbLf & vbLf & "Ob Outlook teilweise gespeichert hat, zeigt „" & _
                "Regeln aus Outlook lesen“. Zeigt Outlook einen Dialog zu einem Regelkonflikt (z. B. weil " & _
                "„Regeln und Benachrichtigungen“ noch offen ist), dort antworten bzw. den Dialog schließen und " & _
                "erneut „Vorschau“ und „Ausführen“ starten. "
        Else
            PostfachAusfuehren = "Nicht ausgeführt: " & f & vbLf & vbLf & "In Outlook wurde nichts gespeichert. "
        End If
        PostfachAusfuehren = PostfachAusfuehren & IIf(gOrdnerAngelegt <> "", "Bereits angelegte Ordner (bleiben " & _
            "bestehen): " & gOrdnerAngelegt, "Es wurden keine Ordner angelegt.")
        Exit Function
    End If
    PostfachAusfuehren = Nachpruefen(ol, ziel, sollName, sollSig, sollBeruehrt, sollAltAus, sollNeu, nSoll, brauchtSave)
End Function

' Position einer Regel im erwarteten Stand (nach Namen), 0 wenn nicht vorhanden.
Private Function SollIndex(sollName() As String, ByVal nSoll As Long, ByVal regelName As String) As Long
    Dim i As Long
    For i = 1 To nSoll
        If sollName(i) = regelName Then
            SollIndex = i
            Exit Function
        End If
    Next i
End Function

' Nach dem Speichern: alles neu lesen, jede Planzeile pruefen und jede Regel mit dem erwarteten Abbild vergleichen.
' Weichen bei einer aktiven Regel die Bedingungen ab, bietet das Makro an, sie sofort zu deaktivieren (Vorgabe Ja).
' Weichen nur die Ausnahmen ab, fragt es mit Vorgabe Nein: Fehlen nur neu uebernommene Ausnahmen, gilt der alte
' Zustand weiter, und Deaktivieren wuerde z. B. bei einer Sammelregel die Umleitung aller uebrigen Mails stoppen.
' Eine im Lauf neu angelegte Regel (sollNeu) hat keinen alten Stand: Jede Abweichung bei Bedingungen oder Ausnahmen
' heisst, sie greift breiter als die Vorlage - das zaehlt wie eine Abweichung der Bedingungen (Vorgabe Ja).
Private Function Nachpruefen(ByVal ol As Object, ByVal ziel As Object, sollName() As String, sollSig() As String, _
                             sollBeruehrt() As Boolean, sollAltAus() As String, sollNeu() As Boolean, _
                             ByVal nSoll As Long, ByVal gespeichert As Boolean) As String
    Dim regeln As Object, f As String, k As Long, st As String, i As Long, id As Long, j As Long
    Dim nOk As Long, nAbw As Long, reihe As String, msg As String, abw As String, liste As String
    Dim nUnb As Long, nUnbOk As Long, nachIds As String, bedIds As String, bedNamen As String
    Dim ausIds As String, ausNamen As String, sammel As String, ids As String, idsNamen As String, namen As String
    Dim wichtig As String, info As String, abwBed As Boolean, abwAus As Boolean, was As String, mitNeu As Boolean
    gProtK = 0
    If Not StandLesen(ziel, regeln, f) Then
        For k = 1 To pAnz
            If Left(pErgebnis(k), 11) = "im Speicher" Then pErgebnis(k) = "gespeichert, Prüfung nicht möglich: " & f
        Next k
        Nachpruefen = "Gespeichert, aber die Prüfung war nicht möglich: " & f & vbLf & "Bitte „Regeln aus Outlook lesen“."
        Exit Function
    End If
    PostfachStandMerken
    ' Reihenfolge und Regeln einzeln
    If mAnz <> nSoll Then reihe = "Anzahl der Regeln: soll " & nSoll & ", ist " & mAnz
    For i = 1 To mAnz
        id = mOrd(i)
        If i <= nSoll Then
            If mName(id) <> sollName(i) And reihe = "" Then reihe = "Reihenfolge weicht ab ab Platz " & i & " (soll " & _
                Zitat(sollName(i)) & ", ist " & Zitat(mName(id)) & ")"
        End If
        j = SollIndex(sollName, nSoll, mName(id))
        If j = 0 Then
            liste = Anhaengen(liste, Zitat(mName(id)) & " unerwartet vorhanden")
        Else
            abw = SignaturAbweichung(sollSig(j), Signatur(id))
            If abw <> "" Then
                liste = Anhaengen(liste, Zitat(mName(id)) & ": " & abw)
                abwBed = (InStr(abw, "Bedingungen (") > 0)
                abwAus = (InStr(abw, "Ausnahmen (") > 0)
                If mAktiv(id) Then
                    If sollNeu(j) And (abwBed Or abwAus) Then
                        ' neu angelegte Regel: kein alter Stand, also nie "nur Ausnahmen" - deaktivieren empfohlen
                        bedIds = bedIds & "|" & id & "|"
                        mitNeu = True
                        was = ""
                        If abwBed Then
                            If mNSicht(id) = 0 Then
                                was = "keine sichtbare Bedingung mehr – greift bei jeder Mail, die bis zu ihr kommt"
                            Else
                                was = "Bedingungen weichen ab"
                            End If
                        End If
                        If abwAus Then was = Anhaengen(was, "Ausnahmen weichen ab", ", ")
                        bedNamen = Anhaengen(bedNamen, Zitat(mName(id)) & " (neu angelegte Regel greift breiter als " & _
                                   "die Vorlage: " & was & ")")
                    ElseIf abwBed Then
                        bedIds = bedIds & "|" & id & "|"
                        bedNamen = Anhaengen(bedNamen, Zitat(mName(id)) & IIf(mNSicht(id) = 0, " (keine sichtbare " & _
                                   "Bedingung mehr – greift bei jeder Mail, die bis zu ihr kommt)", ""))
                    ElseIf abwAus Then
                        ausIds = ausIds & "|" & id & "|"
                        If WEnthalten(mAusW(id), sollAltAus(j)) Then
                            ausNamen = Anhaengen(ausNamen, Zitat(mName(id)) & " (frühere Ausnahmen alle da – es gilt " & _
                                       "mindestens der alte Stand)")
                        Else
                            ausNamen = Anhaengen(ausNamen, Zitat(mName(id)) & " (auch frühere Ausnahmen fehlen – die " & _
                                       "Regel greift breiter als vorher)")
                        End If
                        If mOhneBed(id) Then sammel = Anhaengen(sammel, Zitat(mName(id)), ", ")
                    End If
                End If
            ElseIf Not sollBeruehrt(j) Then
                nUnbOk = nUnbOk + 1
            End If
            If Not sollBeruehrt(j) Then nUnb = nUnb + 1
        End If
    Next i
    For j = 1 To nSoll
        If SucheName(sollName(j)) <= 0 Then liste = Anhaengen(liste, Zitat(sollName(j)) & " fehlt")
    Next j
    ' Planzeilen
    For k = 1 To pAnz
        If Left(pErgebnis(k), 11) = "im Speicher" Then
            gProtK = k
            st = SchrittPruefen(k, False, ol, ziel)
            id = gRegelId
            abw = ""
            If id > 0 Then
                j = SollIndex(sollName, nSoll, mName(id))
                If j > 0 Then abw = SignaturAbweichung(sollSig(j), Signatur(id))
            End If
            If Left(st, 14) = "schon erledigt" And abw = "" And (reihe = "" Or (pAktion(k) <> "POSITION" And pAktion(k) <> "KOPIEREN")) Then
                pErgebnis(k) = "erledigt (geprüft)"
                If id > 0 Then
                    If Not mLesbar(id) Then
                        pErgebnis(k) = "erledigt (geprüft, Bedingung nicht prüfbar)"
                    ElseIf mOhneBed(id) Then
                        pErgebnis(k) = "erledigt (geprüft, ohne sichtbare Bedingung)"
                    End If
                End If
                ' uebersprungene (nicht aufloesbare) Absender nennen
                If eOhneNamen <> "" Then pErgebnis(k) = pErgebnis(k) & " · übersprungen (nicht auflösbar): " & eOhneNamen
                nOk = nOk + 1
                ProtokollZeile "geprüft: " & pErgebnis(k)
            Else
                If Left(st, 14) = "schon erledigt" Then
                    If abw <> "" Then st = abw Else st = reihe
                End If
                pErgebnis(k) = "gespeichert, Prüfung weicht ab: " & st
                nAbw = nAbw + 1
                ProtokollZeile "geprüft: weicht ab: " & st
            End If
        End If
    Next k
    gProtK = 0
    If liste <> "" Then ProtokollZeile "Abweichungen nach dem Speichern: " & liste
    If reihe <> "" Then ProtokollZeile reihe
    NamensWert N_STATUS, PostfachStatusText()
    ' Meldung: Kopf, dann Wichtiges (Deaktivierung, Regeln ohne Bedingung vor aktiven Regeln, Abweichungen), dann
    ' Hinweise - eine MsgBox kuerzt hinten (MeldungKurz), der volle Text steht im Protokoll
    msg = IIf(gespeichert, "Gespeichert in " & gZielAdr & ".", "Kein Speichern nötig (nur Ordner).") & vbLf & _
          "Geprüft: " & nOk & " erledigt, " & nAbw & " mit Abweichung."
    If reihe <> "" Then info = Anhaengen(info, reihe & " (Protokoll).", vbLf)
    If liste <> "" Then info = Anhaengen(info, "Achtung, Abweichungen: " & KurzName(liste, 400), vbLf)
    If gNichtLesbar > 0 Then
        info = Anhaengen(info, "Unberührte Regeln: " & nUnbOk & " von " & nUnb & " in den sichtbaren Merkmalen " & _
               "unverändert; bei " & gNichtLesbar & " Regel(n) war die Bedingung nicht prüfbar (" & gNamenNichtLesbar & _
               "). Bitte jetzt in Outlook unter Regeln und Benachrichtigungen die Regelbeschreibung dieser Regeln " & _
               "ansehen und eine Testmail schicken; bei Abweichung die .rwz importieren.", vbLf)
    Else
        info = Anhaengen(info, "Unberührte Regeln: " & nUnbOk & " von " & nUnb & " unverändert.", vbLf)
    End If
    If gOrdnerAngelegt <> "" Then info = Anhaengen(info, "Ordner angelegt: " & gOrdnerAngelegt, vbLf)
    If gOhneBed > 0 Then
        info = Anhaengen(info, "Ohne sichtbare Bedingung (" & gNamenOhneBed & "): Ob eine in Outlook im Web angelegte " & _
               "Bedingung erhalten blieb, zeigt nur Outlook im Web.", vbLf)
    End If
    ' Abweichende Bedingungen bei aktiven Regeln (bei neu angelegten Regeln auch Ausnahmen): sofort deaktivieren
    ' anbieten (empfohlen, Vorgabe Ja)
    If bedIds <> "" Then
        If Frage(MeldungKurz("Achtung: Nach dem Speichern weichen Bedingungen " & IIf(mitNeu, "(bei neu angelegten " & _
                 "Regeln auch Ausnahmen) ", "") & "ab bei:" & vbLf & bedNamen, vbLf & vbLf & _
                 "Diese Regel(n) jetzt deaktivieren und erneut speichern? (empfohlen – danach in Outlook prüfen und " & _
                 "bei Bedarf die .rwz importieren)"), "Abweichung nach dem Speichern", True) Then
            ids = ids & bedIds
            namen = Anhaengen(namen, bedNamen)
        Else
            wichtig = Anhaengen(wichtig, "Nicht deaktiviert – bitte sofort in Outlook prüfen: " & bedNamen, vbLf)
        End If
    End If
    ' Nur Ausnahmen weichen ab: Vorgabe Nein (der alte Zustand gilt; Deaktivieren schaltet die ganze Regel ab)
    If ausIds <> "" Then
        If Frage(MeldungKurz("Nach dem Speichern weichen nur Ausnahmen ab (Bedingungen wie erwartet) bei:" & vbLf & ausNamen & _
                 vbLf & vbLf & "Fehlen nur die neu übernommenen Ausnahmen, gilt der alte Zustand weiter. Deaktivieren " & _
                 "würde die ganze Regel abschalten" & IIf(sammel = "", ".", " – " & sammel & " hat keine sichtbare Bedingung " & _
                 "(Sammelregel): Die Umleitung bzw. Verschiebung aller übrigen Mails würde stoppen."), vbLf & vbLf & _
                 "Trotzdem deaktivieren und erneut speichern? (nicht empfohlen – besser die Ausnahmen in Outlook prüfen " & _
                 "und von Hand ergänzen)"), "Abweichung nur bei Ausnahmen", False) Then
            ids = ids & ausIds
            namen = Anhaengen(namen, ausNamen)
        Else
            wichtig = Anhaengen(wichtig, "Nicht deaktiviert (nur Ausnahmen weichen ab) – bitte die Ausnahmen in Outlook " & _
                      "prüfen: " & ausNamen, vbLf)
        End If
    End If
    If ids <> "" Then
        ' Namen der zu deaktivierenden Regeln (fuer die Kontrolle nach dem erneuten Lesen)
        idsNamen = "|"
        For i = 1 To mAnz
            If InStr(ids, "|" & i & "|") > 0 Then idsNamen = idsNamen & mName(i) & "|"
        Next i
        f = RegelnDeaktivierenUndSpeichern(regeln, ids)
        If f = "" Then
            nachIds = ""
            If StandLesen(ziel, regeln, f) Then
                For i = 1 To mAnz
                    If InStr(idsNamen, "|" & mName(i) & "|") > 0 And mAktiv(i) Then nachIds = Anhaengen(nachIds, Zitat(mName(i)))
                Next i
                If nachIds = "" Then
                    wichtig = Anhaengen(wichtig, "Deaktiviert und gespeichert: " & namen, vbLf)
                Else
                    wichtig = Anhaengen(wichtig, "Deaktivieren nicht wirksam bei: " & nachIds, vbLf)
                End If
                PostfachStandMerken
                NamensWert N_STATUS, PostfachStatusText()
            Else
                wichtig = Anhaengen(wichtig, "Deaktiviert und gespeichert; Kontrolle nicht möglich: " & f, vbLf)
            End If
        Else
            wichtig = Anhaengen(wichtig, f, vbLf)
        End If
    End If
    ' Stand nach dem Speichern (bzw. nach dem Deaktivieren): Regel ohne sichtbare Bedingung vor aktiven Regeln?
    If gAbfang > 0 Then
        wichtig = Anhaengen(wichtig, "Achtung, ohne sichtbare Bedingung vor aktiven Regeln: " & gNamenAbfang & _
                  " – würde alle folgenden Mails abfangen.", vbLf)
    End If
    If wichtig <> "" Then msg = msg & vbLf & wichtig
    If info <> "" Then msg = msg & vbLf & info
    Nachpruefen = msg
End Function
