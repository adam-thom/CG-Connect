"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { fetchNewsPostById, updateNewsPost } from "@/app/actions/news";
import { NewsPostForm } from "@/components/NewsPostForm";

type EditablePost = Awaited<ReturnType<typeof fetchNewsPostById>>;

export default function EditNewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<EditablePost>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNewsPostById(id)
      .then(p => {
        if (active) setPost(p);
      })
      .catch(err => console.error("Could not load that update", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-20 text-sm text-sage">
        <Loader2 className="h-5 w-5 animate-spin" />
        One moment.
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl p-20 text-center">
        <p className="text-sage">We could not find that update.</p>
        <Link href="/admin/news" className="cg-btn-secondary mt-6">
          Back to news
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-3xl pb-16">
      <nav className="cg-eyebrow mb-3 flex items-center gap-2 text-sage">
        <Link href="/admin/news" className="transition-colors hover:text-accent-on-surface">
          News
        </Link>
        <span aria-hidden>/</span>
        <span className="text-accent-on-surface">Edit</span>
      </nav>

      <h1 className="mb-8 text-4xl">Edit update</h1>

      <NewsPostForm action={updateNewsPost.bind(null, id)} post={post} submitLabel="Save changes" />
    </div>
  );
}
