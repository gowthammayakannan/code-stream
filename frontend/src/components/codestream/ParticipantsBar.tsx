import { Crown, Eye, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { Participant } from '@/types/codestream';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ParticipantsBarProps {
  participants: Participant[];
  currentUserId: string;
}

export default function ParticipantsBar({ participants, currentUserId }: ParticipantsBarProps) {
  const onlineParticipants = participants.filter((p) => p.isOnline);
  const offlineParticipants = participants.filter((p) => !p.isOnline);

  return (
    <div className="glass-panel border-l border-white/10 p-4 flex flex-col gap-6 w-64 bg-background/30 backdrop-blur-xl h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Collaboration
          </h3>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/20">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[10px] font-bold text-neon-green uppercase">
              {onlineParticipants.length} Live
            </span>
          </div>
        </div>
        <p className="text-[10px] text-white/40 italic">Real-time sync active</p>
      </div>

      {/* Online Users */}
      <div className="space-y-3">
        {onlineParticipants.map((participant, index) => {
          // Normalize ID check
          const pId = participant.id || (participant as any).userId?._id || (participant as any).userId;
          const isMe = pId === currentUserId;

          return (
            <Tooltip key={participant.id || index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-xl transition-all duration-300',
                    'hover:bg-white/5 cursor-pointer group relative overflow-hidden',
                    isMe && 'bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(0,217,255,0.05)]'
                  )}
                >
                  {isMe && (
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent pointer-events-none" />
                  )}

                  <div className="relative z-10 shrink-0">
                    <Avatar
                      className="w-10 h-10 border-2 transition-transform group-hover:scale-105"
                      style={{ borderColor: participant.color || '#3178C6' }}
                    >
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback
                        className="text-xs font-bold"
                        style={{ backgroundColor: (participant.color || '#3178C6') + '20', color: participant.color || '#3178C6' }}
                      >
                        {participant.name?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0c10]"
                      style={{ backgroundColor: '#22C55E' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 z-10">
                    <p className="text-sm font-semibold truncate group-hover:text-neon-cyan transition-colors">
                      {participant.name} {isMe && <span className="text-[10px] text-neon-cyan ml-1 opacity-70">(You)</span>}
                    </p>
                    {participant.cursorPosition && !isMe && (
                      <p className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                        <Edit3 className="w-2.5 h-2.5" />
                        L{participant.cursorPosition.line} : C{participant.cursorPosition.column}
                      </p>
                    )}
                  </div>

                  {index === 0 && !isMe && (
                    <Crown className="w-4 h-4 text-neon-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="glass-panel border-white/10 bg-[#0d1117]/90 backdrop-blur-md">
                <div className="text-xs py-1">
                  <p className="font-bold text-neon-cyan">{participant.name}</p>
                  <p className="text-white/60">
                    {isMe ? 'This is you - editing in real-time' : `Currently at line ${participant.cursorPosition?.line || 1}`}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Offline Users */}
      {offlineParticipants.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">Offline</h4>
          <div className="space-y-2">
            {offlineParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-2 rounded-xl opacity-40 grayscale group hover:opacity-100 transition-all cursor-default"
              >
                <Avatar className="w-9 h-9 border border-white/5">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-xs bg-muted/20">
                    {participant.name?.slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm truncate font-medium">{participant.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow Mode */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={() => {
            const host = onlineParticipants.find(p => {
              const pId = p.id || (p as any).userId?._id || (p as any).userId;
              return pId !== currentUserId;
            });

            if (host?.cursorPosition) {
              toast.success(`Following ${host.name}...`, {
                description: `Synchronizing viewport to Line ${host.cursorPosition.line}`,
                duration: 3000,
              });
            } else {
              toast.error('No other participants to follow');
            }
          }}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20 hover:bg-neon-purple/20 transition-all group overflow-hidden relative shadow-[0_0_20px_rgba(168,85,247,0.1)] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/0 via-neon-purple/10 to-neon-purple/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-wide text-xs">FOLLOW HOST</span>
        </button>
      </div>
    </div>
  );
}
