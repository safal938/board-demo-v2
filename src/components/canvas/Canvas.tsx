import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import BoardItem from "./BoardItem";
import { API_ENDPOINTS } from "../../config/api";

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
  background-image: radial-gradient(circle, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
`;

const CanvasContent = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: 0 0;
`;

const DataZoneWrapper = styled.div`
  position: absolute;
  background: #dedbdbab;
  border-radius: 12px;
  z-index: 1;
  pointer-events: none;
`;

const DataZoneLabel = styled.div`
  position: absolute;
  background: white;
  color: #333;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  z-index: 10;
  pointer-events: none;
`;

const SystemLabel = styled.div`
  position: absolute;
  background: white;
  color: #333;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  z-index: 10;
  pointer-events: none;
`;

const Canvas = ({
  items,
  selectedItemId,
  onUpdateItem,
  onDeleteItem,
  onSelectItem,
  onFocusRequest,
  onAddItem,
  onResetBoard,
}) => {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 0.7 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Handle viewport changes
  const updateViewport = useCallback((newViewport) => {
    setViewport(newViewport);
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${newViewport.x}px, ${newViewport.y}px) scale(${newViewport.zoom})`;
    }
  }, []);

  // Auto-center on first agent item when items are loaded (only once)
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Only run once when items are first loaded
    if (hasInitialized || items.length === 0) return;

    // Look for agent items first, then any item
    const targetItem = items.find((item) => item.type === "agent") || items[0];

    if (targetItem && canvasRef.current) {
      const container = canvasRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate position to center the item
        const itemCenterX = targetItem.x + (targetItem.width || 400) / 2;
        const itemCenterY = targetItem.y + (targetItem.height || 300) / 2;

        // Position so item is centered in viewport
        const targetX = containerWidth / 2 - itemCenterX * 0.7;
        const targetY = containerHeight / 2 - itemCenterY * 0.7;

        updateViewport({ x: targetX, y: targetY, zoom: 0.7 });
        setHasInitialized(true);
      }
    }
  }, [items, hasInitialized, updateViewport]);

  // Define zone positions within the dashboard (fixed coordinates relative to dashboard)
  const getZoneCoordinates = (zoneId: string, dashboardItem: any) => {
    // Define where each zone is positioned within the dashboard (as percentages)
    const zonePositions = {
      'patient-context-zone': { x: 0.5, y: 0.1 }, // Header section
      'encounter-timeline-zone': { x: 0.5, y: 0.25 }, // Timeline section  
      'adverse-events-zone': { x: 0.5, y: 0.45 }, // Analytics section
      'lab-findings-zone': { x: 0.2, y: 0.75 }, // Bottom left (Lab Table)
      'lab-trends-zone': { x: 0.5, y: 0.75 }, // Bottom center (Lab Chart)
      'differential-diagnosis-zone': { x: 0.8, y: 0.75 }, // Bottom right
      // Legacy zones for backward compatibility
      'causality-assessment-zone': { x: 0.5, y: 0.45 }, // Maps to analytics
      'medical-reasoning-zone': { x: 0.8, y: 0.75 }, // Maps to differential diagnosis
    };

    const position = zonePositions[zoneId];
    if (!position) {
      console.warn(`⚠️ Unknown zone: ${zoneId}, using dashboard center`);
      return { 
        x: dashboardItem.x + dashboardItem.width / 2, 
        y: dashboardItem.y + dashboardItem.height / 2 
      };
    }

    // Calculate absolute world coordinates based on dashboard position
    const absoluteX = dashboardItem.x + (dashboardItem.width * position.x);
    const absoluteY = dashboardItem.y + (dashboardItem.height * position.y);

    console.log(`🎯 Zone ${zoneId} coordinates:`, {
      relative: position,
      dashboard: { x: dashboardItem.x, y: dashboardItem.y, w: dashboardItem.width, h: dashboardItem.height },
      absolute: { x: absoluteX, y: absoluteY }
    });

    return { x: absoluteX, y: absoluteY };
  };

  // Center viewport on specific item or zone with animation
  const centerOnItem = useCallback(
    (itemId, finalZoom = 0.8, duration = 3000, zoneId = null) => {
      const item = items.find((i) => i.id === itemId);
      if (!item || !canvasRef.current) return;

      const container = canvasRef.current.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const start = { ...viewport };
      const clampZoom = (z) => Math.max(0.1, Math.min(3, z));

      // Simple easing function
      const easeInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      // Calculate target position
      let targetObjectCenterX = item.x + item.width / 2;
      let targetObjectCenterY = item.y + item.height / 2;

      // If focusing on a zone within the dashboard, calculate zone coordinates
      if (zoneId && item.type === 'adverse-event-dashboard') {
        const zoneCoords = getZoneCoordinates(zoneId, item);
        targetObjectCenterX = zoneCoords.x;
        targetObjectCenterY = zoneCoords.y;
      }

      console.log(`🎯 Focusing on ${zoneId ? `zone ${zoneId} in` : 'item'} ${itemId} at:`, {
        x: targetObjectCenterX,
        y: targetObjectCenterY
      });

      // 3 equal phases
      const phaseDuration = duration / 3;
      const t1 = phaseDuration; // Step 1: zoom out
      const t2 = phaseDuration * 2; // Step 2: move to target center
      const t3 = duration; // Step 3: zoom in

      // Step 1: Zoom out from current viewport (to 30% of current zoom)
      const zoomOutZoom = clampZoom(start.zoom * 0.3);

      // Step 2: Calculate position to center the target object/sub-component
      const targetViewportX =
        containerWidth / 2 - targetObjectCenterX * zoomOutZoom;
      const targetViewportY =
        containerHeight / 2 - targetObjectCenterY * zoomOutZoom;

      // Step 3: Calculate final position with target zoom
      const finalViewportX =
        containerWidth / 2 - targetObjectCenterX * finalZoom;
      const finalViewportY =
        containerHeight / 2 - targetObjectCenterY * finalZoom;

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        let current;
        if (elapsed <= t1) {
          // Step 1: Zoom out from current viewport center
          const k = easeInOut(elapsed / t1);
          const currentZoom = start.zoom + (zoomOutZoom - start.zoom) * k;

          // Keep current viewport center fixed during zoom out
          const currentCenterX = (containerWidth / 2 - start.x) / start.zoom;
          const currentCenterY = (containerHeight / 2 - start.y) / start.zoom;
          const newX = containerWidth / 2 - currentCenterX * currentZoom;
          const newY = containerHeight / 2 - currentCenterY * currentZoom;

          current = { x: newX, y: newY, zoom: currentZoom };
        } else if (elapsed <= t2) {
          // Step 2: Pan viewport to target object center
          const k = easeInOut((elapsed - t1) / (t2 - t1));
          // Get the current viewport position at the end of step 1
          const step1EndX =
            containerWidth / 2 -
            ((containerWidth / 2 - start.x) / start.zoom) * zoomOutZoom;
          const step1EndY =
            containerHeight / 2 -
            ((containerHeight / 2 - start.y) / start.zoom) * zoomOutZoom;

          const currentX = step1EndX + (targetViewportX - step1EndX) * k;
          const currentY = step1EndY + (targetViewportY - step1EndY) * k;

          current = { x: currentX, y: currentY, zoom: zoomOutZoom };
        } else {
          // Step 3: Zoom in to target object
          const k = easeInOut((elapsed - t2) / (t3 - t2));
          const currentX =
            targetViewportX + (finalViewportX - targetViewportX) * k;
          const currentY =
            targetViewportY + (finalViewportY - targetViewportY) * k;
          const currentZoom = zoomOutZoom + (finalZoom - zoomOutZoom) * k;

          current = { x: currentX, y: currentY, zoom: currentZoom };
        }

        updateViewport(current);

        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    },
    [items, viewport, updateViewport]
  );

  // Handle mouse wheel for zooming (zoom around cursor)
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();

      // Mouse position in screen space relative to container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Compute new zoom
      const step = 0.1;
      const factor = e.deltaY > 0 ? 1 - step : 1 + step; // out vs in
      const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * factor));

      // World coordinates under cursor before zoom
      const worldX = (mouseX - viewport.x) / viewport.zoom;
      const worldY = (mouseY - viewport.y) / viewport.zoom;

      // New translation so the same world point stays under cursor
      const newX = mouseX - worldX * newZoom;
      const newY = mouseY - worldY * newZoom;

      updateViewport({ x: newX, y: newY, zoom: newZoom });
    },
    [viewport, updateViewport]
  );

  // Handle panning
  const handleMouseDown = useCallback(
    (e) => {
      // Allow panning with left mouse button on canvas background, or middle mouse button
      if (e.button === 0 || e.button === 1) {
        // Only start panning if clicking on the canvas background (not on items)
        if (
          e.target === e.currentTarget ||
          e.target.closest("[data-item-id]") === null
        ) {
          e.preventDefault();
          setIsDragging(true);
          setDragStart({ x: e.clientX, y: e.clientY });
          setLastPanPoint({ x: viewport.x, y: viewport.y });
        }
      }
    },
    [viewport]
  );

  const handleMouseMove = useCallback((e) => {
    // This is now handled by global event listeners
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle canvas clicks
  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target === canvasRef.current) {
        onSelectItem(null);
      }
    },
    [onSelectItem]
  );

  // Mouse event listeners for better panning
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        updateViewport({
          x: lastPanPoint.x + deltaX,
          y: lastPanPoint.y + deltaY,
          zoom: viewport.zoom,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, lastPanPoint, viewport.zoom, updateViewport]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "r" && e.ctrlKey) {
        e.preventDefault();
        updateViewport({ x: 0, y: 0, zoom: 1 });
      }
      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        // Center on first item if available
        if (items.length > 0) {
          centerOnItem(items[0].id);
        }
      }

    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [updateViewport, centerOnItem, items]);

  // Expose centerOnItem function to parent and handle SSE focus events
  useEffect(() => {
    if (onFocusRequest) {
      // Make centerOnItem available globally for focus requests
      (window as any).centerOnItem = centerOnItem;
    }

    // Listen for SSE focus events from server
    const eventSource = new EventSource(API_ENDPOINTS.EVENTS);

    eventSource.addEventListener("focus-item", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.objectId) {
          console.log("🎯 Received focus request for:", data.focusTarget || data.objectId);
          
          // If there's a sub-component, focus on the zone within the dashboard
          if (data.subComponent) {
            // Focus on the zone within the dashboard
            centerOnItem(data.objectId, 1.2, 2000, data.subComponent);
            
            // Highlight the zone after centering
            setTimeout(() => {
              const subElement = document.getElementById(data.subComponent);
              if (subElement) {
                subElement.classList.add("focused");
                setTimeout(() => {
                  subElement.classList.remove("focused");
                }, 5000);
                console.log(`✨ Highlighted zone: ${data.subComponent}`);
              }
            }, 2500);
          } else {
            // Focus on the main item only
            centerOnItem(data.objectId, 0.8, 2000);
          }
        }
      } catch (error) {
        console.error("Error parsing focus event:", error);
      }
    });

    eventSource.addEventListener("new-item", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.item && data.action === "created") {
          console.log("📦 New item created:", data.item.id);
          // Auto-focus on newly created items
          setTimeout(() => centerOnItem(data.item.id, 0.8, 1500), 500);
        }
      } catch (error) {
        console.error("Error parsing new-item event:", error);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [centerOnItem, onFocusRequest]);

  // Expose helper to place an item at current viewport center and persist
  useEffect(() => {
    (window as any).placeItemAtViewportCenter = async (itemId: string) => {
      try {
        const container = canvasRef.current
          ?.parentElement as HTMLElement | null;
        if (!container) return;
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // World coords of viewport center
        const centerWorldX = (containerWidth / 2 - viewport.x) / viewport.zoom;
        const centerWorldY = (containerHeight / 2 - viewport.y) / viewport.zoom;

        const newX = Math.round(centerWorldX - (item.width || 0) / 2);
        const newY = Math.round(centerWorldY - (item.height || 0) / 2);

        onUpdateItem(itemId, { x: newX, y: newY });

        // Persist to backend if available
        try {
          await fetch(`${API_ENDPOINTS.BOARD_ITEMS}/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x: newX, y: newY }),
          });
        } catch (_) {
          /* ignore */
        }
      } catch (_) {
        /* ignore */
      }
    };
  }, [items, viewport, onUpdateItem]);

  // Expose helper functions for external control
  useEffect(() => {
    // Get current viewport center in world coordinates
    (window as any).getViewportCenterWorld = () => {
      const container = canvasRef.current?.parentElement as HTMLElement | null;
      if (!container) return null;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const x = (containerWidth / 2 - viewport.x) / viewport.zoom;
      const y = (containerHeight / 2 - viewport.y) / viewport.zoom;
      return { x, y, zoom: viewport.zoom };
    };

    // Focus on item by ID
    (window as any).focusOnItem = (itemId: string) => {
      centerOnItem(itemId, 0.8, 2000);
    };

    // Focus on zone within dashboard
    (window as any).focusOnSubComponent = (itemId: string, subComponentId: string) => {
      // Focus on the zone within the dashboard using calculated coordinates
      centerOnItem(itemId, 1.2, 2000, subComponentId);
      
      // Highlight the zone after centering
      setTimeout(() => {
        const subElement = document.getElementById(subComponentId);
        if (subElement) {
          subElement.classList.add("focused");
          setTimeout(() => subElement.classList.remove("focused"), 5000);
          console.log(`✨ Focused on zone: ${subComponentId}`);
        }
      }, 2500);
    };

    // Get all items of a specific type
    (window as any).getItemsByType = (type: string) => {
      return items.filter((item) => item.type === type);
    };

    // Get item by ID
    (window as any).getItemById = (itemId: string) => {
      return items.find((item) => item.id === itemId);
    };

    // Reset viewport to default
    (window as any).resetViewport = () => {
      updateViewport({ x: 0, y: 0, zoom: 0.7 });
    };
  }, [viewport, items, centerOnItem, updateViewport]);

  // EHR system names to assign to encounters
  const ehrSystems = [
    "Nervecentre",
    "Medilogik",
    "Viper",
    "ICE",
    "Bighand",
    "VueExplore PACS",
  ];

  // Get encounter documents and calculate bounds for wrapper (if any exist)
  const encounterItems = items.filter(
    (item) => item.type === "single-encounter-document"
  );

  const getEncounterBounds = () => {
    if (encounterItems.length === 0) return null;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    encounterItems.forEach((item) => {
      // Account for system labels above encounters
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y - 70); // Include space for system labels
      maxX = Math.max(maxX, item.x + (item.width || 400));
      maxY = Math.max(maxY, item.y + (item.height || 300));
    });

    return {
      x: minX - 30,
      y: minY - 20,
      width: maxX - minX + 60,
      height: maxY - minY + 40,
    };
  };

  const encounterBounds = getEncounterBounds();

  return (
    <CanvasContainer
      className="canvas-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <CanvasContent
        ref={canvasRef}
        data-canvas-content
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Data Zone wrapper around all encounters */}
        {encounterBounds && (
          <>
            <DataZoneWrapper
              style={{
                left: encounterBounds.x,
                top: encounterBounds.y,
                width: encounterBounds.width + 100,
                height: encounterBounds.height + 600,
              }}
            />
            <DataZoneLabel
              style={{
                left: encounterBounds.x + 20,
                top: encounterBounds.y + 10,
              }}
            >
              Data Zone
            </DataZoneLabel>
          </>
        )}

        {/* System labels floating above each encounter */}
        {encounterItems.slice(0, 6).map((item, index) => {
          const systemName = ehrSystems[index] || "Unknown System";
          return (
            <SystemLabel
              key={`system-${item.id}`}
              style={{
                left: item.x + item.width / 2 - 40,
                top: item.y - 60,
              }}
            >
              {systemName}
            </SystemLabel>
          );
        })}

        {/* Render all items */}
        <AnimatePresence>
          {items.map((item) => (
            <BoardItem
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
              onSelect={onSelectItem}
            />
          ))}
        </AnimatePresence>
      </CanvasContent>



      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        🖱️ Drag to pan • Scroll/pinch to zoom • Ctrl+R reset • Ctrl+F focus first • Double-click text to edit
      </div>
    </CanvasContainer>
  );
};

export default Canvas;
