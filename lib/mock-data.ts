export type Role = "employee" | "manager" | "admin";

export const MANAGER_ROLES = [
  "LOCATION MANAGER - MB",
  "LOCATION MANAGER - CSG",
  "LOCATION MANAGER - EVG",
  "LOCATION MANAGER - EDENS",
  "TRANSFER MANAGER",
  "OHS MANAGER",
  "REGIONAL MANAGER"
];

export const EMPLOYEE_ROLES = [
  "FUNERAL DIRECTOR",
  "TRANSFER PERSONNEL",
  "PART TIME EMPLOYEE",
  "SUPPORT STAFF"
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  assignedRoles: string[];
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
    assignedRoles: ["FUNERAL DIRECTOR"],
    department: "Operations",
    title: "Funeral Director",
  },
  {
    id: "EMP-002",
    name: "Julian H. Sterling",
    email: "julian@caring.com",
    role: "employee",
    assignedRoles: ["TRANSFER PERSONNEL"],
    department: "Logistics",
    title: "Transfer Specialist",
  },
  {
    id: "MGR-001",
    name: "Elena Moretti",
    email: "elena@caring.com",
    role: "manager",
    assignedRoles: ["REGIONAL MANAGER", "OHS MANAGER"],
    department: "Administration",
    title: "Regional Director",
  },
  {
    id: "ADM-001",
    name: "Admin User",
    email: "admin@caring.com",
    role: "admin",
    assignedRoles: [],
    department: "IT",
    title: "System Administrator",
  }
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
  },
  {
    id: "SUB-1004",
    type: "time-off",
    status: "approved",
    submitterId: "EMP-002",
    createdAt: "2026-09-15T08:00:00Z",
    updatedAt: "2026-09-16T09:00:00Z",
    data: {
      dates: ["2026-10-02"],
      reason: "Personal Day",
    },
    feedbackThread: [],
  }
];

export interface Document {
  id: string;
  name: string;
  type: string;
  category: "POLICY MANUALS" | "STANDARDS OF PRACTICE" | "CORPORATE DOCUMENTS" | "PRINTABLE FORMS";
  sizeBytes: number;
  modifiedAt: string;
  sharedWith: "all" | "managers" | "specific";
}

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: "DOC-001",
    name: "2026 Stewardship & Ethics Handbook.pdf",
    type: "pdf",
    category: "POLICY MANUALS",
    sizeBytes: 4500000,
    modifiedAt: "2026-01-15T09:00:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-004",
    name: "Employee Benefits Guide.pdf",
    type: "pdf",
    category: "POLICY MANUALS",
    sizeBytes: 2500000,
    modifiedAt: "2025-11-20T08:00:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-005",
    name: "Transfer Operations Protocol.docx",
    type: "docx",
    category: "STANDARDS OF PRACTICE",
    sizeBytes: 1500000,
    modifiedAt: "2026-02-12T10:30:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-006",
    name: "Sanitation and OSHA Compliance.pdf",
    type: "pdf",
    category: "STANDARDS OF PRACTICE",
    sizeBytes: 3100000,
    modifiedAt: "2026-03-01T14:15:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-002",
    name: "Q3 Operational Report.xlsx",
    type: "xlsx",
    category: "CORPORATE DOCUMENTS",
    sizeBytes: 1250000,
    modifiedAt: "2026-10-01T14:30:00Z",
    sharedWith: "managers",
  },
  {
    id: "DOC-003",
    name: "Facility Maintenance Contract - Oct.docx",
    type: "docx",
    category: "CORPORATE DOCUMENTS",
    sizeBytes: 850000,
    modifiedAt: "2026-09-25T11:15:00Z",
    sharedWith: "managers",
  },
  {
    id: "DOC-007",
    name: "PTO Request Form.pdf",
    type: "pdf",
    category: "PRINTABLE FORMS",
    sizeBytes: 420000,
    modifiedAt: "2025-08-10T09:45:00Z",
    sharedWith: "all",
  },
  {
    id: "DOC-008",
    name: "Incident Report Template.docx",
    type: "docx",
    category: "PRINTABLE FORMS",
    sizeBytes: 210000,
    modifiedAt: "2026-01-05T16:00:00Z",
    sharedWith: "all",
  }
];

export type ScheduleRole = "Lead Director - MB" | "Lead Director - CSG" | "Lead Director - EVG" | "Lead Director - EDENS" | "TRANSFERS - FIRST" | "TRANSFERS - SECOND" | "TRANSFERS - BACK UP" | "CREMATIONS" | "PREPS" | "ME RUN";

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  userId: string;
  roleType: ScheduleRole;
  isUrgent?: boolean;
}

export const MOCK_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  {
    id: "SCH-001",
    date: "2026-10-02",
    userId: "EMP-001",
    roleType: "Lead Director - MB",
  },
  {
    id: "SCH-002",
    date: "2026-10-02",
    userId: "MGR-001",
    roleType: "TRANSFERS - FIRST",
  },
  {
    id: "SCH-003",
    date: "2026-10-03",
    userId: "EMP-001",
    roleType: "CREMATIONS",
  }
];
