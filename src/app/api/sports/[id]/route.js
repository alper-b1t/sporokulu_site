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
    const { name, description, image_url, display_order } = await request.json();

    if (!name || !description || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const existing = await db.get('SELECT id FROM sports WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Spor branşı bulunamadı.' },
        { status: 404 }
      );
    }

    const order = display_order !== undefined && display_order !== '' && display_order !== null ? parseInt(display_order, 10) : 0;

    await db.run(
      'UPDATE sports SET name = ?, description = ?, image_url = ?, display_order = ? WHERE id = ?',
      [name, description, image_url, order, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update sport error:', error);
    return NextResponse.json(
      { error: 'Spor branşı güncellenirken hata oluştu.' },
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

    const existing = await db.get('SELECT id FROM sports WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Spor branşı bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM sports WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Spor branşı başarıyla silindi.' });
  } catch (error) {
    console.error('Delete sport error:', error);
    return NextResponse.json(
      { error: 'Spor branşı silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
