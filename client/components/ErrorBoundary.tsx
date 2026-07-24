import React from "react";

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

// Filet de sécurité global : si une page crash, on affiche un écran de repli
// au lieu d'une page blanche, avec un bouton pour revenir à l'accueil.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Erreur non gérée:", error?.message, error?.stack, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <p className="text-5xl mb-4">😵</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Une erreur inattendue est survenue
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Nos équipes ont été prévenues. Vous pouvez recharger la page ou revenir à
              l'accueil.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Recharger
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
