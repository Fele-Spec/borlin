import { useTheme } from '@/hooks/useTheme';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';
import { Hand, Moon, Sun, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-color bg-bg-primary/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-secondary shadow-lg">
            <Hand className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-text-primary">{APP_NAME}</h1>
            <p className="text-xs text-text-secondary hidden sm:block">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/avatar"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">形象定制</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50"
            aria-label="切换主题"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
