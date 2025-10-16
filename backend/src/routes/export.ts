import { FastifyInstance } from 'fastify';
import { query } from '../db/client';

export async function exportRoutes(fastify: FastifyInstance) {
  // Export tree data
  fastify.post('/export/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { format } = request.body as { format: 'json' | 'md' };

    try {
      const treeResult = await query('SELECT * FROM trees WHERE id = $1', [id]);
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

      const tree = treeResult.rows[0];
      const nodes = nodesResult.rows;
      const edges = edgesResult.rows;

      if (format === 'json') {
        reply.send({
          tree,
          nodes,
          edges,
        });
      } else if (format === 'md') {
        // Generate markdown export
        let markdown = `# ${tree.title}\n\n`;
        markdown += `Created: ${tree.created_at}\n\n`;
        markdown += `## Nodes\n\n`;

        nodes.forEach((node, index) => {
          markdown += `### ${index + 1}. ${node.type.toUpperCase()} Node\n\n`;
          if (node.prompt) {
            markdown += `**Prompt:** ${node.prompt}\n\n`;
          }
          if (node.result_text) {
            markdown += `${node.result_text}\n\n`;
          }
          markdown += `---\n\n`;
        });

        reply.header('Content-Type', 'text/markdown');
        reply.send(markdown);
      }
    } catch (error) {
      console.error('Error exporting tree:', error);
      reply.status(500).send({ error: 'Failed to export tree' });
    }
  });
}

