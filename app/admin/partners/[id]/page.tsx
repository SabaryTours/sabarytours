import PartnerForm from "../components/PartnerForm";
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

export default async function EditPartnerPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const supabase = await createClient();
  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!partner) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/partners"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft01Icon size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Edit Partner</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Update partner details and logo.</p>
        </div>
      </div>

      <PartnerForm initialData={partner} />
    </div>
  );
}
