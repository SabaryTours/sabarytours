"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { canAccessAdminPath } from "../lib/adminPermissions";
import type { AdminPermission } from "../lib/adminPermissions";

export default function AdminLayoutClient({
  children,
  role,
  permissions,
}: {
  children: React.ReactNode;
  role: string;
  permissions: AdminPermission[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!canAccessAdminPath(pathname, role, permissions)) {
      router.replace("/admin");
    }
  }, [pathname, permissions, role, router]);

  // Simple title mapper based on pathname
  let pageTitle = "Dashboard";
  if (pathname.includes("/admin/settings")) pageTitle = "Admin Team";
  if (pathname.includes("/admin/users")) pageTitle = "Platform Users";
  if (pathname.includes("/admin/featured-tours")) pageTitle = "Featured Tours";
  if (pathname.includes("/admin/tours")) pageTitle = "Manage Tours";
  if (pathname.includes("/admin/blogs")) pageTitle = "Manage Blogs";
  if (pathname.includes("/admin/reviews")) pageTitle = "Manage Reviews";
  if (pathname.includes("/admin/happenings")) pageTitle = "What's Happening Now";
  if (pathname.includes("/admin/bookings/receipt")) pageTitle = "Payment receipt";
  else if (pathname.includes("/admin/bookings")) pageTitle = "Manage Bookings";
  if (pathname.includes("/admin/gallery")) pageTitle = "Gallery";
  if (pathname.includes("/admin/trip-outline")) pageTitle = "Upcoming tours planner";

  const canViewPage = canAccessAdminPath(pathname, role, permissions);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans print:h-auto print:min-h-0 print:overflow-visible">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        role={role}
        permissions={permissions}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8 print:overflow-visible print:bg-white print:p-6">
          {canViewPage ? children : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center font-sans">
              <p className="text-lg font-semibold text-gray-800">Access restricted</p>
              <p className="text-sm text-gray-500 mt-2">
                Your admin role does not include access to this section.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
