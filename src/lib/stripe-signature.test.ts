import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyStripeSignature } from "./stripe-signature";

const SECRET = "whsec_test_local_only";
const BODY = '{"id":"evt_1","type":"checkout.session.completed","data":{"object":{"id":"cs_1"}}}';

/** Assinatura de referência, calculada por outro caminho (node:crypto). */
function sign(payload: string, secret = SECRET) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function headerFor(body: string, timestamp = Math.floor(Date.now() / 1000), secret = SECRET) {
  return `t=${timestamp},v1=${sign(`${timestamp}.${body}`, secret)}`;
}

describe("verifyStripeSignature", () => {
  it("aceita um corpo assinado com a mesma chave", async () => {
    await expect(verifyStripeSignature(BODY, headerFor(BODY), SECRET)).resolves.toBe(true);
  });

  it("rejeita o mesmo corpo com um caractere alterado", async () => {
    const tampered = BODY.replace("checkout.session.completed", "order.paid");
    await expect(verifyStripeSignature(tampered, headerFor(BODY), SECRET)).resolves.toBe(false);
  });

  it("rejeita assinatura feita com outra chave", async () => {
    await expect(verifyStripeSignature(BODY, headerFor(BODY, undefined, "whsec_outra"), SECRET)).resolves.toBe(false);
  });

  it("rejeita um evento antigo (replay)", async () => {
    const old = Math.floor(Date.now() / 1000) - 3600;
    await expect(verifyStripeSignature(BODY, headerFor(BODY, old), SECRET)).resolves.toBe(false);
  });

  it("rejeita cabeçalho ausente ou chave não configurada", async () => {
    await expect(verifyStripeSignature(BODY, null, SECRET)).resolves.toBe(false);
    await expect(verifyStripeSignature(BODY, headerFor(BODY), undefined)).resolves.toBe(false);
  });
});
