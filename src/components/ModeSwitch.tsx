import { useAppStore } from '@/store/appStore';
import { MODES } from '@/utils/constants';
import { MessageSquare, Video } from 'lucide-react';

export default function ModeSwitch() {
  const { mode, setMode } = useAppStore();

  return (
    <div className="glass-card p-1.5">
      <div className="flex flex-col gap-2 sm:flex-row">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const Icon = m.id === 'languageToSign' ? MessageSquare : Video;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as typeof mode)}
              className={`flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-text-secondary hover:bg-white/10 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isActive ? 'bg-white/20' : 'bg-secondary-100 dark:bg-slate-800'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-secondary-600 dark:text-secondary-400'}`} />
              </div>
              <div>
                <div className="font-heading font-semibold text-sm">{m.name}</div>
                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-text-secondary'}`}>
                  {m.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
