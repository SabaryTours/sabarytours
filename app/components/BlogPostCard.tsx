import CachedImage from "./CachedImage";
import Link from "next/link";
import { EyeIcon, Message01Icon } from "hugeicons-react";
import ShareButtons from "./ShareButtons";
import { getBlogCategoryLabel } from "../lib/blogCategories";
import { BlogHashtagList } from "./BlogHashtag";

export type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  image: string;
  views: number;
  comments: number;
  tags: string[];
  category?: string | null;
  excerpt?: string;
};

type BlogPostCardProps = {
  post: BlogCardPost;
  compact?: boolean;
};

export default function BlogPostCard({ post, compact = false }: BlogPostCardProps) {
  const categoryLabel = getBlogCategoryLabel(post.category);

  return (
    <article className="flex flex-col gap-3" style={{ width: compact ? "100%" : "350px", maxWidth: "100%" }}>
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      >
        <div
          className="relative overflow-hidden rounded-2xl group"
          style={{
            height: compact ? "220px" : "297.811px",
            background: "linear-gradient(to bottom, #999, #1e1d1d)",
          }}
        >
          <div className="absolute inset-0">
            <CachedImage
              src={post.image}
              alt={post.title}
              fill
              maxWidth={700}
              sizes="(max-width: 640px) 90vw, 350px"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          {categoryLabel ? (
            <span className="absolute top-3 left-3 rounded-full bg-[#ff5e00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white font-sans">
              {categoryLabel}
            </span>
          ) : null}

          {post.comments > 0 && (
            <div
              className="absolute top-3 right-3 flex items-center gap-[10px] px-[10px] py-[5px] rounded-[20px]"
              style={{
                backdropFilter: "blur(6px)",
                backgroundColor: "rgba(255,255,255,0.72)",
                border: "0.5px solid white",
              }}
            >
              <div className="flex items-center gap-1">
                <Message01Icon className="w-4 h-4 text-[#222]" />
                <span className="text-[#222] text-[12px] font-bold leading-none">
                  {post.comments} comment{post.comments !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        <h3
          className="text-[#222] text-[16px] font-extrabold leading-[28px] break-normal"
          style={{ hyphens: "manual" }}
        >
          {post.title}
        </h3>
      </Link>

      {post.excerpt ? (
        <p className="text-sm text-gray-600 font-sans line-clamp-2 -mt-1">{post.excerpt}</p>
      ) : null}

      {post.views > 0 && (
        <p className="text-xs text-gray-500 font-sans -mt-1 flex items-center gap-1">
          <EyeIcon className="w-3.5 h-3.5" />
          {post.views} view{post.views !== 1 ? "s" : ""}
        </p>
      )}

      {post.tags?.length ? <BlogHashtagList tags={post.tags} limit={3} /> : null}

      <ShareButtons
        title={post.title}
        path={`/blog/${post.slug}`}
        text={`Read this Sabary Tours blog: ${post.title}`}
        compact
      />
    </article>
  );
}
