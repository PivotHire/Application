import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/authUtils';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string().min(3, { message: "Username must contain at least 3 characters." }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers and underlines." }),
    password: z.string().min(8, { message: "Password must contain at least 8 characters." }),
    nickName: z.string().optional(),
    avatarUrl: z.string().url({ message: "Invalid Avatar URL" }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: "Invalid input", errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { email, username, password, nickName, avatarUrl } = validation.data;

        const { rows: existingEmail } = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingEmail.length > 0) {
            return NextResponse.json({ message: 'The email address has already been taken.' }, { status: 409 });
        }

        const { rows: existingUsername } = await query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
        if (existingUsername.length > 0) {
            return NextResponse.json({ message: 'The username has already been taken.' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);

        const { rows: newUsers } = await query(
            `INSERT INTO users (email, username, password_hash, nick_name, avatar_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, username, nick_name, avatar_url, created_at`,
            [email.toLowerCase(), username.toLowerCase(), passwordHash, nickName, avatarUrl]
        );

        if (newUsers.length === 0) {
            throw new Error('Register failed. No user created.');
        }

        const newUser = newUsers[0];

        console.log(`User registered: ${newUser.email} (${newUser.username})`);
        return NextResponse.json({
            message: 'Registration successful!',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                nickName: newUser.nick_name,
                avatarUrl: newUser.avatar_url,
                createdAt: newUser.created_at,
            },
        }, { status: 201 });

    } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === '23505') {
            if (error.constraint === 'users_email_key') {
                return NextResponse.json({ message: 'The email address has already been taken.' }, { status: 409 });
            }
            if (error.constraint === 'users_username_key') {
                return NextResponse.json({ message: 'The username has already been taken.' }, { status: 409 });
            }
        }
        return NextResponse.json({ message: 'Unexpected error.', error: error.message }, { status: 500 });
    }
}