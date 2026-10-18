/** Regras de preço do pedido — usadas no checkout (tela) e no servidor (valor final). */
export const FREE_SHIPPING_FROM = 199;
export const SHIPPING_PRICE = 18.9;
export const PIX_DISCOUNT = 0.1;

export type CouponRule = {
  code: string;
  discount_type: string;
  value: number;
  min_subtotal: number;
  first_purchase_only: boolean;
  max_uses_per_user: number;
  expires_at: string | null;
  active: boolean;
};

export type CouponContext = { subtotal: number; previousOrders: number; usesOfThisCoupon: number; now?: Date };

/** Retorna null se o cupom vale, ou o motivo de não valer. */
export function couponProblem(c: CouponRule, ctx: CouponContext): string | null {
  const now = ctx.now ?? new Date();
  if (!c.active) return "Cupom inativo.";
  if (c.expires_at && new Date(c.expires_at) < now) return "Cupom expirado.";
  if (ctx.subtotal < Number(c.min_subtotal))
    return `Válido para compras a partir de R$ ${Number(c.min_subtotal).toFixed(2).replace(".", ",")}.`;
  if (c.first_purchase_only && ctx.previousOrders > 0) return "Válido apenas na primeira compra.";
  if (ctx.usesOfThisCoupon >= c.max_uses_per_user) return "Você já usou este cupom.";
  return null;
}

export function couponDiscount(c: Pick<CouponRule, "discount_type" | "value">, subtotal: number) {
  const raw = c.discount_type === "percent" ? (subtotal * Number(c.value)) / 100 : Number(c.value);
  return round(Math.min(subtotal, Math.max(0, raw)));
}

export function orderTotals(input: { subtotal: number; couponDiscount: number; payment: string }) {
  const subtotal = round(input.subtotal);
  const afterCoupon = subtotal - input.couponDiscount;
  const pix = input.payment === "pix" ? round(afterCoupon * PIX_DISCOUNT) : 0;
  const discount = round(input.couponDiscount + pix);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICE;
  const total = round(Math.max(0, subtotal - discount) + shipping);
  return { subtotal, discount, shipping, total };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
