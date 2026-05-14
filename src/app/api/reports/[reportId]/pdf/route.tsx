import { NextRequest } from "next/server";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoBox: {
    width: "47%",
    border: "1 solid #dbe2ea",
    padding: 8,
  },
  photo: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    marginBottom: 6,
  },
});

function ReportPdf({ report }: { report: any }) {
  const snapshot = report.snapshot as any;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{report.title}</Text>
          <Text>{snapshot.property.address}</Text>
          <Text>Generated at: {new Date(snapshot.generatedAt).toLocaleString("en-US")}</Text>
          <Text>
            Tenant declaration: This report reflects the property condition observed
            by the tenant household at the time of documentation.
          </Text>
          {report.isWatermarked ? <Text>Free tier preview export</Text> : null}
        </View>

        <View style={styles.section}>
          <Text>Household members</Text>
          {snapshot.members.map((member: any, index: number) => (
            <Text key={`${member.name}-${index}`} style={styles.item}>
              {member.name} {member.email ? `• ${member.email}` : ""}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text>Checklist</Text>
          {snapshot.checklist.map((item: any, index: number) => (
            <Text key={`${item.area}-${item.label}-${index}`} style={styles.item}>
              {item.area} • {item.label} • {item.status}
              {item.note ? ` • ${item.note}` : ""}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text>Issue notes</Text>
          {snapshot.issues.map((issue: any, index: number) => (
            <Text key={`${issue.room}-${index}`} style={styles.item}>
              {issue.room} • {issue.severity} • {issue.body}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text>Photo evidence</Text>
          <View style={styles.photoGrid}>
            {snapshot.photos
              .filter((photo: any) => photo.dataUrl || photo.publicUrl)
              .slice(0, 8)
              .map((photo: any, index: number) => (
                <View key={`${photo.room}-${index}`} style={styles.photoBox}>
                  <Image src={photo.dataUrl || photo.publicUrl} style={styles.photo} />
                  <Text>{photo.room}</Text>
                  <Text>{photo.note || "No note"}</Text>
                </View>
              ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

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

  const pdfBuffer = await renderToBuffer(<ReportPdf report={report} />);
  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${report.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
