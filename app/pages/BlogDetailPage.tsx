import Image from "next/image";
import Link from "next/link";
import { type BlogPost, getRelatedPosts } from "../data/blog";
import Footer from "../components/Footer";
import SafeHTML from "../components/SafeHTML";

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
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Article Title */}
          <h1 
            className="text-[28px] sm:text-[34px] md:text-[40px] font-normal leading-[1.15] text-[#222] uppercase mb-4 wrap-normal [word-break:normal]"
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

          {/* Social Sharing Icons */}
          <div className="flex items-center gap-4 mb-8">
            <a href="#" className="text-[#0060cc] hover:text-[#ff5e00] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="text-[#0060cc] hover:text-[#ff5e00] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#" className="text-[#0060cc] hover:text-[#ff5e00] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="text-[#0060cc] hover:text-[#ff5e00] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-[#0060cc] hover:text-[#ff5e00] transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12 wrap-normal [word-break:normal]">
            <SafeHTML
              html={articleHtml}
              className="text-[#222] text-[16px] leading-[28px] wrap-normal [word-break:normal] [&_p]:mb-4 [&_p:last-child]:mb-0"
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
                    <h4 className="text-[#3e3638] text-[14px] font-bold leading-[24px]">{relatedPost.title}</h4>
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


