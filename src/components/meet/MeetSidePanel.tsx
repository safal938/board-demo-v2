import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { meet, type MeetSidePanelClient } from '@googleworkspace/meet-addons/meet.addons';

const SidePanelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h2`
  margin: 0;
  color: #1a73e8;
  font-size: 18px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.4;
`;

const LaunchButton = styled.button`
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1557b0;
  }

  &:disabled {
    background: #dadce0;
    cursor: not-allowed;
  }
`;

const StatusText = styled.div`
  font-size: 12px;
  color: #5f6368;
  font-style: italic;
`;

const MeetSidePanel: React.FC = () => {
  const [client, setClient] = useState<MeetSidePanelClient>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeMeetSession = async () => {
      try {
        // Check if we're in a Google Meet context
        if (typeof window !== 'undefined' && !window.location.href.includes('meet.google.com')) {
          // Development mode - show demo interface
          setError('Demo Mode: This component works within Google Meet. Configure your GCP project number and deploy to use in Meet.');
          setIsLoading(false);
          return;
        }

        // Replace with your actual GCP project number
        const gcpProjectNumber = process.env.REACT_APP_GCP_PROJECT_NUMBER;
        if (!gcpProjectNumber || gcpProjectNumber === 'YOUR_GCP_PROJECT_NUMBER') {
          setError('Please set REACT_APP_GCP_PROJECT_NUMBER in your environment variables');
          setIsLoading(false);
          return;
        }

        const session = await meet.addon.createAddonSession({
          cloudProjectNumber: gcpProjectNumber
        });
        
        const sidePanelClient = await session.createSidePanelClient();
        setClient(sidePanelClient);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Meet session:', err);
        setError('Failed to initialize Google Meet integration');
        setIsLoading(false);
      }
    };

    initializeMeetSession();
  }, []);

  const handleLaunchActivity = async () => {
    if (!client) return;

    try {
      await client.startActivity({
        mainStageUrl: `${window.location.origin}/meet/mainstage`
      });
    } catch (err) {
      console.error('Failed to launch activity:', err);
      setError('Failed to launch board in main stage');
    }
  };

  if (isLoading) {
    return (
      <SidePanelContainer>
        <StatusText>Initializing Google Meet integration...</StatusText>
      </SidePanelContainer>
    );
  }

  if (error) {
    return (
      <SidePanelContainer>
        <Title>MedForce Board</Title>
        <StatusText style={{ color: '#d93025', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </StatusText>
        {error.includes('Demo Mode') && (
          <div style={{ background: '#e8f0fe', padding: '16px', borderRadius: '8px', fontSize: '13px', color: '#1a73e8' }}>
            <strong>Setup Instructions:</strong>
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Get your Google Cloud Project number from the GCP Console</li>
              <li>Add REACT_APP_GCP_PROJECT_NUMBER=your_project_number to your .env file</li>
              <li>Deploy your app to a public URL</li>
              <li>Configure your Meet Add-on in Google Cloud Console</li>
            </ol>
          </div>
        )}
      </SidePanelContainer>
    );
  }

  return (
    <SidePanelContainer>
      <Title>MedForce Board</Title>
      <Description>
        Launch the collaborative medical board in the main stage where everyone in the call can see and interact with it.
      </Description>
      <LaunchButton 
        onClick={handleLaunchActivity}
        disabled={!client}
      >
        Launch Board in Main Stage
      </LaunchButton>
      <StatusText>
        Only you can see this side panel. Click the button above to share the board with everyone in the call.
      </StatusText>
    </SidePanelContainer>
  );
};

export default MeetSidePanel;