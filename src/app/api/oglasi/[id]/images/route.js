import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export const runtime = "nodejs"; // pomembno zaradi Buffer

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Moraš biti prijavljen." },
        { status: 401 }
      );
    }

    // Bulletproof: listingId iz URL-ja
    const url = new URL(req.url, "http://localhost");
    const parts = url.pathname.split("/");

    parts.pop(); // "images"
    const listingId = Number(parts.pop()); // id oglasa

    if (Number.isNaN(listingId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { images: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Oglas ne obstaja." }, { status: 404 });
    }

    if (listing.userId !== user.id) {
      return NextResponse.json(
        { error: "Nimaš pravic (ni tvoj oglas)." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Nisi izbral slik." }, { status: 400 });
    }

    const remaining = 10 - listing.images.length;
    if (remaining <= 0) {
      return NextResponse.json({ error: "Max 10 slik." }, { status: 400 });
    }

    const toUpload = files.slice(0, remaining);

    const newImages = [];
    for (const file of toUpload) {
      const ab = await file.arrayBuffer();
      const buffer = Buffer.from(ab);

      const result = await uploadToCloudinary(buffer, { folder: "avto-trg" });

      newImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        listingId,
      });
    }

    await prisma.listingImage.createMany({ data: newImages });

    const images = await prisma.listingImage.findMany({
      where: { listingId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ images });
  } catch (e) {
    return NextResponse.json(
      { error: "Napaka na strežniku." },
      { status: 500 }
    );
  }
}