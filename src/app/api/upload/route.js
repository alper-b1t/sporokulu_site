import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-helper';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    // 1. Authorize Admin
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem.' },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi.' },
        { status: 400 }
      );
    }

    // 3. Perform security validation
    // Size check: limit to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5 MB\'tan büyük olamaz.' },
        { status: 400 }
      );
    }

    // Type check: allow common images only
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları (.jpg, .png, .webp, .gif, .svg) yüklenebilir.' },
        { status: 400 }
      );
    }

    // 4. Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique name
    const timestamp = Date.now();
    const originalName = file.name || 'image.jpg';
    const extension = path.extname(originalName) || '.jpg';
    const baseName = path.basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
      
    const uniqueFilename = `${baseName}-${timestamp}${extension}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueFilename);

    await writeFile(uploadPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
