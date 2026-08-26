export type TranslationMode = 'languageToSign' | 'signToLanguage';

export type Language = 'zh' | 'en';

export interface HandPosition {
  wrist: [number, number, number];
  thumb: [number, number, number][];
  index: [number, number, number][];
  middle: [number, number, number][];
  ring: [number, number, number][];
  pinky: [number, number, number][];
}

export interface GestureFrame {
  timestamp: number;
  handPositions: HandPosition[];
}

export interface SignAction {
  id: string;
  text: string;
  language: Language;
  gestures: GestureFrame[];
  duration: number;
}

export interface AvatarState {
  id: string;
  name: string;
  appearance: {
    skinColor: string;
    hairColor: string;
    hairStyle: string;
    eyeColor: string;
    clothing: string;
    clothingColor: string;
  };
  currentPose: string;
  isAnimating: boolean;
}

export interface TranslationResult {
  text: string;
  language: Language;
  timestamp: number;
}

export interface GestureDetection {
  detected: boolean;
  signId: string | null;
  confidence: number;
  landmarks: number[][] | null;
}

export interface AppState {
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
}
