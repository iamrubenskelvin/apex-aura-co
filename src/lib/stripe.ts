/**
 * Cobrança online pela conta Stripe da loja.
 *
 * Só usa `fetch` e Web APIs — nada de módulos internos do Node — para continuar
 * compilando tanto no servidor quanto no navegador. A chave é lida dentro das
 * funções, nunca no carregamento do módulo.
 */

const STRIPE_API = "https://api.stripe.com/v1";

export type StripePayment = "pix" | "cartao" | "boleto";

const METHOD_TYPE: Record<StripePayment, string> = { pix: "pix", cartao: "card", boleto: "boleto" };

function stripeKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Pagamento online ainda não está ativado nesta loja.");
  return key;
}

async function stripeForm<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const body = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    body.set(name, String(value));
  }

  const res = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ? `Pagamento: ${json.error.message}` : `A cobrança online respondeu com erro ${res.status}.`);
  }
  return json as T;
}

export type CheckoutInput = {
  orderId: string;
  orderNumber: number | string;
  total: number;
  payment: StripePayment;
  email?: string | null;
  description: string;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = { id: string; url: string | null; paymentIntent: string | null };

/** Abre a página de pagamento do Stripe com o valor exato já salvo no pedido. */
export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
  const cents = Math.round(Number(input.total) * 100);
  if (!Number.isFinite(cents) || cents < 100) throw new Error("O valor do pedido é baixo demais para cobrança online.");

  const session = await stripeForm<{ id: string; url: string | null; payment_intent: string | null }>("/checkout/sessions", {
    mode: "payment",
    "payment_method_types[0]": METHOD_TYPE[input.payment] ?? "card",
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": "brl",
    "line_items[0][price_data][unit_amount]": cents,
    "line_items[0][price_data][product_data][name]": `Pedido #${input.orderNumber} — RVGL Suplementos`,
    "line_items[0][price_data][product_data][description]": input.description.slice(0, 500),
    client_reference_id: input.orderId,
    "metadata[order_id]": input.orderId,
    "metadata[number]": String(input.orderNumber),
    customer_email: input.email ?? undefined,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  return { id: session.id, url: session.url ?? null, paymentIntent: session.payment_intent ?? null };
}
