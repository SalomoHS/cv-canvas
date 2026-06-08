import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const version = await prisma.cVVersion.findUnique({ where: { id } });
  if (!version) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(version);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const version = await prisma.cVVersion.update({ where: { id }, data: body });
  return NextResponse.json(version);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.cVVersion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
