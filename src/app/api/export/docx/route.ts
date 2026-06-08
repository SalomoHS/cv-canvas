import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDocx } from "@/lib/docx-template";

export async function POST(request: Request) {
  try {
    const { versionId } = await request.json();
    const [profile, allEntries, version] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.entry.findMany(),
      prisma.cVVersion.findUnique({ where: { id: versionId } }),
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
        summary: profile.summary,
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
      },
    };

    const uint8 = await generateDocx(data);
    const buffer = Buffer.from(uint8);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${version.name.replace(/\s+/g, "_")}.docx"`,
      },
    });
  } catch (error) {
    console.error("DOCX export error:", error);
    return NextResponse.json({ error: "Failed to generate DOCX" }, { status: 500 });
  }
}
