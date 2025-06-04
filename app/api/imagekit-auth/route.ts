import { NextRequest, NextResponse } from 'next/server';
import { getUploadAuthParams } from "@imagekit/next/server"

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit environment variables are not properly configured.");
}

const { token, expire, signature } = getUploadAuthParams({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({ token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY });
    } catch (error) {
        console.error("Error getting ImageKit authentication parameters:", error);
        return NextResponse.json(
            { message: "Failed to get ImageKit authentication parameters" },
            { status: 500 }
        );
    }
}