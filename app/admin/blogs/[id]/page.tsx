import { createClient } from "../../../utils/supabase/server";
import { notFound } from "next/navigation";
import BlogForm from "../components/BlogForm";

interface PageProps {
  params: Promise<{
    id: string;
  }> | {
    id: string;
  };
}

export default async function EditBlogPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  const supabase = await createClient();
  const { data: blog } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!blog) return notFound();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Edit Article</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Update the content for your blog post.</p>
      </div>
      <BlogForm initialData={blog} />
    </div>
  );
}
