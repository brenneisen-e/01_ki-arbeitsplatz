Option Explicit
' Attrappe Folder (nur Testvariante). Wie Outlook: FolderPath ergibt sich aus den Elternordnern (nach einem
' Verschieben also der neue Pfad), die EntryID bleibt beim Verschieben im selben Postfach gleich - Regeln halten den
' Ordner selbst und zeigen danach auf den neuen Pfad. Name setzen und MoveTo zaehlen als Schreibzugriff; ein schon
' vergebener Name im Zielordner wirft wie Outlook einen Fehler. Schalter "eidwechsel": MoveTo vergibt neue EntryIDs
' und die Regeln verlieren den Ordner (wie ein Outlook, in dem die Regel nach dem Verschieben ins Leere zeigt).
Private mName As String
Private mWurzelPfad As String
Private mEltern As Object
Private mKinder As Object
Private mEid As String

' Wurzel: pfad = "\\adresse"; sonst ergibt sich der Pfad aus den Eltern (ElternSetzen)
Public Sub Init(ByVal ordnerName As String, ByVal pfad As String)
    mName = ordnerName
    mWurzelPfad = pfad
    mEid = AtEidNeu()
    Set mKinder = New clsAtOrdnerListe
    mKinder.Init Me
End Sub

Public Sub ElternSetzen(ByVal e As Object)
    Set mEltern = e
End Sub

Public Property Get Eltern() As Object
    Set Eltern = mEltern
End Property

Public Property Get Name() As String
    Name = mName
End Property

Public Property Let Name(ByVal v As String)
    AtSchreib "Folder.Name " & FolderPath & " -> " & v
    gAtOrdnerName = gAtOrdnerName + 1
    If gAtFehlerUmbenennen <> "" And LCase(mName) = LCase(gAtFehlerUmbenennen) Then
        Err.Raise 5206, "Attrappe", "Ordner kann nicht umbenannt werden (Attrappe)"
    End If
    If Not mEltern Is Nothing Then
        If mEltern.Folders.HatAnderen(v, Me) Then
            Err.Raise 5207, "Microsoft Outlook", "Ein Ordner mit diesem Namen ist bereits vorhanden."
        End If
    End If
    mName = v
End Property

Public Property Let NameIntern(ByVal v As String)
    mName = v
End Property

Public Property Get FolderPath() As String
    If mEltern Is Nothing Then
        FolderPath = mWurzelPfad
    Else
        FolderPath = mEltern.FolderPath & "\" & Replace(mName, "/", "%2F")
    End If
End Property

Public Property Get EntryID() As String
    EntryID = mEid
End Property

Public Sub EidErneuern()
    Dim i As Long
    mEid = AtEidNeu()
    For i = 1 To mKinder.Count
        mKinder.Item(i).EidErneuern
    Next i
End Sub

Public Property Get Folders() As Object
    Set Folders = mKinder
End Property

Public Sub MoveTo(ByVal ziel As Object)
    Dim p As Object
    AtSchreib "Folder.MoveTo " & FolderPath & " -> " & ziel.FolderPath
    gAtOrdnerMove = gAtOrdnerMove + 1
    If gAtFehlerVerschieben <> "" And LCase(mName) = LCase(gAtFehlerVerschieben) Then
        Err.Raise 5208, "Attrappe", "Ordner kann nicht verschoben werden (Attrappe)"
    End If
    If mEltern Is Nothing Then Err.Raise 5209, "Attrappe", "Stammordner kann nicht verschoben werden"
    Set p = ziel
    Do While Not p Is Nothing
        If p Is Me Then Err.Raise 5209, "Microsoft Outlook", "Der Ordner kann nicht in sich selbst verschoben werden."
        Set p = p.Eltern
    Loop
    If ziel.Folders.HatAnderen(mName, Me) Then
        Err.Raise 5207, "Microsoft Outlook", "Ein Ordner mit diesem Namen ist bereits vorhanden."
    End If
    mEltern.Folders.Entfernen Me
    ziel.Folders.Hinzu Me
    Set mEltern = ziel
    If gAtEidWechsel Then AtEidWechselNach Me
End Sub
