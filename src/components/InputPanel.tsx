import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { LANGUAGES } from '@/utils/constants';
import { Mic, MicOff, Send, Keyboard, Globe } from 'lucide-react';

interface InputPanelProps {
  onSubmit: (text: string) => void;
}

export default function InputPanel({ onSubmit }: InputPanelProps) {
  const { inputLanguage, setInputLanguage, setInputText, isListening, setIsListening } = useAppStore();
  const { startListening, stopListening, finalText, interimText, error: speechError } = useSpeechRecognition(inputLanguage);
  const [localText, setLocalText] = useState('');

  useEffect(() => {
    const combined = finalText + interimText;
    if (combined) {
      setLocalText(combined);
      setInputText(combined);
    }
  }, [finalText, interimText, setInputText]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setLocalText('');
      setInputText('');
      startListening();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (localText.trim()) {
      onSubmit(localText.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-secondary-500" />
          输入区域
        </h2>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-text-secondary" />
          <select
            value={inputLanguage}
            onChange={(e) => setInputLanguage(e.target.value as typeof inputLanguage)}
            className="rounded-lg border border-border-color bg-bg-secondary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-secondary-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              setInputText(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={inputLanguage === 'zh' ? '请输入中文或点击麦克风说话...' : 'Type English or click microphone to speak...'}
            className="input-field min-h-[120px] resize-none"
          />
          {isListening && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
              <span className="status-indicator status-active" />
              正在听...
            </div>
          )}
        </div>

        {speechError && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {speechError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleListening}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'btn-accent'
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening ? '停止语音输入' : '语音输入'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!localText.trim()}
            className="flex flex-1 items-center justify-center gap-2 btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
            翻译为手语
          </button>
        </div>
      </div>
    </div>
  );
}
