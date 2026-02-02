import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Theme } from '@/types/codestream';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const themes: { id: Theme; name: string; colors: string[] }[] = [
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#00D9FF', '#A855F7', '#FF00D4'] },
  { id: 'dracula', name: 'Dracula', colors: ['#BD93F9', '#50FA7B', '#FF79C6'] },
  { id: 'minimal', name: 'Minimal Dark', colors: ['#FFFFFF', '#808080', '#404040'] },
];

export default function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
          <Palette className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-panel border-white/10">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Theme</div>
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`cursor-pointer hover:bg-muted/50 ${currentTheme === theme.id ? 'bg-muted/30' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex gap-1">
                {theme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="flex-1">{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="w-2 h-2 rounded-full bg-neon-cyan" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
