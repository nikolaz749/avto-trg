import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export async function GET(request) {
  const url = new URL(request.url, "http://localhost");

  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") || 12)));

  const skip = (page - 1) * limit;

  const [totalCount, items] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        images: {
          orderBy: { id: "asc" },
          take: 1,
          select: { id: true, url: true },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return NextResponse.json({
    items,
    page,
    limit,
    totalCount,
    totalPages,
  });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Moraš biti prijavljen." }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    // 1) polja
    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "avti");
    const price = Number(formData.get("price"));

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Price is invalid" }, { status: 400 });
    }

    // 2) slike (1..10)
    const files = formData.getAll("images");
    if (!files || files.length < 1) {
      return NextResponse.json({ error: "Dodaj vsaj 1 sliko." }, { status: 400 });
    }
    if (files.length > 10) {
      return NextResponse.json({ error: "Max je 10 slik." }, { status: 400 });
    }

    // 3) najprej naredimo oglas
    const created = await prisma.listing.create({
      data: {
        title,
        type: type === "deli" ? "deli" : "avti",
        price,
        location: String(formData.get("location") || "").trim(),
        year: formData.get("year") ? Number(formData.get("year")) : null,
        km: formData.get("km") ? Number(formData.get("km")) : null,
        fuel: String(formData.get("fuel") || "").trim(),
        brand: String(formData.get("brand") || "").trim(),
        model: String(formData.get("model") || "").trim(),
        condition: String(formData.get("condition") || "").trim(),
        userId: user.id,
      },
    });

    // 4) upload slik + zapis v bazo
    const uploaded = [];
    for (const file of files) {
      // file je Web File
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadToCloudinary(buffer, {
        folder: `avto-trg/listings/${created.id}`,
      });

      uploaded.push({
        url: result.secure_url,
        publicId: result.public_id,
        listingId: created.id,
      });
    }

    await prisma.listingImage.createMany({ data: uploaded });

    // 5) vrnemo oglas z slikami
    const withImages = await prisma.listing.findUnique({
      where: { id: created.id },
      include: { images: true },
    });

    return NextResponse.json(withImages, { status: 201 });
  } catch (e) {
    console.error("POST /api/oglasi error:", e);

    return NextResponse.json(
      { error: `Napaka pri shranjevanju: ${e?.message || "unknown"}` },
      { status: 500 }
    );
  }
}