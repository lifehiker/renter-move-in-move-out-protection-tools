export type ReportSnapshot = {
  property: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    leaseStart: string;
    leaseEnd: string | null;
    moveInDate: string | null;
    monthlyRent: number;
    securityDepositAmount: number;
  };
  generatedAt: string;
  members: Array<{
    name: string;
    email: string | null;
  }>;
  checklist: Array<{
    area: string;
    label: string;
    status: string;
    note: string | null;
  }>;
  issues: Array<{
    room: string;
    body: string;
    severity: string;
    createdAt: string;
  }>;
  photos: Array<{
    room: string;
    note: string | null;
    captureTimestamp: string | null;
    uploadTimestamp: string;
    dataUrl: string | null;
    publicUrl: string | null;
  }>;
};
