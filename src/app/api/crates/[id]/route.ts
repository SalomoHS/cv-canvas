import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const crate = await prisma.crate.update({ where: { id }, data: body });
  return NextResponse.json(crate);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.crate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
