import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import type { ReportSnapshot } from "@/lib/report-snapshot";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const shareToken = request.nextUrl.searchParams.get("token");
  const session = await auth();
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!report) {
    return new Response("Report not found", { status: 404 });
  }

  if (shareToken) {
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        reportId,
        token: shareToken,
        revokedAt: null,
      },
    });

    if (!shareLink) {
      return new Response("Share link not found", { status: 404 });
    }
  } else if (session?.user?.id !== report.property.ownerId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const resolvedReport = report;
  const {
    Document,
    Page,
    StyleSheet,
    Text,
    View,
    renderToBuffer,
  } = await import("@react-pdf/renderer");
  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontSize: 11,
      color: "#1f2937",
    },
    title: {
      fontSize: 22,
      marginBottom: 8,
    },
    section: {
      marginBottom: 16,
    },
    item: {
      marginBottom: 6,
    },
    photoGrid: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    photoBox: {
      border: "1 solid #dbe2ea",
      padding: 8,
    },
  });
  const snapshot = resolvedReport.snapshot as unknown as ReportSnapshot;
  const reportPhotos = snapshot.photos.filter(
    (photo) => photo.dataUrl || photo.publicUrl,
  );

  function ReportPdf() {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>{resolvedReport.title}</Text>
            <Text>{snapshot.property.address}</Text>
            <Text>Generated at: {new Date(snapshot.generatedAt).toLocaleString("en-US")}</Text>
            <Text>
              Tenant declaration: This report reflects the property condition observed
              by the tenant household at the time of documentation.
            </Text>
            {resolvedReport.isWatermarked ? <Text>Free tier preview export</Text> : null}
          </View>

          <View style={styles.section}>
            <Text>Household members</Text>
            {snapshot.members.map((member, index: number) => (
              <Text key={`${member.name}-${index}`} style={styles.item}>
                {member.name} {member.email ? `• ${member.email}` : ""}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text>Checklist</Text>
            {snapshot.checklist.map((item, index: number) => (
              <Text key={`${item.area}-${item.label}-${index}`} style={styles.item}>
                {item.area} • {item.label} • {item.status}
                {item.note ? ` • ${item.note}` : ""}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text>Issue notes</Text>
            {snapshot.issues.map((issue, index: number) => (
              <Text key={`${issue.room}-${index}`} style={styles.item}>
                {issue.room} • {issue.severity} • {issue.body}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text>Photo evidence</Text>
            {reportPhotos.length > 0 ? (
              <Text>
                Photo thumbnails are omitted in this server-safe export. Use the shared report
                view for full image previews and keep this PDF as the dispute-ready record of
                rooms, notes, and timestamps.
              </Text>
            ) : null}
            <View style={styles.photoGrid}>
              {reportPhotos.slice(0, 8).map((photo, index: number) => (
                <View key={`${photo.room}-${index}`} style={styles.photoBox}>
                  <Text>{photo.room}</Text>
                  <Text>{photo.note || "No note"}</Text>
                  <Text>
                    Uploaded:{" "}
                    {photo.uploadTimestamp
                      ? new Date(photo.uploadTimestamp).toLocaleString("en-US")
                      : "Unknown"}
                  </Text>
                  {photo.captureTimestamp ? (
                    <Text>
                      Captured: {new Date(photo.captureTimestamp).toLocaleString("en-US")}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }
  const pdfBuffer = await renderToBuffer(<ReportPdf />);

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resolvedReport.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
