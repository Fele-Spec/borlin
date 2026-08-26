import { create } from 'zustand';
import { TranslationMode, Language, AvatarState, GestureDetection } from '../types';

const defaultAvatar: AvatarState = {
  id: 'anya',
  name: '阿尼亚',
  appearance: {
    skinColor: '#fce4d6',
    hairColor: '#f8a5c2',
    hairStyle: 'anya',
    eyeColor: '#4caf50',
    clothing: 'eden_uniform',
    clothingColor: '#1a1a2e',
  },
  currentPose: 'idle',
  isAnimating: false,
};

const defaultGestureDetection: GestureDetection = {
  detected: false,
  signId: null,
  confidence: 0,
  landmarks: null,
};

interface AppStore {
  mode: TranslationMode;
  inputLanguage: Language;
  outputLanguage: Language;
  inputText: string;
  translatedText: string;
  avatar: AvatarState;
  isListening: boolean;
  isSpeaking: boolean;
  isCameraActive: boolean;
  gestureDetection: GestureDetection;

  setMode: (mode: TranslationMode) => void;
  setInputLanguage: (lang: Language) => void;
  setOutputLanguage: (lang: Language) => void;
  setInputText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setAvatar: (avatar: Partial<AvatarState>) => void;
  setIsListening: (listening: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
  setIsCameraActive: (active: boolean) => void;
  setGestureDetection: (detection: Partial<GestureDetection>) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'languageToSign',
  inputLanguage: 'zh',
  outputLanguage: 'en',
  inputText: '',
  translatedText: '',
  avatar: defaultAvatar,
  isListening: false,
  isSpeaking: false,
  isCameraActive: false,
  gestureDetection: defaultGestureDetection,

  setMode: (mode) => set({ mode }),
  setInputLanguage: (lang) => set({ inputLanguage: lang }),
  setOutputLanguage: (lang) => set({ outputLanguage: lang }),
  setInputText: (text) => set({ inputText: text }),
  setTranslatedText: (text) => set({ translatedText: text }),
  setAvatar: (avatar) => set((state) => ({ avatar: { ...state.avatar, ...avatar } })),
  setIsListening: (listening) => set({ isListening: listening }),
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setIsCameraActive: (active) => set({ isCameraActive: active }),
  setGestureDetection: (detection) =>
    set((state) => ({ gestureDetection: { ...state.gestureDetection, ...detection } })),
  reset: () => set({
    mode: 'languageToSign',
    inputLanguage: 'zh',
    outputLanguage: 'en',
    inputText: '',
    translatedText: '',
    avatar: defaultAvatar,
    isListening: false,
    isSpeaking: false,
    isCameraActive: false,
    gestureDetection: defaultGestureDetection,
  }),
}));
