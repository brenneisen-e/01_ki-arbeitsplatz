# HR-Sales-Dashboard: laedt die xlsm in LibreOffice (VBA-Modus) und ruft je Modul eine Prozedur auf: Syntaxfehler im Modul erscheinen als BASIC-Fehler.
import uno, sys, subprocess, time, os
from com.sun.star.beans import PropertyValue
pfad = os.path.abspath(sys.argv[1])
proc = subprocess.Popen(['soffice', '--headless', '--norestore', '-env:UserInstallation=file://%s/lo7' % os.getcwd(),
                         '--accept=socket,host=localhost,port=2007;urp;'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
ctx = None
for _ in range(60):
    try:
        local = uno.getComponentContext()
        resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
        ctx = resolver.resolve('uno:socket,host=localhost,port=2007;urp;StarOffice.ComponentContext')
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
for name, args in [("modBasis.BasisVersion", ()), ("modBasis.Berichtstag", ()), ("modBasis.BerichtsSpalte", ()), ("modStart.StartVersion", ()),
                   ("modKommentar.KommentarVersion", ()), ("modPPT.PPTVersion", ()), ("modVerknuepfung.VerknuepfungVersion", ()),
                   ("modKarte.DatumLang", (46297.0,)), ("modBasis.PersonPasst", ("Mey/ Richartz", "mey")), ("modZuordnung.ZuordnungVersion", ()), ("modBasis.ZuLetzteZeile", ()), ("modBasis.ZuWertzeile", (6,)), ("modBasis.ZuWertzeile", (7,)), ("modZuordnung.PersonenSortieren", ()), ("modZuordnung.ModusAnzeigen", ()), ("modPPT.SpartenStapeln", ()), ("modKacheln.KachelnVersion", ()), ("modAltWerte.AltWerteVersion", ()), ("modKpiLoeschen.KpiLoeschenVersion", ()),
                   ("modKpiLoeschen.KpiLoeschbar", (5,)), ("modKpiLoeschen.KpiLoeschbar", (3,)), ("modKpiLoeschen.KpiLoeschbar", (64,)), ("modKpiLoeschen.KpiLoeschbar", (31,)),
                   ("modStart.PflichtZaehlen", ("Amend",)), ("modStart.PflichtZaehlen", ("Mey",)), ("modStart.PflichtZaehlen", ("",)),
                   ("modBasis.KopfZeile", (100,)), ("modBasis.KopfZeile", (168,)), ("modBasis.MonatsKopf", ("Rohdaten_2",)),
                   ("modBasis.MonatsKopf", ("Rohdaten_3",)), ("modBasis.ErsterMonatsKopf", ()), ("modBasis.BlockEnde", (159,)),
                   ("modBasis.BlockEnde", (165,)), ("modBasis.ZielSpalte", (167, "monatlich")), ("modBasis.ZielSpalte", (167, "quartalsweise")),
                   ("modBasis.ZielSpalte", (100, "wöchentlich")), ("modBasis.ZielText", (167, "monatlich")), ("modKW.TextBeschriftungen", ()),
                   ("modKpiLoeschen.KpiLoeschenProbe", ("analyse",))]:
    try:
        s = sp.getScript('vnd.sun.star.script:HRSalesDashboard.%s?language=Basic&location=document' % name)
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
