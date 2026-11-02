Option Explicit

Private Sub Worksheet_BeforeDoubleClick(ByVal Target As Range, Cancel As Boolean)
    modNav.DoppelklickZeile Target, Cancel
End Sub
