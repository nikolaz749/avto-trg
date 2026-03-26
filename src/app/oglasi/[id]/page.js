import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/currentUser";
import OglasDetailClient from "./OglasDetailClient";

function buildTitle(oglas) {
  const parts = [
    oglas.brand,
    oglas.model,
    oglas.year,
    oglas.price ? `${Number(oglas.price).toLocaleString("sl-SI")} €` : null,
  ].filter(Boolean);

  return parts.length > 0
    ? `${parts.join(" – ")} | Avto Trg`
    : `${oglas.title || "Oglas"} | Avto Trg`;
}

function buildDescription(oglas) {
  const parts = [
    oglas.title,
    oglas.location,
    oglas.year ? `Letnik ${oglas.year}` : null,
    oglas.km ? `${Number(oglas.km).toLocaleString("sl-SI")} km` : null,
    oglas.fuel || null,
    oglas.condition || null,
  ].filter(Boolean);

  return parts.join(" • ");
}

async function getOglas(id) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  return prisma.listing.findUnique({
    where: { id: numericId },
    include: {
      images: {
        orderBy: { id: "asc" },
      },
      user: {
        select: {
          id: true,
          username: true,
          phone: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const oglas = await getOglas(params.id);

  if (!oglas) {
    return {
      title: "Oglas ne obstaja | Avto Trg",
      description: "Iskani oglas ne obstaja.",
    };
  }

  const title = buildTitle(oglas);
  const description = buildDescription(oglas);
  const url = `https://avto-trg-production.up.railway.app/oglasi/${oglas.id}`;
  const image = oglas.images?.[0]?.url || null;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Avto Trg",
      locale: "sl_SI",
      type: "website",
      images: image ? [{ url: image }] : [],
    },
  };
}

export default async function OglasDetailPage({ params }) {
  const oglas = await getOglas(params.id);

  if (!oglas) {
    notFound();
  }

  const user = await getCurrentUser();

  return <OglasDetailClient oglas={oglas} user={user} />;
}