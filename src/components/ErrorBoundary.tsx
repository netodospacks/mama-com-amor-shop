import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-2xl font-bold mb-4">
            !
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Ops! Algo deu errado</h1>
          <p className="text-sm text-neutral-400 max-w-md mb-6 leading-relaxed">
            Ocorreu uma instabilidade temporária ao carregar este conteúdo. Por favor, recarregue a página para continuar navegando.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E5C378] text-black px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Recarregar Página
            </button>
            <a
              href="/"
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:text-white transition-colors"
            >
              Ir para o Início
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
