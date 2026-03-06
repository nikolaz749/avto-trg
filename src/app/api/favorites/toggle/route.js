import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Moraš biti prijavljen." }, { status: 401 });
  }

  const body = await req.json();
  const listingId = Number(body.listingId);

  if (Number.isNaN(listingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });

    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({
    data: {
      userId: user.id,
      listingId,
    },
  });

  return NextResponse.json({ favorited: true });
}