import BlogForm from "../components/BlogForm";

export default function NewBlogPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Create New Article</h1>
        <p className="text-gray-500 text-sm font-sans mt-1">Write your new blog post using the rich text editor below.</p>
      </div>
      <BlogForm />
    </div>
  );
}
