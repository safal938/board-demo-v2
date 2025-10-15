import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Canvas from './components/canvas/Canvas';
import MeetSidePanel from './components/meet/MeetSidePanel';
import MeetMainStage from './components/meet/MeetMainStage';
import AdverseEventDashboard from './components/dashboard/AdverseEventDashboard';
import { API_ENDPOINTS } from './config/api';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  background-color: #f5f5f5;
`;

const ModernAddButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px) scale(1.02);
  }

  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
    border-radius: 16px;
    pointer-events: none;
  }
`;

const ModernRefreshButton = styled.button`
  position: fixed;
  top: 20px;
  left: 160px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
  border: none;
  border-radius: 16px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(72, 219, 251, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:hover {
    background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
    box-shadow: 0 12px 35px rgba(72, 219, 251, 0.4);
    transform: translateY(-2px) scale(1.02);
  }

  &:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 6px 20px rgba(72, 219, 251, 0.35);
  }

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2.5;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
    border-radius: 16px;
    pointer-events: none;
  }
`;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/meet/sidepanel" element={<MeetSidePanel />} />
        <Route path="/meet/mainstage" element={<MeetMainStage />} />
        <Route path="/dashboard" element={<AdverseEventDashboard />} />
        <Route path="/" element={<BoardApp />} />
      </Routes>
    </Router>
  );
}



// Main board application component
function BoardApp() {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);


  // Load patient data and create initial dashboard item
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load patient data from public/data.json
        try {
          const patientResponse = await fetch('/data.json');
          if (patientResponse.ok) {
            const patientJson = await patientResponse.json();
            setPatientData(patientJson);
            console.log('📊 Loaded patient data');
            
            const initialItems = [];
            
            // First, load any existing items from server
            try {
              const serverResponse = await fetch(API_ENDPOINTS.BOARD_ITEMS);
              if (serverResponse.ok) {
                const serverItems = await serverResponse.json();
                console.log(`📦 Loaded ${serverItems.length} items from server`);
                // Add server items first
                initialItems.push(...serverItems);
              }
            } catch (error) {
              console.log('⚠️ Could not load items from server:', error.message);
            }
            
            // Layout configuration with MUCH more spacing
            const encounterWidth = 400;
            const encounterHeight = 600;
            const startX = 150;
            const ehrSystemY = 100; // EHR System at the top
            const encounterY = 600; // MUCH more space below EHR System (500px gap)
            const dashboardY = 2000; // HUGE gap below encounters (900px gap)
            const spacing = 120; // Much more spacing between encounters
            
            // Create EHR System component at the top center
            const encounters = patientJson.encounters || [];
            const totalEncounterWidth = encounters.length * (encounterWidth + spacing) - spacing;
            const ehrSystemX = startX + (totalEncounterWidth / 2) - 250; // Center above encounters
            
            const ehrSystemItem = {
              id: 'ehr-system-1',
              type: 'ehr-system',
              x: ehrSystemX,
              y: ehrSystemY,
              width: 500,
              height: 200,
              content: 'Healthcare Information Systems',
              color: '#ffffff',
              rotation: 0,
              patientData: patientJson,
            };
            initialItems.push(ehrSystemItem);
            
            // Create individual encounter documents in a row (1 row, 6 columns)
            encounters.forEach((encounter, index) => {
              const encounterItem = {
                id: `encounter-doc-${encounter.encounter_no}`,
                type: 'single-encounter-document',
                x: startX + (encounterWidth + spacing) * index,
                y: encounterY,
                width: encounterWidth,
                height: encounterHeight,
                content: `Encounter ${encounter.encounter_no}`,
                color: '#ffffff',
                rotation: 0,
                encounterData: encounter,
                patientData: patientJson,
                encounterIndex: index,
              };
              initialItems.push(encounterItem);
            });
            
            // Create the adverse event dashboard centered below the encounter documents
            const dashboardItem = {
              id: 'adverse-event-dashboard-1',
              type: 'adverse-event-dashboard',
              x: startX + (totalEncounterWidth / 2) - 600, // Center below encounters
              y: dashboardY, // MUCH more space below encounters
              width: 1200,
              height: 800,
              content: 'Adverse Event Dashboard',
              color: '#f5f5f5',
              rotation: 0,
              patientData: patientJson,
            };
            initialItems.push(dashboardItem);
            

            
            setItems(initialItems);
          }
        } catch (error) {
          console.log('⚠️ Could not load patient data:', error.message);
          setItems([]);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Listen for new items via SSE
  useEffect(() => {
    const eventSource = new EventSource(API_ENDPOINTS.EVENTS);

    eventSource.addEventListener('new-item', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.item && data.action === 'created') {
          console.log('📦 New item received via SSE:', data.item.id, data.item.type);
          // Add the new item to the state
          setItems(prev => {
            // Check if item already exists
            const exists = prev.some(item => item.id === data.item.id);
            if (exists) {
              console.log('⚠️ Item already exists, skipping:', data.item.id);
              return prev;
            }
            console.log('✅ Adding new item to canvas:', data.item.id, data.item.type);
            return [...prev, data.item];
          });
        }
      } catch (error) {
        console.error('❌ Error parsing new-item event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const addItem = useCallback((type) => {
    // Get viewport center coordinates
    const getViewportCenter = () => {
      if (typeof window !== 'undefined' && (window as any).getViewportCenterWorld) {
        const center = (window as any).getViewportCenterWorld();
        return center ? { x: center.x, y: center.y } : { x: 400, y: 300 };
      }
      // Fallback to default center
      return { x: 400, y: 300 };
    };

    const center = getViewportCenter();
    const itemWidth = type === 'text' ? 200 : type === 'ehr' ? 550 : type === 'adverse-event-dashboard' ? 1200 : type === 'data-zone' ? 1400 : 150;
    const itemHeight = type === 'text' ? 100 : type === 'ehr' ? 450 : type === 'adverse-event-dashboard' ? 800 : type === 'data-zone' ? 900 : 150;

    const newItem = {
      id: `item-${Date.now()}`,
      type,
      // Position at viewport center, accounting for item size
      x: center.x - itemWidth / 2,
      y: center.y - itemHeight / 2,
      width: itemWidth,
      height: itemHeight,
      content: type === 'text' ? 'Click to edit' : type === 'ehr' ? 'EHR Data' : type === 'adverse-event-dashboard' ? 'Adverse Event Dashboard' : type === 'data-zone' ? 'Data Zone' : '',
      color: type === 'sticky' ? '#ffeb3b' : type === 'ehr' ? '#e8f5e8' : type === 'adverse-event-dashboard' ? '#f5f5f5' : type === 'data-zone' ? '#f8f9fa' : '#ffffff',
      rotation: 0,
      patientData: (type === 'adverse-event-dashboard' || type === 'data-zone') ? patientData : null,
      ehrData: type === 'ehr' ? {
        encounter_id: "EHR_2015_08_10_001",
        patient: {
          id: "P001",
          name: "John McAllister",
          age: 53,
          sex: "Male",
          occupation: "Retired carpenter"
        },
        encounter_metadata: {
          date: "2015-08-10",
          time: "11:00",
          type: "Outpatient",
          clinician: "Dr. Elizabeth Hayes",
          specialty: "Rheumatology"
        },
        chief_complaint: "Bilateral joint pain and swelling.",
        sections: {
          history_of_present_illness: {
            summary: "6-month history of progressive, symmetrical joint pain and swelling in hands and feet, worse in morning (>1h stiffness), with fatigue.",
            details: "Patient reports fatigue impacting daily activities, limited relief with NSAIDs, no fever or systemic symptoms."
          },
          impression: {
            working_diagnosis: "Seropositive Rheumatoid Arthritis (RA), active disease",
            differential_diagnoses: [
              "Psoriatic Arthritis",
              "Systemic Lupus Erythematosus",
              "Crystal Arthropathy"
            ]
          }
        }
      } : null,
    };
    setItems(prev => [...prev, newItem]);
  }, [patientData]);

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  const refreshItems = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BOARD_ITEMS);
      if (response.ok) {
        const serverItems = await response.json();
        console.log(`🔄 Refreshed ${serverItems.length} items from server`);
        setItems(serverItems);
      }
    } catch (error) {
      console.log('⚠️ Could not refresh items from server:', error.message);
    }
  }, []);

  const resetBoard = useCallback(() => {
    if (patientData) {
      const dashboardItem = {
        id: 'adverse-event-dashboard-1',
        type: 'adverse-event-dashboard',
        x: 100,   // Default viewport position
        y: 100,
        width: 1200,
        height: 800,
        content: 'Adverse Event Dashboard',
        color: '#f5f5f5',
        rotation: 0,
        patientData: patientData,
      };
      setItems([dashboardItem]);
      setSelectedItemId(null);
    }
  }, [patientData]);

  const handleFocusRequest = useCallback((request) => {
    console.log('🎯 Focus request received:', request);
    const item = items.find(i => i.id === request.objectId);
    if (item) {
      setSelectedItemId(request.objectId);
    }
  }, [items]);



  if (isLoading) {
    return (
      <AppContainer style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading patient data...
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {/* Modern Add Text Button */}
      <ModernAddButton 
        onClick={() => addItem('text')}
        title="Add Text Note"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
        Add Note
      </ModernAddButton>

      <Canvas
        items={items}
        selectedItemId={selectedItemId}
        onUpdateItem={updateItem}
        onDeleteItem={deleteItem}
        onSelectItem={setSelectedItemId}
        onFocusRequest={handleFocusRequest}
        onAddItem={addItem}
        onResetBoard={resetBoard}
      />
    </AppContainer>
  );
}

export default App;