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
// 手部模型 —— 21关键点骨骼+关节
// ============================================================

const FingerJoint = ({ position, color, size = 0.022 }: { position: THREE.Vector3; color: string; size?: number }) => (
  <mesh position={position}>
    <sphereGeometry args={[size, 12, 12]} />
    <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
  </mesh>
);

const FingerBone = ({ start, end, color, thickness = 0.014 }: { start: THREE.Vector3; end: THREE.Vector3; color: string; thickness?: number }) => {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  if (length < 0.001) return null;

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const orientation = new THREE.Quaternion();
  orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  return (
    <mesh position={mid} quaternion={orientation} castShadow>
      <cylinderGeometry args={[thickness, thickness * 0.85, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </mesh>
  );
};

const HandModel = ({ handPosition, skinColor, side = 'right' }: { handPosition: HandPosition; skinColor: string; side?: 'left' | 'right' }) => {
  const landmarks = useMemo(() => handPositionToLandmarkArray(handPosition).map((p) => new THREE.Vector3(...p)), [handPosition]);

  const segments = useMemo(() => {
    const seg: { start: number; end: number }[] = [];
    seg.push({ start: 0, end: 1 });
    for (let i = 1; i < 4; i++) seg.push({ start: i, end: i + 1 });
    seg.push({ start: 0, end: 5 });
    for (let i = 5; i < 8; i++) seg.push({ start: i, end: i + 1 });
    seg.push({ start: 0, end: 9 });
    for (let i = 9; i < 12; i++) seg.push({ start: i, end: i + 1 });
    seg.push({ start: 0, end: 13 });
    for (let i = 13; i < 16; i++) seg.push({ start: i, end: i + 1 });
    seg.push({ start: 0, end: 17 });
    for (let i = 17; i < 20; i++) seg.push({ start: i, end: i + 1 });
    return seg;
  }, []);

  const palmCenter = useMemo(() => {
    const v = new THREE.Vector3();
    [0, 5, 9, 13, 17].forEach((i) => v.add(landmarks[i]));
    return v.multiplyScalar(0.2);
  }, [landmarks]);

  return (
    <group scale={side === 'left' ? [-1, 1, 1] : [1, 1, 1]}>
      {segments.map((seg, i) => (
        <FingerBone key={`bone-${i}`} start={landmarks[seg.start]} end={landmarks[seg.end]} color={skinColor} />
      ))}
      {landmarks.map((joint, i) => (
        <FingerJoint key={`joint-${i}`} position={joint} color={skinColor} size={i === 0 ? 0.03 : 0.018} />
      ))}
      <mesh position={palmCenter}>
        <boxGeometry args={[0.16, 0.04, 0.14]} />
        <meshStandardMaterial color={skinColor} transparent opacity={0.92} roughness={0.6} />
      </mesh>
    </group>
  );
};

// ============================================================
// 精致身体模型 —— 面部细节、发型、服装
// ============================================================

const DetailedBody = ({
  skinColor,
  hairColor,
  hairStyle,
  eyeColor,
  clothingColor,
  breathingOffset = 0,
}: {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  clothingColor: string;
  breathingOffset?: number;
}) => {
  const chestScale = 1 + breathingOffset * 0.03;

  return (
    <group>
      {/* ===== 头部 ===== */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* 下巴 */}
      <mesh position={[0, 1.48, 0.02]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* 耳朵 */}
      <mesh position={[-0.23, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.23, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* ===== 眼睛 ===== */}
      {/* 眼白 */}
      <mesh position={[-0.08, 1.68, 0.215]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <mesh position={[0.08, 1.68, 0.215]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* 瞳孔 */}
      <mesh position={[-0.08, 1.68, 0.25]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0.08, 1.68, 0.25]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* 高光 */}
      <mesh position={[-0.072, 1.688, 0.268]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.088, 1.688, 0.268]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* ===== 眉毛 ===== */}
      <mesh position={[-0.08, 1.75, 0.22]} rotation={[0, 0, 0.15]}>
        <capsuleGeometry args={[0.008, 0.06, 4, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.08, 1.75, 0.22]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.008, 0.06, 4, 8]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>

      {/* ===== 鼻子 ===== */}
      <mesh position={[0, 1.6, 0.25]} rotation={[0.3, 0, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.05, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      {/* 鼻孔 */}
      <mesh position={[-0.012, 1.56, 0.26]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color="#8b6b4a" />
      </mesh>
      <mesh position={[0.012, 1.56, 0.26]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color="#8b6b4a" />
      </mesh>

      {/* ===== 嘴巴 ===== */}
      <mesh position={[0, 1.5, 0.235]} rotation={[0.1, 0, 0]}>
        <capsuleGeometry args={[0.012, 0.06, 6, 12]} />
        <meshStandardMaterial color="#c77b7b" roughness={0.7} />
      </mesh>

      {/* ===== 头发 ===== */}
      {hairStyle !== 'bald' && (
        <>
          {/* 头顶头发 */}
          <mesh position={[0, 1.82, -0.02]} castShadow>
            <sphereGeometry args={[0.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>
          {/* 两侧头发 */}
          <mesh position={[-0.2, 1.72, -0.02]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>
          <mesh position={[0.2, 1.72, -0.02]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>
          {/* 刘海 */}
          <mesh position={[0, 1.78, 0.18]} rotation={[0.4, 0, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={hairColor} roughness={0.85} />
          </mesh>
          {hairStyle === 'long' && (
            <>
              {/* 长发后侧 */}
              <mesh position={[0, 1.5, -0.18]} castShadow>
                <capsuleGeometry args={[0.12, 0.4, 8, 16]} />
                <meshStandardMaterial color={hairColor} roughness={0.85} />
              </mesh>
            </>
          )}
        </>
      )}

      {/* ===== 颈部 ===== */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* ===== 躯干（带呼吸缩放） ===== */}
      <mesh position={[0, 1.02, 0]} scale={[chestScale, 1, chestScale]} castShadow>
        <capsuleGeometry args={[0.26, 0.45, 12, 24]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>

      {/* 衣领 */}
      <mesh position={[0, 1.28, 0.05]} rotation={[0.3, 0, 0]} castShadow>
        <torusGeometry args={[0.12, 0.025, 8, 24, Math.PI]} />
        <meshStandardMaterial color={clothingColor} roughness={0.7} />
      </mesh>

      {/* 腰部 */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.22, 0.12, 16]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>

      {/* ===== 手臂（上臂+前臂，带肩部关节） ===== */}
      {/* 右肩 */}
      <mesh position={[0.3, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>
      {/* 右上臂 */}
      <mesh position={[0.38, 1.02, 0]} rotation={[0, 0, -0.12]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 8, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>
      {/* 右肘 */}
      <mesh position={[0.42, 0.82, 0.02]} castShadow>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      {/* 右前臂 */}
      <mesh position={[0.44, 0.62, 0.04]} rotation={[0, 0, -0.08]} castShadow>
        <capsuleGeometry args={[0.05, 0.28, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* 左肩 */}
      <mesh position={[-0.3, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>
      {/* 左上臂 */}
      <mesh position={[-0.38, 1.02, 0]} rotation={[0, 0, 0.12]} castShadow>
        <capsuleGeometry args={[0.06, 0.32, 8, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.75} />
      </mesh>
      {/* 左肘 */}
      <mesh position={[-0.42, 0.82, 0.02]} castShadow>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      {/* 左前臂 */}
      <mesh position={[-0.44, 0.62, 0.04]} rotation={[0, 0, 0.08]} castShadow>
        <capsuleGeometry args={[0.05, 0.28, 8, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* ===== 腿部 ===== */}
      <mesh position={[-0.13, 0.38, 0]} rotation={[0, 0, 0.03]} castShadow>
        <capsuleGeometry args={[0.085, 0.5, 8, 16]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.38, 0]} rotation={[0, 0, -0.03]} castShadow>
        <capsuleGeometry args={[0.085, 0.5, 8, 16]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>

      {/* 膝盖 */}
      <mesh position={[-0.13, 0.14, 0.02]} castShadow>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.14, 0.02]} castShadow>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>

      {/* 小腿 */}
      <mesh position={[-0.13, -0.1, 0.02]} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.13, -0.1, 0.02]} castShadow>
        <capsuleGeometry args={[0.07, 0.35, 8, 16]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} />
      </mesh>

      {/* 鞋子 */}
      <mesh position={[-0.13, -0.32, 0.06]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      <mesh position={[0.13, -0.32, 0.06]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
    </group>
  );
};

// ============================================================
// 缓动函数 —— ease-in-out 让动作更自然
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
// 动画虚拟形象 —— 双手动画 + 呼吸 + 身体摆动 + 进度回调
// ============================================================

const AnimatedAvatar = ({ signActions = [], avatar, isPlaying = false, onAnimationComplete, onProgress }: Avatar3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const [currentHand, setCurrentHand] = useState<HandPosition | null>(null);
  const [breathing, setBreathing] = useState(0);

  const actions = useMemo(() => (signActions.length > 0 ? signActions : [getFallbackSign('zh')]), [signActions]);

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
    // 呼吸动画（始终运行）
    const breath = Math.sin(clock.elapsedTime * 1.8) * 0.5 + 0.5;
    setBreathing(breath);

    // 身体轻微摆动（待机时）
    if (bodyRef.current) {
      const sway = Math.sin(clock.elapsedTime * 0.8) * 0.015;
      bodyRef.current.rotation.y = sway;
      bodyRef.current.position.y = Math.sin(clock.elapsedTime * 1.8) * 0.008;
    }

    if (!stateRef.current.playing) return;

    const action = actions[stateRef.current.actionIndex];
    if (!action || action.gestures.length === 0) return;

    const frames = action.gestures;
    const now = performance.now();
    const elapsed = now - stateRef.current.startTime;
    const totalDuration = action.duration;
    const progress = Math.min(elapsed / totalDuration, 1);

    // 报告进度（用于文字高亮同步）
    const progressBucket = Math.floor(progress * 10);
    if (progressBucket !== stateRef.current.lastProgressReport) {
      stateRef.current.lastProgressReport = progressBucket;
      onProgress?.(stateRef.current.actionIndex, progress);
    }

    // 计算当前帧插值
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
        const interpolated = lerpHandPosition(frameA.handPositions[0], frameB.handPositions[0], localProgress);
        setCurrentHand(interpolated);
      }
    }

    // 手部位置动画（右手主动，左手跟随）
    if (rightHandRef.current && currentHand) {
      const wrist = new THREE.Vector3(...currentHand.wrist);
      wrist.x += 0.42;
      wrist.y += 1.05;
      wrist.z += 0.28;
      rightHandRef.current.position.lerp(wrist, 0.3);

      // 手掌朝向
      const middleTip = currentHand.middle[3];
      const rotationY = Math.atan2(middleTip[0] - currentHand.wrist[0], middleTip[2] - currentHand.wrist[2] + 0.01);
      const rotationX = Math.atan2(middleTip[1] - currentHand.wrist[1], middleTip[2] - currentHand.wrist[2] + 0.01);
      rightHandRef.current.rotation.x += (rotationX * 0.3 - rightHandRef.current.rotation.x) * 0.2;
      rightHandRef.current.rotation.y += (rotationY * 0.3 - rightHandRef.current.rotation.y) * 0.2;
    }

    // 左手镜像跟随（做辅助手势）
    if (leftHandRef.current && currentHand) {
      const wrist = new THREE.Vector3(...currentHand.wrist);
      wrist.x = -wrist.x - 0.42;
      wrist.y += 1.05;
      wrist.z += 0.28;
      leftHandRef.current.position.lerp(wrist, 0.25);
      leftHandRef.current.rotation.z = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.05;
    }

    // 动作完成 → 切换下一个
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
    return currentHand || actions[0]?.gestures[0]?.handPositions[0] || getFallbackSign('zh').gestures[0].handPositions[0];
  }, [currentHand, actions]);

  const appearance = avatar?.appearance;
  const skinColor = appearance?.skinColor || '#f5d0b0';
  const hairColor = appearance?.hairColor || '#3d2914';
  const hairStyle = appearance?.hairStyle || 'short';
  const eyeColor = appearance?.eyeColor || '#4a4a4a';
  const clothingColor = appearance?.clothingColor || '#2dd4bf';

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <DetailedBody
          skinColor={skinColor}
          hairColor={hairColor}
          hairStyle={hairStyle}
          eyeColor={eyeColor}
          clothingColor={clothingColor}
          breathingOffset={breathing}
        />
      </group>

      {/* 右手（主动手势手） */}
      <group ref={rightHandRef} position={[0.42, 1.05, 0.28]}>
        <HandModel handPosition={displayHand} skinColor={skinColor} side="right" />
      </group>

      {/* 左手（辅助手） */}
      <group ref={leftHandRef} position={[-0.42, 1.05, 0.28]} rotation={[0, 0, 0.2]}>
        <HandModel handPosition={displayHand} skinColor={skinColor} side="left" />
      </group>

      {/* 增强光照 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 5, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 3]} intensity={0.4} color="#fff5e6" />
      <pointLight position={[-2, 1, 2]} intensity={0.2} color="#e6f0ff" />
    </group>
  );
};

// ============================================================
// 导出组件
// ============================================================

export default function Avatar3D({ signActions, avatar, isPlaying, onAnimationComplete, onProgress }: Avatar3DProps) {
  return (
    <div className="h-full w-full min-h-[400px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1.3, 3.2]} fov={48} />
        <OrbitControls
          target={[0, 0.9, 0]}
          enablePan={false}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.08}
        />
        {/* 地面阴影接收 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
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
