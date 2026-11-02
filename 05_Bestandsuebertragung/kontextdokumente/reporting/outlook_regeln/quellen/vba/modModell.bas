Option Explicit
' ============================================================================
' modModell - Abbild der Regeln eines Postfachs im Speicher.
'
' Vorschau, Ausfuehren und Nachpruefung arbeiten auf diesem Abbild. Jede Regel hat eine feste ID (1..mAnz),
' die Ausfuehrungsreihenfolge steht getrennt in mOrd (Platz -> ID). Das Modul kennt kein Outlook; nur mObj haelt
' beim Lesen die Outlook-Regel fest, damit Ausfuehren dieselbe Regel aendert, die gelesen wurde.
'
' Werte von Bedingungen und Ausnahmen (mBedW, mAusW) stehen je Typ als Datensatz:
'   Typ W_FELD A|I W_FELD Wert1 W_SEP Wert2 ...   Datensaetze getrennt durch W_REC
' A = aktiv, I = inaktiv. Werte: Empfaenger als Adresse, Woerter, Adressen, Kategorien, Formularnamen.
' Signatur(id) fasst alles zusammen, was sich ohne Planschritt nicht aendern darf; die Nachpruefung vergleicht
' den Stand nach dem Speichern Regel fuer Regel mit dem erwarteten Abbild.
' ============================================================================

Public mAnz As Long
Public mName() As String
Public mAktiv() As Boolean
Public mLokal() As Boolean
Public mTyp() As Long
Public mReihe() As Long
Public mBed() As String
Public mAus() As String
Public mAkt() As String
Public mNBed() As Long
Public mTypen() As String
Public mAusTypen() As String
Public mNSicht() As Long
Public mLesbar() As Boolean
Public mOhneBed() As Boolean
Public mGrund() As String
Public mBedW() As String
Public mAusW() As String
Public mVerAn() As Boolean
Public mVerPfad() As String
Public mKopAn() As Boolean
Public mKopPfad() As String
Public mWeiAn() As Boolean
Public mWeiEmpf() As String
Public mWeiNamen() As String
Public mWeiFehlt() As Long
Public mUmlAn() As Boolean
Public mUmlEmpf() As String
Public mUmlNamen() As String
Public mUmlFehlt() As Long
Public mHalt() As Boolean
Public mFremd() As String
Public mAktFremd() As String
Public mNeu() As Boolean
Public mBeruehrt() As Boolean
Public mObj() As Object
Public mOrd() As Long
' Im Lauf angelegte Ordner (normierte Pfade, je zwischen "|")
Public mOrdner As String
' Namen wie in Outlook (vor dem Durchspielen des Plans festgehalten, fuer Meldungen); IDs ueber mAnzAlt sind neu
Public mNameAlt() As String
Public mAnzAlt As Long
' Trennzeichen der Werte-Datensaetze (selten benutzte, druckbare Zeichen aus cp1252)
Public Const W_SEP As String = "¦"
Public Const W_FELD As String = "¤"
Public Const W_REC As String = "¶"

Public Sub ModellLeeren()
    mAnz = 0
    mOrdner = "|"
    mAnzAlt = 0
    ReDim mNameAlt(0 To 0)
    ModellGroesse 0, False
End Sub

' Namen wie in Outlook festhalten (vor dem Durchspielen des Plans, der Regeln im Abbild umbenennt).
Public Sub NamenFesthalten()
    Dim i As Long
    mAnzAlt = mAnz
    ReDim mNameAlt(0 To mAnz)
    For i = 1 To mAnz
        mNameAlt(i) = mName(i)
    Next i
End Sub

' Name fuer Meldungen: wie in Outlook; eine im Lauf neu angelegte Regel als "neue Regel „…“".
Public Function AnzeigeName(ByVal id As Long) As String
    If id >= 1 And id <= mAnzAlt Then
        AnzeigeName = Zitat(mNameAlt(id))
    Else
        AnzeigeName = "neue Regel " & Zitat(mName(id))
    End If
End Function

' Faengt Regel id alle folgenden Mails ab? Gemeint ist eine aktive, lesbare Regel ohne sichtbare Bedingung, die
' verschiebt oder keine weiteren Regeln zulaesst (Stopp). Steht dahinter noch eine aktive Regel gleichen Typs
' (Empfangen/Senden), ist das unplausibel: Die Regel wuerde alles abfangen, ihre Bedingung ist vermutlich nur nicht
' sichtbar (Outlook im Web) und koennte beim Speichern verloren gehen. Nicht lesbare Regeln zaehlen dahinter nicht
' mit (Platz oder Typ womoeglich unbekannt; sie sperren das Speichern ohnehin).
' Rueckgabe: Anzahl aktiver Regeln gleichen Typs dahinter (0 = faengt nicht ab); erste: ID der ersten davon.
Public Function AbfangDahinter(ByVal id As Long, ByRef erste As Long) As Long
    Dim i As Long, j As Long, n As Long, faengt As Boolean
    erste = 0
    If id < 1 Or id > mAnz Then Exit Function
    faengt = mOhneBed(id) And mAktiv(id)
    If faengt Then faengt = (mVerAn(id) Or mHalt(id))
    If Not faengt Then Exit Function
    For i = Platz(id) + 1 To mAnz
        j = mOrd(i)
        If mAktiv(j) And mLesbar(j) And mTyp(j) = mTyp(id) Then
            n = n + 1
            If erste = 0 Then erste = j
        End If
    Next i
    AbfangDahinter = n
End Function

Public Function AbfangAnzahl() As Long
    Dim i As Long, e As Long
    For i = 1 To mAnz
        If AbfangDahinter(mOrd(i), e) > 0 Then AbfangAnzahl = AbfangAnzahl + 1
    Next i
End Function

' "„A“ vor 2 aktiven Regeln (zuerst „B“)"; je abfangende Regel ein Eintrag, hoechstens so viele, Rest "und n weitere".
Public Function AbfangNamen(ByVal hoechstens As Long) As String
    Dim i As Long, id As Long, n As Long, erste As Long, k As Long, s As String
    For i = 1 To mAnz
        id = mOrd(i)
        n = AbfangDahinter(id, erste)
        If n > 0 Then
            k = k + 1
            If k <= hoechstens Then
                If n = 1 Then
                    s = Anhaengen(s, AnzeigeName(id) & " vor 1 aktiven Regel (" & AnzeigeName(erste) & ")")
                Else
                    s = Anhaengen(s, AnzeigeName(id) & " vor " & n & " aktiven Regeln (zuerst " & AnzeigeName(erste) & ")")
                End If
            End If
        End If
    Next i
    If k > hoechstens Then s = s & " und " & (k - hoechstens) & " weitere"
    AbfangNamen = s
End Function

Public Sub ModellGroesse(ByVal n As Long, ByVal erhalten As Boolean)
    If erhalten Then
        ReDim Preserve mName(0 To n): ReDim Preserve mAktiv(0 To n): ReDim Preserve mLokal(0 To n)
        ReDim Preserve mTyp(0 To n): ReDim Preserve mReihe(0 To n): ReDim Preserve mBed(0 To n)
        ReDim Preserve mAus(0 To n): ReDim Preserve mAkt(0 To n): ReDim Preserve mNBed(0 To n)
        ReDim Preserve mTypen(0 To n): ReDim Preserve mAusTypen(0 To n): ReDim Preserve mNSicht(0 To n)
        ReDim Preserve mLesbar(0 To n): ReDim Preserve mOhneBed(0 To n): ReDim Preserve mGrund(0 To n)
        ReDim Preserve mBedW(0 To n): ReDim Preserve mAusW(0 To n)
        ReDim Preserve mVerAn(0 To n): ReDim Preserve mVerPfad(0 To n)
        ReDim Preserve mKopAn(0 To n): ReDim Preserve mKopPfad(0 To n): ReDim Preserve mWeiAn(0 To n)
        ReDim Preserve mWeiEmpf(0 To n): ReDim Preserve mWeiNamen(0 To n): ReDim Preserve mWeiFehlt(0 To n)
        ReDim Preserve mUmlAn(0 To n): ReDim Preserve mUmlEmpf(0 To n): ReDim Preserve mUmlNamen(0 To n)
        ReDim Preserve mUmlFehlt(0 To n): ReDim Preserve mHalt(0 To n)
        ReDim Preserve mFremd(0 To n): ReDim Preserve mAktFremd(0 To n): ReDim Preserve mNeu(0 To n)
        ReDim Preserve mBeruehrt(0 To n): ReDim Preserve mObj(0 To n): ReDim Preserve mOrd(0 To n)
    Else
        ReDim mName(0 To n): ReDim mAktiv(0 To n): ReDim mLokal(0 To n)
        ReDim mTyp(0 To n): ReDim mReihe(0 To n): ReDim mBed(0 To n)
        ReDim mAus(0 To n): ReDim mAkt(0 To n): ReDim mNBed(0 To n)
        ReDim mTypen(0 To n): ReDim mAusTypen(0 To n): ReDim mNSicht(0 To n)
        ReDim mLesbar(0 To n): ReDim mOhneBed(0 To n): ReDim mGrund(0 To n)
        ReDim mBedW(0 To n): ReDim mAusW(0 To n)
        ReDim mVerAn(0 To n): ReDim mVerPfad(0 To n)
        ReDim mKopAn(0 To n): ReDim mKopPfad(0 To n): ReDim mWeiAn(0 To n)
        ReDim mWeiEmpf(0 To n): ReDim mWeiNamen(0 To n): ReDim mWeiFehlt(0 To n)
        ReDim mUmlAn(0 To n): ReDim mUmlEmpf(0 To n): ReDim mUmlNamen(0 To n)
        ReDim mUmlFehlt(0 To n): ReDim mHalt(0 To n)
        ReDim mFremd(0 To n): ReDim mAktFremd(0 To n): ReDim mNeu(0 To n)
        ReDim mBeruehrt(0 To n): ReDim mObj(0 To n): ReDim mOrd(0 To n)
    End If
End Sub

' Platz 0 (Quellregel beim Kopieren) leeren.
Public Sub QuellPlatzLeeren()
    mName(0) = "": mAktiv(0) = False: mBed(0) = "": mAus(0) = "": mAkt(0) = "": mTypen(0) = "": mAusTypen(0) = ""
    mNSicht(0) = 0: mBedW(0) = "": mAusW(0) = "": mVerAn(0) = False: mVerPfad(0) = "": mKopAn(0) = False
    mKopPfad(0) = "": mWeiAn(0) = False: mWeiEmpf(0) = "": mWeiNamen(0) = "": mWeiFehlt(0) = 0: mUmlAn(0) = False
    mUmlEmpf(0) = "": mUmlNamen(0) = "": mUmlFehlt(0) = 0: mHalt(0) = False: mFremd(0) = "": mAktFremd(0) = ""
End Sub

' Neue Regel am Ende der Reihenfolge; liefert die ID.
Public Function RegelAnhaengen(ByVal regelName As String) As Long
    mAnz = mAnz + 1
    ModellGroesse mAnz, True
    mName(mAnz) = regelName
    mAktiv(mAnz) = True
    mLesbar(mAnz) = True
    mNeu(mAnz) = True
    mBeruehrt(mAnz) = True
    mOrd(mAnz) = mAnz
    RegelAnhaengen = mAnz
End Function

' Reihenfolge aus den gelesenen ExecutionOrder-Werten (stabil: bei gleichem Wert zaehlt die Lesereihenfolge).
Public Sub ReihenfolgeAusWerten()
    Dim i As Long, j As Long, t As Long
    For i = 1 To mAnz
        mOrd(i) = i
    Next i
    For i = 2 To mAnz
        t = mOrd(i)
        j = i - 1
        Do While j >= 1
            If mReihe(mOrd(j)) <= mReihe(t) Then Exit Do
            mOrd(j + 1) = mOrd(j)
            j = j - 1
        Loop
        mOrd(j + 1) = t
    Next i
End Sub

Public Function Platz(ByVal id As Long) As Long
    Dim i As Long
    For i = 1 To mAnz
        If mOrd(i) = id Then
            Platz = i
            Exit Function
        End If
    Next i
End Function

' Regel id auf Platz ziel setzen (herausnehmen und einfuegen).
Public Sub Umsetzen(ByVal id As Long, ByVal ziel As Long)
    Dim i As Long, von As Long
    von = Platz(id)
    If von = 0 Or ziel < 1 Or ziel > mAnz Or von = ziel Then Exit Sub
    If von < ziel Then
        For i = von To ziel - 1
            mOrd(i) = mOrd(i + 1)
        Next i
    Else
        For i = von To ziel + 1 Step -1
            mOrd(i) = mOrd(i - 1)
        Next i
    End If
    mOrd(ziel) = id
End Sub

' Regel nach Namen: erst exakt, dann ohne Gross-/Kleinschreibung. 0 = keine, -1 = mehrdeutig.
Public Function SucheName(ByVal regelName As String) As Long
    Dim i As Long, treffer As Long, anzahl As Long
    regelName = Trim(regelName)
    If regelName = "" Then Exit Function
    For i = 1 To mAnz
        If Trim(mName(i)) = regelName Then
            anzahl = anzahl + 1
            treffer = i
        End If
    Next i
    If anzahl = 0 Then
        For i = 1 To mAnz
            If LCase(Trim(mName(i))) = LCase(regelName) Then
                anzahl = anzahl + 1
                treffer = i
            End If
        Next i
    End If
    If anzahl > 1 Then
        SucheName = -1
    Else
        SucheName = treffer
    End If
End Function

Public Function AnzahlNichtLesbar() As Long
    Dim i As Long
    For i = 1 To mAnz
        If Not mLesbar(i) Then AnzahlNichtLesbar = AnzahlNichtLesbar + 1
    Next i
End Function

Public Function AnzahlOhneBed() As Long
    Dim i As Long
    For i = 1 To mAnz
        If mOhneBed(i) Then AnzahlOhneBed = AnzahlOhneBed + 1
    Next i
End Function

Public Function NamenNichtLesbar(ByVal hoechstens As Long) As String
    Dim i As Long, n As Long, s As String
    For i = 1 To mAnz
        If Not mLesbar(mOrd(i)) Then
            n = n + 1
            If n <= hoechstens Then s = s & IIf(s = "", "", "; ") & Zitat(mName(mOrd(i)))
        End If
    Next i
    If n > hoechstens Then s = s & " und " & (n - hoechstens) & " weitere"
    NamenNichtLesbar = s
End Function

' Regeln ohne sichtbare Bedingung (lesbar, aber keine aktive Bedingung), deaktivierte mit "(aus)".
Public Function NamenOhneBed(ByVal hoechstens As Long) As String
    Dim i As Long, n As Long, s As String, id As Long
    For i = 1 To mAnz
        id = mOrd(i)
        If mOhneBed(id) Then
            n = n + 1
            If n <= hoechstens Then s = s & IIf(s = "", "", "; ") & Zitat(mName(id)) & IIf(mAktiv(id), "", " (aus)")
        End If
    Next i
    If n > hoechstens Then s = s & " und " & (n - hoechstens) & " weitere"
    NamenOhneBed = s
End Function

Public Sub OrdnerMerken(ByVal pfad As String)
    If InStr(mOrdner, "|" & PfadNorm(pfad) & "|") = 0 Then mOrdner = mOrdner & PfadNorm(pfad) & "|"
End Sub

Public Function OrdnerGemerkt(ByVal pfad As String) As Boolean
    OrdnerGemerkt = (InStr(mOrdner, "|" & PfadNorm(pfad) & "|") > 0)
End Function

' Pfad fuer Vergleiche: ohne Gross-/Kleinschreibung, %2F als /, ohne abschliessenden \.
Public Function PfadNorm(ByVal pfad As String) As String
    Dim s As String
    s = LCase(Trim(pfad))
    s = Replace(s, "%2f", "/")
    Do While Len(s) > 2 And Right(s, 1) = "\"
        s = Left(s, Len(s) - 1)
    Loop
    PfadNorm = s
End Function

' Empfaengerlisten ("a; b") ohne Reihenfolge und ohne Gross-/Kleinschreibung vergleichen.
Public Function GleicheListe(ByVal a As String, ByVal b As String) As Boolean
    GleicheListe = (ListeEnthaelt(a, b) And ListeEnthaelt(b, a))
End Function

' Enthaelt Liste a alle Eintraege von Liste b?
Public Function ListeEnthaelt(ByVal a As String, ByVal b As String) As Boolean
    Dim teile As Variant, i As Long, s As String
    ListeEnthaelt = True
    If Trim(b) = "" Then Exit Function
    s = "|" & LCase(Replace(a, "; ", "|")) & "|"
    teile = Split(b, "; ")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            If InStr(s, "|" & LCase(Trim(teile(i))) & "|") = 0 Then
                ListeEnthaelt = False
                Exit Function
            End If
        End If
    Next i
End Function

Public Function ListeVereinen(ByVal a As String, ByVal b As String) As String
    Dim teile As Variant, i As Long, s As String
    s = a
    If Trim(b) <> "" Then
        teile = Split(b, "; ")
        For i = LBound(teile) To UBound(teile)
            If Trim(teile(i)) <> "" Then
                If Not ListeEnthaelt(s, CStr(teile(i))) Then s = s & IIf(s = "", "", "; ") & Trim(teile(i))
            End If
        Next i
    End If
    ListeVereinen = s
End Function

' Eintraege von b, die in a fehlen ("; "-Listen)
Public Function ListeFehlend(ByVal a As String, ByVal b As String) As String
    Dim teile As Variant, i As Long, s As String
    If Trim(b) = "" Then Exit Function
    teile = Split(b, "; ")
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            If Not ListeEnthaelt(a, CStr(teile(i))) Then s = Anhaengen(s, Trim(teile(i)))
        End If
    Next i
    ListeFehlend = s
End Function

Public Function Anhaengen(ByVal s As String, ByVal teil As String, Optional ByVal trenner As String = "; ") As String
    If teil = "" Then
        Anhaengen = s
    ElseIf s = "" Then
        Anhaengen = teil
    Else
        Anhaengen = s & trenner & teil
    End If
End Function

Public Function Zitat(ByVal s As String) As String
    Zitat = "„" & s & "“"
End Function

' Langen Namen in der Mitte kuerzen ("Anfang…Ende").
Public Function KurzName(ByVal s As String, ByVal n As Long) As String
    Dim v As Long
    If Len(s) <= n Then
        KurzName = s
    Else
        v = Int((n - 1) / 2)
        KurzName = Left(s, v) & "…" & Right(s, n - 1 - v)
    End If
End Function

' Text hinten kuerzen ("Anfang…").
Public Function Abschneiden(ByVal s As String, ByVal n As Long) As String
    If Len(s) <= n Then
        Abschneiden = s
    Else
        Abschneiden = Left(s, n - 1) & "…"
    End If
End Function

' Datum und Uhrzeit als dd.mm.yyyy hh:nn (von Hand zusammengesetzt, damit es ueberall gleich aussieht).
Public Function Zeitstempel() As String
    Dim d As Date
    d = Now
    Zeitstempel = Right("0" & Day(d), 2) & "." & Right("0" & Month(d), 2) & "." & Year(d) & " " & _
                  Right("0" & Hour(d), 2) & ":" & Right("0" & Minute(d), 2)
End Function

' ---------------------------------------------------------------- Werte von Bedingungen/Ausnahmen

Public Function WTrenner() As String
    WTrenner = W_SEP
End Function

' Datensatz zu Typ t suchen. Rueckgabe True, wenn vorhanden.
Public Function WRec(ByVal s As String, ByVal t As Long, ByRef aktiv As Boolean, ByRef werte As String) As Boolean
    Dim recs As Variant, i As Long, f As Variant
    aktiv = False: werte = ""
    If s = "" Then Exit Function
    recs = Split(s, W_REC)
    For i = LBound(recs) To UBound(recs)
        If recs(i) <> "" Then
            f = Split(recs(i), W_FELD)
            If CLng(f(0)) = t Then
                aktiv = (f(1) = "A")
                If UBound(f) >= 2 Then werte = f(2)
                WRec = True
                Exit Function
            End If
        End If
    Next i
End Function

' Datensatz zu Typ t setzen (ersetzen oder anhaengen).
Public Function WSetzen(ByVal s As String, ByVal t As Long, ByVal aktiv As Boolean, ByVal werte As String) As String
    Dim recs As Variant, i As Long, f As Variant, neu As String, aus As String, gesetzt As Boolean
    neu = CStr(t) & W_FELD & IIf(aktiv, "A", "I") & W_FELD & werte
    If s <> "" Then
        recs = Split(s, W_REC)
        For i = LBound(recs) To UBound(recs)
            If recs(i) <> "" Then
                f = Split(recs(i), W_FELD)
                If CLng(f(0)) = t Then
                    aus = Anhaengen(aus, neu, W_REC)
                    gesetzt = True
                Else
                    aus = Anhaengen(aus, CStr(recs(i)), W_REC)
                End If
            End If
        Next i
    End If
    If Not gesetzt Then aus = Anhaengen(aus, neu, W_REC)
    WSetzen = aus
End Function

' Typen der (aktiven) Datensaetze als "|t1|t2|"
Public Function WTypen(ByVal s As String, ByVal nurAktiv As Boolean) As String
    Dim recs As Variant, i As Long, f As Variant, aus As String
    aus = "|"
    If s <> "" Then
        recs = Split(s, W_REC)
        For i = LBound(recs) To UBound(recs)
            If recs(i) <> "" Then
                f = Split(recs(i), W_FELD)
                If f(1) = "A" Or Not nurAktiv Then aus = aus & f(0) & "|"
            End If
        Next i
    End If
    WTypen = aus
End Function

' Nur die aktiven Datensaetze
Public Function WNurAktiv(ByVal s As String) As String
    Dim recs As Variant, i As Long, f As Variant, aus As String
    If s = "" Then Exit Function
    recs = Split(s, W_REC)
    For i = LBound(recs) To UBound(recs)
        If recs(i) <> "" Then
            f = Split(recs(i), W_FELD)
            If f(1) = "A" Then aus = Anhaengen(aus, CStr(recs(i)), W_REC)
        End If
    Next i
    WNurAktiv = aus
End Function

' Werteliste (W_SEP) normiert: klein, getrimmt, ohne Doppelte, sortiert, mit "; " verbunden.
Public Function WListeNorm(ByVal werte As String) As String
    Dim teile As Variant, i As Long, n As Long, a() As String, s As String, j As Long, t As String, doppelt As Boolean
    If werte = "" Then Exit Function
    teile = Split(werte, W_SEP)
    ReDim a(0 To UBound(teile) + 1)
    For i = LBound(teile) To UBound(teile)
        t = LCase(Trim(teile(i)))
        If t <> "" Then
            doppelt = False
            For j = 1 To n
                If a(j) = t Then doppelt = True
            Next j
            If Not doppelt Then
                n = n + 1
                a(n) = t
            End If
        End If
    Next i
    For i = 2 To n
        t = a(i)
        j = i - 1
        Do While j >= 1
            If a(j) <= t Then Exit Do
            a(j + 1) = a(j)
            j = j - 1
        Loop
        a(j + 1) = t
    Next i
    For i = 1 To n
        s = Anhaengen(s, a(i))
    Next i
    WListeNorm = s
End Function

' Aktive Datensaetze normiert, nach Typ sortiert: "1=a; b | 13=x"
Public Function WNorm(ByVal s As String) As String
    Dim typen As Variant, i As Long, aktiv As Boolean, werte As String, aus As String
    typen = Split(TypenSortiert(Replace(Mid(WTypen(s, True), 2), "|", ", ")), ", ")
    For i = LBound(typen) To UBound(typen)
        If typen(i) <> "" Then
            If WRec(s, CLng(typen(i)), aktiv, werte) Then aus = Anhaengen(aus, typen(i) & "=" & WListeNorm(werte), " | ")
        End If
    Next i
    WNorm = aus
End Function

' Werte aus b, die in a fehlen, in der Reihenfolge von b; W_SEP-Liste. Verglichen wird ohne Gross-/Kleinschreibung
' und ohne Leerzeichen am Rand (beide Seiten). Rueckgabe getrimmt (fuer das Abbild); WFehlendRoh liefert die Werte
' unveraendert wie in b (zum Schreiben nach Outlook).
Public Function WFehlend(ByVal a As String, ByVal b As String) As String
    WFehlend = WFehlendArt(a, b, False)
End Function

Public Function WFehlendRoh(ByVal a As String, ByVal b As String) As String
    WFehlendRoh = WFehlendArt(a, b, True)
End Function

Private Function WFehlendArt(ByVal a As String, ByVal b As String, ByVal roh As Boolean) As String
    Dim teile As Variant, i As Long, s As String, ref As String, t As String
    If b = "" Then Exit Function
    ref = W_SEP
    If a <> "" Then
        teile = Split(a, W_SEP)
        For i = LBound(teile) To UBound(teile)
            ref = ref & LCase(Trim(teile(i))) & W_SEP
        Next i
    End If
    teile = Split(b, W_SEP)
    For i = LBound(teile) To UBound(teile)
        t = LCase(Trim(teile(i)))
        If t <> "" Then
            If InStr(ref, W_SEP & t & W_SEP) = 0 Then
                If roh Then
                    s = Anhaengen(s, CStr(teile(i)), W_SEP)
                Else
                    s = Anhaengen(s, Trim(teile(i)), W_SEP)
                End If
                ref = ref & t & W_SEP
            End If
        End If
    Next i
    WFehlendArt = s
End Function

' Enthaelt ist (Datensaetze) alle aktiven Datensaetze aus alt mit allen ihren Werten? (Ausnahmen nach dem Speichern
' gegen den Stand vor dem Lauf; Typen ohne benannte Eigenschaft stehen nicht in den Datensaetzen.)
Public Function WEnthalten(ByVal ist As String, ByVal alt As String) As Boolean
    Dim typen As Variant, i As Long, aA As Boolean, wA As String, aI As Boolean, wI As String
    WEnthalten = True
    typen = Split(Mid(WTypen(alt, True), 2), "|")
    For i = LBound(typen) To UBound(typen)
        If typen(i) <> "" Then
            WRec alt, CLng(typen(i)), aA, wA
            WRec ist, CLng(typen(i)), aI, wI
            If Not aI Then
                WEnthalten = False
            ElseIf WFehlend(wI, wA) <> "" Then
                WEnthalten = False
            End If
        End If
    Next i
End Function

Public Function WAnzahl(ByVal werte As String) As Long
    If werte <> "" Then WAnzahl = UBound(Split(werte, W_SEP)) + 1
End Function

' Werte zum Anzeigen: Woerter in Anfuehrungszeichen
Public Function WAnzeigen(ByVal werte As String, ByVal hoechstens As Long) As String
    Dim teile As Variant, i As Long, s As String, n As Long
    If werte = "" Then Exit Function
    teile = Split(werte, W_SEP)
    For i = LBound(teile) To UBound(teile)
        n = n + 1
        If n <= hoechstens Then s = Anhaengen(s, Zitat(CStr(teile(i))), ", ")
    Next i
    If n > hoechstens Then s = s & " und " & (n - hoechstens) & " weitere"
    WAnzeigen = s
End Function

' Typenliste "13, 1" numerisch sortiert ("1, 13").
Public Function TypenSortiert(ByVal liste As String) As String
    Dim teile As Variant, a() As Long, n As Long, i As Long, j As Long, t As Long, s As String
    If Trim(liste) = "" Then Exit Function
    teile = Split(liste, ",")
    ReDim a(0 To UBound(teile) + 1)
    For i = LBound(teile) To UBound(teile)
        If Trim(teile(i)) <> "" Then
            n = n + 1
            a(n) = CLng(Trim(teile(i)))
        End If
    Next i
    For i = 2 To n
        t = a(i)
        j = i - 1
        Do While j >= 1
            If a(j) <= t Then Exit Do
            a(j + 1) = a(j)
            j = j - 1
        Loop
        a(j + 1) = t
    Next i
    For i = 1 To n
        s = Anhaengen(s, CStr(a(i)), ", ")
    Next i
    TypenSortiert = s
End Function

Public Function TypenEnthalten(ByVal liste As String, ByVal t As Long) As Boolean
    TypenEnthalten = (InStr(", " & liste & ",", ", " & t & ",") > 0)
End Function

' ---------------------------------------------------------------- Signatur fuer die Nachpruefung

Private Function SigTeil(ByVal titel As String, ByVal wert As String) As String
    SigTeil = titel & "=" & wert
End Function

' Alles, was eine Regel ausmacht (ausser Name und Platz), in festen Teilen, getrennt durch W_REC.
Public Function Signatur(ByVal id As Long) As String
    Dim s As String
    s = SigTeil("Aktiv", IIf(mAktiv(id), "Ja", "Nein"))
    s = s & W_REC & SigTeil("Nur lokal", IIf(mLokal(id), "Ja", "Nein"))
    s = s & W_REC & SigTeil("Bedingungen", TypenSortiert(mTypen(id)) & " # " & WNorm(mBedW(id)))
    s = s & W_REC & SigTeil("Ausnahmen", TypenSortiert(mAusTypen(id)) & " # " & WNorm(mAusW(id)))
    s = s & W_REC & SigTeil("Verschieben", IIf(mVerAn(id), PfadNorm(mVerPfad(id)), "-"))
    s = s & W_REC & SigTeil("Kopieren", IIf(mKopAn(id), PfadNorm(mKopPfad(id)), "-"))
    s = s & W_REC & SigTeil("Weiterleiten", IIf(mWeiAn(id), WListeNorm(Replace(mWeiEmpf(id), "; ", W_SEP)), "-"))
    s = s & W_REC & SigTeil("Umleiten", IIf(mUmlAn(id), WListeNorm(Replace(mUmlEmpf(id), "; ", W_SEP)), "-"))
    s = s & W_REC & SigTeil("Keine weiteren Regeln", IIf(mHalt(id), "Ja", "Nein"))
    s = s & W_REC & SigTeil("weitere Aktionen", TypenSortiert(mAktFremd(id)))
    Signatur = s
End Function

' Welche Teile zweier Signaturen unterscheiden sich? Rueckgabe z. B. "Bedingungen (soll: ..., ist: ...)"
Public Function SignaturAbweichung(ByVal soll As String, ByVal ist As String) As String
    Dim a As Variant, b As Variant, i As Long, s As String, ta As String, tb As String, p As Long
    If soll = ist Then Exit Function
    a = Split(soll, W_REC)
    b = Split(ist, W_REC)
    For i = LBound(a) To UBound(a)
        ta = CStr(a(i))
        tb = ""
        If i <= UBound(b) Then tb = CStr(b(i))
        If ta <> tb Then
            p = InStr(ta, "=")
            s = Anhaengen(s, Left(ta, p - 1) & " (soll: " & KurzName(Mid(ta, p + 1), 80) & "; ist: " & _
                             KurzName(Mid(tb, InStr(tb & "=", "=") + 1), 80) & ")")
        End If
    Next i
    SignaturAbweichung = s
End Function
