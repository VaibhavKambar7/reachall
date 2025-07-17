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

    const result = await orchestrateColdEmails({
      companyName,
      companyWebsite,
      emailSubject,
      emailBody,
      role,
      fromAddress,
    });

    return NextResponse.json(result);
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
