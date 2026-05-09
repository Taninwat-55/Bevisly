import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h1>
                    <p className="text-gray-600 mb-6">Something went wrong. We're looking into it.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-md hover:bg-[var(--color-brand-primary-hover)] transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}