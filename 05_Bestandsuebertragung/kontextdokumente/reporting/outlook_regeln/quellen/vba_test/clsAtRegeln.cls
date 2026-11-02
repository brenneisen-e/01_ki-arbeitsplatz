Option Explicit
' Attrappe Rules. Wie in Outlook (Microsoft Learn): Item(i) liefert die Regel mit ExecutionOrder i (Index =
' Ausfuehrungsreihenfolge), Create setzt die neue Regel auf Platz 1 und schiebt alle anderen um 1 nach hinten.
' Wie Outlook beim Setzen von ExecutionOrder umnummeriert, ist nicht belegt; die Attrappe kennt zwei Arten
' (gAtOrdnung): "einfuegen" (herausnehmen und einfuegen) und "tauschen" (die Regel auf dem Zielplatz bekommt den
' alten Platz). Save prueft wie Outlook auf unvollstaendige Regeln (Ordneraktion ohne Ordner: Outlooks Meldung, wie
' beim Einschalten einer Regel, clsAtRegel.Enabled); Schalter "verlust" laesst beim Speichern die
' Bedingungen einer Regel verschwinden (wie ein Outlook, das eine Bedingung nicht mitspeichert). (nur Testvariante)
Private mStore As Object
Private mItems() As Object
Private mAnz As Long

Public Sub Init(ByVal st As Object)
    Set mStore = st
    mAnz = 0
    ReDim mItems(0 To 0)
End Sub

Public Property Get Count() As Long
    Count = mAnz
End Property

Public Function Item(ByVal i As Variant) As Object
    Dim ids As Variant
    If i < 1 Or i > mAnz Then Err.Raise 5210, "Attrappe", "Index außerhalb der Regeln"
    ids = NachReihenfolge()
    Set Item = mItems(ids(i))
End Function

' Positionen in mItems, sortiert nach ExecutionOrder (stabil)
Private Function NachReihenfolge() As Variant
    Dim i As Long, j As Long, t As Long, ids() As Long
    ReDim ids(1 To mAnz)
    For i = 1 To mAnz
        ids(i) = i
    Next i
    For i = 2 To mAnz
        t = ids(i)
        j = i - 1
        Do While j >= 1
            If mItems(ids(j)).OrderIntern <= mItems(t).OrderIntern Then Exit Do
            ids(j + 1) = ids(j)
            j = j - 1
        Loop
        ids(j + 1) = t
    Next i
    NachReihenfolge = ids
End Function

Public Function Create(ByVal regelName As String, ByVal typ As Long) As Object
    Dim r As Object
    AtSchreib "Rules.Create " & regelName
    gAtCreate = gAtCreate + 1
    Set r = New clsAtRegel
    r.Init Me, regelName, typ
    Einreihen r, 1
    Set Create = r
End Function

' Regel aufnehmen und auf Platz p setzen (die anderen ruecken nach)
Public Sub Einreihen(ByVal r As Object, ByVal p As Long)
    Dim k As Long
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = r
    If p < 1 Or p > mAnz Then p = mAnz
    For k = 1 To mAnz - 1
        If mItems(k).OrderIntern >= p Then mItems(k).OrderIntern = mItems(k).OrderIntern + 1
    Next k
    r.OrderIntern = p
End Sub

Public Sub AnhaengenKlon(ByVal r As Object)
    mAnz = mAnz + 1
    ReDim Preserve mItems(0 To mAnz)
    Set mItems(mAnz) = r
End Sub

Public Sub Remove(ByVal i As Variant)
    AtSchreib "Rules.Remove " & i
    Err.Raise 5211, "Attrappe", "Remove wird vom Makro nie benutzt"
End Sub

Public Sub Umordnen(ByVal r As Object, ByVal p As Long)
    Dim k As Long, alt As Long, w As Long
    If p < 1 Then p = 1
    If p > mAnz Then p = mAnz
    alt = r.OrderIntern
    If gAtOrdnung = "tauschen" Then
        For k = 1 To mAnz
            If Not mItems(k) Is r Then
                If mItems(k).OrderIntern = p Then mItems(k).OrderIntern = alt
            End If
        Next k
        r.OrderIntern = p
        Exit Sub
    End If
    For k = 1 To mAnz
        If Not mItems(k) Is r Then
            w = mItems(k).OrderIntern
            If alt < p Then
                If w > alt And w <= p Then mItems(k).OrderIntern = w - 1
            Else
                If w >= p And w < alt Then mItems(k).OrderIntern = w + 1
            End If
        End If
    Next k
    r.OrderIntern = p
End Sub

Public Sub Save(Optional ByVal zeigen As Variant)
    Dim k As Long, grund As String
    AtSchreib "Rules.Save"
    gAtSaves = gAtSaves + 1
    If mStore.SaveFehler Then Err.Raise 5212, "Attrappe", "Die Regeln konnten nicht gespeichert werden (Attrappe)"
    ' Wie Outlook: eingeschaltete Verschieben-/Kopieren-Aktion ohne Ordner -> Outlooks Meldung (wie beim Einschalten)
    For k = 1 To mAnz
        If mItems(k).Actions.OrdnerFehlt() Then Err.Raise AT_OL_UNGUELTIG_NR, "Microsoft Outlook", AtOlUngueltig()
    Next k
    For k = 1 To mAnz
        grund = mItems(k).Unvollstaendig()
        If grund <> "" Then Err.Raise 5213, "Attrappe", "Regel " & mItems(k).Name & " unvollständig: " & grund
    Next k
    ' Schalter "verlust": Outlook verliert beim Speichern die Bedingungen dieser Regel
    If gAtVerlust <> "" Then
        For k = 1 To mAnz
            If mItems(k).Name = gAtVerlust Then mItems(k).BedingungenVerlieren
        Next k
    End If
    ' Schalter "ausverlust": Outlook verliert beim Speichern die Ausnahmen dieser Regel
    If gAtAusVerlust <> "" Then
        For k = 1 To mAnz
            If mItems(k).Name = gAtAusVerlust Then mItems(k).AusnahmenVerlieren
        Next k
    End If
    Durchnummerieren
    mStore.Uebernehmen Me
End Sub

' Wie Outlook beim Speichern: Reihenfolge 1..n ohne Luecken (bei gleichen Werten zaehlt die Anlage)
Public Sub Durchnummerieren()
    Dim i As Long, j As Long, ids() As Long, t As Long
    If mAnz = 0 Then Exit Sub
    ReDim ids(1 To mAnz)
    For i = 1 To mAnz
        ids(i) = i
    Next i
    For i = 2 To mAnz
        t = ids(i)
        j = i - 1
        Do While j >= 1
            If mItems(ids(j)).OrderIntern <= mItems(t).OrderIntern Then Exit Do
            ids(j + 1) = ids(j)
            j = j - 1
        Loop
        ids(j + 1) = t
    Next i
    For i = 1 To mAnz
        mItems(ids(i)).OrderIntern = i
    Next i
End Sub

Public Function Klon(ByVal st As Object) As Object
    Dim k As Long, n As Object
    Set n = New clsAtRegeln
    n.Init st
    For k = 1 To mAnz
        n.AnhaengenKlon mItems(k).Klon(n)
    Next k
    Set Klon = n
End Function

Public Function NachName(ByVal regelName As String) As Object
    Dim k As Long
    For k = 1 To mAnz
        If mItems(k).Name = regelName Then
            Set NachName = mItems(k)
            Exit Function
        End If
    Next k
End Function
