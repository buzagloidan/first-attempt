import React, { useState } from 'react';
import { ComplexityLevel, COMPLEXITY_CONFIGS } from '../types';
import './Modal.css';

interface BranchModalProps {
  isOpen: boolean;
  complexity: ComplexityLevel;
  onClose: () => void;
  onSubmit: (hint?: string, k?: number) => void;
}

export function BranchModal({ isOpen, complexity, onClose, onSubmit }: BranchModalProps) {
  const [hint, setHint] = useState('');
  const [branchCount, setBranchCount] = useState(COMPLEXITY_CONFIGS[complexity].defaultBranches);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(hint || undefined, branchCount);
    setHint('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Branch Exploration</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Hint (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Any specific direction or focus for the branches..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>Number of Branches</label>
              <input
                type="number"
                className="form-input"
                min={2}
                max={8}
                value={branchCount}
                onChange={(e) => setBranchCount(parseInt(e.target.value))}
              />
              <small className="form-help">2-8 branches recommended</small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Branches
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

