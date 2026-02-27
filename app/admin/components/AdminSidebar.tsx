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
  Comment01Icon, // NEW
  Invoice01Icon, // NEW
  Ticket01Icon // NEW
} from "hugeicons-react";
import { logout } from "../../lib/authService";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home01Icon },
  { name: "Hero Images", href: "/admin/hero", icon: MapsIcon }, // NEW
  { name: "Bookings", href: "/admin/bookings", icon: MapsIcon },
  { name: "Inquiries", href: "/admin/inquiries", icon: Message01Icon },
  { name: "Invoices", href: "/admin/invoices", icon: Invoice01Icon }, // NEW
  { name: "Vouchers", href: "/admin/vouchers", icon: Ticket01Icon },
  { name: "Users", href: "/admin/users", icon: UserCircleIcon },
  { name: "Packages", href: "/admin/packages", icon: MapsIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: Comment01Icon },
  { name: "Tours", href: "/admin/tours", icon: MapsIcon },
  { name: "Blogs", href: "/admin/blogs", icon: Edit02Icon },
  { name: "Announcements", href: "/admin/announcements", icon: Message01Icon },
  { name: "Partners", href: "/admin/partners", icon: Message01Icon },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-100 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 py-3 w-64 bg-white border-r border-gray-100 text-black flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
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
          {navItems.map((item) => {
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
