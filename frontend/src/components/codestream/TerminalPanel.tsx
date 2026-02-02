import { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { TerminalOutput } from '@/types/codestream';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import socketService from '@/services/socket';

interface TerminalPanelProps {
  onToggle: () => void;
  roomId: string;
  isConnected: boolean;
  isExpanded: boolean;
}

export default function TerminalPanel({ onToggle, roomId, isConnected, isExpanded }: TerminalPanelProps) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [outputs]);

  // Listen for terminal output from backend
  useEffect(() => {
    if (!isConnected) return;

    socketService.onTerminalOutput((data: any) => {
      console.log('Terminal output:', data);

      const newOutput: TerminalOutput = {
        id: Date.now().toString() + Math.random(),
        type: data.type,
        content: data.content,
        timestamp: new Date(data.timestamp),
      };

      setOutputs((prev) => [...prev, newOutput]);

      // Check if execution completed
      if (data.content.includes('✓ Execution completed') || data.content.includes('✗ Execution failed')) {
        setIsRunning(false);
      } else if (data.content.includes('Executing code')) {
        setIsRunning(true);
      }
    });
  }, [isConnected]);

  const clearTerminal = () => {
    setOutputs([]);
  };

  const getOutputColor = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'stderr':
        return 'text-destructive';
      case 'system':
        return 'text-neon-cyan';
      default:
        return 'text-foreground';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={cn(
      "flex flex-col glass-panel border-t border-white/10 transition-all duration-300",
      isExpanded ? "h-64" : "h-11"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-muted/20 flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggle}>
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm font-medium">Terminal</span>
          {isRunning && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-muted-foreground">Running...</span>
            </div>
          )}
          {!isConnected && (
            <span className="text-xs text-yellow-500 ml-2">⚠ Offline</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={clearTerminal}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>

          <div className="h-4 w-px bg-white/10" />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onToggle}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Output */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-2 font-mono text-sm bg-background/50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {outputs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Terminal className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Terminal output will appear here</p>
                <p className="text-xs mt-1">Click "Run" to execute your code</p>
              </div>
            ) : (
              <div className="space-y-1">
                {outputs.map((output) => (
                  <div key={output.id} className="flex gap-3 group">
                    <span className="text-xs text-muted-foreground opacity-50 w-20 flex-shrink-0 font-mono">
                      {formatTimestamp(output.timestamp)}
                    </span>
                    <pre className={cn('flex-1 whitespace-pre-wrap', getOutputColor(output.type))}>
                      {output.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-4 py-1.5 border-t border-white/10 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{outputs.length} line{outputs.length !== 1 && 's'}</span>
              <span>Room: {roomId?.slice(0, 8) || 'None'}...</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isConnected && (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                  <span>Backend connected</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
