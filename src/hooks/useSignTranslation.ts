import { useState, useCallback } from 'react';
import { Language } from '@/types';
import { translateText, detectLanguage } from '@/utils/translation';
import { generateSignSequence, SignSequence } from '@/utils/signEngine';
import { signDictionary } from '@/data/signDictionary';

interface UseSignTranslationReturn {
  translateToSign: (text: string, language: Language) => SignSequence;
  translatedSignText: string;
  recognizedLanguage: Language;
  translateSignToText: (signId: string, outputLanguage: Language) => void;
  clearTranslation: () => void;
}

export const useSignTranslation = (): UseSignTranslationReturn => {
  const [translatedSignText, setTranslatedSignText] = useState('');
  const [recognizedLanguage, setRecognizedLanguage] = useState<Language>('zh');

  const translateToSign = useCallback((text: string, language: Language): SignSequence => {
    return generateSignSequence(text, language);
  }, []);

  const translateSignToText = useCallback((signId: string, outputLanguage: Language) => {
    // 从词典中获取对应手语的文本
    const action = signDictionary[signId];
    if (!action) {
      // 回退：从signId解析
      const baseText = signId.replace(/_(zh|en)$/, '');
      setTranslatedSignText(baseText);
      return;
    }

    const sourceText = action.text;
    const sourceLang = action.language;
    setRecognizedLanguage(sourceLang);

    if (sourceLang === outputLanguage) {
      setTranslatedSignText(sourceText);
    } else {
      const translated = translateText(sourceText, sourceLang, outputLanguage);
      setTranslatedSignText(translated);
    }
  }, []);

  const clearTranslation = useCallback(() => {
    setTranslatedSignText('');
    setRecognizedLanguage('zh');
  }, []);

  return {
    translateToSign,
    translatedSignText,
    recognizedLanguage,
    translateSignToText,
    clearTranslation,
  };
};

export default useSignTranslation;
