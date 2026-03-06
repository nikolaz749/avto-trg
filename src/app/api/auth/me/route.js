import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";

// GET – vrne trenutno prijavljenega uporabnika
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

// PATCH – posodobi telefon
export async function PATCH(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Moraš biti prijavljen." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const phoneRaw = String(body.phone || "").trim();
  const phone = phoneRaw.length ? phoneRaw : null;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { phone },
    select: { id: true, email: true, username: true, phone: true },
  });

  return NextResponse.json({ user: updated });
}