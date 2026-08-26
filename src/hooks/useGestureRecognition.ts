import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Hands, Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { GestureDetection } from '@/types';
import { signDictionary } from '@/data/signDictionary';
import { handPositionToLandmarkArray } from '@/utils/signEngine';
import { GESTURE_CONFIDENCE_THRESHOLD, GESTURE_DEBOUNCE_MS } from '@/utils/constants';

interface UseGestureRecognitionReturn {
  gesture: GestureDetection;
  isModelLoaded: boolean;
  error: string | null;
}

// ============================================================
// 工具函数
// ============================================================

const toNumberArray = (landmarks: NormalizedLandmarkList): number[][] => {
  return landmarks.map((lm) => [lm.x, lm.y, lm.z ?? 0]);
};

/** 归一化：以手腕为原点，手掌大小为尺度 */
const normalizeLandmarks = (landmarks: number[][]): number[][] => {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const scale = Math.sqrt(
    Math.pow(middleMcp[0] - wrist[0], 2) +
      Math.pow(middleMcp[1] - wrist[1], 2) +
      Math.pow(middleMcp[2] - wrist[2], 2)
  );
  const safeScale = scale < 0.001 ? 1 : scale;

  return landmarks.map((point) => [
    (point[0] - wrist[0]) / safeScale,
    (point[1] - wrist[1]) / safeScale,
    (point[2] - wrist[2]) / safeScale,
  ]);
};

/** 欧氏距离（逐点平均） */
const euclideanDistance = (a: number[][], b: number[][]): number => {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const dx = a[i][0] - b[i][0];
    const dy = a[i][1] - b[i][1];
    const dz = a[i][2] - b[i][2];
    sum += dx * dx + dy * dy + dz * dz;
  }
  return Math.sqrt(sum / len);
};

// ============================================================
// Vibe Coding：精细特征提取
// ============================================================

interface HandFeatures {
  /** 手指弯曲度：0=伸直，1=完全弯曲 */
  fingerCurl: [number, number, number, number, number];
  /** 手掌法向量（归一化） */
  palmNormal: [number, number, number];
  /** 指尖相对手掌中心的位置（归一化） */
  fingertipPositions: [number, number, number][];
  /** 手指间夹角 */
  fingerSpread: number[];
}

/** 计算单根手指的弯曲度（0=直，1=弯） */
const calculateFingerCurl = (landmarks: number[][], mcpIdx: number, pipIdx: number, dipIdx: number, tipIdx: number): number => {
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const dip = landmarks[dipIdx];
  const tip = landmarks[tipIdx];

  // 向量：MCP→PIP, PIP→DIP, DIP→TIP
  const v1 = [pip[0] - mcp[0], pip[1] - mcp[1], pip[2] - mcp[2]];
  const v2 = [dip[0] - pip[0], dip[1] - pip[1], dip[2] - pip[2]];
  const v3 = [tip[0] - dip[0], tip[1] - dip[1], tip[2] - dip[2]];

  // 辅助：向量模长
  const vecLen = (v: number[]) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // 辅助：向量夹角
  const vecAngle = (a: number[], b: number[]) => {
    const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const denom = vecLen(a) * vecLen(b) + 0.001;
    return Math.acos(Math.max(-1, Math.min(1, dot / denom)));
  };

  const angle1 = vecAngle(v1, v2);
  const angle2 = vecAngle(v2, v3);

  // 归一化到0-1（完全伸直约0，完全弯曲约PI）
  return Math.min(1, (angle1 + angle2) / Math.PI);
};

/** 提取手部精细特征 */
const extractHandFeatures = (landmarks: number[][]): HandFeatures => {
  const normalized = normalizeLandmarks(landmarks);

  // 手指弯曲度：拇指(1-4), 食指(5-8), 中指(9-12), 无名指(13-16), 小指(17-20)
  const fingerCurl: [number, number, number, number, number] = [
    calculateFingerCurl(normalized, 1, 2, 3, 4),    // 拇指
    calculateFingerCurl(normalized, 5, 6, 7, 8),    // 食指
    calculateFingerCurl(normalized, 9, 10, 11, 12), // 中指
    calculateFingerCurl(normalized, 13, 14, 15, 16), // 无名指
    calculateFingerCurl(normalized, 17, 18, 19, 20), // 小指
  ];

  // 手掌法向量：用 wrist(0), index_mcp(5), pinky_mcp(17) 构成平面
  const w = normalized[0];
  const im = normalized[5];
  const pm = normalized[17];
  const v1 = [im[0] - w[0], im[1] - w[1], im[2] - w[2]];
  const v2 = [pm[0] - w[0], pm[1] - w[1], pm[2] - w[2]];
  const normal = [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ];
  const nLen = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]) + 0.001;
  const palmNormal: [number, number, number] = [normal[0] / nLen, normal[1] / nLen, normal[2] / nLen];

  // 指尖相对位置
  const palmCenter = normalized[9]; // 中指MCP近似手掌中心
  const fingertipPositions: [number, number, number][] = [4, 8, 12, 16, 20].map((idx) => [
    normalized[idx][0] - palmCenter[0],
    normalized[idx][1] - palmCenter[1],
    normalized[idx][2] - palmCenter[2],
  ]) as [number, number, number][];

  // 手指间夹角（相邻指尖相对于手腕的角度）
  const fingerSpread: number[] = [];
  const tipIndices = [4, 8, 12, 16, 20];
  for (let i = 0; i < tipIndices.length - 1; i++) {
    const a = normalized[tipIndices[i]];
    const b = normalized[tipIndices[i + 1]];
    const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const magA = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) + 0.001;
    const magB = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]) + 0.001;
    fingerSpread.push(Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB)))));
  }

  return { fingerCurl, palmNormal, fingertipPositions, fingerSpread };
};

/** 特征距离（加权组合） */
const featureDistance = (f1: HandFeatures, f2: HandFeatures): number => {
  // 手指弯曲度距离（权重高）
  let curlDist = 0;
  for (let i = 0; i < 5; i++) {
    curlDist += Math.abs(f1.fingerCurl[i] - f2.fingerCurl[i]);
  }
  curlDist /= 5;

  // 手掌朝向距离
  const normalDot = f1.palmNormal[0] * f2.palmNormal[0] + f1.palmNormal[1] * f2.palmNormal[1] + f1.palmNormal[2] * f2.palmNormal[2];
  const normalDist = 1 - Math.abs(normalDot); // 0=同向, 1=垂直

  // 指尖位置距离
  let tipDist = 0;
  for (let i = 0; i < 5; i++) {
    const dx = f1.fingertipPositions[i][0] - f2.fingertipPositions[i][0];
    const dy = f1.fingertipPositions[i][1] - f2.fingertipPositions[i][1];
    const dz = f1.fingertipPositions[i][2] - f2.fingertipPositions[i][2];
    tipDist += Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  tipDist /= 5;

  // 手指张开距离
  let spreadDist = 0;
  for (let i = 0; i < f1.fingerSpread.length; i++) {
    spreadDist += Math.abs(f1.fingerSpread[i] - f2.fingerSpread[i]);
  }
  spreadDist /= Math.max(1, f1.fingerSpread.length);

  // 加权组合
  return curlDist * 0.35 + normalDist * 0.2 + tipDist * 0.3 + spreadDist * 0.15;
};

// ============================================================
// 时序平滑滤波器
// ============================================================

class TemporalSmoother {
  private buffer: number[][][] = [];
  private maxSize: number;

  constructor(maxSize = 5) {
    this.maxSize = maxSize;
  }

  push(landmarks: number[][]): number[][] {
    this.buffer.push(landmarks);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
    return this.getSmoothed();
  }

  getSmoothed(): number[][] {
    if (this.buffer.length === 0) return [];
    if (this.buffer.length === 1) return this.buffer[0];

    const pointCount = this.buffer[0].length;
    const smoothed: number[][] = [];

    // 加权移动平均（越新权重越大）
    for (let i = 0; i < pointCount; i++) {
      let wx = 0, wy = 0, wz = 0, wSum = 0;
      for (let f = 0; f < this.buffer.length; f++) {
        const weight = f + 1; // 线性加权
        const point = this.buffer[f][i];
        if (point) {
          wx += point[0] * weight;
          wy += point[1] * weight;
          wz += (point[2] || 0) * weight;
          wSum += weight;
        }
      }
      smoothed.push([wx / wSum, wy / wSum, wz / wSum]);
    }
    return smoothed;
  }

  reset() {
    this.buffer = [];
  }
}

// ============================================================
// 时序投票器 —— 避免单帧误判
// ============================================================

class TemporalVoter {
  private votes: { signId: string; confidence: number }[] = [];
  private maxSize: number;
  private lastConfirmed: string | null = null;
  private lastConfirmTime = 0;

  constructor(maxSize = 8) {
    this.maxSize = maxSize;
  }

  vote(signId: string | null, confidence: number): { signId: string | null; confidence: number } {
    if (signId) {
      this.votes.push({ signId, confidence });
    }
    if (this.votes.length > this.maxSize) {
      this.votes.shift();
    }

    if (this.votes.length < 3) {
      return { signId: null, confidence: 0 };
    }

    // 统计每个signId的票数和平均置信度
    const counts: Record<string, { count: number; totalConf: number }> = {};
    for (const v of this.votes) {
      if (!counts[v.signId]) counts[v.signId] = { count: 0, totalConf: 0 };
      counts[v.signId].count++;
      counts[v.signId].totalConf += v.confidence;
    }

    // 找出得票最多的
    let bestId: string | null = null;
    let bestCount = 0;
    let bestConf = 0;
    for (const [id, data] of Object.entries(counts)) {
      if (data.count > bestCount) {
        bestCount = data.count;
        bestId = id;
        bestConf = data.totalConf / data.count;
      }
    }

    // 要求至少半数票一致，且置信度达标
    const threshold = Math.ceil(this.maxSize * 0.5);
    const now = Date.now();
    if (bestId && bestCount >= threshold && bestConf >= GESTURE_CONFIDENCE_THRESHOLD * 0.8) {
      // 滞回：如果和上次确认不同，需要更高的票数
      if (bestId !== this.lastConfirmed && bestCount < threshold + 1) {
        return { signId: this.lastConfirmed, confidence: bestConf * 0.7 };
      }
      this.lastConfirmed = bestId;
      this.lastConfirmTime = now;
      return { signId: bestId, confidence: bestConf };
    }

    // 保留上次确认结果一小段时间（防抖）
    if (this.lastConfirmed && now - this.lastConfirmTime < 500) {
      return { signId: this.lastConfirmed, confidence: bestConf * 0.6 };
    }

    return { signId: null, confidence: 0 };
  }

  reset() {
    this.votes = [];
    this.lastConfirmed = null;
    this.lastConfirmTime = 0;
  }
}

// ============================================================
// 模板构建 —— 使用所有手势帧，提取特征
// ============================================================

interface GestureTemplate {
  signId: string;
  text: string;
  /** 所有帧的归一化关键点 */
  frames: number[][][];
  /** 所有帧的特征 */
  features: HandFeatures[];
}

const buildGestureTemplates = (): GestureTemplate[] => {
  const templates: GestureTemplate[] = [];

  Object.values(signDictionary).forEach((action) => {
    if (action.gestures.length === 0) return;
    const frames: number[][][] = [];
    const features: HandFeatures[] = [];

    for (const frame of action.gestures) {
      const hand = frame.handPositions[0];
      if (!hand) continue;
      const landmarks = handPositionToLandmarkArray(hand);
      const normalized = normalizeLandmarks(landmarks);
      frames.push(normalized);
      features.push(extractHandFeatures(normalized));
    }

    if (frames.length > 0) {
      templates.push({ signId: action.id, text: action.text, frames, features });
    }
  });

  return templates;
};

/** 多帧模板匹配：输入与模板的所有帧比较，取最小距离 */
const matchTemplate = (
  inputLandmarks: number[][],
  inputFeatures: HandFeatures,
  template: GestureTemplate
): { distance: number; frameIndex: number } => {
  let bestDistance = Infinity;
  let bestFrame = 0;

  for (let i = 0; i < template.frames.length; i++) {
    // 关键点距离
    const lmDist = euclideanDistance(inputLandmarks, template.frames[i]);
    // 特征距离
    const featDist = featureDistance(inputFeatures, template.features[i]);
    // 融合
    const combined = lmDist * 0.4 + featDist * 0.6;

    if (combined < bestDistance) {
      bestDistance = combined;
      bestFrame = i;
    }
  }

  return { distance: bestDistance, frameIndex: bestFrame };
};

const distanceToConfidence = (distance: number): number => {
  const maxDistance = 1.8;
  return Math.max(0, Math.min(1, 1 - distance / maxDistance));
};

// ============================================================
// 主 Hook
// ============================================================

export function useGestureRecognition(
  videoRef: React.RefObject<HTMLVideoElement>,
  isActive: boolean
): UseGestureRecognitionReturn {
  const [gesture, setGesture] = useState<GestureDetection>({
    detected: false,
    signId: null,
    confidence: 0,
    landmarks: null,
  });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const lastDetectionRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const smootherRef = useRef<TemporalSmoother>(new TemporalSmoother(5));
  const voterRef = useRef<TemporalVoter>(new TemporalVoter(8));

  const templates = useMemo(() => buildGestureTemplates(), []);

  const processResults = useCallback((results: Results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      smootherRef.current.reset();
      voterRef.current.reset();
      setGesture({ detected: false, signId: null, confidence: 0, landmarks: null });
      return;
    }

    const rawLandmarks = toNumberArray(results.multiHandLandmarks[0]);

    // 1. 时序平滑
    const smoothed = smootherRef.current.push(rawLandmarks);
    if (smoothed.length < 21) return;

    // 2. 归一化
    const normalized = normalizeLandmarks(smoothed);

    // 3. 提取精细特征
    const features = extractHandFeatures(smoothed);

    // 4. 多模板匹配
    let bestSignId: string | null = null;
    let bestDistance = Infinity;

    for (const template of templates) {
      const { distance } = matchTemplate(normalized, features, template);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSignId = template.signId;
      }
    }

    const rawConfidence = distanceToConfidence(bestDistance);

    // 5. 时序投票（避免单帧闪烁）
    const voted = voterRef.current.vote(bestSignId, rawConfidence);

    // 6. 防抖
    const now = Date.now();
    if (voted.signId && voted.confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
      if (now - lastDetectionRef.current >= GESTURE_DEBOUNCE_MS * 0.6) {
        lastDetectionRef.current = now;
        setGesture({
          detected: true,
          signId: voted.signId,
          confidence: voted.confidence,
          landmarks: smoothed,
        });
      } else {
        // 防抖期内只更新landmarks和置信度
        setGesture((prev) => ({
          ...prev,
          confidence: voted.confidence,
          landmarks: smoothed,
        }));
      }
    } else {
      setGesture({
        detected: false,
        signId: null,
        confidence: rawConfidence,
        landmarks: smoothed,
      });
    }
  }, [templates]);

  useEffect(() => {
    if (!isActive) {
      smootherRef.current.reset();
      voterRef.current.reset();
      setGesture({ detected: false, signId: null, confidence: 0, landmarks: null });
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      return;
    }

    let isMounted = true;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {
      if (!isMounted) return;
      processResults(results);
    });

    handsRef.current = hands;

    const detectFrame = async () => {
      if (!isMounted || !videoRef.current || !handsRef.current) return;

      try {
        await handsRef.current.send({ image: videoRef.current });
      } catch {
        // ignore frame errors
      }

      if (isMounted) {
        rafRef.current = requestAnimationFrame(detectFrame);
      }
    };

    hands
      .initialize()
      .then(() => {
        if (isMounted) {
          setIsModelLoaded(true);
          detectFrame();
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('手势识别模型加载失败，请检查网络连接');
        }
      });

    return () => {
      isMounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      hands.close().catch(() => {
        // ignore
      });
    };
  }, [isActive, videoRef, processResults]);

  return { gesture, isModelLoaded, error };
}

export default useGestureRecognition;
