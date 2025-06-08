import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {z} from "zod";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

const projectSchema = z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(1, "Project description is required"),
    skillsRequired: z.array(z.string()).min(1, "At least one skill is required."),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        const body = await req.json();
        // console.log(body);
        const projectData = projectSchema.parse(body);
        const {projectName, projectDescription, skillsRequired, budget, timeline, notes} = projectData;
        const newProject = await db.insertInto("projects")
            .values({
                user_id: session?.user?.id,
                project_name: projectName,
                project_description: projectDescription,
                skills_required: skillsRequired,
                budget: budget || null,
                timeline: timeline || null,
                status: "open",
            })
            .returning(["id", "created_at", "project_name"])
            .executeTakeFirstOrThrow();
        return NextResponse.json({
            message: 'Project published successfully!',
            project: newProject
        }, {status: 201});
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Validation Error:", error.flatten().fieldErrors);
            return NextResponse.json({
                error: "Invalid project data provided.",
                details: error.flatten().fieldErrors
            }, {status: 400});
        }

        console.error("Error creating project:", error);
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({error: errorMessage}, {status: 500});
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = session.user;

        const projects = await db.selectFrom('projects')
            .where('user_id', '=', id)
            .selectAll()
            .orderBy('created_at', 'desc')
            .execute();

        return NextResponse.json(projects);

    } catch (error: unknown) {
        console.error("Error fetching projects:", error);
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}