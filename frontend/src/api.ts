import { Tree, TreeNode, TreeEdge, ComplexityLevel, Citation } from './types';

const API_BASE = '/api';

export async function createTree(title: string, prompt: string) {
  const response = await fetch(`${API_BASE}/trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, prompt }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create tree');
  }
  
  return response.json() as Promise<{ tree: Tree; root_node: TreeNode }>;
}

export async function getAllTrees() {
  const response = await fetch(`${API_BASE}/trees`);
  
  if (!response.ok) {
    throw new Error('Failed to get trees');
  }
  
  return response.json() as Promise<Tree[]>;
}

export async function getTree(treeId: string) {
  const response = await fetch(`${API_BASE}/trees/${treeId}`);
  
  if (!response.ok) {
    throw new Error('Failed to get tree');
  }
  
  return response.json() as Promise<{ tree: Tree; nodes: TreeNode[]; edges: TreeEdge[] }>;
}

export async function executeBranch(
  nodeId: string,
  complexity: ComplexityLevel,
  hint?: string,
  k?: number
) {
  const response = await fetch(`${API_BASE}/actions/branch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node_id: nodeId, hint, k, complexity }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to execute branch');
  }
  
  return response.json() as Promise<{
    children: TreeNode[];
    edges: TreeEdge[];
    run_id: string;
    cost_estimate: number;
  }>;
}

export async function executeDeepDive(
  nodeId: string,
  complexity: ComplexityLevel,
  description?: string
) {
  const response = await fetch(`${API_BASE}/actions/deep-dive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node_id: nodeId, description, complexity }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to execute deep dive');
  }
  
  return response.json() as Promise<{
    expanded_nodes: TreeNode[];
    edges: TreeEdge[];
    run_id: string;
    cost_estimate: number;
  }>;
}

export async function executeFlatten(treeId: string) {
  const response = await fetch(`${API_BASE}/actions/flatten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tree_id: treeId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to execute flatten');
  }
  
  return response.json() as Promise<{
    markdown: string;
    citations: Citation[];
    run_id: string;
  }>;
}

export async function exportTree(treeId: string, format: 'json' | 'md') {
  const response = await fetch(`${API_BASE}/export/${treeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to export tree');
  }
  
  if (format === 'json') {
    return response.json();
  } else {
    return response.text();
  }
}

