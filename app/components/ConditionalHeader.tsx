"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname || "");
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return null;
  }

  return <Header />;
}

