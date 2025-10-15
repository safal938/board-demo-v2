import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import styled from "styled-components";

const SystemNodeContainer = styled.div`
  background: white;
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }
`;

const SystemIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
`;

const SystemName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 4px;
`;

const SystemType = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-align: center;
`;

const StatusBadge = styled.div`
  display: inline-block;
  background: #10b981;
  color: white;
  font-size: 9px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 8px;
`;

interface EHRSystemNodeProps {
  data: {
    system: {
      id: string;
      name: string;
      type: string;
      icon: string;
    };
  };
}

const EHRSystemNode: React.FC<EHRSystemNodeProps> = ({ data }) => {
  const { system } = data;

  return (
    <SystemNodeContainer>
      <SystemIcon>{system.icon}</SystemIcon>
      <SystemName>{system.name}</SystemName>
      <SystemType>{system.type}</SystemType>
      <div style={{ textAlign: "center" }}>
        <StatusBadge>ACTIVE</StatusBadge>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#667eea",
          width: 10,
          height: 10,
        }}
      />
    </SystemNodeContainer>
  );
};

export default memo(EHRSystemNode);
