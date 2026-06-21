import FaqForm from "../components/FaqForm";
import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "../../../lib/adminAuth";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditFaqPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const supabase = supabaseAdmin;
  const { data: faq } = await supabase
    .from("faqs")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!faq) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/faqs"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft01Icon size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-sans">Edit FAQ</h1>
          <p className="text-gray-500 text-sm font-sans mt-1">Update the question, answer, or section.</p>
        </div>
      </div>

      <FaqForm initialData={faq} />
    </div>
  );
}
