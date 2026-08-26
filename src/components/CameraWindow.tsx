import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCamera } from '@/hooks/useCamera';
import { useGestureRecognition } from '@/hooks/useGestureRecognition';
import { Video, VideoOff, Hand, Loader2 } from 'lucide-react';

interface CameraWindowProps {
  onSignDetected?: (signId: string | null, confidence: number) => void;
}

export default function CameraWindow({ onSignDetected }: CameraWindowProps) {
  const { isCameraActive, setIsCameraActive, setGestureDetection } = useAppStore();
  const { videoRef, isActive, startCamera, stopCamera, error: cameraError } = useCamera();
  const { gesture, isModelLoaded, error: gestureError } = useGestureRecognition(videoRef, isActive);

  useEffect(() => {
    setIsCameraActive(isActive);
  }, [isActive, setIsCameraActive]);

  useEffect(() => {
    setGestureDetection(gesture);
    onSignDetected?.(gesture.signId, gesture.confidence);
  }, [gesture, setGestureDetection, onSignDetected]);

  const handleToggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-color p-4">
        <h2 className="section-title flex items-center gap-2">
          <Hand className="h-5 w-5 text-secondary-500" />
          手语识别
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className={`status-indicator ${isActive ? 'status-active' : 'status-inactive'}`} />
            {isActive ? '摄像头已开启' : '摄像头已关闭'}
          </div>
          <button
            onClick={handleToggleCamera}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                : 'btn-secondary'
            }`}
          >
            {isActive ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {isActive ? '关闭摄像头' : '打开摄像头'}
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-black">
        {!isActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
            <Video className="h-12 w-12" />
            <p className="text-sm">点击“打开摄像头”开始手语识别</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${isActive ? 'block' : 'hidden'}`}
        />

        {isActive && gesture.detected && gesture.signId && (
          <div className="absolute left-4 top-4 rounded-lg bg-secondary-500/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
            识别到：{gesture.signId}
          </div>
        )}

        {isActive && !isModelLoaded && (
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            加载手势模型...
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        {cameraError && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {cameraError}
          </div>
        )}
        {gestureError && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
            {gestureError}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-bg-secondary/50 p-3">
          <span className="text-sm text-text-secondary">识别状态</span>
          <span className={`text-sm font-medium ${gesture.detected ? 'text-secondary-500' : 'text-text-secondary'}`}>
            {gesture.detected ? `已识别 (${(gesture.confidence * 100).toFixed(0)}%)` : '未检测到手势'}
          </span>
        </div>
      </div>
    </div>
  );
}
