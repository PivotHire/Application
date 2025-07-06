import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {Kysely} from "kysely";
import {db} from "@/lib/db";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    try {
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = session.user;
        const res = await db.selectFrom("user")
            .select("user.id")
            .where("user.id", "=", user.id)
            .select("user.account_type")
            .executeTakeFirstOrThrow();
        return NextResponse.json(res.account_type, { status: 200 });
    } catch (error) {
        console.error("Error in /api/account endpoint:", error);
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) { errorMessage = error.message; }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}