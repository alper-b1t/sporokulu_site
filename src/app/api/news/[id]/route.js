import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

function slugify(text) {
  const mapping = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u'
  };
  let str = text.trim();
  for (const [key, value] of Object.entries(mapping)) {
    str = str.replace(new RegExp(key, 'g'), value);
  }
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if the identifier is an integer ID or a string slug
    const isId = /^\d+$/.test(id);
    let row;
    if (isId) {
      row = await db.get('SELECT * FROM news WHERE id = ?', [parseInt(id, 10)]);
    } else {
      row = await db.get('SELECT * FROM news WHERE slug = ?', [id]);
    }

    if (!row) {
      return NextResponse.json(
        { error: 'Haber bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error('Fetch news item error:', error);
    return NextResponse.json(
      { error: 'Haber yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { title, content, summary, image_url, published_at, status } = await request.json();

    if (!title || !content || !summary || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existing = await db.get('SELECT * FROM news WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Haber bulunamadı.' },
        { status: 404 }
      );
    }

    // Generate slug only if title changed
    let slug = existing.slug;
    if (title !== existing.title) {
      const baseSlug = slugify(title);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const dup = await db.get('SELECT id FROM news WHERE slug = ? AND id != ?', [slug, parseInt(id, 10)]);
        if (!dup) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const dateStr = published_at || existing.published_at;
    const statusStr = status || existing.status;

    await db.run(
      'UPDATE news SET title = ?, slug = ?, content = ?, summary = ?, image_url = ?, published_at = ?, status = ? WHERE id = ?',
      [title, slug, content, summary, image_url, dateStr, statusStr, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json(
      { error: 'Haber güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const existing = await db.get('SELECT id FROM news WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Haber bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM news WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Haber başarıyla silindi.' });
  } catch (error) {
    console.error('Delete news error:', error);
    return NextResponse.json(
      { error: 'Haber silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
