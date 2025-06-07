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
        expiresIn: 60 * 60 * 24 * 3, // 3 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    },
    baseURL: "http://localhost:3000", //"https://demo.pivothire.tech"],
    basePath: "/api/auth",
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
})