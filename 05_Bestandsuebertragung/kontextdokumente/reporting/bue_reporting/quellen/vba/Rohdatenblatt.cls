Option Explicit
' Blattmodul Rohdatenblatt: beim ersten Aufruf je Sitzung zur aktuellen Woche springen (Vorwoche links, damit das Delta zur
' aktuellen Woche sichtbar ist). Danach bleibt die Position, wie der Nutzer sie verlaesst.
Private gesprungen As Boolean

Private Sub Worksheet_Activate()
    Dim c As Long, letzte As Long, ziel As Long
    If gesprungen Then Exit Sub
    On Error GoTo Ende
    letzte = Me.Cells(1, Me.Columns.Count).End(xlToLeft).Column
    ziel = 0
    For c = 9 To letzte Step 2
        If IsDate(Me.Cells(1, c).Value) Then
            If CDate(Me.Cells(1, c).Value) >= Date - 6 Then ziel = c: Exit For
        End If
    Next c
    If ziel > 0 Then ActiveWindow.ScrollColumn = IIf(ziel - 2 < 9, 9, ziel - 2)
    gesprungen = True
Ende:
End Sub
