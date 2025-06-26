import { betterAuth } from "better-auth";
import { Pool } from 'pg';

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        }
    }),
    emailAndPassword: {
        enabled: true
    },
    session: {
        expiresIn: 60 * 60 * 24 * 3,
        updateAge: 60 * 60 * 24
    },
    // baseURL: "https://demo.pivothire.tech",
    baseURL: "http://localhost:3000",
    basePath: "/api/auth",
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
})