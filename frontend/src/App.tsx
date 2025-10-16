import React, { useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { BranchModal } from './components/BranchModal';
import { DeepDiveModal } from './components/DeepDiveModal';
import { FlattenDrawer } from './components/FlattenDrawer';
import { LoginModal } from './components/LoginModal';
import { NewChatModal } from './components/NewChatModal';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { useStore } from './store';
import { createTree, executeBranch, executeDeepDive, executeFlatten, getAllTrees, getTree } from './api';
import './App.css';

function App() {
  const {
    isAuthenticated,
    userEmail,
    allTrees,
    tree,
    nodes,
    edges,
    complexity,
    login,
    logout,
    setAllTrees,
    setTree,
    setNodes,
    setEdges,
    addNodes,
    addEdges,
    setLoading,
    setFlattenResult,
    setFlattenOpen,
    reset,
  } = useStore();

  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [deepDiveModalOpen, setDeepDiveModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  // Load trees when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllTrees();
    }
  }, [isAuthenticated]);

  const loadAllTrees = async () => {
    try {
      const trees = await getAllTrees();
      setAllTrees(trees);
    } catch (error) {
      console.error('Failed to load trees:', error);
    }
  };

  const handleLogin = (username: string, password: string) => {
    // Simple hardcoded auth
    if (username === 'admin' && password === '12345678') {
      login('buzagloidan@gmail.com');
      setLoginModalOpen(false);
      
      // Execute pending query if exists
      if (pendingQuery) {
        setTimeout(() => {
          handleCreateTree(pendingQuery, pendingQuery);
          setPendingQuery(null);
        }, 100);
      }
    }
  };

  const handleLandingSubmit = (query: string) => {
    // Store the query and show login modal
    setPendingQuery(query);
    setLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleNewChat = () => {
    setNewChatModalOpen(true);
  };

  const handleNewChatSubmit = async (title: string, prompt: string) => {
    reset();
    await handleCreateTree(title, prompt);
  };

  const handleSelectTree = async (treeId: string) => {
    try {
      setLoading(true);
      const response = await getTree(treeId);
      setTree(response.tree);
      setNodes(response.nodes);
      setEdges(response.edges);
    } catch (error) {
      console.error('Failed to load tree:', error);
      alert('Failed to load tree. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = async (title: string, prompt: string) => {
    try {
      setLoading(true);
      const response = await createTree(title, prompt);
      setTree(response.tree);
      setNodes([response.root_node]);
      setEdges([]);
      
      // Auto-branch on the root node after creation
      setTimeout(async () => {
        try {
          const branchResponse = await executeBranch(response.root_node.id, complexity);
          addNodes(branchResponse.children);
          addEdges(branchResponse.edges);
          // Reload trees list
          loadAllTrees();
        } catch (error) {
          console.error('Failed to auto-branch:', error);
        } finally {
          setLoading(false);
        }
      }, 500);
    } catch (error) {
      console.error('Failed to create tree:', error);
      alert('Failed to create tree. Please try again.');
      setLoading(false);
    }
  };

  const handleBranchClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setBranchModalOpen(true);
  };

  const handleDeepDiveClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setDeepDiveModalOpen(true);
  };

  const handleBranchSubmit = async (hint?: string, k?: number) => {
    if (!selectedNodeId) return;

    try {
      setLoading(true);
      const response = await executeBranch(selectedNodeId, complexity, hint, k);
      addNodes(response.children);
      addEdges(response.edges);
    } catch (error) {
      console.error('Failed to execute branch:', error);
      alert('Failed to execute branch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeepDiveSubmit = async (description?: string) => {
    if (!selectedNodeId) return;

    try {
      setLoading(true);
      const response = await executeDeepDive(selectedNodeId, complexity, description);
      addNodes(response.expanded_nodes);
      addEdges(response.edges);
    } catch (error) {
      console.error('Failed to execute deep dive:', error);
      alert('Failed to execute deep dive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlatten = async () => {
    if (!tree) return;

    try {
      setLoading(true);
      const response = await executeFlatten(tree.id);
      setFlattenResult(response.markdown);
      setFlattenOpen(true);
    } catch (error) {
      console.error('Failed to execute flatten:', error);
      alert('Failed to execute flatten. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onSubmit={handleLandingSubmit} />
        <LoginModal 
          isOpen={loginModalOpen} 
          onLogin={handleLogin}
          onClose={() => {
            setLoginModalOpen(false);
            setPendingQuery(null);
          }}
        />
      </>
    );
  }

  return (
    <div className="app" style={{ display: 'flex', height: '100vh' }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
        <Sidebar
          trees={allTrees}
          currentTreeId={tree?.id || null}
          onNewChat={handleNewChat}
          onSelectTree={handleSelectTree}
          onSignOut={handleLogout}
          userEmail={userEmail}
          credits={0.90}
        />
        
        <div className="app-content" style={{ flex: 1, minWidth: 0 }}>
        {tree && nodes.length > 0 ? (
          <Canvas
            nodes={nodes}
            edges={edges}
            onBranch={handleBranchClick}
            onDeepDive={handleDeepDiveClick}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>Welcome to Buzaglo Engine</h2>
              <p>Click "New chat" to start exploring</p>
            </div>
          </div>
        )}
        </div>
      </div>

      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSubmit={handleNewChatSubmit}
      />

      <BranchModal
        isOpen={branchModalOpen}
        complexity={complexity}
        onClose={() => setBranchModalOpen(false)}
        onSubmit={handleBranchSubmit}
      />

      <DeepDiveModal
        isOpen={deepDiveModalOpen}
        complexity={complexity}
        onClose={() => setDeepDiveModalOpen(false)}
        onSubmit={handleDeepDiveSubmit}
      />

      <FlattenDrawer />
    </div>
  );
}

export default App;

