Option Explicit
' ============================================================================
' modDialog - Rueckfragen und Meldungen. Die Testvariante ersetzt dieses Modul durch vorgegebene Antworten.
' ============================================================================

' Ja/Nein-Frage; vorausgewaehlt ist "Nein" (bei vorgabeJa "Ja", nur fuer die empfohlene Deaktivierung).
Public Function Frage(ByVal text As String, ByVal titel As String, Optional ByVal vorgabeJa As Boolean = False) As Boolean
    If vorgabeJa Then
        Frage = (MsgBox(text, vbYesNo + vbExclamation + vbDefaultButton1, titel) = vbYes)
    Else
        Frage = (MsgBox(text, vbYesNo + vbQuestion + vbDefaultButton2, titel) = vbYes)
    End If
End Function

Public Sub Hinweis(ByVal text As String, ByVal titel As String, ByVal warnung As Boolean)
    If warnung Then
        MsgBox text, vbExclamation, titel
    Else
        MsgBox text, vbInformation, titel
    End If
End Sub
