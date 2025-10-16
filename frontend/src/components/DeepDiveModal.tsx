import React, { useState } from 'react';
import { ComplexityLevel, COMPLEXITY_CONFIGS } from '../types';
import './Modal.css';

interface DeepDiveModalProps {
  isOpen: boolean;
  complexity: ComplexityLevel;
  onClose: () => void;
  onSubmit: (description?: string) => void;
}

export function DeepDiveModal({ isOpen, complexity, onClose, onSubmit }: DeepDiveModalProps) {
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const config = COMPLEXITY_CONFIGS[complexity];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(description || undefined);
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Deep Dive</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="complexity-info">
              <p><strong>Complexity:</strong> {complexity.toUpperCase()}</p>
              <p><strong>CU Budget:</strong> {config.cu} units</p>
              <p><strong>Expected nodes:</strong> ~{Math.floor(config.cu * 0.8)}-{config.cu}</p>
              <p><strong>ETA:</strong> ~{Math.floor(config.estimatedETA / 60)} min</p>
            </div>
            
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what aspects you want to explore in depth..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Start Deep Dive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

