import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Check if the error is related to OpenAI
      const isOpenAIError = this.state.error?.message.includes('OPENAI_API_KEY');
      
      if (isOpenAIError) {
        // Continue rendering the app normally for OpenAI errors
        return this.props.children;
      }
      
      // For other errors, show the fallback UI
      return this.props.fallback || (
        <div className="p-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600">The application encountered an error. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
