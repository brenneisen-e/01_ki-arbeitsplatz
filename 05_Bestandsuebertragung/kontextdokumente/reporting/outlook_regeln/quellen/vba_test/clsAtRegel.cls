Option Explicit
' Attrappe Rule (nur Testvariante)
Private mEltern As Object
Private mName As String
Private mAktiv As Boolean
Private mLokal As Boolean
Private mTyp As Long
Private mOrder As Long
Private mBed As Object
Private mAus As Object
Private mAkt As Object
Public BedFehler As Boolean
' Eigenschaften, deren Lesen scheitert ("|Enabled|IsLocalRule|RuleType|ExecutionOrder|")
Public LeseFehler As String

Public Sub Init(ByVal eltern As Object, ByVal regelName As String, ByVal typ As Long)
    Set mEltern = eltern
    mName = regelName
    mTyp = typ
    mAktiv = True
    Set mBed = New clsAtBedListe
    mBed.Init
    Set mAus = New clsAtBedListe
    mAus.Init
    Set mAkt = New clsAtAktListe
    mAkt.Init
End Sub

Public Property Get Name() As String
    Name = mName
End Property

Public Property Let Name(ByVal v As String)
    AtSchreib "Rule.Name " & mName & " -> " & v
    If gAtFehlerName <> "" And mName = gAtFehlerName Then Err.Raise 5220, "Attrappe", "Name kann nicht geändert werden (Attrappe)"
    mName = v
End Property

Private Sub LeseFehlerPruefen(ByVal eigenschaft As String)
    If InStr("|" & LeseFehler & "|", "|" & eigenschaft & "|") > 0 Then
        Err.Raise 5222, "Attrappe", eigenschaft & " nicht lesbar (Attrappe)"
    End If
End Sub

Public Property Get Enabled() As Boolean
    LeseFehlerPruefen "Enabled"
    Enabled = mAktiv
End Property

Public Property Get AktivWert() As Boolean
    AktivWert = mAktiv
End Property

' Wie Outlook (Befund Plan 2.2, Zeile 3): Einschalten prueft die Regel. Ist eine Verschieben-/Kopieren-Aktion
' eingeschaltet, aber ohne Zielordner, wirft Outlook "Mindestens eine Regel kann aufgrund von ungueltigen Aktionen
' oder Bedingungen nicht gespeichert werden." - schon hier, nicht erst bei Rules.Save. Ausschalten prueft nichts.
Public Property Let Enabled(ByVal v As Boolean)
    AtSchreib "Rule.Enabled " & mName & " = " & IIf(v, "Ja", "Nein")
    If v Then
        If mAkt.OrdnerFehlt() Then Err.Raise AT_OL_UNGUELTIG_NR, "Microsoft Outlook", AtOlUngueltig()
        If gAtFehlerEinschalten <> "" And mName = gAtFehlerEinschalten Then
            Err.Raise AT_OL_UNGUELTIG_NR, "Microsoft Outlook", AtOlUngueltig()
        End If
    End If
    mAktiv = v
End Property

Public Property Get ExecutionOrder() As Long
    LeseFehlerPruefen "ExecutionOrder"
    ExecutionOrder = mOrder
End Property

Public Property Let ExecutionOrder(ByVal v As Long)
    AtSchreib "Rule.ExecutionOrder " & mName & " = " & v
    mEltern.Umordnen Me, v
End Property

Public Property Get OrderIntern() As Long
    OrderIntern = mOrder
End Property

Public Property Let OrderIntern(ByVal v As Long)
    mOrder = v
End Property

Public Property Get IsLocalRule() As Boolean
    LeseFehlerPruefen "IsLocalRule"
    IsLocalRule = mLokal
End Property

Public Property Let LokalIntern(ByVal v As Boolean)
    mLokal = v
End Property

Public Property Let AktivIntern(ByVal v As Boolean)
    mAktiv = v
End Property

Public Property Let NameIntern(ByVal v As String)
    mName = v
End Property

Public Property Get RuleType() As Long
    LeseFehlerPruefen "RuleType"
    RuleType = mTyp
End Property

Public Property Get Conditions() As Object
    If BedFehler Then Err.Raise 5221, "Attrappe", "Zugriff auf die Bedingungen verweigert (Attrappe)"
    Set Conditions = mBed
End Property

Public Property Get Exceptions() As Object
    Set Exceptions = mAus
End Property

Public Property Get Actions() As Object
    Set Actions = mAkt
End Property

Public Property Get BedIntern() As Object
    Set BedIntern = mBed
End Property

' Wie Outlook beim Speichern: aktive Aktion ohne Ziel bzw. ohne aufgeloeste Empfaenger, keine aktive Aktion
Public Function Unvollstaendig() As String
    Unvollstaendig = mAkt.Unvollstaendig()
    If Unvollstaendig = "" Then Unvollstaendig = mBed.Unvollstaendig()
    If Unvollstaendig = "" Then Unvollstaendig = mAus.Unvollstaendig()
End Function

' Alle Bedingungen ausschalten (Schalter "verlust" beim Speichern)
Public Sub BedingungenVerlieren()
    Dim t As Long, c As Object
    For t = 0 To 31
        Set c = mBed.Typ(t)
        c.AktivIntern = False
    Next t
End Sub

Public Property Get AusIntern() As Object
    Set AusIntern = mAus
End Property

' Alle Ausnahmen ausschalten (Schalter "ausverlust" beim Speichern)
Public Sub AusnahmenVerlieren()
    Dim t As Long, c As Object
    For t = 0 To 31
        Set c = mAus.Typ(t)
        c.AktivIntern = False
    Next t
End Sub

Public Function Klon(ByVal eltern As Object) As Object
    Dim n As Object
    Set n = New clsAtRegel
    n.Init eltern, mName, mTyp
    n.AktivIntern = mAktiv
    n.LokalIntern = mLokal
    n.OrderIntern = mOrder
    n.BedFehler = BedFehler
    n.LeseFehler = LeseFehler
    n.Uebernehmen mBed.Klon(), mAus.Klon(), mAkt.Klon()
    Set Klon = n
End Function

Public Sub Uebernehmen(ByVal b As Object, ByVal a As Object, ByVal k As Object)
    Set mBed = b
    Set mAus = a
    Set mAkt = k
End Sub
