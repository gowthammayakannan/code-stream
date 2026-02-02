import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Theme } from '@/types/codestream';
import { Code2 } from 'lucide-react';

export default function Index() {
    console.log('✅ Index component rendering');
    const navigate = useNavigate();
    const [theme, setTheme] = useState<Theme>('cyberpunk');

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
            <div className="fixed inset-0 bg-gradient-to-br from-neon-purple/5 via-background to-neon-cyan/5 pointer-events-none" />

            {/* Simplified Header */}
            <header className="h-14 glass-panel-strong border-b border-white/10 flex items-center justify-between px-4 z-50 relative">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-magenta flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-background" />
                    </div>
                    <h1 className="text-lg font-bold neon-text-cyan">CodeStream</h1>
                </div>
                <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                >
                    Sign Out
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center mb-8">
                    <Code2 className="w-10 h-10 text-neon-cyan" />
                </div>
                <h2 className="text-3xl font-bold mb-4 neon-text-cyan">Welcome to CodeStream</h2>
                <p className="text-muted-foreground text-lg mb-8">Create or join a workspace to start collaborating</p>
                <p className="text-sm text-gray-500">Theme: {theme}</p>
            </div>
        </div>
    );
}
