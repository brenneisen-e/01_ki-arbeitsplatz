Option Explicit
' Einfache Liste mit Count/Item (Stores) (nur Testvariante)
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
    If i < 1 Or i > mAnz Then Err.Raise 5200, "Attrappe", "Index außerhalb der Liste"
    Set Item = mItems(i)
End Function

Public Sub Hinzu(ByVal o As Object)
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = o
End Sub
