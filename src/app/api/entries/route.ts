import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.entry.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const entry = await prisma.entry.create({
    data: {
      section: body.section,
      subType: body.subType ?? null,
      status: body.status ?? "library",
      data: body.data ?? {},
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
