/**
 * usePdfUpload.js
 *
 * Custom Hook, der den kompletten Upload-/Analyse-Lifecycle kapselt:
 *   - File-Auswahl
 *   - PDF-Text-Extraktion (pdfjs-dist)
 *   - Heuristische Feld-Extraktion
 *   - Fehlerbehandlung
 *   - Reset
 *
 * Zustand:
 *   status: 'idle' | 'parsing' | 'done' | 'error'
 */

import { useCallback, useState } from 'react';
import { extractPdfText } from '../../utils/pdfTextExtract';
import { parseKonsortialText, findMissingKeys } from '../../utils/konsortialParser';

export default function usePdfUpload() {
  const [status, setStatus] = useState('idle');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [hits, setHits] = useState([]);
  const [missingKeys, setMissingKeys] = useState([]);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setStatus('idle');
    setFile(null);
    setRawText('');
    setNumPages(0);
    setHits([]);
    setMissingKeys([]);
    setError('');
  }, []);

  const handleFile = useCallback(async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setStatus('parsing');
    setError('');
    try {
      const { text, numPages: n } = await extractPdfText(selectedFile);
      setRawText(text);
      setNumPages(n);
      const parsed = parseKonsortialText(text);
      setHits(parsed);
      setMissingKeys(findMissingKeys(parsed));
      setStatus('done');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF parse failed', err);
      setStatus('error');
      setError(err?.message || 'Die PDF konnte nicht gelesen werden.');
    }
  }, []);

  return {
    status,
    file,
    rawText,
    numPages,
    hits,
    missingKeys,
    error,
    handleFile,
    reset,
  };
}
