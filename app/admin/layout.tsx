import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";
import { createClient } from "../utils/supabase/server";
import { NO_INDEX_ROBOTS } from "../lib/seo/site";
import { isAdminRole, normalizePermissions } from "../lib/adminPermissions";

export const metadata: Metadata = {
  title: "Admin Dashboard - Sabary Tours",
  description: "Sabary Tours Content Management System",
  robots: NO_INDEX_ROBOTS,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, admin_permissions")
    .eq("id", user.id)
    .single();

  if (!isAdminRole(profile?.role)) {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutClient
      role={profile?.role || "admin"}
      permissions={normalizePermissions(profile?.role, profile?.admin_permissions)}
    >
      {children}
    </AdminLayoutClient>
  );
}
