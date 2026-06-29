"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home01Icon,
  Edit02Icon,
  MapsIcon,
  Message01Icon,
  Logout05Icon,
  Cancel01Icon,
  UserCircleIcon,
  Comment01Icon,
  Invoice01Icon,
  Ticket01Icon,
  Image01Icon,
  Calendar04Icon,
  Mail02Icon,
  Settings02Icon,
} from "hugeicons-react";
import { logout } from "../../lib/authService";
import Image from "next/image";
import type { AdminPermission } from "../../lib/adminPermissions";

const navItems: {
  name: string;
  href: string;
  icon: typeof Home01Icon;
  permission: AdminPermission;
}[] = [
  { name: "Dashboard", href: "/admin", icon: Home01Icon, permission: "dashboard" },
  { name: "Hero Images", href: "/admin/hero", icon: MapsIcon, permission: "content" },
  { name: "Bookings", href: "/admin/bookings", icon: MapsIcon, permission: "bookings" },
  { name: "Gallery", href: "/admin/gallery", icon: Image01Icon, permission: "content" },
  { name: "Upcoming tours plan", href: "/admin/trip-outline", icon: Calendar04Icon, permission: "content" },
  { name: "Messages", href: "/admin/inquiries", icon: Message01Icon, permission: "messages" },
  { name: "Newsletter", href: "/admin/newsletter", icon: Mail02Icon, permission: "marketing" },
  { name: "Invoices", href: "/admin/invoices", icon: Invoice01Icon, permission: "finance" },
  { name: "Vouchers", href: "/admin/vouchers", icon: Ticket01Icon, permission: "finance" },
  { name: "Platform Users", href: "/admin/users", icon: UserCircleIcon, permission: "users" },
  { name: "Admin Team", href: "/admin/settings", icon: Settings02Icon, permission: "settings" },
  { name: "Packages", href: "/admin/packages", icon: MapsIcon, permission: "content" },
  { name: 'Reviews', href: '/admin/reviews', icon: Comment01Icon, permission: "content" },
  { name: "Tours", href: "/admin/tours", icon: MapsIcon, permission: "content" },
  { name: "Blogs", href: "/admin/blogs", icon: Edit02Icon, permission: "content" },
  { name: "Blog Comments", href: "/admin/blog-comments", icon: Comment01Icon, permission: "content" },
  { name: "What's Happening", href: "/admin/happenings", icon: Message01Icon, permission: "marketing" },
  { name: "Announcements", href: "/admin/announcements", icon: Message01Icon, permission: "marketing" },
  { name: "Partners", href: "/admin/partners", icon: Message01Icon, permission: "content" },
  { name: "FAQs", href: "/admin/faqs", icon: Comment01Icon, permission: "content" },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
  permissions: AdminPermission[];
}

export default function AdminSidebar({ isOpen, onClose, role, permissions }: AdminSidebarProps) {
  const pathname = usePathname();
  const allowed = new Set(permissions);
  const visibleItems = role === "owner" || role === "admin"
    ? navItems
    : navItems.filter((item) => allowed.has(item.permission));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-100 z-40 lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar */}
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 py-3 w-64 bg-white border-r border-gray-100 text-black flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo */}
        <div className="flex items-center justify-between h-16 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt="Sabary Tours Logo"
              width={70}
              height={70}
              className="object-contain"
            />
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            // Fix exact match for /admin vs /admin/tours
            const isStrictlyActive = item.href === '/admin' ? pathname === '/admin' : isActive;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-sans text-sm font-medium ${
                  isStrictlyActive 
                    ? "bg-[#ff5e00] text-white" 
                    : "text-black hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors font-sans text-sm font-medium"
          >
            <Logout05Icon size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
