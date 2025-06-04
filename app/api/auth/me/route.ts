import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/authUtils';
import { query } from '@/lib/db';

interface TokenPayload {
    userId: number;
    email: string;
}

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('pivot-hire-token')?.value;

    if (!token) {
        return NextResponse.json({ message: 'Not authenticated: No token provided' }, { status: 401 });
    }

    try {
        const decoded = verifyToken<TokenPayload>(token);

        if (!decoded || !decoded.userId) {
            cookieStore.set('pivot-hire-token', '', { httpOnly: true, path: '/', maxAge: 0 });
            return NextResponse.json({ message: 'Not authenticated: Invalid or missing user ID in token' }, { status: 401 });
        }

        const { rows } = await query(
            'SELECT id, email, username, nick_name, avatar_url FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (rows.length === 0) {
            cookieStore.set('pivot-hire-token', '', { httpOnly: true, path: '/', maxAge: 0 });
            return NextResponse.json({ message: 'Not authenticated: User not found' }, { status: 401 });
        }

        const userFromDb = rows[0];

        return NextResponse.json({
            isAuthenticated: true,
            user: {
                id: userFromDb.id,
                email: userFromDb.email,
                username: userFromDb.username,
                nick_name: userFromDb.nick_name,
                avatar_url: userFromDb.avatar_url,
            },
        }, { status: 200 });

    } catch (error) {
        console.error('Error in /api/auth/me:', error);
        cookieStore.set('pivot-hire-token', '', { httpOnly: true, path: '/', maxAge: 0 });
        return NextResponse.json({ message: 'Internal server error during authentication check' }, { status: 500 });
    }
}