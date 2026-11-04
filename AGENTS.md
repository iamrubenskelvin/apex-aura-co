<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Products live in the `products` table; root `beforeLoad` calls `ensureCatalog()` which hydrates the in-memory `catalog` array in place (30s cache) — keeps all storefront code synchronous while admin edits reach the shop.
- Admin area lives under `src/routes/_authenticated/admin*`; access is the `admin` role in `user_roles` (first signup gets it via trigger), writes go through the browser client and RLS.
- Customer accounts: profiles/addresses/wishlist/orders/coupons/reviews tables, all RLS owner-scoped; customer pages under `src/routes/_authenticated/conta*`. Orders are only created by the `createOrder` server fn (prices, stock, coupons recomputed server-side with `src/lib/pricing.ts`) — clients have no INSERT on orders.
- Reviews require a delivered order containing the product (enforced in the RLS insert policy) to block fake reviews.
- Online payment runs through the store owner's own Stripe account: `src/lib/stripe.ts` calls the Stripe REST API with plain `fetch` (no SDK, so it stays workerd-compatible), `startPayment` creates the Checkout Session from the total already stored on the order, and `src/routes/api/public/stripe-webhook.ts` approves an order only after `verifyStripeSignature` accepts the event — amounts and approval are never taken from client input.
