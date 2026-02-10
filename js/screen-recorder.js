// js/screen-recorder.js - Bildschirmaufnahme mit Klick-Wellen
// ============================================================

var screenRecorder = {
    mediaRecorder: null,
    recordedChunks: [],
    isRecording: false,
    stream: null,

    // Aufnahme starten
    start: function() {
        var self = this;
        // Tab-Aufnahme via getDisplayMedia
        navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'tab', cursor: 'always', frameRate: { ideal: 30 } },
            audio: false,
            preferCurrentTab: true
        }).then(function(stream) {
            self.stream = stream;
            self.recordedChunks = [];
            self._usedMimeType = self._getMimeType();
            self.mediaRecorder = new MediaRecorder(stream, {
                mimeType: self._usedMimeType,
                videoBitsPerSecond: 20000000 // 20 Mbps – Vimeo empfiehlt 10-20 Mbps für 1080p
            });
            self.mediaRecorder.ondataavailable = function(e) {
                if (e.data && e.data.size > 0) {
                    self.recordedChunks.push(e.data);
                }
            };
            self.mediaRecorder.onstop = function() {
                self._saveRecording();
            };
            // Falls der User den Browser-Share-Dialog abbricht
            stream.getVideoTracks()[0].onended = function() {
                if (self.isRecording) self.stop();
            };
            self.mediaRecorder.start(1000); // 1s chunks für bessere Kompression
            self.isRecording = true;
            self._updateButton();
            self._enableClickRipples();
        }).catch(function(err) {
            console.log('Aufnahme abgebrochen oder nicht unterstützt:', err);
        });
    },

    // Aufnahme stoppen
    stop: function() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(function(t) { t.stop(); });
            this.stream = null;
        }
        this.isRecording = false;
        this._updateButton();
        this._disableClickRipples();
    },

    // Toggle
    toggle: function() {
        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
    },

    // Bestes verfügbares Format (MP4 bevorzugt)
    _getMimeType: function() {
        var types = [
            'video/mp4;codecs=avc1',
            'video/mp4;codecs=avc1.42E01E',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];
        for (var i = 0; i < types.length; i++) {
            if (MediaRecorder.isTypeSupported(types[i])) return types[i];
        }
        return '';
    },

    // Video speichern
    _saveRecording: function() {
        if (this.recordedChunks.length === 0) return;
        var mime = this._usedMimeType || 'video/webm';
        var isMP4 = mime.indexOf('mp4') !== -1;
        var ext = isMP4 ? 'mp4' : 'webm';
        var blobType = isMP4 ? 'video/mp4' : 'video/webm';
        var blob = new Blob(this.recordedChunks, { type: blobType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var now = new Date();
        var ts = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0');
        a.download = 'KI-Arbeitsplatz_' + ts + '.' + ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.recordedChunks = [];
    },

    // Button-Zustand aktualisieren (während Aufnahme fast unsichtbar)
    _updateButton: function() {
        var btn = document.getElementById('screenRecordBtn');
        if (!btn) return;
        if (this.isRecording) {
            btn.classList.add('recording');
            btn.title = 'Aufnahme stoppen';
        } else {
            btn.classList.remove('recording');
            btn.title = 'Bildschirmaufnahme starten';
        }
    },

    // Klick-Ripple-Effekte aktivieren
    _rippleHandler: null,
    _enableClickRipples: function() {
        var self = this;
        this._rippleHandler = function(e) {
            if (!self.isRecording) return;
            // Nicht auf den Record-Button selbst
            if (e.target.closest('#screenRecordBtn')) return;
            self._createRipple(e.clientX, e.clientY);
        };
        document.addEventListener('click', this._rippleHandler, true);
    },

    _disableClickRipples: function() {
        if (this._rippleHandler) {
            document.removeEventListener('click', this._rippleHandler, true);
            this._rippleHandler = null;
        }
    },

    // Ripple-Animation an Klickposition erzeugen
    _createRipple: function(x, y) {
        var ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        document.body.appendChild(ripple);

        // Innerer Punkt
        var dot = document.createElement('div');
        dot.className = 'click-ripple-dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        document.body.appendChild(dot);

        // Nach Animation entfernen
        setTimeout(function() {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            if (dot.parentNode) dot.parentNode.removeChild(dot);
        }, 800);
    }
};

// Globale Funktion für onclick
function toggleScreenRecord() {
    screenRecorder.toggle();
}
window.toggleScreenRecord = toggleScreenRecord;
