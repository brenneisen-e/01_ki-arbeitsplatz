Option Explicit
' Attrappe RuleConditions: je Typ 0..31 ein Eintrag. Benannte Eigenschaften mit den Namen aus Microsoft Learn
' (u. a. SenderInAddressList, OnLocalMachine). Count/Item wie in echtem Outlook laut Export-Diagnose: immer die 31
' Typen 1..31 in einer festen, nicht sortierten Reihenfolge; Typ 0 (unbekannt) nur, wenn mit Sichtbar freigeschaltet.
' Verstecken nimmt einen Typ aus dem Index-Durchlauf (nur die benannte Eigenschaft sieht ihn). (nur Testvariante)
Private mItems() As Object
Private mDa() As Boolean
Private mReihe As Variant

Public Sub Init()
    Dim t As Long
    ReDim mItems(0 To 31)
    ReDim mDa(0 To 31)
    For t = 0 To 31
        Set mItems(t) = New clsAtBed
        mItems(t).Init t
        mDa(t) = (t > 0)
    Next t
    mReihe = Array(4, 26, 9, 20, 11, 5, 10, 6, 3, 18, 13, 14, 15, 16, 17, 2, 23, 1, 12, 25, 27, 7, 8, 19, 21, 22, 24, 28, 29, 31, 30, 0)
End Sub

Public Sub Sichtbar(ByVal t As Long)
    mDa(t) = True
End Sub

Public Sub Verstecken(ByVal t As Long)
    mDa(t) = False
End Sub

Public Function IstDa(ByVal t As Long) As Boolean
    IstDa = mDa(t)
End Function

Public Property Get Count() As Long
    Dim t As Long, n As Long
    For t = 0 To 31
        If mDa(t) Then n = n + 1
    Next t
    Count = n
End Property

Public Function Item(ByVal i As Variant) As Object
    Dim k As Long, n As Long, t As Long
    For k = LBound(mReihe) To UBound(mReihe)
        t = mReihe(k)
        If mDa(t) Then
            n = n + 1
            If n = i Then
                Set Item = mItems(t)
                Exit Function
            End If
        End If
    Next k
    Err.Raise 5230, "Attrappe", "Index außerhalb der Bedingungen"
End Function

Public Function Typ(ByVal t As Long) As Object
    Set Typ = mItems(t)
End Function
Public Property Get From() As Object
    Set From = mItems(1)
End Property
Public Property Get Subject() As Object
    Set Subject = mItems(2)
End Property
Public Property Get Account() As Object
    Set Account = mItems(3)
End Property
Public Property Get OnlyToMe() As Object
    Set OnlyToMe = mItems(4)
End Property
Public Property Get ToMe() As Object
    Set ToMe = mItems(5)
End Property
Public Property Get Importance() As Object
    Set Importance = mItems(6)
End Property
Public Property Get CC() As Object
    Set CC = mItems(9)
End Property
Public Property Get ToOrCc() As Object
    Set ToOrCc = mItems(10)
End Property
Public Property Get NotTo() As Object
    Set NotTo = mItems(11)
End Property
Public Property Get SentTo() As Object
    Set SentTo = mItems(12)
End Property
Public Property Get Body() As Object
    Set Body = mItems(13)
End Property
Public Property Get BodyOrSubject() As Object
    Set BodyOrSubject = mItems(14)
End Property
Public Property Get MessageHeader() As Object
    Set MessageHeader = mItems(15)
End Property
Public Property Get RecipientAddress() As Object
    Set RecipientAddress = mItems(16)
End Property
Public Property Get SenderAddress() As Object
    Set SenderAddress = mItems(17)
End Property
Public Property Get Category() As Object
    Set Category = mItems(18)
End Property
Public Property Get HasAttachment() As Object
    Set HasAttachment = mItems(20)
End Property
Public Property Get FormName() As Object
    Set FormName = mItems(23)
End Property
Public Property Get SenderInAddressList() As Object
    Set SenderInAddressList = mItems(25)
End Property
Public Property Get MeetingInviteOrUpdate() As Object
    Set MeetingInviteOrUpdate = mItems(26)
End Property
Public Property Get OnLocalMachine() As Object
    Set OnLocalMachine = mItems(27)
End Property
Public Property Get OnOtherMachine() As Object
    Set OnOtherMachine = mItems(28)
End Property
Public Property Get AnyCategory() As Object
    Set AnyCategory = mItems(29)
End Property
Public Property Get FromRssFeed() As Object
    Set FromRssFeed = mItems(30)
End Property
Public Property Get FromAnyRSSFeed() As Object
    Set FromAnyRSSFeed = mItems(31)
End Property

Public Function Unvollstaendig() As String
    Dim t As Long
    For t = 0 To 31
        If mItems(t).Enabled Then
            If t = 1 Or t = 12 Then
                If mItems(t).Recipients.Count = 0 Then Unvollstaendig = "Bedingung ohne Empfänger"
                If Not mItems(t).Recipients.AlleAufgeloest() Then Unvollstaendig = "Empfänger nicht aufgelöst"
            End If
        End If
    Next t
End Function

Public Function Klon() As Object
    Dim n As Object, t As Long
    Set n = New clsAtBedListe
    n.Init
    For t = 0 To 31
        If mDa(t) Then
            n.Sichtbar t
        Else
            n.Verstecken t
        End If
        n.Ersetzen t, mItems(t).Klon()
    Next t
    Set Klon = n
End Function

Public Sub Ersetzen(ByVal t As Long, ByVal b As Object)
    Set mItems(t) = b
End Sub

' Kurzform fuer den Zustandsbericht: "1=a; b|20"
Public Function Bericht() As String
    Dim t As Long, s As String
    For t = 0 To 31
        If mItems(t).Enabled Then s = s & IIf(s = "", "", "|") & t & mItems(t).Bericht()
    Next t
    Bericht = s
End Function
