Option Explicit
' Attrappe Store. GetRules liefert eine Kopie des gespeicherten Stands (wie Outlook: neues Rules-Objekt),
' Save der Kopie uebernimmt sie (Uebernehmen). Ordner sind sofort da (wie in Outlook). (nur Testvariante)
Public DisplayName As String
Public RootFehler As Boolean
Public SaveFehler As Boolean
Private mWurzel As Object
Private mRegeln As Object

Public Sub Init(ByVal adresse As String)
    DisplayName = adresse
    Set mWurzel = New clsAtOrdner
    mWurzel.Init adresse, "\\" & adresse
    Set mRegeln = New clsAtRegeln
    mRegeln.Init Me
End Sub

Public Function GetRootFolder() As Object
    If RootFehler Then Err.Raise 5201, "Attrappe", "Stammordner nicht verfügbar"
    Set GetRootFolder = mWurzel
End Function

Public Function GetRules() As Object
    gAtGetRules = gAtGetRules + 1
    Set GetRules = mRegeln.Klon(Me)
End Function

Public Property Get Gespeichert() As Object
    Set Gespeichert = mRegeln
End Property

Public Property Get Wurzel() As Object
    Set Wurzel = mWurzel
End Property

Public Sub Uebernehmen(ByVal r As Object)
    Set mRegeln = r.Klon(Me)
End Sub
