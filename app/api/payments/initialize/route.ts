import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, email, metadata } = await req.json();

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Initialize transaction with Paystack
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // amount should already be in pesewas/kobo from the client
        currency: "GHS",
        metadata: {
          ...metadata,
          custom_fields: [
            { display_name: "Tour", variable_name: "tour", value: metadata?.packageName || metadata?.tourSlug || "Tour" },
            { display_name: "Guests", variable_name: "guests", value: metadata?.numberOfPeople || 1 },
          ],
        },
        callback_url: `${baseUrl}/booking/verify`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      console.error("Paystack initialization failed:", data.message);
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Return the authorization url and reference
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error: any) {
    console.error("Paystack Initialize Error:", error);
    return NextResponse.json(
      { error: "Internal server error while initializing payment" },
      { status: 500 }
    );
  }
}
