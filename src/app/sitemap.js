import { prisma } from "@/app/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://avto-trg-production.up.railway.app";

  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/oglasi`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/objavi`,
      lastModified: new Date(),
    },
  ];

  const listingPages = listings.map((listing) => ({
    url: `${baseUrl}/oglasi/${listing.id}`,
    lastModified: listing.updatedAt || listing.createdAt || new Date(),
  }));

  return [...staticPages, ...listingPages];
}