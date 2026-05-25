import { createClient } from "../../../utils/supabase/server";
import { notFound } from "next/navigation";
import TourForm from "../components/TourForm";

interface PageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default async function EditTourPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const { data: tour } = await supabase
    .from('tours')
    .select(`
      *,
      tour_prices(name, amount, currency),
      tour_images(image_url)
    `)
    .eq('id', id)
    .single();

  if (!tour) return notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Edit Tour</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Update the details for {tour.title}.</p>
      </div>
      <TourForm initialData={tour} />
    </div>
  );
}
