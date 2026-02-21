import AnnouncementForm from "../components/AnnouncementForm";
import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";
import { createClient } from "../../../utils/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const supabase = await createClient();
  const { data: ann } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!ann) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/announcements"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft01Icon size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Edit Announcement</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Update the content or status of the announcement.</p>
        </div>
      </div>

      <AnnouncementForm initialData={ann} />
    </div>
  );
}
