import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const summaries = await prisma.summary.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(summaries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const summary = await prisma.summary.create({
    data: {
      name: body.name || "",
      content: body.content || "",
      isDefault: body.isDefault || false,
    },
  });
  return NextResponse.json(summary);
}
