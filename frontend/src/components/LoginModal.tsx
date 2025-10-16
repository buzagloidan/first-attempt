import React, { useState } from 'react';
import './Modal.css';

interface LoginModalProps {
  onLogin: (username: string, password: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function LoginModal({ onLogin, isOpen = true, onClose }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'admin' && password === '12345678') {
      onLogin(username, password);
      setError('');
      setUsername('');
      setPassword('');
    } else {
      setError('Invalid credentials. Use admin / 12345678');
    }
  };

  const handleClose = () => {
    if (onClose) {
      setError('');
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)' }} onClick={handleClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Welcome to Buzaglo Engine</h2>
          {onClose && (
            <button className="modal-close" onClick={handleClose}>
              ×
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Please sign in to continue
            </p>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#991b1b',
                fontSize: '14px',
                marginTop: '12px'
              }}>
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

