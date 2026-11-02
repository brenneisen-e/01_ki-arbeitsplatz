Option Explicit
' ============================================================================
' modNav - Navigation und Lesehilfen
'
' Lange Texte (Mailtext, Checklisten, Herleitungen) stehen in Zeilen fester, maessiger Hoehe mit Umbruch.
' - Doppelklick auf eine Zeile (in Formelzellen der operativen Blaetter, auf den Herleitungsblaettern ueberall)
'   klappt die Zeile auf volle Hoehe auf und wieder zu.
' - Knopf "Volltext ein/aus" klappt alle Datenzeilen des Blatts auf bzw. zurueck auf die kompakte Hoehe.
' Die kompakte Hoehe steht je Blatt im blattlokalen Namen "Kompakthoehe" (vom Build gesetzt).
' ============================================================================

Public Function NavVersion() As String
    NavVersion = "Navigation 1.1"
End Function

Public Sub ZurUebersicht()
    On Error Resume Next
    ThisWorkbook.Worksheets("Start & Übersicht").Activate
    ActiveWindow.ScrollRow = 1
End Sub

Private Function KompaktHoehe(ws As Object) As Double
    Dim s As String
    On Error Resume Next
    s = ws.Names("Kompakthoehe").RefersTo
    On Error GoTo 0
    KompaktHoehe = Val(Replace(s, "=", ""))
    If KompaktHoehe < 15 Then KompaktHoehe = 46
End Function

Private Function IstHerleitung(ws As Object) As Boolean
    Select Case ws.Name
        Case "BE Übersicht", "Testfall-Matrix", "Agenturkonstellationen", "Vertragskonstellationen", "Mailanforderungen"
            IstHerleitung = True
    End Select
End Function

Private Sub ZeileUmschalten(zeile As Object, h As Double)
    If zeile.RowHeight > h + 1 Then
        zeile.RowHeight = h
    Else
        zeile.EntireRow.AutoFit
        If zeile.RowHeight < h Then zeile.RowHeight = h
    End If
End Sub

Public Sub DoppelklickZeile(Target As Object, Cancel As Boolean)
    Dim ws As Object, lo As Object, imBereich As Boolean
    On Error GoTo Ende
    If Target.Cells.Count <> 1 Then Exit Sub
    Set ws = Target.Worksheet
    For Each lo In ws.ListObjects
        If Not lo.DataBodyRange Is Nothing Then
            If Not Application.Intersect(Target, lo.DataBodyRange) Is Nothing Then imBereich = True
        End If
    Next lo
    If Not imBereich Then Exit Sub
    If Not (Target.HasFormula Or IstHerleitung(ws)) Then Exit Sub
    Cancel = True
    ZeileUmschalten Target.EntireRow, KompaktHoehe(ws)
Ende:
End Sub

' Nur sichtbare Zeilen: eine vom AutoFilter ausgeblendete Zeile meldet die Hoehe 0 und wuerde durch das Setzen einer
' Hoehe wieder sichtbar.
Public Sub VolltextUmschalten()
    Dim ws As Object, lo As Object, r As Object, h As Double, offen As Boolean
    On Error GoTo Ende
    Set ws = ActiveSheet
    If ws.ListObjects.Count = 0 Then Exit Sub
    h = KompaktHoehe(ws)
    For Each lo In ws.ListObjects
        If Not lo.DataBodyRange Is Nothing Then
            For Each r In lo.DataBodyRange.Rows
                If Not r.EntireRow.Hidden Then
                    If r.RowHeight > h + 1 Then offen = True: Exit For
                End If
            Next r
        End If
        If offen Then Exit For
    Next lo
    Application.ScreenUpdating = False
    For Each lo In ws.ListObjects
        If Not lo.DataBodyRange Is Nothing Then
            For Each r In lo.DataBodyRange.Rows
                If Not r.EntireRow.Hidden Then
                    If offen Then
                        r.RowHeight = h
                    Else
                        r.EntireRow.AutoFit
                        If r.RowHeight < h Then r.RowHeight = h
                    End If
                End If
            Next r
        End If
    Next lo
Ende:
    Application.ScreenUpdating = True
End Sub
