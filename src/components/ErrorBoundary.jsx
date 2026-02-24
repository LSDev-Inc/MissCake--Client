import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container py-16">
          <div className="card mx-auto max-w-xl p-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Si e verificato un errore</h1>
            <p className="mt-2 text-slate-600">Ricarica la pagina per riprovare.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
