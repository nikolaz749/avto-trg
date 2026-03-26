import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export async function GET(request) {
  const url = new URL(request.url, "http://localhost");

  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") || 12)));
  const skip = (page - 1) * limit;

  const tip = (url.searchParams.get("tip") || "").trim();
  const q = (url.searchParams.get("q") || "").trim();
  const znamka = (url.searchParams.get("znamka") || "").trim();
  const model = (url.searchParams.get("model") || "").trim();
  const stanje = (url.searchParams.get("stanje") || "").trim();
  const minPriceRaw = (url.searchParams.get("minPrice") || "").trim();
  const maxPriceRaw = (url.searchParams.get("maxPrice") || "").trim();

  const minPrice = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : null;

  const where = {
    ...(tip ? { type: tip } : {}),
    ...(znamka ? { brand: znamka } : {}),
    ...(model ? { model } : {}),
    ...(stanje ? { condition: stanje } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...((minPrice !== null || maxPrice !== null)
      ? {
          price: {
            ...(minPrice !== null && !Number.isNaN(minPrice) ? { gte: minPrice } : {}),
            ...(maxPrice !== null && !Number.isNaN(maxPrice) ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [totalCount, items] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
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

    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "avti");
    const price = Number(formData.get("price"));

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "Price is invalid" }, { status: 400 });
    }

    const files = formData.getAll("images");
    if (!files || files.length < 1) {
      return NextResponse.json({ error: "Dodaj vsaj 1 sliko." }, { status: 400 });
    }
    if (files.length > 10) {
      return NextResponse.json({ error: "Max je 10 slik." }, { status: 400 });
    }

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
        description: String(formData.get("description") || "").trim(),
        condition: String(formData.get("condition") || "").trim(),
        userId: user.id,
      },
    });

    const uploaded = [];
    for (const file of files) {
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