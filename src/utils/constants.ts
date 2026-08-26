export const APP_NAME = 'SignBridge';
export const APP_TAGLINE = '手语与语言的双向沟通桥梁';

export const LANGUAGES = [
  { code: 'zh', name: '中文', locale: 'zh-CN' },
  { code: 'en', name: 'English', locale: 'en-US' },
] as const;

export const MODES = [
  { id: 'languageToSign', name: '语言 → 手语', description: '语音或文字输入，虚拟人物演示手语' },
  { id: 'signToLanguage', name: '手语 → 语言', description: '摄像头识别手语，输出文字和语音' },
] as const;

export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 480 },
  },
  audio: false,
};

export const GESTURE_CONFIDENCE_THRESHOLD = 0.75;
export const GESTURE_DEBOUNCE_MS = 500;

export const AVATAR_APPEARANCE_OPTIONS = {
  skinColor: ['#f5d0b0', '#e0ac69', '#8d5524', '#c68642', '#ffdbac'],
  hairColor: ['#3d2914', '#000000', '#5a4632', '#a52a2a', '#d4a574', '#f0e68c', '#ffffff'],
  hairStyle: ['short', 'long', 'bald'],
  eyeColor: ['#4a4a4a', '#3d6b2b', '#4a7c9b', '#8b4513', '#808080'],
  clothing: ['casual', 'formal', 'sporty'],
  clothingColor: ['#2dd4bf', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#10b981', '#ef4444'],
};
