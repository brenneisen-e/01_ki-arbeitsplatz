Option Explicit
' Attrappe Recipients (nur Testvariante)
Private mItems() As Object
Private mAnz As Long

Public Sub Init()
    mAnz = 0
    ReDim mItems(0 To 0)
End Sub

Public Property Get Count() As Long
    Count = mAnz
End Property

Public Function Item(ByVal i As Variant) As Object
    If i < 1 Or i > mAnz Then Err.Raise 5260, "Attrappe", "Index außerhalb der Empfänger"
    Set Item = mItems(i)
End Function

Public Function Add(ByVal eingabe As String) As Object
    AtSchreib "Recipients.Add " & eingabe
    ' Schalter "addverlust": dieser Empfaenger geht beim Hinzufuegen still verloren
    If gAtAddVerlust <> "" And LCase(eingabe) = LCase(gAtAddVerlust) Then
        Set Add = New clsAtEmpf
        Exit Function
    End If
    Set Add = Neu(eingabe)
End Function

Public Function Neu(ByVal eingabe As String) As Object
    Dim r As Object
    Set r = New clsAtEmpf
    r.Init eingabe
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = r
    Set Neu = r
End Function

Public Sub Remove(ByVal i As Variant)
    AtSchreib "Recipients.Remove"
    Err.Raise 5261, "Attrappe", "Remove wird vom Makro nie benutzt"
End Sub

Public Function ResolveAll() As Boolean
    Dim k As Long, ok As Boolean
    ok = True
    ' wie Outlook: bereits aufgeloeste Empfaenger bleiben, wie sie sind
    For k = 1 To mAnz
        If Not mItems(k).Resolved Then
            If Not mItems(k).Resolve() Then ok = False
        End If
    Next k
    ResolveAll = ok
End Function

Public Function AlleAufgeloest() As Boolean
    Dim k As Long
    AlleAufgeloest = True
    For k = 1 To mAnz
        If Not mItems(k).Resolved Then AlleAufgeloest = False
    Next k
End Function

Public Sub Hinzu(ByVal r As Object)
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = r
End Sub

Public Function Klon() As Object
    Dim n As Object, k As Long
    Set n = New clsAtEmpfListe
    n.Init
    For k = 1 To mAnz
        n.Hinzu mItems(k).Klon()
    Next k
    Set Klon = n
End Function

Public Function Bericht() As String
    Dim k As Long, s As String
    For k = 1 To mAnz
        s = s & IIf(s = "", "", "; ") & mItems(k).Name
    Next k
    Bericht = s
End Function
