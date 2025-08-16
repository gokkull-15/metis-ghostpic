import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      const showDetails = this.props.showDetails !== false;
      
      return (
        <div className="p-4 bg-red-800/25 border border-red-500 rounded-sm text-red-300 mb-4">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          {showDetails && (
            <details className="whitespace-pre-wrap text-sm">
              <summary className="cursor-pointer font-medium mb-2">View error details</summary>
              <p className="mb-2">{this.state.error && this.state.error.toString()}</p>
              <p className="font-mono text-xs bg-black/50 p-3 rounded-sm overflow-auto max-h-48">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </details>
          )}
        </div>
      );
    }

    // If no error occurred, render the children components normally
    return this.props.children;
  }
}

export default ErrorBoundary;
