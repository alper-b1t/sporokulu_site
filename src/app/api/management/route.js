import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET() {
  try {
    const rows = await db.all('SELECT * FROM management ORDER BY display_order ASC, name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch management error:', error);
    return NextResponse.json(
      { error: 'Yönetim kurulu yüklenemedi.' },
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

    const { name, role, image_url, display_order } = await request.json();

    if (!name || !role || !image_url) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const order = display_order !== undefined && display_order !== '' ? parseInt(display_order, 10) : 0;

    const result = await db.run(
      'INSERT INTO management (name, role, image_url, display_order) VALUES (?, ?, ?, ?)',
      [name, role, image_url, order]
    );

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create management error:', error);
    return NextResponse.json(
      { error: 'Yönetici eklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
