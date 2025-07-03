import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {z} from "zod";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {sql} from "kysely";

const projectSchema = z.object({
    projectName: z.string().min(1, "Project name is required"),
    projectDescription: z.string().min(1, "Project description is required"),
    skillsRequired: z.array(z.number()).min(1, "At least one skill is required."),
    budget: z.string().optional(),
    timeline: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({

        headers: await headers()

    });
    if (!session?.user?.id) {
        return NextResponse.json({error: 'Unauthorized: You must be logged in.'}, {status: 401});
    }
    const {id} = session.user;

    try {
        const body = await req.json();
        const projectData = projectSchema.parse(body);
        const {projectName, projectDescription, skillsRequired, budget, timeline, notes} = projectData;

        const result = await db.transaction().execute(async (trx) => {
            const newProject = await trx
                .insertInto("projects")
                .values({
                    user_id: id,
                    project_name: projectName,
                    project_description: projectDescription,
                    budget: budget || null,
                    timeline: timeline || null,
                    notes: notes || null,
                    status: "open",
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            const skills = await trx
                .selectFrom('skills')
                .select('id')
                .where('id', 'in', skillsRequired)
                .execute();

            if (skills.length !== skillsRequired.length) {
                throw new Error("One or more provided skills are invalid.");
            }

            if (skillsRequired.length > 0) {
                const projectSkillsData = skillsRequired.map(skillId => ({
                    project_id: newProject.id,
                    skill_id: skillId,
                }));
                await trx.insertInto('project_skills').values(projectSkillsData).execute();
            }

            const skillDetails = await trx.selectFrom('skills')
                .select('name')
                .where('id', 'in', skillsRequired)
                .execute();

            const skillNames = skillDetails.map(s => s.name);

            return {...newProject, skills_required: skillNames};
        });

        return NextResponse.json({
            message: 'Project published successfully!',
            project: result
        }, {status: 201});

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
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
            return NextResponse.json({error: 'Unauthorized'}, {status: 401});
        }
        const {id} = session.user;

        const projects = await db.selectFrom('projects')
            .selectAll('projects')
            .where('user_id', '=', id)
            .select((eb) => [
                sql<string[]>`(SELECT json_agg(skills.name)
                               FROM project_skills
                                        JOIN skills ON skills.id = project_skills.skill_id
                               WHERE project_skills.project_id = projects.id)`.as('skills_required')
            ])
            .orderBy('projects.created_at', 'desc')
            .execute();

        const projectsWithSkills = projects.map(p => ({
            ...p,
            skills_required: p.skills_required || []
        }));

        return NextResponse.json(projectsWithSkills);

    } catch (error: unknown) {
        console.error("Error fetching projects:", error);
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({error: errorMessage}, {status: 500});
    }
}
