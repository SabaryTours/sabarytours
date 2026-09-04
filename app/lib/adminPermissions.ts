export const ADMIN_PERMISSIONS = [
  "dashboard",
  "bookings",
  "content",
  "messages",
  "marketing",
  "finance",
  "users",
  "settings",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_ROLE_OPTIONS = [
  "owner",
  "admin",
  "operations",
  "content",
  "support",
  "finance",
] as const;

export type AdminRole = (typeof ADMIN_ROLE_OPTIONS)[number];

export const ADMIN_ROLE_PRESETS: Record<string, AdminPermission[]> = {
  owner: [...ADMIN_PERMISSIONS],
  admin: [...ADMIN_PERMISSIONS],
  operations: ["dashboard", "bookings", "messages", "finance"],
  content: ["dashboard", "content", "marketing"],
  support: ["dashboard", "messages", "bookings"],
  finance: ["dashboard", "finance", "bookings"],
};

export const ADMIN_ROUTE_PERMISSIONS: { prefix: string; permission: AdminPermission }[] = [
  { prefix: "/admin/settings", permission: "settings" },
  { prefix: "/admin/users", permission: "users" },
  { prefix: "/admin/bookings", permission: "bookings" },
  { prefix: "/admin/invoices", permission: "finance" },
  { prefix: "/admin/vouchers", permission: "finance" },
  { prefix: "/admin/inquiries", permission: "messages" },
  { prefix: "/admin/newsletter", permission: "marketing" },
  { prefix: "/admin/happenings", permission: "marketing" },
  { prefix: "/admin/announcements", permission: "marketing" },
  { prefix: "/admin/hero", permission: "content" },
  { prefix: "/admin/gallery", permission: "content" },
  { prefix: "/admin/trip-outline", permission: "content" },
  { prefix: "/admin/packages", permission: "content" },
  { prefix: "/admin/reviews", permission: "content" },
  { prefix: "/admin/tours", permission: "content" },
  { prefix: "/admin/featured-tours", permission: "content" },
  { prefix: "/admin/blogs", permission: "content" },
  { prefix: "/admin/blog-comments", permission: "content" },
  { prefix: "/admin/partners", permission: "content" },
  { prefix: "/admin/faqs", permission: "content" },
  { prefix: "/admin", permission: "dashboard" },
];

export function normalizeAdminRole(role: string | null | undefined) {
  return (role || "").trim().toLowerCase();
}

export function isOwnerRole(role: string | null | undefined) {
  return normalizeAdminRole(role) === "owner";
}

export function isFullAdminRole(role: string | null | undefined) {
  const normalizedRole = normalizeAdminRole(role);
  return normalizedRole === "owner" || normalizedRole === "admin";
}

export function normalizePermissions(
  role: string | null | undefined,
  raw: unknown,
): AdminPermission[] {
  const normalizedRole = normalizeAdminRole(role);
  if (normalizedRole === "admin") return ADMIN_ROLE_PRESETS.admin;
  if (normalizedRole === "owner") return ADMIN_ROLE_PRESETS.owner;

  if (Array.isArray(raw) && raw.length > 0) {
    const allowed = new Set(ADMIN_PERMISSIONS);
    return raw.filter((item): item is AdminPermission => (
      typeof item === "string" && allowed.has(item as AdminPermission)
    ));
  }

  return ADMIN_ROLE_PRESETS[normalizedRole] || [];
}

export function isAdminRole(role: string | null | undefined) {
  return normalizePermissions(role, null).length > 0;
}

export function isCustomerRole(role: string | null | undefined) {
  return !isAdminRole(role);
}

export function getRequiredPermissionForPath(pathname: string): AdminPermission | null {
  const match = ADMIN_ROUTE_PERMISSIONS.find((route) => {
    if (route.prefix === "/admin") return pathname === "/admin";
    return pathname === route.prefix || pathname.startsWith(`${route.prefix}/`);
  });
  return match?.permission ?? null;
}

export function canAccessAdminPath(
  pathname: string,
  role: string,
  permissions: AdminPermission[],
): boolean {
  const required = getRequiredPermissionForPath(pathname);
  if (!required) return true;
  const normalizedRole = normalizeAdminRole(role);
  if (normalizedRole === "owner" || normalizedRole === "admin") return true;
  return permissions.includes(required);
}
