import { SignAction, Language, HandPosition } from '@/types';
import { signDictionary, textToSignId } from '@/data/signDictionary';

export interface SignSequence {
  actions: SignAction[];
  totalDuration: number;
  /** 每个action对应的原始文本token，用于文字高亮同步 */
  tokens: string[];
  /** token在原始文本中的起止索引 */
  tokenSpans: { start: number; end: number }[];
}

const hasChinese = (text: string): boolean => /[\u4e00-\u9fa5]/.test(text);

interface TokenInfo {
  text: string;
  start: number;
  end: number;
}

const tokenizeChinese = (text: string): TokenInfo[] => {
  const result: TokenInfo[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/[\u4e00-\u9fa5]/.test(ch)) {
      result.push({ text: ch, start: i, end: i + 1 });
      i++;
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      let word = '';
      const start = i;
      while (i < text.length && /[a-zA-Z0-9]/.test(text[i])) {
        word += text[i];
        i++;
      }
      result.push({ text: word.toLowerCase(), start, end: i });
    } else if (/\s/.test(ch)) {
      i++;
    } else {
      // 标点符号也作为token，用轻微停顿手势表示
      result.push({ text: ch, start: i, end: i + 1 });
      i++;
    }
  }
  return result;
};

const tokenizeEnglish = (text: string): TokenInfo[] => {
  const result: TokenInfo[] = [];
  const regex = /[a-zA-Z0-9]+|[^\s]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    result.push({
      text: match[0].toLowerCase(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return result;
};

// ============================================================
// 指拼（Fingerspelling）兜底手势
// ============================================================

// 基础手型用于指拼
const makeFinger = (
  baseX: number,
  baseY: number,
  length: number,
  spread: number = 0,
  curl: number = 0
): [number, number, number][] => {
  const joints: [number, number, number][] = [];
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

const FIST_FS: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.04, -0.08, 0.1, 0.02, 2),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.05, -0.08, 0.08, -0.05, 2),
};

const OPEN_FS: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.08, -0.05, 0.18, 0.12, 0),
  index: makeFinger(0.06, -0.1, 0.32, 0.02, 0),
  middle: makeFinger(0.02, -0.1, 0.35, 0, 0),
  ring: makeFinger(-0.02, -0.1, 0.32, -0.02, 0),
  pinky: makeFinger(-0.06, -0.1, 0.26, -0.06, 0),
};

const POINT_FS: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.04, -0.1, 0.35, 0.02, 0),
  middle: makeFinger(0.01, -0.08, 0.1, 0, 2),
  ring: makeFinger(-0.02, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.05, -0.08, 0.08, -0.05, 2),
};

const PEACE_FS: Omit<HandPosition, 'wrist'> = {
  thumb: makeFinger(0.06, 0, 0.12, 0.08, 1),
  index: makeFinger(0.05, -0.1, 0.32, 0.04, 0),
  middle: makeFinger(0.0, -0.1, 0.32, -0.04, 0),
  ring: makeFinger(-0.03, -0.08, 0.1, -0.02, 2),
  pinky: makeFinger(-0.06, -0.08, 0.08, -0.05, 2),
};

// 指拼字母手型（简化版ASL指拼）
const fingerspellingShapes: Record<string, Omit<HandPosition, 'wrist'>> = {
  a: FIST_FS,
  b: OPEN_FS,
  c: { ...FIST_FS, index: makeFinger(0.04, -0.08, 0.2, 0.02, 1) },
  d: POINT_FS,
  e: { ...FIST_FS, thumb: makeFinger(0.04, -0.02, 0.1, 0.04, 1.5) },
  f: { ...OPEN_FS, thumb: makeFinger(0.04, -0.04, 0.14, 0.06, 0.5), index: makeFinger(0.04, -0.06, 0.14, 0.02, 0.8) },
  g: POINT_FS,
  h: { ...POINT_FS, middle: makeFinger(0.0, -0.1, 0.32, -0.02, 0) },
  i: { ...FIST_FS, pinky: makeFinger(-0.06, -0.1, 0.26, -0.06, 0) },
  j: { ...FIST_FS, pinky: makeFinger(-0.06, -0.1, 0.26, -0.06, 0) },
  k: { ...POINT_FS, middle: makeFinger(0.0, -0.1, 0.3, -0.03, 0) },
  l: { ...FIST_FS, index: makeFinger(0.04, -0.1, 0.35, 0.02, 0), thumb: makeFinger(0.08, -0.05, 0.18, 0.12, 0) },
  m: { ...FIST_FS, index: makeFinger(0.04, -0.08, 0.15, 0.02, 1.5), middle: makeFinger(0.01, -0.08, 0.15, 0, 1.5), ring: makeFinger(-0.02, -0.08, 0.15, -0.02, 1.5) },
  n: { ...FIST_FS, index: makeFinger(0.04, -0.08, 0.15, 0.02, 1.5), middle: makeFinger(0.01, -0.08, 0.15, 0, 1.5) },
  o: { ...FIST_FS, thumb: makeFinger(0.04, -0.02, 0.14, 0.06, 0.5), index: makeFinger(0.04, -0.06, 0.14, 0.02, 0.8) },
  p: { ...POINT_FS, thumb: makeFinger(0.04, -0.02, 0.14, 0.06, 0.5) },
  q: { ...POINT_FS, thumb: makeFinger(0.04, -0.02, 0.14, 0.06, 0.5) },
  r: PEACE_FS,
  s: FIST_FS,
  t: { ...FIST_FS, index: makeFinger(0.04, -0.06, 0.12, 0.02, 1.8) },
  u: { ...FIST_FS, index: makeFinger(0.04, -0.1, 0.32, 0.01, 0), middle: makeFinger(0.01, -0.1, 0.32, -0.01, 0) },
  v: PEACE_FS,
  w: { ...FIST_FS, index: makeFinger(0.05, -0.1, 0.3, 0.03, 0), middle: makeFinger(0.01, -0.1, 0.32, 0, 0), ring: makeFinger(-0.03, -0.1, 0.3, -0.03, 0) },
  x: { ...FIST_FS, index: makeFinger(0.04, -0.08, 0.2, 0.02, 1.2) },
  y: { ...FIST_FS, thumb: makeFinger(0.08, -0.02, 0.22, 0.12, 0), pinky: makeFinger(-0.07, -0.1, 0.26, -0.06, 0) },
  z: { ...POINT_FS, index: makeFinger(0.04, -0.1, 0.35, 0.02, 0) },
};

// 生成指拼手势（单个字母/字符）
const makeFingerspellingAction = (char: string, language: Language): SignAction => {
  const lower = char.toLowerCase();
  const shape = fingerspellingShapes[lower] || FIST_FS;
  // 指拼时手腕位置根据字符做微小偏移，使连续指拼有变化
  const code = lower.charCodeAt(0) || 0;
  const offsetX = ((code % 5) - 2) * 0.03;
  const offsetY = ((code % 3) - 1) * 0.02;
  return {
    id: `fs_${language}_${lower}`,
    text: char,
    language,
    duration: 500,
    gestures: [
      {
        timestamp: 0,
        handPositions: [{
          wrist: [offsetX, -0.25 + offsetY, 0],
          ...shape,
        }],
      },
    ],
  };
};

// 标点符号用短暂停顿手势
const makePunctuationAction = (char: string, language: Language): SignAction => ({
  id: `punct_${language}_${char.charCodeAt(0)}`,
  text: char,
  language,
  duration: 300,
  gestures: [
    {
      timestamp: 0,
      handPositions: [{
        wrist: [0, -0.2, 0],
        ...FIST_FS,
      }],
    },
  ],
});

// 判断是否为标点
const isPunctuation = (ch: string): boolean => /[，。！？、；：""''（）【】《》…—,.!?;:'"()\[\]{}<>]/.test(ch);

// ============================================================
// 最长短语匹配
// ============================================================

const findLongestPhraseMatch = (
  tokens: TokenInfo[],
  language: Language,
  startIndex: number
): { signId: string | null; consumed: number } => {
  // 中文最多尝试4字组合，英文最多尝试3词组合
  const maxLen = language === 'zh' ? 4 : 3;
  for (let len = Math.min(maxLen, tokens.length - startIndex); len >= 1; len--) {
    const phraseTokens = tokens.slice(startIndex, startIndex + len);
    // 跳过包含标点的组合
    if (phraseTokens.some((t) => isPunctuation(t.text))) continue;
    const phrase = phraseTokens.map((t) => t.text).join(language === 'zh' ? '' : ' ').trim();
    const signId = textToSignId(phrase, language);
    if (signId) {
      return { signId, consumed: len };
    }
  }
  return { signId: null, consumed: 1 };
};

// ============================================================
// 生成手语序列 —— 确保每个token都有对应手势（无遗漏）
// ============================================================

export const generateSignSequence = (text: string, language: Language): SignSequence => {
  if (!text.trim()) {
    return { actions: [], totalDuration: 0, tokens: [], tokenSpans: [] };
  }

  const detectedLang = hasChinese(text) ? 'zh' : 'en';
  const actualLang: Language = detectedLang;
  const tokens = actualLang === 'zh' ? tokenizeChinese(text) : tokenizeEnglish(text);
  const actions: SignAction[] = [];
  const matchedTokens: string[] = [];
  const tokenSpans: { start: number; end: number }[] = [];

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];

    // 标点符号：用停顿手势
    if (isPunctuation(token.text)) {
      actions.push(makePunctuationAction(token.text, actualLang));
      matchedTokens.push(token.text);
      tokenSpans.push({ start: token.start, end: token.end });
      i++;
      continue;
    }

    // 尝试最长短语匹配
    const { signId, consumed } = findLongestPhraseMatch(tokens, actualLang, i);

    if (signId) {
      const action = signDictionary[signId];
      if (action) {
        actions.push(action);
        const combinedText = tokens
          .slice(i, i + consumed)
          .map((t) => t.text)
          .join(actualLang === 'zh' ? '' : ' ');
        matchedTokens.push(combinedText);
        tokenSpans.push({
          start: tokens[i].start,
          end: tokens[i + consumed - 1].end,
        });
        i += consumed;
        continue;
      }
    }

    // 无匹配：使用指拼兜底
    if (actualLang === 'en' && /^[a-z]$/i.test(token.text)) {
      // 英文单字母：直接指拼
      actions.push(makeFingerspellingAction(token.text, actualLang));
      matchedTokens.push(token.text);
      tokenSpans.push({ start: token.start, end: token.end });
    } else if (actualLang === 'en' && /^[a-z0-9]+$/i.test(token.text)) {
      // 英文单词无匹配：逐字母指拼
      for (let ci = 0; ci < token.text.length; ci++) {
        const ch = token.text[ci];
        if (/[a-z]/i.test(ch)) {
          actions.push(makeFingerspellingAction(ch, actualLang));
        } else {
          actions.push(makePunctuationAction(ch, actualLang));
        }
        matchedTokens.push(ch);
        tokenSpans.push({
          start: token.start + ci,
          end: token.start + ci + 1,
        });
      }
    } else {
      // 中文字符无匹配：使用指拼兜底（用字符编码偏移生成独特手势）
      const fallbackAction = makeFingerspellingAction(token.text, actualLang);
      actions.push(fallbackAction);
      matchedTokens.push(token.text);
      tokenSpans.push({ start: token.start, end: token.end });
    }
    i += consumed;
  }

  const totalDuration = actions.reduce((sum, action) => sum + action.duration, 0);

  return {
    actions,
    totalDuration: totalDuration + (actions.length > 1 ? (actions.length - 1) * 150 : 0),
    tokens: matchedTokens,
    tokenSpans,
  };
};

export const getFallbackSign = (language: Language): SignAction => ({
  id: `fallback_${language}`,
  text: language === 'zh' ? '未知' : 'Unknown',
  language,
  duration: 1000,
  gestures: [
    {
      timestamp: 0,
      handPositions: [{
        wrist: [0, -0.3, 0],
        thumb: makeFinger(0.1, -0.1, 0, 0.12, 0),
        index: makeFinger(0.1, -0.2, 0, 0.02, 0),
        middle: makeFinger(0.05, -0.2, 0, 0, 0),
        ring: makeFinger(-0.05, -0.2, 0, -0.02, 0),
        pinky: makeFinger(-0.1, -0.2, 0, -0.06, 0),
      }],
    },
  ],
});

export const normalizeHandPosition = (position: number[]): [number, number, number] => {
  const [x = 0, y = 0, z = 0] = position;
  return [x, y, z];
};

export const handPositionToLandmarkArray = (hand: HandPosition): number[][] => {
  const arr: number[][] = [];
  arr.push(hand.wrist);
  hand.thumb.forEach((p) => arr.push(p));
  hand.index.forEach((p) => arr.push(p));
  hand.middle.forEach((p) => arr.push(p));
  hand.ring.forEach((p) => arr.push(p));
  hand.pinky.forEach((p) => arr.push(p));
  return arr;
};
