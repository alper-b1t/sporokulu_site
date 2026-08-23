import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET() {
  try {
    const rows = await db.all('SELECT * FROM site_settings');
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Ayarlar yüklenemedi.' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await checkAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem.' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const stmt = await db.db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    
    // We run updates inside a transaction or sequentially
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' || typeof value === 'number') {
        await new Promise((resolve, reject) => {
          stmt.run(key, String(value), (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    stmt.finalize();

    return NextResponse.json({ success: true, message: 'Ayarlar başarıyla güncellendi.' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
