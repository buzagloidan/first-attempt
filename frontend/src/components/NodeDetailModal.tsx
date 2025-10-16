import React from 'react';
import { TreeNode } from '../types';
import './Modal.css';

interface NodeDetailModalProps {
  isOpen: boolean;
  node: TreeNode | null;
  onClose: () => void;
}

export function NodeDetailModal({ isOpen, node, onClose }: NodeDetailModalProps) {
  if (!isOpen || !node) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Node Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="node-detail-section">
            <h3>Status</h3>
            <span className={`status-badge status-${node.status}`}>
              {node.status}
            </span>
          </div>

          <div className="node-detail-section">
            <h3>Type</h3>
            <p>{node.type === 'llm' ? 'LLM Analysis' : 'Research'}</p>
          </div>

          {node.prompt && (
            <div className="node-detail-section">
              <h3>Prompt</h3>
              <p className="node-detail-text">{node.prompt}</p>
            </div>
          )}

          {node.result_text && (
            <div className="node-detail-section">
              <h3>Result</h3>
              <div className="node-detail-text" style={{ whiteSpace: 'pre-wrap' }}>
                {node.result_text}
              </div>
            </div>
          )}

          {node.citations_json && node.citations_json.length > 0 && (
            <div className="node-detail-section">
              <h3>Citations</h3>
              <ul className="citations-list">
                {node.citations_json.map((citation, idx) => (
                  <li key={idx}>
                    <strong>{citation.title}</strong>
                    {citation.url && (
                      <a href={citation.url} target="_blank" rel="noopener noreferrer">
                        {citation.url}
                      </a>
                    )}
                    {citation.snippet && <p>{citation.snippet}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="node-detail-section">
            <h3>Metadata</h3>
            <div className="metadata-grid">
              <div>
                <strong>Cost:</strong> {node.cost_cents} cents
              </div>
              {node.duration_ms && (
                <div>
                  <strong>Duration:</strong> {node.duration_ms}ms
                </div>
              )}
              <div>
                <strong>Created:</strong> {formatDate(node.created_at)}
              </div>
              {node.model_id && (
                <div>
                  <strong>Model:</strong> {node.model_id}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

