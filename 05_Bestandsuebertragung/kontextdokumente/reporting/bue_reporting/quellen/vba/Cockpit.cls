Option Explicit
' Blattmodul Cockpit: Der Hyperlink eines Chips zeigt auf Spalte A (oder H) der Chipzeile; dort steht in Spalte A die
' Chip-Nummer (1..99 Themenpostkoerbe, 101..114 GeVo-Typen, 201..204 Sparten, 301..306 Einheiten). Der Auswahlwechsel schaltet den Chip, danach wandert die
' Auswahl per OnTime auf H1, damit der naechste Klick wieder ein Auswahlwechsel ist.
Private Sub Worksheet_SelectionChange(ByVal Target As Range)
    Dim nr As Long, col As Long
    On Error GoTo Ende
    col = Target.Cells(1, 1).Column
    If col <> 1 And col <> 8 Then Exit Sub
    nr = CLng(Val(Me.Cells(Target.Cells(1, 1).Row, 1).Value))
    If nr <= 0 Then Exit Sub
    modCockpit.ChipSchalten nr
    modCockpit.AuswahlWegPlanen
Ende:
End Sub

Private Sub Worksheet_Change(ByVal Target As Range)
    ' Bezugstag in L12 per Auswahlliste geaendert: Diagramme nachziehen
    On Error GoTo Ende
    If Not Intersect(Target, Me.Range("L12")) Is Nothing Then
        ' geleert (Entf): wieder "neuester Stand" als Formel
        If IsEmpty(Me.Range("L12").Value) Then modCockpit.BezugFormelSetzen
        modCockpit.AktualisierungPlanen
    End If
Ende:
End Sub
