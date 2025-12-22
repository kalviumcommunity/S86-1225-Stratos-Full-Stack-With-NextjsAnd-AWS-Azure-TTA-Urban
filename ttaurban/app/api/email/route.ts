import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";
import { z } from "zod";
import { handleError } from "@/app/lib/errorHandler";
import { logger } from "@/app/lib/logger";

// Initialize SendGrid with API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

// Validation schema for email request
const emailRequestSchema = z.object({
  to: z.string().email("Invalid recipient email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message body is required"),
  from: z.string().email("Invalid sender email").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = emailRequestSchema.parse(body);
    const { to, subject, message, from } = validatedData;

    // Prepare email data
    const emailData = {
      to,
      from: from || process.env.SENDGRID_SENDER!,
      subject,
      html: message,
    };

    // Send email via SendGrid
    const response = await sendgrid.send(emailData);

    logger.info("Email sent successfully", {
      to,
      subject,
      statusCode: response[0].statusCode,
      messageId: response[0].headers["x-message-id"],
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: response[0].headers["x-message-id"],
      statusCode: response[0].statusCode,
    });
  } catch (error: any) {
    // Handle SendGrid-specific errors
    if (error.response) {
      logger.error("SendGrid API error", {
        statusCode: error.code,
        body: error.response.body,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email",
          error: error.response.body.errors,
        },
        { status: error.code || 500 }
      );
    }

    return handleError(error, "POST /api/email");
  }
}
