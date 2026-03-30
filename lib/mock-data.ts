export type Role = "employee" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department: string;
  title: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "EMP-001",
    name: "Sarah Jenkins",
    email: "sarah@caring.com",
    role: "employee",
    department: "Operations",
    title: "Funeral Director",
  },
  {
    id: "EMP-002",
    name: "Julian H. Sterling",
    email: "julian@caring.com",
    role: "employee",
    department: "Logistics",
    title: "Transfer Specialist",
  },
  {
    id: "MGR-001",
    name: "Elena Moretti",
    email: "elena@caring.com",
    role: "manager",
    department: "Administration",
    title: "Regional Director",
  },
];

export type SubmissionStatus = "draft" | "pending" | "revision-required" | "finalized" | "approved";

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  type: "timesheet" | "transfer" | "incident" | "time-off" | "communication";
  status: SubmissionStatus;
  submitterId: string;
  createdAt: string;
  updatedAt: string;
  data: any; // payload specific to the type
  feedbackThread: Comment[];
}

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-1001",
    type: "timesheet",
    status: "pending",
    submitterId: "EMP-001",
    createdAt: "2026-10-01T17:00:00Z",
    updatedAt: "2026-10-01T17:00:00Z",
    data: {
      date: "2026-10-01",
      start: "09:00",
      end: "17:30",
      lunchHours: 1,
      totalHours: 7.5,
    },
    feedbackThread: [],
  },
  {
    id: "SUB-1002",
    type: "incident",
    status: "revision-required",
    submitterId: "EMP-002",
    createdAt: "2026-10-02T10:15:00Z",
    updatedAt: "2026-10-02T14:20:00Z",
    data: {
      severity: "Moderate",
      context: "During transfer #4092, the gurney wheel locked unexpectedly.",
      personnelInvolved: ["Julian H. Sterling"],
      witnesses: "None",
      narrative: "Wheel mechanism jammed upon exiting the hospital loading bay. Required manual lifting.",
      certified: true,
    },
    feedbackThread: [
      {
        id: "CMT-1",
        authorId: "MGR-001",
        content: "Julian, please add the specific hospital name to the narrative before I can approve this.",
        createdAt: "2026-10-02T14:20:00Z",
      }
    ],
  },
  {
    id: "SUB-1003",
    type: "transfer",
    status: "approved",
    submitterId: "EMP-001",
    createdAt: "2026-09-28T08:00:00Z",
    updatedAt: "2026-09-29T09:00:00Z",
    data: {
      decedentName: "John Doe",
      pickupLocation: "County General Hospital",
      personnel: "Sarah Jenkins, Michael T.",
      requiresME: true,
      meCaseNumber: "ME-2026-892",
      odometerStart: 45012,
      odometerEnd: 45038,
    },
    feedbackThread: [],
  }
];

export interface Document {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  modifiedAt: string;
  sharedWith: "all" | "managers" | "specific";
}

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "DOC-001",
    name: "2024 Stewardship & Ethics Handbook.pdf",
    type: "pdf",
    sizeBytes: 4500000,
    modifiedAt: "2026-01-15T09:00:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-002",
    name: "Q3 Operational Report.xlsx",
    type: "xlsx",
    sizeBytes: 1250000,
    modifiedAt: "2026-10-01T14:30:00Z",
    sharedWith: "managers",
  },
  {
    id: "DOC-003",
    name: "Facility Maintenance Contract - Oct.docx",
    type: "docx",
    sizeBytes: 850000,
    modifiedAt: "2026-09-25T11:15:00Z",
    sharedWith: "managers",
  }
];

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  roleType: "lead" | "transfer" | "cremation" | "support";
  isUrgent?: boolean;
}

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  {
    id: "SCH-001",
    date: "2026-10-02",
    userId: "EMP-001",
    roleType: "lead",
  },
  {
    id: "SCH-002",
    date: "2026-10-02",
    userId: "EMP-002",
    roleType: "transfer",
  },
  {
    id: "SCH-003",
    date: "2026-10-03",
    userId: "EMP-001",
    roleType: "support",
  }
];
