import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, verifyPassword } from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth-helper';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Find user in DB
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return NextResponse.json(
        { error: 'Hatalı kullanıcı adı veya şifre.' },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = verifyPassword(password, user.password_hash, user.salt);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Hatalı kullanıcı adı veya şifre.' },
        { status: 401 }
      );
    }

    // Generate JWT Token
    const token = signToken({ id: user.id, username: user.username });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
