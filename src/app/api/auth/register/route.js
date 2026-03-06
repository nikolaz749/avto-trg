import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

function normalizeUsername(input) {
  // po kmečko: male črke, brez presledkov, samo črke/številke/_/.
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const username = normalizeUsername(body.username);
    const phoneRaw = String(body.phone || "").trim();
    const phone = phoneRaw.length ? phoneRaw : null;

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email in geslo (min 6 znakov) sta obvezna." },
        { status: 400 }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Username je obvezen (min 3 znaki, brez presledkov)." },
        { status: 400 }
      );
    }

    // Email unique check
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email je že registriran." }, { status: 400 });
    }

    // Username unique check
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username je že zaseden." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, username, phone },
      select: { id: true, email: true, username: true, phone: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    // Če Prisma vseeno vrže unique error (race condition), ga prijazno vrnemo
    const msg = String(err?.message || "");
    if (msg.includes("Unique constraint failed") && msg.includes("User_username_key")) {
      return NextResponse.json({ error: "Username je že zaseden." }, { status: 400 });
    }
    if (msg.includes("Unique constraint failed") && msg.includes("User_email_key")) {
      return NextResponse.json({ error: "Email je že registriran." }, { status: 400 });
    }

    return NextResponse.json({ error: "Napaka pri registraciji." }, { status: 500 });
  }
}