import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { useSignTranslation } from '@/hooks/useSignTranslation';
import Header from '@/components/Header';
import ModeSwitch from '@/components/ModeSwitch';
import Avatar3D from '@/components/Avatar3D';
import InputPanel from '@/components/InputPanel';
import CameraWindow from '@/components/CameraWindow';
import TranslationOutput from '@/components/TranslationOutput';
import { SignAction } from '@/types';
import { SignSequence } from '@/utils/signEngine';

export default function Home() {
  const { mode, avatar, inputLanguage, outputLanguage } = useAppStore();
  const { translateToSign, translatedSignText, translateSignToText, clearTranslation } = useSignTranslation();
  const [signActions, setSignActions] = useState<SignAction[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastInput, setLastInput] = useState('');
  const [currentTokenIndex, setCurrentTokenIndex] = useState(-1);
  const [sequenceTokens, setSequenceTokens] = useState<string[]>([]);

  useEffect(() => {
    clearTranslation();
    setSignActions([]);
    setIsAnimating(false);
    setCurrentTokenIndex(-1);
    setSequenceTokens([]);
  }, [mode, clearTranslation]);

  const handleLanguageInput = useCallback((text: string) => {
    setLastInput(text);
    const sequence: SignSequence = translateToSign(text, inputLanguage);
    if (sequence.actions.length > 0) {
      setSignActions(sequence.actions);
      setSequenceTokens(sequence.tokens);
      setCurrentTokenIndex(0);
      setIsAnimating(true);
    } else {
      setSignActions([]);
      setSequenceTokens([]);
      setCurrentTokenIndex(-1);
      setIsAnimating(false);
    }
  }, [inputLanguage, translateToSign]);

  const handleSignDetected = useCallback((signId: string | null, confidence: number) => {
    if (signId && confidence > 0.6) {
      translateSignToText(signId, outputLanguage);
    }
  }, [outputLanguage, translateSignToText]);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setCurrentTokenIndex(-1);
  }, []);

  const handleProgress = useCallback((actionIndex: number, _progress: number) => {
    setCurrentTokenIndex(actionIndex);
  }, []);

  // 渲染带高亮的输入文本
  const highlightedInput = useMemo(() => {
    if (!lastInput || sequenceTokens.length === 0 || currentTokenIndex < 0) {
      return lastInput;
    }
    // 简单方式：按token分割并高亮当前token
    const parts: { text: string; highlight: boolean }[] = [];
    let remaining = lastInput;
    sequenceTokens.forEach((token, idx) => {
      const lower = remaining.toLowerCase();
      const pos = lower.indexOf(token.toLowerCase());
      if (pos >= 0) {
        if (pos > 0) parts.push({ text: remaining.slice(0, pos), highlight: false });
        parts.push({ text: remaining.slice(pos, pos + token.length), highlight: idx === currentTokenIndex });
        remaining = remaining.slice(pos + token.length);
      }
    });
    if (remaining) parts.push({ text: remaining, highlight: false });

    return (
      <span>
        {parts.map((part, i) =>
          part.highlight ? (
            <span key={i} className="rounded bg-secondary-500/30 px-0.5 font-semibold text-secondary-600 dark:text-secondary-400">
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>
    );
  }, [lastInput, sequenceTokens, currentTokenIndex]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <ModeSwitch />

          {mode === 'languageToSign' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="order-2 lg:order-1 space-y-6">
                <InputPanel onSubmit={handleLanguageInput} />

                {lastInput && (
                  <div className="glass-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-text-secondary">输入内容（同步高亮）</span>
                      {isAnimating && currentTokenIndex >= 0 && sequenceTokens[currentTokenIndex] && (
                        <span className="rounded-full bg-secondary-500/20 px-2 py-0.5 text-xs font-medium text-secondary-600 dark:text-secondary-400">
                          正在演示：{sequenceTokens[currentTokenIndex]}
                        </span>
                      )}
                    </div>
                    <p className="text-base leading-relaxed text-text-primary">{highlightedInput}</p>
                  </div>
                )}
              </div>

              <div className="order-1 lg:order-2 flex flex-col gap-4">
                <div className="flex-1 min-h-[400px] lg:min-h-[500px]">
                  <Avatar3D
                    signActions={signActions}
                    avatar={avatar}
                    isPlaying={isAnimating}
                    onAnimationComplete={handleAnimationComplete}
                    onProgress={handleProgress}
                  />
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">动画状态</span>
                    <span className={`text-sm font-medium ${isAnimating ? 'text-secondary-500' : 'text-text-secondary'}`}>
                      {isAnimating ? '正在演示手语' : '待机中'}
                    </span>
                  </div>
                  {sequenceTokens.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sequenceTokens.map((token, idx) => (
                        <span
                          key={idx}
                          className={`rounded-md px-2 py-0.5 text-xs transition-all ${
                            idx === currentTokenIndex && isAnimating
                              ? 'bg-secondary-500 text-white shadow-md scale-105'
                              : idx < currentTokenIndex || !isAnimating
                              ? 'bg-secondary-500/20 text-secondary-600 dark:text-secondary-400'
                              : 'bg-bg-secondary text-text-secondary'
                          }`}
                        >
                          {token}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mode === 'signToLanguage' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <CameraWindow onSignDetected={handleSignDetected} />
              </div>
              <div>
                <TranslationOutput
                  text={translatedSignText}
                  label="手语识别结果"
                  language={outputLanguage}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
