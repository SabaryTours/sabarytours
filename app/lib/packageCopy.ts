const DAY_TOUR_TITLE = "DAY TOUR";

const DAY_TOUR_DESCRIPTION = `See Ghana's top spots in one day: Aburi Gardens,Tetteh Quarshie Cocoa Farm, waterfalls, mountain views & more.

Includes: Pickup, guide, entry fees and transportation.

Ideal for solo travellers, couples, families & friends.`;

type PackageRow = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
};

function isDayTourPackage(pkg: PackageRow): boolean {
  const slug = String(pkg.slug || "").toLowerCase();
  const title = String(pkg.title || "").toLowerCase();

  return (
    slug === "day-tour" ||
    slug === "day-tours" ||
    slug === "replace-this-day-tour" ||
    slug === "city_tour" ||
    title.includes("replace this day tour") ||
    title === "day tour"
  );
}

export function applyPackageCopyOverrides<T extends PackageRow>(pkg: T): T {
  if (!isDayTourPackage(pkg)) return pkg;

  return {
    ...pkg,
    title: DAY_TOUR_TITLE,
    description: DAY_TOUR_DESCRIPTION,
  };
}

export function applyPackageCopyOverridesList<T extends PackageRow>(packages: T[]): T[] {
  return packages.map(applyPackageCopyOverrides);
}
