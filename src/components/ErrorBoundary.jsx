import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production: send to error tracking service (Sentry, etc.)
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', textTransform: 'uppercase', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            An unexpected error occurred in this section. Your other data is safe.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginBottom: 24,
              padding: 14,
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius)',
              textAlign: 'left',
              fontSize: '.78rem',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--danger)',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: 8 }}>
                Error details (dev only)
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <Link to="/" className="btn btn--ghost btn--sm">Go Home</Link>
          </div>
        </div>
      </div>
    )
  }
}
