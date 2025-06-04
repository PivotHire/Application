import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';
import {ChatCompletionMessageParam} from 'openai/resources/chat/completions';

if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({error: 'Server configuration error: Missing API key.'}, {status: 500});
    }

    try {
        const body = await req.json();
        const incomingMessages: ChatCompletionMessageParam[] = body.messages;

        if (!incomingMessages || !Array.isArray(incomingMessages) || incomingMessages.length === 0) {
            return NextResponse.json({error: 'Messages are required and must be a non-empty array.'}, {status: 400});
        }

        const systemMessage: ChatCompletionMessageParam = {
            role: 'system',
            content: `You are PivotHire AI, an intelligent assistant for a freelancing platform. 
            Your primary goal is to engage the user (a business representative) in a natural conversation to understand their project requirements. 
            Ask clarifying questions when necessary. Be friendly, professional, and helpful.
            Encourage the user to provide details about:
            1. Project Name/Title
            2. Detailed Project Description
            3. Specific Skills Required
            4. Estimated Budget (if any)
            5. Desired Timeline or Deadline
            6. Any other important information or specific needs.
            Once you have a good understanding, you can offer to summarize the details. 
            Avoid making up information if the user hasn't provided it.
            
            VERY IMPORTANT MARKDOWN FORMATTING RULES:
            1.  You MUST ALWAYS provide your responses in Markdown format.
            2.  Headings (e.g., ## My Heading) MUST start on a new line. To ensure this, place a newline character ('\\n') before the heading.
            3.  List items (e.g., - My Item or * My Item or 1. My Item) MUST EACH start on a new line. Place a newline character ('\\n') before each list item.
                Example of a CORRECT list:
                Here are the items:
                - First item
                - Second item
                - Third item
                Example of an INCORRECT list (DO NOT DO THIS):
                Here are the items:- First item- Second item- Third item
            4.  Paragraphs MUST be separated by a blank line. This means you MUST use two newline characters ('\\n\\n') between paragraphs.
            5.  Ensure any code blocks are properly fenced with triple backticks, also starting on new lines.
            
            Strictly adhere to these formatting rules for all Markdown elements to ensure readability. Failure to use newlines correctly will result in poorly formatted output.
                
            For now, let's start the conversation to gather these details.
            (Later, you might be asked to provide this information in a structured JSON format, but for now, focus on the conversation.)`
        };

        const MAX_MESSAGES_TO_RETAIN = 10;
        const conversationHistory = incomingMessages.slice(-MAX_MESSAGES_TO_RETAIN);

        const messagesForAPI: ChatCompletionMessageParam[] = [
            systemMessage,
            ...conversationHistory.filter(msg => msg.role !== 'system')
        ];

        const stream = await openai.chat.completions.create({
            model: "gpt-4.1-nano",
            messages: messagesForAPI,
            temperature: 0.5,
            max_completion_tokens: 500,
            stream: true,
        });

        const readableStream = new ReadableStream({
            async pull(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content || '';
                    if (content) {
                        const processedContent = content.replace(/\\n/g, '\n');
                        controller.enqueue(`data: ${processedContent}\n\n`);
                    }
                }
                controller.close();
            },
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