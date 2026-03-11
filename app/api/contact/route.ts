import { NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { createClient } from '../../utils/supabase/server';
import { rateLimit } from '../../lib/rateLimit';

// Initialize Mailchimp
const API_KEY = process.env.MAILCHIMP_API_KEY;
const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

if (API_KEY) {
  // Extract the server prefix from the API key (e.g., "us15" from "key-us15")
  const server = API_KEY.split('-')[1];
  mailchimp.setConfig({
    apiKey: API_KEY,
    server: server,
  });
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const { ok } = rateLimit({ key: `contact:${ip}`, limit: 10, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      );
    }

    if (!API_KEY || !AUDIENCE_ID) {
      console.error('Mailchimp API key or Audience ID is missing in environment variables.');
      return NextResponse.json(
        { error: 'Email service is not configured correctly.' },
        { status: 500 }
      );
    }

    // Try to add or update the contact in Mailchimp
    try {
      await mailchimp.lists.setListMember(
        AUDIENCE_ID,
        // The subscriber hash is the MD5 hash of the lowercase email address.
        // For setListMember, Mailchimp accepts the email string directly and hashes it internally 
        // if creating, or uses it to lookup if updating.
        email.toLowerCase(),
        {
          email_address: email,
          status_if_new: 'subscribed',
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
            PHONE: phone || '',
            // If you have custom fields for Subject and Message in Mailchimp, 
            // you can add them here. Otherwise, Mailchimp doesn't natively 
            // store "messages" on a subscriber profile well without custom tags.
            // SUBJECT: subject,
            // MESSAGE: message
          },
        }
      );

      // Successfully added to Mailchimp - now store locally in Supabase
      const supabase = await createClient();

      // If they submitted a message, save it as a formal inquiry
      if (message) {
        await supabase.from('inquiries').insert([
          {
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone: phone || null,
            subject: subject || 'General Inquiry',
            message,
            type: 'general',
            status: 'new'
          }
        ]);
      }

      // Also track them as a newsletter subscriber locally to ensure parity with Mailchimp
      const { error: dbError } = await supabase.from('newsletter_subscribers').upsert(
        {
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          source: message ? 'contact_form' : 'footer_newsletter',
          status: 'subscribed'
        },
        { onConflict: 'email' }
      );

      if (dbError) {
        console.error('Local DB tracking error:', dbError);
        // We do not fail the request if Mailchimp succeeded but DB failed
      }

      return NextResponse.json(
        { message: 'Message sent and subscribed successfully!' },
        { status: 200 }
      );
    } catch (mailchimpError: unknown) {
      const mc = mailchimpError as { response?: { body?: unknown }; status?: number };
      console.error('Mailchimp Error:', mc.response?.body || mc);

      return NextResponse.json(
        { error: 'Failed to add to mailing list. Please try again later.' },
        { status: mc.status || 500 }
      );
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
