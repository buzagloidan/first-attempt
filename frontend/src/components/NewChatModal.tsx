import React, { useState } from 'react';
import './Modal.css';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, prompt: string) => void;
}

export function NewChatModal({ isOpen, onClose, onSubmit }: NewChatModalProps) {
  const [question, setQuestion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (question.trim()) {
      onSubmit(question.trim(), question.trim());
      setQuestion('');
      onClose();
    }
  };

  const handleClose = () => {
    setQuestion('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim()) {
        handleSubmit(e as any);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Chat</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="question">Enter your question or topic to explore</label>
              <textarea
                id="question"
                className="form-textarea"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What would you like to explore?"
                autoFocus
                rows={4}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!question.trim()}>
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

