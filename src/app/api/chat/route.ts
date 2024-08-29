import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextResponse } from "next/server";
import { constants } from "@lib/index";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai(constants.openAI.models.chat),
      messages: convertToCoreMessages(messages),
      // async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // async onFinish() {
      // implement your own logic here, e.g. for storing messages or recording token usage
      // },
    });
    // console.log("api -> chat -> route -> POST -> response.body", result);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
