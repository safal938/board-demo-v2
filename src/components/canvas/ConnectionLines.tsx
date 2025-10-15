import React from "react";
import styled from "styled-components";

const ConnectionSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; /* Well below items (z-index: 10) */
  overflow: visible;
  
  @keyframes dash {
    to {
      stroke-dashoffset: -12;
    }
  }
`;

const ConnectionLine = styled.line`
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-dasharray: 8,4;
  animation: dash 3s linear infinite;
  opacity: 0.8;
  pointer-events: none;
  
  @keyframes dash {
    to {
      stroke-dashoffset: -12;
    }
  }
`;

const ConnectionArrow = styled.polygon`
  fill: #3b82f6;
  opacity: 0.9;
  stroke: #3b82f6;
  stroke-width: 1;
  pointer-events: none;
`;

const DataFlowLabel = styled.text`
  fill: #1e40af;
  font-size: 14px;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
`;

interface ConnectionLinesProps {
  items: any[];
}

const ConnectionLines: React.FC<ConnectionLinesProps> = React.memo(({ items }) => {
  // Find EHR system, encounter documents, and adverse event dashboard
  const ehrSystem = items.find(item => item.type === 'ehr-system');
  const encounterDocs = items.filter(item => item.type === 'single-encounter-document');
  const dashboard = items.find(item => item.type === 'adverse-event-dashboard');

  if (!ehrSystem || encounterDocs.length === 0 || !dashboard) {
    return null;
  }

  // Calculate connection points
  const ehrCenterX = ehrSystem.x + ehrSystem.width / 2;
  const ehrBottomY = ehrSystem.y + ehrSystem.height;

  const dashboardCenterX = dashboard.x + dashboard.width / 2;
  const dashboardTopY = dashboard.y;

  return (
    <ConnectionSVG>
      {/* Lines from EHR System to each encounter document */}
      {encounterDocs.map((encounter, index) => {
        const encounterCenterX = encounter.x + encounter.width / 2;
        const encounterTopY = encounter.y;
        
        return (
          <g key={`ehr-to-encounter-${index}`}>
            <ConnectionLine
              x1={ehrCenterX}
              y1={ehrBottomY}
              x2={encounterCenterX}
              y2={encounterTopY}
            />
            {/* Arrow pointing to encounter */}
            <ConnectionArrow
              points={`${encounterCenterX-8},${encounterTopY-8} ${encounterCenterX+8},${encounterTopY-8} ${encounterCenterX},${encounterTopY}`}
            />
          </g>
        );
      })}

      {/* Direct lines from each encounter document to dashboard (same style as top) */}
      {encounterDocs.map((encounter, index) => {
        const encounterCenterX = encounter.x + encounter.width / 2;
        const encounterBottomY = encounter.y + encounter.height;
        
        return (
          <g key={`encounter-to-dashboard-${index}`}>
            <ConnectionLine
              x1={encounterCenterX}
              y1={encounterBottomY}
              x2={dashboardCenterX}
              y2={dashboardTopY}
            />
          </g>
        );
      })}

      {/* Arrow pointing to dashboard */}
      <ConnectionArrow
        points={`${dashboardCenterX-10},${dashboardTopY-10} ${dashboardCenterX+10},${dashboardTopY-10} ${dashboardCenterX},${dashboardTopY}`}
      />

      {/* Data flow labels */}
      <DataFlowLabel
        x={ehrCenterX}
        y={ehrBottomY + 30}
      >
        Source Systems
      </DataFlowLabel>

      <DataFlowLabel
        x={dashboardCenterX}
        y={dashboardTopY - 30}
      >
        Analysis & Monitoring
      </DataFlowLabel>
    </ConnectionSVG>
  );
});

export default ConnectionLines;