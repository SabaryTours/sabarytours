"use client";

import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Simple title mapper based on pathname
  let pageTitle = "Dashboard";
  if (pathname.includes("/admin/tours")) pageTitle = "Manage Tours";
  if (pathname.includes("/admin/blogs")) pageTitle = "Manage Blogs";
  if (pathname.includes("/admin/reviews")) pageTitle = "Manage Reviews";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
