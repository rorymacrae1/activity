import type { Resort } from "@/types/resort";

const BASE_URL = "https://peakwise.app";

export function getResortSchema(resort: Resort) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/resort/${resort.id}`,
    name: resort.name,
    description: resort.content.description,
    image: resort.assets.heroImage || undefined,
    url: `${BASE_URL}/resort/${resort.id}`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: resort.location.lat,
      longitude: resort.location.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: resort.country,
      addressRegion: resort.region,
    },
    priceRange: `€${resort.attributes.averageDailyCost}/day`,
  };
}

export function getResortBreadcrumbs(resort: Resort) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Discover", item: `${BASE_URL}/discover` },
      { "@type": "ListItem", position: 3, name: resort.name, item: `${BASE_URL}/resort/${resort.id}` },
    ],
  };
}
