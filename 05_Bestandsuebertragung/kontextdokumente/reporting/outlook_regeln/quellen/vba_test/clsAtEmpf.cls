Option Explicit
' Attrappe Recipient: Resolve sucht im Verzeichnis der Attrappe (Anzeigename, SMTP oder Exchange-DN, je nach Art
' des Eintrags). Address liefert wie Exchange einen X.500-DN, die SMTP-Adresse nur ueber AddressEntry
' (GetExchangeUser, GetExchangeDistributionList bzw. PropertyAccessor - je nach Art).
' (nur Testvariante)
Public Name As String
Private mEingabe As String
Private mAdr As String
Private mSmtp As String
Private mListe As Boolean
Private mOk As Boolean
' Art dieses Eintrags abweichend vom Verzeichnis ("" = wie im Verzeichnis, "dn" = nur Exchange-DN lesbar)
Private mArt As String

Public Sub Init(ByVal eingabe As String)
    mEingabe = eingabe
    Name = eingabe
    mAdr = eingabe
End Sub

' Beim Aufbau der Daten: Eintrag wie in einer gespeicherten Regel (damals aufgeloest), ohne die Einschraenkungen
' der Aufloesung (Art, Schalter "gesperrt").
Public Sub Anlegen()
    Dim anzeige As String, smtp As String, dn As String, liste As Boolean
    If AtVerzeichnisRoh(mEingabe, anzeige, smtp, dn, liste) Then
        Name = anzeige
        mAdr = dn
        mSmtp = smtp
        mListe = liste
        mOk = True
    Else
        mOk = False
    End If
End Sub

Public Sub ArtSetzen(ByVal art As String)
    mArt = art
End Sub

Public Function Resolve() As Boolean
    Dim anzeige As String, smtp As String, dn As String, liste As Boolean
    If AtVerzeichnis(mEingabe, anzeige, smtp, dn, liste) Then
        Name = anzeige
        mAdr = dn
        mSmtp = smtp
        mListe = liste
        mOk = True
    Else
        mOk = False
    End If
    Resolve = mOk
End Function

Public Property Get Resolved() As Boolean
    Resolved = mOk
End Property

Public Property Get Address() As String
    Address = mAdr
End Property

Public Property Get AddressEntry() As Object
    Dim a As Object
    If mOk Then
        Set a = New clsAtAdr
        a.Init Name, mAdr, mSmtp, mListe, IIf(mArt = "", AtVzArtVon(Name), mArt)
        Set AddressEntry = a
    End If
End Property

Public Sub Uebernehmen(ByVal eingabe As String, ByVal anzeige As String, ByVal dn As String, ByVal smtp As String, _
                       ByVal liste As Boolean, ByVal ok As Boolean, ByVal art As String)
    mEingabe = eingabe: Name = anzeige: mAdr = dn: mSmtp = smtp: mListe = liste: mOk = ok: mArt = art
End Sub

Public Function Klon() As Object
    Dim n As Object
    Set n = New clsAtEmpf
    n.Uebernehmen mEingabe, Name, mAdr, mSmtp, mListe, mOk, mArt
    Set Klon = n
End Function
