import { ChatCompletionTool } from "openai/resources/chat/completions";

export const submitProjReqTool: ChatCompletionTool = {
    type: "function",
    function: {
        name: "submitProjectRequirements",
        description: "Submits the collected project requirements once all necessary details have been gathered from the user. This should be called when the user has provided enough information about their project.",
        parameters: {
            type: "object",
            properties: {
                projectName: {
                    type: "string",
                    description: "The title or name of the project, e.g., 'E-commerce Website for Handmade Goods'.",
                },
                projectDescription: {
                    type: "string",
                    description: "A detailed summary of the project, what it aims to achieve, and its key features.",
                },
                skillsRequired: {
                    type: "array",
                    items: {
                        type: "integer",
                    },
                    description: "An array of skill IDs that correspond to the required skills for the project. The available skills and their IDs will be provided in the context.",
                },
                budget: {
                    type: "string",
                    description: "The estimated budget or budget range for the project, e.g., '$5,000' or '$3,000 - $7,000'.",
                },
                timeline: {
                    type: "string",
                    description: "The desired timeline or deadline for project completion, e.g., '3 months' or 'By end of Q4 2025'.",
                },
                notes: {
                    type: "string",
                    description: "Any other important information or specific needs related to the project, e.g., 'Must be mobile-responsive' or 'Requires integration with existing systems'.",
                }
            },
            required: ["projectName", "projectDescription", "skillsRequired", "budget", "timeline"],
        },
    },
};