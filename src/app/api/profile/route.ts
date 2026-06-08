import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let profile = await prisma.profile.findFirst();
  if (!profile) {
    profile = await prisma.profile.create({
      data: { name: "", phone: "", email: "", location: "", links: [] },
    });
  }
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  let profile = await prisma.profile.findFirst();
  if (profile) {
    profile = await prisma.profile.update({ where: { id: profile.id }, data: body });
  } else {
    profile = await prisma.profile.create({ data: body });
  }
  return NextResponse.json(profile);
}
