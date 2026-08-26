import { useAppStore } from '@/store/appStore';
import { AVATAR_APPEARANCE_OPTIONS } from '@/utils/constants';
import Avatar3D from '@/components/Avatar3D';
import { ArrowLeft, User, Palette, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ColorOptionProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const ColorOption = ({ color, isSelected, onClick }: ColorOptionProps) => (
  <button
    onClick={onClick}
    className={`h-10 w-10 rounded-full border-2 transition-all ${
      isSelected ? 'border-secondary-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'
    }`}
    style={{ backgroundColor: color }}
    aria-label={`选择颜色 ${color}`}
  />
);

interface StyleOptionProps {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const StyleOption = ({ value, label, isSelected, onClick }: StyleOptionProps) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
      isSelected
        ? 'bg-secondary-500 text-white shadow-md'
        : 'bg-bg-secondary text-text-secondary hover:bg-white/10 dark:hover:bg-slate-800/50'
    }`}
  >
    {label}
  </button>
);

export default function AvatarCustomizer() {
  const { avatar, setAvatar } = useAppStore();
  const appearance = avatar.appearance;

  const updateAppearance = (key: keyof typeof appearance, value: string) => {
    setAvatar({
      appearance: {
        ...appearance,
        [key]: value,
      },
    });
  };

  const clothingLabels: Record<string, string> = {
    casual: '休闲',
    formal: '正式',
    sporty: '运动',
  };

  const hairLabels: Record<string, string> = {
    short: '短发',
    long: '长发',
    bald: '光头',
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-secondary text-text-secondary transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">虚拟形象定制</h1>
            <p className="text-sm text-text-secondary">自定义您的手语翻译助手外观</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[500px] lg:h-[600px]">
            <Avatar3D avatar={avatar} />
          </div>

          <div className="glass-card space-y-6 p-6">
            <div className="flex items-center gap-2 border-b border-border-color pb-4">
              <User className="h-5 w-5 text-secondary-500" />
              <h2 className="font-heading text-lg font-semibold text-text-primary">外观设置</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Palette className="h-4 w-4" />
                  肤色
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_APPEARANCE_OPTIONS.skinColor.map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      isSelected={appearance.skinColor === color}
                      onClick={() => updateAppearance('skinColor', color)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Palette className="h-4 w-4" />
                  发色
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_APPEARANCE_OPTIONS.hairColor.map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      isSelected={appearance.hairColor === color}
                      onClick={() => updateAppearance('hairColor', color)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 text-sm font-medium text-text-secondary">发型</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_APPEARANCE_OPTIONS.hairStyle.map((style) => (
                    <StyleOption
                      key={style}
                      value={style}
                      label={hairLabels[style] || style}
                      isSelected={appearance.hairStyle === style}
                      onClick={() => updateAppearance('hairStyle', style)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Palette className="h-4 w-4" />
                  眼睛颜色
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_APPEARANCE_OPTIONS.eyeColor.map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      isSelected={appearance.eyeColor === color}
                      onClick={() => updateAppearance('eyeColor', color)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Shirt className="h-4 w-4" />
                  服装风格
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_APPEARANCE_OPTIONS.clothing.map((style) => (
                    <StyleOption
                      key={style}
                      value={style}
                      label={clothingLabels[style] || style}
                      isSelected={appearance.clothing === style}
                      onClick={() => updateAppearance('clothing', style)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Shirt className="h-4 w-4" />
                  服装颜色
                </label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_APPEARANCE_OPTIONS.clothingColor.map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      isSelected={appearance.clothingColor === color}
                      onClick={() => updateAppearance('clothingColor', color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border-color">
              <button
                onClick={() => setAvatar({
                  appearance: {
                    skinColor: '#f5d0b0',
                    hairColor: '#3d2914',
                    hairStyle: 'short',
                    eyeColor: '#4a4a4a',
                    clothing: 'casual',
                    clothingColor: '#2dd4bf',
                  }
                })}
                className="w-full rounded-lg border border-border-color px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/10 dark:hover:bg-slate-800/50"
              >
                恢复默认
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
