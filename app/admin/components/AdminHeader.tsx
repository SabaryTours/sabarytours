"use client";

import { useEffect, useState } from "react";
import { Menu01Icon, UserCircleIcon, Notification03Icon } from "hugeicons-react";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AdminHeader({ onMenuClick, title = "Dashboard" }: AdminHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/inquiries/stats");
        const data = await res.json();
        if (res.ok) setUnreadCount(data.unread ?? 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="print:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu01Icon size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 font-sans">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <Link href="/admin/inquiries" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Notification03Icon size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5e00] rounded-full ring-2 ring-white"></span>
          )}
        </Link>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-gray-700">Administrator</p>
            <p className="text-xs text-gray-500">Sabary Tours</p>
          </div>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            <UserCircleIcon size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}
