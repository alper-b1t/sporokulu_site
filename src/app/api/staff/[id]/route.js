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
    const { name, role, biography, image_url, display_order, status } = await request.json();

    if (!name || !role || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const existing = await db.get('SELECT id FROM technical_staff WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Personel bulunamadı.' },
        { status: 404 }
      );
    }

    const order = display_order !== undefined && display_order !== '' && display_order !== null ? parseInt(display_order, 10) : 0;
    const statusStr = status || 'active';

    await db.run(
      'UPDATE technical_staff SET name = ?, role = ?, biography = ?, image_url = ?, display_order = ?, status = ? WHERE id = ?',
      [name, role, biography || '', image_url, order, statusStr, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json(
      { error: 'Personel güncellenirken hata oluştu.' },
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

    const existing = await db.get('SELECT id FROM technical_staff WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Personel bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM technical_staff WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Personel başarıyla silindi.' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json(
      { error: 'Personel silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
