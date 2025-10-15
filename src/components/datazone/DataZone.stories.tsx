import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import DataZone from "./DataZone";

const meta: Meta<typeof DataZone> = {
  title: "Components/DataZone",
  component: DataZone,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof DataZone>;

// Sample patient data
const samplePatientData = {
  patient: {
    name: "Sarah Miller",
    sex: "Male",
    age_at_first_encounter: 53,
  },
  encounters: [
    {
      encounter_no: 1,
      meta: {
        visit_type: "Outpatient",
        date_time: "2015-08-10T11:00:00",
        provider: {
          name: "Dr. Elizabeth Hayes",
          specialty: "Rheumatology",
        },
        ui_risk_color: "green",
      },
      reason_for_visit: "Initial rheumatology consult",
      chief_complaint: "Bilateral joint pain and swelling.",
      hpi: "53-year-old retired carpenter with 6 months progressive symmetrical small-joint pain/swelling (hands/feet), morning stiffness >60 min, fatigue, limited NSAID relief.",
      assessment: {
        impression: "Seropositive Rheumatoid Arthritis (active)",
      },
      plan: {
        investigations: {
          labs: ["RF", "Anti-CCP", "CBC", "LFTs"],
        },
        management: {
          medications_started: [
            { name: "Methotrexate", dose: "10 mg" },
            { name: "Folic Acid", dose: "5 mg" },
          ],
        },
      },
      follow_up: {
        instructions: ["Return in 3 months", "Monitor labs monthly"],
      },
    },
    {
      encounter_no: 2,
      meta: {
        date_time: "2016-02-20T09:30:00",
        visit_type: "Outpatient",
        provider: {
          name: "Dr. Smith",
          specialty: "General Practice",
        },
        ui_risk_color: "green",
      },
      reason_for_visit: "Routine MTX monitoring",
      hpc_ros: "Good RA control on MTX 10 mg weekly; no side effects.",
      assessment: {
        impression: "Stable RA on MTX",
      },
    },
    {
      encounter_no: 3,
      meta: {
        date_time: "2018-09-05T10:00:00",
        visit_type: "Outpatient",
        provider: {
          name: "Dr. Johnson",
          specialty: "General Practice",
        },
        ui_risk_color: "green",
      },
      reason_for_visit: "Routine review; elevated BP",
      hpc_ros: "Elevated BP readings 145-155/90-95; asymptomatic.",
      assessment: {
        impression: "New essential hypertension; RA stable",
      },
    },
    {
      encounter_no: 4,
      meta: {
        date_time: "2021-03-15T09:00:00",
        visit_type: "Outpatient",
        provider: {
          name: "Dr. Williams",
          specialty: "General Practice",
        },
        ui_risk_color: "green",
      },
      reason_for_visit: "Chronic disease review",
      hpc_ros: "Overall well; RA controlled; BP controlled.",
      assessment: {
        impression: "Stable RA; controlled HTN; mild CKD",
      },
    },
    {
      encounter_no: 5,
      meta: {
        date_time: "2025-06-15T10:30:00",
        visit_type: "Outpatient",
        provider: {
          name: "Dr. Brown",
          specialty: "General Practice",
        },
        ui_risk_color: "amber",
      },
      reason_for_visit: "Sinusitis symptoms",
      chief_complaint: "5 days nasal congestion, facial pain, headache.",
      assessment: {
        impression: "Acute bacterial sinusitis",
      },
      plan: {
        management: {
          medications_started: [
            { name: "Trimethoprim-Sulfamethoxazole", dose: "800/160 mg" },
          ],
        },
      },
    },
    {
      encounter_no: 6,
      meta: {
        visit_type: "ED",
        date_time: "2025-06-21T14:00:00",
        provider: {
          name: "Dr. Sarah Chen",
          specialty: "Emergency Medicine",
        },
        ui_risk_color: "red",
      },
      reason_for_visit: "Severe fatigue, jaundice, confusion",
      chief_complaint: "Severe fatigue, jaundice, epigastric pain, confusion",
      hpi: "63-year-old male with 24h severe fatigue, jaundice, epigastric pain; started TMP-SMX 6 days ago.",
      assessment: {
        impression: "Acute liver injury likely DILI and/or severe MTX toxicity",
      },
      plan: {
        investigations: {
          labs: ["CBC", "LFTs", "MTX level", "Ammonia"],
        },
      },
      follow_up: {
        instructions: ["Admit to ICU/HDU", "Frequent neuro monitoring"],
      },
    },
  ],
};

export const Default: Story = {
  args: {
    patientData: samplePatientData,
  },
  render: (args) => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <DataZone {...args} />
    </div>
  ),
};

export const NoData: Story = {
  args: {
    patientData: null,
  },
  render: (args) => (
    <div style={{ width: "100vw", height: "100vh" }}>
      <DataZone {...args} />
    </div>
  ),
};
