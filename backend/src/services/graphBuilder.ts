import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';
import { Node, Edge, NodeType, BranchOption } from '../types';
import { GeminiClient } from './gemini';

export class GraphBuilder {
  private gemini: GeminiClient;

  constructor() {
    this.gemini = new GeminiClient();
  }

  async createNode(
    treeId: string,
    parentId: string | null,
    type: NodeType,
    prompt: string,
    title?: string
  ): Promise<Node> {
    const nodeId = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO nodes (id, tree_id, parent_id, type, prompt, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nodeId, treeId, parentId, type, prompt, 'pending', now]
    );

    return result.rows[0];
  }

  async updateNode(
    nodeId: string,
    updates: Partial<Node>
  ): Promise<Node> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'citations_json' || key === 'params_json') {
        setClauses.push(`${key} = $${paramCount}::jsonb`);
      } else {
        setClauses.push(`${key} = $${paramCount}`);
      }
      values.push(value);
      paramCount++;
    });

    values.push(nodeId);

    const result = await query(
      `UPDATE nodes SET ${setClauses.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async createEdge(
    treeId: string,
    sourceId: string,
    targetId: string,
    label?: string
  ): Promise<Edge> {
    const edgeId = uuidv4();

    const result = await query(
      `INSERT INTO edges (id, tree_id, source_id, target_id, label)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [edgeId, treeId, sourceId, targetId, label]
    );

    return result.rows[0];
  }

  async executeNode(node: Node): Promise<{ text: string; cost_cents: number; duration_ms: number }> {
    const startTime = Date.now();

    try {
      await this.updateNode(node.id, { status: 'running' });

      // Extract title if present in the prompt (format: "# Title\n\nContent")
      const prompt = node.prompt || '';
      const titleMatch = prompt.match(/^#\s+(.+?)\n\n([\s\S]+)$/);
      
      let resultText: string;
      if (titleMatch) {
        const [, title, content] = titleMatch;
        // Execute the LLM with just the content
        const generatedText = await this.gemini.executeNode(content, node.type);
        // Prepend the title back to the result
        resultText = `# ${title}\n\n${generatedText}`;
      } else {
        // No title in prompt, just execute normally
        resultText = await this.gemini.executeNode(prompt, node.type);
      }

      const duration = Date.now() - startTime;
      const cost = this.estimateCost(resultText);

      await this.updateNode(node.id, {
        result_text: resultText,
        status: 'success',
        cost_cents: cost,
        duration_ms: duration,
      });

      return { text: resultText, cost_cents: cost, duration_ms: duration };
    } catch (error) {
      await this.updateNode(node.id, { status: 'error' });
      throw error;
    }
  }

  async buildBranchNodes(
    treeId: string,
    parentId: string,
    options: BranchOption[]
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (const option of options) {
      const node = await this.createNode(
        treeId,
        parentId,
        option.type,
        option.summary,
        option.title
      );

      // Format result_text with title as markdown header
      const resultText = `# ${option.title}\n\n${option.summary}`;

      // Set initial result text to the summary and update status to success
      const updatedNode = await this.updateNode(node.id, {
        result_text: resultText,
        status: 'success',
        cost_cents: 1,
        duration_ms: 0,
      });

      nodes.push(updatedNode);

      const edge = await this.createEdge(
        treeId,
        parentId,
        node.id,
        option.reasoning || option.title
      );
      edges.push(edge);
    }

    return { nodes, edges };
  }

  async buildDeepDiveNodes(
    treeId: string,
    parentId: string,
    steps: Array<{ title: string; type: 'llm' | 'research'; summary: string }>
  ): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let currentParentId = parentId;

    for (const step of steps) {
      // Format prompt with title as markdown header
      const promptWithTitle = `# ${step.title}\n\n${step.summary}`;
      
      const node = await this.createNode(
        treeId,
        currentParentId,
        step.type,
        promptWithTitle,
        step.title
      );

      nodes.push(node);

      const edge = await this.createEdge(
        treeId,
        currentParentId,
        node.id,
        step.title
      );
      edges.push(edge);

      // Execute the node
      try {
        await this.executeNode(node);
      } catch (error) {
        console.error(`Failed to execute node ${node.id}:`, error);
      }

      // Next node will be child of this one (creating a chain)
      currentParentId = node.id;
    }

    return { nodes, edges };
  }

  private estimateCost(text: string): number {
    // Rough estimation: 1 cent per 1000 characters
    return Math.ceil(text.length / 1000);
  }

  async getNodesByTreeId(treeId: string): Promise<Node[]> {
    const result = await query(
      'SELECT * FROM nodes WHERE tree_id = $1 ORDER BY created_at ASC',
      [treeId]
    );
    return result.rows;
  }

  async getEdgesByTreeId(treeId: string): Promise<Edge[]> {
    const result = await query(
      'SELECT * FROM edges WHERE tree_id = $1 ORDER BY created_at ASC',
      [treeId]
    );
    return result.rows;
  }
}

