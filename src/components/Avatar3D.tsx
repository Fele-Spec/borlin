import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SignAction, AvatarState, HandPosition } from '@/types';
import { getFallbackSign, handPositionToLandmarkArray } from '@/utils/signEngine';

interface Avatar3DProps {
  signActions?: SignAction[];
  avatar?: AvatarState;
  isPlaying?: boolean;
  onAnimationComplete?: () => void;
  onProgress?: (actionIndex: number, progress: number) => void;
}

// ============================================================
// 工具：两点之间生成朝向胶囊的位置+旋转
// ============================================================
const boneTransform = (start: THREE.Vector3, end: THREE.Vector3) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  if (len < 0.001) return { pos: start, quat: new THREE.Quaternion(), len: 0 };
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { pos: mid, quat, len };
};

// 指骨（带锥度的胶囊感）
const Phalanx = ({
  start,
  end,
  color,
  radius = 0.016,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  radius?: number;
}) => {
  const { pos, quat, len } = boneTransform(start, end);
  if (len < 0.001) return null;
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <capsuleGeometry args={[radius, len - radius * 2, 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.02} />
    </mesh>
  );
};

// 关节球
const Joint = ({
  position,
  color,
  size = 0.02,
}: {
  position: THREE.Vector3;
  color: string;
  size?: number;
}) => (
  <mesh position={position} castShadow>
    <sphereGeometry args={[size, 14, 14]} />
    <meshStandardMaterial color={color} roughness={0.45} metalness={0.03} />
  </mesh>
);

// ============================================================
// 精致手部模型 —— 5指完整，每指3节指骨(拇指2节)，关节清晰
// ============================================================
const DetailedHand = ({
  handPosition,
  skinColor,
  side = 'right',
}: {
  handPosition: HandPosition;
  skinColor: string;
  side?: 'left' | 'right';
}) => {
  const landmarks = useMemo(
    () => handPositionToLandmarkArray(handPosition).map((p) => new THREE.Vector3(...p)),
    [handPosition]
  );

  // 手指定义：[MCP, PIP, DIP, TIP] 对应 landmarks 索引
  // 拇指: 1(CMC),2(MCP),3(IP),4(TIP) —— 2节指骨(CMC-MCP为掌骨, MCP-IP近节, IP-TIP远节)
  // 其他: MCP,PIP,DIP,TIP —— 3节指骨
  const fingers = useMemo(
    () => [
      { name: 'thumb', joints: [1, 2, 3, 4], isThumb: true },
      { name: 'index', joints: [5, 6, 7, 8], isThumb: false },
      { name: 'middle', joints: [9, 10, 11, 12], isThumb: false },
      { name: 'ring', joints: [13, 14, 15, 16], isThumb: false },
      { name: 'pinky', joints: [17, 18, 19, 20], isThumb: false },
    ],
    []
  );

  // 手掌：用腕部到各指MCP的多边形近似
  const palmShape = useMemo(() => {
    const wrist = landmarks[0];
    const mcps = [5, 9, 13, 17].map((i) => landmarks[i]);
    // 手掌中心
    const center = new THREE.Vector3();
    [wrist, ...mcps].forEach((p) => center.add(p));
    center.multiplyScalar(0.2);
    // 手掌尺寸
    const width = mcps[0].distanceTo(mcps[3]);
    const height = wrist.distanceTo(landmarks[9]);
    return { center, width: Math.max(width, 0.08), height: Math.max(height, 0.08) };
  }, [landmarks]);

  // 指骨半径（从粗到细）
  const getRadius = (fingerIdx: number, boneIdx: number) => {
    const base = [0.018, 0.016, 0.015, 0.014, 0.012][fingerIdx] || 0.014;
    const taper = [1.0, 0.85, 0.7][boneIdx] || 0.7;
    return base * taper;
  };

  return (
    <group scale={side === 'left' ? [-1, 1, 1] : [1, 1, 1]}>
      {/* 手掌主体 —— 扁平椭球 */}
      <mesh position={palmShape.center} castShadow>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} metalness={0.02} />
        <primitive object={new THREE.Vector3(palmShape.width * 0.55, palmShape.height * 0.5, 0.025)} attach="scale" />
      </mesh>

      {/* 掌骨（腕部到MCP） */}
      {[1, 5, 9, 13, 17].map((mcpIdx, i) => (
        <Phalanx
          key={`metacarpal-${i}`}
          start={landmarks[0]}
          end={landmarks[mcpIdx]}
          color={skinColor}
          radius={0.014 + (4 - i) * 0.001}
        />
      ))}

      {/* 每根手指的指骨和关节 */}
      {fingers.map((finger, fIdx) => {
        const js = finger.joints;
        const boneCount = finger.isThumb ? 2 : 3; // 拇指2节，其他3节
        return (
          <group key={finger.name}>
            {/* 指骨 */}
            {Array.from({ length: boneCount }).map((_, bIdx) => {
              const startIdx = js[bIdx + (finger.isThumb ? 1 : 0)];
              const endIdx = js[bIdx + (finger.isThumb ? 2 : 1)];
              return (
                <Phalanx
                  key={`phalanx-${bIdx}`}
                  start={landmarks[startIdx]}
                  end={landmarks[endIdx]}
                  color={skinColor}
                  radius={getRadius(fIdx, bIdx)}
                />
              );
            })}
            {/* 关节球 */}
            {js.map((jIdx, jIdx2) => (
              <Joint
                key={`joint-${jIdx2}`}
                position={landmarks[jIdx]}
                color={skinColor}
                size={jIdx2 === 0 ? 0.022 : jIdx2 === js.length - 1 ? 0.012 : 0.016}
              />
            ))}
            {/* 指尖指甲 */}
            <mesh
              position={landmarks[js[js.length - 1]]
                .clone()
                .add(new THREE.Vector3(0, 0.004, 0.01))}
            >
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial color="#f5d5c8" roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* 腕关节 */}
      <Joint position={landmarks[0]} color={skinColor} size={0.028} />
    </group>
  );
};

// ============================================================
// 阿尼亚发型 —— 粉色短发+尖尖刘海+两侧发束
// ============================================================
const AnyaHair = ({ hairColor }: { hairColor: string }) => {
  return (
    <group>
      {/* 头顶主发团 */}
      <mesh position={[0, 1.84, -0.02]} castShadow>
        <sphereGeometry args={[0.26, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.9]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* 后脑勺头发 */}
      <mesh position={[0, 1.7, -0.18]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* 两侧发束（阿尼亚标志性侧发） */}
      <mesh position={[-0.22, 1.74, 0.02]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.06, 0.18, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
      <mesh position={[0.22, 1.74, 0.02]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.06, 0.18, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* 尖尖刘海 —— 多片三角形覆盖额头 */}
      {/* 中间主刘海 */}
      <mesh position={[0, 1.76, 0.2]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.07, 0.2, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
      {/* 左刘海 */}
      <mesh position={[-0.08, 1.77, 0.19]} rotation={[0.45, 0, 0.2]} castShadow>
        <coneGeometry args={[0.055, 0.18, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
      {/* 右刘海 */}
      <mesh position={[0.08, 1.77, 0.19]} rotation={[0.45, 0, -0.2]} castShadow>
        <coneGeometry args={[0.055, 0.18, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
      {/* 最左刘海片 */}
      <mesh position={[-0.15, 1.75, 0.17]} rotation={[0.4, 0, 0.4]} castShadow>
        <coneGeometry args={[0.045, 0.15, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
      {/* 最右刘海片 */}
      <mesh position={[0.15, 1.75, 0.17]} rotation={[0.4, 0, -0.4]} castShadow>
        <coneGeometry args={[0.045, 0.15, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* 头顶小呆毛 */}
      <mesh position={[0.02, 1.98, -0.02]} rotation={[0.1, 0, 0.15]} castShadow>
        <coneGeometry args={[0.025, 0.1, 6]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>
    </group>
  );
};

// ============================================================
// 阿尼亚面部 —— 大绿眼睛、小巧鼻嘴、圆脸
// ============================================================
const AnyaFace = ({ skinColor, eyeColor }: { skinColor: string; eyeColor: string }) => {
  return (
    <group>
      {/* 眼白（大而圆） */}
      <mesh position={[-0.085, 1.67, 0.218]}>
        <sphereGeometry args={[0.052, 20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>
      <mesh position={[0.085, 1.67, 0.218]}>
        <sphereGeometry args={[0.052, 20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>

      {/* 瞳孔（绿色，大） */}
      <mesh position={[-0.085, 1.665, 0.252]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.15} metalness={0.15} />
      </mesh>
      <mesh position={[0.085, 1.665, 0.252]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={eyeColor} roughness={0.15} metalness={0.15} />
      </mesh>

      {/* 瞳孔内高光（大高光，阿尼亚标志性眼睛） */}
      <mesh position={[-0.075, 1.678, 0.278]}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.095, 1.678, 0.278]}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      {/* 小高光 */}
      <mesh position={[-0.092, 1.655, 0.275]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.078, 1.655, 0.275]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
      </mesh>

      {/* 上眼线（细弧） */}
      <mesh position={[-0.085, 1.71, 0.235]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.04, 0.004, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.5} />
      </mesh>
      <mesh position={[0.085, 1.71, 0.235]}>
        <torusGeometry args={[0.04, 0.004, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.5} />
      </mesh>

      {/* 眉毛（细而弯，粉色系） */}
      <mesh position={[-0.085, 1.755, 0.225]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.006, 0.05, 4, 10]} />
        <meshStandardMaterial color="#d4789a" roughness={0.7} />
      </mesh>
      <mesh position={[0.085, 1.755, 0.225]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.006, 0.05, 4, 10]} />
        <meshStandardMaterial color="#d4789a" roughness={0.7} />
      </mesh>

      {/* 鼻子（小巧） */}
      <mesh position={[0, 1.6, 0.248]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.012, 0.03, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} />
      </mesh>

      {/* 嘴巴（小而精致，微笑） */}
      <mesh position={[0, 1.52, 0.238]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[0.025, 0.005, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#c2546a" roughness={0.6} />
      </mesh>

      {/* 腮红 */}
      <mesh position={[-0.14, 1.58, 0.22]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#f5a0b0" transparent opacity={0.5} roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 1.58, 0.22]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#f5a0b0" transparent opacity={0.5} roughness={0.8} />
      </mesh>
    </group>
  );
};

// ============================================================
// 阿尼亚身体 —— 伊甸学园校服
// ============================================================
const AnyaBody = ({
  skinColor,
  clothingColor,
  breathingOffset = 0,
}: {
  skinColor: string;
  clothingColor: string;
  breathingOffset?: number;
}) => {
  const chestScale = 1 + breathingOffset * 0.025;

  return (
    <group>
      {/* 头部（圆脸） */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <sphereGeometry args={[0.23, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      {/* 下巴 */}
      <mesh position={[0, 1.5, 0.015]} castShadow>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      {/* 耳朵 */}
      <mesh position={[-0.22, 1.66, 0]} castShadow>
        <sphereGeometry args={[0.04, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} />
      </mesh>
      <mesh position={[0.22, 1.66, 0]} castShadow>
        <sphereGeometry args={[0.04, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} />
      </mesh>

      {/* 颈部 */}
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.14, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* 躯干 —— 伊甸学园校服上衣（深色） */}
      <mesh position={[0, 1.04, 0]} scale={[chestScale, 1, chestScale]} castShadow>
        <capsuleGeometry args={[0.24, 0.4, 12, 24]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>

      {/* 白色衣领（彼得潘领） */}
      <mesh position={[-0.08, 1.28, 0.06]} rotation={[0.3, 0, 0.2]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
      </mesh>
      <mesh position={[0.08, 1.28, 0.06]} rotation={[0.3, 0, -0.2]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
      </mesh>
      {/* 衣领连接 */}
      <mesh position={[0, 1.27, 0.04]} rotation={[0.35, 0, 0]}>
        <torusGeometry args={[0.1, 0.018, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
      </mesh>

      {/* 红色领结/丝带 */}
      <mesh position={[0, 1.24, 0.09]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.04, 1.24, 0.085]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.035, 0.06, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>
      <mesh position={[0.04, 1.24, 0.085]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.035, 0.06, 4]} />
        <meshStandardMaterial color="#c0392b" roughness={0.6} />
      </mesh>

      {/* 腰部（收腰） */}
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.22, 0.08, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>

      {/* 裙子（伊甸学园校服裙） */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.3, 20]} />
        <meshStandardMaterial color={clothingColor} roughness={0.78} />
      </mesh>
      {/* 裙摆白色装饰边 */}
      <mesh position={[0, 0.43, 0]}>
        <torusGeometry args={[0.32, 0.012, 8, 24]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.6} />
      </mesh>

      {/* 腿部（白色长袜/肤色） */}
      <mesh position={[-0.1, 0.22, 0]} rotation={[0, 0, 0.02]} castShadow>
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 0.22, 0]} rotation={[0, 0, -0.02]} castShadow>
        <capsuleGeometry args={[0.06, 0.38, 8, 16]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.7} />
      </mesh>

      {/* 鞋子（棕色小皮鞋） */}
      <mesh position={[-0.1, -0.02, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.5} />
      </mesh>
      <mesh position={[0.1, -0.02, 0.05]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.18]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.5} />
      </mesh>
    </group>
  );
};

// ============================================================
// 动态手臂 —— 从肩膀追踪到手部位置
// ============================================================
const ArmRig = ({
  shoulder,
  wrist,
  skinColor,
  clothingColor,
  side,
}: {
  shoulder: THREE.Vector3;
  wrist: THREE.Vector3;
  skinColor: string;
  clothingColor: string;
  side: 'left' | 'right';
}) => {
  // 计算肘部位置（带自然弯曲）
  const elbow = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(shoulder, wrist).multiplyScalar(0.5);
    // 肘部向前/向外偏移
    const outward = side === 'right' ? 0.04 : -0.04;
    mid.x += outward;
    mid.z += 0.06;
    mid.y -= 0.02;
    return mid;
  }, [shoulder, wrist, side]);

  return (
    <group>
      {/* 肩膀关节 */}
      <mesh position={shoulder} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.7} />
      </mesh>
      {/* 上臂（校服袖） */}
      <Phalanx start={shoulder} end={elbow} color={clothingColor} radius={0.055} />
      {/* 肘部 */}
      <mesh position={elbow} castShadow>
        <sphereGeometry args={[0.05, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} />
      </mesh>
      {/* 前臂（肤色） */}
      <Phalanx start={elbow} end={wrist} color={skinColor} radius={0.045} />
    </group>
  );
};

// ============================================================
// 缓动函数
// ============================================================
const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

const lerpHandPosition = (a: HandPosition, b: HandPosition, t: number): HandPosition => {
  const eased = easeInOut(t);
  const lerp3 = (p1: number[], p2: number[]): [number, number, number] => [
    p1[0] + (p2[0] - p1[0]) * eased,
    p1[1] + (p2[1] - p1[1]) * eased,
    p1[2] + (p2[2] - p1[2]) * eased,
  ];
  const lerpFinger = (f1: [number, number, number][], f2: [number, number, number][]): [number, number, number][] =>
    f1.map((p, i) => lerp3(p, f2[i] || p));

  return {
    wrist: lerp3(a.wrist, b.wrist),
    thumb: lerpFinger(a.thumb, b.thumb),
    index: lerpFinger(a.index, b.index),
    middle: lerpFinger(a.middle, b.middle),
    ring: lerpFinger(a.ring, b.ring),
    pinky: lerpFinger(a.pinky, b.pinky),
  };
};

// ============================================================
// 动画虚拟形象 —— 双手动画 + 呼吸 + 身体摆动 + 手臂追踪
// ============================================================
const AnimatedAvatar = ({
  signActions = [],
  avatar,
  isPlaying = false,
  onAnimationComplete,
  onProgress,
}: Avatar3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  const [currentHand, setCurrentHand] = useState<HandPosition | null>(null);
  const [breathing, setBreathing] = useState(0);
  const [rightWristPos, setRightWristPos] = useState(new THREE.Vector3(0.42, 1.0, 0.28));
  const [leftWristPos, setLeftWristPos] = useState(new THREE.Vector3(-0.42, 1.0, 0.28));

  const actions = useMemo(
    () => (signActions.length > 0 ? signActions : [getFallbackSign('zh')]),
    [signActions]
  );

  const stateRef = useRef({
    actionIndex: 0,
    startTime: 0,
    playing: isPlaying,
    lastProgressReport: -1,
  });

  useEffect(() => {
    stateRef.current.playing = isPlaying;
    if (isPlaying) {
      stateRef.current.actionIndex = 0;
      stateRef.current.startTime = performance.now();
      stateRef.current.lastProgressReport = -1;
    }
  }, [isPlaying, actions]);

  useFrame(({ clock }) => {
    // 呼吸动画
    const breath = Math.sin(clock.elapsedTime * 1.8) * 0.5 + 0.5;
    setBreathing(breath);

    // 身体轻微摆动
    if (bodyRef.current) {
      const sway = Math.sin(clock.elapsedTime * 0.8) * 0.012;
      bodyRef.current.rotation.y = sway;
      bodyRef.current.position.y = Math.sin(clock.elapsedTime * 1.8) * 0.006;
    }

    if (!stateRef.current.playing) return;

    const action = actions[stateRef.current.actionIndex];
    if (!action || action.gestures.length === 0) return;

    const frames = action.gestures;
    const now = performance.now();
    const elapsed = now - stateRef.current.startTime;
    const totalDuration = action.duration;
    const progress = Math.min(elapsed / totalDuration, 1);

    // 进度报告
    const progressBucket = Math.floor(progress * 10);
    if (progressBucket !== stateRef.current.lastProgressReport) {
      stateRef.current.lastProgressReport = progressBucket;
      onProgress?.(stateRef.current.actionIndex, progress);
    }

    // 帧插值
    const frameCount = frames.length;
    if (frameCount === 1) {
      const hand = frames[0].handPositions[0];
      if (hand) setCurrentHand(hand);
    } else {
      const frameProgress = progress * (frameCount - 1);
      const frameIndex = Math.min(Math.floor(frameProgress), frameCount - 2);
      const localProgress = frameProgress - frameIndex;
      const frameA = frames[frameIndex];
      const frameB = frames[frameIndex + 1];
      if (frameA?.handPositions[0] && frameB?.handPositions[0]) {
        const interpolated = lerpHandPosition(
          frameA.handPositions[0],
          frameB.handPositions[0],
          localProgress
        );
        setCurrentHand(interpolated);
      }
    }

    // 右手位置动画
    if (rightHandRef.current && currentHand) {
      const wrist = new THREE.Vector3(...currentHand.wrist);
      wrist.x += 0.42;
      wrist.y += 1.05;
      wrist.z += 0.28;
      rightHandRef.current.position.lerp(wrist, 0.35);
      setRightWristPos(rightHandRef.current.position.clone());

      // 手掌朝向
      const middleTip = currentHand.middle[3];
      const rotationY = Math.atan2(
        middleTip[0] - currentHand.wrist[0],
        middleTip[2] - currentHand.wrist[2] + 0.01
      );
      const rotationX = Math.atan2(
        middleTip[1] - currentHand.wrist[1],
        middleTip[2] - currentHand.wrist[2] + 0.01
      );
      rightHandRef.current.rotation.x += (rotationX * 0.3 - rightHandRef.current.rotation.x) * 0.2;
      rightHandRef.current.rotation.y += (rotationY * 0.3 - rightHandRef.current.rotation.y) * 0.2;
    }

    // 左手镜像跟随
    if (leftHandRef.current && currentHand) {
      const wrist = new THREE.Vector3(...currentHand.wrist);
      wrist.x = -wrist.x - 0.42;
      wrist.y += 1.05;
      wrist.z += 0.28;
      leftHandRef.current.position.lerp(wrist, 0.3);
      setLeftWristPos(leftHandRef.current.position.clone());
      leftHandRef.current.rotation.z = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.05;
    }

    // 动作完成 → 切换
    if (progress >= 1) {
      if (stateRef.current.actionIndex < actions.length - 1) {
        stateRef.current.actionIndex += 1;
        stateRef.current.startTime = now;
        stateRef.current.lastProgressReport = -1;
        onProgress?.(stateRef.current.actionIndex, 0);
      } else {
        stateRef.current.actionIndex = 0;
        stateRef.current.startTime = now;
        stateRef.current.lastProgressReport = -1;
        onAnimationComplete?.();
      }
    }
  });

  const displayHand = useMemo(() => {
    return (
      currentHand ||
      actions[0]?.gestures[0]?.handPositions[0] ||
      getFallbackSign('zh').gestures[0].handPositions[0]
    );
  }, [currentHand, actions]);

  const appearance = avatar?.appearance;
  const skinColor = appearance?.skinColor || '#fce4d6';
  const hairColor = appearance?.hairColor || '#f8a5c2';
  const eyeColor = appearance?.eyeColor || '#4caf50';
  const clothingColor = appearance?.clothingColor || '#1a1a2e';

  // 肩膀位置
  const rightShoulder = useMemo(() => new THREE.Vector3(0.28, 1.22, 0), []);
  const leftShoulder = useMemo(() => new THREE.Vector3(-0.28, 1.22, 0), []);

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <AnyaBody skinColor={skinColor} clothingColor={clothingColor} breathingOffset={breathing} />
        <AnyaFace skinColor={skinColor} eyeColor={eyeColor} />
        <AnyaHair hairColor={hairColor} />
      </group>

      {/* 动态手臂追踪 */}
      <ArmRig
        shoulder={rightShoulder}
        wrist={rightWristPos}
        skinColor={skinColor}
        clothingColor={clothingColor}
        side="right"
      />
      <ArmRig
        shoulder={leftShoulder}
        wrist={leftWristPos}
        skinColor={skinColor}
        clothingColor={clothingColor}
        side="left"
      />

      {/* 右手（主动手势手） */}
      <group ref={rightHandRef} position={[0.42, 1.0, 0.28]}>
        <DetailedHand handPosition={displayHand} skinColor={skinColor} side="right" />
      </group>

      {/* 左手（辅助手） */}
      <group ref={leftHandRef} position={[-0.42, 1.0, 0.28]} rotation={[0, 0, 0.2]}>
        <DetailedHand handPosition={displayHand} skinColor={skinColor} side="left" />
      </group>

      {/* 光照 */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 10, 7]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 5, -3]} intensity={0.45} />
      <pointLight position={[0, 3, 3]} intensity={0.45} color="#fff5e6" />
      <pointLight position={[-2, 1, 2]} intensity={0.25} color="#e6f0ff" />
    </group>
  );
};

// ============================================================
// 导出组件
// ============================================================
export default function Avatar3D({
  signActions,
  avatar,
  isPlaying,
  onAnimationComplete,
  onProgress,
}: Avatar3DProps) {
  return (
    <div className="h-full w-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1.2, 3.0]} fov={46} />
        <OrbitControls
          target={[0, 0.85, 0]}
          enablePan={false}
          minDistance={1.8}
          maxDistance={5}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.08}
        />
        {/* 地面阴影 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
        <AnimatedAvatar
          signActions={signActions}
          avatar={avatar}
          isPlaying={isPlaying}
          onAnimationComplete={onAnimationComplete}
          onProgress={onProgress}
        />
      </Canvas>
    </div>
  );
}
