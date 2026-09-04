import { NextResponse } from "next/server";
import { markInvoiceAsPaid, sendInvoiceReceiptEmail } from "../../../lib/invoicePayment";
import { adminAuthErrorResponse, requireAdminPermission, supabaseAdmin } from "../../../lib/adminAuth";

async function requireAdmin() {
  const auth = await requireAdminPermission("finance");
  if (!auth.ok) return { error: adminAuthErrorResponse(auth) };
  return { user: { id: auth.session.userId } };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth && auth.error) return auth.error;

    const { id } = await context.params;
    const body = await request.json();
    const status = body.status as string | undefined;

    if (!status || !["pending", "paid", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "status must be pending, paid, or cancelled" },
        { status: 400 }
      );
    }

    const payment_method =
      typeof body.payment_method === "string" ? body.payment_method.trim() : "";
    const payment_reference =
      typeof body.payment_reference === "string" ? body.payment_reference.trim() || null : null;
    const send_receipt = body.send_receipt === true;

    if (status === "paid") {
      const method = payment_method || "Manual (admin)";
      const result = await markInvoiceAsPaid(supabaseAdmin, id, {
        paymentMethod: method,
        paymentReference: payment_reference,
        sendReceiptEmail: send_receipt,
      });

      if (!result.ok) {
        const statusCode =
          result.reason === "not_found" ? 404 : result.reason === "amount_mismatch" ? 400 : 500;
        return NextResponse.json(
          { error: result.message || result.reason },
          { status: statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        invoice: result.invoice,
        already_paid: result.alreadyPaid,
      });
    }

    const payload: Record<string, unknown> = { status };
    const { error: upErr } = await supabaseAdmin.from("invoices").update(payload).eq("id", id);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const { data: invoice } = await supabaseAdmin.from("invoices").select("*").eq("id", id).single();
    return NextResponse.json({ success: true, invoice });
  } catch (e) {
    console.error("[Invoice PATCH]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Resend receipt email for an already-paid invoice. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth && auth.error) return auth.error;

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const payment_method =
      typeof body.payment_method === "string" && body.payment_method.trim()
        ? body.payment_method.trim()
        : "Manual (admin)";

    const { data: invoice, error } = await supabaseAdmin
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "paid") {
      return NextResponse.json({ error: "Invoice is not marked as paid" }, { status: 400 });
    }

    const { receiptNumber, emailSent } = await sendInvoiceReceiptEmail(invoice, {
      paymentMethod: (invoice as { payment_method?: string }).payment_method || payment_method,
      paymentReference: (invoice as { payment_reference?: string }).payment_reference,
    });

    return NextResponse.json({ success: true, receipt_number: receiptNumber, email_sent: emailSent });
  } catch (e) {
    console.error("[Invoice receipt resend]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
