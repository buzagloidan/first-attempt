import React from 'react';
import { Handle, Position } from 'reactflow';
import { TreeNode } from '../types';
import './NodeCard.css';

interface NodeCardProps {
  data: {
    node: TreeNode;
    onBranch: () => void;
    onDeepDive: () => void;
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
  };
}

export function NodeCard({ data }: NodeCardProps) {
  const { node, onBranch, onDeepDive, onHoverStart, onHoverEnd } = data;
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getTitle = () => {
    // Check if first line is a markdown header
    if (node.result_text) {
      const lines = node.result_text.split('\n');
      const firstLine = lines[0].trim();
      
      // If first line is a markdown header, use it as title
      if (firstLine.match(/^#+\s+/)) {
        return firstLine.replace(/^#+\s*/, '').substring(0, 100);
      }
    }
    
    // Otherwise use the prompt as a summary title
    return node.prompt?.substring(0, 100) || 'Node';
  };

  const getContent = () => {
    if (!node.result_text) return '';
    
    const lines = node.result_text.split('\n');
    const firstLine = lines[0].trim();
    
    // If first line is a markdown header, skip it in the content
    if (firstLine.match(/^#+\s+/)) {
      return lines.slice(1).join('\n').trim();
    }
    
    return node.result_text;
  };

  const handleBranchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBranch();
  };

  const handleDeepDiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeepDive();
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverStart?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverEnd?.();
  };

  return (
    <div 
      className={`node-wrapper ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`node-card ${isExpanded ? 'expanded' : ''}`}
        onClick={handleCardClick}
      >
        <Handle type="target" position={Position.Top} />
        
        <div className="node-type-badge">{node.type === 'llm' ? 'LLM' : 'Research'}</div>
        
        <h3 className="node-title">{getTitle()}</h3>
        
        {getContent() && (
          <div className="node-content">
            {isExpanded ? (
              <p className="node-full-text">{getContent()}</p>
            ) : (
              <p className="node-preview-text">
                {getContent().length > 150 
                  ? getContent().substring(0, 150) + '...' 
                  : getContent()}
              </p>
            )}
          </div>
        )}

        {node.status === 'running' && (
          <div className="node-loading">Loading...</div>
        )}
        
        <Handle type="source" position={Position.Bottom} />
      </div>

      {isHovered && node.status === 'success' && (
        <div className="node-actions">
          <button className="node-action-btn" onClick={handleBranchClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Branch
          </button>
          <button className="node-action-btn" onClick={handleDeepDiveClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Deep Dive
          </button>
        </div>
      )}
    </div>
  );
}

