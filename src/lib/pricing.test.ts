import { describe, expect, it } from "vitest";
import { couponDiscount, couponProblem, orderTotals, type CouponRule } from "./pricing";

const base: CouponRule = {
  code: "X",
  discount_type: "percent",
  value: 10,
  min_subtotal: 100,
  first_purchase_only: false,
  max_uses_per_user: 1,
  expires_at: null,
  active: true,
};

describe("pricing", () => {
  it("frete grátis a partir de R$ 199", () => {
    expect(orderTotals({ subtotal: 199, couponDiscount: 0, payment: "cartao" }).shipping).toBe(0);
    expect(orderTotals({ subtotal: 198.99, couponDiscount: 0, payment: "cartao" }).shipping).toBe(18.9);
  });
  it("PIX dá 10% de desconto", () => {
    expect(orderTotals({ subtotal: 200, couponDiscount: 0, payment: "pix" }).total).toBe(180);
  });
  it("cupom percentual e fixo", () => {
    expect(couponDiscount({ discount_type: "percent", value: 10 }, 300)).toBe(30);
    expect(couponDiscount({ discount_type: "fixed", value: 500 }, 300)).toBe(300);
  });
  it("cupom respeita mínimo, primeira compra e uso único", () => {
    expect(couponProblem(base, { subtotal: 99, previousOrders: 0, usesOfThisCoupon: 0 })).not.toBeNull();
    expect(couponProblem({ ...base, first_purchase_only: true }, { subtotal: 150, previousOrders: 1, usesOfThisCoupon: 0 })).not.toBeNull();
    expect(couponProblem(base, { subtotal: 150, previousOrders: 2, usesOfThisCoupon: 1 })).not.toBeNull();
    expect(couponProblem(base, { subtotal: 150, previousOrders: 2, usesOfThisCoupon: 0 })).toBeNull();
  });
});
