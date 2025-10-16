export type NodeType = 'llm' | 'research';
export type NodeStatus = 'pending' | 'running' | 'success' | 'error';
export type ComplexityLevel = 'intern' | 'manager' | 'ceo';

export interface TreeNode {
  id: string;
  tree_id: string;
  parent_id?: string;
  type: NodeType;
  prompt?: string;
  model_id?: string;
  result_text?: string;
  citations_json?: Citation[];
  cost_cents: number;
  duration_ms?: number;
  status: NodeStatus;
  created_at: string;
}

export interface TreeEdge {
  id: string;
  tree_id: string;
  source_id: string;
  target_id: string;
  label?: string;
}

export interface Tree {
  id: string;
  project_id: string;
  title: string;
  root_node_id?: string;
  created_at: string;
}

export interface Citation {
  title: string;
  url?: string;
  snippet?: string;
  source?: string;
}

export interface ComplexityConfig {
  cu: number;
  maxDepth: number;
  maxWidth: number;
  defaultBranches: number;
  estimatedETA: number;
}

export const COMPLEXITY_CONFIGS: Record<ComplexityLevel, ComplexityConfig> = {
  intern: {
    cu: 3,
    maxDepth: 2,
    maxWidth: 2,
    defaultBranches: 3,
    estimatedETA: 20,
  },
  manager: {
    cu: 12,
    maxDepth: 3,
    maxWidth: 3,
    defaultBranches: 5,
    estimatedETA: 120,
  },
  ceo: {
    cu: 36,
    maxDepth: 4,
    maxWidth: 4,
    defaultBranches: 7,
    estimatedETA: 300,
  },
};

