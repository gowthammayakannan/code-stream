import { ChevronDown, Check } from 'lucide-react';
import { Language } from '@/types/codestream';
import { languageConfig } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const current = languageConfig[currentLanguage];
  const languages = Object.entries(languageConfig) as [Language, typeof current][];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-3 gap-2 bg-muted/30 border border-white/10 hover:bg-muted/50 hover:border-neon-cyan/30"
        >
          <span
            className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: current.color + '20', color: current.color }}
          >
            {current.icon}
          </span>
          <span className="text-sm font-medium">{current.label}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 glass-panel border-white/10">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Select Language</div>
        {languages.map(([lang, config]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`cursor-pointer hover:bg-muted/50 ${currentLanguage === lang ? 'bg-muted/30' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span
                className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: config.color + '20', color: config.color }}
              >
                {config.icon}
              </span>
              <span className="flex-1">{config.label}</span>
              {currentLanguage === lang && <Check className="w-4 h-4 text-neon-cyan" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
