import 'server-only';
import fs from 'fs/promises';
import path from 'path';

/**
 * Where uploaded files are kept.
 *
 * Writing into public/ works in development and cannot work on a serverless
 * host: the filesystem is read-only, and anything written to a writable temp
 * directory disappears when the invocation ends. So a deployment stores files
 * in Vercel Blob and keeps only the returned URL in the database, while
 * development carries on writing into public/uploads so the app runs with no
 * external service configured.
 *
 * Both paths return an absolute-or-rooted URL, which is what the Document and
 * NewsPost rows hold, so nothing downstream needs to know which was used.
 */
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const LOCAL_ROOT = path.join(process.cwd(), 'public', 'uploads');

/** Stores one file and returns the URL to serve it from. */
export async function storeFile(
  folder: string,
  filename: string,
  data: Buffer,
  contentType?: string
): Promise<string> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${folder}/${filename}`, data, {
      access: 'public',
      contentType,
      // The caller has already made the name unique.
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'File storage is not configured. Create a Blob store for this project ' +
        'so BLOB_READ_WRITE_TOKEN is available, then redeploy.'
    );
  }

  const dir = path.join(LOCAL_ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), data);
  return `/uploads/${folder}/${filename}`;
}

/**
 * Removes a stored file, so deleting a record does not leave an orphan that is
 * still reachable by its URL. Never throws: the row should go either way.
 */
export async function removeFile(url: string | null | undefined) {
  if (!url) return;

  try {
    if (url.startsWith('http')) {
      const { del } = await import('@vercel/blob');
      await del(url);
      return;
    }
    await fs.unlink(path.join(process.cwd(), 'public', url.replace(/^\//, '')));
  } catch {
    // An already-missing file is not a problem worth surfacing.
  }
}
