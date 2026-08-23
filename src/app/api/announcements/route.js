import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = searchParams.get('limit');

    let query = 'SELECT * FROM announcements';
    const params = [];

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
    console.error('Fetch announcements error:', error);
    return NextResponse.json(
      { error: 'Duyurular yüklenemedi.' },
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

    const { title, content, published_at, importance, status } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Başlık ve içerik alanları zorunludur.' },
        { status: 400 }
      );
    }

    const dateStr = published_at || new Date().toISOString().split('T')[0];
    const impStr = importance || 'normal';
    const statusStr = status || 'published';

    const result = await db.run(
      'INSERT INTO announcements (title, content, published_at, importance, status) VALUES (?, ?, ?, ?, ?)',
      [title, content, dateStr, impStr, statusStr]
    );

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Duyuru oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}
