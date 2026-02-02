import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Code2, Github, Cpu, Globe, User, Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

const authApi = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10s timeout to prevent infinite loading
});

export default function Login() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const processingRef = useRef(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Handle GitHub Callback
    useEffect(() => {
        const code = searchParams.get('code');
        if (code && !processingRef.current) {
            processingRef.current = true;
            // Clean URL immediately
            setSearchParams({}, { replace: true });
            handleGithubCallback(code);
        }
    }, [searchParams, setSearchParams]);

    const handleGithubCallback = async (code: string) => {
        const loadingToast = toast.loading('Authenticating with GitHub...');
        try {
            const response = await authApi.post('/auth/github', { code });
            if (response.data.success) {
                toast.dismiss(loadingToast);
                saveUserAndNavigate(response.data);
            }
        } catch (error: any) {
            console.error('GitHub Auth Error:', error);
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'GitHub authentication failed.');
        }
    };

    const handleGithubLogin = () => {
        if (!GITHUB_CLIENT_ID) {
            toast.error('GitHub Client ID not configured');
            return;
        }
        const redirectUri = `${window.location.origin}/login`;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const endpoint = isRegister ? 'register' : 'login';
        const loadingToast = toast.loading(isRegister ? 'Creating your account...' : 'Signing in...');

        try {
            const response = await authApi.post(`/auth/${endpoint}`, formData);

            if (response.data.success) {
                toast.dismiss(loadingToast);
                saveUserAndNavigate(response.data);
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const saveUserAndNavigate = (data: any) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);

        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0a0c10] overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px]" />

            {/* Left Side: Branding */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-20 relative z-10">
                <div className="flex items-center gap-4 mb-8 translate-y-[-20px]">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.3)]">
                        <Code2 className="w-10 h-10 text-background" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                        CODE<span className="text-neon-cyan">STREAM</span>
                    </h1>
                </div>

                <div className="max-w-xl space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        The ultimate playground for <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Modern Teams.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Collaborate in real-time, execute code instantly, and build projects together without constraints.
                    </p>

                    <div className="grid grid-cols-2 gap-6 pt-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-neon-cyan">
                                <Globe className="w-5 h-5" />
                                <span className="font-semibold">Global Sync</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Zero-latency collaboration across the planet.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-neon-purple">
                                <Cpu className="w-5 h-5" />
                                <span className="font-semibold">Power Execution</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Native speed code execution in the cloud.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-[500px] flex items-center justify-center p-8 bg-[#0d1117] border-l border-white/10 relative z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {isRegister ? 'Join the future of coding today' : 'Continue your coding journey'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        className="w-full bg-[#161b22] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full bg-[#161b22] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    className="w-full bg-[#161b22] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                        >
                            {isRegister ? 'Sign Up' : 'Sign In'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase px-2">
                            <span className="bg-[#0d1117] text-muted-foreground px-2">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleGithubLogin}
                            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-[#24292e] hover:bg-[#2f363d] text-white transition-all shadow-lg border border-white/5 group"
                        >
                            <Github className="w-5 h-5" />
                            <span className="font-semibold">Continue with GitHub</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="ml-2 text-neon-cyan hover:underline font-semibold"
                            >
                                {isRegister ? 'Sign In' : 'Sign Up Now'}
                            </button>
                        </p>
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest pt-4">
                        Secure SSL Encryption • Real-time Data Sync
                    </p>
                </div>
            </div>

        </div>
    );
}
