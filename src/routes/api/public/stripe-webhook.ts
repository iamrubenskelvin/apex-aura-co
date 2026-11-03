import { createFileRoute } from "@tanstack/react-router";
import { verifyStripeSignature } from "@/lib/stripe-signature";

/**
 * Aviso do Stripe de que um pagamento mudou de estado.
 *
 * Só aceita chamadas com assinatura válida, calculada sobre o corpo cru da
 * requisição com a chave secreta do webhook. Nada aqui é decidido pelo conteúdo
 * do evento: o pedido é localizado pela sessão salva no ato da compra.
 */
export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!secret) return Response.json({ error: "Webhook ainda não configurado." }, { status: 503 });

        if (!(await verifyStripeSignature(raw, request.headers.get("stripe-signature"), secret))) {
          return new Response("Assinatura inválida.", { status: 400 });
        }

        let event: { type?: string; data?: { object?: Record<string, unknown> } };
        try {
          event = JSON.parse(raw);
        } catch {
          return new Response("Corpo inválido.", { status: 400 });
        }

        const obj = (event.data?.object ?? {}) as {
          id?: string;
          client_reference_id?: string;
          payment_intent?: string | null;
          metadata?: Record<string, string>;
        };
        const type = event.type ?? "";
        const sessionId = type.startsWith("payment_intent") ? obj.metadata?.session_id : obj.id;

        if (type === "checkout.session.completed" || type === "checkout.session.async_payment_succeeded" || type === "payment_intent.succeeded") {
          await markPaid(sessionId, obj.client_reference_id || obj.metadata?.order_id, obj.payment_intent ?? null);
        }

        return Response.json({ received: true });
      },
    },
  },
});

/**
 * Aprova o pedido uma única vez. Usa a sessão de cobrança salva no pedido —
 * nunca um identificador vindo de fora — para decidir o que aprovar.
 */
async function markPaid(sessionId: string | undefined, orderId: string | undefined, paymentIntent: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let order: { id: string; status: string } | null = null;
  if (sessionId) {
    const { data } = await supabaseAdmin.from("orders").select("id, status").eq("stripe_session_id", sessionId).maybeSingle();
    order = data ?? null;
  }
  if (!order && orderId) {
    const { data } = await supabaseAdmin.from("orders").select("id, status").eq("id", orderId).maybeSingle();
    order = data ?? null;
  }
  if (!order || order.status !== "recebido") return;

  await supabaseAdmin
    .from("orders")
    .update({ status: "aprovado", approved_at: new Date().toISOString(), stripe_payment_intent: paymentIntent })
    .eq("id", order.id)
    .eq("status", "recebido");
}
