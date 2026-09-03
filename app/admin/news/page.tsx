"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  PlayCircle,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  fetchAllNewsPosts,
  deleteNewsPost,
  setNewsPostPublished,
} from "@/app/actions/news";
import { formatDate } from "@/lib/utils";
import { useToast, useConfirm } from "@/components/Toast";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  mediaType: string;
  imageUrl: string | null;
  status: string;
  pinned: boolean;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  author: { name: string | null; email: string } | null;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  ARTICLE: FileText,
  VIDEO: PlayCircle,
  RESOURCE: Paperclip,
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const load = () =>
    fetchAllNewsPosts()
      .then(rows => setPosts(rows as unknown as Post[]))
      .catch(err => console.error("Could not load news", err))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    load();
  }, []);

  const togglePublish = (post: Post) => {
    const publishing = post.status !== "PUBLISHED";
    startTransition(async () => {
      try {
        await setNewsPostPublished(post.id, publishing);
        await load();
        toast.success(publishing ? "Published to everyone." : "Moved back to draft.");
      } catch {
        toast.error("That did not save. Please try again.");
      }
    });
  };

  const remove = async (post: Post) => {
    const ok = await confirm({
      title: "Delete this update?",
      body: `“${post.title}” will no longer be visible to staff.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteNewsPost(post.id);
        await load();
        toast.success("Deleted.");
      } catch {
        toast.error("That did not delete. Please try again.");
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-5xl pb-16">
      {dialog}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="cg-eyebrow">Communications</p>
          <h1 className="mt-2 text-4xl">News &amp; updates</h1>
          <p className="mt-2 text-base">Write and publish updates for the whole group.</p>
        </div>
        <Link href="/admin/news/new" className="cg-btn-primary group shrink-0">
          <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Write an update
        </Link>
      </div>

      <div className="cg-card overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 p-16 text-sm text-sage">
            <Loader2 className="h-5 w-5 animate-spin" />
            One moment.
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-sage">Nothing written yet.</p>
            <Link href="/admin/news/new" className="cg-btn-primary mt-6">
              <PlusCircle className="h-4 w-4" />
              Write the first update
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ui-border">
            {posts.map(post => {
              const Icon = TYPE_ICON[post.mediaType] ?? FileText;
              const published = post.status === "PUBLISHED";
              return (
                <li
                  key={post.id}
                  className="flex flex-col gap-4 p-5 transition-colors hover:bg-ui-bg-alt sm:flex-row sm:items-center"
                >
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-[var(--radius-panel)] bg-ui-bg-alt">
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sage">
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[1.05rem] text-ui-text-primary">{post.title}</h2>
                      {post.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-sage" />}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-sage">{post.excerpt}</p>
                    <p className="cg-meta mt-1 block text-sage">
                      {published
                        ? formatDate(post.publishedAt)
                        : `Draft · started ${formatDate(post.createdAt)}`}
                      {post.author?.name ? ` · ${post.author.name}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={published ? "cg-pill-success" : "cg-pill-neutral"}>
                      {published ? "Live" : "Draft"}
                    </span>

                    <button
                      onClick={() => togglePublish(post)}
                      disabled={isPending}
                      title={published ? "Unpublish" : "Publish"}
                      aria-label={published ? "Unpublish" : "Publish"}
                      className="rounded-full p-2 text-sage transition-colors hover:bg-brand-100 hover:text-accent-on-surface disabled:opacity-50"
                    >
                      {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                    <Link
                      href={`/admin/news/${post.id}/edit`}
                      title="Edit"
                      aria-label="Edit"
                      className="rounded-full p-2 text-sage transition-colors hover:bg-brand-100 hover:text-accent-on-surface"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => remove(post)}
                      disabled={isPending}
                      title="Delete"
                      aria-label="Delete"
                      className="rounded-full p-2 text-sage transition-colors hover:bg-status-error-soft hover:text-status-error disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
