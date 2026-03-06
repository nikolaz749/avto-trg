import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function getCurrentUser() {
  // Next 16: cookies() je async
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const userId = Number(payload.sub);
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    return user;
  } catch {
    return null;
  }
}