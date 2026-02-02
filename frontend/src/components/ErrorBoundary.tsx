import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('❌ Error caught by boundary:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen flex items-center justify-center bg-black text-white p-8">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl font-bold text-red-500 mb-4">Application Error</h1>
                        <p className="text-lg mb-4">Something went wrong. Please check console for details.</p>
                        <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
                            {this.state.error?.toString()}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
