import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const AI_MODEL = 'claude-sonnet-4-20250514';

export function useAI() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const callAI = useCallback(async (systemPrompt, userMessage) => {
    setLoading(true);
    setError(null);
    setResult(null);
    dispatch({ type: 'SET_AI_LOADING', loading: true });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Keine Antwort erhalten.';
      setResult(text);
      dispatch({ type: 'SET_AI_LOADING', loading: false });
      return text;
    } catch (err) {
      const errorMsg = err.message || 'Verbindungsfehler zur KI';
      setError(errorMsg);
      dispatch({ type: 'SET_AI_LOADING', loading: false });
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const sendChatMessage = useCallback(async (systemPrompt, userMessage) => {
    dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'user', content: userMessage, timestamp: new Date() } });

    const response = await callAI(systemPrompt, userMessage);
    if (response) {
      dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'assistant', content: response, timestamp: new Date() } });
    }
    return response;
  }, [callAI, dispatch]);

  return { callAI, sendChatMessage, loading, result, error };
}
