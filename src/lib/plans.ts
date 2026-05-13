export const FREE_LIMITS = {
  properties: 1,
  roommates: 3,
  recurringBills: 5,
  photos: 20,
  pdfExports: 1,
};

export const PRO_PLAN = {
  monthly: 5.99,
  yearly: 29.99,
};

export function isProPlan(status?: string | null, plan?: string | null) {
  return plan === "PRO" || status === "ACTIVE" || status === "PRO_PREVIEW";
}
