Option Explicit
' Attrappe einer Aktion (RuleAction, MoveOrCopyRuleAction, SendRuleAction, ...) (nur Testvariante)
Private mTyp As Long
Private mAktiv As Boolean
Private mOrdner As Object
Private mEmpf As Object
Private mKat As Variant

Public Sub Init(ByVal t As Long)
    mTyp = t
    Set mEmpf = New clsAtEmpfListe
    mEmpf.Init
End Sub

Public Property Get ActionType() As Long
    ActionType = mTyp
End Property

Public Property Get Enabled() As Boolean
    Enabled = mAktiv
End Property

Public Property Let Enabled(ByVal v As Boolean)
    AtSchreib "Action(" & mTyp & ").Enabled = " & IIf(v, "Ja", "Nein")
    mAktiv = v
End Property

Public Property Let AktivIntern(ByVal v As Boolean)
    mAktiv = v
End Property

Public Property Get Folder() As Object
    Set Folder = mOrdner
End Property

' Schalter "nurlet": wie ein Objektmodell, das .Folder nur als Wert (PROPERTYPUT, Microsofts Beispiel ohne Set)
' annimmt - Set scheitert mit 438, der Weg ueber CallByName/VbLet muss greifen.
Public Property Set Folder(ByVal f As Object)
    If gAtNurLet Then Err.Raise 438, "Attrappe", "Objekt unterstützt diese Eigenschaft oder Methode nicht (Set)"
    AtSchreib "Action(" & mTyp & ").Folder = " & f.FolderPath
    If gAtFehlerOrdnerZuweisen Then Err.Raise 5250, "Attrappe", "Ordner kann nicht zugewiesen werden (Attrappe)"
    Set mOrdner = f
End Property

Public Property Let Folder(ByVal f As Object)
    AtSchreib "Action(" & mTyp & ").Folder (Let) = " & f.FolderPath
    If gAtFehlerOrdnerZuweisen Then Err.Raise 5250, "Attrappe", "Ordner kann nicht zugewiesen werden (Attrappe)"
    gAtLetZuweisungen = gAtLetZuweisungen + 1
    Set mOrdner = f
End Property

Public Sub OrdnerIntern(ByVal f As Object)
    Set mOrdner = f
End Sub

Public Property Get Recipients() As Object
    Set Recipients = mEmpf
End Property

Public Sub EmpfaengerSetzen(ByVal e As Object)
    Set mEmpf = e
End Sub

Public Property Get Categories() As Variant
    Categories = mKat
End Property

Public Property Let Categories(ByVal v As Variant)
    AtSchreib "Action(" & mTyp & ").Categories"
    mKat = v
End Property

Public Property Let KatIntern(ByVal v As Variant)
    mKat = v
End Property

Public Function Bericht() As String
    Dim s As String
    If Not mOrdner Is Nothing Then s = mOrdner.FolderPath
    If mEmpf.Count > 0 Then s = s & mEmpf.Bericht()
    If s <> "" Then Bericht = "=" & s
End Function

Public Function Klon() As Object
    Dim n As Object
    Set n = New clsAtAkt
    n.Init mTyp
    n.AktivIntern = mAktiv
    n.OrdnerIntern mOrdner
    n.EmpfaengerSetzen mEmpf.Klon()
    n.KatIntern = mKat
    Set Klon = n
End Function
