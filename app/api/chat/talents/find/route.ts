import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { z } from "zod";
import { sql } from "kysely";
import {auth} from "@/lib/auth";
import {authClient} from "@/lib/auth-client";

const projectRequirementsSchema = z.object({
    project_description: z.string(),
    skills_required: z.array(z.string()),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const runtime = 'edge';

const {data: session} = await authClient.getSession();

export async function POST(req: NextRequest) {
    try {
        if (session?.user === undefined) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log(req);
        const body = await req.json();
        const project = projectRequirementsSchema.parse(body.project);
        const conversationHistory: ChatCompletionMessageParam[] = body.messages || [];

        const skills = await db.selectFrom('skills')
            .select('id')
            .where('name', 'in', project.skills_required)
            .execute();

        const skillIds = skills.map(s => s.id);

        let matchingTalentsQuery = db.selectFrom('talent_profiles')
            .innerJoin('user', 'user.id', 'talent_profiles.user_id')
            .select([
                'talent_profiles.headline',
                'talent_profiles.bio',
                'talent_profiles.years_of_experience',
                'user.username',
                'user.avatar_url'
            ]);

        if (skillIds.length > 0) {
            matchingTalentsQuery = matchingTalentsQuery.where((eb) => eb.exists(
                eb.selectFrom('talent_skills')
                    .select('talent_skills.user_id')
                    .whereRef('talent_skills.user_id', '=', 'talent_profiles.user_id')
                    .where('talent_skills.skill_id', 'in', skillIds)
                    .groupBy('talent_skills.user_id')
                    // .having(eb.fn.count('talent_skills.skill_id'), '=', BigInt(skillIds.length))
            ));
        }

        const matchingTalents = await matchingTalentsQuery.limit(10).execute();

        const systemPrompt = `You are PivotHire AI, an expert HR consultant. Your task is to analyze a list of potential freelance candidates for a specific project.

        Project Requirements:
        - Description: "${project.project_description}"
        - Required Skills: ${project.skills_required.join(', ')}

        Here are the candidates I found in the database:
        ${JSON.stringify(matchingTalents, null, 2)}

        Your task:
        - If there are 3 or more candidates, briefly introduce the top 3-5 candidates to the user in a friendly, summarized, and comparable way. Highlight why they might be a good fit. Use Markdown for clarity (e.g., lists, bold text).
        - If there are 1 or 2 candidates, present them to the user but also mention that the talent pool is small and suggest that they could get more options by widening the search criteria.
        - If there are 0 candidates, DO NOT invent any. Instead, analyze the required skills and suggest which specific skill(s) the user might consider removing to broaden the search and find more candidates. Be specific in your suggestion. For example: "I couldn't find any talents who match all the required skills. The skill 'Rust' is quite specialized. Would you like me to try searching again without this requirement?"
        
        Your entire response will be shown to the user in a chat window.`;

        const messagesForAPI: ChatCompletionMessageParam[] = [
            ...conversationHistory,
            { role: 'system', content: systemPrompt }
        ];

        const stream = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: messagesForAPI,
            temperature: 0.5,
            stream: true,
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const textContent = chunk.choices?.[0]?.delta?.content || '';
                        if (textContent) {
                            const payload = { type: 'text', value: textContent };
                            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
                        }
                    }
                    const donePayload = { type: 'done' };
                    controller.enqueue(`data: ${JSON.stringify(donePayload)}\n\n`);
                } catch (error) {
                    console.error("Error during stream processing:", error);
                    const errorPayload = { type: 'error', value: 'An error occurred while processing the AI response.' };
                    controller.enqueue(`data: ${JSON.stringify(errorPayload)}\n\n`);
                } finally {
                    controller.close();
                }
            },
            cancel() {
                console.log("Stream cancelled by client.");
            }
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error: unknown) {
        console.error("Error in /api/talents/find endpoint:", error);
        let errorMessage = "An internal server error occurred.";
        if (error instanceof Error) { errorMessage = error.message; }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}