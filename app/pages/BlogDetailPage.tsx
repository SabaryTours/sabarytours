import CachedImage from "../components/CachedImage";
import Link from "next/link";
import { type BlogPost } from "../lib/api";
import { getBlogCategoryLabel } from "../lib/blogCategories";
import Footer from "../components/Footer";
import { sanitizePublicHtml } from "../lib/sanitizeHtml";
import SocialMediaLinks from "../components/SocialMediaLinks";
import NewsletterSubscribe from "../components/NewsletterSubscribe";
import BlogPostViewCounter from "../components/BlogPostViewCounter";
import ShareButtons from "../components/ShareButtons";
import BlogComments from "../components/BlogComments";
import { BlogHashtagList } from "../components/BlogHashtag";

interface BlogDetailPageProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

function plainTextToHtml(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, " ").trim()}</p>`)
    .join("");
}

export default function BlogDetailPage({ post, relatedPosts = [] }: BlogDetailPageProps) {
  const articleRelatedPosts = relatedPosts;
  const rawContent = post.content || "";
  const articleHtml = /<[^>]+>/.test(rawContent) ? rawContent : plainTextToHtml(rawContent);
  const sanitizedArticleHtml = sanitizePublicHtml(articleHtml);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Link */}
      <section className="w-full px-2 sm:px-4 md:px-12 pt-7">
        <div className="container mx-auto px-4 sm:px-6">
          <Link 
            href="/blog" 
            className="text-[#0060cc] text-[14px] font-bold leading-[24px] hover:text-[#ff5e00] transition-colors inline-flex items-center gap-2"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Blog posts
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full px-2 sm:px-4 md:px-12 py-7">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl min-w-0">
          {/* Article Title */}
          <h1 
            className="text-[28px] sm:text-[34px] md:text-[40px] font-normal leading-[1.15] text-[#222] uppercase mb-4 wrap-break-word min-w-0 max-w-full"
            style={{
              fontFamily: 'var(--font-unlimited-pie)',
              hyphens: "manual",
            }}
          >
            {post.title}
          </h1>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-[14px] text-[#8e8e8e]">
            {getBlogCategoryLabel(post.category) ? (
              <>
                <span className="rounded-full bg-[#ff5e00] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {getBlogCategoryLabel(post.category)}
                </span>
                <span>•</span>
              </>
            ) : null}
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <BlogPostViewCounter slug={post.slug} initialViews={post.views} />
            {post.comments > 0 && (
              <>
                <span>•</span>
                <span>{post.comments} comment{post.comments !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {post.tags?.length ? (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-sans mb-2">
                Hashtags
              </p>
              <BlogHashtagList tags={post.tags} linkable />
            </div>
          ) : null}

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[#f0f7ff] border border-[#0060cc]/15">
            <div>
              <p className="text-sm font-bold text-[#222] mb-2">Share this article</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <ShareButtons
                  title={post.title}
                  path={`/blog/${post.slug}`}
                  text={`Read this Sabary Tours blog: ${post.title}`}
                />
                <SocialMediaLinks variant="blogInline" />
              </div>
            </div>
            <Link
              href="/packages"
              className="inline-flex justify-center items-center px-5 py-2.5 rounded-full bg-[#ff5e00] text-white text-sm font-bold hover:bg-[#e55500] transition-colors shrink-0"
            >
              Book a tour
            </Link>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
            <CachedImage
              src={post.image}
              alt={post.title}
              fill
              maxWidth={1200}
              className="object-cover"
              priority
            />
          </div>

          {/* Article body — server-rendered HTML for crawlers and readers */}
          {sanitizedArticleHtml ? (
            <div
              className="rich-text-content prose prose-lg max-w-none min-w-0 mb-10 text-[#222] text-[16px] leading-[28px] **:max-w-full [&_img]:h-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: sanitizedArticleHtml }}
            />
          ) : null}

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <NewsletterSubscribe variant="card" />
            <div className="rounded-2xl border border-[#ffdfcc] bg-[#fff7f0] p-6 flex flex-col justify-center text-center md:text-left">
              <h3
                className="text-xl font-bold text-[#222] mb-2 uppercase"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Ready to explore Ghana?
              </h3>
              <p className="text-sm text-gray-600 font-sans mb-4">
                Turn inspiration into adventure — browse tours and book your trip today.
              </p>
              <Link
                href="/packages"
                className="inline-flex justify-center px-6 py-3 rounded-full bg-[#ff5e00] text-white font-bold text-sm hover:bg-[#e55500]"
              >
                Book a tour
              </Link>
            </div>
          </div>

          <BlogComments slug={post.slug} />

          {/* Related Posts */}
          {articleRelatedPosts.length > 0 && (
            <div className="mb-12">
              <h3 className="text-[24px] font-bold text-[#222] mb-6">Related posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articleRelatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl"
                      style={{
                        height: '200px',
                        background: 'linear-gradient(to bottom, #999, #1e1d1d)',
                      }}
                    >
                      <div className="absolute inset-0">
                        <CachedImage
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          maxWidth={480}
                          className="object-cover"
                        />
                      </div>
                      {relatedPost.comments > 0 && (
                        <div 
                          className="absolute top-3 left-3 flex items-center gap-[10px] px-[10px] py-[10px] rounded-[20px]"
                          style={{
                            backdropFilter: 'blur(6px)',
                            backgroundColor: 'rgba(255,255,255,0.72)',
                            border: '0.5px solid white',
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="#222" />
                            </svg>
                            <span className="text-[#222] text-[10px] font-bold leading-none">{relatedPost.comments} comment{relatedPost.comments !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <h4 className="text-[#3e3638] text-[14px] font-bold leading-[24px] wrap-break-word min-w-0">{relatedPost.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}


