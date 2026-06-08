import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const crates = await prisma.crate.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(crates);
}

export async function POST(request: Request) {
  const body = await request.json();
  const crate = await prisma.crate.create({ data: { name: body.name } });
  return NextResponse.json(crate, { status: 201 });
}
