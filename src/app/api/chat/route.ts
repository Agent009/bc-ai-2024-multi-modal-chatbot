import OpenAI from "openai";
import { NextResponse } from "next/server";
import { constants } from "@lib/index";

const openai = new OpenAI({
  apiKey: constants.openAI.apiKey,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, responseType = constants.openAI.response.default } = await req.json();

    if (responseType === constants.openAI.response.streaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await openai.chat.completions.create({
              model: constants.openAI.model,
              messages,
              stream: true,
            });

            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content || "";
              controller.enqueue(encoder.encode(text));
            }

            controller.close();
          } catch (error) {
            console.error("Error during streaming:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      // Default response (non-streaming)
      const response = await openai.chat.completions.create({
        model: constants.openAI.model,
        messages,
      });

      return NextResponse.json({
        content: response.choices[0].message.content,
      });
    }
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
