import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ids: [] });
  }

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { listingId: true },
  });

  return NextResponse.json({ ids: favs.map((f) => f.listingId) });
}