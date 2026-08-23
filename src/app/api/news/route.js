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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit');
    
    let query = 'SELECT * FROM news';
    const params = [];
    
    // Admin can request all statuses (including draft)
    const isAdmin = await checkAuth();
    
    if (!isAdmin || status === 'published') {
      query += ' WHERE status = ?';
      params.push('published');
    }
    
    query += ' ORDER BY published_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }
    
    const rows = await db.all(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch news error:', error);
    return NextResponse.json(
      { error: 'Haberler yüklenemedi.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem.' },
        { status: 401 }
      );
    }

    const { title, content, summary, image_url, published_at, status } = await request.json();

    if (!title || !content || !summary || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    
    // Handle duplicate slugs
    while (true) {
      const existing = await db.get('SELECT id FROM news WHERE slug = ?', [slug]);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const dateStr = published_at || new Date().toISOString().split('T')[0];
    const statusStr = status || 'published';

    const result = await db.run(
      'INSERT INTO news (title, slug, content, summary, image_url, published_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, slug, content, summary, image_url, dateStr, statusStr]
    );

    return NextResponse.json({ success: true, id: result.id, slug });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json(
      { error: 'Haber oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}
