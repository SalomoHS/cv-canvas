import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [profile, entries, cvVersions, crates] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.entry.findMany(),
    prisma.cVVersion.findMany(),
    prisma.crate.findMany(),
  ]);
  return NextResponse.json({ profile, entries, cvVersions, crates });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.profile) {
    const existing = await prisma.profile.findFirst();
    if (existing) {
      await prisma.profile.update({ where: { id: existing.id }, data: body.profile });
    } else {
      await prisma.profile.create({ data: body.profile });
    }
  }
  if (body.entries) {
    await prisma.entry.deleteMany();
    for (const entry of body.entries) {
      await prisma.entry.create({ data: entry });
    }
  }
  if (body.cvVersions) {
    await prisma.cVVersion.deleteMany();
    for (const v of body.cvVersions) {
      await prisma.cVVersion.create({ data: v });
    }
  }
  if (body.crates) {
    await prisma.crate.deleteMany();
    for (const c of body.crates) {
      await prisma.crate.create({ data: c });
    }
  }
  return NextResponse.json({ success: true });
}
