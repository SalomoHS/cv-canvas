import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const versions = await prisma.cVVersion.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(versions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const version = await prisma.cVVersion.create({
    data: {
      name: body.name,
      entryIds: body.entryIds ?? [],
      sectionOrder: body.sectionOrder ?? {},
      skillOrder: body.skillOrder ?? [],
    },
  });
  return NextResponse.json(version, { status: 201 });
}
