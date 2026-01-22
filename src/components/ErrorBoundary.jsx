import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fff',
          color: '#333',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          lineHeight: '1.6'
        }}>
          <h2 style={{ color: '#f5222d', marginBottom: '16px' }}>应用出错了</h2>
          <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '600px', backgroundColor: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>错误信息</h3>
            <p style={{ margin: '0 0 8px 0' }}>{this.state.error?.toString()}</p>
          </div>
          <div style={{ textAlign: 'left', margin: '0 auto', maxWidth: '600px', backgroundColor: '#fff7e6', padding: '16px', borderRadius: '8px', border: '1px solid #ffd591' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#fa8c16' }}>错误详情</h3>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px', color: '#666' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onClick={() => {
              window.location.reload();
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;