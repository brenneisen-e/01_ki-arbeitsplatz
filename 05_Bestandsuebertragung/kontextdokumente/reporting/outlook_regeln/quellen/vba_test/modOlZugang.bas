Option Explicit
' ============================================================================
' TESTVARIANTE von modOlZugang: liefert die Outlook-Attrappe (modAttrappe) statt Outlook.
' Nur in Regeln_Umbau_Test.xlsm; die Produktivdatei enthaelt quellen/vba/modOlZugang.bas.
' ============================================================================

Public Function OutlookHolen() As Object
    If gAtOhneOutlook Then Exit Function
    Set OutlookHolen = gAtApp
End Function

' In der Attrappe heisst RuleActions.Stop "Halt" (LibreOffice laesst keinen Klassenmember Stop zu).
Public Function AktionStop(ByVal acts As Object) As Object
    Set AktionStop = acts.Halt
End Function
