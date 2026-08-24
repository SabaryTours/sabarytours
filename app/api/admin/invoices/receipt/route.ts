import { NextResponse } from "next/server";
import { createClient as createServerClient } from "../../../../utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { formatInvoiceReceiptNumber } from "../../../../lib/invoiceReceiptEmailHtml";
import { markInvoiceAsPaid, sendInvoiceReceiptEmail } from "../../../../lib/invoicePayment";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!['admin', 'owner'].includes(profile?.role || '')) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const invoice_id = body.invoice_id as string | undefined;
    const payment_method = String(body.payment_method || "").trim();
    const payment_reference =
      typeof body.payment_reference === "string" ? body.payment_reference.trim() || null : null;
    const send_email = body.send_email !== false;
    const mark_paid = body.mark_paid !== false;

    if (!invoice_id) {
      return NextResponse.json({ success: false, error: "invoice_id is required" }, { status: 400 });
    }
    if (!payment_method) {
      return NextResponse.json({ success: false, error: "payment_method is required" }, { status: 400 });
    }

    const { data: invoice, error: fetchErr } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();

    if (fetchErr || !invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const issued = new Date();
    const receiptNumber = formatInvoiceReceiptNumber(invoice.id, issued);

    if (mark_paid && invoice.status !== "paid") {
      const result = await markInvoiceAsPaid(supabaseAdmin, invoice_id, {
        paymentMethod: payment_method,
        paymentReference: payment_reference,
        sendReceiptEmail: send_email,
      });

      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.message || result.reason },
          { status: result.reason === "not_found" ? 404 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        receipt_number: receiptNumber,
        email_sent: send_email,
        invoice: result.invoice,
      });
    }

    if (send_email) {
      const { emailSent } = await sendInvoiceReceiptEmail(invoice, {
        paymentMethod: payment_method,
        paymentReference: payment_reference,
        receiptNumber,
        issuedAt: issued,
      });
      return NextResponse.json({
        success: true,
        receipt_number: receiptNumber,
        email_sent: emailSent,
        invoice,
      });
    }

    return NextResponse.json({
      success: true,
      receipt_number: receiptNumber,
      email_sent: false,
      invoice,
    });
  } catch (e) {
    console.error("[Admin invoice receipt]", e);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
