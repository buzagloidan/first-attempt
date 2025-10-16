import { query } from '../db/client';
import { Node, Edge, Citation } from '../types';
import { GeminiClient } from './gemini';

export class Summarizer {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async flattenTree(treeId: string): Promise<{ markdown: string; citations: Citation[] }> {
    // Get all nodes and edges for the tree
    const nodesResult = await query(
      'SELECT * FROM nodes WHERE tree_id = $1 ORDER BY created_at ASC',
      [treeId]
    );
    const edgesResult = await query(
      'SELECT * FROM edges WHERE tree_id = $1',
      [treeId]
    );

    const nodes: Node[] = nodesResult.rows;
    const edges: Edge[] = edgesResult.rows;

    if (nodes.length === 0) {
      return { markdown: 'No nodes to summarize.', citations: [] };
    }

    // Perform DFS traversal from root
    const orderedNodes = this.dfsTraversal(nodes, edges);

    // Prepare nodes for summarization
    const nodeSummaries = orderedNodes
      .filter(n => n.result_text)
      .map(n => ({
        id: n.id,
        title: this.extractTitle(n) || 'Untitled',
        summary: this.extractSummary(n.result_text || ''),
      }));

    // Generate markdown summary using Gemini
    const markdown = await this.gemini.flatten(nodeSummaries);

    // Extract citations from nodes
    const citations = this.extractCitations(nodes);

    return { markdown, citations };
  }

  private dfsTraversal(nodes: Node[], edges: Edge[]): Node[] {
    // Build adjacency list
    const adjList = new Map<string, string[]>();
    edges.forEach(edge => {
      if (!adjList.has(edge.source_id)) {
        adjList.set(edge.source_id, []);
      }
      adjList.get(edge.source_id)!.push(edge.target_id);
    });

    // Find root node (node with no parent)
    const childIds = new Set(edges.map(e => e.target_id));
    const rootNode = nodes.find(n => !childIds.has(n.id));

    if (!rootNode) {
      return nodes; // Fallback to all nodes if no clear root
    }

    const visited = new Set<string>();
    const result: Node[] = [];

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        result.push(node);
      }

      const children = adjList.get(nodeId) || [];
      children.forEach(childId => dfs(childId));
    };

    dfs(rootNode.id);

    return result;
  }

  private extractTitle(node: Node): string | null {
    // Try to extract title from result_text (first line or sentence)
    if (node.result_text) {
      const firstLine = node.result_text.split('\n')[0];
      if (firstLine.length < 100) {
        return firstLine.replace(/^#+\s*/, '').trim();
      }
    }
    return null;
  }

  private extractSummary(text: string): string {
    // Take first 2-3 sentences as summary
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ').trim();
  }

  private extractCitations(nodes: Node[]): Citation[] {
    const citations: Citation[] = [];
    const seen = new Set<string>();

    nodes.forEach(node => {
      if (node.citations_json) {
        const nodeCitations = Array.isArray(node.citations_json) 
          ? node.citations_json 
          : [node.citations_json];

        nodeCitations.forEach((citation: Citation) => {
          const key = citation.url || citation.title;
          if (key && !seen.has(key)) {
            seen.add(key);
            citations.push(citation);
          }
        });
      }
    });

    return citations;
  }

  private deduplicate(summaries: string[]): string[] {
    // Simple deduplication: remove exact duplicates and very similar sentences
    const unique: string[] = [];
    const seen = new Set<string>();

    summaries.forEach(summary => {
      const normalized = summary.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(summary);
      }
    });

    return unique;
  }
}

