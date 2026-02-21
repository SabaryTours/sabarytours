"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { Cancel01Icon, Notification03Icon } from "hugeicons-react";
import Image from "next/image";
import SafeHTML from "./SafeHTML";

export default function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAnnouncement = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        // Check if user has already dismissed this specific announcement
        const dismissedKey = `dismissed_announcement_${data.id}`;
        if (!localStorage.getItem(dismissedKey)) {
          setAnnouncement(data);
          setIsOpen(true);
        }
      }
    };
    
    checkAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header Ribbon */}
        <div className="bg-[#ff5e00] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Notification03Icon size={24} />
            <span className="font-bold font-sans uppercase tracking-wider">{announcement.type || 'Announcement'}</span>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <Cancel01Icon size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh]">
          {announcement.image_url && (
            <div className="relative w-full h-48 sm:h-64 mb-6 rounded-xl overflow-hidden bg-gray-100">
              <Image 
                src={announcement.image_url} 
                alt="Announcement" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-unlimited-pie)' }}>
            {announcement.title}
          </h2>
          
          <div className="prose max-w-none text-gray-600 font-sans text-sm sm:text-base leading-relaxed">
            <SafeHTML html={announcement.content} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6 flex justify-end">
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 bg-gray-900 text-white font-bold font-sans rounded-xl hover:bg-gray-800 transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
