import React from 'react';
import { RepoProvider } from './context/RepoContext';
import Home from './pages/Home';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', padding: '50px', background: 'rgba(255,0,0,0.2)', height: '100vh' }}>
          <h2>Frontend Crashed!</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '20px' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <RepoProvider>
        <Home />
      </RepoProvider>
    </ErrorBoundary>
  );
}

export default App;
