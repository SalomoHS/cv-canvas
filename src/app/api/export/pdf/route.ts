import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { CVPDFDocument } from "@/lib/pdf-template";
import React from "react";

export async function POST(request: Request) {
  try {
    const { versionId } = await request.json();
    const [profile, allEntries, version, summaries] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.entry.findMany(),
      prisma.cVVersion.findUnique({ where: { id: versionId } }),
      prisma.summary.findMany(),
    ]);

    if (!profile || !version) {
      return NextResponse.json({ error: "Profile or version not found" }, { status: 404 });
    }

    const data = {
      profile: {
        name: profile.name,
        phone: profile.phone,
        email: profile.email,
        location: profile.location,
        links: profile.links as { label: string; url: string }[],
      },
      entries: allEntries.map((e) => ({
        id: e.id,
        section: e.section,
        subType: e.subType ?? undefined,
        data: e.data as Record<string, unknown>,
      })),
      version: {
        entryIds: version.entryIds as string[],
        sectionOrder: version.sectionOrder as Record<string, string[]>,
        skillOrder: version.skillOrder as string[],
        selectedSummaryId: version.selectedSummaryId,
      },
      summaries: summaries.map((s) => ({
        id: s.id,
        content: s.content,
        isDefault: s.isDefault,
      })),
    };

    const buffer = await renderToBuffer(React.createElement(CVPDFDocument, { data }) as never);
    return new NextResponse(buffer as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${version.name.replace(/\s+/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
