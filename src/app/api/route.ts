import { NextResponse, NextRequest } from "next/server";
import { orchestrateColdEmails } from "../lib/orchestrator";

export async function GET() {
  return NextResponse.json({ message: "API is running" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { companyName, companyWebsite, emailSubject, emailBody, role } = body;

    if (!companyName || !companyWebsite || !emailSubject || !emailBody) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: companyName, companyWebsite, emailSubject, and emailBody are required.",
        },
        { status: 400 },
      );
    }

    if (!process.env.GMAIL_USER) {
      console.error("GMAIL_USER environment variable is not set.");
      return NextResponse.json(
        {
          success: false,
          message:
            "Server configuration error: The email sender is not configured.",
        },
        { status: 500 },
      );
    }

    const fromAddress = `"Reachall" <${process.env.GMAIL_USER}>`;

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generator function that yields progress updates
          const progressGenerator = orchestrateColdEmails({
            companyName,
            companyWebsite,
            emailSubject,
            emailBody,
            role,
            fromAddress,
          });

          for await (const update of progressGenerator) {
            const data = `data: ${JSON.stringify(update)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          controller.close();
        } catch (error) {
          const errorUpdate = {
            type: "error",
            success: false,
            message: "An internal server error occurred.",
            error: (error as Error).message,
          };
          const data = `data: ${JSON.stringify(errorUpdate)}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format in the request body." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occurred.",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
