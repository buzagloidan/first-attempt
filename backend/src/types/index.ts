export type NodeType = 'llm' | 'research';
export type NodeStatus = 'pending' | 'running' | 'success' | 'error';
export type ActionType = 'branch' | 'deep_dive' | 'flatten';
export type RunStatus = 'running' | 'completed' | 'failed' | 'recoverable';
export type ComplexityLevel = 'intern' | 'manager' | 'ceo';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: Date;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export interface Tree {
  id: string;
  project_id: string;
  title: string;
  root_node_id?: string;
  created_at: Date;
}

export interface Node {
  id: string;
  tree_id: string;
  parent_id?: string;
  type: NodeType;
  prompt?: string;
  model_id?: string;
  params_json?: Record<string, any>;
  result_text?: string;
  citations_json?: Citation[];
  cost_cents: number;
  duration_ms?: number;
  status: NodeStatus;
  created_at: Date;
}

export interface Edge {
  id: string;
  tree_id: string;
  source_id: string;
  target_id: string;
  label?: string;
  created_at: Date;
}

export interface Run {
  id: string;
  tree_id: string;
  action: ActionType;
  cu_budget?: number;
  cost_cents: number;
  started_at: Date;
  finished_at?: Date;
  status: RunStatus;
}

export interface Citation {
  title: string;
  url?: string;
  snippet?: string;
  source?: string;
}

export interface UsageEvent {
  id: string;
  run_id: string;
  provider_id?: string;
  tokens_in: number;
  tokens_out: number;
  cost_cents: number;
  meta_json?: Record<string, any>;
  created_at: Date;
}

// Request/Response types
export interface CreateTreeRequest {
  title: string;
  prompt: string;
  project_id?: string;
}

export interface BranchRequest {
  node_id: string;
  hint?: string;
  k?: number;
  complexity: ComplexityLevel;
}

export interface DeepDiveRequest {
  node_id: string;
  description?: string;
  complexity: ComplexityLevel;
}

export interface FlattenRequest {
  tree_id: string;
  style?: string;
}

export interface BranchOption {
  title: string;
  summary: string;
  type: NodeType;
  reasoning?: string;
  hints?: string[];
}

export interface BranchResponse {
  children: Node[];
  edges: Edge[];
  run_id: string;
  cost_estimate: number;
}

export interface DeepDiveResponse {
  expanded_nodes: Node[];
  edges: Edge[];
  run_id: string;
  cost_estimate: number;
}

export interface FlattenResponse {
  markdown: string;
  outline?: string;
  citations: Citation[];
  run_id: string;
}

// Complexity configuration
export interface ComplexityConfig {
  cu: number;
  maxDepth: number;
  maxWidth: number;
  defaultBranches: number;
  estimatedETA: number; // seconds
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

