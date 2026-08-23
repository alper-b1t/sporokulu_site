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
    const { home_team, away_team, date, time, stadium, league, home_score, away_score, status } = await request.json();

    if (!home_team || !away_team || !date || !time || !stadium || !league) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun.' },
        { status: 400 }
      );
    }

    const existing = await db.get('SELECT id FROM fixtures WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Maç bulunamadı.' },
        { status: 404 }
      );
    }

    const hScore = home_score !== undefined && home_score !== '' && home_score !== null ? parseInt(home_score, 10) : null;
    const aScore = away_score !== undefined && away_score !== '' && away_score !== null ? parseInt(away_score, 10) : null;
    const statusStr = status || 'upcoming';

    await db.run(
      'UPDATE fixtures SET home_team = ?, away_team = ?, date = ?, time = ?, stadium = ?, league = ?, home_score = ?, away_score = ?, status = ? WHERE id = ?',
      [home_team, away_team, date, time, stadium, league, hScore, aScore, statusStr, parseInt(id, 10)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update fixture error:', error);
    return NextResponse.json(
      { error: 'Maç güncellenirken hata oluştu.' },
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

    const existing = await db.get('SELECT id FROM fixtures WHERE id = ?', [parseInt(id, 10)]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Maç bulunamadı.' },
        { status: 404 }
      );
    }

    await db.run('DELETE FROM fixtures WHERE id = ?', [parseInt(id, 10)]);

    return NextResponse.json({ success: true, message: 'Maç başarıyla silindi.' });
  } catch (error) {
    console.error('Delete fixture error:', error);
    return NextResponse.json(
      { error: 'Maç silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
