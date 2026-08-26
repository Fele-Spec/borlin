import { SignAction, HandPosition } from '../types';

// ============================================================
// 基础手型预设 —— 用于快速构建手势
// ============================================================

type FingerJoints = [number, number, number][];

const makeFinger = (
  baseX: number,
  baseY: number,
  length: number,
  spread: number = 0,
  curl: number = 0
): FingerJoints => {
  const joints: FingerJoints = [];
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 4;
    const curlOffset = curl * t * t * 0.15;
    joints.push([
      baseX + spread * t,
      baseY - length * t + curlOffset,
      curl * t * 0.08,
    ]);
  }
  return joints;
};

// 张开手掌
const OPEN_PALM: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.08, -0.05, 0.18, 0.12, 0),
  index: makeFinger(0.06, -0.1, 0.32, 0.02, 0),
  middle: makeFinger(0.02, -0.1, 0.35, 0, 0),
  ring: makeFinger(-0.02, -0.1, 0.32, -0.02, 0),
  pinky: makeFinger(-0.06, -0.1, 0.26, -0.06, 0),
};

// 握拳
const FIST: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.04, -0.08, 0.1, 0.02, 2),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.05, -0.08, 0.08, -0.05, 2),
};

// 食指指物
const POINT: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.04, -0.1, 0.35, 0.02, 0),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.05, -0.08, 0.08, -0.05, 2),
};

// 剪刀手（V字）
const PEACE: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.05, -0.1, 0.32, 0.04, 0),
  middle: makeFinger(0.0, -0.1, 0.32, -0.04, 0),
  ring: makeFinger(-0.03, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.06, -0.08, 0.08, -0.05, 2),
};

// 点赞（拇指向上）
const THUMBS_UP: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.02, 0.05, 0.28, 0, -0.5),
  index: makeFinger(0.04, -0.08, 0.1, 0.02, 2),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.05, -0.08, 0.08, -0.05, 2),
};

// OK手势
const OK: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.04, -0.02, 0.14, 0.06, 0.5),
  index: makeFinger(0.04, -0.06, 0.14, 0.02, 0.8),
  middle: makeFinger(0.0, -0.1, 0.3, 0, 0),
  ring: makeFinger(-0.03, -0.1, 0.28, -0.02, 0),
  pinky: makeFinger(-0.06, -0.1, 0.22, -0.05, 0),
};

// 平掌（手指并拢）
const FLAT: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.05, -0.05, 0.16, 0.06, 0.3),
  index: makeFinger(0.03, -0.1, 0.32, 0.005, 0),
  middle: makeFinger(0.01, -0.1, 0.34, 0, 0),
  ring: makeFinger(-0.01, -0.1, 0.32, -0.005, 0),
  pinky: makeFinger(-0.03, -0.1, 0.26, -0.01, 0),
};

// 我爱你（ILY）
const ILY: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.08, -0.02, 0.22, 0.12, 0),
  index: makeFinger(0.05, -0.1, 0.32, 0.02, 0),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.07, -0.1, 0.26, -0.06, 0),
};

// 构建手势帧
const makeFrame = (
  wrist: [number, number, number],
  shape: Omit<HandPosition, 'wrist'>
): { timestamp: number; handPositions: HandPosition[] } => ({
  timestamp: 0,
  handPositions: [{ wrist, ...shape }],
});

// 构建多帧手势动作
const makeGesture = (
  frames: { wrist: [number, number, number]; shape: Omit<HandPosition, 'wrist'> }[],
  duration: number
): { timestamp: number; handPositions: HandPosition[] }[] => {
  return frames.map((f, i) => ({
    timestamp: (i / Math.max(1, frames.length - 1)) * duration,
    handPositions: [{ wrist: f.wrist, ...f.shape }],
  }));
};

// ============================================================
// 手语词典 —— 扩充至 50+ 词条
// ============================================================

export const signDictionary: Record<string, SignAction> = {
  // ---------- 问候类 ----------
  'hello_zh': {
    id: 'hello_zh', text: '你好', language: 'zh', duration: 1800,
    gestures: makeGesture([
      { wrist: [0, 0, 0], shape: OPEN_PALM },
      { wrist: [0.25, -0.3, 0], shape: OPEN_PALM },
      { wrist: [-0.25, -0.3, 0], shape: OPEN_PALM },
      { wrist: [0, -0.15, 0], shape: OPEN_PALM },
    ], 1800),
  },
  'hello_en': {
    id: 'hello_en', text: 'Hello', language: 'en', duration: 1800,
    gestures: makeGesture([
      { wrist: [0, 0, 0], shape: OPEN_PALM },
      { wrist: [0.25, -0.3, 0], shape: OPEN_PALM },
      { wrist: [-0.25, -0.3, 0], shape: OPEN_PALM },
    ], 1800),
  },
  'goodbye_zh': {
    id: 'goodbye_zh', text: '再见', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0.1, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.2, 0], shape: FIST },
      { wrist: [0.1, -0.2, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'goodbye_en': {
    id: 'goodbye_en', text: 'Goodbye', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0.1, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.2, 0], shape: FIST },
      { wrist: [0.1, -0.2, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'good_morning_zh': {
    id: 'good_morning_zh', text: '早上好', language: 'zh', duration: 2000,
    gestures: makeGesture([
      { wrist: [0, 0.1, 0], shape: OPEN_PALM },
      { wrist: [0.3, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: THUMBS_UP },
    ], 2000),
  },
  'good_morning_en': {
    id: 'good_morning_en', text: 'Good Morning', language: 'en', duration: 2000,
    gestures: makeGesture([
      { wrist: [0, 0.1, 0], shape: OPEN_PALM },
      { wrist: [0.3, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: THUMBS_UP },
    ], 2000),
  },
  'good_night_zh': {
    id: 'good_night_zh', text: '晚安', language: 'zh', duration: 1800,
    gestures: makeGesture([
      { wrist: [0, 0, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0.1], shape: FLAT },
    ], 1800),
  },
  'good_night_en': {
    id: 'good_night_en', text: 'Good Night', language: 'en', duration: 1800,
    gestures: makeGesture([
      { wrist: [0, 0, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0.1], shape: FLAT },
    ], 1800),
  },
  'welcome_zh': {
    id: 'welcome_zh', text: '欢迎', language: 'zh', duration: 1800,
    gestures: makeGesture([
      { wrist: [-0.2, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.2, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0], shape: OPEN_PALM },
    ], 1800),
  },
  'welcome_en': {
    id: 'welcome_en', text: 'Welcome', language: 'en', duration: 1800,
    gestures: makeGesture([
      { wrist: [-0.2, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.2, -0.2, 0], shape: OPEN_PALM },
    ], 1800),
  },

  // ---------- 礼貌用语 ----------
  'thank_you_zh': {
    id: 'thank_you_zh', text: '谢谢', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.45, 0], shape: OPEN_PALM },
      { wrist: [0, -0.2, 0], shape: FIST },
    ], 1500),
  },
  'thank_you_en': {
    id: 'thank_you_en', text: 'Thank You', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.45, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'sorry_zh': {
    id: 'sorry_zh', text: '对不起', language: 'zh', duration: 2000,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0], shape: FIST },
      { wrist: [0, -0.1, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0], shape: FIST },
    ], 2000),
  },
  'sorry_en': {
    id: 'sorry_en', text: 'Sorry', language: 'en', duration: 2000,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0], shape: FIST },
      { wrist: [0, -0.3, 0], shape: FIST },
    ], 2000),
  },
  'please_zh': {
    id: 'please_zh', text: '请', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FLAT },
      { wrist: [0.2, -0.3, 0], shape: FLAT },
    ], 1200),
  },
  'please_en': {
    id: 'please_en', text: 'Please', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FLAT },
      { wrist: [0.2, -0.3, 0], shape: FLAT },
    ], 1200),
  },

  // ---------- 基础应答 ----------
  'yes_zh': {
    id: 'yes_zh', text: '是', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: THUMBS_UP },
      { wrist: [0, -0.5, 0], shape: THUMBS_UP },
      { wrist: [0, -0.3, 0], shape: THUMBS_UP },
    ], 1000),
  },
  'yes_en': {
    id: 'yes_en', text: 'Yes', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: THUMBS_UP },
      { wrist: [0, -0.5, 0], shape: THUMBS_UP },
    ], 1000),
  },
  'no_zh': {
    id: 'no_zh', text: '不', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [-0.2, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.2, 0], shape: OPEN_PALM },
    ], 1000),
  },
  'no_en': {
    id: 'no_en', text: 'No', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [-0.2, -0.2, 0], shape: OPEN_PALM },
    ], 1000),
  },
  'good_zh': {
    id: 'good_zh', text: '好', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: THUMBS_UP },
      { wrist: [0.15, -0.4, 0], shape: THUMBS_UP },
    ], 1000),
  },
  'good_en': {
    id: 'good_en', text: 'Good', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: THUMBS_UP },
      { wrist: [0.15, -0.4, 0], shape: THUMBS_UP },
    ], 1000),
  },
  'ok_zh': {
    id: 'ok_zh', text: '好的', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OK },
      { wrist: [0.1, -0.35, 0], shape: OK },
    ], 1000),
  },
  'ok_en': {
    id: 'ok_en', text: 'OK', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OK },
      { wrist: [0.1, -0.35, 0], shape: OK },
    ], 1000),
  },

  // ---------- 代词 ----------
  'i_zh': {
    id: 'i_zh', text: '我', language: 'zh', duration: 800,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
    ], 800),
  },
  'i_en': {
    id: 'i_en', text: 'I', language: 'en', duration: 800,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
    ], 800),
  },
  'you_zh': {
    id: 'you_zh', text: '你', language: 'zh', duration: 800,
    gestures: makeGesture([
      { wrist: [0.2, -0.3, 0], shape: POINT },
    ], 800),
  },
  'you_en': {
    id: 'you_en', text: 'You', language: 'en', duration: 800,
    gestures: makeGesture([
      { wrist: [0.2, -0.3, 0], shape: POINT },
    ], 800),
  },
  'he_zh': {
    id: 'he_zh', text: '他', language: 'zh', duration: 800,
    gestures: makeGesture([
      { wrist: [0.3, -0.2, 0], shape: POINT },
      { wrist: [0.35, -0.25, 0], shape: POINT },
    ], 800),
  },
  'he_en': {
    id: 'he_en', text: 'He', language: 'en', duration: 800,
    gestures: makeGesture([
      { wrist: [0.3, -0.2, 0], shape: POINT },
    ], 800),
  },
  'we_zh': {
    id: 'we_zh', text: '我们', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
      { wrist: [0.2, -0.25, 0], shape: POINT },
      { wrist: [-0.1, -0.2, 0], shape: OPEN_PALM },
    ], 1200),
  },
  'we_en': {
    id: 'we_en', text: 'We', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
      { wrist: [0.2, -0.25, 0], shape: OPEN_PALM },
    ], 1200),
  },

  // ---------- 疑问词 ----------
  'what_zh': {
    id: 'what_zh', text: '什么', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.15, -0.3, 0], shape: OPEN_PALM },
      { wrist: [-0.1, -0.25, 0], shape: OPEN_PALM },
    ], 1200),
  },
  'what_en': {
    id: 'what_en', text: 'What', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0.15, -0.3, 0], shape: OPEN_PALM },
    ], 1200),
  },
  'where_zh': {
    id: 'where_zh', text: '哪里', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [-0.2, -0.2, 0], shape: POINT },
      { wrist: [0.2, -0.2, 0], shape: POINT },
    ], 1200),
  },
  'where_en': {
    id: 'where_en', text: 'Where', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [-0.2, -0.2, 0], shape: POINT },
      { wrist: [0.2, -0.2, 0], shape: POINT },
    ], 1200),
  },
  'who_zh': {
    id: 'who_zh', text: '谁', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.15, 0], shape: POINT },
      { wrist: [0.1, -0.2, 0], shape: POINT },
    ], 1000),
  },
  'who_en': {
    id: 'who_en', text: 'Who', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.15, 0], shape: POINT },
      { wrist: [0.1, -0.2, 0], shape: POINT },
    ], 1000),
  },
  'why_zh': {
    id: 'why_zh', text: '为什么', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0], shape: POINT },
    ], 1500),
  },
  'why_en': {
    id: 'why_en', text: 'Why', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.3, 0], shape: POINT },
    ], 1500),
  },

  // ---------- 日常动作 ----------
  'help_zh': {
    id: 'help_zh', text: '帮助', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.45, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.3, 0], shape: FIST },
    ], 1500),
  },
  'help_en': {
    id: 'help_en', text: 'Help', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
      { wrist: [0, -0.45, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'eat_zh': {
    id: 'eat_zh', text: '吃', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.1, -0.3, 0.1], shape: FIST },
      { wrist: [0.05, -0.1, 0.15], shape: FIST },
    ], 1200),
  },
  'eat_en': {
    id: 'eat_en', text: 'Eat', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.1, -0.3, 0.1], shape: FIST },
      { wrist: [0.05, -0.1, 0.15], shape: FIST },
    ], 1200),
  },
  'drink_zh': {
    id: 'drink_zh', text: '喝', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.1, -0.4, 0], shape: FIST },
      { wrist: [0.08, -0.15, 0.1], shape: FIST },
    ], 1200),
  },
  'drink_en': {
    id: 'drink_en', text: 'Drink', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.1, -0.4, 0], shape: FIST },
      { wrist: [0.08, -0.15, 0.1], shape: FIST },
    ], 1200),
  },
  'sleep_zh': {
    id: 'sleep_zh', text: '睡', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0.1], shape: FLAT },
      { wrist: [0, -0.2, 0.15], shape: FLAT },
    ], 1500),
  },
  'sleep_en': {
    id: 'sleep_en', text: 'Sleep', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0.1], shape: FLAT },
      { wrist: [0, -0.2, 0.15], shape: FLAT },
    ], 1500),
  },
  'work_zh': {
    id: 'work_zh', text: '工作', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: FIST },
      { wrist: [0.15, -0.35, 0], shape: FIST },
      { wrist: [-0.1, -0.3, 0], shape: FIST },
    ], 1500),
  },
  'work_en': {
    id: 'work_en', text: 'Work', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: FIST },
      { wrist: [0.15, -0.35, 0], shape: FIST },
    ], 1500),
  },
  'study_zh': {
    id: 'study_zh', text: '学习', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.1, -0.3, 0], shape: FLAT },
      { wrist: [0.1, -0.3, 0], shape: FLAT },
      { wrist: [0, -0.2, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'study_en': {
    id: 'study_en', text: 'Study', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.1, -0.3, 0], shape: FLAT },
      { wrist: [0.1, -0.3, 0], shape: FLAT },
    ], 1500),
  },

  // ---------- 情感 ----------
  'love_zh': {
    id: 'love_zh', text: '爱', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: ILY },
      { wrist: [0.05, -0.25, 0], shape: ILY },
    ], 1500),
  },
  'love_en': {
    id: 'love_en', text: 'Love', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: ILY },
      { wrist: [0.05, -0.25, 0], shape: ILY },
    ], 1500),
  },
  'like_zh': {
    id: 'like_zh', text: '喜欢', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: THUMBS_UP },
      { wrist: [0.1, -0.3, 0], shape: THUMBS_UP },
    ], 1200),
  },
  'like_en': {
    id: 'like_en', text: 'Like', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: THUMBS_UP },
      { wrist: [0.1, -0.3, 0], shape: THUMBS_UP },
    ], 1200),
  },
  'happy_zh': {
    id: 'happy_zh', text: '开心', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: FIST },
      { wrist: [0, -0.1, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.15, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'happy_en': {
    id: 'happy_en', text: 'Happy', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: FIST },
      { wrist: [0, -0.1, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'sad_zh': {
    id: 'sad_zh', text: '难过', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: FIST },
    ], 1500),
  },
  'sad_en': {
    id: 'sad_en', text: 'Sad', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.1, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: FIST },
    ], 1500),
  },

  // ---------- 数字 ----------
  'one_zh': {
    id: 'one_zh', text: '一', language: 'zh', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: POINT }], 800),
  },
  'one_en': {
    id: 'one_en', text: 'One', language: 'en', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: POINT }], 800),
  },
  'two_zh': {
    id: 'two_zh', text: '二', language: 'zh', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: PEACE }], 800),
  },
  'two_en': {
    id: 'two_en', text: 'Two', language: 'en', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: PEACE }], 800),
  },
  'three_zh': {
    id: 'three_zh', text: '三', language: 'zh', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: OPEN_PALM }], 800),
  },
  'three_en': {
    id: 'three_en', text: 'Three', language: 'en', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: OPEN_PALM }], 800),
  },
  'five_zh': {
    id: 'five_zh', text: '五', language: 'zh', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: OPEN_PALM }], 800),
  },
  'five_en': {
    id: 'five_en', text: 'Five', language: 'en', duration: 800,
    gestures: makeGesture([{ wrist: [0, -0.3, 0], shape: OPEN_PALM }], 800),
  },

  // ---------- 地点 ----------
  'home_zh': {
    id: 'home_zh', text: '家', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FLAT },
      { wrist: [0, -0.35, 0], shape: FLAT },
    ], 1200),
  },
  'home_en': {
    id: 'home_en', text: 'Home', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FLAT },
      { wrist: [0, -0.35, 0], shape: FLAT },
    ], 1200),
  },
  'school_zh': {
    id: 'school_zh', text: '学校', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.1, -0.25, 0], shape: FLAT },
      { wrist: [0.1, -0.25, 0], shape: FLAT },
      { wrist: [0, -0.15, 0], shape: FIST },
    ], 1500),
  },
  'school_en': {
    id: 'school_en', text: 'School', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.1, -0.25, 0], shape: FLAT },
      { wrist: [0.1, -0.25, 0], shape: FLAT },
    ], 1500),
  },
  'hospital_zh': {
    id: 'hospital_zh', text: '医院', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
      { wrist: [0, -0.35, 0], shape: OPEN_PALM },
    ], 1500),
  },
  'hospital_en': {
    id: 'hospital_en', text: 'Hospital', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: POINT },
      { wrist: [0, -0.35, 0], shape: OPEN_PALM },
    ], 1500),
  },

  // ---------- 常用名词 ----------
  'water_zh': {
    id: 'water_zh', text: '水', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.1, -0.35, 0], shape: FIST },
      { wrist: [0.08, -0.2, 0.1], shape: FIST },
    ], 1000),
  },
  'water_en': {
    id: 'water_en', text: 'Water', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.1, -0.35, 0], shape: FIST },
      { wrist: [0.08, -0.2, 0.1], shape: FIST },
    ], 1000),
  },
  'food_zh': {
    id: 'food_zh', text: '饭', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.1, -0.3, 0.1], shape: FIST },
      { wrist: [0.05, -0.15, 0.15], shape: FIST },
    ], 1000),
  },
  'food_en': {
    id: 'food_en', text: 'Food', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.1, -0.3, 0.1], shape: FIST },
      { wrist: [0.05, -0.15, 0.15], shape: FIST },
    ], 1000),
  },
  'friend_zh': {
    id: 'friend_zh', text: '朋友', language: 'zh', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.15, -0.25, 0], shape: FIST },
      { wrist: [0.15, -0.25, 0], shape: FIST },
      { wrist: [0, -0.25, 0], shape: FIST },
    ], 1500),
  },
  'friend_en': {
    id: 'friend_en', text: 'Friend', language: 'en', duration: 1500,
    gestures: makeGesture([
      { wrist: [-0.15, -0.25, 0], shape: FIST },
      { wrist: [0.15, -0.25, 0], shape: FIST },
    ], 1500),
  },
  'time_zh': {
    id: 'time_zh', text: '时间', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FIST },
      { wrist: [0.1, -0.25, 0], shape: POINT },
    ], 1200),
  },
  'time_en': {
    id: 'time_en', text: 'Time', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.2, 0], shape: FIST },
      { wrist: [0.1, -0.25, 0], shape: POINT },
    ], 1200),
  },
  'money_zh': {
    id: 'money_zh', text: '钱', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: FIST },
      { wrist: [0.05, -0.3, 0], shape: FIST },
    ], 1000),
  },
  'money_en': {
    id: 'money_en', text: 'Money', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: FIST },
      { wrist: [0.05, -0.3, 0], shape: FIST },
    ], 1000),
  },

  // ---------- 颜色 ----------
  'red_zh': {
    id: 'red_zh', text: '红', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.05, -0.15, 0.1], shape: FIST },
      { wrist: [0.05, -0.25, 0.1], shape: FIST },
    ], 1000),
  },
  'red_en': {
    id: 'red_en', text: 'Red', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0.05, -0.15, 0.1], shape: FIST },
      { wrist: [0.05, -0.25, 0.1], shape: FIST },
    ], 1000),
  },
  'blue_zh': {
    id: 'blue_zh', text: '蓝', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: OPEN_PALM },
    ], 1000),
  },
  'blue_en': {
    id: 'blue_en', text: 'Blue', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OPEN_PALM },
      { wrist: [0, -0.4, 0], shape: OPEN_PALM },
    ], 1000),
  },
  'green_zh': {
    id: 'green_zh', text: '绿', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: POINT },
      { wrist: [0.05, -0.35, 0], shape: POINT },
    ], 1000),
  },
  'green_en': {
    id: 'green_en', text: 'Green', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: POINT },
      { wrist: [0.05, -0.35, 0], shape: POINT },
    ], 1000),
  },

  // ---------- 能力/状态 ----------
  'can_zh': {
    id: 'can_zh', text: '可以', language: 'zh', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OK },
      { wrist: [0.1, -0.35, 0], shape: OK },
    ], 1000),
  },
  'can_en': {
    id: 'can_en', text: 'Can', language: 'en', duration: 1000,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OK },
      { wrist: [0.1, -0.35, 0], shape: OK },
    ], 1000),
  },
  'know_zh': {
    id: 'know_zh', text: '知道', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.05, -0.15, 0.1], shape: FIST },
      { wrist: [0.05, -0.25, 0.1], shape: FIST },
    ], 1200),
  },
  'know_en': {
    id: 'know_en', text: 'Know', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0.05, -0.15, 0.1], shape: FIST },
      { wrist: [0.05, -0.25, 0.1], shape: FIST },
    ], 1200),
  },
  'want_zh': {
    id: 'want_zh', text: '想要', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.2, 0.1], shape: FIST },
    ], 1200),
  },
  'want_en': {
    id: 'want_en', text: 'Want', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.3, 0], shape: OPEN_PALM },
      { wrist: [0.1, -0.2, 0.1], shape: FIST },
    ], 1200),
  },
  'need_zh': {
    id: 'need_zh', text: '需要', language: 'zh', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: FIST },
      { wrist: [0.1, -0.3, 0], shape: FIST },
    ], 1200),
  },
  'need_en': {
    id: 'need_en', text: 'Need', language: 'en', duration: 1200,
    gestures: makeGesture([
      { wrist: [0, -0.25, 0], shape: FIST },
      { wrist: [0.1, -0.3, 0], shape: FIST },
    ], 1200),
  },
};

// ============================================================
// 文本 → 手语ID 映射
// ============================================================

export const textToSignId = (text: string, language: 'zh' | 'en'): string | null => {
  const lowerText = text.toLowerCase().trim();

  const mappings: Record<string, string> = {
    // 问候
    '你好': 'hello_zh', 'hello': 'hello_en', 'hi': 'hello_en',
    '再见': 'goodbye_zh', 'goodbye': 'goodbye_en', 'bye': 'goodbye_en',
    '早上好': 'good_morning_zh', 'good morning': 'good_morning_en',
    '晚安': 'good_night_zh', 'good night': 'good_night_en',
    '欢迎': 'welcome_zh', 'welcome': 'welcome_en',
    // 礼貌
    '谢谢': 'thank_you_zh', '感谢': 'thank_you_zh', 'thank you': 'thank_you_en', 'thanks': 'thank_you_en',
    '对不起': 'sorry_zh', '抱歉': 'sorry_zh', 'sorry': 'sorry_en',
    '请': 'please_zh', 'please': 'please_en',
    // 应答
    '是': 'yes_zh', '对': 'yes_zh', 'yes': 'yes_en', 'yeah': 'yes_en',
    '不': 'no_zh', '不是': 'no_zh', 'no': 'no_en', 'nope': 'no_en',
    '好': 'good_zh', 'good': 'good_en', 'great': 'good_en',
    '好的': 'ok_zh', 'ok': 'ok_en', 'okay': 'ok_en',
    // 代词
    '我': 'i_zh', 'i': 'i_en', 'me': 'i_en',
    '你': 'you_zh', 'you': 'you_en',
    '他': 'he_zh', '她': 'he_zh', 'he': 'he_en', 'she': 'he_en',
    '我们': 'we_zh', '咱们': 'we_zh', 'we': 'we_en', 'us': 'we_en',
    // 疑问
    '什么': 'what_zh', 'what': 'what_en',
    '哪里': 'where_zh', '哪儿': 'where_zh', 'where': 'where_en',
    '谁': 'who_zh', 'who': 'who_en',
    '为什么': 'why_zh', '为啥': 'why_zh', 'why': 'why_en',
    // 动作
    '帮助': 'help_zh', '帮忙': 'help_zh', 'help': 'help_en',
    '吃': 'eat_zh', '吃饭': 'eat_zh', 'eat': 'eat_en',
    '喝': 'drink_zh', '喝水': 'drink_zh', 'drink': 'drink_en',
    '睡': 'sleep_zh', '睡觉': 'sleep_zh', 'sleep': 'sleep_en',
    '工作': 'work_zh', '上班': 'work_zh', 'work': 'work_en',
    '学习': 'study_zh', '上学': 'study_zh', 'study': 'study_en',
    // 情感
    '爱': 'love_zh', 'love': 'love_en',
    '喜欢': 'like_zh', 'like': 'like_en',
    '开心': 'happy_zh', '高兴': 'happy_zh', 'happy': 'happy_en',
    '难过': 'sad_zh', '伤心': 'sad_zh', 'sad': 'sad_en',
    // 数字
    '一': 'one_zh', '1': 'one_zh', 'one': 'one_en',
    '二': 'two_zh', '2': 'two_zh', 'two': 'two_en',
    '三': 'three_zh', '3': 'three_zh', 'three': 'three_en',
    '五': 'five_zh', '5': 'five_zh', 'five': 'five_en',
    // 地点
    '家': 'home_zh', 'home': 'home_en', 'house': 'home_en',
    '学校': 'school_zh', 'school': 'school_en',
    '医院': 'hospital_zh', 'hospital': 'hospital_en',
    // 名词
    '水': 'water_zh', 'water': 'water_en',
    '饭': 'food_zh', '食物': 'food_zh', 'food': 'food_en',
    '朋友': 'friend_zh', 'friend': 'friend_en', 'friends': 'friend_en',
    '时间': 'time_zh', 'time': 'time_en',
    '钱': 'money_zh', 'money': 'money_en',
    // 颜色
    '红': 'red_zh', '红色': 'red_zh', 'red': 'red_en',
    '蓝': 'blue_zh', '蓝色': 'blue_zh', 'blue': 'blue_en',
    '绿': 'green_zh', '绿色': 'green_zh', 'green': 'green_en',
    // 能力
    '可以': 'can_zh', '能': 'can_zh', 'can': 'can_en',
    '知道': 'know_zh', '懂': 'know_zh', 'know': 'know_en',
    '想要': 'want_zh', '想': 'want_zh', 'want': 'want_en',
    '需要': 'need_zh', '需': 'need_zh', 'need': 'need_en',
  };

  return mappings[lowerText] || null;
};

export const getSignAction = (text: string, language: 'zh' | 'en'): SignAction | null => {
  const signId = textToSignId(text, language);
  if (!signId) return null;
  return signDictionary[signId] || null;
};

// 导出词典统计信息
export const getDictionaryStats = () => {
  const entries = Object.keys(signDictionary);
  const zhEntries = entries.filter((k) => k.endsWith('_zh'));
  const enEntries = entries.filter((k) => k.endsWith('_en'));
  return { total: entries.length, zh: zhEntries.length, en: enEntries.length };
};
