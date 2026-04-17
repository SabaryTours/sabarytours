"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";
import HappeningsForm from "../components/HappeningsForm";
import { createClient } from "../../../utils/supabase/client";

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditHappeningPage({ params }: PageProps) {
  const [initialData, setInitialData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("now_happenings")
        .select("*")
        .eq("id", params.id)
        .single();
      if (data) setInitialData(data);
      setLoading(false);
    };
    load();
  }, [params.id]);

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
            Edit What&apos;s Happening Card
          </h1>
          <p className="text-gray-500 text-sm font-sans mt-1">
            Update the content, status or YouTube link for this card.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
          Loading...
        </div>
      ) : !initialData ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-sans">
          Card not found.
        </div>
      ) : (
        <HappeningsForm initialData={initialData} />
      )}
    </div>
  );
}

