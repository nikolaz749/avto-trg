import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";

export async function DELETE(req) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Moraš biti prijavljen." },
        { status: 401 }
      );
    }

    // Bulletproof: preberi ID-je iz URL-ja
    const url = new URL(req.url, "http://localhost");
    const parts = url.pathname.split("/");

    const imageId = Number(parts.pop()); // zadnji del
    parts.pop(); // "images"
    const listingId = Number(parts.pop()); // id oglasa

    if (Number.isNaN(listingId) || Number.isNaN(imageId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const image = await prisma.listingImage.findUnique({
      where: { id: imageId },
      include: { listing: true },
    });

    if (!image || image.listingId !== listingId) {
      return NextResponse.json({ error: "Slika ne obstaja." }, { status: 404 });
    }

    if (image.listing.userId !== user.id) {
      return NextResponse.json(
        { error: "Nimaš pravic (ni tvoj oglas)." },
        { status: 403 }
      );
    }

    // 1) Cloudinary delete (če je že pobrisano, ni panike)
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // 2) DB delete
    await prisma.listingImage.delete({ where: { id: imageId } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Napaka na strežniku." },
      { status: 500 }
    );
  }
}