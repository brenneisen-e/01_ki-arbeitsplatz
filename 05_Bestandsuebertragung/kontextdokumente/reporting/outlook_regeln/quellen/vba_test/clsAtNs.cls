Option Explicit
' Attrappe NameSpace: Stores, CreateRecipient (nur Testvariante)
Private mStores As Object

Public Property Get Stores() As Object
    If mStores Is Nothing Then
        Set mStores = New clsAtListe
        mStores.Init
    End If
    Set Stores = mStores
End Property

Public Function CreateRecipient(ByVal eingabe As String) As Object
    Dim r As Object
    Set r = New clsAtEmpf
    r.Init eingabe
    Set CreateRecipient = r
End Function
