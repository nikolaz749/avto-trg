import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";

function getIdFromRequest(request) {
  const { pathname } = new URL(request.url);
  const rawId = pathname.split("/").pop();
  const id = parseInt(rawId, 10);
  return { rawId, id, pathname };
}

export async function GET(request) {
  const { rawId, id, pathname } = getIdFromRequest(request);

  if (!rawId || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid id", got: rawId, pathname },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
  where: { id },
  include: { 
    images: { orderBy: { id: "asc" } },
    user: {
      select: {
        id: true,
        username: true,
        phone: true,
      },
    },
  },
});

  if (!listing) {
    return NextResponse.json({ error: "Not found", id }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Moraš biti prijavljen." }, { status: 401 });
  }

  const { rawId, id, pathname } = getIdFromRequest(request);

  if (!rawId || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid id", got: rawId, pathname },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return NextResponse.json({ error: "Not found", id }, { status: 404 });
  }

  if (listing.userId !== user.id) {
    return NextResponse.json({ error: "Nimaš pravic (ni tvoj oglas)." }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Moraš biti prijavljen." }, { status: 401 });
  }

  const { rawId, id, pathname } = getIdFromRequest(request);

  if (!rawId || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid id", got: rawId, pathname },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    return NextResponse.json({ error: "Not found", id }, { status: 404 });
  }

  if (listing.userId !== user.id) {
    return NextResponse.json({ error: "Nimaš pravic (ni tvoj oglas)." }, { status: 403 });
  }

  const body = await request.json();
  const allowedStatus = new Set(["ACTIVE", "RESERVED", "SOLD"]);
  const status = allowedStatus.has(body.status) ? body.status : listing.status;

  const title = String(body.title || "").trim();
  const type = body.type === "deli" ? "deli" : "avti";
  const price = Number(body.price);

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (Number.isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Price is invalid" }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      title,
      type,
      price,
      location: String(body.location || "").trim(),
      year: body.year ? Number(body.year) : null,
      km: body.km ? Number(body.km) : null,
      fuel: String(body.fuel || "").trim(),
      brand: String(body.brand || "").trim(),
      model: String(body.model || "").trim(),
      condition: String(body.condition || "").trim(),
      status,
    },
    include: {
      images: { orderBy: { id: "asc" } },  
    },
  });

  return NextResponse.json(updated);
}
