"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Save, Image as ImageIcon, Trash2 } from "lucide-react";
import type { NewsFormState } from "@/app/actions/news";

type Post = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  mediaType: string;
  imageUrl: string | null;
  videoUrl: string | null;
  resourceUrl: string | null;
  pinned: boolean;
  status: string;
};

type Action = (prevState: NewsFormState, formData: FormData) => Promise<NewsFormState>;

const field =
  "w-full rounded-[var(--radius-panel)] border border-ui-border bg-ui-bg px-4 py-3 text-ui-text-primary transition-colors placeholder:text-sage/70 focus:border-accent focus:bg-ui-surface focus:outline-none focus:ring-4 focus:ring-accent/10";

export function NewsPostForm({
  action,
  post,
  submitLabel = "Save",
}: {
  action: Action;
  post?: Post;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<NewsFormState, FormData>(action, {});
  const [mediaType, setMediaType] = useState(post?.mediaType ?? "ARTICLE");
  const [preview, setPreview] = useState<string | null>(post?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (state?.success) router.push("/admin/news");
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div role="alert" className="cg-callout flex items-center gap-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="cg-card space-y-5">
        <div className="space-y-2">
          <label htmlFor="title" className="cg-eyebrow block text-sage">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post?.title}
            placeholder="What is the update?"
            className={field}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="mediaType" className="cg-eyebrow block text-sage">
            Type
          </label>
          <select
            id="mediaType"
            name="mediaType"
            value={mediaType}
            onChange={e => setMediaType(e.target.value)}
            className={field}
          >
            <option value="ARTICLE">Article</option>
            <option value="VIDEO">Video</option>
            <option value="RESOURCE">Resource</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="cg-eyebrow block text-sage">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            required
            rows={3}
            defaultValue={post?.excerpt}
            placeholder="Two or three sentences. This is what staff read on their dashboard."
            className={field}
          />
          <p className="cg-meta text-sage">Keep it to two or three sentences — one idea.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="cg-eyebrow block text-sage">
            Full update
          </label>
          <textarea
            id="body"
            name="body"
            rows={12}
            defaultValue={post?.body}
            placeholder="The full piece. Leave a blank line between paragraphs."
            className={field}
          />
        </div>
      </div>

      <div className="cg-card space-y-5">
        <div className="space-y-2">
          <label htmlFor="image" className="cg-eyebrow block text-sage">
            Featured image
          </label>

          {preview && !removeImage && (
            <div className="relative mb-3 overflow-hidden rounded-[var(--radius-panel)] border border-ui-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="h-auto max-h-64 w-full object-cover" />
              {post?.imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setRemoveImage(true);
                    setPreview(null);
                  }}
                  className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-status-error shadow-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          )}
          {removeImage && <input type="hidden" name="removeImage" value="on" />}

          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                setPreview(URL.createObjectURL(f));
                setRemoveImage(false);
              }
            }}
            className="block w-full cursor-pointer rounded-[var(--radius-panel)] border border-dashed border-ui-border bg-ui-bg px-4 py-6 text-sm text-sage file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-brand-300"
          />
          <p className="cg-meta flex items-center gap-1.5 text-sage">
            <ImageIcon className="h-3.5 w-3.5" />
            JPG, PNG, WebP, AVIF or GIF. Large photos are resized for you.
          </p>
        </div>

        {mediaType === "VIDEO" && (
          <div className="space-y-2">
            <label htmlFor="videoUrl" className="cg-eyebrow block text-sage">
              Video link
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={post?.videoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=…"
              className={field}
            />
            <p className="cg-meta text-sage">YouTube and Vimeo links play in the page.</p>
          </div>
        )}

        {mediaType === "RESOURCE" && (
          <div className="space-y-2">
            <label htmlFor="resourceUrl" className="cg-eyebrow block text-sage">
              Resource link
            </label>
            <input
              id="resourceUrl"
              name="resourceUrl"
              type="url"
              defaultValue={post?.resourceUrl ?? ""}
              placeholder="https://…"
              className={field}
            />
          </div>
        )}
      </div>

      <div className="cg-card space-y-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="publish"
            defaultChecked={post ? post.status === "PUBLISHED" : true}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>
            <span className="block font-medium text-ui-text-primary">Publish to everyone</span>
            <span className="cg-meta block text-sage">
              Unticked, it stays a draft that only you can see.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="pinned"
            defaultChecked={post?.pinned ?? false}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
          <span>
            <span className="block font-medium text-ui-text-primary">Pin to the top</span>
            <span className="cg-meta block text-sage">
              Keeps it first in the feed until you unpin it.
            </span>
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className="cg-btn-primary">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "One moment." : submitLabel}
        </button>
        <Link href="/admin/news" className="cg-btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
