export const FEATURED_DOCS = [
  {
    id: "f1",
    tag: "NEW PROTOCOL",
    title: "Updated Safety Protocols",
    description: "Revised guidelines for on-site sanctuary maintenance and guest safety for Q4.",
    publishedAt: "PUBLISHED 2 DAYS AGO",
    buttonText: "Open PDF",
    bgColor: "bg-[#A7705B]",
    textColor: "text-white",
    tagColor: "bg-white/20 text-white",
    btnColor: "bg-white text-slate-900 hover:bg-slate-50"
  },
  {
    id: "f2",
    tag: "OPERATIONAL",
    title: "Holiday Schedule",
    description: "Complete listing of facility hours and employee rotation for the upcoming winter season.",
    publishedAt: "PUBLISHED 5 DAYS AGO",
    buttonText: "View Schedule",
    bgColor: "bg-[#F7F4EF]",
    textColor: "text-slate-900",
    tagColor: "bg-slate-200/60 text-slate-600",
    btnColor: "bg-[#8B5A44] text-white hover:bg-[#7a4c38]"
  },
  {
    id: "f3",
    tag: "BENEFIT GUIDE",
    title: "Wellness Program 2024",
    description: "New mental health support initiatives and fitness reimbursement updates for all staff.",
    publishedAt: "PUBLISHED OCT 12",
    buttonText: "Download",
    bgColor: "bg-[#E6E8E8]",
    textColor: "text-slate-900",
    tagColor: "bg-white text-slate-600 font-bold",
    btnColor: "bg-slate-900 text-white hover:bg-slate-800"
  }
];

export const CATEGORIZED_DOCS = {
  hr: {
    label: "HR & Handbooks",
    items: [
      { id: "hr1", title: "Employee Handbook", subtext: "Version 4.2 • Updated Jan 2024" },
      { id: "hr2", title: "Code of Ethics", subtext: "Core Values & Stewardship Guidelines" },
    ]
  },
  policy: {
    label: "Policy Manuals",
    items: [
      { id: "p1", title: "Privacy & Data Security", subtext: "GDPR & Confidentiality Protocols" },
      { id: "p2", title: "Remote Work Policy", subtext: "Equipment, Hours, & Eligibility" },
      { id: "p3", title: "Expense Reimbursement", subtext: "Receipt Procedures & Limits" },
    ]
  },
  benefits: {
    label: "Benefit Guides",
    items: [
      { id: "b1", title: "Medical & Dental Plan", subtext: "2024 Provider Network & Coverage" },
      { id: "b2", title: "Retirement Savings", subtext: "401(k) Matching & Vesting Info" },
    ]
  }
};

export const ADMIN_REGISTRY = [
  { id: "r1", title: "Standard_Operating_Procedures_V4.pdf", subtitle: "Shared across All Departments", type: "COMPLIANCE", lastModified: "Oct 12, 2023", icon: "pdf" },
  { id: "r2", title: "Staff_Benefit_Manual_2024.docx", subtitle: "Internal HR Personnel Only", type: "HR", lastModified: "Nov 04, 2023", icon: "doc" },
  { id: "r3", title: "Emergency_Action_Plan.pdf", subtitle: "All Locations", type: "SAFETY", lastModified: "Aug 22, 2023", icon: "pdf" },
  { id: "r4", title: "Q3_Financial_Review.xlsx", subtitle: "Executive Leadership Only", type: "FINANCE", lastModified: "Oct 01, 2023", icon: "xls" },
];
