"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EyeIcon, Message01Icon } from "hugeicons-react";
import TourLoader from "./TourLoader";

export default function BlogGrid() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { createClient } = await import('../utils/supabase/client');
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);
        
      if (data) {
        setPosts(data.map(p => ({
          ...p,
          image: p.image_url || '/assets/placeholder-blog.jpg',
          views: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 50)
        })));
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <TourLoader />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">No blogs available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center" style={{ gap: '20px' }}>
      {posts.map((post) => (
          <Link
            key={post.id}
          href={`/blog/${post.slug}`}
            className="flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            style={{ width: '350px' }}
          >
          {/* Card Image */}
          <div 
            className="relative overflow-hidden rounded-2xl group"
            style={{
              height: '297.811px',
              background: 'linear-gradient(to bottom, #999, #1e1d1d)',
            }}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
            </div>
            
            {/* Stats Badge */}
            <div 
              className="absolute top-3 left-3 flex items-center gap-[10px] px-[10px] py-[5px] rounded-[20px]"
              style={{
                backdropFilter: 'blur(6px)',
                backgroundColor: 'rgba(255,255,255,0.72)',
                border: '0.5px solid white',
              }}
            >
              {/* Views */}
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4 text-[#222]" />
                <span className="text-[#222] text-[12px] font-bold leading-none">
                  {post.views} views
                </span>
              </div>
              
              {/* Dot Separator */}
              <div className="w-1 h-1 rounded-full bg-[#222]" />
              
              {/* Comments */}
              <div className="flex items-center gap-1">
                <Message01Icon className="w-4 h-4 text-[#222]" />
                <span className="text-[#222] text-[12px] font-bold leading-none">
                  {post.comments} comment{post.comments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-[#3e3638] text-[16px] font-bold leading-[28px]">
            {post.title}
          </h3>
        </Link>
      ))}
    </div>
  );
}

