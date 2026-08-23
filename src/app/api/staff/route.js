import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    let query = 'SELECT * FROM technical_staff';
    const params = [];

    const isAdmin = await checkAuth();

    if (!isAdmin || status === 'active') {
      query += ' WHERE status = ?';
      params.push('active');
    }

    query += ' ORDER BY display_order ASC, name ASC';

    const rows = await db.all(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch technical staff error:', error);
    return NextResponse.json(
      { error: 'Teknik heyet yüklenemedi.' },
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

    const { name, role, biography, image_url, display_order, status } = await request.json();

    if (!name || !role || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const order = display_order !== undefined && display_order !== '' ? parseInt(display_order, 10) : 0;
    const statusStr = status || 'active';

    const result = await db.run(
      'INSERT INTO technical_staff (name, role, biography, image_url, display_order, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, role, biography || '', image_url, order, statusStr]
    );

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { error: 'Personel eklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
