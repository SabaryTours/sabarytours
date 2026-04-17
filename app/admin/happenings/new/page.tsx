"use client";

import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";
import HappeningsForm from "../components/HappeningsForm";

export default function NewHappeningPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/happenings"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft01Icon size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">
            Add What&apos;s Happening Card
          </h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Create a new live card with a name, status, image and optional YouTube link.
          </p>
        </div>
      </div>

      <HappeningsForm />
    </div>
  );
}

