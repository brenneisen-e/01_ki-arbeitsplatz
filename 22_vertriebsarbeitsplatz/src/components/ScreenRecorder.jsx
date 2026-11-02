import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Square } from 'lucide-react';

// Globaler Bildschirmaufnahme-Provider. Hostet State, MediaRecorder, Cursor-
// Tracking und Klick-Ripples auf App-Ebene, damit der goldene Cursor + Wellen
// auch nach Navigation (LandingPage → Cockpit → Detail) sichtbar bleiben.

const Ctx = createContext(null);

export function useScreenRecorder() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useScreenRecorder must be inside ScreenRecorderProvider');
  return ctx;
}

function pickMimeType() {
  const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4;codecs=avc1', 'video/mp4'];
  return types.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) || '';
}

export function ScreenRecorderProvider({ children }) {
  const [recordPhase, setRecordPhase] = useState('idle');
  const [recordCountdown, setRecordCountdown] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const recorderRef = useRef({ mediaRecorder: null, stream: null, chunks: [], mimeType: '' });

  function saveRecording() {
    const { chunks, mimeType } = recorderRef.current;
    if (!chunks?.length) return;
    const isMP4 = (mimeType || '').includes('mp4');
    const blob = new Blob(chunks, { type: isMP4 ? 'video/mp4' : 'video/webm' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vertriebsarbeitsplatz_${ts}.${isMP4 ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recorderRef.current.chunks = [];
  }

  function stopRecording() {
    const r = recorderRef.current;
    try { if (r.mediaRecorder && r.mediaRecorder.state !== 'inactive') r.mediaRecorder.stop(); } catch {}
    try { r.stream?.getTracks().forEach((t) => t.stop()); } catch {}
    recorderRef.current.stream = null;
    setRecordPhase('idle');
    setRecordCountdown(0);
  }

  async function startRecording() {
    if (recordPhase !== 'idle') return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      alert('Bildschirmaufnahme wird vom Browser nicht unterstützt.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: false,
        preferCurrentTab: true,
      });
      const mimeType = pickMimeType();
      const mr = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 20000000 });
      recorderRef.current = { mediaRecorder: mr, stream, chunks: [], mimeType };
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) recorderRef.current.chunks.push(e.data); };
      mr.onstop = saveRecording;
      stream.getVideoTracks()[0].onended = () => { if (recorderRef.current.mediaRecorder) stopRecording(); };
      setRecordPhase('countdown');
      setRecordCountdown(5);
    } catch {
      setRecordPhase('idle');
    }
  }

  // Countdown 5..0 → MediaRecorder.start
  useEffect(() => {
    if (recordPhase !== 'countdown') return;
    if (recordCountdown <= 0) {
      try { recorderRef.current.mediaRecorder?.start(1000); } catch {}
      setRecordPhase('recording');
      return;
    }
    const t = setTimeout(() => setRecordCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [recordPhase, recordCountdown]);

  // Cursor-Tracking während der Aufnahme
  useEffect(() => {
    if (recordPhase !== 'recording') return;
    const onMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [recordPhase]);

  // Klick-Ripples während der Aufnahme
  useEffect(() => {
    if (recordPhase !== 'recording') return;
    const onClick = (e) => {
      if (e.target?.closest?.('[data-rec-stop]')) return;
      const x = e.clientX, y = e.clientY;
      const ring = document.createElement('div');
      ring.className = 'rec-ripple';
      ring.style.left = x + 'px';
      ring.style.top = y + 'px';
      const dot = document.createElement('div');
      dot.className = 'rec-ripple-dot';
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      document.body.appendChild(ring);
      document.body.appendChild(dot);
      setTimeout(() => { ring.remove(); dot.remove(); }, 900);
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [recordPhase]);

  return (
    <Ctx.Provider value={{ recordPhase, recordCountdown, startRecording, stopRecording }}>
      {children}

      {recordPhase === 'countdown' && recordCountdown > 0 && (
        <div
          className="fixed inset-0 z-[99996] flex items-center justify-center backdrop-blur-sm pointer-events-none"
          style={{ background: 'rgba(28, 26, 23, 0.45)' }}
        >
          <div className="text-center text-white">
            <div className="text-[11rem] leading-none font-semibold tracking-tight tabular-nums font-mono drop-shadow-2xl">
              {recordCountdown}
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-wider text-white/80">Aufnahme startet…</div>
          </div>
        </div>
      )}

      {recordPhase === 'recording' && (
        <>
          <button
            data-rec-stop
            onClick={stopRecording}
            title="Aufnahme stoppen"
            className="fixed top-3 right-3 z-[99999] inline-flex items-center gap-2 pl-3 pr-3.5 h-9 rounded-full surface-elevated text-(--text-primary) text-xs font-semibold hover:border-(--mode-accent) transition-colors"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-(--color-danger) animate-pulse" />
            <Square size={10} fill="currentColor" className="text-(--color-danger)" />
            REC · Stoppen
          </button>
          <div className="rec-cursor"       style={{ left: cursorPos.x, top: cursorPos.y }} />
          <div className="rec-cursor-inner" style={{ left: cursorPos.x, top: cursorPos.y }} />
        </>
      )}
    </Ctx.Provider>
  );
}
