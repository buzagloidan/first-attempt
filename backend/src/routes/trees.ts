import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client';
import { CreateTreeRequest } from '../types';

export async function treesRoutes(fastify: FastifyInstance) {
  // Get all trees
  fastify.get('/trees', async (request, reply) => {
    try {
      const result = await query(
        'SELECT * FROM trees ORDER BY created_at DESC LIMIT 100'
      );
      
      reply.send(result.rows);
    } catch (error) {
      console.error('Error getting trees:', error);
      reply.status(500).send({ error: 'Failed to get trees' });
    }
  });

  // Create a new tree
  fastify.post('/trees', async (request, reply) => {
    const { title, prompt, project_id } = request.body as CreateTreeRequest;

    try {
      // Create or get default project (MVP: no auth, use default user)
      let projectId = project_id;
      if (!projectId) {
        // First, ensure we have a default user
        const defaultUserId = '00000000-0000-0000-0000-000000000001';
        await query(
          `INSERT INTO users (id, email, name) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (id) DO NOTHING`,
          [defaultUserId, 'default@buzaglo.local', 'Default User']
        );

        // Create or get default project
        const projectResult = await query(
          `INSERT INTO projects (id, name, user_id) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (id) DO NOTHING 
           RETURNING id`,
          ['00000000-0000-0000-0000-000000000002', 'Default Project', defaultUserId]
        );
        projectId = projectResult.rows[0]?.id || '00000000-0000-0000-0000-000000000002';
      }

      // Create tree
      const treeId = uuidv4();
      const treeResult = await query(
        `INSERT INTO trees (id, project_id, title) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [treeId, projectId, title]
      );

      // Create root node
      const rootNodeId = uuidv4();
      const nodeResult = await query(
        `INSERT INTO nodes (id, tree_id, parent_id, type, prompt, result_text, status, cost_cents) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [rootNodeId, treeId, null, 'llm', prompt, prompt, 'success', 0]
      );

      // Update tree with root node
      await query(
        `UPDATE trees SET root_node_id = $1 WHERE id = $2`,
        [rootNodeId, treeId]
      );

      const tree = treeResult.rows[0];
      tree.root_node_id = rootNodeId;

      reply.send({
        tree,
        root_node: nodeResult.rows[0],
      });
    } catch (error) {
      console.error('Error creating tree:', error);
      reply.status(500).send({ error: 'Failed to create tree' });
    }
  });

  // Get tree by ID
  fastify.get('/trees/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const treeResult = await query(
        'SELECT * FROM trees WHERE id = $1',
        [id]
      );

      if (treeResult.rows.length === 0) {
        return reply.status(404).send({ error: 'Tree not found' });
      }

      const nodesResult = await query(
        'SELECT * FROM nodes WHERE tree_id = $1 ORDER BY created_at ASC',
        [id]
      );

      const edgesResult = await query(
        'SELECT * FROM edges WHERE tree_id = $1',
        [id]
      );

      reply.send({
        tree: treeResult.rows[0],
        nodes: nodesResult.rows,
        edges: edgesResult.rows,
      });
    } catch (error) {
      console.error('Error getting tree:', error);
      reply.status(500).send({ error: 'Failed to get tree' });
    }
  });

  // Delete tree
  fastify.delete('/trees/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await query('DELETE FROM trees WHERE id = $1', [id]);
      reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting tree:', error);
      reply.status(500).send({ error: 'Failed to delete tree' });
    }
  });
}

