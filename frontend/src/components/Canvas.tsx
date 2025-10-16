import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import { NodeCard } from './NodeCard';
import { TreeNode as AppNode, TreeEdge as AppEdge } from '../types';
import 'reactflow/dist/style.css';
import './Canvas.css';

const nodeTypes = {
  custom: NodeCard,
};

interface CanvasProps {
  nodes: AppNode[];
  edges: AppEdge[];
  onBranch: (nodeId: string) => void;
  onDeepDive: (nodeId: string) => void;
}

function CanvasContent({ nodes: appNodes, edges: appEdges, onBranch, onDeepDive }: CanvasProps) {
  const { fitView } = useReactFlow();
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);

  // Layout nodes using dagre
  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 200, nodesep: 200 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 400, height: 280 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 200,
          y: nodeWithPosition.y - 140,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  // Handle node click to zoom
  const handleNodeClickInternal = useCallback((event: React.MouseEvent, node: Node) => {
    // Zoom to the node with smooth animation
    fitView({
      nodes: [node],
      duration: 500,
      padding: 0.8,
    });
  }, [fitView]);

  // Convert app nodes to React Flow nodes
  const flowNodes = useMemo(() => {
    const nodes: Node[] = appNodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        node,
        onBranch: () => onBranch(node.id),
        onDeepDive: () => onDeepDive(node.id),
        onHoverStart: () => setHoveredNodeId(node.id),
        onHoverEnd: () => setHoveredNodeId(null),
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    }));

    const edges: Edge[] = appEdges.map((edge) => {
      const isHovered = hoveredNodeId === edge.source_id || hoveredNodeId === edge.target_id;
      return {
        id: edge.id,
        source: edge.source_id,
        target: edge.target_id,
        type: 'default',
        animated: false,
        style: { 
          stroke: '#374151', 
          strokeWidth: isHovered ? 4 : 2,
          transition: 'stroke-width 0.2s ease'
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#374151',
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    return { nodes: layoutedNodes, edges: layoutedEdges };
  }, [appNodes, appEdges, getLayoutedElements, onBranch, onDeepDive, hoveredNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowNodes.edges);

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(flowNodes.nodes);
    setEdges(flowNodes.edges);
  }, [flowNodes, setNodes, setEdges]);

  return (
    <div className="canvas-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClickInternal}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a3e" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}

