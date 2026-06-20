import Image from "next/image";
import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";
import { getBlogCategoryLabel } from "../lib/blogCategories";
import type { BlogCardPost } from "./BlogPostCard";

type BlogFeaturedArticleProps = {
  post: BlogCardPost;
};

export default function BlogFeaturedArticle({ post }: BlogFeaturedArticleProps) {
  const categoryLabel = getBlogCategoryLabel(post.category);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded-full bg-[#ff5e00] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white font-sans">
          Article of the week
        </span>
        {categoryLabel ? (
          <span className="text-sm font-bold text-[#0060cc] font-sans">{categoryLabel}</span>
        ) : null}
      </div>

      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 lg:grid-cols-2 gap-6 rounded-3xl overflow-hidden border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 sm:p-6 hover:shadow-lg transition-shadow"
      >
        <div className="relative overflow-hidden rounded-2xl min-h-[240px] lg:min-h-[320px]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex flex-col justify-center gap-4 font-sans">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#222] leading-tight group-hover:text-[#ff5e00] transition-colors"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            {post.title}
          </h2>
          {post.excerpt ? (
            <p className="text-gray-600 leading-relaxed line-clamp-4">{post.excerpt}</p>
          ) : null}
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#0060cc] group-hover:text-[#ff5e00] transition-colors">
            Read the featured story
            <ArrowRight01Icon className="w-4 h-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
