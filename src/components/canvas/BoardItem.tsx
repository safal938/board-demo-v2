import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import LabResult from "../lab/LabResult";
import AdverseEventDashboard from "../dashboard/AdverseEventDashboard";
import SingleEncounterDocument from "../encounters/SingleEncounterDocument";
import EHRSystemComponent from "../encounters/EHRSystemComponent";

// Types removed for Storybook compatibility

const ItemContainer = styled(motion.div)`
  position: absolute;
  cursor: move;
  border-radius: 8px;
  user-select: none;
  z-index: 10; /* Ensure items render above zones */
  will-change: transform; /* Optimize for animations */

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TextContent = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  padding: 16px;
  color: #1f2937;
  font-weight: 400;

  &::placeholder {
    color: #9ca3af;
    font-style: italic;
  }

  &:focus {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ShapeContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
`;

const StickyContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  word-wrap: break-word;
`;

const EHRContent = styled.div`
  width: 100%;
  min-height: 100%;
  padding: 16px;
  font-size: 12px;
  color: #333;
  overflow: visible;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const EHRHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e3f2fd;
`;

const EHRTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EHRIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const EHRStatus = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const EHRGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: fit-content;
`;

const EHRSection = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: fit-content;
  display: flex;
  flex-direction: column;
`;

const EHRLabel = styled.div`
  font-weight: 600;
  color: #1976d2;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const EHRValue = styled.div`
  color: #333;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
`;

const EHRFullSection = styled.div`
  grid-column: 1 / -1;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: fit-content;
  display: flex;
  flex-direction: column;
`;

const EHRTags = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const EHRTag = styled.span`
  background: #f5f5f5;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
`;

// ===== Todo Item Styles =====
const TodoCard = styled.div`
  width: 100%;
  min-height: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: visible;
`;

const TodoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f7faff 0%, #eef5ff 100%);
  border-bottom: 1px solid #e6eefb;
`;

const TodoTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1e3a8a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TodoBody = styled.div`
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: visible;
  flex-grow: 1;
`;

const TodoDesc = styled.div`
  color: #475569;
  font-size: 12px;
  line-height: 1.4;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #34d399, #10b981);
  transition: width 200ms ease;
`;

const TodoList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TodoItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: #334155;
`;

const StatusChip = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #94a3b8;
`;

// ===== Agent Result Styles =====
const AgentCard = styled.div`
  width: 100%;
  min-height: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: visible;
`;

const AgentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f6fffb 0%, #e9fbf3 100%);
  border-bottom: 1px solid #dcfce7;
`;

const AgentTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #065f46;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AgentBody = styled.div`
  padding: 12px 14px;
  overflow: visible;
  color: #111827;
  font-size: 13px;
  line-height: 1.5;
  white-space: normal;
  flex-grow: 1;
`;

// Very small markdown -> HTML converter (headings, bold, italic, code, lists)
const toHtml = (md: string) => {
  if (!md) return "";
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let html = escape(md);
  // code blocks ```
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_m, p1) => `<pre><code>${p1}</code></pre>`
  );
  // inline code `code`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  // bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italics *text* or _text_
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  // headings # .. ######
  html = html
    .replace(/^######\s?(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s?(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s?(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s?(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s?(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s?(.+)$/gm, "<h1>$1</h1>");
  // lists - item
  html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((l) => l.replace(/^- ?/, "").trim());
    return `<ul>${items.map((it) => `<li>${it}</li>`).join("")}</ul>`;
  });
  // newlines to <br> (basic)
  html = html.replace(/\n/g, "<br/>");
  return html;
};

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #f44336;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  &:hover {
    background: #d32f2f;
  }
`;

// BoardItemProps interface removed for Storybook compatibility

const BoardItem = ({ item, isSelected, onUpdate, onDelete, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: item.x, y: item.y });
  const textareaRef = useRef(null);

  const handleMouseDown = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent any default behavior
      onSelect(item.id);

      if (e.detail === 2) {
        // Double click
        if (item.type === "text") {
          // Clear placeholder text when starting to edit
          if (item.content === "Click to edit") {
            onUpdate(item.id, { content: "" });
          }
          setIsEditing(true);
          setTimeout(() => textareaRef.current?.focus(), 0);
        }
      } else {
        setIsDragging(true);

        // Get canvas and its transformation
        const canvas = document.querySelector(
          "[data-canvas-content]"
        ) as HTMLElement;
        const canvasRect = canvas?.getBoundingClientRect();

        if (canvasRect) {
          // Get current transform values
          const transform = canvas.style.transform;
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          const translateMatch = transform.match(
            /translate\(([^,]+)px,\s*([^)]+)px\)/
          );

          const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
          const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
          const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

          // Calculate mouse position in world coordinates
          const mouseCanvasX = e.clientX - canvasRect.left;
          const mouseCanvasY = e.clientY - canvasRect.top;
          const mouseWorldX = (mouseCanvasX - translateX) / scale;
          const mouseWorldY = (mouseCanvasY - translateY) / scale;

          // Store the offset from mouse to item position in WORLD COORDINATES
          const offsetX = mouseWorldX - item.x;
          const offsetY = mouseWorldY - item.y;

          setDragStart({ x: offsetX, y: offsetY });
          setLastPosition({ x: item.x, y: item.y });
        }
      }
    },
    [item.id, item.type, item.x, item.y, onSelect, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Use global mouse event listeners for better performance
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();

        // Get canvas and its transformation
        const canvas = document.querySelector(
          "[data-canvas-content]"
        ) as HTMLElement;
        const canvasRect = canvas?.getBoundingClientRect();

        if (canvasRect) {
          // Calculate mouse position relative to canvas
          const mouseCanvasX = e.clientX - canvasRect.left;
          const mouseCanvasY = e.clientY - canvasRect.top;

          // Get current transform values from the canvas
          const transform = canvas.style.transform;
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          const translateMatch = transform.match(
            /translate\(([^,]+)px,\s*([^)]+)px\)/
          );

          const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
          const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
          const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;

          // Convert screen coordinates to world coordinates
          const mouseWorldX = (mouseCanvasX - translateX) / scale;
          const mouseWorldY = (mouseCanvasY - translateY) / scale;

          // Calculate new item position (both in world coordinates now!)
          const newX = mouseWorldX - dragStart.x;
          const newY = mouseWorldY - dragStart.y;

          // Only update if position changed significantly (reduce jitter)
          const threshold = 1;
          if (
            Math.abs(newX - lastPosition.x) > threshold ||
            Math.abs(newY - lastPosition.y) > threshold
          ) {
            const roundedX = Math.round(newX);
            const roundedY = Math.round(newY);
            setLastPosition({ x: roundedX, y: roundedY });
            onUpdate(item.id, { x: roundedX, y: roundedY });
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp);
      // Also prevent context menu during drag
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [isDragging, dragStart, lastPosition, item.id, onUpdate]);

  const handleTextChange = useCallback(
    (e) => {
      onUpdate(item.id, { content: e.target.value });
    },
    [item.id, onUpdate]
  );

  const handleTextBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        setIsEditing(false);
      }
      if (e.key === "Escape") {
        setIsEditing(false);
      }
      if (e.key === "Delete" && isSelected) {
        onDelete(item.id);
      }
    },
    [isSelected, item.id, onDelete]
  );

  const renderContent = () => {
    switch (item.type) {
      case "text":
        if (isEditing) {
          return (
            <TextContent
              ref={textareaRef}
              value={item.content === "Click to edit" ? "" : item.content}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              placeholder="Type your note here..."
            />
          );
        }
        return (
          <TextContent
            value={item.content}
            readOnly
            onDoubleClick={() => {
              if (item.content === "Click to edit") {
                onUpdate(item.id, { content: "" });
              }
              setIsEditing(true);
            }}
            style={{
              color: item.content === "Click to edit" ? "#9ca3af" : "#1f2937",
              fontStyle: item.content === "Click to edit" ? "italic" : "normal",
              cursor: "pointer",
            }}
          />
        );

      case "shape":
        return <ShapeContent>{item.content || "Shape"}</ShapeContent>;

      case "sticky":
        return <StickyContent>{item.content || "Sticky note"}</StickyContent>;

      case "ehr":
        const ehrData = item.ehrData;
        return (
          <EHRContent>
            <EHRHeader>
              <EHRTitle>
                <EHRIcon>🏥</EHRIcon>
                Patient EHR
              </EHRTitle>
              <EHRStatus>
                {ehrData?.encounter_metadata?.type || "Active"}
              </EHRStatus>
            </EHRHeader>

            <EHRGrid>
              <EHRSection>
                <EHRLabel>Patient</EHRLabel>
                <EHRValue>{ehrData?.patient?.name || "Unknown"}</EHRValue>
                <EHRTags>
                  <EHRTag>{ehrData?.patient?.age || "N/A"} years</EHRTag>
                  <EHRTag>{ehrData?.patient?.sex || "N/A"}</EHRTag>
                  <EHRTag>MRN: {ehrData?.patient?.mrn || "N/A"}</EHRTag>
                  <EHRTag>DOB: {ehrData?.patient?.dob || "N/A"}</EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRSection>
                <EHRLabel>Encounter</EHRLabel>
                <EHRValue>{ehrData?.encounter_id || "N/A"}</EHRValue>
                <EHRTags>
                  <EHRTag>{ehrData?.encounter_metadata?.date || "N/A"}</EHRTag>
                  <EHRTag>{ehrData?.encounter_metadata?.time || "N/A"}</EHRTag>
                  <EHRTag>
                    {ehrData?.encounter_metadata?.location || "N/A"}
                  </EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRSection>
                <EHRLabel>Clinician</EHRLabel>
                <EHRValue>
                  {ehrData?.encounter_metadata?.clinician || "N/A"}
                </EHRValue>
                <EHRTags>
                  <EHRTag>
                    {ehrData?.encounter_metadata?.specialty || "N/A"}
                  </EHRTag>
                  <EHRTag>
                    {ehrData?.encounter_metadata?.clinic || "N/A"}
                  </EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRSection>
                <EHRLabel>Vitals</EHRLabel>
                <EHRValue>
                  BP: {ehrData?.objective?.vitals?.bp || "N/A"} | HR:{" "}
                  {ehrData?.objective?.vitals?.hr || "N/A"}
                </EHRValue>
                <EHRTags>
                  <EHRTag>
                    BMI: {ehrData?.objective?.vitals?.bmi || "N/A"}
                  </EHRTag>
                  <EHRTag>
                    Temp: {ehrData?.objective?.vitals?.temp || "N/A"}
                  </EHRTag>
                  <EHRTag>
                    SpO2: {ehrData?.objective?.vitals?.spo2 || "N/A"}
                  </EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRSection>
                <EHRLabel>Diagnosis</EHRLabel>
                <EHRValue>{ehrData?.diagnoses?.[0]?.label || "N/A"}</EHRValue>
                <EHRTags>
                  <EHRTag>{ehrData?.diagnoses?.[0]?.certainty || "N/A"}</EHRTag>
                  <EHRTag>
                    {ehrData?.diagnoses?.[0]?.codes?.[0]?.code || "N/A"}
                  </EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRSection>
                <EHRLabel>Assessment</EHRLabel>
                <EHRValue>{ehrData?.assessment || "N/A"}</EHRValue>
                <EHRTags>
                  <EHRTag>Clinical</EHRTag>
                </EHRTags>
              </EHRSection>

              <EHRFullSection>
                <EHRLabel>Chief Complaint</EHRLabel>
                <EHRValue>
                  {ehrData?.subjective?.chief_complaint || "N/A"}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>History of Present Illness</EHRLabel>
                <EHRValue>
                  {ehrData?.subjective?.history_of_present_illness || "N/A"}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Physical Exam</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>General:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.general || "N/A"}
                  </div>
                  <div>
                    <strong>Skin:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.skin || "N/A"}
                  </div>
                  <div>
                    <strong>Cardiovascular:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.cardiovascular || "N/A"}
                  </div>
                  <div>
                    <strong>Pulmonary:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.pulmonary || "N/A"}
                  </div>
                  <div>
                    <strong>Abdomen:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.abdomen || "N/A"}
                  </div>
                  <div>
                    <strong>MSK:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.msk || "N/A"}
                  </div>
                  <div>
                    <strong>Neuro:</strong>{" "}
                    {ehrData?.objective?.physical_exam?.neuro || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Medications</EHRLabel>
                <EHRValue>
                  {ehrData?.history?.medications
                    ?.slice(0, 2)
                    .map((med, index) => (
                      <div key={index} style={{ marginBottom: "4px" }}>
                        <strong>{med.name}:</strong> {med.dose} {med.route}{" "}
                        {med.frequency}
                        <span
                          style={{
                            color:
                              med.status === "active" ? "#4caf50" : "#ff9800",
                            fontSize: "10px",
                            marginLeft: "8px",
                          }}
                        >
                          [{med.status}]
                        </span>
                      </div>
                    ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Lab Results</EHRLabel>
                <EHRValue>
                  {ehrData?.orders?.labs?.slice(0, 2).map((lab, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <strong>{lab.name}:</strong>{" "}
                      {lab.result || lab.value || "N/A"}
                      <span
                        style={{
                          color: "#2196f3",
                          fontSize: "10px",
                          marginLeft: "8px",
                        }}
                      >
                        [{lab.status}]
                      </span>
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Plan</EHRLabel>
                <EHRValue>
                  {ehrData?.plan?.slice(0, 3).map((item, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <strong>{item.category}:</strong> {item.text}
                      <span
                        style={{
                          color:
                            item.priority === "high" ? "#f44336" : "#4caf50",
                          fontSize: "10px",
                          marginLeft: "8px",
                        }}
                      >
                        [{item.priority}]
                      </span>
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Social History</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>Tobacco:</strong>{" "}
                    {ehrData?.history?.social_history?.tobacco || "N/A"}
                  </div>
                  <div>
                    <strong>Alcohol:</strong>{" "}
                    {ehrData?.history?.social_history?.alcohol || "N/A"}
                  </div>
                  <div>
                    <strong>Occupation:</strong>{" "}
                    {ehrData?.history?.social_history?.occupation || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Visit Reason</EHRLabel>
                <EHRValue>
                  {ehrData?.encounter_metadata?.visit_reason || "N/A"}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Source System</EHRLabel>
                <EHRValue>{ehrData?.source_system || "N/A"}</EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Review of Systems</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>General:</strong>{" "}
                    {ehrData?.subjective?.ros?.general || "N/A"}
                  </div>
                  <div>
                    <strong>Cardiovascular:</strong>{" "}
                    {ehrData?.subjective?.ros?.cardiovascular || "N/A"}
                  </div>
                  <div>
                    <strong>Pulmonary:</strong>{" "}
                    {ehrData?.subjective?.ros?.pulmonary || "N/A"}
                  </div>
                  <div>
                    <strong>GI:</strong> {ehrData?.subjective?.ros?.gi || "N/A"}
                  </div>
                  <div>
                    <strong>MSK:</strong>{" "}
                    {ehrData?.subjective?.ros?.msk || "N/A"}
                  </div>
                  <div>
                    <strong>Skin:</strong>{" "}
                    {ehrData?.subjective?.ros?.skin || "N/A"}
                  </div>
                  <div>
                    <strong>Neuro:</strong>{" "}
                    {ehrData?.subjective?.ros?.neuro || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Past Medical History</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>PMH:</strong>{" "}
                    {ehrData?.history?.pmh?.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>PSH:</strong>{" "}
                    {ehrData?.history?.psh?.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>Allergies:</strong>{" "}
                    {ehrData?.history?.allergies
                      ?.map((a) => a.substance)
                      .join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>Family History:</strong>{" "}
                    {ehrData?.history?.family_history?.join(", ") || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Differential Diagnoses</EHRLabel>
                <EHRValue>
                  {ehrData?.differential_diagnoses?.join(", ") || "N/A"}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Orders & Results</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>Lab Results:</strong>
                  </div>
                  {ehrData?.orders?.labs?.map((lab, index) => (
                    <div
                      key={index}
                      style={{ marginLeft: "10px", marginBottom: "2px" }}
                    >
                      • {lab.name}: {lab.result || lab.value || "N/A"} (
                      {lab.status})
                    </div>
                  ))}
                  <div>
                    <strong>Imaging:</strong>
                  </div>
                  {ehrData?.orders?.imaging?.map((img, index) => (
                    <div
                      key={index}
                      style={{ marginLeft: "10px", marginBottom: "2px" }}
                    >
                      • {img.modality} - {img.body_part}:{" "}
                      {img.impression || "N/A"} ({img.status})
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Medication Changes</EHRLabel>
                <EHRValue>
                  {ehrData?.medication_changes?.map((change, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <strong>{change.action}:</strong> {change.name} →{" "}
                      {change.new_sig}
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginLeft: "10px",
                        }}
                      >
                        Rationale: {change.rationale}
                      </div>
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Counseling & Education</EHRLabel>
                <EHRValue>
                  {ehrData?.counseling_education?.map((item, index) => (
                    <div key={index} style={{ marginBottom: "2px" }}>
                      • {item}
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Health Maintenance</EHRLabel>
                <EHRValue>
                  {ehrData?.health_maintenance?.map((item, index) => (
                    <div key={index} style={{ marginBottom: "2px" }}>
                      • {item}
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Disposition</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>Status:</strong>{" "}
                    {ehrData?.disposition?.status || "N/A"}
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                  </div>
                  {ehrData?.disposition?.instructions?.map(
                    (instruction, index) => (
                      <div
                        key={index}
                        style={{ marginLeft: "10px", marginBottom: "2px" }}
                      >
                        • {instruction}
                      </div>
                    )
                  )}
                  <div>
                    <strong>Follow-up:</strong>{" "}
                    {ehrData?.disposition?.follow_up?.interval || "N/A"} with{" "}
                    {ehrData?.disposition?.follow_up?.with || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Coding</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>ICD-10:</strong>{" "}
                    {ehrData?.coding?.icd10?.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>SNOMED:</strong>{" "}
                    {ehrData?.coding?.snomed?.join(", ") || "N/A"}
                  </div>
                  <div>
                    <strong>CPT:</strong>{" "}
                    {ehrData?.coding?.cpt?.join(", ") || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Provenance</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>Created:</strong>{" "}
                    {ehrData?.provenance?.created_at || "N/A"}
                  </div>
                  <div>
                    <strong>Finalized:</strong>{" "}
                    {ehrData?.provenance?.finalized_at || "N/A"}
                  </div>
                  <div>
                    <strong>Author:</strong>{" "}
                    {ehrData?.provenance?.author || "N/A"}
                  </div>
                  <div>
                    <strong>Transcription ID:</strong>{" "}
                    {ehrData?.provenance?.transcription_id || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Identifiers</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>MRN:</strong> {ehrData?.identifiers?.mrn || "N/A"}
                  </div>
                  <div>
                    <strong>Encounter Display ID:</strong>{" "}
                    {ehrData?.identifiers?.encounter_display_id || "N/A"}
                  </div>
                  <div>
                    <strong>External IDs:</strong>
                  </div>
                  {ehrData?.identifiers?.external_ids?.map((ext, index) => (
                    <div
                      key={index}
                      style={{ marginLeft: "10px", marginBottom: "2px" }}
                    >
                      • {ext.system}: {ext.value} ({ext.type})
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Reconciliation</EHRLabel>
                <EHRValue>
                  <div>
                    <strong>Medication Reconciliation:</strong>{" "}
                    {ehrData?.reconciliation
                      ?.medication_reconciliation_status || "N/A"}
                  </div>
                  <div>
                    <strong>Allergy Reconciliation:</strong>{" "}
                    {ehrData?.reconciliation?.allergy_reconciliation_status ||
                      "N/A"}
                  </div>
                  <div>
                    <strong>Note Review:</strong>{" "}
                    {ehrData?.reconciliation?.note_review_status || "N/A"}
                  </div>
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Attachments</EHRLabel>
                <EHRValue>
                  {ehrData?.attachments?.map((attachment, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <strong>{attachment.type}:</strong> {attachment.title}
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#666",
                          marginLeft: "10px",
                        }}
                      >
                        ID: {attachment.external_id}
                      </div>
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Signatures</EHRLabel>
                <EHRValue>
                  {ehrData?.signatures?.map((sig, index) => (
                    <div key={index} style={{ marginBottom: "4px" }}>
                      <strong>{sig.signed_by}</strong> ({sig.role})
                      <div style={{ fontSize: "10px", color: "#666" }}>
                        {sig.timestamp}
                      </div>
                    </div>
                  ))}
                </EHRValue>
              </EHRFullSection>

              <EHRFullSection>
                <EHRLabel>Note Status</EHRLabel>
                <EHRValue>{ehrData?.note_status || "N/A"}</EHRValue>
              </EHRFullSection>
            </EHRGrid>
          </EHRContent>
        );

      case "todo":
        const todo = item.todoData || {
          title: "Todos",
          description: "",
          todos: [],
        };
        const total = (todo.todos || []).length;
        const done = (todo.todos || []).filter(
          (t) => t.status === "done"
        ).length;
        const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
        const statusColor = (status) =>
          status === "done"
            ? "#10b981"
            : status === "in_progress"
            ? "#f59e0b"
            : "#64748b";
        return (
          <TodoCard>
            <TodoHeader>
              <TodoTitle>✅ {todo.title || "Todo List"}</TodoTitle>
              <div
                style={{ fontSize: "11px", color: "#1e293b", fontWeight: 700 }}
              >
                {progressPct}%
              </div>
            </TodoHeader>
            <TodoBody>
              {todo.description ? (
                <TodoDesc>{todo.description}</TodoDesc>
              ) : null}
              <ProgressBar>
                <ProgressFill style={{ width: `${progressPct}%` }} />
              </ProgressBar>
              <TodoList>
                {(todo.todos || []).map((t, idx) => (
                  <TodoItem key={idx}>
                    <span>{t.text}</span>
                    <StatusChip style={{ background: statusColor(t.status) }}>
                      {t.status === "done"
                        ? "DONE"
                        : t.status === "in_progress"
                        ? "DOING"
                        : "TODO"}
                    </StatusChip>
                  </TodoItem>
                ))}
              </TodoList>
            </TodoBody>
          </TodoCard>
        );

      case "agent":
      case "agent_result":
        const agent = item.agentData || {
          title: item.title || "Agent Result",
          markdown: item.markdown || "",
        };
        return (
          <AgentCard>
            <AgentHeader>
              <AgentTitle>🤖 {agent.title || "Agent Result"}</AgentTitle>
            </AgentHeader>
            <AgentBody>
              {/* Render simple markdown */}
              <div
                dangerouslySetInnerHTML={{
                  __html: toHtml(agent.markdown || item.content || ""),
                }}
              />
            </AgentBody>
          </AgentCard>
        );

      case "lab-result":
        const labData = item.labResultData;
        if (!labData) {
          return <div>Invalid lab result data</div>;
        }
        return (
          <LabResult
            id={item.id}
            parameter={labData.parameter}
            value={labData.value}
            unit={labData.unit}
            status={labData.status}
            range={labData.range}
            trend={labData.trend}
            onEdit={() => console.log("Edit lab result:", item.id)}
            onTrend={() => console.log("View trend for:", item.id)}
            onReadMore={() => console.log("Read more about:", item.id)}
          />
        );

      case "adverse-event-dashboard":
        return <AdverseEventDashboard patientData={item.patientData} />;

      case "single-encounter-document":
        return (
          <SingleEncounterDocument
            encounter={item.encounterData}
            patient={item.patientData?.patient}
            encounterIndex={item.encounterIndex || 0}
          />
        );

      case "ehr-system":
        return <EHRSystemComponent patientData={item.patientData} />;

      default:
        return null;
    }
  };

  return (
    <ItemContainer
      data-item-id={item.id}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height:
          item.type === "agent" ||
          item.type === "todo" ||
          item.type === "lab-result" ||
          item.type === "adverse-event-dashboard" ||
          item.type === "single-encounter-document" ||
          item.type === "ehr-system"
            ? "auto"
            : item.height,
        minHeight:
          item.type === "agent" ||
          item.type === "todo" ||
          item.type === "lab-result" ||
          item.type === "adverse-event-dashboard" ||
          item.type === "single-encounter-document" ||
          item.type === "ehr-system"
            ? item.height
            : "auto",
        transform: `rotate(${item.rotation}deg)`,
        backgroundColor: item.type === "text" ? "#ffffff" : item.color,
        border: isSelected
          ? item.type === "text"
            ? "2px solid #667eea"
            : "2px solid #2196f3"
          : item.type === "text"
          ? "1px solid #e5e7eb"
          : "1px solid rgba(0,0,0,0.1)",
        borderRadius: item.type === "text" ? "12px" : "8px",
        boxShadow: isSelected
          ? item.type === "text"
            ? "0 8px 25px rgba(102, 126, 234, 0.25)"
            : "0 4px 20px rgba(33, 150, 243, 0.3)"
          : item.type === "text"
          ? "0 4px 12px rgba(0, 0, 0, 0.08)"
          : "0 2px 8px rgba(0,0,0,0.1)",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {renderContent()}
      {isSelected && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Delete item"
        >
          ×
        </DeleteButton>
      )}
    </ItemContainer>
  );
};

export default BoardItem;
