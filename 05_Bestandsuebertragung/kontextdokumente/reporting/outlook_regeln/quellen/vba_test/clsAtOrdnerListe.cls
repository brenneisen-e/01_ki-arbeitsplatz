Option Explicit
' Attrappe Folders: Item(Name oder Index), Add (zaehlt als Schreibzugriff; schon vergebener Name: Fehler wie Outlook),
' intern Neu/Hinzu/Entfernen fuer Aufbau und Verschieben (nur Testvariante)
Private mEltern As Object
Private mItems() As Object
Private mAnz As Long

Public Sub Init(ByVal eltern As Object)
    Set mEltern = eltern
    mAnz = 0
    ReDim mItems(0 To 0)
End Sub

Public Property Get Count() As Long
    Count = mAnz
End Property

Public Function Item(ByVal i As Variant) As Object
    Dim k As Long
    If VarType(i) = vbString Then
        For k = 1 To mAnz
            If LCase(mItems(k).Name) = LCase(i) Then
                Set Item = mItems(k)
                Exit Function
            End If
        Next k
        Err.Raise 5202, "Attrappe", "Ordner nicht gefunden: " & i
    End If
    If i < 1 Or i > mAnz Then Err.Raise 5203, "Attrappe", "Index außerhalb der Ordnerliste"
    Set Item = mItems(i)
End Function

Public Function Add(ByVal ordnerName As String, Optional ByVal typ As Variant) As Object
    AtSchreib "Folders.Add " & mEltern.FolderPath & "\" & ordnerName
    gAtOrdnerAdd = gAtOrdnerAdd + 1
    If gAtFehlerOrdner Then Err.Raise 5204, "Attrappe", "Ordner kann nicht angelegt werden (Attrappe)"
    If HatAnderen(ordnerName, Nothing) Then
        Err.Raise 5207, "Microsoft Outlook", "Ein Ordner mit diesem Namen ist bereits vorhanden."
    End If
    Set Add = Neu(ordnerName)
End Function

Public Function Neu(ByVal ordnerName As String) As Object
    Dim f As Object
    Set f = New clsAtOrdner
    f.Init ordnerName, ""
    f.ElternSetzen mEltern
    Hinzu f
    Set Neu = f
End Function

Public Sub Hinzu(ByVal f As Object)
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = f
End Sub

Public Sub Entfernen(ByVal f As Object)
    Dim k As Long, j As Long
    For k = 1 To mAnz
        If mItems(k) Is f Then
            For j = k To mAnz - 1
                Set mItems(j) = mItems(j + 1)
            Next j
            mAnz = mAnz - 1
            ReDim Preserve mItems(0 To mAnz)
            Exit Sub
        End If
    Next k
End Sub

' Gibt es ausser "ausser" einen Ordner dieses Namens (ohne Gross-/Kleinschreibung)?
Public Function HatAnderen(ByVal nm As String, ByVal ausser As Object) As Boolean
    Dim k As Long
    For k = 1 To mAnz
        If Not mItems(k) Is ausser Then
            If LCase(Trim(mItems(k).Name)) = LCase(Trim(nm)) Then
                HatAnderen = True
                Exit Function
            End If
        End If
    Next k
End Function
