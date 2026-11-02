Option Explicit
' ============================================================================
' modOlZugang - Zugang zu Outlook (spaete Bindung, keine Verweise noetig).
'
' Die Testvariante der Mappe ersetzt dieses Modul durch eines, das die Outlook-Attrappe liefert
' (quellen/vba_test/modOlZugang.bas). Hier steht deshalb nichts ausser dem Zugang selbst.
' ============================================================================

' Laufendes Outlook verwenden, sonst starten. Nothing, wenn Outlook nicht verfuegbar ist.
Public Function OutlookHolen() As Object
    Dim ol As Object
    On Error Resume Next
    Set ol = GetObject(, "Outlook.Application")
    If ol Is Nothing Then
        Err.Clear
        Set ol = CreateObject("Outlook.Application")
    End If
    On Error GoTo 0
    Set OutlookHolen = ol
End Function

' RuleActions.Stop ("Keine weiteren Regeln anwenden"). Eigene Funktion, weil LibreOffice in einem Klassenmodul
' keine Eigenschaft namens Stop zulaesst - die Attrappe nennt sie anders.
Public Function AktionStop(ByVal acts As Object) As Object
    Set AktionStop = acts.Stop
End Function
