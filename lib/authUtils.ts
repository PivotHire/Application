import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_EXPIRATION = '1d';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyToken<T extends object = any>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}