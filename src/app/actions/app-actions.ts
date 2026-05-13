"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ReportType, SplitMethod } from "@prisma/client";
import exifr from "exifr";
import { prisma } from "@/lib/db";
import {
  canCreateAnotherProperty,
  computeShareBreakdown,
  createPropertyWithDefaults,
  createReportSnapshot,
  createShareLink,
} from "@/lib/app-data";
import { hasResend, hasStripe } from "@/lib/env";
import { sendReportEmail } from "@/lib/email";
import { createCheckoutSession } from "@/lib/payments";
import { storePhotoAsset } from "@/lib/storage";
import { absoluteUrl } from "@/lib/utils";
import { requireCurrentUser } from "@/lib/session";

function parseDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getPropertyMembers(propertyId: string) {
  return prisma.householdMember.findMany({
    where: { propertyId },
    orderBy: { createdAt: "asc" },
  });
}

function getShareConfig(formData: FormData, memberIds: string[]) {
  const config: Record<string, number> = {};
  for (const memberId of memberIds) {
    config[memberId] = parseNumber(formData.get(`share_${memberId}`), 0);
  }
  return config;
}

export async function completeOnboarding(formData: FormData) {
  const user = await requireCurrentUser();
  const canCreate = await canCreateAnotherProperty(user.id);

  if (!canCreate) {
    redirect("/settings/billing?limit=property");
  }

  const property = await createPropertyWithDefaults({
    userId: user.id,
    address: String(formData.get("address") || ""),
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || ""),
    postalCode: String(formData.get("postalCode") || ""),
    leaseStart: parseDate(formData.get("leaseStart")) || new Date(),
    leaseEnd: parseDate(formData.get("leaseEnd")),
    moveInDate: parseDate(formData.get("moveInDate")),
    monthlyRent: parseNumber(formData.get("monthlyRent")),
    securityDepositAmount: parseNumber(formData.get("securityDepositAmount")),
    roommateCount: parseNumber(formData.get("roommateCount"), 1),
    firstGoal: String(formData.get("firstGoal") || "Protect my deposit"),
  });

  revalidatePath("/dashboard");
  redirect(`/properties/${property.id}`);
}

export async function updatePropertyDetails(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");

  await prisma.property.updateMany({
    where: { id: propertyId, ownerId: user.id },
    data: {
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      leaseStart: parseDate(formData.get("leaseStart")) || new Date(),
      leaseEnd: parseDate(formData.get("leaseEnd")),
      moveInDate: parseDate(formData.get("moveInDate")),
      monthlyRent: parseNumber(formData.get("monthlyRent")),
      securityDepositAmount: parseNumber(formData.get("securityDepositAmount")),
      notes: String(formData.get("notes") || ""),
    },
  });

  revalidatePath(`/properties/${propertyId}`);
}

export async function addRoommate(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");

  const property = await prisma.property.findFirstOrThrow({
    where: { id: propertyId, ownerId: user.id },
    include: {
      members: true,
      owner: true,
    },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const isPro = subscription?.plan === "PRO" || subscription?.status === "PRO_PREVIEW";
  if (!isPro && property.members.length >= 3) {
    redirect("/settings/billing?limit=roommates");
  }

  await prisma.householdMember.create({
    data: {
      propertyId,
      name: String(formData.get("name") || "New roommate"),
      email: String(formData.get("email") || "") || null,
      joinedAt: parseDate(formData.get("joinedAt")),
      leftAt: parseDate(formData.get("leftAt")),
      isPlaceholder: true,
      role: "Roommate",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
}

export async function saveRecurringBill(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const members = await getPropertyMembers(propertyId);
  const splitMethod = String(formData.get("splitMethod") || "EQUAL") as SplitMethod;

  const count = await prisma.recurringBill.count({
    where: { propertyId, property: { ownerId: user.id }, active: true },
  });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!(subscription?.plan === "PRO" || subscription?.status === "PRO_PREVIEW") && count >= 5) {
    redirect("/settings/billing?limit=recurring-bills");
  }

  await prisma.recurringBill.create({
    data: {
      propertyId,
      name: String(formData.get("name") || "New bill"),
      category: String(formData.get("category") || "Utility"),
      amount: parseNumber(formData.get("amount")),
      dueDay: parseNumber(formData.get("dueDay"), 1),
      splitMethod,
      shareConfig: getShareConfig(
        formData,
        members.map((member) => member.id),
      ),
    },
  });

  revalidatePath(`/properties/${propertyId}/expenses`);
  revalidatePath("/dashboard");
}

export async function saveExpense(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const members = await getPropertyMembers(propertyId);
  const splitMethod = String(formData.get("splitMethod") || "EQUAL") as SplitMethod;
  const amount = parseNumber(formData.get("amount"));
  const shareConfig = getShareConfig(
    formData,
    members.map((member) => member.id),
  );

  await prisma.expense.create({
    data: {
      propertyId,
      description: String(formData.get("description") || ""),
      category: String(formData.get("category") || "Household"),
      amount,
      paidByMemberId: String(formData.get("paidByMemberId") || "") || null,
      incurredAt: parseDate(formData.get("incurredAt")) || new Date(),
      splitMethod,
      shareBreakdown: computeShareBreakdown(
        amount,
        members.map((member) => ({ id: member.id, name: member.name })),
        splitMethod,
        shareConfig,
      ),
      note: String(formData.get("note") || "") || null,
    },
  });

  revalidatePath(`/properties/${propertyId}/expenses`);
  revalidatePath("/dashboard");
}

export async function saveChecklistItem(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const itemId = String(formData.get("itemId") || "");

  const property = await prisma.property.findFirstOrThrow({
    where: { id: propertyId, ownerId: user.id },
  });

  if (itemId) {
    await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status: String(formData.get("status") || "OK") as any,
        note: String(formData.get("note") || "") || null,
      },
    });
  } else {
    await prisma.checklistItem.create({
      data: {
        propertyId: property.id,
        area: String(formData.get("area") || "Custom"),
        label: String(formData.get("label") || "Custom item"),
        note: String(formData.get("note") || "") || null,
        isCustom: true,
        sortOrder: parseNumber(formData.get("sortOrder"), 999),
      },
    });
  }

  revalidatePath(`/properties/${propertyId}/checklist`);
}

export async function saveIssueNote(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const property = await prisma.property.findFirstOrThrow({
    where: { id: propertyId, ownerId: user.id },
  });

  await prisma.issueNote.create({
    data: {
      propertyId: property.id,
      checklistItemId: String(formData.get("checklistItemId") || "") || null,
      room: String(formData.get("room") || "General"),
      body: String(formData.get("body") || ""),
      severity: String(formData.get("severity") || "MINOR") as any,
    },
  });

  revalidatePath(`/properties/${propertyId}/checklist`);
}

export async function uploadPhoto(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const photoCount = await prisma.photoAsset.count({
    where: {
      propertyId,
      property: { ownerId: user.id },
    },
  });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!(subscription?.plan === "PRO" || subscription?.status === "PRO_PREVIEW") && photoCount >= 20) {
    redirect("/settings/billing?limit=photos");
  }

  const storage = await storePhotoAsset(file);
  const captureDate = parseDate(formData.get("captureTimestamp"));
  let exifTimestamp: Date | null = null;

  try {
    const parsed = await exifr.parse(await file.arrayBuffer(), ["DateTimeOriginal"]);
    const maybeExifDate = parsed?.DateTimeOriginal;
    if (maybeExifDate instanceof Date) {
      exifTimestamp = maybeExifDate;
    }
  } catch {
    exifTimestamp = null;
  }

  await prisma.photoAsset.create({
    data: {
      propertyId,
      checklistItemId: String(formData.get("checklistItemId") || "") || null,
      room: String(formData.get("room") || "General"),
      note: String(formData.get("note") || "") || null,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      storageMode: storage.storageMode,
      storageKey: storage.storageKey,
      publicUrl: storage.publicUrl,
      dataUrl: storage.dataUrl,
      captureTimestamp: captureDate ?? exifTimestamp,
      exifTimestamp,
      reportType: (String(formData.get("reportType") || "MOVE_IN") as ReportType) ?? ReportType.MOVE_IN,
    },
  });

  revalidatePath(`/properties/${propertyId}/checklist`);
}

export async function createReport(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const type = String(formData.get("type") || "MOVE_IN") as ReportType;

  const count = await prisma.report.count({
    where: { propertyId, property: { ownerId: user.id } },
  });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const isPro = subscription?.plan === "PRO" || subscription?.status === "PRO_PREVIEW";

  if (!isPro && count >= 1) {
    redirect("/settings/billing?limit=exports");
  }

  const snapshot = await createReportSnapshot(propertyId);
  const report = await prisma.report.create({
    data: {
      propertyId,
      createdById: user.id,
      type,
      title: `${type === "MOVE_IN" ? "Move-in" : "Move-out"} report`,
      snapshot,
      isWatermarked: !isPro,
    },
  });

  revalidatePath(`/properties/${propertyId}/reports`);
  redirect(`/properties/${propertyId}/reports?created=${report.id}`);
}

export async function createPublicShareLink(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const reportId = String(formData.get("reportId") || "");

  const report = await prisma.report.findFirstOrThrow({
    where: {
      id: reportId,
      propertyId,
      createdById: user.id,
    },
  });

  const link = await createShareLink(propertyId, report.id);
  await prisma.report.update({
    where: { id: report.id },
    data: { shareToken: link.token },
  });

  revalidatePath(`/properties/${propertyId}/reports`);
}

export async function emailReport(formData: FormData) {
  const user = await requireCurrentUser();
  const reportId = String(formData.get("reportId") || "");
  const propertyId = String(formData.get("propertyId") || "");

  const report = await prisma.report.findFirstOrThrow({
    where: {
      id: reportId,
      propertyId,
      createdById: user.id,
    },
  });

  const result = await sendReportEmail({
    to: user.email || "demo@rentready.local",
    subject: `Your ${report.title}`,
    html: `<p>Your renter report is ready.</p><p><a href="${absoluteUrl(`/api/reports/${report.id}/pdf`)}">Download the PDF</a></p>`,
  });

  if (result.delivered) {
    await prisma.report.update({
      where: { id: report.id },
      data: { emailDeliveredAt: new Date() },
    });
  }

  revalidatePath(`/properties/${propertyId}/reports`);
}

export async function startUpgradeCheckout() {
  const user = await requireCurrentUser();

  if (!hasStripe()) {
    await prisma.subscription.upsert({
      where: { id: `sub-${user.id}` },
      update: {
        plan: "PRO",
        status: "PRO_PREVIEW",
        interval: "year",
      },
      create: {
        id: `sub-${user.id}`,
        userId: user.id,
        provider: "LOCAL",
        plan: "PRO",
        status: "PRO_PREVIEW",
        interval: "year",
      },
    });

    revalidatePath("/settings/billing");
    redirect("/settings/billing?mode=local-preview");
  }

  const session = await createCheckoutSession({
    userId: user.id,
    userEmail: user.email,
    successUrl: absoluteUrl("/settings/billing?checkout=success"),
    cancelUrl: absoluteUrl("/settings/billing?checkout=cancelled"),
  });

  if (!session?.url) {
    redirect("/settings/billing?checkout=missing-config");
  }

  redirect(session.url);
}

export async function sendInviteFallback(formData: FormData) {
  const user = await requireCurrentUser();
  const propertyId = String(formData.get("propertyId") || "");
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "Roommate");

  await prisma.householdMember.create({
    data: {
      propertyId,
      name,
      email: email || null,
      isPlaceholder: true,
      role: "Invited roommate",
    },
  });

  revalidatePath(`/properties/${propertyId}`);
}
