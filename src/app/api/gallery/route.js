import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = 'SELECT * FROM gallery';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY id DESC';

    const rows = await db.all(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch gallery error:', error);
    return NextResponse.json(
      { error: 'Galeri yüklenemedi.' },
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

    const { title, description, image_url, category } = await request.json();

    if (!title || !image_url || !category) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const result = await db.run(
      'INSERT INTO gallery (title, description, image_url, category) VALUES (?, ?, ?, ?)',
      [title, description || '', image_url, category]
    );

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create gallery item error:', error);
    return NextResponse.json(
      { error: 'Galeriye resim eklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
