Option Explicit
' Attrappe Outlook.Application (nur Testvariante)
Private mNs As Object

Public Property Get Session() As Object
    If mNs Is Nothing Then Set mNs = New clsAtNs
    Set Session = mNs
End Property
