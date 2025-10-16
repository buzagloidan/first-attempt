import React, { useState } from 'react';
import { Tree } from '../types';
import './Sidebar.css';

interface SidebarProps {
  trees: Tree[];
  currentTreeId: string | null;
  onNewChat: () => void;
  onSelectTree: (treeId: string) => void;
  onSignOut: () => void;
  userEmail: string;
  credits: number;
}

export function Sidebar({
  trees,
  currentTreeId,
  onNewChat,
  onSelectTree,
  onSignOut,
  userEmail,
  credits
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <div className="sidebar-header">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <line x1="9" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar" aria-label="Sidebar">
      <div className="sidebar-container">
        {/* Header with collapse button */}
        <div className="sidebar-header">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <line x1="9" y1="4" x2="9" y2="20"></line>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="sidebar-content">
          <div className="sidebar-section-label">NEW</div>
          
          <button className="sidebar-new-chat-btn" onClick={onNewChat}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>New chat</span>
          </button>

          {trees.length > 0 && (
            <>
              <div className="sidebar-section-label">RECENT CHATS</div>
              <div className="sidebar-trees">
                {trees.map((tree) => (
                  <button
                    key={tree.id}
                    className={`sidebar-tree-item ${currentTreeId === tree.id ? 'active' : ''}`}
                    onClick={() => onSelectTree(tree.id)}
                    title={tree.title}
                  >
                    {tree.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User info footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <img 
              src="https://lh3.googleusercontent.com/a/ACg8ocIDP9GJy6kEL8sRvO0SNNpkiSLNBcezf6etN0kzcbd99dQxTCY7mA=s96-c" 
              alt="Idan Buzaglo" 
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">
                <span>Idan Buzaglo</span>
                <span className="sidebar-credits" title="Credits">
                  ${credits.toFixed(2)}
                </span>
              </div>
              <div className="sidebar-user-email">{userEmail}</div>
              <button className="sidebar-signout-btn" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

