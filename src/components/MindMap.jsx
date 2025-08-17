// src/components/MindmapTree.jsx
import React, { useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Convert your mindmap JSON into nodes & edges for ReactFlow
 */
function buildNodesAndEdges(data, parentId = null, nodes = [], edges = [], depth = 0, pos = { x: 0, y: 0 }) {
  const id = nodes.length + 1 + "";
  const node = {
    id,
    data: { label: data.name },
    position: {
      x: pos.x + depth * 250, // horizontal spacing
      y: pos.y + nodes.length * 80, // vertical spacing
    },
    style: {
      border: "2px solid #4f46e5",
      borderRadius: "12px",
      padding: "8px 12px",
      background: "#f9fafb",
      fontWeight: 500,
    },
  };

  nodes.push(node);

  if (parentId) {
    edges.push({
      id: `e${parentId}-${id}`,
      source: parentId,
      target: id,
      animated: true,
      style: { stroke: "#4f46e5" },
    });
  }

  if (data.children) {
    data.children.forEach((child, i) => {
      buildNodesAndEdges(child, id, nodes, edges, depth + 1, {
        x: pos.x,
        y: pos.y + i * 150,
      });
    });
  }

  return { nodes, edges };
}

export default function MindmapTree({ data }) {
  const { nodes, edges } = useMemo(() => buildNodesAndEdges(data), [data]);

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background gap={16} color="#ddd" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
