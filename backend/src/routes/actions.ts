import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';
import { BranchRequest, DeepDiveRequest, FlattenRequest } from '../types';
import { Planner } from '../services/planner';
import { GraphBuilder } from '../services/graphBuilder';
import { Summarizer } from '../services/summarizer';

export async function actionsRoutes(fastify: FastifyInstance) {
  const planner = new Planner();
  const graphBuilder = new GraphBuilder();
  const summarizer = new Summarizer();

  // Branch action
  fastify.post('/actions/branch', async (request, reply) => {
    const { node_id, hint, k, complexity } = request.body as BranchRequest;

    try {
      // Get the parent node
      const nodeResult = await query('SELECT * FROM nodes WHERE id = $1', [node_id]);
      if (nodeResult.rows.length === 0) {
        return reply.status(404).send({ error: 'Node not found' });
      }

      const parentNode = nodeResult.rows[0];
      const parentPrompt = parentNode.result_text || parentNode.prompt;

      // Create run
      const runId = uuidv4();
      await query(
        `INSERT INTO runs (id, tree_id, action, status) 
         VALUES ($1, $2, $3, $4)`,
        [runId, parentNode.tree_id, 'branch', 'running']
      );

      // Plan branch options
      const options = await planner.planBranch(parentPrompt, hint, k, complexity);

      // Build branch nodes
      const { nodes, edges } = await graphBuilder.buildBranchNodes(
        parentNode.tree_id,
        node_id,
        options
      );

      // Calculate total cost
      const totalCost = nodes.reduce((sum, n) => sum + (n.cost_cents || 0), 0);

      // Update run
      await query(
        `UPDATE runs SET status = $1, cost_cents = $2, finished_at = $3 WHERE id = $4`,
        ['completed', totalCost, new Date(), runId]
      );

      reply.send({
        children: nodes,
        edges,
        run_id: runId,
        cost_estimate: totalCost,
      });
    } catch (error) {
      console.error('Error in branch action:', error);
      reply.status(500).send({ error: 'Failed to execute branch' });
    }
  });

  // Deep dive action
  fastify.post('/actions/deep-dive', async (request, reply) => {
    const { node_id, description, complexity } = request.body as DeepDiveRequest;

    try {
      // Get the parent node
      const nodeResult = await query('SELECT * FROM nodes WHERE id = $1', [node_id]);
      if (nodeResult.rows.length === 0) {
        return reply.status(404).send({ error: 'Node not found' });
      }

      const parentNode = nodeResult.rows[0];
      const parentPrompt = parentNode.result_text || parentNode.prompt;

      // Create run
      const runId = uuidv4();
      await query(
        `INSERT INTO runs (id, tree_id, action, status) 
         VALUES ($1, $2, $3, $4)`,
        [runId, parentNode.tree_id, 'deep_dive', 'running']
      );

      // Plan deep dive steps
      const steps = await planner.planDeepDive(parentPrompt, description, complexity);

      // Build deep dive nodes
      const { nodes, edges } = await graphBuilder.buildDeepDiveNodes(
        parentNode.tree_id,
        node_id,
        steps
      );

      // Calculate total cost
      const totalCost = nodes.reduce((sum, n) => sum + (n.cost_cents || 0), 0);

      // Update run
      await query(
        `UPDATE runs SET status = $1, cost_cents = $2, finished_at = $3 WHERE id = $4`,
        ['completed', totalCost, new Date(), runId]
      );

      reply.send({
        expanded_nodes: nodes,
        edges,
        run_id: runId,
        cost_estimate: totalCost,
      });
    } catch (error) {
      console.error('Error in deep dive action:', error);
      reply.status(500).send({ error: 'Failed to execute deep dive' });
    }
  });

  // Flatten action
  fastify.post('/actions/flatten', async (request, reply) => {
    const { tree_id } = request.body as FlattenRequest;

    try {
      // Create run
      const runId = uuidv4();
      await query(
        `INSERT INTO runs (id, tree_id, action, status) 
         VALUES ($1, $2, $3, $4)`,
        [runId, tree_id, 'flatten', 'running']
      );

      // Flatten the tree
      const { markdown, citations } = await summarizer.flattenTree(tree_id);

      // Update run
      await query(
        `UPDATE runs SET status = $1, finished_at = $2 WHERE id = $3`,
        ['completed', new Date(), runId]
      );

      reply.send({
        markdown,
        citations,
        run_id: runId,
      });
    } catch (error) {
      console.error('Error in flatten action:', error);
      reply.status(500).send({ error: 'Failed to execute flatten' });
    }
  });
}

