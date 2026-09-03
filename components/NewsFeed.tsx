"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlayCircle, FileText, Paperclip, Pin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { fetchPublishedNews } from "@/app/actions/news";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  mediaType: string;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  pinned: boolean;
  publishedAt: string | Date | null;
  author: { name: string | null } | null;
};

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  ARTICLE: { label: "Article", icon: FileText },
  VIDEO: { label: "Video", icon: PlayCircle },
  RESOURCE: { label: "Resource", icon: Paperclip },
};

export function NewsFeed({ limit = 9 }: { limit?: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublishedNews(limit)
      .then(rows => {
        if (active) setPosts(rows as unknown as Post[]);
      })
      .catch(err => console.error("Could not load company news", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-sm text-sage">
        <Loader2 className="h-5 w-5 animate-spin" />
        One moment.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="cg-card-muted text-center">
        <p className="text-sm text-sage">No news has been published yet.</p>
      </div>
    );
  }

  return (
    // CSS columns give true masonry: each card keeps its natural height and
    // the browser balances the columns. No layout library, no JS measuring.
    <div className="gap-5 [column-fill:balance] sm:columns-2 xl:columns-3">
      {posts.map((post, i) => {
        const meta = TYPE_META[post.mediaType] ?? TYPE_META.ARTICLE;
        const Icon = meta.icon;
        return (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            className={cn(
              "cg-card animate-in fade-in slide-in-from-bottom-2 duration-300 ease-cg",
              "group mb-5 block break-inside-avoid overflow-hidden p-0",
              "transition-colors hover:border-brand-300"
            )}
          >
            {post.imageUrl && (
              <div className="overflow-hidden bg-ui-bg-alt">
                {/* A plain <img> keeps each image's true aspect ratio, which is
                  * what makes the masonry read as masonry - next/image would
                  * force one ratio on every card. Width and height are the
                  * stored intrinsic size: without them a lazy image has no
                  * reserved space and the whole grid reflows as images arrive. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt=""
                  width={post.imageWidth ?? undefined}
                  height={post.imageHeight ?? undefined}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover transition-transform duration-500 ease-cg group-hover:scale-[1.03]"
                />
              </div>
            )}

            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="cg-eyebrow inline-flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
                {post.pinned && (
                  <span className="inline-flex items-center gap-1 text-sage" title="Pinned">
                    <Pin className="h-3 w-3" />
                  </span>
                )}
              </div>

              <h3 className="cg-card-title transition-colors group-hover:text-accent-on-surface">
                {post.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-ui-text-secondary">{post.excerpt}</p>

              <p className="cg-meta mt-3 block text-sage">
                {formatDate(post.publishedAt)}
                {post.author?.name ? ` · ${post.author.name}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
