Option Explicit
' Attrappe einer Bedingung (RuleCondition und ihre Unterarten) (nur Testvariante)
Private mTyp As Long
Private mAktiv As Boolean
Private mText As Variant
Private mAdr As Variant
Private mWicht As Long
Private mKat As Variant
Private mForm As Variant
Private mEmpf As Object

Public Sub Init(ByVal t As Long)
    mTyp = t
    Set mEmpf = New clsAtEmpfListe
    mEmpf.Init
End Sub

Public Property Get ConditionType() As Long
    ConditionType = mTyp
End Property

Public Property Get Enabled() As Boolean
    Enabled = mAktiv
End Property

Public Property Let Enabled(ByVal v As Boolean)
    AtSchreib "Condition(" & mTyp & ").Enabled"
    mAktiv = v
End Property

Public Property Let AktivIntern(ByVal v As Boolean)
    mAktiv = v
End Property

Public Property Get Text() As Variant
    Text = mText
End Property

Public Property Let Text(ByVal v As Variant)
    AtSchreib "Condition(" & mTyp & ").Text"
    mText = v
End Property

Public Property Let TextIntern(ByVal v As Variant)
    mText = v
End Property

Public Property Get Address() As Variant
    Address = mAdr
End Property

Public Property Let Address(ByVal v As Variant)
    AtSchreib "Condition(" & mTyp & ").Address"
    mAdr = v
End Property

Public Property Let AdresseIntern(ByVal v As Variant)
    mAdr = v
End Property

Public Property Get Importance() As Long
    Importance = mWicht
End Property

Public Property Let Importance(ByVal v As Long)
    AtSchreib "Condition(" & mTyp & ").Importance"
    mWicht = v
End Property

Public Property Get Categories() As Variant
    Categories = mKat
End Property

Public Property Let Categories(ByVal v As Variant)
    AtSchreib "Condition(" & mTyp & ").Categories"
    mKat = v
End Property

Public Property Let WichtIntern(ByVal v As Long)
    mWicht = v
End Property

Public Property Let KatIntern(ByVal v As Variant)
    mKat = v
End Property

Public Property Get FormName() As Variant
    FormName = mForm
End Property

Public Property Let FormName(ByVal v As Variant)
    AtSchreib "Condition(" & mTyp & ").FormName"
    mForm = v
End Property

Public Property Let FormIntern(ByVal v As Variant)
    mForm = v
End Property

Public Property Get Recipients() As Object
    Set Recipients = mEmpf
End Property

Public Sub EmpfaengerSetzen(ByVal e As Object)
    Set mEmpf = e
End Sub

Public Function Bericht() As String
    Dim s As String
    If mEmpf.Count > 0 Then s = mEmpf.Bericht()
    If IsArray(mText) Then s = s & Join(mText, "; ")
    If IsArray(mAdr) Then s = s & Join(mAdr, "; ")
    If IsArray(mForm) Then s = s & Join(mForm, "; ")
    If IsArray(mKat) Then s = s & Join(mKat, "; ")
    If s <> "" Then Bericht = "=" & s
End Function

Public Function Klon() As Object
    Dim n As Object
    Set n = New clsAtBed
    n.Init mTyp
    n.AktivIntern = mAktiv
    n.TextIntern = mText
    n.AdresseIntern = mAdr
    n.WichtIntern = mWicht
    n.KatIntern = mKat
    n.FormIntern = mForm
    n.EmpfaengerSetzen mEmpf.Klon()
    Set Klon = n
End Function
