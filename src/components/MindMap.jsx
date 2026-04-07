import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function MindmapTree({ data, onNodeClick }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = buildRadialMindmap(data);
      setNodes(newNodes);
      setEdges(newEdges);
      setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 200);
    }
  }, [data, fitView]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = (event, node) => {
    if (onNodeClick) {
      onNodeClick({
        label: node.data.label_text,
        summary: node.data.summary || 'No summary available for this section.',
      });
    }
  };

  return (
    <div className="w-full h-full relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        nodesDraggable
        nodesConnectable={false}
        edgesUpdatable={false}
        zoomOnScroll
        panOnDrag
        className="bg-[#fdfdfd]"
      >
        <Background color="#f3f4f6" gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

function buildRadialMindmap(data) {
  const nodes = [];
  const edges = [];
  const radiusStep = 320;

  const rootId = 'root';
  nodes.push({
    id: rootId,
    data: {
      label: data.name,
      label_text: data.name,
      summary: data.summary || '',
    },
    position: { x: 0, y: 0 },
    style: {
      background: '#000',
      color: '#fff',
      borderRadius: '24px',
      padding: '18px 40px',
      fontWeight: '700',
      fontSize: '17px',
      border: 'none',
      boxShadow: '0 15px 30px -10px rgba(0,0,0,0.3)',
      textAlign: 'center',
      minWidth: 'fit-content',
    },
  });

  function placeChildren(children, parentId, level, startAngle, endAngle) {
    if (!children || children.length === 0) return;

    const totalAngle = endAngle - startAngle;
    const angleStep = totalAngle / children.length;

    let currentAngle = startAngle;
    children.forEach((child, i) => {
      const angle = currentAngle + angleStep / 2;

      // Gradually increase radius step per level to give more arc space to leaf nodes
      const currentRadius = radiusStep * level * Math.pow(1.1, level - 1);
      const x = Math.cos(angle) * currentRadius;
      const y = Math.sin(angle) * currentRadius;

      const nodeId = `${parentId}-${i}`;
      const color = pickColor(level);

      nodes.push({
        id: nodeId,
        data: {
          label: (
            <div className="flex items-center gap-4 whitespace-nowrap">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span>{child.name}</span>
            </div>
          ),
          label_text: child.name,
          summary: child.summary || '',
          level: level,
        },
        position: { x, y },
        style: {
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: '16px',
          padding: '14px 28px',
          fontSize: '15px',
          fontWeight: '700',
          color: '#111',
          boxShadow: '0 6px 15px -3px rgba(0,0,0,0.06)',
          textAlign: 'center',
          minWidth: 'fit-content',
        },
      });

      edges.push({
        id: `e${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#e2e8f',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        },
      });

      if (child.children) {
        placeChildren(
          child.children,
          nodeId,
          level + 1,
          currentAngle,
          currentAngle + angleStep
        );
      }
      currentAngle += angleStep;
    });
  }

  if (data.children) {
    placeChildren(data.children, rootId, 1, 0, 2 * Math.PI);
  }

  return { nodes, edges };
}

function pickColor(level) {
  const colors = [
    '#93c5fd', // blue
    '#34d399', // emerald
    '#facc15', // yellow
    '#f87171', // red
    '#a78bfa', // violet
  ];
  return colors[(level - 1) % colors.length];
}
