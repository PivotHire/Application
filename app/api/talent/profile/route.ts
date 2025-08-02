import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { z } from "zod";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

const profileSchema = z.object({
    headline: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
    languages: z.array(z.string()).optional(),
    yearsOfExperience: z.number().nullable().optional(),
    availability: z.string().optional(),
    workHoursTypical: z.number().nullable().optional(),
    workHoursMax: z.number().nullable().optional(),
    salaryMin: z.number().nullable().optional(),
    salaryMax: z.number().nullable().optional(),
    salaryCurrency: z.string().optional(),
    education: z.string().optional(),
    portfolio: z.string().optional(),
    remarks: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    try {
        if (session?.user === undefined) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const profileData = profileSchema.parse(body);

        const result = await db
            .insertInto('talent_profiles')
            .values({
                user_id: session.user.id,
                headline: profileData.headline,
                bio: profileData.bio,
                location: profileData.location,
                languages: profileData.languages,
                years_of_experience: profileData.yearsOfExperience,
                availability: profileData.availability,
                work_hours_typical: profileData.workHoursTypical,
                work_hours_max: profileData.workHoursMax,
                salary_min: profileData.salaryMin,
                salary_max: profileData.salaryMax,
                salary_currency: profileData.salaryCurrency,
                education: profileData.education,
                portfolio: profileData.portfolio,
                remarks: profileData.remarks,
                updated_at: new Date().toISOString(),
            })

            .onConflict((oc) => oc
                .column('user_id')
                .doUpdateSet({
                    headline: profileData.headline,
                    bio: profileData.bio,
                    location: profileData.location,
                    languages: profileData.languages,
                    years_of_experience: profileData.yearsOfExperience,
                    availability: profileData.availability,
                    work_hours_typical: profileData.workHoursTypical,
                    work_hours_max: profileData.workHoursMax,
                    salary_min: profileData.salaryMin,
                    salary_max: profileData.salaryMax,
                    salary_currency: profileData.salaryCurrency,
                    education: profileData.education,
                    portfolio: profileData.portfolio,
                    remarks: profileData.remarks,
                    updated_at: new Date().toISOString(),
                })
            )
            .returningAll()
            .executeTakeFirstOrThrow();

        return NextResponse.json({
            message: "Profile updated successfully!",
            profile: result
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // console.log(error);
            return NextResponse.json({ error: "Invalid data provided.", details: error.flatten().fieldErrors }, { status: 400 });
        }
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    try {
        if (session?.user === undefined) {
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }
        const profile = await db
            .selectFrom('talent_profiles')
            .selectAll()
            .where('user_id', '=', session.user.id)
            .executeTakeFirst();
        if (!profile) {
            return NextResponse.json({error: 'Profile not found'}, {status: 404});
        }
        return NextResponse.json({profile}, {status: 200});
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({error: "An internal server error occurred."}, {status: 500});
    }
}