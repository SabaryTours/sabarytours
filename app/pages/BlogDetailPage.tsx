import Image from "next/image";
import Link from "next/link";
import { type BlogPost, getRelatedPosts } from "../data/blog";
import Footer from "../components/Footer";
import SafeHTML from "../components/SafeHTML";
import SocialMediaLinks from "../components/SocialMediaLinks";

interface BlogDetailPageProps {
  post: BlogPost;
}

function plainTextToHtml(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, " ").trim()}</p>`)
    .join("");
}

export default function BlogDetailPage({ post }: BlogDetailPageProps) {
  const relatedPosts = getRelatedPosts(post.slug, 3);
  const rawContent = post.content || "";
  const articleHtml = /<[^>]+>/.test(rawContent) ? rawContent : plainTextToHtml(rawContent);

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
            className="text-[28px] sm:text-[34px] md:text-[40px] font-normal leading-[1.15] text-[#222] uppercase mb-4 break-words min-w-0 max-w-full"
            style={{
              fontFamily: 'var(--font-unlimited-pie)',
              hyphens: "manual",
            }}
          >
            {post.title}
          </h1>

          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-[14px] text-[#8e8e8e]">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            {post.comments > 0 && (
              <>
                <span>•</span>
                <span>{post.comments} comment{post.comments !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Social links — set NEXT_PUBLIC_SOCIAL_* in .env.local; WhatsApp defaults */}
          <div className="mb-8 flex items-center">
            <SocialMediaLinks variant="blogInline" />
          </div>

          {/* Main Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Content */}
          <div className="rich-text-content prose prose-lg max-w-none min-w-0 mb-12 [&_*]:max-w-full [&_img]:h-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_pre]:max-w-full [&_pre]:overflow-x-auto">
            <SafeHTML
              html={articleHtml}
              className="text-[#222] text-[16px] leading-[28px] [&_p]:mb-4 [&_p:last-child]:mb-0"
            />
          </div>

          {/* Comment Section */}
          <div className="mb-12">
            <h3 className="text-[24px] font-bold text-[#222] mb-2">Leave a comment</h3>
            <p className="text-[#8e8e8e] text-[14px] mb-6">Your email address will not be published.</p>
            
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
                />
              </div>
              <textarea
                placeholder="Type your comment..."
                rows={6}
                className="w-full px-4 py-3 border border-[#e3e3e3] rounded-lg focus:outline-none focus:border-[#ff5e00] text-[14px] leading-[24px] text-[#222] placeholder:text-[#222] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px]"
              />
              <button
                type="submit"
                className="bg-[#ff5e00] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e55500] transition-colors"
              >
                Post comment
              </button>
            </form>
          </div>

          {/* Comments Section - Show count if available */}
          {post.comments > 0 && (
            <div className="mb-12">
              <h3 className="text-[24px] font-bold text-[#222] mb-6">{post.comments} comment{post.comments !== 1 ? 's' : ''}</h3>
              <p className="text-[#8e8e8e] text-[14px]">Comments feature coming soon.</p>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h3 className="text-[24px] font-bold text-[#222] mb-6">Related posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
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
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                          unoptimized
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
                    <h4 className="text-[#3e3638] text-[14px] font-bold leading-[24px] break-words min-w-0">{relatedPost.title}</h4>
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


