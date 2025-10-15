import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import EHRSystemNode from "./EHRSystemNode";
import EncounterDocumentNode from "./EncounterDocumentNode";

const DataZoneContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ZoneHeader = styled.div`
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 24px;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
`;

interface DataZoneProps {
  patientData?: any;
}

// Dummy EHR systems
const ehrSystems = [
  { id: "nervecentre", name: "Nervecentre", type: "EPR Platform", icon: "🏥" },
  { id: "medilogik", name: "Medilogik", type: "Endoscopy", icon: "🔬" },
  { id: "viper", name: "Viper", type: "Clinical EMR", icon: "⚕️" },
  { id: "ice", name: "ICE", type: "Order Comms", icon: "📋" },
  { id: "bighand", name: "BigHand", type: "Dictation", icon: "🎙️" },
  { id: "vueexplore", name: "VueExplore", type: "PACS", icon: "🖼️" },
];

const DataZone: React.FC<DataZoneProps> = ({ patientData }) => {
  const encounters = patientData?.encounters || [];

  // Create nodes for EHR systems and encounters
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    const systemSpacing = 250;
    const encounterSpacing = 350;
    const startY = 100;

    // Create EHR system nodes (left side)
    ehrSystems.forEach((system, index) => {
      nodes.push({
        id: `system-${system.id}`,
        type: "ehrSystem",
        position: { x: 50, y: startY + index * systemSpacing },
        data: { system },
      });
    });

    // Create encounter document nodes (right side)
    encounters.forEach((encounter: any, index: number) => {
      // Assign each encounter to a system (round-robin for demo)
      const systemIndex = index % ehrSystems.length;
      const system = ehrSystems[systemIndex];

      nodes.push({
        id: `encounter-${encounter.encounter_no}`,
        type: "encounterDocument",
        position: { x: 600, y: startY + index * encounterSpacing },
        data: { encounter, patientData },
      });
    });

    return nodes;
  }, [encounters, patientData]);

  // Create edges connecting systems to encounters
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    encounters.forEach((encounter: any, index: number) => {
      const systemIndex = index % ehrSystems.length;
      const system = ehrSystems[systemIndex];

      edges.push({
        id: `edge-${system.id}-${encounter.encounter_no}`,
        source: `system-${system.id}`,
        target: `encounter-${encounter.encounter_no}`,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#667eea", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#667eea",
        },
      });
    });

    return edges;
  }, [encounters]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(
    () => ({
      ehrSystem: EHRSystemNode,
      encounterDocument: EncounterDocumentNode,
    }),
    []
  );

  return (
    <DataZoneContainer>
      <ZoneHeader>Data Zone</ZoneHeader>
      <div style={{ width: "100%", height: "calc(100% - 60px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </DataZoneContainer>
  );
};

export default DataZone;
