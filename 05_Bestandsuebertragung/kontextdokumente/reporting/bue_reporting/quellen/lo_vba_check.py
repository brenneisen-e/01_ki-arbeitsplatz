# Laedt die xlsm in LibreOffice (VBA-Modus) und ruft je Modul eine Prozedur auf: Syntaxfehler im Modul erscheinen als BASIC-Fehler.
import uno, sys, subprocess, time, os
from com.sun.star.beans import PropertyValue
pfad = os.path.abspath(sys.argv[1])
proc = subprocess.Popen(['soffice', '--headless', '--norestore', '-env:UserInstallation=file://%s/lo4' % os.path.dirname(os.path.abspath(__file__)),
                         '--accept=socket,host=localhost,port=2003;urp;'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
ctx = None
for _ in range(60):
    try:
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
        ctx = resolver.resolve('uno:socket,host=localhost,port=2003;urp;StarOffice.ComponentContext')
        break
    except Exception:
        time.sleep(1)
smgr = ctx.ServiceManager
desktop = smgr.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
def pv(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(pfad), '_blank', 0, (pv('Hidden', True), pv('MacroExecutionMode', 4)))
libs = doc.BasicLibraries
print('Bibliotheken:', libs.ElementNames)
for lib in libs.ElementNames:
    libs.loadLibrary(lib)
    l = libs.getByName(lib)
    print(lib, 'Module:', l.ElementNames)
sp = doc.getScriptProvider()
for name, args in [("modCockpit.ZurAktuellenKW", ()), ("modCockpit.ChipSchalten", (1,)), ("modPPT.PPTModulVersion", ()), ("modFortschritt.FortschrittSchliessen", ()),('modLaden.StichtagAusText', ('Rückstandsstichtag = Mittwoch, 23. September 2026',)),
                   ('modLaden.Verdichten', ('a  b',)), ('modCockpit.FilterAnzeigen', ()), ('modTagesablauf.TagesablaufVersion', ()), ('modFolienauswahl.FolienauswahlVersion', ()), ('modStandard.StandardVersion', ()), ('modCockpit.DiagrammeAnpassen', ()), ('modLaden.ErsatzFrageOffen', ()), ('modLaden.VerlaufGrenzenNeu', ()), ('modCockpit.PostkoerbeSortieren', ()), ('modWerkzeuge.WerkzeugeVersion', ()), ('modLaden.IstMakler', ()), ('modWerkzeuge.EinheitKnopfBeschriften', ()), ('modLaden.IstHsEinheit', ('HSB',)), ('modLaden.StandGueltig', ('Verkettungskennzeichen: 3 nicht führende Vorgänge ausgelassen',)), ('modLaden.StandGueltig', ('übersprungen: Stichtag liegt vor …',)), ('modUpdate.UpdateVersion', ())]:
    try:
        s = sp.getScript('vnd.sun.star.script:BUEReporting.%s?language=Basic&location=document' % name)
        r = s.invoke(args, (), ())
        print('OK', name, '->', r[0])
    except Exception as e:
        print('FEHLER', name, '->', str(e)[:400])
doc.close(True)
try:
    desktop.terminate()
except Exception:
    pass
proc.wait(timeout=30)
