import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS } from '../../config/api';

const DebugContainer = styled.div`
  position: fixed;
  top: 60px;
  right: 20px;
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 12px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  z-index: 2000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 80vh;
  overflow-y: auto;
`;

const DebugHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #00ff88;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 107, 107, 0.2);
  }
`;

const DebugSection = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  color: #ffd93d;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DebugButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  margin: 2px 4px 2px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DangerButton = styled(DebugButton)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  
  &:hover {
    background: linear-gradient(135deg, #ff5252, #d63031);
  }
`;

const SuccessButton = styled(DebugButton)`
  background: linear-gradient(135deg, #00b894, #00a085);
  
  &:hover {
    background: linear-gradient(135deg, #00a085, #019875);
  }
`;

const DebugInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  margin: 4px 0;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }
`;

const DebugTextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  margin: 4px 0;
  resize: vertical;
  min-height: 60px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }
`;

const StatusDisplay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  line-height: 1.4;
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
  color: #00ff88;
`;

const ItemList = styled.div`
  max-height: 100px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px;
  border-radius: 4px;
  margin: 4px 0;
`;

const ItemEntry = styled.div`
  font-size: 10px;
  padding: 2px 0;
  color: #74b9ff;
  cursor: pointer;
  
  &:hover {
    color: #00b894;
  }
`;

interface DebugControlBarProps {
  items: any[];
  onClose: () => void;
}

const DebugControlBar: React.FC<DebugControlBarProps> = ({ items, onClose }) => {
  const [status, setStatus] = useState('Debug Control Bar Ready');
  const [customItemId, setCustomItemId] = useState('adverse-event-dashboard-1');
  const [customSubComponent, setCustomSubComponent] = useState('causality-assessment-zone');
  const [customCode, setCustomCode] = useState('window.centerOnItem("adverse-event-dashboard-1", 0.8, 2000);');
  const [sseStatus, setSseStatus] = useState('Disconnected');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    // Test SSE connection on mount
    testSSEConnection();
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setStatus(prev => `[${timestamp}] ${message}\n${prev}`.slice(0, 1000));
    console.log('🔧 Debug:', message);
  };

  const testGlobalFunctions = () => {
    log('=== Testing Global Functions ===');
    log(`centerOnItem: ${typeof (window as any).centerOnItem}`);
    log(`focusOnItem: ${typeof (window as any).focusOnItem}`);
    log(`getItemsByType: ${typeof (window as any).getItemsByType}`);
    log(`getItemById: ${typeof (window as any).getItemById}`);
    log(`resetViewport: ${typeof (window as any).resetViewport}`);
  };

  const testItemRetrieval = () => {
    log('=== Testing Item Retrieval ===');
    if ((window as any).getItemsByType) {
      const dashboards = (window as any).getItemsByType('adverse-event-dashboard');
      log(`Dashboards found: ${dashboards.length}`);
      dashboards.forEach((item: any) => {
        log(`- ID: ${item.id} at (${item.x}, ${item.y}) size: ${item.width}x${item.height}`);
      });
      
      const agents = (window as any).getItemsByType('agent');
      log(`Agent items found: ${agents.length}`);
      
      const todos = (window as any).getItemsByType('todo');
      log(`Todo items found: ${todos.length}`);
    } else {
      log('❌ getItemsByType not available');
    }
    
    // Show zone positions within dashboard
    log('=== Zone Positions (within dashboard) ===');
    const zonePositions = {
      'patient-context-zone': 'Top center (50%, 15%)',
      'encounter-timeline-zone': 'Upper middle (50%, 35%)', 
      'adverse-events-zone': 'Lower left (25%, 60%)',
      'causality-assessment-zone': 'Lower center (50%, 75%)',
      'medical-reasoning-zone': 'Lower right (75%, 60%)',
      'differential-diagnosis-zone': 'Bottom right (85%, 85%)'
    };
    
    Object.entries(zonePositions).forEach(([id, pos]) => {
      log(`  - ${id}: ${pos}`);
    });
  };

  const testManualFocus = () => {
    log('=== Testing Manual Focus ===');
    if ((window as any).centerOnItem) {
      log(`Focusing on: ${customItemId}`);
      (window as any).centerOnItem(customItemId, 0.8, 2000);
    } else {
      log('❌ centerOnItem not available');
    }
  };

  const testSubComponentFocus = () => {
    log('=== Testing Zone Focus (Fixed Coordinates) ===');
    
    // Show available zone positions within dashboard
    const zonePositions = {
      'patient-context-zone': 'Top center (50%, 15%)',
      'encounter-timeline-zone': 'Upper middle (50%, 35%)', 
      'adverse-events-zone': 'Lower left (25%, 60%)',
      'causality-assessment-zone': 'Lower center (50%, 75%)',
      'medical-reasoning-zone': 'Lower right (75%, 60%)',
      'differential-diagnosis-zone': 'Bottom right (85%, 85%)'
    };
    
    if (zonePositions[customSubComponent]) {
      log(`✅ Zone '${customSubComponent}' position: ${zonePositions[customSubComponent]}`);
      
      // Calculate actual coordinates if dashboard exists
      if ((window as any).getItemById) {
        const dashboard = (window as any).getItemById(customItemId);
        if (dashboard) {
          const position = {
            'patient-context-zone': { x: 0.5, y: 0.15 },
            'encounter-timeline-zone': { x: 0.5, y: 0.35 }, 
            'adverse-events-zone': { x: 0.25, y: 0.6 },
            'causality-assessment-zone': { x: 0.5, y: 0.75 },
            'medical-reasoning-zone': { x: 0.75, y: 0.6 },
            'differential-diagnosis-zone': { x: 0.85, y: 0.85 }
          }[customSubComponent];
          
          if (position) {
            const absoluteX = dashboard.x + (dashboard.width * position.x);
            const absoluteY = dashboard.y + (dashboard.height * position.y);
            log(`Calculated coordinates: (${Math.round(absoluteX)}, ${Math.round(absoluteY)})`);
          }
        }
      }
    } else {
      log(`❌ Unknown zone: ${customSubComponent}`);
      log('Available zones:');
      Object.entries(zonePositions).forEach(([id, pos]) => {
        log(`  - ${id}: ${pos}`);
      });
      return;
    }
    
    if ((window as any).focusOnSubComponent) {
      log(`Focusing on zone: ${customSubComponent} within dashboard: ${customItemId}`);
      (window as any).focusOnSubComponent(customItemId, customSubComponent);
    } else {
      log('❌ focusOnSubComponent not available');
    }
  };

  const testAPIFocus = async () => {
    log('=== Testing API Focus ===');
    try {
      const payload: any = { objectId: customItemId };
      if (customSubComponent) {
        payload.subComponent = customSubComponent;
      }
      
      const response = await fetch(API_ENDPOINTS.FOCUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      log(`API Response: ${JSON.stringify(result)}`);
    } catch (error) {
      log(`❌ API Error: ${error}`);
    }
  };

  const testSSEConnection = () => {
    log('=== Testing SSE Connection ===');
    try {
      if (eventSource) {
        eventSource.close();
      }
      
      const es = new EventSource(API_ENDPOINTS.EVENTS);
      setEventSource(es);
      
      es.onopen = () => {
        setSseStatus('Connected');
        log('✅ SSE Connected');
      };
      
      es.onerror = (error) => {
        setSseStatus('Error');
        log('❌ SSE Error');
      };
      
      es.addEventListener('connected', (event) => {
        log(`📡 SSE Connected: ${event.data}`);
      });
      
      es.addEventListener('focus-item', (event) => {
        log(`🎯 SSE Focus: ${event.data}`);
      });
      
      es.addEventListener('new-item', (event) => {
        log(`📦 SSE New Item: ${JSON.parse(event.data).item?.id}`);
      });
      
    } catch (error) {
      log(`❌ SSE Setup Error: ${error}`);
      setSseStatus('Error');
    }
  };

  const executeCustomCode = () => {
    log('=== Executing Custom Code ===');
    try {
      const result = eval(customCode);
      log(`✅ Code executed. Result: ${result}`);
    } catch (error) {
      log(`❌ Code Error: ${error}`);
    }
  };

  const testAllZonesSequentially = async () => {
    log('=== Testing All Zones Sequentially ===');
    const zones = [
      'patient-context-zone',
      'encounter-timeline-zone', 
      'adverse-events-zone',
      'causality-assessment-zone',
      'medical-reasoning-zone',
      'differential-diagnosis-zone'
    ];

    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      log(`Testing zone ${i + 1}/${zones.length}: ${zone}`);
      
      setCustomSubComponent(zone);
      if ((window as any).focusOnSubComponent) {
        (window as any).focusOnSubComponent(customItemId, zone);
      }
      
      // Wait 3 seconds between each zone
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    log('✅ All zones tested');
  };

  const resetViewport = () => {
    log('=== Resetting Viewport ===');
    if ((window as any).resetViewport) {
      (window as any).resetViewport();
      log('✅ Viewport reset');
    } else {
      log('❌ resetViewport not available');
    }
  };

  const createTestItem = async (type: string) => {
    log(`=== Creating Test ${type} ===`);
    try {
      let endpoint = '';
      let payload = {};
      
      switch (type) {
        case 'agent':
          endpoint = '/api/agents';
          payload = {
            title: 'Debug Test Agent',
            content: '# Debug Test\n\nThis is a test agent created from debug panel.\n\n- Test item 1\n- Test item 2'
          };
          break;
        case 'todo':
          endpoint = '/api/todos';
          payload = {
            title: 'Debug Test Todo',
            description: 'Test todo from debug panel',
            todo_items: ['Debug task 1', 'Debug task 2', 'Debug task 3']
          };
          break;
        case 'lab-result':
          endpoint = '/api/lab-results';
          payload = {
            parameter: 'Debug Test Parameter',
            value: 42,
            unit: 'mg/dL',
            status: 'optimal',
            range: { min: 20, max: 80 }
          };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      log(`✅ Created ${type}: ${result.id}`);
      setCustomItemId(result.id);
    } catch (error) {
      log(`❌ Create ${type} Error: ${error}`);
    }
  };

  const availableZones = [
    'patient-context-zone',
    'encounter-timeline-zone', 
    'adverse-events-zone',
    'causality-assessment-zone',
    'medical-reasoning-zone',
    'differential-diagnosis-zone'
  ];

  return (
    <DebugContainer>
      <DebugHeader>
        <DebugTitle>🔧 Debug Control Bar</DebugTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </DebugHeader>

      <DebugSection>
        <SectionTitle>System Status</SectionTitle>
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
          SSE: <span style={{ color: sseStatus === 'Connected' ? '#00ff88' : '#ff6b6b' }}>{sseStatus}</span> | 
          Items: {items.length}
        </div>
        <DebugButton onClick={testGlobalFunctions}>Test Functions</DebugButton>
        <DebugButton onClick={testItemRetrieval}>List Items</DebugButton>
        <DebugButton onClick={testSSEConnection}>Test SSE</DebugButton>
        <DangerButton onClick={async () => {
          log('=== Resetting Server Cache ===');
          try {
            const response = await fetch('/api/reset-cache', { method: 'POST' });
            const result = await response.json();
            log(`✅ Cache reset: ${result.itemCount} items loaded`);
            log('🔄 Refresh page to see updated items');
          } catch (error) {
            log(`❌ Reset failed: ${error}`);
          }
        }}>Reset Cache</DangerButton>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Available Items</SectionTitle>
        <ItemList>
          {items.map(item => (
            <ItemEntry 
              key={item.id}
              onClick={() => setCustomItemId(item.id)}
            >
              {item.type}: {item.id}
            </ItemEntry>
          ))}
        </ItemList>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Focus Controls</SectionTitle>
        <DebugInput
          value={customItemId}
          onChange={(e) => setCustomItemId(e.target.value)}
          placeholder="Item ID"
        />
        <DebugInput
          value={customSubComponent}
          onChange={(e) => setCustomSubComponent(e.target.value)}
          placeholder="Sub-component ID (optional)"
        />
        <div style={{ marginTop: '8px' }}>
          <DebugButton onClick={testManualFocus}>Focus Item</DebugButton>
          <DebugButton onClick={testSubComponentFocus}>Focus Zone</DebugButton>
          <DebugButton onClick={testAPIFocus}>API Focus</DebugButton>
          <DangerButton onClick={resetViewport}>Reset View</DangerButton>
        </div>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Quick Zone Focus</SectionTitle>
        {availableZones.map(zone => (
          <DebugButton 
            key={zone}
            onClick={() => {
              setCustomSubComponent(zone);
              testSubComponentFocus();
            }}
          >
            {zone.replace('-zone', '').replace('-', ' ')}
          </DebugButton>
        ))}
        <div style={{ marginTop: '8px' }}>
          <SuccessButton onClick={testAllZonesSequentially}>Test All Zones</SuccessButton>
        </div>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Create Test Items</SectionTitle>
        <SuccessButton onClick={() => createTestItem('agent')}>+ Agent</SuccessButton>
        <SuccessButton onClick={() => createTestItem('todo')}>+ Todo</SuccessButton>
        <SuccessButton onClick={() => createTestItem('lab-result')}>+ Lab</SuccessButton>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Custom Code Execution</SectionTitle>
        <DebugTextArea
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Enter JavaScript code to execute..."
        />
        <DebugButton onClick={executeCustomCode}>Execute Code</DebugButton>
      </DebugSection>

      <DebugSection>
        <SectionTitle>Debug Log</SectionTitle>
        <StatusDisplay>{status}</StatusDisplay>
        <DangerButton onClick={() => setStatus('')}>Clear Log</DangerButton>
      </DebugSection>
    </DebugContainer>
  );
};

export default DebugControlBar;