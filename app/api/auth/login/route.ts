import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/authUtils';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password cannot be empty" }),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { email, password } = validation.data;

        const { rows: users } = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);

        if (users.length === 0) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const user = users[0];

        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
        };
        const token = generateToken(tokenPayload);

        (await cookies()).set('pivot-hire-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
        });

        console.log(`User logged in: ${user.email}`);
        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'An unexpected error occurred', error: error.message }, { status: 500 });
    }
}