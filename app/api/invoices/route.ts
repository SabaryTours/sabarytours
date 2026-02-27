import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '../../utils/supabase/server';
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const MAILCHIMP_TRANSACTIONAL_KEY = process.env.MAILCHIMP_TRANSACTIONAL_KEY;

// Service-role client for inserts that bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Authenticate Admin User
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse Request
    const body = await request.json();
    const { client_name, client_email, description, amount } = body;

    if (!client_name || !client_email || !description || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack Secret Key is missing' }, { status: 500 });
    }

    // 3. Initialize Paystack Transaction
    const amountInSmallestUnit = Math.round(parseFloat(amount) * 100);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: client_email,
        amount: amountInSmallestUnit,
        currency: 'GHS',
        callback_url: `${baseUrl}/booking/verify`,
        metadata: {
          client_name,
          description,
          is_custom_invoice: true
        }
      })
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      return NextResponse.json({ error: 'Failed to generate payment link' }, { status: 500 });
    }

    const paymentUrl = paystackData.data.authorization_url;
    const reference = paystackData.data.reference;

    // 4. Save Invoice to Database (using admin client to bypass RLS)
    const { data: newInvoice, error: dbError } = await supabaseAdmin
      .from('invoices')
      .insert({
        client_name,
        client_email,
        description,
        amount: parseFloat(amount),
        payment_url: paymentUrl,
        reference: reference,
        status: 'pending',
        created_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError);
      return NextResponse.json({ error: 'Failed to save invoice to database' }, { status: 500 });
    }

    // 5. Send Transactional Email via Mailchimp (Mandrill)
    if (MAILCHIMP_TRANSACTIONAL_KEY) {
      try {
        await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: MAILCHIMP_TRANSACTIONAL_KEY,
            message: {
              from_email: "bookings@sabarytours.com",
              from_name: "Sabary Travel and Tours",
              to: [{ email: client_email, name: client_name, type: "to" }],
              subject: `Invoice from Sabary Tours: ${description}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                  <h2>Hello ${client_name},</h2>
                  <p>A new invoice has been generated for you by Sabary Tours.</p>
                  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #ff5e00;">Invoice Details</h3>
                    <p><strong>Description:</strong> ${description}</p>
                    <p><strong>Amount Due:</strong> GHS ${parseFloat(amount).toFixed(2)}</p>
                  </div>
                  <p>You can pay securely online using the link below:</p>
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${paymentUrl}" style="background-color: #ff5e00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Invoice Now</a>
                  </div>
                  <p>If you have any questions, please reply to this email.</p>
                  <p>Thank you,<br><strong>The Sabary Tours Team</strong></p>
                </div>
              `
            }
          })
        });
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
      }
    }

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    console.error('Invoice Creation Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Authenticate Admin User
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch Invoices using admin client
    const { data: invoices, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(invoices || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
