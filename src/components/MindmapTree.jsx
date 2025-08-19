import React, { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

export default function MindmapTree({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState("");

  useEffect(() => {
    if (data) {
      const { nodes: newNodes, edges: newEdges } = buildRadialMindmap(data);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [data]);

  //  Handlers for dragging & updates
  const onNodesChange = (changes) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));

  //  Handle node click
  const handleNodeClick = (event, node) => {
    setSelectedSummary(
      node.data.summary || "No summary available for this section."
    );
  };

  return (
    <>
      {/* Responsive wrapper for all screen sizes */}
      <div className="w-full min-h-[60vh] h-[75vh] lg:h-[85vh] flex-grow overflow-auto">
        <ReactFlow
          nodes={nodes.map((n) => ({ ...n, selectable: true }))}
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
        >
          <Background color="#f3f4f6" gap={28} />
        </ReactFlow>
      </div>

      {selectedSummary && (
        <div className="mt-4 p-4 bg-gray-200 rounded shadow max-w-full">
          <h3 className="font-bold mb-2">Section Summary</h3>
          <p className="text-justify hyphens-auto">{selectedSummary}</p>
        </div>
      )}
    </>
  );
}

function buildRadialMindmap(data) {
  const nodes = [];
  const edges = [];

  const radiusStep = 260;
  const minAngle = 0.15;

  const rootId = "root";
  nodes.push({
    id: rootId,
    data: { label: data.name, summary: data.summary || "" },
    position: { x: 0, y: 0 },
    style: {
      background: "#2563eb",
      color: "#fff",
      borderRadius: "16px",
      padding: "12px 20px",
      fontWeight: "bold",
      fontSize: "18px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  });

  function placeChildren(children, parentId, level, startAngle, endAngle) {
    if (!children || children.length === 0) return;

    const totalAngle = endAngle - startAngle;
    const availableAngle = totalAngle - minAngle * (children.length - 1);
    const angleStep = availableAngle / children.length;

    let currentAngle = startAngle;
    children.forEach((child, i) => {
      const angle = currentAngle + angleStep / 2;
      const x = Math.cos(angle) * radiusStep * level;
      const y = Math.sin(angle) * radiusStep * level;

      const nodeId = `${parentId}-${i}`;
      nodes.push({
        id: nodeId,
        data: { label: child.name, summary: child.summary || "" },
        position: { x, y },
        style: {
          background: "#fff",
          border: `2px solid ${pickColor(level)}`,
          borderRadius: "12px",
          padding: "8px 14px",
          fontSize: "14px",
          fontWeight: 500,
        },
      });

      edges.push({
        id: `e${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "smoothstep",
        style: { stroke: pickColor(level), strokeWidth: 2 },
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

      currentAngle += angleStep + minAngle;
    });
  }

  if (data.children) {
    placeChildren(data.children, rootId, 1, 0, 2 * Math.PI);
  }

  return { nodes, edges };
}

function pickColor(level) {
  const colors = [
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#3b82f6", // blue
    "#8b5cf6", // violet
  ];
  return colors[(level - 1) % colors.length];
}
