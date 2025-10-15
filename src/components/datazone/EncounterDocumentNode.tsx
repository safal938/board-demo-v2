import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import styled from "styled-components";

const DocumentNodeContainer = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
`;

const DocumentHeader = styled.div<{ riskColor: string }>`
  background: ${(props) => {
    switch (props.riskColor) {
      case "red":
        return "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
      case "amber":
        return "linear-gradient(135deg, #ffc107 0%, #e0a800 100%)";
      case "green":
        return "linear-gradient(135deg, #28a745 0%, #218838 100%)";
      default:
        return "linear-gradient(135deg, #6c757d 0%, #5a6268 100%)";
    }
  }};
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EncounterTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const EncounterNumber = styled.div`
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const DocumentBody = styled.div<{ expanded: boolean }>`
  padding: 16px;
  max-height: ${(props) => (props.expanded ? "600px" : "200px")};
  overflow-y: auto;
  font-family: "Times New Roman", Times, serif;
  font-size: 12px;
  line-height: 1.6;
  color: #333;
  transition: max-height 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const MetaInfo = styled.div`
  background: #f8f9fa;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 6px;
  font-size: 10px;
  color: #6b7280;
`;

const Section = styled.div`
  margin-bottom: 12px;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  color: #1f2937;
  margin-bottom: 4px;
`;

const SectionContent = styled.div`
  font-size: 11px;
  color: #4b5563;
  text-align: justify;
`;

const ExpandButton = styled.button`
  width: 100%;
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-top: 1px solid #e5e7eb;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  transition: background 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

interface EncounterDocumentNodeProps {
  data: {
    encounter: any;
    patientData: any;
  };
}

const EncounterDocumentNode: React.FC<EncounterDocumentNodeProps> = ({
  data,
}) => {
  const { encounter } = data;
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const riskColor = encounter.meta?.ui_risk_color || "green";

  return (
    <DocumentNodeContainer>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#667eea",
          width: 10,
          height: 10,
        }}
      />

      <DocumentHeader riskColor={riskColor}>
        <EncounterTitle>{encounter.reason_for_visit}</EncounterTitle>
        <EncounterNumber>#{encounter.encounter_no}</EncounterNumber>
      </DocumentHeader>

      <DocumentBody expanded={expanded}>
        <MetaInfo>
          <strong>Date:</strong> {formatDate(encounter.meta.date_time)} |{" "}
          <strong>Type:</strong> {encounter.meta.visit_type} |{" "}
          <strong>Provider:</strong>{" "}
          {encounter.meta.provider?.name || "Not specified"}
        </MetaInfo>

        {encounter.chief_complaint && (
          <Section>
            <SectionTitle>Chief Complaint</SectionTitle>
            <SectionContent>{encounter.chief_complaint}</SectionContent>
          </Section>
        )}

        {encounter.hpi && (
          <Section>
            <SectionTitle>History of Present Illness</SectionTitle>
            <SectionContent>{encounter.hpi}</SectionContent>
          </Section>
        )}

        {encounter.hpc_ros && (
          <Section>
            <SectionTitle>History & Review</SectionTitle>
            <SectionContent>{encounter.hpc_ros}</SectionContent>
          </Section>
        )}

        {encounter.assessment && (
          <Section>
            <SectionTitle>Assessment</SectionTitle>
            <SectionContent>
              <strong>Impression:</strong> {encounter.assessment.impression}
            </SectionContent>
          </Section>
        )}

        {expanded && encounter.plan && (
          <Section>
            <SectionTitle>Plan</SectionTitle>
            <SectionContent>
              {encounter.plan.investigations?.labs && (
                <div>
                  <strong>Labs:</strong>{" "}
                  {encounter.plan.investigations.labs.join(", ")}
                </div>
              )}
              {encounter.plan.management?.medications_started && (
                <div>
                  <strong>New Medications:</strong>{" "}
                  {encounter.plan.management.medications_started
                    .map((m: any) => m.name)
                    .join(", ")}
                </div>
              )}
            </SectionContent>
          </Section>
        )}

        {expanded && encounter.follow_up?.instructions && (
          <Section>
            <SectionTitle>Follow-up</SectionTitle>
            <SectionContent>
              {encounter.follow_up.instructions.map(
                (inst: string, idx: number) => (
                  <div key={idx}>• {inst}</div>
                )
              )}
            </SectionContent>
          </Section>
        )}
      </DocumentBody>

      <ExpandButton onClick={() => setExpanded(!expanded)}>
        {expanded ? "Show Less ▲" : "Show More ▼"}
      </ExpandButton>
    </DocumentNodeContainer>
  );
};

export default memo(EncounterDocumentNode);
