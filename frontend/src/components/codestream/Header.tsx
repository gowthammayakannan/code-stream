import { useState } from 'react';
import { Code2, Wifi, WifiOff, Settings, User, LogOut, ChevronDown, Share2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Theme } from '@/types/codestream';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  isConnected: boolean;
  onCommandClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onDashboardClick: () => void;
  onSignOut: () => void;
  activeRoomId?: string | null;
}

export default function Header({
  theme,
  onThemeChange,
  isConnected,
  onCommandClick,
  onSettingsClick,
  onProfileClick,
  onDashboardClick,
  onSignOut,
  activeRoomId
}: HeaderProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Robust data retrieval
  const storedUserStr = localStorage.getItem('user');
  let storedUser = { name: '', email: '', avatar: '' };

  try {
    if (storedUserStr) {
      storedUser = JSON.parse(storedUserStr);
    }
  } catch (e) {
    console.error("Failed to parse user data from localStorage", e);
  }

  const name = storedUser.name || localStorage.getItem('userName') || 'Gowtham M';
  const email = storedUser.email || localStorage.getItem('userEmail') || 'user@codestream.io';

  const userInitials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  // Determine avatar URL
  const avatarSeed = name.replace(/\s+/g, '') + '_v4';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&top=shortHair,shortHairTheCaesar,shortHairShortFlat,shortHairShortRound&facialHair=beardLight,beardMedium,beardMajestic&facialHairProbability=100&clothingType=hoodie,shirtCrewNeck,blazerShirt`;
  const avatarUrl = storedUser.avatar || defaultAvatar;

  const user = { name, email, avatar: avatarUrl };

  return (
    <header className="h-14 glass-panel-strong border-b border-white/10 flex items-center justify-between px-4 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onDashboardClick}
        >
          <LayoutDashboard className="w-5 h-5" />
        </Button>
        <div className="relative group cursor-pointer" onClick={onDashboardClick}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-magenta flex items-center justify-center neon-glow-cyan">
            <Code2 className="w-5 h-5 text-background" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-colors duration-300 ${isConnected ? 'bg-[#2ea043]' : 'bg-destructive'}`} />
        </div>
        <div className="hidden md:block cursor-pointer" onClick={onDashboardClick}>
          <h1 className="text-lg font-bold neon-text-cyan tracking-tight">CodeStream</h1>
          <p className="text-[10px] text-muted-foreground -mt-1">Real-time Collaboration</p>
        </div>
      </div>

      {/* Center Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-white/5">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-neon-green sync-pulse" />
              <span className="text-xs text-neon-green font-medium">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive font-medium">Offline</span>
            </>
          )}
        </div>

        <button
          onClick={onCommandClick}
          className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:bg-white/5 px-2 py-1 rounded transition-colors"
        >
          <span className="px-2 py-1 rounded bg-neon-cyan/10 text-neon-cyan font-mono">⌘K</span>
          <span>Command Palette</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher currentTheme={theme} onThemeChange={onThemeChange} />

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          onClick={onSettingsClick}
        >
          <Settings className="w-5 h-5" />
        </Button>

        {activeRoomId && (
          <Button
            variant="ghost"
            size="icon"
            className="text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10"
            onClick={() => {
              navigator.clipboard.writeText(activeRoomId);
              toast.success('Room ID copied to clipboard!');
            }}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted/50">
              <Avatar className="w-8 h-8 border-2 border-neon-cyan/50">
                <AvatarImage src={user.avatar} crossOrigin="anonymous" />
                <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">{userInitials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-panel border-white/10">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" onClick={onProfileClick}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" onClick={onSettingsClick}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
