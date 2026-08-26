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
    } else {
      i++;
    }
  }
  return result;
};

const tokenizeEnglish = (text: string): TokenInfo[] => {
  const result: TokenInfo[] = [];
  const regex = /[a-zA-Z0-9]+/g;
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

const findLongestPhraseMatch = (
  tokens: TokenInfo[],
  language: Language,
  startIndex: number
): { signId: string | null; consumed: number } => {
  for (let len = Math.min(4, tokens.length - startIndex); len >= 1; len--) {
    const phrase = tokens.slice(startIndex, startIndex + len).map((t) => t.text).join(' ').trim();
    const signId = textToSignId(phrase, language);
    if (signId) {
      return { signId, consumed: len };
    }
  }
  return { signId: null, consumed: 1 };
};

export const generateSignSequence = (text: string, language: Language): SignSequence => {
  if (!text.trim()) {
    return { actions: [], totalDuration: 0, tokens: [], tokenSpans: [] };
  }

  const tokens = hasChinese(text) ? tokenizeChinese(text) : tokenizeEnglish(text);
  const actions: SignAction[] = [];
  const matchedTokens: string[] = [];
  const tokenSpans: { start: number; end: number }[] = [];

  let i = 0;
  while (i < tokens.length) {
    const { signId, consumed } = findLongestPhraseMatch(tokens, language, i);
    if (signId) {
      const action = signDictionary[signId];
      if (action) {
        actions.push(action);
        // 记录这个action对应的原始文本（合并多个token）
        const combinedText = tokens.slice(i, i + consumed).map((t) => t.text).join(hasChinese(text) ? '' : ' ');
        matchedTokens.push(combinedText);
        tokenSpans.push({
          start: tokens[i].start,
          end: tokens[i + consumed - 1].end,
        });
      }
    }
    i += consumed;
  }

  const totalDuration = actions.reduce((sum, action) => sum + action.duration, 0);

  return {
    actions,
    totalDuration: totalDuration + (actions.length > 1 ? (actions.length - 1) * 200 : 0),
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
        thumb: [[0.1, -0.1, 0], [0.15, -0.15, 0], [0.2, -0.2, 0], [0.25, -0.25, 0]],
        index: [[0.1, -0.2, 0], [0.1, -0.3, 0], [0.1, -0.4, 0], [0.1, -0.5, 0]],
        middle: [[0.05, -0.2, 0], [0.05, -0.3, 0], [0.05, -0.4, 0], [0.05, -0.5, 0]],
        ring: [[-0.05, -0.2, 0], [-0.05, -0.3, 0], [-0.05, -0.4, 0], [-0.05, -0.5, 0]],
        pinky: [[-0.1, -0.2, 0], [-0.1, -0.3, 0], [-0.1, -0.4, 0], [-0.1, -0.5, 0]],
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
