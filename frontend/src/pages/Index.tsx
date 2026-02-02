import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Theme, Language } from '@/types/codestream';
import Header from '@/components/codestream/Header';
import FileExplorer from '@/components/codestream/FileExplorer';
import RoomTabs from '@/components/codestream/RoomTabs';
import EditorPanel from '@/components/codestream/EditorPanel';
import TerminalPanel from '@/components/codestream/TerminalPanel';
import ParticipantsBar from '@/components/codestream/ParticipantsBar';
import CommandPalette from '@/components/codestream/CommandPalette';
import SettingsDialog from '@/components/codestream/SettingsDialog';
import ProfileDialog from '@/components/codestream/ProfileDialog';
import CreateRoomDialog from '@/components/codestream/CreateRoomDialog';
import JoinRoomDialog from '@/components/codestream/JoinRoomDialog';
import { toast } from 'sonner';
import socketService from '@/services/socket';
import { roomAPI } from '@/services/api';
import { Code2 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { roomId: urlRoomId } = useParams();
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(urlRoomId || null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    minimap: false,
    lineNumbers: true,
    wordWrap: true,
  });

  const activeRoom = (activeRoomId && rooms.find((r) => r.id === activeRoomId)) || rooms[0] || {
    id: 'placeholder',
    name: 'New Room',
    language: 'typescript' as Language,
    participants: [],
    isActive: false,
    syncStatus: 'offline' as const,
    lastActivity: new Date(),
    codeBuffer: '',
  };

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('theme-cyberpunk', 'theme-dracula', 'theme-minimal');
    if (theme !== 'cyberpunk') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Fetch rooms on mount
  const fetchRooms = async (selectRoomId?: string) => {
    try {
      const response = await roomAPI.getRooms();

      if (response.data.success) {
        const fetchedRooms = response.data.data.map((room: any) => ({
          ...room,
          id: room.id || room._id,
          participants: room.participants.map((p: any) => ({
            ...p,
            id: p.id || p.userId?._id || p.userId || p._id
          }))
        }));

        console.log('📦 Fetched rooms (mapped):', fetchedRooms.length, fetchedRooms.map(r => r.id));
        setRooms(fetchedRooms);

        // Always set active room
        if (selectRoomId) {
          console.log('🎯 Setting active room to:', selectRoomId);
          setActiveRoomId(selectRoomId);
        } else if (fetchedRooms.length > 0 && !activeRoomId) {
          const firstId = fetchedRooms[0].id;
          console.log('🎯 Auto-selecting first room:', firstId);
          setActiveRoomId(firstId);
        }
      }
    } catch (error: any) {
      console.error('Fetch rooms error:', error);
    }
  };

  // Create room
  const handleCreateRoom = async (name: string, language: Language) => {
    try {
      const response = await roomAPI.createRoom({ name, language });

      if (response.data.success) {
        toast.success(`Created room: ${name}`);
        await fetchRooms(response.data.data.id);
      }
    } catch (error: any) {
      console.error('Create Room Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create room');
    }
  };

  const submitJoinRoom = async (roomId: string) => {
    try {
      const loadingToast = toast.loading('Joining workspace...');

      const response = await roomAPI.joinRoom(roomId);

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`Joined room: ${response.data.data.name}`);
        await fetchRooms(roomId);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join room. Check the ID.');
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token && !userId) {
      navigate('/login');
      return;
    }

    try {
      const socket = socketService.connect(token || userId || '');

      const updateStatus = () => {
        setIsConnected(socket.connected && navigator.onLine);
      };

      socket.on('connect', () => {
        console.log('✅ Connected to backend');
        setIsConnected(true);
        toast.success('Connected to server');
        fetchRooms();
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from backend');
        setIsConnected(false);
        toast.error('Disconnected from server');
      });

      socket.on('connect_error', () => {
        setIsConnected(false);
      });

      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', () => setIsConnected(false));

      return () => {
        socketService.disconnect();
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', () => setIsConnected(false));
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to server');
    }
  }, [navigate]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🖥️ State:', { activeRoomId, roomsCount: rooms.length, activeRoomName: activeRoom.name, activeRoomIdValue: activeRoom.id });
  }, [activeRoomId, rooms, activeRoom]);

  useEffect(() => {
    if (isConnected && activeRoomId) {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      socketService.joinRoom(activeRoomId, userId);

      setRooms((prev) =>
        prev.map((room) => ({
          ...room,
          syncStatus: room.id === activeRoomId ? 'synced' : room.syncStatus,
        }))
      );

      // Listen for room state when joining
      const handleRoomState = (data: { code: string; language: string; participants: any[] }) => {
        console.log('🔄 Received room-state:', data);

        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? {
                ...room,
                codeBuffer: data.code,
                language: data.language as any,
                participants: data.participants,
              }
              : room
          )
        );
      };

      socketService.onRoomState(handleRoomState);

      const handleCursorUpdate = (data: { userId: string; line: number; column: number }) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? {
                ...room,
                participants: room.participants.map((p: any) => {
                  const pId = p.id || p.userId?._id || p.userId || p._id;
                  return pId === data.userId
                    ? { ...p, cursorPosition: { line: data.line, column: data.column } }
                    : p;
                }),
              }
              : room
          )
        );
      };

      const handleUserJoined = (data: { userId: string; participants: any[] }) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? {
                ...room,
                participants: data.participants.map((p: any) => ({
                  ...p,
                  id: p.id || p.userId?._id || p.userId || p._id
                })),
              }
              : room
          )
        );
      };

      const handleUserLeft = (data: { userId: string }) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === activeRoomId
              ? {
                ...room,
                participants: room.participants.map((p: any) => {
                  const pId = p.id || p.userId?._id || p.userId || p._id;
                  return pId === data.userId ? { ...p, isOnline: false } : p;
                }),
              }
              : room
          )
        );
      };

      socketService.socket?.on('cursor-update', handleCursorUpdate);
      socketService.socket?.on('user-joined', handleUserJoined);
      socketService.socket?.on('user-left', handleUserLeft);

      return () => {
        socketService.socket?.off('room-state', handleRoomState);
        socketService.socket?.off('cursor-update', handleCursorUpdate);
        socketService.socket?.off('user-joined', handleUserJoined);
        socketService.socket?.off('user-left', handleUserLeft);
      };
    }
  }, [isConnected, activeRoomId]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme: ${newTheme}`);
  };

  const handleLanguageChange = (language: Language) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoomId ? { ...room, language } : room
      )
    );
  };

  const handleCodeChange = (newCode: string) => {
    if (activeRoomId) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === activeRoomId ? { ...room, codeBuffer: newCode } : room
        )
      );

      // If we have a selected file, update its content too
      if (currentFile) {
        setCurrentFile((prev: any) => ({ ...prev, content: newCode }));
      }
    }
  };

  const handleRun = () => {
    if (activeRoomId && isConnected) {
      // Find the LATEST code from rooms state to be sure
      const latestRoom = rooms.find(r => r.id === activeRoomId);
      const code = latestRoom?.codeBuffer || activeRoom.codeBuffer;
      const language = activeRoom.language;

      toast.success(`Running ${language} code...`);
      socketService.socket?.emit('run-code', {
        roomId: activeRoomId,
        code,
        language
      });
    } else {
      toast.error('Connect to a room to run code');
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      const response = await roomAPI.leaveRoom(roomId);
      if (response.data.success) {
        toast.success('Left room');

        // Remove from local state
        const remainingRooms = rooms.filter(r => r.id !== roomId);
        setRooms(remainingRooms);

        // If we closed the active room, switch to another one
        if (activeRoomId === roomId) {
          if (remainingRooms.length > 0) {
            setActiveRoomId(remainingRooms[0].id);
          } else {
            setActiveRoomId(null);
          }
        }
      }
    } catch (error: any) {
      console.error('Leave Room Error:', error);
      toast.error('Failed to leave room');
      // Still remove locally to keep UI responsive if backend fails? 
      // Better to stay in sync. For now, keep it strict.
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    socketService.disconnect();
    navigate('/login');
    toast.info('Signed out');
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-neon-purple/5 via-background to-neon-cyan/5 pointer-events-none" />

      <Header
        theme={theme}
        onThemeChange={handleThemeChange}
        isConnected={isConnected}
        onCommandClick={() => setIsCommandPaletteOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onDashboardClick={handleDashboardClick}
        onSignOut={handleSignOut}
        activeRoomId={activeRoomId}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <FileExplorer roomId={activeRoomId} onSelectFile={setCurrentFile} />

        <div className="flex-1 flex flex-col min-w-0">
          <RoomTabs
            rooms={rooms}
            activeRoomId={activeRoomId}
            onRoomChange={(roomId) => {
              console.log('🔄 Room changed to:', roomId);
              setActiveRoomId(roomId);
            }}
            onCloseRoom={handleLeaveRoom}
            onCreateRoom={() => setIsCreateRoomOpen(true)}
          />

          <div className="flex-1 relative flex flex-col min-h-0">
            {activeRoomId && activeRoom.id !== 'placeholder' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 relative min-h-0">
                  <EditorPanel
                    language={currentFile?.language || activeRoom.language}
                    onLanguageChange={handleLanguageChange}
                    onRun={handleRun}
                    onCodeChange={handleCodeChange}
                    roomId={activeRoomId}
                    isConnected={isConnected}
                    settings={editorSettings}
                    initialCode={currentFile?.content || activeRoom.codeBuffer || ''}
                    fileName={currentFile?.name}
                    fileId={currentFile?.id}
                  />
                </div>
                <TerminalPanel
                  isExpanded={isTerminalExpanded}
                  onToggle={() => setIsTerminalExpanded(!isTerminalExpanded)}
                  roomId={activeRoomId || ''}
                  isConnected={isConnected}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-[#0a0c10]">
                <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center mb-8">
                    <Code2 className="w-10 h-10 text-neon-cyan" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 neon-text-cyan">Welcome to CodeStream</h2>
                  <p className="text-muted-foreground text-lg mb-8">Create or join a workspace to start collaborating</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ParticipantsBar
          participants={activeRoom.participants || []}
          currentUserId={localStorage.getItem('userId') || ''}
        />
      </div>

      <CommandPalette
        open={isCommandPaletteOpen}
        setOpen={setIsCommandPaletteOpen}
        onThemeChange={handleThemeChange}
        onJoinClick={() => setIsJoinDialogOpen(true)}
        onCreateClick={() => setIsCreateRoomOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={editorSettings}
        onSettingsChange={setEditorSettings}
      />

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />

      <CreateRoomDialog
        open={isCreateRoomOpen}
        onOpenChange={setIsCreateRoomOpen}
        onCreate={handleCreateRoom}
      />

      <JoinRoomDialog
        open={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
        onJoin={submitJoinRoom}
      />
    </div>
  );
}
