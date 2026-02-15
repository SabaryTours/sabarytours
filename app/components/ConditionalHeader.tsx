"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAuthPage = authPages.includes(pathname || "");

  if (isAuthPage) {
    return null;
  }

  return <Header />;
}

