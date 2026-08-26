import { useState, useRef, useCallback, useEffect } from 'react';
import { Language } from '@/types';

interface UseSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => void;
  finalText: string;
  interimText: string;
  error: string | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition(language: Language): UseSpeechRecognitionReturn {
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setFinalText('');
    setInterimText('');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('当前浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setFinalText((prev) => prev + final);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: Event) => {
      const err = event as ErrorEvent;
      if (err.error !== 'aborted' && err.error !== 'no-speech') {
        setError(`语音识别出错: ${err.error || '未知错误'}`);
      }
    };

    recognition.onend = () => {
      setInterimText('');
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      setError('启动语音识别失败');
    }
  }, [language]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { startListening, stopListening, finalText, interimText, error };
}

export default useSpeechRecognition;
