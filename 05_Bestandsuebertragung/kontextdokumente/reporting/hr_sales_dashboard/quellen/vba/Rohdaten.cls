Option Explicit

' Beim ersten Aufruf je Sitzung zur Spalte des Berichtstags springen (nicht, wenn der Assistent fuehrt)
Private schonGezeigt As Boolean

' Assistent: Zahl direkt in die markierte Zelle tippen und Enter – uebernimmt den Wert wie „Übernehmen“ (kein Klick noetig)
Private Sub Worksheet_Change(ByVal Target As Range)
    If Not modStart.AssistentAktiv() Then Exit Sub
    modStart.ZellEingabe Target
End Sub

Private Sub Worksheet_Activate()
    If schonGezeigt Then Exit Sub
    schonGezeigt = True
    If modStart.AssistentAktiv() Then Exit Sub
    On Error Resume Next
    modStart.ZurBerichtsspalte
End Sub
