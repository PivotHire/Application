import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();

    try {
        cookieStore.set('pivot-hire-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
            maxAge: 0,
        });

        return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'An unexpected error occurred during logout', error: error.message }, { status: 500 });
    }
}