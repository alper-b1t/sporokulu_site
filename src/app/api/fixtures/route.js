import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-helper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let query = 'SELECT * FROM fixtures';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY date DESC, time DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const rows = await db.all(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch fixtures error:', error);
    return NextResponse.json(
      { error: 'Fikstür bilgisi yüklenemedi.' },
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

    const { home_team, away_team, date, time, stadium, league, home_score, away_score, status } = await request.json();

    if (!home_team || !away_team || !date || !time || !stadium || !league) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const hScore = home_score !== undefined && home_score !== '' ? parseInt(home_score, 10) : null;
    const aScore = away_score !== undefined && away_score !== '' ? parseInt(away_score, 10) : null;
    const statusStr = status || 'upcoming';

    const result = await db.run(
      'INSERT INTO fixtures (home_team, away_team, date, time, stadium, league, home_score, away_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [home_team, away_team, date, time, stadium, league, hScore, aScore, statusStr]
    );

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Create fixture error:', error);
    return NextResponse.json(
      { error: 'Maç eklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
