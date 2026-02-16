import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "../../lib/validations/contact";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const validationResult = contactFormSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { 
          message: firstError?.message || "Validation failed",
          errors: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, subject, message } = validationResult.data;

    // Mailchimp API configuration
    // You'll need to add these to your .env.local file:
    // MAILCHIMP_API_KEY=your_api_key_here
    // MAILCHIMP_SERVER_PREFIX=your_server_prefix (e.g., "us1", "us2", etc.)
    // MAILCHIMP_AUDIENCE_ID=your_audience_id_here

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

    // In mock mode (no API configured), just log and return success
    if (!apiKey || !serverPrefix || !audienceId) {
      console.log("Contact form submission (mock mode):", {
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
      });
      return NextResponse.json(
        {
          message: "Thank you! Your message has been received successfully.",
          success: true,
        },
        { status: 200 }
      );
    }

    // Mailchimp API endpoint
    const mailchimpUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

    // Prepare data for Mailchimp
    const mailchimpData = {
      email_address: email,
      status: "subscribed", // or "pending" if you want double opt-in
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
        PHONE: phone,
      },
      tags: ["contact-form"], // Optional: tag contacts from the form
    };

    // Add custom fields if you have them set up in Mailchimp
    // You can also send the subject and message as notes or custom fields
    // For now, we'll add them as merge fields if you set them up in Mailchimp

    // Send to Mailchimp
    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailchimpData),
    });

    const mailchimpResult = await mailchimpResponse.json();

    if (!mailchimpResponse.ok) {
      console.error("Mailchimp API error:", mailchimpResult);
      
      // Handle specific Mailchimp errors
      if (mailchimpResult.title === "Member Exists") {
        return NextResponse.json(
          { message: "This email is already subscribed." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Failed to process your request. Please try again." },
        { status: 500 }
      );
    }

    // Optional: Send email notification to yourself
    // You can integrate with a service like SendGrid, Resend, or Nodemailer here
    // For now, we'll just log the contact details
    console.log("Contact form submission:", {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json(
      {
        message: "Thank you! Your message has been received successfully.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

