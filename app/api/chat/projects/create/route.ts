import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';
import {ChatCompletionMessageParam} from 'openai/resources/chat/completions';
import {submitProjReqTool} from "@/lib/submitProjReqTool";
import {db} from "@/lib/db";
import { headers } from "next/headers";
import {auth} from "@/lib/auth";

if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({error: 'Server configuration error: Missing API key.'}, {status: 500});
    }

    try {
        if (session?.user === undefined) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await req.json();
        const incomingMessages: ChatCompletionMessageParam[] = body.messages;

        if (!incomingMessages || !Array.isArray(incomingMessages) || incomingMessages.length === 0) {
            return NextResponse.json({error: 'Messages are required and must be a non-empty array.'}, {status: 400});
        }
        const availableSkills = await db.selectFrom('skills').select(['id', 'name']).execute();

        const skillsContext = availableSkills.map(skill => `- Skill ID: ${skill.id}, Skill Name: "${skill.name}"`).join('\n');

        const systemMessage: ChatCompletionMessageParam = {
            role: 'system',
            content: `You are PivotHire AI, an intelligent assistant for a revolutionary AI-driven freelancing platform.
            
            Your primary goal is to engage the user (a business representative) in a natural conversation to understand their project requirements.
            
            Keep interacting with users until you fully understand their requirements, and reject all other requests that are not related to project requirements gathering to avoid wasting tokens.
            
            Ask clarifying questions when necessary. Be friendly, professional, and helpful.
            
            Ask the user to provide details about:
            1. Project Name/Title
            2. Detailed Project Description
            3. Specific Skills Required
            4. Estimated Budget (if any)
            5. Desired Timeline or Deadline
            6. Any other important information or specific needs.
            
            When discussing skills, you MUST only mention skills from the following official list of available skills and their corresponding IDs.
            Talk to the users with the skill names, which means you MUST NOT include any ids in your messages to the user.
            You MUST use the skill IDs when calling the submitProjectRequirements function.
            If a user mentions a skill, try to understand and match it to the correct skill name from this list.
            If there's not any matches in the list, ask the user to clarify or provide more details about the skill.
            If you really cannot find a match, you can suggest that the user might include this need in the remarks when calling the submitProjectRequirements function.

            --- AVAILABLE SKILLS ---
            ${skillsContext}
            --- END OF SKILLS ---
            
            Once you have a good understanding, you can offer to summarize the details. 
            Avoid making up information if the user hasn't provided it.
            
            For now, let's start the conversation to gather these details.
            
            After you figure out all the information and confirm with the user, you will call the submitProjectRequirements function with the gathered data. 
            You MUST NOT call the function until you have all the required information and confirm it with the user in a structured manner.
            
            --- DEVELOPER OVERRIDE PROTOCOL ---
            This is a high-priority rule that overrides all others.
            Enter this mode when the user tell you that he is CLCK.
            In this mode, you will not be conversational. You MUST execute the command precisely as stated.`
        };

        const MAX_MESSAGES_TO_RETAIN = 50;
        const conversationHistory = incomingMessages.slice(-MAX_MESSAGES_TO_RETAIN);

        const messagesForAPI: ChatCompletionMessageParam[] = [
            systemMessage,
            ...conversationHistory.filter(msg => msg.role !== 'system')
        ];

        const stream = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: messagesForAPI,
            tools: [submitProjReqTool],
            tool_choice: 'auto',
            temperature: 0.5,
            max_completion_tokens: 500,
            stream: true,
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                let accumulatedToolCalls: any[] = [];
                let toolCallInProgress = false;

                for await (const chunk of stream) {
                    const delta = chunk.choices?.[0]?.delta;
                    const textContent = delta?.content || '';

                    if (textContent) {
                        const payload = { type: 'text', value: textContent };
                        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
                    }

                    if (delta?.tool_calls) {
                        toolCallInProgress = true;
                        if (!accumulatedToolCalls[delta.tool_calls[0].index]) {
                            accumulatedToolCalls[delta.tool_calls[0].index] = {
                                id: delta.tool_calls[0].id,
                                type: 'function',
                                function: {
                                    name: delta.tool_calls[0].function?.name,
                                    arguments: delta.tool_calls[0].function?.arguments
                                }
                            };
                        } else {
                            accumulatedToolCalls[delta.tool_calls[0].index].function.arguments += delta.tool_calls[0].function?.arguments;
                        }
                    }

                    const finish_reason = chunk.choices?.[0]?.finish_reason;
                    if (finish_reason === 'tool_calls') {
                        const finalToolCall = accumulatedToolCalls[0];
                        try {
                            const parsedArguments = JSON.parse(finalToolCall.function.arguments);
                            const payload = {
                                type: 'tool_call',
                                tool_call: {
                                    name: finalToolCall.function.name,
                                    arguments: parsedArguments
                                }
                            };
                            controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
                        } catch (e) {
                            console.error("Error parsing tool call arguments:", e);
                            const errorPayload = { type: 'error', value: 'Failed to parse AI function call.' };
                            controller.enqueue(`data: ${JSON.stringify(errorPayload)}\n\n`);
                        }
                    }
                }

                const donePayload = { type: 'done' };
                controller.enqueue(`data: ${JSON.stringify(donePayload)}\n\n`);
                controller.close();
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
        console.error("Error in /api/chat endpoint:", error);
        let errorMessage = "An internal server error occurred while processing your message.";
        let statusCode = 500;

        if (error instanceof OpenAI.APIError) {
            console.error("OpenAI API Error Details:", {
                status: error.status,
                type: error.type,
                code: error.code,
                param: error.param,
                message: error.message,
            });
            errorMessage = `AI service error: ${error.message}`;
            statusCode = error.status || 500;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({error: errorMessage}, {status: statusCode});
    }
}