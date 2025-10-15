# Data Zone Component

A ReactFlow-based visualization component that displays EHR systems connected to encounter documents with dynamic node-based connections.

## Features

- **6 Dummy EHR Systems**: Nervecentre, Medilogik, Viper, ICE, BigHand, VueExplore
- **Dynamic Encounter Documents**: Renders encounters from `data.json` as document-style nodes
- **Animated Connections**: ReactFlow edges connecting systems to their encounters
- **Interactive Nodes**: Expandable encounter documents with full clinical details
- **Risk Color Coding**: Visual indicators (red/amber/green) for encounter risk levels
- **Zoom & Pan**: Full ReactFlow controls with minimap

## Usage

```tsx
import { DataZone } from "./components/datazone";

<DataZone patientData={patientData} />
```

## Component Structure

### DataZone.tsx
Main container component that:
- Creates ReactFlow nodes for EHR systems and encounters
- Generates edges connecting systems to encounters (round-robin assignment)
- Manages ReactFlow state and interactions

### EHRSystemNode.tsx
Custom ReactFlow node for EHR systems:
- Displays system icon, name, and type
- Shows active status badge
- Source handle for connections

### EncounterDocumentNode.tsx
Custom ReactFlow node for encounter documents:
- Google Docs/Word-style formatting
- Expandable content with "Show More/Less" toggle
- Risk-based color coding in header
- Displays: chief complaint, HPI, assessment, plan, follow-up
- Target handle for connections

## Data Structure

Expects `patientData` object with:
```typescript
{
  patient: { name, sex, age_at_first_encounter },
  encounters: [
    {
      encounter_no: number,
      meta: { date_time, visit_type, provider, ui_risk_color },
      reason_for_visit: string,
      chief_complaint: string,
      hpi: string,
      assessment: { impression },
      plan: { investigations, management },
      follow_up: { instructions }
    }
  ]
}
```

## Storybook

View the component in Storybook:
```bash
npm run storybook
```

Navigate to: Components > DataZone

## Integration with Existing Canvas

The Data Zone can be integrated into your existing Canvas component as a board item or zone. The ReactFlow nodes and connections work independently of your SVG-based canvas system.
