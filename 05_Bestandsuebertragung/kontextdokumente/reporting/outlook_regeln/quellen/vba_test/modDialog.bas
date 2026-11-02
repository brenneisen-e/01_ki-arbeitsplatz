Option Explicit
' ============================================================================
' TESTVARIANTE von modDialog: Antworten kommen aus gDlgAntworten (je Frage ein Zeichen J/N), alle Texte
' landen in gDlgLog (mit der Vorgabe der echten MsgBox). Ohne vorgegebene Antwort gilt "Nein".
' ============================================================================

Public gDlgAntworten As String
Public gDlgLog As String

Public Function Frage(ByVal text As String, ByVal titel As String, Optional ByVal vorgabeJa As Boolean = False) As Boolean
    Dim a As String
    a = Left(gDlgAntworten, 1)
    If Len(gDlgAntworten) > 0 Then gDlgAntworten = Mid(gDlgAntworten, 2)
    gDlgLog = gDlgLog & "FRAGE [" & titel & "] (Vorgabe " & IIf(vorgabeJa, "Ja", "Nein") & ") -> " & _
              IIf(a = "J", "Ja", "Nein") & vbLf & text & vbLf & "----" & vbLf
    ' Schalter "beifrage": Stand in der Attrappe aendern, waehrend die Rueckfrage offen ist
    AtBeiFrage
    Frage = (a = "J")
End Function

Public Sub Hinweis(ByVal text As String, ByVal titel As String, ByVal warnung As Boolean)
    gDlgLog = gDlgLog & "HINWEIS [" & titel & "]" & vbLf & text & vbLf & "----" & vbLf
End Sub
