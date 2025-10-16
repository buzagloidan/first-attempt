import React from 'react';
import { useStore } from '../store';
import { exportTree } from '../api';
import './FlattenDrawer.css';

export function FlattenDrawer() {
  const { flattenResult, isFlattenOpen, setFlattenOpen, tree } = useStore();

  if (!isFlattenOpen || !flattenResult) return null;

  const handleExportMarkdown = async () => {
    if (!tree) return;
    
    try {
      const markdown = await exportTree(tree.id, 'md');
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tree.title.replace(/\s+/g, '-')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export markdown:', error);
    }
  };

  const handleExportJSON = async () => {
    if (!tree) return;
    
    try {
      const data = await exportTree(tree.id, 'json');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tree.title.replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export JSON:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(flattenResult);
  };

  return (
    <div className="flatten-drawer">
      <div className="drawer-header">
        <h2>Summary</h2>
        <button className="drawer-close" onClick={() => setFlattenOpen(false)}>
          ×
        </button>
      </div>
      
      <div className="drawer-content">
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(flattenResult) }} />
      </div>
      
      <div className="drawer-footer">
        <button className="drawer-btn" onClick={handleCopy}>
          Copy to Clipboard
        </button>
        <button className="drawer-btn" onClick={handleExportMarkdown}>
          Export Markdown
        </button>
        <button className="drawer-btn" onClick={handleExportJSON}>
          Export JSON
        </button>
      </div>
    </div>
  );
}

// Simple markdown formatter (basic implementation)
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>');
}

