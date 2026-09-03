"use client";

import Link from "next/link";
import { createNewsPost } from "@/app/actions/news";
import { NewsPostForm } from "@/components/NewsPostForm";

export default function NewNewsPostPage() {
  return (
    <div className="animate-in fade-in duration-300 ease-cg mx-auto max-w-3xl pb-16">
      <nav className="cg-eyebrow mb-3 flex items-center gap-2 text-sage">
        <Link href="/admin/news" className="transition-colors hover:text-accent-on-surface">
          News
        </Link>
        <span aria-hidden>/</span>
        <span className="text-accent-on-surface">New</span>
      </nav>

      <h1 className="mb-2 text-4xl">Write an update</h1>
      <p className="mb-8 text-base">Share news, a video, or a resource with the whole group.</p>

      <NewsPostForm action={createNewsPost} submitLabel="Publish" />
    </div>
  );
}
