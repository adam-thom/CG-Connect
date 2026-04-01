import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import prisma from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { visibilityTags: true },
    });

    if (!document || !document.filePath) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Check permissions
    if (currentUser.role !== 'admin') {
      const dbUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { tags: true }
      });
      const userTagIds = dbUser?.tags.map(t => t.id) || [];
      const docTagIds = document.visibilityTags.map(t => t.id);

      const hasAccess = docTagIds.some(id => userTagIds.includes(id));
      if (!hasAccess) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const absolutePath = path.join(process.cwd(), document.filePath);
    const fileBuffer = await fs.readFile(absolutePath);

    const matchExtension = document.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    const ext = matchExtension ? matchExtension[1].toLowerCase() : 'bin';
    
    // Quick MIME mapping
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Return the response with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.name}"`, // inline allows viewing in browser, use attachment for forced download
      },
    });

  } catch (err) {
    console.error('Error fetching document:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
