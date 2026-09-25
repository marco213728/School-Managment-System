import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReload = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 bg-red-500/20 text-red-400 rounded-xl text-2xl font-bold">⚠️</span>
              <div>
                <h1 className="text-xl font-bold text-white">Error de Carga en la Vista</h1>
                <p className="text-xs text-slate-400">Se produjo un error al renderizar este componente</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-red-300 overflow-x-auto mb-6 max-h-48">
              {this.state.error?.toString()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold rounded-xl transition"
              >
                Limpiar y Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
