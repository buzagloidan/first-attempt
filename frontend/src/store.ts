import { create } from 'zustand';
import { Tree, TreeNode, TreeEdge, ComplexityLevel } from './types';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  userEmail: string;
  
  // Trees
  allTrees: Tree[];
  tree: Tree | null;
  nodes: TreeNode[];
  edges: TreeEdge[];
  
  // UI State
  selectedNode: TreeNode | null;
  complexity: ComplexityLevel;
  isLoading: boolean;
  flattenResult: string | null;
  isFlattenOpen: boolean;
  
  // Auth Actions
  login: (email: string) => void;
  logout: () => void;
  
  // Tree Actions
  setAllTrees: (trees: Tree[]) => void;
  setTree: (tree: Tree) => void;
  setNodes: (nodes: TreeNode[]) => void;
  setEdges: (edges: TreeEdge[]) => void;
  addNodes: (nodes: TreeNode[]) => void;
  addEdges: (edges: TreeEdge[]) => void;
  updateNode: (nodeId: string, updates: Partial<TreeNode>) => void;
  setSelectedNode: (node: TreeNode | null) => void;
  setComplexity: (complexity: ComplexityLevel) => void;
  setLoading: (loading: boolean) => void;
  setFlattenResult: (result: string | null) => void;
  setFlattenOpen: (open: boolean) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth state
  isAuthenticated: false,
  userEmail: '',
  
  // Trees state
  allTrees: [],
  tree: null,
  nodes: [],
  edges: [],
  
  // UI state
  selectedNode: null,
  complexity: 'manager',
  isLoading: false,
  flattenResult: null,
  isFlattenOpen: false,

  // Auth actions
  login: (email) => set({ isAuthenticated: true, userEmail: email }),
  
  logout: () => set({
    isAuthenticated: false,
    userEmail: '',
    allTrees: [],
    tree: null,
    nodes: [],
    edges: [],
    selectedNode: null,
    flattenResult: null,
    isFlattenOpen: false,
  }),

  // Tree actions
  setAllTrees: (trees) => set({ allTrees: trees }),
  
  setTree: (tree) => set({ tree }),
  
  setNodes: (nodes) => set({ nodes }),
  
  setEdges: (edges) => set({ edges }),
  
  addNodes: (newNodes) => set((state) => ({
    nodes: [...state.nodes, ...newNodes],
  })),
  
  addEdges: (newEdges) => set((state) => ({
    edges: [...state.edges, ...newEdges],
  })),
  
  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
  })),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  setComplexity: (complexity) => set({ complexity }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setFlattenResult: (result) => set({ flattenResult: result }),
  
  setFlattenOpen: (open) => set({ isFlattenOpen: open }),
  
  reset: () => set({
    tree: null,
    nodes: [],
    edges: [],
    selectedNode: null,
    flattenResult: null,
    isFlattenOpen: false,
  }),
}));

