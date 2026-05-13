export const defaultUtilityCategories = [
  "Electricity",
  "Gas",
  "Internet",
  "Water",
];

export const roomOrder = [
  "Entry",
  "Living room",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Windows",
  "Walls",
  "Floors",
  "Appliances",
];

export const checklistStatuses = [
  { value: "OK", label: "OK" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "MISSING", label: "Missing" },
  { value: "REVIEW", label: "Needs review" },
] as const;

export const issueSeverities = [
  { value: "MINOR", label: "Minor" },
  { value: "MODERATE", label: "Moderate" },
  { value: "MAJOR", label: "Major" },
] as const;
