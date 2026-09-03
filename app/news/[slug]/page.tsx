import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, FileText, Paperclip, ExternalLink } from "lucide-react";
import { fetchNewsPostBySlug } from "@/app/actions/news";
import { formatDate } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  ARTICLE: { label: "Article", icon: FileText },
  VIDEO: { label: "Video", icon: PlayCircle },
  RESOURCE: { label: "Resource", icon: Paperclip },
};

/**
 * Turns a YouTube or Vimeo watch link into its embed form. Anything else is
 * left alone and offered as a plain link rather than framed blindly.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/embed/")) return url;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchNewsPostBySlug(slug);
  if (!post) notFound();

  const meta = TYPE_META[post.mediaType] ?? TYPE_META.ARTICLE;
  const Icon = meta.icon;
  const embed = post.videoUrl ? toEmbedUrl(post.videoUrl) : null;

  return (
    <AppShell>
      <article className="animate-in fade-in duration-300 ease-cg mx-auto max-w-3xl pb-16">
        <Link
          href="/news"
          className="mb-8 flex w-fit items-center gap-2 text-sm text-sage transition-colors hover:text-accent-on-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          All news
        </Link>

        <span className="cg-eyebrow flex w-fit items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>

        <h1 className="mt-3 text-4xl lg:text-5xl">{post.title}</h1>

        <p className="cg-meta mt-3 block text-sage">
          {formatDate(post.publishedAt ?? post.createdAt)}
          {post.author?.name ? ` · ${post.author.name}` : ""}
          {post.status !== "PUBLISHED" ? " · Draft" : ""}
        </p>

        {post.imageUrl && (
          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-ui-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="" className="h-auto w-full" />
          </div>
        )}

        {embed && (
          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-ui-border">
            <div className="relative aspect-video">
              <iframe
                src={embed}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        {post.videoUrl && !embed && (
          <a
            href={post.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cg-btn-secondary mt-8"
          >
            <PlayCircle className="h-4 w-4" />
            Watch the video
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <p className="mt-8 text-lg leading-relaxed text-ui-text-primary">{post.excerpt}</p>

        {post.body && (
          <div className="mt-6 space-y-5">
            {post.body
              .split(/\n{2,}/)
              .map(p => p.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <p key={i} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>
        )}

        {post.resourceUrl && (
          <a
            href={post.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cg-btn-primary mt-10"
          >
            <Paperclip className="h-4 w-4" />
            Open the resource
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </article>
    </AppShell>
  );
}
