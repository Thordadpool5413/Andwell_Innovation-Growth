'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.label || 'view', error.message, info.componentStack?.slice(0, 400));
  }

  render() {
    if (this.state.error) {
      return (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center', marginTop: '0' }}>
          <h3 style={{ margin: '0 0 8px' }}>Something went wrong{this.props.label ? ` in ${this.props.label}` : ''}</h3>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', maxWidth: '480px', marginInline: 'auto' }}>
            {this.state.error.message || 'An unexpected error occurred. Try refreshing or switching to a different view.'}
          </p>
          <button className="btn primary" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
