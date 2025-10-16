import React, { useState } from 'react';
import { ComplexityLevel } from '../types';
import { useStore } from '../store';
import './HeaderBar.css';

interface HeaderBarProps {
  onCreateTree: (title: string, prompt: string) => void;
  onFlatten: () => void;
}

export function HeaderBar({ onCreateTree, onFlatten }: HeaderBarProps) {
  const [prompt, setPrompt] = useState('');
  const { complexity, setComplexity, tree, isLoading } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !tree) {
      onCreateTree(prompt, prompt);
    }
  };

  return (
    <div className="header-bar">
      <div className="header-left">
        <h1 className="app-title">Buzaglo Engine</h1>
      </div>
      
      <div className="header-center">
        {!tree && (
          <form onSubmit={handleSubmit} className="prompt-form">
            <input
              type="text"
              className="prompt-input"
              placeholder="Enter your question or topic to explore..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!prompt.trim() || isLoading}
            >
              Start
            </button>
          </form>
        )}
        
        {tree && (
          <div className="tree-title">
            <h2>{tree.title}</h2>
          </div>
        )}
      </div>
      
      <div className="header-right">
        <div className="complexity-control">
          <label>Complexity:</label>
          <select 
            value={complexity} 
            onChange={(e) => setComplexity(e.target.value as ComplexityLevel)}
            className="complexity-select"
          >
            <option value="intern">Intern (Fast)</option>
            <option value="manager">Manager (Balanced)</option>
            <option value="ceo">CEO (Deep)</option>
          </select>
        </div>
        
        {tree && (
          <button className="flatten-button" onClick={onFlatten} disabled={isLoading}>
            Flatten
          </button>
        )}
      </div>
    </div>
  );
}

