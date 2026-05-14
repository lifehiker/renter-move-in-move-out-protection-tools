import {
  ChecklistStatus,
  IssueSeverity,
  Prisma,
  ReportType,
  SplitMethod,
} from "@prisma/client";
import { addMonths, endOfMonth, format, setDate, startOfMonth } from "date-fns";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { FREE_LIMITS, isProPlan } from "@/lib/plans";
import { defaultUtilityCategories, roomOrder } from "@/lib/checklist";

export type ShareEntry = {
  memberId: string;
  name: string;
  amount: number;
  percentage?: number;
};

type ShareConfig = Record<string, number>;

export async function getUserSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUsageSummary(propertyId: string) {
  const [memberCount, recurringBillCount, photoCount, reportCount] = await Promise.all([
    prisma.householdMember.count({ where: { propertyId } }),
    prisma.recurringBill.count({ where: { propertyId, active: true } }),
    prisma.photoAsset.count({ where: { propertyId } }),
    prisma.report.count({ where: { propertyId } }),
  ]);

  return {
    memberCount,
    recurringBillCount,
    photoCount,
    reportCount,
  };
}

export async function getPrimaryPropertyForUser(userId: string) {
  return prisma.property.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPropertyForUser(propertyId: string, userId: string) {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      ownerId: userId,
    },
    include: {
      members: { orderBy: { createdAt: "asc" } },
      recurringBills: { where: { active: true }, orderBy: { dueDay: "asc" } },
      expenses: {
        orderBy: { incurredAt: "desc" },
        take: 10,
      },
      checklistItems: {
        orderBy: [{ area: "asc" }, { sortOrder: "asc" }],
      },
      issueNotes: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      photos: {
        orderBy: { uploadTimestamp: "desc" },
        take: 60,
      },
      reports: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return property;
}

export async function requireOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirstOrThrow({
    where: {
      id: propertyId,
      ownerId: userId,
    },
  });
}

export async function ensureDefaultChecklistItems(propertyId: string) {
  const existingCount = await prisma.checklistItem.count({
    where: { propertyId },
  });

  if (existingCount > 0) {
    return;
  }

  const templates = await prisma.checklistTemplate.findMany({
    orderBy: [{ area: "asc" }, { sortOrder: "asc" }],
  });

  if (templates.length === 0) {
    return;
  }

  await prisma.checklistItem.createMany({
    data: templates.map((template) => ({
      propertyId,
      templateId: template.id,
      area: template.area,
      label: template.label,
      sortOrder: template.sortOrder,
      reportType: ReportType.MOVE_IN,
    })),
  });
}

export function computeShareBreakdown(
  amount: number,
  members: Array<{ id: string; name: string }>,
  splitMethod: SplitMethod,
  shareConfig?: ShareConfig | null,
) {
  if (members.length === 0) {
    return [] as ShareEntry[];
  }

  if (splitMethod === SplitMethod.EQUAL) {
    const share = amount / members.length;
    return members.map((member) => ({
      memberId: member.id,
      name: member.name,
      amount: Number(share.toFixed(2)),
    }));
  }

  if (!shareConfig) {
    return computeShareBreakdown(amount, members, SplitMethod.EQUAL, null);
  }

  if (splitMethod === SplitMethod.FIXED) {
    return members.map((member) => ({
      memberId: member.id,
      name: member.name,
      amount: Number((shareConfig[member.id] || 0).toFixed(2)),
    }));
  }

  return members.map((member) => {
    const percentage = shareConfig[member.id] || 0;
    return {
      memberId: member.id,
      name: member.name,
      percentage,
      amount: Number(((amount * percentage) / 100).toFixed(2)),
    };
  });
}

export async function ensureMonthlyOccurrences(propertyId: string) {
  const bills = await prisma.recurringBill.findMany({
    where: { propertyId, active: true },
  });

  const members = await prisma.householdMember.findMany({
    where: { propertyId },
    orderBy: { createdAt: "asc" },
  });

  const targets = [startOfMonth(new Date()), startOfMonth(addMonths(new Date(), 1))];

  for (const bill of bills) {
    for (const monthDate of targets) {
      const monthKey = format(monthDate, "yyyy-MM");
      const existing = await prisma.billOccurrence.findUnique({
        where: {
          recurringBillId_monthKey: {
            recurringBillId: bill.id,
            monthKey,
          },
        },
      });

      if (existing) {
        continue;
      }

      const dueDate = setDate(monthDate, Math.min(Math.max(bill.dueDay, 1), 28));
      const shares = computeShareBreakdown(
        bill.amount,
        members.map((member) => ({ id: member.id, name: member.name })),
        bill.splitMethod,
        (bill.shareConfig as ShareConfig | null) ?? null,
      );

      await prisma.billOccurrence.create({
        data: {
          propertyId,
          recurringBillId: bill.id,
          monthKey,
          dueDate,
          totalAmount: bill.amount,
          shareBreakdown: shares as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }
}

export async function getUpcomingOccurrences(propertyId: string) {
  await ensureMonthlyOccurrences(propertyId);

  return prisma.billOccurrence.findMany({
    where: {
      propertyId,
      dueDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(addMonths(new Date(), 1)),
      },
    },
    include: {
      recurringBill: true,
    },
    orderBy: { dueDate: "asc" },
    take: 10,
  });
}

export async function getRecentActivity(propertyId: string) {
  const [expenses, issues, reports, photos] = await Promise.all([
    prisma.expense.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.issueNote.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.report.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.photoAsset.findMany({
      where: { propertyId },
      orderBy: { uploadTimestamp: "desc" },
      take: 3,
    }),
  ]);

  return [
    ...expenses.map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      title: expense.description,
      detail: `${expense.category} expense logged`,
      createdAt: expense.createdAt,
    })),
    ...issues.map((issue) => ({
      id: issue.id,
      type: "issue" as const,
      title: issue.room,
      detail: `${issue.severity.toLowerCase()} issue note added`,
      createdAt: issue.createdAt,
    })),
    ...reports.map((report) => ({
      id: report.id,
      type: "report" as const,
      title: report.title,
      detail: `${report.type === "MOVE_IN" ? "Move-in" : "Move-out"} report created`,
      createdAt: report.createdAt,
    })),
    ...photos.map((photo) => ({
      id: photo.id,
      type: "photo" as const,
      title: photo.room,
      detail: `${photo.fileName} uploaded`,
      createdAt: photo.uploadTimestamp,
    })),
  ]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 8);
}

export async function calculateBalances(propertyId: string) {
  const [members, occurrences, expenses] = await Promise.all([
    prisma.householdMember.findMany({
      where: { propertyId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.billOccurrence.findMany({
      where: {
        propertyId,
        dueDate: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
    }),
    prisma.expense.findMany({
      where: { propertyId },
      orderBy: { incurredAt: "desc" },
    }),
  ]);

  const map = new Map<string, { name: string; owes: number; paid: number }>();

  for (const member of members) {
    map.set(member.id, { name: member.name, owes: 0, paid: 0 });
  }

  for (const occurrence of occurrences) {
    const shares = occurrence.shareBreakdown as unknown as ShareEntry[];
    for (const share of shares) {
      const entry = map.get(share.memberId);
      if (entry) {
        entry.owes += share.amount;
      }
    }
  }

  for (const expense of expenses) {
    const shares = expense.shareBreakdown as unknown as ShareEntry[];
    for (const share of shares) {
      const entry = map.get(share.memberId);
      if (entry) {
        entry.owes += share.amount;
      }
    }

    if (expense.paidByMemberId) {
      const payer = map.get(expense.paidByMemberId);
      if (payer) {
        payer.paid += expense.amount;
      }
    }
  }

  return Array.from(map.entries()).map(([memberId, entry]) => ({
    memberId,
    name: entry.name,
    owes: Number(entry.owes.toFixed(2)),
    paid: Number(entry.paid.toFixed(2)),
    net: Number((entry.paid - entry.owes).toFixed(2)),
  }));
}

export async function createPropertyWithDefaults(input: {
  userId: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  leaseStart: Date;
  leaseEnd?: Date | null;
  moveInDate?: Date | null;
  monthlyRent: number;
  securityDepositAmount: number;
  roommateCount: number;
  firstGoal: string;
}) {
  const property = await prisma.property.create({
    data: {
      ownerId: input.userId,
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      leaseStart: input.leaseStart,
      leaseEnd: input.leaseEnd ?? null,
      moveInDate: input.moveInDate ?? null,
      monthlyRent: input.monthlyRent,
      securityDepositAmount: input.securityDepositAmount,
      utilityCategories: defaultUtilityCategories,
      firstGoal: input.firstGoal,
      members: {
        create: [
          {
            name: "You",
            email: undefined,
            isPlaceholder: false,
            role: "Leaseholder",
            joinedAt: input.moveInDate ?? input.leaseStart,
          },
          ...Array.from({ length: Math.max(input.roommateCount - 1, 0) }, (_, index) => ({
            name: `Roommate ${index + 1}`,
            isPlaceholder: true,
            role: "Roommate",
            joinedAt: input.moveInDate ?? input.leaseStart,
          })),
        ],
      },
    },
  });

  await ensureDefaultChecklistItems(property.id);
  await prisma.user.update({
    where: { id: input.userId },
    data: { onboardingChoice: input.firstGoal },
  });

  return property;
}

export async function createReportSnapshot(propertyId: string) {
  const property = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
    include: {
      members: true,
      checklistItems: { orderBy: [{ area: "asc" }, { sortOrder: "asc" }] },
      issueNotes: { orderBy: { createdAt: "desc" } },
      photos: { orderBy: { uploadTimestamp: "desc" }, take: 24 },
    },
  });

  return {
    property: {
      id: property.id,
      address: property.address,
      city: property.city,
      state: property.state,
      postalCode: property.postalCode,
      leaseStart: property.leaseStart.toISOString(),
      leaseEnd: property.leaseEnd?.toISOString() ?? null,
      moveInDate: property.moveInDate?.toISOString() ?? null,
      monthlyRent: property.monthlyRent,
      securityDepositAmount: property.securityDepositAmount,
    },
    generatedAt: new Date().toISOString(),
    members: property.members.map((member) => ({
      name: member.name,
      email: member.email,
    })),
    checklist: property.checklistItems.map((item) => ({
      area: item.area,
      label: item.label,
      status: item.status,
      note: item.note,
    })),
    issues: property.issueNotes.map((issue) => ({
      room: issue.room,
      body: issue.body,
      severity: issue.severity,
      createdAt: issue.createdAt.toISOString(),
    })),
    photos: property.photos.map((photo) => ({
      room: photo.room,
      note: photo.note,
      captureTimestamp: photo.captureTimestamp?.toISOString() ?? null,
      uploadTimestamp: photo.uploadTimestamp.toISOString(),
      dataUrl: photo.dataUrl,
      publicUrl: photo.publicUrl,
    })),
  };
}

export async function createShareLink(propertyId: string, reportId: string) {
  const token = randomUUID();

  return prisma.shareLink.create({
    data: {
      propertyId,
      reportId,
      token,
    },
  });
}

export async function canCreateAnotherProperty(userId: string) {
  const [subscription, propertyCount] = await Promise.all([
    getUserSubscription(userId),
    prisma.property.count({ where: { ownerId: userId } }),
  ]);

  return isProPlan(subscription?.status, subscription?.plan) || propertyCount < FREE_LIMITS.properties;
}

export function groupChecklistByRoom(
  items: Array<{ area: string; label: string; status: ChecklistStatus; note: string | null; id: string }>,
) {
  const grouped = new Map<string, typeof items>();

  for (const room of roomOrder) {
    grouped.set(room, []);
  }

  for (const item of items) {
    const existing = grouped.get(item.area) ?? [];
    existing.push(item);
    grouped.set(item.area, existing);
  }

  return Array.from(grouped.entries()).filter(([, roomItems]) => roomItems.length > 0);
}

export function statusTone(status: ChecklistStatus) {
  switch (status) {
    case ChecklistStatus.OK:
      return "success";
    case ChecklistStatus.DAMAGED:
      return "danger";
    case ChecklistStatus.MISSING:
      return "warning";
    case ChecklistStatus.REVIEW:
      return "neutral";
  }
}

export function severityTone(severity: IssueSeverity) {
  switch (severity) {
    case IssueSeverity.MINOR:
      return "neutral";
    case IssueSeverity.MODERATE:
      return "warning";
    case IssueSeverity.MAJOR:
      return "danger";
  }
}
