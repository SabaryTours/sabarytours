export type InvoiceLineItem = { description: string; amount: number };

/** Parse the DB description field — may be a JSON array (new) or plain text (legacy). */
export function parseInvoiceLineItems(
  description: string | null,
  totalAmount: number
): InvoiceLineItem[] {
  if (!description) return [{ description: "Invoice", amount: totalAmount }];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item: Record<string, unknown>) => ({
        description: String(item.description || ""),
        amount: parseFloat(String(item.amount)) || 0,
      }));
    }
  } catch {
    // plain text — single line item
  }
  return [{ description, amount: totalAmount }];
}
