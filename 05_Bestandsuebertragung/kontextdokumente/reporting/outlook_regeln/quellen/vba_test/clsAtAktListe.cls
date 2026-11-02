Option Explicit
' Attrappe RuleActions. ActionType-Werte wie in Outlook; das Makro setzt sie nicht voraus, sondern liest sie
' von den benannten Aktionen. "Halt" steht fuer Outlooks "Stop" (LibreOffice erlaubt den Namen Stop nicht).
' Eintrag 10/11 sind Aktionen ohne benannte Eigenschaft im Makro (Serverantwort, Als gelesen markieren), Eintrag 12
' eine Aktion unbekannten Typs (0, olRuleActionUnknown). (nur Testvariante)
Private mItems() As Object

Public Sub Init()
    Dim k As Long, typen As Variant
    typen = Array(0, 1, 5, 6, 7, 8, 21, 2, 30, 24, 9, 19, 0)
    ReDim mItems(0 To 12)
    For k = 1 To 12
        Set mItems(k) = New clsAtAkt
        mItems(k).Init CLng(typen(k))
    Next k
End Sub

Public Property Get Count() As Long
    Count = 12
End Property

Public Function Item(ByVal i As Variant) As Object
    If i < 1 Or i > 12 Then Err.Raise 5240, "Attrappe", "Index außerhalb der Aktionen"
    Set Item = mItems(i)
End Function

Public Property Get MoveToFolder() As Object
    Set MoveToFolder = mItems(1)
End Property
Public Property Get CopyToFolder() As Object
    Set CopyToFolder = mItems(2)
End Property
Public Property Get Forward() As Object
    Set Forward = mItems(3)
End Property
Public Property Get ForwardAsAttachment() As Object
    Set ForwardAsAttachment = mItems(4)
End Property
Public Property Get Redirect() As Object
    Set Redirect = mItems(5)
End Property
Public Property Get Halt() As Object
    Set Halt = mItems(6)
End Property
Public Property Get AssignToCategory() As Object
    Set AssignToCategory = mItems(7)
End Property
Public Property Get ClearCategories() As Object
    Set ClearCategories = mItems(8)
End Property
Public Property Get DesktopAlert() As Object
    Set DesktopAlert = mItems(9)
End Property

Public Function Nr(ByVal k As Long) As Object
    Set Nr = mItems(k)
End Function

Public Sub Ersetzen(ByVal k As Long, ByVal a As Object)
    Set mItems(k) = a
End Sub

' Eingeschaltete Verschieben- oder Kopieren-Aktion ohne Zielordner (fuer Outlook eine ungueltige Aktion)
Public Function OrdnerFehlt() As Boolean
    Dim k As Long
    For k = 1 To 2
        If mItems(k).Enabled And mItems(k).Folder Is Nothing Then OrdnerFehlt = True
    Next k
End Function

Public Function Unvollstaendig() As String
    Dim k As Long, irgendeine As Boolean
    For k = 1 To 12
        If mItems(k).Enabled Then
            irgendeine = True
            If (k = 1 Or k = 2) And mItems(k).Folder Is Nothing Then Unvollstaendig = "Ordneraktion ohne Ordner"
            If k >= 3 And k <= 5 Then
                If mItems(k).Recipients.Count = 0 Then Unvollstaendig = "Weiterleitung ohne Empfänger"
                If Not mItems(k).Recipients.AlleAufgeloest() Then Unvollstaendig = "Empfänger nicht aufgelöst"
            End If
        End If
    Next k
    If Not irgendeine Then Unvollstaendig = "keine Aktion"
End Function

Public Function Klon() As Object
    Dim n As Object, k As Long
    Set n = New clsAtAktListe
    n.Init
    For k = 1 To 12
        n.Ersetzen k, mItems(k).Klon()
    Next k
    Set Klon = n
End Function

Public Function Bericht() As String
    Dim namen As Variant, k As Long, s As String
    namen = Array("", "MOVE", "COPY", "FWD", "FWDATT", "REDIR", "HALT", "CAT", "CLRCAT", "ALERT", "SRVREPLY", "MARKREAD", "UNBEKANNT")
    For k = 1 To 12
        If mItems(k).Enabled Then s = s & IIf(s = "", "", "|") & namen(k) & mItems(k).Bericht()
    Next k
    Bericht = s
End Function
