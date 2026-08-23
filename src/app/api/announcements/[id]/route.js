import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

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
    const { title, content, published_at, importance, status } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Başlık ve içerik alanları zorunludur.' },
        { status: 400 }
      );
    }

    const existing = await db.get('SELECT id FROM announcements WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run(
      'UPDATE announcements SET title = ?, content = ?, published_at = ?, importance = ?, status = ? WHERE id = ?',
      [title, content, published_at, importance, status, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken hata oluştu.' },
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

    const existing = await db.get('SELECT id FROM announcements WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM announcements WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Duyuru başarıyla silindi.' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
