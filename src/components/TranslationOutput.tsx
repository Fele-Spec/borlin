import { useAppStore } from '@/store/appStore';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TranslationOutputProps {
  text: string;
  label?: string;
  language?: 'zh' | 'en';
}

export default function TranslationOutput({ text, label = '翻译结果', language = 'zh' }: TranslationOutputProps) {
  const { outputLanguage } = useAppStore();
  const { isSpeaking, speak, stopSpeaking } = useTextToSpeech();
  const [copied, setCopied] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (text.trim()) {
      speak(text, language || outputLanguage);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title">{label}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50 disabled:opacity-50"
            title="复制"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleSpeak}
            disabled={!text}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              isSpeaking
                ? 'bg-secondary-500 text-white'
                : 'text-text-secondary hover:bg-white/10 dark:hover:bg-slate-800/50'
            } disabled:opacity-50`}
            title={isSpeaking ? '停止朗读' : '朗读'}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="min-h-[100px] rounded-xl bg-white/50 p-4 dark:bg-slate-800/50">
        {text ? (
          <p className="text-lg leading-relaxed text-text-primary">{text}</p>
        ) : (
          <p className="text-text-secondary italic">翻译结果将显示在这里...</p>
        )}
      </div>
    </div>
  );
}
