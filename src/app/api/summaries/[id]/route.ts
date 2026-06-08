import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const summary = await prisma.summary.findUnique({ where: { id } });
  if (!summary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(summary);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.content !== undefined) data.content = body.content;
  if (body.isDefault !== undefined) data.isDefault = body.isDefault;
  const summary = await prisma.summary.update({
    where: { id },
    data,
  });
  return NextResponse.json(summary);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.summary.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
