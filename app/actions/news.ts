'use server';

import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { storeFile } from '@/lib/storage';
import { notifyEveryone } from '@/app/actions/notifications';

/** What every news form action resolves to, for useActionState. */
export type NewsFormState = { error?: string; success?: boolean; id?: string };

const MEDIA_TYPES = ['ARTICLE', 'VIDEO', 'RESOURCE'] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

// Generous, because everything is re-encoded below - a comms person should be
// able to drop a photo straight off a camera without thinking about it.
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

/** Only the communications team (admins) may write company news. */
async function requireAuthor() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return user;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Slugs must be unique; append -2, -3 … when a title repeats. */
async function uniqueSlug(base: string, ignoreId?: string) {
  const root = base || 'post';
  let candidate = root;
  let n = 1;
  for (;;) {
    const clash = await prisma.newsPost.findUnique({ where: { slug: candidate } });
    if (!clash || clash.id === ignoreId) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

/**
 * Stores the featured image under public/uploads/news and returns its public
 * path.
 *
 * Camera images arrive at 6000px and several megabytes; served untouched they
 * would be downloaded in full by every member of staff on every dashboard
 * load. Everything is therefore resized to a sensible display width and
 * re-encoded as WebP, so what gets stored is what is worth sending.
 */
type StoredImage = { url: string; width: number; height: number };

async function saveFeaturedImage(file: File | null): Promise<StoredImage | null> {
  if (!file || typeof file === 'string' || file.size === 0) return null;

  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    throw new Error('That image needs to be a JPG, PNG, WebP, AVIF or GIF.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('That image is larger than 25 MB. Please use a smaller file.');
  }

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  let info: { width: number; height: number };
  try {
    const result = await sharp(input, { animated: file.type === 'image/gif' })
      .rotate() // honour EXIF orientation, or portrait photos arrive sideways
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    output = result.data;
    info = { width: result.info.width, height: result.info.height };
  } catch {
    throw new Error("We couldn't read that image. Please try another file.");
  }

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const url = await storeFile('news', name, output, 'image/webp');
  return { url, width: info.width, height: info.height };
}

function readPostForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const rawType = String(formData.get('mediaType') ?? 'ARTICLE').toUpperCase();
  const mediaType = (MEDIA_TYPES as readonly string[]).includes(rawType)
    ? (rawType as MediaType)
    : 'ARTICLE';

  return {
    title,
    excerpt,
    body,
    mediaType,
    videoUrl: String(formData.get('videoUrl') ?? '').trim() || null,
    resourceUrl: String(formData.get('resourceUrl') ?? '').trim() || null,
    pinned: formData.get('pinned') === 'on',
    publish: formData.get('publish') === 'on',
  };
}

function validate(v: ReturnType<typeof readPostForm>) {
  if (!v.title) return 'Please give the update a title.';
  if (!v.excerpt) return 'Please write a short excerpt — it is what staff see on the dashboard.';
  if (v.mediaType === 'VIDEO' && !v.videoUrl) return 'Please add the video link.';
  return null;
}

export async function createNewsPost(_prevState: NewsFormState, formData: FormData): Promise<NewsFormState> {
  try {
    const author = await requireAuthor();
    const v = readPostForm(formData);

    const problem = validate(v);
    if (problem) return { error: problem };

    const image = await saveFeaturedImage(formData.get('image') as File | null);

    const post = await prisma.newsPost.create({
      data: {
        slug: await uniqueSlug(slugify(v.title)),
        title: v.title,
        excerpt: v.excerpt,
        body: v.body,
        mediaType: v.mediaType,
        imageUrl: image?.url ?? null,
        imageWidth: image?.width ?? null,
        imageHeight: image?.height ?? null,
        videoUrl: v.videoUrl,
        resourceUrl: v.resourceUrl,
        pinned: v.pinned,
        status: v.publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: v.publish ? new Date() : null,
        authorId: author.id,
      },
    });

    if (post.status === 'PUBLISHED') {
      await notifyEveryone({
        kind: 'NEWS',
        title: 'New company update',
        body: post.title,
        href: `/news/${post.slug}`,
        exceptUserId: author.id,
      });
    }

    revalidatePath('/admin/news');
    revalidatePath('/employee/dashboard');
    revalidatePath('/manager/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, id: post.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong on our end. Please try again.' };
  }
}

export async function updateNewsPost(id: string, _prevState: NewsFormState, formData: FormData): Promise<NewsFormState> {
  try {
    await requireAuthor();
    const v = readPostForm(formData);

    const problem = validate(v);
    if (problem) return { error: problem };

    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) return { error: 'We could not find that update.' };

    const newImage = await saveFeaturedImage(formData.get('image') as File | null);
    const removeImage = formData.get('removeImage') === 'on';

    await prisma.newsPost.update({
      where: { id },
      data: {
        slug: await uniqueSlug(slugify(v.title), id),
        title: v.title,
        excerpt: v.excerpt,
        body: v.body,
        mediaType: v.mediaType,
        imageUrl: newImage?.url ?? (removeImage ? null : existing.imageUrl),
        imageWidth: newImage?.width ?? (removeImage ? null : existing.imageWidth),
        imageHeight: newImage?.height ?? (removeImage ? null : existing.imageHeight),
        videoUrl: v.videoUrl,
        resourceUrl: v.resourceUrl,
        pinned: v.pinned,
        status: v.publish ? 'PUBLISHED' : 'DRAFT',
        // Keep the original publication date when re-saving a published post.
        publishedAt: v.publish ? (existing.publishedAt ?? new Date()) : null,
      },
    });

    revalidatePath('/admin/news');
    revalidatePath('/employee/dashboard');
    revalidatePath('/manager/dashboard');
    revalidatePath('/admin/dashboard');
    return { success: true, id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong on our end. Please try again.' };
  }
}

export async function deleteNewsPost(id: string) {
  await requireAuthor();
  await prisma.newsPost.delete({ where: { id } });
  revalidatePath('/admin/news');
  revalidatePath('/employee/dashboard');
  revalidatePath('/manager/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function setNewsPostPublished(id: string, published: boolean) {
  await requireAuthor();
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) throw new Error('We could not find that update.');

  await prisma.newsPost.update({
    where: { id },
    data: {
      status: published ? 'PUBLISHED' : 'DRAFT',
      publishedAt: published ? (existing.publishedAt ?? new Date()) : null,
    },
  });

  revalidatePath('/admin/news');
  revalidatePath('/employee/dashboard');
  revalidatePath('/manager/dashboard');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

/** Everything, drafts included. Admin only. */
export async function fetchAllNewsPosts() {
  await requireAuthor();
  return prisma.newsPost.findMany({
    include: { author: { select: { name: true, email: true } } },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

/** The published feed every signed-in member sees. */
export async function fetchPublishedNews(limit?: number) {
  const user = await getSessionUser();
  if (!user) return [];

  return prisma.newsPost.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: { select: { name: true } } },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function fetchNewsPostBySlug(slug: string) {
  const user = await getSessionUser();
  if (!user) return null;

  const post = await prisma.newsPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  // Drafts stay invisible to everyone but their authors' team.
  if (!post) return null;
  if (post.status !== 'PUBLISHED' && user.role !== 'admin') return null;
  return post;
}

export async function fetchNewsPostById(id: string) {
  await requireAuthor();
  return prisma.newsPost.findUnique({ where: { id } });
}
