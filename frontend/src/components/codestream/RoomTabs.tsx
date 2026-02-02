import { X, Plus, Circle, Users } from 'lucide-react';
import { Room } from '@/types/codestream';
import { languageConfig } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RoomTabsProps {
  rooms: Room[];
  activeRoomId: string;
  onRoomChange: (roomId: string) => void;
  onCloseRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

export default function RoomTabs({ rooms, activeRoomId, onRoomChange, onCloseRoom, onCreateRoom }: RoomTabsProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-2 bg-muted/30 border-b border-white/10 overflow-x-auto custom-scrollbar">
      {rooms.map((room) => {
        const isActive = room.id === activeRoomId;
        const lang = languageConfig[room.language];

        return (
          <button
            key={room.id}
            onClick={() => onRoomChange(room.id)}
            className={cn(
              'group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-w-max',
              isActive
                ? 'bg-card/80 text-foreground neon-glow-cyan border border-neon-cyan/30'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {/* Language badge */}
            <span
              className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center"
              style={{ backgroundColor: lang.color + '20', color: lang.color }}
            >
              {lang.icon}
            </span>

            {/* Room name */}
            <span>{room.name}</span>

            {/* Sync status */}
            <Circle
              className={cn(
                'w-2 h-2 fill-current',
                room.syncStatus === 'synced' && 'text-neon-green',
                room.syncStatus === 'syncing' && 'text-neon-yellow animate-pulse',
                room.syncStatus === 'offline' && 'text-destructive'
              )}
            />

            {/* Participants count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{room.participants.filter((p) => p.isOnline).length}</span>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseRoom(room.id);
              }}
              className="ml-1 p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        );
      })}

      {/* New Room Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        onClick={onCreateRoom}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
