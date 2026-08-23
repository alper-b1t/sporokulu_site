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
    const { title, description, image_url, category } = await request.json();

    if (!title || !image_url || !category) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const existing = await db.get('SELECT id FROM gallery WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Görsel bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run(
      'UPDATE gallery SET title = ?, description = ?, image_url = ?, category = ? WHERE id = ?',
      [title, description || '', image_url, category, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update gallery item error:', error);
    return NextResponse.json(
      { error: 'Görsel güncellenirken hata oluştu.' },
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

    const existing = await db.get('SELECT id FROM gallery WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Görsel bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM gallery WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Görsel başarıyla silindi.' });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    return NextResponse.json(
      { error: 'Görsel silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
