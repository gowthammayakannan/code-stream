import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    LogIn,
    Code2,
    Search,
    Clock,
    Users,
    ArrowRight,
    LayoutDashboard,
    LogOut,
    Settings,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { roomAPI } from '@/services/api';
import CreateRoomDialog from '@/components/codestream/CreateRoomDialog';
import JoinRoomDialog from '@/components/codestream/JoinRoomDialog';
import { Language } from '@/types/codestream';

export default function Dashboard() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('userName') || 'Developer';
        setUserName(name);
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const response = await roomAPI.getRooms();
            if (response.data.success) {
                setRooms(response.data.data);
            }
        } catch (error) {
            console.error('Fetch rooms error:', error);
            toast.error('Failed to load workspaces');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async (name: string, language: Language) => {
        try {
            const response = await roomAPI.createRoom({ name, language });
            if (response.data.success) {
                toast.success(`Created room: ${name}`);
                navigate(`/editor/${response.data.data.id}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create room');
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        try {
            const response = await roomAPI.joinRoom(roomId);
            if (response.data.success) {
                toast.success(`Joined room: ${response.data.data.name}`);
                navigate(`/editor/${roomId}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to join room');
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/login');
        toast.info('Signed out');
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <div className="fixed inset-0 bg-gradient-to-br from-neon-purple/5 via-background to-neon-cyan/5 pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-cyan/20">
                        <Code2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight neon-text-cyan">CodeStream</h1>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Collaborative Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-sm font-medium">{userName}</span>
                        <span className="text-[10px] text-neon-green flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-neon-green" />
                            Online
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:text-destructive">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 container max-w-7xl mx-auto p-8 relative z-10">
                <div className="flex flex-col gap-8">

                    {/* Hero Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card/30 p-8 rounded-3xl border border-white/10 glass-panel">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
                            <p className="text-muted-foreground text-lg">Select a workspace to resume coding or start a new one.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setIsJoinOpen(true)}
                                variant="outline"
                                className="gap-2 border-neon-purple/50 hover:bg-neon-purple/10"
                            >
                                <LogIn className="w-4 h-4" />
                                Join Room
                            </Button>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 shadow-lg shadow-neon-cyan/20"
                            >
                                <Plus className="w-4 h-4" />
                                New Workspace
                            </Button>
                        </div>
                    </div>

                    {/* Search & Stats */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search workspaces..."
                                className="pl-10 bg-muted/20 border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-neon-cyan" />
                                <span>{rooms.length} Workspaces</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-neon-purple" />
                                <span>Collaborative Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Workspaces Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 rounded-2xl bg-muted/10 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : filteredRooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRooms.map((room) => (
                                <Card
                                    key={room.id}
                                    className="group relative overflow-hidden bg-card/20 border-white/10 hover:border-neon-cyan/50 hover:bg-card/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => navigate(`/editor/${room.id}`)}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-5 h-5 text-neon-cyan" />
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold uppercase tracking-wider border border-neon-cyan/20">
                                                {room.language}
                                            </div>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(room.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-neon-cyan transition-colors">{room.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            Active workspace for {room.language} development.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center -space-x-2">
                                            {room.participants.slice(0, 5).map((p: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold"
                                                    title={p.userId?.name || 'User'}
                                                >
                                                    {(p.userId?.name || '?')[0].toUpperCase()}
                                                </div>
                                            ))}
                                            {room.participants.length > 5 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-background bg-muted/50 flex items-center justify-center text-[10px] font-bold">
                                                    +{room.participants.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 flex justify-between items-center text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{room.participants.length} participants</span>
                                        </div>
                                        <span>{room.syncStatus === 'synced' ? '● Ready' : '○ Offline'}</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-card/5">
                            <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
                                <Code2 className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No workspaces found</h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                You haven't joined or created any workspaces yet. Start by creating a new one!
                            </p>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple"
                            >
                                <Plus className="w-4 h-4" />
                                Create First workspace
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <CreateRoomDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onCreate={handleCreateRoom}
            />

            <JoinRoomDialog
                open={isJoinOpen}
                onOpenChange={setIsJoinOpen}
                onJoin={handleJoinRoom}
            />
        </div>
    );
}
